// src/art/pixelmaps.js
//
// One pixel map per src/art/registry.js TEXTURE_KEYS entry. Each map is a
// rectangular array of equal-length strings, sized per TEXTURE_SIZES (or,
// for the groups TEXTURE_SIZES doesn't name -- glow, heap, misc -- the
// size documented next to that group below), using only src/art/palette.js
// letters plus '.' for transparent.
//
// "Pixel maps in code" (VISION_V2.md §9): rather than typing every sprite
// out as literal ASCII, small canvas-style helpers (fillCircle, fillRect,
// mirrored triangles, an outline pass...) build each grid from a few
// parameters. This keeps every sprite in a family consistent (same hand,
// different palette) and keeps growth stages honestly proportioned. The
// helpers are plain arithmetic -- no unseeded chance call, no wall-clock
// read, no engine import -- so this stays as pure and as deterministic as a hand-typed
// string array would be.
//
// PURE. Enforced by test/core/purity.test.js alongside src/core.

import { TEXTURE_KEYS, TEXTURE_SIZES, plantTextureKey } from './registry.js';
import { TRANSPARENT } from './palette.js';

// --- tiny canvas ------------------------------------------------------

function grid(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(TRANSPARENT));
}

function setPx(g, x, y, ch) {
  const h = g.length;
  const w = g[0].length;
  x = Math.round(x);
  y = Math.round(y);
  if (x >= 0 && x < w && y >= 0 && y < h) g[y][x] = ch;
}

function fillRect(g, x0, y0, x1, y1, ch) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) setPx(g, x, y, ch);
  }
}

function fillCircle(g, cx, cy, r, ch) {
  const r2 = r * r;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) setPx(g, x, y, ch);
    }
  }
}

/** Upward-pointing triangle: apex at (xTip, yTip), base `2*halfBase+1` wide `height` rows down. */
function fillTriangleDown(g, xTip, yTip, halfBase, height, ch) {
  for (let row = 0; row <= height; row++) {
    const y = yTip + row;
    const hw = height === 0 ? halfBase : (row / height) * halfBase;
    for (let x = Math.round(xTip - hw); x <= Math.round(xTip + hw); x++) setPx(g, x, y, ch);
  }
}

function stamp(dest, src, ox, oy) {
  for (let y = 0; y < src.length; y++) {
    for (let x = 0; x < src[0].length; x++) {
      const ch = src[y][x];
      if (ch !== TRANSPARENT) setPx(dest, ox + x, oy + y, ch);
    }
  }
}

/** Dark rim around any filled pixel touching transparent, so small sprites pop off the ground. */
function addOutline(g, outlineCh = 's') {
  const h = g.length;
  const w = g[0].length;
  const occupied = g.map((row) => row.map((ch) => ch !== TRANSPARENT));
  const out = grid(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (occupied[y][x]) continue;
      const touches =
        (x > 0 && occupied[y][x - 1]) ||
        (x < w - 1 && occupied[y][x + 1]) ||
        (y > 0 && occupied[y - 1][x]) ||
        (y < h - 1 && occupied[y + 1][x]);
      if (touches) out[y][x] = outlineCh;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (out[y][x] !== TRANSPARENT) g[y][x] = out[y][x];
    }
  }
}

function toRows(g) {
  return Object.freeze(g.map((row) => row.join('')));
}

// --- Lulu (16x16): body + face overlay, composited by the caller ------
// (VISION_V2.md §9 + registry.js doc comment: 2 idle body frames, 4 mood
// faces, so mood can change without re-picking a whole body frame.)

