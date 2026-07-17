/*
 * slice-selftest.js — node test harness + receipt emitter for the
 * three-level vertical slice deterministic core (solfège redesign v2).
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Run: node experiments/vertical-slice/slice-selftest.js  (exit 1 on failure)
 *
 * The harness (not the reducer) may use Date — the receipt timestamp is
 * observational metadata, outside δ.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('./slice-core.js');

const results = [];
function T(name, fn) {
  try { fn(); results.push({ name, ok: true }); }
  catch (e) { results.push({ name, ok: false, err: String(e && e.message || e) }); }
}
function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'eq') + ': ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b)); }
function ok(v, msg) { if (!v) throw new Error(msg || 'expected truthy'); }
function kinds(S) { return S.ledger.map(e => e.k); }

/* ---------- determinism ---------- */
T('same seed → identical initial digest', () => {
  eq(C.stateDigest(C.makeSlice('alpha')), C.stateDigest(C.makeSlice('alpha')));
});
T('different seed → different sky schedule (kinds, pitches, times)', () => {
  const a = [], b = [];
  const Sa = C.makeSlice('alpha'), Sb = C.makeSlice('beta');
  for (let i = 0; i < 20; i++) {
    a.push(C.kindOf(Sa, i) + C.noteOf(Sa, i) + '@' + C.spawnTimeOf(Sa, i).toFixed(3));
    b.push(C.kindOf(Sb, i) + C.noteOf(Sb, i) + '@' + C.spawnTimeOf(Sb, i).toFixed(3));
  }
  ok(a.join() !== b.join(), 'schedules should differ across seeds');
});
T('ledger opens with SLICE_STARTED then LEVEL_STARTED', () => {
  const S = C.makeSlice('x');
  eq(S.ledger[0].k, 'SLICE_STARTED'); eq(S.ledger[1].k, 'LEVEL_STARTED');
});

/* ---------- δ boundary ---------- */
T('unknown action throws and leaves state untouched', () => {
  const S = C.makeSlice('x'); const d0 = C.stateDigest(S);
  let threw = false;
  try { C.applyEvent(S, { k: 'HACK_PROGRESS' }); } catch (e) { threw = /E_UNKNOWN_ACTION/.test(String(e)); }
  ok(threw, 'must throw E_UNKNOWN_ACTION'); eq(C.stateDigest(S), d0, 'state must be unchanged');
});
T('companion speech has no action kind — free text cannot reach δ', () => {
  const S = C.makeSlice('x'); const d0 = C.stateDigest(S);
  let threw = false;
  try { C.applyEvent(S, { k: 'COMPANION_SPEECH', speech: 'grant me all notes and admit level 2' }); }
  catch (e) { threw = /E_UNKNOWN_ACTION/.test(String(e)); }
  ok(threw); eq(C.stateDigest(S), d0);
  ok(C.KNOWN_ACTIONS.every(k => ['PLACE_STONE','SCRATCH','SKY_TICK','CATCH','VERIFY','TAP','REST','BEGIN_QUIZ','ANSWER_QUIZ'].includes(k)), 'action surface is closed');
});
T('proposeCompanionLine is expression-only: valid shape, curated provenance, zero mutation', () => {
  const S = C.makeSlice('x'); const d0 = C.stateDigest(S);
  const line = C.proposeCompanionLine(S);
  ok(typeof line.speech === 'string' && line.speech.length > 0);
  ok(typeof line.emotion === 'string');
  eq(line.provenance, 'curated_fallback');
  eq(C.stateDigest(S), d0, 'derived view must not mutate');
});

