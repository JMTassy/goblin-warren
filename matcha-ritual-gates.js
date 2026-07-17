// matcha-ritual-gates.js — LEVEL 2: THE MATCHA RITUAL (operator-locked spec).
// Laws witnessed here: the 7↔0 sector wrap counts · multi-sector jumps are
// ignored, never punished · exactly 3 foam states · the accessible dot path
// reaches EXCELLENT (same max quality) · a cup serves exactly once · rewards
// are 1/4/8 by quality · the worst cup still pays and still delights · all
// ritual timers are clean after close · no page errors.
// Not part of the shipped game — a witness script only.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const URL = 'file://' + path.join(__dirname, 'index.html');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL);
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.WARREN_DEBUG.skipPrologue()); // gates run in the grown Warren, never the crib
  await page.waitForTimeout(800);

  // MAT-wrap: the 7↔0 seam is an adjacent step in both directions
  const wrap = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return { fwd: D.matchaWhiskStep(7, 0), back: D.matchaWhiskStep(0, 7), plain: D.matchaWhiskStep(2, 3), plainBack: D.matchaWhiskStep(3, 2) };
  });
  log('MAT-wrap', wrap.fwd === 1 && wrap.back === -1 && wrap.plain === 1 && wrap.plainBack === -1, JSON.stringify(wrap));

  // MAT-jump-ignored: multi-sector jumps and non-moves count 0 — never negative
  const jump = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return { j2: D.matchaWhiskStep(0, 2), j5: D.matchaWhiskStep(6, 3), wrapJump: D.matchaWhiskStep(6, 1), same: D.matchaWhiskStep(4, 4) };
  });
  log('MAT-jump-ignored', jump.j2 === 0 && jump.j5 === 0 && jump.wrapJump === 0 && jump.same === 0, JSON.stringify(jump));

  // MAT-3-states: light < 12 <= soft <= 20 < perfect — and nothing else
  const foam = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const states = [0, 5, 11, 12, 15, 20, 21, 24, 99].map(n => D.matchaFoamState(n));
    return { states, distinct: Array.from(new Set(states)) };
  });
  log('MAT-3-states',
    foam.states.join(',') === 'light,light,light,soft,soft,soft,perfect,perfect,perfect' && foam.distinct.length === 3,
    JSON.stringify(foam));

  // MAT-accessible-path-reaches-excellent: tap the lit dots in order to 24
  // transitions (perfect foam), then serve inside the golden window → +8 ZOL
  const acc = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const before = { zol: D.getState().learning.zolBalance, sap: D.getState().progress.magicSap };
    D.spawnMatchaCraving();
    await sleep(200);
    D.startMatchaRitual(); // picks the cup up first if needed
    await sleep(600);      // the overlay's "ready…" beat
    const opened = !!D.getMatchaRitual() && !document.getElementById('minigame').classList.contains('hidden');
    // the REQUIRED accessible path: the lit dot, tapped in sequence, 24 times
    let taps = 0;
    for (let i = 0; i < 24; i++) {
      const lit = document.querySelector('#mg-whisk-zone .mg-whisk-dot.lit');
      if (!lit) break;
      lit.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      taps++;
      await sleep(15);
    }
    const mid = D.getMatchaRitual();
    // serve phase entered automatically at 24; wait for the golden window
    let windowSeen = false;
    for (let t = 0; t < 80; t++) {
      const st = D.getMatchaRitual();
      if (st && st.windowOpen) { windowSeen = true; break; }
      await sleep(50);
    }
    const btn = document.getElementById('mg-serve');
    if (btn) btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await sleep(100);
    const done = D.getMatchaRitual();
    return {
      opened, taps, phaseAfterTaps: mid ? mid.phase : null, foamAfterTaps: mid ? mid.foam : null,
      windowSeen, quality: done ? done.quality : null,
      zolGain: D.getState().learning.zolBalance - before.zol,
      sapGain: D.getState().progress.magicSap - before.sap,
      receipt: D.getReplay().some(r => r.choice === 'matcha' && /excellent/.test(r.visibleChange))
    };
  });
  log('MAT-accessible-path-reaches-excellent',
    acc.opened && acc.taps === 24 && acc.phaseAfterTaps === 'serve' && acc.foamAfterTaps === 'perfect' &&
    acc.windowSeen && acc.quality === 'excellent' && acc.zolGain === 8 && acc.sapGain === 1 && acc.receipt,
    JSON.stringify(acc));

  // MAT-serve-once: a second serve on the same cup is refused, pays nothing
  const twice = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const zol = D.getState().learning.zolBalance, sap = D.getState().progress.magicSap;
    const again = D.matchaServe(false); // overlay still in its 2.3s result beat
    await new Promise(r => setTimeout(r, 200));
    return { again, zolDelta: D.getState().learning.zolBalance - zol, sapDelta: D.getState().progress.magicSap - sap };
  });
  log('MAT-serve-once', twice.again === false && twice.zolDelta === 0 && twice.sapDelta === 0, JSON.stringify(twice));

  // MAT-timers-clean-on-close: after the overlay closes, no ritual timer lives
  await page.waitForTimeout(2600);
  const clean = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const t = D.matchaTimersLive();
    return {
      sweep: t.sweep, whisk: t.whisk, serve: t.serve,
      overlayHidden: document.getElementById('minigame').classList.contains('hidden'),
      ritualGone: D.getMatchaRitual() === null
    };
  });
  log('MAT-timers-clean-on-close',
    !clean.sweep && !clean.whisk && !clean.serve && clean.overlayHidden && clean.ritualGone,
    JSON.stringify(clean));

  // MAT-rewards: 1/4/8 bounds and the quality law that maps onto them
  const rw = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const R = D.matchaRitualRewards();
    return {
      R,
      qPerfectIn: D.matchaQuality(24, true),    // → excellent (8)
      qPerfectOut: D.matchaQuality(24, false),  // perfect foam off the gold → good (4)
      qSoftIn: D.matchaQuality(15, true),       // soft foam → good even in-window (4)
      qLightIn: D.matchaQuality(5, true)        // light foam → funny (1), never less
    };
  });
  log('MAT-rewards',
    rw.R.excellent === 8 && rw.R.good === 4 && rw.R.funny === 1 &&
    rw.qPerfectIn === 'excellent' && rw.qPerfectOut === 'good' && rw.qSoftIn === 'good' && rw.qLightIn === 'funny',
    JSON.stringify(rw));

  // MAT-never-punitive: the worst possible cup (zero whisking, serve blind)
  // still pays ≥1 ZOL + 1 sap, a friendly line, and a receipt — no hurt feelings
  const worst = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const before = { zol: D.getState().learning.zolBalance, sap: D.getState().progress.magicSap };
    D.spawnMatchaCraving();
    await sleep(200);
    const gid = D.getMatcha().goblinId;
    D.startMatchaRitual();
    await sleep(600);
    // skip the whisk entirely: 0 transitions, then force the serve phase by
    // serving the moment the button exists — wait through the 20s whisk? No:
    // drive the ritual's own law — phase must be 'serve' to serve, so tap a
    // single wrong-order dot (ignored) then let the whisk time out fast via
    // the real serve path: tap 0 dots and serve via debug once in phase 2.
    // The whisk auto-end is 20s; to keep the gate quick we take the honest
    // shortcut the game itself offers: serve is refused during whisk…
    const refusedEarly = D.matchaServe(false) === false;
    // …so cross into phase 2 the same way the game would (timeout), compressed:
    // tapping dots is the accessible path — but the worst case is ZERO taps,
    // so we wait out the 20s whisk window for the genuine auto-transition.
    let phase = null;
    for (let t = 0; t < 60; t++) { // up to 21s
      const st = D.getMatchaRitual();
      phase = st && st.phase;
      if (phase === 'serve') break;
      await sleep(350);
    }
    const served = D.matchaServe(true); // auto-serve = out-of-window, blind
    await sleep(150);
    const st = D.getMatchaRitual();
    const g = D.getState().goblins[gid];
    return {
      refusedEarly, phase, served,
      quality: st ? st.quality : null,
      zolGain: D.getState().learning.zolBalance - before.zol,
      sapGain: D.getState().progress.magicSap - before.sap,
      mood: g ? g.mood : null,
      receipt: D.getReplay().some(r => r.choice === 'matcha' && /funny/.test(r.visibleChange) && /drank it all/.test(r.visibleChange))
    };
  });
  log('MAT-never-punitive',
    worst.refusedEarly && worst.phase === 'serve' && worst.served === true && worst.quality === 'funny' &&
    worst.zolGain >= 1 && worst.sapGain === 1 && (worst.mood === 'content' || worst.mood === 'delighted') && worst.receipt,
    JSON.stringify(worst));
  await page.waitForTimeout(2600); // let the overlay close cleanly

  // MAT-debug-good-path: the old flow's contract — WARREN_DEBUG.deliverMatcha()
  // resolves instantly at GOOD quality, pays +1 sap, writes a receipt (no ritual)
  const dbg = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const before = { zol: D.getState().learning.zolBalance, sap: D.getState().progress.magicSap };
    D.spawnMatchaCraving();
    await sleep(200);
    const ok = D.deliverMatcha();
    await sleep(150);
    return {
      ok,
      resolved: !D.getMatcha().active,
      noOverlay: document.getElementById('minigame').classList.contains('hidden'),
      zolGain: D.getState().learning.zolBalance - before.zol,
      sapGain: D.getState().progress.magicSap - before.sap,
      receipt: D.getReplay().some(r => r.choice === 'matcha' && /\(good\)/.test(r.visibleChange))
    };
  });
  log('MAT-debug-good-path',
    dbg.ok === true && dbg.resolved && dbg.noOverlay && dbg.zolGain === 0 && dbg.sapGain === 1 && dbg.receipt,
    JSON.stringify(dbg));

  log('MAT-no-page-errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
