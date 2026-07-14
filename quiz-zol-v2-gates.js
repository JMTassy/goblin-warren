// quiz-zol-v2-gates.js — QUIZ_TO_ZOL_V2 "knowledge builds the village".
// Section-I acceptance tests. Extends V1 (still green in quiz-zol-gates.js).
// authority=false · ledger_effect=none. Drives via WARREN_DEBUG, graduated
// Warren (skipPrologue) — the quiz never exists in the crib.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(900);

  // fresh, graduated Warren (crib skipped) — deterministic state per test
  async function fresh() {
    await page.evaluate(() => window.WARREN_DEBUG.wipe());
    await page.reload(); await page.waitForTimeout(900);
    await page.evaluate(() => window.WARREN_DEBUG.skipPrologue());
    await page.waitForTimeout(200);
  }
  // answer one question; resetTries=false keeps a wrong→right retry on the same q
  async function answer(qid, choice, resetTries = true) {
    return page.evaluate(({ qid, choice, resetTries }) => {
      const D = window.WARREN_DEBUG;
      D.forceCloseQuiz();
      if (resetTries) D.quizZolResetTries();
      D.openQuizZol(qid);
      D.answerQuizZol(choice);
      return D.getQuizZolV2();
    }, { qid, choice, resetTries });
  }
  // correctIdx per bank: hallucination_q1=0, prompting_q1=1, agents_q1=1, hallucination_q2=1

  // G1 — correct first try awards exact base ZOL + a visible village effect
  await fresh();
  const g1 = await answer('prompting_q1', 1);
  log('G1_first_try_exact_zol_and_visible_effect',
    g1.zol === 10 && g1.streak === 1 && g1.effects.indexOf('learned-mushroom') >= 0 &&
    g1.villageObjects.indexOf('Learned Mushroom') >= 0,
    JSON.stringify({ zol: g1.zol, streak: g1.streak, effects: g1.effects, objs: g1.villageObjects }));

  // G2 — a wrong-then-right retry pays the reduced reward (6), never the base
  await fresh();
  const g2 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    D.forceCloseQuiz(); D.quizZolResetTries();
    D.openQuizZol('agents_q1');
    D.answerQuizZol(0);   // wrong
    D.answerQuizZol(1);   // correct, second attempt → retry reward
    return D.getQuizZolV2();
  });
  log('G2_retry_pays_reduced_not_base', g2.zol === 6, 'zol=' + g2.zol + ' (want 6)');

  // G3 — the same question can never pay twice
  await fresh();
  await answer('hallucination_q1', 0);
  const g3a = await page.evaluate(() => window.WARREN_DEBUG.getQuizZolV2().zol);
  const g3 = await answer('hallucination_q1', 0);   // answer it again
  log('G3_same_question_cannot_pay_twice', g3a === 10 && g3.zol === 10,
    'first=' + g3a + ' second=' + g3.zol);

  // G4 — a wrong answer never subtracts ZOL, and breaks the streak
  await fresh();
  await answer('prompting_q1', 1);                  // +10, streak 1
  const g4 = await answer('agents_q1', 0);          // wrong
  log('G4_wrong_never_subtracts_and_resets_streak',
    g4.zol === 10 && g4.streak === 0, JSON.stringify({ zol: g4.zol, streak: g4.streak }));

  // G5 — mute does not change the reward logic (mute is sound only)
  await fresh();
  const g5 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    D.getState().settings.muted = true;
    D.forceCloseQuiz(); D.quizZolResetTries();
    D.openQuizZol('prompting_q1'); D.answerQuizZol(1);
    return D.getQuizZolV2();
  });
  log('G5_mute_does_not_affect_reward', g5.zol === 10, 'zol=' + g5.zol);

  // G6 — tiered rewards: three DISTINCT visible effects across the bank
  await fresh();
  await answer('hallucination_q1', 0);   // lantern
  await answer('prompting_q1', 1);       // mushroom
  await answer('agents_q1', 1);          // beam
  const g6 = await page.evaluate(() => window.WARREN_DEBUG.getQuizZolV2());
  const need = ['knowledge-lantern', 'learned-mushroom', 'mended-beam'];
  log('G6_three_distinct_visible_effects',
    need.every(e => g6.effects.indexOf(e) >= 0) &&
    ['Knowledge Lantern', 'Learned Mushroom', 'Mended Beam'].every(s => g6.villageObjects.indexOf(s) >= 0),
    JSON.stringify({ effects: g6.effects, objs: g6.villageObjects }));

  // G7 — a 3-answer streak pays the bonus (+5 on the 3rd first-try correct)
  await fresh();
  await answer('hallucination_q1', 0);   // streak 1, +10
  await answer('prompting_q1', 1);       // streak 2, +10
  const g7 = await answer('agents_q1', 1); // streak 3, +10 +5 bonus
  log('G7_streak_bonus_at_three', g7.zol === 35 && g7.streak === 3 && g7.bestStreak === 3,
    JSON.stringify({ zol: g7.zol, streak: g7.streak }));

  // G8 — reload restores wallet, completed questions, and village effects
  await fresh();
  await answer('hallucination_q1', 0);
  await answer('prompting_q1', 1);
  const before = await page.evaluate(() => window.WARREN_DEBUG.getQuizZolV2());
  await page.reload(); await page.waitForTimeout(1000);
  const after = await page.evaluate(() => window.WARREN_DEBUG.getQuizZolV2());
  log('G8_reload_restores_wallet_completed_effects',
    after.zol === before.zol &&
    Object.keys(before.rewardPaid).every(k => after.rewardPaid[k]) &&
    ['Knowledge Lantern', 'Learned Mushroom'].every(s => after.villageObjects.indexOf(s) >= 0),
    JSON.stringify({ beforeZol: before.zol, afterZol: after.zol, afterObjs: after.villageObjects }));

  // G9 — the reward logs only to the game replay (no HELEN ledger in this build)
  await fresh();
  const g9 = await answer('hallucination_q1', 0);
  log('G9_logs_to_game_replay_not_kernel', g9.replayKinds.indexOf('quiz-zol') >= 0,
    'kinds=' + JSON.stringify(g9.replayKinds.slice(-4)));

  log('G10_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
