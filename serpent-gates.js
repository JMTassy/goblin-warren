// serpent-gates.js — THE SERPENT IN THE TREE (kundalini layer, goblin-read).
// Laws: seven stations, one per sacred frequency, crown 963 completes the
// ladder · height is a pure deterministic fold of state (more care ⇒ never
// lower) · the serpent renders, climbs, sings and teaches · expressive only:
// nothing it does moves governed truth · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1400);

  // S1: the ladder is complete — 7 stations, ascending sacred frequencies, crown 963
  const s1 = await page.evaluate(() => {
    const st = window.WARREN_DEBUG.getStations();
    const freqs = st.map(s => s.freq);
    const ascending = freqs.every((f, i) => i === 0 || f > freqs[i - 1]);
    const symbols = st.every(s => typeof s.arcana === 'string' && typeof s.hex === 'number');
    return { n: st.length, freqs, ascending, crown: freqs[6] === 963, base: freqs[0] === 396, symbols };
  });
  log('S1_seven_rung_ladder', s1.n === 7 && s1.ascending && s1.crown && s1.base && s1.symbols, JSON.stringify(s1));

  // S2: height is deterministic and monotonic — same state same height; more care never lowers it
  const s2 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const a = D.serpentHeight(), b2 = D.serpentHeight();
    const before = D.serpentHeight();
    s.lulu.counts.talk += 20; s.world.soil = 80; s.world.warmth = 90; s.flags.quizRight = (s.flags.quizRight || 0) + 10;
    const after = D.serpentHeight();
    return { same: a === b2, before, after, monotonic: after >= before };
  });
  log('S2_deterministic_monotonic', s2.same && s2.monotonic && s2.after > s2.before, JSON.stringify(s2));

  // S3: the serpent renders at its station and climbs when the fold rises
  const s3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.renderSerpent();
    await new Promise(r => setTimeout(r, 200));
    const el = document.querySelector('.serpent');
    return { there: !!el, top: el ? el.style.top : null,
             expected: (24 - D.serpentHeight() * 2.4).toFixed(1) + '%',
             matches: el ? Math.abs(parseFloat(el.style.top) - (24 - D.serpentHeight() * 2.4)) < 0.1 : false };
  });
  log('S3_serpent_climbs', s3.there && s3.matches, JSON.stringify(s3));

  // S4: tapping sings the station and teaches its line — and moves NO governed truth
  const s4 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const eco = () => JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs,
      sap: s.progress.magicSap, soil: s.world.soil, owned: s.territories.owned.length });
    const before = eco();
    document.querySelector('.serpent').click();
    await new Promise(r => setTimeout(r, 300));
    const bubble = [...document.querySelectorAll('.bubble')].map(x => x.textContent).join(' ');
    const station = D.getStations()[D.serpentHeight()];
    return { sang: document.querySelector('.serpent').classList.contains('singing'),
             taught: bubble.includes(station.name), ecoSame: eco() === before };
  });
  log('S4_sings_teaches_admits_nothing', s4.sang && s4.taught && s4.ecoSame, JSON.stringify(s4));

  log('S5_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
