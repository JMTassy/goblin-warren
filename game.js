/* Goblin Warren — iPhone V1 — game.js
   PLAYABLE SANDBOX PROTOTYPE · AUTHORITY:false · CANON:false · SHIP:false
   localStorage local memory only — never called a receipt or ledger.
   Vanilla JS. No build step. No frameworks. No network calls.
*/
(function () {
"use strict";

var STORAGE_KEY = "goblin_warren_v1_state";
var STATE_VERSION = 1;

/* ---------------------------------------------------------------------
   WORLD DATA (visual language — unchanged by the state-contract update)
--------------------------------------------------------------------- */

var ZONES = [
  { id: "tree",    name: "Akashic Tree",   icon: "🌳", x: 50, y: 16, color: "#b98cff" },
  { id: "garden",  name: "Garden Plot",    icon: "🌸", x: 20, y: 40, color: "#6ee7a0" },
  { id: "nursery", name: "Bug Nursery",    icon: "🪲", x: 80, y: 40, color: "#e3ff6e" },
  { id: "spire",   name: "The High Spire", icon: "🏰", x: 50, y: 47, color: "#8b7cff", locked: true },
  { id: "forge",   name: "Receipt Forge",  icon: "🔥", x: 27, y: 72, color: "#ffb15c" },
  { id: "gate",    name: "Mycelial Gate",  icon: "🍄", x: 73, y: 72, color: "#c9a6ff" }
];
function zoneUnlocked(zoneId) { return zoneId !== "spire" || (S && S.progress && S.progress.spireUnlocked); }
function zoneById(id) { for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === id) return ZONES[i]; return ZONES[0]; }
function zoneName(id) { return zoneById(id).name; }

var GOBLIN_DEFS = [
  { id: "lulu", name: "Lulu", role: "Detour Specialist", trait: "curious",   color: "#9be8c5", preference: "gate",    aversion: "forge",
    homeTask: "exploring" },
  { id: "pip",  name: "Pip",  role: "Archivist",          trait: "careful",   color: "#8bb26b", preference: "forge",   aversion: "nursery",
    homeTask: "archiving" },
  { id: "zaz",  name: "Zaz",  role: "Gardener",           trait: "warm",      color: "#55c77c", preference: "garden",  aversion: "gate",
    homeTask: "gardening" },
  { id: "nib",  name: "Nib",  role: "Forger",             trait: "restless",  color: "#a9c98a", preference: "nursery", aversion: "garden",
    homeTask: "tinkering" }
];

/* Tink unlocks with the High Spire (Warren Level 2). Not in GOBLIN_DEFS —
   the core-four save contract stays untouched; Tink is additive. */
var TINK_DEF = { id: "tink", name: "Tink", role: "Tinkerer", trait: "inventive", color: "#d9c46b",
  preference: "spire", aversion: "garden", homeTask: "contraptioning" };
var DEFS_BY_ID = {};
GOBLIN_DEFS.concat([TINK_DEF]).forEach(function (d) { DEFS_BY_ID[d.id] = d; });

/* Lulu modes — ids are kebab-case per the state contract. */
var LULU_MODES = [
  { id: "bouffon-tendre",           name: "Bouffon Tendre",           icon: "🎭", accent: "#ff9ecb", voice: "Lulu grins, gentle and odd:" },
  { id: "punk-du-repos",            name: "Punk du Repos",            icon: "🛌", accent: "#ffb15c", voice: "Lulu slumps, unbothered:" },
  { id: "romantique-des-questions", name: "Romantique des Questions", icon: "❓", accent: "#c9b6ff", voice: "Lulu tilts her head, dreamy:" },
  { id: "gremlin-des-side-quests",  name: "Gremlin des Side Quests",  icon: "🗺️", accent: "#6ee7a0", voice: "Lulu already has a map out:" },
  { id: "cave-dweller",             name: "Cave-Dweller",             icon: "🕯️", accent: "#7a8cff", voice: "Lulu whispers from the dark:" },
  { id: "nommeur-de-bugs",          name: "Nommeur de Bugs",          icon: "🐛", accent: "#e3ff6e", voice: "Lulu points, delighted:" }
];
function modeById(id) { for (var i = 0; i < LULU_MODES.length; i++) if (LULU_MODES[i].id === id) return LULU_MODES[i]; return LULU_MODES[0]; }

/* Signal → Lulu mode (deterministic mapping from the operator contract). */
var SIGNAL_MODE_MAP = {
  bug: "nommeur-de-bugs",
  fatigue: "punk-du-repos",
  mystery: "romantique-des-questions",
  intrusion: "cave-dweller",
  novelty: "gremlin-des-side-quests"
  /* wonder, or anything unmapped, falls through to bouffon-tendre */
};
function chooseLuluMode(signalType) { return SIGNAL_MODE_MAP[signalType] || "bouffon-tendre"; }

var SIGNAL_ZONE_STATIC = { bug: "nursery", intrusion: "gate", mystery: "garden", wonder: "tree" };
var SIGNAL_META = {
  bug:       { title: "A Bug Escaped",     desc: "Something skittered out of the Nursery." },
  fatigue:   { title: "Someone's Worn Out", desc: "{name} can barely keep their eyes open." },
  mystery:   { title: "Something Glints",  desc: "A shiny thing turned up in the Garden." },
  intrusion: { title: "The Air Feels Thick", desc: "Toxicity is creeping near the Gate." },
  novelty:   { title: "A New Path",        desc: "Lulu found a path nobody's taken." },
  wonder:    { title: "The Tree Stirs",    desc: "The Akashic Tree feels unusually curious." }
};

var PROPOSALS = {
  bug: [
    "Name the bug Gerald and give it a tiny apartment.",
    "Let the loose bug pick which zone it likes best.",
    "Ask the bug what it's actually running from."
  ],
  fatigue: [
    "Give the tired goblin a tiny holiday.",
    "Cancel today's chores, out of spite.",
    "Let them nap in the last patch of sun."
  ],
  mystery: [
    "Give the shiny thing to whoever is most tired.",
    "Bury the shiny thing again, on purpose.",
    "Ask the Tree if it remembers this shiny thing."
  ],
  intrusion: [
    "Turn the broken sign into a shrine.",
    "Feed the toxic patch to the compost and see what grows.",
    "Let Nib weld a lid on it, just to see."
  ],
  novelty: [
    "Follow the new path and see where it goes.",
    "Trade two goblins' jobs for an hour, on a dare.",
    "Let Lulu lead everyone the long way around."
  ],
  wonder: [
    "Read the Tree a memory out loud.",
    "Let the Tree pick tomorrow's chores.",
    "Compost the argument, gently."
  ]
};

/* Dialogue templates — min fable, max haiku, credit the spark, don't inflate the claim. */
var DIALOGUE_TEMPLATES = [
  "I remember when {event}.",
  "I don't trust that {object}.",
  "Lulu said this was compost.",
  "{zone} smells different today.",
  "Don't rush me, I'm thinking.",
  "Someone should write this down.",
  "The Tree hummed at me again.",
  "I found something shiny near {zone}.",
  "Is {object} watching us back?",
  "I could use a nap.",
  "This mud smells like victory.",
  "I liked it better before {object} showed up.",
  "Roots are talking again.",
  "One bug walked out. Kidding. Maybe."
];

var STRANGE_THOUGHTS = [
  "What if {zone} is dreaming about us too?",
  "I think the compost is older than the Tree.",
  "Somewhere there's a warren with no goblins. Sad.",
  "If I hold still long enough, does {zone} notice?",
  "I keep counting the lanterns. There's always one more.",
  "I bet {object} has a name we don't know yet.",
  "The roots go somewhere. I have not asked where.",
  "Maybe fatigue is just the Warren asking me to sit."
];

/* ---------------------------------------------------------------------
   STATE — exact shared shape per the operator contract
--------------------------------------------------------------------- */

function rand(min, max) { return Math.random() * (max - min) + min; }
function randi(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[randi(0, arr.length - 1)]; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function jitter(v, amt) { return clamp(v + rand(-amt, amt), 8, 92); }
/* Goblins stand beside/below a zone's glyph+label stack, never dead-center
   on top of it, so the zone name stays readable (a place, not a dashboard). */
function zoneStandSpot(zoneId) {
  var z = zoneById(zoneId);
  /* y-cap 86 keeps a goblin's speech bubble inside the map at the bottom zones */
  return { x: jitter(z.x, 12), y: clamp(z.y + 10 + rand(-3, 5), 8, 86) };
}
function uid(prefix) { return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }

function makeGoblin(def) {
  var spot0 = zoneStandSpot(def.preference);
  var x = spot0.x, y = spot0.y;
  return {
    id: def.id, name: def.name, role: def.role, trait: def.trait, color: def.color,
    preference: def.preference, aversion: def.aversion,
    zone: def.preference,
    mood: "curious",
    task: def.homeTask,
    curiosity: randi(40, 70),
    trust: randi(50, 70),
    fatigue: randi(5, 20),
    memory: "",
    intention: "just arrived, taking it in",
    x: x, y: y, targetX: x, targetY: y,
    resting: false,
    facing: "right"
  };
}

var TERRITORY_DEFS = [
  { id: "signpost-grove", name: "Signpost Grove", zone: "gate", cost: 30, icon: "🧭", preferredRole: "Archivist",
    pillar: "promptEngineering", pillarName: "Prompt Engineering",
    grantsAbility: { goblin: "pip", ability: "clarifySign", label: "CLARIFY_SIGN" },
    actionDescription: "Pip learns to clarify vague signs — and decides on her own when to fix one." },
  { id: "garden-north", name: "Northern Garden", zone: "garden", cost: 30, icon: "🌿", preferredRole: "Gardener" },
  { id: "forge-east", name: "Eastern Forge", zone: "forge", cost: 40, icon: "⚒️", preferredRole: "Archivist" },
  { id: "library-west", name: "Root Library", zone: "tree", cost: 35, icon: "📚", preferredRole: "Archivist" },
  { id: "grove-south", name: "Nursery Grove", zone: "nursery", cost: 25, icon: "🌳", preferredRole: "Forger" }
];

function makeState() {
  var goblins = {};
  GOBLIN_DEFS.forEach(function (d) { goblins[d.id] = makeGoblin(d); });
  return {
    version: STATE_VERSION,
    startedAt: Date.now(),
    lastSavedAt: Date.now(),
    world: { treeHealth: 70, gardenToxicity: 20, bugPressure: 15, soil: 0, warmth: 50, currentSignal: null },
    goblins: goblins,
    lulu: { mode: "bouffon-tendre", previousMode: null },
    activeProposal: null,
    objects: [],
    replay: [],
    flags: { greeted: false, firstSignalSeen: false, firstProposalResolved: false, secondEventReferencedFirst: false, geraldFate: null,
             boops: 0, treePartySeen: false, quizRight: 0, quizWrong: 0 },
    progress: { level: 1, glowOrbs: 0, magicSap: 0, spireUnlocked: false, tinkUnlocked: false, crownDefeats: 0, raamDefeats: 0 },
    settings: { muted: false },
    territories: { owned: [], building: null },
    learning: { maestroUnlocked: false, activeQuest: null, completedQuests: [],
                pillarProgress: { promptAlchemy: 0, toolConjuration: 0, intelligenceDesign: 0, codeSpellicraft: 0 },
                zolBalance: 0, quizStreak: 0, geraldQuest: { version: 1, stage: "LOCKED", t5aChoice: null, t5bChoice: null, t5cCorrect: false, rewardClaimed: false },
                firstInteractionAt: null, lastQuizTopic: null, lastQuizLesson: null },
    npcAbilities: { pip: { clarifySign: false } },
    worldSigns: { westPath: { text: "MUSHROOMS THIS WAY", clarity: 0.25, clarified: false } },
    memories: [],
    council: { done: false, stage: "IDLE", card: null }
  };
}

function validAndComplete(s) {
  return s && s.version === STATE_VERSION && s.world && s.goblins &&
    s.goblins.lulu && s.goblins.pip && s.goblins.zaz && s.goblins.nib &&
    Array.isArray(s.replay) && s.flags && s.progress && s.settings && s.learning &&
    s.npcAbilities && s.worldSigns && Array.isArray(s.memories) && s.council;
}

function mergeDefaults(loaded) {
  var d = makeState();
  if (!loaded || typeof loaded !== "object") return d;
  var out = d;
  try {
    out.version = STATE_VERSION;
    out.startedAt = typeof loaded.startedAt === "number" ? loaded.startedAt : d.startedAt;
    out.lastSavedAt = typeof loaded.lastSavedAt === "number" ? loaded.lastSavedAt : d.lastSavedAt;
    out.world = Object.assign({}, d.world, loaded.world || {});
    out.goblins = {};
    GOBLIN_DEFS.forEach(function (def) {
      out.goblins[def.id] = Object.assign({}, d.goblins[def.id], (loaded.goblins && loaded.goblins[def.id]) || {});
    });
    if (loaded.goblins && loaded.goblins.tink) {
      out.goblins.tink = Object.assign({}, makeGoblin(TINK_DEF), loaded.goblins.tink);
    }
    out.progress = Object.assign({}, d.progress, loaded.progress || {});
    out.lulu = Object.assign({}, d.lulu, loaded.lulu || {});
    out.activeProposal = loaded.activeProposal || null;
    out.objects = Array.isArray(loaded.objects) ? loaded.objects : [];
    out.replay = Array.isArray(loaded.replay) ? loaded.replay : [];
    out.flags = Object.assign({}, d.flags, loaded.flags || {});
    out.settings = Object.assign({}, d.settings, loaded.settings || {});
    out.learning = Object.assign({}, d.learning, loaded.learning || {});
    out.territories = Object.assign({}, d.territories, loaded.territories || {});
    out.npcAbilities = { pip: Object.assign({}, d.npcAbilities.pip, (loaded.npcAbilities && loaded.npcAbilities.pip) || {}) };
    out.worldSigns = { westPath: Object.assign({}, d.worldSigns.westPath, (loaded.worldSigns && loaded.worldSigns.westPath) || {}) };
    out.memories = Array.isArray(loaded.memories) ? loaded.memories : [];
    out.council = Object.assign({}, d.council, loaded.council || {});
  } catch (e) { return d; }
  return out;
}

function loadState() {
  var raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
  if (!raw) return { state: makeState(), fresh: true };
  var parsed = null;
  try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
  if (!parsed) return { state: makeState(), fresh: true };
  if (validAndComplete(parsed)) return { state: parsed, fresh: false };
  // malformed / older shape: reject, but salvage what safely merges
  return { state: mergeDefaults(parsed), fresh: false };
}

var loaded = loadState();
var S = loaded.state;
var isFreshBoot = loaded.fresh;

function saveState() {
  S.lastSavedAt = Date.now();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: still playable this session */ }
}

function pushReplay(actor, eventTitle, choice, visibleChange, memoryLine) {
  S.replay.push({
    id: uid("r"), timestamp: Date.now(), actor: actor,
    event: eventTitle, choice: choice, visibleChange: visibleChange, memoryLine: memoryLine || ""
  });
  if (S.replay.length > 40) S.replay.shift();
}

/* ---------------------------------------------------------------------
   AUDIO (Web Audio, generated tones — no assets)
--------------------------------------------------------------------- */

var actx = null;
function ensureAudio() {
  if (actx) return actx;
  try { var Ctx = window.AudioContext || window.webkitAudioContext; actx = new Ctx(); } catch (e) { actx = null; }
  return actx;
}
function resumeAudio() { if (actx && actx.state === "suspended") actx.resume(); startAmbient(); }

/* ---------------------------------------------------------------------
   AMBIENT PLAYLIST — optional remote layer; play NEVER depends on it.
   Two generated music tracks rotate quietly under the game's tone SFX;
   a night-forest loop breathes underneath; soft birds visit sometimes.
   Starts only after the first user gesture (autoplay law). Any network
   or decode error mutes that layer silently — the Warren plays on.
--------------------------------------------------------------------- */

var MUSIC_TRACKS = [    /* tanpura drones — no piano, no melody; hypnotic, looped */
  "https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_022435_e466659d-ce50-4820-b9f3-230f7582f3ec.m4a",
  "https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_022438_d067c7e4-5277-4396-b24f-b25164438354.m4a"
];
var NATURE_LOOP =        /* grillons + flowing water over stones */
  "https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_022440_a5f91bfe-3b7d-4c05-86ac-f35ce866ecb1.mp3";
var BIRD_CLIP =          /* occasional soft birds one-shot */
  "https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_013728_6740726c-9d11-4809-8b8d-03a210140515.mp3";

var ambient = { started: false, music: null, nature: null, birds: null, trackIndex: 0, birdTimer: null };

function ambientAllowed() { return !S.settings.muted; }

function startAmbient() {
  if (ambient.started) { applyAmbientMute(); return; }
  ambient.started = true;

  if (MUSIC_TRACKS.length) {
    ambient.music = new Audio();
    ambient.music.volume = 0.22;
    ambient.music.preload = "auto";
    ambient.music.addEventListener("ended", function () {
      ambient.trackIndex = (ambient.trackIndex + 1) % MUSIC_TRACKS.length;
      setTimeout(function () {
        if (!ambient.music) return;
        ambient.music.src = MUSIC_TRACKS[ambient.trackIndex];
        if (ambientAllowed()) ambient.music.play().catch(function () {});
      }, 6000);
    });
    ambient.music.addEventListener("error", function () { ambient.music = null; });
    ambient.music.src = MUSIC_TRACKS[0];
    if (ambientAllowed()) ambient.music.play().catch(function () {});
  }

  if (NATURE_LOOP) {
    ambient.nature = new Audio(NATURE_LOOP);
    ambient.nature.loop = true;
    ambient.nature.volume = 0.13;
    ambient.nature.addEventListener("error", function () { ambient.nature = null; });
    if (ambientAllowed()) ambient.nature.play().catch(function () {});
  }

  if (BIRD_CLIP) {
    ambient.birds = new Audio(BIRD_CLIP);
    ambient.birds.volume = 0.11;
    ambient.birds.addEventListener("error", function () { ambient.birds = null; });
    var visit = function () {
      if (ambient.birds && ambientAllowed()) { ambient.birds.currentTime = 0; ambient.birds.play().catch(function () {}); }
      ambient.birdTimer = setTimeout(visit, 45000 + Math.random() * 60000);
    };
    ambient.birdTimer = setTimeout(visit, 20000);
  }
}

function applyAmbientMute() {
  var muted = !ambientAllowed();
  ["music", "nature", "birds"].forEach(function (k) {
    var a = ambient[k];
    if (!a) return;
    a.muted = muted;
    if (muted) a.pause();
    else if (k !== "birds") a.play().catch(function () {});
  });
}

function tone(freq, start, dur, type, gain, glideTo) {
  if (S.settings.muted) return;
  var ctx = ensureAudio();
  if (!ctx) return;
  var osc = ctx.createOscillator();
  var g = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (glideTo) osc.frequency.linearRampToValueAtTime(glideTo, ctx.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain || 0.15, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.05);
}

/* Musical scale frequencies (Do Re Mi Fa Sol La Si Do) */
var SCALE_DO_RE_MI = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
/* Solfeggio Sacred Frequencies (Hz) — for psychological engagement */
var SOLFEGGIO = {
  grounding: 174,     /* grounding, pain relief */
  regeneration: 285,  /* cell regeneration, tissue repair */
  liberation: 396,    /* liberation from guilt and fear */
  change: 417,        /* undoing situations, facilitating change */
  love: 528,          /* transformation and miracles (Love frequency) */
  connection: 639,    /* connecting, relationships, harmony */
  intuition: 741,     /* awakening intuition, expression, throat */
  order: 852          /* returning to spiritual order, spiritual perspective */
};

var Sound = {
  bell: function () { tone(880, 0, 0.22, "sine", 0.18); tone(1320, 0.09, 0.25, "sine", 0.12); },
  chirp: function () { tone(1500, 0, 0.08, "square", 0.08, 2000); },
  treeHum: function () { tone(120, 0, 0.9, "sine", 0.10, 90); tone(180, 0.05, 0.8, "triangle", 0.05); },
  compostPlop: function () { tone(200, 0, 0.18, "sine", 0.16, 80); tone(90, 0.05, 0.22, "sine", 0.14); },
  forgeClink: function () { tone(2200, 0, 0.05, "square", 0.06); tone(1600, 0.04, 0.08, "square", 0.05, 1200); },
  bloom: function () { tone(660, 0, 0.15, "sine", 0.12); tone(880, 0.1, 0.15, "sine", 0.12); tone(1100, 0.2, 0.2, "sine", 0.12); },
  squeak: function (id) {
    var base = { lulu: 1300, pip: 700, nib: 1000, zaz: 520 }[id] || 900;
    tone(base, 0, 0.09, "square", 0.10, base * 1.6);
    tone(base * 1.5, 0.06, 0.08, "sine", 0.08);
  },
  sneeze: function () { tone(300, 0, 0.08, "sawtooth", 0.08, 900); tone(150, 0.08, 0.22, "sine", 0.12, 60); },
  roar: function () { tone(90, 0, 0.5, "sawtooth", 0.14, 55); tone(140, 0.08, 0.4, "square", 0.07, 70); },
  giggle: function () { tone(1400, 0, 0.07, "sine", 0.1, 1800); tone(1700, 0.09, 0.07, "sine", 0.09, 2100); tone(2000, 0.18, 0.09, "sine", 0.08); },
  dance: function () { [523, 659, 784, 659, 523, 784].forEach(function (f, i) { tone(f, i * 0.09, 0.1, "square", 0.07); }); },
  party: function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, i * 0.12, 0.3, "sine", 0.12); }); tone(2093, 0.62, 0.5, "sine", 0.08); },
  sparkle: function () { tone(1760, 0, 0.1, "sine", 0.08); tone(2217, 0.08, 0.12, "sine", 0.07); },

  /* Educational Sound Design: Do Re Mi Scale for Game Events */
  riddlePrompt: function () {
    /* Do-Mi-Sol ascending for question/anticipation (curiosity) */
    [SCALE_DO_RE_MI[0], SCALE_DO_RE_MI[2], SCALE_DO_RE_MI[4]].forEach(function (f, i) {
      tone(f, i * 0.12, 0.18, "sine", 0.10);
    });
  },
  riddleCorrect: function () {
    /* Full Do-Re-Mi-Fa-Sol ascending for correct answer (achievement, learning) */
    SCALE_DO_RE_MI.slice(0, 5).forEach(function (f, i) {
      tone(f, i * 0.08, 0.2, "sine", 0.12);
    });
  },
  riddleWrong: function () {
    /* Descending Mi-Re-Do for wrong answer (gentle, non-punitive feedback) */
    [SCALE_DO_RE_MI[2], SCALE_DO_RE_MI[1], SCALE_DO_RE_MI[0]].forEach(function (f, i) {
      tone(f, i * 0.10, 0.15, "sine", 0.08);
    });
  },
  solfeggioTouch: function () {
    /* The Warren is an instrument. Every touch rings one sacred frequency
       (174–852 Hz) with a soft octave shimmer; long low-gain envelopes let
       random taps overlap into a hypnotic tuning rather than noise. */
    var keys = Object.keys(SOLFEGGIO);
    var f = SOLFEGGIO[keys[Math.floor(Math.random() * keys.length)]];
    tone(f, 0, 1.8, "sine", 0.06);
    tone(f * 2, 0.06, 1.3, "sine", 0.025);
    if (Math.random() < 0.3) tone(f * 1.5, 0.12, 1.5, "sine", 0.02); /* occasional fifth */
  },
  glingGling: function (coins) {
    /* Casino coin cascade: bright staggered dings with a rising sparkle tail. */
    var n = Math.min(8, Math.max(4, coins || 5));
    var base = [1568, 1760, 1976, 2093, 2349];
    for (var i = 0; i < n; i++) {
      var f = base[i % base.length] * (1 + (i % 3) * 0.01);
      tone(f, i * 0.07, 0.14, "triangle", 0.10);
      tone(f * 2, i * 0.07 + 0.02, 0.08, "sine", 0.05);
    }
    tone(3136, n * 0.07, 0.3, "sine", 0.07, 3520); /* final shimmer up */
  },
  territoryBuy: function () {
    /* Sol-La-Si-Do (ascending) for acquisition (achievement, progress) */
    [SCALE_DO_RE_MI[4], SCALE_DO_RE_MI[5], SCALE_DO_RE_MI[6], SCALE_DO_RE_MI[7]].forEach(function (f, i) {
      tone(f, i * 0.10, 0.15, "sine", 0.11);
    });
  },
  proposalSubmit: function () {
    /* Do-Re-Mi (ascending) with Solfeggio 417 Hz (change) underlayer for change/decision */
    tone(SOLFEGGIO.change, 0, 0.5, "sine", 0.04);
    [SCALE_DO_RE_MI[0], SCALE_DO_RE_MI[1], SCALE_DO_RE_MI[2]].forEach(function (f, i) {
      tone(f, i * 0.12, 0.2, "sine", 0.11);
    });
  },
  proposalAccepted: function () {
    /* Fa-Sol-La-Si-Do (ascending) with Solfeggio 528 Hz (love/transformation) for success */
    tone(SOLFEGGIO.love, 0, 0.7, "sine", 0.06);
    [SCALE_DO_RE_MI[3], SCALE_DO_RE_MI[4], SCALE_DO_RE_MI[5], SCALE_DO_RE_MI[6], SCALE_DO_RE_MI[7]].forEach(function (f, i) {
      tone(f, i * 0.09, 0.2, "sine", 0.12);
    });
  },
  proposalDenied: function () {
    /* Do-Re-Do (gentle rejection, no shame) with Solfeggio 396 Hz (liberation) */
    tone(SOLFEGGIO.liberation, 0, 0.4, "sine", 0.05);
    [SCALE_DO_RE_MI[0], SCALE_DO_RE_MI[1], SCALE_DO_RE_MI[0]].forEach(function (f, i) {
      tone(f, i * 0.12, 0.15, "sine", 0.09);
    });
  },
  spireUnlock: function () {
    /* Octave jump Do-Do (higher) with Solfeggio 852 Hz (spiritual order) for big milestone */
    tone(SOLFEGGIO.order, 0, 0.6, "sine", 0.07);
    tone(SCALE_DO_RE_MI[0], 0.1, 0.25, "sine", 0.13);
    tone(SCALE_DO_RE_MI[7], 0.35, 0.35, "sine", 0.14);
  },
  gardenHarmony: function () {
    /* Solfeggio 639 Hz (connection) + harmonic chord for ecosystem harmony */
    tone(SOLFEGGIO.connection, 0, 0.8, "sine", 0.06);
    tone(SCALE_DO_RE_MI[2], 0, 0.8, "sine", 0.07); /* Mi */
    tone(SCALE_DO_RE_MI[4], 0, 0.8, "sine", 0.07); /* Sol */
    tone(SCALE_DO_RE_MI[0], 0.3, 0.5, "sine", 0.06); /* Do bass entry */
  }
};

