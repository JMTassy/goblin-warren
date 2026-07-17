/*
 * slice-core.js — deterministic core of the Goblin Warren three-level
 * vertical slice (L0 fire · L1 living sky · L2 matcha).
 * authority=false · claim=NO_CLAIM · non-sovereign
 *
 * REDUCER DISCIPLINE (same law as the repo root index.html):
 *   - no DOM, no THREE, no Math.random, no Date anywhere in this file;
 *     all entropy comes from the FNV hash h32 seeded by state.
 *   - applyEvent(S, action) is the ONLY function that mutates a slice
 *     state (δ in the article's model). Everything else is a pure
 *     derived view over S.
 *   - Companion speech is expression-only: proposeCompanionLine(S)
 *     derives a line; no action kind carries free text into δ, so a
 *     generative layer plugged into the companion channel can propose
 *     but can never mutate world, quest, or reward state.
 *   - Level completion is governed: finishing a level's gameplay makes
 *     the completion a CANDIDATE; only a passed verification quiz
 *     reaches admitLevel(), and admitLevel() has exactly one call site
 *     (the quiz-pass branch). Play proposes; verification admits.
 */
'use strict';
(function () {

/* ---------- deterministic hash (FNV-1a 32-bit, as in index.html) ---------- */
function h32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function canonicalStringify(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalStringify).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalStringify(v[k])).join(',') + '}';
}

function stateDigest(S) {
  return 'demo-fnv1a:' + h32(canonicalStringify(S)).toString(16).padStart(8, '0');
}

/* ---------- tuning constants (part of the tested design) ---------- */
const FIRE_STONES_NEEDED = 3;
const FIRE_SCRATCH_SECONDS = 20;   // sustained scratching to ignite
const FIRE_DECAY_FACTOR = 2;       // idle decay is half the build rate

const SKY_SPAWN_BASE = 0.6;        // first drop
const SKY_SPAWN_SPACING = 1.1;     // < SKY_FALL_SECONDS → drops overlap
const SKY_FALL_SECONDS = 3.0;
const SKY_GEMS_NEEDED = 5;
const SKY_MAX_MISTAKES = 3;
const SKY_HINT_ACCURACY = 8;       // Bram's hint is right 8 times in 10

const MATCHA_BAND_LO = 2.0;        // rad/s — the whisk band
const MATCHA_BAND_HI = 5.0;
const MATCHA_BLEND_NEEDED = 8;     // seconds inside the band
const MATCHA_HEAT_MAX = 5;
const MATCHA_HEAT_WHISK = 0.8;     // heat/s while whisking — makes rest
                                   // structurally required: 8s of blend
                                   // costs 6.4 heat > 5 max, so the level
                                   // cannot be finished without temporizing
const MATCHA_HEAT_FAST = 1.5;      // extra heat/s above the band
const MATCHA_HEAT_SLOW = 0.3;      // token heat below the band
const MATCHA_COOL_RATE = 1.5;      // heat shed per second of rest
const MATCHA_SPLASH_OMEGA = 8;     // whisking this fast splashes
const MATCHA_SPLASH_PENALTY = 0.5;
const MATCHA_UNLOCK_HEAT = 2.5;    // overheat lock releases below this

const LEDGER_CAP = 250;
const LEVEL_COUNT = 3;
const QUIZ_PASS_NEEDED = 2;        // of 3

