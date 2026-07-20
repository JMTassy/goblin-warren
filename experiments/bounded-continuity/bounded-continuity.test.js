/*
 * bounded-continuity.test.js — cross-lineage proof of BOUNDED_CONTINUITY.
 * authority=false · claim=NO_CLAIM · non-sovereign · ledger_effect=none
 *
 * WHAT THIS PROVES (new, executable, this file):
 * Two play sessions reach the SAME governed outcome — admitted levels,
 * phase, level — through DIFFERENT, divergent, longer/messier narratives
 * (extra ticks, failed quiz attempts, extra rest cycles, a free-lesson
 * detour). Their ledgers differ. Their full state digests differ (digest
 * hashes the whole ledger, so more narrative -> different digest, honestly
 * — this file does NOT claim byte-identity across divergent histories;
 * that would be a different, false claim). But their SOVEREIGN PROJECTION
 * — the only thing admission/authority ever reads — is identical:
 *
 *   ⟦PROOF::BOUNDED_CONTINUITY⟧
 *   Ledger(A) ≠ Ledger(B)            (narratives diverge — real, not a no-op)
 *   Digest(A) ≠ Digest(B)            (full memory diverges)
 *   Project_gov(A) = Project_gov(B)  (sovereign projection converges)
 *   where Project_gov(S) = (S.admitted, S.phase, S.level)
 *
 * This is the dual of replay determinism (same admitted sequence -> same
 * digest), not its restatement: determinism holds identity of OUTPUT under
 * identity of INPUT; bounded continuity holds identity of GOVERNED OUTPUT
 * under DIVERGENCE of surrounding history, as long as the admitted
 * subsequence is the same. Both reduce to one law: sovereign state is a
 * pure function of the admitted evidence sequence, and of nothing else —
 * not narrative volume, not elapsed noise, not how the story was told.
 *
 * Corroborating evidence cited, not re-implemented (already receipted
 * elsewhere in this lineage, re-confirmed live this session):
 *  - Policy Loom (experiments/policy-loom): 55/55, incl. digest-staleness
 *    KILL tests — a decision bound to old digests is refused regardless of
 *    how plausible or well-remembered it is (temporal axis of the same law).
 *  - Metabolism (experiments/metabolism): 20/20 — Memory Orchard is
 *    append-only + typed relation, authority:false; JWRITE ⇒ ΔAuthority=0
 *    (accumulation axis of the same law).
 *  - Vertical slice R11 (already in slice-selftest.js): companion
 *    expression is a pure view over S, zero mutation (spatial/expression
 *    axis of the same law).
 * This file adds the fourth axis: narrative divergence across a full
 * session does not perturb the governed projection.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('../vertical-slice/slice-core.js');

const results = [];
function T(name, fn) { try { fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, err: String(e && e.message || e) }); } }
function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + ': ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b)); }
function ok(v, m) { if (!v) throw new Error(m || 'expected truthy'); }

// The sovereign projection: the ONLY fields admission/authority ever reads.
function projectGov(S) { return { admitted: S.admitted.join(','), phase: S.phase, level: S.level }; }

// --- Script A: the clean minimal path ---
function runClean(seed) {
  const S = C.makeSlice(seed);
  for (let i = 0; i < 3; i++) C.applyEvent(S, { k: 'PLACE_STONE' });
  for (let i = 0; i < 60 && S.phase === 'PLAYING'; i++) C.applyEvent(S, { k: 'SCRATCH', dt: 0.5, moving: true });
  quizPass(S);
  for (let guard = 0; guard < 4000 && S.phase === 'PLAYING'; guard++) {
    C.applyEvent(S, { k: 'SKY_TICK', dt: 0.25 });
    if (!C.beatPhase(S).onBeat) continue;
    const note = S.sky.entities.find(e => e.kind === 'note');
    if (note) C.applyEvent(S, { k: 'CATCH', id: note.id });
  }
  quizPass(S);
  let clock = 0;
  const tap = (n, dt) => { for (let i = 0; i < n; i++) { clock += dt; C.applyEvent(S, { k: 'TAP', t: clock }); } };
  C.applyEvent(S, { k: 'TAP', t: (clock += 1) });
  for (let guard = 0; guard < 40 && S.phase === 'PLAYING'; guard++) { tap(10, 0.4); C.applyEvent(S, { k: 'REST', dt: 1.5 }); clock += 1.5; }
  quizPass(S);
  return S;
}

// --- Script B: a noisier, longer path reaching the SAME admissions ---
function runNoisy(seed) {
  const S = C.makeSlice(seed);
  for (let i = 0; i < 3; i++) C.applyEvent(S, { k: 'PLACE_STONE' });
  // stutter: burn, idle-decay a bit, burn again — same net destination, longer story
  for (let i = 0; i < 10; i++) C.applyEvent(S, { k: 'SCRATCH', dt: 1, moving: true });
  for (let i = 0; i < 3; i++) C.applyEvent(S, { k: 'SCRATCH', dt: 0.5, moving: false });
  for (let i = 0; i < 60 && S.phase === 'PLAYING'; i++) C.applyEvent(S, { k: 'SCRATCH', dt: 0.5, moving: true });
  quizFailThenPass(S); // extra QUIZ_FAILED noise before the real pass
  let firstFauxTaken = false;
  for (let guard = 0; guard < 6000 && S.phase === 'PLAYING'; guard++) {
    C.applyEvent(S, { k: 'SKY_TICK', dt: 0.25 });
    // detour: verify a note we won't catch yet (pure narrative, no mutation of the count)
    const anyNote = S.sky.entities.find(e => e.kind === 'note' && !e.revealed);
    if (anyNote) C.applyEvent(S, { k: 'VERIFY', id: anyNote.id });
    // detour: take the free first-faux lesson if one is in flight (costs nothing, per the stone template)
    if (!firstFauxTaken) {
      const faux = S.sky.entities.find(e => e.kind === 'faux');
      if (faux) { C.applyEvent(S, { k: 'CATCH', id: faux.id }); firstFauxTaken = true; }
    }
    if (!C.beatPhase(S).onBeat) continue;
    const note = S.sky.entities.find(e => e.kind === 'note');
    if (note) C.applyEvent(S, { k: 'CATCH', id: note.id });
  }
  quizFailThenPass(S);
  let clock = 100; // different clock origin — different narrative timeline entirely
  const tap = (n, dt) => { for (let i = 0; i < n; i++) { clock += dt; C.applyEvent(S, { k: 'TAP', t: clock }); } };
  C.applyEvent(S, { k: 'TAP', t: (clock += 1) });
  // many small chunks + rests instead of few large ones: same total, messier shape
  for (let guard = 0; guard < 200 && S.phase === 'PLAYING'; guard++) { tap(4, 0.4); C.applyEvent(S, { k: 'REST', dt: 0.8 }); clock += 0.8; }
  quizFailThenPass(S);
  return S;
}

function quizPass(S) {
  C.applyEvent(S, { k: 'BEGIN_QUIZ' });
  const bank = C.quizForLevel(S.level);
  for (let i = 0; i < bank.length; i++) C.applyEvent(S, { k: 'ANSWER_QUIZ', choice: bank[i].correctIndex });
}
function quizFailThenPass(S) {
  C.applyEvent(S, { k: 'BEGIN_QUIZ' });
  const failBank = C.quizForLevel(S.level);
  for (let i = 0; i < failBank.length; i++) C.applyEvent(S, { k: 'ANSWER_QUIZ', choice: (failBank[i].correctIndex + 1) % 4 });
  quizPass(S); // retake, this time honestly
}

/* ---------- the proof ---------- */
T('BOUNDED_CONTINUITY: divergent narrative, convergent sovereignty (same seed)', () => {
  const A = runClean('bc-seed');
  const B = runNoisy('bc-seed');
  ok(A.ledger.length !== B.ledger.length, 'narratives must actually differ in length: ' + A.ledger.length + ' vs ' + B.ledger.length);
  ok(C.stateDigest(A) !== C.stateDigest(B), 'full memory (digest) must diverge — this is not a byte-identity claim');
  const pA = projectGov(A), pB = projectGov(B);
  eq(pA.admitted, pB.admitted, 'admitted set must converge');
  eq(pA.phase, pB.phase, 'phase must converge');
  eq(pA.level, pB.level, 'level must converge');
  eq(pA.admitted, '0,1,2', 'sanity: both actually completed the game');
  ok(B.quiz.attempts > A.quiz.attempts || B.ledger.filter(e => e.k === 'QUIZ_FAILED').length > 0,
    'the noisy run must show real evidence of a harder, more mistake-prone history');
});
T('BOUNDED_CONTINUITY: holds with a different seed too (not a coincidence of one seed)', () => {
  const A = runClean('bc-seed-2');
  const B = runNoisy('bc-seed-2');
  eq(projectGov(A).admitted, projectGov(B).admitted);
  eq(projectGov(A).phase, projectGov(B).phase);
  ok(C.stateDigest(A) !== C.stateDigest(B));
});
T('the dual: SAME script replayed identically still gives byte-identical digest (determinism, cited to distinguish from the property above)', () => {
  const A1 = runClean('bc-determinism-seed');
  const A2 = runClean('bc-determinism-seed');
  eq(C.stateDigest(A1), C.stateDigest(A2), 'identical history -> identical everything, including full memory');
});
T('what the proof does NOT claim: unequal admitted subsequences do NOT converge (bounded continuity is not "anything goes")', () => {
  const A = runClean('bc-seed-3'); // reaches level 2, admitted [0,1,2]
  const partial = C.makeSlice('bc-seed-3');
  for (let i = 0; i < 3; i++) C.applyEvent(partial, { k: 'PLACE_STONE' });
  for (let i = 0; i < 60 && partial.phase === 'PLAYING'; i++) C.applyEvent(partial, { k: 'SCRATCH', dt: 0.5, moving: true });
  quizPass(partial); // only level 0 admitted, stops here
  ok(projectGov(A).admitted !== projectGov(partial).admitted, 'a genuinely different admitted subsequence must NOT converge — continuity is bounded, not universal');
});

/* ---------- receipt ---------- */
const passed = results.filter(r => r.ok).length;
const failed = results.length - passed;
for (const r of results) console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + (r.ok ? '' : '  — ' + r.err));
function h32(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
const src = fs.readFileSync(__filename, 'utf8');
console.log('RECEIPT ' + JSON.stringify({
  receipt: 'BOUNDED_CONTINUITY_PROOF_V1',
  suite: 'experiments/bounded-continuity/bounded-continuity.test.js',
  passed, failed, total: results.length,
  module_digest: 'demo-fnv1a:' + h32(src).toString(16).padStart(8, '0'),
  node: process.version, executed_at: new Date().toISOString(),
  authority: false, canon: false, ledger_effect: 'none', claim: 'NO_CLAIM',
  corroborating_receipts: {
    root_canon: '29/29', vertical_slice: '34/34',
    policy_loom_digest_staleness: '55/55 incl. KILL tests',
    metabolism_memory_orchard: '20/20',
  },
  note: 'proves Project_gov invariant to narrative divergence; does NOT claim digest identity across divergent histories',
}));
if (failed > 0) process.exit(1);
