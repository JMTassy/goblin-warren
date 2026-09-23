// test/e2e/loop.spec.js
//
// Owned by P4 (VISION_V2.md §11 P4 accept list). Plays the whole day-1
// script from VISION_V2.md §4 against the real gameplay scene
// (src/game/scene.js) on the `iPhone 15` project, using real CDP touch
// events (Input.dispatchTouchEvent), the same technique the Mayor's own
// bake-off harness used -- Playwright's built-in `page.touchscreen` only
// exposes a single tap, not a multi-point drag sequence.
//
// One long, sequential playthrough (not several isolated tests) because
// several acceptance points build on the previous one's result: the
// six-offers/asleep check needs two earlier offers already resolved, and
// the reload/persistence check needs the tile planted earlier in the same
// session to still be there after `page.reload()`.

import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const RESULTS_DIR = 'test-results';

fs.mkdirSync(RESULTS_DIR, { recursive: true });

test('day 1: offer, drag-plant, illegal drag, compost, six offers -> asleep, reload persists', async ({
  page,
  context,
}) => {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err));

  const cdp = await context.newCDPSession(page);
  const touch = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(x), y: Math.round(y) }],
    });

  async function tap(x, y) {
    await touch('touchStart', x, y);
    await page.waitForTimeout(60);
    await touch('touchEnd', x, y);
  }

  /** Real multi-point touch drag, optionally sampling mid-drag before release. */
  async function drag(from, to, { steps = 16, stepMs = 16, beforeRelease } = {}) {
    await touch('touchStart', from.x, from.y);
    for (let i = 1; i <= steps; i++) {
      const x = from.x + (to.x - from.x) * (i / steps);
      const y = from.y + (to.y - from.y) * (i / steps);
      await touch('touchMove', x, y);
      await page.waitForTimeout(stepMs);
    }
    await page.waitForTimeout(60);
    if (beforeRelease) await beforeRelease();
    await touch('touchEnd', to.x, to.y);
  }

  const gw = () => page.evaluate(() => window.__gw.state());
  const ledger = () => page.evaluate(() => window.__gw.ledger());
  const view = () => page.evaluate(() => window.__gw.view());
  const tiles = () => page.evaluate(() => window.__gw.tiles());
  const orbPos = () => page.evaluate(() => window.__gw.orbPos());
  const at = (name) => page.evaluate((n) => window.__gw.at(n), name);

  // --- boot ------------------------------------------------------------

  await page.goto('/goblin-warren/?test=1');
  await page.waitForFunction(() => window.__gw && window.__gw.ready === true, { timeout: 10_000 });
  await page.waitForTimeout(150); // let the boot VISIT's render settle

  // Acceptance #7: no page scroll, ground spans >=70% of the viewport width.
  const { scrollHeight, innerHeight, innerWidth } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
  }));
  expect(scrollHeight).toBeLessThanOrEqual(innerHeight + 1);

  const startTiles = await tiles();
  expect(startTiles).toHaveLength(16);
  const groundLeft = Math.min(...startTiles.map((t) => t.x - t.w / 2));
  const groundRight = Math.max(...startTiles.map((t) => t.x + t.w / 2));
  const groundWidth = groundRight - groundLeft;
  expect(groundWidth / innerWidth).toBeGreaterThanOrEqual(0.7);

  await page.screenshot({ path: `${RESULTS_DIR}/day1-start.png` });

  // --- 1: tap Lulu -> offered -----------------------------------------

  // Re-fetched via at('lulu') before every tap below, not cached once: a
  // 'bighop' reaction (glow species) calls lulu.settleToward(), which can
  // move her a few px toward the planted tile, so a stale coordinate can
  // miss her hit area on a later tap.
  let lulu = await at('lulu');
  expect(lulu).toBeTruthy();
  await tap(lulu.x, lulu.y);
  await page.waitForTimeout(150);

  let state = await gw();
  expect(state.offered).not.toBeNull();

  // --- 2: drag to a legal soil tile -> planted, ledger, pixel change ---

  const soilTile = (await tiles()).find((t) => t.terrain === 'soil' && !t.occupied);
  expect(soilTile).toBeTruthy();
  const beforeSample = await page.screenshot({
    clip: { x: soilTile.x - soilTile.w / 2, y: soilTile.y - soilTile.h / 2, width: soilTile.w, height: soilTile.h },
  });

  let orb = await orbPos();
  expect(orb).toBeTruthy();

  await drag(orb, { x: soilTile.x, y: soilTile.y }, {
    beforeRelease: async () => {
      const v = await view();
      expect(v.hover).toBe('ok');
      await page.screenshot({ path: `${RESULTS_DIR}/day1-drag.png` });
    },
  });
  await page.waitForTimeout(500);

  state = await gw();
  const plantedTileIndex = (await tiles()).findIndex((t, i) => state.ground.tiles[i] !== null);
  expect(plantedTileIndex).toBeGreaterThanOrEqual(0);
  expect(state.ground.tiles[plantedTileIndex]).not.toBeNull();

  const led = await ledger();
  const lastEvent = led.events[led.events.length - 1];
  expect(lastEvent.kind).toBe('FIND_DROPPED');
  expect(lastEvent.target).toBe('tile');
  expect(lastEvent.tile).toBe(plantedTileIndex);

  const afterSample = await page.screenshot({
    clip: { x: soilTile.x - soilTile.w / 2, y: soilTile.y - soilTile.h / 2, width: soilTile.w, height: soilTile.h },
  });
  expect(Buffer.compare(beforeSample, afterSample)).not.toBe(0);

  await page.screenshot({ path: `${RESULTS_DIR}/day1-planted.png` });

  // --- 3: offer again, drag to a rock tile -> hover 'no', nothing planted, springs back ---

  lulu = await at('lulu'); // she may have settled toward the planted tile on a bighop
  await tap(lulu.x, lulu.y);
  await page.waitForTimeout(150);
  state = await gw();
  expect(state.offered).not.toBeNull();

  const rockTile = (await tiles()).find((t) => t.terrain === 'rock');
  expect(rockTile).toBeTruthy();
  const plantedBefore = state.ground.tiles.filter((t) => t !== null).length;

  orb = await orbPos();
  await drag(orb, { x: rockTile.x, y: rockTile.y }, {
    beforeRelease: async () => {
      const v = await view();
      expect(v.hover).toBe('no');
    },
  });
  await page.waitForTimeout(400);

  state = await gw();
  const plantedAfter = state.ground.tiles.filter((t) => t !== null).length;
  expect(plantedAfter).toBe(plantedBefore);
  expect(state.offered).not.toBeNull(); // rejected -- still in hand

  const orbAfterSpring = await orbPos();
  expect(orbAfterSpring).toBeTruthy();
  const distFromLulu = Math.hypot(orbAfterSpring.x - lulu.x, orbAfterSpring.y - lulu.y);
  expect(distFromLulu).toBeLessThan(80);

  // --- 4: drop that same held find on the compost -> compost +1 -------

  const compost = await at('compost');
  expect(compost).toBeTruthy();
  const compostBefore = state.compost;

  orb = await orbPos();
  await drag(orb, compost);
  await page.waitForTimeout(400);

  state = await gw();
  expect(state.compost).toBe(compostBefore + 1);
  expect(state.offered).toBeNull();

  // --- 5: offer + compost three more times, then a sixth offer -> asleep ---

  for (let i = 0; i < 3; i++) {
    lulu = await at('lulu');
    await tap(lulu.x, lulu.y);
    await page.waitForTimeout(120);
    orb = await orbPos();
    expect(orb).toBeTruthy();
    await drag(orb, compost, { steps: 8, stepMs: 10 });
    await page.waitForTimeout(250);
  }

  state = await gw();
  expect(state.asleep).toBe(false); // 5 offers so far, still awake

  lulu = await at('lulu');
  await tap(lulu.x, lulu.y); // 6th offer
  await page.waitForTimeout(200);

  state = await gw();
  expect(state.asleep).toBe(true);

  await page.screenshot({ path: `${RESULTS_DIR}/day1-asleep.png` });

  // --- 6: reload -> planted tile is still planted -----------------------

  await page.reload();
  await page.waitForFunction(() => window.__gw && window.__gw.ready === true, { timeout: 10_000 });
  await page.waitForTimeout(150);

  const stateAfterReload = await gw();
  expect(stateAfterReload.ground.tiles[plantedTileIndex]).not.toBeNull();

  // --- 7: zero page errors, throughout -----------------------------------

  expect(pageErrors, pageErrors.map(String).join('\n')).toHaveLength(0);
});
