// src/core/state.js
//
// Signatures + shapes frozen by P0 (MAYOR_RULING_V2.md Amendment 2). Body
// owned and written by P1. Full contract: docs/INTERFACES.md; rules in
// plain language: docs/RULES_M1.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.
// Use src/core/rng.js for randomness and read time only from VISIT{t}.

import { EVENT, FIND_DROPPED_TARGETS } from './events.js';
import { rngInt } from './rng.js';
import { nextFind, legal, outcome } from './finds.js';
import { newDay } from './growth.js';

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

const ROCK_COUNT = 3;
const POND_COUNT = 3;
const SOIL_COUNT = 16 - ROCK_COUNT - POND_COUNT; // 10

/**
 * Deterministic 4x4 terrain layout from the seed alone: 10 soil, 3 rock,
 * 3 pond, shuffled with a seeded Fisher-Yates (rngInt(seed, i, i+1)) so the
 * same seed always produces the same board and no raw chance call is used.
 *
 * @param {number} seed
 * @returns {Terrain[]} length 16
 */
function buildTerrain(seed) {
  const terrain = [
    ...new Array(SOIL_COUNT).fill('soil'),
    ...new Array(ROCK_COUNT).fill('rock'),
    ...new Array(POND_COUNT).fill('pond'),
  ];
  for (let i = terrain.length - 1; i > 0; i--) {
    const j = rngInt(seed, i, i + 1); // in [0, i]
    const tmp = terrain[i];
    terrain[i] = terrain[j];
    terrain[j] = tmp;
  }
  return terrain;
}

/**
 * Build the initial State for a freshly-born Warren: the real seed ->
 * terrain layout (10 soil / 3 rock / 3 pond), empty ground otherwise.
 *
 * `day` starts at 0, meaning "born, not yet visited." The first VISIT
 * anchors it to that visit's calendar day (see `apply`'s VISIT handling
 * and docs/RULES_M1.md "Days").
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
      terrain: buildTerrain(seed),
      tiles: new Array(16).fill(null),
    },
    compost: 0,
    lastReaction: null,
    sound: true,
  };
}

const MS_PER_DAY = 86400000;

/** Row-major -> calendar day the event's ms-since-epoch timestamp falls on. */
function epochDay(t) {
  return Math.floor(t / MS_PER_DAY);
}

/**
 * Apply one ledger event to a State, returning a NEW State. Never mutates
 * `state` or anything reachable from it. Illegal or malformed events are
 * no-ops that still return a new, structurally-equal object (fail-closed:
 * an unrecognised event kind or a shape apply() cannot make sense of never
 * throws).
 *
 * @param {State} state
 * @param {import('./events.js').GWEvent} event
 * @returns {State}
 */
export function apply(state, event) {
  if (!event || typeof event.kind !== 'string') {
    return { ...state };
  }

  switch (event.kind) {
    case EVENT.WARREN_BORN: {
      // Only ever meaningful as events[0]; makeState(ledger.seed) already
      // used the seed to build the initial state, so a WARREN_BORN met
      // here (first or, if malformed input replays one mid-stream, later)
      // is a no-op rather than a crash.
      return { ...state };
    }

    case EVENT.VISIT: {
      if (typeof event.t !== 'number' || !Number.isFinite(event.t)) {
        return { ...state };
      }
      const day = epochDay(event.t);
      if (day > state.day) {
        // Exactly one daily step fires per VISIT that lands on a later
        // calendar day than the last one seen, however many real days
        // passed in between (see docs/RULES_M1.md "Days"). newDay()'s own
        // day+1 is superseded by the real calendar day so state.day always
        // tracks the last VISIT's actual day.
        const grown = newDay(state);
        return { ...grown, day };
      }
      return { ...state };
    }

    case EVENT.WAKE: {
      return { ...state, asleep: false, energy: 6 };
    }

    case EVENT.FIND_OFFERED: {
      if (state.offered !== null) {
        return { ...state }; // already holding one -- no-op
      }
      const find = nextFind(state);
      if (!find) {
        return { ...state }; // energy 0 or asleep -- no-op
      }
      const energy = state.energy - 1;
      return {
        ...state,
        offered: find,
        energy,
        asleep: energy === 0 ? true : state.asleep,
      };
    }

    case EVENT.FIND_DROPPED: {
      if (!state.offered) {
        return { ...state }; // nothing to drop -- no-op
      }
      if (!FIND_DROPPED_TARGETS.includes(event.target)) {
        return { ...state }; // malformed target -- no-op
      }

      if (event.target === 'compost') {
        return {
          ...state,
          offered: null,
          compost: Math.min(5, state.compost + 1),
        };
      }

      // target === 'tile'
      const tileIndex = event.tile;
      if (!legal(state, tileIndex)) {
        return { ...state }; // illegal drop -- spring-back, no-op
      }
      const find = state.offered;
      const { plant, reaction } = outcome(state, find, tileIndex);
      const tiles = state.ground.tiles.slice();
      tiles[tileIndex] = plant;
      return {
        ...state,
        offered: null,
        ground: { ...state.ground, tiles },
        lastReaction: reaction,
      };
    }

    case EVENT.PET: {
      // Juice only -- never changes gameplay state beyond lastReaction
      // (docs/INTERFACES.md). No non-null Reaction is reserved for petting
      // specifically, so the simplest rule with no punishment is: it reads
      // as a happy 'hop' (see docs/RULES_M1.md "Petting").
      return { ...state, lastReaction: 'hop' };
    }

    case EVENT.TOGGLE_SOUND: {
      return { ...state, sound: !state.sound };
    }

    default:
      return { ...state }; // unrecognised kind -- fail-closed no-op
  }
}
