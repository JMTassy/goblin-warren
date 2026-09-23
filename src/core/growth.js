// src/core/growth.js
//
// STUB, frozen signature (MAYOR_RULING_V2.md Amendment 2). P0 owns the
// signature; P1 owns the body from here on. Full contract:
// docs/INTERFACES.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.

/** @typedef {import('./state.js').State} State */

/**
 * Advance the Warren by one real day: stage+1 (max 3) on every growing
 * plant, sleepers wake, wilted plants fall into compost (tile cleared,
 * compost+1), adjacent recipe pairs fire (mosscap+glowcap -> lanternmoss,
 * reedling+glowcap -> mirrorbloom; the non-glow tile transforms), and
 * energy resets for the new day. Called once per elapsed calendar day
 * between two VISIT events -- never on a timer.
 *
 * STUB: bumps `day` only, otherwise returns the state unchanged. P1
 * replaces this with the real daily step.
 *
 * @param {State} state
 * @returns {State}
 */
export function newDay(state) {
  return { ...state, day: state.day + 1 };
}
