// bram-gates.js — BRAM, THE SECOND VOICE (Bonding Ladder Rung 6; operator
// cast sheet "BRAM // REPAIRER", trace bias = WARNING) and THE FAUX JOYAU
// (operator-locked CORRUPTED_GEM). Laws under test:
//   · B1 no Bram in World 1 — he arrives with the forge's world, not before
//   · B2 arrival at World 2: one line, then a reload keeps him (S.flags.bramArrived)
//   · B3 the core-four save contract is untouched (GOBLIN_DEFS stays 4; Bram additive like Tink)
//   · B4 his WARNING bias fires when an announced hazard spawns — throttled >=20s —
//        and a caught rock earns one head-shake ("We LEARN this.")
//   · B5 the faux joyau's FIRST-ever catch costs nothing (lesson counter 0→1, receipt)
//   · B6 every later catch costs exactly 2 ZOL, never below 0, and leaves a
//        soot mark that cleans itself within ~4.5s
//   · B7 the faux joyau never appears in a World-1 plan (first deception comes
//        after the stone is learned); the W2 plan carries it twice per loop with
//        timing/economy byte-identical to the leaf it replaces
//   · B8 no page errors anywhere
// Not part of the shipped game — a witness script only.
// Usage: node bram-gates.js [path-to-index.html]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const PAGE_FILE = process.argv[2] || path.join(__dirname, 'index.html');
const PAGE = 'file://' + PAGE_FILE;
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(PAGE);
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1400);

  // B3: core-four save contract untouched — a fresh state holds EXACTLY the
  // four founding goblins (Bram is additive, outside GOBLIN_DEFS, like Tink).
  const b3live = await page.evaluate(() => {
    const S = window.WARREN_DEBUG.getState();
    return { ids: Object.keys(S.goblins).sort(), bram: !!S.goblins.bram };
  });
  const src = fs.readFileSync(path.join(path.dirname(PAGE_FILE), 'game.js'), 'utf8');
  const defsBlock = (src.match(/var GOBLIN_DEFS = \[([\s\S]*?)\];/) || [null, ''])[1];
  const defsIds = (defsBlock.match(/id:\s*"/g) || []).length;
  const contractLine = /s\.goblins\.lulu && s\.goblins\.pip && s\.goblins\.zaz && s\.goblins\.nib/.test(src);
  log('B3_core_four_contract_untouched',
    b3live.ids.join(',') === 'lulu,nib,pip,zaz' && !b3live.bram && defsIds === 4
    && !/bram/.test(defsBlock) && contractLine,
    JSON.stringify({ live: b3live, defsIds, bramInDefs: /bram/.test(defsBlock), contractLine }));

  // B5: the faux joyau's FIRST-ever catch — zero loss, lesson counter 0→1,
  // a receipt, and the falling el is visually distinct (.faux-gem class:
  // the fairness law — recognizable without color or sound alone).
  const b5 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const before = D.getState().learning.zolBalance;
    const lessons0 = D.getState().flags.fauxGemLessons || 0;
    D.spawnGoldfall('🔥');
    const distinct = !!document.querySelector('#world .goldfall.faux-gem');
    const wisp = distinct && getComputedStyle(document.querySelector('#world .goldfall.faux-gem'), '::after').content.indexOf('〰') !== -1;
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 600));
    return { lessons0, distinct, wisp,
      zolDelta: D.getState().learning.zolBalance - before,
      lessons: D.getState().flags.fauxGemLessons,
      receipt: D.getReplay().some(r2 => r2.choice === 'faux-gem'),
      domGone: document.querySelectorAll('#world .goldfall').length === 0 };
  });
  log('B5_first_faux_catch_free_lesson',
    b5.lessons0 === 0 && b5.distinct && b5.wisp && b5.zolDelta === 0 && b5.lessons === 1
    && b5.receipt && b5.domGone, JSON.stringify(b5));

  // B6: the second catch costs EXACTLY 2 ZOL and soots the ground; the soot
  // cleans itself within ~4.5s; a poor pocket is never pushed below 0.
  const b6a = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.getState().learning.zolBalance = 10;
    const receipts0 = D.getReplay().filter(r2 => r2.choice === 'faux-gem').length;
    D.spawnGoldfall('🔥');
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 300));
    return { bal: D.getState().learning.zolBalance,
      soot: document.querySelectorAll('#world .soot-mark').length,
      lessons: D.getState().flags.fauxGemLessons,
      newReceipts: D.getReplay().filter(r2 => r2.choice === 'faux-gem').length - receipts0 };
  });
  await page.waitForTimeout(4600);
  const b6b = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const sootGone = document.querySelectorAll('#world .soot-mark').length === 0;
    D.getState().learning.zolBalance = 1;      // a poor pocket
    D.spawnGoldfall('🔥');
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 300));
    return { sootGone, bal: D.getState().learning.zolBalance };
  });
  log('B6_second_catch_minus2_never_below_0_soot_cleans',
    b6a.bal === 8 && b6a.soot === 1 && b6a.lessons === 2 && b6a.newReceipts === 1
    && b6b.sootGone && b6b.bal === 0, JSON.stringify({ b6a, b6b }));

  // B1: a staged World-1 session has NO Bram — not in state, not in the DOM.
  await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const S = D.getState();
    S.progress.worldStaged = true;
    S.progress.rung = 5;
    D.setPrologueSeen(true);          // saves the staged state
  });
  await page.reload();
  await page.waitForTimeout(1500);
  const b1 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return { world: D.getWorld().world, bram: D.getBram() };
  });
  log('B1_no_bram_in_world_1',
    b1.world === 1 && !b1.bram.inState && !b1.bram.inDom && !b1.bram.arrived,
    JSON.stringify(b1));

  // B7: the faux joyau is ABSENT from the World-1 sky plan (it falls as the
  // honest leaf there), present twice-per-loop in the World-2 plan, and the
  // two plans are byte-identical in timing and worth (S5/S6/S7 by design).
  const b7 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const p1 = D.skyPhrasePlan(300000, 1), p2 = D.skyPhrasePlan(300000, 2);
    const strip = p => JSON.stringify(p.map(d => [d.t, d.land, d.zol, d.x]));
    return {
      fauxW1: p1.filter(d => d.kind === 'fauxGem').length,
      fauxW2: p2.filter(d => d.kind === 'fauxGem').length,
      leafSubbed: p1.filter((d, i) => p2[i].kind === 'fauxGem' && d.kind === 'odd' && d.glyph === '🍂').length,
      sameTimingAndWorth: strip(p1) === strip(p2),
      zolW1: p1.reduce((s, d) => s + (d.zol || 0), 0),
      zolW2: p2.reduce((s, d) => s + (d.zol || 0), 0)
    };
  });
  log('B7_faux_absent_from_W1_plan_twice_in_W2_economy_identical',
    b7.fauxW1 === 0 && b7.fauxW2 >= 2 && b7.leafSubbed === b7.fauxW2
    && b7.sameTimingAndWorth && b7.zolW1 === b7.zolW2 && b7.zolW1 >= 25 && b7.zolW1 <= 40,
    JSON.stringify(b7));

  // B2: earn World 2 (two lantern rewards), catch the arrival star — the
  // forge's world opens and Bram walks in with his one line…
  await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const S = D.getState();
    S.quizState.rewardPaid = { gate_q1: true, gate_q2: true };   // World-1 loop done
    D.setPrologueSeen(true);          // saves
    D.checkWorldAdvance();            // the star falls…
    D.catchArrival();                 // …and is caught: openWorld(2) → bramArrive()
  });
  let arrivalLine = false;
  try {
    await page.waitForFunction(() => {
      const el = document.querySelector('#goblin-bram .bubble');
      return !!el && /I fix things/.test(el.textContent);
    }, null, { timeout: 7000 });
    arrivalLine = true;
  } catch (e) { arrivalLine = false; }
  const b2a = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return { world: D.getWorld().world, bram: D.getBram(),
      receipt: D.getReplay().some(r2 => r2.choice === 'arrival' && /Bram/.test(r2.visibleChange)) };
  });
  // …then a reload keeps him (S.flags.bramArrived, ensureBram at boot).
  await page.reload();
  await page.waitForTimeout(1500);
  const b2b = await page.evaluate(() => window.WARREN_DEBUG.getBram());
  log('B2_arrives_at_world2_with_line_and_persists_reload',
    b2a.world === 2 && b2a.bram.inState && b2a.bram.inDom && b2a.bram.arrived
    && arrivalLine && b2a.receipt && b2b.inState && b2b.inDom && b2b.arrived,
    JSON.stringify({ arrivalLine, b2a, b2b }));

  // B4: the WARNING bias — an announced hazard spawns, Bram ducks and hollers;
  // a second hazard inside 20s stays quiet (throttle); a CAUGHT rock earns his
  // one head-shake line. The sky-phrase conductor is dismissed first so the
  // scripted rain can't shuffle the pool under the debug spawns.
  const b4 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.endSkyPhrases();
    for (let i = 0; i < 4 && D.goldfallActive(); i++) {   // drain any airborne phrase drops
      D.catchGoldfall();
      await new Promise(r => setTimeout(r, 60));
    }
    await new Promise(r => setTimeout(r, 600));           // let caught els clear
    D.setBramWarnAt(0);                                   // throttle window open
    D.spawnGoldfall('🪨');
    await new Promise(r => setTimeout(r, 150));
    const bub1 = document.querySelector('#goblin-bram .bubble');
    const warned = !!bub1 && /LIAR|Duck! Not treasure|BITES/.test(bub1.textContent);
    const warnAt1 = D.getBram().lastWarnAt;
    D.catchGoldfall();                                    // catch the rock…
    await new Promise(r => setTimeout(r, 700));
    const bub2 = document.querySelector('#goblin-bram .bubble');
    const headShake = !!bub2 && /We do not catch rocks\. We LEARN this\./.test(bub2.textContent);
    D.spawnGoldfall('🪨');                                // second hazard, inside 20s
    await new Promise(r => setTimeout(r, 150));
    const warnAt2 = D.getBram().lastWarnAt;
    D.catchGoldfall();
    await new Promise(r => setTimeout(r, 300));
    return { warned, warnAt1, headShake, throttled: warnAt2 === warnAt1 && warnAt1 > 0 };
  });
  log('B4_warning_on_announced_hazard_throttled_headshake_on_catch',
    b4.warned && b4.warnAt1 > 0 && b4.headShake && b4.throttled, JSON.stringify(b4));

  log('B8_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
