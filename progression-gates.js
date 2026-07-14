// progression-gates.js — VISION_PROGRESSION "The Bonding Ladder" (Rungs 1-3).
// Standalone Playwright harness (verify.js is a static grep harness and cannot
// exercise browser behavior). Supersedes prologue-gates.js: the crib no longer
// dumps the whole Warren in one session — it stages Notice → Gesture → Memory
// across sessions and only then graduates.
//
// Laws under test:
//   Rung 1 (NOTICE)  — fresh boot shows ONE goblin + the tree, zero menus.
//   Rung 2 (GESTURE) — offering the seed blooms a PERSISTENT flower and a
//                      mystery, but the wider Warren stays hidden (no dump).
//   Rung 3 (MEMORY)  — a return visit remembers the flower, THEN graduates.
//   Grandfather      — an established save (prologueSeen true) gets EXACTLY
//                      today's full Warren, zero behavior change.
//   Membrane         — the whole crib is pure onboarding theater: no ZOL,
//                      no admission, no territory mutation.
//   Never traps      — skip graduates immediately from any step.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

const CHIPS = ['signal-indicator', 'riddle-chip', 'level-chip', 'currency', 'zol-wallet'];
const OTHER_ZONES = ['garden', 'nursery', 'spire', 'forge', 'gate'];
const OTHER_GOBLINS = ['pip', 'zaz', 'nib'];

const SNAP = `(function () {
  const s = window.WARREN_DEBUG.getState();
  return JSON.stringify({ zol: s.learning.zolBalance, owned: s.territories.owned.length,
    building: !!s.territories.building });
})()`;

