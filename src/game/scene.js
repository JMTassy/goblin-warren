// src/game/scene.js
//
// Owned by P4 (VISION_V2.md §11). The real gameplay scene: Lulu, the 4x4
// ground, drag-and-drop, growth, the Book. One dispatch path only --
// dispatch(event) appends to the ledger, folds it through the frozen
// `apply()`, saves, then this file (and only this file) decides how that
// new State looks and sounds. The view never mutates game state and never
// re-implements a rule: legality is asked of `legal()`, outcomes are
// whatever `apply()`/`outcome()` decided, growth is whatever `newDay()`
// decided, the Book is whatever `book()` reads back.

import Phaser from 'phaser';
import { apply, moodOf } from '../core/state.js';
import { visit, findOffered, findDropped, pet, toggleSound } from '../core/events.js';
import { legal } from '../core/finds.js';
import { replay } from '../core/ledger.js';
import { book as deriveBook } from '../core/book.js';

import { buildTextures } from './textures.js';
import { installTestHook, markReady, toViewport } from './testhook.js';
import { loadLedger, saveLedger } from './storage.js';
import * as juice from './juice.js';
import * as sfx from '../audio/sfx.js';

import { createGround } from './objects/ground.js';
import { createLulu } from './objects/lulu.js';
import { createCompost } from './objects/compost.js';
import { createBubble } from './objects/bubble.js';
import { createBook } from './objects/book.js';

const RAW_TILE = 24;
const RAW_LULU = 16;
const COLS = 4;
const ROWS = 4;
const GAP = 4;

/** Whole-number zoom (VISION_V2.md §8): the largest of 3/4 whose ground still fits comfortably. */
function pickZoom(viewportW) {
  for (const z of [4, 3]) {
    const groundW = RAW_TILE * COLS * z + GAP * (COLS - 1);
    if (groundW <= viewportW * 0.92) return z;
  }
  return 3;
}

function computeLayout(W, H) {
  const zoom = pickZoom(W);
  const TILE = RAW_TILE * zoom;
  const groundW = TILE * COLS + GAP * (COLS - 1);
  const groundH = TILE * ROWS + GAP * (ROWS - 1);
  const groundLeft = (W - groundW) / 2;
  const topBarH = 40;
  const groundTop = topBarH + 20;
  const groundBottom = groundTop + groundH;
  const leftover = Math.max(0, H - groundBottom);

  const luluY = groundBottom + Math.min(110, Math.max(64, leftover * 0.45));
  let luluX = W / 2 - TILE * 0.4;
  luluX = Math.max(12 + (RAW_LULU * zoom) / 2, luluX);

  let compostX = luluX + TILE * 1.25;
  compostX = Math.min(compostX, W - 12 - (RAW_TILE * zoom) / 2);
  const compostY = luluY + 6;

  return { zoom, TILE, GAP, groundLeft, groundTop, groundW, groundH, groundBottom, luluX, luluY, compostX, compostY, topBarH };
}

