// src/game/juice.js
//
// Owned by P3 (VISION_V2.md §11, docs/INTERFACES.md §4). The motion
// helpers that make every touch feel answered -- built only on Phaser 4's
// tween API (docs/engine-notes/tweens/SKILL.md) plus plain sprites for
// burst()'s particles (no undocumented ParticleEmitter config).
//
// Every helper takes a live Game Object (or, for burst(), a Scene) and
// returns a Promise that resolves once its motion has finished. None of
// them import from src/core or src/art -- this is engine-facing, not pure
// -- and none of them are longer than ~400ms (VISION_V2.md §4's gestures
// read in one glance; nothing here should out-last the finger).
//
// A helper reads its target Scene off the Game Object itself (`obj.scene`,
// set by Phaser when the object is created), so callers only ever pass the
// object -- except burst(), which places new objects and so needs the
// Scene explicitly, matching docs/INTERFACES.md §4's frozen signatures.

/**
 * A find (or plant) grows into being: starts small, overshoots past full
 * size, settles exactly at scale 1. The overshoot is what "pop" is -- a
 * flat ease-in would read as decoration, not arrival.
 *
 * @param {Phaser.GameObjects.GameObject} obj
 * @returns {Promise<Phaser.GameObjects.GameObject>}
 */
export function pop(obj) {
  return new Promise((resolve) => {
    obj.setScale(0.35);
    obj.scene.tweens.add({
      targets: obj,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Back.easeOut',
      onComplete: () => resolve(obj),
    });
  });
}

/**
 * A little jump: up, then back down to exactly where it started (used for
 * Lulu's hop/bighop reactions -- `height` is what makes bighop bigger,
 * juice.js has no separate helper for it, per docs/INTERFACES.md §4).
 *
 * @param {Phaser.GameObjects.GameObject} obj
 * @param {number} [height] - px risen at the top of the hop.
 * @returns {Promise<Phaser.GameObjects.GameObject>}
 */
export function hop(obj, height = 24) {
  return new Promise((resolve) => {
    const startY = obj.y;
    obj.scene.tweens.chain({
      targets: obj,
      tweens: [
        { y: startY - height, duration: 140, ease: 'Sine.easeOut' },
        { y: startY, duration: 140, ease: 'Sine.easeIn' },
      ],
      onComplete: () => {
        obj.y = startY; // land exactly where it left, never a drifted float
        resolve(obj);
      },
    });
  });
}

/**
 * A quick side-to-side shake that decays back to the object's original
 * angle -- used for a shrug or a "that didn't work" beat that is felt, not
 * read as text.
 *
 * @param {Phaser.GameObjects.GameObject} obj
 * @returns {Promise<Phaser.GameObjects.GameObject>}
 */
export function wobble(obj) {
  return new Promise((resolve) => {
    const startAngle = obj.angle ?? 0;
    obj.scene.tweens.chain({
      targets: obj,
      tweens: [
        { angle: startAngle + 8, duration: 45, ease: 'Sine.easeInOut' },
        { angle: startAngle - 8, duration: 60, ease: 'Sine.easeInOut' },
        { angle: startAngle + 4, duration: 50, ease: 'Sine.easeInOut' },
        { angle: startAngle, duration: 45, ease: 'Sine.easeInOut' },
      ],
      onComplete: () => {
        obj.angle = startAngle;
        resolve(obj);
      },
    });
  });
}

/**
 * Snap back to a legal resting position with a springy overshoot -- used
 * when a drag is released over an illegal tile (VISION_V2.md §4: the
 * lantern only judges legality, the spring-back is the answer).
 *
 * @param {Phaser.GameObjects.GameObject} obj
 * @param {number} x
 * @param {number} y
 * @returns {Promise<Phaser.GameObjects.GameObject>}
 */
export function springBack(obj, x, y) {
  return new Promise((resolve) => {
    obj.scene.tweens.add({
      targets: obj,
      x,
      y,
      duration: 260,
      ease: 'Back.easeOut',
      onComplete: () => {
        obj.x = x; // exact, not just "close" -- Back can overshoot mid-tween
        obj.y = y;
        resolve(obj);
      },
    });
  });
}

/**
 * A small radial burst of particles at (x, y) -- used for sprout/thunk
 * moments (VISION_V2.md §4: "a sprout pops with a chime and three
 * particles"). Built from plain sprites on the 'particle' texture key
 * (src/art/registry.js), tweened outward and faded; no ParticleEmitter
 * config is relied on, since only the tween API is frozen by
 * docs/INTERFACES.md §4's interface line.
 *
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {number} [n] - number of particles.
 * @returns {Promise<void>}
 */
export function burst(scene, x, y, n = 8) {
  return new Promise((resolve) => {
    if (n <= 0) {
      resolve();
      return;
    }

    let remaining = n;
    for (let i = 0; i < n; i++) {
      const particle = scene.add.sprite(x, y, 'particle').setDepth(10).setScale(0.6).setAlpha(1);
      const angle = (i / n) * Math.PI * 2;
      const dist = 16 + (i % 3) * 6; // deterministic spread, no Math.random needed
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      scene.tweens.add({
        targets: particle,
        x: x + dx,
        y: y + dy,
        scale: 0,
        alpha: 0,
        duration: 320,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
          remaining -= 1;
          if (remaining === 0) resolve();
        },
      });
    }
  });
}