/* ---------------------------------------------------------------------
   QUEST SYSTEM (v1.9 Goblin Maestro & Learning)
--------------------------------------------------------------------- */

var PILLARS = {
  promptAlchemy: { lesson: "Proposals influence; they do not control." },
  toolConjuration: { lesson: "Match task to agent and tool." },
  intelligenceDesign: { lesson: "Behavior emerges from memory, preference, mood, context." },
  codeSpellicraft: { lesson: "Rules and state produce repeatable behavior." }
};

var MAESTRO_DEF = {
  id: "maestro", name: "Maestro Moss", role: "Pattern Teacher",
  trait: "Patiently strange", icon: "🧙",
  opening: "I won't tell you what the goblins will do. I'll help you notice why they did it."
};

/* Quest evaluation: score how well each goblin matches the task. */
function evaluateCarrier(goblinId, questData) {
  var g = S.goblins[goblinId];
  if (!g) return -Infinity;

  var preferenceMatch = questData.preferredZone === g.preference ? 3 : 0;
  var roleMatch = questData.preferredRole === g.role ? 4 : 0;
  var trust = g.trust * 0.5;
  var fatigueCost = g.fatigue * 0.7;
  var aversionMatch = questData.preferredZone === g.aversion ? 3 : 0;

  return preferenceMatch + roleMatch + trust - fatigueCost - aversionMatch;
}

/* Memory Seed quest definition. */
var MEMORY_SEED_QUEST = {
  id: "memory-seed",
  pillar: "toolConjuration",
  pillarName: "Tool Conjuration",
  title: "The Memory Seed",
  triggerEvent: "third_proposal_resolved",
  choices: ["pip", "zaz", "lulu", "nib"],
  preferredZone: "garden",
  preferredRole: "Gardener",
  evaluator: evaluateCarrier,
  outcomes: {
    pip: {
      action: "records",
      mood: "curious",
      memory: "I understood the memory, but the soil frightens me.",
      worldChange: 0,
      nextStep: "zaz"
    },
    zaz: {
      action: "plants",
      mood: "content",
      memory: "The seed found good earth. It will remember us.",
      worldChange: 2,
      nextStep: null
    },
    lulu: {
      action: "wanders",
      mood: "delighted",
      memory: "I found a better place for it. Maybe.",
      worldChange: 4,
      nextStep: "zaz"
    },
    nib: {
      action: "repairs",
      mood: "uneasy",
      memory: "I tried to fix it, but it was never broken.",
      worldChange: 1,
      nextStep: null
    }
  },
  lessonTemplate: {
    optimal_solo: "{{first}} was the perfect choice for this task. That is {{pillar}}—matching the right agent to the work.",
    optimal_cascade: "{{first}} understood the seed. {{second}} understood the soil. That is {{pillar}}—knowing which agent fits which task.",
    suboptimal_solo: "{{first}} tried their best. But {{best}} would have been stronger. That is {{pillar}}—knowing which agent fits which task.",
    suboptimal_cascade: "{{first}} tried. {{second}} succeeded. But {{best}} might have been stronger still. That is {{pillar}}—recognizing which agent fits which sequence."
  },
  zolReward: 15,
  completed: false
};

var GERALD_QUEST = {
  id: "gerald",
  pillar: "promptAlchemy",
  pillarName: "Prompt Alchemy",
  title: "The Crash Called Gerald",
  triggerDelay: 7000,
  mutations: {
    playerPrompt: "Build Gerald a small bridge before sunset.",
    luluMutation: "Build Gerald a small bridge before sunset.",
    pipMutation: "Build a bridge that looks like sunset.",
    nibMutation: "Build a sunset-colored fridge."
  },
  betterPrompt: "Build Gerald a safe, small bridge across the stream before sunset. Use wood and rope. Strong enough for Gerald to cross. Test: Gerald crosses safely.",
  outcomes: {
    try: {
      action: "Gerald crossed safely.",
      goblinReaction: "Zaz smiled. The bridge held.",
      worldChange: 2,
      memory: "We built something that worked."
    },
    hold: {
      action: "Gerald went into an observation jar.",
      goblinReaction: "Pip recorded it carefully.",
      worldChange: 1,
      memory: "We watched, and waited."
    },
    compost: {
      action: "Gerald became soil.",
      goblinReaction: "A mushroom bloomed.",
      worldChange: 3,
      memory: "We turned it into something new."
    }
  },
  zolReward: 10
};

function triggerMemorySeedQuest() {
  if (S.learning.activeQuest || S.learning.completedQuests.indexOf("memory-seed") !== -1) return;
  /* Quest triggers only on third proposal resolved, not first. */
  var proposalsResolved = S.replay.filter(function (r) { return r.kind === "proposal-resolved" || r.kind === "quest-resolved"; }).length;
  if (proposalsResolved < 3) return;

  S.learning.activeQuest = MEMORY_SEED_QUEST.id;
  S.learning.maestroUnlocked = true;
  showQuestPrompt();
  saveState();
}

function showQuestPrompt() {
  if (!S.learning.maestroUnlocked) return;
  var overlay = document.getElementById("maestro-quest");
  if (overlay) overlay.classList.remove("hidden");
}

function resolveMemorySeedQuest(carrierIds) {
  /* carrierIds is an array of goblin IDs in order chosen. */
  if (!Array.isArray(carrierIds) || carrierIds.length === 0) return;

  var firstId = carrierIds[0];
  var outcome = MEMORY_SEED_QUEST.outcomes[firstId];
  if (!outcome) outcome = MEMORY_SEED_QUEST.outcomes.pip;

  /* Score evaluation: determine best carrier and compare to player's choice. */
  var scores = {};
  var bestScore = -Infinity;
  var bestId = null;
  MEMORY_SEED_QUEST.choices.forEach(function (cid) {
    scores[cid] = evaluateCarrier(cid, MEMORY_SEED_QUEST);
    if (scores[cid] > bestScore) {
      bestScore = scores[cid];
      bestId = cid;
    }
  });
  var playerScore = scores[firstId] || -Infinity;
  var scoreDelta = bestScore - playerScore;
  var isOptimal = firstId === bestId;

  /* Cascade chain: build full sequence by following nextStep. */
  var cascade = [firstId];
  var nextId = outcome.nextStep;
  while (nextId) {
    cascade.push(nextId);
    var nextOutcome = MEMORY_SEED_QUEST.outcomes[nextId];
    nextId = nextOutcome ? nextOutcome.nextStep : null;
  }

  /* Apply each step in cascade to respective goblin. */
  var totalWorldChange = 0;
  cascade.forEach(function (cid, idx) {
    var o = MEMORY_SEED_QUEST.outcomes[cid];
    if (!o) return;

    var g = S.goblins[cid];
    if (g) {
      g.mood = o.mood;
      g.memory = o.memory;
    }
    totalWorldChange += o.worldChange;

    /* Log each cascade step. */
    pushReplay("maestro", "Cascade step " + (idx + 1), "cascade-step",
      cid + " " + o.action + ". " + o.memory, o.memory);
  });

  S.world.treeHealth = Math.min(100, S.world.treeHealth + totalWorldChange);
  pushReplay("maestro", "Memory Seed planted", "quest-resolved",
    "Cascade complete. Optimal: " + bestId + " (" + bestScore.toFixed(1) + "). Chosen: " + firstId + " (" + playerScore.toFixed(1) + "). Chain: " + cascade.join(" -> "),
    outcome.memory);

  /* Award ZOL after lesson moment. */
  S.learning.zolBalance += MEMORY_SEED_QUEST.zolReward;
  S.learning.pillarProgress.toolConjuration += 15;
  S.learning.completedQuests.push("memory-seed");
  S.learning.activeQuest = null;

  var overlay = document.getElementById("maestro-quest");
  if (overlay) overlay.classList.add("hidden");
  showMaestroLesson(firstId, cascade[1] || null, isOptimal, bestId);
  saveState();
}

