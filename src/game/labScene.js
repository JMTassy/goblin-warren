// src/game/labScene.js
//
// Owned by P3 (VISION_V2.md §11). A test scene -- not part of the M1 game
// loop -- that shows one placeholder object and, under `?test=1`, exposes
// `window.__gwJuice` so Playwright can trigger every SFX cue and every
// juice.js helper on it and read back its scale/position. Booted by
// src/main.js when the URL has `?scene=lab` (P3's one allowed edit there).
//
// This is a separate hook from `window.__gw` (src/game/testhook.js, frozen
// by P0 for the real gameplay scene's state/ledger/tiles shape) -- LabScene
// has no State or Ledger to report, only audio+motion, so it gets its own
// namespace rather than bending the frozen one.

import Phaser from 'phaser';
import { SFX_CUES } from '../audio/registry.js';
import * as sfx from '../audio/sfx.js';
import * as juice from './juice.js';
// src/game/placeholders.js was deleted once real art (P2/raster.js) landed
// (VISION_V2.md §11 P4); this lab fixture now uses the same real-texture
// builder the gameplay scene uses, at a fixed zoom (LabScene has no
// viewport-driven layout of its own to pick one from).
import { buildTextures } from './textures.js';
import { isTestMode, toViewport } from './testhook.js';

const LAB_ZOOM = 3;

const HELPERS = Object.freeze(['pop', 'hop', 'wobble', 'springBack', 'burst']);

export class LabScene extends Phaser.Scene {
  constructor() {
    super('LabScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    buildTextures(this, LAB_ZOOM);

    this.add.rectangle(W / 2, H / 2, W, H, 0x16260f).setDepth(-10);

    this.startX = W / 2;
    this.startY = H / 2;
    this.obj = this.add.sprite(this.startX, this.startY, 'find_mosscap').setDepth(1);

    // iOS rule: the AudioContext only unlocks from inside a user gesture.
    this.input.once('pointerdown', () => sfx.unlock());

    if (isTestMode()) {
      this.installLabHook();
    }
  }

  installLabHook() {
    const scene = this;

    const objState = () => {
      const viewport = toViewport(scene, scene.obj.x, scene.obj.y);
      return {
        scaleX: scene.obj.scaleX,
        scaleY: scene.obj.scaleY,
        angle: scene.obj.angle,
        gameX: scene.obj.x,
        gameY: scene.obj.y,
        x: viewport.x,
        y: viewport.y,
      };
    };

    const resetObj = () => {
      scene.obj.setPosition(scene.startX, scene.startY);
      scene.obj.setScale(1);
      scene.obj.setAngle(0);
      scene.obj.setAlpha(1);
    };

    const runHelper = (name) => {
      switch (name) {
        case 'pop':
          return juice.pop(scene.obj);
        case 'hop':
          return juice.hop(scene.obj, 28);
        case 'wobble':
          return juice.wobble(scene.obj);
        case 'springBack':
          // Displace it first so the spring-back is a real motion, not a no-op.
          scene.obj.x = scene.startX + 34;
          scene.obj.y = scene.startY - 26;
          return juice.springBack(scene.obj, scene.startX, scene.startY);
        case 'burst':
          return juice.burst(scene, scene.obj.x, scene.obj.y, 6);
        default:
          throw new Error(`unknown juice helper "${name}"`);
      }
    };

    window.__gwJuice = {
      ready: true,
      cues: [...SFX_CUES],
      helpers: [...HELPERS],
      start: () => ({ x: scene.startX, y: scene.startY }),
      objState,
      resetObj,
      playCue: (name) => {
        if (!SFX_CUES.includes(name)) throw new Error(`unknown sfx cue "${name}"`);
        sfx.play(name);
        return true;
      },
      runHelper: (name) => {
        if (!HELPERS.includes(name)) throw new Error(`unknown juice helper "${name}"`);
        return runHelper(name);
      },
    };
  }
}