function luluBody(bounce) {
  const g = grid(16, 16);
  const lift = bounce ? 1 : 0; // frame 1 hops up a pixel -- the idle bob

  // Ears first (drawn under the head so the head's round line covers their base).
  fillTriangleDown(g, 3, 2 - lift, 2, 4, 'm');
  fillTriangleDown(g, 12, 2 - lift, 2, 4, 'm');
  setPx(g, 3, 2 - lift, 'h');
  setPx(g, 12, 2 - lift, 'h');

  // Round body/head (one blob -- Lulu reads as small and round, not
  // head-plus-torso at this size).
  fillCircle(g, 7.5, 9.5 - lift, 6, 'm');

  // Rim highlight, upper-left -- gives the blob some roundness without
  // extra colours. Kept well inside the silhouette so it never breaks it.
  fillCircle(g, 5.5, 7 - lift, 1.9, 'h');

  // Cheeks -- warm blush, kept low so it never collides with the face overlay's eyes.
  setPx(g, 3, 10 - lift, 'i');
  setPx(g, 12, 10 - lift, 'i');

  // Little feet, planted (no lift -- they read as ground contact).
  fillRect(g, 4, 14, 6, 15, 'm');
  fillRect(g, 9, 14, 11, 15, 'm');
  fillRect(g, 4, 15, 6, 15, 's');
  fillRect(g, 9, 15, 11, 15, 's');

  // Arms: down at the sides for frame 0; both thrown up for frame 1 --
  // a clearly different silhouette at a glance, not just a 1px nudge.
  if (bounce) {
    fillRect(g, 0, 3, 1, 7, 'm');
    fillRect(g, 14, 3, 15, 7, 'm');
    setPx(g, 0, 3, 'h');
    setPx(g, 15, 3, 'h');
  } else {
    fillRect(g, 1, 9, 2, 11, 'm');
    fillRect(g, 13, 9, 14, 11, 'm');
  }

  addOutline(g);
  return toRows(g);
}

/** Eye sockets shared by every mood, so faces line up on top of either body frame. */
const EYE_L = { x: 5, y: 8 };
const EYE_R = { x: 10, y: 8 };

function luluFaceCurious() {
  const g = grid(16, 16);
  for (const eye of [EYE_L, EYE_R]) {
    fillCircle(g, eye.x, eye.y, 1.8, 'w');
    setPx(g, eye.x, eye.y, 'k');
    setPx(g, eye.x + 1, eye.y - 1, 'k');
  }
  // One eyebrow raised -- the asymmetry reads as "curious?"
  setPx(g, 3, 5, 's');
  setPx(g, 4, 5, 's');
  setPx(g, 11, 6, 's');
  setPx(g, 12, 6, 's');
  // Small round "o" mouth.
  setPx(g, 7, 12, 's');
  setPx(g, 8, 12, 's');
  return toRows(g);
}

function luluFaceHappy() {
  const g = grid(16, 16);
  // Eyes as upward, closed-happy crescents.
  for (const eye of [EYE_L, EYE_R]) {
    setPx(g, eye.x - 1, eye.y, 'k');
    setPx(g, eye.x, eye.y - 1, 'k');
    setPx(g, eye.x + 1, eye.y, 'k');
  }
  // Wide grin.
  fillRect(g, 5, 12, 10, 12, 's');
  setPx(g, 4, 11, 's');
  setPx(g, 11, 11, 's');
  return toRows(g);
}

function luluFaceWorried() {
  const g = grid(16, 16);
  for (const eye of [EYE_L, EYE_R]) {
    fillCircle(g, eye.x, eye.y + 0.5, 1.6, 'w');
    setPx(g, eye.x, eye.y + 1, 'k');
  }
  // Brows angled in -- a worried "V".
  setPx(g, 4, 5, 's');
  setPx(g, 5, 6, 's');
  setPx(g, 11, 6, 's');
  setPx(g, 10, 5, 's');
  // Small down-turned mouth.
  setPx(g, 6, 12, 's');
  setPx(g, 7, 13, 's');
  setPx(g, 8, 13, 's');
  setPx(g, 9, 12, 's');
  return toRows(g);
}

