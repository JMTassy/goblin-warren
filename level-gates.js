const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // L1: four levels, each with exactly 3 mini-games, all ids resolve to defs
  const lv = await page.evaluate(() => {
    const L = window.WARREN_DEBUG.getLevels();
    const defs = ['mask','gerald','repair','stackhats','nomush','zolrain','ingredients','memory','feed','bubblepop','inflation','bell'];
    const ok = L.length === 4 && L.every(x => x.mgs.length === 3 && x.mgs.every(id => defs.includes(id)));
    return { n: L.length, names: L.map(x => x.name), ok };
  });
  log('LV1_four_levels_three_each', lv.ok, JSON.stringify(lv.names));

  // L2: level 2 uses the glade background image
  const bg = await page.evaluate(() => {
    window.WARREN_DEBUG.setLevel(2);
    return { bg: document.getElementById('world').style.backgroundImage, name: window.WARREN_DEBUG.currentLevel().name };
  });
  log('LV2_glade_background', bg.bg.includes('level2-glade') && bg.name === 'THE GLADE', JSON.stringify(bg));

  // L3: level 1 has no override image (uses CSS scene)
  const bg1 = await page.evaluate(() => { window.WARREN_DEBUG.setLevel(1); return document.getElementById('world').style.backgroundImage; });
  log('LV3_level1_default_bg', bg1 === '', `bg='${bg1}'`);

  // L4: each of the 9 new mini-games launches its overlay
  const games = ['stackhats','nomush','zolrain','ingredients','memory','feed','bubblepop','inflation','bell'];
  let launched = 0, launchLog = [];
  for (const g of games) {
    const ok = await page.evaluate(async (id) => {
      window.WARREN_DEBUG.mgState && window.WARREN_DEBUG.getState();
      const started = window.WARREN_DEBUG.startMinigame(id);
      await new Promise(r => setTimeout(r, 1000)); // wait for play()
      const vis = !document.getElementById('minigame').classList.contains('hidden');
      const arena = document.getElementById('mg-arena');
      const hasContent = arena && arena.innerHTML.length > 20;
      window.WARREN_DEBUG.mgResolve(false, 0); // force-close
      await new Promise(r => setTimeout(r, 2400));
      return started && vis && hasContent;
    }, g);
    if (ok) launched++; else launchLog.push(g);
  }
  log('LV4_all_9_games_launch', launched === 9, `launched ${launched}/9${launchLog.length ? ' failed: ' + launchLog.join(',') : ''}`);

  // L5: winning a game pays ZOL + writes replay
  const win = await page.evaluate(async () => {
    const before = window.WARREN_DEBUG.getState().learning.zolBalance;
    window.WARREN_DEBUG.startMinigame('bubblepop');
    await new Promise(r => setTimeout(r, 1000));
    window.WARREN_DEBUG.mgResolve(true, 15);
    await new Promise(r => setTimeout(r, 300));
    const s = window.WARREN_DEBUG.getState();
    return { paid: s.learning.zolBalance - before, replay: s.replay.some(r => r.choice === 'minigame-bubblepop') };
  });
  log('LV5_win_pays_and_logs', win.paid === 15 && win.replay, JSON.stringify(win));
  await page.waitForTimeout(2400);

  // L6: level chip cycles level and persists
  const chip = await page.evaluate(async () => {
    window.WARREN_DEBUG.setLevel(4);
    await new Promise(r => setTimeout(r, 100));
    const txt = document.getElementById('level-chip').textContent;
    return { txt, level: window.WARREN_DEBUG.getState().progress.level };
  });
  log('LV6_level_chip', chip.txt.includes('L4') && chip.level === 4, JSON.stringify(chip));

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
