// SIDE QUEST gates — universal format law
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // MG1: The Mask — 3 taps → success, +10 ZOL, sticker consequence, replay
  const zol0 = await page.evaluate(() => window.WARREN_DEBUG.getState().learning.zolBalance);
  await page.evaluate(() => window.WARREN_DEBUG.startMinigame('mask'));
  await page.waitForTimeout(1100);
  const open = await page.evaluate(() => !document.getElementById('minigame').classList.contains('hidden'));
  await page.evaluate(() => { for (let i = 0; i < 3; i++) window.WARREN_DEBUG.mgMaskTap(); });
  await page.waitForTimeout(400);
  const m1 = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { zol: s.learning.zolBalance,
      sticker: s.objects.some(o => o.sign === 'A Strongly Opinionated Sticker'),
      replay: s.replay.some(r => r.choice === 'minigame-mask') };
  });
  log('MG1_mask_success', open && m1.zol === zol0 + 10 && m1.sticker && m1.replay, JSON.stringify(m1));
  await page.waitForTimeout(2400); // overlay closes

  // MG2: overlay closed after round
  const closed = await page.evaluate(() => document.getElementById('minigame').classList.contains('hidden'));
  log('MG2_overlay_closes', closed, `closed=${closed}`);

  // MG3: Find Gerald — pick correct 3x → Head of Hiding, +15
  await page.evaluate(() => window.WARREN_DEBUG.startMinigame('gerald'));
  await page.waitForTimeout(1200);
  for (let r = 0; r < 3; r++) {
    await page.waitForTimeout(1100);
    await page.evaluate(() => window.WARREN_DEBUG.mgGeraldPick(window.WARREN_DEBUG.mgState().data.hiding));
    await page.waitForTimeout(1300);
  }
  await page.waitForTimeout(600);
  const m3 = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { zol: s.learning.zolBalance,
      head: s.objects.some(o => o.sign === 'Gerald — Head of Hiding') };
  });
  log('MG3_gerald_head_of_hiding', m3.zol === zol0 + 25 && m3.head, JSON.stringify(m3));
  await page.waitForTimeout(2400);

  // MG4: Over-repair — release at 95% → funny failure, telescope trophy, NO ZOL, NO punishment
  const before = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { zol: s.learning.zolBalance, health: s.world.treeHealth };
  });
  await page.evaluate(() => window.WARREN_DEBUG.startMinigame('repair'));
  await page.waitForTimeout(1100);
  await page.evaluate(() => window.WARREN_DEBUG.mgRepairSet(95));
  await page.waitForTimeout(400);
  const m4 = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { zol: s.learning.zolBalance, health: s.world.treeHealth,
      scope: s.objects.some(o => o.sign === 'Improved Beyond Recognition'),
      replay: s.replay.some(r => r.choice === 'minigame-repair') };
  });
  log('MG4_overrepair_funny_failure',
    m4.zol === before.zol && m4.health === before.health && m4.scope && m4.replay,
    JSON.stringify(m4));
  await page.waitForTimeout(2400);

  // MG5: perfect repair → +10
  await page.evaluate(() => window.WARREN_DEBUG.startMinigame('repair'));
  await page.waitForTimeout(1100);
  await page.evaluate(() => window.WARREN_DEBUG.mgRepairSet(70));
  await page.waitForTimeout(400);
  const m5 = await page.evaluate(() => window.WARREN_DEBUG.getState().learning.zolBalance);
  log('MG5_repair_perfect', m5 === before.zol + 10, `zol=${m5}`);
  await page.waitForTimeout(2400);

  // MG6: sparkle spawns and starts a game on tap
  await page.evaluate(() => window.WARREN_DEBUG.spawnSparkle());
  await page.waitForTimeout(300);
  await page.tap('.mg-sparkle', { force: true });
  await page.waitForTimeout(400);
  const m6 = await page.evaluate(() => window.WARREN_DEBUG.mgState().active);
  log('MG6_sparkle_optin', !!m6, `started=${m6}`);

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
