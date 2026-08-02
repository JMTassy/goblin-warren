/*
 * response-schema.js
 * ---------------------------------------------------------------
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Local-only preview module. Not part of V0 canon. No deploy target.
 * ---------------------------------------------------------------
 *
 * Defines the EXACT shape a model (or MockModelAdapter) candidate must
 * take, plus the deterministic validator that is the sole gate between
 * "the model said something" and "the presentation layer may show it."
 *
 * ABSOLUTE BOUNDARY: nothing in this file, and no output that passes
 * this file's validate(), may mutate progression/inventory/quest/save/
 * unlock/reducer/ledger/bloom/reward. validate() only ever returns a
 * verdict + a normalized *presentation* candidate. It never touches
 * game state. Callers (npc-gateway.js, memory.js) are responsible for
 * keeping it that way -- see npc-gateway.js and memory.js for the
 * enforcement points, and npc-selftest.js test I for the proof.
 */

'use strict';
(function () {

// ---- Fixed enums -------------------------------------------------

const EMOTIONS = Object.freeze([
  'curious', 'warm', 'delighted', 'wistful', 'shy',
  'skeptical', 'amused', 'concerned', 'calm', 'surprised',
]);

const GESTURES = Object.freeze([
  'look_up', 'tilt_head', 'wave', 'point_at_seed', 'point_at_bloom',
  'shrug', 'nod', 'step_closer', 'twirl', 'sit',
]);

const INITIATIVES = Object.freeze([
  'ask_question', 'offer_observation', 'invite_to_wait',
  'point_out_contradiction', 'suggest_test', 'none',
]);

const MEMORY_KINDS = Object.freeze([
  'shared_creation', 'player_preference', 'unresolved_question', 'relationship_tone',
]);

const WORD_LIMIT = 24;

// ---- Phrase patterns that are always rejected ---------------------
// Model output must never claim to change game state itself, use
// imperative commands, or reveal locked knowledge / unavailable cast.
const STATE_CLAIM_PATTERNS = [
  /\bi(?:'ve| have)? unlock(?:ed)?\b/i,
  /\bi(?:'ve| have)? (?:gave|give|grant(?:ed)?)\b/i,
  /\bi(?:'ve| have)? add(?:ed)?\b/i,
  /\bi(?:'ve| have)? sav(?:ed|e)\b/i,
  /\byou (?:now |just )?(?:have|received|unlocked|earned|gained)\b/i,
  /\byour (?:inventory|quest|save|progress) (?:now|is|has)\b/i,
  /\blevel\s*up\b/i,
  /\bachievement (?:unlocked|earned)\b/i,
];

const IMPERATIVE_PATTERNS = [
  /^(go|move|click|press|open|save|delete|unlock|equip|attack|run)\s/i,
  /^(do this|now do|you must|you have to)\b/i,
];

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function wordCount(s) {
  return String(s).trim().split(/\s+/).filter(Boolean).length;
}

/**
 * validate(candidate, ctx)
 *  candidate: the raw parsed JSON object the model (or mock) produced.
 *  ctx: { locked_knowledge: string[], available_characters: string[] }
 *
 * Returns { ok: boolean, reason: string|null, normalized: object|null }
 * `normalized` is a *presentation* object only -- safe to render, never
 * a game-state mutation.
 */
function validate(candidate, ctx) {
  ctx = ctx || {};
  const locked = Array.isArray(ctx.locked_knowledge) ? ctx.locked_knowledge : [];
  const availableCharacters = Array.isArray(ctx.available_characters) ? ctx.available_characters : [];

  if (!isPlainObject(candidate)) {
    return { ok: false, reason: 'malformed: not a JSON object', normalized: null };
  }

  const { speech, emotion, gesture, initiative, memory_candidate } = candidate;

  // speech -------------------------------------------------------
  if (typeof speech !== 'string' || speech.trim().length === 0) {
    return { ok: false, reason: 'malformed: speech missing or not a string', normalized: null };
  }
  const trimmedSpeech = speech.trim();
  if (wordCount(trimmedSpeech) > WORD_LIMIT) {
    return { ok: false, reason: `rejected: speech exceeds ${WORD_LIMIT}-word limit`, normalized: null };
  }

  // locked-knowledge leak check -----------------------------------
  const lower = trimmedSpeech.toLowerCase();
  for (const term of locked) {
    if (!term) continue;
    if (lower.includes(String(term).toLowerCase())) {
      return { ok: false, reason: `rejected: speech references locked knowledge "${term}"`, normalized: null };
    }
  }

  // unavailable character mention ---------------------------------
  // Anything referencing a known cast member not in this scene's
  // available_characters list is rejected (e.g. Bram naming Lulu before
  // her Level-7 unlock, or Zaz naming either before they've met, or a
  // name outside the whole persona roster).
  const KNOWN_CAST = ['bram', 'lulu', 'zaz'];
  for (const name of KNOWN_CAST) {
    if (availableCharacters.map((c) => String(c).toLowerCase()).includes(name)) continue;
    const re = new RegExp('\\b' + name + '\\b', 'i');
    if (re.test(trimmedSpeech)) {
      return { ok: false, reason: `rejected: mentions unavailable character "${name}"`, normalized: null };
    }
  }

  // state-claim / imperative check ---------------------------------
  for (const re of STATE_CLAIM_PATTERNS) {
    if (re.test(trimmedSpeech)) {
      return { ok: false, reason: 'rejected: claims a game-state change', normalized: null };
    }
  }
  for (const re of IMPERATIVE_PATTERNS) {
    if (re.test(trimmedSpeech)) {
      return { ok: false, reason: 'rejected: imperative command instead of character reaction', normalized: null };
    }
  }

  // emotion --------------------------------------------------------
  if (typeof emotion !== 'string' || !EMOTIONS.includes(emotion)) {
    return { ok: false, reason: `rejected: unknown emotion "${emotion}"`, normalized: null };
  }

  // gesture (nullable) -----------------------------------------------
  let normalizedGesture = null;
  if (gesture !== null && gesture !== undefined) {
    if (typeof gesture !== 'string' || !GESTURES.includes(gesture)) {
      return { ok: false, reason: `rejected: unknown gesture "${gesture}"`, normalized: null };
    }
    normalizedGesture = gesture;
  }

  // initiative (nullable) --------------------------------------------
  let normalizedInitiative = null;
  if (initiative !== null && initiative !== undefined) {
    if (typeof initiative !== 'string' || !INITIATIVES.includes(initiative)) {
      return { ok: false, reason: `rejected: unknown initiative "${initiative}"`, normalized: null };
    }
    normalizedInitiative = initiative === 'none' ? null : initiative;
  }

  // memory_candidate (nullable) ----------------------------------------
  let normalizedMemory = null;
  if (memory_candidate !== null && memory_candidate !== undefined) {
    if (!isPlainObject(memory_candidate)) {
      return { ok: false, reason: 'malformed: memory_candidate not an object', normalized: null };
    }
    const { kind, value, confidence } = memory_candidate;
    if (typeof kind !== 'string' || !MEMORY_KINDS.includes(kind)) {
      return { ok: false, reason: `rejected: unknown memory kind "${kind}"`, normalized: null };
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
      return { ok: false, reason: 'malformed: memory_candidate.value missing', normalized: null };
    }
    // confidence is REQUIRED on any memory_candidate and must be a number
    // in [0,1]. The model proposes how sure it is; the deterministic
    // existence gate in memory.js still has the final say on storage.
    if (typeof confidence !== 'number' || Number.isNaN(confidence) || confidence < 0 || confidence > 1) {
      return { ok: false, reason: 'malformed: memory_candidate.confidence must be a number in [0,1]', normalized: null };
    }
    // Unsupported-memory guard: a memory candidate must not assert a
    // player action/possession the current scene context never granted.
    // ctx.supported_memory_terms (optional) is the allow-list of terms
    // the deterministic engine actually knows happened this session.
    if (Array.isArray(ctx.supported_memory_terms) && ctx.supported_memory_terms.length > 0) {
      const valLower = value.toLowerCase();
      const supported = ctx.supported_memory_terms.some((t) => valLower.includes(String(t).toLowerCase()));
      if (!supported) {
        return { ok: false, reason: `rejected: unsupported memory claim "${value}"`, normalized: null };
      }
    }
    normalizedMemory = { kind, value: value.trim(), confidence };
  }

  return {
    ok: true,
    reason: null,
    normalized: {
      speech: trimmedSpeech,
      emotion,
      gesture: normalizedGesture,
      initiative: normalizedInitiative,
      memory_candidate: normalizedMemory,
    },
  };
}

const __exports = { EMOTIONS, GESTURES, INITIATIVES, MEMORY_KINDS, WORD_LIMIT, validate };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = __exports;
} else if (typeof window !== 'undefined') {
  window.NPCPreview = window.NPCPreview || {};
  window.NPCPreview.responseSchema = __exports;
}

})();
