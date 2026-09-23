// src/art/raster.js
//
// Turns a PIXELMAPS string array into the {w, h, rgba} shape the engine
// (and scripts/art-sheet.mjs) actually draws: a flat, row-major
// Uint8ClampedArray of w*h*4 bytes, one RGBA quad per pixel.
//
// PURE. No DOM, no engine import, no wall-clock read, no unseeded chance
// call -- test/core/purity.test.js checks src/art the same as src/core.

import { PIXELMAPS, textureSize } from './pixelmaps.js';
import { PALETTE_RGB, ALPHA, TRANSPARENT } from './palette.js';

/**
 * @param {string} key A src/art/registry.js TEXTURE_KEYS entry.
 * @returns {{ w: number, h: number, rgba: Uint8ClampedArray }}
 */
export function raster(key) {
  const rows = PIXELMAPS[key];
  if (!rows) throw new Error(`raster(): no pixel map for "${key}"`);

  const h = rows.length;
  const w = rows[0].length;
  const rgba = new Uint8ClampedArray(w * h * 4);

  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      const i = (y * w + x) * 4;
      if (ch === TRANSPARENT) {
        // rgba already zero-initialised: fully transparent black.
        continue;
      }
      const rgb = PALETTE_RGB[ch];
      if (!rgb) throw new Error(`raster(): "${key}" uses unknown palette letter "${ch}" at (${x},${y})`);
      rgba[i] = rgb[0];
      rgba[i + 1] = rgb[1];
      rgba[i + 2] = rgb[2];
      rgba[i + 3] = ch in ALPHA ? ALPHA[ch] : 255;
    }
  }

  return { w, h, rgba };
}

/** Re-exported for callers that want the nominal size without rastering. */
export { textureSize };