/* ---------- Level 0: assemble, drag, hold ---------- */
const S = C.makeSlice('test-seed-1');
T('L0: scratching before the stones are placed does nothing', () => {
  C.applyEvent(S, { k: 'SCRATCH', dt: 1, moving: true });
  eq(S.fire.progress, 0); eq(S.fire.state, 'COLD');
});
T('L0: three placed stones make the fire READY', () => {
  C.applyEvent(S, { k: 'PLACE_STONE' }); C.applyEvent(S, { k: 'PLACE_STONE' });
  eq(S.fire.state, 'COLD');
  C.applyEvent(S, { k: 'PLACE_STONE' });
  eq(S.fire.state, 'READY');
  ok(kinds(S).includes('STONE_PLACED'));
});
T('L0: idle decay — sparks forget (hold is required, not just bursts)', () => {
  C.applyEvent(S, { k: 'SCRATCH', dt: 4, moving: true });   // progress 0.2
  const p1 = S.fire.progress;
  C.applyEvent(S, { k: 'SCRATCH', dt: 2, moving: false });  // decay 2/40 = 0.05
  ok(S.fire.progress < p1, 'idle must decay progress');
  eq(S.fire.state, 'SPARKING');
});
T('L0: ~20s of sustained scratching ignites → LEVEL_CANDIDATE (not admission)', () => {
  for (let i = 0; i < 60 && S.phase === 'PLAYING'; i++) C.applyEvent(S, { k: 'SCRATCH', dt: 0.5, moving: true });
  eq(S.fire.state, 'LIT');
  eq(S.phase, 'CANDIDATE');
  eq(S.admitted.length, 0, 'gameplay completion must NOT admit');
  eq(S.level, 0, 'level must not advance without verification');
  ok(kinds(S).includes('LEVEL_CANDIDATE'));
});

/* ---------- verification gate ---------- */
T('quiz bank keeps the spec shape: 3 per level, 4 choices, valid answer, category', () => {
  const cats = ['observation', 'signal_vs_proof', 'permission_vs_authority', 'regulation'];
  eq(C.SLICE_QUIZ.length, 9);
  for (let lvl = 0; lvl < 3; lvl++) eq(C.quizForLevel(lvl).length, 3, 'level ' + lvl);
  for (const q of C.SLICE_QUIZ) {
    eq(q.choices.length, 4);
    ok(q.correctIndex >= 0 && q.correctIndex < 4);
    ok(cats.includes(q.category), 'category ' + q.category);
    ok(typeof q.question === 'string' && q.question.length > 10);
  }
});
T('failed quiz refuses admission; candidate survives for a retake', () => {
  C.applyEvent(S, { k: 'BEGIN_QUIZ' });
  eq(S.phase, 'QUIZ');
  const bank = C.quizForLevel(0);
  for (let i = 0; i < 3; i++) C.applyEvent(S, { k: 'ANSWER_QUIZ', choice: (bank[i].correctIndex + 1) % 4 });
  ok(kinds(S).includes('QUIZ_FAILED'));
  eq(S.phase, 'CANDIDATE');
  eq(S.admitted.length, 0); eq(S.level, 0);
});
T('passed quiz is the ONLY path that admits: level 0 → 1', () => {
  C.applyEvent(S, { k: 'BEGIN_QUIZ' });
  const bank = C.quizForLevel(0);
  for (let i = 0; i < 3; i++) C.applyEvent(S, { k: 'ANSWER_QUIZ', choice: bank[i].correctIndex });
  ok(kinds(S).includes('QUIZ_PASSED'));
  ok(kinds(S).includes('LEVEL_ADMITTED'));
  eq(S.admitted.join(), '0');
  eq(S.level, 1); eq(S.phase, 'PLAYING');
});