export class WarrenScene extends Phaser.Scene {
  constructor() {
    super('WarrenScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.ledger = loadLedger();
    this.state = replay(this.ledger);

    const layout = computeLayout(W, H);
    this.layout = layout;

    buildTextures(this, layout.zoom);
    sfx.setMuted(!this.state.sound);

    this.add.rectangle(W / 2, H / 2, W, H, 0x16260f).setDepth(-10);

    this.dragging = false;
    this.hover = null;
    this.orb = null;
    this._hoverKind = null;
    this._hoverIndex = -1;

    this.ground = createGround(this, this.state.ground, {
      zoom: layout.zoom,
      left: layout.groundLeft,
      top: layout.groundTop,
      gap: layout.GAP,
    });
    this.ground.syncPlants(this.state.ground.tiles);

    this.compost = createCompost(this, layout.compostX, layout.compostY, layout.zoom, this.state.compost);
    this.lulu = createLulu(this, layout.luluX, layout.luluY, layout.zoom);
    this.bubble = createBubble(this);
    this.bookOverlay = createBook(this, W, H);

    this.buildTopBar(W);

    if (this.state.offered) {
      this.spawnOrbSprite(this.state.offered, false);
    }

    this.updateMoodAndInvite();

    this.setupLuluInput();

    // iOS rule: AudioContext only unlocks inside a user gesture.
    this.input.once('pointerdown', () => sfx.unlock());

    this.lulu.startIdleWander();
    this.startBobLoop();

    installTestHook(this);
    this.getState = () => this.state;
    this.getLedger = () => this.ledger;
    this.getView = () => ({ dragging: this.dragging, hover: this.hover });
    this.getTiles = () =>
      this.state.ground.tiles.map((plant, i) => this.ground.describeTile(i, plant !== null));
    this.getOrbPos = () => (this.orb ? toViewport(this, this.orb.x, this.orb.y) : null);
    this.getAt = (name) => this.resolveAt(name);

    markReady();

    // Time enters only as VISIT{t} -- on boot, and on visibilitychange.
    this.dispatchVisit(Date.now());

    this._onVisibility = () => {
      if (document.visibilityState === 'visible') this.dispatchVisit(Date.now());
    };
    document.addEventListener('visibilitychange', this._onVisibility);
    this.events.once('shutdown', () => document.removeEventListener('visibilitychange', this._onVisibility));
  }

  // -----------------------------------------------------------------
  // Dispatch -- the one path in and out of state.
  // -----------------------------------------------------------------

  dispatch(event) {
    const prev = this.state;
    this.ledger = { ...this.ledger, events: [...this.ledger.events, event] };
    this.state = apply(prev, event);
    saveLedger(this.ledger);
    this.updateMoodAndInvite();
    return prev;
  }

  dispatchVisit(t) {
    const prevDay = this.state.day;
    this.dispatch(visit(t));
    if (this.state.day !== prevDay) {
      this.ground.syncPlants(this.state.ground.tiles);
      this.compost.setCompost(this.state.compost);
      if (prevDay > 0) {
        this.bubble.say('wake', this.lulu.x, this.lulu.y - (RAW_LULU * this.layout.zoom) * 0.9);
      }
    }
  }

  // -----------------------------------------------------------------
  // Lulu: tap to offer, hold to pet.
  // -----------------------------------------------------------------

  setupLuluInput() {
    const node = this.lulu.node;
    node.setInteractive({ useHandCursor: true });

    let holdTimer = null;
    let held = false;

    const cancelHold = () => {
      if (holdTimer) {
        holdTimer.remove(false);
        holdTimer = null;
      }
    };

    node.on('pointerdown', () => {
      held = false;
      cancelHold();
      holdTimer = this.time.delayedCall(450, () => {
        held = true;
        this.handlePetLulu();
      });
    });
    node.on('pointerup', () => {
      const wasHeld = held;
      cancelHold();
      if (!wasHeld) this.handleTapLulu();
    });
    node.on('pointerupoutside', cancelHold);
  }

  handleTapLulu() {
    if (this.state.asleep || this.state.offered || this.state.energy <= 0) return;
    this.dispatch(findOffered());
    if (!this.state.offered) return; // defensive: core said no
    sfx.play('pop');
    this.lulu.pop();
    this.spawnOrbSprite(this.state.offered, true);
    this.bubble.say('offer', this.lulu.x, this.lulu.y - (RAW_LULU * this.layout.zoom) * 0.9);
    if (this.state.asleep) this.handleSleepReached();
  }

  handlePetLulu() {
    this.dispatch(pet());
    sfx.play('purr');
    this.lulu.wobble();
    this.bubble.say(this.state.asleep ? 'sleep' : 'pet', this.lulu.x, this.lulu.y - (RAW_LULU * this.layout.zoom) * 0.9);
  }

  handleSleepReached() {
    sfx.play('snore');
    this.bubble.say('sleep', this.lulu.x, this.lulu.y - (RAW_LULU * this.layout.zoom) * 0.9);
  }

  // -----------------------------------------------------------------
  // The find: spawn, drag, drop.
  // -----------------------------------------------------------------

  spawnOrbSprite(find, animate) {
    const homeX = this.lulu.x;
    const homeY = this.lulu.y - (RAW_LULU * this.layout.zoom) * 0.9;

    const sprite = this.add.sprite(homeX, homeY, `find_${find.species}`).setDepth(15);
    sprite.homeX = homeX;
    sprite.homeY = homeY;
    sprite.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(sprite);

    sprite.on('dragstart', () => {
      this.dragging = true;
      sfx.play('lift');
      this.tweens.add({ targets: sprite, scaleX: 1.2, scaleY: 1.2, duration: 120, ease: 'Sine.easeOut' });
      sprite.setDepth(16);
    });

    sprite.on('drag', (pointer, dragX, dragY) => {
      sprite.x = dragX;
      sprite.y = dragY;
      this.updateHover(dragX, dragY);
    });

    sprite.on('dragend', () => {
      this.dragging = false;
      this.ground.hideGlow();
      this._hoverKind = null;
      this._hoverIndex = -1;
      this.hover = null;
      this.finishDrag(sprite);
    });

    this.orb = sprite;
    if (animate) juice.pop(sprite);
    return sprite;
  }

  updateHover(x, y) {
    if (this.compost.contains(x, y)) {
      this.ground.hideGlow();
      this.hover = null;
      this._hoverKind = 'compost';
      this._hoverIndex = -1;
      return;
    }

    const idx = this.ground.indexAt(x, y);
    if (idx === -1) {
      this.ground.hideGlow();
      this.hover = null;
      this._hoverKind = null;
      this._hoverIndex = -1;
      return;
    }

    const ok = legal(this.state, idx);
    this.hover = ok ? 'ok' : 'no';
    this.ground.showGlow(idx, ok);
    if (this._hoverKind !== 'tile' || this._hoverIndex !== idx) {
      sfx.play(ok ? 'tile_ok' : 'tile_no');
      this._hoverKind = 'tile';
      this._hoverIndex = idx;
    }
  }

  finishDrag(sprite) {
    const x = sprite.x;
    const y = sprite.y;

    if (this.compost.contains(x, y)) {
      this.dispatch(findDropped('compost'));
      sfx.play('burp');
      this.compost.setCompost(this.state.compost);
      this.compost.bounce();
      this.bubble.say('compost', this.compost.x, this.compost.y - this.compost.TILE * 0.7);
      sprite.destroy();
      this.orb = null;
      if (this.state.asleep) this.handleSleepReached();
      return;
    }

    const idx = this.ground.indexAt(x, y);
    if (idx !== -1 && legal(this.state, idx)) {
      this.dispatch(findDropped('tile', idx));
      sfx.play('thunk');
      const center = this.ground.centerOf(idx);
      juice.burst(this, center.x, center.y - this.ground.TILE * 0.3, 6);
      this.ground.syncPlants(this.state.ground.tiles);
      const plantSprite = this.ground.plantSprites[idx];
      if (plantSprite) juice.pop(plantSprite);
      sfx.play('sprout');
      sprite.destroy();
      this.orb = null;
      this.reactTo(this.state.lastReaction, idx);
      if (this.state.asleep) this.handleSleepReached();
      return;
    }

    // Anything else -> spring back to Lulu (VISION_V2.md §4). The lantern
    // already judged legality during the drag; this is just the answer.
    sprite.setDepth(15);
    this.tweens.add({ targets: sprite, scaleX: 1, scaleY: 1, duration: 200, ease: 'Sine.easeOut' });
    juice.springBack(sprite, sprite.homeX, sprite.homeY);
  }

  reactTo(reaction, tileIndex) {
    const center = this.ground.centerOf(tileIndex);
    const bubbleY = this.lulu.y - (RAW_LULU * this.layout.zoom) * 0.9;
    if (reaction === 'bighop') {
      sfx.play('hop');
      this.lulu.hop(42);
      if (center) this.lulu.settleToward(center.x, 0.3);
      this.bubble.say('bighop', this.lulu.x, bubbleY);
    } else if (reaction === 'shrug') {
      this.lulu.wobble();
      this.bubble.say('shrug', this.lulu.x, bubbleY);
    } else {
      sfx.play('hop');
      this.lulu.hop(20);
      this.bubble.say('hop', this.lulu.x, bubbleY);
    }
  }

  // -----------------------------------------------------------------
  // Mood, invite ring, idle life.
  // -----------------------------------------------------------------

  updateMoodAndInvite() {
    this.lulu.setMood(moodOf(this.state));
    const canOffer = !this.state.asleep && !this.state.offered && this.state.energy > 0;
    this.lulu.setInvite(canOffer);
  }

  startBobLoop() {
    this.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => {
        if (!this.dragging) this.lulu.tickBob();
      },
    });
  }

  // -----------------------------------------------------------------
  // Top bar: mute + Book.
  // -----------------------------------------------------------------

  buildTopBar(W) {
    const btnStyle = {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#e8dcc0',
      backgroundColor: '#2a1f14',
      padding: { x: 9, y: 5 },
    };

    this.muteBtn = this.add
      .text(14, 12, this.state.sound ? 'sound: on' : 'sound: off', btnStyle)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', () => {
      this.dispatch(toggleSound());
      sfx.setMuted(!this.state.sound);
      this.muteBtn.setText(this.state.sound ? 'sound: on' : 'sound: off');
    });

    this.bookBtn = this.add
      .text(W / 2, 12, 'book', btnStyle)
      .setOrigin(0.5, 0)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });
    this.bookBtn.on('pointerdown', () => {
      this.bookOverlay.toggle(deriveBook(this.ledger));
    });

    const lantern = this.add.sprite(W - 26, 22, 'lantern').setDepth(30);
    this.tweens.add({
      targets: lantern,
      alpha: { from: 1, to: 0.5 },
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // -----------------------------------------------------------------
  // window.__gw.at(name)
  // -----------------------------------------------------------------

  resolveAt(name) {
    if (name === 'lulu') return toViewport(this, this.lulu.x, this.lulu.y);
    if (name === 'compost') return this.compost.describe();
    if (name === 'book' && this.bookBtn) return toViewport(this, this.bookBtn.x, this.bookBtn.y);
    return null;
  }
}
