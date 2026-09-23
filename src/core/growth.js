// src/core/growth.js
//
// Signature frozen by P0 (MAYOR_RULING_V2.md Amendment 2). Body owned and
// written by P1. Full contract: docs/INTERFACES.md; rules in plain
// language: docs/RULES_M1.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.

/** @typedef {import('./state.js').State} State */
/** @typedef {import('./state.js').Plant} Plant */

/**
 * The two M1 recipes (MAYOR_RULING_V2.md): an adjacency pair of a non-glow
 * species and glowcap transforms the non-glow tile in place.
 */
const RECIPES = [
  { partner: 'mosscap', result: 'lanternmoss' },
  { partner: 'reedling', result: 'mirrorbloom' },
];

/** Orthogonal (not diagonal) neighbour indices of `i` on the 4x4 grid. */
function neighborsOf(i) {
  const row = Math.floor(i / 4);
  const col = i % 4;
  const out = [];
  if (row > 0) out.push(i - 4);
  if (row < 3) out.push(i + 4);
  if (col > 0) out.push(i - 1);
  if (col < 3) out.push(i + 1);
  return out;
}

/**
 * Advance the Warren by one real day: stage+1 (max 3) on every growing
 * (non-wilted) plant, sleepers wake, wilted plants fall into compost (tile
 * cleared, compost+1, capped at 5), adjacent recipe pairs fire (the
 * non-glow tile transforms into a fresh stage-0 plant), and energy resets
 * for the new day. Called once per elapsed calendar day between two
 * VISITs -- never on a timer.
 *
 * @param {State} state
 * @returns {State}
 */
export function newDay(state) {
  const day = state.day + 1;

  // 1. stage+1 (max 3) on growing plants, sleepers wake; wilted plants are
  //    marked for the compost sweep instead of being kept.
  let wiltedCount = 0;
  const grown = state.ground.tiles.map((plant) => {
    if (!plant) return null;
    if (plant.wilted) {
      wiltedCount += 1;
      return null; // tile clears
    }
    return {
      ...plant,
      stage: Math.min(3, plant.stage + 1),
      sleeping: false,
    };
  });

  // 2. recipes fire on orthogonally adjacent pairs, computed against the
  //    post-wake/post-wilt-sweep snapshot so a cleared tile never pairs.
  const tiles = grown.slice();
  for (let i = 0; i < grown.length; i++) {
    const plant = grown[i];
    if (!plant) continue;
    const recipe = RECIPES.find((r) => r.partner === plant.species);
    if (!recipe) continue;
    const hasGlowNeighbor = neighborsOf(i).some((n) => grown[n] && grown[n].species === 'glowcap');
    if (hasGlowNeighbor) {
      tiles[i] = {
        species: recipe.result,
        plantedDay: day,
        sleeping: false,
        stage: 0,
        wilted: false,
      };
    }
  }

  return {
    ...state,
    day,
    energy: 6,
    asleep: false,
    compost: Math.min(5, state.compost + wiltedCount),
    ground: { ...state.ground, tiles },
  };
}