function luluFaceTired() {
  const g = grid(16, 16);
  // Half-closed lids: a flat lash line over a sliver of eye.
  for (const eye of [EYE_L, EYE_R]) {
    fillRect(g, eye.x - 1, eye.y, eye.x + 1, eye.y, 'w');
    fillRect(g, eye.x - 1, eye.y - 1, eye.x + 1, eye.y - 1, 's');
  }
  // Drooping brow.
  setPx(g, 4, 6, 's');
  setPx(g, 11, 6, 's');
  // Flat, small mouth.
  fillRect(g, 7, 12, 9, 12, 's');
  return toRows(g);
}

// --- Finds (8x8): one hue, one silhouette, per species -----------------

function findMosscap() {
  const g = grid(8, 8);
  fillCircle(g, 3.5, 4.2, 3, 'm');
  fillCircle(g, 2.6, 3, 1.1, 'h');
  addOutline(g);
  return toRows(g);
}

function findGlowcap() {
  const g = grid(8, 8);
  // Mushroom silhouette: overhanging cap + stem, distinct from mosscap's ball.
  fillCircle(g, 3.5, 3, 3, 'g');
  fillRect(g, 3, 5, 4, 6, 'b');
  setPx(g, 3, 3, 'b'); // glow fleck, off-centre so the cap doesn't read as flat
  addOutline(g);
  return toRows(g);
}

function findReedling() {
  const g = grid(8, 8);
  // Tall narrow blade cluster -- a vertical silhouette, unlike the two round finds.
  fillRect(g, 3, 1, 4, 6, 'p');
  fillRect(g, 1, 3, 2, 7, 'p');
  fillRect(g, 5, 2, 6, 7, 'p');
  setPx(g, 3, 1, 'q');
  setPx(g, 1, 3, 'q');
  setPx(g, 6, 2, 'q');
  addOutline(g);
  return toRows(g);
}

// --- Tiles (24x24): soil / rock / pond ----------------------------------

/** Deterministic speckle test -- arithmetic only, never an unseeded chance call. */
function speck(x, y, mod, under) {
  return (x * 7 + y * 13 + x * y) % mod < under;
}

function tileSoil() {
  const g = grid(24, 24);
  fillRect(g, 0, 0, 23, 23, 'o');
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 24; x++) {
      if (speck(x, y, 11, 2)) setPx(g, x, y, 't');
      else if (speck(x, y, 23, 1)) setPx(g, x, y, 's');
    }
  }
  return toRows(g);
}

function tileRock() {
  const g = grid(24, 24);
  fillRect(g, 0, 0, 23, 23, 'r');
  // A few blocky facets (a slab, not a smooth boulder), upper-left light source.
  fillRect(g, 2, 2, 9, 5, 'v');
  fillRect(g, 12, 3, 16, 6, 'v');
  fillRect(g, 3, 14, 8, 17, 'v');
  fillRect(g, 15, 15, 20, 18, 'v');
  // Mortar-line cracks between facets -- short and separate, not one
  // diagonal slash across the whole tile.
  fillRect(g, 0, 8, 23, 8, 's');
  fillRect(g, 10, 0, 10, 8, 's');
  fillRect(g, 0, 19, 23, 19, 's');
  fillRect(g, 17, 9, 17, 19, 's');
  // Speckled grain, deterministic (same trick as tile_soil).
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 24; x++) {
      if (g[y][x] === 'r' && speck(x, y, 17, 1)) setPx(g, x, y, 'v');
    }
  }
  return toRows(g);
}

function tilePond() {
  const g = grid(24, 24);
  fillRect(g, 0, 0, 23, 23, 'p');
  for (let y = 2; y < 24; y += 5) {
    for (let x = 0; x < 24; x++) {
      if (speck(x, y, 5, 3)) setPx(g, x, y, 'q');
    }
  }
  fillRect(g, 0, 0, 23, 1, 'q');
  return toRows(g);
}

