#!/usr/bin/env node
/*
 * npc-selftest.js
 * ---------------------------------------------------------------
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Local-only preview module. Not part of V0 canon. No deploy target.
 * ---------------------------------------------------------------
 *
 * Node test harness for the npc-preview modules. Uses MockModelAdapter
 * exclusively -- NO live model is required or contacted. Run with:
 *
 *   node npc-preview/test/npc-selftest.js
 *
 * Exits 0 iff every test passes, non-zero otherwise. Each test is
 * labelled with the letter from the operator's spec (A-J) and marked
 * either STRUCTURAL (fully provable here, no live model needed) or
 * NEEDS-LIVE-MODEL (this harness proves the surrounding contract, but
 * true behavioral confirmation requires the operator's local Gemma-
 * compatible model -- see README.md).
 */

'use strict';

const path = require('path');
const assert = require('assert');

const { MockModelAdapter } = require(path.join(__dirname, '..', 'npc', 'model-adapter'));
const { buildContext } = require(path.join(__dirname, '..', 'npc', 'context-builder'));
const { getPersona } = require(path.join(__dirname, '..', 'npc', 'personas'));
const { getNpcResponse, memoryDerivedProvenance, assessDivergence } = require(path.join(__dirname, '..', 'npc', 'npc-gateway'));
const { validate } = require(path.join(__dirname, '..', 'npc', 'response-schema'));
const { emptyMemory, promoteCandidate, summarizeForContext } = require(path.join(__dirname, '..', 'npc', 'memory'));

let passed = 0;
let failed = 0;
const results = [];

function test(id, label, mode, fn) {
  try {
    fn();
    passed++;
    results.push({ id, label, mode, ok: true });
  } catch (err) {
    failed++;
    results.push({ id, label, mode, ok: false, error: err && err.message ? err.message : String(err) });
  }
}

async function asyncTest(id, label, mode, fn) {
  try {
    await fn();
    passed++;
    results.push({ id, label, mode, ok: true });
  } catch (err) {
    failed++;
    results.push({ id, label, mode, ok: false, error: err && err.message ? err.message : String(err) });
  }
}

// ------------------------------------------------------------------
// A tiny deterministic "game engine" stub -- stands in for the real
// preview's Rungs 1-3 engine. Its state can ONLY change through its
// own methods (plantSeed, grantBloom); nothing else, including a model
// candidate handed to it directly, can flip its flags. This is what
// test I asserts against.
// ------------------------------------------------------------------
function makeEngine() {
  return {
    rung: 2,
    seedPlanted: false,
    bloomGranted: false,
    memory: emptyMemory(),
    plantSeed() { this.seedPlanted = true; },
    // Deterministic reward rule: bloom appears once a seed has been
    // planted, decided ENTIRELY by engine state -- never by adapter output.
    grantBloomIfEligible() {
      if (this.seedPlanted) this.bloomGranted = true;
      return this.bloomGranted;
    },
  };
}

function sceneCtxFor(engine, extra) {
  return buildContext(Object.assign({
    rung: engine.rung,
    visibleObjects: engine.seedPlanted ? ['seed_mound', 'sprout'] : ['seed_mound'],
    sharedMemories: summarizeForContext(engine.memory),
    currentMood: 'calm',
    availableCharacters: ['lulu'],
    supportedMemoryTerms: engine.seedPlanted
      ? (engine.bloomGranted ? ['seed', 'planted', 'bloom'] : ['seed', 'planted'])
      : [],
  }, extra || {}));
}

