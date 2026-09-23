// src/game/objects/compost.js
//
// Owned by P4. The compost heap: a plain drop target (VISION_V2.md §4/§10
// -- "not this one", a counter, nothing more in M1) with 3 fill-level
// textures (src/art/registry.js heap_0/1/2).

import { toViewport } from '../testhook.js';

const RAW_HEAP = 24; // src/art/registry.js TEXTURE_SIZES.tile (heap shares it)

/** state.compost (0..5) -> which of the 3 heap textures to show. */
function levelFor(compost) {
  return Math.min(2, Math.floor(compost / 2));
}

export function createCompost(scene, x, y, zoom, compost) {
  const TILE = RAW_HEAP * zoom;
  // Sprite renders at scale 1 -- zoom is baked into the texture pixels by
  // src/game/textures.js.
  const sprite = scene.add.sprite(x, y, `heap_${levelFor(compost)}`).setDepth(2);

  return {
    sprite,
    x,
    y,
    TILE,

    contains(px, py) {
      return Math.abs(px - x) <= TILE / 2 && Math.abs(py - y) <= TILE / 2;
    },

    setCompost(compostCount) {
      sprite.setTexture(`heap_${levelFor(compostCount)}`);
    },

    bounce() {
      scene.tweens.add({
        targets: sprite,
        scaleX: 1.15,
        scaleY: 0.85,
        duration: 90,
        yoyo: true,
        ease: 'Sine.easeOut',
        onComplete: () => sprite.setScale(1),
      });
    },

    describe() {
      return toViewport(scene, x, y);
    },
  };
}
