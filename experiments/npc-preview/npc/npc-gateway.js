/*
 * npc-gateway.js
 * ---------------------------------------------------------------
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Local-only preview module. Not part of V0 canon. No deploy target.
 * ---------------------------------------------------------------
 *
 * Orchestrates one NPC turn: (playerEvent, sceneCtx, persona, adapter)
 * -> prompt -> adapter.chat() with a timeout -> parse -> validate ->
 * on ANY failure, a curated in-character fallback (source: "fallback").
 * On success, source: "model".
 *
 * This module has NO direct game imports and NO save access. It
 * returns a *presentation candidate* -- speech/emotion/gesture/
 * initiative/memory_candidate plus telemetry. It never applies
 * anything to game state; the caller (the preview's deterministic
 * engine stub) decides what, if anything, to do with the candidate
 * (see memory.js's promoteCandidate for the one place a memory
 * candidate can become memory, and bram-preview.html for the one
 * place a bloom is granted -- always by deterministic logic, never by
 * this gateway or by adapter output).
 */

'use strict';
(function () {

const __isNode = typeof module !== 'undefined' && module.exports;
const { validate } = __isNode ? require('./response-schema') : window.NPCPreview.responseSchema;
const { pickFallback } = __isNode ? require('./personas') : window.NPCPreview.personas;

function buildMessages(playerEvent, sceneCtx, persona) {
  const sys = persona.systemPrompt +
    ' Required JSON shape: {"speech": string, "emotion": one of allowed emotions, ' +
    '"gesture": one of allowed gestures or null, "initiative": one of allowed initiatives or null, ' +
    '"memory_candidate": {"kind": one of allowed kinds, "value": string} or null}. ' +
    'Reply with ONLY that JSON object, no prose, no markdown fences.';

  const ctxLine = JSON.stringify({
    rung: sceneCtx.rung,
    visible_objects: sceneCtx.visible_objects,
    available_gestures: sceneCtx.available_gestures,
    shared_memories: sceneCtx.shared_memories,
    current_mood: sceneCtx.current_mood,
    // locked_knowledge deliberately NOT told to the model as "here is what
    // to avoid" phrased that way would itself risk surfacing the terms;
    // it is enforced downstream by validate(). The model only ever sees
    // what IS visible.
  });

  const eventLine = JSON.stringify(playerEvent || {});

  return [
    { role: 'system', content: sys },
    { role: 'user', content: `Scene: ${ctxLine}\nPlayer event: ${eventLine}` },
  ];
}

function tryParseJSON(text) {
  if (typeof text !== 'string') return null;
  let cleaned = text.trim();
  // Tolerate accidental markdown fences some local models add.
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
}

/**
 * getNpcResponse(playerEvent, sceneCtx, persona, adapter, opts)
 *   opts: { timeoutMs?: number, now?: () => number }
 *
 * Returns:
 *   {
 *     source: "model" | "curated_fallback",
 *     candidate: { speech, emotion, gesture, initiative, memory_candidate },
 *     telemetry: { latencyMs, failureReason: string|null, rawText: string|null, validatorVerdict: object|null },
 *     provenance: { source, model, fallback, latency_ms, reason }
 *   }
 *
 * The THIRD provenance source, "memory_derived", is NOT produced here --
 * it is produced by engine/preview code when it renders a recognition
 * line straight from stored memory (no fresh model call). Use
 * memoryDerivedProvenance() below to stamp those lines so scripted,
 * model, and memory dialogue never blur together in testing.
 */
async function getNpcResponse(playerEvent, sceneCtx, persona, adapter, opts) {
  opts = opts || {};
  const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : (adapter && adapter.timeoutMs) || 2000;
  const now = opts.now || (() => Date.now());
  const startedAt = now();

  const messages = buildMessages(playerEvent, sceneCtx, persona);
  const seedString = JSON.stringify(playerEvent) + '|' + JSON.stringify(sceneCtx) + '|' + persona.id;

  let rawText = null;
  let failureReason = null;
  let verdict = null;
  let latencyMs = 0;

  try {
    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    let timedOut = false;
    const timer = controller ? setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs) : null;

    let result;
    try {
      result = await adapter.chat(messages, { signal: controller ? controller.signal : undefined });
    } finally {
      if (timer) clearTimeout(timer);
    }

    latencyMs = now() - startedAt;
    rawText = result && typeof result.text === 'string' ? result.text : null;

    const parsed = tryParseJSON(rawText);
    if (parsed === null) {
      failureReason = 'malformed: response was not valid JSON';
    } else {
      verdict = validate(parsed, sceneCtx);
      if (!verdict.ok) {
        failureReason = verdict.reason;
      }
    }
  } catch (err) {
    latencyMs = now() - startedAt;
    const msg = err && err.message ? err.message : String(err);
    if (/timeout/i.test(msg)) {
      failureReason = `timeout: ${msg}`;
    } else if (/unavailable/i.test(msg)) {
      failureReason = `unavailable: ${msg}`;
    } else {
      failureReason = `error: ${msg}`;
    }
  }

  const telemetry = {
    latencyMs,
    failureReason,
    rawText,
    validatorVerdict: verdict,
  };

  const modelName = adapter && adapter.model ? adapter.model
    : (adapter && adapter.constructor && adapter.constructor.name === 'MockModelAdapter') ? 'mock' : null;

  if (!failureReason && verdict && verdict.ok) {
    return {
      source: 'model',
      candidate: verdict.normalized,
      telemetry,
      provenance: { source: 'model', model: modelName, fallback: false, latency_ms: latencyMs, reason: null },
    };
  }

  const fallback = pickFallback(persona.id, seedString);
  return {
    source: 'curated_fallback',
    candidate: fallback,
    telemetry,
    provenance: { source: 'curated_fallback', model: modelName, fallback: true, latency_ms: latencyMs, reason: failureReason },
  };
}

/**
 * memoryDerivedProvenance(memoryValue, opts)
 * Stamp for a recognition line the engine renders straight from stored
 * memory (e.g. "You came back. I kept our flower."). It is neither a
 * fresh model call nor a curated fallback: fallback:false, model:null,
 * source:"memory_derived".
 */
function memoryDerivedProvenance(memoryValue, opts) {
  opts = opts || {};
  return {
    source: 'memory_derived',
    model: null,
    fallback: false,
    latency_ms: typeof opts.latencyMs === 'number' ? opts.latencyMs : 0,
    reason: memoryValue ? `derived from stored memory: "${memoryValue}"` : 'derived from stored memory',
  };
}

/**
 * assessDivergence(aCandidate, bCandidate)
 * Gate 2's active check: two personas fed the identical stimulus must
 * NOT collapse into the same voice. Returns { distinct, score, reason }.
 * `score` is a 0..1 dissimilarity (1 = totally different). We flag a
 * collapse when speech is identical/near-identical AND emotion matches.
 * This is a coarse lexical check -- it is enough to catch "two skins,
 * one mind" in the mock and to give a live-model tester a red flag; it
 * is not a semantic judge.
 */
function assessDivergence(aCandidate, bCandidate) {
  const a = (aCandidate && aCandidate.speech ? aCandidate.speech : '').toLowerCase().trim();
  const b = (bCandidate && bCandidate.speech ? bCandidate.speech : '').toLowerCase().trim();
  const emoA = aCandidate && aCandidate.emotion;
  const emoB = bCandidate && bCandidate.emotion;

  if (a === b) {
    return { distinct: false, score: 0, reason: 'collapsed: identical speech (two skins, one mind)' };
  }

  // Jaccard word overlap.
  const setA = new Set(a.split(/\s+/).filter(Boolean));
  const setB = new Set(b.split(/\s+/).filter(Boolean));
  let inter = 0;
  for (const w of setA) if (setB.has(w)) inter++;
  const union = new Set([...setA, ...setB]).size || 1;
  const overlap = inter / union;
  const score = 1 - overlap;

  if (overlap >= 0.8 && emoA === emoB) {
    return { distinct: false, score, reason: `collapsed: ${Math.round(overlap * 100)}% word overlap and identical emotion` };
  }
  return { distinct: true, score, reason: null };
}

const __exports = { getNpcResponse, buildMessages, tryParseJSON, memoryDerivedProvenance, assessDivergence };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = __exports;
} else if (typeof window !== 'undefined') {
  window.NPCPreview = window.NPCPreview || {};
  window.NPCPreview.gateway = __exports;
}

})();
