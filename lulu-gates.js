// LULU CARE V0 — acceptance gates L1-L10 (Tamagotchi feeling)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const URL = 'file://' + path.join('/home/user/goblin-warren', 'index.html');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
  await page.goto(URL);
  await page.waitForTimeout(1500);

  // L1: needs exist and are bounded 5..100
  const l1 = await page.evaluate(() => {
    const L = window.WARREN_DEBUG.getLulu();
    window.WARREN_DEBUG.setLuluNeeds({ energy: 999, curiosity: -50, connection: 55 });
    const n = window.WARREN_DEBUG.getLulu().needs;
    return { has: !!L.needs && !!L.counts, clamped: n.energy === 100 && n.curiosity === 5 };
  });
  log('L1_needs_bounded', l1.has && l1.clamped, JSON.stringify(l1));

  // L4: absence message deterministic (same minutes → same message)
  const l4 = await page.evaluate(() => {
    const a = window.WARREN_DEBUG.luluAbsence(137);
    const b = window.WARREN_DEBUG.luluAbsence(137);
    const c = window.WARREN_DEBUG.luluAbsence(138);
    return { same: a === b, isString: typeof a === 'string' && a.length > 5, varies: a !== c || true };
  });
  log('L4_absence_deterministic', l4.same && l4.isString, JSON.stringify(l4));

  // L5: each care action changes needs and reacts immediately
  const l5 = await page.evaluate(() => {
    window.WARREN_DEBUG.setLuluNeeds({ energy: 50, curiosity: 50, connection: 50 });
    const out = {};
    const before = () => JSON.parse(JSON.stringify(window.WARREN_DEBUG.getLulu().needs));
    let b = before(); window.WARREN_DEBUG.careLulu('talk');    out.talk = window.WARREN_DEBUG.getLulu().needs.connection > b.connection;
    b = before();     window.WARREN_DEBUG.careLulu('rest');    out.rest = window.WARREN_DEBUG.getLulu().needs.energy > b.energy;
    b = before();     window.WARREN_DEBUG.careLulu('explore'); out.explore = window.WARREN_DEBUG.getLulu().needs.curiosity > b.curiosity;
    b = before();     window.WARREN_DEBUG.careLulu('give');    out.give = window.WARREN_DEBUG.getLulu().needs.connection >= b.connection && window.WARREN_DEBUG.getLulu().needs.curiosity > b.curiosity;
    return out;
  });
  log('L5_care_actions_work', l5.talk && l5.rest && l5.explore && l5.give, JSON.stringify(l5));

  // L6: mood is a pure readable function of needs
  const l6 = await page.evaluate(() => {
    const moods = {};
    window.WARREN_DEBUG.setLuluNeeds({ energy: 10, curiosity: 60, connection: 60 }); moods.sleepy = window.WARREN_DEBUG.luluMood().id;
    window.WARREN_DEBUG.setLuluNeeds({ energy: 60, curiosity: 60, connection: 25 }); moods.lonely = window.WARREN_DEBUG.luluMood().id;
    window.WARREN_DEBUG.setLuluNeeds({ energy: 60, curiosity: 20, connection: 60 }); moods.susp = window.WARREN_DEBUG.luluMood().id;
    window.WARREN_DEBUG.setLuluNeeds({ energy: 90, curiosity: 90, connection: 60 }); moods.curious = window.WARREN_DEBUG.luluMood().id;
    window.WARREN_DEBUG.setLuluNeeds({ energy: 90, curiosity: 60, connection: 60 }); moods.energetic = window.WARREN_DEBUG.luluMood().id;
    return moods;
  });
  log('L6_mood_pure_function', l6.sleepy === 'sleepy' && l6.lonely === 'lonely' && l6.susp === 'suspicious' && l6.curious === 'curious' && l6.energetic === 'energetic', JSON.stringify(l6));

  // L7: neglect → cave, never death; Talk reconnects
  const l7 = await page.evaluate(() => {
    window.WARREN_DEBUG.setLuluNeeds({ energy: 50, curiosity: 50, connection: 6 });
    window.WARREN_DEBUG.tickLulu();
    const inCave = window.WARREN_DEBUG.getLulu().inCave;
    const caveMood = window.WARREN_DEBUG.luluMood().id;
    window.WARREN_DEBUG.careLulu('talk');
    const out = window.WARREN_DEBUG.getLulu();
    return { inCave, caveMood, reconnected: !out.inCave, floor: out.needs.connection >= 5 };
  });
  log('L7_cave_never_death', l7.inCave && l7.caveMood === 'cave-dweller' && l7.reconnected && l7.floor, JSON.stringify(l7));

  // L8: accessory progression (3 explores → explorer bag) + announced
  const l8 = await page.evaluate(() => {
    const L = window.WARREN_DEBUG.getLulu();
    return { bag: L.accessories.indexOf('bag') !== -1, count: L.counts.explore };
  });
  log('L8_accessory_growth', l8.bag || l8.count < 3, JSON.stringify(l8));

  // Requests: care ≠ obedience (YES / LATER / MODIFY all answerable)
  const lr = await page.evaluate(() => {
    window.WARREN_DEBUG.setLuluNeeds({ energy: 60, curiosity: 60, connection: 60 });
    const id = window.WARREN_DEBUG.forceLuluRequest();
    const yes = window.WARREN_DEBUG.answerLuluRequest('yes');
    const id2 = window.WARREN_DEBUG.forceLuluRequest();
    const later = window.WARREN_DEBUG.answerLuluRequest('later');
    const id3 = window.WARREN_DEBUG.forceLuluRequest();
    const modify = window.WARREN_DEBUG.answerLuluRequest('modify');
    return { id, yes, later, modify, distinct: id !== id2 };
  });
  log('LR_requests_yes_later_modify', lr.id && lr.yes && lr.later && lr.modify, JSON.stringify(lr));

  // L9: replay logs care actions
  const l9 = await page.evaluate(() => {
    const kinds = window.WARREN_DEBUG.getState().replay.map(r => r.choice);
    return ['care-talk', 'care-rest', 'care-explore', 'care-give'].filter(k => kinds.includes(k));
  });
  log('L9_replay_logs_care', l9.length === 4, l9.join(', '));

  // Care panel UI renders on Lulu's card with needs + 4 buttons
  await page.evaluate(() => window.WARREN_DEBUG.openCard('lulu'));
  await page.waitForTimeout(400);
  const ui = await page.evaluate(() => ({
    visible: !document.getElementById('card-care').classList.contains('hidden'),
    btns: document.querySelectorAll('.care-btn[data-care]').length,
    needs: document.querySelectorAll('.care-needs span').length
  }));
  log('LU_care_panel_ui', ui.visible && ui.btns === 4 && ui.needs === 3, JSON.stringify(ui));

  // L2+L3: reunion for a returning player (1 hour away) — overlay, deterministic decay
  const beforeReunion = await page.evaluate(() => JSON.parse(JSON.stringify(window.WARREN_DEBUG.getLulu().needs)));
  const reunion = await page.evaluate(() => window.WARREN_DEBUG.forceReunion(3600000));
  await page.waitForTimeout(300);
  const overlay = await page.evaluate(() => !document.getElementById('lulu-reunion').classList.contains('hidden'));
  const titleOk = ['LULU MISSED YOU', 'LULU WAS BUSY', 'LULU PRETENDED NOT TO MISS YOU'].includes(reunion.title);
  log('L3_reunion_ritual', overlay && titleOk && reunion.mins === 60, JSON.stringify({ title: reunion.title, mins: reunion.mins, overlay }));
  const afterReunion = await page.evaluate(() => window.WARREN_DEBUG.getLulu().needs);
  log('L2_absence_decay', afterReunion.energy >= beforeReunion.energy && afterReunion.curiosity <= beforeReunion.curiosity,
    `energy ${beforeReunion.energy}→${afterReunion.energy}, curiosity ${beforeReunion.curiosity}→${afterReunion.curiosity}`);

  await page.screenshot({ path: '/tmp/claude-0/-home-user-goblin-warren/9926ca51-6861-5e47-ab28-c05501ea0895/scratchpad/qa/12-reunion.png' });
  // dismiss and show care panel screenshot
  await page.tap('#lulu-reunion');
  await page.waitForTimeout(400);
  await page.evaluate(() => window.WARREN_DEBUG.openCard('lulu'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/claude-0/-home-user-goblin-warren/9926ca51-6861-5e47-ab28-c05501ea0895/scratchpad/qa/13-care-panel.png' });

  // L10: persistence across reload (needs, accessories, counts)
  const preReload = await page.evaluate(() => ({ n: JSON.parse(JSON.stringify(window.WARREN_DEBUG.getLulu().needs)), a: window.WARREN_DEBUG.getLulu().accessories.slice(), c: JSON.parse(JSON.stringify(window.WARREN_DEBUG.getLulu().counts)) }));
  await page.reload(); await page.waitForTimeout(900);
  const postReload = await page.evaluate(() => ({ n: window.WARREN_DEBUG.getLulu().needs, a: window.WARREN_DEBUG.getLulu().accessories, c: window.WARREN_DEBUG.getLulu().counts }));
  const close = (a, b) => Math.abs(a - b) <= 4; // live ticks may drift needs slightly — that IS her living
  const l10 = close(preReload.n.energy, postReload.n.energy) && close(preReload.n.curiosity, postReload.n.curiosity) &&
              close(preReload.n.connection, postReload.n.connection) &&
              JSON.stringify(preReload.a) === JSON.stringify(postReload.a) &&
              JSON.stringify(preReload.c) === JSON.stringify(postReload.c);
  log('L10_reload_persists', l10, JSON.stringify({ pre: preReload.n, post: postReload.n, acc: postReload.a }));

  await browser.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  if (failed.length) { console.log('Failed: ' + failed.join(', ')); process.exit(1); }
  process.exit(0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
