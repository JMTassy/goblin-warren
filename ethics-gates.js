// ethics-gates.js — GOBLIN QUESTIONS (ethics as relationship, not curriculum).
// Laws: never a lecture (a biased goblin asks) · no wrong answer, no
// punishment (every stance pays > 0, the streak is untouched) · stances are
// remembered · every 3rd conversation the Warren notices your style out
// loud · receipts written · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // E1: pool shape — ≥10 questions, every option pays >0, every goblin real,
  // no option marked correct (there is no test hiding in the conversation)
  const e1 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const pool = D.getEthicsPool();
    // askers are crew goblins OR Gerald — the neighbor NPC is a legitimate
    // voice (his mood-shift is a guarded no-op; his lines carry him)
    const goblinsOk = pool.every(q => !!D.getState().goblins[q.goblin] || q.goblin === 'gerald');
    const allPay = pool.every(q => q.options.every(o => o.zol > 0));
    const allStanced = pool.every(q => q.options.every(o => typeof o.stance === 'string' && o.stance.length));
    const allMoody = pool.every(q => q.options.every(o => typeof o.mood === 'string'));
    return { n: pool.length, goblinsOk, allPay, allStanced, allMoody };
  });
  log('E1_pool_shape', e1.n >= 10 && e1.goblinsOk && e1.allPay && e1.allStanced && e1.allMoody, JSON.stringify(e1));

  // E2: the sheet says out loud that there is no wrong answer
  const e2 = await page.evaluate(() => {
    window.WARREN_DEBUG.forceEthicsQuiz();
    return document.getElementById('quiz-head').textContent;
  });
  log('E2_no_wrong_answer_declared', /no wrong answer/.test(e2), e2);

  // E3: answering pays, records the stance, moves the goblin, writes a receipt,
  // and does NOT touch the quiz streak in either direction
  const e3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG, s = D.getState();
    s.learning.quizStreak = 2;
    const q = D.forceEthicsQuiz();
    const zolBefore = s.learning.zolBalance;
    D.answerQuiz2(q.options[0]);
    await new Promise(r => setTimeout(r, 400));
    return {
      paid: s.learning.zolBalance - zolBefore,
      streak: s.learning.quizStreak,
      stanceCount: Object.keys(D.getEthics().stances).length,
      receipt: D.getReplay().some(r => r.choice === 'ethics'),
      goblinMoved: s.goblins[q.goblin].memory.includes('hard question')
    };
  });
  log('E3_conversation_not_test', e3.paid > 0 && e3.streak === 2 && e3.stanceCount >= 1 && e3.receipt && e3.goblinMoved,
    JSON.stringify(e3));

  // E4: after 3 conversations, the Warren notices your style out loud
  const e4 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    for (let i = 0; i < 2; i++) {
      const q = D.forceEthicsQuiz();
      D.answerQuiz2(q.options[0]);
      await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 1600));
    const noticed = D.getReplay().some(r => r.event === 'It noticed your style');
    const style = D.ethicalStyle();
    const answered = D.getEthics().answered.length;
    return { answered, noticed, style, treeLine: document.getElementById('tree-text').textContent };
  });
  log('E4_warren_notices_style', e4.answered === 3 && e4.noticed && !!e4.style && /You/.test(e4.treeLine),
    JSON.stringify(e4));

  // E5: style is deterministic from the same answers
  const e5 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return { a: D.ethicalStyle(), b: D.ethicalStyle() };
  });
  log('E5_style_deterministic', e5.a === e5.b && !!e5.a, JSON.stringify(e5));

  log('E6_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
