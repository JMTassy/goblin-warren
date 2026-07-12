// healing-gates.js — the healing sound layers (shamanic drums, didgeridoo,
// Tibetan bowls). Laws: additive (old recipe untouched) · deterministic
// bowl-per-object voice · triggers wired · no page errors when instruments
// play · objects are tappable instruments with a halo.
// Not part of the shipped game — a witness script only.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);
  await page.mouse.click(195, 400); // unlock audio context
  await page.waitForTimeout(300);

  // H1: instruments exist and play without throwing (all patterns + bowls + didge)
  const h1 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    try {
      for (let i = 0; i < 5; i++) D.shamanicBurst(i);
      D.didgeridoo();
      [174, 285, 396, 417, 528, 639, 741, 852].forEach(f => D.tibetanBowl(f));
      return 'ok';
    } catch (e) { return 'THREW: ' + e.message; }
  });
  log('H1_instruments_play', h1 === 'ok', h1);

  // H2: one object, one voice — bowl frequency is deterministic per id and
  // always a member of the sacred set
  const h2 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const SET = [174, 285, 396, 417, 528, 639, 741, 852];
    const a = D.bowlFreqFor('obj-abc'), b2 = D.bowlFreqFor('obj-abc'), c = D.bowlFreqFor('obj-xyz');
    return { same: a === b2, inSet: SET.includes(a) && SET.includes(c), a, c };
  });
  log('H2_bowl_voice_deterministic', h2.same && h2.inSet, JSON.stringify(h2));

  // H3: world objects are tappable instruments — clicking one adds the halo
  const h3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.addObject('🎐', 'Test Chime', 'garden');
    await new Promise(r => setTimeout(r, 150));
    const els = document.querySelectorAll('.wobject:not(.worldsign)');
    const el = els[els.length - 1];
    if (!el) return { found: false };
    el.click();
    await new Promise(r => setTimeout(r, 100));
    return { found: true, singing: el.classList.contains('singing'),
             clickable: getComputedStyle(el).pointerEvents !== 'none' };
  });
  log('H3_objects_are_instruments', h3.found && h3.singing && h3.clickable, JSON.stringify(h3));

  // H4: mushrooms drum, and worldsigns stay passive (no false affordance)
  const h4 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.addObject('🍄', 'Test Mushroom', 'garden');
    await new Promise(r => setTimeout(r, 150));
    const els = document.querySelectorAll('.wobject:not(.worldsign)');
    const mush = els[els.length - 1];
    mush.click();
    await new Promise(r => setTimeout(r, 100));
    const sign = document.querySelector('.wobject.worldsign');
    return { mushSings: mush.classList.contains('singing'),
             signPassive: !sign || getComputedStyle(sign).pointerEvents === 'none' };
  });
  log('H4_mushroom_drums_sign_passive', h4.mushSings && h4.signPassive, JSON.stringify(h4));

  // H5: the old recipe is untouched — the pre-existing Sound surface still runs
  const h5 = await page.evaluate(() => {
    try {
      const D = window.WARREN_DEBUG;
      D.coinBurst(100, 100, 3); // physics + glingGling path
      return 'ok';
    } catch (e) { return 'THREW: ' + e.message; }
  });
  log('H5_old_recipe_untouched', h5 === 'ok', h5);

  await page.waitForTimeout(400);
  log('H6_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