function showMaestroLesson(firstCarrier, secondCarrier, isOptimal, bestId) {
  var lessonOverlay = document.getElementById("maestro-lesson");
  if (!lessonOverlay) return;

  var lessonText = document.getElementById("maestro-lesson-text");
  if (!lessonText) return;

  var firstGoblin = DEFS_BY_ID[firstCarrier];
  var secondGoblin = secondCarrier ? DEFS_BY_ID[secondCarrier] : null;
  var bestGoblin = DEFS_BY_ID[bestId];
  var quest = MEMORY_SEED_QUEST;

  /* Pick template based on optimality and cascade presence. */
  var templateKey = "";
  if (isOptimal) {
    templateKey = secondGoblin ? "optimal_cascade" : "optimal_solo";
  } else {
    templateKey = secondGoblin ? "suboptimal_cascade" : "suboptimal_solo";
  }

  var template = quest.lessonTemplate[templateKey] || quest.lessonTemplate.optimal_solo;

  /* Fill template placeholders. */
  var lesson = template
    .replace("{{first}}", firstGoblin.name)
    .replace("{{second}}", secondGoblin ? secondGoblin.name : "")
    .replace("{{best}}", bestGoblin.name)
    .replace("{{pillar}}", quest.pillarName);

  lessonText.innerHTML = lesson + "<br/><br/>+15 ✨";
  lessonOverlay.classList.remove("hidden");
}

function closeMaestroLesson() {
  var lessonOverlay = document.getElementById("maestro-lesson");
  if (lessonOverlay) lessonOverlay.classList.add("hidden");
}

/* ---------------------------------------------------------------------
   GOBLIN COUNCIL V0 — NPC debate → player nudge → consensus →
   ridiculous action → visible consequence.
   Dialogue lines are typed acts (PROPOSE/OBJECT/UPDATE/REFUSE/JOKE)
   that compile into positions; dialogue itself NEVER mutates world
   state — only executeCouncilPlan() does.
--------------------------------------------------------------------- */

var COUNCIL_EPISODE = {
  id: "gerald-hearing",
  crisis: "CRISIS: GERALD'S CITIZENSHIP HEARING",
  intro: "Gerald ate two leaves and slept inside Pip's archive. The Warren must decide.",
  proposals: [
    { id: "house",   label: "BUILD A HOUSE", icon: "🏠" },
    { id: "observe", label: "OBSERVE",       icon: "🏺" },
    { id: "move",    label: "MOVE GARDEN",   icon: "🌱" }
  ],
  opening: [
    { speaker: "lulu", act: "PROPOSE", targetProposal: "house",   reason: "ancestry",        text: "Gerald has lived here forty-seven seconds. That is practically ancestry." },
    { speaker: "pip",  act: "OBJECT",  targetProposal: "observe", reason: "missing_record",  text: "Gerald has no record, no address and possibly no surname." },
    { speaker: "zaz",  act: "PROPOSE", targetProposal: "move",    reason: "garden_first",    text: "The garden was here first. Gerald has eaten part of the evidence." },
    { speaker: "nib",  act: "MISUNDERSTAND", targetProposal: "wall", reason: "already_built", text: "I have already built a wall." }
  ],
  cards: [
    { id: "clarify",  title: "CLARIFY THE GOAL", text: "Protect both Gerald and the seedlings.",
      teaches: "A good prompt = objective + constraints.",
      outcome: "house", plan: "Build Gerald a shelter, away from the seedlings.",
      update: [
        { speaker: "zaz",  act: "UPDATE",  targetProposal: "house",   reason: "both_protected", text: "A shelter away from my seedlings protects both. Fine." },
        { speaker: "nib",  act: "UPDATE",  targetProposal: "house",   reason: "roof_upgrade",   text: "The wall can be a house if I add a roof." },
        { speaker: "pip",  act: "REFUSE",  targetProposal: "observe", reason: "not_an_embassy", text: "I support the shelter. I do not support calling it an embassy." },
        { speaker: "lulu", act: "JOKE",    targetProposal: "house",   reason: "scrolls",        text: "I will prepare the ancestral scrolls. Both of them." }
      ] },
    { id: "evidence", title: "SHOW EVIDENCE", text: "Gerald ate two leaves, sleeps in corners, avoids mushrooms.",
      teaches: "A claim is not evidence. Evidence moves goblins.",
      outcome: "observe", plan: "Observe Gerald officially. He keeps his corner.",
      update: [
        { speaker: "lulu", act: "UPDATE",  targetProposal: "observe", reason: "taste",          text: "Avoids mushrooms? Gerald has taste. Observation granted." },
        { speaker: "nib",  act: "UPDATE",  targetProposal: "observe", reason: "wall_window",    text: "I will observe him through a small window in the wall." },
        { speaker: "zaz",  act: "REFUSE",  targetProposal: "move",    reason: "still_eaten",    text: "The garden was still eaten. I am moving the seedlings anyway." },
        { speaker: "pip",  act: "SUPPORT", targetProposal: "observe", reason: "record_started", text: "Two leaves, corners, no mushrooms. Now THAT is a record." }
      ] },
    { id: "split", title: "SPLIT THE TASK", text: "Pip observes. Zaz moves seedlings. Nib builds shelter.",
      teaches: "One complex task → complementary agents.",
      outcome: "coalition", plan: "Pip observes. Zaz relocates seedlings. Nib builds. Lulu flags.",
      update: [
        { speaker: "pip",  act: "SUPPORT", targetProposal: "observe", reason: "clipboard",      text: "I observe. Officially. With a clipboard." },
        { speaker: "zaz",  act: "UPDATE",  targetProposal: "move",    reason: "dawn_move",      text: "Seedlings relocate at dawn. Gerald keeps the corner." },
        { speaker: "nib",  act: "UPDATE",  targetProposal: "house",   reason: "fortified",      text: "One shelter. Unnecessarily fortified. You are welcome." },
        { speaker: "lulu", act: "JOKE",    targetProposal: "house",   reason: "flag_budget",    text: "I am in charge of the flag. There was no flag budget. There is now." }
      ] }
  ],
  lesson: "The team solved the original problem and accidentally created foreign policy.",
  sigma: "🐛 + 🏠 ⇒ 🐛🐛",
  zolReward: 15
};

/* C1: opening positions derive from live goblin state (role), never hardcoded UI. */
function councilPositionFor(id) {
  var g = S.goblins[id];
  if (!g) return "observe";
  if (g.role === "Archivist") return "observe";
  if (g.role === "Gardener") return "move";
  if (g.role === "Detour Specialist") return "house";
  return "wall"; /* Nib: something nobody requested */
}

function councilPositions() {
  var pos = {};
  ["lulu", "pip", "zaz", "nib"].forEach(function (id) {
    pos[id] = S.council.card
      ? (COUNCIL_EPISODE.cards.find(function (c) { return c.id === S.council.card; })
          .update.find(function (l) { return l.speaker === id; }).targetProposal)
      : councilPositionFor(id);
  });
  return pos;
}

var councilTimer = null;
function maybeStartCouncil() {
  if (S.council.done || S.council.stage !== "IDLE") return;
  if (S.learning.geraldQuest.stage !== "T5A_RESOLVED") return;
  if (S.activeProposal || quizOpen) { clearTimeout(councilTimer); councilTimer = setTimeout(maybeStartCouncil, 15000); return; }
  startCouncil();
}

function startCouncil() {
  if (S.council.done) return false;
  S.council.stage = "DEBATE";
  pushReplay("council", COUNCIL_EPISODE.crisis, "council-open",
    "The Warren convened on Gerald: house, observation, or moving the garden.", "");
  saveState();
  Sound.bell();
  renderCouncil();
  return true;
}

function councilIntervene(cardId) {
  /* C3: the player intervenes exactly once. */
  if (S.council.stage !== "DEBATE" || S.council.card) return false;
  var card = COUNCIL_EPISODE.cards.find(function (c) { return c.id === cardId; });
  if (!card) return false;
  S.council.card = cardId;
  S.council.stage = "UPDATED";
  pushReplay("council", "Intervention: " + card.title, "council-card",
    "You played " + card.title + ": “" + card.text + "”. Positions shifted.", "");
  saveState();
  Sound.chirp();
  renderCouncil();
  setTimeout(function () { executeCouncilPlan(card); }, 2600);
  return true;
}

function executeCouncilPlan(card) {
  /* C6/C7: the ONLY place council changes the world. */
  if (S.council.stage !== "UPDATED" || S.council.done) return;
  S.council.stage = "RESOLVED";
  S.council.done = true;

  /* The goblins execute autonomously — and overdeliver. */
  showBubble("pip", "Gerald: registered.", 2600);
  setTimeout(function () { showBubble("zaz", "Seedlings relocated. Gently.", 2600); }, 900);
  setTimeout(function () { showBubble("nib", "The shelter is unnecessarily fortified.", 2600); }, 1800);
  setTimeout(function () { showBubble("lulu", "I added a flag.", 2600); }, 2700);

  addObject("🏛️", "The Embassy of Bug", "nursery");
  if (card.outcome !== "observe") addObject("🌱", "Relocated Seedlings", "garden");
  S.world.treeHealth = clamp(S.world.treeHealth + 2, 0, 100);
  S.goblins.pip.memory = "I registered a bug today. Officially.";
  S.goblins.lulu.memory = "We have a flag now. Nobody asked. Everybody needed it.";
  S.learning.zolBalance += COUNCIL_EPISODE.zolReward;
  S.learning.pillarProgress.intelligenceDesign += 15;

  pushReplay("council", "The plan executed", "council-executed",
    "Consensus: " + card.plan + " The shelter became The Embassy of Bug.", "");

  /* C8: the absurd side effect — successful systems attract new demand. */
  setTimeout(function () {
    addObject("🐛", "Second Bug — Asylum Request", "nursery");
    showBubble("zaz", "Another one arrived. It has paperwork.", 3200);
    pushReplay("council", "Foreign policy", "council-side-effect",
      "A second bug arrived requesting asylum. " + COUNCIL_EPISODE.sigma, "");
    saveState();
    renderAll();
  }, 2200);

  zolCelebrate(COUNCIL_EPISODE.zolReward);
  saveState();
  renderAll();
  renderSheetIdle();
  setTimeout(function () { showCouncilLesson(card); }, 3400);
}

function showCouncilLesson(card) {
  var lessonOverlay = document.getElementById("maestro-lesson");
  var lessonText = document.getElementById("maestro-lesson-text");
  if (!lessonOverlay || !lessonText) return;
  lessonText.innerHTML = COUNCIL_EPISODE.lesson + "<br/><br/>" + card.teaches +
    "<br/><br/>" + COUNCIL_EPISODE.sigma + "<br/><br/>+" + COUNCIL_EPISODE.zolReward + " 🪙";
  lessonOverlay.classList.remove("hidden");
}

/* Territory Actions — territories unlock ABILITIES, not scripted events.
   The goblin decides on its own tick when to use one, from world state.
   unlock ability ≠ press ability button. */

var SIGN_SPOT = { x: 10, y: 58 };
var pipClarifyBusy = false;

function pipCanClarify() {
  var g = S.goblins.pip;
  var sign = S.worldSigns && S.worldSigns.westPath;
  return !!(g && sign && !sign.clarified && sign.clarity < 0.5 &&
    S.npcAbilities && S.npcAbilities.pip && S.npcAbilities.pip.clarifySign &&
    !g.resting && g.fatigue < 72 && !S.activeProposal && !quizOpen && !pipClarifyBusy);
}

function pipClarifySign() {
  if (!pipCanClarify()) return false;
  var g = S.goblins.pip, sign = S.worldSigns.westPath;
  pipClarifyBusy = true;

  /* Pip notices the vague sign, walks over, grimaces, rereads it. */
  g.facing = "left";
  g.targetX = SIGN_SPOT.x + 5; g.targetY = SIGN_SPOT.y + 3;
  g.x = SIGN_SPOT.x + 5; g.y = SIGN_SPOT.y + 3;
  g.zone = "gate";
  g.task = "squinting at a sign";
  g.intention = "rereading the west-path sign";
  g.mood = "focused";
  showBubble("pip", "“" + sign.text + "”? Which mushrooms? Which way?", 3200);
  renderGoblins();

  setTimeout(function () {
    showBubble("pip", "Paint. Hammer. Context.", 2200);
  }, 1800);

  setTimeout(function () {
    /* The rewrite: objective + place + constraint. */
    sign.text = "GLOWCAP GARDEN · LEFT PATH · SAFE BEFORE SUNSET";
    sign.clarity = 1;
    sign.clarified = true;

    /* Garden consequences: lanterns light the path, flowers turn toward it. */
    addObject("🏮", "Path Lantern", "gate");
    addObject("🌼", "Flowers Facing the Path", "gate");
    S.world.warmth = clamp(S.world.warmth + 2, 0, 100);

    /* Bounded local memory, linked back to what the player learned. */
    var lesson = S.learning.lastQuizLesson || "clear instructions include a goal, a place, and a limit";
    S.memories.push({
      actor: "pip", type: "world_action", sourceTopic: "prompt_engineering",
      action: "clarify_sign", objectId: "westPath",
      summary: "You learned that " + lesson + ". Pip rewrote the west-path sign before Nib walked into the pond again.",
      createdAt: Date.now()
    });
    g.task = "archiving";
    g.mood = "quietly proud";
    g.memory = "I fixed the west sign. Place, direction, time limit. Nib has only fallen in the pond twice since.";

    /* One logical replay entry for the whole action. */
    pushReplay("pip", "Signpost Grove", "clarify-sign",
      "You unlocked Signpost Grove. Pip learned CLARIFY_SIGN. Pip rewrote the western sign. The garden became easier to navigate.",
      g.memory);

    showBubble("pip", "There. Now it says where, which way, and when.", 3600);
    Sound.bloom();
    pipClarifyBusy = false;
    saveState();
    renderAll();
  }, 3600);
  return true;
}

function pipRecallLine() {
  var m = null;
  for (var i = S.memories.length - 1; i >= 0; i--) {
    if (S.memories[i].action === "clarify_sign") { m = S.memories[i]; break; }
  }
  if (!m) return "The signs around here used to be terrible.";
  return "Remember the prompt question? I added the place, the direction, and the time limit. Nib has only fallen in the pond twice since.";
}

/* Territory system: Buy and build. */
function purchaseTerritory(territoryId) {
  var territory = TERRITORY_DEFS.find(function (t) { return t.id === territoryId; });
  if (!territory) return false;

  if (S.learning.zolBalance < territory.cost) return false; /* Insufficient ZOL */
  if (S.territories.building) return false; /* Already building a territory */

  S.learning.zolBalance -= territory.cost;
  S.territories.building = { id: territoryId, territory: territory, builders: [], startedAt: Date.now() };
  pushReplay("territory", "Territory purchased", "purchase", "Spent " + territory.cost + " ZOL on " + territory.name, territoryId);
  saveState();
  showTerritoryBuildUI(territoryId);
  return true;
}

function showTerritoryBuildUI(territoryId) {
  var territory = TERRITORY_DEFS.find(function (t) { return t.id === territoryId; });
  if (!territory) return;

  var overlay = document.getElementById("territory-build");
  if (overlay) {
    document.getElementById("territory-build-title").textContent = territory.name + " " + territory.icon;
    document.getElementById("territory-build-description").textContent =
      "Assign 1-3 goblins to build. " + territory.preferredRole + " preferred.";

    /* Render goblin choices */
    var choicesContainer = document.getElementById("territory-builder-choices");
    if (choicesContainer) {
      choicesContainer.innerHTML = "";
      GOBLIN_DEFS.forEach(function (def) {
        var g = S.goblins[def.id];
        var btn = document.createElement("button");
        btn.className = "territory-builder-btn";
        btn.setAttribute("data-goblin", def.id);
        var starred = def.role === territory.preferredRole ? " ★" : "";
        btn.innerHTML = "<b>" + def.name + starred + "</b><small>" + def.role + "</small>";
        btn.addEventListener("click", function (e) {
          btn.classList.toggle("selected");
          var selected = choicesContainer.querySelectorAll(".selected").length;
          if (selected > 3) {
            btn.classList.remove("selected");
          }
        });
        choicesContainer.appendChild(btn);
      });
    }

    overlay.classList.remove("hidden");
  }
}