const vises = `function (id) { const el = document.getElementById(id); return !!el && getComputedStyle(el).display !== 'none'; }`;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));

  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1200);

  // ---- Rung 1 NOTICE: only Lulu + tree, zero menus, step 1 / rung 1 --------
  const g1 = await page.evaluate(({ chips, otherZones, otherGoblins, visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const app = document.getElementById('app');
    return {
      cribActive: app.classList.contains('crib-active') && app.classList.contains('prologue-active'),
      luluVisible: vis('goblin-lulu'),
      treeVisible: vis('zone-tree'),
      otherGoblinsHidden: otherGoblins.every(id => !vis('goblin-' + id)),
      otherZonesHidden: otherZones.every(id => !vis('zone-' + id)),
      chipsHidden: chips.every(id => !vis(id)),
      topbarHidden: !vis('topbar'),
      bottombarHidden: !vis('bottombar'),
      st: window.WARREN_DEBUG.getCribState()
    };
  }, { chips: CHIPS, otherZones: OTHER_ZONES, otherGoblins: OTHER_GOBLINS, visSrc: vises });
  log('G1_rung1_one_goblin_zero_menus',
    g1.cribActive && g1.luluVisible && g1.treeVisible && g1.otherGoblinsHidden &&
    g1.otherZonesHidden && g1.chipsHidden && g1.topbarHidden && g1.bottombarHidden &&
    g1.st.active && !g1.st.seen && g1.st.step === 1 && g1.st.rung === 1,
    JSON.stringify(g1));

  // ---- Rung 1 → wake: tap Lulu, she notices you, seed appears, rung 2 -----
  await page.evaluate(() => window.WARREN_DEBUG.tapLuluPrologue());
  await page.waitForTimeout(1500);
  const g2 = await page.evaluate(() => {
    const st = window.WARREN_DEBUG.getCribState();
    return { step: st.step, rung: st.rung, woke: st.onboarding.woke, seedShown: st.seedShown,
      signs: window.WARREN_DEBUG.getObjects().map(o => o.sign) };
  });
  log('G2_notice_wakes_and_seed_appears',
    g2.step === 2 && g2.rung === 2 && g2.woke && g2.seedShown &&
    g2.signs.indexOf('A Seed, Yours') !== -1,
    JSON.stringify(g2));

  // ---- Rung 2 GESTURE: offer the seed → persistent bloom + mystery, and
  // CRUCIALLY the wider Warren stays hidden (no one-session dump) -----------
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // offer seed
  await page.waitForTimeout(1400);
  const g3 = await page.evaluate(({ otherGoblins, visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const st = window.WARREN_DEBUG.getCribState();
    return { offered: st.onboarding.offered, bloomObjId: st.bloomObjId, seen: st.seen,
      signs: window.WARREN_DEBUG.getObjects().map(o => o.sign),
      emojis: window.WARREN_DEBUG.getObjects().map(o => o.emoji),
      crewStillHidden: otherGoblins.every(id => !vis('goblin-' + id)) };
  }, { otherGoblins: OTHER_GOBLINS, visSrc: vises });
  log('G3_gesture_blooms_persistent_flower_no_dump',
    g3.offered && !!g3.bloomObjId && !g3.seen &&
    g3.emojis.indexOf('🌸') !== -1 && g3.signs.indexOf('Our First Bloom') !== -1 &&
    g3.crewStillHidden,
    JSON.stringify(g3));

  // the mystery (future promise) surfaces a few seconds after the bloom
  await page.waitForTimeout(3600);
  const g3b = await page.evaluate(({ visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const st = window.WARREN_DEBUG.getCribState();
    return { mysteryShown: vis('crib-mystery'), mystery: st.onboarding.mystery, seen: st.seen };
  }, { visSrc: vises });
  log('G3b_mystery_promise_appears_session_still_ungraduated',
    g3b.mysteryShown && g3b.mystery && !g3b.seen,
    JSON.stringify(g3b));

  // ---- Rung 3 MEMORY: a return visit remembers the flower, then graduates -
  await page.reload();
  await page.waitForTimeout(1400);
  const g4 = await page.evaluate(({ visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const st = window.WARREN_DEBUG.getCribState();
    return { step: st.step, rung: st.rung, active: st.active, seen: st.seen,
      bloomPersists: window.WARREN_DEBUG.getObjects().some(o => o.emoji === '🌸'),
      cribActiveStill: document.getElementById('app').classList.contains('crib-active') };
  }, { visSrc: vises });
  log('G4_return_remembers_flower_rung3',
    g4.step === 3 && g4.rung === 3 && g4.active && !g4.seen && g4.bloomPersists && g4.cribActiveStill,
    JSON.stringify(g4));

  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // graduate from memory
  await page.waitForTimeout(1000);
  const g4b = await page.evaluate(({ chips, otherGoblins, visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const app = document.getElementById('app');
    const st = window.WARREN_DEBUG.getCribState();
    return {
      graduated: !app.classList.contains('crib-active') && !app.classList.contains('prologue-active'),
      seen: st.seen, rung: st.rung,
      crewVisible: otherGoblins.every(id => vis('goblin-' + id)),
      chipsVisible: chips.every(vis), barsBack: vis('topbar') && vis('bottombar'),
      bloomPersists: window.WARREN_DEBUG.getObjects().some(o => o.emoji === '🌸')
    };
  }, { chips: CHIPS, otherGoblins: OTHER_GOBLINS, visSrc: vises });
  log('G4b_graduation_opens_full_warren',
    g4b.graduated && g4b.seen && g4b.rung === 12 && g4b.crewVisible && g4b.chipsVisible &&
    g4b.barsBack && g4b.bloomPersists,
    JSON.stringify(g4b));

  // ---- Grandfather: an established save gets the full Warren, no crib ------
  await page.reload();
  await page.waitForTimeout(1200);
  const g5 = await page.evaluate(({ chips, otherGoblins, otherZones, visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const app = document.getElementById('app');
    return {
      noCrib: !app.classList.contains('crib-active') && !app.classList.contains('prologue-active'),
      allGoblins: ['lulu'].concat(otherGoblins).every(id => vis('goblin-' + id)),
      allZones: ['tree'].concat(otherZones).every(id => vis('zone-' + id)),
      allChips: chips.every(vis), rung: window.WARREN_DEBUG.getRung()
    };
  }, { chips: CHIPS, otherGoblins: OTHER_GOBLINS, otherZones: OTHER_ZONES, visSrc: vises });
  log('G5_established_player_full_warren_no_crib',
    g5.noCrib && g5.allGoblins && g5.allZones && g5.allChips && g5.rung === 12,
    JSON.stringify(g5));

  // ---- Membrane: the whole crib mutates no ZOL / no territory --------------
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1000);
  const before = await page.evaluate((SNAP) => eval(SNAP), SNAP);
  await page.evaluate(() => window.WARREN_DEBUG.tapLuluPrologue());
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // offer
  await page.waitForTimeout(1400);
  await page.reload();               // return
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // graduate
  await page.waitForTimeout(800);
  const after = await page.evaluate((SNAP) => eval(SNAP), SNAP);
  const finalSeen = await page.evaluate(() => window.WARREN_DEBUG.getCribState().seen);
  log('G6_membrane_no_zol_no_admission', before === after && finalSeen === true,
    'before=' + before + ' after=' + after + ' seen=' + finalSeen);

  // ---- Never traps: skip graduates immediately ----------------------------
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1000);
  const skip = await page.evaluate(({ chips, otherGoblins, visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    window.WARREN_DEBUG.skipPrologue();
    const app = document.getElementById('app');
    return {
      cribGone: !app.classList.contains('crib-active') && !app.classList.contains('prologue-active'),
      crewVisible: otherGoblins.every(id => vis('goblin-' + id)),
      chipsVisible: chips.every(vis),
      seen: window.WARREN_DEBUG.getCribState().seen
    };
  }, { chips: CHIPS, otherGoblins: OTHER_GOBLINS, visSrc: vises });
  log('G7_skip_never_traps',
    skip.cribGone && skip.crewVisible && skip.chipsVisible && skip.seen,
    JSON.stringify(skip));

  log('G8_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
