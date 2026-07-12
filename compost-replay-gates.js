// compost-replay-gates.js — the Warren as a composting replay organism.
// Laws under test (the ones that keep the mechanic honest):
//   determinism · no clock in the fold · threshold decay · replay refresh ·
//   compost is one-way (reversible only by new events) · no silent drop.
// Not part of the shipped game — a witness script only.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

const BUCKET = 1800000; // 30-min bucket, must match COMPOST_BUCKET_MS

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1200);

  // helper: reset the memory field to a clean, deterministic baseline
  const reset = async () => page.evaluate(() => {
    const s = window.WARREN_DEBUG.getState();
    s.replay.length = 0;
    s.world.warrenTicks = 0;
    s.world.soil = 0;
    s.objects.length = 0;
  });

  // CR1 — threshold: a memory composts at exactly the tick threshold, not before
  await reset();
  const cr1 = await page.evaluate((BUCKET) => {
    const D = window.WARREN_DEBUG;
    D.pushMemory('a small thing happened');
    D.warrenAbsence(47 * BUCKET);           // ticks -> 47, age 47 < 48
    const before = D.getReplay()[0].composted;
    D.warrenAbsence(1 * BUCKET);            // ticks -> 48, age 48 >= 48
    const after = D.getReplay()[0].composted;
    return { before, after, ticks: D.getWarrenTicks() };
  }, BUCKET);
  log('CR1_threshold_decay', cr1.before === false && cr1.after === true && cr1.ticks === 48,
    JSON.stringify(cr1));

  // CR2 — replay refresh: touching a memory before threshold keeps it true
  // while an untouched sibling composts. Replay is load-bearing.
  await reset();
  const cr2 = await page.evaluate((BUCKET) => {
    const D = window.WARREN_DEBUG;
    const A = D.pushMemory('memory A — replayed');
    const B = D.pushMemory('memory B — neglected');
    D.warrenAbsence(40 * BUCKET);           // ticks 40; both age 40 (survive)
    D.touchMemory(A.id);                    // A.freshTick -> 40
    D.warrenAbsence(40 * BUCKET);           // ticks 80; A age 40 survives, B age 80 composts
    const rep = D.getReplay();
    const a = rep.find(r => r.id === A.id), bb = rep.find(r => r.id === B.id);
    return { aComposted: a.composted, bComposted: bb.composted };
  }, BUCKET);
  log('CR2_replay_refreshes', cr2.aComposted === false && cr2.bComposted === true, JSON.stringify(cr2));

  // CR3 — compost is one-way: a composted memory cannot be un-composted here;
  // only a new event can grow from that soil. touchMemory refuses it.
  await reset();
  const cr3 = await page.evaluate((BUCKET) => {
    const D = window.WARREN_DEBUG;
    const M = D.pushMemory('doomed memory');
    D.warrenAbsence(48 * BUCKET);           // composts M
    const wasComposted = D.getReplay().find(r => r.id === M.id).composted;
    const touchReturn = D.touchMemory(M.id); // must refuse
    const stillComposted = D.getReplay().find(r => r.id === M.id).composted;
    return { wasComposted, touchReturn, stillComposted };
  }, BUCKET);
  log('CR3_compost_one_way', cr3.wasComposted === true && cr3.touchReturn === false && cr3.stillComposted === true,
    JSON.stringify(cr3));

  // CR4 — no clock in the fold: compostStale() is idempotent. Running it again
  // with no new ticks composts nothing new (proves ticks drive it, not wall time).
  await reset();
  const cr4 = await page.evaluate((BUCKET) => {
    const D = window.WARREN_DEBUG;
    D.pushMemory('m1'); D.pushMemory('m2'); D.pushMemory('m3');
    D.warrenAbsence(50 * BUCKET);           // composts all three (+1 receipt)
    const first = D.getReplay().filter(r => r.composted).length;
    const again1 = D.compostStale();        // no new ticks -> 0
    const again2 = D.compostStale();        // still 0
    const nowComposted = D.getReplay().filter(r => r.composted).length;
    return { first, again1, again2, nowComposted };
  }, BUCKET);
  log('CR4_fold_idempotent', cr4.first === 3 && cr4.again1 === 0 && cr4.again2 === 0 && cr4.nowComposted === 3,
    JSON.stringify(cr4));

  // CR5 — no silent drop of fresh memories (the old `replay.length > 40` lie).
  // Push well past the soft cap with ZERO absence: nothing composts, so nothing
  // is allowed to fall off the end. All fresh memories are retained.
  await reset();
  const cr5 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG;
    for (let i = 0; i < 130; i++) D.pushMemory('fresh #' + i);
    const rep = D.getReplay();
    return { len: rep.length, anyComposted: rep.some(r => r.composted) };
  });
  log('CR5_fresh_never_dropped', cr5.len === 130 && cr5.anyComposted === false, JSON.stringify(cr5));

  // CR6 — determinism across independent runs: same (memories + absence) yields
  // the same compost signature, regardless of wall-clock / memory ids.
  const sig = async () => page.evaluate((BUCKET) => {
    const D = window.WARREN_DEBUG;
    const s = D.getState();
    s.replay.length = 0; s.world.warrenTicks = 0; s.world.soil = 0; s.objects.length = 0;
    for (let i = 0; i < 6; i++) D.pushMemory('seed ' + i);
    D.warrenAbsence(60 * BUCKET);
    return { ticks: D.getWarrenTicks(), soil: s.world.soil,
             composted: D.getReplay().filter(r => r.composted).length };
  }, BUCKET);
  const s1 = await sig();
  await page.reload(); await page.waitForTimeout(1000);
  const s2 = await sig();
  log('CR6_deterministic_signature', JSON.stringify(s1) === JSON.stringify(s2),
    JSON.stringify(s1) + ' vs ' + JSON.stringify(s2));

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
