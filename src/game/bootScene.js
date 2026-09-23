// src/game/bootScene.js
//
// P0's minimal boot scene (VISION_V2.md §11 P0: "a minimal boot scene that
// shows the 4x4 ground from makeState(seed) using placeholders and sets
// __gw.ready = true. No gameplay.").
//
// P4 owns src/game/scene.js -- the real gameplay scene with drag, growth,
// Lulu's reactions, etc. This file is deliberately NOT that: it is scaffold
// P5 (Integration) replaces wholesale once P1-P4 land, kept separate on
// purpose so nobody collides on src/game/scene.js during parallel work.

import Phaser from 'phaser';
import { makeState } from '../core/state.js';
import { warrenBorn } from '../core/events.js';
import { buildPlaceholderTextures, buildPlaceholderSfx } from './placeholders.js';
import { installTestHook, markReady, toViewport } from './testhook.js';

const TILE = 64;
const GAP = 8;

const TERRAIN_TEXTURE = {
  soil: 'tile_soil',
  rock: 'tile_rock',
  pond: 'tile_pond',
};

/** Fixed until P1's makeState() computes a real seed -> layout. */
const DEFAULT_SEED = 20260923;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    const seed = readSeedFromUrl() ?? DEFAULT_SEED;
    this.state = makeState(seed);
    this.ledger = { v: 'GW2', seed, events: [warrenBorn(seed)] };
    this.sfx = buildPlaceholderSfx();

    buildPlaceholderTextures(this);

    this.add.rectangle(W / 2, H / 2, W, H, 0x16260f).setDepth(-10);

    this.buildGround(W, H);
    this.buildLulu(W, H);

    installTestHook(this);
    this.getState = () => this.state;
    this.getLedger = () => this.ledger;
    this.getView = () => ({ dragging: false, hover: null });
    this.getTiles = () => this.tileRects.map((t) => this.describeTile(t));
    this.getOrbPos = () => null; // no find is ever offered in the boot scaffold
    this.getAt = (name) => (name === 'lulu' ? toViewport(this, this.lulu.x, this.lulu.y) : null);

    markReady();
  }

  buildGround(W, H) {
    const { w, h, terrain } = this.state.ground;
    const gridW = w * TILE + (w - 1) * GAP;
    const gridH = h * TILE + (h - 1) * GAP;
    const startX = (W - gridW) / 2 + TILE / 2;
    const startY = H * 0.3 - gridH / 2 + TILE / 2;

    this.tileRects = [];

    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const index = row * w + col;
        const kind = terrain[index];
        const x = startX + col * (TILE + GAP);
        const y = startY + row * (TILE + GAP);

        this.add.sprite(x, y, TERRAIN_TEXTURE[kind] ?? 'tile_soil').setDepth(0);

        this.tileRects.push({ index, x, y, terrain: kind, occupied: false });
      }
    }
  }

  buildLulu(W, H) {
    this.lulu = this.add.sprite(W / 2, H * 0.82, 'lulu_body_0').setDepth(3);
  }

  describeTile(t) {
    const p = toViewport(this, t.x, t.y);
    return { x: p.x, y: p.y, w: TILE, h: TILE, terrain: t.terrain, occupied: t.occupied };
  }
}

function readSeedFromUrl() {
  try {
    const raw = new URLSearchParams(window.location.search).get('seed');
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
