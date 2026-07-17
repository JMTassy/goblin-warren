const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1300);
  // graduate the onboarding crib so the full UI (topbar chips, sheet) is
  // present — riddles are a post-onboarding system (no-op if already past it).
  await page.evaluate(() => window.WARREN_DEBUG.skipPrologue());
  await page.waitForTimeout(200);

  // Q1: riddle chip is visible in the topbar
  const q1 = await page.evaluate(() => {
    const c = document.getElementById('riddle-chip');
    return { present: !!c, text: c ? c.textContent : '' };
  });
  log('Q1_riddle_chip_visible', q1.present && q1.text.includes('Riddle'), JSON.stringify(q1));

  // Q2: tapping the riddle chip opens the quiz sheet with a question + options
  await page.tap('#riddle-chip');
  await page.waitForTimeout(500);
  const q2 = await page.evaluate(() => {
    const sheet = document.getElementById('sheet-quiz');
    return { visible: !sheet.classList.contains('hidden'),
             q: document.getElementById('quiz-text').textContent,
             opts: document.querySelectorAll('#quiz-buttons .qbtn').length };
  });
  log('Q2_quiz_opens_on_tap', q2.visible && q2.q.length > 4 && q2.opts >= 2, JSON.stringify(q2));

  // Q3: answering pays ZOL (accessible economy). KIND-AWARE: buildQuiz()
  // returns an ethics "conversation" quiz 35% of the time (game.js:7173)
  // with correct:null — every stance pays 10-12, so any option certifies
  // the economy. The old find-by-correct matched nothing on ethics draws,
  // clicked nothing, and flaked FAIL "+0 ZOL" at exactly ~35%.
  const q3 = await page.evaluate(async () => {
    const before = window.WARREN_DEBUG.getState().learning.zolBalance;
    const quiz = window.WARREN_DEBUG.getQuiz();
    const btns = [...document.querySelectorAll('#quiz-buttons .qbtn')];
    const b = quiz.kind === 'ethics' ? btns[0] : btns.find(x => x.textContent === quiz.correct);
    if (b) b.click();
    await new Promise(r => setTimeout(r, 400));
    return { kind: quiz.kind || 'knowledge',
      delta: window.WARREN_DEBUG.getState().learning.zolBalance - before };
  });
  log('Q3_quiz_pays', q3.delta >= 10, `+${q3.delta} ZOL (${q3.kind})`);
  await page.waitForTimeout(2800);

  // Q3b (regression for the flake): force the 35% ethics branch
  // deterministically — it must ALSO pay. Fails under the old logic.
  const q3b = await page.evaluate(async () => {
    window.WARREN_DEBUG.forceEthicsQuiz();
    const before = window.WARREN_DEBUG.getState().learning.zolBalance;
    const quiz = window.WARREN_DEBUG.getQuiz();
    const btns = [...document.querySelectorAll('#quiz-buttons .qbtn')];
    const b = quiz.kind === 'ethics' ? btns[0] : btns.find(x => x.textContent === quiz.correct);
    if (b) b.click();
    await new Promise(r => setTimeout(r, 400));
    return { kind: quiz.kind, delta: window.WARREN_DEBUG.getState().learning.zolBalance - before };
  });
  log('Q3b_ethics_conversation_also_pays', q3b.kind === 'ethics' && q3b.delta >= 10,
    `+${q3b.delta} ZOL (${q3b.kind})`);
  await page.waitForTimeout(600);

  // C1: chat input renders in Lulu's care panel
  await page.evaluate(() => window.WARREN_DEBUG.openCard('lulu'));
  await page.waitForTimeout(400);
  const c1 = await page.evaluate(() => ({
    input: !!document.getElementById('lulu-input'),
    send: !!document.getElementById('lulu-send'),
    thread: !!document.getElementById('lulu-chat')
  }));
  log('C1_chat_ui_present', c1.input && c1.send && c1.thread, JSON.stringify(c1));

  // C2: typing to Lulu produces a reply (offline responder) + raises connection + logs replay
  const c2 = await page.evaluate(async () => {
    const before = window.WARREN_DEBUG.getLulu().needs.connection;
    window.WARREN_DEBUG.luluSay('hello Lulu, do you like gold?');
    await new Promise(r => setTimeout(r, 600));
    const chat = window.WARREN_DEBUG.getLuluChat();
    const s = window.WARREN_DEBUG.getState();
    return {
      you: chat.some(c => c.who === 'you' && /gold/.test(c.text)),
      reply: chat.some(c => c.who === 'lulu' && c.text.length > 2 && !c.pending),
      conn: window.WARREN_DEBUG.getLulu().needs.connection - before,
      replay: s.replay.some(r => r.choice === 'lulu-chat')
    };
  });
  log('C2_lulu_replies', c2.you && c2.reply && c2.conn > 0 && c2.replay, JSON.stringify(c2));

  // C3: offline reply is context-aware (mentions ZOL when asked about gold)
  const c3 = await page.evaluate(() => {
    const r1 = window.WARREN_DEBUG.luluOfflineReply('how much gold do we have?');
    const r2 = window.WARREN_DEBUG.luluOfflineReply('are you tired?');
    return { gold: /zol/i.test(r1), reply2: r2.length > 4, distinct: r1 !== r2 };
  });
  log('C3_context_aware', c3.gold && c3.reply2 && c3.distinct, JSON.stringify(c3));

  // C4: chatting from the cave brings her back
  const c4 = await page.evaluate(async () => {
    const s = window.WARREN_DEBUG.getLulu();
    window.WARREN_DEBUG.setLuluNeeds({ energy: 50, curiosity: 50, connection: 10 });
    s.inCave = true;
    window.WARREN_DEBUG.luluSay('come back, I missed you');
    await new Promise(r => setTimeout(r, 500));
    return !window.WARREN_DEBUG.getLulu().inCave;
  });
  log('C4_chat_reconnects', c4, `reconnected=${c4}`);

  // C5: chat persists across reload
  const before = await page.evaluate(() => window.WARREN_DEBUG.getLuluChat().length);
  await page.reload(); await page.waitForTimeout(1000);
  const after = await page.evaluate(() => window.WARREN_DEBUG.getLuluChat().length);
  log('C5_chat_persists', after > 0 && after === Math.min(before, 12), `before=${before} after=${after}`);

  await page.screenshot({ path: '/tmp/claude-0/-home-user-goblin-warren/9926ca51-6861-5e47-ab28-c05501ea0895/scratchpad/qa/22-lulu-chat.png' });
  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