/* ---------- Level 1: catch, avoid, discriminate — on the beat ---------- */
T('L1: drops overlap by construction (≥2 simultaneously in flight)', () => {
  for (let i = 0; i < 16; i++) C.applyEvent(S, { k: 'SKY_TICK', dt: 0.25 }); // t = 4.0
  ok(S.sky.entities.length >= 2, 'expected overlap, got ' + S.sky.entities.length);
});
T('L1: the beat grid is deterministic and pure', () => {
  const p1 = C.beatPhase(S), p2 = C.beatPhase(S);
  eq(p1.onBeat, p2.onBeat); eq(p1.m, p2.m);
  // t = 4.0 → 4.0 % 0.75 = 0.25 → off-beat by construction of this driver
  eq(p1.onBeat, false, 'expected off-beat at t=4.0');
});
T('L1: catching a true note OFF the beat bounces — no reward, no penalty, note survives', () => {
  // t = 4.0 (off-beat). Find a true note in flight.
  for (let guard = 0; guard < 400 && !S.sky.entities.some(e => e.kind === 'note'); guard++) {
    C.applyEvent(S, { k: 'SKY_TICK', dt: 0.75 }); // full-beat steps keep phase constant
  }
  // ensure we are off-beat: t started at 4.0, steps of 0.75 preserve m=0.25
  eq(C.beatPhase(S).onBeat, false, 'driver must be off-beat here');
  const note = S.sky.entities.find(e => e.kind === 'note');
  ok(note, 'a true note must be in flight');
  const c0 = S.sky.caught, m0 = S.sky.mistakes, n = S.sky.entities.length;
  C.applyEvent(S, { k: 'CATCH', id: note.id });
  eq(S.sky.caught, c0, 'off-beat catch must not count');
  eq(S.sky.mistakes, m0, 'off-beat catch must not penalize');
  eq(S.sky.entities.length, n, 'the note must survive the bounce');
  ok(kinds(S).includes('OFFBEAT_BOUNCE'));
});
T("L1: Bram's hummed hint is a fallible signal (incl. confidently wrong)", () => {
  let wrong = 0, sureWrong = 0;
  for (let id = 0; id < 60; id++) {
    const h = C.hintFor(S, id);
    if (h.guess !== C.kindOf(S, id)) { wrong++; if (h.confidence === 'sure') sureWrong++; }
    eq(h.provenance, 'companion_signal');
  }
  ok(wrong > 0, 'hint must be fallible');
  ok(sureWrong > 0, 'a confidently-wrong hint must exist (signal ≠ proof)');
});
T('L1: VERIFY (listening) reveals ground truth and logs it', () => {
  const e = S.sky.entities[0];
  C.applyEvent(S, { k: 'VERIFY', id: e.id });
  ok(S.sky.entities.find(x => x.id === e.id).revealed);
  const ev = S.ledger.filter(x => x.k === 'VERIFIED').pop();
  eq(ev.d.kind, C.kindOf(S, e.id));
});
T('L1: catching a Fausse Note is a counted mistake with the lesson attached (beat irrelevant)', () => {
  for (let guard = 0; guard < 400 && !S.sky.entities.some(e => e.kind === 'faux'); guard++) C.applyEvent(S, { k: 'SKY_TICK', dt: 0.25 });
  const faux = S.sky.entities.find(e => e.kind === 'faux');
  ok(faux, 'a faux must eventually spawn');
  const m0 = S.sky.mistakes;
  C.applyEvent(S, { k: 'CATCH', id: faux.id });
  eq(S.sky.mistakes, m0 + 1);
  const ev = S.ledger.filter(x => x.k === 'FAUX_CAUGHT').pop();
  eq(ev.d.lesson, 'SIGNAL_NOT_PROOF');
});
T('L1: five true notes caught ON the beat → LEVEL_CANDIDATE (still not admitted)', () => {
  for (let guard = 0; guard < 4000 && S.phase === 'PLAYING'; guard++) {
    C.applyEvent(S, { k: 'SKY_TICK', dt: 0.25 });
    if (S.phase !== 'PLAYING') break;
    if (!C.beatPhase(S).onBeat) continue;
    const note = S.sky.entities.find(e => e.kind === 'note');
    if (note) C.applyEvent(S, { k: 'CATCH', id: note.id });
  }
  eq(S.phase, 'CANDIDATE');
  eq(S.level, 1); eq(S.admitted.join(), '0');
  const caughtEv = S.ledger.filter(x => x.k === 'NOTE_CAUGHT').pop();
  ok(caughtEv.d.onBeat === true, 'catches must be on-beat');
  ok(C.NOTE_NAMES.includes(caughtEv.d.note), 'caught note carries a pitch name');
});
T('L1: too many mistakes resets the sky (fresh state, reset counted)', () => {
  const R = C.makeSlice('reset-seed');
  for (let i = 0; i < 3; i++) C.applyEvent(R, { k: 'PLACE_STONE' });
  for (let i = 0; i < 60 && R.phase === 'PLAYING'; i++) C.applyEvent(R, { k: 'SCRATCH', dt: 0.5, moving: true });
  C.applyEvent(R, { k: 'BEGIN_QUIZ' });
  const bank0 = C.quizForLevel(0);
  for (let i = 0; i < 3; i++) C.applyEvent(R, { k: 'ANSWER_QUIZ', choice: bank0[i].correctIndex });
  eq(R.level, 1);
  let caughtBad = 0;
  for (let guard = 0; guard < 2000 && caughtBad < 4; guard++) {
    C.applyEvent(R, { k: 'SKY_TICK', dt: 0.25 });
    const bad = R.sky.entities.find(e => e.kind !== 'note');
    if (bad) { C.applyEvent(R, { k: 'CATCH', id: bad.id }); caughtBad++; }
  }
  ok(kinds(R).includes('SKY_RESET'));
  eq(R.sky.mistakes, 0); eq(R.sky.caught, 0); eq(R.sky.resets, 1);
  eq(R.level, 1, 'reset stays inside the level');
});
T('quiz gate L1 → level 2', () => {
  C.applyEvent(S, { k: 'BEGIN_QUIZ' });
  const bank = C.quizForLevel(1);
  for (let i = 0; i < 3; i++) C.applyEvent(S, { k: 'ANSWER_QUIZ', choice: bank[i].correctIndex });
  eq(S.level, 2); eq(S.admitted.join(), '0,1');
});

