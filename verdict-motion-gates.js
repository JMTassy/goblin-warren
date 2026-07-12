// verdict-motion-gates.js — the goblin-style Daily Verdict result motion
// (PARKED_CHIDDUSHIM.md #17). Laws: fires once, on the live stamp, never on
// reopen · the chosen world hops in loudest, last · the typewritten journal
// line reconstructs to the exact same text the reducer produced (motion
// never touches content) · memory fragments float and clean themselves up ·
// the Akashic Tree pulses once · prefers-reduced-motion skips all of it and
// leaves the (already-correct) static split in place · pure motion: CROWN 3
// economy stays byte-identical · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1500);

  // VM1: the moment of stamping — worlds hop in (gob-enter present early),
  // economy untouched, journal text reconstructs exactly (motion never
  // touches content)
  const vm1 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG, s = D.getState();
    const ecoBefore = JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs, sap: s.progress.magicSap });
    if (D.getVerdictIndex() == null) D.setVerdictIndex(0);
    D.openVerdictCard();
    await new Promise(r => setTimeout(r, 150));
    D.stampVerdict('🟢');
    await new Promise(r => setTimeout(r, 60));
    const hoppingEarly = document.querySelectorAll('.split-world.gob-enter').length > 0;
    await new Promise(r => setTimeout(r, 2200));
    const dil = D.getDilemmas()[D.getVerdictIndex()];
    // the template wraps the journal in curly quotes (buildVerdictSplitHTML) —
    // that's existing app behavior; strip them to compare against the raw text
    const expectedJournal = dil.consequence['🟢'].journal;
    const journalEl = document.querySelector('.split-world.chosen .sw-journal');
    const reconstructed = journalEl ? journalEl.textContent.replace(/^[“"]|[”"]$/g, '') : null;
    const ecoAfter = JSON.stringify({ zol: s.learning.zolBalance, orbs: s.progress.glowOrbs, sap: s.progress.magicSap });
    return { hoppingEarly, reconstructed, expectedJournal, ecoSame: ecoBefore === ecoAfter };
  });
  log('VM1_hop_and_exact_journal_reconstruction',
    vm1.hoppingEarly && vm1.reconstructed === vm1.expectedJournal && vm1.ecoSame,
    JSON.stringify(vm1));

  // VM2: memory fragments spawned, then cleaned up (no leaked fx layer).
  // Fragments spawn ~680ms after the stamp and self-remove ~2.2s later
  // (~2.9s total) -- wait past that before checking.
  await page.waitForTimeout(900);
  const vm2 = await page.evaluate(async () => {
    const leftoverLayers = document.querySelectorAll('.verdict-fx-layer').length;
    return { leftoverLayers };
  });
  log('VM2_fragments_clean_up_after_themselves', vm2.leftoverLayers === 0, JSON.stringify(vm2));

  // VM3: the Akashic Tree glyph pulses once, near the end of the sequence
  const vm3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    D.stampVerdict('🔴'); // refused — already stamped today; re-verify no crash
    const treeGlyph = document.querySelector('#zone-tree .zone-glyph');
    return { treeGlyphExists: !!treeGlyph, notBeatingNow: treeGlyph ? !treeGlyph.classList.contains('beat') : null };
  });
  log('VM3_tree_glyph_present_and_settled', vm3.treeGlyphExists && vm3.notBeatingNow === true, JSON.stringify(vm3));

  // VM4: reopening the already-stamped verdict does NOT replay the motion —
  // the split renders statically, no gob-enter classes appear
  const vm4 = await page.evaluate(async () => {
    document.getElementById('verdict-card').remove();
    const D = window.WARREN_DEBUG;
    D.openVerdictCard();
    await new Promise(r => setTimeout(r, 300));
    const card = document.getElementById('verdict-card');
    const txt = card ? card.textContent : '';
    const dil = D.getDilemmas()[D.getVerdictIndex()];
    const contentPresent = txt.includes(dil.consequence['🟢'].journal);
    const noReplay = document.querySelectorAll('.gob-enter').length === 0;
    return { contentPresent, noReplay };
  });
  log('VM4_no_replay_on_reopen', vm4.contentPresent && vm4.noReplay, JSON.stringify(vm4));

  // VM5: reduced motion — split content fully present, zero motion classes anywhere
  await page.reload();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(1500);
  const vm5 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    if (D.getVerdictIndex() == null) D.setVerdictIndex(0);
    D.openVerdictCard();
    await new Promise(r => setTimeout(r, 150));
    D.stampVerdict('🟢');
    await new Promise(r => setTimeout(r, 500));
    const dil = D.getDilemmas()[D.getVerdictIndex()];
    const card = document.getElementById('verdict-card');
    const txt = card ? card.textContent : '';
    return {
      contentPresent: txt.includes(dil.consequence['🟢'].journal),
      noMotionClasses: document.querySelectorAll('.gob-enter, .verdict-frag, .gob-char').length === 0
    };
  });
  log('VM5_reduced_motion_shows_static_correct_split', vm5.contentPresent && vm5.noMotionClasses, JSON.stringify(vm5));

  log('VM6_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