function assignBuilders(goblinIds) {
  if (!S.territories.building || !Array.isArray(goblinIds) || goblinIds.length === 0 || goblinIds.length > 3) {
    return false;
  }

  var territory = S.territories.building.territory;
  S.territories.building.builders = goblinIds;

  /* Apply building sequence. */
  var totalHealth = 0;
  goblinIds.forEach(function (gid) {
    var g = S.goblins[gid];
    if (g) {
      g.task = "building " + territory.name;
      g.memory = "We are building " + territory.name + ".";
      totalHealth += (g.preference === territory.zone ? 3 : 1);
      /* Animate goblin toward zone center. */
      animateGoblinToZone(gid, territory.zone, 1500);
    }
  });

  S.world.treeHealth = Math.min(100, S.world.treeHealth + totalHealth);

  /* Add visible object to world representing the new territory. */
  addObject(territory.icon, territory.name, territory.zone);

  /* Trigger completion callback after animation. */
  setTimeout(function () {
    pushReplay("territory", "Territory built", "territory-built",
      goblinIds.join(", ") + " built " + territory.name + ". Tree health +"+totalHealth, territory.id);

    S.territories.owned.push({ id: territory.id, builders: goblinIds, completedAt: Date.now() });
    S.territories.building = null;

    /* Unlock the ability this territory grants — the goblin decides
       on its own tick when to actually use it. */
    if (territory.grantsAbility) {
      var ga = territory.grantsAbility;
      S.npcAbilities[ga.goblin] = S.npcAbilities[ga.goblin] || {};
      S.npcAbilities[ga.goblin][ga.ability] = true;
      var learner = DEFS_BY_ID[ga.goblin];
      pushReplay(ga.goblin, territory.name, "ability-learned",
        "You unlocked " + territory.name + ". " + learner.name + " learned " + ga.label + ".", "");
      showBubble(ga.goblin, "A sign-fixing kit! I have opinions about signs.", 3600);
    }

    saveState();
    renderAll();
    playBuildCompleteSound();
    Sound.glingGling(4); /* jackpot flourish: the Warren just grew */
  }, 1600);

  var overlay = document.getElementById("territory-build");
  if (overlay) overlay.classList.add("hidden");
  return true;
}

function animateGoblinToZone(goblinId, zoneId, duration) {
  var g = S.goblins[goblinId];
  if (!g) return;

  var zoneCenter = getZoneCenterCoord(zoneId);
  if (!zoneCenter) return;

  var startX = g.x;
  var startY = g.y;
  var startTime = Date.now();

  var animFrame = setInterval(function () {
    var elapsed = Date.now() - startTime;
    var progress = Math.min(1, elapsed / duration);

    g.x = startX + (zoneCenter.x - startX) * progress;
    g.y = startY + (zoneCenter.y - startY) * progress;

    if (progress >= 1) {
      clearInterval(animFrame);
      g.x = zoneCenter.x;
      g.y = zoneCenter.y;
    }
  }, 16); /* ~60fps */
}

function getZoneCenterCoord(zoneId) {
  /* Builders walk to the real zone glyph (slightly below, where goblins stand). */
  var z = zoneById(zoneId);
  return { x: z.x, y: Math.min(94, z.y + 10) };
}

function playBuildCompleteSound() {
  /* Play a brief "success bloom" sound using Web Audio. */
  try {
    if (!audioContext) return;
    var now = audioContext.currentTime;
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.setValueAtTime(523.25, now);          /* C5 */
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.4); /* Up octave */
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {}
}

function getAvailableTerritories() {
  return TERRITORY_DEFS.filter(function (t) { return !S.territories.owned.some(function (o) { return o.id === t.id; }); });
}

/* ---------------------------------------------------------------------
   TEXT HELPERS
--------------------------------------------------------------------- */

function lastObjectName() {
  if (!S.objects.length) return "the empty spot by the gate";
  var o = S.objects[S.objects.length - 1];
  return o.sign || o.emoji;
}
function lastEventText() {
  if (!S.replay.length) return "the Warren was quiet";
  return S.replay[S.replay.length - 1].visibleChange;
}
function fillTemplate(tpl) {
  var t = tpl
    .replace("{event}", lastEventText())
    .replace("{object}", lastObjectName())
    .replace("{zone}", zoneName(pick(ZONES).id))
    .replace("{name}", pick(GOBLIN_DEFS).name);
  if (t.length > 90) t = t.slice(0, 89) + "…";
  return t;
}

/* Visible props (Gerald's apartment, shrines, mushrooms…) live on S.objects
   so they persist through save/load along with the rest of shared state. */

/* ---------------------------------------------------------------------
   UTILITY AI
--------------------------------------------------------------------- */

function scoreZone(g, zoneId) {
  var need = rand(0, 3);
  var affinity = zoneId === g.preference ? 4 : 0;
  var sig = S.world.currentSignal;
  var nearbySignal = (sig && sig.zone === zoneId) ? 5 : 0;
  var memoryBias = g.memory && g.memory.indexOf(zoneName(zoneId)) !== -1 ? 2 : 0;
  var fatigueCost = g.fatigue / 25;
  var zoneAversion = zoneId === g.aversion ? 4 : 0;
  return need + affinity + nearbySignal + memoryBias - fatigueCost - zoneAversion;
}

function pickTargetZone(g) {
  var best = ZONES[0].id, bestScore = -Infinity;
  ZONES.forEach(function (z) {
    if (!zoneUnlocked(z.id)) return; // nobody wanders into a locked zone
    var sc = scoreZone(g, z.id);
    if (sc > bestScore) { bestScore = sc; best = z.id; }
  });
  return best;
}

function taskForZone(g, zoneId) {
  if (zoneId === g.preference && DEFS_BY_ID[g.id]) return DEFS_BY_ID[g.id].homeTask;
  return "wandering";
}

function moveGoblinToZone(g, zoneId) {
  var spot = zoneStandSpot(zoneId);
  var newX = spot.x, newY = spot.y;
  g.facing = newX < g.x ? "left" : "right";
  g.targetX = newX; g.targetY = newY;
  g.x = newX; g.y = newY;
  g.zone = zoneId;
  g.task = taskForZone(g, zoneId);
}

var goblinTimers = {};
function scheduleGoblinTick(id, delay) {
  clearTimeout(goblinTimers[id]);
  goblinTimers[id] = setTimeout(function () { tickGoblin(id); }, delay);
}

function tickGoblin(id) {
  var g = S.goblins[id];
  if (!g) return;

  /* Territory abilities: Pip chooses to clarify the vague sign herself
     when the world state calls for it — no player click involved. */
  if (id === "pip" && pipCanClarify()) {
    pipClarifySign();
    scheduleGoblinTick(id, randi(9000, 14000));
    return;
  }

  if (g.resting) {
    g.fatigue = clamp(g.fatigue - 10, 0, 100);
    g.task = "resting";
    if (g.fatigue < 15) { g.resting = false; g.intention = "stretching, ready to wander again"; }
    else { g.intention = "resting near " + zoneName(g.zone); }
  } else {
    g.fatigue = clamp(g.fatigue + randi(3, 9), 0, 100);
    if (g.fatigue >= 72 && Math.random() < 0.55) {
      g.resting = true;
      g.task = "resting";
      g.intention = "resting near " + zoneName(g.zone);
    } else {
      var target = pickTargetZone(g);
      moveGoblinToZone(g, target);
      g.intention = "wandering to " + zoneName(target);
      if (target === g.aversion) g.mood = "uneasy";
      else if (target === g.preference) g.mood = "content";
    }
  }

  if (id === "pip" && S.worldSigns.westPath.clarified && Math.random() < 0.1) {
    showBubble(id, pipRecallLine(), 4200);
  } else if (Math.random() < 0.32) {
    showBubble(id, fillTemplate(pick(DIALOGUE_TEMPLATES)));
  }

  saveState();
  renderGoblins();
  renderTopbar();
  scheduleGoblinTick(id, randi(6500, 11500));
}

/* ---------------------------------------------------------------------
   SIGNAL + PROPOSAL LOOP
--------------------------------------------------------------------- */

function pickSignalType() {
  var avgFatigue = 0, k, n = 0;
  for (k in S.goblins) { avgFatigue += S.goblins[k].fatigue; n++; }
  avgFatigue = avgFatigue / n;
  var weights = {
    bug: 1 + S.world.bugPressure / 25,
    intrusion: 1 + S.world.gardenToxicity / 25,
    fatigue: 1 + avgFatigue / 20,
    mystery: 1,
    novelty: 1,
    wonder: 1 + (100 - S.world.treeHealth) / 30
  };
  var total = 0;
  for (k in weights) total += weights[k];
  var r = rand(0, total);
  for (k in weights) { r -= weights[k]; if (r <= 0) return k; }
  return "wonder";
}

function signalZoneFor(type) {
  if (SIGNAL_ZONE_STATIC[type]) return SIGNAL_ZONE_STATIC[type];
  if (type === "fatigue") return mostTiredGoblin().zone;
  return pick(ZONES.filter(function (z) { return z.id !== "tree" && zoneUnlocked(z.id); })).id;
}
function signalSourceGoblin(type) {
  var map = { bug: "nib", intrusion: "zaz", mystery: "pip", novelty: "lulu" };
  if (map[type]) return map[type];
  if (type === "fatigue") return mostTiredGoblin().id;
  return null; // wonder: sourced by the Tree itself, not a goblin
}

function createSignal(type) {
  var meta = SIGNAL_META[type] || SIGNAL_META.wonder;
  var name = mostTiredGoblin().name;
  var signal = {
    id: uid("sig"), type: type, title: meta.title,
    description: meta.desc.replace("{name}", name),
    zone: signalZoneFor(type), intensity: randi(1, 3),
    createdAt: Date.now(), sourceGoblinId: signalSourceGoblin(type)
  };
  S.world.currentSignal = signal;
  if (!S.flags.firstSignalSeen) S.flags.firstSignalSeen = true;
  updateSignalFlavor(type);
  saveState();
  return signal;
}

function createGeraldQuestProposal(signal) {
  /* Goblin Telephone quest: show prompt mutation through Lulu → Pip → Nib. */
  S.learning.geraldQuest.stage = "T5A_TELEPHONE";

  var mode = chooseLuluMode(signal.type);
  S.lulu.previousMode = S.lulu.mode;
  S.lulu.mode = mode;

  S.activeProposal = {
    id: uid("prop"), signalId: signal.id, proposerId: "lulu", luluMode: mode,
    text: "", /* Gerald quest uses custom rendering */
    choices: ["try", "hold", "compost"],
    isGeraldQuest: true,
    consequences: { hint: "A test of prompt precision" }
  };
  saveState();
  Sound.chirp();
  renderTopbar();
  renderSheetGeraldTelephone();
}

function renderSheetGeraldTelephone() {
  /* Hide other sheets and show the Goblin Telephone mutation chain. */
  document.getElementById("sheet-idle").classList.add("hidden");
  document.getElementById("sheet-goblin").classList.add("hidden");
  document.getElementById("sheet-quiz").classList.add("hidden");
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  document.getElementById("sheet-zol-shop").classList.add("hidden");

  var sheet = document.getElementById("sheet-proposal");
  if (!sheet) return;
  sheet.classList.remove("hidden");

  var modeId = S.activeProposal.luluMode || "bouffon-tendre";
  var mode = modeById(modeId);
  document.getElementById("proposal-mode-icon").textContent = mode.icon;
  document.getElementById("proposal-mode-name").textContent = "Goblin Telephone";

  var textContainer = document.getElementById("proposal-text");
  if (textContainer) {
    textContainer.innerHTML =
      "<strong>The prompt travels through the Warren:</strong><br/>" +
      "<div style=\"margin: 12px 0; font-size: 0.9em;\">" +
      "<div style=\"margin: 8px 0;\"><span style=\"color: #9be8c5;\">Lulu:</span> \"" + GERALD_QUEST.mutations.luluMutation + "\"</div>" +
      "<div style=\"margin: 8px 0;\"><span style=\"color: #8bb26b;\">Pip:</span> \"" + GERALD_QUEST.mutations.pipMutation + "\"</div>" +
      "<div style=\"margin: 8px 0;\"><span style=\"color: #a9c98a;\">Nib:</span> \"" + GERALD_QUEST.mutations.nibMutation + "\"</div>" +
      "</div>" +
      "<strong>Better prompt:</strong><br/>" +
      "<div style=\"margin: 8px 0; font-size: 0.9em; color: #6ee7a0;\">" +
      GERALD_QUEST.betterPrompt +
      "</div>";
  }
}

function createProposalFromSignal(signal, forcedText) {
  /* Check if Gerald quest is available (unlocked, not started, and no forced text). */
  if (!forcedText && signal.type === "bug" && S.learning.geraldQuest && S.learning.geraldQuest.stage === "AVAILABLE") {
    return createGeraldQuestProposal(signal);
  }

  var mode = chooseLuluMode(signal.type);
  S.lulu.previousMode = S.lulu.mode;
  S.lulu.mode = mode;
  var text = forcedText || pick(PROPOSALS[signal.type] || PROPOSALS.wonder);
  S.activeProposal = {
    id: uid("prop"), signalId: signal.id, proposerId: "lulu", luluMode: mode,
    text: text, choices: ["try", "hold", "compost"],
    consequences: { hint: "changes " + zoneName(signal.zone) + " and someone's mood" }
  };
  saveState();
  Sound.chirp();
  renderTopbar();
  renderSheetProposal();
}

function updateSignalFlavor(type) {
  var el = document.getElementById("signal-text");
  var map = {
    bug: "a bug is loose", fatigue: "someone's worn out", mystery: "something glints",
    intrusion: "the air feels thick", novelty: "a new path appeared", wonder: "the Tree is curious"
  };
  if (el) el.textContent = map[type] || "stirring";
}

var mainSignalTimer = null;
function scheduleNextSignal(delayMs) {
  clearTimeout(mainSignalTimer);
  mainSignalTimer = setTimeout(fireAmbientSignal, delayMs);
}
function fireAmbientSignal() {
  if (S.activeProposal) { scheduleNextSignal(randi(20000, 40000)); return; }
  var type = pickSignalType();
  var signal = createSignal(type);
  createProposalFromSignal(signal);
}

/* ---------------------------------------------------------------------
   RESOLUTION (TRY / HOLD / COMPOST)
--------------------------------------------------------------------- */

function resolveGeraldT5aProposal(choice) {
  /* Resolve Gerald quest T5a: Goblin Telephone choice. */
  if (!S.activeProposal || !S.learning.geraldQuest) return;

  var outcome = GERALD_QUEST.outcomes[choice] || GERALD_QUEST.outcomes.try;
  S.learning.geraldQuest.t5aChoice = choice;
  S.learning.geraldQuest.stage = "T5A_RESOLVED";

  /* Apply world changes and mood effects. */
  S.world.treeHealth = Math.min(100, S.world.treeHealth + outcome.worldChange);
  S.goblins.zaz.mood = choice === "try" ? "delighted" : (choice === "hold" ? "attentive" : "settled");
  S.goblins.pip.mood = choice === "hold" ? "attentive" : (choice === "try" ? "pleased" : "calm");

  /* Log the quest resolution. */
  var replayText = "Lulu proposed building Gerald a bridge. The prompt mutated through the Warren. " +
    "You chose " + choice.toUpperCase() + ". " + outcome.action;
  pushReplay("lulu", "Gerald quest T5a", choice, replayText, outcome.memory);

  /* Clear proposal and advance. */
  S.activeProposal = null;
  S.world.currentSignal = null;
  S.flags.firstProposalResolved = true;

  /* Play audio and update display. */
  Sound.proposalAccepted();
  renderSheetIdle();
  var el = document.getElementById("signal-text");
  if (el) el.textContent = "quiet";

  saveState();
  renderAll();

  /* The hearing convenes once the dust settles. */
  clearTimeout(councilTimer);
  councilTimer = setTimeout(maybeStartCouncil, 25000);
  return;
}

function goblinForSignal(type) {
  var map = { bug: "nib", intrusion: "zaz", mystery: "pip", wonder: "lulu", fatigue: null, novelty: "lulu" };
  if (type === "fatigue") return mostTiredGoblin();
  return S.goblins[map[type] || "lulu"];
}

function mostTiredGoblin() {
  var best = null;
  Object.keys(S.goblins).forEach(function (k) { if (!best || S.goblins[k].fatigue > best.fatigue) best = S.goblins[k]; });
  return best;
}

/* COLLISION_AWARE_LABEL_LAYOUT_V1 — world objects take orbit slots ABOVE
   their zone glyph (an arc, like fruit in a canopy), never the space below
   where the zone label and the goblins live. Cosmetic only: positions carry
   no game meaning and old saves are re-laid-out on boot. */
var OBJ_SLOTS = [
  { dx: -12, dy: -9 }, { dx: 12, dy: -9 },
  { dx: 0, dy: -15 },
  { dx: -20, dy: -13 }, { dx: 20, dy: -13 },
  { dx: -8, dy: -20 }, { dx: 8, dy: -20 },
  { dx: 0, dy: -26 }
];
function objectSpot(zoneId, index) {
  var z = zoneById(zoneId);
  var s = OBJ_SLOTS[index % OBJ_SLOTS.length];
  return { x: clamp(z.x + s.dx + rand(-1.5, 1.5), 6, 94), y: clamp(z.y + s.dy + rand(-1, 1), 5, 94) };
}
function addObject(emoji, sign, zoneId) {
  var n = 0;
  S.objects.forEach(function (o) { if (o.zone === zoneId) n++; });
  var spot = objectSpot(zoneId, n);
  S.objects.push({ id: uid("o"), emoji: emoji, sign: sign, x: spot.x, y: spot.y, zone: zoneId });
  if (S.objects.length > 8) S.objects.shift();
}
function layoutObjects() { // migrate saves made before slot layout (cosmetic)
  var counts = {};
  S.objects.forEach(function (o) {
    var n = counts[o.zone] || 0; counts[o.zone] = n + 1;
    var spot = objectSpot(o.zone, n);
    o.x = spot.x; o.y = spot.y;
  });
}

