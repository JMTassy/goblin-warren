// test/core/art.test.js
//
// Every src/art/registry.js TEXTURE_KEYS entry must have a pixel map that
// is rectangular, the right size, and drawn only with palette letters (or
// '.'); raster() must turn each into real, visibly non-blank RGBA bytes;
// and Lulu's four moods must actually look different from each other,
// since the face is the only feedback the player gets.

import { describe, expect, test } from 'vitest';
import { TEXTURE_KEYS, TEXTURE_SIZES, TEXTURE_GROUPS } from '../../src/art/registry.js';
import { PIXELMAPS, textureSize } from '../../src/art/pixelmaps.js';
import { PALETTE } from '../../src/art/palette.js';
import { raster } from '../../src/art/raster.js';

const VALID_CHARS = new Set([...Object.keys(PALETTE), '.']);

describe('pixel maps cover the frozen registry', () => {
  test('every TEXTURE_KEYS entry has a pixel map', () => {
    for (const key of TEXTURE_KEYS) {
      expect(PIXELMAPS[key], `missing pixel map for "${key}"`).toBeDefined();
    }
  });

  test('PIXELMAPS has no keys outside TEXTURE_KEYS', () => {
    const known = new Set(TEXTURE_KEYS);
    for (const key of Object.keys(PIXELMAPS)) {
      expect(known.has(key), `"${key}" is not a registered TEXTURE_KEYS entry`).toBe(true);
    }
  });

  for (const key of TEXTURE_KEYS) {
    describe(key, () => {
      const rows = PIXELMAPS[key];
      const expected = textureSize(key);

      test('is rectangular', () => {
        const width = rows[0].length;
        for (const row of rows) expect(row.length).toBe(width);
      });

      test(`matches its expected size (${expected.w}x${expected.h})`, () => {
        expect(rows.length).toBe(expected.h);
        expect(rows[0].length).toBe(expected.w);
      });

      test('uses only palette letters or "."', () => {
        for (const row of rows) {
          for (const ch of row) {
            expect(VALID_CHARS.has(ch), `"${key}" uses unknown character "${ch}"`).toBe(true);
          }
        }
      });
    });
  }
});

describe('registry TEXTURE_SIZES sanity (P2 view of the frozen contract)', () => {
  test('lulu keys are all 16x16', () => {
    for (const key of TEXTURE_GROUPS.lulu) {
      expect(textureSize(key)).toEqual(TEXTURE_SIZES.lulu);
    }
  });
  test('find keys are all 8x8', () => {
    for (const key of TEXTURE_GROUPS.finds) {
      expect(textureSize(key)).toEqual(TEXTURE_SIZES.find);
    }
  });
  test('tile keys are all 24x24', () => {
    for (const key of TEXTURE_GROUPS.tiles) {
      expect(textureSize(key)).toEqual(TEXTURE_SIZES.tile);
    }
  });
  test('plant keys are all 16x24', () => {
    for (const key of TEXTURE_GROUPS.plants) {
      expect(textureSize(key)).toEqual(TEXTURE_SIZES.plant);
    }
  });
});

describe('raster()', () => {
  test('returns w*h*4 bytes for every key, sized per its texture group', () => {
    for (const key of TEXTURE_KEYS) {
      const { w, h, rgba } = raster(key);
      const expected = textureSize(key);
      expect(w).toBe(expected.w);
      expect(h).toBe(expected.h);
      expect(rgba.length).toBe(w * h * 4);
    }
  });

  test('every sprite has at least 2 distinct colours', () => {
    for (const key of TEXTURE_KEYS) {
      const { rgba } = raster(key);
      const colours = new Set();
      for (let i = 0; i < rgba.length; i += 4) {
        colours.add(`${rgba[i]},${rgba[i + 1]},${rgba[i + 2]},${rgba[i + 3]}`);
      }
      expect(colours.size, `"${key}" renders as a single flat colour`).toBeGreaterThanOrEqual(2);
    }
  });

  test('unknown key throws instead of returning garbage', () => {
    expect(() => raster('not_a_real_key')).toThrow();
  });

  test('legality glow overlays leave the tile visible (partial alpha, not opaque)', () => {
    for (const key of ['tile_glow_ok', 'tile_glow_no']) {
      const { rgba } = raster(key);
      let sawPartialAlpha = false;
      for (let i = 3; i < rgba.length; i += 4) {
        const a = rgba[i];
        if (a > 0 && a < 255) sawPartialAlpha = true;
        expect(a, `"${key}" pixel alpha must never exceed 255`).toBeLessThanOrEqual(255);
      }
      expect(sawPartialAlpha, `"${key}" has no translucent pixels`).toBe(true);
    }
  });

  test('tile_glow_ok reads green and tile_glow_no reads red', () => {
    const ok = raster('tile_glow_ok');
    const no = raster('tile_glow_no');
    // Sum channel weight over all non-transparent pixels; ok should skew
    // green (G > R), no should skew red (R > G).
    const sums = (rgba) => {
      let r = 0;
      let g = 0;
      for (let i = 0; i < rgba.length; i += 4) {
        if (rgba[i + 3] === 0) continue;
        r += rgba[i];
        g += rgba[i + 1];
      }
      return { r, g };
    };
    const okSums = sums(ok.rgba);
    const noSums = sums(no.rgba);
    expect(okSums.g).toBeGreaterThan(okSums.r);
    expect(noSums.r).toBeGreaterThan(noSums.g);
  });
});