// --- Legality glow overlays (24x24): fill + brighter ring --------------
// x/X = ok (green), y/Y = no (red); raster.js gives these letters partial
// alpha so the tile underneath still shows through.

function glowOverlay(fillCh, ringCh) {
  const g = grid(24, 24);
  fillRect(g, 1, 1, 22, 22, fillCh);
  fillRect(g, 0, 0, 23, 1, ringCh);
  fillRect(g, 0, 22, 23, 23, ringCh);
  fillRect(g, 0, 0, 1, 23, ringCh);
  fillRect(g, 22, 0, 23, 23, ringCh);
  return toRows(g);
}

// --- Plants (16x24): 5 species x 4 stages, anchored at the base --------

const BASE_Y = 22; // where every plant meets the ground, regardless of stage

function moscapPlant(stage) {
  const g = grid(16, 24);
  const sizes = [1.3, 1.9, 2.8, 3.8];
  const r = sizes[stage];
  const cy = BASE_Y - r * 0.9;
  if (stage > 0) fillRect(g, 8, cy + r * 0.6, 8, BASE_Y, 's');
  fillCircle(g, 8, cy, r, 'm');
  if (stage >= 2) fillCircle(g, 8 - r * 0.5, cy - r * 0.4, r * 0.8, 'm');
  if (stage >= 3) fillCircle(g, 8 + r * 0.5, cy - r * 0.4, r * 0.8, 'm');
  fillCircle(g, 8 - r * 0.3, cy - r * 0.35, r * 0.35, 'h');
  addOutline(g);
  return toRows(g);
}

function glowcapPlant(stage) {
  const g = grid(16, 24);
  const stemH = [1, 4, 8, 12][stage];
  const capR = [0.9, 1.6, 2.4, 3.3][stage];
  const stemTop = BASE_Y - stemH;
  if (stemH > 0) fillRect(g, 7, stemTop, 8, BASE_Y, 'b');
  fillCircle(g, 7.5, stemTop, capR, 'g');
  // Mushroom overhang: a cap wider than it is tall, clipped to the cap's
  // own footprint (not the whole canvas) so small stages stay small.
  fillRect(g, 7.5 - capR * 1.3, stemTop - capR * 0.15, 7.5 + capR * 1.3, stemTop + capR * 0.35, 'g');
  fillCircle(g, 7.5, stemTop, capR, 'g');
  setPx(g, 7, stemTop, 'b');
  setPx(g, 8, stemTop, 'b');
  if (stage >= 2) {
    setPx(g, 7.5 - capR * 0.6, stemTop - capR * 0.2, 'b');
    setPx(g, 7.5 + capR * 0.6, stemTop - capR * 0.2, 'b');
  }
  if (stage >= 3) {
    setPx(g, 4, stemTop - capR - 1, 'g');
    setPx(g, 11, stemTop - capR - 1, 'g');
  }
  addOutline(g);
  return toRows(g);
}

function reedlingPlant(stage) {
  const g = grid(16, 24);
  const blades = [
    [{ x: 8, h: 4 }],
    [
      { x: 6, h: 5 },
      { x: 9, h: 6 },
    ],
    [
      { x: 4, h: 8 },
      { x: 7, h: 10 },
      { x: 10, h: 9 },
      { x: 12, h: 6 },
    ],
    [
      { x: 3, h: 12 },
      { x: 6, h: 16 },
      { x: 9, h: 15 },
      { x: 12, h: 12 },
      { x: 8, h: 9 },
    ],
  ][stage];
  for (const b of blades) {
    fillRect(g, b.x, BASE_Y - b.h, b.x, BASE_Y, 'p');
    setPx(g, b.x, BASE_Y - b.h, 'q');
    if (b.h > 6) setPx(g, b.x, BASE_Y - b.h + 2, 'q');
  }
  addOutline(g);
  return toRows(g);
}

