// prologue-gates.js — VISION_V1_33 "The Petit Prince Prologue" gate.
// Standalone Playwright harness (verify.js is a static grep harness and
// cannot exercise browser behavior — see VISION_V1_33.md §6).
// Laws under test: first-run only · restraint (only Lulu+Tree at t=0) ·
// always skippable, never traps · returning players get zero behavior
// change · the whole sequence is pure onboarding theater (no ZOL, no
// admission — G4 membrane).
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

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));

  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1000);
  // force a genuinely fresh save, then reload so boot() sees isFreshBoot===true
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1000);

  // ---------------------------------------------------------------------
  // G1 — fresh save: prologue-active present, only Lulu + Tree visible,
  // other goblins/zones/chips hidden.
  // ---------------------------------------------------------------------
  const g1 = await page.evaluate(({ chips, otherZones, otherGoblins }) => {
    const app = document.getElementById('app');
    const vis = id => { const el = document.getElementById(id); return !!el && getComputedStyle(el).display !== 'none'; };
    return {
      prologueActive: app.classList.contains('prologue-active'),
      luluVisible: vis('goblin-lulu'),
      treeVisible: vis('zone-tree'),
      otherGoblinsHidden: otherGoblins.every(id => !vis('goblin-' + id)),
      otherZonesHidden: otherZones.every(id => !vis('zone-' + id)),
      chipsHidden: chips.every(id => !vis(id)),
      state: window.WARREN_DEBUG.getPrologueState()
    };
  }, { chips: CHIPS, otherZones: OTHER_ZONES, otherGoblins: OTHER_GOBLINS });
  log('G1_fresh_save_only_lulu_and_tree',
    g1.prologueActive && g1.luluVisible && g1.treeVisible && g1.otherGoblinsHidden &&
    g1.otherZonesHidden && g1.chipsHidden && g1.state.active && !g1.state.seen && g1.state.step === 1,
    JSON.stringify(g1));

  // ---------------------------------------------------------------------
  // G2 — drive the reveal via WARREN_DEBUG hooks: seed blooms, crew
  // reveals, chips appear, prologue-active removed, prologueSeen===true,
  // persists across reload.
  // ---------------------------------------------------------------------
  await page.evaluate(() => window.WARREN_DEBUG.tapLuluPrologue());
  await page.waitForTimeout(1300); // "after the boop" seed-bloom beat (900ms)

  const g2seed = await page.evaluate(() => {
    const st = window.WARREN_DEBUG.getPrologueState();
    return { step: st.step, seedShown: st.seedShown, seedObjId: st.seedObjId,
      objects: window.WARREN_DEBUG.getObjects().map(o => o.sign) };
  });
  log('G2a_seed_blooms_after_boop',
    g2seed.step === 3 && g2seed.seedShown && g2seed.objects.indexOf('A Seed, Yours') !== -1,
    JSON.stringify(g2seed));

  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // taps the seed
  await page.waitForTimeout(4700); // crew reveals ~1.2s apart (3 goblins)

  const g2crew = await page.evaluate(({ otherGoblins }) => {
    const vis = id => { const el = document.getElementById(id); return !!el && getComputedStyle(el).display !== 'none'; };
    return { step: window.WARREN_DEBUG.getPrologueState().step,
      crewVisible: otherGoblins.every(id => vis('goblin-' + id)) };
  }, { otherGoblins: OTHER_GOBLINS });
  log('G2b_crew_reveals_one_by_one', g2crew.crewVisible, JSON.stringify(g2crew));

  await page.waitForTimeout(6500); // zones fade in, then chips, then finishPrologue

  const g2end = await page.evaluate(({ chips }) => {
    const app = document.getElementById('app');
    const vis = id => { const el = document.getElementById(id); return !!el && getComputedStyle(el).display !== 'none'; };
    return {
      prologueActiveGone: !app.classList.contains('prologue-active'),
      chipsVisible: chips.every(vis),
      state: window.WARREN_DEBUG.getPrologueState()
    };
  }, { chips: CHIPS });
  log('G2c_sequence_completes',
    g2end.prologueActiveGone && g2end.chipsVisible && g2end.state.seen && g2end.state.step === 6 && !g2end.state.active,
    JSON.stringify(g2end));

  await page.reload();
  await page.waitForTimeout(1200);
  const g2persist = await page.evaluate(() => window.WARREN_DEBUG.getState().flags.prologueSeen);
  log('G2d_persists_across_reload', g2persist === true, 'prologueSeen=' + g2persist);

  // ---------------------------------------------------------------------
  // G3 — returning player (prologueSeen===true at boot): no prologue-active,
  // all goblins + chips visible immediately, zero behavior change.
  // ---------------------------------------------------------------------
  const g3 = await page.evaluate(({ chips, otherGoblins, otherZones }) => {
    const app = document.getElementById('app');
    const vis = id => { const el = document.getElementById(id); return !!el && getComputedStyle(el).display !== 'none'; };
    return {
      noPrologueActive: !app.classList.contains('prologue-active'),
      allGoblinsVisible: ['lulu'].concat(otherGoblins).every(id => vis('goblin-' + id)),
      allZonesVisible: ['tree'].concat(otherZones).every(id => vis('zone-' + id)),
      allChipsVisible: chips.every(vis)
    };
  }, { chips: CHIPS, otherGoblins: OTHER_GOBLINS, otherZones: OTHER_ZONES });
  log('G3_returning_player_full_map_immediately',
    g3.noPrologueActive && g3.allGoblinsVisible && g3.allZonesVisible && g3.allChipsVisible,
    JSON.stringify(g3));

  // ---------------------------------------------------------------------
  // G4 — membrane: the whole Prologue is pure onboarding theater. Snapshot
  // ZOL/territories before and after a full fresh run — must be unchanged.
  // ---------------------------------------------------------------------
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1000);

  const before = await page.evaluate((SNAP) => eval(SNAP), SNAP);
  await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    D.tapLuluPrologue();
  });
  await page.waitForTimeout(1300);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue());
  await page.waitForTimeout(4700 + 6500);
  const midState = await page.evaluate(() => window.WARREN_DEBUG.getPrologueState());
  const after = await page.evaluate((SNAP) => eval(SNAP), SNAP);
  log('G4_membrane_no_zol_no_admission',
    before === after && midState.step === 6,
    'before=' + before + ' after=' + after + ' finished=' + midState.step);

  // ---------------------------------------------------------------------
  // Bonus: skip affordance never traps — a fresh run can jump straight to
  // the end state from any step.
  // ---------------------------------------------------------------------
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1000);
  const skip = await page.evaluate(({ chips, otherGoblins }) => {
    window.WARREN_DEBUG.skipPrologue();
    const app = document.getElementById('app');
    const vis = id => { const el = document.getElementById(id); return !!el && getComputedStyle(el).display !== 'none'; };
    return {
      prologueActiveGone: !app.classList.contains('prologue-active'),
      crewVisible: otherGoblins.every(id => vis('goblin-' + id)),
      chipsVisible: chips.every(vis),
      seen: window.WARREN_DEBUG.getState().flags.prologueSeen === true
    };
  }, { chips: CHIPS, otherGoblins: OTHER_GOBLINS });
  log('G5_skip_never_traps',
    skip.prologueActiveGone && skip.crewVisible && skip.chipsVisible && skip.seen,
    JSON.stringify(skip));

  log('G6_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