describe("Lulu's four faces", () => {
  const moods = ['curious', 'happy', 'worried', 'tired'];

  test('every mood differs from every other mood', () => {
    for (let i = 0; i < moods.length; i++) {
      for (let j = i + 1; j < moods.length; j++) {
        const a = PIXELMAPS[`lulu_face_${moods[i]}`];
        const b = PIXELMAPS[`lulu_face_${moods[j]}`];
        expect(a.join('\n'), `${moods[i]} vs ${moods[j]}`).not.toBe(b.join('\n'));
      }
    }
  });

  test('every mood draws at least a few pixels (not a blank overlay)', () => {
    for (const mood of moods) {
      const rows = PIXELMAPS[`lulu_face_${mood}`];
      const painted = rows.join('').split('').filter((ch) => ch !== '.').length;
      expect(painted, `lulu_face_${mood} looks blank`).toBeGreaterThan(2);
    }
  });

  test('the two idle body frames differ (the idle bob)', () => {
    const a = PIXELMAPS.lulu_body_0;
    const b = PIXELMAPS.lulu_body_1;
    expect(a.join('\n')).not.toBe(b.join('\n'));
  });
});

describe('plant growth stages get visibly bigger', () => {
  const species = ['mosscap', 'glowcap', 'reedling', 'lanternmoss', 'mirrorbloom'];

  function paintedPixelCount(key) {
    return PIXELMAPS[key].join('').split('').filter((ch) => ch !== '.').length;
  }

  for (const s of species) {
    test(`${s}: stage 3 has more painted pixels than stage 0`, () => {
      const stage0 = paintedPixelCount(`plant_${s}_0`);
      const stage3 = paintedPixelCount(`plant_${s}_3`);
      expect(stage3).toBeGreaterThan(stage0);
    });

    test(`${s}: all 4 stages are distinct pixel maps`, () => {
      const seen = new Set();
      for (let stage = 0; stage < 4; stage++) {
        seen.add(PIXELMAPS[`plant_${s}_${stage}`].join('\n'));
      }
      expect(seen.size).toBe(4);
    });
  }

  test('plant_wilted differs from every species’ every stage', () => {
    const wilted = PIXELMAPS.plant_wilted.join('\n');
    for (const s of species) {
      for (let stage = 0; stage < 4; stage++) {
        expect(wilted).not.toBe(PIXELMAPS[`plant_${s}_${stage}`].join('\n'));
      }
    }
  });
});

describe('heap levels get visibly bigger', () => {
  test('heap_0 < heap_1 < heap_2 in painted pixel count', () => {
    const count = (key) => PIXELMAPS[key].join('').split('').filter((ch) => ch !== '.').length;
    expect(count('heap_1')).toBeGreaterThan(count('heap_0'));
    expect(count('heap_2')).toBeGreaterThan(count('heap_1'));
  });
});

describe('finds are three distinct hues', () => {
  test('mosscap, glowcap, reedling do not share a dominant palette letter', () => {
    function dominant(key) {
      const counts = {};
      for (const row of PIXELMAPS[key]) {
        for (const ch of row) {
          if (ch === '.') continue;
          counts[ch] = (counts[ch] || 0) + 1;
        }
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }
    const hues = ['find_mosscap', 'find_glowcap', 'find_reedling'].map(dominant);
    expect(new Set(hues).size).toBe(3);
  });
});
