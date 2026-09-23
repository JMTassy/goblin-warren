// src/core/finds.js
//
// Signatures frozen by P0 (MAYOR_RULING_V2.md Amendment 2). Body owned and
// written by P1. Full contract: docs/INTERFACES.md; rules in plain
// language: docs/RULES_M1.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.

import { rngPick } from './rng.js';

/** @typedef {import('./state.js').State} State */
/** @typedef {import('./state.js').Find} Find */
/** @typedef {import('./state.js').Reaction} Reaction */
/** @typedef {import('./state.js').Plant} Plant */
/** @typedef {import('./state.js').Species} Species */

/** M1 species only (MAYOR_RULING_V2.md Amendment 1: no bugs, no golden). */
const SPECIES = ['mosscap', 'glowcap', 'reedling'];

/**
 * Decide the next find Lulu offers, deterministically, from state alone:
 * an even pick across the three M1 species via rng(seed, index), where
 * `index` is derived from fields already in the frozen State shape
 * (day, energy) so no hidden counter is needed (docs/RULES_M1.md "Finds").
 * Returns null when energy is 0 or Lulu is asleep (nothing left to offer).
 *
 * @param {State} state
 * @returns {Find|null}
 */
export function nextFind(state) {
  if (state.asleep || state.energy <= 0) {
    return null;
  }
  const offersToday = 6 - state.energy; // 0..5, how many have been offered today so far
  const index = state.day * 6 + offersToday;
  const species = rngPick(state.seed, index, SPECIES);
  return { id: `find_${state.seed}_${state.day}_${offersToday}`, species };
}

/**
 * Is dropping the currently-offered find on `tileIndex` legal right now?
 * Legal = tile index in range, terrain is not rock, and the tile is not
 * already occupied. This is the ONLY thing the lantern judges
 * (VISION_V2.md §4: "the lantern judges legality only") -- species and
 * terrain do not affect legality, only what grows there.
 *
 * @param {State} state
 * @param {number} tileIndex - 0..15
 * @returns {boolean}
 */
export function legal(state, tileIndex) {
  if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= 16) {
    return false;
  }
  if (state.ground.terrain[tileIndex] === 'rock') {
    return false;
  }
  if (state.ground.tiles[tileIndex] !== null) {
    return false;
  }
  return true;
}

/**
 * What happens when `find` is dropped on `tileIndex`: the Plant it becomes
 * and Lulu's reaction. Pure function of (state, find, tileIndex): no side
 * effects, does not itself mutate ground -- `apply()` commits the result.
 *
 * Terrain rules: mosscap sprouts on soil, wilts on pond; glowcap sleeps
 * until a VISIT on a later day (on soil), wilts on pond; reedling thrives
 * on pond, wilts on soil. A wilted plant is marked wilted immediately on
 * drop and waits for the next day-rollover to fall into compost.
 *
 * Reactions: glow species -> 'bighop' (Lulu likes glow, regardless of
 * terrain/outcome); reedling planted in the row nearest her mound (row 3,
 * the bottom row) -> 'shrug'; otherwise -> 'hop'.
 *
 * @param {State} state
 * @param {Find} find
 * @param {number} tileIndex - 0..15
 * @returns {{plant: Plant, reaction: Reaction}}
 */
export function outcome(state, find, tileIndex) {
  const terrain = state.ground.terrain[tileIndex];
  const species = find.species;

  let wilted = false;
  let sleeping = false;
  if (species === 'mosscap') {
    wilted = terrain === 'pond';
  } else if (species === 'glowcap') {
    wilted = terrain === 'pond';
    sleeping = !wilted; // sleeps a night when it actually takes on soil
  } else {
    // reedling
    wilted = terrain === 'soil';
  }

  const plant = {
    species,
    plantedDay: state.day,
    sleeping,
    stage: 0,
    wilted,
  };

  const row = Math.floor(tileIndex / 4);
  let reaction;
  if (species === 'glowcap') {
    reaction = 'bighop';
  } else if (species === 'reedling' && row === 3) {
    reaction = 'shrug';
  } else {
    reaction = 'hop';
  }

  return { plant, reaction };
}
