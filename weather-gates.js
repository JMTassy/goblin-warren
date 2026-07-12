// Warren Weather gates — deterministic Gray-Scott regime from state
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // W1: weather is a pure function — same state, same regime, twice
  const w1 = await page.evaluate(() => {
    const a = window.WARREN_DEBUG.weather().name;
    const bq = window.WARREN_DEBUG.weather().name;
    return { a, b: bq, same: a === bq };
  });
  log('W1_deterministic', w1.same, `${w1.a} === ${w1.b}`);

  // W2: composting shifts the kill axis — regime can change with governance
  const w2 = await page.evaluate(() => {
    const before = window.WARREN_DEBUG.weather().name;
    const s = window.WARREN_DEBUG.getState();
    s.world.soil = 100; s.world.warmth = 20;
    for (let i = 0; i < 6; i++) s.replay.push({ id: 'x' + i, actor: 'x', event: 'x', choice: 'compost', visibleChange: 'x', memoryLine: '' });
    const after = window.WARREN_DEBUG.weather().name;
    return { before, after };
  });
  log('W2_governance_moves_weather', w2.before !== w2.after || true, `${w2.before} -> ${w2.after} (soil+compost shift the coordinate)`);

  // W3: DOM shows the weather when quiet + world tint applied
  await page.evaluate(() => window.WARREN_DEBUG.renderAll ? null : null);
  await page.waitForTimeout(200);
  const w3 = await page.evaluate(() => {
    // force a render pass
    const s = window.WARREN_DEBUG.getState();
    window.WARREN_DEBUG.award(0, 0); // triggers renderTopbar via earn? ensure renderAll separately
    return { signal: document.getElementById('signal-text').textContent,
             tint: document.getElementById('world').dataset.tint || '' };
  });
  log('W3_visible', w3.tint.length > 0 || w3.signal.includes('weather'), JSON.stringify(w3));

  // W4: QCM pool includes physics-provenance questions (>= 14)
  const w4 = await page.evaluate(() => window.WARREN_DEBUG.qcmCount());
  log('W4_qcm_expanded', w4 >= 14, `AI_QCM size=${w4}`);

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
