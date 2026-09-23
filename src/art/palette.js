// src/art/palette.js
//
// The Warren's family palette (VISION_V2.md §9): every sprite is a string
// array whose characters are keys into this table. '.' always means
// transparent and is never a palette key -- it is handled by raster.js,
// not listed here.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine
// import (test/core/purity.test.js checks this literally).

/**
 * The seven family-cast colours named in VISION_V2.md §9, plus black and
 * white (also named there), each given a single-letter key so pixel maps
 * stay compact.
 */
const FAMILY = {
  m: '#5c7a3a', // moss
  g: '#a8d858', // glow
  e: '#d08a3c', // ember
  b: '#e8dcc0', // bone
  d: '#8b6fc9', // dream
  s: '#141c0e', // swamp (near-black; doubles as outline ink)
  k: '#000000', // black
  w: '#ffffff', // white
};

/**
 * A few extra shades the family palette doesn't cover: ground materials
 * (soil/rock/pond need their own hues so the three tiles read apart at a
 * glance) and light/dark variants of the family colours (so a round
 * goblin, a glowing cap or a compost heap can be shaded instead of flat).
 * Kept short on purpose -- every key here earns its place in more than
 * one sprite.
 */
const EXTRA = {
  h: '#7fa050', // moss highlight -- rim light on Lulu / mosscap tops
  o: '#4a3524', // soil, dark
  t: '#8a6a45', // soil, light/tan
  r: '#86867e', // rock, base grey
  v: '#a8a89e', // rock, light grey (chips / highlight)
  p: '#3a6b8a', // pond, base blue
  q: '#7fc4d8', // pond, foam / highlight
  l: '#f0b060', // ember highlight -- lantern glow, lanternmoss glow
  c: '#c9b8ec', // dream highlight -- mirrorbloom shine
  i: '#e8a8a0', // blush -- warm cheeks, kept for "cute, slightly absurd, warm"
};

/**
 * The legality-glow overlays (tile_glow_ok / tile_glow_no, VISION_V2.md §4
 * + docs/INTERFACES.md §2) need to read as a clear green/red wash while
 * still leaving the tile under them visible, so these four are given
 * partial alpha below instead of the usual opaque 255 -- a soft fill plus
 * a brighter rim, in each colour.
 */
const OVERLAY = {
  x: '#3ecb6e', // glow-ok fill
  X: '#3ecb6e', // glow-ok rim (same hue, brighter alpha)
  y: '#e5484d', // glow-no fill
  Y: '#e5484d', // glow-no rim (same hue, brighter alpha)
};

/** letter -> '#rrggbb'. '.' (transparent) is intentionally absent. */
export const PALETTE = Object.freeze({ ...FAMILY, ...EXTRA, ...OVERLAY });

/**
 * letter -> alpha (0..255). Absent means fully opaque (255) -- only the
 * glow overlay letters are ever partial, so raster.js can composite them
 * over a tile without hiding it.
 */
export const ALPHA = Object.freeze({
  x: 110,
  X: 205,
  y: 110,
  Y: 205,
});

/** The letter reserved to mean "no pixel here". Never a PALETTE key. */
export const TRANSPARENT = '.';

/** letter -> [r, g, b] (0..255), derived once from PALETTE's hex strings. */
export const PALETTE_RGB = Object.freeze(
  Object.fromEntries(
    Object.entries(PALETTE).map(([key, hex]) => [
      key,
      Object.freeze([
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ]),
    ]),
  ),
);
