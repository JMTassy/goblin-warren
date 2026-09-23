// src/art/registry.js
//
// FROZEN by P0 (VISION_V2.md §9, cut per the P0 task brief: no bug, jar,
// cave or golden art -- those mechanics are cut from M1 by
// MAYOR_RULING_V2.md Amendment 1). This is the complete list of texture
// keys the game may reference. `src/game/placeholders.js` fills every one
// with a coloured rectangle so the game boots before P2 lands real pixel
// maps; P2's `raster.js` later produces the real `{w, h, rgba}` art for
// the same keys.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.

/**
 * Lulu: 2 idle body frames x 4 mood faces, composited as separate layers
 * (body + a small face overlay) rather than 8 baked permutations, so P4
 * can swap mood without re-picking a whole-body frame.
 */
const LULU_KEYS = [
  'lulu_body_0',
  'lulu_body_1',
  'lulu_face_curious',
  'lulu_face_happy',
  'lulu_face_worried',
  'lulu_face_tired',
];

/** Finds: one 8x8 hue per species. Bug is cut in M1 (Amendment 1). */
const FIND_KEYS = ['find_mosscap', 'find_glowcap', 'find_reedling'];

/** Ground tiles, 24x24. */
const TILE_KEYS = ['tile_soil', 'tile_rock', 'tile_pond'];

/**
 * Legality-glow overlays for the drag gesture (VISION_V2.md §4: tiles glow
 * green/red under the finger). Not itemised in §9's art list but required
 * by the frozen game loop (§8 test hook's `view().hover`), so P0 adds it
 * here rather than leaving P4 to invent an ad hoc key.
 */
const GLOW_KEYS = ['tile_glow_ok', 'tile_glow_no'];

/**
 * Plants, 16x24, per species per stage (state.js freezes `stage: 0..3`,
 * i.e. 4 values) -- 3 base species + the 2 recipe results named in
 * VISION_V2.md §11 (lanternmoss, mirrorbloom). Golden is cut (Amendment 1).
 */
const PLANT_SPECIES = ['mosscap', 'glowcap', 'reedling', 'lanternmoss', 'mirrorbloom'];
const PLANT_STAGES = [0, 1, 2, 3];
const PLANT_KEYS = PLANT_SPECIES.flatMap((species) =>
  PLANT_STAGES.map((stage) => `plant_${species}_${stage}`),
);
/** One shared wilt look for any species (§9: "+ wilt", singular). */
const WILT_KEYS = ['plant_wilted'];

/** Compost heap, 3 fill levels (§9: "heap x3"). Jar/cave art is cut (Amendment 1). */
const HEAP_KEYS = ['heap_0', 'heap_1', 'heap_2'];

/** Scene furniture. */
const MISC_KEYS = ['lantern', 'particle'];

/** The complete, ordered list of every texture key the game may use. */
export const TEXTURE_KEYS = Object.freeze([
  ...LULU_KEYS,
  ...FIND_KEYS,
  ...TILE_KEYS,
  ...GLOW_KEYS,
  ...PLANT_KEYS,
  ...WILT_KEYS,
  ...HEAP_KEYS,
  ...MISC_KEYS,
]);

/** Grouped view, for callers that want a named subset instead of the flat list. */
export const TEXTURE_GROUPS = Object.freeze({
  lulu: Object.freeze(LULU_KEYS),
  finds: Object.freeze(FIND_KEYS),
  tiles: Object.freeze(TILE_KEYS),
  glow: Object.freeze(GLOW_KEYS),
  plants: Object.freeze(PLANT_KEYS),
  wilt: Object.freeze(WILT_KEYS),
  heap: Object.freeze(HEAP_KEYS),
  misc: Object.freeze(MISC_KEYS),
});

/** Nominal pixel-map sizes, before any engine upscale (VISION_V2.md §9). */
export const TEXTURE_SIZES = Object.freeze({
  lulu: { w: 16, h: 16 },
  find: { w: 8, h: 8 },
  tile: { w: 24, h: 24 },
  plant: { w: 16, h: 24 },
});

/** `plant_<species>_<stage>` -> the species name it renders. */
export function plantTextureKey(species, stage) {
  return `plant_${species}_${stage}`;
}
