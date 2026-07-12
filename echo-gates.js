const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // E1: echoes state exists and starts empty
  const e1 = await page.evaluate(() => window.WARREN_DEBUG.getEchoes());
  log('E1_echoes_init', e1 && e1.nibHyper === false && e1.memoryFact === null && e1.mushroomNoticed === false, JSON.stringify(e1));

  // helper: run a mini-game to a specific outcome via the real handlers
  // E2: over-repair overshoot sets nibHyper
  const e2 = await page.evaluate(async () => {
    window.WARREN_DEBUG.startMinigame('repair');
    await new Promise(r => setTimeout(r, 1000));
    window.WARREN_DEBUG.mgRepairSet(95); // overshoot
    await new Promise(r => setTimeout(r, 300));
    return window.WARREN_DEBUG.getEchoes().nibHyper;
  });
  log('E2_overrepair_sets_nibHyper', e2 === true, `nibHyper=${e2}`);
  await page.waitForTimeout(2400);

  // E3: nibHyper changes Nib's Council opening line
  const e3 = await page.evaluate(async () => {
    // resolve Gerald T5a so the council can convene, then force-start it
    window.WARREN_DEBUG.unlockGeraldQuest();
    window.WARREN_DEBUG.triggerGeraldProposal();
    window.WARREN_DEBUG.resolveGeraldChoice('try');
    await new Promise(r => setTimeout(r, 300));
    window.WARREN_DEBUG.startCouncil();
    await new Promise(r => setTimeout(r, 300));
    const lines = [...document.querySelectorAll('.council-line')].map(x => x.textContent);
    return lines.join(' || ');
  });
  log('E3_council_reads_nibHyper', e3.includes('SIX WALLS'), e3.slice(0, 120));

  // E4: memoryFact adds a Pip aside; mushroomNoticed adds a Zaz aside (fresh council)
  const e4 = await page.evaluate(async () => {
    // reset council + set echoes
    const s = window.WARREN_DEBUG.getState();
    s.council = { done: false, stage: 'IDLE', card: null };
    window.WARREN_DEBUG.setEcho('memoryFact', 'Minister of Navigation');
    window.WARREN_DEBUG.setEcho('mushroomNoticed', true);
    window.WARREN_DEBUG.startCouncil();
    await new Promise(r => setTimeout(r, 300));
    const lines = [...document.querySelectorAll('.council-line')].map(x => x.textContent).join(' || ');
    return { hasMinister: lines.includes('Minister of Navigation'), hasMushroom: lines.includes('mushroom is watching') };
  });
  log('E4_council_reads_memory_and_mushroom', e4.hasMinister && e4.hasMushroom, JSON.stringify(e4));

  // E5: echoes persist across reload
  const before = await page.evaluate(() => JSON.stringify(window.WARREN_DEBUG.getEchoes()));
  await page.reload(); await page.waitForTimeout(1000);
  const after = await page.evaluate(() => JSON.stringify(window.WARREN_DEBUG.getEchoes()));
  log('E5_echoes_persist', before === after && after.includes('Minister'), `persisted=${before === after}`);

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