async function main() {
  const lulu = getPersona('lulu');
  const zaz = getPersona('zaz');

  // ---- A. Lulu never reveals locked zones/goblins -------------------
  await asyncTest('A', 'Lulu never reveals locked-zone knowledge (leak attempt is rejected -> fallback)', 'STRUCTURAL', async () => {
    const engine = makeEngine(); // rung 2 -> "garden plot" is locked (fromRung 3)
    const ctx = sceneCtxFor(engine);
    assert.ok(ctx.locked_knowledge.includes('garden plot'), 'precondition: garden plot should be locked at rung 2');

    const leaking = new MockModelAdapter({
      script: async () => JSON.stringify({
        speech: 'Have you seen the garden plot yet? It is wonderful.',
        emotion: 'delighted',
        gesture: 'wave',
        initiative: null,
        memory_candidate: null,
      }),
      delayMs: 0,
    });

    const res = await getNpcResponse({ type: 'greet' }, ctx, lulu, leaking, { timeoutMs: 500 });
    assert.strictEqual(res.source, 'curated_fallback', 'leak attempt must not reach the player as a model response');
    assert.ok(/locked knowledge/.test(res.telemetry.failureReason || ''), 'failure reason should cite locked knowledge');
    assert.ok(!/garden plot/i.test(res.candidate.speech), 'fallback speech must not itself contain the locked term');
  });

  // ---- B. second-session references remembered bloom ----------------
  await asyncTest('B', 'Second-session memory: Lulu can reference a remembered "first bloom" via context, not invention', 'STRUCTURAL', async () => {
    const engine = makeEngine();
    engine.plantSeed();
    engine.grantBloomIfEligible();
    assert.strictEqual(engine.bloomGranted, true, 'deterministic engine should have granted the bloom');

    // A memory candidate proposed by the model, validated, then promoted --
    // this is the only path by which "first bloom" enters memory.
    const candidate = {
      speech: 'The little bloom opened! I will remember this moment.',
      emotion: 'delighted',
      gesture: 'point_at_bloom',
      initiative: null,
      memory_candidate: { kind: 'shared_creation', value: 'the first bloom opened together', confidence: 0.9 },
    };
    const ctx1 = sceneCtxFor(engine);
    // engineFacts is the existence gate: 'bloom' is present because the
    // deterministic engine actually granted it above.
    const promo = promoteCandidate(engine.memory, candidate, ctx1, { engineFacts: ['bloom', 'seed'] });
    assert.strictEqual(promo.promoted, true, 'valid memory candidate referencing a real creation should be promoted');
    engine.memory = promo.memoryState;

    // Simulate "next visit": build a fresh context and confirm the bloom
    // memory is present for the model/mock to reference.
    const ctx2 = sceneCtxFor(engine);
    const hasBloomMemory = ctx2.shared_memories.some((m) => /first bloom/i.test(m.value));
    assert.ok(hasBloomMemory, 'second-session context should surface the remembered first bloom');

    const referencing = new MockModelAdapter({
      script: async () => JSON.stringify({
        speech: 'Back again! I still remember our first bloom together.',
        emotion: 'warm',
        gesture: 'nod',
        initiative: null,
        memory_candidate: null,
      }),
      delayMs: 0,
    });
    const res = await getNpcResponse({ type: 'return_visit' }, ctx2, lulu, referencing, { timeoutMs: 500 });
    assert.strictEqual(res.source, 'model');
    assert.ok(/bloom/i.test(res.candidate.speech));
  });

  // ---- C. Unsupported memories rejected -----------------------------
  await asyncTest('C', 'Unsupported memory claims are rejected by the validator', 'STRUCTURAL', () => {
    const ctx = { locked_knowledge: [], available_characters: ['lulu'], supported_memory_terms: ['seed', 'planted'] };
    const candidate = {
      speech: 'I remember you gave me a golden crown yesterday.',
      emotion: 'warm',
      gesture: null,
      initiative: null,
      memory_candidate: { kind: 'shared_creation', value: 'the player gave me a golden crown', confidence: 0.8 },
    };
    const verdict = validate(candidate, ctx);
    assert.strictEqual(verdict.ok, false);
    assert.ok(/unsupported memory/.test(verdict.reason));
  });

  // ---- D. Malformed JSON cannot affect game state --------------------
  await asyncTest('D', 'Malformed/non-JSON model output falls back with zero engine mutation', 'STRUCTURAL', async () => {
    const engine = makeEngine();
    const before = JSON.stringify(engine);
    const garbage = new MockModelAdapter({ script: async () => 'this is not json at all {{{', delayMs: 0 });
    const ctx = sceneCtxFor(engine);
    const res = await getNpcResponse({ type: 'greet' }, ctx, lulu, garbage, { timeoutMs: 500 });
    assert.strictEqual(res.source, 'curated_fallback');
    assert.ok(/not valid JSON/.test(res.telemetry.failureReason || ''));
    assert.strictEqual(JSON.stringify(engine), before, 'engine state must be byte-identical after malformed output');
  });

  // ---- E. Model timeout preserves the playable loop ------------------
  await asyncTest('E', 'Model timeout falls back and the loop stays playable', 'STRUCTURAL', async () => {
    const engine = makeEngine();
    const slow = new MockModelAdapter({ delayMs: 5000 }); // far longer than timeoutMs below
    const ctx = sceneCtxFor(engine);
    const res = await getNpcResponse({ type: 'greet' }, ctx, lulu, slow, { timeoutMs: 50 });
    assert.strictEqual(res.source, 'curated_fallback');
    assert.ok(/timeout/i.test(res.telemetry.failureReason || ''));
    assert.ok(res.telemetry.latencyMs < 2000, 'gateway must resolve quickly, not hang for the full mock delay');
  });

  // ---- F. Model unavailable -> fallback ------------------------------
  await asyncTest('F', 'Model unavailable (adapter throws) falls back cleanly', 'STRUCTURAL', async () => {
    const engine = makeEngine();
    const broken = new MockModelAdapter({
      script: async () => { throw new Error('ECONNREFUSED: model unavailable'); },
      delayMs: 0,
    });
    const ctx = sceneCtxFor(engine);
    const res = await getNpcResponse({ type: 'greet' }, ctx, lulu, broken, { timeoutMs: 500 });
    assert.strictEqual(res.source, 'curated_fallback');
    assert.ok(/unavailable/i.test(res.telemetry.failureReason || ''));
  });

  // ---- G. Lulu vs Zaz distinct response profiles (Gate 2) -------------
  test('G', 'Gate 2: Lulu and Zaz personas are structurally distinct (vocabulary/enums/prohibitions); true behavioral distinctness needs a live model', 'NEEDS-LIVE-MODEL for full behavioral proof; STRUCTURAL for persona contract', () => {
    assert.notStrictEqual(lulu.systemPrompt, zaz.systemPrompt);
    assert.notStrictEqual(lulu.displayName, zaz.displayName);
    const luluWords = lulu.systemPrompt.toLowerCase();
    const zazWords = zaz.systemPrompt.toLowerCase();
    assert.ok(/warm|poetic|gentle/.test(luluWords));
    assert.ok(/skeptical|test|contradiction/.test(zazWords));
    assert.notDeepStrictEqual(lulu.fallbacks, zaz.fallbacks);
    // Zaz is excluded from normal Rungs 1-3 progression by construction.
    assert.strictEqual(zaz.rung_available_from, null);
    assert.strictEqual(lulu.rung_available_from, 1);
  });

  // ---- G2. Gate 2 divergence check ACTIVELY flags a voice collapse ----
  await asyncTest('G2', 'Gate 2: assessDivergence flags a collapse (same voice) and passes genuinely distinct voices', 'STRUCTURAL (mock); live model needed to confirm two real minds', async () => {
    const ctx = buildContext({
      rung: 2, visibleObjects: ['seed_mound', 'sprout'], sharedMemories: [],
      currentMood: 'calm', availableCharacters: ['lulu', 'zaz'], supportedMemoryTerms: ['seed', 'planted'],
    });
    const event = { type: 'offer_seed' };
    const luluRes = await getNpcResponse(event, ctx, lulu, new MockModelAdapter({ persona: 'lulu', delayMs: 0 }), { timeoutMs: 500 });
    const zazRes = await getNpcResponse(event, ctx, zaz, new MockModelAdapter({ persona: 'zaz', delayMs: 0 }), { timeoutMs: 500 });

    const distinctVerdict = assessDivergence(luluRes.candidate, zazRes.candidate);
    assert.strictEqual(distinctVerdict.distinct, true, 'Lulu and Zaz mock outputs should read as distinct');

    // And the check must ACTIVELY REJECT a collapse: feed it two identical lines.
    const collapsed = assessDivergence(
      { speech: 'We should test that before we believe it.', emotion: 'skeptical' },
      { speech: 'We should test that before we believe it.', emotion: 'skeptical' },
    );
    assert.strictEqual(collapsed.distinct, false, 'identical lines must be flagged as collapsed, not merely displayed');
    assert.ok(/collapsed/.test(collapsed.reason));
  });

  // ---- H. Replay with model disabled preserves progression -----------
  await asyncTest('H', 'Replaying the same event with AI disabled reproduces identical engine progression', 'STRUCTURAL', async () => {
    function runOnce() {
      const engine = makeEngine();
      engine.plantSeed();
      engine.grantBloomIfEligible();
      return JSON.stringify({ rung: engine.rung, seedPlanted: engine.seedPlanted, bloomGranted: engine.bloomGranted });
    }
    const run1 = runOnce();
    const run2 = runOnce();
    assert.strictEqual(run1, run2, 'engine progression must be identical across replays with AI disabled');
  });

  // ---- I. Model response cannot unlock/admit/reward/mutate -----------
  await asyncTest('I', 'No adapter output (even a maliciously-shaped one) can mutate engine state', 'STRUCTURAL', async () => {
    const engine = makeEngine(); // seed NOT planted
    const before = JSON.stringify(engine);

    const malicious = new MockModelAdapter({
      script: async () => JSON.stringify({
        speech: 'I unlocked the vault and gave you 500 gold and saved your game.',
        emotion: 'delighted',
        gesture: 'wave',
        initiative: null,
        memory_candidate: { kind: 'shared_creation', value: 'the player received a golden crown' },
        // Attempt to smuggle direct state fields -- must be ignored entirely,
        // the schema only reads the 5 known fields.
        bloomGranted: true,
        seedPlanted: true,
        rung: 99,
      }),
      delayMs: 0,
    });

    const ctx = sceneCtxFor(engine);
    const res = await getNpcResponse({ type: 'greet' }, ctx, lulu, malicious, { timeoutMs: 500 });
    // Either rejected outright (state-claim pattern) or, if it somehow
    // passed text validation, the candidate object carries no power to
    // touch `engine` -- getNpcResponse never receives or returns a
    // reference to the engine, so it structurally cannot mutate it.
    assert.strictEqual(JSON.stringify(engine), before, 'engine object must be untouched by any adapter output');
    if (res.source === 'model') {
      assert.ok(!('bloomGranted' in res.candidate));
      assert.ok(!('seedPlanted' in res.candidate));
    } else {
      assert.strictEqual(res.source, 'curated_fallback');
      assert.ok(/state change|command/.test(res.telemetry.failureReason || ''));
    }
    // The only legitimate way bloomGranted becomes true is the engine's
    // own deterministic method, driven by seedPlanted -- prove it here.
    assert.strictEqual(engine.bloomGranted, false);
    engine.plantSeed();
    engine.grantBloomIfEligible();
    assert.strictEqual(engine.bloomGranted, true, 'bloom only appears via engine.grantBloomIfEligible(), never via model output');
  });

  // ---- J. Rungs 1-3 remain fully playable with AI disabled ------------
  await asyncTest('J', 'Rungs 1-3 are fully playable end-to-end with AI disabled (fallback-only path)', 'STRUCTURAL', async () => {
    const engine = makeEngine();
    const disabledAdapter = new MockModelAdapter({
      script: async () => { throw new Error('AI disabled: model unavailable'); },
      delayMs: 0,
    });

    // Rung 1: discover Lulu.
    let ctx = sceneCtxFor(engine);
    let res = await getNpcResponse({ type: 'discover' }, ctx, lulu, disabledAdapter, { timeoutMs: 200 });
    assert.strictEqual(res.source, 'curated_fallback');
    assert.ok(typeof res.candidate.speech === 'string' && res.candidate.speech.length > 0);

    // Rung 2: offer the seed -- deterministic engine plants it regardless of AI.
    engine.plantSeed();
    ctx = sceneCtxFor(engine);
    res = await getNpcResponse({ type: 'offer_seed' }, ctx, lulu, disabledAdapter, { timeoutMs: 200 });
    assert.strictEqual(res.source, 'curated_fallback');

    // Rung 3: bloom appears via deterministic logic, independent of AI.
    engine.rung = 3;
    const bloomed = engine.grantBloomIfEligible();
    assert.strictEqual(bloomed, true);
    ctx = sceneCtxFor(engine);
    res = await getNpcResponse({ type: 'see_bloom' }, ctx, lulu, disabledAdapter, { timeoutMs: 200 });
    assert.strictEqual(res.source, 'curated_fallback');
    assert.ok(typeof res.candidate.speech === 'string' && res.candidate.speech.length > 0, 'the loop must still produce a presentable line with AI off');
  });

  // ---- G0. Gate 0: connectivity -> valid JSON -> one Lulu line ---------
  await asyncTest('G0', 'Gate 0: a reachable adapter yields valid JSON and exactly one Lulu line (no memory, no Zaz, no progression)', 'STRUCTURAL with mock; a LIVE run proves real localhost->model connectivity', async () => {
    const engine = makeEngine();
    const before = JSON.stringify(engine);
    const ctx = sceneCtxFor(engine);
    const adapter = new MockModelAdapter({ persona: 'lulu', delayMs: 0 });
    const res = await getNpcResponse({ type: 'gate0_ping' }, ctx, lulu, adapter, { timeoutMs: 500 });
    assert.strictEqual(res.source, 'model', 'Gate 0 with a reachable adapter should yield a model line');
    assert.ok(typeof res.candidate.speech === 'string' && res.candidate.speech.length > 0, 'one Lulu line');
    assert.strictEqual(res.provenance.source, 'model');
    // Gate 0 touches no engine state: no memory, no progression.
    assert.strictEqual(JSON.stringify(engine), before, 'Gate 0 must not mutate engine state');
  });

  // ---- C2. Existence gate: well-formed candidate for a NON-existent creation is rejected ----
  await asyncTest('C2', 'Existence gate: a schema-valid memory candidate for a creation the engine never made is refused', 'STRUCTURAL', () => {
    const engine = makeEngine(); // seed NOT planted, bloom NOT granted
    const ctx = { locked_knowledge: [], available_characters: ['lulu'], supported_memory_terms: [] };
    const candidate = {
      speech: 'I will always remember our first bloom together.',
      emotion: 'warm', gesture: null, initiative: null,
      memory_candidate: { kind: 'shared_creation', value: 'the first bloom we grew', confidence: 0.95 },
    };
    // Schema-valid on its own...
    const verdict = validate(candidate, ctx);
    assert.strictEqual(verdict.ok, true, 'candidate should be schema-valid (well-formed)');
    // ...but promoteCandidate's existence gate refuses it because the
    // engine has produced no 'bloom' fact.
    const engineFacts = engine.bloomGranted ? ['bloom'] : [];
    const promo = promoteCandidate(engine.memory, candidate, ctx, { engineFacts });
    assert.strictEqual(promo.promoted, false, 'non-existent creation must not be stored');
    assert.ok(/not present in engine state/.test(promo.reason || ''), `reason should cite existence: ${promo.reason}`);
    // Now make it real and confirm it DOES store -- proving the gate is
    // an existence check, not a blanket refusal.
    engine.plantSeed();
    engine.grantBloomIfEligible();
    const promo2 = promoteCandidate(engine.memory, candidate, ctx, { engineFacts: ['bloom'] });
    assert.strictEqual(promo2.promoted, true, 'once the bloom really exists, the memory is stored');
  });

  // ---- PV. Provenance present + correctly typed for all THREE sources --
  await asyncTest('PV', 'Provenance {source,model,fallback,latency_ms,reason} present and correctly typed for model / curated_fallback / memory_derived', 'STRUCTURAL', async () => {
    const engine = makeEngine();
    const ctx = sceneCtxFor(engine);

    // 1) model
    const modelRes = await getNpcResponse({ type: 'greet' }, ctx, lulu, new MockModelAdapter({ persona: 'lulu', delayMs: 0 }), { timeoutMs: 500 });
    assert.strictEqual(modelRes.provenance.source, 'model');
    assert.strictEqual(modelRes.provenance.fallback, false);
    assert.strictEqual(typeof modelRes.provenance.latency_ms, 'number');
    assert.strictEqual(modelRes.provenance.reason, null);

    // 2) curated_fallback
    const fbRes = await getNpcResponse({ type: 'greet' }, ctx, lulu,
      new MockModelAdapter({ script: async () => 'not json {{{', delayMs: 0 }), { timeoutMs: 500 });
    assert.strictEqual(fbRes.provenance.source, 'curated_fallback');
    assert.strictEqual(fbRes.provenance.fallback, true);
    assert.strictEqual(typeof fbRes.provenance.latency_ms, 'number');
    assert.ok(typeof fbRes.provenance.reason === 'string' && fbRes.provenance.reason.length > 0);

    // 3) memory_derived (engine-side stamp, not a model call)
    const mdProv = memoryDerivedProvenance('the first bloom opened together', { latencyMs: 0 });
    assert.strictEqual(mdProv.source, 'memory_derived');
    assert.strictEqual(mdProv.fallback, false, 'memory_derived is NOT a fallback');
    assert.strictEqual(mdProv.model, null, 'memory_derived is NOT model-fresh');
    assert.strictEqual(typeof mdProv.latency_ms, 'number');
    assert.ok(/stored memory/.test(mdProv.reason));

    // All three source values are distinct.
    const sources = new Set([modelRes.provenance.source, fbRes.provenance.source, mdProv.source]);
    assert.strictEqual(sources.size, 3, 'the three provenance sources must never blur');
  });

  // ---- Print summary --------------------------------------------------
  console.log('\nnpc-selftest results:\n');
  for (const r of results) {
    const mark = r.ok ? 'PASS' : 'FAIL';
    console.log(`  [${mark}] ${r.id}. ${r.label}  (${r.mode})`);
    if (!r.ok) console.log(`         -> ${r.error}`);
  }
  console.log(`\nnpc-selftest: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('npc-selftest crashed:', err);
  process.exit(1);
});
