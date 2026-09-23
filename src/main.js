// src/main.js
//
// Phaser 4 game bootstrap. Scaffolded by P0 (VISION_V2.md §11); the default
// scene swapped to P4's real gameplay scene (`src/game/scene.js`) here.
//
// Scale: RESIZE mode gives a 1:1 pixel canvas matching its parent -- no
// CSS scaling -- so 1 game px = 1 CSS px (docs/engine-notes/scale-and-responsive).
// `pixelArt: true` disables texture smoothing so the pixel-map art (P2)
// stays crisp -- belt-and-braces alongside src/game/textures.js baking the
// whole-number zoom directly into each texture's pixels.
//
// `?scene=lab` still boots P3's LabScene instead (src/game/labScene.js) --
// a test fixture for audio + juice, never reached without that query param.

import Phaser from 'phaser';
import { WarrenScene } from './game/scene.js';
import { LabScene } from './game/labScene.js';

function pickScene() {
  try {
    if (new URLSearchParams(window.location.search).get('scene') === 'lab') return LabScene;
  } catch {
    // fall through to the default scene
  }
  return WarrenScene;
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
