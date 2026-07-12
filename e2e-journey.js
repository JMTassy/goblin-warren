// E2E player journey — REAL TAPS ONLY after moth spawn (the only debug assist
// is spawnMoth, whose natural timer is 45-80s). Proves what a thumb can do:
// moth → answer → moth → answer → moth → answer → wallet → BUY → Pip → BUILD
// → wait for Pip's AUTONOMOUS clarify on her own tick.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const DIR = '/home/user/goblin-warren';
const URL = 'file://' + path.join(DIR, 'index.html');
const results = {};
function log(name, pass, detail) {
  results[name] = pass;
  console.log((pass ? 'PASS ' : 'FAIL ') + name + ' — ' + detail);
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL);
  await page.waitForTimeout(2000);

  // Earn 30 ZOL with three real quiz rounds
  for (let round = 1; round <= 3; round++) {
    await page.evaluate(() => window.WARREN_DEBUG.spawnMoth());
    await page.waitForTimeout(500);
    await page.tap('.moth', { force: true });      // TAP the moth (it never stops fluttering — force skips Playwright's stability wait)
    await page.waitForTimeout(400);
    const correct = await page.evaluate(() => window.WARREN_DEBUG.getQuiz().correct);
    const btns = await page.$$('#quiz-buttons .qbtn');
    let tapped = false;
    for (const b of btns) {
      if ((await b.textContent()) === correct) { await b.tap(); tapped = true; break; }
    }
    if (!tapped) { log('J1_quiz_round_' + round, false, 'correct option button not found'); break; }
    await page.waitForTimeout(3000);               // result + cooldown
  }
  const zol = await page.evaluate(() => window.WARREN_DEBUG.getState().learning.zolBalance);
  log('J1_three_quizzes_30_zol', zol >= 30, `zolBalance=${zol}`);

  // Wallet shows the balance and opens the shop by TAP
  const walletText = await page.textContent('#zol-wallet');
  await page.tap('#zol-wallet');
  await page.waitForTimeout(400);
  const shopOpen = await page.evaluate(() => !document.getElementById('sheet-zol-shop').classList.contains('hidden'));
  log('J2_wallet_tap_opens_shop', shopOpen && walletText.includes(String(zol)), `wallet="${walletText}" shopOpen=${shopOpen}`);

  // TAP BUY on Signpost Grove
  await page.tap('.zol-buy-btn[data-territory="signpost-grove"]');
  await page.waitForTimeout(500);
  const modalOpen = await page.evaluate(() => !document.getElementById('territory-build').classList.contains('hidden'));
  log('J3_buy_opens_builder_modal', modalOpen, `modalOpen=${modalOpen}`);

  // TAP Pip, TAP BUILD
  await page.tap('.territory-builder-btn[data-goblin="pip"]');
  await page.waitForTimeout(200);
  await page.tap('#territory-build-confirm');
  await page.waitForTimeout(2400);                 // walk + completion
  const built = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { owned: s.territories.owned.some(t => t.id === 'signpost-grove'), ability: s.npcAbilities.pip.clarifySign, zol: s.learning.zolBalance };
  });
  log('J4_build_completes_grants_ability', built.owned && built.ability && built.zol === zol - 30, JSON.stringify(built));

  // Pip clarifies AUTONOMOUSLY on her own scheduled tick — no debug tick, just wait
  let clarified = false;
  for (let i = 0; i < 12 && !clarified; i++) {
    await page.waitForTimeout(2000);
    clarified = await page.evaluate(() => window.WARREN_DEBUG.getWorldSigns().westPath.clarified);
  }
  log('J5_pip_clarifies_on_own_tick', clarified, `clarified=${clarified} (waited for natural tick)`);

  const replayOnce = await page.evaluate(() => window.WARREN_DEBUG.getState().replay.filter(r => r.choice === 'clarify-sign').length);
  log('J6_replay_logged_once', replayOnce === 1, `entries=${replayOnce}`);

  const realErrors = errors.filter(e => !e.includes('cloudfront') && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET/.test(e));
  log('J7_no_console_errors', realErrors.length === 0, JSON.stringify(realErrors));

  await page.screenshot({ path: '/tmp/claude-0/-home-user-goblin-warren/9926ca51-6861-5e47-ab28-c05501ea0895/scratchpad/qa/8-journey-end.png' });
  await browser.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  if (failed.length) { console.log('Failed: ' + failed.join(', ')); process.exit(1); }
  process.exit(0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
