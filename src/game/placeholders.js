// src/game/placeholders.js
//
// Boots the game before real art (P2) and real audio (P3) exist:
//   - one coloured-rectangle texture per src/art/registry.js TEXTURE_KEYS
//   - one no-op function per src/audio/registry.js SFX_CUES
//
// This is engine code (imports Phaser), unlike src/art and src/core which
// stay pure. P5 deletes this file's *usage* once P2/P3 land -- the file
// itself can stay as a fallback/lab fixture if useful, but nothing in M1
// should depend on it existing forever.

import { TEXTURE_KEYS, TEXTURE_SIZES } from '../art/registry.js';
import { SFX_CUES } from '../audio/registry.js';

// A small, readable palette so different keys are visually distinguishable
// in the scaffold -- not final art, just "is this the right rectangle in
// the right place" during P0-P4's parallel work.
const PALETTE = [
  0x5c7a3a, // moss
  0xa8d858, // glow
  0xd08a3c, // ember
  0xe8dcc0, // bone
  0x8b6fc9, // dream
  0x3a6b7a, // pond-ish extra, kept distinct from the cast palette
  0xb85c5c, // warning-ish extra
];

function colorForKey(key, index) {
  return PALETTE[index % PALETTE.length];
}

function sizeForKey(key) {
  if (key.startsWith('lulu_')) return TEXTURE_SIZES.lulu;
  if (key.startsWith('find_')) return TEXTURE_SIZES.find;
  if (key.startsWith('tile_') || key.startsWith('heap_')) return TEXTURE_SIZES.tile;
  if (key.startsWith('plant_')) return TEXTURE_SIZES.plant;
  return { w: 16, h: 16 }; // lantern, particle, and anything future
}

/**
 * Generate one coloured-rectangle texture per TEXTURE_KEYS entry into the
 * given scene's texture manager. Call once, in create(), before anything
 * tries to render a sprite.
 *
 * @param {Phaser.Scene} scene
 */
export function buildPlaceholderTextures(scene) {
  const g = scene.add.graphics();
  TEXTURE_KEYS.forEach((key, i) => {
    if (scene.textures.exists(key)) return;
    const { w, h } = sizeForKey(key);
    g.clear();
    g.fillStyle(colorForKey(key, i), 1);
    g.fillRect(0, 0, w, h);
    // A 1px darker border so adjacent placeholder rects are distinguishable
    // even when the same colour repeats (palette is shorter than the key list).
    g.lineStyle(1, 0x000000, 0.25);
    g.strokeRect(0.5, 0.5, w - 1, h - 1);
    g.generateTexture(key, w, h);
  });
  g.destroy();
}

/**
 * A no-op sound cue table, keyed exactly like SFX_CUES, so P4's gameplay
 * code can call `sfx.hop()` etc. today and get real sound once P3 lands
 * src/audio/sfx.js with the same key set.
 *
 * @returns {Object.<string, () => void>}
 */
export function buildPlaceholderSfx() {
  const cues = {};
  for (const cue of SFX_CUES) {
    cues[cue] = () => {};
  }
  return cues;
}
