// qa-hardening-gates.js — regression gates for the WORLDS-13 QA-swarm fixes
// (three QA runs against WORLDS-12: normal / bad-player / adversarial).
// Laws under test:
//   · H1 a well-SHAPED tampered save cannot walk hostile numbers past loadState:
//        zolBalance -9999 → 0, rung 99 → 12, fauxGemLessons "banana" → 0
//   · H2 wipe() latches the session: no later saveState() resurrects the save
//        (the confirmed mechanism behind the old G5 flake)
//   · H3 the World-3 Gerald arc never gate-crashes a staged World-1 reload
//        (resumeAfterReload carries the same Worlds gate as bootScriptedArc)
//   · H4 an EARNED world falls at the milestone moment itself — the second paid
//        lantern answer spawns the arrival star with no reload and no renderAll
//   · H5 tree taps in World 1 do not summon the Moth's quiz (it is World 2's toy)
//   · H6 the world-open receipt survives an instant reload (saveState after push)
//   · H7 answering the hallucination quiz then closing it inside the 350ms
//        reaction window no longer null-derefs currentQuiz
//   · H8 .wobject is user-select:none — the hearth rub can't start a native
//        text-selection drag that silently eats every later pointermove
//   · H9 no page errors anywhere in this file
// Not part of the shipped game — a witness script only.
// Usage: node qa-hardening-gates.js [path-to-index.html]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const PAGE = 'file://' + (process.argv[2] || path.join(__dirname, 'index.html'));
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(PAGE);
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1300);

  // H1: a graduated save, then hostile-but-well-shaped numbers written into it
  await page.evaluate(() => { window.WARREN_DEBUG.skipPrologue(); });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const key = 'goblin_warren_v1_state';
    const s = JSON.parse(localStorage.getItem(key));
    s.learning.zolBalance = -9999;
    s.progress.rung = 99;
    s.flags.fauxGemLessons = 'banana';
    localStorage.setItem(key, JSON.stringify(s));
  });
  await page.reload();
  await page.waitForTimeout(1300);
  const h1 = await page.evaluate(() => {
    const S = window.WARREN_DEBUG.getState();
    return { zol: S.learning.zolBalance, rung: S.progress.rung, lessons: S.flags.fauxGemLessons };
  });
  log('H1_tampered_save_numbers_clamped', h1.zol === 0 && h1.rung === 12 && h1.lessons === 0, JSON.stringify(h1));

  // H2: wipe latch — a direct post-wipe saveState (award writes) must NOT resurrect
  const h2 = await page.evaluate(() => {
    window.WARREN_DEBUG.wipe();
    window.WARREN_DEBUG.award(0, 1);            // earn() → saveState() — pre-fix this rewrote the key
    return localStorage.getItem('goblin_warren_v1_state') === null;
  });
  log('H2_wipe_latch_blocks_resurrection', h2, 'save stayed wiped after a post-wipe saveState=' + h2);

  // fresh staged World-1 session for H3/H4/H5 (same pattern as bram-gates B1)
  await page.reload();
  await page.waitForTimeout(1300);
  await page.evaluate(() => {
    const D = window.WARREN_DEBUG, S = D.getState();
    S.progress.worldStaged = true;
    S.progress.rung = 5;
    D.setPrologueSeen(true);
  });
  await page.reload();
  await page.waitForTimeout(1000);

  // H3: 18s of staged World-1 idle — the Gerald arc (bug + proposal at 3s/9-16s
  // pre-fix) must never fire; Lulu's quiz door must stay open
  const h3start = await page.evaluate(() => ({
    world: window.WARREN_DEBUG.getWorld().world,
    proposal: !!window.WARREN_DEBUG.getState().activeProposal
  }));
  await page.waitForTimeout(18000);
  const h3 = await page.evaluate(() => ({
    world: window.WARREN_DEBUG.getWorld().world,
    proposal: !!window.WARREN_DEBUG.getState().activeProposal,
    critter: !!document.querySelector('.bug-critter'),
    signal: (window.WARREN_DEBUG.getState().world.currentSignal || null) !== null
  }));
  log('H3_gerald_arc_stays_out_of_world1',
    h3start.world === 1 && !h3start.proposal && h3.world === 1 && !h3.proposal && !h3.critter && !h3.signal,
    JSON.stringify({ h3start, h3 }));

  // H5 (while still World 1): a tree tap must NOT summon the Moth's quiz
  const h5 = await page.evaluate(async () => {
    document.getElementById('zone-tree').click();
    await new Promise(r => setTimeout(r, 500));
    const sheet = document.getElementById('sheet-quiz');
    return { hidden: !sheet || sheet.classList.contains('hidden') };
  });
  log('H5_tree_tap_no_quiz_in_world1', h5.hidden, JSON.stringify(h5));

  // H4: the milestone IS the cue — the second paid lantern answer must spawn
  // the arrival star in THIS session, no reload, no unrelated renderAll
  const h4 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const bank = D.quizZolBank();
    for (let i = 0; i < 2; i++) {
      D.forceCloseQuiz();
      D.openQuizZol(bank[i].id);
      D.answerQuizZol(bank[i].correctIdx);
      await new Promise(r => setTimeout(r, 300));
    }
    await new Promise(r => setTimeout(r, 700));
    return { paid: Object.keys(D.getQuizZolState().quizState.rewardPaid).length,
      earned: D.getWorld().earned,
      star: !!document.querySelector('.arrival-star'),
      pending: D.arrivalPending ? D.arrivalPending() : null };
  });
  log('H4_star_falls_at_the_milestone', h4.paid >= 2 && h4.earned >= 2 && h4.star, JSON.stringify(h4));

  // H6: catch the star, then reload INSTANTLY — the world-open receipt must survive
  await page.evaluate(() => window.WARREN_DEBUG.catchArrival());
  await page.goto(PAGE);                          // no wait: the receipt must already be on disk
  await page.waitForTimeout(1300);
  const h6 = await page.evaluate(() => ({
    world: window.WARREN_DEBUG.getWorld().world,
    receipt: window.WARREN_DEBUG.getState().replay.some(r => r.choice === 'world-open')
  }));
  log('H6_world_open_receipt_survives_instant_reload', h6.world === 2 && h6.receipt, JSON.stringify(h6));

  // H7: answer the hallucination quiz then force-close inside the 350ms
  // reaction window — pre-fix this threw "Cannot read properties of null"
  const errsBefore = errs.length;
  await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.forceCloseQuiz();
    D.openHallucinationQuiz();
    D.answerHallucinationQuiz(0);                 // correctIdx of the V1 question
    D.forceCloseQuiz();                           // null the global inside the window
    await new Promise(r => setTimeout(r, 700));
  });
  log('H7_quiz_reaction_timer_no_null_deref', errs.length === errsBefore,
    errs.slice(errsBefore).join(' | ') || 'clean');

  // H8: .wobject must refuse native text selection (the hearth-rub killer)
  const h8 = await page.evaluate(() => {
    const el = document.createElement('div');
    el.className = 'wobject';
    document.getElementById('world').appendChild(el);
    const us = getComputedStyle(el).userSelect || getComputedStyle(el).webkitUserSelect;
    el.remove();
    return us;
  });
  log('H8_wobject_user_select_none', h8 === 'none', 'user-select=' + h8);

  log('H9_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