function lanternmossPlant(stage) {
  const g = grid(16, 24);
  const stemH = [1, 4, 8, 12][stage];
  const bulbR = [0.8, 1.4, 2.1, 2.8][stage];
  const stemTop = BASE_Y - stemH;
  if (stemH > 0) fillRect(g, 7, stemTop, 8, BASE_Y, 'm');
  fillCircle(g, 7.5, stemTop, bulbR, 'e');
  fillCircle(g, 7.5, stemTop, bulbR * 0.5, 'l');
  if (stage >= 2) {
    setPx(g, 7.5 - bulbR - 1, stemTop, 'l');
    setPx(g, 7.5 + bulbR + 1, stemTop, 'l');
  }
  if (stage >= 3) {
    setPx(g, 7.5, stemTop - bulbR - 1, 'b');
    setPx(g, 4, stemTop - 1, 'b');
    setPx(g, 11, stemTop - 1, 'b');
  }
  addOutline(g);
  return toRows(g);
}

function mirrorbloomPlant(stage) {
  const g = grid(16, 24);
  const stemH = [1, 4, 7, 10][stage];
  const petalR = [0.8, 1.4, 2.2, 3.1][stage];
  const stemTop = BASE_Y - stemH;
  if (stemH > 0) fillRect(g, 7, stemTop, 8, BASE_Y, 'm');
  fillCircle(g, 7.5, stemTop, petalR, 'd');
  fillCircle(g, 7.5, stemTop, petalR * 0.5, 'c');
  if (stage >= 2) {
    fillCircle(g, 7.5 - petalR * 0.8, stemTop, petalR * 0.55, 'd');
    fillCircle(g, 7.5 + petalR * 0.8, stemTop, petalR * 0.55, 'd');
  }
  setPx(g, 7.5, stemTop - petalR * 0.3, 'w');
  if (stage >= 3) {
    fillCircle(g, 7.5, stemTop - petalR * 0.7, petalR * 0.5, 'd');
    setPx(g, 7, stemTop - petalR, 'w');
  }
  addOutline(g);
  return toRows(g);
}

function plantWilted() {
  const g = grid(16, 24);
  // A single, dull, drooping stem bent to one side -- unmistakably not
  // any healthy stage of any species.
  fillRect(g, 7, 16, 8, BASE_Y, 'o');
  fillRect(g, 8, 13, 10, 16, 'o');
  fillCircle(g, 11, 13, 2, 'r');
  fillCircle(g, 11, 13, 2, 'r');
  setPx(g, 9, 12, 'o');
  setPx(g, 12, 14, 'o');
  addOutline(g);
  return toRows(g);
}

// --- Compost heap (24x24), 3 fill levels --------------------------------

function heap(level) {
  const g = grid(24, 24);
  const widths = [8, 12, 17];
  const heights = [4, 7, 11];
  const w = widths[level];
  const h = heights[level];
  const cx = 12;
  const baseY = 22;
  for (let row = 0; row < h; row++) {
    const t = row / h;
    // Dome cross-section (not a linear cone) so the pile reads as a mound.
    const rowW = w * Math.sqrt(Math.max(0, 1 - t * t));
    fillRect(g, cx - rowW / 2, baseY - row, cx + rowW / 2, baseY - row, row < h * 0.4 ? 'o' : 't');
  }
  // A leaf/twig fleck for character at every level.
  setPx(g, cx - w * 0.2, baseY - h * 0.6, 'm');
  if (level >= 1) setPx(g, cx + w * 0.25, baseY - h * 0.5, 'm');
  if (level >= 2) {
    setPx(g, cx, baseY - h - 1, 'g');
    setPx(g, cx - w * 0.3, baseY - h * 0.8, 'm');
  }
  addOutline(g);
  return toRows(g);
}

// --- Misc (16x16): lantern, particle ------------------------------------

