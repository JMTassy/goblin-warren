// adopt-gates.js — ADOPT A GOBLIN (the constellation ritual).
// Laws: nothing joins without the stamp · the archetype is constellated
// deterministically from the return humor · adoption writes a receipt and
// costs nothing · the kin persists across reload (save contract) · the kin
// is a full goblin (boopable, teachable) · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // A1: wanderer appears at the gate, asks to stay
  const a1 = await page.evaluate(() => {
    window.WARREN_DEBUG.spawnWanderer();
    const w = document.querySelector('.wanderer');
    return { there: !!w, asks: w ? w.textContent.includes('may I stay') : false };
  });
  log('A1_wanderer_appears', a1.there && a1.asks, JSON.stringify(a1));

  // A2: no stamp, no kin — opening the card and walking away changes nothing
  const a2 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.openAdoptCard();
    await new Promise(r => setTimeout(r, 200));
    const cardOpen = !!document.getElementById('adopt-card');
    document.getElementById('adopt-later').click();
    await new Promise(r => setTimeout(r, 200));
    const s = D.getState();
    return { cardOpen, kinAfterDismiss: !!s.goblins.kin, adopted: !!s.adopted };
  });
  log('A2_no_stamp_no_kin', a2.cardOpen && !a2.kinAfterDismiss && !a2.adopted, JSON.stringify(a2));

  // A3: stamping with a name adopts — deterministic archetype, receipt, zero cost
  const a3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const expected = D.warrenHumor(0).id;
    const before = { zol: s.learning.zolBalance, orbs: s.progress.glowOrbs, sap: s.progress.magicSap };
    D.adoptWanderer('Mirabelle');
    await new Promise(r => setTimeout(r, 300));
    const kin = s.goblins.kin;
    const after = { zol: s.learning.zolBalance, orbs: s.progress.glowOrbs, sap: s.progress.magicSap };
    return {
      named: kin && kin.name === 'Mirabelle',
      archetypeMatchesHumor: s.adopted && s.adopted.archetypeId === expected,
      receipt: D.getReplay().some(r => r.choice === 'adopt' && /Mirabelle/.test(r.event)),
      free: JSON.stringify(before) === JSON.stringify(after),
      rendered: !!document.querySelector('.goblin .g-nametag') &&
        [...document.querySelectorAll('.g-nametag')].some(n => n.textContent === 'Mirabelle')
    };
  });
  log('A3_stamp_adopts', a3.named && a3.archetypeMatchesHumor && a3.receipt && a3.free && a3.rendered,
    JSON.stringify(a3));

  // A4: second adoption refused — one kin
  const a4 = await page.evaluate(() => {
    const ok = window.WARREN_DEBUG.adoptWanderer('Imposteur');
    return { refused: ok === false, stillMirabelle: window.WARREN_DEBUG.getState().goblins.kin.name === 'Mirabelle' };
  });
  log('A4_one_kin_only', a4.refused && a4.stillMirabelle, JSON.stringify(a4));

  // A5: the kin survives reload (both the valid-save path and mergeDefaults)
  await page.reload(); await page.waitForTimeout(1400);
  const a5 = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { kin: !!s.goblins.kin, name: s.goblins.kin && s.goblins.kin.name,
             role: s.goblins.kin && s.goblins.kin.role, adopted: !!s.adopted };
  });
  log('A5_kin_persists', a5.kin && a5.name === 'Mirabelle' && !!a5.role && a5.adopted, JSON.stringify(a5));

  // A6: the kin is a full citizen — teachable like any goblin
  const a6 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    D.teach('kin', 'birds fly because they are light');
    D.sealTeaching();
    return { taught: (D.getTeaching().taughtCount.kin || 0) >= 1 };
  });
  log('A6_kin_teachable', a6.taught, JSON.stringify(a6));

  log('A7_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
