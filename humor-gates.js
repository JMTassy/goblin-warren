// humor-gates.js — THE WARREN DREAMS (return constellation).
// Laws: humor is a pure function of (state, buckets) · constellation rules
// fire correctly · applying a humor greets (tree line + wash + moods +
// receipt) but moves NO resources · never punitive · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // W1: deterministic — same state, same buckets → same humor, twice
  const w1 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const a = D.warrenHumor(4), b2 = D.warrenHumor(4);
    return { same: JSON.stringify(a) === JSON.stringify(b2), id: a.id };
  });
  log('W1_deterministic', w1.same, JSON.stringify(w1));

  // W2: constellation rules fire in order
  const w2 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG, s = D.getState(), out = {};
    const save = { conn: s.lulu.needs.connection, cave: s.lulu.inCave };
    s.lulu.inCave = true;                          out.lonely = D.warrenHumor(4).id;
    s.lulu.inCave = false; s.lulu.needs.connection = 50;
    out.dreaming = D.warrenHumor(48).id;           // 24h+ absence
    s.lulu.needs.connection = 80;                  out.tender = D.warrenHumor(4).id;
    s.lulu.needs.connection = save.conn; s.lulu.inCave = save.cave;
    return out;
  });
  log('W2_constellation_rules', w2.lonely === 'LONELY' && w2.dreaming === 'DREAMING' && w2.tender === 'TENDER',
    JSON.stringify(w2));

  // W3: applying greets but never punishes — no resource moves
  const w3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const before = { zol: s.learning.zolBalance, orbs: s.progress.glowOrbs, sap: s.progress.magicSap,
                     energy: s.lulu.needs.energy, soil: s.world.soil };
    const h = D.applyWarrenHumor(4);
    await new Promise(r => setTimeout(r, 300));
    const tree = document.getElementById('tree-text').textContent;
    const wash = document.getElementById('world').classList.contains('dawnwash');
    const receipt = D.getReplay().some(r => r.choice === 'humor');
    const after = { zol: s.learning.zolBalance, orbs: s.progress.glowOrbs, sap: s.progress.magicSap,
                    energy: s.lulu.needs.energy, soil: s.world.soil };
    return { h: h.id, treeMatches: tree === h.line, wash, receipt,
             untouched: JSON.stringify(before) === JSON.stringify(after) };
  });
  log('W3_greets_never_punishes', w3.treeMatches && w3.wash && w3.receipt && w3.untouched, JSON.stringify(w3));

  // W4: the greeting speaks French when the flag is up
  const w4 = await page.evaluate(async () => {
    document.getElementById('lang-flag').click();
    await new Promise(r => setTimeout(r, 200));
    window.WARREN_DEBUG.applyWarrenHumor(48);      // DREAMING
    await new Promise(r => setTimeout(r, 250));
    const t = document.getElementById('tree-text').textContent;
    document.getElementById('lang-flag').click();  // back to EN for cleanliness
    return t;
  });
  log('W4_humor_speaks_french', /le Terrier a rêvé/.test(w4), w4);

  log('W5_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
