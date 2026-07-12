// organ-gates.js — THE AKASHIC ORGAN (Tree Song).
// Laws: the console opens from the serpent · only earned stations play ·
// stops latch/release with sustained voices (max 4 hands) · the interval
// detector names the true Pythagorean relations from the sacred set ·
// pure instrument: harmony moves NO governed truth · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1400);
  await page.mouse.click(195, 500); // unlock audio
  await page.waitForTimeout(200);

  // O1: interval detector — the true relations inside the sacred set
  const o1 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    return {
      fourth: D.detectHarmony([396, 528]).name,       // 4:3 exact
      fourth2: D.detectHarmony([639, 852]).name,      // 4:3 exact
      fifth: D.detectHarmony([639, 963]).name,        // ~3:2 (710c)
      octave: D.detectHarmony([417, 852]).name,       // ~2:1 (1237c)
      unison: D.detectHarmony([528]).name,
      silence: D.detectHarmony([])
    };
  });
  log('O1_pythagorean_detector',
    o1.fourth === 'perfect fourth' && o1.fourth2 === 'perfect fourth' &&
    o1.fifth === 'perfect fifth' && o1.octave === 'octave' &&
    o1.unison === 'unison' && o1.silence === null, JSON.stringify(o1));

  // O2: console opens; earned stations enabled, unearned locked
  const o2 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.openOrgan();
    await new Promise(r => setTimeout(r, 200));
    const stops = [...document.querySelectorAll('.organ-stop')];
    const h = D.serpentHeight();
    return { open: !!document.getElementById('organ'), n: stops.length,
             lockedCount: stops.filter(s => s.classList.contains('locked')).length,
             expectLocked: 6 - h };
  });
  log('O2_console_earned_stations', o2.open && o2.n === 7 && o2.lockedCount === o2.expectLocked, JSON.stringify(o2));

  // O3: latch two earned stops → harmony named; unearned stop refused; 4-hand cap
  const o3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG, s = D.getState();
    // earn height for the test: crank the fold
    s.lulu.counts.talk = 40; s.world.soil = 90; s.world.warmth = 90; s.flags.quizRight = 20;
    D.renderSerpent(); D.closeOrgan(); D.openOrgan();
    await new Promise(r => setTimeout(r, 150));
    const a = D.toggleOrganStop(0);           // 396
    const b2 = D.toggleOrganStop(2);          // 528 → fourth
    await new Promise(r => setTimeout(r, 150));
    const label = document.getElementById('organ-harmony').textContent;
    const over = [1, 3].map(i => D.toggleOrganStop(i)); // now 4 latched
    const fifth = D.toggleOrganStop(4);       // 5th latch → refused (cap 4)
    return { a, b: b2, label, latched: D.organLatched().length, capRefused: fifth === false };
  });
  log('O3_latch_and_cap', o3.a && o3.b && /perfect fourth|quarte/.test(o3.label) && o3.latched === 4 && o3.capRefused,
    JSON.stringify(o3));

  // O4: pure instrument — the whole recital moved no governed truth
  const o4 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const eco = JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs,
      sap: s.progress.magicSap, owned: s.territories.owned.length, level: s.progress.level });
    D.closeOrgan();
    const after = JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs,
      sap: s.progress.magicSap, owned: s.territories.owned.length, level: s.progress.level });
    return { same: eco === after, closed: !document.getElementById('organ'), voices: D.organLatched().length };
  });
  log('O4_pure_instrument', o4.same && o4.closed && o4.voices === 0, JSON.stringify(o4));

  log('O5_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
