// Physics-feel gates: kinematics are real, breath follows the drive
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // P1: gravity — velocity grows linearly, trajectory is a parabola
  const p1 = await page.evaluate(() => {
    const p = { x: 0, y: 0, vx: 100, vy: 0, floor: null };
    const ys = [];
    for (let i = 0; i < 3; i++) { window.WARREN_DEBUG.physStep(p, 0.1); ys.push(p.y); }
    // constant dt: second differences of y must be constant (= g*dt^2)
    const d1 = ys[1] - ys[0], d2 = ys[2] - ys[1];
    return { ys, secondDiff: (d2 - d1), expected: 2400 * 0.01 };
  });
  log('P1_parabola', Math.abs(p1.secondDiff - p1.expected) < 1e-6, JSON.stringify(p1));

  // P2: bounce — restitution 0.55, energy decays, bounces count
  const p2 = await page.evaluate(() => {
    const p = { x: 0, y: 0, vx: 0, vy: 500, floor: 10 };
    let vAtImpact = null, vAfter = null;
    for (let i = 0; i < 200 && !p.bounces; i++) { vAtImpact = p.vy; window.WARREN_DEBUG.physStep(p, 0.005); if (p.justBounced) vAfter = p.vy; }
    return { bounces: p.bounces, ratio: -vAfter / vAtImpact };
  });
  log('P2_restitution', p2.bounces === 1 && p2.ratio > 0.5 && p2.ratio < 0.6, JSON.stringify(p2));

  // P3: breath — hotter Warren breathes faster (monotonic)
  const p3 = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    s.world.warmth = 10; s.world.treeHealth = 10;
    const cold = window.WARREN_DEBUG.breath();
    s.world.warmth = 95; s.world.treeHealth = 95;
    const hot = window.WARREN_DEBUG.breath();
    const cssVar = document.getElementById('world').style.getPropertyValue('--breath');
    return { cold, hot, faster: hot < cold, cssVar };
  });
  log('P3_convective_breath', p3.faster && p3.cssVar.includes('s'), JSON.stringify(p3));

  // P4: coinBurst spawns physics-driven coins (no CSS transition)
  await page.evaluate(() => window.WARREN_DEBUG.coinBurst(200, 300, 5));
  await page.waitForTimeout(150);
  const p4 = await page.evaluate(() => {
    const els = document.querySelectorAll('.zol-coin.phys');
    return { n: els.length, noTransition: els.length && getComputedStyle(els[0]).transitionDuration === '0s' };
  });
  log('P4_ballistic_coins', p4.n === 5 && p4.noTransition, JSON.stringify(p4));

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
