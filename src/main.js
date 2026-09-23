// src/main.js
//
// Phaser 4 game bootstrap. Owned by P0 (VISION_V2.md §11).
//
// Scale: RESIZE mode gives a 1:1 pixel canvas matching its parent -- no
// CSS scaling -- so 1 game px = 1 CSS px (docs/engine-notes/scale-and-responsive).
// `pixelArt: true` disables texture smoothing so the pixel-map art (P2)
// stays crisp under nearest-neighbour upscale instead of blurring.
//
// P4 swaps `BootScene` for the real gameplay scene(s) in P5 Integration;
// until then this is the only scene, per the P0 task brief ("a minimal
// boot scene ... No gameplay.").
//
// `?scene=lab` boots P3's LabScene instead (src/game/labScene.js) -- a
// test fixture for audio + juice, never reached without that query param.

import Phaser from 'phaser';
import { BootScene } from './game/bootScene.js';
import { LabScene } from './game/labScene.js';

function pickScene() {
  try {
    if (new URLSearchParams(window.location.search).get('scene') === 'lab') return LabScene;
  } catch {
    // fall through to the default scene
  }
  return BootScene;
}

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#16260f',
  pixelArt: true,
  banner: false,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  input: {
    activePointers: 1,
  },
  scene: [pickScene()],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
