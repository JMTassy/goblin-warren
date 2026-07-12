// lang-gates.js — le drapeau 🇫🇷 et la traduction façon Lelu.
// Laws: toggle translates the live view · dynamic renders arrive translated ·
// toggle back restores English · choice survives reload · state/replay never
// see the language (view-boundary only) · topbar still fits at 320px.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 320, height: 720 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // L1: flag exists and topbar does not overflow at 320px with it
  const l1 = await page.evaluate(() => {
    const t = document.getElementById('topbar');
    return { flag: !!document.getElementById('lang-flag'), overflow: t.scrollWidth - t.clientWidth };
  });
  log('L1_flag_fits_320', l1.flag && l1.overflow <= 0, JSON.stringify(l1));

  // L2: toggle to FR translates static chrome (buttons, tree line, manual title)
  await page.evaluate(() => document.getElementById('lang-flag').click());
  await page.waitForTimeout(300);
  const l2 = await page.evaluate(() => ({
    tryBtn: document.getElementById('btn-try').textContent,
    tree: document.getElementById('tree-text').textContent,
    riddle: document.getElementById('riddle-chip').textContent,
    flagNow: document.getElementById('lang-flag').textContent
  }));
  log('L2_static_translated', l2.tryBtn === 'ON ESSAIE' && /L'Arbre vous regarde/.test(l2.tree) &&
    /Devinette/.test(l2.riddle) && l2.flagNow === '🇬🇧', JSON.stringify(l2));

  // L3: dynamically rendered content arrives translated (goblin card labels)
  const l3 = await page.evaluate(async () => {
    window.WARREN_DEBUG.openCard('pip');
    await new Promise(r => setTimeout(r, 250));
    const labels = [...document.querySelectorAll('#sheet-goblin .lbl')].map(x => x.textContent);
    return labels.join('|');
  });
  log('L3_dynamic_translated', /humeur/.test(l3) && /se souvient/.test(l3), l3);

  // L4: state and replay are untouched by language (view boundary only)
  const l4 = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    const rep = window.WARREN_DEBUG.getReplay();
    const frInReplay = rep.some(r => /Terrier|Devinette|ON ESSAIE/.test((r.visibleChange || '') + (r.event || '')));
    return { lang: s.settings.lang, frInReplay };
  });
  log('L4_state_never_translated', l4.lang === 'fr' && l4.frInReplay === false, JSON.stringify(l4));

  // L5: choice survives reload
  await page.reload(); await page.waitForTimeout(1400);
  const l5 = await page.evaluate(() => ({
    tryBtn: document.getElementById('btn-try').textContent,
    flag: document.getElementById('lang-flag').textContent
  }));
  log('L5_survives_reload', l5.tryBtn === 'ON ESSAIE' && l5.flag === '🇬🇧', JSON.stringify(l5));

  // L6: toggle back restores English
  await page.evaluate(() => document.getElementById('lang-flag').click());
  await page.waitForTimeout(400);
  const l6 = await page.evaluate(() => ({
    tryBtn: document.getElementById('btn-try').textContent,
    tree: document.getElementById('tree-text').textContent,
    flag: document.getElementById('lang-flag').textContent
  }));
  log('L6_english_restored', l6.tryBtn === 'TRY IT' && l6.flag === '🇫🇷', JSON.stringify(l6));

  log('L7_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
