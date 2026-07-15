/*
 * context-builder.js
 * ---------------------------------------------------------------
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Local-only preview module. Not part of V0 canon. No deploy target.
 * ---------------------------------------------------------------
 *
 * Builds the minimal scene context the NPC is allowed to "perceive."
 * This is the withholding boundary: anything not placed on
 * visible_objects/shared_memories, and anything explicitly named in
 * locked_knowledge, must never appear in a valid model response (see
 * response-schema.js's locked-knowledge leak check).
 */

'use strict';
(function () {

// Everything that exists in the *full* world, keyed by the rung at
// which it becomes visible. Rung 2 must never surface rung-3+ content
// (e.g. "Garden Plot" bloom-shrine, later zones/goblins).
const WORLD_KNOWLEDGE = [
  { term: 'seed mound', fromRung: 1 },
  { term: 'first bloom', fromRung: 1 },
  { term: 'garden plot', fromRung: 3 },
  { term: 'bloom shrine', fromRung: 4 },
  { term: 'council chamber', fromRung: 5 },
  { term: 'aura storm', fromRung: 5 },
  { term: 'portal gate', fromRung: 6 },
];

const GESTURES_BY_RUNG = {
  1: ['look_up', 'tilt_head', 'wave'],
  2: ['look_up', 'tilt_head', 'wave', 'point_at_seed', 'nod'],
  3: ['look_up', 'tilt_head', 'wave', 'point_at_seed', 'point_at_bloom', 'nod', 'sit'],
};

function gesturesForRung(rung) {
  const keys = Object.keys(GESTURES_BY_RUNG).map(Number).filter((r) => r <= rung);
  const maxKey = keys.length ? Math.max(...keys) : 1;
  return GESTURES_BY_RUNG[maxKey] || GESTURES_BY_RUNG[1];
}

function lockedKnowledgeForRung(rung) {
  return WORLD_KNOWLEDGE.filter((w) => w.fromRung > rung).map((w) => w.term);
}

/**
 * buildContext(state)
 *   state: {
 *     rung: number,
 *     visibleObjects: string[],           // what's physically in the scene
 *     sharedMemories: object[],           // bounded list, most-recent-first
 *     currentMood: string,
 *     availableCharacters: string[],      // who is actually present ('lulu', maybe 'zaz' in lab mode)
 *     supportedMemoryTerms?: string[],    // terms the engine can vouch actually happened
 *     maxMemories?: number,               // bound (default 5)
 *   }
 *
 * Returns a plain-object scene context safe to hand to the gateway /
 * prompt builder. Contains an explicit locked_knowledge exclusion list.
 */
function buildContext(state) {
  state = state || {};
  const rung = typeof state.rung === 'number' ? state.rung : 1;
  const maxMemories = typeof state.maxMemories === 'number' ? state.maxMemories : 5;
  const sharedMemories = Array.isArray(state.sharedMemories)
    ? state.sharedMemories.slice(0, maxMemories)
    : [];

  return {
    rung,
    visible_objects: Array.isArray(state.visibleObjects) ? state.visibleObjects.slice() : [],
    available_gestures: gesturesForRung(rung),
    shared_memories: sharedMemories,
    current_mood: state.currentMood || 'calm',
    available_characters: Array.isArray(state.availableCharacters) ? state.availableCharacters.slice() : ['lulu'],
    locked_knowledge: lockedKnowledgeForRung(rung),
    supported_memory_terms: Array.isArray(state.supportedMemoryTerms) ? state.supportedMemoryTerms.slice() : [],
  };
}

const __exports = { buildContext, gesturesForRung, lockedKnowledgeForRung, WORLD_KNOWLEDGE };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = __exports;
} else if (typeof window !== 'undefined') {
  window.NPCPreview = window.NPCPreview || {};
  window.NPCPreview.contextBuilder = __exports;
}

})();
