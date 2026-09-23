// src/core/book.js
//
// Signature frozen by P0 (MAYOR_RULING_V2.md Amendment 2). Body owned and
// written by P1. Full contract: docs/INTERFACES.md; rules in plain
// language: docs/RULES_M1.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.
//
// Pip's Book is DERIVED, never stored: it is a read of the ledger, not a
// piece of state that `apply()` maintains. This is what makes "the first
// time surprises, the fifth is mastery" true without adding a mutable
// cache to keep in sync.

import { makeState, apply } from './state.js';

/** @typedef {import('./events.js').Ledger} Ledger */
/** @typedef {import('./state.js').Species} Species */
/** @typedef {import('./state.js').Reaction} Reaction */

/**
 * @typedef {Object} RecipeEntry
 * @property {[Species, Species]} pair - the two adjacent species that combined
 * @property {'lanternmoss'|'mirrorbloom'} result
 * @property {number} day - the calendar day (epochDay) it was first discovered
 * @property {number} warrenDay - the Warren's own day count (1 = the day of the
 *   first VISIT); this is what the player sees
 *
 * @typedef {Object} Book
 * @property {RecipeEntry[]} recipes - discovered recipes, in discovery order,
 *   each species pair appearing at most once (first discovery only)
 * @property {Object.<string, Reaction>} reactions - species -> the reaction
 *   Lulu has shown to it, keyed by Species (and by 'lanternmoss'/'mirrorbloom'
 *   once discovered)
 */

const RECIPE_RESULTS = new Set(['lanternmoss', 'mirrorbloom']);

/**
 * Derive Pip's Book from a ledger by replaying it and recording the first
 * reaction shown for each species dropped, and the first day each recipe
 * pair combined. Never reads or writes anything but `ledger`.
 *
 * Recipe results (lanternmoss/mirrorbloom) are never themselves dropped in
 * M1 -- they only arise from the daily recipe transform -- so `reactions`
 * only ever gains mosscap/glowcap/reedling entries in this milestone; see
 * docs/RULES_M1.md "The Book".
 *
 * @param {Ledger} ledger
 * @returns {Book}
 */
export function book(ledger) {
  const recipes = [];
  const reactions = {};
  const seenPairs = new Set();

  let state = makeState(ledger.seed);
  let firstDay = null;
  for (const event of ledger.events) {
    const prev = state;
    state = apply(prev, event);
    if (firstDay === null && event && event.kind === 'VISIT') firstDay = state.day;

    if (
      event &&
      event.kind === 'FIND_DROPPED' &&
      event.target === 'tile' &&
      prev.offered &&
      state.offered === null
    ) {
      const species = prev.offered.species;
      if (!(species in reactions)) {
        reactions[species] = state.lastReaction;
      }
    }

    if (event && event.kind === 'VISIT' && state.day !== prev.day) {
      for (let i = 0; i < prev.ground.tiles.length; i++) {
        const before = prev.ground.tiles[i];
        const after = state.ground.tiles[i];
        const beforeSpecies = before ? before.species : null;
        const afterSpecies = after ? after.species : null;
        if (
          afterSpecies &&
          RECIPE_RESULTS.has(afterSpecies) &&
          beforeSpecies !== afterSpecies
        ) {
          const pair = [beforeSpecies, 'glowcap'];
          const key = `${pair[0]}+${pair[1]}=${afterSpecies}`;
          if (!seenPairs.has(key)) {
            seenPairs.add(key);
            recipes.push({ pair, result: afterSpecies, day: state.day, warrenDay: state.day - firstDay + 1 });
          }
        }
      }
    }
  }

  return { recipes, reactions };
}
