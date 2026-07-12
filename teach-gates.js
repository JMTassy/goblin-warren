const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1300);

  // T1: teach panel renders on a goblin card with an input
  const t1 = await page.evaluate(async () => {
    window.WARREN_DEBUG.openCard('pip');
    await new Promise(r => setTimeout(r, 300));
    return { input: !!document.getElementById('teach-input'), head: !!document.querySelector('.teach-head') };
  });
  log('T1_teach_ui', t1.input && t1.head, JSON.stringify(t1));

  // T2: teaching a fact makes the goblin PROPOSE (no world change yet — proposal ⊬ admission)
  const t2 = await page.evaluate(async () => {
    const objBefore = window.WARREN_DEBUG.getObjects().length;
    window.WARREN_DEBUG.teach('pip', 'light bounces off water');
    await new Promise(r => setTimeout(r, 300));
    const pend = window.WARREN_DEBUG.getTeaching().pending;
    const objAfter = window.WARREN_DEBUG.getObjects().length;
    return { proposed: !!pend, line: pend ? pend.line : '', noChangeYet: objBefore === objAfter };
  });
  log('T2_proposal_not_admission', t2.proposed && t2.noChangeYet && t2.line.includes('lantern'), JSON.stringify(t2));

  // T3: only STAMPING admits it — the world changes on the seal, not before
  const t3 = await page.evaluate(async () => {
    const objBefore = window.WARREN_DEBUG.getObjects().length;
    window.WARREN_DEBUG.sealTeaching();
    await new Promise(r => setTimeout(r, 300));
    const s = window.WARREN_DEBUG.getState();
    return {
      objDelta: window.WARREN_DEBUG.getObjects().length - objBefore,
      lantern: s.objects.some(o => o.sign.includes('Lantern')),
      lesson: window.WARREN_DEBUG.getTeaching().lessons.length,
      replay: s.replay.some(r => r.choice === 'teach-sealed'),
      pendingCleared: window.WARREN_DEBUG.getTeaching().pending === null
    };
  });
  log('T3_stamp_admits', t3.objDelta === 1 && t3.lantern && t3.lesson === 1 && t3.replay && t3.pendingCleared, JSON.stringify(t3));

  // T4: the goblin REMEMBERS — callback surfaces on the card
  const t4 = await page.evaluate(async () => {
    window.WARREN_DEBUG.openCard('pip');
    await new Promise(r => setTimeout(r, 200));
    const mem = document.getElementById('card-memory').textContent;
    const cb = window.WARREN_DEBUG.goblinCallback('pip');
    return { mem, hasCallback: cb && cb.includes('You taught me') };
  });
  log('T4_goblin_remembers', t4.hasCallback && t4.mem.includes('taught'), JSON.stringify(t4));

  // T5: misgeneralization is comedy — "birds fly because light" → feathers on a rock
  const t5 = await page.evaluate(async () => {
    const interp = window.WARREN_DEBUG.interpretLesson('birds fly because they are light');
    return { comedy: interp.comedy, sign: interp.sign };
  });
  log('T5_hallucination_comedy', t5.comedy && t5.sign.includes('does not fly'), JSON.stringify(t5));

  // T6: NOT stamping leaves the world untouched (proposal ⊬ admission, negative case)
  const t6 = await page.evaluate(async () => {
    const objBefore = window.WARREN_DEBUG.getObjects().length;
    window.WARREN_DEBUG.teach('zaz', 'plants grow from seeds');
    await new Promise(r => setTimeout(r, 200));
    window.WARREN_DEBUG.dismissTeaching();
    await new Promise(r => setTimeout(r, 200));
    return { objDelta: window.WARREN_DEBUG.getObjects().length - objBefore,
             pending: window.WARREN_DEBUG.getTeaching().pending };
  });
  log('T6_no_stamp_no_change', t6.objDelta === 0 && t6.pending === null, JSON.stringify(t6));

  // T7: teaching costs no ZOL (coins demoted — teaching is its own channel)
  const t7 = await page.evaluate(async () => {
    const z = window.WARREN_DEBUG.getState().learning.zolBalance;
    window.WARREN_DEBUG.teach('nib', 'fire is warm');
    window.WARREN_DEBUG.sealTeaching();
    await new Promise(r => setTimeout(r, 200));
    return window.WARREN_DEBUG.getState().learning.zolBalance === z;
  });
  log('T7_teaching_free', t7, `zol unchanged=${t7}`);

  // T8: capability growth — 3 lessons graduates the goblin
  const t8 = await page.evaluate(async () => {
    for (const f of ['water is wet', 'kindness helps', 'the sun is bright']) {
      window.WARREN_DEBUG.teach('lulu', f); window.WARREN_DEBUG.sealTeaching();
      await new Promise(r => setTimeout(r, 120));
    }
    const s = window.WARREN_DEBUG.getState();
    return { count: window.WARREN_DEBUG.getTeaching().taughtCount.lulu,
             grad: s.replay.some(r => r.choice === 'teach-graduated') };
  });
  log('T8_graduation', t8.count >= 3 && t8.grad, JSON.stringify(t8));

  // T9: lessons persist across reload
  const before = await page.evaluate(() => window.WARREN_DEBUG.getTeaching().lessons.length);
  await page.reload(); await page.waitForTimeout(1000);
  const after = await page.evaluate(() => window.WARREN_DEBUG.getTeaching().lessons.length);
  log('T9_lessons_persist', after === before && after > 0, `before=${before} after=${after}`);

  await page.evaluate(() => window.WARREN_DEBUG.openCard('pip'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/claude-0/-home-user-goblin-warren/9926ca51-6861-5e47-ab28-c05501ea0895/scratchpad/qa/24-teach.png' });
  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
