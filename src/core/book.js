// src/core/book.js
//
// STUB, frozen signature (MAYOR_RULING_V2.md Amendment 2). P0 owns the
// signature; P1 owns the body from here on. Full contract:
// docs/INTERFACES.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.
//
// Pip's Book is DERIVED, never stored: it is a read of the ledger, not a
// piece of state that `apply()` maintains. This is what makes "the first
// time surprises, the fifth is mastery" true without adding a mutable
// cache to keep in sync.

/** @typedef {import('./events.js').Ledger} Ledger */
/** @typedef {import('./state.js').Species} Species */
/** @typedef {import('./state.js').Reaction} Reaction */

/**
 * @typedef {Object} RecipeEntry
 * @property {[Species, Species]} pair - the two adjacent species that combined
 * @property {'lanternmoss'|'mirrorbloom'} result
 * @property {number} day - the day it was first discovered
 *
 * @typedef {Object} Book
 * @property {RecipeEntry[]} recipes - discovered recipes, in discovery order,
 *   each species pair appearing at most once (first discovery only)
 * @property {Object.<string, Reaction>} reactions - species -> the reaction
 *   Lulu has shown to it, keyed by Species (and by 'lanternmoss'/'mirrorbloom'
 *   once discovered)
 */

/**
 * Derive Pip's Book from a ledger by replaying it and recording every
 * recipe-fire and every reaction along the way. Never reads or writes
 * anything but `ledger`.
 *
 * STUB: returns an empty book. P1 replaces this with the real derivation.
 *
 * @param {Ledger} ledger
 * @returns {Book}
 */
export function book(ledger) {
  return { recipes: [], reactions: {} };
}
