// goldfall-gates.js — gold falls from the sky; catching it pays, missing it
// costs nothing. Laws: catch pays 2-5 ZOL + writes a replay receipt · missed
// coins vanish clean · one coin at a time · no page errors.
// Not part of the shipped game — a witness script only.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // G1: spawn → one coin, falling
  const g1 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    D.spawnGoldfall();
    D.spawnGoldfall(); // second call must NOT stack a second coin
    return { active: D.goldfallActive(), coins: document.querySelectorAll('#world .goldfall').length };
  });
  log('G1_one_coin_at_a_time', g1.active && g1.coins === 1, JSON.stringify(g1));

  // G2: catch → ZOL paid, receipt written, coin gone
  const g2 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const before = D.getState().learning.zolBalance;
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 700));
    const s = D.getState();
    return {
      gained: s.learning.zolBalance - before,
      receipt: D.getReplay().some(r => r.choice === 'goldfall'),
      active: D.goldfallActive(),
      domGone: document.querySelectorAll('#world .goldfall').length === 0
    };
  });
  log('G2_catch_pays_and_receipts', g2.gained >= 2 && g2.gained <= 5 && g2.receipt && !g2.active && g2.domGone,
    JSON.stringify(g2));

  // G3: miss → coin vanishes clean, no payout, no receipt spam
  const g3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const before = D.getState().learning.zolBalance;
    const receiptsBefore = D.getReplay().filter(r => r.choice === 'goldfall').length;
    D.spawnGoldfall();
    await new Promise(r => setTimeout(r, 7400));
    const s = D.getState();
    return {
      gained: s.learning.zolBalance - before,
      newReceipts: D.getReplay().filter(r => r.choice === 'goldfall').length - receiptsBefore,
      active: D.goldfallActive(),
      domGone: document.querySelectorAll('#world .goldfall').length === 0
    };
  });
  log('G3_miss_costs_nothing', g3.gained === 0 && g3.newReceipts === 0 && !g3.active && g3.domGone,
    JSON.stringify(g3));

  // G5 (SKYFALL, witness #7): odd items pay NOTHING — a giggle, no ZOL, no sap
  const g5 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const before = { zol: D.getState().learning.zolBalance, sap: D.getState().progress.magicSap };
    D.spawnGoldfall('🍂');
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 600));
    return { zolDelta: D.getState().learning.zolBalance - before.zol,
      sapDelta: D.getState().progress.magicSap - before.sap,
      oddReceipt: D.getReplay().some(r => r.choice === 'skyfall-odd') };
  });
  log('G5_odd_catch_pays_nothing_but_a_giggle',
    g5.zolDelta === 0 && g5.sapDelta === 0 && g5.oddReceipt, JSON.stringify(g5));

  // G6: the sap-drop pays exactly +1 sap, no ZOL
  const g6 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const before = { zol: D.getState().learning.zolBalance, sap: D.getState().progress.magicSap };
    D.spawnGoldfall('🔮');
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 600));
    return { zolDelta: D.getState().learning.zolBalance - before.zol,
      sapDelta: D.getState().progress.magicSap - before.sap };
  });
  log('G6_sapdrop_pays_one_sap', g6.zolDelta === 0 && g6.sapDelta === 1, JSON.stringify(g6));

  log('G4_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
