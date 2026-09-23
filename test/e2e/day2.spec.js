// test/e2e/day2.spec.js
//
// Owned by P5 (VISION_V2.md §11 P5, MAYOR_RULING_V2.md): proves the reason
// to come back. Day 1's loop.spec.js already proves the first 30 seconds;
// this proves the payoff a real day later -- a sleeping glowcap wakes, a
// wilted plant composts, an adjacent pair combines, Lulu resets, and the
// Book remembers -- all through the game's own real path: `apply()` /
// `newDay()` / `book()`, the real `visibilitychange` listener
// (src/game/scene.js), and a mocked `Date.now()` (`page.clock`), never a
// test-only backdoor into the scene.
//
// Why a pre-built ledger, not UI taps, for day 1's setup: `nextFind()`
// draws species pseudo-randomly from (seed, day, offersToday)
// (src/core/finds.js), and storage.js hands a brand-new Warren a
// non-seeded random seed (src/game/storage.js's `freshSeed()` -- the one
// deliberate non-determinism in the game, since there is nothing to
// replay yet). There is no UI control over which of the 3 species Lulu
// offers next, so a day 1 that needs 2 glowcap + 2 mosscap in specific
// spots can't be scripted as a fixed tap/drag sequence the way loop.spec.js
// scripts day 1's *first* few finds (which don't care about species).
// Instead, this file searches (in plain Node, using the same pure
// `makeState`/`apply` the game itself runs) for a seed whose day-1 draws
// happen to offer enough glowcap/mosscap, replays that exact sequence
// through the real `apply()` to build a ledger, and seeds localStorage
// with it before the page ever loads -- precisely the ledger format
// `src/game/storage.js` already reads on boot. Everything from there on
// (loading that ledger, the day-2 VISIT, growth, the Book) runs inside the
// browser through the real scene code; nothing here reaches into the
// scene or adds a hook it doesn't already have.

import { test, expect } from '@playwright/test';
import fs from 'node:fs';

import { makeState, apply } from '../../src/core/state.js';
import { warrenBorn, visit, findOffered, findDropped } from '../../src/core/events.js';
import { serialize } from '../../src/core/persist.js';
import { book as deriveBook } from '../../src/core/book.js';

const RESULTS_DIR = 'test-results';
const STORAGE_KEY = 'gw2:ledger'; // src/game/storage.js's own key -- the ledger format is the real save/load contract, not a test backdoor.

fs.mkdirSync(RESULTS_DIR, { recursive: true });

// A fixed "day 1" and "day 2", both at a safe UTC mid-day so the single
// calendar-day gap between them can never be blurred by a timezone or a
// midnight-adjacent timestamp. src/core/state.js's `epochDay()` is UTC.
const DAY1_T = Date.UTC(2026, 8, 24, 12, 0, 0);
const DAY2_T = DAY1_T + 24 * 3600 * 1000;

/** Orthogonal neighbours of tile `i` on the 4x4 ground (mirrors src/core/growth.js). */
function neighborsOf(i) {
  const row = Math.floor(i / 4);
  const col = i % 4;
  const out = [];
  if (row > 0) out.push(i - 4);
  if (row < 3) out.push(i + 4);
  if (col > 0) out.push(i - 1);
  if (col < 3) out.push(i + 1);
  return out;
}

/**
 * Simulate a whole day-1 play session for `seed`, through the real
 * `apply()`: tap for a find, and either plant it in one of the four target
 * tiles this test needs (if its species is still wanted there) or compost
 * it. Returns the resulting ledger + tile indices on success, or `null` if
 * this seed's terrain or day-1 species draws can't fill all four targets
 * within Lulu's 6-energy day (the caller tries the next seed).
 */
function planDay1(seed) {
  let s = makeState(seed);
  s = apply(s, visit(DAY1_T));
  const terrain = s.ground.terrain;

  let cd = null;
  for (let i = 0; i < 16 && !cd; i++) {
    if (terrain[i] !== 'soil') continue;
    for (const n of neighborsOf(i)) {
      if (n > i && terrain[n] === 'soil') {
        cd = [i, n];
        break;
      }
    }
  }
  if (!cd) return null;
  const [cIdx, dIdx] = cd; // C: glowcap, D: mosscap -- adjacent, for the recipe.

  const aIdx = terrain.findIndex((t, i) => t === 'soil' && i !== cIdx && i !== dIdx); // A: isolated glowcap, for the sleep/wake test.
  if (aIdx === -1) return null;
  const bIdx = terrain.findIndex((t) => t === 'pond'); // B: mosscap on pond, for the wilt/compost test.
  if (bIdx === -1) return null;

  const glowSlots = [aIdx, cIdx];
  const mossSlots = [bIdx, dIdx];
  let glowFilled = 0;
  let mossFilled = 0;
  const events = [warrenBorn(seed), visit(DAY1_T)];

  while (s.energy > 0 && !s.asleep && (glowFilled < 2 || mossFilled < 2)) {
    s = apply(s, findOffered());
    events.push(findOffered());
    const find = s.offered;
    if (!find) break;

    let target = null;
    if (find.species === 'glowcap' && glowFilled < 2) {
      target = glowSlots[glowFilled];
      glowFilled += 1;
    } else if (find.species === 'mosscap' && mossFilled < 2) {
      target = mossSlots[mossFilled];
      mossFilled += 1;
    }

    const dropEvent = target !== null ? findDropped('tile', target) : findDropped('compost');
    s = apply(s, dropEvent);
    events.push(dropEvent);
  }

  if (glowFilled < 2 || mossFilled < 2) return null;

  return { seed, events, state: s, aIdx, bIdx, cIdx, dIdx };
}

