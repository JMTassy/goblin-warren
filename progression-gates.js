// progression-gates.js — VISION_PROGRESSION "The Bonding Ladder" (Rungs 1-3).
// Standalone Playwright harness (verify.js is a static grep harness and cannot
// exercise browser behavior). Supersedes prologue-gates.js: the crib no longer
// dumps the whole Warren in one session — it stages Notice → Gesture → Memory
// and only then graduates.
//
// 2026-07-14 fix (operator witness, first real beta play): "I first love it
// then get bored because I do not see the step by step progression." Root
// cause: tapping the Rung-2 mystery (the player's peak-curiosity moment) said
// "Not yet, come back" and blocked all further progress except a REAL PAGE
// RELOAD — which no first-time player would think to do. Fixed: tapping the
// mystery now IS the next step (an in-session "the night turns" beat, no
// reload required), and a legible progress dots cue (#crib-progress) makes
// "step by step" visible for the first time. The reload-to-resume path is
// KEPT as a secondary path (a player who genuinely closes and reopens the
// tab must still land correctly) — tested separately below, not as primary.
//
// Laws under test:
//   Rung 1 (NOTICE)  — fresh boot shows ONE goblin + the tree, zero menus.
//   Rung 2 (GESTURE) — offering the seed blooms a PERSISTENT flower and a
//                      mystery, but the wider Warren stays hidden (no dump).
//   Rung 2→3         — tapping the mystery advances IN-SESSION, no reload.
//   Rung 3 (MEMORY)  — the memory beat plays, THEN graduates.
//   Progress cue     — #crib-progress dots reflect the current rung, then hide.
//   Reload-resume    — a genuine tab close/reopen after offering the seed
//                      still lands correctly (secondary path, still lawful).
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
const dotsSrc = `function () { const w = document.getElementById('crib-progress'); if (!w) return null;
  return { hidden: w.classList.contains('hidden'),
    dots: Array.from(w.children).map(d => ({ done: d.classList.contains('done'), current: d.classList.contains('crib-cue') })) }; }`;

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
  const g1 = await page.evaluate(({ chips, otherZones, otherGoblins, visSrc, dotsSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const dots = eval('(' + dotsSrc + ')')();
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
      progressVisible: dots && !dots.hidden,
      st: window.WARREN_DEBUG.getCribState()
    };
  }, { chips: CHIPS, otherZones: OTHER_ZONES, otherGoblins: OTHER_GOBLINS, visSrc: vises, dotsSrc });
  log('G1_rung1_one_goblin_zero_menus_progress_shown',
    g1.cribActive && g1.luluVisible && g1.treeVisible && g1.otherGoblinsHidden &&
    g1.otherZonesHidden && g1.chipsHidden && g1.topbarHidden && g1.bottombarHidden &&
    g1.progressVisible && g1.st.active && !g1.st.seen && g1.st.step === 1 && g1.st.rung === 1,
    JSON.stringify(g1));

  // ---- Rung 1 → wake: tap Lulu, she stirs, wakes, greets, then the seed
  // appears (staged pacing: stir ~0.85s, greet, seed at ~4s after wake) -----
  await page.evaluate(() => window.WARREN_DEBUG.tapLuluPrologue());
  await page.waitForTimeout(5600);
  const g2 = await page.evaluate(({ dotsSrc }) => {
    const st = window.WARREN_DEBUG.getCribState();
    const dots = eval('(' + dotsSrc + ')')();
    return { step: st.step, rung: st.rung, woke: st.onboarding.woke, seedShown: st.seedShown,
      signs: window.WARREN_DEBUG.getObjects().map(o => o.sign), dots };
  }, { dotsSrc });
  log('G2_notice_wakes_seed_appears_progress_advances',
    g2.step === 2 && g2.rung === 2 && g2.woke && g2.seedShown &&
    g2.signs.indexOf('A Seed, Yours') !== -1 &&
    g2.dots.dots[0].done && g2.dots.dots[1].current,
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

  // ---- THE FIX UNDER TEST: tapping the mystery advances IN-SESSION, no
  // reload — this is the exact wall the operator hit as a beta tester. -------
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // taps the mystery
  await page.waitForTimeout(3600); // nightfall (1.6s) + sleep→wake (1.8s) + buffer
  const g4 = await page.evaluate(({ visSrc, dotsSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const st = window.WARREN_DEBUG.getCribState();
    const dots = eval('(' + dotsSrc + ')')();
    return { step: st.step, rung: st.rung, active: st.active, seen: st.seen,
      bloomPersists: window.WARREN_DEBUG.getObjects().some(o => o.emoji === '🌸'),
      cribActiveStill: document.getElementById('app').classList.contains('crib-active'),
      dots };
  }, { visSrc: vises, dotsSrc });
  log('G4_mystery_tap_advances_to_rung3_without_reload',
    g4.step === 3 && g4.rung === 3 && g4.active && !g4.seen && g4.bloomPersists &&
    g4.cribActiveStill && g4.dots.dots[0].done && g4.dots.dots[1].done && g4.dots.dots[2].current,
    JSON.stringify(g4));

  // ---- Rung 4 THE NEED: memory graduates into the need beat, not straight
  // to the full Warren — this is the fix for "the graduation gap" (Rungs
  // 4-11 were 100% unbuilt; the crib jumped from Rung 3 to full complexity
  // in ~90s). Real scarcity under test: Lulu names THREE things, but only
  // TWO are actionable this rung (matcha cup + bloom); the third is named
  // then deliberately deferred, never spawning a tappable object. ----------
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // memory -> THE NEED
  await page.waitForTimeout(2800); // the matcha cup spawns ~2.2s in
  const g4d = await page.evaluate(({ dotsSrc }) => {
    const st = window.WARREN_DEBUG.getCribState();
    const dots = eval('(' + dotsSrc + ')')();
    const objs = window.WARREN_DEBUG.getObjects();
    return { step: st.step, rung: st.rung,
      need1: st.onboarding.need1Done, need2: st.onboarding.need2Done, need3: st.onboarding.need3Deferred,
      matchaCupObjId: st.onboarding.matchaCupObjId,
      cupPresent: objs.some(o => o.emoji === '🍵'), bloomPresent: objs.some(o => o.emoji === '🌸'),
      careObjectCount: objs.filter(o => o.emoji === '🍵' || o.emoji === '🌸').length,
      dots };
  }, { dotsSrc });
  log('G4d_need_named_only_two_actions_real_scarcity',
    g4d.step === 4 && g4d.rung === 4 && !g4d.need1 && !g4d.need2 && !g4d.need3 &&
    !!g4d.matchaCupObjId && g4d.cupPresent && g4d.bloomPresent && g4d.careObjectCount === 2 &&
    g4d.dots.dots[2].done && g4d.dots.dots[3].current,
    JSON.stringify(g4d));

  // feed Lulu (need 1): the cup is consumed, not left lying around
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue());
  await page.waitForTimeout(400);
  const g4e = await page.evaluate(() => {
    const st = window.WARREN_DEBUG.getCribState();
    const objs = window.WARREN_DEBUG.getObjects();
    return { need1: st.onboarding.need1Done, need2: st.onboarding.need2Done, rung: st.rung,
      cupGone: !objs.some(o => o.emoji === '🍵') };
  });
  log('G4e_feed_lulu_consumes_matcha_not_yet_graduated',
    g4e.need1 && !g4e.need2 && g4e.rung === 4 && g4e.cupGone,
    JSON.stringify(g4e));

  // water the bloom (need 2): the SAME persistent flower, not a new object —
  // both needs met now triggers the deferred-third beat, then graduation.
  // MARIO LAW (witness #4): the earned graduation opens WORLD 1 only —
  // Lulu + Zaz, tree + garden, currency/zol chips. NOT the rung-12 dump.
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue());
  await page.waitForTimeout(4800); // deferred-third line (1.2s) + graduate (3.2s) + buffer
  const g4f = await page.evaluate(({ visSrc, dotsSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const app = document.getElementById('app');
    const st = window.WARREN_DEBUG.getCribState();
    const dots = eval('(' + dotsSrc + ')')();
    const idle = document.getElementById('sheet-idle');
    return {
      need2: st.onboarding.need2Done, need3Deferred: st.onboarding.need3Deferred,
      graduated: !app.classList.contains('crib-active') && !app.classList.contains('prologue-active'),
      seen: st.seen, world: window.WARREN_DEBUG.getWorld(),
      zazVisible: vis('goblin-zaz'), pipHidden: !vis('goblin-pip'), nibHidden: !vis('goblin-nib'),
      gardenVisible: vis('zone-garden'), forgeHidden: !vis('zone-forge'), nurseryHidden: !vis('zone-nursery'),
      walletVisible: vis('zol-wallet'), riddleHidden: !vis('riddle-chip'),
      levelHidden: !vis('level-chip'), signalHidden: !vis('signal-indicator'),
      noBossQuest: !idle || idle.textContent.indexOf('Raâm') === -1,
      barsBack: vis('topbar') && vis('bottombar'),
      bloomPersists: window.WARREN_DEBUG.getObjects().some(o => o.emoji === '🌸'),
      progressHidden: dots && dots.hidden
    };
  }, { visSrc: vises, dotsSrc });
  log('G4f_earned_graduation_opens_world1_not_rung12',
    g4f.need2 && g4f.need3Deferred && g4f.graduated && g4f.seen &&
    g4f.world.staged && g4f.world.world === 1 && g4f.world.rung === 5 &&
    g4f.zazVisible && g4f.pipHidden && g4f.nibHidden &&
    g4f.gardenVisible && g4f.forgeHidden && g4f.nurseryHidden &&
    g4f.walletVisible && g4f.riddleHidden && g4f.levelHidden && g4f.signalHidden &&
    g4f.noBossQuest && g4f.barsBack && g4f.bloomPersists && g4f.progressHidden,
    JSON.stringify(g4f));

  // ---- The Worlds advance one at a time, milestone-gated, bosses last ----
  // Even with EVERY milestone pre-earned, one check = one world (ceremony).
  const gw = await page.evaluate(() => {
    const S = window.WARREN_DEBUG.getState();
    S.quizState = S.quizState || {}; S.quizState.rewardPaid = { q1: true, q2: true, q3: true, q4: true };
    S.flags.quizRight = 5; S.flags.proposalsResolved = 2;
    const seq = [];
    seq.push(window.WARREN_DEBUG.checkWorldAdvance());
    return { seq, world: window.WARREN_DEBUG.getWorld() };
  });
  log('GW1_one_world_per_beat', gw.seq[0] === 2 && gw.world.rung === 7 && gw.world.earned === 4,
    JSON.stringify(gw));
  await page.waitForTimeout(1700); // ceremony cooldown between advances
  const gw2 = await page.evaluate(({ visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    return { pipVisible: vis('goblin-pip'), forgeVisible: vis('zone-forge'), riddleVisible: vis('riddle-chip'),
      nibStillHidden: !vis('goblin-nib'), levelStillHidden: !vis('level-chip') };
  }, { visSrc: vises });
  log('GW2_world2_reveals_pip_forge_riddle_only',
    gw2.pipVisible && gw2.forgeVisible && gw2.riddleVisible && gw2.nibStillHidden && gw2.levelStillHidden,
    JSON.stringify(gw2));
  await page.evaluate(() => window.WARREN_DEBUG.checkWorldAdvance());
  await page.waitForTimeout(1700);
  const gw3 = await page.evaluate(({ visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const idle = document.getElementById('sheet-idle');
    return { world: window.WARREN_DEBUG.getWorld(), nibVisible: vis('goblin-nib'),
      nurseryVisible: vis('zone-nursery'), gateVisible: vis('zone-gate'), signalVisible: vis('signal-indicator'),
      questsBack: !!idle && idle.textContent.indexOf('QUESTS') !== -1,
      levelStillHidden: !vis('level-chip') };
  }, { visSrc: vises });
  log('GW3_world3_opens_governance_not_bosses',
    gw3.world.world === 3 && gw3.world.rung === 9 && gw3.nibVisible && gw3.nurseryVisible &&
    gw3.gateVisible && gw3.signalVisible && gw3.questsBack && gw3.levelStillHidden,
    JSON.stringify(gw3));
  await page.evaluate(() => window.WARREN_DEBUG.checkWorldAdvance());
  await page.waitForTimeout(1700);
  const gw4 = await page.evaluate(({ visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    return { world: window.WARREN_DEBUG.getWorld(), levelVisible: vis('level-chip'),
      templeVisible: vis('temple') };
  }, { visSrc: vises });
  log('GW4_world4_opens_levels_and_bosses_last',
    gw4.world.world === 4 && gw4.world.rung === 11 && gw4.levelVisible && gw4.templeVisible,
    JSON.stringify(gw4));

  // ---- Resume safety: a genuine reload mid-Rung-4 (need named, matcha cup
  // spawned, neither need met yet) must land back in the SAME beat, not
  // replay Rung 3 or lose the cup — the resume path added for this rung. ---
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.WARREN_DEBUG.tapLuluPrologue());
  await page.waitForTimeout(5600);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // offer seed
  await page.waitForTimeout(5000); // bloom + mystery
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // tap mystery -> rung3
  await page.waitForTimeout(3600);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // memory -> rung4
  await page.waitForTimeout(2800); // matcha cup spawns
  await page.reload(); // genuine close/reopen, mid-need, nothing fed/watered yet
  await page.waitForTimeout(1200);
  const g4g = await page.evaluate(() => {
    const st = window.WARREN_DEBUG.getCribState();
    const objs = window.WARREN_DEBUG.getObjects();
    return { step: st.step, rung: st.rung, active: st.active, seen: st.seen,
      need1: st.onboarding.need1Done, need2: st.onboarding.need2Done,
      cupPresent: objs.some(o => o.emoji === '🍵'), bloomPresent: objs.some(o => o.emoji === '🌸') };
  });
  log('G4g_reload_resume_mid_need_lands_same_beat',
    g4g.step === 4 && g4g.rung === 4 && g4g.active && !g4g.seen &&
    !g4g.need1 && !g4g.need2 && g4g.cupPresent && g4g.bloomPresent,
    JSON.stringify(g4g));
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // feed
  await page.waitForTimeout(300);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // water -> graduates
  await page.waitForTimeout(4800);

  // ---- Secondary path: a REAL reload (genuine tab close/reopen) after
  // offering the seed — before the mystery is ever tapped — must still
  // resolve correctly (multi-session resume stays lawful, just not the
  // only door anymore). -------------------------------------------------
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.WARREN_DEBUG.tapLuluPrologue());
  await page.waitForTimeout(5600);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // offer seed
  await page.waitForTimeout(1400); // bloom completes; mystery not yet shown
  await page.reload(); // genuine close/reopen, before any mystery tap
  await page.waitForTimeout(1400);
  const g4c = await page.evaluate(() => {
    const st = window.WARREN_DEBUG.getCribState();
    return { step: st.step, rung: st.rung, active: st.active, seen: st.seen,
      bloomPersists: window.WARREN_DEBUG.getObjects().some(o => o.emoji === '🌸') };
  });
  log('G4c_reload_resume_still_lawful_secondary_path',
    g4c.step === 3 && g4c.rung === 3 && g4c.active && !g4c.seen && g4c.bloomPersists,
    JSON.stringify(g4c));
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // memory -> rung4
  await page.waitForTimeout(2800);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // feed
  await page.waitForTimeout(300);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // water -> graduates
  await page.waitForTimeout(4800);

  // ---- Staged save persists its world across a real reload ---------------
  // (the save on disk here is G4c's fresh staged graduation = World 1: the
  // grandfather belt must NOT bump a worldStaged save to rung 12)
  await page.reload();
  await page.waitForTimeout(1200);
  const g5a = await page.evaluate(({ visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const app = document.getElementById('app');
    return {
      noCrib: !app.classList.contains('crib-active') && !app.classList.contains('prologue-active'),
      world: window.WARREN_DEBUG.getWorld(),
      zazVisible: vis('goblin-zaz'), pipStillHidden: !vis('goblin-pip'),
      nurseryStillHidden: !vis('zone-nursery'), levelStillHidden: !vis('level-chip')
    };
  }, { visSrc: vises });
  log('G5a_staged_world1_survives_reload_not_bumped_to_12',
    g5a.noCrib && g5a.world.staged && g5a.world.rung === 5 && g5a.world.world === 1 &&
    g5a.zazVisible && g5a.pipStillHidden && g5a.nurseryStillHidden && g5a.levelStillHidden,
    JSON.stringify(g5a));

  // ---- Grandfather: a PRE-Worlds save (prologueSeen, no worldStaged) gets
  // EXACTLY today's full Warren at rung 12 — zero behavior change ----------
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.WARREN_DEBUG.setPrologueSeen(true));
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

  // ---- Membrane: the whole crib mutates no ZOL / no territory, using the
  // real in-session tap path (the one players actually take) -----------------
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.reload();
  await page.waitForTimeout(1000);
  const before = await page.evaluate((SNAP) => eval(SNAP), SNAP);
  await page.evaluate(() => window.WARREN_DEBUG.tapLuluPrologue());
  await page.waitForTimeout(5600);   // stir → wake → greet → seed
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // offer
  await page.waitForTimeout(5000);   // bloom → mystery appears
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // tap mystery
  await page.waitForTimeout(3600);   // nightfall → rung 3
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // memory -> rung4
  await page.waitForTimeout(2800);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // feed
  await page.waitForTimeout(300);
  await page.evaluate(() => window.WARREN_DEBUG.advancePrologue()); // water -> graduates
  await page.waitForTimeout(4800);
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

  // ---- The skip BUTTON obeys Mario law: skip the crib, land in World 1 —
  // never the rung-12 dump (witness #5: an operator replaying the crib
  // taps skip, and skipping the tutorial must not skip the progression).
  await page.evaluate(() => window.WARREN_DEBUG.wipe());
  await page.goto('file:///home/user/goblin-warren/index.html?newgame=1'); // also proves ?newgame=1 wipes
  await page.waitForTimeout(1400);
  const g7b = await page.evaluate(({ visSrc }) => {
    const vis = eval('(' + visSrc + ')');
    const btn = document.getElementById('prologue-skip');
    const wasCrib = document.getElementById('app').classList.contains('crib-active');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { wasCrib, world: window.WARREN_DEBUG.getWorld(),
      zazVisible: vis('goblin-zaz'), pipHidden: !vis('goblin-pip'),
      levelHidden: !vis('level-chip'),
      cribGone: !document.getElementById('app').classList.contains('crib-active') };
  }, { visSrc: vises });
  log('G7b_skip_button_lands_world1_not_dump',
    g7b.wasCrib && g7b.cribGone && g7b.world.staged && g7b.world.world === 1 && g7b.world.rung === 5 &&
    g7b.zazVisible && g7b.pipHidden && g7b.levelHidden,
    JSON.stringify(g7b));

  log('G8_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
