// GOBLIN COUNCIL V0 — acceptance gates C1-C10 (Gerald's Citizenship Hearing)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const URL = 'file://' + path.join('/home/user/goblin-warren', 'index.html');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
  const t0 = Date.now();
  await page.goto(URL);
  await page.waitForTimeout(1500);

  // Prereq: resolve Gerald T5a so the hearing has context
  await page.evaluate(() => {
    window.WARREN_DEBUG.unlockGeraldQuest();
    window.WARREN_DEBUG.triggerGeraldProposal();
    window.WARREN_DEBUG.resolveGeraldChoice('try');
  });
  await page.waitForTimeout(400);

  // C2: every dialogue line under 90 chars (opening + all update rounds)
  const longLines = await page.evaluate(() => {
    const ep = window.WARREN_DEBUG.getCouncilEpisode();
    const all = ep.opening.concat(...ep.cards.map(c => c.update));
    return all.filter(l => l.text.length >= 90).map(l => l.speaker + ':' + l.text.length);
  });
  log('C2_lines_under_90_chars', longLines.length === 0, longLines.length ? JSON.stringify(longLines) : 'all < 90');

  // Open the hearing
  const started = await page.evaluate(() => window.WARREN_DEBUG.startCouncil());
  await page.waitForTimeout(400);

  // C1: opening positions derive from live goblin state (role mapping)
  const c1 = await page.evaluate(() => {
    const pos = window.WARREN_DEBUG.getCouncilPositions();
    const g = window.WARREN_DEBUG.getState().goblins;
    return {
      pos,
      derived: pos.pip === 'observe' && g.pip.role === 'Archivist' &&
               pos.zaz === 'move' && g.zaz.role === 'Gardener' &&
               pos.lulu === 'house' && g.lulu.role === 'Detour Specialist' &&
               pos.nib === 'wall'
    };
  });
  log('C1_positions_state_derived', started && c1.derived, JSON.stringify(c1.pos));

  // C7 (part 1): the debate itself mutated nothing in the world
  const preWorld = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { objects: s.objects.length, zol: s.learning.zolBalance, health: s.world.treeHealth };
  });

  // Council sheet visible with 4 statements and benches
  const ui = await page.evaluate(() => ({
    visible: !document.getElementById('sheet-council').classList.contains('hidden'),
    lines: document.querySelectorAll('.council-line').length,
    cards: document.querySelectorAll('.council-card').length
  }));
  log('C0_ui_renders', ui.visible && ui.lines === 4 && ui.cards === 3, JSON.stringify(ui));

  // Play CLARIFY by tapping the card (the one player intervention)
  await page.tap('.council-card[data-card="clarify"]');
  await page.waitForTimeout(500);

  // C3: a second intervention is refused
  const second = await page.evaluate(() => window.WARREN_DEBUG.councilCard('evidence'));
  log('C3_intervene_only_once', second === false, `second card returned ${second}`);

  // C4: at least two agents changed position (clarify: zaz move→house, nib wall→house)
  const posAfter = await page.evaluate(() => window.WARREN_DEBUG.getCouncilPositions());
  const changed = ['lulu', 'pip', 'zaz', 'nib'].filter(id => posAfter[id] !== c1.pos[id]);
  log('C4_two_agents_changed', changed.length >= 2, `changed: ${changed.join(', ')} → ${JSON.stringify(posAfter)}`);

  // C5: refusal preserved (pip stays on observe against the house majority)
  log('C5_refusal_possible', posAfter.pip === 'observe', `pip=${posAfter.pip} while majority=house`);

  // C7 (part 2): still nothing mutated before execution completes
  const midWorld = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { objects: s.objects.length, zol: s.learning.zolBalance };
  });
  log('C7_dialogue_never_mutates', midWorld.objects === preWorld.objects && midWorld.zol === preWorld.zol,
    `pre=${JSON.stringify(preWorld)} mid=${JSON.stringify(midWorld)}`);

  // Wait for autonomous execution + side effect
  await page.waitForTimeout(6000);

  // C6: consensus caused a real world mutation (Embassy object, ZOL, health)
  const post = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return {
      embassy: s.objects.some(o => o.sign === 'The Embassy of Bug'),
      zol: s.learning.zolBalance, health: s.world.treeHealth,
      done: s.council.done, stage: s.council.stage
    };
  });
  log('C6_real_world_mutation', post.embassy && post.zol === preWorld.zol + 15 && post.done,
    JSON.stringify(post));

  // C8: visible comic escalation — the second bug requesting asylum
  const escalation = await page.evaluate(() =>
    window.WARREN_DEBUG.getState().objects.some(o => o.sign === 'Second Bug — Asylum Request'));
  log('C8_comic_escalation', escalation, `second bug present=${escalation}`);

  // C9: replay explains the causal sequence (open → card → executed → side effect)
  const replay = await page.evaluate(() =>
    window.WARREN_DEBUG.getState().replay.filter(r => String(r.choice).indexOf('council') === 0).map(r => r.choice));
  const causal = ['council-open', 'council-card', 'council-executed', 'council-side-effect']
    .every(k => replay.includes(k));
  log('C9_causal_replay', causal, replay.join(' → '));

  // C10: full round (including think time here) within 90 seconds
  const elapsed = (Date.now() - t0) / 1000;
  log('C10_within_90s', elapsed < 90, `${elapsed.toFixed(1)}s`);

  // Maestro lesson visible with Sigma expression
  const lesson = await page.evaluate(() => {
    const el = document.getElementById('maestro-lesson');
    const txt = document.getElementById('maestro-lesson-text');
    return { open: el && !el.classList.contains('hidden'), sigma: txt && txt.textContent.includes('🐛 + 🏠 ⇒ 🐛🐛'), foreign: txt && txt.textContent.includes('foreign policy') };
  });
  log('C11_maestro_lesson_sigma', lesson.open && lesson.sigma && lesson.foreign, JSON.stringify(lesson));

  await page.screenshot({ path: '/tmp/claude-0/-home-user-goblin-warren/9926ca51-6861-5e47-ab28-c05501ea0895/scratchpad/qa/10-council-end.png' });

  // Persistence: council stays done across reload
  await page.reload(); await page.waitForTimeout(1500);
  const persisted = await page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    return { done: s.council.done, embassy: s.objects.some(o => o.sign === 'The Embassy of Bug') };
  });
  log('C12_reload_persists', persisted.done && persisted.embassy, JSON.stringify(persisted));

  await browser.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  if (failed.length) { console.log('Failed: ' + failed.join(', ')); process.exit(1); }
  process.exit(0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