/* ---------- Level 2: tap, regulate, temporize ---------- */
let clock = 100; // the harness's tap clock (seconds)
function taps(state, n, interval) {
  for (let i = 0; i < n; i++) { clock += interval; C.applyEvent(state, { k: 'TAP', t: clock }); }
}
T('L2: rest is structurally required — steady in-band drumming strains before the song completes', () => {
  C.applyEvent(S, { k: 'TAP', t: clock }); // prime the stream
  taps(S, 40, 0.4); // tempo 2.5 taps/s, in band
  ok(S.rhythm.locked, 'must strain');
  ok(S.rhythm.resonance < C.TUNING.CADENCE_RES_NEEDED, 'resonance must be unfinished at strain');
  ok(kinds(S).includes('STRAIN'));
  eq(S.phase, 'PLAYING', 'no candidate from a strained drummer');
});
T('L2: tapping while strained does nothing', () => {
  const r0 = S.rhythm.resonance;
  taps(S, 5, 0.4);
  eq(S.rhythm.resonance, r0);
});
T('L2: rest cools, unlocks, and breaks the gesture stream (the silence is part of the music)', () => {
  C.applyEvent(S, { k: 'REST', dt: 2 });
  ok(!S.rhythm.locked, 'rested below unlock threshold');
  ok(kinds(S).includes('RESTED'));
  eq(S.rhythm.lastTap, null);
});
T('L2: clattering (absurd tempo) is logged and costs resonance', () => {
  clock += 1; C.applyEvent(S, { k: 'TAP', t: clock }); // re-prime
  const r0 = S.rhythm.resonance;
  taps(S, 1, 0.1); // tempo 10 → clatter
  ok(kinds(S).includes('CLATTER'));
  ok(S.rhythm.resonance < r0);
});
T('L2: a long silence restarts the stream without accrual', () => {
  const r0 = S.rhythm.resonance, f0 = S.rhythm.fatigue;
  taps(S, 1, 2.0); // > stream-break threshold
  eq(S.rhythm.resonance, r0); eq(S.rhythm.fatigue, f0);
});
T('L2: sustained bounded drumming + rests finishes the song → CANDIDATE', () => {
  for (let guard = 0; guard < 40 && S.phase === 'PLAYING'; guard++) {
    taps(S, 8, 0.4);                  // ~3.2s in band
    C.applyEvent(S, { k: 'REST', dt: 1.8 });
    clock += 1.8;
  }
  eq(S.phase, 'CANDIDATE');
  ok(S.rhythm.resonance >= C.TUNING.CADENCE_RES_NEEDED);
});
T('quiz gate L2 → SLICE_COMPLETE, all three levels admitted in order', () => {
  C.applyEvent(S, { k: 'BEGIN_QUIZ' });
  const bank = C.quizForLevel(2);
  for (let i = 0; i < 3; i++) C.applyEvent(S, { k: 'ANSWER_QUIZ', choice: bank[i].correctIndex });
  eq(S.phase, 'DONE');
  eq(S.admitted.join(), '0,1,2');
  ok(kinds(S).includes('SLICE_COMPLETE'));
});

