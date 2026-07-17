// echo-solfege-gates.js — SOLFÈGE INITIATION V0 (operator witness #8: the
// game as "a great instrument for solfeggio initiation" · claim=NO_CLAIM —
// wonder and play, never medicine). Laws under test:
//   · the falling scale: every true skyfall catch walks the six-degree
//     ladder up-then-down; odd items ring flat and the ladder holds
//   · Lulu's echo appears via debug trigger in Worlds 1-2 with >=2 keys
//   · the correct sequence delights (mood + shimmer, cues cleared)
//   · a wrong tap never punishes — she re-hums once, then lets go warmly,
//     with zero ZOL movement either way
//   · the echo expires clean (state null, cues gone) and never spawns
//     during the crib or an open quiz
//   · no page errors anywhere
// Not part of the shipped game — a witness script only.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  const url = 'file://' + path.join(__dirname, 'index.html');
  await page.goto(url);
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1400);

  // E1: during the crib the echo refuses to spawn (never during the crib)
  const e1 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const crib = D.getCribState().active;
    const echo = D.triggerEcho();
    return { crib, active: echo.active };
  });
  log('E1_no_echo_during_crib', e1.crib === true && e1.active === false, JSON.stringify(e1));

  // enter staged World 1 via the player's own skip button (Mario law path)
  await page.evaluate(() => document.getElementById('prologue-skip').click());
  await page.waitForTimeout(1200);
  const world = await page.evaluate(() => window.WARREN_DEBUG.getWorld());
  log('E2_skip_lands_in_staged_world1', world.staged && world.world === 1, JSON.stringify(world));

  // E3: the falling scale — seven true catches walk 396→417→528→639→741→852→741
  const e3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const rung = [];
    for (let i = 0; i < 7; i++) {
      const before = D.skyScaleStep();
      rung.push(D.skyScaleFreq(before));
      D.spawnGoldfall('🪙');
      await new Promise(r => setTimeout(r, 120));
      D.catchGoldfall();
      await new Promise(r => setTimeout(r, 120));
      if (D.skyScaleStep() !== before + 1) return { fail: 'step did not advance at ' + i, rung };
    }
    return { rung, step: D.skyScaleStep() };
  });
  const wantRung = [396, 417, 528, 639, 741, 852, 741];
  log('E3_catches_walk_the_ladder_up_then_down',
    !e3.fail && JSON.stringify(e3.rung) === JSON.stringify(wantRung) && e3.step === 7,
    JSON.stringify(e3));

  // E4: an odd catch rings flat and the ladder HOLDS (no advance, no ZOL)
  const e4 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const stepBefore = D.skyScaleStep();
    const zolBefore = D.getState().learning.zolBalance;
    D.spawnGoldfall('🪨');
    await new Promise(r => setTimeout(r, 120));
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 300));
    return { held: D.skyScaleStep() === stepBefore, zolSame: D.getState().learning.zolBalance === zolBefore };
  });
  log('E4_odd_catch_flat_note_ladder_holds', e4.held && e4.zolSame, JSON.stringify(e4));

  // E5: echo appears via debug trigger once >=2 keys exist — motif of 2,
  // keys glowing (.echo-key), Lulu asking in kid-words (no Hz on screen)
  const e5 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.addObject('🌸', 'Our First Bloom', 'tree');
    D.addObject('🪔', 'Knowledge Lantern', 'gate');
    const st = D.triggerEcho();
    await new Promise(r => setTimeout(r, 300));
    const bub = document.querySelector('#goblin-lulu .bubble');
    return { active: st.active, motifLen: (st.motif || []).length, keys: st.keys,
      cues: document.querySelectorAll('.echo-key').length,
      bubble: bub ? bub.textContent : null };
  });
  log('E5_echo_appears_with_keys_and_kid_words',
    e5.active && e5.motifLen === 2 && e5.keys.length >= 2 &&
    e5.cues === e5.keys.length &&
    !!e5.bubble && e5.bubble.indexOf('sing it back') !== -1 && !/\d/.test(e5.bubble),
    JSON.stringify(e5));

  // E6: tapping the motif back delights her — mood, shimmer path, cues cleared
  const e6 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const st = D.getEchoSolfa();
    D.tapEchoKey(st.motif[0]);
    await new Promise(r => setTimeout(r, 150));
    D.tapEchoKey(st.motif[1]);
    await new Promise(r => setTimeout(r, 300));
    const bub = document.querySelector('#goblin-lulu .bubble');
    return { done: !D.getEchoSolfa().active,
      cues: document.querySelectorAll('.echo-key').length,
      mood: D.getState().goblins.lulu.mood,
      bubble: bub ? bub.textContent : null };
  });
  log('E6_correct_sequence_delights',
    e6.done && e6.cues === 0 && e6.mood === 'delighted' &&
    !!e6.bubble && e6.bubble.indexOf('sang it back') !== -1,
    JSON.stringify(e6));

  // E7: wrong taps never punish — first stray re-hums once (still active,
  // progress reset), second stray ends warmly; ZOL untouched throughout
  const e7 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const zolBefore = D.getState().learning.zolBalance;
    let st = D.triggerEcho();
    if (!st.active) return { fail: 'echo did not respawn' };
    const wrong = st.keys.filter(k => k !== st.motif[0])[0];
    D.tapEchoKey(wrong);
    await new Promise(r => setTimeout(r, 200));
    const mid = D.getEchoSolfa();
    await new Promise(r => setTimeout(r, 1600));            // she hums it again once
    const cuesMid = document.querySelectorAll('.echo-key').length;
    st = D.getEchoSolfa();
    const wrong2 = st.keys.filter(k => k !== st.motif[0])[0];
    D.tapEchoKey(wrong2);
    await new Promise(r => setTimeout(r, 300));
    return {
      stillActiveAfterFirst: mid.active && mid.retried && mid.progress === 0,
      cuesStayedForRetry: cuesMid > 0,
      endedWarmAfterSecond: !D.getEchoSolfa().active,
      cuesGone: document.querySelectorAll('.echo-key').length === 0,
      zolSame: D.getState().learning.zolBalance === zolBefore
    };
  });
  log('E7_wrong_never_punishes',
    !e7.fail && e7.stillActiveAfterFirst && e7.cuesStayedForRetry &&
    e7.endedWarmAfterSecond && e7.cuesGone && e7.zolSame,
    JSON.stringify(e7));

  // E8: an untouched echo expires clean — silently, state null, cues gone
  const e8 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const st = D.triggerEcho();
    if (!st.active) return { fail: 'echo did not respawn' };
    D.expireEcho();
    await new Promise(r => setTimeout(r, 200));
    return { gone: !D.getEchoSolfa().active,
      cues: document.querySelectorAll('.echo-key').length };
  });
  log('E8_expires_clean', !e8.fail && e8.gone && e8.cues === 0, JSON.stringify(e8));

  // E9: never during a quiz — the trigger politely declines and reschedules
  const e9 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.forcePromptQuiz();
    const st = D.triggerEcho();
    D.forceCloseQuiz();
    return { active: st.active };
  });
  log('E9_no_echo_during_quiz', e9.active === false, JSON.stringify(e9));

  // E10: no page errors across the whole run
  log('E10_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const fails = Object.keys(results).filter(k => !results[k]);
  console.log(fails.length ? 'ECHO-SOLFEGE GATES: ' + fails.length + ' FAILED' : 'ECHO-SOLFEGE GATES: all ' + Object.keys(results).length + ' passed');
  process.exit(fails.length ? 1 : 0);
})();
