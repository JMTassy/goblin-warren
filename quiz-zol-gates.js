// quiz-zol-gates.js — QUIZ_TO_ZOL_V1 acceptance gate
// Laws verified here:
//   QZ1: correct answer → wallet +10 (exactly)
//   QZ2: question marked paid in quizState
//   QZ3: Knowledge Lantern appears in villageState + world objects
//   QZ4: reload persistence — wallet increase AND lantern survive page reload
//   QZ5: second submission pays 0 (feedback still shown, no extra ZOL)
//   QZ6: HELEN ledger untouched (no helen_os_v1 / ledger / ndjson references in game code)
// authority=false · claim=NO_CLAIM · non-sovereign
// Run: node quiz-zol-gates.js   (requires playwright at /opt/node22/lib/node_modules/playwright)
"use strict";
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.join(__dirname, 'index.html');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  });
  const page = await (await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  })).newPage();

  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  await page.goto(URL);
  await page.waitForTimeout(1200);

  // QZ0: smoke — page loaded, WARREN_DEBUG exposes hallucination quiz API
  const qz0 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return {
      hasOpen: typeof D.openHallucinationQuiz === 'function',
      hasAnswer: typeof D.answerHallucinationQuiz === 'function',
      hasState: typeof D.getQuizZolState === 'function',
      hasQuestion: typeof D.getQuizZolQuestion === 'function',
      hasRewarded: typeof D.quizZolRewarded === 'function'
    };
  });
  log('QZ0_api_exposed', qz0.hasOpen && qz0.hasAnswer && qz0.hasState && qz0.hasQuestion && qz0.hasRewarded,
    JSON.stringify(qz0));

  // QZ1: correct answer → wallet increases by exactly 10
  const qz1 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const before = D.getState().learning.zolBalance;
    // wipe any prior state so this is always a fresh first-time answer
    D.forceCloseQuiz();
    D.getState().quizState = { rewardPaid: {} };
    D.getState().villageState = { unlockedEffects: [] };
    D.openHallucinationQuiz();
    await new Promise(r => setTimeout(r, 200));
    const correctIdx = D.getQuizZolQuestion().correctIdx;
    D.answerHallucinationQuiz(correctIdx);
    await new Promise(r => setTimeout(r, 400));
    const after = D.getState().learning.zolBalance;
    return { before, after, delta: after - before };
  });
  log('QZ1_correct_pays_exactly_10', qz1.delta === 10, `delta=${qz1.delta} (before=${qz1.before} after=${qz1.after})`);

  // QZ2: question is marked paid in quizState
  const qz2 = await page.evaluate(() => {
    return window.WARREN_DEBUG.quizZolRewarded();
  });
  log('QZ2_question_marked_paid', qz2 === true, `rewarded=${qz2}`);

  // QZ3: Knowledge Lantern in villageState and world objects
  const qz3 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const s = D.getQuizZolState();
    const inVillage = s.villageState.unlockedEffects.indexOf('knowledge-lantern') >= 0;
    const inObjects = D.getState().objects.some(o => o.sign === 'Knowledge Lantern');
    return { inVillage, inObjects };
  });
  log('QZ3_lantern_unlocked', qz3.inVillage && qz3.inObjects,
    `villageState=${qz3.inVillage} objects=${qz3.inObjects}`);

  // QZ4: reload persistence — wallet and lantern survive a page reload
  // Capture the wallet value and serialized state before reload
  const preReload = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return {
      zol: D.getState().learning.zolBalance,
      rewarded: D.quizZolRewarded(),
      lantern: D.getQuizZolState().villageState.unlockedEffects.indexOf('knowledge-lantern') >= 0
    };
  });
  await page.reload();
  await page.waitForTimeout(1200);
  const postReload = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return {
      zol: D.getState().learning.zolBalance,
      rewarded: D.quizZolRewarded(),
      lanternVillage: D.getQuizZolState().villageState.unlockedEffects.indexOf('knowledge-lantern') >= 0,
      lanternObjects: D.getState().objects.some(o => o.sign === 'Knowledge Lantern')
    };
  });
  const walletSurvived = postReload.zol === preReload.zol;
  const rewardedSurvived = postReload.rewarded === true;
  const lanternSurvived = postReload.lanternVillage && postReload.lanternObjects;
  log('QZ4a_wallet_persists_reload', walletSurvived,
    `pre=${preReload.zol} post=${postReload.zol}`);
  log('QZ4b_paid_flag_persists_reload', rewardedSurvived,
    `rewarded=${postReload.rewarded}`);
  log('QZ4c_lantern_persists_reload', lanternSurvived,
    `villageState=${postReload.lanternVillage} objects=${postReload.lanternObjects}`);

  // QZ5: second/repeat submission pays 0 (feedback shows, no extra ZOL)
  // Wait for the first quiz's close-timeout to fire before opening the second
  await page.waitForTimeout(3000);
  const qz5 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const before = D.getState().learning.zolBalance;
    // Re-open and answer correctly again — must pay 0
    D.forceCloseQuiz(); // force-close in case the 2800ms timeout hasn't fired yet
    D.openHallucinationQuiz();
    await new Promise(r => setTimeout(r, 200));
    const correctIdx = D.getQuizZolQuestion().correctIdx;
    D.answerHallucinationQuiz(correctIdx);
    await new Promise(r => setTimeout(r, 400));
    const after = D.getState().learning.zolBalance;
    const result = document.getElementById('quiz-result');
    const feedbackText = result ? result.textContent : '';
    return { delta: after - before, feedbackPresent: feedbackText.length > 0, feedback: feedbackText.slice(0, 80) };
  });
  log('QZ5_second_submission_pays_0', qz5.delta === 0,
    `delta=${qz5.delta} feedback="${qz5.feedback}"`);
  log('QZ5b_feedback_still_shown', qz5.feedbackPresent,
    `feedback present=${qz5.feedbackPresent}`);

  // QZ6: HELEN ledger untouched — game code contains no path reference to
  // helen_os_v1, town/ledger, or ndjson
  const gameJs = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');
  const hasSovPath = /helen_os_v1|town\/ledger|\.ndjson/.test(gameJs);
  log('QZ6_helen_ledger_untouched', !hasSovPath,
    hasSovPath ? 'SOVEREIGN PATH FOUND IN game.js — FAIL' : 'no sovereign path references in game.js');

  // QZ7: wrong answer does not pay and does not light lantern (fresh state test)
  await page.waitForTimeout(3000); // wait for QZ5's close-timeout
  const qz7 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.forceCloseQuiz(); // ensure clean state
    // reset to fresh
    D.getState().quizState = { rewardPaid: {} };
    D.getState().villageState = { unlockedEffects: [] };
    // remove any lantern object
    D.getState().objects = D.getState().objects.filter(o => o.sign !== 'Knowledge Lantern');
    const before = D.getState().learning.zolBalance;
    D.openHallucinationQuiz();
    await new Promise(r => setTimeout(r, 200));
    const correctIdx = D.getQuizZolQuestion().correctIdx;
    const wrongIdx = (correctIdx + 1) % 4; // any other option
    D.answerHallucinationQuiz(wrongIdx);
    await new Promise(r => setTimeout(r, 400));
    const after = D.getState().learning.zolBalance;
    const s = D.getQuizZolState();
    return {
      delta: after - before,
      paid: !!s.quizState.rewardPaid['hallucination_q1_v1'],
      lantern: s.villageState.unlockedEffects.indexOf('knowledge-lantern') >= 0
    };
  });
  log('QZ7_wrong_answer_pays_0_no_lantern',
    qz7.delta === 0 && !qz7.paid && !qz7.lantern,
    `delta=${qz7.delta} paid=${qz7.paid} lantern=${qz7.lantern}`);

  log('QZ8_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await browser.close();

  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== QUIZ_TO_ZOL_V1 gate result: ' +
    (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length + ' green ===');
  if (failed.length) {
    console.log('Failed: ' + failed.join(', '));
    process.exit(1);
  }
  process.exit(0);
})().catch(e => { console.error('GATE HARNESS ERROR:', e); process.exit(1); });
