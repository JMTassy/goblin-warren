// proposal-inspector-gates.js — the Proposal Inspector (status chips over
// real proposal/signal data). Laws: hidden by default · toggles open/closed
// on tap · every field is real data (signal title/zone/intensity, proposer
// name+mode), no fabricated claim · AUTHORITY/REPLAY text matches this
// game's real mechanic (the TRY/HOLD/COMPOST tap is the one admission act)
// · pure read-only: opening/closing moves NO governed truth · closes
// itself when there's no active proposal · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1400);
  await page.mouse.click(195, 500);
  await page.waitForTimeout(200);

  // PI1: hidden by default when a proposal appears
  const pi1 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.forceArcProposal();
    await new Promise(r => setTimeout(r, 200));
    const panel = document.getElementById('proposal-inspector');
    return { hiddenByDefault: panel.classList.contains('hidden') };
  });
  log('PI1_hidden_by_default', pi1.hiddenByDefault, JSON.stringify(pi1));

  // PI2: toggling opens it and every field matches real signal/proposal data
  const pi2 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG, s = D.getState();
    D.toggleProposalInspector();
    const panel = document.getElementById('proposal-inspector');
    const signal = s.world.currentSignal, p = s.activeProposal;
    const proposer = s.goblins[p.proposerId];
    return {
      open: !panel.classList.contains('hidden'),
      signalMatch: document.getElementById('pi-signal').textContent.includes(signal.title),
      zoneMatch: document.getElementById('pi-zone').textContent.length > 0,
      intensityDots: document.getElementById('pi-intensity').textContent.length === 3,
      proposerMatch: document.getElementById('pi-proposer').textContent.includes(proposer.name),
      authorityText: document.querySelector('.pi-false').textContent,
      replayText: document.querySelector('.pi-true').textContent
    };
  });
  log('PI2_open_and_real_data',
    pi2.open && pi2.signalMatch && pi2.zoneMatch && pi2.intensityDots && pi2.proposerMatch &&
    /false/.test(pi2.authorityText) && /admission/.test(pi2.replayText),
    JSON.stringify(pi2));

  // PI3: toggling again closes it
  const pi3 = await page.evaluate(() => {
    window.WARREN_DEBUG.toggleProposalInspector();
    return { hidden: document.getElementById('proposal-inspector').classList.contains('hidden') };
  });
  log('PI3_toggle_closes', pi3.hidden, JSON.stringify(pi3));

  // PI4: pure read-only — opening/closing moved no governed truth
  const pi4 = await page.evaluate(() => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const before = JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs,
      sap: s.progress.magicSap, owned: s.territories.owned.length, level: s.progress.level });
    D.toggleProposalInspector(); D.toggleProposalInspector(); D.toggleProposalInspector();
    const after = JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs,
      sap: s.progress.magicSap, owned: s.territories.owned.length, level: s.progress.level });
    return { same: before === after };
  });
  log('PI4_pure_read_only', pi4.same, JSON.stringify(pi4));

  // PI5: resolving the proposal clears the inspector along with the card
  const pi5 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.toggleProposalInspector(); // open it
    D.resolve('try');
    await new Promise(r => setTimeout(r, 200));
    const panel = document.getElementById('proposal-inspector');
    return { hiddenAfterResolve: panel.classList.contains('hidden') };
  });
  log('PI5_clears_on_resolve', pi5.hiddenAfterResolve, JSON.stringify(pi5));

  log('PI6_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
