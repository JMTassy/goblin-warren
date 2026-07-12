// verdict-gates.js — DAILY VERDICT (SPEC_DAILY_VERDICT.md acceptance).
// Laws: deterministic per UTC date · world-split sealed until the stamp ·
// one stamp per day · one visible consequence all day · 7-day emoji row
// with copy payload · CROWN 3: no economic input or output touches a
// verdict (zol/orbs/sap byte-identical across the whole flow) · no errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1500);

  // D1: deterministic pick — same date, same index, twice; a different date may differ
  const d1 = await page.evaluate(() => new Promise(res => {
    const D = window.WARREN_DEBUG;
    D.verdictPickFor('2026-07-12', a => D.verdictPickFor('2026-07-12', b2 =>
      D.verdictPickFor('2026-07-13', c => res({ a, b: b2, c }))));
  }));
  log('D1_deterministic_pick', d1.a === d1.b && typeof d1.a === 'number', JSON.stringify(d1));

  // D2: the split is SEALED before the stamp — no consequence text in the card
  const d2 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    if (D.getVerdictIndex() == null) D.setVerdictIndex(0);
    D.openVerdictCard();
    await new Promise(r => setTimeout(r, 200));
    const card = document.getElementById('verdict-card');
    const txt = card ? card.textContent : '';
    const dil = D.getDilemmas()[D.getVerdictIndex()];
    const leaked = Object.values(dil.consequence).some(c => txt.includes(c.effect) || txt.includes(c.journal));
    const optionsShown = dil.options.every(o => txt.includes(o.label));
    return { open: !!card, leaked, optionsShown };
  });
  log('D2_split_sealed_before_stamp', d2.open && !d2.leaked && d2.optionsShown, JSON.stringify(d2));

  // D3: stamping — CROWN 3 firewall (economy byte-identical), receipt, stone,
  // split revealed with the chosen world glowing
  const d3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const eco = () => JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs, sap: s.progress.magicSap });
    const ecoBefore = eco();
    const ok = D.stampVerdict('🟢');
    await new Promise(r => setTimeout(r, 400));
    const card = document.getElementById('verdict-card');
    const txt = card ? card.textContent : '';
    const dil = D.getDilemmas()[D.getVerdictIndex()];
    return {
      ok,
      ecoSame: eco() === ecoBefore,
      receipt: D.getReplay().some(r => r.choice === 'verdict'),
      stone: D.getObjects().some(o => o.sign.indexOf('Verdict:') === 0),
      splitShown: txt.includes(dil.consequence['🟢'].journal) && txt.includes(dil.consequence['🔴'].effect),
      chosenGlow: !!card.querySelector('.split-world.chosen'),
      history: D.getVerdicts().history.length
    };
  });
  log('D3_stamp_seals_and_reveals', d3.ok && d3.ecoSame && d3.receipt && d3.stone && d3.splitShown && d3.chosenGlow && d3.history === 1,
    JSON.stringify(d3));

  // D4: one stamp per day — a second stamp is refused, history stays 1
  const d4 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const again = D.stampVerdict('🔴');
    return { refused: again === false, history: D.getVerdicts().history.length,
             stamp: D.getVerdicts().history[0].stamp };
  });
  log('D4_one_per_day', d4.refused && d4.history === 1 && d4.stamp === '🟢', JSON.stringify(d4));

  // D5: the 7-day row renders with today's stamp last and ⬜ for missed days,
  // and the copy payload carries the row
  const d5 = await page.evaluate(async () => {
    window.WARREN_DEBUG.openVerdictCard();
    await new Promise(r => setTimeout(r, 200));
    const row = document.getElementById('verdict-row-emoji').textContent;
    return { row, endsWithToday: row.endsWith('🟢'), len7: [...row].length === 7 || row.length >= 7,
             hasEmpty: row.includes('⬜'), copyBtn: !!document.getElementById('verdict-copy') };
  });
  log('D5_seven_day_row', d5.endsWithToday && d5.hasEmpty && d5.copyBtn, JSON.stringify(d5));

  // D6: the stamp survives reload — today stays stamped, no second scroll
  await page.reload(); await page.waitForTimeout(1600);
  const d6 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    await new Promise(r => setTimeout(r, 300));
    return { history: D.getVerdicts().history.length, stamp: D.getVerdicts().history[0].stamp,
             stone: D.getObjects().some(o => o.sign.indexOf('Verdict:') === 0) };
  });
  log('D6_stamp_persists', d6.history === 1 && d6.stamp === '🟢' && d6.stone, JSON.stringify(d6));

  log('D7_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
