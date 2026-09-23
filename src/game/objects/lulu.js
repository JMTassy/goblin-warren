// src/game/objects/lulu.js
//
// Owned by P4. Lulu: body + face-overlay compositing (src/art/registry.js:
// 2 idle body frames x 4 mood faces, layered rather than 8 baked
// permutations), the idle "ears poke, ring pulses" invite when there's a
// find to offer, idle wander, and the hop/bighop/shrug reaction motion
// (via src/game/juice.js -- this file never invents its own tween shapes
// for those, it only decides *which* helper and *how far*).
//
// Body + face live inside one Container so every juice.js helper (which
// takes a single Game Object) moves both together -- no separate sync step
// that could let the face visibly lag the body mid-hop.

import * as juice from '../juice.js';

const RAW_LULU = 16; // src/art/registry.js TEXTURE_SIZES.lulu

export function createLulu(scene, x, y, zoom) {
  // Sprites render at scale 1 -- zoom is already baked into the texture
  // pixels by src/game/textures.js.
  const body = scene.add.sprite(0, 0, 'lulu_body_0').setOrigin(0.5, 0.5);
  const face = scene.add.sprite(0, 0, 'lulu_face_curious').setOrigin(0.5, 0.5);
  const node = scene.add.container(x, y, [body, face]).setDepth(3);
  node.setSize(RAW_LULU * zoom, RAW_LULU * zoom);

  // The "two green ears poke, a soft ring pulses" invite (VISION_V2.md §4's
  // 0s beat) -- a plain expanding ring, no text, shown only while there's
  // something to tap for.
  const ring = scene.add.circle(0, 0, (RAW_LULU * zoom) / 2, 0xa8d858, 0).setDepth(2).setVisible(false);
  ring.setPosition(x, y);
  scene.tweens.add({
    targets: ring,
    scale: { from: 1, to: 1.6 },
    alpha: { from: 0.35, to: 0 },
    duration: 1400,
    repeat: -1,
    ease: 'Sine.easeOut',
  });

  let baseX = x;
  let bounceFrame = 0;
  let idleTween = null;

  function startIdleWander() {
    stopIdleWander();
    idleTween = scene.tweens.add({
      targets: node,
      x: baseX + 5,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  function stopIdleWander() {
    if (idleTween) {
      idleTween.stop();
      idleTween = null;
      node.x = baseX;
    }
  }

  return {
    node,
    ring,

    get x() {
      return node.x;
    },
    get y() {
      return node.y;
    },

    setMood(mood) {
      face.setTexture(`lulu_face_${mood}`);
    },

    /** Alternate the two idle body frames -- a slow blink of life even at rest. */
    tickBob() {
      bounceFrame = bounceFrame ? 0 : 1;
      body.setTexture(`lulu_body_${bounceFrame}`);
    },

    setInvite(on) {
      ring.setPosition(node.x, node.y).setVisible(on);
    },

    startIdleWander,
    stopIdleWander,

    /** Move Lulu's resting spot toward a point (she "stays close" to a glow plant). */
    settleToward(x2, amount = 0.35) {
      stopIdleWander();
      baseX = baseX + (x2 - baseX) * amount;
      scene.tweens.add({ targets: node, x: baseX, duration: 260, ease: 'Sine.easeOut' });
      startIdleWander();
    },

    async hop(height) {
      stopIdleWander();
      await juice.hop(node, height);
      startIdleWander();
    },

    async wobble() {
      stopIdleWander();
      await juice.wobble(node);
      startIdleWander();
    },

    async pop() {
      await juice.pop(node);
    },
  };
}