/* ---------- verification quiz bank (spec shape, 3 per level) ---------- */
const SLICE_QUIZ = [
  // Level 0 — fire: assemble, drag, hold → observation & persistence
  { level: 0, category: 'observation',
    question: 'You stopped scratching and the spark faded. What did the fire teach?',
    choices: ['Sparks are random luck',
              'Steady, maintained attention beats short bursts',
              'The stones were the wrong kind',
              'Fires need more force, not more time'],
    correctIndex: 1 },
  { level: 0, category: 'observation',
    question: 'No spark could take before three stones were placed. Why does that matter?',
    choices: ['Decoration makes fires stronger',
              'The game needed a delay',
              'Preparing the context comes before acting in it',
              'Three is a lucky number'],
    correctIndex: 2 },
  { level: 0, category: 'permission_vs_authority',
    question: 'Bram watched, encouraged, and remembered — but who lit the fire?',
    choices: ['Bram, because he spoke about it',
              'The fire lit itself at 20 seconds',
              'Nobody; it was scripted',
              'You did — talking about an act is not performing it'],
    correctIndex: 3 },

  // Level 1 — living sky: catch, avoid, discriminate → signal vs proof
  { level: 1, category: 'signal_vs_proof',
    question: "Bram said 'that one sparkles true' — and he was wrong. What was his hint?",
    choices: ['A lie', 'A signal: honest but fallible, not proof',
              'Proof, because he sounded sure', 'A bug'],
    correctIndex: 1 },
  { level: 1, category: 'signal_vs_proof',
    question: 'How did you get certainty that a falling jewel was real?',
    choices: ['By how confident Bram sounded',
              'By how shiny it looked',
              'By running the verify check before catching',
              'By catching quickly'],
    correctIndex: 2 },
  { level: 1, category: 'signal_vs_proof',
    question: 'A False Jewel looks exactly like a gem. What actually protected you?',
    choices: ['Trusting appearances but catching faster',
              'Avoiding everything that falls',
              'Catching everything to sort it later',
              'Checking before acting, even when the signal felt sure'],
    correctIndex: 3 },

  // Level 2 — matcha: turn, regulate, temporize → bounded sustained effort
  { level: 2, category: 'regulation',
    question: 'Whisking faster than the band burned the bowl. What is regulation?',
    choices: ['Maximum effort at all times',
              'Keeping effort inside limits, not maximizing it',
              'Stopping as often as possible',
              'Following the loudest instruction'],
    correctIndex: 1 },
  { level: 2, category: 'regulation',
    question: 'Why were the rest windows necessary to finish the bowl?',
    choices: ['Recovery is part of the work — heat only leaves during rest',
              'The whisk needed recharging',
              'They were optional',
              'Resting increased whisk speed'],
    correctIndex: 0 },
  { level: 2, category: 'regulation',
    question: 'The matcha blended only from time spent inside the band. The lesson?',
    choices: ['One perfect moment finishes the job',
              'Speed outside the band still counts a little',
              'Sustained bounded effort is what accumulates',
              'The band was cosmetic'],
    correctIndex: 2 },
];

/* ---------- state ---------- */
function makeSlice(seed) {
  const S = {
    seed: String(seed),
    actions: 0,
    level: 0,
    phase: 'PLAYING', // PLAYING | CANDIDATE | QUIZ | DONE
    admitted: [],
    ledger: [],
    fire:   { state: 'COLD', stones: 0, progress: 0 },
    sky:    { t: 0, spawned: 0, entities: [], caught: 0, mistakes: 0, resets: 0 },
    matcha: { blend: 0, heat: 0, lastAngle: null, locked: false, overheats: 0, splashes: 0 },
    quiz:   { asked: [], answers: [], attempts: 0 },
  };
  logEvent(S, 'SLICE_STARTED', { seed: S.seed });
  logEvent(S, 'LEVEL_STARTED', { level: 0 });
  return S;
}

function logEvent(S, kind, data) {
  S.ledger.push({ n: S.ledger.length === 0 ? 0 : S.ledger[S.ledger.length - 1].n + 1, k: kind, d: data || {} });
  if (S.ledger.length > LEDGER_CAP) S.ledger.splice(0, S.ledger.length - LEDGER_CAP);
}

/* ---------- derived views (pure; never mutate) ---------- */

// The sky's drop schedule is a pure function of the seed — overlapping by
// construction (spacing 1.1s < fall time 3.0s).
function spawnTimeOf(S, i) {
  const jitter = (h32(S.seed + ':spawn:' + i) % 400) / 1000;
  return SKY_SPAWN_BASE + i * SKY_SPAWN_SPACING + jitter;
}
function kindOf(S, i) {
  const r = h32(S.seed + ':kind:' + i) % 10;
  return r < 4 ? 'gem' : r < 7 ? 'faux' : 'ember';
}