function resolveProposal(choice) {
  if (!S.activeProposal) return;
  var proposal = S.activeProposal;

  /* Handle Gerald quest T5a proposal separately. */
  if (proposal.isGeraldQuest && S.learning.geraldQuest.stage === "T5A_TELEPHONE") {
    return resolveGeraldT5aProposal(choice);
  }

  var signal = S.world.currentSignal;
  var type = signal ? signal.type : "wonder";
  var isFirstEverBugArc = (type === "bug" && !S.flags.firstProposalResolved && !S.flags.secondEventReferencedFirst);
  var g = goblinForSignal(type);
  var change = "", memoryLine = "";

  if (choice === "try") {
    S.world.warmth = clamp(S.world.warmth + 4, 0, 100);
    S.world.treeHealth = clamp(S.world.treeHealth + 2, 0, 100);
    if (type === "bug") {
      addObject("🐛", "Gerald's Apartment", "nursery");
      S.world.bugPressure = clamp(S.world.bugPressure - 20, 0, 100);
      change = "Gerald got a tiny apartment."; memoryLine = "we named the bug Gerald and it stayed.";
      g.mood = "delighted";
    } else if (type === "intrusion") {
      addObject("⛩️", "The Shrine", "gate");
      S.world.gardenToxicity = clamp(S.world.gardenToxicity - 15, 0, 100);
      change = "the broken sign became a shrine."; memoryLine = "the broken sign became a shrine.";
      g.mood = "steadied";
    } else if (type === "mystery") {
      addObject("✨", "Someone's Shiny Thing", "garden");
      change = "the shiny thing found a tired new owner."; memoryLine = "I was given the shiny thing.";
      g.mood = "touched";
    } else if (type === "fatigue") {
      var tired = g;
      tired.fatigue = clamp(tired.fatigue - 40, 0, 100);
      change = tired.name + " got a tiny holiday."; memoryLine = "the Warren gave me a tiny holiday.";
      tired.mood = "rested"; tired.task = "resting";
    } else if (type === "novelty") {
      addObject("🧭", "The New Path", "gate");
      change = "the new path led somewhere real."; memoryLine = "I followed the new path.";
      g.mood = "thrilled";
    } else {
      change = "the tired goblin got a tiny holiday.";
      var t2 = mostTiredGoblin(); t2.fatigue = clamp(t2.fatigue - 40, 0, 100); t2.mood = "rested";
      memoryLine = "the Tree gave me a tiny holiday.";
    }
    Sound.proposalAccepted();
    g.memory = memoryLine;
  } else if (choice === "hold") {
    S.world.bugPressure = clamp(S.world.bugPressure + 4, 0, 100);
    if (type === "bug") {
      addObject("🏺", "Observation Jar", "forge");
      change = "the bug went into an observation jar.";
      S.goblins.pip.mood = "attentive"; S.goblins.pip.memory = "I'm watching the jar. Something is in it.";
      S.goblins.pip.task = "watching"; S.goblins.pip.intention = "watching the observation jar";
      memoryLine = S.goblins.pip.memory;
    } else {
      change = "it was set aside, held for later.";
      g.mood = "watchful"; memoryLine = "we're holding this one for now."; g.memory = memoryLine;
    }
    Sound.proposalSubmit();
  } else { // compost
    S.world.soil = clamp(S.world.soil + 8, 0, 100);
    if (type === "bug") {
      addObject("🍄", "A New Mushroom", "garden");
      S.world.bugPressure = clamp(S.world.bugPressure - 28, 0, 100);
      change = "the bug became a mushroom bloom instead.";
      S.goblins.zaz.mood = "delighted"; S.goblins.zaz.memory = "a mushroom grew where the bug was.";
      memoryLine = S.goblins.zaz.memory;
    } else if (type === "intrusion") {
      addObject("🍄", "Compost Bloom", "gate");
      S.world.gardenToxicity = clamp(S.world.gardenToxicity - 25, 0, 100);
      change = "the toxic patch composted into bloom.";
      g.mood = "relieved"; memoryLine = "the bad patch composted away."; g.memory = memoryLine;
    } else {
      change = "it was composted, quietly.";
      g.mood = "settled"; memoryLine = "Lulu said this was compost."; g.memory = memoryLine;
    }
    Sound.proposalDenied();
    setTimeout(Sound.gardenHarmony, 300);
  }

  earn(2, choice === "compost" ? 2 : 0); // every decision feeds the Garden economy
  pushReplay("Lulu", (signal && signal.title) || "A Signal", choice, change, memoryLine);

  proposal.consequences = { resolved: choice, visibleChange: change };
  S.activeProposal = null;
  S.world.currentSignal = null;
  S.flags.firstProposalResolved = true;
  if (!quizOpen) renderSheetIdle(); // clear the spent proposal card
  var el = document.getElementById("signal-text");
  if (el) el.textContent = "quiet";

  if (isFirstEverBugArc) {
    S.flags.geraldFate = choice;
    triggerMemorySeedQuest();
    saveState();
    renderAll();
    var elapsed = Date.now() - S.startedAt;
    var targetWindow = randi(60000, 120000);
    var delay = Math.max(8000, targetWindow - elapsed);
    setTimeout(fireArcFollowUp, delay);
  } else {
    triggerMemorySeedQuest();
    saveState();
    renderAll();
    scheduleNextSignal(randi(20000, 40000));
  }
}

function fireArcFollowUp() {
  if (S.activeProposal) { setTimeout(fireArcFollowUp, 8000); return; }
  var fate = S.flags.geraldFate;
  var text;
  if (fate === "try") text = "Gerald's neighbor wants a tiny apartment too. Build a second one?";
  else if (fate === "hold") text = "The jar's been humming all evening. Something else wants in.";
  else text = "A mushroom cousin sprouted where the compost pile was. Name it too?";
  var signal = createSignal("bug");
  createProposalFromSignal(signal, text);
  S.flags.secondEventReferencedFirst = true;
  saveState();
}

/* ---------------------------------------------------------------------
   FIRST-SESSION SCRIPT (0–10s tree+goblins alive · 10–25s bug escapes ·
   25–40s Gerald proposal · 60–120s a signal references the first choice)
--------------------------------------------------------------------- */

function bootScriptedArc() {
  setTimeout(function () {
    if (S.flags.greeted) return;
    S.flags.greeted = true;
    showBubble("lulu", "You're late. Good. We already started without you.", 4200);
    saveState();
  }, 2200);

  setTimeout(function () {
    if (S.flags.firstSignalSeen) return;
    ambientBugEscape();
  }, 15000);

  setTimeout(function () {
    if (S.activeProposal || S.flags.firstProposalResolved) return;
    var signal = S.world.currentSignal && S.world.currentSignal.type === "bug"
      ? S.world.currentSignal : createSignal("bug");
    createProposalFromSignal(signal, "Name the bug Gerald and give it a tiny apartment.");
  }, randi(25000, 40000));
}

function ambientBugEscape() {
  createSignal("bug");
  S.world.bugPressure = clamp(S.world.bugPressure + 20, 0, 100);
  var world = document.getElementById("world");
  if (!world) return;
  var nursery = zoneById("nursery");
  var critter = document.createElement("div");
  critter.className = "bug-critter";
  critter.textContent = "🐞";
  critter.style.left = nursery.x + "%";
  critter.style.top = nursery.y + "%";
  world.appendChild(critter);
  requestAnimationFrame(function () {
    critter.style.left = jitter(nursery.x, 22) + "%";
    critter.style.top = jitter(nursery.y, 22) + "%";
  });
  showBubble("zaz", "Something just skittered past!", 2600);
  showBubble("nib", "Ooh, unresolved. I like it.", 2600);
  setTimeout(function () { if (critter.parentNode) critter.parentNode.removeChild(critter); }, 4200);
  saveState();
}

function resumeAfterReload() {
  if (!S.flags.greeted) { bootScriptedArc(); return; }
  if (!S.flags.firstSignalSeen) {
    setTimeout(ambientBugEscape, 3000);
    setTimeout(function () {
      if (!S.activeProposal && !S.flags.firstProposalResolved) {
        var signal = S.world.currentSignal || createSignal("bug");
        createProposalFromSignal(signal, "Name the bug Gerald and give it a tiny apartment.");
      }
    }, randi(9000, 16000));
    return;
  }
  if (!S.flags.firstProposalResolved) {
    if (S.activeProposal) return; // already showing; UI handles it
    setTimeout(function () {
      var signal = S.world.currentSignal || createSignal("bug");
      createProposalFromSignal(signal, "Name the bug Gerald and give it a tiny apartment.");
    }, 3000);
    return;
  }
  if (!S.flags.secondEventReferencedFirst) {
    if (S.activeProposal) return;
    setTimeout(fireArcFollowUp, 5000);
    return;
  }
  // arc fully complete: resume ambient loop
  if (S.activeProposal) return;
  scheduleNextSignal(randi(6000, 14000));
}

/* ---------------------------------------------------------------------
   RENDER
--------------------------------------------------------------------- */

var goblinEls = {};
var objectEls = {};
var bubbleTimers = {};

function buildGoblinEl(d) {
  var world = document.getElementById("world");
  var el = document.createElement("div");
  el.className = "goblin";
  el.id = "goblin-" + d.id;
  el.style.setProperty("--gob-color", d.color);
  el.innerHTML =
    '<div class="g-tapring"></div>' +
    '<div class="g-body"><div class="g-ear l"></div><div class="g-ear r"></div></div>' +
    '<div class="g-nametag">' + d.name + '</div>' +
    '<div class="g-nametag g-task" id="task-' + d.id + '"></div>';
  el.addEventListener("click", function () { onTapGoblin(d.id); });
  world.appendChild(el);
  goblinEls[d.id] = el;
  return el;
}

function updateZoneLocks() {
  ZONES.forEach(function (z) {
    var el = document.getElementById("zone-" + z.id);
    if (el) el.classList.toggle("locked", !zoneUnlocked(z.id));
  });
}

function buildStaticWorld() {
  var world = document.getElementById("world");
  ZONES.forEach(function (z) {
    var el = document.createElement("div");
    el.className = "zone";
    el.id = "zone-" + z.id;
    el.style.left = z.x + "%";
    el.style.top = z.y + "%";
    el.style.setProperty("--zone-color", z.color);
    el.innerHTML = '<div class="zone-ring"></div><div class="zone-glyph">' + z.icon + '</div>' +
      '<div class="zone-lock">🔒</div>' +
      '<div class="zone-label">' + z.name + '</div>';
    world.appendChild(el);
  });
  updateZoneLocks();
  var objLayer = document.createElement("div");
  objLayer.id = "objects-layer";
  world.appendChild(objLayer);

  buildTemple();
  buildFireflies();
  GOBLIN_DEFS.forEach(function (d) { buildGoblinEl(d); });
}

function buildFireflies() {
  var world = document.getElementById("world");
  if (!world) return;
  for (var i = 0; i < 7; i++) {
    var f = document.createElement("div");
    f.className = "firefly" + (i % 3 === 0 ? " violet" : "");
    f.style.left = randi(8, 92) + "%";
    f.style.top = randi(20, 88) + "%";
    f.style.setProperty("--fly-dur", randi(9, 16) + "s");
    f.style.setProperty("--fly-delay", (i * 1.3).toFixed(1) + "s");
    f.style.setProperty("--fly-x1", randi(-40, 40) + "px");
    f.style.setProperty("--fly-y1", randi(-36, -10) + "px");
    f.style.setProperty("--fly-x2", randi(-30, 30) + "px");
    f.style.setProperty("--fly-y2", randi(-8, 20) + "px");
    world.appendChild(f);
  }
}

function renderGoblins() {
  Object.keys(S.goblins).forEach(function (id) {
    var g = S.goblins[id];
    var el = goblinEls[id];
    if (!el) return;
    el.style.left = g.x + "%";
    el.style.top = g.y + "%";
    el.classList.toggle("facing-left", g.facing === "left");
    el.classList.toggle("resting", !!g.resting);
    var taskEl = document.getElementById("task-" + id);
    if (taskEl) taskEl.textContent = g.task;
  });
}

function renderObjects() {
  var layer = document.getElementById("objects-layer");
  if (!layer) return;
  var seen = {};
  S.objects.forEach(function (o) {
    seen[o.id] = true;
    var el = objectEls[o.id];
    if (!el) {
      el = document.createElement("div");
      el.className = "wobject";
      el.innerHTML = '<div class="wobj-emoji">' + o.emoji + '</div><div class="wobj-sign">' + o.sign + '</div>';
      layer.appendChild(el);
      objectEls[o.id] = el;
    }
    el.style.left = o.x + "%";
    el.style.top = o.y + "%";
  });
  Object.keys(objectEls).forEach(function (id) { if (!seen[id]) { objectEls[id].remove(); delete objectEls[id]; } });
  renderWorldSigns(layer);
}

var worldSignEls = {};
function renderWorldSigns(layer) {
  if (!layer || !S.worldSigns) return;
  Object.keys(S.worldSigns).forEach(function (key) {
    var ws = S.worldSigns[key];
    var el = worldSignEls[key];
    if (!el) {
      el = document.createElement("div");
      el.className = "wobject worldsign";
      layer.appendChild(el);
      worldSignEls[key] = el;
    }
    el.innerHTML = '<div class="wobj-emoji">🪧</div><div class="wobj-sign">' + ws.text + '</div>';
    el.style.left = SIGN_SPOT.x + "%";
    el.style.top = SIGN_SPOT.y + "%";
    el.style.opacity = ws.clarified ? "1" : "0.8";
    el.style.filter = ws.clarified ? "drop-shadow(0 0 8px rgba(155,227,109,.5))" : "";
  });
}

function showBubble(goblinId, text, duration) {
  var host = goblinEls[goblinId];
  if (!host) return;
  if (text.length > 90) text = text.slice(0, 89) + "…";
  var old = host.querySelector(".bubble");
  if (old) old.remove();
  var g = S.goblins[goblinId];
  var b = document.createElement("div");
  var edge = g && g.x < 16 ? "edge-left" : (g && g.x > 84 ? "edge-right" : "");
  b.className = "bubble" + (edge ? " " + edge : "");
  b.textContent = text;
  host.appendChild(b);
  clearTimeout(bubbleTimers[goblinId]);
  bubbleTimers[goblinId] = setTimeout(function () { if (b.parentNode) b.remove(); }, duration || 3200);
}

function renderTopbar() {
  var treeText = document.getElementById("tree-text");
  var glyph = document.getElementById("tree-glyph");
  var msg = "The Tree is watching.";
  if (S.activeProposal) msg = "The Tree feels something stirring.";
  else if (S.world.treeHealth < 45) msg = "The Tree is holding its breath.";
  else if (S.world.gardenToxicity > 55) msg = "The Tree is holding its breath.";
  if (treeText) treeText.textContent = msg;
  if (glyph) glyph.style.filter = S.activeProposal ? "drop-shadow(0 0 14px #ffdca0)" : "";

  var muteBtn = document.getElementById("mute-btn");
  if (muteBtn) muteBtn.textContent = S.settings.muted ? "🔇" : "🔊";

  var cur = document.getElementById("currency");
  if (cur) cur.textContent = "✨" + S.progress.glowOrbs + " 🔮" + S.progress.magicSap;

  var zolBtn = document.getElementById("zol-wallet");
  if (zolBtn && !zolCounting) zolBtn.textContent = "🪙" + S.learning.zolBalance;
}

/* ---------------------------------------------------------------------
   ZOL CELEBRATION — goblins like gold. Coins fly to the wallet, the
   wallet pops and counts up like a slot payout, the Warren goes
   gling-gling. Pure cosmetics: state changed before, only shown here.
--------------------------------------------------------------------- */

var zolCounting = false;

