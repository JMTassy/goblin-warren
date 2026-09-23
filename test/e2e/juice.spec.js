// test/e2e/juice.spec.js
//
// Owned by P3 (VISION_V2.md §11 / docs/INTERFACES.md §4 acceptance).
// Runs against LabScene at `?scene=lab&test=1` (src/main.js, src/game/labScene.js)
// on the `iPhone 15` project. Asserts every SFX cue and every juice.js
// helper runs with zero page errors, plus the three timed/positional
// guarantees the interface promises: pop reaches scale >= 1 within 300ms,
// springBack lands within +/-1px of its target, hop returns to its start.

import { test, expect } from '@playwright/test';

test.describe('juice', () => {
  test('every cue and every helper run cleanly, with the promised timing/position guarantees', async ({
    page,
  }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/goblin-warren/?scene=lab&test=1');
    await page.waitForFunction(() => window.__gwJuice && window.__gwJuice.ready === true, {
      timeout: 10_000,
    });

    const { cues, helpers } = await page.evaluate(() => ({
      cues: window.__gwJuice.cues,
      helpers: window.__gwJuice.helpers,
    }));

    // Every SFX_CUES cue is representable and covered.
    expect(cues).toEqual([
      'pop',
      'lift',
      'tile_ok',
      'tile_no',
      'thunk',
      'sprout',
      'burp',
      'snore',
      'purr',
      'hop',
    ]);
    expect(helpers).toEqual(['pop', 'hop', 'wobble', 'springBack', 'burst']);

    // Every cue plays without throwing.
    for (const cue of cues) {
      const ok = await page.evaluate((c) => window.__gwJuice.playCue(c), cue);
      expect(ok, `playCue("${cue}") did not report success`).toBe(true);
    }

    // Every helper runs to completion without throwing.
    for (const helper of helpers) {
      await page.evaluate(async (h) => {
        window.__gwJuice.resetObj();
        await window.__gwJuice.runHelper(h);
      }, helper);
    }

    // pop: scale reaches >= 1 within 300ms of starting, timed inside the page.
    const popTimingMs = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.__gwJuice.resetObj();
        const t0 = performance.now();
        window.__gwJuice.runHelper('pop'); // fire, don't await -- we're timing the rise
        const check = () => {
          if (window.__gwJuice.objState().scaleX >= 1) {
            resolve(performance.now() - t0);
            return;
          }
          if (performance.now() - t0 > 1000) {
            resolve(-1); // safety valve, should never hit
            return;
          }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
    });
    expect(popTimingMs).toBeGreaterThanOrEqual(0);
    expect(popTimingMs).toBeLessThanOrEqual(300);

    // hop: returns to exactly where it started.
    const hopDelta = await page.evaluate(async () => {
      window.__gwJuice.resetObj();
      const before = window.__gwJuice.objState();
      await window.__gwJuice.runHelper('hop');
      const after = window.__gwJuice.objState();
      return {
        dx: Math.abs(after.gameX - before.gameX),
        dy: Math.abs(after.gameY - before.gameY),
      };
    });
    expect(hopDelta.dx).toBeLessThan(1);
    expect(hopDelta.dy).toBeLessThan(1);

    // springBack: lands within +/-1px of the target it was sent to.
    const springDelta = await page.evaluate(async () => {
      window.__gwJuice.resetObj();
      const target = window.__gwJuice.start();
      await window.__gwJuice.runHelper('springBack');
      const after = window.__gwJuice.objState();
      return {
        dx: Math.abs(after.gameX - target.x),
        dy: Math.abs(after.gameY - target.y),
      };
    });
    expect(springDelta.dx).toBeLessThanOrEqual(1);
    expect(springDelta.dy).toBeLessThanOrEqual(1);

    expect(pageErrors, pageErrors.map(String).join('\n')).toHaveLength(0);
  });

  test('boots at ?scene=lab&test=1 with a visible canvas and no page scroll', async ({ page }) => {
    await page.goto('/goblin-warren/?scene=lab&test=1');
    await page.waitForFunction(() => window.__gwJuice && window.__gwJuice.ready === true, {
      timeout: 10_000,
    });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const { scrollHeight, innerHeight } = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(scrollHeight).toBeLessThanOrEqual(innerHeight + 1);
  });
});
