// src/game/textures.js
//
// Replaces src/game/placeholders.js's `buildPlaceholderTextures` (deleted
// per VISION_V2.md §11 P4: "Replace src/game/placeholders.js with textures
// built from raster() and delete it."). Turns every P2 pixel map
// (src/art/pixelmaps.js, via src/art/raster.js) into a real Phaser
// texture, once per key, cached in the scene's texture manager exactly
// like the placeholder builder did (same call shape in create(), before
// anything tries to render a sprite).
//
// The whole-number zoom (VISION_V2.md §8 "Scale") is baked into the
// texture itself as a nearest-neighbour pixel replication -- each source
// pixel becomes a zoom x zoom flat-colour block -- rather than left to
// sprite.setScale(zoom) at render time. Two reasons: (1) it is the literal
// "nearest-neighbour upscale" technique VISION_V2.md §9 names, done once
// on the CPU instead of leaning on `pixelArt: true`'s GPU-side texture
// filtering every frame; (2) src/game/juice.js's helpers (owned by P3, not
// editable here) assume a resting scale of exactly 1 (`pop()` tweens
// scaleX/scaleY to 1, `springBack()` doesn't touch scale at all) -- baking
// zoom into the texture keeps every sprite's resting scale at 1, so juice
// helpers work unmodified instead of needing a "scale to zoom, not to 1"
// variant that doesn't exist in the frozen interface.
//
// Engine code (touches the DOM canvas + Phaser's TextureManager), unlike
// src/art which stays pure -- raster() itself is still the pure part; this
// file only uploads its (upscaled) output.

import { TEXTURE_KEYS } from '../art/registry.js';
import { raster } from '../art/raster.js';

/**
 * Generate one real, zoom-upscaled texture per TEXTURE_KEYS entry into the
 * given scene's texture manager, from P2's pixel maps. Call once, in
 * create(), before anything tries to render a sprite, and before any
 * sprite is created against these keys (their resting scale is 1).
 *
 * @param {Phaser.Scene} scene
 * @param {number} zoom - whole-number scale (3 or 4, per VISION_V2.md §8).
 */
export function buildTextures(scene, zoom) {
  for (const key of TEXTURE_KEYS) {
    if (scene.textures.exists(key)) continue;
    const { w, h, rgba } = raster(key);
    const canvas = document.createElement('canvas');
    canvas.width = w * zoom;
    canvas.height = h * zoom;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const a = rgba[i + 3];
        if (a === 0) continue;
        ctx.fillStyle = `rgba(${rgba[i]},${rgba[i + 1]},${rgba[i + 2]},${a / 255})`;
        ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
      }
    }
    scene.textures.addCanvas(key, canvas);
  }
}