// Bram's perception of a falling thing: an honest SIGNAL, right ~8/10,
// sometimes confidently wrong. Never proof; verify() is proof.
function hintFor(S, id) {
  const actual = kindOf(S, id);
  const right = (h32(S.seed + ':hint:' + id) % 10) < SKY_HINT_ACCURACY;
  const guess = right ? actual : (actual === 'gem' ? 'faux' : 'gem');
  const confidence = (h32(S.seed + ':conf:' + id) % 10) < 5 ? 'unsure' : 'sure';
  return { guess, confidence, provenance: 'companion_signal' };
}

// Companion channel — expression only. A generative model may replace this
// pool; either way the return value has no path into applyEvent.
const COMPANION_LINES = {
  COLD: { speech: 'It is cold, friend. The stones remember fire, I think.', emotion: 'hopeful' },
  READY: { speech: 'Three stones, like you meant it. Now — scratch, and keep scratching.', emotion: 'eager' },
  SPARKING: { speech: 'There! Do not stop — sparks forget quickly.', emotion: 'excited' },
  LIT: { speech: 'You made this. I will remember the night the cold ended.', emotion: 'warm' },
  SKY: { speech: 'The sky is dropping things again. Some sparkle honest. Some lie.', emotion: 'wary' },
  MATCHA: { speech: 'Grandmother Moss says: the whisk that never rests burns the bowl.', emotion: 'calm' },
  QUIZ: { speech: 'Tell me what you saw — not what you hoped.', emotion: 'attentive_calm' },
  DONE: { speech: 'Fire, sky, bowl. You did not rush any of them. That is the whole lesson.', emotion: 'warm' },
};
function proposeCompanionLine(S) {
  let key;
  if (S.phase === 'DONE') key = 'DONE';
  else if (S.phase === 'QUIZ') key = 'QUIZ';
  else if (S.level === 0) key = S.fire.state;
  else if (S.level === 1) key = 'SKY';
  else key = 'MATCHA';
  const line = COMPANION_LINES[key] || COMPANION_LINES.COLD;
  return { speech: line.speech, emotion: line.emotion, provenance: 'curated_fallback' };
}

function quizForLevel(level) {
  return SLICE_QUIZ.filter(q => q.level === level);
}

/* ---------- the sole progression writer ---------- */
// admitLevel has EXACTLY ONE call site: the quiz-pass branch of ANSWER_QUIZ.
// Nothing else — not gameplay completion, not companion output, not a
// derived score — moves S.level or S.admitted.
function admitLevel(S) {
  S.admitted.push(S.level);
  logEvent(S, 'LEVEL_ADMITTED', { level: S.level });
  if (S.level >= LEVEL_COUNT - 1) {
    S.phase = 'DONE';
    logEvent(S, 'SLICE_COMPLETE', { admitted: S.admitted.slice() });
  } else {
    S.level += 1;
    S.phase = 'PLAYING';
    S.quiz = { asked: [], answers: [], attempts: S.quiz.attempts };
    logEvent(S, 'LEVEL_STARTED', { level: S.level });
  }
}

function becomeCandidate(S) {
  S.phase = 'CANDIDATE';
  logEvent(S, 'LEVEL_CANDIDATE', { level: S.level });
}

/* ---------- δ — the only mutation path ---------- */
const KNOWN_ACTIONS = [
  'PLACE_STONE', 'SCRATCH', 'SKY_TICK', 'CATCH', 'VERIFY',
  'WHISK', 'REST', 'BEGIN_QUIZ', 'ANSWER_QUIZ',
];

