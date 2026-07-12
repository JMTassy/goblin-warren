// mood-gates.js — GOBLIN MOOD VISUALS (base 6-bucket layer).
// Laws: every reducer-producible mood string resolves to exactly one of
// six buckets (fallback "calm", never a crash) · rendering applies a
// single mood-* class + fx symbol per goblin · re-rendering after a mood
// change swaps the class cleanly (no stale duplicates) · pure display:
// mood rendering moves NO governed truth · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1400);
  await page.mouse.click(195, 500);
  await page.waitForTimeout(200);

  // M1: every raw mood string the reducer zone can produce resolves to one of six buckets
  const m1 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    const samples = {
      curious: D.moodBucket('curious'), intrigued: D.moodBucket('intrigued'),
      delighted: D.moodBucket('delighted'), giggly: D.moodBucket('giggly'),
      calm: D.moodBucket('calm'), rested: D.moodBucket('rested'),
      wistful: D.moodBucket('wistful'), unsure: D.moodBucket('unsure'),
      focused: D.moodBucket('focused'), inspired: D.moodBucket('inspired'),
      fierce: D.moodBucket('fierce'), quietlyProud: D.moodBucket('quietly proud'),
      unknown: D.moodBucket('some-future-mood-nobody-invented-yet')
    };
    return samples;
  });
  log('M1_bucket_coverage',
    m1.curious === 'curious' && m1.intrigued === 'curious' &&
    m1.delighted === 'happy' && m1.giggly === 'happy' &&
    m1.calm === 'calm' && m1.rested === 'calm' &&
    m1.wistful === 'lonely' && m1.unsure === 'lonely' &&
    m1.focused === 'focused' && m1.inspired === 'focused' &&
    m1.fierce === 'dramatic' && m1.quietlyProud === 'dramatic' &&
    m1.unknown === 'calm',
    JSON.stringify(m1));

  // M2: setting a goblin's mood + re-render applies exactly one mood-* class + matching fx symbol
  const m2 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG, s = D.getState();
    s.goblins.pip.mood = 'delighted';
    D.renderGoblins();
    const html = D.getGoblinEl('pip');
    return { html, hasHappy: /class="[^"]*mood-happy[^"]*"/.test(html), fxSymbol: html.includes('🌟') };
  });
  log('M2_mood_class_and_fx', m2.hasHappy && m2.fxSymbol, JSON.stringify({ hasHappy: m2.hasHappy, fxSymbol: m2.fxSymbol }));

  // M3: changing mood again swaps the class cleanly — no stale mood-* leftovers
  const m3 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG, s = D.getState();
    s.goblins.pip.mood = 'fierce';
    D.renderGoblins();
    const html = D.getGoblinEl('pip');
    const outerClass = (html.match(/^<div class="([^"]*)"/) || [, ''])[1];
    const matches = outerClass.match(/mood-\w+/g) || [];
    return { matches, onlyDramatic: matches.length === 1 && matches[0] === 'mood-dramatic' };
  });
  log('M3_clean_swap_no_stale_classes', m3.onlyDramatic, JSON.stringify(m3.matches));

  // M4: pure display — mood render moved no governed truth
  const m4 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const before = JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs,
      sap: s.progress.magicSap, owned: s.territories.owned.length, level: s.progress.level });
    s.goblins.nib.mood = 'wistful';
    D.renderGoblins();
    s.goblins.zaz.mood = 'suspicious';
    D.renderGoblins();
    const after = JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs,
      sap: s.progress.magicSap, owned: s.territories.owned.length, level: s.progress.level });
    return { same: before === after };
  });
  log('M4_pure_display_no_state_mutation', m4.same, JSON.stringify(m4));

  log('M5_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