function zolCountUp(from, to) {
  var el = document.getElementById("zol-wallet");
  if (!el) return;
  zolCounting = true;
  var start = Date.now(), dur = 700;
  (function tick() {
    var p = Math.min(1, (Date.now() - start) / dur);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = "🪙" + Math.round(from + (to - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
    else { zolCounting = false; el.textContent = "🪙" + to; }
  })();
}

function zolCelebrate(payout, fromX, fromY) {
  var wallet = document.getElementById("zol-wallet");
  if (!wallet) return;
  var wr = wallet.getBoundingClientRect();
  var toX = wr.left + wr.width / 2, toY = wr.top + wr.height / 2;
  var startX = typeof fromX === "number" ? fromX : window.innerWidth / 2;
  var startY = typeof fromY === "number" ? fromY : window.innerHeight * 0.7;

  var coins = Math.min(8, Math.max(3, Math.round(payout / 5)));
  for (var i = 0; i < coins; i++) {
    (function (i) {
      var c = document.createElement("div");
      c.className = "zol-coin";
      c.textContent = "🪙";
      c.style.left = (startX + (Math.random() - 0.5) * 60) + "px";
      c.style.top = (startY + (Math.random() - 0.5) * 40) + "px";
      document.body.appendChild(c);
      setTimeout(function () {
        c.style.left = toX + "px";
        c.style.top = toY + "px";
        c.style.transform = "scale(0.4) rotate(360deg)";
        c.style.opacity = "0.2";
      }, 40 + i * 90);
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 950 + i * 90);
    })(i);
  }

  Sound.glingGling(coins);
  var from = S.learning.zolBalance - payout;
  setTimeout(function () {
    flashClass(wallet, "zol-pop", 900);
    zolCountUp(from, S.learning.zolBalance);
  }, 350);
}

function renderReplayStrip() {
  var strip = document.getElementById("replay-strip");
  if (!strip) return;
  strip.innerHTML = "";
  var items = S.replay.slice(-12);
  if (!items.length) {
    var e = document.createElement("div");
    e.className = "replay-chip";
    e.textContent = "nothing replayed yet";
    strip.appendChild(e);
    return;
  }
  var CHIP_ICONS = { try: "🌱", hold: "⏳", compost: "🍂", boop: "🎉", quiz: "🦋" };
  items.forEach(function (r) {
    var chip = document.createElement("div");
    chip.className = "replay-chip " + r.choice;
    var d = new Date(r.timestamp);
    var hh = ("0" + d.getHours()).slice(-2), mm = ("0" + d.getMinutes()).slice(-2);
    chip.innerHTML = (CHIP_ICONS[r.choice] || "•") + " <b>" + r.choice.toUpperCase() + "</b> " + hh + ":" + mm + " · " + r.visibleChange;
    strip.appendChild(chip);
  });
  strip.scrollLeft = strip.scrollWidth;
}

function renderSheetIdle() {
  var idle = document.getElementById("sheet-idle");
  idle.classList.remove("hidden");
  idle.innerHTML = questsMarkup();
  document.getElementById("sheet-goblin").classList.add("hidden");
  document.getElementById("sheet-proposal").classList.add("hidden");
  document.getElementById("sheet-quiz").classList.add("hidden");
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  document.getElementById("sheet-zol-shop").classList.add("hidden");
}

function renderSheetGoblin(id) {
  var g = S.goblins[id];
  document.getElementById("sheet-idle").classList.add("hidden");
  document.getElementById("sheet-proposal").classList.add("hidden");
  document.getElementById("sheet-quiz").classList.add("hidden");
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  document.getElementById("sheet-zol-shop").classList.add("hidden");
  var sheet = document.getElementById("sheet-goblin");
  sheet.classList.remove("hidden");
  document.getElementById("card-avatar").style.background = g.color;
  document.getElementById("card-name").textContent = g.name + " · " + g.trait;
  document.getElementById("card-role").textContent = g.role + " — " + g.task;
  document.getElementById("card-mood").textContent = g.mood;
  document.getElementById("card-intention").textContent = g.intention;
  document.getElementById("card-memory").textContent = g.memory || "nothing yet — today is still new.";
  document.getElementById("card-thought").textContent = "“" + fillTemplate(pick(STRANGE_THOUGHTS)) + "”";
  var actionText = g.resting ? "finally take that nap" : "sneak toward the " + zoneName(g.preference);
  document.getElementById("card-action").textContent = actionText;
}

function renderSheetProposal() {
  if (quizOpen) return; // the Moth finishes its question first
  if (!S.activeProposal) { renderSheetIdle(); return; }
  document.getElementById("sheet-idle").classList.add("hidden");
  document.getElementById("sheet-goblin").classList.add("hidden");
  document.getElementById("sheet-quiz").classList.add("hidden");
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  document.getElementById("sheet-zol-shop").classList.add("hidden");
  var sheet = document.getElementById("sheet-proposal");
  sheet.classList.remove("hidden");
  var mode = modeById(S.activeProposal.luluMode);
  document.getElementById("proposal-mode-icon").textContent = mode.icon;
  document.getElementById("proposal-mode-name").textContent = mode.name;
  document.getElementById("proposal-text").textContent = mode.voice + " " + S.activeProposal.text;
}

function renderCouncil() {
  if (S.council.stage !== "DEBATE" && S.council.stage !== "UPDATED") return;
  ["sheet-idle", "sheet-goblin", "sheet-proposal", "sheet-quiz", "sheet-oracle", "sheet-zol-shop"].forEach(function (id) {
    var el = document.getElementById(id); if (el) el.classList.add("hidden");
  });
  var sheet = document.getElementById("sheet-council");
  if (!sheet) return;
  sheet.classList.remove("hidden");

  document.getElementById("council-title").textContent = COUNCIL_EPISODE.crisis;
  document.getElementById("council-intro").textContent = COUNCIL_EPISODE.intro;

  /* Typed dialogue lines (opening statements, or the update round after the card). */
  var card = S.council.card ? COUNCIL_EPISODE.cards.find(function (c) { return c.id === S.council.card; }) : null;
  var lines = card ? card.update : COUNCIL_EPISODE.opening;
  var linesEl = document.getElementById("council-lines");
  linesEl.innerHTML = "";
  lines.forEach(function (l) {
    var g = S.goblins[l.speaker];
    var row = document.createElement("div");
    row.className = "council-line" + (l.act === "REFUSE" ? " refuse" : "");
    row.innerHTML = "<b style=\"color:" + (g ? g.color : "#9be8c5") + "\">" + (g ? g.name : l.speaker) + ":</b> " + l.text;
    linesEl.appendChild(row);
  });

  /* Benches: goblins physically stand beside proposals — no percentage bars. */
  var pos = councilPositions();
  var benches = document.getElementById("council-benches");
  benches.innerHTML = "";
  COUNCIL_EPISODE.proposals.concat([{ id: "wall", label: "A WALL(?)", icon: "🧱" }]).forEach(function (p) {
    var standing = Object.keys(pos).filter(function (id) { return pos[id] === p.id; });
    if (p.id === "wall" && !standing.length) return; /* the wall bench appears only while Nib insists */
    var col = document.createElement("div");
    col.className = "council-bench";
    col.innerHTML = "<div class=\"bench-label\">" + p.icon + " " + p.label + "</div>" +
      "<div class=\"bench-goblins\">" + (standing.map(function (id) { return S.goblins[id].name; }).join(" · ") || "—") + "</div>";
    benches.appendChild(col);
  });

  /* Intervention cards — playable exactly once. */
  var cardsEl = document.getElementById("council-cards");
  cardsEl.innerHTML = "";
  if (!S.council.card) {
    COUNCIL_EPISODE.cards.forEach(function (c) {
      var btn = document.createElement("button");
      btn.className = "council-card";
      btn.setAttribute("data-card", c.id);
      btn.innerHTML = "<b>" + c.title + "</b><small>" + c.text + "</small>";
      btn.addEventListener("click", function () { ensureAudio(); resumeAudio(); councilIntervene(c.id); });
      cardsEl.appendChild(btn);
    });
  } else if (card) {
    var note = document.createElement("div");
    note.className = "council-played";
    note.textContent = "You played " + card.title + ". The Warren is deciding…";
    cardsEl.appendChild(note);
  }
}

function renderTerritoryShop() {
  document.getElementById("sheet-idle").classList.add("hidden");
  document.getElementById("sheet-goblin").classList.add("hidden");
  document.getElementById("sheet-proposal").classList.add("hidden");
  document.getElementById("sheet-quiz").classList.add("hidden");
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  var shop = document.getElementById("sheet-zol-shop");
  shop.classList.remove("hidden");

  /* Update ZOL balance display (wallet button included) */
  renderTopbar();
  document.getElementById("zol-balance-amount").textContent = String(S.learning.zolBalance);

  /* Render territory list */
  var territoriesContainer = document.getElementById("zol-territories");
  territoriesContainer.innerHTML = "";

  TERRITORY_DEFS.forEach(function (territory) {
    var isOwned = S.territories.owned.some(function (t) { return t.id === territory.id; });
    var isAffordable = S.learning.zolBalance >= territory.cost && !isOwned && !S.territories.building;

    var item = document.createElement("div");
    item.className = "zol-territory-item";

    var nameDiv = document.createElement("div");
    nameDiv.className = "zol-territory-name";

    var icon = document.createElement("span");
    icon.className = "zol-territory-icon";
    icon.textContent = territory.icon;
    nameDiv.appendChild(icon);

    var nameSpan = document.createElement("span");
    nameSpan.textContent = territory.name;
    nameDiv.appendChild(nameSpan);

    var costDiv = document.createElement("div");
    costDiv.className = "zol-territory-cost";
    costDiv.textContent = territory.cost + " 🪙";

    if (isOwned) {
      var ownedBadge = document.createElement("div");
      ownedBadge.className = "zol-territory-owned";
      ownedBadge.textContent = "Owned";
      item.appendChild(nameDiv);
      item.appendChild(ownedBadge);
    } else {
      var btn = document.createElement("button");
      btn.className = "zol-buy-btn";
      btn.textContent = "BUY";
      btn.disabled = !isAffordable;
      btn.setAttribute("data-territory", territory.id);
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (purchaseTerritory(territory.id)) {
          renderTerritoryShop();
        }
      });

      var costAndBtn = document.createElement("div");
      costAndBtn.style.display = "flex";
      costAndBtn.style.flexDirection = "column";
      costAndBtn.style.gap = "8px";
      costAndBtn.style.alignItems = "flex-end";
      costAndBtn.appendChild(costDiv);
      costAndBtn.appendChild(btn);

      item.appendChild(nameDiv);
      item.appendChild(costAndBtn);
    }

    territoriesContainer.appendChild(item);
  });
}

function renderAll() {
  renderTopbar();
  renderGoblins();
  renderObjects();
  renderReplayStrip();
  if (S.activeProposal) renderSheetProposal();
}

/* ---------------------------------------------------------------------
   GOBLIN BOOP CHAIN — boop changes mood · boop changes animation ·
   boop may create Garden events · boop never changes Kernel truth
--------------------------------------------------------------------- */

var BOOP_WINDOW = 6000;
var boopHistory = [];        // { id, at } — short combo memory, last 4 taps
var lastBoopAt = {};
var lastDanceAt = 0, lastPartyAt = 0;

var BOOP_LINES = {
  lulu: ["Hee!", "Do it again.", "I felt that in my ears.", "Boop received. Emotionally."],
  pip:  ["Careful — I'm fragile paperwork.", "Filed under: rude.", "My hat! Almost.", "Noted. Twice."],
  nib:  ["Sparks!", "Again! For science.", "That rattled a bolt loose.", "Ooh, percussive."],
  zaz:  ["Mmh. Leaf thoughts.", "Five more minutes.", "The soil felt that too.", "Gently — I'm blooming."],
  tink: ["Mind the gears!", "I was calibrating that.", "Boop absorbed. Efficiency +1.", "Ooh — new input."]
};
var BOOP_DROPS = { lulu: "🍄", pip: "📜", nib: "🔩", zaz: "🌱", tink: "🔧" };

function dropParticle(g, emoji, fly) {
  var world = document.getElementById("world");
  if (!world || !g) return;
  var p = document.createElement("div");
  p.className = "particle" + (fly ? " fly" : "");
  p.textContent = emoji;
  p.style.left = g.x + "%";
  p.style.top = (g.y - 4) + "%";
  world.appendChild(p);
  setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 2400);
}

function flashClass(el, cls, ms) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(function () { el.classList.remove(cls); }, ms);
}

function appBounce() { flashClass(document.getElementById("app"), "bounce", 380); }

function rareReaction(id) {
  var g = S.goblins[id], el = goblinEls[id];
  if (id === "lulu") {
    showBubble(id, "…hee hee HEE—");
    dropParticle(g, "💚", true); setTimeout(function () { dropParticle(g, "💚", true); }, 180);
  } else if (id === "pip") {
    showBubble(id, "MY HAT—");
    dropParticle(g, "🎩", true);
  } else if (id === "nib") {
    showBubble(id, "A stowaway!");
    dropParticle(g, "🐞");
  } else if (id === "tink") {
    showBubble(id, "It's ALIVE. Well. It wiggles.");
    dropParticle(g, "⚙️", true);
  } else {
    showBubble(id, "zzz… standing… zzz");
    flashClass(el, "boop-sleep", 3000);
    Sound.treeHum();
  }
}

function boopBack(id) {
  var el = goblinEls[id];
  flashClass(el, "reaching", 900);
  showBubble(id, "Your turn.", 2200);
  setTimeout(appBounce, 350);
  Sound.sparkle();
}

function checkWarrenDance() {
  if (boopHistory.length < 3) return false;
  var last3 = boopHistory.slice(-3).map(function (b) { return b.id; });
  if (last3[0] === last3[1] || last3[1] === last3[2] || last3[0] === last3[2]) return false;
  if (Date.now() - lastDanceAt < 20000) return false;
  lastDanceAt = Date.now();
  Object.keys(goblinEls).forEach(function (k) { flashClass(goblinEls[k], "dancing", 2200); });
  Sound.dance();
  showBubble(pick(GOBLIN_DEFS).id, "WARREN DANCE!", 2200);
  pushReplay("The Warren", "Goblin Boop Chain", "boop", "the Warren danced. Nobody knows why.", "");
  renderReplayStrip();
  return true;
}

function checkTreeParty() {
  if (boopHistory.length < 4) return false;
  var last4 = boopHistory.slice(-4).map(function (b) { return b.id; }).join(",");
  if (last4 !== "lulu,pip,nib,zaz") return false;
  if (Date.now() - lastPartyAt < 60000) return false;
  lastPartyAt = Date.now();
  boopHistory = [];
  S.flags.treePartySeen = true;
  S.world.warmth = clamp(S.world.warmth + 6, 0, 100);
  S.world.treeHealth = clamp(S.world.treeHealth + 4, 0, 100);
  addObject("🍋", "A Ridiculous Golden Fruit", "tree");
  flashClass(document.getElementById("zone-tree"), "party", 4000);
  Object.keys(goblinEls).forEach(function (k) { flashClass(goblinEls[k], "dancing", 3000); });
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "delighted"; });
  Sound.party();
  appBounce();
  showBubble("lulu", "TREE PARTY!", 2600);
  earn(5, 0);
  pushReplay("The Tree", "Goblin Boop Chain", "boop", "the Tree grew a ridiculous golden fruit.", "");
  renderObjects();
  renderReplayStrip();
  scheduleMoth(8000); // the Moth always comes to look at the fruit
  return true;
}

var everBooped = false;
function doBoop(id) {
  var now = Date.now();
  everBooped = true;
  if (lastBoopAt[id] && now - lastBoopAt[id] < 350) return;
  lastBoopAt[id] = now;
  var g = S.goblins[id], el = goblinEls[id];
  if (!g) return;
  S.flags.boops = (S.flags.boops || 0) + 1;
  g.mood = "giggly";
  flashClass(el, "booped", 600);
  Sound.squeak(id);

  if (boopHistory.length && now - boopHistory[boopHistory.length - 1].at > BOOP_WINDOW) boopHistory = [];
  boopHistory.push({ id: id, at: now });
  if (boopHistory.length > 4) boopHistory.shift();

  if (checkTreeParty()) { saveState(); return; }
  var danced = checkWarrenDance();

  var roll = Math.random();
  if (!danced) {
    if (roll < 0.06) boopBack(id);
    else if (roll < 0.18) rareReaction(id);
    else {
      showBubble(id, pick(BOOP_LINES[id] || BOOP_LINES.lulu));
      if (Math.random() < 0.3) dropParticle(g, BOOP_DROPS[id] || "🍃");
    }
  }
  if (Math.random() < 0.1) earn(1, 0); // boops occasionally shake loose a glow orb
  saveState();
}

/* ---------------------------------------------------------------------
   WARREN PROGRESSION — Glow Orbs & Magic Sap are GARDEN currencies:
   they buy nothing sovereign, they open play spaces. Level 2 wakes the
   High Spire and Tink the Tinkerer. Nothing here touches Kernel truth.
--------------------------------------------------------------------- */

function earn(orbs, sap) {
  S.progress.glowOrbs = clamp(S.progress.glowOrbs + orbs, 0, 9999);
  S.progress.magicSap = clamp(S.progress.magicSap + sap, 0, 9999);
  checkUnlocks();
  renderTopbar();
  renderQuests();
}

function checkUnlocks() {
  if (!S.progress.spireUnlocked && S.progress.magicSap >= 10) unlockSpire();
}

function unlockSpire() {
  S.progress.spireUnlocked = true;
  S.progress.tinkUnlocked = true;
  S.progress.level = 2;
  ensureTink();
  updateZoneLocks();
  Sound.spireUnlock();
  setTimeout(Sound.party, 700);
  appBounce();
  showBubble("lulu", "The High Spire woke up!", 3200);
  setTimeout(function () { if (S.goblins.tink) showBubble("tink", "Heard there was a tower. I brought tools.", 3600); }, 1600);
  pushReplay("The Warren", "Warren Level 2", "boop", "the High Spire woke up. Tink moved in.", "");
  renderReplayStrip();
  scheduleCrown(randi(15000, 30000)); // something gaudy has noticed the empty throne…
  saveState();
}

function ensureTink() {
  if (!S.goblins.tink) S.goblins.tink = makeGoblin(TINK_DEF);
  if (!goblinEls.tink) buildGoblinEl(TINK_DEF);
  renderGoblins();
  scheduleGoblinTick("tink", 1600);
}

