// src/audio/registry.js
//
// FROZEN by P0 (VISION_V2.md §9, cut per the P0 task brief: no plink,
// chime_gold or wriggle -- those cues belong to the bug/jar/golden
// mechanics MAYOR_RULING_V2.md Amendment 1 moves to M2).
//
// PURE. No Date, no Math.random, no window, no document, no engine import.
// `src/audio/sfx.js` (P3) is the synth engine that gives each of these a
// real WebAudio envelope; `src/game/placeholders.js` (P0) gives every one
// a no-op so the game boots before P3 lands.

/**
 * Every sound cue the game may play. Order matches VISION_V2.md §9's list
 * with the M2-only cues removed.
 */
export const SFX_CUES = Object.freeze([
  'pop', // a find appears above Lulu's head
  'lift', // the find is picked up / starts being dragged
  'tile_ok', // hover over a legal tile
  'tile_no', // hover over an illegal tile
  'thunk', // the find lands on a tile
  'sprout', // a plant appears
  'burp', // dropped in the compost
  'snore', // Lulu falls asleep
  'purr', // petted
  'hop', // Lulu's reaction (also covers 'bighop' -- same cue, juice.hop() controls height)
]);
