// src/core/state.js
//
// STUB, frozen signatures (MAYOR_RULING_V2.md Amendment 2). P0 owns the
// signatures and the shape below; P1 owns the bodies from here on.
// Full contract: docs/INTERFACES.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.
// Use src/core/rng.js for randomness and read time only from VISIT{t}.

/**
 * @typedef {'mosscap'|'glowcap'|'reedling'} Species
 *   M1 species only (MAYOR_RULING_V2.md Amendment 1: no bugs, no golden).
 *
 * @typedef {Object} Find
 * @property {string} id
 * @property {Species} species
 *
 * @typedef {Object} Plant
 * @property {Species|'lanternmoss'|'mirrorbloom'} species - a recipe result
 *   replaces the tile's species in place; it is never a separate Find.
 * @property {number} plantedDay
 * @property {boolean} sleeping - true for a freshly-planted glowcap until a
 *   VISIT lands on a later day.
 * @property {number} stage - 0..3
 * @property {boolean} wilted
 *
 * @typedef {'soil'|'rock'|'pond'} Terrain
 *
 * @typedef {Object} Ground
 * @property {4} w
 * @property {4} h
 * @property {Terrain[]} terrain - length 16, row-major (index = row*4 + col)
 * @property {(Plant|null)[]} tiles - length 16, same indexing as terrain
 *
 * @typedef {'curious'|'happy'|'worried'|'tired'} Mood
 *
 * @typedef {'hop'|'bighop'|'shrug'|null} Reaction
 *
 * @typedef {Object} State
 * @property {'GW2'} v
 * @property {number} seed
 * @property {number} day
 * @property {number} energy - 0..6, finds remaining before Lulu sleeps
 * @property {boolean} asleep
 * @property {Mood} mood
 * @property {Find|null} offered - the find currently held up, waiting to be dragged
 * @property {Ground} ground
 * @property {number} compost - 0..5, a plain counter in M1 (no golden-seed trigger yet)
 * @property {Reaction} lastReaction
 * @property {boolean} sound
 */

/**
 * Build the initial State for a freshly-born Warren.
 * STUB: returns a well-typed, all-soil, empty-ground State. P1 replaces
 * this with the real seed -> terrain (10 soil / 3 rock / 3 pond) layout
 * using `rng(seed, i)` from ./rng.js -- never a raw chance call.
 *
 * @param {number} seed
 * @returns {State}
 */
export function makeState(seed) {
  return {
    v: 'GW2',
    seed,
    day: 0,
    energy: 6,
    asleep: false,
    mood: 'curious',
    offered: null,
    ground: {
      w: 4,
      h: 4,
      terrain: new Array(16).fill('soil'),
      tiles: new Array(16).fill(null),
    },
    compost: 0,
    lastReaction: null,
    sound: true,
  };
}

/**
 * Apply one ledger event to a State, returning a NEW State. Must never
 * mutate `state` or anything reachable from it (P1 test suite asserts
 * this). Illegal events (e.g. FIND_DROPPED on a rock tile) are no-ops that
 * still return a new (structurally-equal) object.
 *
 * STUB: returns a shallow copy. P1 replaces this with the real reducer
 * for every EVENT kind in ./events.js.
 *
 * @param {State} state
 * @param {import('./events.js').GWEvent} event
 * @returns {State}
 */
export function apply(state, event) {
  return { ...state };
}
