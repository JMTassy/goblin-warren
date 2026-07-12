const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // E6: geraldHead → Lulu council aside
  const e6 = await page.evaluate(async () => {
    window.WARREN_DEBUG.unlockGeraldQuest(); window.WARREN_DEBUG.triggerGeraldProposal(); window.WARREN_DEBUG.resolveGeraldChoice('try');
    await new Promise(r => setTimeout(r, 300));
    window.WARREN_DEBUG.setEcho('geraldHead', true);
    const s = window.WARREN_DEBUG.getState(); s.council = { done: false, stage: 'IDLE', card: null };
    window.WARREN_DEBUG.startCouncil();
    await new Promise(r => setTimeout(r, 300));
    return [...document.querySelectorAll('.council-line')].map(x => x.textContent).join(' || ');
  });
  log('E6_gerald_head_aside', e6.includes('Head of Hiding') && e6.includes('cannot attend'), e6.slice(-90));

  // E7: luluHat shows in care panel "her things"
  const e7 = await page.evaluate(async () => {
    window.WARREN_DEBUG.setEcho('luluHat', true);
    window.WARREN_DEBUG.openCard('lulu');
    await new Promise(r => setTimeout(r, 200));
    const mood = document.querySelector('.care-mood');
    return mood ? mood.textContent : '';
  });
  log('E7_lulu_hat_in_panel', e7.includes('🎩'), e7);

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
