// test/e2e/boot.spec.js
//
// P0's acceptance test (VISION_V2.md §11 P0 / §8): the app boots cleanly
// at iPhone size, served under /goblin-warren/ via `vite preview`.
//
// Device note: runs on both `devices['iPhone 15']` (393x659 CSS px) and
// `devices['iPhone SE (3rd gen)']` (375x667 CSS px) -- see
// playwright.config.js. The canvas-width check below compares against the
// live viewport instead of a device-specific pixel constant so it holds on
// either.

import { test, expect } from '@playwright/test';

test.describe('boot', () => {
  test('boots with zero page errors, a wide-enough canvas, no page scroll, and __gw.ready', async ({
    page,
  }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/goblin-warren/?test=1');

    await page.waitForFunction(() => window.__gw && window.__gw.ready === true, {
      timeout: 10_000,
    });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const canvasWidth = await canvas.evaluate((el) => el.getBoundingClientRect().width);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(canvasWidth).toBeGreaterThanOrEqual(viewportWidth - 2);

    const { scrollHeight, innerHeight } = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(scrollHeight).toBeLessThanOrEqual(innerHeight + 1);

    const ready = await page.evaluate(() => window.__gw.ready);
    expect(ready).toBe(true);

    expect(pageErrors, pageErrors.map(String).join('\n')).toHaveLength(0);
  });

  test('the test hook reports a well-typed state and a 4x4 ground', async ({ page }) => {
    await page.goto('/goblin-warren/?test=1');
    await page.waitForFunction(() => window.__gw && window.__gw.ready === true);

    const state = await page.evaluate(() => window.__gw.state());
    expect(state).toBeTruthy();
    expect(state.v).toBe('GW2');
    expect(state.ground.w).toBe(4);
    expect(state.ground.h).toBe(4);
    expect(state.ground.terrain).toHaveLength(16);
    expect(state.ground.tiles).toHaveLength(16);

    const tiles = await page.evaluate(() => window.__gw.tiles());
    expect(tiles).toHaveLength(16);
    for (const t of tiles) {
      expect(typeof t.x).toBe('number');
      expect(typeof t.y).toBe('number');
    }

    const lulu = await page.evaluate(() => window.__gw.at('lulu'));
    expect(lulu).toBeTruthy();
    expect(typeof lulu.x).toBe('number');
    expect(typeof lulu.y).toBe('number');
  });
});