function lantern() {
  const g = grid(16, 16);
  fillRect(g, 7, 0, 8, 2, 's'); // hook
  fillRect(g, 5, 3, 10, 4, 'e'); // cap
  fillRect(g, 4, 5, 11, 12, 'o'); // frame
  fillRect(g, 5, 6, 10, 11, 'l'); // glass
  fillCircle(g, 7.5, 8.5, 2.2, 'b'); // glow
  fillCircle(g, 7.5, 8.5, 1.1, 'w'); // flame core
  fillRect(g, 5, 13, 10, 14, 'e'); // base
  addOutline(g);
  return toRows(g);
}

function particle() {
  const g = grid(16, 16);
  // A small sparkle: a plus of bright pixels with a soft glow ring.
  setPx(g, 8, 8, 'w');
  setPx(g, 7, 8, 'b');
  setPx(g, 9, 8, 'b');
  setPx(g, 8, 7, 'b');
  setPx(g, 8, 9, 'b');
  setPx(g, 6, 8, 'g');
  setPx(g, 10, 8, 'g');
  setPx(g, 8, 6, 'g');
  setPx(g, 8, 10, 'g');
  setPx(g, 6, 6, 'g');
  setPx(g, 10, 10, 'g');
  return toRows(g);
}

// --- Assemble --------------------------------------------------------

const PLANT_BUILDERS = {
  mosscap: moscapPlant,
  glowcap: glowcapPlant,
  reedling: reedlingPlant,
  lanternmoss: lanternmossPlant,
  mirrorbloom: mirrorbloomPlant,
};

const RAW = {
  lulu_body_0: luluBody(false),
  lulu_body_1: luluBody(true),
  lulu_face_curious: luluFaceCurious(),
  lulu_face_happy: luluFaceHappy(),
  lulu_face_worried: luluFaceWorried(),
  lulu_face_tired: luluFaceTired(),

  find_mosscap: findMosscap(),
  find_glowcap: findGlowcap(),
  find_reedling: findReedling(),

  tile_soil: tileSoil(),
  tile_rock: tileRock(),
  tile_pond: tilePond(),

  tile_glow_ok: glowOverlay('x', 'X'),
  tile_glow_no: glowOverlay('y', 'Y'),

  plant_wilted: plantWilted(),

  heap_0: heap(0),
  heap_1: heap(1),
  heap_2: heap(2),

  lantern: lantern(),
  particle: particle(),
};

for (const [species, build] of Object.entries(PLANT_BUILDERS)) {
  for (let stage = 0; stage < 4; stage++) {
    RAW[plantTextureKey(species, stage)] = build(stage);
  }
}

// Sanity: every registry key has a map, and nothing extra snuck in --
// test/core/art.test.js re-checks this, but failing loudly at import time
// makes a missing sprite impossible to miss during development.
for (const key of TEXTURE_KEYS) {
  if (!RAW[key]) throw new Error(`pixelmaps.js: missing pixel map for "${key}"`);
}

/** key (TEXTURE_KEYS entry) -> string[] rows of palette letters (or '.'). */
export const PIXELMAPS = Object.freeze(RAW);

/**
 * The expected {w, h} for a texture key. TEXTURE_SIZES only names
 * lulu/find/tile/plant; glow overlays share the tile size (they're drawn
 * over a tile) and heap shares it too (a heap occupies a tile). Misc
 * (lantern, particle) fall back to a 16x16 icon size, same as
 * src/game/placeholders.js's fallback, so nothing downstream has to
 * special-case them.
 */
export function textureSize(key) {
  if (key.startsWith('lulu_')) return TEXTURE_SIZES.lulu;
  if (key.startsWith('find_')) return TEXTURE_SIZES.find;
  if (key.startsWith('tile_') || key.startsWith('heap_')) return TEXTURE_SIZES.tile;
  if (key.startsWith('plant_')) return TEXTURE_SIZES.plant;
  return { w: 16, h: 16 };
}
