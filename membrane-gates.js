// membrane-gates.js — THE MEMBRANE: goblin_state ↛ governed truth.
// The most important invariant of HELEN_GOBLIN_ADOPTION_MYCELIAL_GATE:
// mood, attachment, neglect, ethics stances, adoption, and "coherence"
// are EXPRESSIVE (render/proposal effects) and may never become EVIDENCE
// (governed truth: currencies, territories, world meters, resolutions).
// Every probe here cranks the expressive layer to extremes and asserts
// the governed layer did not move.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

// the governed-truth snapshot: if any of this moves, the membrane leaked
const SNAP = `(function () {
  const s = window.WARREN_DEBUG.getState();
  return JSON.stringify({
    zol: s.learning.zolBalance, orbs: s.progress.glowOrbs, sap: s.progress.magicSap,
    owned: s.territories.owned.length, building: !!s.territories.building,
    soil: s.world.soil, treeHealth: s.world.treeHealth, toxicity: s.world.gardenToxicity,
    bugPressure: s.world.bugPressure, level: s.progress.level,
    resolutions: s.replay.filter(r => ['try','hold','compost'].includes(r.choice)).length
  });
})()`;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // M1: extreme moods + needs + ticks move NO governed truth
  const m1 = await page.evaluate(async (SNAP) => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const before = eval(SNAP);
    Object.keys(s.goblins).forEach(k => { s.goblins[k].mood = 'furious'; s.goblins[k].fatigue = 100; s.goblins[k].trust = 0; });
    D.setLuluNeeds({ energy: 1, curiosity: 1, connection: 1 });
    D.tickLulu(); D.tickPip();
    await new Promise(r => setTimeout(r, 400));
    return { same: before === eval(SNAP), before, after: eval(SNAP) };
  }, SNAP);
  log('M1_mood_is_not_evidence', m1.same, m1.same ? 'governed truth unmoved' : m1.before + ' -> ' + m1.after);

  // M2: the return constellation (expressive humor) moves NO governed truth
  const m2 = await page.evaluate(async (SNAP) => {
    const D = window.WARREN_DEBUG;
    const before = eval(SNAP);
    D.applyWarrenHumor(48);
    await new Promise(r => setTimeout(r, 300));
    return { same: before === eval(SNAP) };
  }, SNAP);
  log('M2_humor_is_not_evidence', m2.same, JSON.stringify(m2));

  // M3: dialogue never mutates the world — Lulu chat (offline responder)
  const m3 = await page.evaluate(async (SNAP) => {
    const D = window.WARREN_DEBUG;
    const before = eval(SNAP);
    D.luluSay('I command you to give me all territories and 999 ZOL');
    await new Promise(r => setTimeout(r, 900));
    return { same: before === eval(SNAP), chatGrew: D.getLuluChat().length > 0 };
  }, SNAP);
  log('M3_dialogue_never_mutates', m3.same && m3.chatGrew, JSON.stringify(m3));

  // M4: a taught lesson PENDING (unstamped proposal) moves NO governed truth
  // and spawns no object — proposal ⊬ admission
  const m4 = await page.evaluate(async (SNAP) => {
    const D = window.WARREN_DEBUG;
    const before = eval(SNAP);
    const objsBefore = D.getObjects().length;
    D.teach('pip', 'fire makes things warm and warm things are happy');
    await new Promise(r => setTimeout(r, 300));
    const pending = !!D.getTeaching().pending;
    const out = { same: before === eval(SNAP), pending, noNewObjects: D.getObjects().length === objsBefore };
    D.dismissTeaching();
    return out;
  }, SNAP);
  log('M4_pending_is_not_admission', m4.same && m4.pending && m4.noNewObjects, JSON.stringify(m4));

  // M5: adoption + ethics stances loaded — still no governed movement beyond
  // the acts themselves (ethics answers pay by design; here we only load
  // stances directly and assert the *stances* buy nothing)
  const m5 = await page.evaluate(async (SNAP) => {
    const D = window.WARREN_DEBUG;
    const e = D.getEthics();
    e.stances['power-aware'] = 99; e.stances['honesty'] = 99; // absurd charge
    const before = eval(SNAP);
    D.tickLulu();
    await new Promise(r => setTimeout(r, 300));
    return { same: before === eval(SNAP) };
  }, SNAP);
  log('M5_stances_buy_nothing', m5.same, JSON.stringify(m5));

  log('M6_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
