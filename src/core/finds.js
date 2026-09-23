// src/core/finds.js
//
// STUB, frozen signatures (MAYOR_RULING_V2.md Amendment 2). P0 owns the
// signatures; P1 owns the bodies from here on. Full contract:
// docs/INTERFACES.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.

/** @typedef {import('./state.js').State} State */
/** @typedef {import('./state.js').Find} Find */
/** @typedef {import('./state.js').Reaction} Reaction */
/** @typedef {import('./state.js').Plant} Plant */

/**
 * Decide the next find Lulu offers, deterministically, from state alone
 * (species distribution + rng(seed, index) — never a raw chance call).
 * Returns null when energy is 0 (Lulu has nothing left to offer today).
 *
 * STUB: always returns null. P1 replaces this with the real species pick.
 *
 * @param {State} state
 * @returns {Find|null}
 */
export function nextFind(state) {
  return null;
}

/**
 * Is dropping the currently-offered find on `tileIndex` legal right now?
 * Legal = tile exists, is not rock, and is not already occupied.
 * This is the ONLY thing the lantern judges (VISION_V2.md §4: "the lantern
 * judges legality only").
 *
 * STUB: always returns false. P1 replaces this with the real check.
 *
 * @param {State} state
 * @param {number} tileIndex - 0..15
 * @returns {boolean}
 */
export function legal(state, tileIndex) {
  return false;
}

/**
 * What happens when `find` is dropped on `tileIndex`: the Plant it becomes
 * (species-dependent terrain rules: mosscap sprouts anywhere but wilts on
 * pond, glowcap sleeps a night, reedling thrives on pond but wilts on
 * soil) and Lulu's reaction (glow species -> 'bighop', reedling planted in
 * row 3 -> 'shrug', else 'hop'). Pure function of (state, find, tileIndex):
 * no side effects, does not itself mutate ground -- `apply()` is what
 * commits the result to a new State.
 *
 * STUB: returns nulls. P1 replaces this with the real outcome table.
 *
 * @param {State} state
 * @param {Find} find
 * @param {number} tileIndex - 0..15
 * @returns {{plant: Plant|null, reaction: Reaction}}
 */
export function outcome(state, find, tileIndex) {
  return { plant: null, reaction: null };
}