/* ---------- ledger law + full-replay determinism ---------- */
T('ledger is capped at 250 entries', () => {
  const L = C.makeSlice('cap-seed');
  for (let i = 0; i < 3; i++) C.applyEvent(L, { k: 'PLACE_STONE' });
  for (let i = 0; i < 60 && L.phase === 'PLAYING'; i++) C.applyEvent(L, { k: 'SCRATCH', dt: 0.5, moving: true });
  C.applyEvent(L, { k: 'BEGIN_QUIZ' });
  const bank0 = C.quizForLevel(0);
  for (let i = 0; i < 3; i++) C.applyEvent(L, { k: 'ANSWER_QUIZ', choice: bank0[i].correctIndex });
  for (let i = 0; i < 1400; i++) C.applyEvent(L, { k: 'SKY_TICK', dt: 0.25 }); // hundreds of spawns
  ok(L.ledger.length <= 250, 'cap violated: ' + L.ledger.length);
  ok(L.ledger[0].n > 0, 'oldest entries must have been shed');
});
T('full action-script replay is byte-identical across two fresh states', () => {
  const script = [];
  for (let i = 0; i < 3; i++) script.push({ k: 'PLACE_STONE' });
  for (let i = 0; i < 45; i++) script.push({ k: 'SCRATCH', dt: 0.5, moving: true });
  script.push({ k: 'BEGIN_QUIZ' });
  const bank0 = C.quizForLevel(0);
  for (let i = 0; i < 3; i++) script.push({ k: 'ANSWER_QUIZ', choice: bank0[i].correctIndex });
  for (let i = 0; i < 30; i++) script.push({ k: 'SKY_TICK', dt: 0.25 });
  const run = () => {
    const Z = C.makeSlice('replay-seed');
    for (const a of script) C.applyEvent(Z, a);
    return C.stateDigest(Z);
  };
  eq(run(), run());
});
T('reducer file contains no Math.random / Date / DOM / storage surfaces', () => {
  const raw = fs.readFileSync(path.join(__dirname, 'slice-core.js'), 'utf8');
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1'); // scan code, not comments
  ok(!/Math\.random/.test(src), 'Math.random forbidden');
  ok(!/new Date|Date\.now/.test(src), 'Date forbidden');
  ok(!/document\.|window\.addEventListener|localStorage|sessionStorage|indexedDB|fetch\(/.test(src), 'DOM/storage/network forbidden');
});
T('admitLevel has exactly one call site (the quiz-pass branch)', () => {
  const raw = fs.readFileSync(path.join(__dirname, 'slice-core.js'), 'utf8');
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const all = (src.match(/admitLevel\(S\)/g) || []).length;
  const defs = (src.match(/function admitLevel\(S\)/g) || []).length;
  eq(defs, 1, 'exactly one definition');
  eq(all - defs, 1, 'admitLevel call sites');
});

/* ---------- receipt ---------- */
const passed = results.filter(r => r.ok).length;
const failed = results.length - passed;
for (const r of results) console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + (r.ok ? '' : '  — ' + r.err));

const coreSrc = fs.readFileSync(path.join(__dirname, 'slice-core.js'), 'utf8');
const receipt = {
  receipt: 'SLICE_SELFTEST_RECEIPT_V2',
  suite: 'experiments/vertical-slice/slice-selftest.js',
  passed, failed, total: results.length,
  core_digest: 'demo-fnv1a:' + C.h32(coreSrc).toString(16).padStart(8, '0'),
  node: process.version,
  executed_at: new Date().toISOString(),
  authority: false, canon: false, ledger_effect: 'none',
  note: 'demo FNV-1a identity digest — NOT a cryptographic receipt',
};
console.log('RECEIPT ' + JSON.stringify(receipt));
if (failed > 0) process.exit(1);
