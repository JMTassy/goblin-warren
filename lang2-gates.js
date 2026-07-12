// lang2-gates.js — deep French: dynamic texts, composites, the world itself.
// Laws: zones/signs/quests/tasks translate · runtime-assembled composites
// translate via patterns · captured fragments re-translate (zone names
// inside sentences) · answering logic still uses the ENGLISH source string
// (view boundary only) · no page errors.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const results = {};
function log(n, p, d) { results[n] = p; console.log((p ? 'PASS ' : 'FAIL ') + n + ' — ' + d); }

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/goblin-warren/index.html');
  await page.waitForTimeout(1400);
  await page.evaluate(() => document.getElementById('lang-flag').click());
  await page.waitForTimeout(400);

  // F1: the world speaks French — zone labels
  const f1 = await page.evaluate(() => [...document.querySelectorAll('.zone-label')].map(z => z.textContent).join('|'));
  log('F1_zones_french', /Arbre Akashique/.test(f1) && /Forge à Reçus/.test(f1) && /Porte Mycélienne/.test(f1), f1);

  // F2: quests panel — pattern head + exact labels + hint
  const f2 = await page.evaluate(() => {
    const idle = document.getElementById('sheet-idle');
    return idle ? idle.textContent : '';
  });
  log('F2_quests_french', /TERRIER NIVEAU \d+ · QUÊTES/.test(f2) && /Démasquer Raâm/.test(f2) && /gentiment/.test(f2), f2.slice(0, 140));

  // F3: goblin card — task and mood values translate; composites via patterns
  const f3 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG, s = D.getState();
    s.goblins.pip.mood = 'thoughtful'; s.goblins.pip.task = 'resting';
    s.goblins.pip.intention = 'resting near Receipt Forge';
    D.openCard('pip');
    await new Promise(r => setTimeout(r, 300));
    return {
      mood: document.getElementById('card-mood').textContent,
      intention: document.getElementById('card-intention').textContent
    };
  });
  log('F3_card_dynamic_french', f3.mood === 'songeur' && /se repose près de : Forge à Reçus/.test(f3.intention), JSON.stringify(f3));

  // F4: object signs translate on spawn
  const f4 = await page.evaluate(async () => {
    window.WARREN_DEBUG.addObject('🧭', 'The New Path', 'gate');
    await new Promise(r => setTimeout(r, 250));
    return [...document.querySelectorAll('.wobj-sign')].map(x => x.textContent).join('|');
  });
  log('F4_signs_french', /Le Nouveau Chemin/.test(f4), f4.slice(0, 120));

  // F5: composite replay chip translates AND answer logic still gets English
  const f5 = await page.evaluate(async () => {
    const D = window.WARREN_DEBUG;
    // simulate a quiz-right receipt via the real path
    D.forcePromptQuiz();
    const q = D.getQuiz();
    D.answerQuiz(q.correct);
    await new Promise(r => setTimeout(r, 400));
    const chips = [...document.querySelectorAll('.replay-chip')].map(c => c.textContent).join('|');
    const state = D.getState();
    return { chips: chips.slice(-200), quizRight: state.flags.quizRight >= 1 };
  });
  log('F5_composites_and_logic', /Papillon a eu une belle réponse\. \+\d+ ZOL/.test(f5.chips) && f5.quizRight,
    JSON.stringify(f5).slice(0, 200));

  log('F6_no_page_errors', errs.length === 0, errs.join(' | ') || 'clean');

  await b.close();
  const failed = Object.keys(results).filter(k => !results[k]);
  console.log('\n=== SUMMARY ===\nPassed: ' + (Object.keys(results).length - failed.length) + '/' + Object.keys(results).length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