/* Quests — read-only views over progress; completing them crowns nothing. */
function questList() {
  return [
    { icon: "👹", label: "Unmask Raâm", cur: Math.min(S.progress.raamDefeats, 1), max: 1,
      done: S.progress.raamDefeats >= 1 },
    { icon: "🔮", label: "Collect 10 Magic Sap", cur: Math.min(S.progress.magicSap, 10), max: 10,
      done: S.progress.spireUnlocked },
    { icon: "👑", label: "Compost the False Crown", cur: Math.min(S.progress.crownDefeats, 1), max: 1,
      done: S.progress.crownDefeats >= 1, hidden: !S.progress.spireUnlocked },
    { icon: "🎉", label: "Throw a Tree Party", cur: S.flags.treePartySeen ? 1 : 0, max: 1,
      done: !!S.flags.treePartySeen }
  ].filter(function (q) { return !q.hidden; });
}

function questsMarkup() {
  var rows = questList().map(function (q) {
    return '<div class="quest-row' + (q.done ? " done" : "") + '">' +
      '<span class="quest-icon">' + q.icon + '</span>' +
      '<span class="quest-label">' + q.label + '</span>' +
      '<span class="quest-prog">' + (q.done ? "✓" : q.cur + "/" + q.max) + '</span></div>';
  }).join("");
  return '<div class="quest-head">WARREN LEVEL ' + S.progress.level + ' · QUESTS</div>' + rows +
    '<div class="quest-hint">Tap a goblin to see what they’re thinking.</div>';
}

function renderQuests() {
  var idle = document.getElementById("sheet-idle");
  if (idle && !idle.classList.contains("hidden")) idle.innerHTML = questsMarkup();
}

/* ---------------------------------------------------------------------
   THE LITTLE TEMPLE — symbolic readings, no claim. Meaning is free;
   state is earned: the temple is the one interactive thing that pays no
   currency, moves no counter, writes no replay entry. A rotating host
   reads the last event in three layers (GROUND / GARDEN / SKY) under the
   weekday's current. Every reading is footer-typed: a reading, not a
   ruling. The Kernel does not stir.
--------------------------------------------------------------------- */

var WEEK_CURRENTS = [
  { planet: "the Sun",  word: "indigo", color: "#6a5fd9" },
  { planet: "the Moon", word: "blue",   color: "#5b8dd9" },
  { planet: "Mars",     word: "green",  color: "#55c77c" },
  { planet: "Mercury",  word: "yellow", color: "#e8d060" },
  { planet: "Jupiter",  word: "orange", color: "#ffb15c" },
  { planet: "Venus",    word: "red",    color: "#ff8a8a" },
  { planet: "Saturn",   word: "violet", color: "#b98cff" }
];
var ZONE_SYMBOLS = { tree: "memory", garden: "growth", nursery: "becoming", spire: "ambition", forge: "proof", gate: "the threshold" };
var CHOICE_SYMBOLS = {
  try: "a seed accepted", hold: "a door kept ajar", compost: "a gift returned to the soil",
  boop: "joy, unlicensed", quiz: "memory answering memory"
};
var SKY_LINES = [
  "The spiral path walks it slowly; the straight path is the Moth's.",
  "Every storey of the Warren keeps a copy. Nothing is lost, only stacked.",
  "Somewhere above the Spire this event is a very small constellation.",
  "The snake sheds; the Warren keeps the skin, gently.",
  "A place is also a state of mind. This one, twice.",
  "The week is white and contains all the other colors. So does the compost.",
  "What returns is not a law. What returns is a friend with a pattern."
];
var ORACLE_HOSTS = [
  { icon: "🕯️", name: "The Cave Voice" },
  { icon: "🦋", name: "The Memory Moth" },
  { icon: "🎭", name: "A Very Polite Mask" },
  { icon: "🌳", name: "The Tree, half asleep" }
];

function buildTemple() {
  var world = document.getElementById("world");
  if (!world || document.getElementById("temple")) return;
  var t = document.createElement("div");
  t.id = "temple";
  t.innerHTML = '<div class="temple-glyph">⛩️</div><div class="temple-label">The Little Temple</div>';
  t.style.left = "50%";
  t.style.top = "88%";
  t.addEventListener("click", onTapTemple);
  world.appendChild(t);
}

function recurrenceNote() {
  if (!S.objects.length) return null;
  var last = S.objects[S.objects.length - 1];
  var n = 0;
  S.objects.forEach(function (o) { if (o.sign === last.sign) n++; });
  if (n < 2) return null;
  return "The " + last.sign.toLowerCase() + " returns. Recurrence strengthens evidence; law remains unchanged.";
}

function buildReading() {
  var cur = WEEK_CURRENTS[new Date().getDay()];
  var host = pick(ORACLE_HOSTS);
  var r = S.replay.length ? S.replay[S.replay.length - 1] : null;
  var ground = r ? "“" + r.visibleChange + "”" : "“the Warren was quiet.”";
  var zoneId = S.world.currentSignal ? S.world.currentSignal.zone : pick(ZONES).id;
  var choiceSym = r && CHOICE_SYMBOLS[r.choice] ? CHOICE_SYMBOLS[r.choice] : "a small thing, noticed";
  var garden = "Under the " + cur.word + " current of " + cur.planet + ", this reads as " +
    choiceSym + " — filed with " + (ZONE_SYMBOLS[zoneId] || "the moss") + ".";
  var sky = pick(SKY_LINES);
  var rec = recurrenceNote();
  return { host: host, color: cur.color, ground: ground, garden: garden, sky: sky + (rec ? " " + rec : "") };
}

function onTapTemple() {
  ensureAudio(); resumeAudio();
  Sound.treeHum();
  renderSheetOracle(buildReading());
}

function renderSheetOracle(reading) {
  document.getElementById("sheet-idle").classList.add("hidden");
  document.getElementById("sheet-goblin").classList.add("hidden");
  document.getElementById("sheet-proposal").classList.add("hidden");
  document.getElementById("sheet-quiz").classList.add("hidden");
  var sheet = document.getElementById("sheet-oracle");
  sheet.classList.remove("hidden");
  sheet.style.setProperty("--current-color", reading.color);
  document.getElementById("oracle-host").textContent = reading.host.icon + " " + reading.host.name + " reads:";
  document.getElementById("oracle-ground").textContent = reading.ground;
  document.getElementById("oracle-garden").textContent = reading.garden;
  document.getElementById("oracle-sky").textContent = reading.sky;
}

function closeOracle() {
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  if (S.activeProposal) renderSheetProposal(); else renderSheetIdle();
}

/* ---------------------------------------------------------------------
   RAÂM, THE LOUD MASK — Boss Level 1. A huge orange mask appears near
   the Mycelial Gate (masks come through dreams) and shouts doom. He has
   no doom; he only has volume. Every boop makes a goblin giggle and the
   mask shrink — laughter composts fear. Unmasked, he turns out to be
   very small and very polite. He threatens nothing real, ever.
--------------------------------------------------------------------- */

var raamEl = null, raamTimer = null, raamHP = 0;
var RAAM_SCARES = [
  "RAAAM! FEAR THE MASK!",
  "EVERYTHING IS DOOMED! LOOSELY!",
  "I AM VERY SCARY! ASK ANYONE!",
  "THE NIGHT IS FULL OF ME!",
  "TREMBLE! WHEN CONVENIENT!"
];
var RAAM_GIGGLES = [
  "Hee hee. Nice mask, Raâm.",
  "Do the tongue again!",
  "We can see your feet, Raâm.",
  "So loud. So small.",
  "Boop the nose!"
];

function scheduleRaam(delay) {
  clearTimeout(raamTimer);
  raamTimer = setTimeout(spawnRaam, delay);
}

function raamGlyphSize() { return 26 + raamHP * 5; }

function spawnRaam() {
  if (raamEl) return;
  var world = document.getElementById("world");
  if (!world) return;
  raamHP = 4;
  raamEl = document.createElement("div");
  raamEl.className = "raam";
  raamEl.innerHTML = '<div class="raam-line">' + pick(RAAM_SCARES) + '</div>' +
    '<div class="raam-glyph" style="font-size:' + raamGlyphSize() + 'px">👹</div>' +
    '<div class="raam-base">🍄🍄</div>';
  raamEl.style.left = "86%";
  raamEl.style.top = "58%";
  raamEl.addEventListener("click", tapRaam);
  world.appendChild(raamEl);
  Sound.roar();
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "uneasy"; });
  showBubble("zaz", "The loud mask is back…", 2600);
  renderGoblins();
}

function tapRaam() {
  if (!raamEl || raamHP <= 0) return;
  ensureAudio(); resumeAudio();
  raamHP--;
  earn(1, 0); // every laugh shakes loose a glow orb
  flashClass(raamEl, "bonked", 450);
  Sound.giggle();
  var who = pick(Object.keys(S.goblins));
  S.goblins[who].mood = "giggly";
  showBubble(who, pick(RAAM_GIGGLES), 1800);
  var glyph = raamEl.querySelector(".raam-glyph");
  if (glyph) glyph.style.fontSize = raamGlyphSize() + "px";
  var line = raamEl.querySelector(".raam-line");
  if (raamHP > 0) {
    if (line) line.textContent = pick(RAAM_SCARES);
    saveState();
    return;
  }
  // unmasked: fear composts into a friend
  if (line) line.textContent = "…boo? …boop.";
  raamEl.classList.add("unmasked");
  S.progress.raamDefeats++;
  earn(3, 0);
  addObject("🎭", "A Very Polite Mask", "gate");
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "delighted"; });
  Sound.party();
  appBounce();
  pushReplay("The Warren", "Raâm the Loud Mask", "boop", "Raâm was laughed down to size. The mask got polite.", "");
  renderObjects();
  renderReplayStrip();
  renderQuests();
  var el = raamEl; raamEl = null;
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1500);
  scheduleRaam(randi(180000, 360000)); // volume always recovers eventually
  saveState();
}

/* ---------------------------------------------------------------------
   THE FALSE CROWN — the boss. A gaudy crown squats the High Spire and
   declares itself important. It has no power; it only has claims. Each
   boop composts one claim. Defeated, it becomes A Very Humble Hat.
   The boss threatens nothing real. The Kernel never notices it.
--------------------------------------------------------------------- */

var crownEl = null, crownTimer = null, crownHP = 0;
var CROWN_CLAIMS = [
  "Bow, tiny goblins!",
  "All fruit is mine!",
  "I am the boss now!",
  "My word is law! Probably!",
  "This tower loves me!"
];
var CROWN_OBJECTIONS = ["No crown here!", "Compost it!", "The Garden says no.", "Show your receipts!", "Booooo!"];

function scheduleCrown(delay) {
  clearTimeout(crownTimer);
  crownTimer = setTimeout(spawnCrown, delay);
}

function spawnCrown() {
  if (crownEl || !S.progress.spireUnlocked) return;
  var world = document.getElementById("world");
  if (!world) return;
  var z = zoneById("spire");
  crownHP = 5;
  crownEl = document.createElement("div");
  crownEl.className = "crown";
  crownEl.innerHTML = '<div class="crown-claim">' + pick(CROWN_CLAIMS) + '</div>' +
    '<div class="crown-glyph">👑</div><div class="crown-claims-left">📜📜📜📜📜</div>';
  crownEl.style.left = z.x + "%";
  crownEl.style.top = (z.y - 9) + "%";
  crownEl.addEventListener("click", tapCrown);
  world.appendChild(crownEl);
  Sound.sneeze();
  showBubble(pick(GOBLIN_DEFS).id, "The False Crown is back!", 2600);
}

function tapCrown() {
  if (!crownEl || crownHP <= 0) return;
  ensureAudio(); resumeAudio();
  crownHP--;
  earn(0, 1); // every composted claim drips one sap
  flashClass(crownEl, "bonked", 450);
  tone(220 - crownHP * 20, 0, 0.12, "square", 0.12, 90);
  var who = pick(Object.keys(S.goblins));
  showBubble(who, pick(CROWN_OBJECTIONS), 1800);
  var scrolls = crownEl.querySelector(".crown-claims-left");
  if (scrolls) scrolls.textContent = new Array(crownHP + 1).join("📜");
  var claim = crownEl.querySelector(".crown-claim");
  if (crownHP > 0) {
    if (claim) claim.textContent = pick(CROWN_CLAIMS);
    saveState();
    return;
  }
  // defeated: the crown is composted into a very humble hat
  if (claim) claim.textContent = "…I'll see myself out.";
  crownEl.classList.add("falling");
  S.progress.crownDefeats++;
  addObject("🎩", "A Very Humble Hat", "spire");
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "victorious"; });
  Sound.party();
  appBounce();
  pushReplay("The Warren", "The False Crown", "compost", "the False Crown was composted into a humble hat.", "");
  renderObjects();
  renderReplayStrip();
  renderQuests();
  var el = crownEl; crownEl = null;
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1400);
  scheduleCrown(randi(240000, 420000)); // it always dreams of returning
  saveState();
}

/* ---------------------------------------------------------------------
   THE MEMORY MOTH — the Warren remembers; do you?
   Questions are derived from the real local log and state. The quiz
   reads memory, it never writes truth: right answers warm the Garden,
   wrong answers make the Moth sneeze. No penalty, ever.
--------------------------------------------------------------------- */

var mothEl = null, mothTimer = null, mothDespawnTimer = null;
var quizOpen = false, currentQuiz = null;

function scheduleMoth(delay) {
  clearTimeout(mothTimer);
  mothTimer = setTimeout(spawnMoth, delay);
}

function spawnMoth() {
  if (mothEl || quizOpen) { scheduleMoth(randi(30000, 60000)); return; }
  if (S.activeProposal) { scheduleMoth(randi(20000, 35000)); return; }
  var world = document.getElementById("world");
  if (!world) return;
  var tz = zoneById("tree");
  mothEl = document.createElement("div");
  mothEl.className = "moth";
  mothEl.textContent = "🦋";
  mothEl.setAttribute("aria-label", "the Memory Moth");
  mothEl.style.left = jitter(tz.x, 18) + "%";
  mothEl.style.top = (tz.y + randi(8, 18)) + "%";
  mothEl.addEventListener("click", onTapMoth);
  world.appendChild(mothEl);
  Sound.sparkle();
  clearTimeout(mothDespawnTimer);
  mothDespawnTimer = setTimeout(function () { if (!quizOpen) despawnMoth(); }, 25000);
}

function despawnMoth() {
  if (mothEl && mothEl.parentNode) mothEl.parentNode.removeChild(mothEl);
  mothEl = null;
  scheduleMoth(randi(90000, 150000));
}

function shuffleOptions(pool, correct) {
  var others = [];
  pool.forEach(function (p) { if (p !== correct && others.indexOf(p) === -1) others.push(p); });
  while (others.length > 2) others.splice(randi(0, others.length - 1), 1);
  var opts = others.concat([correct]);
  for (var i = opts.length - 1; i > 0; i--) {
    var j = randi(0, i); var t = opts[i]; opts[i] = opts[j]; opts[j] = t;
  }
  return opts;
}

/* Learn AI, earn ZOL — the Moth's education pool. Each entry teaches one
   idea, pays 10 ZOL, and leaves a one-line lesson the goblins can reuse. */
var AI_QCM = [
  { q: "Pip wants to rewrite a vague sign. What makes an instruction clear?",
    pool: ["A goal, a place, and a limit", "Bigger letters", "More exclamation marks", "Saying it twice"],
    correct: "A goal, a place, and a limit",
    topic: "prompt_engineering", lesson: "clear instructions include a goal, a place, and a limit",
    explain: "Better prompt = objective + context + constraints." },
  { q: "What is a large language model?",
    pool: ["An AI trained on lots of text to understand and generate language", "A robot that learns to walk", "A database of images", "A programming language"],
    correct: "An AI trained on lots of text to understand and generate language",
    topic: "ai_basics", lesson: "a language model learns patterns from text",
    explain: "It learns patterns from huge amounts of text to predict language." },
  { q: "Lulu forgot yesterday. What would give an AI helper a memory?",
    pool: ["Writing events down and rereading them", "Shouting louder", "A bigger hat", "Guessing"],
    correct: "Writing events down and rereading them",
    topic: "memory", lesson: "memory is a log you reread, not magic",
    explain: "AI memory is stored notes reread later — like the Warren's replay." },
  { q: "Zaz says moon cabbage makes goblins 400% smarter. What first?",
    pool: ["Test it", "Believe it — she sparkles", "Eat it all", "Argue loudly"],
    correct: "Test it",
    topic: "evidence", lesson: "confidence is not correctness — test claims",
    explain: "Confidence ≠ correctness. Run a small test before believing." },
  { q: "Which goblin should carry a seed to the Garden?",
    pool: ["The one who loves gardens", "The loudest one", "Whoever is closest", "All of them at once"],
    correct: "The one who loves gardens",
    topic: "tools_models", lesson: "match the agent to the task",
    explain: "Tool Conjuration: pick the right agent for the work." },
  { q: "Nib built a sunset-colored fridge instead of a bridge. Why?",
    pool: ["The instruction mutated as it was passed along", "Nib is silly", "Fridges are better", "The sunset asked"],
    correct: "The instruction mutated as it was passed along",
    topic: "prompt_engineering", lesson: "instructions drift as they pass between agents",
    explain: "Goblin Telephone: every handoff can distort a prompt." },
  { q: "The Warren replays its history after reload. Why does that matter?",
    pool: ["You can check how every change happened", "It looks pretty", "It saves battery", "It scares bugs"],
    correct: "You can check how every change happened",
    topic: "ai_basics", lesson: "a replayable log makes behavior inspectable",
    explain: "Logs make an agent's actions auditable — nothing hides." },
  { q: "An AI helper keeps getting a task wrong. Best next step?",
    pool: ["Give feedback and let it try again", "Never use it again", "Ask it angrily", "Hide the task"],
    correct: "Give feedback and let it try again",
    topic: "feedback", lesson: "feedback loops improve behavior over tries",
    explain: "Iteration beats blame: adjust, retry, compare." },
  { q: "Four goblins disagree about a plan. Who decides in the Warren?",
    pool: ["You do — goblins propose, you choose", "The loudest goblin", "A coin flip", "Nobody"],
    correct: "You do — goblins propose, you choose",
    topic: "multi_agent", lesson: "agents propose; a person decides",
    explain: "Multi-agent systems still need one accountable decider." },
  { q: "What does composting a bad idea do here?",
    pool: ["Turns it into soil for better ideas", "Deletes it forever", "Punishes the goblin", "Nothing"],
    correct: "Turns it into soil for better ideas",
    topic: "feedback", lesson: "rejected ideas become raw material",
    explain: "In the Warren, rejected ideas feed the next experiments." }
];