/** The same seed always plans the same way, so this is reproducible run to run. */
function findWorkablePlan(maxSeed = 4000) {
  for (let seed = 1; seed <= maxSeed; seed++) {
    const plan = planDay1(seed);
    if (plan) return plan;
  }
  throw new Error(`day2.spec.js: no seed in [1, ${maxSeed}] gave a workable day-1 (2 glowcap + 2 mosscap, an adjacent soil pair, a pond tile)`);
}

test('day 2: a sleeper wakes, a wilt composts, a recipe fires, Lulu resets, the Book remembers', async ({
  page,
}) => {
  const plan = findWorkablePlan();
  const { seed, events, aIdx, bIdx, cIdx, dIdx } = plan;
  const ledger = { v: 'GW2', seed, events };
  const compostBefore = plan.state.compost;

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err));

  // Freeze Date.now() at day 1's timestamp before the page (and the
  // scene's boot-time VISIT) ever runs, and seed localStorage with the
  // day-1 ledger built above -- the exact save format src/game/storage.js
  // already reads on boot, so this is loading a save, not a backdoor.
  await page.clock.setFixedTime(DAY1_T);
  await page.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // ignore -- matches src/game/storage.js's own fail-closed behaviour
      }
    },
    [STORAGE_KEY, serialize(ledger)],
  );

  await page.goto('/goblin-warren/?test=1');
  await page.waitForFunction(() => window.__gw && window.__gw.ready === true, { timeout: 10_000 });
  await page.waitForTimeout(150);

  const gw = () => page.evaluate(() => window.__gw.state());
  const gwLedger = () => page.evaluate(() => window.__gw.ledger());

  // --- sanity: the injected day-1 ledger loaded as planned --------------

  let state = await gw();
  expect(state.day).toBe(plan.state.day);
  expect(state.compost).toBe(compostBefore);

  expect(state.ground.tiles[aIdx]).toMatchObject({ species: 'glowcap', sleeping: true, stage: 0, wilted: false });
  expect(state.ground.tiles[bIdx]).toMatchObject({ species: 'mosscap', wilted: true });
  expect(state.ground.tiles[cIdx]).toMatchObject({ species: 'glowcap' });
  expect(state.ground.tiles[dIdx]).toMatchObject({ species: 'mosscap', wilted: false });

  // --- the next real day: move the clock, then trigger the game's own
  //     visibilitychange listener (src/game/scene.js) so it dispatches
  //     VISIT itself -- no direct state poke. ------------------------

  await page.clock.setFixedTime(DAY2_T);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await page.waitForTimeout(300);

  state = await gw();
  expect(state.day).toBe(plan.state.day + 1);

  // 1. A glowcap planted on day 1 is asleep on day 1 (checked above) and
  //    awake on day 2.
  expect(state.ground.tiles[aIdx]).toMatchObject({ species: 'glowcap', sleeping: false, stage: 1 });

  // 2. A mosscap planted on the pond wilted by day 2 and went to compost:
  //    compost went up, its tile cleared.
  expect(state.ground.tiles[bIdx]).toBeNull();
  expect(state.compost).toBe(Math.min(5, compostBefore + 1));

  // 3. An adjacent glowcap + mosscap pair became lanternmoss on day 2 (the
  //    glowcap tile itself is untouched; only its mosscap neighbour
  //    transforms, fresh at stage 0).
  expect(state.ground.tiles[cIdx]).toMatchObject({ species: 'glowcap' });
  expect(state.ground.tiles[dIdx]).toMatchObject({ species: 'lanternmoss', stage: 0, wilted: false });

  // 4. Lulu's energy is back to 6 and she's awake.
  expect(state.asleep).toBe(false);
  expect(state.energy).toBe(6);

  await page.screenshot({ path: `${RESULTS_DIR}/day2-morning.png` });

  // 5. The Book lists the recipe once it has fired -- read back through
  //    the real, pure `book()` function against the live ledger, not a
  //    UI/canvas text scrape.
  const liveLedger = await gwLedger();
  const pageBook = deriveBook(liveLedger);
  expect(pageBook.recipes).toContainEqual({ pair: ['mosscap', 'glowcap'], result: 'lanternmoss', day: state.day });

  // Open the Book on screen too, for the operator's screenshot.
  const bookBtn = await page.evaluate(() => window.__gw.at('book'));
  expect(bookBtn).toBeTruthy();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(bookBtn.x), y: Math.round(bookBtn.y) }] });
  await page.waitForTimeout(60);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(200);

  await page.screenshot({ path: `${RESULTS_DIR}/day2-book.png` });

  expect(pageErrors, pageErrors.map(String).join('\n')).toHaveLength(0);
});