function applyEvent(S, a) {
  if (!a || typeof a.k !== 'string' || KNOWN_ACTIONS.indexOf(a.k) === -1) {
    throw new Error('E_UNKNOWN_ACTION: δ accepts only ' + KNOWN_ACTIONS.join('|'));
  }
  S.actions += 1;

  switch (a.k) {

    /* --- Level 0: assemble, drag, hold --- */
    case 'PLACE_STONE': {
      if (S.level !== 0 || S.phase !== 'PLAYING' || S.fire.state !== 'COLD') return S;
      S.fire.stones += 1;
      logEvent(S, 'STONE_PLACED', { stones: S.fire.stones });
      if (S.fire.stones >= FIRE_STONES_NEEDED) {
        S.fire.state = 'READY';
        logEvent(S, 'FIRE_STATE', { state: 'READY' });
      }
      return S;
    }
    case 'SCRATCH': {
      if (S.level !== 0 || S.phase !== 'PLAYING') return S;
      if (S.fire.state !== 'READY' && S.fire.state !== 'SPARKING') return S;
      const dt = Math.max(0, Number(a.dt) || 0);
      if (a.moving) {
        S.fire.progress = Math.min(1, S.fire.progress + dt / FIRE_SCRATCH_SECONDS);
        if (S.fire.state !== 'SPARKING') {
          S.fire.state = 'SPARKING';
          logEvent(S, 'FIRE_STATE', { state: 'SPARKING' });
        }
      } else {
        S.fire.progress = Math.max(0, S.fire.progress - dt / (FIRE_SCRATCH_SECONDS * FIRE_DECAY_FACTOR));
        if (S.fire.progress === 0 && S.fire.state === 'SPARKING') {
          S.fire.state = 'READY';
          logEvent(S, 'FIRE_STATE', { state: 'READY' });
        }
      }
      if (S.fire.progress >= 1) {
        S.fire.state = 'LIT';
        logEvent(S, 'FIRE_STATE', { state: 'LIT' });
        becomeCandidate(S);
      }
      return S;
    }

    /* --- Level 1: catch, avoid, discriminate --- */
    case 'SKY_TICK': {
      if (S.level !== 1 || S.phase !== 'PLAYING') return S;
      const dt = Math.max(0, Number(a.dt) || 0);
      S.sky.t += dt;
      while (spawnTimeOf(S, S.sky.spawned) <= S.sky.t) {
        const id = S.sky.spawned;
        S.sky.entities.push({ id, kind: kindOf(S, id), born: spawnTimeOf(S, id), revealed: false });
        S.sky.spawned += 1;
        logEvent(S, 'DROP_SPAWNED', { id });
      }
      const still = [];
      for (const e of S.sky.entities) {
        if (S.sky.t - e.born > SKY_FALL_SECONDS) {
          if (e.kind === 'gem') logEvent(S, 'GEM_MISSED', { id: e.id });
        } else still.push(e);
      }
      S.sky.entities = still;
      return S;
    }
    case 'VERIFY': {
      if (S.level !== 1 || S.phase !== 'PLAYING') return S;
      const e = S.sky.entities.find(x => x.id === a.id);
      if (!e || e.revealed) return S;
      e.revealed = true;
      logEvent(S, 'VERIFIED', { id: e.id, kind: e.kind });
      return S;
    }
    case 'CATCH': {
      if (S.level !== 1 || S.phase !== 'PLAYING') return S;
      const idx = S.sky.entities.findIndex(x => x.id === a.id);
      if (idx === -1) return S;
      const e = S.sky.entities.splice(idx, 1)[0];
      if (e.kind === 'gem') {
        S.sky.caught += 1;
        logEvent(S, 'GEM_CAUGHT', { id: e.id, verified: e.revealed });
      } else if (e.kind === 'faux') {
        S.sky.mistakes += 1;
        logEvent(S, 'FAUX_CAUGHT', { id: e.id, lesson: 'SIGNAL_NOT_PROOF' });
      } else {
        S.sky.mistakes += 1;
        logEvent(S, 'EMBER_CAUGHT', { id: e.id });
      }
      if (S.sky.mistakes > SKY_MAX_MISTAKES) {
        S.sky = { t: 0, spawned: 0, entities: [], caught: 0, mistakes: 0, resets: S.sky.resets + 1 };
        logEvent(S, 'SKY_RESET', { resets: S.sky.resets });
      } else if (S.sky.caught >= SKY_GEMS_NEEDED) {
        becomeCandidate(S);
      }
      return S;
    }

    /* --- Level 2: turn, regulate, temporize --- */
    case 'WHISK': {
      if (S.level !== 2 || S.phase !== 'PLAYING') return S;
      const dt = Math.max(1e-6, Number(a.dt) || 0);
      const angle = Number(a.angle) || 0;
      if (S.matcha.lastAngle === null) { S.matcha.lastAngle = angle; return S; }
      const omega = Math.abs(angle - S.matcha.lastAngle) / dt;
      S.matcha.lastAngle = angle;
      if (S.matcha.locked) return S; // overheated: whisking does nothing until cooled
      if (omega >= MATCHA_SPLASH_OMEGA) {
        S.matcha.splashes += 1;
        S.matcha.blend = Math.max(0, S.matcha.blend - MATCHA_SPLASH_PENALTY);
        logEvent(S, 'SPLASH', { omega: Math.round(omega * 100) / 100 });
      }
      if (omega >= MATCHA_BAND_LO && omega <= MATCHA_BAND_HI) {
        S.matcha.blend += dt;
        S.matcha.heat += dt * MATCHA_HEAT_WHISK;
      } else if (omega > MATCHA_BAND_HI) {
        S.matcha.heat += dt * (MATCHA_HEAT_WHISK + MATCHA_HEAT_FAST);
      } else {
        S.matcha.heat += dt * MATCHA_HEAT_SLOW;
      }
      if (S.matcha.heat >= MATCHA_HEAT_MAX) {
        S.matcha.heat = MATCHA_HEAT_MAX;
        S.matcha.locked = true;
        S.matcha.overheats += 1;
        logEvent(S, 'OVERHEAT', { overheats: S.matcha.overheats });
      }
      if (S.matcha.blend >= MATCHA_BLEND_NEEDED && !S.matcha.locked) {
        becomeCandidate(S);
      }
      return S;
    }
    case 'REST': {
      if (S.level !== 2 || S.phase !== 'PLAYING') return S;
      const dt = Math.max(0, Number(a.dt) || 0);
      S.matcha.heat = Math.max(0, S.matcha.heat - dt * MATCHA_COOL_RATE);
      S.matcha.lastAngle = null; // a rest breaks the gesture stream
      if (S.matcha.locked && S.matcha.heat <= MATCHA_UNLOCK_HEAT) {
        S.matcha.locked = false;
        logEvent(S, 'COOLED', {});
      }
      return S;
    }

    /* --- verification gate --- */
    case 'BEGIN_QUIZ': {
      if (S.phase !== 'CANDIDATE') return S;
      S.phase = 'QUIZ';
      S.quiz.asked = quizForLevel(S.level).map((q, i) => i);
      S.quiz.answers = [];
      S.quiz.attempts += 1;
      logEvent(S, 'QUIZ_BEGUN', { level: S.level, attempt: S.quiz.attempts });
      return S;
    }
    case 'ANSWER_QUIZ': {
      if (S.phase !== 'QUIZ') return S;
      const bank = quizForLevel(S.level);
      const qi = S.quiz.answers.length;
      if (qi >= bank.length) return S;
      const correct = bank[qi].correctIndex === a.choice;
      S.quiz.answers.push({ q: qi, choice: a.choice, correct });
      logEvent(S, 'QUIZ_ANSWERED', { q: qi, correct });
      if (S.quiz.answers.length === bank.length) {
        const score = S.quiz.answers.filter(x => x.correct).length;
        if (score >= QUIZ_PASS_NEEDED) {
          logEvent(S, 'QUIZ_PASSED', { level: S.level, score });
          admitLevel(S); // ← the single call site
        } else {
          logEvent(S, 'QUIZ_FAILED', { level: S.level, score });
          S.phase = 'CANDIDATE'; // retake allowed; progression stays ungranted
        }
      }
      return S;
    }
  }
  return S;
}

/* ---------- exports ---------- */
const __exports = {
  makeSlice, applyEvent, stateDigest, canonicalStringify, h32,
  proposeCompanionLine, hintFor, quizForLevel, spawnTimeOf, kindOf,
  SLICE_QUIZ, KNOWN_ACTIONS,
  TUNING: {
    FIRE_STONES_NEEDED, FIRE_SCRATCH_SECONDS, SKY_SPAWN_SPACING,
    SKY_FALL_SECONDS, SKY_GEMS_NEEDED, SKY_MAX_MISTAKES,
    MATCHA_BAND_LO, MATCHA_BAND_HI, MATCHA_BLEND_NEEDED, MATCHA_HEAT_MAX,
    MATCHA_HEAT_WHISK, MATCHA_COOL_RATE, LEDGER_CAP, LEVEL_COUNT,
    QUIZ_PASS_NEEDED,
  },
};
if (typeof module !== 'undefined' && module.exports) module.exports = __exports;
else if (typeof window !== 'undefined') window.SliceCore = __exports;

})();