function aiQuizCandidate() {
  var def = pick(AI_QCM);
  return {
    q: def.q,
    options: shuffleOptions(def.pool, def.correct),
    correct: def.correct,
    topic: def.topic, lesson: def.lesson, explain: def.explain
  };
}

function promptEngineeringQuiz() {
  var def = AI_QCM[0];
  return { q: def.q, options: shuffleOptions(def.pool, def.correct), correct: def.correct,
           topic: def.topic, lesson: def.lesson, explain: def.explain };
}

function buildQuiz() {
  var candidates = [];
  var tired = mostTiredGoblin();
  candidates.push({
    q: "Who is the sleepiest goblin right now?",
    options: shuffleOptions(GOBLIN_DEFS.map(function (d) { return d.name; }), tired.name),
    correct: tired.name
  });
  candidates.push(aiQuizCandidate());
  candidates.push(aiQuizCandidate());
  if (S.replay.length) {
    var r = S.replay[S.replay.length - 1];
    if (r.choice === "try" || r.choice === "hold" || r.choice === "compost") {
      candidates.push({
        q: "The Moth remembers: “" + r.visibleChange + "” — what was the choice?",
        options: ["TRY", "HOLD", "COMPOST"],
        correct: r.choice.toUpperCase()
      });
    }
  }
  var gd = pick(GOBLIN_DEFS);
  candidates.push({
    q: "Where does " + gd.name + " feel most at home?",
    options: shuffleOptions(ZONES.map(function (z) { return z.name; }), zoneName(gd.preference)),
    correct: zoneName(gd.preference)
  });
  if (S.objects.length >= 2) {
    var last = S.objects[S.objects.length - 1];
    candidates.push({
      q: "What appeared most recently in the Warren?",
      options: shuffleOptions(S.objects.map(function (o) { return o.sign; }), last.sign),
      correct: last.sign
    });
  }
  return pick(candidates);
}

function onTapMoth() {
  if (quizOpen) return;
  ensureAudio(); resumeAudio();
  quizOpen = true;
  currentQuiz = buildQuiz();
  clearTimeout(mothDespawnTimer);
  Sound.chirp();
  renderSheetQuiz();
}

function answerQuiz(option) {
  if (!quizOpen || !currentQuiz) return;
  var right = option === currentQuiz.correct;
  var result = document.getElementById("quiz-result");
  var mothG = mothEl ? { x: parseFloat(mothEl.style.left), y: parseFloat(mothEl.style.top) } : null;
  if (right) {
    S.flags.quizRight = (S.flags.quizRight || 0) + 1;
    S.world.warmth = clamp(S.world.warmth + 2, 0, 100);
    S.world.soil = clamp(S.world.soil + 1, 0, 100);
    earn(0, 2);

    /* Win streak: consecutive correct answers pay a rising bonus (cap +25). */
    S.learning.quizStreak = (S.learning.quizStreak || 0) + 1;
    var streak = S.learning.quizStreak;
    var bonus = Math.min(25, (streak - 1) * 5);
    var payout = 10 + bonus;
    S.learning.zolBalance += payout;

    if (currentQuiz.topic) {
      S.learning.lastQuizTopic = currentQuiz.topic;
      S.learning.lastQuizLesson = currentQuiz.lesson || null;
    }
    Sound.riddleCorrect(); setTimeout(Sound.bloom, 300);
    if (mothG) { dropParticle(mothG, "✨", true); dropParticle(mothG, "✨"); }

    /* Gold rush: coins fly from the quiz sheet to the wallet. */
    var sheetEl = document.getElementById("sheet-quiz");
    var sr = sheetEl ? sheetEl.getBoundingClientRect() : null;
    zolCelebrate(payout, sr ? sr.left + sr.width / 2 : undefined, sr ? sr.top : undefined);

    if (result) result.textContent = (currentQuiz.explain ? currentQuiz.explain + " " : pick([
      "The Moth nods. It already knew. ",
      "Golden dust falls. The Garden feels warmer. ",
      "The Moth loops the loop! "
    ])) + "+" + payout + " ZOL" + (bonus > 0 ? " · STREAK ×" + streak + "!" : "");
    pushReplay("The Moth", "Memory Moth", "quiz",
      "the Moth's question was answered well. +" + payout + " ZOL" + (bonus > 0 ? " (streak ×" + streak + ")" : ""), "");
  } else {
    S.flags.quizWrong = (S.flags.quizWrong || 0) + 1;
    S.learning.quizStreak = 0;
    Sound.riddleWrong();
    if (result) result.textContent = "Achoo! It was: " + currentQuiz.correct +
      (currentQuiz.explain ? " — " + currentQuiz.explain : "");
  }
  var btns = document.querySelectorAll("#quiz-buttons .qbtn");
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
  saveState();
  renderReplayStrip();
  setTimeout(function () {
    quizOpen = false;
    currentQuiz = null;
    despawnMoth();
    if (S.activeProposal) renderSheetProposal(); else renderSheetIdle();
  }, 2600);
}

function renderSheetQuiz() {
  document.getElementById("sheet-idle").classList.add("hidden");
  document.getElementById("sheet-goblin").classList.add("hidden");
  document.getElementById("sheet-proposal").classList.add("hidden");
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  var sheet = document.getElementById("sheet-quiz");
  sheet.classList.remove("hidden");
  document.getElementById("quiz-text").textContent = currentQuiz.q;
  var result = document.getElementById("quiz-result");
  if (result) result.textContent = "";
  var host = document.getElementById("quiz-buttons");
  host.innerHTML = "";
  currentQuiz.options.forEach(function (opt) {
    var b = document.createElement("button");
    b.className = "qbtn";
    b.textContent = opt;
    b.addEventListener("click", function () { answerQuiz(opt); });
    host.appendChild(b);
  });
}

/* ---------------------------------------------------------------------
   INPUT
--------------------------------------------------------------------- */

function onTapGoblin(id) {
  ensureAudio(); resumeAudio();
  doBoop(id);
  if (S.activeProposal || quizOpen) return; // proposal/quiz keeps the sheet
  renderSheetGoblin(id);
}

function wireInput() {
  document.getElementById("mute-btn").addEventListener("click", function () {
    ensureAudio(); resumeAudio();
    S.settings.muted = !S.settings.muted;
    applyAmbientMute();
    saveState();
    renderTopbar();
    if (!S.settings.muted) Sound.chirp();
  });
  document.getElementById("card-close").addEventListener("click", function () { renderSheetIdle(); });
  document.getElementById("oracle-close").addEventListener("click", closeOracle);

  /* The Warren as instrument: any touch, anywhere, rings a Solfeggio tone.
     Random tapping tunes itself — every frequency belongs to the same
     sacred set, so exploration sounds like slow hypnotic music. */
  document.addEventListener("pointerdown", function () {
    ensureAudio(); resumeAudio();
    Sound.solfeggioTouch();
  }, { passive: true });

  /* ZOL wallet — tappable shop access (mobile-first; 'B' remains the shortcut) */
  var zolWallet = document.getElementById("zol-wallet");
  if (zolWallet) {
    zolWallet.addEventListener("click", function () {
      ensureAudio(); resumeAudio();
      var shop = document.getElementById("sheet-zol-shop");
      if (shop && shop.classList.contains("hidden")) { Sound.chirp(); renderTerritoryShop(); }
      else renderSheetIdle();
    });
  }
  var zolClose = document.getElementById("zol-shop-close");
  if (zolClose) zolClose.addEventListener("click", function () { renderSheetIdle(); });
  document.getElementById("btn-try").addEventListener("click", function () { ensureAudio(); resumeAudio(); resolveProposal("try"); });
  document.getElementById("btn-hold").addEventListener("click", function () { ensureAudio(); resumeAudio(); resolveProposal("hold"); });
  document.getElementById("btn-compost").addEventListener("click", function () { ensureAudio(); resumeAudio(); resolveProposal("compost"); });
  document.getElementById("world").addEventListener("click", function (e) {
    if (e.target.id === "world") { ensureAudio(); resumeAudio(); }
  });

  /* Help overlay controls */
  var helpOverlay = document.getElementById("help-overlay");
  var helpCloseBtn = document.getElementById("help-close");
  function toggleHelp() {
    if (helpOverlay.classList.contains("hidden")) {
      helpOverlay.classList.remove("hidden");
      ensureAudio();
    } else {
      helpOverlay.classList.add("hidden");
    }
  }
  if (helpCloseBtn) {
    helpCloseBtn.addEventListener("click", function () { helpOverlay.classList.add("hidden"); });
  }

  /* Maestro quest controls */
  var maestroChoiceButtons = document.querySelectorAll(".maestro-choice-btn");
  maestroChoiceButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var goblinId = btn.getAttribute("data-goblin");
      if (goblinId) {
        ensureAudio(); resumeAudio();
        resolveMemorySeedQuest([goblinId]);
      }
    });
  });

  var maestroLessonClose = document.getElementById("maestro-lesson-close");
  if (maestroLessonClose) {
    maestroLessonClose.addEventListener("click", function () { closeMaestroLesson(); });
  }

  /* Territory build UI wiring */
  var territoryBuildClose = document.getElementById("territory-build-close");
  if (territoryBuildClose) {
    territoryBuildClose.addEventListener("click", function () {
      var overlay = document.getElementById("territory-build");
      if (overlay) overlay.classList.add("hidden");
      S.territories.building = null; /* Cancel the build */
    });
  }

  var territoryBuildConfirm = document.getElementById("territory-build-confirm");
  if (territoryBuildConfirm) {
    territoryBuildConfirm.addEventListener("click", function () {
      var selected = document.querySelectorAll(".territory-builder-btn.selected");
      if (selected.length > 0) {
        var builderIds = Array.from(selected).map(function (btn) { return btn.getAttribute("data-goblin"); });
        if (assignBuilders(builderIds)) {
          ensureAudio();
          resumeAudio();
        }
      }
    });
  }

  /* Keyboard controls: Q=riddle, B=buy, P=propose, A/D/H=choices, ?=help */
  document.addEventListener("keydown", function (e) {
    var key = e.key.toLowerCase();
    if (key === "?") {
      e.preventDefault();
      toggleHelp();
      return;
    }
    if (helpOverlay && !helpOverlay.classList.contains("hidden")) {
      return; /* Ignore game keys when help is open */
    }
    if (key === "b") {
      e.preventDefault();
      renderTerritoryShop();
      return;
    }
    if (key === "escape") {
      e.preventDefault();
      var shop = document.getElementById("sheet-zol-shop");
      if (shop && !shop.classList.contains("hidden")) {
        renderSheetIdle();
      }
      return;
    }
  });
}

/* ---------------------------------------------------------------------
   DEBUG HOOK — used only by the verification harness, not shown in UI
--------------------------------------------------------------------- */

window.WARREN_DEBUG = {
  getState: function () { return S; },
  getObjects: function () { return S.objects; },
  forceSignal: function (type) { var s = createSignal(type || pickSignalType()); createProposalFromSignal(s); },
  forceArcBugEscape: function () { ambientBugEscape(); },
  forceArcProposal: function () {
    if (!S.activeProposal) {
      var s = S.world.currentSignal && S.world.currentSignal.type === "bug" ? S.world.currentSignal : createSignal("bug");
      createProposalFromSignal(s, "Name the bug Gerald and give it a tiny apartment.");
    }
  },
  forceArcFollowUp: function () { fireArcFollowUp(); },
  resolve: function (choice) { resolveProposal(choice); },
  boop: function (id) { doBoop(id); },
  boopSeq: function (ids) { ids.forEach(function (id) { doBoop(id); }); },
  addObject: function (emoji, sign, zoneId) { addObject(emoji, sign, zoneId); renderObjects(); },
  bubble: function (id, text) { showBubble(id, text, 4000); },
  award: function (orbs, sap) { earn(orbs || 0, sap || 0); saveState(); },
  spawnCrown: function () { spawnCrown(); },
  spawnRaam: function () { spawnRaam(); },
  spawnMoth: function () { spawnMoth(); },
  getQuiz: function () { return currentQuiz; },
  answerQuiz: function (opt) { answerQuiz(opt); },
  getQuestDef: function (questId) { return questId ? window[questId + "_QUEST"] : MEMORY_SEED_QUEST; },
  purchaseTerritory: function (id) { S.learning.zolBalance += 100; return purchaseTerritory(id); },
  assignBuilders: function (ids) { return assignBuilders(ids); },
  getTerritories: function () { return { defs: TERRITORY_DEFS, owned: S.territories.owned, building: S.territories.building }; },
  getGeraldQuest: function () { return S.learning.geraldQuest; },
  unlockGeraldQuest: function () { S.learning.geraldQuest.stage = "AVAILABLE"; saveState(); return S.learning.geraldQuest; },
  triggerGeraldProposal: function () { var s = createSignal("bug"); createGeraldQuestProposal(s); return true; },
  resolveGeraldChoice: function (choice) { return resolveProposal(choice); },
  getSignpostGrove: function () { return TERRITORY_DEFS.find(function (t) { return t.id === "signpost-grove"; }); },
  getWorldSigns: function () { return S.worldSigns; },
  getAbilities: function () { return S.npcAbilities; },
  getMemories: function () { return S.memories; },
  pipRecall: function () { return pipRecallLine(); },
  pipCanClarify: function () { return pipCanClarify(); },
  tickPip: function () { tickGoblin("pip"); },
  forcePromptQuiz: function () { quizOpen = true; currentQuiz = promptEngineeringQuiz(); renderSheetQuiz(); return currentQuiz; },
  purchaseTerritoryRaw: function (id) { return purchaseTerritory(id); },
  getCouncil: function () { return S.council; },
  getCouncilEpisode: function () { return COUNCIL_EPISODE; },
  getCouncilPositions: function () { return councilPositions(); },
  startCouncil: function () { return startCouncil(); },
  councilCard: function (id) { return councilIntervene(id); },
  wipe: function () { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }
};

/* ---------------------------------------------------------------------
   BOOT
--------------------------------------------------------------------- */

function boot() {
  buildStaticWorld();
  wireInput();
  layoutObjects();
  renderAll();
  renderSheetIdle();

  GOBLIN_DEFS.forEach(function (d, i) { scheduleGoblinTick(d.id, 1400 + i * 700); });
  if (S.progress.spireUnlocked) {
    ensureTink();
    scheduleCrown(randi(30000, 90000));
  }
  scheduleRaam(randi(50000, 90000));
  scheduleMoth(randi(45000, 80000));
  setTimeout(function () {
    if (!everBooped) showBubble("lulu", "Try booping someone. Gently.", 3600);
  }, 12000);

  /* Gerald quest unlock gate: after 7s, unlock when player interacts */
  if (S.learning.geraldQuest.stage === "LOCKED") {
    setTimeout(function () {
      if (S.learning.geraldQuest.stage === "LOCKED") {
        S.learning.geraldQuest.stage = "AVAILABLE";
        saveState();
      }
    }, GERALD_QUEST.triggerDelay);
  }

  /* Council convenes for returning players who resolved Gerald but never held the hearing */
  if (!S.council.done && S.learning.geraldQuest.stage === "T5A_RESOLVED") {
    councilTimer = setTimeout(maybeStartCouncil, 30000);
  }
  if (S.council.stage === "DEBATE" || S.council.stage === "UPDATED") {
    /* mid-hearing reload: reopen the chamber (an un-executed card re-runs) */
    if (S.council.card) { S.council.card = null; S.council.stage = "DEBATE"; }
    setTimeout(renderCouncil, 1500);
  }

  if (isFreshBoot) {
    S.startedAt = Date.now();
    saveState();
    bootScriptedArc();
  } else {
    resumeAfterReload();
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();

})();
