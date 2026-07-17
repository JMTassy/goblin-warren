// sky-phrase-gates.js — SKY PHRASES (witness #8: "the beginning is too boring").
// Laws: the scripted opening is deterministic (same plan every time) · the
// first gem falls < 70s of rain · the first hazard (announced stone) > 50s ·
// never more than 2 items airborne in the opening · never an empty sky > 4s ·
// perfect-catch economy 25-40 ZOL over 5 min · the debug contract is intact
// (double debug-spawn never stacks; catchGoldfall() takes the oldest).
// Not part of the shipped game — a witness script only.
// Usage: node sky-phrase-gates.js [path-to-index.html]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PAGE = 'file://' + (process.argv[2] || '/home/user/goblin-warren/index.html');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(PAGE);
  await page.waitForTimeout(1200);

  // S1: debug contract intact — double debug-spawn never stacks (gate G1's law),
  // catchGoldfall() catches, classic coin still pays the classic 2-5.
  const s1 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.spawnGoldfall();
    D.spawnGoldfall();               // must NOT stack
    const stacked = document.querySelectorAll('#world .goldfall').length;
    const active = D.goldfallActive();
    const before = D.getState().learning.zolBalance;
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 700));
    return { stacked, active, gained: D.getState().learning.zolBalance - before,
      activeAfter: D.goldfallActive(), domGone: document.querySelectorAll('#world .goldfall').length === 0 };
  });
  log('S1_debug_contract_intact', s1.stacked === 1 && s1.active && s1.gained >= 2 && s1.gained <= 5
    && !s1.activeAfter && s1.domGone, JSON.stringify(s1));

  // S2: deterministic same-sequence — two paper-clock replays are byte-identical
  const s2 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const a = JSON.stringify(D.skyPhrasePlan(300000));
    const bp = JSON.stringify(D.skyPhrasePlan(300000));
    return { same: a === bp, n: D.skyPhrasePlan(300000).length };
  });
  log('S2_deterministic_same_sequence', s2.same && s2.n > 20, JSON.stringify(s2));

  const plan = await page.evaluate(() => window.WARREN_DEBUG.skyPhrasePlan(300000));

  // S3: the first gem is GUARANTEED under 70s of rain
  const gem = plan.find(d => d.kind === 'zolBig');
  log('S3_first_gem_under_70s', !!gem && gem.t < 70000, gem ? 'gem at ' + (gem.t / 1000) + 's' : 'NO GEM');

  // S4: the first hazard (announced stone) waits past 50s
  const stone = plan.find(d => d.kind === 'bonk');
  log('S4_first_hazard_after_50s', !!stone && stone.t > 50000, stone ? 'stone at ' + (stone.t / 1000) + 's' : 'NO STONE');

  // S5: never more than 2 airborne in the opening (sweep the plan's intervals)
  let maxOverlap = 0;
  const edges = [];
  plan.forEach(d => { edges.push([d.t, 1]); edges.push([d.land, -1]); });
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);   // land before spawn at the same ms
  let cur = 0;
  edges.forEach(e => { cur += e[1]; if (cur > maxOverlap) maxOverlap = cur; });
  log('S5_max_two_airborne_in_opening', maxOverlap <= 2, 'max simultaneous = ' + maxOverlap);

  // S6: no empty sky longer than 4s, from opening start to the last landing
  const sorted = plan.slice().sort((a, b) => a.t - b.t);
  let covered = 0, maxGap = 0;
  sorted.forEach(d => {
    if (d.t > covered) maxGap = Math.max(maxGap, d.t - covered);
    covered = Math.max(covered, d.land);
  });
  log('S6_no_empty_gap_over_4s', maxGap <= 4000, 'max empty gap = ' + (maxGap / 1000) + 's');

  // S7: economy — a perfect-catch opening totals 25-40 ZOL over 5 minutes
  const total = plan.reduce((s, d) => s + (d.zol || 0), 0);
  log('S7_economy_25_to_40_zol', total >= 25 && total <= 40, 'perfect-catch total = ' + total + ' ZOL in 5 min');

  // S8: live opening — a fresh staged World-1 session starts the phrases,
  // reaches 2 simultaneous coins, and catching the OLDEST pays exactly +1.
  await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const S = D.getState();
    S.progress.worldStaged = true;
    S.progress.rung = 5;
    D.setPrologueSeen(true);          // saves the staged state
  });
  await page.reload();
  await page.waitForTimeout(1500);
  const live0 = await page.evaluate(() => window.WARREN_DEBUG.skyPhraseState());
  let twoUp = false;
  try {
    await page.waitForFunction(() => window.WARREN_DEBUG.skyPhraseState().airborne === 2, null, { timeout: 9000 });
    twoUp = true;
  } catch (e) { twoUp = false; }
  const s8 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const air = D.goldfallAirborne();
    const dom = document.querySelectorAll('#world .goldfall').length;
    const before = D.getState().learning.zolBalance;
    D.catchGoldfall();                 // must take the OLDEST (P1 lane x=34)
    await new Promise(r => setTimeout(r, 300));
    const after = D.goldfallAirborne();
    return { active: D.skyPhraseState().active, air, dom,
      gained: D.getState().learning.zolBalance - before,
      remainingLeft: after.length === 1 ? after[0].left : null };
  });
  log('S8_live_opening_two_coins_oldest_first_plus1',
    live0.active && twoUp && s8.air.length === 2 && s8.dom === 2 && s8.air[0].left === '34%'
    && s8.gained === 1 && s8.remainingLeft === '58%', JSON.stringify({ live0, twoUp, s8 }));

  log('S9_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
