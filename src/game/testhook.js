// src/game/testhook.js
//
// FROZEN by P0 (VISION_V2.md §8/§11). When the URL has `?test=1`, exposes
// `window.__gw` for Playwright. This file owns the SHAPE of the hook and
// the on/off switch; it does not know how to compute any of the values --
// the active scene supplies that by implementing the (all optional)
// methods below and calling `installTestHook(scene)` once, from create().
//
// Contract a scene may implement (see docs/INTERFACES.md for the full
// description of each):
//   scene.getState()   -> State (core/state.js shape)
//   scene.getLedger()  -> Ledger (core/events.js shape)
//   scene.getView()    -> {dragging: boolean, hover: 'ok'|'no'|null}
//   scene.getTiles()   -> [{x, y, w, h, terrain, occupied}, ...] in viewport CSS px
//   scene.getOrbPos()  -> {x, y}|null in viewport CSS px
//   scene.getAt(name)  -> {x, y}|null in viewport CSS px, for named objects
//                          (at least 'lulu' should resolve once a scene renders her)
//
// Any method a scene doesn't implement falls back to a safe default so
// `window.__gw` never throws -- boot.spec.js only requires `ready`, but a
// scene under active development can adopt the rest incrementally.

/**
 * @returns {boolean} true iff the page was loaded with ?test=1
 */
export function isTestMode() {
  try {
    return new URLSearchParams(window.location.search).get('test') === '1';
  } catch {
    return false;
  }
}

/**
 * Install `window.__gw`, wired to `scene`'s optional getters. No-ops
 * (leaves `window.__gw` unset) when not in test mode.
 *
 * @param {Phaser.Scene} scene
 */
export function installTestHook(scene) {
  if (!isTestMode()) return;

  window.__gw = {
    ready: false,
    state: () => (scene.getState ? scene.getState() : null),
    ledger: () => (scene.getLedger ? scene.getLedger() : null),
    view: () => (scene.getView ? scene.getView() : { dragging: false, hover: null }),
    tiles: () => (scene.getTiles ? scene.getTiles() : []),
    orbPos: () => (scene.getOrbPos ? scene.getOrbPos() : null),
    at: (name) => (scene.getAt ? scene.getAt(name) : null),
  };
}

/**
 * Mark the hook ready. Call once the scene has finished its initial
 * render (boot scene, or later the full gameplay scene) so Playwright's
 * `waitForFunction(() => window.__gw?.ready)` resolves.
 */
export function markReady() {
  if (window.__gw) window.__gw.ready = true;
}

/**
 * Convert a point in this scene's internal (game) pixel space to viewport
 * CSS px, DPR-correct. Every coordinate `window.__gw` reports must go
 * through this, so Playwright's `page.touchscreen`/`mouse` coordinates
 * (which are in CSS px) line up with what the scene renders.
 *
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @returns {{x: number, y: number}}
 */
export function toViewport(scene, x, y) {
  const canvas = scene.sys.game.canvas;
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;
  return { x: rect.left + x * scaleX, y: rect.top + y * scaleY };
}
