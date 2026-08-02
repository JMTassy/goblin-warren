/*
 * memory.js
 * ---------------------------------------------------------------
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Local-only preview module. Not part of V0 canon. No deploy target.
 * ---------------------------------------------------------------
 *
 * A tiny emotional-memory record, kept entirely on the presentation
 * side (session-only, mirrors the wider project's "no persistence
 * surface" discipline -- this module never touches localStorage,
 * cookies, or a backend).
 *
 * The critical property: promoteCandidate() is the ONLY way a model's
 * memory_candidate becomes memory, and it only runs a candidate that
 * has ALREADY passed response-schema.js's validate() (the deterministic
 * engine-side gate). The model proposes; this function (called by
 * game/engine code, never by the gateway itself) decides.
 */

'use strict';
(function () {

const { validate } = (typeof module !== 'undefined' && module.exports)
  ? require('./response-schema')
  : window.NPCPreview.responseSchema;

function emptyMemory() {
  return {
    last_interaction: null,       // {at: timestamp, summary: string}
    shared_creation: null,        // string|null
    player_preference: null,      // string|null
    unresolved_question: null,    // string|null
    relationship_tone: 'new',     // string
  };
}

/**
 * promoteCandidate(memoryState, candidate, ctx, opts)
 *   memoryState: current memory object (from emptyMemory() or previous call)
 *   candidate: the RAW model/mock candidate (not yet validated) OR an
 *              already-normalized one -- either is accepted; validation
 *              always re-runs here so this function can never be
 *              bypassed by a caller skipping validate() upstream.
 *   ctx: same shape passed to response-schema.validate (locked_knowledge,
 *        available_characters, supported_memory_terms)
 *   opts: {
 *     now?: () => number,          // deterministic clock for testing
 *     engineFacts?: string[],      // creation tokens the DETERMINISTIC engine
 *                                  //   has actually produced this session,
 *                                  //   e.g. ['first_bloom','seed']. This is
 *                                  //   the existence gate: a shared_creation
 *                                  //   candidate is stored ONLY if its value
 *                                  //   references one of these real facts.
 *   }
 *
 * Flow enforced here: m_candidate -> deterministic validator (schema +
 * existence check) -> m_stored. There is no model -> memory path; the
 * model can only ever propose, and this function's existence gate means
 * even a schema-valid candidate is refused if the thing it claims to
 * remember was never actually created by the engine.
 *
 * Returns { memoryState (new object, original untouched), promoted: bool,
 *           reason: string|null }
 */
function promoteCandidate(memoryState, candidate, ctx, opts) {
  opts = opts || {};
  const now = opts.now ? opts.now() : Date.now();
  const base = Object.assign({}, emptyMemory(), memoryState || {});

  const verdict = validate(candidate, ctx);
  if (!verdict.ok) {
    return { memoryState: base, promoted: false, reason: verdict.reason };
  }

  const next = Object.assign({}, base);
  next.last_interaction = { at: now, summary: verdict.normalized.speech };

  const mc = verdict.normalized.memory_candidate;
  if (!mc) {
    return { memoryState: next, promoted: false, reason: 'no memory_candidate present' };
  }

  // Existence gate: a shared_creation must correspond to something the
  // engine has really made. If the caller supplies engineFacts, the
  // candidate's value must reference at least one of them, or it is
  // refused (well-formed, but claiming a creation that does not exist).
  if (mc.kind === 'shared_creation' && Array.isArray(opts.engineFacts)) {
    const valLower = mc.value.toLowerCase();
    const exists = opts.engineFacts.some((f) => valLower.includes(String(f).toLowerCase()));
    if (!exists) {
      return {
        memoryState: next,
        promoted: false,
        reason: `rejected: memory references a creation not present in engine state ("${mc.value}")`,
      };
    }
  }

  switch (mc.kind) {
    case 'shared_creation':
      next.shared_creation = mc.value;
      break;
    case 'player_preference':
      next.player_preference = mc.value;
      break;
    case 'unresolved_question':
      next.unresolved_question = mc.value;
      break;
    case 'relationship_tone':
      next.relationship_tone = mc.value;
      break;
    default:
      // Unreachable given validate()'s enum check, kept as a defensive guard.
      return { memoryState: next, promoted: false, reason: `unknown memory kind "${mc.kind}"` };
  }

  return { memoryState: next, promoted: true, reason: null };
}

/**
 * summarizeForContext(memoryState, maxItems)
 * Turns the memory record into the bounded shared_memories array shape
 * context-builder.js expects (most-recent-first, capped).
 */
function summarizeForContext(memoryState, maxItems) {
  maxItems = typeof maxItems === 'number' ? maxItems : 5;
  const m = memoryState || emptyMemory();
  const items = [];
  if (m.shared_creation) items.push({ kind: 'shared_creation', value: m.shared_creation });
  if (m.player_preference) items.push({ kind: 'player_preference', value: m.player_preference });
  if (m.unresolved_question) items.push({ kind: 'unresolved_question', value: m.unresolved_question });
  if (m.relationship_tone && m.relationship_tone !== 'new') {
    items.push({ kind: 'relationship_tone', value: m.relationship_tone });
  }
  if (m.last_interaction) {
    items.unshift({ kind: 'last_interaction', value: m.last_interaction.summary });
  }
  return items.slice(0, maxItems);
}

const __exports = { emptyMemory, promoteCandidate, summarizeForContext };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = __exports;
} else if (typeof window !== 'undefined') {
  window.NPCPreview = window.NPCPreview || {};
  window.NPCPreview.memory = __exports;
}

})();
