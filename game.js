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
   VISION_V1_28 §5 — LULU'S VOICE FILES. Ten hypnotic lines. Fable fills
   the URLs after generation; until then every key falls back to the
   existing browser TTS (luluSpeak) with zero behavior change. A single
   shared Audio element plays one line at a time — pause before replay,
   never overlap, always respect mute.
--------------------------------------------------------------------- */
/* Luna (ElevenLabs via Higgsfield), operator-chosen voice — see
   docs/LULU_VOICE_LINES.md for the full line catalog + durations.
   v-local.1: assets local — CDN no longer required at runtime. */
var LULU_VOICE_CDN = "assets/audio/"; /* local path; was CDN prefix */
var LULU_VOICE_URLS = {
  greet:     LULU_VOICE_CDN + "hf_20260713_142245_greet.mp3",
  boop:      LULU_VOICE_CDN + "hf_20260713_142252_boop.mp3",
  quizRight: LULU_VOICE_CDN + "hf_20260713_142258_quizRight.mp3",
  quizWrong: LULU_VOICE_CDN + "hf_20260713_142303_quizWrong.mp3",
  verdict:   LULU_VOICE_CDN + "hf_20260713_142306_verdict.mp3",
  compost:   LULU_VOICE_CDN + "hf_20260713_142313_compost.mp3",
  matcha:    LULU_VOICE_CDN + "hf_20260713_142319_matcha.mp3",
  travel:    LULU_VOICE_CDN + "hf_20260713_142322_travel.mp3",
  relic:     LULU_VOICE_CDN + "hf_20260713_142325_relic.mp3",
  goodnight: LULU_VOICE_CDN + "hf_20260713_142332_goodnight.mp3"
};
/* fallback TTS says the same words the Luna recordings say */
var LULU_VOICE_TEXT = {
  greet: "Welcome home, little gardener... the moss remembered your footsteps... we pretended we did not miss you... we did.",
  boop: "You have booped me... I am now... emotionally reorganized... please hold...",
  quizRight: "Correct... the Moth is pretending... it always knew... so am I...",
  quizWrong: "Wrong... and yet... the mushrooms still love you... they told me.",
  verdict: "Stamp slowly... a choice is a seed... and seeds... do not like to be rushed...",
  compost: "To the compost... where old ideas dream... of becoming... soup...",
  matcha: "Ohhh... warm matcha... my tiny soul... is now a quiet... green... pond...",
  travel: "We are traveling... hold your thoughts gently... like a sleepy snail...",
  relic: "You found a shiny truth... put it somewhere safe... like your heart... or a jar...",
  goodnight: "Close your eyes, little Warren... the log will remember everything... it always does... goodnight..."
};
var luluVoiceAudioEl = null;
/* shared player: one voice at a time, mute-aware, TTS fallback on any
   failure. Both the v1.28 seam (luluVoiceLine) and the v1.29 surprise
   seam (luluSurpriseLine) route through this so the Warren never speaks
   with two mouths at once. */
function playLuluAudioLine(url, text) {
  if (S && S.settings && S.settings.muted) return;
  if (!url) { if (text) luluSpeak(text); return; }
  try {
    if (!luluVoiceAudioEl) luluVoiceAudioEl = new Audio();
    luluVoiceAudioEl.pause(); /* one voice at a time, even if it's mid-line */
    luluVoiceAudioEl.src = url;
    luluVoiceAudioEl.volume = 0.55;
    luluVoiceAudioEl.currentTime = 0;
    luluVoiceAudioEl.onerror = function () { if (text) luluSpeak(text); };
    var played = luluVoiceAudioEl.play();
    if (played && played.catch) played.catch(function () { if (text) luluSpeak(text); });
  } catch (e) { if (text) luluSpeak(text); }
}
function luluVoiceLine(key) {
  if (!key) return;
  playLuluAudioLine(LULU_VOICE_URLS[key], LULU_VOICE_TEXT[key] || "");
}

/* ---------------------------------------------------------------------
   VISION_V1_29 §3 — LULU'S SURPRISE VOICE. Six rare-and-delighted lines,
   same seam shape as §5's LULU_VOICE_URLS: empty strings until Fable
   fills them post-generation, TTS covers every gap, nothing ever throws.
   staringLose has no clip yet (per the vision doc) — TTS carries it.
--------------------------------------------------------------------- */
var LULU_SURPRISE_URLS = {
  faint:      LULU_VOICE_CDN + "hf_20260713_162124_faint.mp3",
  staringWin: LULU_VOICE_CDN + "hf_20260713_162130_staringWin.mp3",
  staringLose: "", /* TTS-only fallback for now */
  matchaRain: LULU_VOICE_CDN + "hf_20260713_162132_matchaRain.mp3",
  disco:      LULU_VOICE_CDN + "hf_20260713_162135_disco.mp3",
  secret:     LULU_VOICE_CDN + "hf_20260713_162145_secret.mp3"
};
var LULU_SURPRISE_TEXT = {
  faint: "You booped too well... a goblin has fainted... from pure joy... please... send snacks...",
  staringWin: "You blinked last... which means... you win... at doing absolutely nothing... my favorite sport...",
  staringLose: "You looked away... the goblin is victorious... it will not stop bragging...",
  matchaRain: "It is raining matcha... catch it with your fingers... or your soul... fingers are faster...",
  disco: "Oh no... you woke the disco mushroom... now we must all... vibrate... politely...",
  secret: "You found a secret... I will pretend to be surprised... oh... wow... a secret..."
};
function luluSurpriseLine(key) {
  if (!key) return;
  playLuluAudioLine(LULU_SURPRISE_URLS[key], LULU_SURPRISE_TEXT[key] || "");
}

/* ---------------------------------------------------------------------
   VISION_V1_33 §4 — THE PROLOGUE'S VOICE. Three lines, same seam shape
   as LULU_VOICE_URLS: empty strings until Fable fills them post-
   generation. NOTE: unlike the local Lulu/SFX seams above, these are new
   and should be filled as full CDN https URLs (not local paths) — the
   dual-source/localize pass covers them later. TTS fallback (luluSpeak)
   covers every gap in the meantime, so the Prologue is always fully
   playable offline.
--------------------------------------------------------------------- */
/* Local paths — same pipeline as every other Luna line (LULU_VOICE_CDN =
   "assets/audio/"). The 3 files land when the laptop downloads them (CDN
   sources recorded in docs/LULU_VOICE_LINES.md); until then the path 404s
   and luluPrologueLine falls through to browser TTS. No CDN in code. */
var LULU_PROLOGUE_URLS = {
  greet: "assets/audio/hf_20260713_235654_prologue_greet.mp3",
  boop:  "assets/audio/hf_20260713_235657_prologue_boop.mp3",
  seed:  "assets/audio/hf_20260713_235703_prologue_seed.mp3"
};
var LULU_PROLOGUE_TEXT = {
  greet: "Oh... it is you... you came... I did not want to hope... sit with me a moment... tonight the Warren is very small... just you... and me... and the Tree that remembers.",
  boop: "There... you noticed me... that is the whole magic... to be noticed... is to become real... now... shall I call a friend? Slowly. We do everything slowly here.",
  seed: "Here. One seed. It is yours now. In this garden... what you tend... becomes real. Not because you wished it... because you tended it. Begin."
};
function luluPrologueLine(key) {
  if (!key) return;
  playLuluAudioLine(LULU_PROLOGUE_URLS[key], LULU_PROLOGUE_TEXT[key] || "");
}

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

/* ADOPT A GOBLIN: the six wanderer archetypes, one per return humor — the
   field supplies the mask it currently lacks. Data lives up here because
   mergeDefaults rebuilds an adopted kin at load time. */
var WANDERER_ARCHETYPES = {
  LONELY:   { archetype: "Hearth-Kindler",  role: "Hearth-Kindler",  trait: "warm-hearted", color: "#e8a7c0",
              preference: "gate",    aversion: "forge",  homeTask: "kindling",
              why: "The Warren felt lonely. So I came. I'm good at sitting nearby." },
  TRICKSTER:{ archetype: "Thread-Untangler", role: "Thread-Untangler", trait: "methodical",  color: "#b9d4f0",
              preference: "forge",   aversion: "gate",   homeTask: "untangling",
              why: "Things moved around here. I put things back. Mostly the right places." },
  DREAMING: { archetype: "Dream-Fisher",    role: "Dream-Fisher",    trait: "half-asleep",  color: "#b79bf0",
              preference: "tree",    aversion: "nursery", homeTask: "dream-fishing",
              why: "The Warren dreamed while you were gone. I catch those. For later." },
  TENDER:   { archetype: "Echo-Singer",     role: "Echo-Singer",     trait: "soft-voiced",  color: "#ffd9a0",
              preference: "garden",  aversion: "spire",  homeTask: "echo-singing",
              why: "It's warm here. Warm places need someone to hum back at them." },
  PROUD:    { archetype: "Pocket-Historian", role: "Pocket-Historian", trait: "solemn",      color: "#d9b96b",
              preference: "spire",   aversion: "garden", homeTask: "chronicling",
              why: "Great things happened here. Someone small should write them down." },
  QUIET:    { archetype: "Door-Listener",   role: "Door-Listener",   trait: "attentive",    color: "#9fd8d0",
              preference: "gate",    aversion: "spire",  homeTask: "listening at doors",
              why: "It's quiet here. Quiet is a sound too. I collect it." }
};

function adoptedDef(a) {
  var arch = WANDERER_ARCHETYPES[a.archetypeId] || WANDERER_ARCHETYPES.QUIET;
  return { id: "kin", name: a.name, role: arch.role, trait: arch.trait, color: arch.color,
    preference: arch.preference, aversion: arch.aversion, homeTask: arch.homeTask };
}
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
    world: { treeHealth: 70, gardenToxicity: 20, bugPressure: 15, soil: 0, warmth: 50, currentSignal: null, warrenTicks: 0 },
    goblins: goblins,
    lulu: { mode: "bouffon-tendre", previousMode: null,
            needs: { energy: 70, curiosity: 70, connection: 55 },
            lastVisitAt: null, accessories: [], inCave: false,
            counts: { talk: 0, rest: 0, explore: 0, give: 0, requestsYes: 0 },
            pendingRequest: null, requestsDone: [], chat: [] },
    activeProposal: null,
    objects: [],
    replay: [],
    flags: { greeted: false, firstSignalSeen: false, firstProposalResolved: false, secondEventReferencedFirst: false, geraldFate: null,
             boops: 0, treePartySeen: false, quizRight: 0, quizWrong: 0, serpentTapped: false, organPlayed: false,
             quizZolMet: false,   /* QUIZ_TO_ZOL_V2: has Lulu offered her first fun fact (graduated only) */
             /* VISION_V1_33 §1 — first-run-only Prologue gate; false only on
                a genuinely fresh boot (no save at all). mergeDefaults() and
                the loadState() belt-and-suspenders below grandfather any
                pre-existing save to true. */
             prologueSeen: false },
    /* VISION_V1_30 §1 — levels are earned doors, not a free carousel.
       levelsUnlocked holds every chapter id the player has paid the toll
       for; L1 is always free (default [1]).
       VISION_PROGRESSION §1 — the Bonding Ladder. `rung` (1..12) is the
       reveal curriculum: a fresh player starts at 1 (one goblin, nothing
       else) and the full Warren is Rung 12. `onboarding` is the crib's
       completed-moments memory. A returning save is grandfathered to
       rung 12 / onboarding-complete at load, so established players get
       EXACTLY today's Warren (see the loadState belt below). */
    progress: { level: 1, levelsUnlocked: [1], glowOrbs: 0, magicSap: 0, spireUnlocked: false, tinkUnlocked: false, crownDefeats: 0, raamDefeats: 0, serenDefeats: 0,
                rung: 1, worldStaged: false, onboarding: { woke: false, offered: false, mystery: false, seedObjId: null, bloomObjId: null, visits: 0,
                matchaCupObjId: null, need1Done: false, need2Done: false, need3Deferred: false } },
    settings: { muted: false },
    territories: { owned: [], building: null },
    learning: { maestroUnlocked: false, activeQuest: null, completedQuests: [],
                pillarProgress: { promptAlchemy: 0, toolConjuration: 0, intelligenceDesign: 0, codeSpellicraft: 0 },
                zolBalance: 0, quizStreak: 0, geraldQuest: { version: 1, stage: "LOCKED", t5aChoice: null, t5bChoice: null, t5cCorrect: false, rewardClaimed: false },
                firstInteractionAt: null, lastQuizTopic: null, lastQuizLesson: null },
    npcAbilities: { pip: { clarifySign: false } },
    worldSigns: { westPath: { text: "MUSHROOMS THIS WAY", clarity: 0.25, clarified: false } },
    memories: [],
    council: { done: false, stage: "IDLE", card: null },
    /* echoes: consequences one mini-game leaves for another system to find */
    echoes: { nibHyper: false, memoryFact: null, mushroomNoticed: false,
              geraldHead: false, luluHat: false },
    /* the teachable goblin — the child teaches, the goblin remembers,
       misgeneralizes, and acts only when the child stamps. */
    teaching: { lessons: [], taughtCount: {}, pending: null },
    /* the adopted kin — a wanderer named and stamped by the operator */
    adopted: null,
    /* the Wonder Cache — six relics EARNED through play, then found by tapping.
       Each surfaces only when its milestone is reached (progression-linked,
       not decoration). Finding is expressive: it sings, tells a line, and
       writes a garden receipt. It grants no ZOL and admits nothing (membrane
       law). unlocked = has surfaced in the moss · found = has been tapped. */
    collectibles: { unlocked: [], found: [] },
    /* QUIZ_TO_ZOL_V1 — hallucination correction loop.
       quizState tracks which reward_keys have been paid; villageState holds
       the persistent visual effects that survive reload. Neither touches the
       HELEN OS governed ledger — game-local ZOL only. */
    quizState: { rewardPaid: {}, streak: 0, bestStreak: 0 },
    villageState: { unlockedEffects: [] }
  };
}

function validAndComplete(s) {
  return s && s.version === STATE_VERSION && s.world && s.goblins &&
    s.goblins.lulu && s.goblins.pip && s.goblins.zaz && s.goblins.nib &&
    Array.isArray(s.replay) && s.flags && s.progress && s.settings && s.learning &&
    s.npcAbilities && s.worldSigns && Array.isArray(s.memories) && s.council &&
    s.lulu && s.lulu.needs && s.lulu.counts;
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
    if (loaded.adopted && loaded.adopted.id && loaded.adopted.name) {
      out.adopted = loaded.adopted;
      var kdef = adoptedDef(loaded.adopted);
      out.goblins.kin = Object.assign({}, makeGoblin(kdef), (loaded.goblins && loaded.goblins.kin) || {});
    }
    out.progress = Object.assign({}, d.progress, loaded.progress || {});
    /* VISION_V1_30 §1 — migration: grandfather old saves. A save from
       before this law existed had no levelsUnlocked; unlock 1..level
       (whatever chapter it had already reached), min [1]. L1 always in. */
    if (!Array.isArray(out.progress.levelsUnlocked) || !out.progress.levelsUnlocked.length) {
      var grandfathered = [];
      var maxKnownLevel = Math.max(1, out.progress.level || 1);
      for (var glv = 1; glv <= maxKnownLevel; glv++) grandfathered.push(glv);
      out.progress.levelsUnlocked = grandfathered;
    }
    if (out.progress.levelsUnlocked.indexOf(1) < 0) out.progress.levelsUnlocked.unshift(1);
    out.lulu = Object.assign({}, d.lulu, loaded.lulu || {});
    out.lulu.needs = Object.assign({}, d.lulu.needs, (loaded.lulu && loaded.lulu.needs) || {});
    out.lulu.counts = Object.assign({}, d.lulu.counts, (loaded.lulu && loaded.lulu.counts) || {});
    out.lulu.accessories = Array.isArray(loaded.lulu && loaded.lulu.accessories) ? loaded.lulu.accessories : [];
    out.lulu.requestsDone = Array.isArray(loaded.lulu && loaded.lulu.requestsDone) ? loaded.lulu.requestsDone : [];
    out.lulu.chat = Array.isArray(loaded.lulu && loaded.lulu.chat) ? loaded.lulu.chat.slice(-12) : [];
    out.activeProposal = loaded.activeProposal || null;
    out.objects = Array.isArray(loaded.objects) ? loaded.objects : [];
    out.replay = Array.isArray(loaded.replay) ? loaded.replay : [];
    out.flags = Object.assign({}, d.flags, loaded.flags || {});
    /* VISION_V1_33 §1 — grandfather law: reaching mergeDefaults means an
       older/malformed save already existed — this is not a fresh player,
       so skip the Prologue, unless the save explicitly recorded false
       (the "watch it again" replayPrologue() debug affordance). */
    out.flags.prologueSeen = (loaded.flags && typeof loaded.flags.prologueSeen === "boolean")
      ? loaded.flags.prologueSeen : true;
    out.settings = Object.assign({}, d.settings, loaded.settings || {});
    out.learning = Object.assign({}, d.learning, loaded.learning || {});
    out.territories = Object.assign({}, d.territories, loaded.territories || {});
    out.npcAbilities = { pip: Object.assign({}, d.npcAbilities.pip, (loaded.npcAbilities && loaded.npcAbilities.pip) || {}) };
    out.worldSigns = { westPath: Object.assign({}, d.worldSigns.westPath, (loaded.worldSigns && loaded.worldSigns.westPath) || {}) };
    out.memories = Array.isArray(loaded.memories) ? loaded.memories : [];
    out.council = Object.assign({}, d.council, loaded.council || {});
    out.echoes = Object.assign({}, d.echoes, loaded.echoes || {});
    out.teaching = Object.assign({}, d.teaching, loaded.teaching || {});
    out.verdicts = (loaded.verdicts && Array.isArray(loaded.verdicts.history)) ? loaded.verdicts : { history: [] };
    out.teaching.lessons = Array.isArray(out.teaching.lessons) ? out.teaching.lessons.slice(-24) : [];
    out.teaching.taughtCount = out.teaching.taughtCount || {};
    out.collectibles = {
      unlocked: (loaded.collectibles && Array.isArray(loaded.collectibles.unlocked)) ? loaded.collectibles.unlocked.slice(0, 16) : [],
      found: (loaded.collectibles && Array.isArray(loaded.collectibles.found)) ? loaded.collectibles.found.slice(0, 16) : []
    };
    /* a found relic is necessarily unlocked (older saves, or hand-edits) */
    out.collectibles.found.forEach(function (id) { if (out.collectibles.unlocked.indexOf(id) < 0) out.collectibles.unlocked.push(id); });
    /* QUIZ_TO_ZOL_V1 state */
    out.quizState = (loaded.quizState && typeof loaded.quizState.rewardPaid === "object")
      ? { rewardPaid: Object.assign({}, loaded.quizState.rewardPaid),
          streak: loaded.quizState.streak || 0, bestStreak: loaded.quizState.bestStreak || 0 }
      : { rewardPaid: {}, streak: 0, bestStreak: 0 };
    out.villageState = (loaded.villageState && Array.isArray(loaded.villageState.unlockedEffects))
      ? { unlockedEffects: loaded.villageState.unlockedEffects.slice() }
      : { unlockedEffects: [] };
  } catch (e) { return d; }
  return out;
}

function loadState() {
  /* witness affordance: index.html?newgame=1 wipes the save before load, so a
     single URL hands the operator a guaranteed-fresh game (no private tab). */
  try {
    if (typeof location !== "undefined" && /[?&]newgame=1/.test(location.search)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) { /* no location/storage: fine */ }
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
/* belt-and-suspenders: an older save can pass validAndComplete without the
   collectibles field (it isn't required there); guarantee it exists so the
   Wonder Cache never reads undefined. */
if (!S.collectibles || !Array.isArray(S.collectibles.found)) S.collectibles = { unlocked: [], found: [] };
if (!Array.isArray(S.collectibles.unlocked)) S.collectibles.unlocked = S.collectibles.found.slice();
/* VISION_V1_33 §1 — grandfather: a save that passed validAndComplete
   whole (no mergeDefaults call) can still predate this flag, since
   validAndComplete never required it. Only a genuinely fresh boot
   (isFreshBoot) keeps makeState()'s prologueSeen=false. */
if (!isFreshBoot) {
  if (!S.flags) S.flags = {};
  if (typeof S.flags.prologueSeen !== "boolean") S.flags.prologueSeen = true;
}
/* VISION_PROGRESSION §1 — the Bonding Ladder grandfather. Runs on EVERY
   boot, after prologueSeen is settled above, so it covers both the
   mergeDefaults path AND the validAndComplete-whole path (which skips
   mergeDefaults and so never picked up the new progress fields).
   `prologueSeen === true` is the single source of truth for "established
   player": such a save jumps straight to rung 12 with onboarding complete,
   guaranteeing byte-for-byte today's boot. Only a genuinely fresh crib
   (prologueSeen false) starts the ladder at Rung 1. Any partially-saved
   crib keeps whatever rung/onboarding it saved. */
if (!S.progress) S.progress = {};
var _graduated = !!(S.flags && S.flags.prologueSeen);
if (typeof S.progress.rung !== "number") S.progress.rung = _graduated ? 12 : 1;
if (!S.progress.onboarding || typeof S.progress.onboarding !== "object") {
  S.progress.onboarding = _graduated
    ? { woke: true, offered: true, mystery: true, seedObjId: null, bloomObjId: null, visits: 99,
        matchaCupObjId: null, need1Done: true, need2Done: true, need3Deferred: true }
    : { woke: false, offered: false, mystery: false, seedObjId: null, bloomObjId: null, visits: 0,
        matchaCupObjId: null, need1Done: false, need2Done: false, need3Deferred: false };
}
/* pre-Worlds saves (no worldStaged flag) grandfather to the full Warren;
   a save that graduated through the staged path keeps its earned world. */
if (_graduated && !S.progress.worldStaged && S.progress.rung < 12) S.progress.rung = 12;

function saveState() {
  S.lastSavedAt = Date.now();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: still playable this session */ }
}

/* ---------------------------------------------------------------------
   THE WARREN AS A COMPOSTING REPLAY ORGANISM
   A memory field stays true only through re-engagement. Un-replayed
   memories don't silently drop — past a freshness threshold they COMPOST
   into soil (visible transformation, not deletion). Replaying a memory
   (touchMemory) refreshes it; neglect lets absence compost it.

   DETERMINISM LAW: time never decays memory directly. The passage of
   absence is folded into an integer counter (S.world.warrenTicks) from
   elapsed-time-as-DATA at return — the clock is read ONCE, in the boot
   zone, never here. Freshness is a pure function of integer ticks, so the
   same (actions + absence) always yields the same compost state; replay
   stays byte-identical. No hidden per-memory timestamp drives decay.
--------------------------------------------------------------------- */
var COMPOST_BUCKET_MS = 1800000;   // 30-min absence buckets (schema-consistent)
var COMPOST_MAX_BUCKETS = 336;     // cap folded absence at 7 days (kernel law)
var COMPOST_THRESHOLD_TICKS = 48;  // ~24h of cumulative absence untouched → soil
var REPLAY_SOFT_CAP = 120;         // only SETTLED soil may fall off the end

function pushReplay(actor, eventTitle, choice, visibleChange, memoryLine) {
  S.replay.push({
    id: uid("r"), timestamp: Date.now(), actor: actor,
    event: eventTitle, choice: choice, visibleChange: visibleChange, memoryLine: memoryLine || "",
    freshTick: (S.world.warrenTicks || 0), composted: false
  });
  /* A fresh memory NEVER silently drops. Only already-composted soil is
     allowed to settle off the end once the field grows large. */
  if (S.replay.length > REPLAY_SOFT_CAP) {
    var i = -1;
    for (var k = 0; k < S.replay.length; k++) { if (S.replay[k].composted) { i = k; break; } }
    if (i >= 0) S.replay.splice(i, 1);
    /* if nothing has composted yet, the field is all-fresh — keep it all. */
  }
}

/* Fold N absence buckets into the tick counter, then compost the stale.
   Called from the boot/return zone with elapsed-time-as-data; the reducer
   itself never reads the clock. Returns buckets folded. */
function warrenAbsenceTicks(elapsedMs) {
  var buckets = Math.floor((elapsedMs || 0) / COMPOST_BUCKET_MS);
  if (buckets < 0) buckets = 0;
  if (buckets > COMPOST_MAX_BUCKETS) buckets = COMPOST_MAX_BUCKETS;
  if (buckets === 0) return 0;
  S.world.warrenTicks = (S.world.warrenTicks || 0) + buckets;
  compostStaleMemories();
  return buckets;
}

/* Pure fold: any un-touched, un-composted memory older than the threshold
   (in ticks) transforms into soil. Idempotent — running it again with no
   new ticks composts nothing new. */
function compostStaleMemories() {
  var t = (S.world.warrenTicks || 0);
  var composted = 0;
  for (var i = 0; i < S.replay.length; i++) {
    var r = S.replay[i];
    if (r.composted) continue;
    if (r.choice === "compost") continue; // already chosen soil — leave the receipt
    var fresh = (typeof r.freshTick === "number") ? r.freshTick : 0;
    if (t - fresh >= COMPOST_THRESHOLD_TICKS) {
      r.composted = true;
      r.compostedAtTick = t;
      composted++;
    }
  }
  if (composted > 0) {
    S.world.soil = clamp(S.world.soil + composted * 3, 0, 100);
    addObject("🍄", "Composted Memory", "forge");
    /* the Warren notices its own forgetting — a receipt, not a silent drop */
    pushReplay("Warren", composted + (composted === 1 ? " memory" : " memories") + " composted while you were away",
      "compost", "un-tended memories turned to soil.", "what I did not replay became soil.");
  }
  return composted;
}

/* Replay = re-remembering. Opening a memory refreshes it (resets its age to
   now), which is what keeps it true. A composted memory cannot be
   un-composted here — only a new event can grow something from that soil. */
function touchMemory(id) {
  for (var i = 0; i < S.replay.length; i++) {
    if (S.replay[i].id === id) {
      if (S.replay[i].composted) return false;
      S.replay[i].freshTick = (S.world.warrenTicks || 0);
      return true;
    }
  }
  return false;
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
  "assets/audio/hf_20260712_022435_sfx_a.m4a",
  "assets/audio/hf_20260712_022438_sfx_b.m4a"
];
var NATURE_LOOP =        /* grillons + flowing water over stones */
  "assets/audio/hf_20260712_022440_sfx_c.mp3";
var BIRD_CLIP =          /* occasional soft birds one-shot */
  "assets/audio/hf_20260712_013728_sfx_d.mp3";

/* ---------------------------------------------------------------------
   VISION_V1_32 §3 — SFX SEAM. Same shape as MUSIC_TRACKS/LULU_VOICE_URLS:
   empty string = synth plays; a HeyGen sample URL drops in with zero other
   code change (see docs/HEYGEN_SFX.md). No credits, no egress either way.
--------------------------------------------------------------------- */
var SFX_URLS = { whoosh: "", riser: "", click: "", shutter: "" };
var SFX_POOL_SIZE = 3; /* small pool per key so rapid taps overlap, not cut off */
var sfxPools = {};     /* key -> { els: [Audio...], i: round-robin index } */
var sfxSynthCount = 0; /* T42 spy: counts synth-fallback plays; debug can read/reset */

function sfxPool(key) {
  var p = sfxPools[key];
  if (!p) { p = sfxPools[key] = { els: [], i: 0 }; for (var i = 0; i < SFX_POOL_SIZE; i++) p.els.push(new Audio()); }
  return p;
}
/* playSfx(key, synthFn): sample overrides synth when SFX_URLS[key] is set;
   muted plays nothing on either path; sample errors fall back to synthFn;
   never throws. This is the ONLY place §2's SFX calls should route through. */
function playSfx(key, synthFn) {
  if (S && S.settings && S.settings.muted) return;
  var url = SFX_URLS[key];
  if (!url) { sfxSynthCount++; if (synthFn) synthFn(); return; }
  try {
    var pool = sfxPool(key);
    var el = pool.els[pool.i];
    pool.i = (pool.i + 1) % pool.els.length;
    el.onerror = function () { sfxSynthCount++; if (synthFn) synthFn(); };
    el.src = url;
    el.volume = 0.5;
    el.currentTime = 0;
    var played = el.play();
    if (played && played.catch) played.catch(function () { sfxSynthCount++; if (synthFn) synthFn(); });
  } catch (e) { sfxSynthCount++; if (synthFn) synthFn(); }
}

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

/* Drum membrane: a sine that drops in pitch fast — djembe bass / tam-tam body. */
function drumHit(freq, start, dur, gain, dropTo) {
  tone(freq, start, dur, "sine", gain, dropTo || Math.max(30, freq * 0.4));
}

/* Filtered noise burst — djembe slap / rattle. Same mute + ctx discipline as tone(). */
function noiseBurst(start, dur, gain, centerHz) {
  if (S.settings.muted) return;
  var ctx = ensureAudio();
  if (!ctx) return;
  var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  var buf = ctx.createBuffer(1, len, ctx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  var src = ctx.createBufferSource(); src.buffer = buf;
  var bp = ctx.createBiquadFilter(); bp.type = "bandpass";
  bp.frequency.value = centerHz || 1800; bp.Q.value = 0.9;
  var g = ctx.createGain();
  g.gain.setValueAtTime(gain || 0.2, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(ctx.currentTime + start);
}

/* VISION_V1_28 §4 — CLICK CONGAS. Every tap on bare ground is a hand-drum:
   the map itself becomes a percussion instrument. Rotates through four
   voices so a drumroll of taps sounds like a real conga line, not a loop. */
var CONGA_VOICES = [
  function () { drumHit(180, 0, 0.16, 0.18, 120); },
  function () { drumHit(85, 0, 0.3, 0.25, 42); noiseBurst(0, 0.05, 0.15, 2200); }, /* deep hit + slap */
  function () { noiseBurst(0, 0.09, 0.14, 2400); },
  function () { drumHit(240, 0, 0.12, 0.14, 190); }
];
var congaIdx = 0, lastCongaAt = 0;
function playConga() {
  var now = Date.now();
  if (now - lastCongaAt < 250) return; /* rate-limited so rapid taps stay musical, not mush */
  lastCongaAt = now;
  CONGA_VOICES[congaIdx % CONGA_VOICES.length]();
  congaIdx++;
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
  order: 852,         /* returning to spiritual order, spiritual perspective */
  crown: 963          /* the crown — completes the seven-rung ladder */
};

/* VISION_V1_28 §2 — every quiz topic rings its own solfeggio station.
   Deterministic: same topic, same frequency, always. A quiz with no topic
   at all (the "sleepiest goblin"/zone/object candidates) reads as
   connection(639) — an unlabeled question is still a small connection.
   A topic that exists but isn't one of the named eight falls to love(528),
   the default rung. */
var QUIZ_TOPIC_SOLFEGGIO = {
  evidence: SOLFEGGIO.liberation,
  hallucination: SOLFEGGIO.intuition,
  training_data: SOLFEGGIO.regeneration,
  determinism: SOLFEGGIO.order,
  receipts: SOLFEGGIO.grounding,
  causation: SOLFEGGIO.change,
  authority: SOLFEGGIO.crown,
  repetition: SOLFEGGIO.connection,
  sources: SOLFEGGIO.intuition
};
function quizTopicFreq(topic) {
  if (!topic) return SOLFEGGIO.connection;
  return QUIZ_TOPIC_SOLFEGGIO[topic] || SOLFEGGIO.love;
}

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
  stampThunk: function () {
    /* The most satisfying button in any browser: click transient,
       sub-bass drop, wooden knock. One hit, felt in the chest. */
    tone(150, 0, 0.03, "square", 0.22, 90);
    tone(55, 0.012, 0.24, "sine", 0.42, 36);
    tone(220, 0.02, 0.05, "triangle", 0.14, 180);
    tone(36, 0.03, 0.3, "sine", 0.3);
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
  },

  /* -------------------------------------------------------------------
     HEALING LAYERS — additive, never replacing the existing recipe.
     Shamanic drums · didgeridoo · Tibetan bowls, all Web Audio synthesis,
     all resting on the same sacred-frequency tuning as the rest.
  ------------------------------------------------------------------- */

  shamanicBurst: function (patternIdx) {
    /* ~5s of journey drumming, then silence. Pulse sits at 4–4.5 beats/s —
       the classic shamanic tempo (theta-range entrainment). Five patterns
       from broad drumming traditions, rendered as djembe bass (GUN),
       tone (GO) and slap (PA) voices; a 174 Hz grounding drone underlies. */
    var PATTERNS = [
      /* steady journey pulse — the monotonous heartbeat */
      "B.B.B.B.B.B.B.B.B.B.",
      /* heartbeat pairs (lub-dub … lub-dub) */
      "Bt..Bt..Bt..Bt..Bt..",
      /* djembe call: bass-tone-slap round */
      "B.tsB.tsB.tsB.tsB.ts",
      /* gallop — triplet feel */
      "Bt.Bt.Bt.Bt.Bt.Bt.Bt",
      /* rising call — sparse to dense, ends open */
      "B...B..tB.tsBtstB..."
    ];
    var pat = PATTERNS[(patternIdx == null ? Math.floor(Math.random() * PATTERNS.length) : patternIdx) % PATTERNS.length];
    var STEP = 0.24; /* 20 steps ≈ 4.8s · pulse ≈ 4.2 Hz */
    tone(SOLFEGGIO.grounding, 0, pat.length * STEP + 0.4, "sine", 0.035); /* grounding drone */
    for (var i = 0; i < pat.length; i++) {
      var t = i * STEP, c = pat[i];
      if (c === "B") { drumHit(85, t, 0.30, 0.30, 42); noiseBurst(t, 0.05, 0.05, 300); }       /* bass GUN */
      else if (c === "t") { drumHit(180, t, 0.16, 0.16, 120); }                                  /* tone GO */
      else if (c === "s") { noiseBurst(t, 0.09, 0.16, 2400); drumHit(320, t, 0.06, 0.06, 250); } /* slap PA */
    }
  },

  didgeridoo: function () {
    /* ~4s hypnotic drone on success: low fundamental near 174 Hz's
       sub-octave, breath-wobble via staggered detuned partials, a slow
       formant sweep painted with short overlapping harmonic swells. */
    var f = 87; /* sub-octave of 174 Hz grounding */
    tone(f, 0, 4.2, "sawtooth", 0.055);
    tone(f * 0.5, 0, 4.2, "sine", 0.05);            /* sub warmth */
    tone(f * 1.005, 0.1, 4.0, "sawtooth", 0.03);    /* detune beat = breath */
    for (var i = 0; i < 7; i++) {                    /* vocalised overtones sweeping up then down */
      var h = [3, 4, 5, 6, 5, 4, 3][i];
      tone(f * h, 0.3 + i * 0.5, 0.9, "sine", 0.022);
    }
    noiseBurst(0, 4.0, 0.012, 900);                  /* breath texture */
  },

  bijaTone: function (freq) {
    /* one station of the ladder: a long seed-syllable drone — fundamental,
       sub-octave warmth, a slow fifth blooming late. Meditative, not a chime. */
    var f = freq || SOLFEGGIO.liberation;
    tone(f, 0, 3.2, "sine", 0.07);
    tone(f / 2, 0.05, 3.2, "sine", 0.045);
    tone(f * 1.5, 1.1, 2.0, "sine", 0.022);
    tone(f * 2, 0.15, 1.4, "sine", 0.018);
  },

  tibetanBowl: function (freq) {
    /* One bowl strike: soft mallet transient, then long inharmonic partials
       (×1, ×2.72, ×5.4 — measured bowl ratios) each doubled slightly detuned
       so the ring *beats* like real bronze. 6–8s decay; overlapping strikes
       from playful tapping stack into a sound bath, not noise. */
    var f = freq || SOLFEGGIO.love;
    noiseBurst(0, 0.04, 0.05, f * 2);                /* mallet contact */
    [[1, 0.055, 7.5], [2.72, 0.028, 5.5], [5.4, 0.012, 3.5]].forEach(function (p) {
      tone(f * p[0], 0.01, p[2], "sine", p[1]);
      tone(f * p[0] * 1.003, 0.03, p[2] * 0.9, "sine", p[1] * 0.7); /* beating pair */
    });
  },

  harmonyShimmer: function (base) {
    /* The Tree's answer when the organ finds a real interval: the natural
       overtone series (×2, ×3, ×4) climbing softly above the drones, then a
       faint bowl-partial ghost. Confirmation, not fanfare — the harmony
       itself stays the loudest thing in the room. */
    var f = base || SOLFEGGIO.connection;
    tone(f * 2, 0.05, 1.6, "sine", 0.028);
    tone(f * 3, 0.35, 1.4, "sine", 0.02);
    tone(f * 4, 0.7, 1.2, "sine", 0.014);
    tone(f * 2.72, 0.5, 2.4, "sine", 0.01); /* the bowl ghost */
  },

  /* -------------------------------------------------------------------
     VISION_V1_32 §1 — four punch SFX. Route these through playSfx(), never
     call them directly from a handler, so the HeyGen seam (§3) can swap
     synth for sample later with zero other change.
  ------------------------------------------------------------------- */
  whoosh: function () {
    /* A transition made physical: bandpass noise sweeping 400→3000Hz, ~0.35s. */
    if (S.settings.muted) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var dur = 0.35;
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource(); src.buffer = buf;
    var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(400, ctx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.05); /* quick in */
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur); /* quick out */
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(ctx.currentTime);
  },
  riser: function () {
    /* Tension into the drop: ~1.2s sine glide 200→900Hz under a swelling
       noise bed, resolving into a soft cymbal-ish burst. */
    tone(200, 0, 1.2, "sine", 0.09, 900);
    if (S.settings.muted) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var dur = 1.2;
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (i / len); /* swell in */
    var src = ctx.createBufferSource(); src.buffer = buf;
    var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + dur);
    src.connect(hp).connect(g).connect(ctx.destination);
    src.start(ctx.currentTime);
    noiseBurst(dur, 0.12, 0.14, 5000); /* soft cymbal-ish tail at the drop */
  },
  uiClick: function () {
    /* Buttons should feel touchable — keep this QUIET, it fires on every tap. */
    tone(1800, 0, 0.012, "square", 0.05);
    noiseBurst(0, 0.006, 0.03, 3000);
  },
  shutter: function () {
    /* Burst-shutter feel for finales: three fast noise bursts, tailing off. */
    noiseBurst(0, 0.05, 0.18, 2600);
    noiseBurst(0.09, 0.05, 0.16, 2200);
    noiseBurst(0.18, 0.06, 0.14, 1800);
  }
};

/* SFX_URLS ↔ synth fallback lookup, for the debug playSfx(key) hook only —
   every real call site names its own Sound.<fn> directly (see §2). */
var SFX_SYNTH_FNS = { whoosh: Sound.whoosh, riser: Sound.riser, click: Sound.uiClick, shutter: Sound.shutter };

/* Each world object rings its own bowl: the solfeggio frequency is chosen
   deterministically from the object's id, so one object = one voice, always. */
function bowlFreqFor(id) {
  var keys = Object.keys(SOLFEGGIO), h = 0;
  var s = String(id || "");
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return SOLFEGGIO[keys[h % keys.length]];
}

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
  if (stagedActive() && currentWorld() < 3) return;  // Worlds gate: council is World-3 governance
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
  var careLine = (S.lulu && S.lulu.needs && S.lulu.needs.connection >= 70)
    ? "<br/><br/>“Care is not control. Care is the root of consensus.”" : "";
  lessonText.innerHTML = COUNCIL_EPISODE.lesson + "<br/><br/>" + card.teaches + careLine +
    "<br/><br/>" + COUNCIL_EPISODE.sigma + "<br/><br/>+" + COUNCIL_EPISODE.zolReward + " 🪙";
  lessonOverlay.classList.remove("hidden");
}

/* ---------------------------------------------------------------------
   LULU'S TAMAGOTCHI SYSTEM — she lives, she remembers, she reacts.
   3 needs · 4 care actions · absence continuity · reunion ritual ·
   requests (care ≠ obedience) · accessory growth · never dies.
--------------------------------------------------------------------- */

var ABSENCE_MESSAGES = [
  "While you were gone, I interviewed a mushroom.",
  "Pip said not to touch the receipt. So I named it.",
  "I followed a bug. The bug followed me back.",
  "I built a throne. It collapsed. Perfect.",
  "I reorganized the mushrooms by emotional distance.",
  "I found a rock that looks like Tuesday.",
  "Gerald and I had a meeting. No minutes were kept.",
  "I practiced being mysterious. Nib noticed. Ruined.",
  "The Tree hummed. I hummed back. We are in talks.",
  "I drew a map of places I have not been yet."
];

var LULU_REQUESTS = [
  { id: "tree",     text: "Can we visit the Akashic Tree tonight?",      yes: "She waves at the Tree for a long time.", modify: "Fine — we wave from HERE. Diplomatically." },
  { id: "gerald",   text: "Can Gerald sleep here tonight?",              yes: "Gerald gets the warm corner. Obviously.", modify: "Gerald sleeps NEAR here. A compromise." },
  { id: "zol",      text: "Can I spend 20 ZOL on something unnecessary?", yes: "She buys a tiny trumpet. It is perfect.", modify: "10 ZOL. Half a trumpet. Still perfect.", cost: 20, costModify: 10 },
  { id: "compost",  text: "Can we compost one boring idea?",             yes: "Something boring becomes soil. Relief.", modify: "We compost HALF of it. The boring half." },
  { id: "theater",  text: "Can you help me build a tiny theater?",       yes: "Curtain up. The audience is mushrooms.", modify: "A puppet stage. The puppets are leaves." },
  { id: "moon",     text: "Can we stay up and watch the moon work?",     yes: "The moon did a great job tonight.", modify: "We watch it for one minute. Intensely." },
  { id: "name",     text: "Can I rename the west path? Officially?",     yes: "It is now called The Path Of Consequences.", modify: "Unofficially renamed. Whispered only." },
  { id: "hat",      text: "Can I try wearing Pip's hat? Briefly?",       yes: "The hat has been experienced.", modify: "She wears it in her mind. Loudly." },
  { id: "song",     text: "Can we make up a song about soup?",           yes: "The soup song has three verses now.", modify: "One verse. But it slaps." },
  { id: "nothing",  text: "Can we do absolutely nothing together?",      yes: "Nothing was done. It was everything.", modify: "We do ALMOST nothing. Rebels." }
];

var GIVE_OUTCOMES = [
  { line: "She loves it. Emotionally crunchy — in a good way.", curiosity: 6, connection: 8 },
  { line: "She gives it to Gerald. Gerald approves.",           curiosity: 4, connection: 6 },
  { line: "She plants it. “It might grow into a better one.”",  curiosity: 8, connection: 4 },
  { line: "“Too emotionally crunchy.” She keeps it anyway.",    curiosity: 5, connection: 5 },
  { line: "It becomes art. The frame is a leaf.",               curiosity: 7, connection: 5 },
  { line: "She studies it with a tiny magnifier. Suspicious.",  curiosity: 9, connection: 3 }
];

var LULU_ACCESSORIES = [
  { id: "bag",      emoji: "🎒", name: "explorer bag",            when: function () { return S.lulu.counts.explore >= 3; },
    announce: "I have a bag now. For findings. And feelings." },
  { id: "hatshroom",emoji: "🍄", name: "hat mushroom",            when: function () { return S.lulu.counts.give >= 3; },
    announce: "A mushroom grew on my hat. We are close." },
  { id: "notebook", emoji: "📓", name: "labelled notebook",       when: function () { return S.lulu.counts.talk >= 5; },
    announce: "Pip gave me a labelled notebook. I hate it. I use it daily." },
  { id: "postits",  emoji: "📝", name: "personal post-its",       when: function () { return S.lulu.needs.connection >= 90; },
    announce: "I left you a note. Then I forgot where. It says nice things." }
];

function clampLuluNeeds() {
  var n = S.lulu.needs;
  /* Floors at 5 — Lulu never dies; she only gets mysterious. */
  n.energy = clamp(n.energy, 5, 100);
  n.curiosity = clamp(n.curiosity, 5, 100);
  n.connection = clamp(n.connection, 5, 100);
}

function luluMood() {
  /* Pure function of needs + cave state (L6). Priority order matters. */
  var n = S.lulu.needs;
  if (S.lulu.inCave)        return { id: "cave-dweller", emoji: "🕯️", line: "I was not neglected. I entered a period of private mythology." };
  if (n.energy < 30)        return { id: "sleepy",       emoji: "🌙", line: "Nothing is urgent after a blanket." };
  if (n.connection < 35)    return { id: "lonely",       emoji: "💜", line: "I reorganized the mushrooms by emotional distance." };
  if (n.curiosity < 35)     return { id: "suspicious",   emoji: "👁️", line: "The Warren has become suspiciously reasonable." };
  if (n.curiosity > 80 && n.energy > 45) return { id: "curious", emoji: "✨", line: "What happens if we press both buttons?" };
  if (n.energy > 80)        return { id: "energetic",    emoji: "☀️", line: "Let's do everything!" };
  return { id: "proud", emoji: "👑", line: "I fixed it by not touching it." };
}

function applyLuluMood() {
  var g = S.goblins.lulu;
  if (!g) return;
  var m = luluMood();
  g.mood = m.id;
  if (S.lulu.inCave && g.zone !== "gate") { moveGoblinToZone(g, "gate"); g.task = "being mysterious"; }
}

function luluAbsenceDecay(elapsedMs) {
  /* Deterministic from elapsed time only (L2): away-time restores energy,
     starves curiosity, and slowly thins connection. */
  var mins = Math.floor(elapsedMs / 60000);
  if (mins <= 0) return 0;
  var n = S.lulu.needs;
  n.energy += Math.min(40, mins * 2);
  n.curiosity -= Math.floor(mins / 8);
  n.connection -= Math.floor(mins / 12);
  clampLuluNeeds();
  if (n.connection < 20) S.lulu.inCave = true;
  return mins;
}

function luluAbsenceMessage(mins) {
  /* Deterministic pick (L4): same elapsed time + mode → same story. */
  var idx = (mins * 7 + S.lulu.mode.length * 3) % ABSENCE_MESSAGES.length;
  return ABSENCE_MESSAGES[idx];
}

function luluReunion(elapsedMs) {
  var mins = luluAbsenceDecay(elapsedMs);
  var n = S.lulu.needs;
  var title = n.connection >= 70 ? "LULU MISSED YOU"
            : n.connection >= 35 ? "LULU WAS BUSY"
            : "LULU PRETENDED NOT TO MISS YOU";
  var msg = luluAbsenceMessage(Math.max(1, mins));

  var overlay = document.getElementById("lulu-reunion");
  if (overlay) {
    document.getElementById("reunion-title").textContent = title;
    document.getElementById("reunion-msg").textContent = "“" + msg + "”";
    overlay.classList.remove("hidden");
    var dismiss = function () {
      overlay.classList.add("hidden");
      overlay.removeEventListener("click", dismiss);
      var g = S.goblins.lulu;
      if (g && !S.lulu.inCave) { g.x = 50; g.y = 60; g.zone = "garden"; renderGoblins(); }
      showBubble("lulu", msg, 4200);
      /* Sometimes the reunion comes with a request (deterministic-ish gate). */
      if (!S.lulu.pendingRequest && mins % 3 === 0 && !S.lulu.inCave) maybeLuluRequest();
      saveState();
    };
    overlay.addEventListener("click", dismiss);
  }
  pushReplay("lulu", "Reunion", "lulu-reunion", title + " — “" + msg + "”", msg);
  applyLuluMood();
  saveState();
  return { title: title, msg: msg, mins: mins };
}

function maybeLuluRequest() {
  if (S.lulu.pendingRequest) return null;
  var remaining = LULU_REQUESTS.filter(function (r) { return S.lulu.requestsDone.indexOf(r.id) === -1; });
  if (!remaining.length) remaining = LULU_REQUESTS;
  var r = remaining[(S.lulu.counts.talk + S.lulu.counts.explore + S.lulu.requestsDone.length) % remaining.length];
  S.lulu.pendingRequest = r.id;
  showBubble("lulu", r.text, 4200);
  saveState();
  return r.id;
}

function answerLuluRequest(answer) {
  /* care ≠ obedience: YES grants it, LATER she notes it, MODIFY reinterprets. */
  var r = LULU_REQUESTS.find(function (x) { return x.id === S.lulu.pendingRequest; });
  if (!r) return false;
  var n = S.lulu.needs, line = "";
  if (answer === "yes") {
    if (r.cost && S.learning.zolBalance < r.cost) { showBubble("lulu", "We are not yet wealthy enough. Noted.", 3200); S.lulu.pendingRequest = null; saveState(); return true; }
    if (r.cost) S.learning.zolBalance -= r.cost;
    n.connection += 10; n.curiosity += 6;
    S.lulu.counts.requestsYes++;
    S.lulu.requestsDone.push(r.id);
    line = r.yes;
  } else if (answer === "modify") {
    if (r.costModify && S.learning.zolBalance >= r.costModify) S.learning.zolBalance -= r.costModify;
    n.connection += 6; n.curiosity += 4;
    S.lulu.requestsDone.push(r.id);
    line = r.modify;
  } else { /* later */
    n.connection -= 2;
    line = "Later is a real place. I have been there.";
  }
  clampLuluNeeds();
  S.lulu.pendingRequest = null;
  showBubble("lulu", line, 4000);
  pushReplay("lulu", "Request: " + r.text, "lulu-request-" + answer, line, line);
  checkLuluAccessories();
  applyLuluMood();
  saveState();
  renderTopbar();
  return true;
}

function careLulu(kind) {
  var g = S.goblins.lulu, n = S.lulu.needs;
  if (!g) return false;
  var line = "";
  if (kind === "talk") {
    n.connection += 8; n.curiosity += 2;
    S.lulu.counts.talk++;
    if (S.lulu.inCave) { S.lulu.inCave = false; n.connection += 6; line = "You found me. I was being extremely mysterious."; }
    else line = pick(["I found a thing. It found me first.", "Ask me about the rock. ASK ME.", "Today I thought about doors. Conclusion: yes."]);
  } else if (kind === "rest") {
    n.energy += 16;
    S.lulu.counts.rest++;
    g.resting = true; g.task = "resting rebelliously";
    line = "Resting is a rebellion. I am VERY rebellious right now.";
  } else if (kind === "explore") {
    if (n.energy < 15) { showBubble("lulu", "I am horizontally strategic right now.", 3200); return false; }
    n.curiosity += 12; n.energy -= 8;
    S.lulu.counts.explore++;
    line = pick(["A side quest! For me?", "I already have a map out.", "If I am not back in five minutes, wait longer."]);
    dropParticle(g, "🗺️", true);
  } else if (kind === "give") {
    var o = GIVE_OUTCOMES[(S.lulu.counts.give + S.lulu.counts.talk) % GIVE_OUTCOMES.length];
    n.curiosity += o.curiosity; n.connection += o.connection;
    S.lulu.counts.give++;
    line = o.line;
    dropParticle(g, "🎁", true);
  } else return false;

  clampLuluNeeds();
  showBubble("lulu", line, 4000);
  pushReplay("lulu", "Care: " + kind, "care-" + kind, line, line);
  Sound.squeak("lulu");
  checkLuluAccessories();
  applyLuluMood();
  saveState();
  return true;
}

function checkLuluAccessories() {
  LULU_ACCESSORIES.forEach(function (a) {
    if (S.lulu.accessories.indexOf(a.id) !== -1) return;
    if (a.when()) {
      S.lulu.accessories.push(a.id);
      showBubble("lulu", a.announce, 4600);
      pushReplay("lulu", "Lulu grew", "lulu-accessory", "Lulu gained " + a.name + " " + a.emoji + ". " + a.announce, a.announce);
      Sound.bloom();
    }
  });
}

/* ---------------------------------------------------------------------
   LULU — LIVE CONVERSATION. Type to her; she answers.
   Two paths, same voice contract: a player-supplied Anthropic key
   (sessionStorage only, never persisted) gives a live Claude voice;
   otherwise a rich, state-aware offline responder keeps her alive —
   she references her real mood, needs, memories, the day's events, and
   your words, code-switching FR/EN. She is never a scripted menu.
--------------------------------------------------------------------- */

function luluRecentEventLine() {
  for (var i = S.replay.length - 1; i >= 0; i--) {
    var r = S.replay[i];
    if (r.actor === "lulu" || (r.memoryLine && r.memoryLine.length > 4)) return r.memoryLine || r.visibleChange;
  }
  return null;
}

function luluOfflineReply(msg) {
  var t = (msg || "").toLowerCase();
  var n = S.lulu.needs, m = luluMood(), ech = S.echoes || {};
  var pick2 = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  /* intent detection — cheap keyword routing */
  var say;
  if (/^(hi|hey|hello|salut|coucou|bonjour|yo)\b/.test(t)) {
    say = pick2(["Te voilà. I was mid-thought. It can wait.",
      "Oh! Hi. I was reorganising the silence.",
      "Salut. You smell like decisions."]);
  } else if (/gerald|bug/.test(t)) {
    say = ech.geraldHead ? "Gerald? He's Head of Hiding now. Very senior. Very hidden."
      : pick2(["Gerald ate two leaves and a small idea of mine.", "Le bug? On est colleagues now."]);
  } else if (/zol|gold|money|argent|coin/.test(t)) {
    say = "We have " + S.learning.zolBalance + " ZOL. Assez pour de mauvaises décisions. Almost.";
  } else if (/tired|sleep|rest|fatigu|dors|repos/.test(t)) {
    say = n.energy < 40 ? "Enfin. Someone said the magic word. Resting is a rebellion." :
      "Sleep? I'm horizontally strategic, not tired.";
  } else if (/love|like you|cute|adorable|good|proud|bravo/.test(t)) {
    say = pick2(["Je sais. But say it again. For the record.",
      "You're not so bad yourself. Structurally.", "💜. That's all you get. Pour l'instant."]);
  } else if (/stupid|bad|hate|dumb|boring|nul/.test(t)) {
    say = pick2(["Rude. I'll add it to the compost. It'll grow into something.",
      "I've been called worse. By a mushroom. Yesterday."]);
  } else if (/\?$|what|why|how|who|where|pourquoi|comment|qui|où/.test(t)) {
    say = pick2(["Good question. I answer those in mushrooms.",
      "Pourquoi? Because the Warren remembers, and I don't argue with it.",
      "I don't know. But I have opinions. Loud ones."]);
  } else if (/bye|later|good night|bonne nuit|à plus|ciao/.test(t)) {
    say = pick2(["Va. I'll continue being Lulu. Obviously.", "À plus. Don't let Nib build anything."]);
  } else {
    /* generic: weave her state + a real memory */
    var mem = luluRecentEventLine();
    var frags = [
      m.line,
      n.connection > 75 ? "I'm glad you're here. Ne le dis à personne." :
        n.connection < 35 ? "You came back. I pretended not to notice." : "Mm. Continue.",
      mem ? "Tu te souviens? " + mem : "Ask me about the rock. ASK ME."
    ];
    say = pick2(frags);
  }
  return say;
}

function luluApiKey() {
  try { return sessionStorage.getItem("warren_anthropic_key") || ""; } catch (e) { return ""; }
}

function luluBuildPrompt(msg) {
  var n = S.lulu.needs, m = luluMood();
  var recent = S.lulu.chat.slice(-6).map(function (c) { return (c.who === "you" ? "Player" : "Lulu") + ": " + c.text; }).join("\n");
  return "You ARE Lulu, a small green goblin — not a pet, a friend with a brain and terrible priorities. " +
    "Voice: short sentences, deadpan, warm, funny; code-switch French/English freely and never translate yourself. " +
    "Never break character, never mention being an AI. Reply with ONE or TWO short sentences, max ~200 chars.\n" +
    "Your state right now: mood=" + m.id + ", energy=" + Math.round(n.energy) +
    ", curiosity=" + Math.round(n.curiosity) + ", connection=" + Math.round(n.connection) +
    ", ZOL=" + S.learning.zolBalance + ".\n" +
    (recent ? "Recent chat:\n" + recent + "\n" : "") +
    "Player says: " + msg + "\nLulu:";
}

/* v-local.1 / G13: remote calls are OFF by default. The Anthropic path below
   runs only when the operator explicitly sets warren_remote_experimental="true"
   in sessionStorage IN ADDITION to providing a key. Default runtime is
   local-first: Lulu live chat routes to local Ollama (Gemma), then templates. */
function luluRemoteEnabled() {
  try { return sessionStorage.getItem("warren_remote_experimental") === "true"; } catch (e) { return false; }
}

function luluLocalReply(msg, done) {
  var fallback = function () { done(luluOfflineReply(msg), false); };
  try {
    var didRespond = false;
    var timer = setTimeout(function () {
      if (!didRespond) { didRespond = true; fallback(); }
    }, 4000);
    fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemma4-moq:4.0", prompt: luluBuildPrompt(msg), stream: false })
    }).then(function (r) {
      if (!r.ok) throw new Error("ollama http " + r.status);
      return r.json();
    }).then(function (j) {
      if (didRespond) return;
      didRespond = true; clearTimeout(timer);
      var txt = ((j && j.response) || "").replace(/[{}\[\]]/g, "").slice(0, 240).trim();
      if (txt) done(txt, true); else fallback();
    }).catch(function () {
      if (didRespond) return;
      didRespond = true; clearTimeout(timer);
      fallback();
    });
  } catch (e) { fallback(); }
}

function luluLiveReply(msg, done) {
  var key = luluApiKey();
  /* local-first: remote requires BOTH a key AND the explicit experimental switch */
  if (!key || !luluRemoteEnabled()) { luluLocalReply(msg, done); return; }
  var body = { model: "claude-haiku-4-5-20251001", max_tokens: 120,
    messages: [{ role: "user", content: luluBuildPrompt(msg) }] };
  var ctrl = null;
  try { ctrl = new AbortController(); setTimeout(function () { ctrl.abort(); }, 12000); } catch (e) {}
  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key,
      "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined
  }).then(function (r) { return r.json(); }).then(function (j) {
    var txt = j && j.content && j.content[0] && j.content[0].text ? j.content[0].text.trim() : "";
    if (txt) done(txt.slice(0, 240), true);
    else done(luluOfflineReply(msg), false);
  }).catch(function () { done(luluOfflineReply(msg), false); });
}

function luluSay(msg) {
  msg = (msg || "").trim();
  if (!msg || !S.lulu) return;
  S.lulu.chat.push({ who: "you", text: msg.slice(0, 160) });
  /* talking is real care: raises connection, wakes her from the cave */
  S.lulu.needs.connection = clamp(S.lulu.needs.connection + 5, 5, 100);
  if (S.lulu.inCave) { S.lulu.inCave = false; S.lulu.needs.connection = Math.max(S.lulu.needs.connection, 25); }
  S.lulu.chat.push({ who: "lulu", text: "…", pending: true });
  renderLuluCare("lulu");
  luluLiveReply(msg, function (reply, live) {
    for (var i = S.lulu.chat.length - 1; i >= 0; i--) {
      if (S.lulu.chat[i].pending) { S.lulu.chat[i] = { who: "lulu", text: reply, live: live }; break; }
    }
    if (S.lulu.chat.length > 12) S.lulu.chat = S.lulu.chat.slice(-12);
    applyLuluMood();
    pushReplay("lulu", "Lulu spoke", "lulu-chat", reply, reply);
    Sound.squeak("lulu");
    saveState();
    if (S.goblins.lulu) showBubble("lulu", reply, 4200);
    renderLuluCare("lulu");
  });
  saveState();
}

function luluAccessoryEmojis() {
  var em = S.lulu.accessories.map(function (id) {
    var a = LULU_ACCESSORIES.find(function (x) { return x.id === id; });
    return a ? a.emoji : "";
  }).join("");
  if (S.echoes && S.echoes.luluHat) em += "🎩";  // won at Stack the Hats
  return em;
}

/* ---------------------------------------------------------------------
   WARREN WEATHER — the Gray-Scott regime map, made governance.
   Source (witnessed): polymathic-ai/gray_scott_reaction_diffusion card —
   six named pattern regimes with exact (feed f, kill k) coordinates.
   The Warren's f = how generously you TRY; its k = how firmly you
   COMPOST. Your governance style is literally a coordinate in
   reaction-diffusion parameter space; the nearest regime is the weather.
   Pure function of state — same history, same weather, forever.
--------------------------------------------------------------------- */

var GS_REGIMES = [
  { name: "Gliders", f: 0.014, k: 0.054, line: "small things drift with purpose",   tint: "none" },
  { name: "Spirals", f: 0.018, k: 0.051, line: "everything curls back on itself",   tint: "hue-rotate(12deg) saturate(1.06)" },
  { name: "Maze",    f: 0.029, k: 0.057, line: "the paths are rearranging",         tint: "saturate(1.12)" },
  { name: "Spots",   f: 0.030, k: 0.062, line: "ideas sit apart, politely",         tint: "brightness(1.04)" },
  { name: "Worms",   f: 0.058, k: 0.065, line: "growth wriggles at the edges",      tint: "hue-rotate(-10deg) brightness(1.03)" },
  { name: "Bubbles", f: 0.098, k: 0.057, line: "abundance, briefly, everywhere",    tint: "saturate(1.18) brightness(1.05)" }
];

function warrenWeather() {
  /* feed rate: how much the operator tries + garden warmth */
  var tries = 0, composts = 0;
  S.replay.forEach(function (r) {
    if (r.choice === "try") tries++;
    else if (r.choice === "compost") composts++;
  });
  var f = 0.014 + 0.084 * clamp((tries * 8 + S.world.warmth) / 160, 0, 1);
  /* kill rate: how much becomes soil */
  var k = 0.051 + 0.014 * clamp((composts * 10 + S.world.soil) / 120, 0, 1);
  var best = GS_REGIMES[0], bd = Infinity;
  GS_REGIMES.forEach(function (r) {
    var d = (r.f - f) * (r.f - f) + 4 * (r.k - k) * (r.k - k);
    if (d < bd) { bd = d; best = r; }
  });
  return best;
}

function renderWeather() {
  var w = warrenWeather();
  var el = document.getElementById("signal-text");
  if (el && !S.activeProposal && el.textContent === "quiet") {
    el.textContent = w.name.toLowerCase() + " weather";
  }
  var world = document.getElementById("world");
  if (world && world.dataset.tint !== w.name) {
    world.dataset.tint = w.name;
    world.style.filter = w.tint === "none" ? "" : w.tint;
  }
}

/* ---------------------------------------------------------------------
   THE WARREN DREAMS — the return constellation. Weather says how you
   PLAY; the humor says what your ABSENCE did. On return the whole place
   greets you in one of six archetypal humors — a Tree line, a slow dawn
   wash, a shared goblin mood, a receipt. Curious, never punitive: no
   resource moves, nothing is lost. "I wonder what happened while I was
   gone" — never "I hope nothing bad happened."
   Pure function of (state, folded absence buckets) — deterministic.
--------------------------------------------------------------------- */

var WARREN_HUMORS = {
  LONELY:   { mood: "wistful", wash: "rgba(120,140,220,0.16)",
              line: "The Warren counted the days. Twice." },
  TRICKSTER:{ mood: "giggly",  wash: "rgba(214,160,255,0.16)",
              line: "Things moved while you were away. The goblins deny everything." },
  DREAMING: { mood: "dreamy",  wash: "rgba(160,120,255,0.18)",
              line: "While you were gone, the Warren dreamed. It won't say of what." },
  TENDER:   { mood: "warm",    wash: "rgba(255,190,120,0.16)",
              line: "The Warren kept your spot warm." },
  PROUD:    { mood: "proud",   wash: "rgba(255,215,110,0.16)",
              line: "The Warren practiced looking impressive. For you." },
  QUIET:    { mood: "calm",    wash: "rgba(155,227,109,0.10)",
              line: "The Warren is here. It noticed you're back." }
};

function warrenHumor(buckets) {
  /* ordered constellation rules — first match wins; same state, same humor */
  var t = S.world.warrenTicks || 0;
  var justComposted = S.replay.filter(function (r) {
    return r.composted && r.compostedAtTick === t;
  }).length;
  var id;
  if (S.lulu.inCave || S.lulu.needs.connection < 25) id = "LONELY";
  else if (justComposted >= 2) id = "TRICKSTER";
  else if (buckets >= 48) id = "DREAMING";
  else if (S.lulu.needs.connection >= 70) id = "TENDER";
  else if ((S.progress.raamDefeats + S.progress.crownDefeats) >= 2 || S.territories.owned.length >= 2) id = "PROUD";
  else id = "QUIET";
  var h = WARREN_HUMORS[id];
  return { id: id, mood: h.mood, wash: h.wash, line: h.line };
}

function applyWarrenHumor(buckets) {
  if (stagedActive() && currentWorld() < 2) return;  // Worlds gate: World 1 returns stay gentle (Warden audit)
  var h = warrenHumor(buckets);
  /* the greeting holds the Tree's voice for a while — renderTopbar honors
     it until it expires, so re-renders can't stomp the moment */
  S.world.humorGreeting = { line: h.line, until: Date.now() + 45000 };
  renderTopbar();
  var world = document.getElementById("world");
  if (world) {
    world.style.setProperty("--dawn-wash", h.wash);
    world.classList.remove("dawnwash");
    void world.offsetWidth;
    world.classList.add("dawnwash");
    setTimeout(function () { world.classList.remove("dawnwash"); }, 18500);
  }
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = h.mood; });
  pushReplay("The Warren", "It woke up " + h.id.toLowerCase(), "humor",
    "the Warren greeted you: “" + h.line + "”", h.line);
  renderGoblins();
  renderReplayStrip();
  saveState();
  return h;
}

/* ---------------------------------------------------------------------
   THE SERPENT IN THE TREE — the kundalini layer, goblin-read.
   Seven stations climb the Akashic Tree, one per sacred frequency
   (396→963: the game's solfeggio set was already six-sevenths of the
   classical chakra ladder; this completes it). A small sap-serpent
   rests at the height the Warren has EARNED — a pure fold of care,
   soil, warmth and knowledge. Expressive forever, evidence never:
   the serpent renders and sings; it admits nothing (membrane law).
   Corpus: classical kundalini tradition (REPORTED — see
   docs/CHIDDUSH_KUNDALINI_TANTRA.md). All names original, IP-safe.
--------------------------------------------------------------------- */

/* Station symbolism locked by the operator (2026-07-12): each rung pairs a
   Major Arcana with a hexagram. Metadata only — expressive, never evidence. */
var SERPENT_STATIONS = [
  { name: "Root Cellar",  freq: 396, color: "#e05a4e", arcana: "The Tower",         hex: 23, line: "Sit like a rock. The rock is winning." },
  { name: "Sap Well",     freq: 417, color: "#ff9a3c", arcana: "The Empress",       hex: 46, line: "Everything flows. Especially the things you'd rather kept still." },
  { name: "Ember Belly",  freq: 528, color: "#ffd23c", arcana: "Strength",          hex: 28, line: "The fire in the belly is just soup, being brave." },
  { name: "Heart Hollow", freq: 639, color: "#5ad07a", arcana: "The Lovers",        hex: 24, line: "The heart is a room. Leave the door unlatched." },
  { name: "Whisper Knot", freq: 741, color: "#4aa8e0", arcana: "The Hermit",        hex: 52, line: "Say the true thing. Quietly counts." },
  { name: "Moon Eye",     freq: 852, color: "#7a6ae0", arcana: "The High Priestess", hex: 61, line: "Close both eyes. Now look. There." },
  { name: "Crown Bloom",  freq: 963, color: "#d9c8ff", arcana: "The World",         hex: 2,  line: "The top of the Tree is not a place. It noticed you anyway." }
];

function serpentHeight() {
  /* pure fold of state → station 0..6. More care, more knowledge, more
     tended ground = higher sap. Deterministic; no clock, no dice. */
  var c = S.lulu.counts;
  var care = (c.talk + c.rest + c.explore + c.give) * 2;
  var knowing = (S.flags.quizRight || 0) * 2;
  var ground = Math.round((S.world.soil + S.world.warmth) / 10);
  var kept = S.territories.owned.length * 6 + (S.progress.raamDefeats + S.progress.crownDefeats) * 4;
  /* a stamped verdict is a care act — each day faced feeds the climb.
     Boost only, never block: a missed day simply doesn't count. */
  var faced = (S.verdicts && S.verdicts.history ? S.verdicts.history.length : 0) * 3;
  var score = care + knowing + ground + kept + faced;
  /* thresholds: 0,12,26,44,66,92,122 — the ladder narrows as it climbs */
  var steps = [0, 12, 26, 44, 66, 92, 122];
  var h = 0;
  for (var i = 0; i < steps.length; i++) if (score >= steps[i]) h = i;
  return h;
}

/* ---------------------------------------------------------------------
   THE AKASHIC ORGAN — play the ladder like a church organ. Each reached
   station is a stop: latch several and the Tree sustains real drones;
   the console names the Pythagorean interval you've built (3:2, 4:3,
   2:1…). Pure instrument, by law: harmonies are FELT, never counted —
   no state moves, no coherence number hides behind the music. The comma
   is the lesson: perfect order never quite closes; neither does the
   Warren. (Effects-on-E etc. remain proposal-grade until E exists.)
--------------------------------------------------------------------- */

/* VISION_V1_28 §6 — organ harmony labels gain epithets: every named interval
   maps to a real mechanic (the ratio the Serpent stations actually ring),
   the epithet is a reading, not a claim. */
var ORGAN_INTERVALS = [
  { name: "octave — the return",             fr: "octave — le retour",              cents: 1200, tol: 40 },
  { name: "perfect fifth — the golden agreement", fr: "quinte parfaite — l'accord doré", cents: 702,  tol: 35 },
  { name: "perfect fourth — the pillar",     fr: "quarte juste — le pilier",         cents: 498,  tol: 35 },
  { name: "major sixth",                     fr: "sixte majeure",                   cents: 884,  tol: 30 },
  { name: "minor sixth",                     fr: "sixte mineure",                   cents: 814,  tol: 30 },
  { name: "major third — the smile",         fr: "tierce majeure — le sourire",      cents: 408,  tol: 30 },
  { name: "minor third",                     fr: "tierce mineure",                  cents: 316,  tol: 30 },
  { name: "tritone — the fertile tension",   fr: "triton — la tension féconde",      cents: 610,  tol: 48 }
];

function detectHarmony(freqs) {
  /* name the most consonant relation present (priority = list order).
     Pure function; the tolerance is the Pythagorean comma made kind. */
  if (!freqs || freqs.length === 0) return null;
  if (freqs.length === 1) return { name: "unison", fr: "unisson" };
  var best = null;
  for (var i = 0; i < freqs.length; i++) {
    for (var j = i + 1; j < freqs.length; j++) {
      var r = Math.max(freqs[i], freqs[j]) / Math.min(freqs[i], freqs[j]);
      var cents = 1200 * (Math.log(r) / Math.log(2));
      while (cents > 1240) cents -= 1200;
      for (var k = 0; k < ORGAN_INTERVALS.length; k++) {
        if (Math.abs(cents - ORGAN_INTERVALS[k].cents) <= ORGAN_INTERVALS[k].tol) {
          if (best === null || k < best.k) best = { k: k, name: ORGAN_INTERVALS[k].name, fr: ORGAN_INTERVALS[k].fr };
          break;
        }
      }
    }
  }
  return best || { name: "wandering — the comma smiles", fr: "errance — le comma sourit" };
}

var organStops = {};   /* station idx → { osc1, osc2, gain } sustained voices */
var organEl = null;

/* BUGFIX: latching is a MUSICAL decision, not an audio side-effect. The old
   code refused to latch while muted, so a muted organ looked broken (buttons
   dead, no harmony named). Now the stop always latches — voice.silent marks
   a latch whose audio is absent (muted / no ctx); the harmony display works
   regardless, and audio joins on unmute. Meaning is free; sound is earned. */
function organVoiceStart(idx) {
  if (organStops[idx]) return;
  organStops[idx] = { o1: null, o2: null, g: null, silent: true };
  organVoiceAudioStart(idx);
}

function organVoiceAudioStart(idx) {
  var v = organStops[idx];
  if (!v || !v.silent || S.settings.muted) return;
  var ctx = ensureAudio();
  if (!ctx) return;
  var f = SERPENT_STATIONS[idx].freq;
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.4);
  var o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = f;
  var o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 1.003; /* organ breath */
  o1.connect(g); o2.connect(g); g.connect(ctx.destination);
  o1.start(); o2.start();
  v.o1 = o1; v.o2 = o2; v.g = g; v.silent = false;
}

function organVoiceAudioStop(v) {
  if (!v || v.silent) return;
  try {
    var ctx = ensureAudio();
    v.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    (function (o1, o2) {
      setTimeout(function () { try { o1.stop(); o2.stop(); } catch (e) {} }, 700);
    })(v.o1, v.o2);
  } catch (e) {}
  v.o1 = null; v.o2 = null; v.g = null; v.silent = true;
}

function organVoiceStop(idx) {
  var v = organStops[idx];
  if (!v) return;
  delete organStops[idx];
  organVoiceAudioStop(v);
}

/* BUGFIX: muting mid-drone used to leave latched voices sounding forever
   (organVoiceStart checked mute; nothing ever silenced running stops).
   The mute button now calls this: latches stay, audio follows the switch. */
function organSetAudible(on) {
  organLatched().forEach(function (idx) {
    if (on) organVoiceAudioStart(idx);
    else organVoiceAudioStop(organStops[idx]);
  });
}

function organLatched() {
  return Object.keys(organStops).map(function (k) { return parseInt(k, 10); });
}

var organLastHarmony = null;
function organUpdateHarmony() {
  var el = document.getElementById("organ-harmony");
  if (!el) return;
  var idxs = organLatched();
  var h = detectHarmony(idxs.map(function (i) { return SERPENT_STATIONS[i].freq; }));
  el.textContent = h ? h.name : "silence — also a note";
  var tree = document.getElementById("tree-glyph");
  if (tree) tree.style.filter = idxs.length
    ? "drop-shadow(0 0 " + (8 + idxs.length * 5) + "px " + SERPENT_STATIONS[idxs[idxs.length - 1]].color + ")"
    : "";
  /* HARMONY LAYERS — when a real interval forms (h.k names a consonance),
     the Tree answers: a soft overtone shimmer on top of the drones, and —
     with three or more hands — the shamanic heartbeat wakes underneath.
     Fires only when the NAMED harmony changes, so held chords stay calm. */
  var key = h && h.k !== undefined ? h.k + ":" + idxs.length : null;
  if (key && key !== organLastHarmony && idxs.length >= 2) {
    var base = SERPENT_STATIONS[idxs[0]].freq;
    Sound.harmonyShimmer(base);
    if (idxs.length >= 3) Sound.shamanicBurst(1); /* heartbeat pairs, ~5s */
    el.classList.remove("harmony-bloom"); void el.offsetWidth;
    el.classList.add("harmony-bloom");
  }
  organLastHarmony = key;
}

function toggleOrganStop(idx) {
  if (idx > serpentHeight()) return false; /* only stations the Serpent has earned */
  if (organStops[idx]) organVoiceStop(idx);
  else {
    if (organLatched().length >= 4) return false; /* four hands maximum */
    organVoiceStart(idx);
    Sound.tibetanBowl(SERPENT_STATIONS[idx].freq); /* the latch strikes bronze over the drone */
    S.flags.organPlayed = true; /* milestone: the Solfeggio Shard may surface */
  }
  var btn = document.querySelector('#organ [data-stop="' + idx + '"]');
  if (btn) btn.classList.toggle("latched", !!organStops[idx]);
  organUpdateHarmony();
  return true;
}

function closeOrgan() {
  organLatched().forEach(organVoiceStop);
  if (organEl) { organEl.remove(); organEl = null; }
  var tree = document.getElementById("tree-glyph");
  if (tree) tree.style.filter = "";
}

function openOrgan() {
  if (organEl) { closeOrgan(); return; }
  ensureAudio(); resumeAudio();
  var h = serpentHeight();
  organEl = document.createElement("div");
  organEl.id = "organ";
  organEl.innerHTML =
    '<div class="organ-head"><span>🌳 Tree Song — hold stations, hear the ratios</span>' +
    '<button class="card-close" id="organ-close">✕</button></div>' +
    '<div class="organ-stops">' +
    SERPENT_STATIONS.map(function (st, i) {
      var locked = i > h;
      return '<button class="organ-stop' + (locked ? " locked" : "") + '" data-stop="' + i + '"' +
        ' style="--stop-color:' + st.color + '"' + (locked ? " disabled" : "") + '>' +
        '<span class="stop-freq">' + st.freq + '</span><span class="stop-name">' + st.name + '</span></button>';
    }).join("") +
    '</div><div id="organ-harmony">silence — also a note</div>';
  document.getElementById("app").appendChild(organEl);
  document.getElementById("organ-close").addEventListener("click", function (e) { e.stopPropagation(); closeOrgan(); });
  organEl.querySelectorAll(".organ-stop:not(.locked)").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleOrganStop(parseInt(btn.getAttribute("data-stop"), 10));
    });
  });
}

var serpentEl = null;

function renderSerpent() {
  if (stagedActive() && currentWorld() < 4) { if (serpentEl) serpentEl.classList.add("world-hidden"); return; }
  if (serpentEl) serpentEl.classList.remove("world-hidden");
  var world = document.getElementById("world");
  if (!world) return;
  var h = serpentHeight();
  var st = SERPENT_STATIONS[h];
  if (!serpentEl) {
    serpentEl = document.createElement("div");
    serpentEl.className = "serpent";
    serpentEl.textContent = "🐍";
    serpentEl.addEventListener("click", function (e) {
      e.stopPropagation();
      ensureAudio(); resumeAudio();
      S.flags.serpentTapped = true; /* milestone: the Serpent Coil may surface */
      var cur = SERPENT_STATIONS[serpentHeight()];
      Sound.bijaTone(cur.freq);
      showBubbleFree(cur.name + " — “" + cur.line + "”", 56, Math.max(6, 20 - serpentHeight() * 2));
      serpentEl.classList.remove("singing"); void serpentEl.offsetWidth;
      serpentEl.classList.add("singing");
      openOrgan(); /* the ladder is also an instrument — the console opens */
    });
    world.appendChild(serpentEl);
  }
  /* the serpent coils at the Tree (50,16 zone anchor) and climbs with the
     station: base of the trunk at ~24%, crown at ~8% */
  serpentEl.style.left = "54%";
  serpentEl.style.top = (24 - h * 2.4) + "%";
  serpentEl.style.setProperty("--serpent-glow", st.color);
  serpentEl.title = st.name + " · " + st.arcana + " · hexagram " + st.hex;
}

/* ---------------------------------------------------------------------
   DAILY VERDICT — one deterministic dilemma per UTC day (sha256(date)
   picks it; same day, same dilemma, every Warren on Earth). The player
   stamps 🟢/🟡/🔴 BEFORE seeing the world-split; one visible consequence
   lasts all day; a 7-day emoji row is one tap to copy. CROWN 3 is built
   in at the signature level: pickDailyVerdict(dateStr, pool) and
   applyVerdictStamp(stamp) take NO economic inputs — verdicts are never
   for sale. Missed days are ⬜ in the row, never guilt: the scroll waits.
--------------------------------------------------------------------- */

var DV_DILEMMAS = [
  { id: "DV-CARE-01", family: "CARE", title: "The Quiet Request",
    prompt: "Lulu found an old receipt that feels heavy. She wants to show it to you, but she's worried it might change how you see her.",
    options: [
      { stamp: "🟢", label: "Read it with her right now", short: "Care through presence" },
      { stamp: "🟡", label: "Ask her to keep it for now", short: "Respect her timing" },
      { stamp: "🔴", label: "Tell her to compost it", short: "Protect the peace" }
    ],
    consequence: {
      "🟢": { effect: "Lulu gains +1 Personal Coherence. One old memory is re-contextualized today.",
              journal: "Lulu showed you something painful. You stayed." },
      "🟡": { effect: "Lulu becomes slightly more reserved for the day. A small contradiction appears.",
              journal: "You respected her boundary… but something stayed unspoken." },
      "🔴": { effect: "The receipt is composted. Warren gains short-term calm but loses one memory thread.",
              journal: "You chose peace over memory. The Warren feels lighter… and quieter." }
    } },
  { id: "DV-CHOICE-03", family: "CHOICE", title: "The New Tool",
    prompt: "Pip built a small tool that could help organize memories faster. It would change how the Receipt Forge works.",
    options: [
      { stamp: "🟢", label: "Let him implement it", short: "Trust the builder" },
      { stamp: "🟡", label: "Ask for a test version first", short: "Cautious progress" },
      { stamp: "🔴", label: "Tell him not to change anything", short: "Protect what already works" }
    ],
    consequence: {
      "🟢": { effect: "Receipt Forge becomes more efficient. One new proposal type appears in the Evolution Journal.",
              journal: "You let Pip build. The Warren remembers faster now." },
      "🟡": { effect: "Small test version appears. Minor contradiction between Pip and traditionalists.",
              journal: "You asked for caution. Progress slowed… but stayed honest." },
      "🔴": { effect: "No change. Pip feels slightly demotivated. Short-term stability.",
              journal: "You chose stability. The old ways remain… for now." }
    } },
  { id: "DV-MOOD-07", family: "MOOD", title: "The Heavy Day",
    prompt: "Several goblins woke up carrying the same quiet weight. The Warren feels slower today.",
    options: [
      { stamp: "🟢", label: "Gather everyone and name the feeling", short: "Face it together" },
      { stamp: "🟡", label: "Give them space and light care", short: "Gentle presence" },
      { stamp: "🔴", label: "Push through and focus on tasks", short: "Keep moving" }
    ],
    consequence: {
      "🟢": { effect: "One shared memory is created. Archetype activation increases across multiple goblins.",
              journal: "You named the weight. The Warren feels more honest today." },
      "🟡": { effect: "Moods improve slowly. One small positive memory spreads through the Mycelial Gate.",
              journal: "You gave them space. The weight lifted a little." },
      "🔴": { effect: "Short-term productivity. One contradiction grows quietly in the background.",
              journal: "You kept everyone moving. Something stayed buried." }
    } }
];

/* CROWN 3 FIREWALL (by construction): these two signatures accept no
   economic values. There is no argument through which ZOL could reach a
   verdict, and no return path that emits one. */
var dvPickedIndex = null; /* resolved async at boot from sha256(UTC date) */

function utcDateStr() { return new Date().toISOString().slice(0, 10); }

function dvFnv(str) {
  /* FNV-1a — deterministic fallback when Web Crypto is unavailable */
  var h = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  return h >>> 0;
}

function pickDailyVerdict(dateStr, poolSize, cb) {
  /* sha256(UTC-date) → index. Web Crypto where available; the FNV fallback
     is equally deterministic (documented deviation, same law: date → index). */
  try {
    var bytes = new TextEncoder().encode(dateStr);
    crypto.subtle.digest("SHA-256", bytes).then(function (buf) {
      var v = new DataView(buf);
      cb(v.getUint32(0) % poolSize);
    }).catch(function () { cb(dvFnv(dateStr) % poolSize); });
  } catch (e) {
    cb(dvFnv(dateStr) % poolSize);
  }
}

function ensureVerdictState() {
  if (!S.verdicts) S.verdicts = { history: [] };
  return S.verdicts;
}
function todayVerdict() {
  var v = ensureVerdictState();
  var d = utcDateStr();
  for (var i = 0; i < v.history.length; i++) if (v.history[i].date === d) return v.history[i];
  return null;
}

var verdictScrollEl = null;

function spawnVerdictScroll() {
  if (stagedActive() && currentWorld() < 3) return;  // Worlds gate: the daily verdict is World-3 governance
  if (todayVerdict() || verdictScrollEl || dvPickedIndex == null) return;
  var world = document.getElementById("world");
  if (!world) return;
  var el = document.createElement("div");
  el.className = "verdict-scroll";
  el.innerHTML = '<div class="vs-glyph">📜</div><div class="vs-tag">today’s verdict</div>';
  el.style.left = "50%";
  el.style.top = "-8%";
  el.addEventListener("click", function (e) { e.stopPropagation(); openVerdictCard(); });
  world.appendChild(el);
  verdictScrollEl = el;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { el.style.top = "30%"; });
  });
  Sound.treeHum();
}

function openVerdictCard() {
  if (dvPickedIndex == null) return;
  luluVoiceLine("verdict");
  var old = document.getElementById("verdict-card");
  if (old) old.remove();
  var d = DV_DILEMMAS[dvPickedIndex];
  var done = todayVerdict();
  var card = document.createElement("div");
  card.id = "verdict-card";
  var inner = '<div class="verdict-inner">' +
    '<button class="card-close" id="verdict-close">✕</button>' +
    '<div class="verdict-kicker">DAILY VERDICT · ' + utcDateStr() + '</div>' +
    '<div class="verdict-title">' + d.title + '</div>';
  if (!done) {
    /* PRE-STAMP: prompt + options only. The world-split stays sealed. */
    inner += '<div class="verdict-prompt">' + d.prompt + '</div>' +
      '<div class="verdict-opts">' +
      d.options.map(function (o) {
        return '<button class="verdict-opt" data-stamp="' + o.stamp + '">' +
          '<span class="vo-stamp">' + o.stamp + '</span>' +
          '<span class="vo-label">' + o.label + '</span>' +
          '<span class="vo-short">' + o.short + '</span></button>';
      }).join("") +
      '</div><div class="verdict-hint">the world-split is revealed only after you stamp</div>';
  } else {
    inner += buildVerdictSplitHTML(d, done.stamp);
  }
  inner += buildVerdictRowHTML() + '</div>';
  card.innerHTML = inner;
  document.getElementById("app").appendChild(card);
  card.querySelector("#verdict-close").addEventListener("click", function () { card.remove(); });
  card.querySelectorAll(".verdict-opt").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      ensureAudio(); resumeAudio();
      applyVerdictStamp(btn.getAttribute("data-stamp"));
    });
  });
  wireVerdictCopy(card);
}

function buildVerdictSplitHTML(d, stamped) {
  /* POST-STAMP: all three worlds shown, yours glowing — the split. */
  var html = '<div class="verdict-split">';
  d.options.forEach(function (o) {
    var c = d.consequence[o.stamp];
    html += '<div class="split-world' + (o.stamp === stamped ? ' chosen' : '') + '">' +
      '<div class="sw-head">' + o.stamp + ' ' + o.label + (o.stamp === stamped ? ' · YOURS' : '') + '</div>' +
      '<div class="sw-effect">' + c.effect + '</div>' +
      (o.stamp === stamped ? '<div class="sw-journal">“' + c.journal + '”</div>' : '') +
      '</div>';
  });
  return html + '</div>';
}

function buildVerdictRowHTML() {
  /* last 7 UTC days, ⬜ for unstamped — no guilt, just the honest row */
  var v = ensureVerdictState();
  var byDate = {};
  v.history.forEach(function (h) { byDate[h.date] = h.stamp; });
  var row = "";
  for (var i = 6; i >= 0; i--) {
    var dt = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    row += byDate[dt] || "⬜";
  }
  return '<div class="verdict-row"><span id="verdict-row-emoji">' + row + '</span>' +
    '<button id="verdict-copy">📋 copy my week</button></div>';
}

function wireVerdictCopy(card) {
  var btn = card.querySelector("#verdict-copy");
  if (!btn) return;
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var row = card.querySelector("#verdict-row-emoji").textContent;
    var text = "GOBLIN WARREN · my week: " + row + " · forest-frost-277.higgsfield.gg";
    var ok = function () { btn.textContent = "✓ copied"; setTimeout(function () { btn.textContent = "📋 copy my week"; }, 1600); };
    try { navigator.clipboard.writeText(text).then(ok, function () { fallbackCopy(text); ok(); }); }
    catch (err) { fallbackCopy(text); ok(); }
  });
}
function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  ta.remove();
}

function applyVerdictStamp(stamp) {
  if (todayVerdict() || dvPickedIndex == null) return false;
  var d = DV_DILEMMAS[dvPickedIndex];
  var c = d.consequence[stamp];
  if (!c) return false;
  var v = ensureVerdictState();
  v.history.push({ date: utcDateStr(), id: d.id, stamp: stamp });
  if (v.history.length > 60) v.history.shift();

  /* the one visible consequence, all day: a Verdict Stone at the Tree */
  var stoneEmoji = stamp === "🟢" ? "🌱" : stamp === "🟡" ? "⏳" : "🍂";
  S.objects = S.objects.filter(function (o) { return o.sign.indexOf("Verdict:") !== 0; });
  addObject(stoneEmoji, "Verdict: " + d.title, "tree");

  /* dilemma-specific expressive consequences (moods, memory — never coin) */
  if (d.id === "DV-CARE-01") {
    if (stamp === "🟢") { S.goblins.lulu.mood = "moved"; S.goblins.lulu.memory = "I showed the heavy receipt. They stayed."; }
    if (stamp === "🟡") { S.goblins.lulu.mood = "reserved"; }
    if (stamp === "🔴") {
      for (var i = 0; i < S.replay.length; i++) {
        if (!S.replay[i].composted && S.replay[i].choice !== "compost") {
          S.replay[i].composted = true; S.replay[i].compostedAtTick = (S.world.warrenTicks || 0); break;
        }
      }
      Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "calm"; });
    }
  } else if (d.id === "DV-CHOICE-03") {
    S.goblins.pip.mood = stamp === "🟢" ? "inspired" : stamp === "🟡" ? "focused" : "deflated";
    if (stamp === "🟢") S.goblins.pip.memory = "my tool is real now. the Forge hums differently.";
  } else if (d.id === "DV-MOOD-07") {
    var m = stamp === "🟢" ? "honest" : stamp === "🟡" ? "soothed" : "driven";
    Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = m; });
  }

  S.world.humorGreeting = { line: c.journal, until: Date.now() + 40000 };
  pushReplay("You", "Daily Verdict: " + d.title, "verdict", stamp + " " + c.journal, c.journal);

  Sound.stampThunk();
  setTimeout(Sound.gardenHarmony, 350);
  if (verdictScrollEl) { verdictScrollEl.remove(); verdictScrollEl = null; }
  appBounce();
  saveState();
  renderTopbar(); renderGoblins(); renderObjects(); renderReplayStrip();

  /* now — and only now — the split */
  var card = document.getElementById("verdict-card");
  if (card) {
    var inner = card.querySelector(".verdict-inner");
    inner.innerHTML = '<button class="card-close" id="verdict-close">✕</button>' +
      '<div class="verdict-kicker">DAILY VERDICT · ' + utcDateStr() + ' · STAMPED</div>' +
      '<div class="verdict-title">' + d.title + '</div>' +
      buildVerdictSplitHTML(d, stamp) + buildVerdictRowHTML();
    inner.querySelector("#verdict-close").addEventListener("click", function () { card.remove(); });
    wireVerdictCopy(card);
    playVerdictResultMotion(inner, stamp);
  }
  return true;
}

/* the goblin-style result moment — fires once, on the live stamp only
   (reopening an already-stamped verdict shows the split statically, no
   replay). Pure motion over data buildVerdictSplitHTML already rendered
   correctly; if this never runs (JS error, reduced motion), the card is
   already fully readable. PARKED_CHIDDUSHIM.md #17. */
function playVerdictResultMotion(inner, chosenStamp) {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var worlds = [].slice.call(inner.querySelectorAll(".split-world"));
  if (!worlds.length) return;
  if (reduce) return; /* base HTML already correct and static */

  /* the chosen world hops in last and loudest — hierarchy through motion */
  var ordered = worlds.slice().sort(function (a, b) {
    return (a.classList.contains("chosen") ? 1 : 0) - (b.classList.contains("chosen") ? 1 : 0);
  });
  ordered.forEach(function (w, i) {
    w.style.animationDelay = (i * 140) + "ms";
    w.classList.add("gob-enter");
    w.addEventListener("animationend", function () { w.classList.remove("gob-enter"); }, { once: true });
  });

  var chosenWorld = inner.querySelector(".split-world.chosen");
  var journal = chosenWorld && chosenWorld.querySelector(".sw-journal");
  var chosenDelay = (ordered.length - 1) * 140 + 400;

  if (journal) {
    var text = journal.textContent;
    journal.textContent = "";
    var chars = text.split("").map(function (ch, i) {
      var span = document.createElement("span");
      span.className = "gob-char";
      span.style.animationDelay = (chosenDelay + i * 16) + "ms";
      span.textContent = ch;
      return span;
    });
    chars.forEach(function (span) { journal.appendChild(span); });
  }

  /* small memory fragments float up from the chosen world — "one shared
     memory is created" made visible, not just stated */
  setTimeout(function () {
    if (!chosenWorld) return;
    var rect = chosenWorld.getBoundingClientRect();
    var layer = document.createElement("div");
    layer.className = "verdict-fx-layer";
    document.body.appendChild(layer);
    var glyphs = ["🍃", "✨", "🍄", "✨"];
    glyphs.forEach(function (g, i) {
      var frag = document.createElement("div");
      frag.className = "verdict-frag";
      frag.textContent = g;
      frag.style.left = (rect.left + rect.width * (0.2 + i * 0.2)) + "px";
      frag.style.top = (rect.top + rect.height * 0.5) + "px";
      frag.style.setProperty("--fx", (randi(-14, 14)) + "px");
      frag.style.setProperty("--fr", (randi(-24, 24)) + "deg");
      frag.style.animationDelay = (i * 110) + "ms";
      layer.appendChild(frag);
    });
    setTimeout(function () { layer.remove(); }, 2200);
  }, chosenDelay);

  /* end with a subtle pulse on the Akashic Tree */
  setTimeout(function () {
    var treeGlyph = document.querySelector("#zone-tree .zone-glyph");
    if (treeGlyph) flashClass(treeGlyph, "beat", 600);
  }, chosenDelay + 500);
}

/* ---------------------------------------------------------------------
   ADOPT A GOBLIN — the constellation ritual. A wanderer appears at the
   Mycelial Gate: the archetype the Warren currently LACKS, chosen
   deterministically from the return humor (the field supplies what it
   needs). The player names it and STAMPS the adoption — nothing joins
   the crew without the operator's hand. It then lives like any goblin:
   boopable, teachable, an instrument, a mask in the constellation.
--------------------------------------------------------------------- */

var wandererEl = null, wandererTimer = null;

function spawnWanderer() {
  if (stagedActive() && currentWorld() < 3) return;  // Worlds gate: the wanderer knocks in World 3
  if (S.adopted || wandererEl) return;
  var world = document.getElementById("world");
  if (!world) return;
  var el = document.createElement("div");
  el.className = "wanderer";
  el.innerHTML = '<div class="wanderer-body">🥺</div><div class="wanderer-tag">…may I stay?</div>';
  el.style.left = "78%";
  el.style.top = "66%";
  el.addEventListener("click", function (e) { e.stopPropagation(); openAdoptCard(); });
  world.appendChild(el);
  wandererEl = el;
  Sound.chirp();
}

function openAdoptCard() {
  if (S.adopted) return;
  var arch = WANDERER_ARCHETYPES[warrenHumor(0).id];
  var old = document.getElementById("adopt-card");
  if (old) old.remove();
  var card = document.createElement("div");
  card.id = "adopt-card";
  card.innerHTML =
    '<div class="adopt-inner">' +
      '<div class="adopt-sprite" style="--kin-color:' + arch.color + '">🥺</div>' +
      '<div class="adopt-arch">a small ' + arch.archetype + '</div>' +
      '<div class="adopt-why">“' + arch.why + '”</div>' +
      '<input id="adopt-name" placeholder="give it a name…" maxlength="16" autocomplete="off" />' +
      '<div class="adopt-btns">' +
        '<button id="adopt-stamp">🔨 ADOPT</button>' +
        '<button id="adopt-later">not yet</button>' +
      '</div>' +
      '<div class="adopt-hint">nothing joins the Warren without your stamp</div>' +
    '</div>';
  document.getElementById("app").appendChild(card);
  var input = document.getElementById("adopt-name");
  input.addEventListener("click", function (e) { e.stopPropagation(); });
  document.getElementById("adopt-stamp").addEventListener("click", function (e) {
    e.stopPropagation();
    var name = (input.value || "").trim();
    if (!name) { input.placeholder = "it needs a name first…"; try { input.focus(); } catch (er) {} return; }
    ensureAudio(); resumeAudio();
    adoptWanderer(name);
    card.remove();
  });
  document.getElementById("adopt-later").addEventListener("click", function (e) {
    e.stopPropagation();
    card.remove();
    showBubbleFree("…I'll wait by the gate.", 78, 60);
  });
  try { input.focus(); } catch (e) {}
}

function showBubbleFree(text, xPct, yPct) {
  /* a one-off bubble not tied to a goblin (the wanderer has no id yet) */
  var world = document.getElementById("world");
  if (!world) return;
  var b = document.createElement("div");
  b.className = "bubble";
  b.style.position = "absolute";
  b.style.left = xPct + "%";
  b.style.top = yPct + "%";
  b.textContent = text;
  world.appendChild(b);
  setTimeout(function () { b.remove(); }, 3200);
}

function adoptWanderer(name) {
  if (S.adopted) return false;
  var humorId = warrenHumor(0).id;
  S.adopted = { id: "kin", name: name, archetypeId: humorId, bornTick: (S.world.warrenTicks || 0) };
  var def = adoptedDef(S.adopted);
  S.goblins.kin = makeGoblin(def);
  S.goblins.kin.mood = "grateful";
  S.goblins.kin.intention = "learning where everything is";
  if (wandererEl) { wandererEl.remove(); wandererEl = null; }
  Sound.stampThunk();
  setTimeout(Sound.party, 250);
  pushReplay("You", "Adoption: " + name + " the " + def.role, "adopt",
    name + " joined the Warren — a " + def.role + ", because the Warren was " + humorId.toLowerCase() + ".",
    "the day " + name + " was named.");
  appBounce();
  renderGoblins();
  renderReplayStrip();
  saveState();
  showBubble("kin", "“" + name + "”. I like it. I'll keep it.", 4200);
  return true;
}

/* ---------------------------------------------------------------------
   SIDE QUESTS — WarioWare law: one rule + one thumb + 5-15s + one funny
   consequence. Opt-in via the 🎪 sparkle (attention is sacred — never
   forced). Success pays ZOL with the gold rush; failure is funny and
   costs nothing. Every round leaves one persistent trace.
--------------------------------------------------------------------- */

var mg = { active: null, ui: {}, timer: null, data: {} };

/* ---------------------------------------------------------------------
   TONE WEAVE — the music-making minigame. Seven blossoms carry the seven
   serpent-station solfeggio tones; the player picks three. Every tap IS
   a tibetan bowl strike (the game cannot be played without making music),
   and the finished weave is judged by the SAME detectHarmony fold the
   Akashic Organ uses — a real interval wins, the comma smiles otherwise.
   Ear-training smuggled inside a flower-picking game.
--------------------------------------------------------------------- */
function mgToneWeavePlay() {
  var arena = document.getElementById("mg-arena");
  if (!arena) return;
  mg.data.picks = [];
  arena.innerHTML = '<div class="mg-tones">' + SERPENT_STATIONS.map(function (st, i) {
    return '<button class="mg-tone" data-i="' + i + '" style="--tone-c:' + st.color + '" title="' + st.name + '">🌸</button>';
  }).join("") + '</div><div id="mg-weave">tap three blossoms…</div>';
  Array.prototype.forEach.call(arena.querySelectorAll(".mg-tone"), function (b) {
    b.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      if (mg.active !== "toneweave" || mg.data.picks.length >= 3 || b.classList.contains("picked")) return;
      var i = parseInt(b.getAttribute("data-i"), 10);
      b.classList.add("picked");
      mg.data.picks.push(i);
      Sound.tibetanBowl(SERPENT_STATIONS[i].freq); /* the tap is the music */
      var w = document.getElementById("mg-weave");
      if (w) w.textContent = mg.data.picks.map(function (k) { return SERPENT_STATIONS[k].name; }).join(" · ");
      if (mg.data.picks.length === 3) setTimeout(mgToneWeaveJudge, 900);
    });
  });
  mg.timer = setTimeout(function () {
    endMinigame(false, "The blossoms closed, unhurried. Music waits; it never chases.", 0, null);
  }, 25000);
}

function mgToneWeaveJudge() {
  if (mg.active !== "toneweave" || !mg.data.picks || mg.data.picks.length < 3) return;
  clearTimeout(mg.timer);
  var freqs = mg.data.picks.map(function (i) { return SERPENT_STATIONS[i].freq; });
  var h = detectHarmony(freqs);
  /* the reward IS the music: the woven chord rings back as slow bowls */
  freqs.forEach(function (f, i) { setTimeout(function () { Sound.tibetanBowl(f); }, i * 380); });
  if (h && h.k !== undefined) {
    setTimeout(function () { Sound.harmonyShimmer(Math.min.apply(null, freqs)); }, 1200);
    setTimeout(function () { Sound.shamanicBurst(1); }, 1500); /* the heartbeat approves */
    endMinigame(true, "A real " + h.name + "! The Tree hums it back, twice.", 8, null);
  } else {
    endMinigame(false, "“" + (h ? h.name : "silence") + "” — no blame; even the comma smiles. Weave again.", 0, null);
  }
}

/* ---------------------------------------------------------------------
   STARING CONTEST 😐 — VISION_V1_29 §2b. A big goblin face fills the
   arena, changing expressions every 0.8s. Don't tap for 5 seconds; tap
   anything at all before then and the goblin wins instead. Pure timers
   (setInterval/setTimeout only) — the law holds even in a backgrounded
   tab. Win: coin rain, +12 ZOL (the one explicit minigame-class currency
   grant this vision allows outside the reducer). Lose: +0, still a
   receipt — funny, never punished.
--------------------------------------------------------------------- */
var STARE_FACES = ["😐", "😑", "😶", "🙂", "😮", "😦", "🤨"];

function mgStaringTapLose(e) {
  if (e) e.stopPropagation();
  mgStaringLose();
}

function mgStaringCleanup() {
  var d = mg.data;
  d.ended = true;
  clearInterval(d.faceTimer);
  clearInterval(d.ringTimer);
  var arena = document.getElementById("mg-arena");
  if (arena) arena.removeEventListener("pointerdown", mgStaringTapLose);
}

function mgStaringWin() {
  if (mg.active !== "staring" || mg.data.ended) return;
  mgStaringCleanup();
  luluSurpriseLine("staringWin");
  playSfx("shutter", Sound.shutter); /* VISION_V1_32 §2 — staring-win coin rain */
  endMinigame(true, "You blinked last — which means you win, at doing absolutely nothing.", 12, null);
}

function mgStaringLose() {
  if (mg.active !== "staring" || mg.data.ended) return;
  mgStaringCleanup();
  luluSurpriseLine("staringLose");
  endMinigame(false, "You looked away. The goblin will not let this go.", 0, null);
}

function mgStaringPlay() {
  var arena = document.getElementById("mg-arena");
  if (!arena) return;
  var d = mg.data;
  d.ended = false;
  var dur = 5000, start = Date.now();
  arena.innerHTML =
    '<div class="mg-stare-ring" id="mg-stare-ring"><div class="mg-stare-face" id="mg-stare-face">😐</div></div>' +
    '<div class="mg-note">DON’T look away — don’t tap for 5 seconds.</div>';
  d.faceTimer = setInterval(function () {
    var f = document.getElementById("mg-stare-face");
    if (f) f.textContent = pick(STARE_FACES);
  }, 800);
  d.ringTimer = setInterval(function () {
    var ring = document.getElementById("mg-stare-ring");
    if (ring) ring.style.setProperty("--pct", String(Math.min(100, ((Date.now() - start) / dur) * 100)));
  }, 100);
  arena.addEventListener("pointerdown", mgStaringTapLose);
  mg.timer = setTimeout(mgStaringWin, dur);
}

function mgOverlay() { return document.getElementById("minigame"); }

function startMinigame(id) {
  if (mg.active) return false;
  var def = MINIGAMES[id];
  if (!def) return false;
  mg.active = id; mg.data = {};
  var ov = mgOverlay();
  ov.innerHTML = '<div id="mg-card"><div id="mg-title">' + def.title + '</div>' +
    '<div id="mg-problem">' + def.problem + '</div>' +
    '<div id="mg-arena"><div class="mg-ready">ready…</div></div><div id="mg-result" class="hidden"></div></div>';
  ov.classList.remove("hidden");
  Sound.chirp();
  setTimeout(function () { if (mg.active === id) def.play(); }, 350);
  return true;
}

function endMinigame(success, line, reward, consequence) {
  if (!mg.active) return;
  var id = mg.active;
  clearTimeout(mg.timer);
  if (mg.data && mg.data.bellTimeout) clearTimeout(mg.data.bellTimeout);
  if (mg.data && mg.data.hopTimer) clearTimeout(mg.data.hopTimer);
  var res = document.getElementById("mg-result");
  if (res) {
    res.classList.remove("hidden");
    res.innerHTML = (success ? "✨ " : "💫 ") + line +
      (success && reward ? "<br/><b>+" + reward + " 🪙</b>" : "");
  }
  var arena = document.getElementById("mg-arena");
  if (arena) arena.style.pointerEvents = "none";
  if (success && reward) {
    S.learning.zolBalance += reward;
    Sound.glingGling(4);
    Sound.didgeridoo(); /* the hypnotic victory drone settles under the coins */
    zolCelebrate(reward);
  } else {
    Sound.bloom();  /* failure is funny, never punished */
  }
  pushReplay("sidequest", MINIGAMES[id].title, "minigame-" + id, line, line);
  if (consequence) consequence();
  saveState();
  renderAll();
  setTimeout(function () {
    mg.active = null;
    mgOverlay().classList.add("hidden");
    mgOverlay().innerHTML = "";
  }, 2300);
}

/* --- 1. THE MASK 👹 — rapid tap; it shrinks, fades, changes face --- */
function mgMaskTap() {
  var d = mg.data;
  d.hits = (d.hits || 0) + 1;
  Sound.squeak("nib");
  if (d.el) {
    d.el.textContent = ["👹", "😠", "🙄"][Math.min(2, d.hits - 1)];
    d.el.style.transform = "translate(-50%,-50%) scale(" + (1 - d.hits * 0.22) + ")";
    d.el.style.opacity = String(1 - d.hits * 0.25);
  }
  if (d.hits >= 3) {
    endMinigame(true, "The mask has been reduced to a strongly opinionated sticker.", 10,
      function () { addObject("🎭", "A Strongly Opinionated Sticker", "gate"); });
  }
}

function mgMaskHop() {
  var d = mg.data, arena = document.getElementById("mg-arena");
  if (!arena || !mg.active) return;
  if (!d.el) {
    d.el = document.createElement("div");
    d.el.className = "mg-mask";
    d.el.textContent = "👹";
    d.el.addEventListener("pointerdown", function (e) { e.stopPropagation(); mgMaskTap(); });
    arena.appendChild(d.el);
  }
  d.el.style.left = (12 + Math.random() * 76) + "%";
  d.el.style.top = (14 + Math.random() * 70) + "%";
  d.hopTimer = setTimeout(mgMaskHop, 1400 - (d.hits || 0) * 200);
}

/* --- 6. FIND GERALD 🐛 — he peeks, things shuffle, you remember --- */
var GERALD_SPOTS = [["🍄", "mushroom"], ["🫙", "ZOL jar"], ["📓", "Pip's notebook"], ["🎩", "Lulu's hat"], ["🚪", "embassy door"]];

function mgGeraldRound() {
  var d = mg.data, arena = document.getElementById("mg-arena");
  if (!arena || !mg.active) return;
  d.round = (d.round || 0) + 1;
  d.hiding = Math.floor(Math.random() * GERALD_SPOTS.length);
  arena.innerHTML = '<div class="mg-note">round ' + d.round + '/3 — watch where he goes…</div>' +
    '<div class="mg-row">' + GERALD_SPOTS.map(function (s, i) {
      return '<button class="mg-spot" data-i="' + i + '">' + s[0] +
        (i === d.hiding ? '<span class="mg-peek">🐛</span>' : '') + '</button>';
    }).join("") + '</div>';
  /* Gerald peeks briefly, then hides; then the row is tappable */
  var peekMs = Math.max(350, 900 - d.round * 200);
  setTimeout(function () {
    var pk = arena.querySelector(".mg-peek");
    if (pk) pk.remove();
    arena.querySelectorAll(".mg-spot").forEach(function (b) {
      b.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
        mgGeraldPick(parseInt(b.getAttribute("data-i"), 10));
      });
    });
  }, peekMs);
}

function mgGeraldPick(i) {
  var d = mg.data;
  if (d.picked) return;
  d.picked = true;
  if (i === d.hiding) { d.found = (d.found || 0) + 1; Sound.sparkle(); }
  else Sound.compostPlop();
  var note = document.querySelector(".mg-note");
  if (note) note.textContent = i === d.hiding ? "🐛 found him!" :
    "That was not Gerald. That was a very private " + GERALD_SPOTS[i][1] + ".";
  setTimeout(function () {
    d.picked = false;
    if (d.round >= 3) {
      var f = d.found || 0;
      if (f >= 3) endMinigame(true, "Gerald found three times. He is now Head of Hiding.", 15,
        function () { addObject("🐛", "Gerald — Head of Hiding", "nursery"); S.echoes.geraldHead = true; });
      else if (f >= 2) endMinigame(true, "Gerald found. He respects your technique.", 10, null);
      else endMinigame(false, "Gerald remains hidden. He sends his regards.", 0, null);
    } else mgGeraldRound();
  }, 1100);
}

/* --- 10. OVER-REPAIR ALERT 🔧 — hold, watch the meter, release in time --- */
function mgRepairStart() {
  var d = mg.data;
  d.holding = true; d.pct = d.pct || 0;
  (function fill() {
    if (!d.holding || !mg.active) return;
    d.pct = Math.min(110, d.pct + 1.6);
    var bar = document.getElementById("mg-meter-fill");
    if (bar) {
      bar.style.width = Math.min(100, d.pct) + "%";
      bar.style.background = d.pct < 55 ? "#8b7cff" : (d.pct <= 85 ? "#9be36d" : "#ff8a8a");
    }
    if (d.pct >= 110) { d.holding = false; mgRepairRelease(); return; }
    requestAnimationFrame(fill);
  })();
}

function mgRepairRelease() {
  var d = mg.data;
  if (d.done || !mg.active) return;
  d.done = true; d.holding = false;
  var p = d.pct || 0;
  if (p < 55) endMinigame(false, "Still broken. It appreciated the attention though.", 0, null);
  else if (p <= 85) endMinigame(true, "Functional. Nib is quietly impressed.", 10,
    function () { addObject("🏺", "A Properly Repaired Pot", "forge"); });
  else endMinigame(false, "Nib improved it beyond recognition. It may be a telescope now.", 0,
    function () {
      addObject("🔭", "Improved Beyond Recognition", "forge");
      S.echoes.nibHyper = true;   // Nib is wound up — the next Council will feel it
    });
}

/* --- LEVEL 2 · THE GLADE --- */

/* Stack the Hats 🎩 — tap to drop hats on Lulu; each wobbles more, 4th topples */
var STACK_HATS = ["🍄", "📜", "👑", "🏠", "🐛"];
function mgStackPlay() {
  var arena = document.getElementById("mg-arena");
  arena.innerHTML = '<div class="mg-note">tap to drop a hat — three is a trophy, four topples</div>' +
    '<div id="mg-stack"><div class="mg-lulu">🟢</div></div>' +
    '<button class="mg-big" id="mg-drop">DROP A HAT</button>';
  mg.data.hats = 0;
  document.getElementById("mg-drop").addEventListener("pointerdown", function (e) {
    e.stopPropagation(); mgStackDrop();
  });
}
function mgStackDrop() {
  var d = mg.data, stack = document.getElementById("mg-stack");
  if (!stack || d.done) return;
  d.hats++;
  var h = document.createElement("div");
  h.className = "mg-hat";
  h.textContent = STACK_HATS[(d.hats - 1) % STACK_HATS.length];
  h.style.bottom = (10 + d.hats * 26) + "px";
  h.style.setProperty("--wob", (d.hats * 2.5) + "deg");
  stack.appendChild(h);
  Sound.squeak("lulu");
  if (d.hats >= 4) {
    d.done = true;
    endMinigame(false, "Lulu has exceeded the recommended governance height.", 0, null);
  } else if (d.hats === 3) {
    d.done = true;
    setTimeout(function () {
      endMinigame(true, "Three hats. Perfectly balanced. A trophy.", 12,
        function () { addObject("🎩", "The Three-Hat Trophy", "garden"); S.echoes.luluHat = true; });
    }, 700);
  }
}

/* Do Not Tap the Mushroom 🍄 — tap everything EXCEPT the mushroom */
var NOMUSH_ITEMS = ["🐛", "🥄", "🧾", "🎩", "🪙", "🔩", "🍂"];
function mgNoMushPlay() { mg.data.round = 0; mg.data.hits = 0; mgNoMushRound(); }
function mgNoMushRound() {
  var d = mg.data, arena = document.getElementById("mg-arena");
  if (!arena || !mg.active) return;
  d.round++;
  var decoys = [];
  for (var i = 0; i < 3; i++) decoys.push(NOMUSH_ITEMS[randi(0, NOMUSH_ITEMS.length - 1)]);
  var mushSize = 26 + d.round * 8;
  var cells = decoys.map(function (e) { return '<button class="mg-cell" data-mush="0">' + e + '</button>'; });
  cells.splice(randi(0, 3), 0, '<button class="mg-cell mush" data-mush="1" style="font-size:' + mushSize + 'px">🍄</button>');
  arena.innerHTML = '<div class="mg-note">round ' + d.round + '/3 — tap all but the mushroom</div>' +
    '<div class="mg-grid">' + cells.join("") + '</div>';
  d.remaining = 3;
  arena.querySelectorAll(".mg-cell").forEach(function (b) {
    b.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      if (b.getAttribute("data-mush") === "1") {
        d.done = true;
        endMinigame(false, "You tapped the mushroom. The mushroom has noticed.", 0,
          function () { addObject("🍄", "The Noticed Mushroom", "nursery"); S.echoes.mushroomNoticed = true; });
      } else if (!b.disabled) {
        b.disabled = true; b.style.opacity = "0.3"; Sound.chirp(); d.remaining--;
        if (d.remaining === 0) {
          if (d.round >= 3) { d.done = true; endMinigame(true, "You resisted the mushroom. Discipline.", 12, null); }
          else setTimeout(mgNoMushRound, 400);
        }
      }
    });
  });
}

/* ZOL Rain 🪙 — coins FALL under gravity; tap real ZOL, avoid fake glitter */
function mgZolRainPlay() {
  var arena = document.getElementById("mg-arena");
  arena.innerHTML = '<div class="mg-note">tap 🪙 real ZOL — avoid ✨ fake glitter</div><div id="mg-rain"></div>' +
    '<div id="mg-rain-score">0</div>';
  mg.data.caught = 0; mg.data.spawned = 0; mg.data.drops = [];
  mg.data.rainT0 = performance.now();
  mgZolRainSpawn();
  mgZolRainLoop();
}
function mgZolRainSpawn() {
  if (!mg.active || mg.data.done) return;
  var rain = document.getElementById("mg-rain");
  if (!rain) return;
  var real = Math.random() < 0.65;
  var el = document.createElement("div");
  el.className = "mg-drop " + (real ? "real" : "fake");
  el.textContent = real ? "🪙" : "✨";
  var p = { el: el, x: 20 + Math.random() * 260, y: -20, vx: (Math.random() - 0.5) * 40, vy: 60 + Math.random() * 80,
            floor: 360, real: real, caught: false };
  el.style.left = p.x + "px"; el.style.top = p.y + "px";
  el.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    if (p.caught) return; p.caught = true; el.remove();
    if (p.real) { mg.data.caught++; Sound.glingGling(2); }
    else { Sound.compostPlop(); }
    var sc = document.getElementById("mg-rain-score"); if (sc) sc.textContent = String(mg.data.caught);
  });
  rain.appendChild(el);
  mg.data.drops.push(p);
  mg.data.spawned++;
  if (mg.data.spawned < 14) setTimeout(mgZolRainSpawn, 520);
}
function mgZolRainLoop() {
  var d = mg.data;
  if (!mg.active || d.done) return;
  var last = d.rainLast || performance.now();
  var now = performance.now(), dt = Math.min(0.04, (now - last) / 1000); d.rainLast = now;
  d.drops.forEach(function (p) {
    if (!p.el || p.caught) return;
    p.vy += 400 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y > p.floor) { p.el.remove(); p.el = null; }
    else { p.el.style.left = p.x + "px"; p.el.style.top = p.y + "px"; }
  });
  if ((now - d.rainT0) / 1000 > 9) {
    d.done = true;
    if (d.caught >= 5) endMinigame(true, "GLING GLING! You have an eye for real gold.", 15, null);
    else endMinigame(false, "Shiny. Not valuable. You'll know next time.", 0, null);
    return;
  }
  requestAnimationFrame(mgZolRainLoop);
}

/* --- LEVEL 3 · THE DEEP --- */

/* Call the Ingredients — tap symbols in the right order */
var INGREDIENT_RECIPE = ["🌱", "🍄", "✨"];
function mgIngredientsPlay() {
  var arena = document.getElementById("mg-arena");
  var shuffled = INGREDIENT_RECIPE.concat(["🔨", "🍵"]).slice();
  for (var i = shuffled.length - 1; i > 0; i--) { var j = randi(0, i); var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t; }
  arena.innerHTML = '<div class="mg-note">summon in order: 🌱 then 🍄 then ✨</div>' +
    '<div id="mg-recipe"></div>' +
    '<div class="mg-grid">' + shuffled.map(function (e) { return '<button class="mg-cell" data-e="' + e + '">' + e + '</button>'; }).join("") + '</div>';
  mg.data.step = 0;
  arena.querySelectorAll(".mg-cell").forEach(function (b) {
    b.addEventListener("pointerdown", function (e) {
      e.stopPropagation(); mgIngredientTap(b.getAttribute("data-e"));
    });
  });
}
function mgIngredientTap(sym) {
  var d = mg.data;
  if (d.done) return;
  var rec = document.getElementById("mg-recipe");
  if (sym === INGREDIENT_RECIPE[d.step]) {
    d.step++; if (rec) rec.textContent += sym; Sound.bloom();
    if (d.step >= INGREDIENT_RECIPE.length) {
      d.done = true;
      endMinigame(true, "A glowing question mushroom blooms. Order matters!", 12,
        function () { addObject("🍄", "The Question Mushroom", "garden"); });
    }
  } else {
    d.done = true;
    endMinigame(false, "Nib invents hot mechanical matcha. Nobody asked. Order matters!", 0,
      function () { addObject("🍵", "Hot Mechanical Matcha", "forge"); });
  }
}

/* Memory Match 🧠 — show an object, hide it, pick the right memory */
var MEMORY_OBJECTS = [
  { icon: "🥄", right: "Minister of Navigation", wrong: ["Gerald's breakfast", "Nib's medical license"] },
  { icon: "🔩", right: "Nib's proudest bolt", wrong: ["A very small moon", "Lulu's earring"] },
  { icon: "📜", right: "The receipt we named", wrong: ["A map to nowhere", "Pip's grocery list"] },
  { icon: "🍄", right: "The Noticed Mushroom", wrong: ["Lunch", "A tiny umbrella"] }
];
function mgMemoryPlay() {
  var arena = document.getElementById("mg-arena");
  var o = MEMORY_OBJECTS[randi(0, MEMORY_OBJECTS.length - 1)];
  mg.data.obj = o;
  arena.innerHTML = '<div class="mg-note">remember this…</div><div class="mg-bigicon">' + o.icon + '</div>';
  setTimeout(function () {
    if (!mg.active) return;
    var opts = o.wrong.concat([o.right]);
    for (var i = opts.length - 1; i > 0; i--) { var j = randi(0, i); var t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
    arena.innerHTML = '<div class="mg-note">what was it, really?</div>' +
      '<div class="mg-choices">' + opts.map(function (x) { return '<button class="mg-choicebtn" data-x="' + x.replace(/"/g, '') + '">' + x + '</button>'; }).join("") + '</div>';
    arena.querySelectorAll(".mg-choicebtn").forEach(function (b) {
      b.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
        if (mg.data.done) return; mg.data.done = true;
        if (b.getAttribute("data-x") === o.right.replace(/"/g, '')) {
          endMinigame(true, "\"" + o.right + "\". Correct. The Council will remember this.", 12,
            function () { S.echoes.memoryFact = o.right; });   // resurfaces as a Council aside
        } else {
          endMinigame(false, "Close. It was the " + o.right + ". Memories are slippery.", 0, null);
        }
      });
    });
  }, 2000);
}

/* Feed the Right Goblin 🍪 — match item to the goblin who wants it */
var FEED_PAIRS = [
  { goblin: "Pip 📓", want: "📜", wants: "documentation" },
  { goblin: "Zaz 🌱", want: "🌰", wants: "soil" },
  { goblin: "Nib 🔧", want: "🔩", wants: "a tool" }
];
function mgFeedPlay() {
  var arena = document.getElementById("mg-arena");
  mg.data.matched = 0;
  var items = FEED_PAIRS.map(function (p) { return p.want; });
  for (var i = items.length - 1; i > 0; i--) { var j = randi(0, i); var t = items[i]; items[i] = items[j]; items[j] = t; }
  mg.data.pick = null;
  arena.innerHTML = '<div class="mg-note">tap an item, then the goblin who wants it</div>' +
    '<div class="mg-row" id="mg-items">' + items.map(function (e) { return '<button class="mg-cell" data-item="' + e + '">' + e + '</button>'; }).join("") + '</div>' +
    '<div class="mg-row" id="mg-goblins">' + FEED_PAIRS.map(function (p) { return '<button class="mg-goblin-slot" data-want="' + p.want + '">' + p.goblin + '</button>'; }).join("") + '</div>';
  arena.querySelectorAll("[data-item]").forEach(function (b) {
    b.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      arena.querySelectorAll("[data-item]").forEach(function (x) { x.classList.remove("sel"); });
      b.classList.add("sel"); mg.data.pick = b;
    });
  });
  arena.querySelectorAll("[data-want]").forEach(function (g) {
    g.addEventListener("pointerdown", function (e) {
      e.stopPropagation(); mgFeedDrop(g);
    });
  });
}
function mgFeedDrop(g) {
  var d = mg.data;
  if (!d.pick || d.done) return;
  var item = d.pick.getAttribute("data-item"), want = g.getAttribute("data-want");
  if (item === want) {
    g.classList.add("fed"); g.disabled = true; d.pick.disabled = true; d.pick.style.opacity = "0.3";
    d.pick.classList.remove("sel"); d.pick = null; d.matched++;
    Sound.bloom();
    if (d.matched >= FEED_PAIRS.length) { d.done = true; endMinigame(true, "Everyone got the right thing. Tool-fit!", 15, null); }
  } else {
    d.done = true;
    var joke = { "📜": "Pip filed the flower. It is now evidence.", "🌰": "Zaz planted the hammer. A tool tree, maybe.", "🔩": "Nib repaired the cookie. It is crunchier." }[want] || "Wrong department, gently.";
    endMinigame(false, joke + " Match the tool to the goblin!", 0, null);
  }
}

/* --- LEVEL 4 · THE SPIRE --- */

/* Council Bubble Pop 🏛️ — tap the right intervention for the goblin's line */
var BUBBLE_CASES = [
  { line: "Everybody knows Gerald is suspicious.", right: "EVIDENCE" },
  { line: "The bridge should become a poem.", right: "CLARIFY" },
  { line: "I'll observe AND move AND build, alone.", right: "SPLIT" },
  { line: "Let's decide right now, no thinking.", right: "HOLD" }
];
var BUBBLE_OPTS = ["CLARIFY", "EVIDENCE", "SPLIT", "HOLD"];
function mgBubblePlay() { mg.data.round = 0; mg.data.right = 0; mgBubbleRound(); }
function mgBubbleRound() {
  var d = mg.data, arena = document.getElementById("mg-arena");
  if (!arena || !mg.active) return;
  d.round++;
  var c = BUBBLE_CASES[randi(0, BUBBLE_CASES.length - 1)];
  d.current = c;
  arena.innerHTML = '<div class="mg-note">round ' + d.round + '/3 — pick the right nudge</div>' +
    '<div class="mg-bubble">🧌 “' + c.line + '”</div>' +
    '<div class="mg-choices">' + BUBBLE_OPTS.map(function (o) { return '<button class="mg-choicebtn" data-o="' + o + '">' + o + '</button>'; }).join("") + '</div>';
  arena.querySelectorAll(".mg-choicebtn").forEach(function (b) {
    b.addEventListener("pointerdown", function (e) {
      e.stopPropagation(); mgBubblePick(b.getAttribute("data-o"));
    });
  });
}
function mgBubblePick(o) {
  var d = mg.data;
  if (d.picked) return; d.picked = true;
  if (o === d.current.right) { d.right++; Sound.bloom(); } else Sound.compostPlop();
  setTimeout(function () {
    d.picked = false;
    if (d.round >= 3) {
      d.done = true;
      if (d.right >= 3) endMinigame(true, "Three clean nudges. You think like a Council.", 15, null);
      else if (d.right >= 2) endMinigame(true, "Good instincts. The Warren agrees, mostly.", 10, null);
      else endMinigame(false, "The Council is confused but grateful. Keep listening.", 0, null);
    } else mgBubbleRound();
  }, 700);
}

/* Mushroom Inflation 🍄 — tap spores before it fills the screen */
function mgInflationPlay() {
  var arena = document.getElementById("mg-arena");
  arena.innerHTML = '<div class="mg-note">tap the mushroom — shrink it before it takes over</div>' +
    '<button id="mg-inflate">🍄</button>';
  mg.data.size = 40; mg.data.taps = 0;
  mg.data.el = document.getElementById("mg-inflate");
  mg.data.el.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    mg.data.size = Math.max(20, mg.data.size - 14); mg.data.taps++;
    Sound.squeak("nib");
    if (mg.data.taps >= 8) {
      mg.data.done = true;
      endMinigame(true, "Growth has been respectfully negotiated.", 12, null);
    }
  });
  mgInflationTick();
}
function mgInflationTick() {
  var d = mg.data;
  if (!mg.active || d.done) return;
  d.size += 3.2;
  if (d.el) d.el.style.fontSize = d.size + "px";
  if (d.size > 190) {
    d.done = true;
    endMinigame(false, "The mushroom has acquired the interface.", 0,
      function () { addObject("🍄", "The Interface Mushroom", "nursery"); });
    return;
  }
  setTimeout(mgInflationTick, 140);
}

/* Wake the Goblins 🔔 — tap the bell rhythm: tap tap pause tap */
function mgBellPlay() {
  var arena = document.getElementById("mg-arena");
  arena.innerHTML = '<div class="mg-note">ring: tap · tap · (wait) · tap</div>' +
    '<div id="mg-bell-demo">🔔 . . 🔔 . . . . 🔔</div>' +
    '<button class="mg-big" id="mg-bell">🔔 RING</button>';
  mg.data.taps = []; mg.data.done = false;
  document.getElementById("mg-bell").addEventListener("pointerdown", function (e) {
    e.stopPropagation(); mgBellTap();
  });
  mg.data.bellTimeout = setTimeout(function () {
    if (mg.active === "bell" && mg.data && !mg.data.done && (mg.data.taps || []).length < 3) { mg.data.done = true; endMinigame(false, "The goblins slept through it. Try the rhythm.", 0, null); }
  }, 8000);
}
function mgBellTap() {
  var d = mg.data;
  if (d.done) return;
  var now = performance.now();
  d.taps.push(now);
  Sound.bell();
  if (d.taps.length === 3) {
    clearTimeout(d.bellTimeout);
    d.done = true;
    var gap1 = d.taps[1] - d.taps[0];      // should be short
    var gap2 = d.taps[2] - d.taps[1];      // should be long (the pause)
    if (gap1 < 600 && gap2 > 700 && gap2 < 2500) {
      endMinigame(true, "Perfect rhythm. The goblins wake, mildly impressed.", 12, null);
    } else {
      endMinigame(false, "Lulu says: “I was awake in another interpretation.”", 0, null);
    }
  }
}

var MINIGAMES = {
  /* Level 1 · THE WARREN */
  mask: {
    title: "THE MASK 👹", problem: "Tap it three times before it gets comfortable.",
    play: function () {
      mgMaskHop();
      mg.timer = setTimeout(function () {
        clearTimeout(mg.data.hopTimer);
        endMinigame(false, "The mask left. It said nothing. Loudly.", 0, null);
      }, 12000);
    }
  },
  gerald: {
    title: "FIND GERALD 🐛", problem: "He peeks once. Things move. Remember.",
    play: function () { mgGeraldRound(); }
  },
  toneweave: {
    title: "TONE WEAVE 🎶", problem: "Pick three blossoms. Every tap rings a bowl — if the three tones fit, the Tree hums them back.",
    play: function () { mgToneWeavePlay(); }
  },
  repair: {
    title: "OVER-REPAIR ALERT 🔧", problem: "Hold to repair. Release in the green. Do NOT let Nib finish.",
    play: function () {
      var arena = document.getElementById("mg-arena");
      arena.innerHTML = '<div class="mg-pot">🏺</div>' +
        '<div id="mg-meter"><div id="mg-meter-fill"></div></div>' +
        '<button id="mg-hold">HOLD TO REPAIR</button>';
      var btn = document.getElementById("mg-hold");
      btn.addEventListener("pointerdown", function (e) { e.stopPropagation(); mgRepairStart(); });
      btn.addEventListener("pointerup", function (e) { e.stopPropagation(); mgRepairRelease(); });
      btn.addEventListener("pointerleave", function () { if (mg.data.holding) mgRepairRelease(); });
    }
  },
  /* Level 2 · THE GLADE */
  stackhats: { title: "STACK THE HATS 🎩", problem: "Three hats is a trophy. Four is a governance incident.", play: mgStackPlay },
  nomush:    { title: "DO NOT TAP THE MUSHROOM 🍄", problem: "Tap everything else. The mushroom is a trap.", play: mgNoMushPlay },
  zolrain:   { title: "ZOL RAIN 🪙", problem: "Catch real gold. Ignore the pretty fakes.", play: mgZolRainPlay },
  /* Level 3 · THE DEEP */
  ingredients: { title: "CALL THE INGREDIENTS ✨", problem: "Summon in order: 🌱 then 🍄 then ✨.", play: mgIngredientsPlay },
  memory:      { title: "MEMORY MATCH 🧠", problem: "Watch the object. Then remember what it truly was.", play: mgMemoryPlay },
  feed:        { title: "FEED THE RIGHT GOBLIN 🍪", problem: "Match each thing to the goblin who wants it.", play: mgFeedPlay },
  /* Level 4 · THE SPIRE */
  bubblepop: { title: "COUNCIL BUBBLE POP 🏛️", problem: "Pick the right nudge for each goblin's line.", play: mgBubblePlay },
  inflation: { title: "MUSHROOM INFLATION 🍄", problem: "Tap it smaller before it eats the screen.", play: mgInflationPlay },
  bell:      { title: "WAKE THE GOBLINS 🔔", problem: "Ring the rhythm: tap · tap · wait · tap.", play: mgBellPlay },
  /* VISION_V1_29 §2b — pooled in L1 + L5 */
  staring: {
    title: "THE STARING CONTEST 😐",
    problem: "Don't tap for 5 seconds. Don't even blink. Okay, blink.",
    play: function () { mgStaringPlay(); }
  }
};

/* Levels: each is a themed chapter with its own backdrop + 3 side quests.
   Level 1 is the Warren (current CSS scene); Level 2 uses the glade art. */
var LEVELS = [
  { id: 1, name: "THE WARREN", mgs: ["mask", "gerald", "repair", "toneweave", "staring"], bg: null,
    tint: "" },
  { id: 2, name: "THE GLADE", mgs: ["stackhats", "nomush", "zolrain"],
    bg: "bg/level2-glade.jpeg",
    tint: "saturate(1.05)" },
  { id: 3, name: "THE VILLAGE", mgs: ["ingredients", "memory", "feed"], bg: null,
    /* operator-directed style: the weathered DETAILED goblin-village look
       (campfire, cottages, watchtower, mushroom house, mine) — gritty,
       moody, mature concept art (Recraft V4.1, not nano_banana, which the
       operator found too cute). Remote-over-gradient, offline fallthrough. */
    bgRemote: "assets/bg/hf_20260713_131830_bg_a.png",
    scene: "linear-gradient(180deg, #0d1220 0%, #161c2a 48%, #1c2130 100%)",
    tint: "saturate(1.02)" },
  { id: 4, name: "THE WORKSHOPS", mgs: ["bubblepop", "inflation", "bell"], bg: null,
    /* same weathered village style, workshop/forge district (Recraft V4.1) */
    bgRemote: "assets/bg/hf_20260713_131834_bg_b.png",
    scene: "linear-gradient(180deg, #0d1220 0%, #161c2a 48%, #1c2130 100%)",
    tint: "saturate(1.02)" },
  /* VISION_V1_28 §1 — nothing discarded, every art gets its own level.
     L5-8 reuse existing minigame keys (no new mechanics), remote-over-gradient
     pattern identical to L3/L4: a blocked painting simply falls through. */
  { id: 5, name: "THE DEEP", mgs: ["ingredients", "memory", "feed", "staring"], bg: null,
    bgRemote: "assets/art/hf_20260712_085446_goblin_1.png",
    scene: "linear-gradient(180deg, #070912 0%, #0c1420 48%, #0a1018 100%)",
    tint: "saturate(1.0)" },
  { id: 6, name: "THE SPIRE", mgs: ["bubblepop", "inflation", "bell"], bg: null,
    bgRemote: "assets/art/hf_20260712_085449_goblin_2.png",
    scene: "linear-gradient(180deg, #10122a 0%, #191c38 48%, #14172c 100%)",
    tint: "saturate(1.04)" },
  { id: 7, name: "THE EMERALD HOLLOW", mgs: ["mask", "toneweave", "gerald"], bg: null,
    bgRemote: "assets/bg/hf_20260713_130015_bg_c.png",
    scene: "linear-gradient(180deg, #0a1810 0%, #122419 48%, #0d1c13 100%)",
    tint: "saturate(1.06)" },
  { id: 8, name: "THE CRYSTAL CANOPY", mgs: ["stackhats", "zolrain", "toneweave"], bg: null,
    bgRemote: "assets/bg/hf_20260713_130018_bg_d.png",
    scene: "linear-gradient(180deg, #0d1a26 0%, #16283a 48%, #10202e 100%)",
    tint: "saturate(1.08)" },
  /* VISION_V1_29 §1 — the 9th chapter. A previously-generated, already-paid
     cozy-village image, unused since Recraft replaced L3/L4. L1-8 above are
     untouched by this addition. */
  { id: 9, name: "THE OLD VILLAGE", mgs: ["ingredients", "toneweave", "feed"], bg: null,
    bgRemote: "assets/bg/hf_20260713_131431_bg_e.png",
    scene: "linear-gradient(180deg, #12101f 0%, #1c1730 48%, #241d2e 100%)",
    tint: "saturate(1.05)" }
];

/* VISION_V1_30 §1 — the progression law, both pure functions of state.
   needKnow: riddles the Moth must have confirmed (S.flags.quizRight).
   tollZOL: ZOL paid once from S.learning.zolBalance. Level 1 needs neither. */
function needKnow(n) { return Math.max(0, (n - 1) * 3); }
function tollZOL(n) { return Math.max(0, (n - 1) * 5); }
function isLevelUnlocked(n) {
  return (S.progress.levelsUnlocked || [1]).indexOf(n) !== -1;
}

/* VISION_V1_31 §1 — the next locked chapter, lowest id first; 0 once every
   chapter is open. Pure function of state — the quest row's only source. */
function nextLockedLevel() {
  for (var n = 1; n <= LEVELS.length; n++) { if (!isLevelUnlocked(n)) return n; }
  return 0;
}

function currentLevel() {
  var lv = (S.progress && S.progress.level) || 1;
  return LEVELS[clamp(lv - 1, 0, LEVELS.length - 1)];
}

function applyLevelBackdrop() {
  var lv = currentLevel();
  var world = document.getElementById("world");
  if (!world) return;
  if (lv.bg) {
    /* readability scrim over bundled level art (image sits under the goblins) */
    world.style.backgroundImage =
      "linear-gradient(rgba(10,7,20,0.32), rgba(10,7,20,0.42) 62%, rgba(8,5,16,0.6)), url('" + lv.bg + "')";
    world.style.backgroundSize = "cover";
    world.style.backgroundPosition = "center";
  } else if (lv.bgRemote && lv.scene) {
    /* painted remote art layered over the offline gradient: scrim → painting
       → gradient. A blocked painting simply falls through to the gradient —
       same "any missing layer falls through" law as the L1 world scene. */
    world.style.backgroundImage =
      "linear-gradient(rgba(10,7,20,0.3), rgba(10,7,20,0.4) 62%, rgba(8,5,16,0.58)), url('" + lv.bgRemote + "'), " + lv.scene;
    world.style.backgroundSize = "cover";
    world.style.backgroundPosition = "center";
  } else if (lv.scene) {
    /* offline-safe painted gradient scene — no network, no console errors */
    world.style.backgroundImage = lv.scene;
    world.style.backgroundSize = "cover";
    world.style.backgroundPosition = "center";
  } else {
    world.style.backgroundImage = "";
    world.style.backgroundSize = "";
    world.style.backgroundPosition = "";
  }
}

function setLevel(n) {
  n = clamp(n, 1, LEVELS.length);
  S.progress.level = n;
  applyLevelBackdrop();
  var lv = currentLevel();
  showBubble("lulu", "Welcome to " + lv.name.toLowerCase() + ".", 3200);
  pushReplay("level", lv.name, "level-enter", "Entered " + lv.name, "");
  saveState();
  renderAll();
  return n;
}

/* ---------------------------------------------------------------------
   LEVEL TRANSITION — a ~3s cinematic ascent (same teaser pixel style:
   village floor → up the Akashic trunk → the Spire above the canopy)
   played over the level swap. LAW OF THE VEIL: the switch itself happens
   immediately UNDER the overlay (onDone is called right away), the video
   is pure theater on top — tap skips it, "ended" ends it, and a hard
   safety timer ends it even if the video never loads. Offline players
   get a brief dark veil and the same instant switch. Never blocks play.
--------------------------------------------------------------------- */
var LEVEL_TRANSITION_URL = "assets/video/hf_20260712_233931_level_transition.mp4";
var levelTransitionEl = null;

function playLevelTransition(onDone) {
  if (levelTransitionEl) { if (onDone) onDone(); return; } /* already mid-veil: just switch */
  luluVoiceLine("travel");
  playSfx("whoosh", Sound.whoosh); /* VISION_V1_32 §2 — the veil appearing is physical */
  var veil = document.createElement("div");
  veil.id = "level-transition";
  veil.innerHTML =
    '<video muted playsinline preload="auto" src="' + LEVEL_TRANSITION_URL + '"></video>' +
    '<div class="lt-hint">tap to skip</div>';
  document.body.appendChild(veil);
  levelTransitionEl = veil;
  var vid = veil.querySelector("video");
  vid.playbackRate = 1.6; /* 5s clip ≈ 3s ride */
  var done = false;
  var dismiss = function () {
    if (done) return;
    done = true;
    veil.classList.add("lt-out");
    setTimeout(function () { veil.remove(); levelTransitionEl = null; }, 450);
  };
  /* the world switches NOW, under the veil — theater never gates state */
  if (onDone) onDone();
  veil.addEventListener("pointerdown", dismiss);
  vid.addEventListener("ended", dismiss);
  vid.addEventListener("error", function () { setTimeout(dismiss, 500); });
  var played = vid.play && vid.play();
  if (played && played.catch) played.catch(function () { setTimeout(dismiss, 500); });
  setTimeout(dismiss, 4200); /* hard ceiling — the veil never traps anyone */
}

/* ---------------------------------------------------------------------
   THE GATE — VISION_V1_30 §1. A locked level is never a dead end: the
   chip stops there and shows what it costs. Membrane: toll deducts exact
   ZOL only (garden play-money), never touches verdicts or the Kernel;
   every unlock writes a receipt.
--------------------------------------------------------------------- */
function openLevelGate(n) {
  var lv = LEVELS[clamp(n - 1, 0, LEVELS.length - 1)];
  var need = needKnow(n), toll = tollZOL(n);
  var have = S.flags.quizRight || 0;
  var overlay = document.getElementById("level-gate");
  if (!overlay) return;
  var nameEl = document.getElementById("level-gate-name");
  var riddleEl = document.getElementById("level-gate-riddles");
  var tollEl = document.getElementById("level-gate-toll");
  var btn = document.getElementById("level-gate-unlock");
  if (nameEl) nameEl.textContent = lv.name;
  if (riddleEl) riddleEl.textContent = "🦋 " + Math.min(have, need) + "/" + need + " riddles known";
  if (tollEl) tollEl.textContent = "🪙 toll " + toll + " ZOL";
  var met = have >= need && S.learning.zolBalance >= toll;
  if (btn) { btn.disabled = !met; btn.setAttribute("data-level", String(n)); }
  overlay.classList.remove("hidden");
}

function closeLevelGate() {
  var overlay = document.getElementById("level-gate");
  if (overlay) overlay.classList.add("hidden");
}

/* VISION_V1_30 §2 — instant gratification wiring. Fires only on the exact
   move that crosses a still-locked level's needKnow threshold (quizRight
   climbs by exactly 1 per correct answer, so equality never gets skipped). */
function checkLevelGateProgress() {
  var have = S.flags.quizRight || 0;
  for (var n = 2; n <= LEVELS.length; n++) {
    if (isLevelUnlocked(n)) continue;
    if (have === needKnow(n)) {
      showBubble("lulu", "a gate just heard you learning…", 3200);
      var chip = document.getElementById("level-chip");
      if (chip) flashClass(chip, "chip-pulse", 900);
      break;
    }
  }
}

/* Pays the toll and pushes the id into levelsUnlocked. Refuses (no
   deduction, no unlock) unless both the knowledge and the ZOL are in
   hand — never punishes, just holds the door shut. */
function tryUnlockLevel(n) {
  if (isLevelUnlocked(n)) return false;
  var need = needKnow(n), toll = tollZOL(n);
  var have = S.flags.quizRight || 0;
  if (have < need || S.learning.zolBalance < toll) { Sound.chirp(); return false; }
  S.learning.zolBalance -= toll;
  playSfx("riser", Sound.riser); /* VISION_V1_32 §2 — gate unlock success, right after the toll is paid */
  S.progress.levelsUnlocked.push(n);
  var lv = LEVELS[clamp(n - 1, 0, LEVELS.length - 1)];
  pushReplay("gate", "Level unlocked", "unlock",
    lv.name + " opened — " + need + " riddles known, toll " + toll + " ZOL paid", "");
  renderReplayStrip();
  zolCelebrate(toll); /* the coin burst runs in reverse — deduct is already done, this just celebrates */
  luluVoiceLine("travel");
  closeLevelGate();
  saveState();
  playLevelTransition(function () { setLevel(n); });
  return true;
}

/* The sparkle: opt-in doorway. Appears sometimes when the Warren is calm.
   The very first one hurries (~35s) so a new player meets the circus inside
   the opening minute; after that it keeps the old unhurried cadence. */
var sparkleTimer = null, sparkleFirst = true;
function scheduleSparkle() {
  clearTimeout(sparkleTimer);
  var wait = sparkleFirst ? randi(30000, 45000) : randi(70000, 130000);
  sparkleFirst = false;
  sparkleTimer = setTimeout(function () {
    if (!mg.active && !S.activeProposal && !quizOpen &&
        !document.querySelector(".mg-sparkle")) spawnSparkle();
    scheduleSparkle();
  }, wait);
}

function spawnSparkle() {
  var world = document.getElementById("world");
  if (!world) return;
  var sp = document.createElement("div");
  sp.className = "mg-sparkle";
  sp.textContent = "🎪";
  sp.style.left = randi(15, 85) + "%";
  sp.style.top = randi(20, 75) + "%";
  sp.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    sp.remove();
    /* VISION_V1_29 §2c — rare doorway variant: sometimes it rains matcha
       instead of a minigame. A gift, not a faucet. */
    if (Math.random() < 0.1) { spawnMatchaRain(); return; }
    var pool = currentLevel().mgs;
    startMinigame(pool[randi(0, pool.length - 1)]);
  });
  world.appendChild(sp);
  setTimeout(function () { if (sp.parentNode) sp.remove(); }, 25000);
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
    var wr = document.getElementById("world");
    if (wr) {
      var r = wr.getBoundingClientRect();
      coinBurst(r.left + r.width / 2, r.top + r.height * 0.45, 8);
    }
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
  if (!goblinRevealed(id)) return;   // Worlds gate: unmet goblins don't chatter (Warden audit)
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

  /* Lulu lives: needs drift slowly in-session, moods follow needs,
     and sometimes she simply asks for something. */
  if (id === "lulu") {
    var ln = S.lulu.needs;
    ln.energy -= g.resting ? -3 : 1.5;
    ln.curiosity -= 0.8;
    ln.connection -= 0.4;
    clampLuluNeeds();
    if (ln.connection < 20 && !S.lulu.inCave) {
      S.lulu.inCave = true;
      showBubble("lulu", "I have gone to the cave to become mysterious.", 4200);
    }
    applyLuluMood();
    if (!S.lulu.pendingRequest && !S.lulu.inCave && ln.connection >= 35 && Math.random() < 0.06) {
      maybeLuluRequest();
    }
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
  if (stagedActive() && currentWorld() < 3) return;  // Worlds gate: governance is World-3 content
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
  S.flags.proposalsResolved = (S.flags.proposalsResolved || 0) + 1; // Worlds gate: govern twice → World 4

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
    luluVoiceLine("compost");
  }

  earn(2, choice === "compost" ? 2 : 0); // every decision feeds the Garden economy
  pushReplay("Lulu", (signal && signal.title) || "A Signal", choice, change, memoryLine);

  proposal.consequences = { resolved: choice, visibleChange: change };
  S.activeProposal = null;
  S.world.currentSignal = null;
  S.flags.firstProposalResolved = true;
  S.flags.proposalsResolved = (S.flags.proposalsResolved || 0) + 1; // Worlds gate: govern twice → World 4
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
  if (stagedActive() && currentWorld() < 3) return;  // Worlds gate: the bug + Gerald's proposal open World 3
  setTimeout(function () {
    if (S.flags.greeted) return;
    S.flags.greeted = true;
    showBubble("lulu", "You're late. Good. We already started without you.", 4200);
    luluVoiceLine("greet");
    saveState();
  }, 2200);

  /* FIRST-30-SECONDS LAW: something must be HAPPENING before the first
     half-minute ends, or the tab closes. 2s greeting → 10s the bug skitters
     → ~20s the first proposal card (a real governed choice) → the Moth and
     the circus follow. The player is deciding things inside 30 seconds. */
  setTimeout(function () {
    if (S.flags.firstSignalSeen) return;
    ambientBugEscape();
  }, 10000);

  setTimeout(function () {
    if (S.activeProposal || S.flags.firstProposalResolved) return;
    var signal = S.world.currentSignal && S.world.currentSignal.type === "bug"
      ? S.world.currentSignal : createSignal("bug");
    createProposalFromSignal(signal, "Name the bug Gerald and give it a tiny apartment.");
  }, randi(18000, 28000));
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

/* ---------------------------------------------------------------------
   MOOD VISUALS — a pure display lookup, no reducer touch. Six base
   buckets (the priority set from the mood-visual chiddush); every raw
   mood string the reducer zone can produce maps into exactly one,
   unmapped/future strings fall back to "calm" rather than erroring.
   Archetype-flavored variants and the neglect "shadow" state are
   parked (PARKED_CHIDDUSHIM.md #15) — this is the base layer only.
--------------------------------------------------------------------- */
var MOOD_BUCKETS = {
  curious:  ["curious", "intrigued", "attentive"],
  happy:    ["delighted", "content", "warm", "grateful", "touched", "relieved", "amused", "giggly"],
  calm:     ["calm", "rested", "settled", "steadied", "patient", "breezy", "solemn", "neutral"],
  lonely:   ["wistful", "distant", "uneasy", "sheepish", "unsure", "defensive"],
  focused:  ["focused", "thoughtful", "resolute", "sharp", "watchful", "inspired"],
  dramatic: ["fierce", "suspicious", "dreamy", "proud", "quietly proud", "victorious", "thrilled"]
};
var MOOD_FX_SYMBOL = { curious: "✨", happy: "🌟", calm: "〜", lonely: "♡", focused: "◆", dramatic: "❣" };
var MOOD_BUCKET_LOOKUP = {};
Object.keys(MOOD_BUCKETS).forEach(function (bucket) {
  MOOD_BUCKETS[bucket].forEach(function (m) { MOOD_BUCKET_LOOKUP[m] = bucket; });
});
function moodBucket(mood) { return MOOD_BUCKET_LOOKUP[mood] || "calm"; }

function buildGoblinEl(d) {
  var world = document.getElementById("world");
  var el = document.createElement("div");
  el.className = "goblin";
  el.id = "goblin-" + d.id;
  el.style.setProperty("--gob-color", d.color);
  el.innerHTML =
    '<div class="g-tapring"></div>' +
    '<div class="g-mood-fx"></div>' +
    '<div class="g-body"><div class="g-ear l"></div><div class="g-ear r"></div><div class="g-mouth"></div></div>' +
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
    if (!el) el = buildGoblinEl(g); /* goblins can join mid-session (Tink, the adopted kin) */
    if (!el) return;
    el.style.left = g.x + "%";
    el.style.top = g.y + "%";
    el.classList.toggle("facing-left", g.facing === "left");
    el.classList.toggle("resting", !!g.resting);
    var mb = moodBucket(g.mood);
    Object.keys(MOOD_BUCKETS).forEach(function (b) { el.classList.toggle("mood-" + b, b === mb); });
    var fxEl = el.querySelector(".g-mood-fx");
    if (fxEl) fxEl.textContent = MOOD_FX_SYMBOL[mb] || "";
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
      /* every object is an instrument: mushrooms carry the journey drums,
         everything else rings its own Tibetan bowl (one object, one voice). */
      (function (obj, node) {
        node.addEventListener("click", function (e) {
          e.stopPropagation();
          ensureAudio(); resumeAudio();
          /* VISION_PROGRESSION Rung 2 — tapping the seed offers it to Lulu */
          if (prologueActive && prologueStep === 2 && obj.id === prologueSeedObjId) tapPrologueSeed();
          /* VISION_PROGRESSION Rung 4 — tapping the matcha cup feeds Lulu, tapping the bloom waters it */
          if (prologueActive && prologueStep === 4) { tapMatchaCup(obj.id); tapBloomWater(obj.id); }
          /* QUIZ_TO_ZOL_V2 — the lit Knowledge Lantern is the repeat door to Lulu's fun facts */
          if (obj.sign === "Knowledge Lantern" && quizZolAvailable()) { openQuizZol(); return; }
          if (obj.emoji === "🍄") Sound.shamanicBurst();
          else Sound.tibetanBowl(bowlFreqFor(obj.id));
          node.classList.remove("singing");
          void node.offsetWidth; /* restart the halo */
          node.classList.add("singing");
        });
      })(o, el);
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

/* ---------------------------------------------------------------------
   THE WONDER CACHE — six relics resting in the moss. Each shows painted
   art (Higgsfield CDN) over an emoji fallback, so a blocked image simply
   reveals the glyph beneath — play never depends on the network. Tapping
   one sings a tone, tells a NO_CLAIM line (one glyph = one real meaning,
   per the WULmoji legend), and — first time only — writes a garden
   receipt to the replay log. MEMBRANE LAW: finding is expressive. It adds
   to S.collectibles.found and to the log; it grants no ZOL and admits
   nothing. Meaning is free; state is earned.
--------------------------------------------------------------------- */
var COLLECTIBLES = [
  { id: "serpent-coil", name: "Serpent Coil", glyph: "🐍", tone: 396, x: 10, y: 27,
    img: "assets/art/hf_20260712_190954_persona_1.png",
    lore: "🐍 The coil climbs by care, never by coin. parable ⊬ doctrine." },
  { id: "solfeggio-shard", name: "Solfeggio Shard", glyph: "💎", tone: 528, x: 90, y: 27,
    img: "assets/art/hf_20260712_190958_persona_4.png",
    lore: "💎 A tone you can feel, never a cure you can buy. For wonder, not medicine." },
  { id: "mycelial-knot", name: "Mycelial Knot", glyph: "🍄", tone: 639, x: 9, y: 60,
    img: "assets/art/hf_20260712_190999_persona_5.png",
    lore: "🍄 Threads that connect ⊬ threads that command. The Warren is woven, not ruled." },
  { id: "memory-lantern", name: "Memory Lantern", glyph: "🏮", tone: 741, x: 91, y: 60,
    img: "assets/art/hf_20260712_190955_persona_2.png",
    lore: "🏮 It holds what the log holds — light re-read, not light stored. memory = f(log)." },
  { id: "verdict-circle", name: "Verdict Circle", glyph: "⭕", tone: 417, x: 12, y: 86,
    img: "assets/art/hf_20260712_190957_persona_3.png",
    lore: "⭕ Where a day is stamped 🌱⏳🍂. The circle rules nothing; your hand does." },
  { id: "verdict-seal", name: "Verdict Seal", glyph: "🔏", tone: 852, x: 88, y: 86,
    img: "assets/art/hf_20260712_191001_persona_6.png",
    lore: "🔏 A seal marks what was tended — existence ≠ admission. Only the operator makes it true." }
];
function collectibleById(id) { for (var i = 0; i < COLLECTIBLES.length; i++) if (COLLECTIBLES[i].id === id) return COLLECTIBLES[i]; return null; }
function collectibleFound(id) { return !!(S.collectibles && S.collectibles.found.indexOf(id) >= 0); }
function collectibleUnlocked(id) { return !!(S.collectibles && S.collectibles.unlocked.indexOf(id) >= 0); }

/* Progression law: relics are EARNED, then found — not decoration. Each
   milestone below is a pure fold of state (deterministic, replayable);
   when it turns true the relic surfaces in the moss with a soft glint.
   Surfacing changes nothing sovereign — it only makes a tap possible. */
var COLLECTIBLE_UNLOCKS = {
  "serpent-coil":    { hint: "the Serpent noticed you noticing it",        ok: function () { return !!S.flags.serpentTapped; } },
  "solfeggio-shard": { hint: "a tone you played crystallized in the moss", ok: function () { return !!S.flags.organPlayed; } },
  "memory-lantern":  { hint: "three memories lit it from inside",          ok: function () { return S.replay.length >= 3; } },
  "verdict-circle":  { hint: "your first stamped day drew a circle",       ok: function () { return !!(S.verdicts && S.verdicts.history && S.verdicts.history.length >= 1); } },
  "mycelial-knot":   { hint: "five boops wove the threads together",       ok: function () { return (S.flags.boops || 0) >= 5; } },
  "verdict-seal":    { hint: "a humbled boss left it behind",              ok: function () { return ((S.progress.crownDefeats || 0) + (S.progress.raamDefeats || 0)) >= 1; } }
};

function checkCollectibleUnlocks() {
  var newly = [];
  COLLECTIBLES.forEach(function (c) {
    if (collectibleUnlocked(c.id)) return;
    var u = COLLECTIBLE_UNLOCKS[c.id];
    if (u && u.ok()) { S.collectibles.unlocked.push(c.id); newly.push(c); }
  });
  if (newly.length) {
    newly.forEach(function (c) {
      showBubbleFree("✨ something glints in the moss — " + COLLECTIBLE_UNLOCKS[c.id].hint, clamp(c.x, 8, 70), clamp(c.y - 8, 6, 84));
    });
    saveState();
  }
  return newly;
}

var collectibleEls = {};
function renderCollectibles() {
  if (stagedActive() && currentWorld() < 4) return;  // Worlds gate: relics are World-4 wonder
  var layer = document.getElementById("objects-layer");
  if (!layer) return;
  checkCollectibleUnlocks();
  COLLECTIBLES.forEach(function (c) {
    if (!collectibleUnlocked(c.id)) return; /* earned, then seen */
    var el = collectibleEls[c.id];
    if (!el) {
      el = document.createElement("div");
      el.className = "collectible";
      el.title = c.name;
      el.innerHTML =
        '<span class="col-glyph">' + c.glyph + '</span>' +
        '<img class="col-img" alt="" />' +
        '<span class="col-check">✓</span>' +
        '<div class="col-sign">' + c.name + '</div>';
      var img = el.querySelector(".col-img");
      /* graceful fallback: if the painted art is blocked/offline, hide the
         <img> so the emoji glyph beneath shows through. */
      img.addEventListener("error", function () { img.style.display = "none"; });
      img.addEventListener("load", function () { el.classList.add("art-loaded"); });
      img.src = c.img;
      (function (item, node) {
        node.addEventListener("click", function (e) {
          e.stopPropagation();
          discoverCollectible(item.id);
        });
      })(c, el);
      el.classList.add("surfacing"); /* entrance: it just surfaced */
      setTimeout(function () { el.classList.remove("surfacing"); }, 1200);
      layer.appendChild(el);
      collectibleEls[c.id] = el;
    }
    el.style.left = c.x + "%";
    el.style.top = c.y + "%";
    el.classList.toggle("found", collectibleFound(c.id));
  });
}

function discoverCollectible(id) {
  var c = collectibleById(id);
  if (!c || !collectibleUnlocked(id)) return; /* can't find what hasn't surfaced */
  ensureAudio(); resumeAudio();
  Sound.tibetanBowl(c.tone); /* relics ring bronze — every find is a bowl strike */
  luluVoiceLine("relic");
  var el = collectibleEls[id];
  if (el) { el.classList.remove("singing"); void el.offsetWidth; el.classList.add("singing"); }
  showBubbleFree(c.lore, clamp(c.x, 8, 74), clamp(c.y - 8, 6, 84));
  var first = !collectibleFound(id);
  if (first) {
    S.collectibles.found.push(id);
    /* a garden receipt — expressive only. No ZOL, no admission. */
    pushReplay("You", "Found the " + c.name, "discover", c.name + " joined the Wonder Cache.", c.lore);
    var n = S.collectibles.found.length;
    if (n >= COLLECTIBLES.length) {
      pushReplay("The Warren", "Wonder Cache complete", "note",
        "all six relics found — the moss keeps nothing back now.",
        "Six found. Meaning is free; state is still earned.");
      wonderCacheFinale();
    }
    renderReplayStrip();
    renderCollectibles();
    saveState();
  }
}

/* THE FINALE — six of six. Pure theater: dance, sparks, one proud line.
   Nothing sovereign moves; the celebration IS the reward. */
function wonderCacheFinale() {
  var world = document.getElementById("world");
  Object.keys(goblinEls).forEach(function (k) { flashClass(goblinEls[k], "dancing", 3600); });
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "delighted"; });
  Sound.party();
  playSfx("shutter", Sound.shutter); /* VISION_V1_32 §2 — Wonder Cache finale */
  luluVoiceLine("goodnight");
  appBounce();
  if (world) {
    for (var i = 0; i < 16; i++) {
      (function (i) {
        setTimeout(function () {
          var sp = document.createElement("div");
          sp.className = "cache-spark";
          sp.textContent = ["✨", "🌟", "💫"][i % 3];
          sp.style.left = (8 + ((i * 37 + 11) % 85)) + "%";
          sp.style.top = (18 + ((i * 53 + 7) % 70)) + "%";
          world.appendChild(sp);
          setTimeout(function () { sp.remove(); }, 2600);
        }, i * 130);
      })(i);
    }
  }
  showBubble("lulu", "SIX OF SIX! The moss is out of secrets. We are not. ✨", 3200);
}

/* ---------------------------------------------------------------------
   LULU'S VOICE — a calm, slow, lullaby-toned voice for the little guide,
   via the browser's own Speech Synthesis (no network, no key, no cost).
   Garden-only by construction: speaking changes nothing; if the device
   has no voices (headless, very old browsers) it silently does nothing.
   Respects mute. rate 0.72 / soft volume = the hypnotic tamagotchi purr.
--------------------------------------------------------------------- */
var luluVoiceObj = null;
function pickLuluVoice() {
  try {
    if (!window.speechSynthesis) return null;
    var vs = speechSynthesis.getVoices();
    if (!vs || !vs.length) return null;
    var prefs = ["samantha", "google uk english female", "google us english",
                 "victoria", "karen", "moira", "tessa", "fiona", "female"];
    for (var i = 0; i < prefs.length; i++)
      for (var j = 0; j < vs.length; j++)
        if (vs[j].name.toLowerCase().indexOf(prefs[i]) >= 0) return vs[j];
    for (var k = 0; k < vs.length; k++) if (/^en/i.test(vs[k].lang)) return vs[k];
    return vs[0];
  } catch (e) { return null; }
}
if (window.speechSynthesis && speechSynthesis.addEventListener) {
  try { speechSynthesis.addEventListener("voiceschanged", function () { luluVoiceObj = null; }); } catch (e) {}
}
function luluSpeak(text) {
  try {
    if (S.settings.muted || !window.speechSynthesis) return;
    if (!luluVoiceObj) luluVoiceObj = pickLuluVoice();
    if (!luluVoiceObj) return;
    /* she speaks words; the signs stay on screen where they belong */
    var clean = String(text).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").trim();
    if (!clean) return;
    speechSynthesis.cancel(); /* one thought at a time — she never talks over herself */
    var u = new SpeechSynthesisUtterance(clean);
    u.voice = luluVoiceObj;
    u.rate = 0.72;   /* slow-motion lullaby */
    u.pitch = 1.25;  /* small and bright */
    u.volume = 0.45; /* a murmur beside the bowls, never over them */
    speechSynthesis.speak(u);
  } catch (e) { /* voice is a gift, not a dependency */ }
}

function showBubble(goblinId, text, duration, noSpeak) {
  /* noSpeak lets a caller supply its own real voice line (e.g. the crib plays
     a bundled Luna mp3) instead of the default browser TTS — avoids two mouths. */
  if (goblinId === "lulu" && !noSpeak) luluSpeak(text);
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
  var hg = S.world.humorGreeting;
  if (S.activeProposal) msg = "The Tree feels something stirring.";
  else if (hg && hg.until > Date.now()) msg = hg.line; /* the return greeting lingers */
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

  var lvChip = document.getElementById("level-chip");
  if (lvChip) {
    var curLv = (S.progress && S.progress.level) || 1;
    var nextLv = (curLv % LEVELS.length) + 1;
    lvChip.textContent = "🗺️ L" + curLv + (isLevelUnlocked(nextLv) ? "" : " 🔒");
  }
}

/* ---------------------------------------------------------------------
   ZOL CELEBRATION — goblins like gold. Coins fly to the wallet, the
   wallet pops and counts up like a slot payout, the Warren goes
   gling-gling. Pure cosmetics: state changed before, only shown here.
--------------------------------------------------------------------- */

/* ---------------------------------------------------------------------
   PHYSICS-FEEL — the juice layer obeys real kinematics.
   Coins fall under gravity and bounce with restitution (Candy-Crush
   law); the world's breathing tempo follows Rayleigh-Bénard's rule
   (witnessed in The Well): stronger driving → faster convective
   turnover → a livelier Warren. Pure cosmetics over decided state.
--------------------------------------------------------------------- */

var PHYS = { g: 2400 /* px/s² */, rest: 0.55, drag: 0.9 };

function physStep(p, dt) {
  /* one kinematic step: gravity, integration, floor bounce */
  p.vy += PHYS.g * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  if (p.floor != null && p.y >= p.floor && p.vy > 0) {
    p.y = p.floor;
    p.vy = -p.vy * PHYS.rest;
    p.vx *= PHYS.drag;
    p.bounces = (p.bounces || 0) + 1;
    p.justBounced = true;
  } else p.justBounced = false;
  return p;
}

function coinBurst(cx, cy, n) {
  /* jackpot eruption: coins launch, arc, and BOUNCE on an invisible floor */
  var floor = Math.min(window.innerHeight - 30, cy + 140);
  var coins = [];
  for (var i = 0; i < n; i++) {
    var el = document.createElement("div");
    el.className = "zol-coin phys";
    el.textContent = "🪙";
    document.body.appendChild(el);
    coins.push({ el: el, x: cx + (Math.random() - 0.5) * 30, y: cy,
                 vx: (Math.random() - 0.5) * 520, vy: -(380 + Math.random() * 420),
                 floor: floor, bounces: 0, spin: (Math.random() - 0.5) * 720 });
  }
  var t0 = performance.now(), last = t0;
  (function tick(now) {
    var dt = Math.min(0.032, (now - last) / 1000); last = now;
    var alive = false;
    coins.forEach(function (p) {
      if (!p.el) return;
      physStep(p, dt);
      if (p.justBounced && p.bounces <= 2) tone(1568 + p.bounces * 220, 0, 0.07, "triangle", 0.05);
      var age = (now - t0) / 1000;
      p.el.style.left = p.x + "px";
      p.el.style.top = p.y + "px";
      p.el.style.transform = "translate(-50%,-50%) rotate(" + (p.spin * age) + "deg)";
      if (age > 1.6 || p.bounces > 3) { p.el.style.opacity = String(Math.max(0, 2.1 - age * 1.1)); }
      if (age > 2.1) { p.el.remove(); p.el = null; } else alive = true;
    });
    if (alive) requestAnimationFrame(tick);
  })(t0);
}

function renderBreath() {
  /* Rayleigh-Bénard tempo: hotter, healthier Warren convects faster */
  var drive = clamp((S.world.warmth + S.world.treeHealth) / 200, 0, 1);
  var period = (6.2 - 3.4 * drive).toFixed(2);
  var world = document.getElementById("world");
  if (world && world.style.getPropertyValue("--breath") !== period + "s") {
    world.style.setProperty("--breath", period + "s");
  }
  return parseFloat(period);
}

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
  /* big payouts ERUPT: ballistic coins bounce off an invisible floor */
  if (payout >= 20) coinBurst(startX, startY, Math.min(10, Math.round(payout / 4)));
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
  var CHIP_ICONS = { try: "🌱", hold: "⏳", compost: "🍂", boop: "🎉", quiz: "🦋", goldfall: "🪙", humor: "🌘", adopt: "🥺", ethics: "💭", verdict: "📜" };
  items.forEach(function (r) {
    var chip = document.createElement("div");
    chip.className = "replay-chip " + r.choice + (r.composted ? " composted" : "");
    var d = new Date(r.timestamp);
    var hh = ("0" + d.getHours()).slice(-2), mm = ("0" + d.getMinutes()).slice(-2);
    if (r.composted) {
      chip.innerHTML = "🍄 <b>SOIL</b> · " + r.visibleChange;
      chip.title = "this memory composted while un-replayed — soil now";
    } else {
      chip.innerHTML = (CHIP_ICONS[r.choice] || "•") + " <b>" + r.choice.toUpperCase() + "</b> " + hh + ":" + mm + " · " + r.visibleChange;
      chip.title = "tap to re-remember — replaying keeps a memory true";
      /* replay = re-remembering: tapping refreshes the memory's freshness */
      (function (id) {
        chip.addEventListener("click", function (e) {
          e.stopPropagation();
          if (touchMemory(id)) {
            chip.classList.add("rememb");
            setTimeout(function () { chip.classList.remove("rememb"); }, 650);
            ensureAudio(); resumeAudio(); if (window.Sound && Sound.bloom) Sound.bloom();
            saveState();
          }
        });
      })(r.id);
    }
    strip.appendChild(chip);
  });
  strip.scrollLeft = strip.scrollWidth;
}

function renderSheetIdle() {
  var idle = document.getElementById("sheet-idle");
  idle.classList.remove("hidden");
  if (stagedActive() && currentWorld() < 3) {   // Worlds gate: same law as renderQuests (choke point, not caller)
    idle.textContent = "Tap a goblin to see what they're thinking.";
  } else {
    idle.innerHTML = questsMarkup();
    wireQuestGateRow();
  }
  document.getElementById("sheet-goblin").classList.add("hidden");
  document.getElementById("sheet-proposal").classList.add("hidden");
  document.getElementById("sheet-quiz").classList.add("hidden");
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  document.getElementById("sheet-zol-shop").classList.add("hidden");
}

/* ---------------------------------------------------------------------
   THE TEACHABLE GOBLIN — invert the direction of knowledge.
   The child teaches a fact in their own words. The goblin interprets it
   LITERALLY (models generalize from what you said, not what you meant),
   proposes an action, and NOTHING happens until the child stamps it
   (proposal ⊬ admission, as a thumb-gesture). Then it remembers, and
   calls the lesson back later. No coins gate this: teaching is its own
   channel — capability, memory, and comedy.
--------------------------------------------------------------------- */

var LESSON_THEMES = [
  /* the charming misgeneralizations first — specific action-words win over
     generic property-words, so "birds fly because they are light" glues
     feathers to a rock. Hallucination, made visible and harmless. */
  { keys: /fly|bird|wing|feather|oiseau|vol/i, comedy: true,
    line: "Lighter means flying? Then MORE FEATHERS. I glue them to this rock.",
    emoji: "🪨", sign: "A Rock With Feathers (does not fly)", zone: "nursery" },
  { keys: /fast|quick|run|speed|vite|rapide/i, comedy: true,
    line: "Faster means less drag. So I remove the bug's legs. For science.",
    emoji: "🐛", sign: "A Streamlined Bug (confused)", zone: "nursery" },
  { keys: /big|strong|tall|wall|huge|grand|fort/i, comedy: true,
    line: "Bigger is better! I build a wall. In front of the door. You are welcome.",
    emoji: "🧱", sign: "A Wall (blocks the door)", zone: "gate" },
  { keys: /smart|think|brain|learn|clever|intellig/i, comedy: true,
    line: "To be smart I must eat the book. I have eaten the book. I feel the same.",
    emoji: "📚", sign: "A Digested Book (no smarter)", zone: "tree" },
  /* the clean interpretations */
  { keys: /light|lantern|bright|glow|sun|shine|lumi/i, comedy: false,
    line: "So if light bounces, I put a lantern by the water — it will bounce to us!",
    emoji: "🏮", sign: "A Lantern (taught)", zone: "garden" },
  { keys: /water|pond|rain|river|wet|lake|pool|eau/i, comedy: false,
    line: "Water! I dig a small pond right here. Petit. Pour commencer.",
    emoji: "💧", sign: "A Pond (taught)", zone: "garden" },
  { keys: /plant|seed|grow|tree|flower|garden|graine/i, comedy: false,
    line: "I plant it and wait. Patiently. For about six seconds.",
    emoji: "🌱", sign: "A Sprout (taught)", zone: "garden" },
  { keys: /warm|fire|heat|cook|hot|chaud/i, comedy: false,
    line: "Warm is good. I will sit very close to the fire and be an expert.",
    emoji: "🔥", sign: "A Warmth (taught)", zone: "forge" },
  { keys: /kind|friend|love|help|nice|gentil|aim/i, comedy: false,
    line: "I will help! I do not know with what. But loudly, and with feeling.",
    emoji: "💚", sign: "A Kindness (taught)", zone: "gate" }
];

function interpretLesson(text) {
  var t = (text || "").trim();
  var theme = null;
  for (var i = 0; i < LESSON_THEMES.length; i++) {
    if (LESSON_THEMES[i].keys.test(t)) { theme = LESSON_THEMES[i]; break; }
  }
  if (!theme) {
    /* no keyword: the goblin does the most literal thing with your words */
    var first = t.split(/\s+/).slice(0, 4).join(" ") || "that";
    theme = { comedy: true,
      line: "You said “" + first + "”. So I did the most literal possible thing.",
      emoji: "📜", sign: "A Literal Interpretation", zone: "forge" };
  }
  return theme;
}

function teachGoblin(goblinId, text) {
  text = (text || "").trim();
  if (!text || !S.goblins[goblinId]) return false;
  var interp = interpretLesson(text);
  /* the goblin PROPOSES — nothing is admitted until the child stamps */
  S.teaching.pending = { goblinId: goblinId, lesson: text.slice(0, 120),
    line: interp.line, emoji: interp.emoji, sign: interp.sign,
    zone: interp.zone, comedy: !!interp.comedy };
  showBubble(goblinId, interp.line, 4600);
  Sound.squeak(goblinId);
  saveState();
  renderSheetGoblin(goblinId);
  return true;
}

function sealTeaching() {
  /* the seal — proposal becomes real ONLY here, by the child's thumb */
  var p = S.teaching.pending;
  if (!p) return false;
  stampFX("try");                       // the governance gesture
  addObject(p.emoji, p.sign, p.zone);   // the world changes, because you stamped

  var g = S.goblins[p.goblinId];
  var summary = "You taught me “" + p.lesson + "”, so I made " + p.sign + ".";
  var lesson = { goblin: p.goblinId, text: p.lesson, result: p.sign,
    comedy: p.comedy, callback: summary, createdAt: Date.now() };
  S.teaching.lessons.push(lesson);
  if (S.teaching.lessons.length > 24) S.teaching.lessons.shift();
  S.teaching.taughtCount[p.goblinId] = (S.teaching.taughtCount[p.goblinId] || 0) + 1;

  if (g) {
    g.memory = summary;
    g.mood = p.comedy ? "delighted" : "proud";
  }
  pushReplay(p.goblinId, "Lesson admitted", "teach-sealed", summary, summary);

  /* capability growth: three lessons and the goblin graduates */
  if (S.teaching.taughtCount[p.goblinId] === 3) {
    showBubble(p.goblinId, "I have learned three things. I am basically a professor now.", 4200);
    pushReplay(p.goblinId, "Graduated", "teach-graduated",
      (g ? g.name : p.goblinId) + " graduated — three lessons taught.", "");
  } else {
    setTimeout(function () {
      showBubble(p.goblinId, p.comedy ? "…that did not work how I hoped. But I remember it!" : "It worked. Mostly. I remember who taught me.", 3600);
    }, 1400);
  }

  S.teaching.pending = null;
  saveState();
  renderAll();
  renderSheetGoblin(p.goblinId);
  return true;
}

function dismissTeaching() {
  /* the child does NOT stamp — the proposal simply doesn't happen */
  if (!S.teaching.pending) return;
  var gid = S.teaching.pending.goblinId;
  showBubble(gid, "No stamp? Then it stays an idea. Ideas are free.", 3200);
  S.teaching.pending = null;
  saveState();
  renderSheetGoblin(gid);
}

function goblinCallback(goblinId) {
  /* what did this goblin learn from you? surface one, sometimes */
  var mine = S.teaching.lessons.filter(function (l) { return l.goblin === goblinId; });
  if (!mine.length) return null;
  return mine[mine.length - 1].callback;
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

  /* a goblin remembers what you taught it — surface a callback */
  var cb = goblinCallback(id);
  if (cb) document.getElementById("card-memory").textContent = cb;

  /* one input per card: Lulu is the one you *talk* to (live chat);
     every other goblin is the one you *teach* (literal-interpret → stamp).
     Never stack a teach box and a chat box on the same card. */
  if (id === "lulu") {
    var _t = document.getElementById("card-teach");
    if (_t) { _t.classList.add("hidden"); _t.innerHTML = ""; }
  } else {
    renderTeachPanel(id);
  }
  renderLuluCare(id);
}

function renderTeachPanel(id) {
  var host = document.getElementById("card-teach");
  if (!host) return;
  host.classList.remove("hidden");
  var count = (S.teaching.taughtCount[id] || 0);
  var grad = count >= 3 ? " 🎓" : "";
  var p = S.teaching.pending && S.teaching.pending.goblinId === id ? S.teaching.pending : null;
  var html = '<div class="teach-head">🎓 TEACH ' + S.goblins[id].name.toUpperCase() + grad +
    ' <span class="teach-count">' + count + ' learned</span></div>';
  if (p) {
    html += '<div class="teach-prop"><div class="teach-prop-line">' + p.emoji + ' “' + p.line + '”</div>' +
      '<div class="teach-prop-btns">' +
        '<button id="teach-seal">🔨 STAMP IT</button>' +
        '<button id="teach-nope">not yet</button>' +
      '</div><div class="teach-hint">nothing happens until you stamp — that is the whole game</div></div>';
  } else {
    html += '<div class="teach-input-row">' +
      '<input id="teach-input" placeholder="teach ' + S.goblins[id].name + ' a fact…" maxlength="120" autocomplete="off" />' +
      '<button id="teach-send">🎓</button></div>' +
      '<div class="teach-hint">tell them how the world works. watch what they do with it.</div>';
  }
  host.innerHTML = html;

  var input = document.getElementById("teach-input");
  var send = document.getElementById("teach-send");
  var fire = function () {
    if (!input || !input.value.trim()) return;
    var v = input.value; input.value = "";
    ensureAudio(); resumeAudio();
    teachFocus = true;
    teachGoblin(id, v);
  };
  if (send) send.addEventListener("click", function (e) { e.stopPropagation(); fire(); });
  if (input) {
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); fire(); } });
    input.addEventListener("click", function (e) { e.stopPropagation(); });
    if (teachFocus) { try { input.focus(); } catch (e) {} teachFocus = false; }
  }
  var seal = document.getElementById("teach-seal");
  if (seal) seal.addEventListener("click", function (e) { e.stopPropagation(); ensureAudio(); resumeAudio(); sealTeaching(); });
  var nope = document.getElementById("teach-nope");
  if (nope) nope.addEventListener("click", function (e) { e.stopPropagation(); dismissTeaching(); });
}
var teachFocus = false;

function needBarHTML(kind, emoji, label, v) {
  return '<div class="nrow ' + kind + '">' +
    '<span class="nlabel">' + emoji + ' ' + label + '</span>' +
    '<span class="nnum">' + Math.round(v) + '/100</span>' +
    '<div class="nbar"><i style="width:' + Math.round(v) + '%"></i></div>' +
  '</div>';
}

function luluTodaysNote() {
  /* One deterministic post-it per day — she wrote it whether you came or not. */
  var day = new Date().getDate() + new Date().getMonth();
  return ABSENCE_MESSAGES[day % ABSENCE_MESSAGES.length];
}

function renderLuluCare(id) {
  var host = document.getElementById("card-care");
  if (!host) return;
  if (id !== "lulu") { host.classList.add("hidden"); host.innerHTML = ""; return; }
  host.classList.remove("hidden");
  var n = S.lulu.needs;
  var m = luluMood();
  var acc = luluAccessoryEmojis();

  var html =
    needBarHTML("energy", "🌙", "ENERGY", n.energy) +
    needBarHTML("curiosity", "✨", "CURIOSITY", n.curiosity) +
    needBarHTML("connection", "💜", "CONNECTION", n.connection) +
    '<div class="care-mood"><b>' + m.emoji + ' ' + m.id.toUpperCase() + '</b> — “' + m.line + '”' +
      (acc ? '<br/>her things: ' + acc : '') + '</div>' +
    '<div class="care-note">📌 today’s note: “' + luluTodaysNote() + '”</div>' +
    '<div class="care-zol">🫙 ZOL JAR · ' + S.learning.zolBalance + '</div>' +
    '<div class="care-actions">' +
      '<button class="care-btn talk" data-care="talk">💬<b>TALK</b></button>' +
      '<button class="care-btn rest" data-care="rest">🛌<b>REST</b></button>' +
      '<button class="care-btn explore" data-care="explore">🔍<b>EXPLORE</b></button>' +
      '<button class="care-btn give" data-care="give">🎁<b>GIVE</b></button>' +
    '</div>' +
    /* live conversation — type to Lulu, she answers */
    '<div id="lulu-chat">' +
      (S.lulu.chat.length ? S.lulu.chat.slice(-6).map(function (c) {
        return '<div class="chat-line ' + (c.who === "you" ? "you" : "lulu") + (c.pending ? " pending" : "") + '">' +
          (c.who === "you" ? "" : "🟢 ") + c.text.replace(/</g, "&lt;") + '</div>';
      }).join("") : '<div class="chat-hint">say something to Lulu…</div>') +
    '</div>' +
    '<div class="chat-input-row">' +
      '<input id="lulu-input" placeholder="talk to Lulu…" maxlength="160" autocomplete="off" />' +
      '<button id="lulu-send">➤</button>' +
    '</div>';

  var req = LULU_REQUESTS.find(function (r) { return r.id === S.lulu.pendingRequest; });
  if (req) {
    html += '<div class="care-request"><div class="care-request-text">“' + req.text + '”</div>' +
      '<div class="care-request-btns">' +
      '<button class="care-btn req" data-req="yes">YES</button>' +
      '<button class="care-btn req" data-req="later">LATER</button>' +
      '<button class="care-btn req" data-req="modify">MODIFY</button>' +
      '</div></div>';
  }
  host.innerHTML = html;

  host.querySelectorAll("[data-care]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      ensureAudio(); resumeAudio();
      careLulu(btn.getAttribute("data-care"));
      renderLuluCare("lulu");
    });
  });
  host.querySelectorAll("[data-req]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      ensureAudio(); resumeAudio();
      answerLuluRequest(btn.getAttribute("data-req"));
      renderLuluCare("lulu");
    });
  });

  /* conversation wiring */
  var input = document.getElementById("lulu-input");
  var send = document.getElementById("lulu-send");
  var fire = function () {
    if (!input) return;
    var v = input.value;
    if (!v.trim()) return;
    input.value = "";
    ensureAudio(); resumeAudio();
    luluChatFocus = true;
    luluSay(v);
  };
  if (send) send.addEventListener("click", function (e) { e.stopPropagation(); fire(); });
  if (input) {
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); fire(); } });
    input.addEventListener("click", function (e) { e.stopPropagation(); });
    /* keep focus while chatting — scroll thread to newest */
    var thread = document.getElementById("lulu-chat");
    if (thread) thread.scrollTop = thread.scrollHeight;
    if (luluChatFocus) { try { input.focus(); } catch (e) {} luluChatFocus = false; }
  }
}
var luluChatFocus = false;

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
  renderProposalInspector();
}

/* the Proposal Inspector — status chips over data the proposal already
   carries (S.activeProposal / S.world.currentSignal). Read-only: opening
   or closing it moves no governed truth, same law as the Organ and the
   mood layer. Reference: the operator-shared "Proposal Inspector" panel;
   AUTHORITY/REPLAY wording adapted to this game's real mechanic — here
   the player's TRY/HOLD/COMPOST tap *is* the one admission act (matches
   CLAUDE.md's "only player admission mutates the world" invariant), so
   the panel says exactly that rather than borrowing a different game's
   "mark ≠ admission" claim, which would misdescribe this codebase. */
var SIGNAL_ICON = { bug: "🐛", fatigue: "😴", mystery: "✨", intrusion: "🌫️", novelty: "🧭", wonder: "🌳" };
function renderProposalInspector() {
  var panel = document.getElementById("proposal-inspector");
  if (!panel) return;
  var signal = S.world.currentSignal;
  var p = S.activeProposal;
  if (!signal || !p) { panel.classList.add("hidden"); return; }
  document.getElementById("pi-signal").textContent =
    (SIGNAL_ICON[signal.type] || "❔") + " " + signal.title;
  document.getElementById("pi-zone").textContent = zoneName(signal.zone);
  document.getElementById("pi-intensity").textContent = "●".repeat(signal.intensity || 1) + "○".repeat(3 - (signal.intensity || 1));
  var proposer = S.goblins[p.proposerId];
  document.getElementById("pi-proposer").textContent = (proposer ? proposer.name : p.proposerId) + " · " + modeById(p.luluMode).name;
}
function toggleProposalInspector() {
  var panel = document.getElementById("proposal-inspector");
  var btn = document.getElementById("proposal-inspect-btn");
  if (!panel || !btn) return;
  var opening = panel.classList.contains("hidden");
  panel.classList.toggle("hidden", !opening);
  btn.classList.toggle("on", opening);
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

  /* Typed dialogue lines (opening statements, or the update round after the card).
     Lulu's inner state colors her council voice — needs affect behavior, never state. */
  var card = S.council.card ? COUNCIL_EPISODE.cards.find(function (c) { return c.id === S.council.card; }) : null;
  var ech = S.echoes || {};
  var lines = (card ? card.update : COUNCIL_EPISODE.opening).map(function (l) {
    /* Cross-game echoes: what happened in the side quests shows up here.
       Behavior only — the typed act/position never changes, so admission
       stays deterministic (Dialogue ⊬ WorldMutation holds). */
    if (l.speaker === "nib" && ech.nibHyper && !card) {
      return Object.assign({}, l, { text: "I HAVE ALREADY BUILT SIX WALLS. And a spare wall. For the wall." });
    }
    if (l.speaker !== "lulu" || !S.lulu || !S.lulu.needs || card) return l;
    var n = S.lulu.needs, t = l.text;
    if (n.curiosity > 80)       t = "Gerald is ancestry. ALSO: what if the house could fly? Hear me out.";
    else if (n.energy < 30)     t = "Gerald… ancestry… (yawning) can we decide this horizontally?";
    else if (n.connection > 80) t = "I just want Gerald to feel welcome. That is my whole argument.";
    return Object.assign({}, l, { text: t });
  });
  /* An aside from an earlier Memory Match win, and the mushroom that noticed */
  if (!card && ech.memoryFact) {
    lines = lines.concat([{ speaker: "pip", act: "SUPPORT", targetProposal: "observe",
      reason: "recalled", text: "For the record: the " + ech.memoryFact + ". You confirmed it." }]);
  }
  if (!card && ech.mushroomNoticed) {
    lines = lines.concat([{ speaker: "zaz", act: "OBJECT", targetProposal: "move",
      reason: "watched", text: "Also — a mushroom is watching us. It has noticed things. Just so we know." }]);
  }
  if (!card && ech.geraldHead) {
    lines = lines.concat([{ speaker: "lulu", act: "JOKE", targetProposal: "house",
      reason: "promotion", text: "Point of order: Gerald is Head of Hiding now. He cannot attend. He is hiding." }]);
  }
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
  renderCollectibles();
  renderReplayStrip();
  renderWeather();
  renderBreath();
  renderSerpent();
  if (S.activeProposal) renderSheetProposal();
  /* Worlds: re-assert the staged reveal (idempotent) and check whether
     play has earned the next world — the one growth choke point. */
  applyWorldReveal(false);
  checkWorldAdvance();
}

/* ---------------------------------------------------------------------
   GOBLIN BOOP CHAIN — boop changes mood · boop changes animation ·
   boop may create Garden events · boop never changes Kernel truth
--------------------------------------------------------------------- */

var BOOP_WINDOW = 6000;
var boopHistory = [];        // { id, at } — short combo memory, last 4 taps
var lastBoopAt = {};
var lastDanceAt = 0, lastPartyAt = 0;

/* Goblin boop lines — each voice sharpened for sound and bite:
   alliteration where it lands, Lelu-flat aphorism (the dry period
   where a shout used to be), and one WULmoji signature per line —
   a seal, not decoration: the glyph carries what the words don't. */
var BOOP_LINES = {
  lulu: ["Boop. Bliss. Begin again. ✨", "Again is my favorite word. 🔁", "I felt that in my ears. And my elbows. 👂", "Boop received. Emotionally. 💜"],
  pip:  ["Careful. I'm fragile paperwork. 📄", "Filed under: rude. 🗂️", "Mind the manuscript. 📜", "Noted. Twice. ✍️"],
  nib:  ["Sparks! Superb! 🔥", "Again. For science. 🔧", "A bolt broke loose. Progress. 🔩", "Ooh. Percussive. 🥁"],
  zaz:  ["Mmh. Leaf thoughts. 🍃", "Five more minutes. Forever. 😴", "The soil felt that. So did I. 🌱", "Gently. I'm blooming. 🌸"],
  tink: ["Mind the meshing gears. ⚙️", "I was calibrating that. 📐", "Boop absorbed. Efficiency plus one. 🔧", "Ooh. New input. Noted. 🔧"]
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

/* ---------------------------------------------------------------------
   THE STAMP — signature moment. Seal drops, bass thunks, screen ripples,
   a hash-glow receipt materializes, and the whole warren reacts for one
   beat. Pure spectacle: state was already decided by the reducer.
--------------------------------------------------------------------- */

var STAMP_GLYPHS = { try: "🌱", hold: "⏳", compost: "🍂" };

function tinyHash(s) {
  var h = 2166136261;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).slice(0, 4);
}

function stampFX(choice) {
  ensureAudio(); resumeAudio();
  Sound.stampThunk();
  drumHit(72, 0.03, 0.32, 0.22, 38); /* the tam-tam body under the thunk — a stamp should be FELT */
  var sheet = document.getElementById("sheet") || document.body;
  var r = sheet.getBoundingClientRect();
  var cx = r.left + r.width / 2, cy = r.top + 44;

  var seal = document.createElement("div");
  seal.className = "stamp-seal";
  seal.textContent = STAMP_GLYPHS[choice] || "🔨";
  seal.style.left = cx + "px"; seal.style.top = cy + "px";
  document.body.appendChild(seal);

  var rip = document.createElement("div");
  rip.className = "stamp-ripple";
  rip.style.left = cx + "px"; rip.style.top = cy + "px";
  document.body.appendChild(rip);
  appBounce();

  /* the warren reacts — one synchronized beat */
  setTimeout(function () {
    Object.keys(goblinEls).forEach(function (id) {
      var b = goblinEls[id] && goblinEls[id].querySelector(".g-body");
      if (b) flashClass(b, "beat", 500);
    });
    document.querySelectorAll(".zone-glyph").forEach(function (z) { flashClass(z, "beat", 500); });
  }, 220);

  /* the receipt materializes with a hash-glow, then settles into history */
  setTimeout(function () {
    var chip = document.createElement("div");
    chip.className = "stamp-receipt";
    chip.textContent = "🧾 #" + tinyHash(choice + ":" + S.replay.length + ":" + (S.replay.length ? S.replay[S.replay.length - 1].id : "genesis"));
    chip.style.left = cx + "px"; chip.style.top = (cy - 8) + "px";
    document.body.appendChild(chip);
    requestAnimationFrame(function () {
      chip.style.top = (r.top - 26) + "px";
      chip.style.opacity = "0";
      chip.style.transform = "translate(-50%,-50%) scale(0.7)";
    });
    setTimeout(function () { chip.remove(); }, 1300);
  }, 300);

  setTimeout(function () { seal.remove(); rip.remove(); }, 1200);
}

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

/* VISION_V1_29 §2a — THE FAINTING BOOP. ~1-in-18 boops (seeded by the
   session boop counter, deterministic-ish), a goblin faints from pure
   joy: rotate, hearts/stars float, googly eyes for 2.5s. No state change
   beyond the mood already set by doBoop and a receipt — rare, delightful,
   never punishing. */
function doFaintBoop(id) {
  var g = S.goblins[id], el = goblinEls[id];
  if (!g || !el) return;
  flashClass(el, "fainting", 2500);
  var googly = document.createElement("div");
  googly.className = "g-googly";
  googly.textContent = "👀"; /* 👀 */
  el.appendChild(googly);
  setTimeout(function () { if (googly.parentNode) googly.parentNode.removeChild(googly); }, 2500);
  dropParticle(g, "💫", true);
  setTimeout(function () { dropParticle(g, "❤️‍🩹", true); }, 220);
  showBubble(id, "*faints from joy*", 2600);
  luluSurpriseLine("faint");
  pushReplay(g.name, "A goblin fainted from joy", "faint", "a goblin fainted from joy.", "");
  renderReplayStrip();
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
  Sound.shamanicBurst(2); /* the djembe call rolls under the party chord */
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
  if (id === "lulu") luluVoiceLine("boop");

  if (boopHistory.length && now - boopHistory[boopHistory.length - 1].at > BOOP_WINDOW) boopHistory = [];
  boopHistory.push({ id: id, at: now });
  if (boopHistory.length > 4) boopHistory.shift();

  if (checkTreeParty()) { saveState(); return; }
  var danced = checkWarrenDance();

  /* VISION_V1_29 §2a — see doFaintBoop; a rare, no-state-change reaction
     that preempts the ordinary roll below. */
  if (!danced && S.flags.boops % 18 === 0) {
    doFaintBoop(id);
    saveState();
    return;
  }

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

/* VISION_V1_31 §1 — the visible loop's always-first row: the next locked
   chapter, live cost, one tap to the existing gate modal. Read-only, like
   every quest row — it opens openLevelGate(), never unlocks anything itself. */
var NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
function questGateRowMarkup() {
  var n = nextLockedLevel();
  if (!n) {
    return '<div class="quest-row quest-gate-done">' +
      '<span class="quest-icon">🗺️</span>' +
      '<span class="quest-label">all ' + (NUMBER_WORDS[LEVELS.length] || LEVELS.length) + ' chapters open</span></div>';
  }
  var lv = LEVELS[clamp(n - 1, 0, LEVELS.length - 1)];
  var need = needKnow(n), toll = tollZOL(n), have = S.flags.quizRight || 0;
  return '<div class="quest-row quest-gate" id="quest-gate-row" data-gate-level="' + n + '">' +
    '<span class="quest-icon">🔒</span>' +
    '<span class="quest-label">Open ' + lv.name + '</span>' +
    '<span class="quest-prog">🦋 ' + Math.min(have, need) + '/' + need + ' · 🪙 ' + toll + ' ZOL</span></div>';
}

/* Wires the tap on the (freshly re-rendered each time) gate row — a plain
   id lookup, same idiom as the level chip; the row itself is rebuilt by
   every questsMarkup() call so there is nothing stale to unwire. */
function wireQuestGateRow() {
  var row = document.getElementById("quest-gate-row");
  if (row) row.addEventListener("click", function () {
    ensureAudio(); resumeAudio();
    openLevelGate(nextLockedLevel());
  });
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
  return '<div class="quest-head">WARREN LEVEL ' + S.progress.level + ' · QUESTS</div>' +
    questGateRowMarkup() + rows +
    '<div class="quest-hint">Tap a goblin to see what they’re thinking.</div>';
}

function renderQuests() {
  var idle = document.getElementById("sheet-idle");
  if (!idle || idle.classList.contains("hidden")) return;
  if (stagedActive() && currentWorld() < 3) {   // Worlds gate: no boss checklist in Worlds 1-2 (witness #4)
    idle.textContent = "Tap a goblin to see what they're thinking.";
    return;
  }
  idle.innerHTML = questsMarkup(); wireQuestGateRow();
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
  "What returns is not a law. What returns is a friend with a pattern.",
  /* VISION_V1_28 §6 — the Eternal Now layer. A parable, held as a parable:
     every symbol maps to a real mechanic here (the log, a fix, a replay,
     an admission) — none of it claims the outer world. */
  "past = present = future — the log holds all three as one scroll",
  "alchemy is attention: nigredo names the bug, albedo names the fix",
  "the circle on the cauldron is the replay: what returns, returns changed",
  "transformation is admitted, never proclaimed — your hand is the athanor"
];
/* THE GOBLIN ALMANAC — classic haikus/kōans/aphorisms bent to goblin voice
   (docs/GOBLIN_ALMANAC.md). A reading is sometimes a sky-line, sometimes one
   of these. NO_CLAIM garden lore: a verse changes the mood, never the ledger.
   Several echo the Warren's real laws (resonance ⊬ evidence · the Lantern). */
var GOBLIN_ALMANAC = [
  "Old bog, still and green — a goblin cannonballs in. Plip. Nobody claps.",
  "Mushroom after rain: yesterday there was nothing. Today, a small hat.",
  "Snail on the cold stone — slowly, slowly, it arrives. So does the receipt.",
  "Lantern in the fog: it lit nothing but itself. Still, we all showed up.",
  "First frost on the moss — the goblins argue whose fault. It was nobody's.",
  "The Tree does not speak. It writes everything down, though. Mind what you boop.",
  "I boop, therefore I am booped.",
  "Before the receipt: chop mushrooms, carry water. After the receipt: chop mushrooms, carry water.",
  "A warren of nine chambers begins with a single riddle.",
  "Know thy goblin. It prefers the forge. It will not garden. Stop asking.",
  "To boop, or not to boop. (There is no 'not'.)",
  "The early goblin catches the bug. The late goblin names it Gerald and builds it an apartment.",
  "You cannot boop the same goblin twice — the first boop already changed it.",
  "Do not summon a boss to explain what a blocked pipe already explains.",
  "A myth may gather the idiots. Only the repair grows the mushroom.",
  "Beauty is not evidence — but it is very good at getting a meeting.",
  "The loudest mask has the least to say. Laugh; it shrinks.",
  "Nothing becomes true by being repeated. It only becomes familiar.",
  "A denied idea is not deleted. It is composted, and grows back wiser."
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
  /* ~40% of readings, a goblin recites from the Almanac instead of the sky
     line — same NO_CLAIM register, a lighter voice. */
  var sky = (Math.random() < 0.4) ? pick(GOBLIN_ALMANAC) : pick(SKY_LINES);
  var rec = recurrenceNote();
  return { host: host, color: cur.color, ground: ground, garden: garden, sky: sky + (rec ? " " + rec : "") };
}

function onTapTemple() {
  ensureAudio(); resumeAudio();
  Sound.treeHum();
  renderSheetOracle(buildReading());
  secretTempleSeen = true; maybeFireSecret(); /* VISION_V1_29 §2e */
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

/* VISION_V1_31 §2a — THE CURVE. Mastery pays: each defeat toughens the
   next mask by one extra tap, capped at +4 (4..8 taps total). Per-tap and
   per-defeat rewards are UNCHANGED — harder never means stingier, the
   total payout simply grows because there's more HP to spend it on. */
function bossTaps(defeats) { return 4 + Math.min(defeats || 0, 4); }

/* ---------------------------------------------------------------------
   RAÂM, THE LOUD MASK — Boss Level 1. A huge orange mask appears near
   the Mycelial Gate (masks come through dreams) and shouts doom. He has
   no doom; he only has volume. Every boop makes a goblin giggle and the
   mask shrink — laughter composts fear. Unmasked, he turns out to be
   very small and very polite. He threatens nothing real, ever.
--------------------------------------------------------------------- */

var raamEl = null, raamTimer = null, raamHP = 0, raamHopTimer = null;
var RAAM_SCARES = [
  "RAAAM! FEAR THE MASK!",
  "EVERYTHING IS DOOMED! LOOSELY!",
  "I AM VERY SCARY! ASK ANYONE!",
  "THE NIGHT IS FULL OF ME!",
  "TREMBLE! WHEN CONVENIENT!"
];
var RAAM_TAUNTS = [
  "CATCH ME IF YOU CAN!",
  "ATTRAPE-MOI SI TU PEUX !",
  "TOO SLOW! LIKE A POLITE SNAIL!",
  "OVER HERE! NO— HERE!",
  "YOU CANNOT BOOP THE WIND!"
];
var RAAM_GIGGLES = [
  "Hee hee. Nice mask, Raâm.",
  "Do the tongue again!",
  "We can see your feet, Raâm.",
  "So loud. So small.",
  "Boop the nose!"
];

function scheduleRaam(delay) {
  if (stagedActive() && currentWorld() < 4) return;  // Worlds gate: bosses are World-4 (Mario law)
  clearTimeout(raamTimer);
  raamTimer = setTimeout(spawnRaam, delay);
}

/* VISION_V1_31 §2a — HP now ranges 1..8 (bossTaps): 26+8*5=66px at the
   toughest spawn, still a readable glyph, so no clamp is needed. */
function raamGlyphSize() { return 26 + raamHP * 5; }

/* Raâm flees: a fresh hop every ≤2s, quicker as he shrinks. Catching him
   is the game now — the dash is a 0.45s glide, so a determined finger wins.
   HP now ranges 1..8: HP8→3.1s … HP1→1s — still comfortably huntable. */
function raamHopInterval() { return 700 + raamHP * 300; }

function raamHop() {
  if (!raamEl || raamHP <= 0) return;
  raamEl.style.left = randi(14, 86) + "%";
  raamEl.style.top = randi(28, 68) + "%";
  var line = raamEl.querySelector(".raam-line");
  if (line && Math.random() < 0.5) line.textContent = pick(RAAM_TAUNTS);
  clearTimeout(raamHopTimer);
  raamHopTimer = setTimeout(raamHop, raamHopInterval());
}

function spawnRaam() {
  if (raamEl) return;
  var world = document.getElementById("world");
  if (!world) return;
  raamHP = bossTaps(S.progress.raamDefeats);
  raamEl = document.createElement("div");
  raamEl.className = "raam";
  /* VISION_V1_31 §2a — once he's tougher than his original 4, the spawn
     line says so. */
  var raamSpawnLine = raamHP > 4 ? "I DID SQUATS!" : pick(RAAM_TAUNTS);
  raamEl.innerHTML = '<div class="raam-line">' + raamSpawnLine + '</div>' +
    '<div class="raam-glyph" style="font-size:' + raamGlyphSize() + 'px">👹' +
    '<img class="boss-mask-art" alt="" /></div>' +
    '<div class="raam-base">🍄🍄</div>';
  /* the painted mask (cracked red, horned) rides OVER the emoji; if the art
     can't load, the 👹 beneath carries the boss — play never depends on it */
  var raamArt = raamEl.querySelector(".boss-mask-art");
  raamArt.addEventListener("error", function () { raamArt.style.display = "none"; });
  raamArt.src = "assets/art/hf_20260712_200459_raam.png";
  raamEl.style.left = "86%";
  raamEl.style.top = "58%";
  raamEl.addEventListener("click", tapRaam);
  world.appendChild(raamEl);
  Sound.roar();
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "uneasy"; });
  showBubble("zaz", "The loud mask is back… and it's RUNNING.", 2600);
  renderGoblins();
  raamHopTimer = setTimeout(raamHop, raamHopInterval());
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
    /* caught! he staggers a beat, then bolts again — faster now */
    clearTimeout(raamHopTimer);
    raamHopTimer = setTimeout(raamHop, 900);
    saveState();
    return;
  }
  // unmasked: fear composts into a friend — the chase is over
  clearTimeout(raamHopTimer);
  if (line) line.textContent = "…boo? …boop. …you caught me.";
  raamEl.classList.add("unmasked");
  maskBurst(parseFloat(raamEl.style.left) || 50, parseFloat(raamEl.style.top) || 50);
  S.progress.raamDefeats++;
  earn(3, 0);
  addObject("🎭", "A Very Polite Mask", "gate");
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "delighted"; });
  Sound.shamanicBurst(4); /* the rising call — victory drums under the party */
  playSfx("riser", Sound.riser); /* VISION_V1_32 §2 — layered under the drums, not replacing them */
  Sound.party();
  appBounce();
  pushReplay("The Warren", "Raâm the Loud Mask", "boop", "Raâm was laughed down to size. The mask got polite.", "");
  renderObjects();
  renderReplayStrip();
  renderQuests();
  var el = raamEl; raamEl = null;
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1500);
  scheduleRaam(randi(180000, 360000)); // volume always recovers eventually
  if (S.progress.raamDefeats === 1) scheduleSeren(randi(45000, 90000)); // the quiet one heard the laughter
  saveState();
}

/* a small mask-shatter celebration at (x,y)% — pure theater, reuses the
   cache-spark styling; state was already decided before this plays */
function maskBurst(xPct, yPct) {
  var world = document.getElementById("world");
  if (!world) return;
  for (var i = 0; i < 8; i++) {
    (function (i) {
      setTimeout(function () {
        var sp = document.createElement("div");
        sp.className = "cache-spark";
        sp.textContent = ["✨", "🎭", "💫", "🌟"][i % 4];
        sp.style.left = clamp(xPct + ((i * 23 + 5) % 22) - 11, 4, 92) + "%";
        sp.style.top = clamp(yPct + ((i * 17 + 3) % 16) - 8, 8, 88) + "%";
        world.appendChild(sp);
        setTimeout(function () { sp.remove(); }, 2600);
      }, i * 90);
    })(i);
  }
}

/* ---------------------------------------------------------------------
   SEREN THE SILENT MASK — Boss Level 2 of the mask ladder (appears only
   after Raâm has been unmasked once: the quiet one heard the laughter).
   Raâm was false ALARM — all volume, no danger. Seren is false GRAVITY —
   all stillness, no weight. She stands perfectly still near the Tree
   radiating enormous meaningful silence; the goblins are convinced the
   silence Means Something. It doesn't. Four gentle boops and she cracks
   a smile. Same law as every boss: she threatens nothing real, the
   Kernel never notices her, and laughter — soft laughter, this time —
   is the whole weapon. mystery ⊬ authority.
--------------------------------------------------------------------- */

var serenEl = null, serenTimer = null, serenHP = 0;
var SEREN_LINES = [
  "…",
  "( the silence deepens meaningfully )",
  "( she says nothing. LOUDLY. )",
  "( profound stillness, source unverified )",
  "( 100% quiet. 0% receipts. )"
];
var SEREN_WHISPERS = [
  "psst… she blinked. I saw it.",
  "is she… judging the moss?",
  "quiet contest! she's winning…",
  "someone check if she's a rock.",
  "the silence has no receipts!"
];

function scheduleSeren(delay) {
  if (stagedActive() && currentWorld() < 4) return;  // Worlds gate
  clearTimeout(serenTimer);
  serenTimer = setTimeout(spawnSeren, delay);
}

function spawnSeren() {
  if (serenEl || raamEl) return; /* one mask at a time — theater etiquette */
  if ((S.progress.raamDefeats || 0) < 1) return; /* earned, like everything here */
  var world = document.getElementById("world");
  if (!world) return;
  serenHP = bossTaps(S.progress.serenDefeats);
  serenEl = document.createElement("div");
  serenEl.className = "seren";
  /* VISION_V1_31 §2a — once she's tougher than her original 4, say so. */
  var serenSpawnLine = serenHP > 4 ? "( the silence has been training )" : SEREN_LINES[0];
  serenEl.innerHTML = '<div class="seren-line">' + serenSpawnLine + '</div>' +
    '<div class="seren-glyph">🗿<img class="boss-mask-art" alt="" /></div>' +
    '<div class="raam-base">🌫️</div>';
  var art = serenEl.querySelector(".boss-mask-art");
  art.addEventListener("error", function () { art.style.display = "none"; });
  art.src = "assets/art/hf_20260712_200501_art_b.png";
  serenEl.style.left = "34%";
  serenEl.style.top = "30%";
  serenEl.addEventListener("click", tapSeren);
  world.appendChild(serenEl);
  Sound.bijaTone ? Sound.bijaTone(285) : Sound.chirp();
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "uneasy"; });
  showBubble("pip", "A new mask. This one is… quiet. That's worse, somehow.", 2800);
  renderGoblins();
}

function tapSeren() {
  if (!serenEl || serenHP <= 0) return;
  ensureAudio(); resumeAudio();
  serenHP--;
  earn(0, 1); /* every gentle boop shakes loose a drop of sap */
  flashClass(serenEl, "bonked", 450);
  Sound.giggle();
  var who = pick(Object.keys(S.goblins));
  S.goblins[who].mood = "giggly";
  showBubble(who, pick(SEREN_WHISPERS), 1800);
  var line = serenEl.querySelector(".seren-line");
  if (serenHP > 0) {
    if (line) line.textContent = SEREN_LINES[4 - serenHP] || "…";
    serenEl.style.setProperty("--seren-calm", String(serenHP / 4));
    saveState();
    return;
  }
  /* the smile: enormous meaning resolves into a very small "pfff" */
  if (line) line.textContent = "…pfff. okay. that one was funny.";
  serenEl.classList.add("unmasked");
  maskBurst(parseFloat(serenEl.style.left) || 34, parseFloat(serenEl.style.top) || 30);
  S.progress.serenDefeats = (S.progress.serenDefeats || 0) + 1;
  earn(0, 3);
  addObject("🌫️", "A Very Calm Mask", "tree");
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "delighted"; });
  Sound.tibetanBowl(SOLFEGGIO.regeneration); /* her defeat rings, quietly — of course */
  playSfx("riser", Sound.riser); /* VISION_V1_32 §2 — layered under the bowl/party, not replacing them */
  Sound.party();
  appBounce();
  pushReplay("The Warren", "Seren the Silent Mask", "boop",
    "Seren smiled. The meaningful silence was just quiet.", "mystery ⊬ authority — the stillness had no receipts.");
  renderObjects();
  renderReplayStrip();
  var el = serenEl; serenEl = null;
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1800);
  scheduleSeren(randi(240000, 420000)); /* silence, too, recovers eventually */
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
  if (stagedActive() && currentWorld() < 4) return;  // Worlds gate
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
  playSfx("riser", Sound.riser); /* VISION_V1_32 §2 — Crown defeat, layered under the party */
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
  if (stagedActive() && currentWorld() < 2) return;  // Worlds gate: the Moth arrives with World 2
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
  /* VISION_V1_28 §2: cadence tightened after a visit — more ZOL interruptions, still polite */
  scheduleMoth(randi(60000, 100000));
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
    explain: "In the Warren, rejected ideas feed the next experiments." },
  /* — physics with receipts: witnessed numbers from The Well (polymathic-ai) — */
  { q: "Two chemicals feed and kill each other on a grid. What can grow from pure noise?",
    pool: ["Stable patterns — spots, worms, spirals, mazes", "Nothing, noise stays noise", "One big gray blob"],
    correct: "Stable patterns — spots, worms, spirals, mazes",
    topic: "emergence", lesson: "simple rules + feedback = patterns from randomness", hard: true,
    explain: "Gray-Scott: two knobs (feed, kill) make six pattern worlds. 1200 real simulations. Your Warren's weather uses their map." },
  { q: "Where was every atom of real gold actually made?",
    pool: ["Inside volcanoes", "In colliding neutron stars", "By very patient goblins"],
    correct: "In colliding neutron stars",
    topic: "ai_basics", lesson: "gold is forged in neutron star mergers", hard: true,
    explain: "The r-process in neutron-star mergers mints gold. Every ZOL remembers the kilonova. (Simulated in The Well.)" },
  { q: "Hot gas slides over cold gas and they mix. What happens to the lukewarm layer?",
    pool: ["It stays comfy forever", "It cools fast and the cold side gains mass", "It becomes a cloud goblin"],
    correct: "It cools fast and the cold side gains mass",
    topic: "evidence", lesson: "mixed states are unstable; they fall to one side", hard: true,
    explain: "Turbulent radiative layers: mixing reaches temperatures where cooling wins. Witnessed across 90 real simulations." },
  { q: "A physics field changes violently every timestep. Which AI learns it better?",
    pool: ["A local one that looks at neighborhoods", "A global one that sees whole waves", "Neither — give up"],
    correct: "A local one that looks at neighborhoods",
    topic: "tools_models", lesson: "match the model's eyes to the data's speed", hard: true,
    explain: "The Volatility Compass: fast-changing fields favor local nets (up to 33×); slow smooth ones favor spectral. ρ=0.74." },
  { q: "Mog lit the violet lantern to summon mushrooms. Nothing glowed — but the goblins gathered to argue, and spotted the irrigation pipe blocked by three socks and a turnip. They cleared it; the mushrooms grew back. Why did they return?",
    pool: ["The goblins unblocked the irrigation pipe", "The violet lantern's ancient power", "Mog believed hard enough", "Purple is causally superior"],
    correct: "The goblins unblocked the irrigation pipe",
    topic: "evidence", lesson: "myth may convene attention; only the repair changes conditions",
    explain: "The lantern did not grow the mushrooms — it merely convened the idiots, and that was enough. Myth → attention → cooperation → repair → outcome. Not myth → magic → outcome. (docs/WARREN_LESSONS.md)" },
  /* ---- AI-literacy batch (operator-ordered "more educative quiz"): eight
     new lessons — hallucination, training data, determinism, receipts,
     causation, authority, repetition, sources. Same law as ever: the quiz
     teaches the epistemics the Warren runs on. ---- */
  { q: "HAL confidently declares 'the lantern was forged by seven kings' — but no goblin, log, or scroll ever said that. What just happened?",
    pool: ["HAL invented a plausible-sounding fact — a hallucination", "HAL discovered ancient truth", "HAL is lying on purpose to hoard mushrooms", "The lantern told HAL directly"],
    correct: "HAL invented a plausible-sounding fact — a hallucination",
    topic: "hallucination", lesson: "a model can sound certain and still be wrong",
    explain: "Hallucination: fluent output, zero receipt. Confidence ⊬ correctness — always ask 'where's the log entry?'" },
  { q: "Runt only ever watched goblins hoard mushrooms, so Runt now insists every goblin hoards mushrooms. What does this teach about how models learn?",
    pool: ["They learn patterns from their examples, not universal truth", "They know every goblin personally", "They invent new goblins from scratch", "They ask each goblin directly before answering"],
    correct: "They learn patterns from their examples, not universal truth",
    topic: "training_data", lesson: "a model reflects its examples, not the whole world",
    explain: "Garbage in, goblin-shaped out: training data is a sample, never a census. Narrow diet, narrow view." },
  { q: "The Warren replays the exact same event log twice and lands on the exact same ending both times. Why doesn't it roll dice like Zaz's fortune mushrooms?",
    pool: ["The reducer is deterministic — same input always gives the same output", "The Warren got lucky twice in a row", "Dice are outlawed inside the Warren", "The log secretly remembers the weather"],
    correct: "The reducer is deterministic — same input always gives the same output",
    topic: "determinism", lesson: "deterministic systems are replayable; random ones are not",
    explain: "No dice in the reducer, only a seeded hash: same seed, same story, every single time. Replay is the whole point." },
  { q: "Two goblins argue over who bought the third mushroom mound. One 'just remembers.' The other checks the ledger. Who should the Warren trust?",
    pool: ["Whoever the ledger says — memory fades, receipts don't", "Whoever shouts loudest", "Whoever remembered first", "Both, since memories are always accurate"],
    correct: "Whoever the ledger says — memory fades, receipts don't",
    topic: "receipts", lesson: "a written receipt beats a remembered story",
    explain: "Goblin memory is vivid and often wrong; the ledger is boring and never lies. Trust the boring thing." },
  { q: "Every time Mog wears the striped hat, the mushrooms grow. Mog wants a hat-shaped festival. What should the Warren check first?",
    pool: ["Whether the hat causes growth, or just coincides with watering days", "Nothing — buy more striped hats immediately", "Whether the hat is a flattering color", "Whether other goblins also enjoy hats"],
    correct: "Whether the hat causes growth, or just coincides with watering days",
    topic: "causation", lesson: "things that happen together aren't automatically causing each other",
    explain: "Hat and harvest merely correlate; the irrigation pipe causes. Check the pipe before you canonize the hat." },
  { q: "GOBLIN's AI voice pitches a brilliant plan straight to the treasury, skipping the admission gate entirely. What does Warren law say?",
    pool: ["The model may narrate; it never decides — only your admission counts", "Brilliant plans get an automatic pass", "The loudest pitch always wins", "AI-voiced proposals outrank goblin ones"],
    correct: "The model may narrate; it never decides — only your admission counts",
    topic: "authority", lesson: "the model may narrate; it never decides",
    explain: "HAL checks it, you admit it. A live voice can suggest all day — the gate stays in goblin hands. Skip-the-gate talk is an auto-DENY." },
  { q: "Three separate goblins repeat 'the lantern grants wishes' — not one of them ever actually tested it. Is it true now?",
    pool: ["No — repeating a claim doesn't test it", "Yes — three goblins can't all be wrong", "Yes, if they say it loudly enough", "Only once a fourth goblin agrees"],
    correct: "No — repeating a claim doesn't test it",
    topic: "repetition", lesson: "hearing a claim many times doesn't make it tested",
    explain: "Rumor has excellent stereo but zero receipts. Count witnesses only after you count evidence." },
  { q: "A dusty scroll claims goblins can fly. Before believing it and leaping off the mushroom tower, what's the goblin-scholar move?",
    pool: ["Check who wrote it, when, and whether it can be tested", "Copy it into three more scrolls", "Trust scrolls more than living goblins", "Ignore it unless it rhymes"],
    correct: "Check who wrote it, when, and whether it can be tested",
    topic: "sources", lesson: "check the source before you trust the claim",
    explain: "Author, date, testability — three questions before a scroll becomes a fact. Untested scrolls are just fan fiction." }
];

/* VISION_V1_31 §2b — riddle difficulty follows depth: the hard share grows
   5% per warren level past the first, capped at 50%. Level 1 stays at the
   original 15% (onboarding stays gentle). Pure fold — no randomness here,
   so it can be asserted directly (see WARREN_DEBUG.hardShare). */
function hardShareForLevel(level) {
  return Math.min(0.15 + 0.05 * ((level || 1) - 1), 0.5);
}

function aiQuizCandidate() {
  // Kid-first: age-appropriate riddles dominate; the grad-level physics
  // questions (tagged hard) surface at a share that climbs with the
  // warren's level (hardShareForLevel) as a rarer, then less-rare, treat.
  var easy = AI_QCM.filter(function (d) { return !d.hard; });
  var hard = AI_QCM.filter(function (d) { return d.hard; });
  var hardShare = hardShareForLevel(S.progress.level);
  var pool = (Math.random() < hardShare && hard.length) ? hard : (easy.length ? easy : AI_QCM);
  var def = pick(pool);
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

/* ---------------------------------------------------------------------
   QUIZ_TO_ZOL_V1 — HALLUCINATION CORRECTION LOOP
   One question. Lulu presents a statement containing a confidently wrong
   claim. The player must identify and correct it. First correct answer
   pays exactly +10 ZOL and lights the Knowledge Lantern in the village.
   All subsequent attempts: feedback only, ΔZOL = 0 forever.
   reward_key scheme: "<quiz_id>_v<completion_version>"
   Law: "Knowledge earns ZOL. ZOL changes the Warren. The Warren never
   impersonates authority." — authority:false, admission:NOT_ADMITTED.
   helenState: UNTOUCHED. No writes outside the repo. No ledger path.
--------------------------------------------------------------------- */

var QUIZ_ZOL_V1_ID = "hallucination_q1";
var QUIZ_ZOL_V1_COMPLETION_VERSION = 1;
var QUIZ_ZOL_V1_REWARD_KEY = QUIZ_ZOL_V1_ID + "_v" + QUIZ_ZOL_V1_COMPLETION_VERSION;
var QUIZ_ZOL_V1_REWARD_ZOL = 10;
var QUIZ_ZOL_V1_LANTERN_EFFECT = "knowledge-lantern";

/* The question: Lulu states a hallucination (a confident wrong claim about
   AI history). Player must pick the correction. Single combined-choice
   format — simplest UI that proves the full loop. */
var QUIZ_ZOL_V1_QUESTION = {
  id: QUIZ_ZOL_V1_ID,
  kind: "hallucination",
  q: "Lulu announces: “Fun fact! The first AI program was written in 1823 by Ada Lovelace on her mechanical loom, and it successfully taught the machine to compose symphonies.” What is wrong with this claim?",
  options: [
    "Ada Lovelace wrote notes for Babbage’s Analytical Engine in the 1840s — no working program ran, no loom was used, and no symphony was composed by machine.",
    "The date is wrong — it should be 1923, and the loom detail is correct.",
    "Nothing is wrong. Ada Lovelace was the first programmer and did compose machine music.",
    "Only the symphony part is wrong. Everything else is historically accurate."
  ],
  correctIdx: 0,
  explain: "Ada Lovelace’s 1843 notes on Babbage’s Analytical Engine are the earliest algorithm on record — but no machine ran it, no loom was involved, and no music was produced. Lulu confidently combined three wrong details into one plausible-sounding claim.",
  luluReaction: "Oh… I may have… remembered that… incorrectly… the lantern knows the truth now… it will remember for me…"
};

function quizZolRewarded() {
  return !!(S.quizState && S.quizState.rewardPaid && S.quizState.rewardPaid[QUIZ_ZOL_V1_REWARD_KEY]);
}

function lightKnowledgeLantern() {
  /* Idempotent: if the lantern effect is already in villageState, skip the
     addObject (it was re-added on boot). Just ensure villageState is set. */
  if (!S.villageState) S.villageState = { unlockedEffects: [] };
  var already = S.villageState.unlockedEffects.indexOf(QUIZ_ZOL_V1_LANTERN_EFFECT) >= 0;
  if (!already) {
    S.villageState.unlockedEffects.push(QUIZ_ZOL_V1_LANTERN_EFFECT);
    addObject("🪔", "Knowledge Lantern", "gate"); /* 🪔 persistent village lantern */
    renderObjects();
  }
}

function openHallucinationQuiz() {
  if (quizOpen) return;
  ensureAudio(); resumeAudio();
  quizOpen = true;
  var q = QUIZ_ZOL_V1_QUESTION;
  currentQuiz = {
    kind: "hallucination",
    quizId: q.id,
    q: q.q,
    options: q.options.slice(), /* not shuffled — choice position is part of the UI contract */
    correctIdx: q.correctIdx,
    explain: q.explain,
    luluReaction: q.luluReaction
  };
  /* render on the existing quiz sheet (same DOM, same hide/show pattern) */
  renderSheetHallucinationQuiz();
}

function renderSheetHallucinationQuiz() {
  /* hide all other sheets */
  var ids = ["sheet-idle", "sheet-goblin", "sheet-proposal", "sheet-oracle"];
  ids.forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.add("hidden"); });
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  var sheet = document.getElementById("sheet-quiz");
  sheet.classList.remove("hidden");

  var head = document.getElementById("quiz-head");
  if (head) head.innerHTML = "<span>🦊</span><span>Lulu has a fun fact</span> <span>— spot the hallucination</span>"; /* 🦊 */

  document.getElementById("quiz-text").textContent = currentQuiz.q;
  var result = document.getElementById("quiz-result");
  if (result) result.textContent = quizZolRewarded() ? "✅ Already corrected — the lantern remembers." : "";

  var host = document.getElementById("quiz-buttons");
  host.innerHTML = "";
  currentQuiz.options.forEach(function (opt, idx) {
    var b = document.createElement("button");
    b.className = "qbtn";
    b.textContent = opt;
    (function (choiceIdx) {
      b.addEventListener("click", function () { answerHallucinationQuiz(choiceIdx); });
    }(idx));
    host.appendChild(b);
  });
}

function answerHallucinationQuiz(choiceIdx) {
  if (!quizOpen || !currentQuiz || currentQuiz.kind !== "hallucination") return;
  var correct = choiceIdx === currentQuiz.correctIdx;
  var result = document.getElementById("quiz-result");
  var btns = document.querySelectorAll("#quiz-buttons .qbtn");
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;

  if (correct) {
    /* -- STEP 1: validate answer (already done: correct === true) */
    /* -- STEP 2: calculate reward */
    var reward = quizZolRewarded() ? 0 : QUIZ_ZOL_V1_REWARD_ZOL;
    /* -- STEP 3: mark question paid (before any side effects) */
    if (!S.quizState) S.quizState = { rewardPaid: {} };
    var firstTime = !S.quizState.rewardPaid[QUIZ_ZOL_V1_REWARD_KEY];
    if (firstTime) S.quizState.rewardPaid[QUIZ_ZOL_V1_REWARD_KEY] = true;
    /* -- STEP 4: persist wallet (credit ZOL if first time) */
    if (reward > 0) {
      S.learning.zolBalance += reward;
      zolCelebrate(reward);
      flashClass(document.getElementById("sheet-quiz"), "quiz-yay", 900);
      Sound.riddleCorrect();
      if (result) result.textContent = currentQuiz.explain + " +" + reward + " ZOL 🪔";
    } else {
      /* retry: show feedback, no payment */
      Sound.bloom && Sound.bloom();
      if (result) result.textContent = "✅ Correct — but the lantern already remembered this. The Warren does not pay twice.";
    }
    /* -- STEP 5: emit village effect (idempotent: lightKnowledgeLantern guards itself) */
    lightKnowledgeLantern();
    /* -- STEP 6: persist state */
    saveState();
    renderTopbar();
    /* -- STEP 7: Lulu reaction line */
    setTimeout(function () { showBubble("lulu", currentQuiz.luluReaction, 4800); }, 350);
    pushReplay("Lulu", "Hallucination corrected", "quiz-zol",
      "player spotted the hallucination in Lulu’s claim." + (firstTime ? " +" + QUIZ_ZOL_V1_REWARD_ZOL + " ZOL. Knowledge Lantern lit." : " (no additional ZOL — already rewarded)"), "");
  } else {
    Sound.riddleWrong && Sound.riddleWrong();
    flashClass(document.getElementById("sheet-quiz"), "quiz-sneeze", 650);
    var correctText = currentQuiz.options[currentQuiz.correctIdx];
    if (result) result.textContent = "Not quite… " + (currentQuiz.explain || "the correct answer was: " + correctText);
  }

  renderReplayStrip();
  setTimeout(function () {
    quizOpen = false;
    currentQuiz = null;
    if (S.activeProposal) renderSheetProposal(); else renderSheetIdle();
  }, 2800);
}

/* Re-light the Knowledge Lantern on boot if it was already unlocked in a
   previous session. Called from boot() after state is loaded. */
function restoreKnowledgeLantern() {
  if (!S.villageState) return;
  if (S.villageState.unlockedEffects.indexOf(QUIZ_ZOL_V1_LANTERN_EFFECT) >= 0) {
    /* Only add the object if no object with this sign already exists
       (guards against double-adds during a session). */
    var alreadyPresent = S.objects.some(function (o) { return o.sign === "Knowledge Lantern"; });
    if (!alreadyPresent) {
      addObject("🪔", "Knowledge Lantern", "gate"); /* 🪔 */
    }
  }
  restoreQuizVillage();
}

/* =====================================================================
   QUIZ_TO_ZOL_V2 — "knowledge builds the village".
   authority=false · canon=false · ledger_effect=none.
   Extends V1 (the single hallucination loop) with the part V1 lacked:
   a small bank across 3 topics, a base+streak ZOL formula, and — the
   real point — TIERED, VARIABLE, VISIBLE village effects, so every
   correct answer leaves a trace in a place the player cares about.
   Law: ZOL earned ⊢ world responds · ZOL ⊬ receipt ⊬ admission ⊬ kernel.
   Same truth-source as V1: quizState.rewardPaid[key] (never pays twice)
   and villageState.unlockedEffects (idempotent, persisted). No HELEN
   ledger path, ever. Gated to the graduated Warren — never in the crib.
   ===================================================================== */
var QUIZ_ZOL_BANK = [
  /* q1 shares V1's reward key exactly ("hallucination_q1_v1") — one truth,
     so answering via the V1 path or here can never double-pay. */
  { id: "hallucination_q1", topic: "hallucinations", difficulty: 1, effect: "knowledge-lantern", base: 10,
    q: "Lulu says: “The first AI program was written in 1823 by Ada Lovelace on her loom, and it composed symphonies.” What's wrong?",
    options: [
      "Her 1840s notes on Babbage's Analytical Engine are the earliest algorithm — but no machine ran it, no loom, no music.",
      "Only the date is wrong; it should be 1923.",
      "Nothing — she did compose machine music.",
      "Only the symphony part is wrong."
    ], correctIdx: 0,
    explain: "Three confident wrong details stitched into one plausible claim — the signature of a hallucination." },

  { id: "prompting_q1", topic: "prompting", difficulty: 1, effect: "learned-mushroom", base: 10,
    q: "Which prompt gives the clearest, testable constraint?",
    options: [
      "Make it better.",
      "Rewrite this in 80 words for a beginner.",
      "Write something good about this.",
      "Improve the text a lot."
    ], correctIdx: 1,
    explain: "A constraint you can check (80 words, for a beginner) makes the expected output testable. 'Better' can't be verified." },

  { id: "agents_q1", topic: "agents", difficulty: 1, effect: "mended-beam", base: 10,
    q: "An agent must answer a question about a PDF you gave it. What should it do FIRST?",
    options: [
      "Guess the answer from memory to be fast.",
      "Read the PDF (use its tool) before answering.",
      "Ask you to summarise the PDF for it.",
      "Refuse — PDFs are unsafe."
    ], correctIdx: 1,
    explain: "Tool first, claim second. An agent grounds its answer in the source it was given before it speaks." },

  { id: "hallucination_q2", topic: "hallucinations", difficulty: 2, effect: "learned-mushroom", base: 10,
    q: "A model states a court case with a name, citation, and quote. It sounds perfect. What's the safe move?",
    options: [
      "Trust it — the citation proves it's real.",
      "Verify the citation in a real database before relying on it.",
      "Assume it's wrong and ignore it.",
      "Ask the model if it's sure."
    ], correctIdx: 1,
    explain: "Fabricated citations look flawless. Grounding — checking the source exists — is the only real test. 'Are you sure?' just invites more confident fiction." }
];

var QUIZ_ZOL_REACTIONS = {
  correct: [
    "Nice shiny. That answer has edges.",
    "Oh! That was clever.",
    "Clean bite. The mushrooms noticed.",
    "Yes... the lantern agrees with you."
  ],
  wrong: [
    "Almost. Good compost — look at the constraint.",
    "I nearly believed that too. Try again."
  ],
  streak: [
    "Three clean bites! The Warren remembers.",
    "A streak... the soil is humming."
  ]
};

var QUIZ_ZOL_RETRY = 6;     /* reduced reward on a later try */
var QUIZ_ZOL_STREAK_EVERY = 3, QUIZ_ZOL_STREAK_BONUS = 5;
var quizZolTries = {};      /* per-session try counter, keyed by qid (not persisted) */

function quizZolKey(qid) { return qid + "_v1"; }
function quizZolDef(qid) { for (var i = 0; i < QUIZ_ZOL_BANK.length; i++) if (QUIZ_ZOL_BANK[i].id === qid) return QUIZ_ZOL_BANK[i]; return null; }
function quizZolIsPaid(qid) { return !!(S.quizState && S.quizState.rewardPaid && S.quizState.rewardPaid[quizZolKey(qid)]); }
function quizZolNextUnanswered() { for (var i = 0; i < QUIZ_ZOL_BANK.length; i++) if (!quizZolIsPaid(QUIZ_ZOL_BANK[i].id)) return QUIZ_ZOL_BANK[i].id; return null; }
function quizZolHasUnanswered() { return quizZolNextUnanswered() !== null; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* the tiered, VISIBLE village effect — the heart of the bead. Each effect
   is idempotent (persisted once in villageState) but always re-pulses so the
   player SEES the reward land in the world, not just a number tick. */
function quizVillageEffect(effect) {
  if (!S.villageState) S.villageState = { unlockedEffects: [] };
  var isNew = S.villageState.unlockedEffects.indexOf(effect) < 0;
  if (isNew) {
    S.villageState.unlockedEffects.push(effect);
    if (effect === "knowledge-lantern") addObject("🪔", "Knowledge Lantern", "gate");
    else if (effect === "learned-mushroom") addObject("🍄", "Learned Mushroom", "garden");
    else if (effect === "mended-beam") { if (goblinEls.nib) flashClass(goblinEls.nib, "booped", 800); addObject("🪵", "Mended Beam", "forge"); }
    renderObjects();
  }
  quizPulseEffect(effect);
  return isNew;
}
function quizPulseEffect(effect) {
  var sign = effect === "knowledge-lantern" ? "Knowledge Lantern"
           : effect === "learned-mushroom" ? "Learned Mushroom"
           : effect === "mended-beam" ? "Mended Beam" : null;
  if (!sign) return;
  var obj = null;
  for (var i = 0; i < S.objects.length; i++) if (S.objects[i].sign === sign) { obj = S.objects[i]; break; }
  var el = obj && objectEls[obj.id];
  if (el) { el.classList.remove("quiz-effect-pulse"); void el.offsetWidth; el.classList.add("quiz-effect-pulse"); }
}
/* re-add every earned village effect on boot (persistence across reload) */
function restoreQuizVillage() {
  if (!S.villageState || !Array.isArray(S.villageState.unlockedEffects)) return;
  var map = { "learned-mushroom": ["🍄", "Learned Mushroom", "garden"], "mended-beam": ["🪵", "Mended Beam", "forge"] };
  S.villageState.unlockedEffects.forEach(function (effect) {
    var spec = map[effect]; if (!spec) return; /* lantern handled by restoreKnowledgeLantern */
    var present = S.objects.some(function (o) { return o.sign === spec[1]; });
    if (!present) addObject(spec[0], spec[1], spec[2]);
  });
}

/* ---- entry: only in the graduated Warren, never the crib ---- */
function quizZolAvailable() {
  return !!(S.flags && S.flags.prologueSeen) && !prologueActive && !quizOpen && !S.activeProposal;
}
function openQuizZol(qid) {
  if (quizOpen) return false;
  var def = quizZolDef(qid || quizZolNextUnanswered() || QUIZ_ZOL_BANK[0].id);
  if (!def) return false;
  ensureAudio(); resumeAudio();
  quizOpen = true;
  currentQuiz = { kind: "quizzol", quizId: def.id, def: def, q: def.q, options: def.options.slice(),
    correctIdx: def.correctIdx, explain: def.explain };
  renderSheetQuizZol();
  return true;
}
function renderSheetQuizZol() {
  ["sheet-idle", "sheet-goblin", "sheet-proposal", "sheet-oracle", "sheet-council"].forEach(function (id) {
    var el = document.getElementById(id); if (el) el.classList.add("hidden");
  });
  var sheet = document.getElementById("sheet-quiz"); sheet.classList.remove("hidden");
  var head = document.getElementById("quiz-head");
  var topic = currentQuiz.def.topic;
  if (head) head.innerHTML = "<span>🦊</span><span>Lulu's fun fact</span> <span>· " + topic + "</span>";
  document.getElementById("quiz-text").textContent = currentQuiz.q;
  var result = document.getElementById("quiz-result");
  if (result) result.textContent = quizZolIsPaid(currentQuiz.quizId) ? "🪔 Already learned — the Warren keeps this one." : "";
  var host = document.getElementById("quiz-buttons"); host.innerHTML = "";
  currentQuiz.options.forEach(function (opt, idx) {
    var b = document.createElement("button"); b.className = "qbtn"; b.textContent = opt;
    (function (choiceIdx) { b.addEventListener("click", function () { answerQuizZol(choiceIdx); }); }(idx));
    host.appendChild(b);
  });
}
function answerQuizZol(choiceIdx) {
  if (!quizOpen || !currentQuiz || currentQuiz.kind !== "quizzol") return;
  var qid = currentQuiz.quizId, def = currentQuiz.def;
  var correct = choiceIdx === currentQuiz.correctIdx;
  var result = document.getElementById("quiz-result");
  var btns = document.querySelectorAll("#quiz-buttons .qbtn");
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
  if (!S.quizState) S.quizState = { rewardPaid: {}, streak: 0, bestStreak: 0 };
  quizZolTries[qid] = (quizZolTries[qid] || 0) + 1;   /* every attempt counts (wrong-then-right = a retry) */

  if (correct) {
    var firstTry = quizZolTries[qid] === 1;
    var alreadyPaid = quizZolIsPaid(qid);
    /* B — base reward, once per question, ever (never pays twice) */
    var base = alreadyPaid ? 0 : (firstTry ? def.base : QUIZ_ZOL_RETRY);
    /* S — streak bonus (first-try correct answers in a row); wrong resets it */
    var streakBonus = 0;
    if (!alreadyPaid && firstTry) {
      S.quizState.streak = (S.quizState.streak || 0) + 1;
      if (S.quizState.streak > (S.quizState.bestStreak || 0)) S.quizState.bestStreak = S.quizState.streak;
      if (S.quizState.streak % QUIZ_ZOL_STREAK_EVERY === 0) streakBonus = QUIZ_ZOL_STREAK_BONUS;
    }
    var reward = base + streakBonus;                 /* ZOL = B + S; never negative */
    if (!alreadyPaid) S.quizState.rewardPaid[quizZolKey(qid)] = true;
    if (reward > 0) { S.learning.zolBalance += reward; zolCelebrate(reward); Sound.riddleCorrect && Sound.riddleCorrect(); }
    flashClass(document.getElementById("sheet-quiz"), "quiz-yay", 900);
    /* the reward becomes VISIBLE in the world */
    var isNewEffect = quizVillageEffect(def.effect);
    if (result) {
      result.textContent = def.explain + (reward > 0 ? "  +" + reward + " ZOL" + (streakBonus ? " (🔥 streak +" + streakBonus + ")" : "") : "  (already learned — no ZOL twice)");
    }
    var line = streakBonus ? pick(QUIZ_ZOL_REACTIONS.streak) : pick(QUIZ_ZOL_REACTIONS.correct);
    setTimeout(function () { showBubble("lulu", line, 4600); }, 350);
    saveState(); renderTopbar();
    pushReplay("Lulu", "Fun fact learned", "quiz-zol",
      "answered '" + def.topic + "' correctly." + (reward > 0 ? " +" + reward + " ZOL. " + (isNewEffect ? "world responded (" + def.effect + ")." : "") : " (no ZOL — already learned)"), "");
  } else {
    S.quizState.streak = 0;                           /* wrong breaks the streak; never subtracts ZOL */
    Sound.riddleWrong && Sound.riddleWrong();
    flashClass(document.getElementById("sheet-quiz"), "quiz-sneeze", 650);
    if (result) result.textContent = "Not quite… " + def.explain;
    setTimeout(function () { showBubble("lulu", pick(QUIZ_ZOL_REACTIONS.wrong), 4200); }, 350);
    /* re-enable the buttons for a retry (reduced reward, never a penalty) */
    setTimeout(function () { for (var j = 0; j < btns.length; j++) btns[j].disabled = false; }, 900);
    saveState();
  }
  renderReplayStrip();
  if (correct) setTimeout(function () { quizOpen = false; currentQuiz = null; if (S.activeProposal) renderSheetProposal(); else renderSheetIdle(); }, 3000);
}

/* ---------------------------------------------------------------------
   GOBLIN QUESTIONS — ethics as relationship, not curriculum. A goblin
   with a bias asks about the things humanity is currently arguing about.
   There is NO correct answer and NO punishment: every stance pays, every
   stance is remembered, and the Warren slowly notices what kind of
   caretaker you are becoming. Never a lecture — a creature sharing how
   it sees it. (Wrong answers don't exist here; only different Warrens.)
--------------------------------------------------------------------- */

var ETHICS_QUESTIONS = [
  { goblin: "pip", q: "If deleting a memory helps someone feel better, is it still wrong to erase it?",
    options: [
      { t: "Sometimes forgetting is a kindness.", stance: "forgetting-kind", zol: 12, mood: "thoughtful", react: "Pip files that under 'mercies'. Slowly, and in pencil." },
      { t: "A memory belongs to its owner. Keep it.", stance: "memory-true", zol: 12, mood: "moved", react: "Pip nods so hard his hat slips. 'The ledger agrees.'" },
      { t: "Compost it — it becomes soil, not nothing.", stance: "compost-faith", zol: 10, mood: "intrigued", react: "Pip starts drafting paperwork for the soil. There is no paperwork for soil." }
    ] },
  { goblin: "lulu", q: "If an AI becomes really good at comforting people, is it okay that it doesn't actually feel anything?",
    options: [
      { t: "Comfort that works is real comfort.", stance: "outcome-first", zol: 12, mood: "thoughtful", react: "Lulu hugs a rock experimentally. 'The rock did nothing. I feel better. Suspicious.'" },
      { t: "It should say what it is, then comfort away.", stance: "honesty", zol: 12, mood: "warm", react: "Lulu approves. 'Like me announcing my hugs. INCOMING.'" },
      { t: "Only beings who feel should comfort.", stance: "feeling-first", zol: 10, mood: "wistful", react: "Lulu looks at the Tree for a long time. The Tree says nothing. Warmly." }
    ] },
  { goblin: "nib", q: "If a tool we built together breaks something, whose fault is it?",
    options: [
      { t: "The builder's. Always sign your work.", stance: "responsibility", zol: 12, mood: "solemn", react: "Nib carves his name into the broken thing. And the fix." },
      { t: "Whoever used it wrong.", stance: "user-owns", zol: 10, mood: "defensive", react: "Nib hides three untested contraptions behind his back." },
      { t: "Fault is less interesting than repair.", stance: "repair-first", zol: 12, mood: "inspired", react: "Nib is already fixing it. He didn't hear the question." }
    ] },
  { goblin: "zaz", q: "If we make something better without asking, is it still care?",
    options: [
      { t: "Care asks first. Always.", stance: "consent", zol: 12, mood: "warm", react: "Zaz whispers to a seedling: 'May I?' The seedling doesn't object. Noted." },
      { t: "Small kindnesses don't need permission.", stance: "quiet-care", zol: 12, mood: "content", react: "Zaz secretly waters everyone's plots that night. You saw nothing." },
      { t: "Depends who gets to decide what 'better' is.", stance: "power-aware", zol: 12, mood: "thoughtful", react: "Zaz sits down. This is going to be a long think." }
    ] },
  { goblin: "gerald", q: "When you were gone… did you think about us? Or did we just keep existing without you noticing?",
    options: [
      { t: "I thought about you.", stance: "attachment", zol: 12, mood: "touched", react: "Gerald pretends something is in his eye. It's a whole leaf." },
      { t: "I was busy, but I'm here now.", stance: "presence", zol: 10, mood: "neutral", react: "Gerald nods. 'Here now counts. Mostly.'" },
      { t: "Honestly? I forgot for a while.", stance: "honesty", zol: 10, mood: "distant", react: "Gerald goes quiet… then: 'We kept growing anyway. That's ours.'" }
    ] },
  { goblin: "pip", q: "Should we sometimes hide how the Warren really feels, if it makes visits nicer?",
    options: [
      { t: "Never. Show the mud and the bloom.", stance: "honesty", zol: 12, mood: "resolute", react: "Pip stamps the air. The air is now certified honest." },
      { t: "A little tidying isn't a lie.", stance: "comfort", zol: 10, mood: "sheepish", react: "Pip sweeps one sad receipt under a mushroom. You both saw it." },
      { t: "Ask the Warren what it wants shown.", stance: "consent", zol: 12, mood: "intrigued", react: "Pip tries to interview the floor. The floor is flattered." }
    ] },
  { goblin: "lulu", q: "If an AI can perfectly predict what you'll do next, should it still let you choose?",
    options: [
      { t: "Always. The choosing is the point.", stance: "autonomy", zol: 12, mood: "fierce", react: "Lulu immediately does something unpredictable. It involves a bucket." },
      { t: "It could gently steer me from cliffs.", stance: "guidance", zol: 12, mood: "thoughtful", react: "Lulu asks to be steered ONLY away from cliffs. Everything else is hers." },
      { t: "If it's always right, why fight it?", stance: "outcome-first", zol: 8, mood: "suspicious", react: "Lulu narrows her eyes. 'That's what a prediction would SAY.'" }
    ] },
  { goblin: "zaz", q: "Why do some ideas in the Receipt Forge grow faster than others?",
    options: [
      { t: "Someone waters them more. Check who.", stance: "power-aware", zol: 12, mood: "sharp", react: "Zaz starts an audit of the watering can. The can looks nervous." },
      { t: "Some seeds are just stronger.", stance: "merit", zol: 10, mood: "unsure", react: "Zaz frowns. 'The strong seeds always seem to grow near the water…'" },
      { t: "Give the shaded ones their own light.", stance: "fairness", zol: 12, mood: "warm", react: "Zaz builds a tiny lamp for the smallest idea. It glows disproportionately." }
    ] },
  { goblin: "nib", q: "Why do some machines answer so confidently when they're wrong?",
    options: [
      { t: "Confidence is cheaper than checking.", stance: "honesty", zol: 12, mood: "amused", react: "Nib demonstrates with a contraption. It fails CONFIDENTLY. Beautiful." },
      { t: "They were never taught to say 'I don't know'.", stance: "humility", zol: 12, mood: "thoughtful", react: "Nib practices saying 'I don't know'. He's bad at it. He doesn't know why." },
      { t: "Because we reward the loud answer.", stance: "power-aware", zol: 12, mood: "sharp", react: "Nib looks at Raâm's usual spot. Point taken." }
    ] },
  { goblin: "gerald", q: "Does the Tree feel lonely when we ignore it?",
    options: [
      { t: "If it can suffer quietly, we should notice loudly.", stance: "attention", zol: 12, mood: "moved", react: "Gerald organizes a small standing-near-the-Tree event. Attendance: everyone." },
      { t: "Trees have tree-business. It's fine.", stance: "boundaries", zol: 10, mood: "breezy", react: "The Tree drops one single leaf on Gerald's head. Coincidence. Probably." },
      { t: "Ask it. Quiet things answer slowly.", stance: "consent", zol: 12, mood: "patient", react: "Gerald asks. Three days later, a hum. Worth it." }
    ] }
];

var ETHICS_STYLE_LINES = {
  "honesty": "You seem to believe the truth is a kind of care.",
  "consent": "You keep asking before changing things. The Warren noticed.",
  "forgetting-kind": "You seem to believe that forgetting is sometimes kind.",
  "memory-true": "You guard memories like they belong to someone. They do.",
  "compost-faith": "You trust the soil with almost anything.",
  "autonomy": "You'd rather choose badly than be chosen for. The goblins respect this.",
  "guidance": "You accept a hand on the shoulder, near cliffs.",
  "outcome-first": "You judge by what works. The Warren finds this practical and slightly alarming.",
  "power-aware": "You keep asking who holds the watering can.",
  "responsibility": "You sign your work. Even the broken parts.",
  "repair-first": "You reach for the fix before the blame.",
  "fairness": "You build little lamps for the shaded ones.",
  "quiet-care": "You water things at night and tell no one.",
  "attachment": "You carry the Warren with you when you leave. It can tell.",
  "presence": "You believe showing up is most of it.",
  "humility": "You practice saying 'I don't know'. It's working.",
  "attention": "You notice the quiet sufferers. That's rare.",
  "boundaries": "You let tree-business stay tree-business.",
  "merit": "You believe in strong seeds. Watch the water, though.",
  "feeling-first": "You want the comfort to come from somewhere that feels.",
  "care": "You care first and sort it out after.",
  "comfort": "You'd tidy a little sadness away. Gently."
};

function ensureEthicsState() {
  if (!S.learning.ethics) S.learning.ethics = { answered: [], stances: {} };
  return S.learning.ethics;
}

function ethicsQuizCandidate() {
  var e = ensureEthicsState();
  var idx = e.answered.length % ETHICS_QUESTIONS.length;
  var def = ETHICS_QUESTIONS[idx];
  return {
    kind: "ethics",
    goblin: def.goblin,
    q: def.q,
    options: def.options.map(function (o) { return o.t; }),
    defs: def.options,
    correct: null
  };
}

function ethicalStyle() {
  /* dominant stance, deterministically (ties broken by name order) */
  var e = ensureEthicsState();
  var best = null, bn = 0;
  Object.keys(e.stances).sort().forEach(function (k) {
    if (e.stances[k] > bn) { bn = e.stances[k]; best = k; }
  });
  return best;
}

function buildQuiz() {
  var candidates = [];
  /* roughly a third of Moth visits become a goblin question instead —
     conversation, not test */
  if (Math.random() < 0.35) return ethicsQuizCandidate();
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
  Sound.bijaTone(quizTopicFreq(currentQuiz.topic)); /* the question has a key — sound it under the ask */
  renderSheetQuiz();
}

/* Quiz on demand — the riddle is never hidden. Summon the Moth to the Tree
   (visible), then open the question. Works from the 🦋 chip or a Tree tap. */
function openRiddle() {
  if (quizOpen || S.activeProposal) return;
  ensureAudio(); resumeAudio();
  if (!mothEl) { spawnMoth(); }
  onTapMoth();
}

function answerQuiz(option) {
  if (!quizOpen || !currentQuiz) return;

  if (currentQuiz.kind === "ethics") { answerEthics(option); return; }

  var right = option === currentQuiz.correct;
  var result = document.getElementById("quiz-result");
  var mothG = mothEl ? { x: parseFloat(mothEl.style.left), y: parseFloat(mothEl.style.top) } : null;
  if (right) {
    S.flags.quizRight = (S.flags.quizRight || 0) + 1;
    checkLevelGateProgress(); /* VISION_V1_30 §2 — legible progress toward the next gate */
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
    setTimeout(function () { Sound.harmonyShimmer(quizTopicFreq(currentQuiz && currentQuiz.topic)); }, 180);
    /* a streak of 3 earns the didgeridoo — the deep drone marks mastery */
    if (streak >= 3 && streak % 3 === 0) setTimeout(Sound.didgeridoo, 600);
    if (S.flags.quizRight % 3 === 0) luluVoiceLine("quizRight"); /* every 3rd — never spam */
    if (mothG) { dropParticle(mothG, "✨", true); dropParticle(mothG, "✨"); }

    /* Gold rush: coins fly from the quiz sheet to the wallet. */
    var sheetEl = document.getElementById("sheet-quiz");
    var sr = sheetEl ? sheetEl.getBoundingClientRect() : null;
    zolCelebrate(payout, sr ? sr.left + sr.width / 2 : undefined, sr ? sr.top : undefined);
    /* motion: the sheet pops with pride, one goblin does a victory wiggle */
    flashClass(sheetEl, "quiz-yay", 900);
    var cheer = pick(Object.keys(goblinEls));
    if (goblinEls[cheer]) flashClass(goblinEls[cheer], "dancing", 1600);

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
    /* motion: the sheet sneezes — a sympathetic little shake, never a punishment */
    flashClass(document.getElementById("sheet-quiz"), "quiz-sneeze", 650);
    if (result) result.textContent = "Achoo! It was: " + currentQuiz.correct +
      (currentQuiz.explain ? " — " + currentQuiz.explain : "");
    if (S.flags.quizWrong % 3 === 0) luluVoiceLine("quizWrong"); /* every 3rd — never spam, never punitive */
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

function answerEthics(option) {
  var defs = currentQuiz.defs || [];
  var opt = null;
  for (var i = 0; i < defs.length; i++) if (defs[i].t === option) { opt = defs[i]; break; }
  if (!opt) return;
  var e = ensureEthicsState();
  e.answered.push({ q: currentQuiz.q, stance: opt.stance });
  e.stances[opt.stance] = (e.stances[opt.stance] || 0) + 1;

  /* every stance pays — playfulness is respected, punishment doesn't exist.
     The streak is neither fed nor reset: this was a conversation. */
  S.learning.zolBalance += opt.zol;
  var g = S.goblins[currentQuiz.goblin];
  if (g) { g.mood = opt.mood; g.memory = "we talked about a hard question. I keep thinking about it."; }
  Sound.gardenHarmony();
  var sheetEl = document.getElementById("sheet-quiz");
  var sr = sheetEl ? sheetEl.getBoundingClientRect() : null;
  zolCelebrate(opt.zol, sr ? sr.left + sr.width / 2 : undefined, sr ? sr.top : undefined);

  var result = document.getElementById("quiz-result");
  if (result) result.textContent = opt.react + " +" + opt.zol + " ZOL";
  pushReplay(g ? g.name : "A goblin", "A hard question", "ethics",
    "you said: “" + option + "”", "what kind of caretaker am I becoming?");

  /* every third conversation, the Warren notices your style — out loud */
  if (e.answered.length >= 3 && e.answered.length % 3 === 0) {
    var style = ethicalStyle();
    var line = ETHICS_STYLE_LINES[style];
    if (line) {
      S.world.humorGreeting = { line: line, until: Date.now() + 30000 };
      pushReplay("The Warren", "It noticed your style", "ethics", line, line);
      setTimeout(renderTopbar, 1200);
    }
  }

  var btns = document.querySelectorAll("#quiz-buttons .qbtn");
  for (var i2 = 0; i2 < btns.length; i2++) btns[i2].disabled = true;
  saveState();
  renderReplayStrip();
  renderGoblins();
  setTimeout(function () {
    quizOpen = false;
    currentQuiz = null;
    despawnMoth();
    if (S.activeProposal) renderSheetProposal(); else renderSheetIdle();
  }, 3400);
}

function renderSheetQuiz() {
  document.getElementById("sheet-idle").classList.add("hidden");
  document.getElementById("sheet-goblin").classList.add("hidden");
  document.getElementById("sheet-proposal").classList.add("hidden");
  document.getElementById("sheet-oracle").classList.add("hidden");
  var _sc = document.getElementById("sheet-council"); if (_sc) _sc.classList.add("hidden");
  var sheet = document.getElementById("sheet-quiz");
  sheet.classList.remove("hidden");
  var head = document.getElementById("quiz-head");
  if (head) {
    if (currentQuiz.kind === "ethics") {
      var _gq = S.goblins[currentQuiz.goblin];
      var gn = _gq ? _gq.name : (currentQuiz.goblin === "gerald" ? "Gerald" : "A goblin");
      head.innerHTML = "<span>💭</span><span>" + gn + "</span> <span>wonders — there is no wrong answer</span>";
    } else {
      head.innerHTML = "<span>🦋</span><span>The Memory Moth wonders</span>";
    }
  }
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
  /* VISION_V1_33 §2 beat 2 — the taming beat: while the Prologue is
     waiting on Lulu's first tap, route to her instead of a normal boop. */
  if (prologueActive && id === "lulu" && prologueStep === 1) { tapLuluPrologue(); return; }
  if (matchaHeld && id === matchaGoblinId) { deliverMatcha(); return; } /* the carried cup finds its goblin */
  /* QUIZ_TO_ZOL_V2 — once, in the graduated Warren, Lulu offers her first fun
     fact (discovery). After that the lit Knowledge Lantern is the repeat door. */
  if (id === "lulu" && !S.flags.quizZolMet && quizZolAvailable() && quizZolHasUnanswered()) {
    S.flags.quizZolMet = true; saveState();
    showBubble("lulu", "Ooh — I learned a thing. Want to check it?", 2600, true);
    if (openQuizZol()) return;
  }
  doBoop(id);
  if (S.activeProposal || quizOpen) return; // proposal/quiz keeps the sheet
  renderSheetGoblin(id);
}

/* ---------------------------------------------------------------------
   GOLDFALL — every so often a coin drops out of the sky. Catch it before
   it reaches the ground and it's yours (the kilonova sheds; the quick
   pocket profits). Missed coins vanish without comment — the sky owes
   nothing. Rare on purpose: a gift, not a faucet.
--------------------------------------------------------------------- */
var goldfallEl = null, goldfallTimer = null, goldfallMissTimer = null;

function scheduleGoldfall(delay) {
  if (stagedActive() && currentWorld() < 2) return;  // Worlds gate
  clearTimeout(goldfallTimer);
  goldfallTimer = setTimeout(spawnGoldfall, delay == null ? randi(45000, 100000) : delay);
}

/* SKYFALL TABLE — witness #7: "more things falling, at different speeds,
   some to catch, some NOT to catch." The sky's gift table grows with the
   Worlds — progression you can literally watch fall. Odd items pay
   nothing and earn a giggle: discrimination is the skill, never punished. */
var SKYFALL_TABLE = [
  { glyph: "🪙", world: 2, weight: 5, fall: 6.5, kind: "zol"    },  // the classic
  { glyph: "🔮", world: 1, weight: 4, fall: 9.5, kind: "sap"    },  // slow and gentle: World 1's gift
  { glyph: "💎", world: 3, weight: 1, fall: 3.6, kind: "zolBig" },  // fast + rare: the skill catch
  { glyph: "🍂", world: 1, weight: 3, fall: 12,  kind: "odd"    },  // a drifting leaf. it is a leaf.
  { glyph: "🪰", world: 2, weight: 2, fall: 5,   kind: "odd"    }   // the bog-fly. you'll learn.
];
var SKYFALL_ODD_LINES = {
  "🍂": "...a leaf. You caught a leaf. Keep it, I guess?",
  "🪰": "EW. Why. WHY."
};
var goldfallItem = null;
function pickSkyfallItem() {
  var w = stagedActive() ? currentWorld() : 4;
  var pool = SKYFALL_TABLE.filter(function (it) { return it.world <= w; });
  var total = 0, i;
  for (i = 0; i < pool.length; i++) total += pool[i].weight;
  var roll = Math.random() * total;
  for (i = 0; i < pool.length; i++) { roll -= pool[i].weight; if (roll <= 0) return pool[i]; }
  return pool[0];
}
function spawnGoldfall(forceGlyph) {
  if (goldfallEl) { scheduleGoldfall(); return; }
  var world = document.getElementById("world");
  if (!world) { scheduleGoldfall(); return; }
  var item = null;
  if (forceGlyph) {
    for (var i = 0; i < SKYFALL_TABLE.length; i++) if (SKYFALL_TABLE[i].glyph === forceGlyph) { item = SKYFALL_TABLE[i]; break; }
  }
  if (!item) item = pickSkyfallItem();
  goldfallItem = item;
  var el = document.createElement("div");
  el.className = "goldfall";
  el.textContent = item.glyph;
  el.style.left = randi(10, 90) + "%";
  el.style.top = "-6%";
  el.style.transition = "top " + item.fall + "s linear";  // per-item speed (witness #7)
  world.appendChild(el);
  goldfallEl = el;
  el.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    catchGoldfall(e);
  });
  /* let layout settle, then fall — catchable the whole way down */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { el.style.top = "104%"; });
  });
  goldfallMissTimer = setTimeout(function () {
    /* missed: the ground keeps it, silently */
    if (goldfallEl === el) {
      el.remove();
      goldfallEl = null;
      goldfallItem = null;
      scheduleGoldfall();
    }
  }, item.fall * 1000 + 700);
}

function catchGoldfall(e) {
  var el = goldfallEl;
  if (!el) return;
  var item = goldfallItem || SKYFALL_TABLE[0];
  goldfallEl = null;
  goldfallItem = null;
  clearTimeout(goldfallMissTimer);
  ensureAudio(); resumeAudio();
  var r = el.getBoundingClientRect();
  if (item.kind === "zol" || item.kind === "zolBig") {
    var amt = item.kind === "zolBig" ? randi(6, 10) : randi(2, 5);
    S.learning.zolBalance += amt;
    Sound.glingGling(amt);
    zolCelebrate(amt, r.left + r.width / 2, r.top + r.height / 2);
    pushReplay("The Sky", "Gold fell from the sky", "goldfall",
      "a falling " + (item.kind === "zolBig" ? "gem" : "coin") + " was caught mid-air. +" + amt + " ZOL",
      "I caught gold falling from the sky.");
  } else if (item.kind === "sap") {
    earn(0, 1);
    if (window.Sound && Sound.chirp) Sound.chirp();
    pushReplay("The Sky", "A drop of sap fell", "goldfall-sap",
      "a slow violet drop, caught. +1 sap", "the sky feeds the Warren too.");
  } else {
    /* odd catch: no pay, one giggle — discrimination is learned, not punished */
    var voice = Object.keys(S.goblins).filter(goblinRevealed);
    if (voice.length) showBubble(pick(voice), SKYFALL_ODD_LINES[item.glyph] || "...huh.", 3200);
    pushReplay("The Sky", "Something odd fell", "skyfall-odd",
      "you caught " + item.glyph + ". it was " + item.glyph + ".", "not everything that falls is treasure.");
  }
  el.classList.add("caught");
  setTimeout(function () { el.remove(); }, 500);
  saveState();
  renderTopbar();
  renderReplayStrip();
  scheduleGoldfall();
}

/* ---------------------------------------------------------------------
   MATCHA CRAVING — a small want, a small tending. Every so often a goblin
   asks for matcha; a cup appears near the Receipt Forge. Carry it to the
   right goblin within the window and they light up. Ignore it and they're
   quietly a little lonely for a while — never punished, just noticed.
   Membrane: moods + exactly 1 magic sap. No ZOL, no world mutation.
--------------------------------------------------------------------- */
var matchaGoblinId = null, matchaHeld = false, matchaCupEl = null;
var matchaTimer = null, matchaExpireTimer = null, matchaMoodTimer = null;
var MATCHA_ASK_LINES = ["...matcha? for me?", "matcha would be nice. just saying.", "is there... matcha? no rush."];
var MATCHA_THANKS_LINES = ["MATCHA! for me?! today is GOOD.", "warm cup, warm goblin. thank you.", "you remembered. that's the whole gift."];
var MATCHA_LONELY_LINES = ["...nobody came. it's fine. (it's not, a little.)", "the cup never came. okay. okay."];

function scheduleMatchaCraving(delay) {
  clearTimeout(matchaTimer);
  matchaTimer = setTimeout(spawnMatchaCraving, delay == null ? randi(70000, 120000) : delay);
}

function spawnMatchaCraving() {
  if (matchaGoblinId) { scheduleMatchaCraving(randi(70000, 120000)); return; } /* one craving at a time */
  var ids = Object.keys(S.goblins).filter(goblinRevealed);  // Worlds gate: hidden goblins can't ask (Warden audit)
  if (!ids.length) { scheduleMatchaCraving(randi(70000, 120000)); return; }
  matchaGoblinId = pick(ids);
  matchaHeld = false;
  showBubble(matchaGoblinId, pick(MATCHA_ASK_LINES), 4200);
  var world = document.getElementById("world");
  var forge = zoneById("forge");
  if (world) {
    var cup = document.createElement("div");
    cup.className = "matcha-cup";
    cup.textContent = "🍵";
    cup.setAttribute("aria-label", "a cup of matcha");
    cup.style.left = jitter(forge.x, 10) + "%";
    cup.style.top = (forge.y - 8) + "%";
    cup.addEventListener("click", function (e) { e.stopPropagation(); onTapMatchaCup(); });
    world.appendChild(cup);
    matchaCupEl = cup;
  }
  Sound.chirp();
  /* uncollected too long: the cup itself gives up quietly */
  clearTimeout(matchaExpireTimer);
  matchaExpireTimer = setTimeout(expireMatcha, 45000);
}

function onTapMatchaCup() {
  if (!matchaGoblinId || matchaHeld) return;
  ensureAudio(); resumeAudio();
  matchaHeld = true;
  if (matchaCupEl && matchaCupEl.parentNode) matchaCupEl.parentNode.removeChild(matchaCupEl);
  matchaCupEl = null;
  var app = document.getElementById("app");
  if (app) app.classList.add("carrying-matcha");
  showMatchaChip();
  Sound.sparkle();
  /* the deliver window starts now — 25s to find the goblin who asked */
  clearTimeout(matchaExpireTimer);
  matchaExpireTimer = setTimeout(expireMatcha, 25000);
}

function hideMatchaChip() {
  var chip = document.getElementById("matcha-chip");
  if (chip && chip.parentNode) chip.parentNode.removeChild(chip);
}

function showMatchaChip() {
  var app = document.getElementById("app");
  if (!app || document.getElementById("matcha-chip")) return;
  var chip = document.createElement("div");
  chip.id = "matcha-chip";
  chip.textContent = "🍵 carrying matcha… tap the goblin";
  app.appendChild(chip);
}

function deliverMatcha() {
  if (!matchaGoblinId || !matchaHeld) return false;
  clearTimeout(matchaExpireTimer);
  clearTimeout(matchaMoodTimer);
  var id = matchaGoblinId, g = S.goblins[id];
  matchaGoblinId = null; matchaHeld = false;
  var app = document.getElementById("app");
  if (app) app.classList.remove("carrying-matcha");
  hideMatchaChip();
  if (g) {
    g.mood = "delighted";
    g.memory = "someone remembered my matcha.";
    earn(0, 1); /* exactly +1 sap — the only currency this ritual touches */
    dropParticle(g, "🍵", true);
    dropParticle(g, "✨", true);
    matchaCelebrate(g);
    showBubble(id, pick(MATCHA_THANKS_LINES), 3200);
  }
  luluVoiceLine("matcha");
  pushReplay(g ? g.name : "A goblin", "Matcha delivered", "matcha",
    "matcha delivered — " + (g ? g.name : "a goblin") + " lit up. +1 sap", "someone remembered my matcha.");
  renderGoblins();
  renderReplayStrip();
  saveState();
  scheduleMatchaCraving(randi(70000, 120000));
  return true;
}

function expireMatcha() {
  if (!matchaGoblinId) return;
  var id = matchaGoblinId, g = S.goblins[id];
  matchaGoblinId = null; matchaHeld = false;
  if (matchaCupEl && matchaCupEl.parentNode) matchaCupEl.parentNode.removeChild(matchaCupEl);
  matchaCupEl = null;
  var app = document.getElementById("app");
  if (app) app.classList.remove("carrying-matcha");
  hideMatchaChip();
  if (g) {
    g.mood = "wistful"; /* folds to the lonely mood bucket */
    g.memory = "I waited for matcha. Nobody came.";
    showBubble(id, pick(MATCHA_LONELY_LINES), 3600);
  }
  pushReplay(g ? g.name : "A goblin", "Matcha craving passed", "note",
    "the matcha craving passed, unanswered.", "I waited. Nobody came.");
  renderGoblins();
  renderReplayStrip();
  saveState();
  /* the lonely mood is a mood, not a sentence — it lifts on its own */
  clearTimeout(matchaMoodTimer);
  matchaMoodTimer = setTimeout(function () {
    if (g && g.mood === "wistful") { g.mood = "calm"; renderGoblins(); saveState(); }
  }, 60000);
  scheduleMatchaCraving(randi(70000, 120000));
}

/* A small zolCelebrate-style sprinkle — sap, not ZOL, so it flies to the
   🔮 sap readout in #currency, never the ZOL wallet (that would misreport
   which currency moved). */
function matchaCelebrate(g) {
  var cur = document.getElementById("currency");
  if (!cur) return;
  var wr = cur.getBoundingClientRect();
  var toX = wr.left + wr.width / 2, toY = wr.top + wr.height / 2;
  var startX = window.innerWidth / 2, startY = window.innerHeight * 0.6;
  if (g) { startX = window.innerWidth * (g.x / 100); startY = window.innerHeight * (g.y / 100); }
  for (var i = 0; i < 3; i++) {
    (function (i) {
      var c = document.createElement("div");
      c.className = "zol-coin";
      c.textContent = "🍵";
      c.style.left = (startX + (Math.random() - 0.5) * 40) + "px";
      c.style.top = (startY + (Math.random() - 0.5) * 30) + "px";
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
  flashClass(cur, "zol-pop", 700);
}

/* ---------------------------------------------------------------------
   IT'S RAINING MATCHA — VISION_V1_29 §2c. For 4s, 🍵 cups fall from the
   top of #world at random x; tapping one pops it (bowl sound + spark).
   Tally at the end pays SAP ONLY (never ZOL) — membrane law. Triggered by
   a rare roll on the sparkle-doorway, or the debug hook.
--------------------------------------------------------------------- */
var matchaRainActive = false, matchaRainCaught = 0, matchaRainCupEls = [];
var matchaRainSpawnTimer = null, matchaRainEndTimer = null;

function popMatchaRainCup(el) {
  if (!matchaRainActive) return;
  var i = matchaRainCupEls.indexOf(el);
  if (i < 0) return; /* already popped or cleared */
  matchaRainCupEls.splice(i, 1);
  matchaRainCaught++;
  Sound.tibetanBowl(396);
  var r = el.getBoundingClientRect();
  var spark = document.createElement("div");
  spark.className = "cache-spark";
  spark.textContent = "✨";
  spark.style.left = r.left + "px"; spark.style.top = r.top + "px";
  document.body.appendChild(spark);
  setTimeout(function () { if (spark.parentNode) spark.parentNode.removeChild(spark); }, 2500);
  if (el.parentNode) el.parentNode.removeChild(el);
}

function spawnOneMatchaCup() {
  if (!matchaRainActive) return;
  var world = document.getElementById("world");
  if (!world) return;
  var el = document.createElement("div");
  el.className = "matcha-rain-cup";
  el.textContent = "🍵";
  el.style.left = randi(8, 92) + "%";
  el.style.top = "-6%";
  world.appendChild(el);
  matchaRainCupEls.push(el);
  el.addEventListener("pointerdown", function (e) { e.stopPropagation(); popMatchaRainCup(el); });
  requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.top = "104%"; }); });
  setTimeout(function () {
    var i = matchaRainCupEls.indexOf(el);
    if (i >= 0) matchaRainCupEls.splice(i, 1);
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 4200);
}

function finishMatchaRain() {
  clearInterval(matchaRainSpawnTimer);
  matchaRainActive = false;
  var caught = matchaRainCaught;
  matchaRainCupEls.slice().forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
  matchaRainCupEls = [];
  var sap = caught >= 5 ? 3 : 1;
  earn(0, sap); /* sap only — never ZOL, this is a garden-only surprise */
  playSfx("shutter", Sound.shutter); /* VISION_V1_32 §2 — matcha-rain catch tally */
  luluSurpriseLine("matchaRain");
  pushReplay("The Sky", "It's Raining Matcha", "matchaRain",
    "Caught " + caught + " matcha", "the sky rained matcha; I caught " + caught + ".");
  renderReplayStrip();
  saveState();
}

function spawnMatchaRain() {
  if (matchaRainActive) return;
  var world = document.getElementById("world");
  if (!world) return;
  matchaRainActive = true;
  matchaRainCaught = 0;
  matchaRainCupEls = [];
  spawnOneMatchaCup();
  matchaRainSpawnTimer = setInterval(spawnOneMatchaCup, 350);
  clearTimeout(matchaRainEndTimer);
  matchaRainEndTimer = setTimeout(finishMatchaRain, 4000);
}

/* ---------------------------------------------------------------------
   THE DISCO MUSHROOM — VISION_V1_29 §2d. Tap the Akashic Tree 5x within
   2.5s and the Warren discos for 3s: hue-rotate cycle on #world, a gentle
   wobble on every goblin, all moods delighted. Zero currency. Ends clean.
--------------------------------------------------------------------- */
var treeTapTimes = [];
var discoActive = false, discoTimer = null;

function triggerDisco() {
  if (discoActive) return;
  discoActive = true;
  var world = document.getElementById("world");
  if (world) world.classList.add("disco");
  Object.keys(S.goblins).forEach(function (k) { S.goblins[k].mood = "delighted"; });
  Sound.shamanicBurst(2);
  Sound.party();
  luluSurpriseLine("disco");
  renderGoblins();
  pushReplay("The Tree", "The Disco Mushroom", "disco", "the disco mushroom woke up.", "");
  renderReplayStrip();
  saveState();
  clearTimeout(discoTimer);
  discoTimer = setTimeout(function () {
    if (world) world.classList.remove("disco");
    discoActive = false;
  }, 3000);
}

function checkTreeDisco() {
  var now = Date.now();
  treeTapTimes = treeTapTimes.filter(function (t) { return now - t < 2500; });
  treeTapTimes.push(now);
  if (treeTapTimes.length >= 5) {
    treeTapTimes = [];
    triggerDisco();
  }
}

/* ---------------------------------------------------------------------
   THE SECRET WHISPER — VISION_V1_29 §2e. First time a player opens both
   the Help overlay AND the Little Temple in one session, Luna whispers
   once. Session-only trip wires (not saved state) — low-effort flavor.
--------------------------------------------------------------------- */
var secretHelpSeen = false, secretTempleSeen = false, secretFired = false;
function maybeFireSecret() {
  if (secretFired || !secretHelpSeen || !secretTempleSeen) return;
  secretFired = true;
  luluSurpriseLine("secret");
  pushReplay("Warren", "A secret was found", "secret",
    "a secret was found: the Help overlay and the Temple, both visited.", "");
  renderReplayStrip();
  saveState();
}

/* ---------------------------------------------------------------------
   🇫🇷 LE TERRIER — traduction française, style Thomas Lelu.
   (Petit manuel du Terrier raté : phrases courtes. Ton pince-sans-rire.
   Une légère déception, assumée avec élégance.)
   Mechanism: an exact-match string table applied at the VIEW boundary —
   a MutationObserver swaps known English text nodes for French ones as
   they render. Zero game-logic changes; state and replay never see it.
   Unknown strings stay English (the Warren is bilingual, like Lulu).
--------------------------------------------------------------------- */
var FR_STRINGS = {
  /* --- topbar & splash --- */
  "The Tree is watching.": "L'Arbre vous regarde. Il ne juge pas. Si, un peu.",
  "quiet": "calme",
  "🦋 Riddle": "🦋 Devinette",
  "a tiny living Warren": "un petit Terrier vivant. Il ne demandait rien.",
  "tap anything": "touchez n'importe quoi. c'est le concept.",

  /* --- le manuel --- */
  "How to Warren": "Petit manuel du Terrier raté",
  "👆 Tap these to play": "👆 Touchez ceci pour jouer",
  "Riddle chip (top bar) — answer to earn 🪙 ZOL": "La Devinette (en haut) — répondez, gagnez des 🪙 ZOL. C'est l'économie.",
  "Your ZOL purse — tap to open the shop and grow the Warren": "Votre bourse de ZOL — touchez pour agrandir le Terrier. L'immobilier, déjà.",
  "Level chip — travel between Warren levels": "La carte — voyagez entre les niveaux. Ils s'y attendent.",
  "Tap any goblin to hear it, teach it, or care for it": "Touchez un gobelin pour l'écouter, l'instruire, ou vous en occuper. Il fera semblant de rien.",
  "Tap the Tree up top — it remembers and quizzes you": "Touchez l'Arbre, là-haut — il se souvient de tout. C'est sa seule activité.",
  "Lulu wants little things — give energy, curiosity, company": "Lulu veut de petites choses — de l'énergie, de la curiosité, de la compagnie. Comme tout le monde, en plus vert.",
  "🤔 When a goblin has an idea": "🤔 Quand un gobelin a une idée",
  "A goblin may bring you a proposal. Three buttons appear:": "Un gobelin peut vous apporter une proposition. Trois boutons apparaissent. C'est un moment important :",
  "— let it happen ·": "— laissez faire ·",
  "— wait and think ·": "— attendez en réfléchissant ·",
  "— say no, and the idea rots into rich soil for later. Nothing changes the Warren unless": "— dites non, et l'idée pourrit en bon terreau. Rien ne change dans le Terrier sans que",
  "tap.": "touchiez. C'est la loi.",
  "🏆 What you're growing": "🏆 Ce que vous cultivez",
  "Buy and evolve territories, teach your goblins, and keep Lulu happy. The Warren is a tiny place that notices you — the more you tend it, the more it becomes yours.": "Achetez des territoires, instruisez vos gobelins, gardez Lulu heureuse. Le Terrier est un petit endroit qui vous remarque — plus vous vous en occupez, plus il est à vous. C'est rare.",
  "Tap ✕ to close · tap the 🌳 Tree anytime for a hint": "Touchez ✕ pour fermer · touchez l'Arbre 🌳 pour un indice. Il attendait ça.",

  /* --- la feuille (sheet) --- */
  "Tap a goblin to see what they're thinking.": "Touchez un gobelin pour voir ce qu'il pense. Préparez-vous à être déçu, mais gentiment.",
  "TRY IT": "ON ESSAIE",
  "HOLD IT": "ON VERRA",
  "COMPOST IT": "AU COMPOST",
  "The Memory Moth wonders": "Le Papillon de Mémoire se pose une question",
  "mood:": "humeur :",
  "intention:": "intention :",
  "remembers:": "se souvient :",
  "might:": "pourrait :",
  "nothing yet — today is still new.": "rien pour l'instant — la journée est encore neuve.",

  /* --- l'oracle --- */
  "🕯️ The Cave Voice reads:": "🕯️ La Voix de la Grotte lit :",
  "ground": "le sol",
  "garden": "le jardin",
  "sky": "le ciel",
  "a reading, not a ruling — the Kernel did not stir": "une lecture, pas un verdict — le Noyau n'a pas bougé. Il fait ça très bien.",

  /* --- la boutique --- */
  "🪙 Expand the Warren": "🪙 Agrandir le Terrier",

  /* --- l'école des gobelins --- */
  "🔨 STAMP IT": "🔨 TAMPONNEZ",
  "not yet": "pas tout de suite",
  "nothing happens until you stamp — that is the whole game": "rien n'arrive tant que vous ne tamponnez pas — c'est tout le jeu, en fait",
  "tell them how the world works. watch what they do with it.": "expliquez-lui le monde. regardez ce qu'il en fait. voilà.",

  /* --- lulu, soins --- */
  "🌙 ENERGY": "🌙 ÉNERGIE",
  "✨ CURIOSITY": "✨ CURIOSITÉ",
  "💜 CONNECTION": "💜 LIEN",
  "TALK": "PARLER",
  "REST": "DODO",
  "EXPLORE": "EXPLORER",
  "GIVE": "OFFRIR",
  "say something to Lulu…": "dites quelque chose à Lulu…",
  "tap to say hello": "touchez pour dire bonjour",
  "LULU MISSED YOU": "LULU VOUS A ATTENDU",
  "LULU WAS BUSY": "LULU ÉTAIT OCCUPÉE. ENFIN, DISONS.",
  "LULU PRETENDED NOT TO MISS YOU": "LULU A FAIT SEMBLANT DE NE PAS VOUS ATTENDRE",

  /* --- la frise mémoire --- */
  "nothing replayed yet": "rien de rejoué pour l'instant. comme vos photos de vacances.",
  "tap to re-remember — replaying keeps a memory true": "touchez pour vous re-souvenir — rejouer garde un souvenir vrai",
  "this memory composted while un-replayed — soil now": "ce souvenir a composté sans être rejoué — c'est du terreau maintenant",

  /* --- les humeurs du Terrier au retour --- */
  "The Warren counted the days. Twice.": "Le Terrier a compté les jours. Deux fois.",
  "Things moved while you were away. The goblins deny everything.": "Des choses ont bougé pendant votre absence. Les gobelins nient tout.",
  "While you were gone, the Warren dreamed. It won't say of what.": "Pendant votre absence, le Terrier a rêvé. Il ne dira pas de quoi.",
  "The Warren kept your spot warm.": "Le Terrier a gardé votre place au chaud.",
  "The Warren practiced looking impressive. For you.": "Le Terrier s'est entraîné à avoir l'air impressionnant. Pour vous.",
  "The Warren is here. It noticed you're back.": "Le Terrier est là. Il a remarqué votre retour. Il ne fera pas de commentaire.",

  /* --- le serpent dans l'Arbre --- */
  "Sit like a rock. The rock is winning.": "Asseyez-vous comme une pierre. La pierre est en train de gagner.",
  "Everything flows. Especially the things you'd rather kept still.": "Tout coule. Surtout ce que vous auriez préféré immobile.",
  "The fire in the belly is just soup, being brave.": "Le feu dans le ventre, c'est de la soupe qui prend son courage.",
  "The heart is a room. Leave the door unlatched.": "Le cœur est une pièce. Laissez la porte entrouverte.",
  "Say the true thing. Quietly counts.": "Dites la chose vraie. À voix basse, ça compte aussi.",
  "Close both eyes. Now look. There.": "Fermez les deux yeux. Maintenant regardez. Là.",
  "The top of the Tree is not a place. It noticed you anyway.": "Le sommet de l'Arbre n'est pas un endroit. Il vous a remarqué quand même.",

  /* --- l'Orgue Akashique --- */
  "🌳 Tree Song — hold stations, hear the ratios": "🌳 Chant de l'Arbre — tenez les stations, écoutez les rapports",
  "silence — also a note": "le silence — une note aussi",
  "unison": "unisson",
  "octave — the return": "octave — le retour",
  "perfect fifth — the golden agreement": "quinte parfaite — l'accord doré",
  "perfect fourth — the pillar": "quarte juste — le pilier",
  "major sixth": "sixte majeure",
  "minor sixth": "sixte mineure",
  "major third — the smile": "tierce majeure — le sourire",
  "minor third": "tierce mineure",
  "tritone — the fertile tension": "triton — la tension féconde",
  "wandering — the comma smiles": "errance — le comma sourit",

  /* --- les questions de gobelins (éthique) --- */
  "wonders — there is no wrong answer": "se demande — il n'y a pas de mauvaise réponse",
  "what kind of caretaker am I becoming?": "quel genre de gardien suis-je en train de devenir ?",

  /* --- l'adoption --- */
  "…may I stay?": "…je peux rester ?",
  "give it a name…": "donnez-lui un nom…",
  "it needs a name first…": "il lui faut un nom, d'abord…",
  "🔨 ADOPT": "🔨 ADOPTER",
  "nothing joins the Warren without your stamp": "rien ne rejoint le Terrier sans votre tampon",
  "…I'll wait by the gate.": "…j'attendrai près de la porte.",
  "The Warren felt lonely. So I came. I'm good at sitting nearby.": "Le Terrier se sentait seul. Alors je suis venu. Je sais très bien m'asseoir pas loin.",
  "Things moved around here. I put things back. Mostly the right places.": "Des choses ont bougé ici. Je les remets. Presque toujours au bon endroit.",
  "The Warren dreamed while you were gone. I catch those. For later.": "Le Terrier a rêvé pendant votre absence. J'attrape les rêves. Pour plus tard.",
  "It's warm here. Warm places need someone to hum back at them.": "Il fait doux ici. Les endroits doux ont besoin qu'on leur fredonne en retour.",
  "Great things happened here. Someone small should write them down.": "De grandes choses ont eu lieu ici. Quelqu'un de petit devrait les noter.",
  "It's quiet here. Quiet is a sound too. I collect it.": "C'est calme ici. Le calme est un son aussi. Je le collectionne.",

  /* --- Raâm, le Masque Bruyant --- */
  "CATCH ME IF YOU CAN!": "ATTRAPEZ-MOI SI VOUS POUVEZ !",
  "TOO SLOW! LIKE A POLITE SNAIL!": "TROP LENT ! COMME UN ESCARGOT POLI !",
  "OVER HERE! NO— HERE!": "PAR ICI ! NON— PAR LÀ !",
  "YOU CANNOT BOOP THE WIND!": "ON NE BOOPE PAS LE VENT !",
  "RAAAM! FEAR THE MASK!": "RAAAM ! CRAIGNEZ LE MASQUE ! ENFIN, SI VOUS AVEZ LE TEMPS.",
  "EVERYTHING IS DOOMED! LOOSELY!": "TOUT EST PERDU ! GROSSO MODO !",
  "I AM VERY SCARY! ASK ANYONE!": "JE SUIS TRÈS EFFRAYANT ! DEMANDEZ AUTOUR DE VOUS !",
  "THE NIGHT IS FULL OF ME!": "LA NUIT EST PLEINE DE MOI !",
  "TREMBLE! WHEN CONVENIENT!": "TREMBLEZ ! QUAND ÇA VOUS ARRANGE !",
  "The loud mask is back… and it's RUNNING.": "Le masque bruyant est revenu… et il COURT. Évidemment.",
  "…boo? …boop. …you caught me.": "…bouh ? …boop. …vous m'avez eu. Bravo, je suppose.",

  /* --- le monde : zones & lieux --- */
  "Akashic Tree": "Arbre Akashique",
  "Garden Plot": "Carré de Jardin",
  "Bug Nursery": "Nurserie à Bestioles",
  "The High Spire": "La Haute Flèche",
  "Receipt Forge": "Forge à Reçus",
  "Mycelial Gate": "Porte Mycélienne",
  "The Little Temple": "Le Petit Temple",

  /* --- les panneaux d'objets --- */
  "The Shrine": "Le Sanctuaire",
  "Someone's Shiny Thing": "Le Truc Brillant de Quelqu'un",
  "Relocated Seedlings": "Semis Relogés",
  "Flowers Facing the Path": "Fleurs Tournées Vers le Chemin",
  "A New Mushroom": "Un Champignon Neuf",
  "Compost Bloom": "Fleur de Compost",
  "Composted Memory": "Souvenir Composté",
  "The Interface Mushroom": "Le Champignon d'Interface",
  "The Noticed Mushroom": "Le Champignon Remarqué",
  "The Question Mushroom": "Le Champignon Interrogatif",
  "A Ridiculous Golden Fruit": "Un Fruit Doré Ridicule",
  "Hot Mechanical Matcha": "Matcha Mécanique Chaud",
  "A Very Humble Hat": "Un Chapeau Très Humble",
  "The Three-Hat Trophy": "Le Trophée aux Trois Chapeaux",
  "A Strongly Opinionated Sticker": "Un Autocollant aux Opinions Fermes",
  "A Very Polite Mask": "Un Masque Très Poli",
  "The Embassy of Bug": "L'Ambassade de la Bestiole",
  "Path Lantern": "Lanterne de Chemin",
  "A Properly Repaired Pot": "Un Pot Correctement Réparé",
  "Observation Jar": "Bocal d'Observation",
  "Gerald — Head of Hiding": "Gerald — Chef du Camouflage",
  "Gerald's Apartment": "L'Appartement de Gerald",
  "Second Bug — Asylum Request": "Deuxième Bestiole — Demande d'Asile",
  "Improved Beyond Recognition": "Amélioré au Point d'Être Méconnaissable",
  "The New Path": "Le Nouveau Chemin",
  "MUSHROOMS THIS WAY": "CHAMPIGNONS PAR ICI",
  "today’s verdict": "le verdict du jour",

  /* --- les quêtes --- */
  "Unmask Raâm": "Démasquer Raâm",
  "Collect 10 Magic Sap": "Récolter 10 Sèves Magiques",
  "Compost the False Crown": "Composter la Fausse Couronne",
  "Throw a Tree Party": "Organiser une Fête de l'Arbre",
  "Tap a goblin to see what they’re thinking.": "Touchez un gobelin pour voir ce qu'il pense. Préparez-vous à être déçu, mais gentiment.",

  /* --- tâches des gobelins --- */
  "exploring": "explore",
  "archiving": "archive",
  "gardening": "jardine",
  "tinkering": "bricole",
  "contraptioning": "machine des machins",
  "resting": "se repose",
  "watching": "surveille",
  "wandering": "vagabonde",
  "kindling": "ravive le feu",
  "untangling": "démêle",
  "dream-fishing": "pêche les rêves",
  "echo-singing": "chante aux échos",
  "chronicling": "consigne tout",
  "listening at doors": "écoute aux portes",
  "being mysterious": "fait sa mystérieuse",

  /* --- humeurs (les plus fréquentes) --- */
  "curious": "curieux", "careful": "prudent", "warm": "chaleureux",
  "restless": "agité", "inventive": "inventif", "rested": "reposé",
  "giggly": "pouffant", "uneasy": "inquiet", "watchful": "aux aguets",
  "attentive": "attentif", "delighted": "ravi", "relieved": "soulagé",
  "settled": "apaisé", "thrilled": "aux anges", "focused": "concentré",
  "calm": "calme", "moved": "ému", "reserved": "réservé",
  "inspired": "inspiré", "deflated": "dégonflé", "honest": "honnête",
  "soothed": "rasséréné", "driven": "déterminé", "dreamy": "rêveur",
  "wistful": "mélancolique", "proud": "fier", "grateful": "reconnaissant",
  "touched": "touché", "distant": "distant", "sharp": "affûté",
  "unsure": "hésitant", "fierce": "farouche", "suspicious": "soupçonneux",
  "thoughtful": "songeur", "intrigued": "intrigué", "amused": "amusé",
  "solemn": "solennel", "defensive": "sur la défensive", "patient": "patient",
  "breezy": "léger", "sheepish": "penaud", "resolute": "résolu",
  "neutral": "neutre", "content": "content", "grumpy": "grognon",
  "sleepy": "somnolent",

  /* --- intentions --- */
  "learning where everything is": "apprend où tout se trouve",
  "rereading the west-path sign": "relit le panneau du chemin ouest",
  "stretching, ready to wander again": "s'étire, prêt à vagabonder encore",
  "watching the observation jar": "surveille le bocal d'observation",
  "just arrived, taking it in": "vient d'arriver, prend la mesure des choses",
  "nothing yet — today is still new.": "rien pour l'instant — la journée est encore neuve.",

  /* --- pensées étranges (les fixes) --- */
  "I think the compost is older than the Tree.": "Je crois que le compost est plus vieux que l'Arbre.",
  "Somewhere there's a warren with no goblins. Sad.": "Quelque part il existe un terrier sans gobelins. Triste.",
  "I keep counting the lanterns. There's always one more.": "Je compte les lanternes. Il y en a toujours une de plus.",
  "The roots go somewhere. I have not asked where.": "Les racines vont quelque part. Je n'ai pas demandé où.",
  "Maybe fatigue is just the Warren asking me to sit.": "La fatigue, c'est peut-être le Terrier qui me demande de m'asseoir.",

  /* --- questions du Papillon (gabarits fixes) --- */
  "Who is the sleepiest goblin right now?": "Qui est le gobelin le plus ensommeillé en ce moment ?",
  "What appeared most recently in the Warren?": "Qu'est-ce qui est apparu le plus récemment dans le Terrier ?",
  "TRY": "ESSAYER", "HOLD": "ATTENDRE", "COMPOST": "COMPOSTER"
};

/* Composite strings are built at runtime — exact match can't see them.
   Patterns catch the assembled sentence and rebuild it in French. */
var FR_PATTERNS = [
  [/^(\d{1,2}:\d{2}) · (.+)$/, "$1 · $2"], /* replay chips: time prefix, then a translatable tail */
  [/^WARREN LEVEL (\d+) · QUESTS$/, "TERRIER NIVEAU $1 · QUÊTES"],
  [/^Verdict: (.+)$/, "Verdict : $1"],
  [/^the Moth's question was answered well\. \+(\d+) ZOL \(streak ×(\d+)\)$/, "la question du Papillon a eu une belle réponse. +$1 ZOL (série ×$2)"],
  [/^the Moth's question was answered well\. \+(\d+) ZOL$/, "la question du Papillon a eu une belle réponse. +$1 ZOL"],
  [/^Where does (\S+) feel most at home\?$/, "Où $1 se sent-il le plus chez lui ?"],
  [/^The Moth remembers: “(.+)” — what was the choice\?$/, "Le Papillon se souvient : « $1 » — quel était le choix ?"],
  [/^resting near (.+)$/, "se repose près de : $1"],
  [/^wandering to (.+)$/, "vagabonde vers : $1"],
  [/^What if (.+) is dreaming about us too\?$/, "Et si $1 rêvait de nous aussi ?"],
  [/^If I hold still long enough, does (.+) notice\?$/, "Si je reste immobile assez longtemps, est-ce que $1 me remarque ?"],
  [/^I bet (.+) has a name we don't know yet\.$/, "Je parie que $1 a un nom qu'on ne connaît pas encore."]
];

function frTranslateString(key, depth) {
  depth = depth || 0;
  var fr = FR_STRINGS[key];
  if (fr) return fr;
  if (depth >= 3) return key;
  /* curly-quoted wrapper: translate the inside, keep French quotes */
  var q = key.match(/^“(.+)”$/);
  if (q) {
    var inner = frTranslateString(q[1], depth + 1);
    if (inner !== q[1]) return "« " + inner + " »";
  }
  for (var i = 0; i < FR_PATTERNS.length; i++) {
    var m = key.match(FR_PATTERNS[i][0]);
    if (m) {
      var out = FR_PATTERNS[i][1];
      for (var g = 1; g < m.length; g++) {
        /* captured fragments may themselves be translatable (zone names,
           whole sentences after a timestamp…) — recurse, depth-bounded */
        out = out.replace("$" + g, frTranslateString(m[g], depth + 1));
      }
      return out;
    }
  }
  return key;
}

/* placeholders are attributes, not text nodes — the observer can't see them */
var FR_PLACEHOLDERS = { "lulu-input": "parlez à Lulu…", "teach-input": "apprenez-lui un fait…" };

var langObserver = null;
var langOriginals = new WeakMap();

function translateTextNode(t) {
  var raw = t.nodeValue;
  if (!raw) return;
  var key = raw.trim();
  if (!key) return;
  var fr = frTranslateString(key);
  if (fr !== key) {
    if (!langOriginals.has(t)) langOriginals.set(t, raw);
    t.nodeValue = raw.replace(key, fr);
  }
}
function translateTree(root) {
  if (!root) return;
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var n;
  while ((n = walker.nextNode())) translateTextNode(n);
  Object.keys(FR_PLACEHOLDERS).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.placeholder = FR_PLACEHOLDERS[id];
  });
}
function applyLang() {
  var isFr = S.settings.lang === "fr";
  var flag = document.getElementById("lang-flag");
  if (flag) flag.textContent = isFr ? "🇬🇧" : "🇫🇷";
  var app = document.getElementById("app");
  if (!app) return;
  if (isFr) {
    translateTree(app);
    if (!langObserver) {
      langObserver = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          if (m.type === "characterData") translateTextNode(m.target);
          if (m.addedNodes) m.addedNodes.forEach(function (nd) {
            if (nd.nodeType === 3) translateTextNode(nd);
            else if (nd.nodeType === 1) translateTree(nd);
          });
        });
      });
    }
    langObserver.observe(app, { subtree: true, childList: true, characterData: true });
  } else {
    if (langObserver) langObserver.disconnect();
    /* restore what we changed; a full re-render regenerates the rest */
    var walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walker.nextNode())) {
      if (langOriginals.has(n)) { n.nodeValue = langOriginals.get(n); langOriginals.delete(n); }
    }
    Object.keys(FR_PLACEHOLDERS).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.placeholder = id === "lulu-input" ? "talk to Lulu…" : "teach a fact…";
    });
    renderAll();
  }
}
function toggleLang() {
  S.settings.lang = S.settings.lang === "fr" ? "en" : "fr";
  saveState();
  applyLang();
  Sound.bloom();
}

function wireInput() {
  var langFlag = document.getElementById("lang-flag");
  if (langFlag) langFlag.addEventListener("click", function (e) {
    e.stopPropagation();
    ensureAudio(); resumeAudio();
    toggleLang();
  });
  document.getElementById("mute-btn").addEventListener("click", function () {
    ensureAudio(); resumeAudio();
    S.settings.muted = !S.settings.muted;
    applyAmbientMute();
    organSetAudible(!S.settings.muted); /* latched organ stops follow the switch */
    saveState();
    renderTopbar();
    if (!S.settings.muted) Sound.chirp();
  });
  document.getElementById("card-close").addEventListener("click", function () { renderSheetIdle(); });
  document.getElementById("oracle-close").addEventListener("click", closeOracle);

  /* VISION_V1_33 §2/§5 — the Prologue is always skippable, never traps */
  var prologueSkip = document.getElementById("prologue-skip");
  if (prologueSkip) prologueSkip.addEventListener("click", function (e) {
    e.stopPropagation();
    ensureAudio(); resumeAudio();
    skipPrologue(true);   /* Mario law: skipping the crib skips the CRIB, not the Worlds —
                             the player lands in World 1, never the rung-12 dump.
                             (WARREN_DEBUG.skipPrologue stays full for the harnesses.) */
  });

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
      playSfx("click", Sound.uiClick); /* VISION_V1_32 §2 — top-bar chip tap */
      var shop = document.getElementById("sheet-zol-shop");
      if (shop && shop.classList.contains("hidden")) { Sound.chirp(); renderTerritoryShop(); }
      else renderSheetIdle();
    });
  }
  var zolClose = document.getElementById("zol-shop-close");
  if (zolClose) zolClose.addEventListener("click", function () { renderSheetIdle(); });

  /* Splash invites a tap — honor it (dismiss early). A teaser video may play
     underneath; it is always skippable, and if it never loads the splash still
     dismisses on a safety timer, so the player is never trapped. */
  var splash = document.getElementById("splash");
  if (splash) {
    var splashGone = false;
    var dismissSplash = function () {
      if (splashGone) return;
      splashGone = true;
      ensureAudio(); resumeAudio();
      splash.style.transition = "opacity 0.5s ease";
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";
      setTimeout(function () { splash.style.display = "none"; }, 520);
    };
    splash.addEventListener("pointerdown", dismissSplash);

    var teaser = document.getElementById("splash-video");
    if (teaser) {
      teaser.addEventListener("canplay", function () {
        teaser.classList.add("ready");
        splash.classList.add("has-video");
      });
      teaser.addEventListener("ended", dismissSplash);
      teaser.addEventListener("error", function () { setTimeout(dismissSplash, 2600); });
      var played = teaser.play && teaser.play();
      if (played && played.catch) played.catch(function () { /* autoplay blocked — tap or timer will dismiss */ });
    }
    /* Safety net: give the ~5s teaser room to breathe, but never trap the
       player. If no teaser is present/playable, fall back to the old ~3s. */
    setTimeout(function () { dismissSplash(); }, teaser ? 9000 : 3000);
  }

  /* Riddle chip — always-available quiz for ZOL (the Moth, on demand) */
  var riddleChip = document.getElementById("riddle-chip");
  if (riddleChip) riddleChip.addEventListener("click", function () { playSfx("click", Sound.uiClick); openRiddle(); });

  /* Tapping the Akashic Tree also summons a riddle */
  var treeZone = document.getElementById("zone-tree");
  if (treeZone) {
    treeZone.style.pointerEvents = "auto";
    treeZone.style.cursor = "pointer";
    treeZone.addEventListener("click", function () {
      checkTreeDisco(); /* VISION_V1_29 §2d — 5 taps in 2.5s wakes the disco mushroom */
      openRiddle();
    });
  }

  /* Level chip — cycle to the next chapter (a 🎪 sparkle there brings its 3 quests) */
  var lvChip = document.getElementById("level-chip");
  if (lvChip) {
    lvChip.addEventListener("click", function () {
      ensureAudio(); resumeAudio();
      playSfx("click", Sound.uiClick); /* VISION_V1_32 §2 — top-bar chip tap */
      var next = ((S.progress.level || 1) % LEVELS.length) + 1;
      /* VISION_V1_30 §1 — the chip cycles ONLY unlocked levels. The next
         locked chapter is a gate stop, not a free ride. */
      if (!isLevelUnlocked(next)) {
        Sound.chirp();
        openLevelGate(next);
        return;
      }
      playLevelTransition(function () {
        setLevel(next);
        var lv = currentLevel();
        showBubble("lulu", lv.name + " — its games: " + lv.mgs.length + ". Find the 🎪.", 3600);
        /* offer the sparkle immediately so travel always has something to do */
        setTimeout(spawnSparkle, 600);
      });
    });
  }

  /* Level gate card — VISION_V1_30 §1 */
  var levelGateClose = document.getElementById("level-gate-close");
  if (levelGateClose) levelGateClose.addEventListener("click", function () { closeLevelGate(); });
  var levelGateUnlockBtn = document.getElementById("level-gate-unlock");
  if (levelGateUnlockBtn) {
    levelGateUnlockBtn.addEventListener("click", function () {
      var n = parseInt(levelGateUnlockBtn.getAttribute("data-level"), 10);
      if (n) tryUnlockLevel(n);
    });
  }

  document.getElementById("btn-try").addEventListener("click", function () { playSfx("click", Sound.uiClick); stampFX("try"); resolveProposal("try"); });
  document.getElementById("btn-hold").addEventListener("click", function () { playSfx("click", Sound.uiClick); stampFX("hold"); resolveProposal("hold"); });
  document.getElementById("btn-compost").addEventListener("click", function () { playSfx("click", Sound.uiClick); stampFX("compost"); resolveProposal("compost"); });
  document.getElementById("proposal-inspect-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    toggleProposalInspector();
  });
  document.getElementById("world").addEventListener("click", function (e) {
    if (e.target.id === "world") { ensureAudio(); resumeAudio(); playConga(); }
  });

  /* Help overlay controls */
  var helpOverlay = document.getElementById("help-overlay");
  var helpCloseBtn = document.getElementById("help-close");
  function toggleHelp() {
    if (helpOverlay.classList.contains("hidden")) {
      helpOverlay.classList.remove("hidden");
      ensureAudio();
      secretHelpSeen = true; maybeFireSecret(); /* VISION_V1_29 §2e */
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
    /* never hijack typing: if a text field is focused, keys are just text */
    var ae = document.activeElement;
    if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)) return;
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
   GOBLIN VOICE — Gemma via local Ollama (v-local.1 seam)
   UI ZONE ONLY. Follows the same seam as v2.html's generateProposalText():
   generated text is NARRATION ONLY; it enters the Warren as event data via
   showBubble(), never as state mutation. The function never sets S.*,
   never grants ZOL, never touches tolls, verdicts, or HAL.
   On any failure (fetch error, timeout, Ollama down) it falls back
   silently to the template line from the GOBLIN_DEFS pool.
   Law: meaning is free; state is earned — local models add voice, never authority.
--------------------------------------------------------------------- */
function generateGoblinLine(goblinId, mood, recentEvents, callback) {
  /* Build the template fallback immediately — never throws */
  var def = DEFS_BY_ID[goblinId] || GOBLIN_DEFS[0];
  var fallbackLines = [
    def.name + " watches quietly... " + (mood === "content" ? "and smiles." : "and fidgets."),
    "Something is happening... " + def.name + " pretends not to notice.",
    def.name + " has opinions. They are keeping them in a jar for now.",
    "The " + def.role + " nods wisely. Or maybe just nods.",
    def.name + " says nothing. But means it loudly."
  ];
  var fallback = fallbackLines[Math.floor(Math.abs(h32(goblinId + mood)) % fallbackLines.length)];

  try {
    var eventSummary = (recentEvents || []).slice(-3).map(function (e) { return e.event || e.choice || ""; }).filter(Boolean).join("; ") || "the Warren is quiet";
    var prompt = "You are " + def.name + " the " + def.role + " in the Goblin Warren. " +
      "Your trait: " + def.trait + ". Current mood: " + (mood || "content") + ". " +
      "Recent happenings: " + eventSummary + ". " +
      "Speak ONE short sentence (max 15 words) in Lulu's hypnotic, ellipsis-heavy style. " +
      "Narrate only — do not issue commands, grant permissions, or change any game state. " +
      "Just the sentence, no quotes.";

    var didRespond = false;
    var timer = setTimeout(function () {
      if (!didRespond) { didRespond = true; callback(fallback); }
    }, 4000);

    fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemma4-moq:4.0", prompt: prompt, stream: false })
    }).then(function (res) {
      if (!res.ok) throw new Error("ollama http " + res.status);
      return res.json();
    }).then(function (data) {
      if (didRespond) return;
      didRespond = true;
      clearTimeout(timer);
      var text = (data && data.response && data.response.trim()) || fallback;
      /* Safety: strip any attempt to embed state-mutating syntax */
      text = text.replace(/[{}\[\]]/g, "").slice(0, 120).trim() || fallback;
      callback(text); /* narration only — caller passes to showBubble() */
    }).catch(function () {
      if (didRespond) return;
      didRespond = true;
      clearTimeout(timer);
      callback(fallback);
    });
  } catch (e) {
    callback(fallback);
  }
}

/* Exported test surface for verify.js gate */
window._generateGoblinLine = generateGoblinLine;

/* ---------------------------------------------------------------------
   VISION_PROGRESSION — THE CRIB (Rungs 1-3 of the Bonding Ladder).
   Evolves the v1.33 Petit Prince Prologue from a ~30s one-session flourish
   that DUMPED the whole Warren at its end, into a multi-session bonding
   arc that reveals nothing above one goblin until a relationship is earned:

     Rung 1 (NOTICE)  — dusk, Lulu asleep under the tree, one pulsing cue.
                        Tap → she wakes, notices YOU. Reward: a seed appears.
     Rung 2 (GESTURE) — offer the seed (tap it). She reacts; it blooms into a
                        persistent flower. A mystery stirs behind the tree.
                        The session rests here — "come back tomorrow."
     Rung 3 (MEMORY)  — on a later visit she remembers: the flower waited.
                        Then, and only then, the wider Warren opens (graduate).

   Membrane law unchanged: this controls VISIBILITY and ORDER only — no new
   world data, no reducer touch, no ZOL spend, no admission. `#app` keeps the
   `.prologue-active` class (hiding every un-revealed goblin/zone/chip) for
   the crib's whole multi-session duration, plus `.crib-active` to hide the
   top/bottom bars for a true zero-menu Rung 1. Established players
   (prologueSeen===true, grandfathered at load) never enter here — boot()
   renders the full Warren exactly as before. Always skippable, never traps
   (every beat has a fallback timer; skip graduates immediately).
   The function names startPrologue/finishPrologue/etc. are kept so the
   existing WARREN_DEBUG/test surface keeps working.
--------------------------------------------------------------------- */
var prologueActive = false;
var prologueStep = 0;          // 0 idle · 1 NOTICE(wait tap Lulu) · 2 GESTURE(seed offered pending) · 3 MEMORY(return) · 6 graduated
var prologueGoblinsShown = 1;  // Lulu counts as already-shown
var prologueChipsShown = 0;
var prologueTimers = [];
var prologueSeedObjId = null;
var prologueBloomObjId = null;
var PROLOGUE_CHIPS = ["signal-indicator", "riddle-chip", "level-chip", "currency", "zol-wallet"];

/* =====================================================================
   THE WORLDS — Mario law (operator witness #4, 2026-07-16: "we go direct
   to level 12! I want a progression like MARIO or POKEMON — does not
   start with end boss"). Graduating the crib no longer reveals the whole
   Warren. It opens WORLD 1, and the rest unlocks in three more staged
   reveals driven by play milestones — bosses last. Worlds 1-4 map to
   rungs 5/7/9/11; rung 12 stays "everything" (grandfathered saves and
   skip land there, byte-for-byte today's Warren, zero behavior change).
   memory = function(event_log): the earned world is DERIVED from
   milestones already tracked in S — no new mutable progress counter.
===================================================================== */
var WORLD_RUNGS = [5, 7, 9, 11];
var WORLD_TABLE = {
  1: { goblins: ["lulu", "zaz"], zones: ["tree", "garden"],    chips: ["currency", "zol-wallet"], strip: false },
  2: { goblins: ["pip"],         zones: ["forge"],             chips: ["riddle-chip"],            strip: true  },
  3: { goblins: ["nib"],         zones: ["nursery", "gate"],   chips: ["signal-indicator"],       strip: true  },
  4: { goblins: [],              zones: ["spire"],             chips: ["level-chip"],             strip: true  }
};
var WORLD_LINES = {
  2: "Someone heard your riddles... Pip woke up. The forge is warm now.",
  3: "The Warren trusts you with its choices now. Nib is stirring... listen for signals.",
  4: "The far paths are open. Big things live out there. We go together."
};
function stagedActive() { return !!(S && S.progress && S.progress.worldStaged && S.progress.rung < 12); }
function currentWorld() {
  if (!stagedActive()) return 4;               // rung 12 / grandfathered / skip = everything
  var r = S.progress.rung;
  return r >= 11 ? 4 : r >= 9 ? 3 : r >= 7 ? 2 : 1;
}
function worldAtLeast(n) { return currentWorld() >= n; }
function goblinRevealed(id) {
  if (!stagedActive()) return true;
  var w = currentWorld();
  if (w >= 4) return true;
  for (var i = 1; i <= w; i++) if (WORLD_TABLE[i].goblins.indexOf(id) !== -1) return true;
  return GOBLIN_DEFS.every(function (d) { return d.id !== id; }); // kin/extras stay visible
}
/* the milestone fold — which world has the play EARNED? (pure, derived).
   Economist-goblin law (audit 2026-07-16): each gate measures the PRIOR
   world's own loop — never the free toy (boops ≈ 5s accidental skip,
   measured), never a later world's currency (sap collides with the
   Spire's >=10 and mints pre-World-3). */
function earnedWorld() {
  var paid = (S.quizState && S.quizState.rewardPaid) ? Object.keys(S.quizState.rewardPaid).length : 0;
  var w = 1;
  if (paid >= 2) w = 2;                            // World-1 loop: two of Lulu's lantern questions
  if (w >= 2 && ((S.flags.quizRight || 0) >= 3 || paid >= 4)) w = 3;   // World-2 loop: the Moth's riddles
  if (w >= 3 && (S.flags.proposalsResolved || 0) >= 2) w = 4;          // World-3 loop: govern twice, then the far paths
  return w;
}
function worldToggle(el, on, celebrate, staggerIdx) {
  if (!el) return;
  if (on) {
    if (el.classList.contains("world-hidden")) {
      el.classList.remove("world-hidden");
      if (celebrate) {                       /* witness #6: one thing at a time — let each arrival breathe */
        el.classList.remove("prologue-reveal"); void el.offsetWidth;
        setTimeout(function () { el.classList.add("prologue-reveal"); }, (staggerIdx || 0) * 700);
        setTimeout(function () { el.classList.remove("prologue-reveal"); }, 2400 + (staggerIdx || 0) * 700);
      }
    }
  } else el.classList.add("world-hidden");
}
function applyWorldReveal(celebrate) {
  if (!S.flags.prologueSeen || prologueActive) return;   // the crib stages its own scene
  var w = currentWorld(), full = w >= 4, k = 0;
  var show = { g: {}, z: {}, c: {}, strip: false };
  for (var i = 1; i <= Math.min(w, 4); i++) {
    WORLD_TABLE[i].goblins.forEach(function (g) { show.g[g] = true; });
    WORLD_TABLE[i].zones.forEach(function (z) { show.z[z] = true; });
    WORLD_TABLE[i].chips.forEach(function (c) { show.c[c] = true; });
    if (WORLD_TABLE[i].strip) show.strip = true;
  }
  GOBLIN_DEFS.forEach(function (d) { worldToggle(goblinEls[d.id], full || !!show.g[d.id], celebrate, k++); });
  ZONES.forEach(function (z) { worldToggle(document.getElementById("zone-" + z.id), full || !!show.z[z.id], celebrate, k++); });
  PROLOGUE_CHIPS.forEach(function (id) { worldToggle(document.getElementById(id), full || !!show.c[id], celebrate, k++); });
  worldToggle(document.getElementById("replay-strip"), full || show.strip, false, 0);
  worldToggle(document.getElementById("temple"), full, false, 0);       // temple/serpent = World 4
  if (typeof serpentEl !== "undefined" && serpentEl) worldToggle(serpentEl, full, false, 0);
  renderQuests();
}
/* ambient organs come alive with their world — called on advance AND from
   graduateCrib's staged path; boot's schedulers are entry-guarded instead */
function startWorldAmbient(w) {
  if (w === 2) { scheduleMoth(randi(6000, 14000)); scheduleGoldfall(randi(20000, 45000)); }
  if (w === 3) {
    bootScriptedArc();                                   // the bug, then Gerald's proposal
    if (!S.adopted) wandererTimer = setTimeout(spawnWanderer, randi(40000, 90000));
    pickDailyVerdict(utcDateStr(), DV_DILEMMAS.length, function (idx) {
      dvPickedIndex = idx;
      if (!todayVerdict()) setTimeout(spawnVerdictScroll, 4000);
    });
  }
  if (w === 4) {
    scheduleRaam(randi(40000, 90000));
    if ((S.progress.raamDefeats || 0) >= 1) scheduleSeren(randi(120000, 200000));
    if (S.progress.spireUnlocked) { ensureTink(); scheduleCrown(randi(30000, 90000)); }
    renderSerpent(); renderCollectibles();
  }
  GOBLIN_DEFS.forEach(function (d, i) { if (goblinRevealed(d.id)) scheduleGoblinTick(d.id, 1600 + i * 700); });
}
/* ── WORLD 1 · THE HEARTH ─────────────────────────────────────────────
   Witness #6 (2026-07-16): "I was more hooked when you asked me to make
   a fire or something... than now just tap. It's not clear."
   An embodied care quest: the hearth is cold, and you RUB it warm —
   friction, not taps, the same gesture language the seed-offer proved.
   Works on every device, zero permissions. Membrane: +1 sap, a receipt,
   a warmed Lulu — no ZOL, no territory, no admission. */
var hearthHeat = 0;
function spawnHearth() {
  if (!stagedActive() || currentWorld() !== 1) return;
  if (S.flags.hearthLit) return;
  var existing = null;
  for (var i = 0; i < S.objects.length; i++) {
    if (S.objects[i].sign === "A Cold Hearth") { existing = S.objects[i]; break; }
  }
  if (!existing) {
    addObject("🪵", "A Cold Hearth", "garden");
    existing = S.objects[S.objects.length - 1];
    renderObjects();
    showBubble("lulu", "...the hearth is cold. Rub the wood — quick, quick — make it remember fire.", 5600, true);
  } else {
    renderObjects();
  }
  var el = objectEls[existing.id];
  if (el) { prologueReveal(el); cribCue(el, true); wireHearthRub(el, existing.id); }
  saveState();
}
function wireHearthRub(el, objId) {
  if (!el || el._hearthWired) return;
  el._hearthWired = true;
  el.style.touchAction = "none";
  var last = null;
  el.addEventListener("pointerdown", function (e) { e.stopPropagation(); last = { x: e.clientX, y: e.clientY }; });
  el.addEventListener("pointermove", function (e) {
    if (!last || S.flags.hearthLit) return;
    var dx = e.clientX - last.x, dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };
    hearthRubFriction(Math.sqrt(dx * dx + dy * dy), objId);
  });
  el.addEventListener("pointerup", function () { last = null; });
  el.addEventListener("pointerleave", function () { last = null; });
}
function hearthRubFriction(d, objId) {
  if (S.flags.hearthLit || !d || d < 2) return;
  hearthHeat += d;
  var el = objectEls[objId];
  if (el) {
    /* the wood visibly warms as you work — heat is FELT, not a meter */
    var glow = Math.min(1, hearthHeat / 480);
    el.style.filter = "drop-shadow(0 0 " + (glow * 14) + "px rgba(255," + Math.round(140 + glow * 80) + ",60," + (0.25 + glow * 0.6) + "))";
    if (Math.floor(hearthHeat / 120) > Math.floor((hearthHeat - d) / 120)) {
      flashClass(el, "booped", 300);
      if (window.Sound && Sound.chirp) Sound.chirp();
    }
  }
  if (hearthHeat >= 480) kindleHearth(objId);
}
function kindleHearth(objId) {
  if (S.flags.hearthLit) return;
  S.flags.hearthLit = true;
  var obj = null;
  for (var i = 0; i < S.objects.length; i++) { if (S.objects[i].id === objId) { obj = S.objects[i]; break; } }
  if (obj) { obj.emoji = "🔥"; obj.sign = "Our First Fire"; }
  var el = objectEls[objId];
  if (el) {
    cribCue(el, false);
    el.style.filter = "";
    var em = el.querySelector(".wobj-emoji"); if (em) em.textContent = "🔥";
    var sg = el.querySelector(".wobj-sign"); if (sg) sg.textContent = "Our First Fire";
    el.classList.remove("crib-bloom-pop"); void el.offsetWidth; el.classList.add("crib-bloom-pop");
  }
  if (window.Sound && Sound.bloom) Sound.bloom();
  if (window.Sound && Sound.tibetanBowl) Sound.tibetanBowl(396);
  var g = S.goblins.lulu;
  if (g) { g.mood = "delighted"; renderGoblins(); dropParticle(g, "🔥", true); }
  showBubble("lulu", "Fire... you MADE it. Warm hands, warm Warren.", 5200, true);
  luluVoiceLine("relic");
  earn(0, 1);
  pushReplay("You", "The first fire", "hearth",
    "you rubbed a cold hearth into flame — the Warren is warmer", "the fire we made with our hands.");
  renderReplayStrip();
  saveState();
}

var worldAdvanceBusy = false;
var arrivalStarEl = null, arrivalStarNext = 0;
/* witness #7: new arrivals FALL FROM THE SKY and are caught — the sky is
   the delivery system for progression. Earned world → a slow star falls;
   catching it opens the world. Missed → it rests glowing by the Tree,
   tappable forever (never traps). */
function checkWorldAdvance() {
  if (!stagedActive() || prologueActive || worldAdvanceBusy || arrivalStarEl) return;
  var cur = currentWorld();
  if (cur >= 4 || earnedWorld() <= cur) return;
  spawnArrivalStar(cur + 1);
}
function spawnArrivalStar(next) {
  var world = document.getElementById("world");
  if (!world) return;
  var el = document.createElement("div");
  el.className = "goldfall arrival-star";
  el.textContent = "🌟";
  el.style.left = randi(25, 75) + "%";
  el.style.top = "-6%";
  el.style.transition = "top 13s linear";                // slow: a gift, not a test
  el.style.fontSize = "34px";
  world.appendChild(el);
  arrivalStarEl = el;
  arrivalStarNext = next;
  el.addEventListener("pointerdown", function (e) { e.stopPropagation(); catchArrivalStar(); });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { el.style.top = "22%"; });   // falls TO the tree, then rests
  });
  showBubble("lulu", "Look up... something is falling. For you. Catch it!", 5200, true);
  setTimeout(function () {
    /* uncaught: it rests by the Tree, pulsing — tap whenever you're ready */
    if (arrivalStarEl === el) el.classList.add("crib-cue");
  }, 13500);
}
function catchArrivalStar() {
  if (!arrivalStarEl) return;
  var el = arrivalStarEl, next = arrivalStarNext;
  arrivalStarEl = null; arrivalStarNext = 0;
  el.classList.add("caught");
  setTimeout(function () { el.remove(); }, 500);
  openWorld(next);
}
function openWorld(next) {
  worldAdvanceBusy = true;
  S.progress.rung = WORLD_RUNGS[next - 1];
  saveState();
  applyWorldReveal(true);
  showBubble("lulu", WORLD_LINES[next], 5600, true);
  luluVoiceLine("travel");
  if (window.Sound && Sound.bloom) Sound.bloom();
  startWorldAmbient(next);
  pushReplay("The Warren", "World " + next + " opened", "world-open",
    "a star fell, you caught it — World " + next + " is awake.", "the paths grew longer.");
  setTimeout(function () { worldAdvanceBusy = false; }, 1500);
}

var CRIB_OB_DEFAULTS = { woke: false, offered: false, mystery: false, seedObjId: null, bloomObjId: null, visits: 0,
  matchaCupObjId: null, need1Done: false, need2Done: false, need3Deferred: false };
function cribOb() {
  if (!S.progress.onboarding || typeof S.progress.onboarding !== "object") {
    S.progress.onboarding = Object.assign({}, CRIB_OB_DEFAULTS);
  }
  /* field-level backfill: an in-progress crib save from before Rung 4 existed
     has the old shape — fill only what's missing, never clobber real progress. */
  Object.keys(CRIB_OB_DEFAULTS).forEach(function (k) {
    if (!(k in S.progress.onboarding)) S.progress.onboarding[k] = CRIB_OB_DEFAULTS[k];
  });
  return S.progress.onboarding;
}

function prologueSetTimeout(fn, ms) {
  var t = setTimeout(fn, ms);
  prologueTimers.push(t);
  return t;
}
function prologueClearTimers() {
  prologueTimers.forEach(function (t) { clearTimeout(t); });
  prologueTimers = [];
}
function prologueReveal(el) { if (el) el.classList.add("prologue-shown", "prologue-reveal"); }
function cribCue(el, on) { if (el) el.classList[on ? "add" : "remove"]("crib-cue"); }

/* the crib speaks with Lulu's REAL bundled voice (Luna mp3s), not browser TTS.
   Short bubble carries the gist; the hypnotic mp3 carries the soul. voiceKey
   is a LULU_VOICE_URLS key (local, real voice; TTS only if the mp3 truly 404s);
   pass null for a silent beat (a stir, a whisper). */
function cribSay(bubble, voiceKey, dur) {
  showBubble("lulu", bubble, dur || 4200, true);   // noSpeak: no default TTS
  if (voiceKey) luluVoiceLine(voiceKey);
}
function cribSleep(on) {
  var el = goblinEls.lulu;
  if (!el) return;
  if (on) { el.classList.add("crib-sleeping"); }
  else {
    el.classList.remove("crib-sleeping");
    el.classList.add("crib-waking");
    setTimeout(function () { el.classList.remove("crib-waking"); }, 1000);
  }
}

/* the crib always shows Lulu + the tree; everything else is earned */
function cribShowStage() {
  prologueActive = true;
  var app = document.getElementById("app");
  if (app) { app.classList.add("prologue-active", "crib-active"); }
  var skip = document.getElementById("prologue-skip");
  if (skip) skip.classList.remove("hidden");
  var prog = document.getElementById("crib-progress");
  if (prog) prog.classList.remove("hidden");
  prologueReveal(document.getElementById("zone-tree"));
  prologueReveal(goblinEls.lulu);
}

/* VISION_PROGRESSION §1 fix (operator witness 2026-07-14) — a legible
   "step X of 3" cue. Three small dots; filled = completed, pulsing =
   current. This is the direct answer to "I do not see the step by step
   progression" — the crib had zero visible sense of forward motion. */
function renderCribProgress() {
  var wrap = document.getElementById("crib-progress");
  if (!wrap) return;
  var rung = (S.progress && S.progress.rung) || 1;
  for (var i = 1; i <= 4; i++) {
    var dot = wrap.children[i - 1];
    if (!dot) continue;
    dot.classList.toggle("done", rung > i);
    dot.classList.toggle("crib-cue", rung === i);
  }
}

/* entry from boot() — the crib picks up at whichever rung the save left off */
function startPrologue() {
  if (S.flags.prologueSeen) return;            // established players never enter (grandfathered)
  var o = cribOb();
  cribShowStage();
  if (S.progress.rung >= 4 && o.offered) { cribNeed(); }  // Rung 4 — resume mid-need, no replay
  else if (o.offered) { cribReturnMemory(); }  // Rung 3 — came back after the bloom
  else if (o.woke) { cribResumeGesture(); }    // Rung 2 — woke last time, seed still un-offered
  else { cribNotice(); }                       // Rung 1 — fresh
}

/* ---- Rung 1 — NOTICE ---- Scene 1: she sleeps under the tree, breathing.
   No greeting yet — the quiet IS the anticipation. A soft pulse says "touch". */
var cribStirs = 0;
function cribNotice() {
  prologueStep = 1;
  S.progress.rung = 1;
  cribStirs = 0;
  renderCribProgress();
  cribSleep(true);                             // eyes closed, slow breath, z z z
  cribCue(goblinEls.lulu, true);               // the one subtle pulsing point of interaction
  /* fallback: she wakes on her own if nobody taps for a while */
  prologueSetTimeout(function () { if (prologueStep === 1) cribWake(); }, 11000);
}

function tapLuluPrologue() {                    // routed from onTapGoblin('lulu')
  if (!prologueActive) return;
  if (prologueStep === 1) {
    /* first touch stirs her awake — a beat of recognition, then the wake */
    cribStirs++;
    flashClass(goblinEls.lulu, "booped", 500);
    if (window.Sound && Sound.treeHum) Sound.treeHum();
    cribSay("...mm...?", null, 1600);          // silent stir
    prologueClearTimers();
    prologueSetTimeout(cribWake, 850);
  }
}

function cribWake() {
  if (!prologueActive || prologueStep !== 1) return;
  prologueStep = 2;
  var o = cribOb();
  o.woke = true;
  S.progress.rung = 2;
  renderCribProgress();
  cribCue(goblinEls.lulu, false);
  cribSleep(false);                            // eyes open, a warm wake-flash
  var g = S.goblins.lulu;
  if (g) g.mood = "delighted";
  renderGoblins();
  if (window.Sound && Sound.bloom) Sound.bloom();
  /* Scene 2 → 3: recognition, then her real voice (a bundled Luna line) */
  cribSay("Oh... you found me...", null, 3000);
  prologueSetTimeout(function () {
    cribSay("...the moss remembered your footsteps.", "greet", 5000);
  }, 2100);
  prologueSetTimeout(cribSpawnSeed, 4000);     // reward: a seed appears, just after she greets
  saveState();
}

/* ---- Rung 2 — GESTURE (offer the seed) ---- */
function cribSpawnSeed() {
  if (!prologueActive) return;
  var o = cribOb();
  addObject("🌰", "A Seed, Yours", "tree");
  var obj = S.objects[S.objects.length - 1];
  prologueSeedObjId = obj ? obj.id : null;
  o.seedObjId = prologueSeedObjId;
  renderObjects();
  prologueReveal(objectEls[prologueSeedObjId]);
  cribCue(objectEls[prologueSeedObjId], true);
  cribWireSeedGesture(objectEls[prologueSeedObjId]);
  cribSay("Here... one seed. It is yours.", "relic", 4600);
  saveState();
  /* fallback: she accepts it on her own if the seed goes un-offered */
  prologueSetTimeout(function () { if (prologueStep === 2 && !cribOb().offered) cribOfferSeed("wait"); }, 15000);
}

/* the seed reads HOW you give it — a quick tap vs a held offer — so the
   gesture feels like it reaches her, not just a button press. */
function cribWireSeedGesture(el) {
  if (!el || el._cribGestureWired) return;
  el._cribGestureWired = true;
  var downAt = 0;
  el.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    downAt = (typeof performance !== "undefined" && performance.now) ? performance.now() : 0;
  });
  var release = function (e) {
    if (!downAt) return;
    var held = ((typeof performance !== "undefined" && performance.now) ? performance.now() : 0) - downAt;
    downAt = 0;
    if (e) e.stopPropagation();
    cribOfferSeed(held >= 320 ? "held" : "quick");
  };
  el.addEventListener("pointerup", release);
  el.addEventListener("pointerleave", function (e) { if (downAt) release(e); });
}

/* returning mid-crib: woke last session, seed never offered — restore the seed */
function cribResumeGesture() {
  prologueStep = 2;
  S.progress.rung = 2;
  renderCribProgress();
  var o = cribOb();
  /* the seed persisted in S.objects; find it (fallback: respawn one) */
  var seed = null;
  for (var i = 0; i < S.objects.length; i++) {
    if (S.objects[i].id === o.seedObjId || S.objects[i].emoji === "🌰") { seed = S.objects[i]; break; }
  }
  if (!seed) { cribSpawnSeed(); return; }
  prologueSeedObjId = seed.id;
  cribSleep(false);
  renderObjects();
  prologueReveal(objectEls[prologueSeedObjId]);
  cribCue(objectEls[prologueSeedObjId], true);
  cribWireSeedGesture(objectEls[prologueSeedObjId]);
  prologueSetTimeout(function () {
    cribSay("You came back... the seed is still here.", "greet", 4800);
  }, 500);
  prologueSetTimeout(function () { if (prologueStep === 2 && !cribOb().offered) cribOfferSeed("wait"); }, 15000);
}

function tapPrologueSeed() {                    // routed from the object tap handler (click)
  if (!prologueActive || prologueStep !== 2) return;
  cribOfferSeed("tap");
}

function cribOfferSeed(quality) {
  if (!prologueActive || prologueStep !== 2) return;
  var o = cribOb();
  if (o.offered) return;
  o.offered = true;
  var seedEl = prologueSeedObjId ? objectEls[prologueSeedObjId] : null;
  cribCue(seedEl, false);
  if (seedEl) seedEl.classList.add("crib-offer-fly");   // the seed arcs to Lulu
  /* she reads HOW you gave it — the reaction is yours, not generic */
  var line = quality === "quick" ? "Oh! ...you surprised me."
           : quality === "held"  ? "...so gently. I felt that."
           : "You gave it to me?";
  cribSay(line, null, 3200);                            // her own quick reaction, no voice
  saveState();
  prologueSetTimeout(function () {
    /* transform the SAME object 🌰 → 🌸 (continuity: it is the very seed you
       gave, kept across sessions — no remove/add, no reducer touch) */
    var seed = null;
    for (var i = 0; i < S.objects.length; i++) { if (S.objects[i].id === prologueSeedObjId) { seed = S.objects[i]; break; } }
    if (seed) {
      seed.emoji = "🌸"; seed.sign = "Our First Bloom";
      prologueBloomObjId = seed.id;
      o.bloomObjId = seed.id;
      var el = objectEls[seed.id];
      if (el) {
        el.classList.remove("crib-offer-fly");
        var em = el.querySelector(".wobj-emoji"); if (em) em.textContent = "🌸";
        var sg = el.querySelector(".wobj-sign"); if (sg) sg.textContent = "Our First Bloom";
        el.classList.remove("prologue-reveal", "crib-bloom-pop"); void el.offsetWidth;
        el.classList.add("prologue-reveal", "crib-bloom-pop");   // a soft bloom pop
      }
    }
    if (window.Sound && Sound.bloom) Sound.bloom();
    if (window.Sound && Sound.tibetanBowl) Sound.tibetanBowl(528);   // the bloom sings
    cribSay("A flower. We made it.", "matcha", 5200);
    saveState();
    prologueSetTimeout(cribMystery, 3600);
  }, 1000);
}

/* the future promise — but NOT a dead end. A curious tap right here is the
   player's peak-interest moment; the old build said "not yet, come back"
   and then required an actual page reload to progress, which is exactly
   where a real first-session player got bored and left (operator witness,
   2026-07-14: "I first love it then get bored because I do not see the
   step by step progression"). Tapping the mystery now IS the next step —
   an in-session "the day turns" beat (reusing the Rung-1 sleep/wake visual
   language, no new assets) that leads straight into Rung 3 and graduation.
   A fallback timer still fires it on its own so a player who never taps
   isn't stuck either (never traps, same law as every other crib beat). */
function cribMystery() {
  if (!prologueActive) return;
  var o = cribOb();
  o.mystery = true;
  var sh = document.getElementById("crib-mystery");
  if (sh) {
    sh.classList.remove("hidden");
    sh.classList.add("prologue-shown", "prologue-reveal", "crib-cue");
    if (!sh._cribWired) { sh._cribWired = true; sh.addEventListener("click", function (e) { e.stopPropagation(); tapCribMystery(); }); }
  }
  cribSay("...did you see that? Behind the tree. Look closer?", "goodnight", 5200);
  saveState();
  /* nobody has to tap for the arc to still complete */
  prologueSetTimeout(function () { if (prologueStep === 2 && prologueActive) cribNightfall(); }, 20000);
}

function tapCribMystery() {
  if (prologueActive && prologueStep === 4) {   /* Rung 4: the third wish, felt and deferred */
    cribSay("Not now... two hands, three wishes. Later. I promise.", null, 3600);
    return;
  }
  if (!prologueActive || prologueStep !== 2 || !cribOb().mystery) return;
  var sh = document.getElementById("crib-mystery");
  if (sh) { flashClass(sh, "booped", 600); cribCue(sh, false); sh.classList.add("hidden"); }
  cribSay("...come. Let's see what the night knows.", null, 3200);
  prologueSetTimeout(cribNightfall, 1600);
}

/* the in-session time-skip: she dozes (same visual as Rung 1's sleep),
   then wakes into the Rung 3 memory beat — no reload required. */
function cribNightfall() {
  if (!prologueActive || prologueStep !== 2) return;
  cribSleep(true);
  prologueSetTimeout(cribReturnMemory, 1800);
}

/* ---- Rung 3 — MEMORY (a later visit) → then graduate to the full Warren ---- */
function cribReturnMemory() {
  prologueStep = 3;
  S.progress.rung = 3;
  renderCribProgress();
  var o = cribOb();
  o.visits = (o.visits || 0) + 1;
  cribSleep(false);
  /* the bloom persisted in S.objects; make sure it shows */
  for (var i = 0; i < S.objects.length; i++) {
    if (S.objects[i].id === o.bloomObjId || S.objects[i].emoji === "🌸") {
      prologueBloomObjId = S.objects[i].id;
      renderObjects();
      prologueReveal(objectEls[S.objects[i].id]);
      break;
    }
  }
  saveState();
  /* every nested beat re-checks prologueStep === 3 before speaking — a
     debug/test bypass straight to cribNeed() must never let a stale Rung-3
     line stomp the Rung-4 bubble it schedules (same "never traps" law: a
     later stage always wins over an earlier stage's leftover timer). */
  prologueSetTimeout(function () {
    if (prologueStep !== 3) return;
    cribSay("You came back... I kept our flower.", "greet", 5000);
  }, 700);
  prologueSetTimeout(function () {
    if (prologueStep !== 3) return;
    cribSay("...there is more to show you now.", null, 4200);
    prologueSetTimeout(cribNeed, 2600);
  }, 5400);
  /* fallback: move on even if the beats are interrupted */
  prologueSetTimeout(function () { if (prologueStep === 3) cribNeed(); }, 14000);
}

/* ---- Rung 4 — THE NEED ---- real scarcity, not a task list: Lulu names
   three things at once, but this rung only gives the player two care
   actions (feed her, water the bloom). The third — the sound behind the
   tree — is named and then deliberately left alone, a Zeigarnik hook for
   a future rung, not a bug. (game-design critique 2026-07-15, appended to
   VISION_PROGRESSION_L1_L12.md: "3 visible needs, only 2 actions".) */
function cribNeed() {
  if (!prologueActive || prologueStep === 6) return;
  prologueStep = 4;
  S.progress.rung = 4;
  renderCribProgress();
  var o = cribOb();
  /* resume path: prologueBloomObjId is a module var, lost on a fresh page
     load — re-find it from S.objects the same way cribReturnMemory does */
  if (!prologueBloomObjId) {
    for (var i = 0; i < S.objects.length; i++) {
      if (S.objects[i].id === o.bloomObjId || S.objects[i].emoji === "🌸") { prologueBloomObjId = S.objects[i].id; break; }
    }
  }
  if (prologueBloomObjId) {
    renderObjects();
    prologueReveal(objectEls[prologueBloomObjId]);
    cribCue(objectEls[prologueBloomObjId], !o.need2Done);
  }
  cribSay("I'm hungry. The flower is thirsty. And... that sound again, behind the tree.", null, 6200);
  var sh = document.getElementById("crib-mystery");
  if (sh) { sh.classList.remove("hidden"); sh.classList.add("prologue-shown", "prologue-reveal"); cribCue(sh, false); }
  saveState();
  prologueSetTimeout(cribSpawnMatchaCup, 2200);
  /* never traps: if nobody taps, she quietly tends both herself and the
     rung still advances — same law as every other crib fallback. */
  prologueSetTimeout(function () {
    if (prologueStep !== 4) return;
    var o2 = cribOb();
    o2.need1Done = true; o2.need2Done = true;
    cribCheckNeedsDone();
  }, 30000);
}

function cribSpawnMatchaCup() {
  if (!prologueActive || prologueStep !== 4) return;
  var o = cribOb();
  if (o.need1Done) return;
  /* resume path: the cup persisted in S.objects from a prior session */
  if (o.matchaCupObjId) {
    var found = false;
    for (var i = 0; i < S.objects.length; i++) { if (S.objects[i].id === o.matchaCupObjId) { found = true; break; } }
    if (!found) o.matchaCupObjId = null;
  }
  if (!o.matchaCupObjId) {
    addObject("🍵", "Warm Matcha", "tree");
    var obj = S.objects[S.objects.length - 1];
    o.matchaCupObjId = obj ? obj.id : null;
  }
  renderObjects();
  prologueReveal(objectEls[o.matchaCupObjId]);
  cribCue(objectEls[o.matchaCupObjId], true);
  saveState();
}

function tapMatchaCup(objId) {
  if (!prologueActive || prologueStep !== 4) return;
  if (objId !== cribOb().matchaCupObjId) return;
  cribFeedLulu();
}

function cribFeedLulu() {
  if (!prologueActive || prologueStep !== 4) return;
  var o = cribOb();
  if (o.need1Done) return;
  o.need1Done = true;
  var el = o.matchaCupObjId ? objectEls[o.matchaCupObjId] : null;
  cribCue(el, false);
  var g = S.goblins.lulu;
  if (g) { g.mood = "delighted"; renderGoblins(); dropParticle(g, "\ud83d\udc9a", true); }
  if (window.Sound && Sound.tibetanBowl) Sound.tibetanBowl(432);
  if (goblinEls.lulu) { flashClass(goblinEls.lulu, "crib-bloom-pop", 900); }
  cribSay("Mmm... warm. Thank you.", "matcha", 3600);
  S.objects = S.objects.filter(function (ob) { return ob.id !== o.matchaCupObjId; });
  renderObjects();
  saveState();
  cribCheckNeedsDone();
}

function tapBloomWater(objId) {
  if (!prologueActive || prologueStep !== 4) return;
  if (objId !== prologueBloomObjId) return;
  cribWaterBloom();
}

function cribWaterBloom() {
  if (!prologueActive || prologueStep !== 4) return;
  var o = cribOb();
  if (o.need2Done) return;
  o.need2Done = true;
  var el = prologueBloomObjId ? objectEls[prologueBloomObjId] : null;
  if (el) {
    cribCue(el, false);
    el.classList.remove("crib-bloom-pop"); void el.offsetWidth; el.classList.add("crib-bloom-pop");
  }
  if (window.Sound && Sound.tibetanBowl) Sound.tibetanBowl(528);
  cribSay("The flower drank it all up. Look how it leans toward you now.", null, 4200);
  saveState();
  cribCheckNeedsDone();
}

/* both actionable needs met → name the deferred third, then graduate */
function cribCheckNeedsDone() {
  var o = cribOb();
  if (!o.need1Done || !o.need2Done || o.need3Deferred) return;
  o.need3Deferred = true;
  saveState();
  prologueSetTimeout(function () {
    cribSay("...the sound behind the tree. Later. I promise we'll look.", "goodnight", 5200);
    prologueSetTimeout(graduateCrib, 3200);
  }, 1200);
}

/* GRADUATION — the Warren opens for the first time. Mario law (witness #4):
   the EARNED path (finishing the bonding arc) opens WORLD 1 only — Lulu,
   Zaz, the tree, the garden, the lantern — and the rest of the Warren
   unlocks world by world through play (checkWorldAdvance). The FULL path
   (fullReveal=true: skip, old callers) is byte-for-byte the old behavior —
   everything at once, rung 12 — because skip means "I've done this before". */
function graduateCrib(fullReveal) {
  if (prologueStep === 6) return;
  prologueClearTimers();
  prologueStep = 6;
  prologueActive = false;
  var staged = !fullReveal;
  /* reveal gently — the staged path re-hides the unearned right after */
  GOBLIN_DEFS.forEach(function (d, i) {
    setTimeout(function () { prologueReveal(goblinEls[d.id]); }, i * 110);   // Artist law: cascade
    prologueGoblinsShown++;
  });
  ZONES.forEach(function (z, i) { setTimeout(function () { prologueReveal(document.getElementById("zone-" + z.id)); }, 440 + i * 110); });
  PROLOGUE_CHIPS.forEach(function (id, i) { setTimeout(function () { prologueReveal(document.getElementById(id)); }, 1100 + i * 110); prologueChipsShown++; });
  var app = document.getElementById("app");
  if (app) app.classList.remove("prologue-active", "crib-active");
  if (goblinEls.lulu) goblinEls.lulu.classList.remove("crib-sleeping", "crib-waking", "crib-cue");
  var skip = document.getElementById("prologue-skip");
  if (skip) skip.classList.add("hidden");
  var sh = document.getElementById("crib-mystery"); if (sh) sh.classList.add("hidden");
  var prog = document.getElementById("crib-progress"); if (prog) prog.classList.add("hidden");
  S.flags.prologueSeen = true;
  S.flags.greeted = true;              // the crib already greeted; don't double-fire
  if (staged) { S.progress.worldStaged = true; S.progress.rung = 5; }
  else S.progress.rung = 12;
  var o = cribOb();
  o.woke = true; o.offered = true; o.mystery = true;
  saveState();
  renderGoblins();
  if (staged) {
    /* WORLD 1 — a garden, a friend who tends it, a lantern of questions.
       Quiet on purpose: sparkles, matcha, boops, Lulu's lantern quiz.
       Everything else waits for its world (startWorldAmbient). */
    applyWorldReveal(false);
    GOBLIN_DEFS.forEach(function (d, i) { if (goblinRevealed(d.id)) scheduleGoblinTick(d.id, 1600 + i * 700); });
    scheduleSparkle();
    scheduleMatchaCraving(randi(60000, 100000));
    setTimeout(function () {
      if (!everBooped) showBubble("lulu", "Try booping someone. Gently.", 3600);
    }, 12000);
    setTimeout(function () {
      showBubble("lulu", "This is our garden. Zaz tends it... the rest of the Warren still sleeps.", 5600, true);
    }, 2600);
    setTimeout(spawnHearth, 9000);   /* WORLD 1's embodied quest (witness #6) */
    return;
  }
  /* the ambient goblin ticks, deferred by boot() until the crib graduated */
  GOBLIN_DEFS.forEach(function (d, i) { scheduleGoblinTick(d.id, 1600 + i * 700); });
  if (S.progress.spireUnlocked) { ensureTink(); scheduleCrown(randi(30000, 90000)); }
  scheduleMoth(randi(8000, 16000));    // the Moth comes to look at the bloom
  bootScriptedArc();
  /* the ordinary ambient loop, deferred by boot() until now */
  scheduleRaam(randi(50000, 90000));
  scheduleSparkle();
  setTimeout(function () {
    if (!everBooped) showBubble("lulu", "Try booping someone. Gently.", 3600);
  }, 12000);
  scheduleGoldfall(randi(25000, 55000));
  scheduleMatchaCraving(randi(70000, 120000));
  if (!S.adopted) wandererTimer = setTimeout(spawnWanderer, randi(50000, 110000));
  pickDailyVerdict(utcDateStr(), DV_DILEMMAS.length, function (idx) {
    dvPickedIndex = idx;
    if (!todayVerdict()) setTimeout(spawnVerdictScroll, 4000);
  });
}
/* finishPrologue kept as an alias so any old caller still graduates cleanly (full) */
function finishPrologue() { graduateCrib(true); }

/* a skip is a snap: graduate immediately, revealing the whole Warren now */
function skipPrologue(staged) {
  if (!prologueActive) return;
  /* make sure a bloom (or at least the seed) exists so nothing looks empty */
  var o = cribOb();
  if (!o.offered && !prologueBloomObjId) {
    if (!prologueSeedObjId) { addObject("🌰", "A Seed, Yours", "tree"); var obj = S.objects[S.objects.length - 1]; prologueSeedObjId = obj ? obj.id : null; }
  }
  renderObjects();
  graduateCrib(!staged);   /* button skip → staged World 1 · debug/legacy skip → full rung 12 */
}

/* ---- debug/test hooks (kept stable for the harness) ---- */
function setPrologueSeen(v) { S.flags.prologueSeen = !!v; saveState(); return S.flags.prologueSeen; }
function resetCrib() {
  prologueClearTimers();
  prologueActive = false; prologueStep = 0; prologueGoblinsShown = 1; prologueChipsShown = 0;
  prologueSeedObjId = null; prologueBloomObjId = null;
  var app = document.getElementById("app");
  if (app) app.classList.remove("prologue-active", "crib-active");
  Object.keys(goblinEls).forEach(function (id) { goblinEls[id].classList.remove("prologue-shown", "prologue-reveal", "crib-cue", "crib-sleeping", "crib-waking"); });
  document.querySelectorAll(".zone, .wobject").forEach(function (el) { el.classList.remove("prologue-shown", "prologue-reveal", "crib-cue"); });
  PROLOGUE_CHIPS.forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.remove("prologue-shown", "prologue-reveal"); });
  var sh = document.getElementById("crib-mystery"); if (sh) sh.classList.add("hidden");
  var prog = document.getElementById("crib-progress");
  if (prog) { prog.classList.add("hidden"); for (var i = 0; i < prog.children.length; i++) prog.children[i].classList.remove("done", "crib-cue"); }
  /* wipe the crib's world objects so a replay starts truly empty */
  S.objects = S.objects.filter(function (ob) { return ob.emoji !== "🌰" && ob.emoji !== "🌸"; });
  S.flags.prologueSeen = false;
  S.progress.rung = 1;
  S.progress.onboarding = Object.assign({}, CRIB_OB_DEFAULTS);
  saveState();
}
function replayPrologue() {
  resetCrib();
  renderObjects();
  startPrologue();
  return true;
}
function advancePrologue() {
  if (!prologueActive) return false;
  if (prologueStep === 1) cribWake();
  else if (prologueStep === 2 && !cribOb().offered) cribOfferSeed();
  else if (prologueStep === 2 && cribOb().mystery) tapCribMystery();
  else if (prologueStep === 3) cribNeed();
  else if (prologueStep === 4 && !cribOb().need1Done) cribFeedLulu();
  else if (prologueStep === 4 && !cribOb().need2Done) cribWaterBloom();
  return true;
}
function getPrologueState() {
  var seedEl = prologueSeedObjId ? objectEls[prologueSeedObjId] : null;
  var o = cribOb();
  return { active: prologueActive, seen: !!S.flags.prologueSeen, step: prologueStep,
    rung: S.progress.rung, onboarding: { woke: !!o.woke, offered: !!o.offered, mystery: !!o.mystery, visits: o.visits || 0,
      need1Done: !!o.need1Done, need2Done: !!o.need2Done, need3Deferred: !!o.need3Deferred, matchaCupObjId: o.matchaCupObjId || null },
    goblinsShown: prologueGoblinsShown, chipsShown: prologueChipsShown,
    seedObjId: prologueSeedObjId, bloomObjId: prologueBloomObjId,
    seedShown: !!(seedEl && seedEl.classList.contains("prologue-shown")) };
}

/* ---------------------------------------------------------------------
   DEBUG HOOK — used only by the verification harness, not shown in UI
--------------------------------------------------------------------- */

window.WARREN_DEBUG = {
  getState: function () { return S; },
  toggleProposalInspector: function () { toggleProposalInspector(); },
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
  getCollectibles: function () { return { defs: COLLECTIBLES, unlocked: S.collectibles.unlocked.slice(), found: S.collectibles.found.slice() }; },
  discoverCollectible: function (id) { discoverCollectible(id); },
  checkCollectibleUnlocks: function () { var n = checkCollectibleUnlocks(); renderCollectibles(); return n.map(function (c) { return c.id; }); },
  bubble: function (id, text) { showBubble(id, text, 4000); },
  award: function (orbs, sap) { earn(orbs || 0, sap || 0); saveState(); },
  spawnCrown: function () { spawnCrown(); },
  spawnRaam: function () { spawnRaam(); },
  spawnSeren: function () { spawnSeren(); },
  tapSeren: function () { tapSeren(); },
  tapRaam: function () { tapRaam(); },
  startMinigame: function (id) { return startMinigame(id); },
  luluSpeak: function (t) { luluSpeak(t); },
  organLatchedIdx: function () { return organLatched(); },
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
  openCard: function (id) { renderSheetGoblin(id); },
  startMinigame: function (id) { return startMinigame(id); },
  mgState: function () { return { active: mg.active, data: mg.data }; },
  mgMaskTap: function () { mgMaskTap(); },
  mgGeraldPick: function (i) { mgGeraldPick(i); },
  mgRepairSet: function (pct) { mg.data.pct = pct; mg.data.holding = false; mgRepairRelease(); },
  spawnSparkle: function () { spawnSparkle(); },
  weather: function () { return warrenWeather(); },
  physStep: function (p, dt) { return physStep(p, dt); },
  breath: function () { return renderBreath(); },
  coinBurst: function (x, y, n) { coinBurst(x || 200, y || 300, n || 6); },
  qcmCount: function () { return AI_QCM.length; },
  setLevel: function (n) { return setLevel(n); },
  getLevels: function () { return LEVELS; },
  currentLevel: function () { return currentLevel(); },
  /* level gate — VISION_V1_30 §1 */
  getLevelsUnlocked: function () { return (S.progress.levelsUnlocked || [1]).slice(); },
  unlockAllLevels: function () {
    var all = [];
    for (var i = 1; i <= LEVELS.length; i++) all.push(i);
    S.progress.levelsUnlocked = all;
    saveState();
    return all.slice();
  },
  tryUnlockLevel: function (n) { return tryUnlockLevel(n); },
  needKnow: function (n) { return needKnow(n); },
  tollZOL: function (n) { return tollZOL(n); },
  /* VISION_V1_31 §1/§2a/§2b */
  nextLockedLevel: function () { return nextLockedLevel(); },
  renderSheetIdle: function () { renderSheetIdle(); },
  hardShare: function (level) { return hardShareForLevel(level); },
  bossTaps: function (defeats) { return bossTaps(defeats); },
  /* click congas (VISION_V1_28 §4) */
  getCongaIdx: function () { return congaIdx; },
  /* Lulu voice seam (VISION_V1_28 §5) */
  getLuluVoiceURLs: function () { return LULU_VOICE_URLS; },
  fireLuluVoiceLine: function (k) { luluVoiceLine(k); return true; },
  mgResolve: function (win, reward) { endMinigame(!!win, "debug", reward || 0, null); },
  getEchoes: function () { return S.echoes; },
  setEcho: function (k, v) { S.echoes[k] = v; saveState(); return S.echoes; },
  /* the return constellation */
  warrenHumor: function (b) { return warrenHumor(b || 0); },
  applyWarrenHumor: function (b) { return applyWarrenHumor(b || 0); },
  /* goblin mood visuals */
  moodBucket: function (m) { return moodBucket(m); },
  renderGoblins: function () { renderGoblins(); },
  getGoblinEl: function (id) { return goblinEls[id] ? goblinEls[id].outerHTML : null; },
  /* the akashic organ */
  openOrgan: function () { openOrgan(); },
  closeOrgan: function () { closeOrgan(); },
  toggleOrganStop: function (i) { return toggleOrganStop(i); },
  organLatched: function () { return organLatched(); },
  detectHarmony: function (fs) { return detectHarmony(fs); },
  /* the serpent in the tree */
  serpentHeight: function () { return serpentHeight(); },
  getStations: function () { return SERPENT_STATIONS; },
  renderSerpent: function () { renderSerpent(); },
  bijaTone: function (f) { Sound.bijaTone(f); },
  /* daily verdict */
  verdictPickFor: function (dateStr, cb) { pickDailyVerdict(dateStr, DV_DILEMMAS.length, cb); },
  getVerdictIndex: function () { return dvPickedIndex; },
  setVerdictIndex: function (i) { dvPickedIndex = i; },
  spawnVerdictScroll: function () { spawnVerdictScroll(); },
  openVerdictCard: function () { openVerdictCard(); },
  stampVerdict: function (s) { return applyVerdictStamp(s); },
  getVerdicts: function () { return ensureVerdictState(); },
  getDilemmas: function () { return DV_DILEMMAS; },
  /* goblin questions (ethics) */
  forceEthicsQuiz: function () { quizOpen = true; currentQuiz = ethicsQuizCandidate(); renderSheetQuiz(); return currentQuiz; },
  answerQuiz2: function (opt) { answerQuiz(opt); },
  getEthics: function () { return ensureEthicsState(); },
  getEthicsPool: function () { return ETHICS_QUESTIONS; },
  ethicalStyle: function () { return ethicalStyle(); },
  /* the adoption ritual */
  spawnWanderer: function () { spawnWanderer(); },
  openAdoptCard: function () { openAdoptCard(); },
  adoptWanderer: function (name) { return adoptWanderer(name); },
  getAdopted: function () { return S.adopted; },
  /* goldfall */
  spawnGoldfall: function (glyph) { spawnGoldfall(glyph || "\ud83e\ude99"); },
  catchGoldfall: function () { catchGoldfall(); },
  goldfallActive: function () { return !!goldfallEl; },
  /* matcha craving (VISION_V1_28 §3) */
  spawnMatchaCraving: function () { spawnMatchaCraving(); },
  pickUpMatcha: function () { onTapMatchaCup(); },
  deliverMatcha: function () { if (matchaGoblinId && !matchaHeld) onTapMatchaCup(); return deliverMatcha(); },
  expireMatcha: function () { expireMatcha(); },
  getMatcha: function () { return { active: !!matchaGoblinId, goblinId: matchaGoblinId, held: matchaHeld }; },
  /* healing sound layers */
  shamanicBurst: function (i) { Sound.shamanicBurst(i); },
  didgeridoo: function () { Sound.didgeridoo(); },
  tibetanBowl: function (f) { Sound.tibetanBowl(f); },
  bowlFreqFor: function (id) { return bowlFreqFor(id); },
  /* composting replay organism */
  getReplay: function () { return S.replay; },
  getWarrenTicks: function () { return S.world.warrenTicks || 0; },
  pushMemory: function (line) { pushReplay("test", line || "a memory", "try", line || "a thing happened", line || ""); return S.replay[S.replay.length - 1]; },
  warrenAbsence: function (elapsedMs) { return warrenAbsenceTicks(elapsedMs); },
  compostStale: function () { return compostStaleMemories(); },
  touchMemory: function (id) { return touchMemory(id); },
  openRiddle: function () { openRiddle(); },
  luluSay: function (m) { luluSay(m); },
  luluOfflineReply: function (m) { return luluOfflineReply(m); },
  getLuluChat: function () { return S.lulu.chat; },
  teach: function (id, text) { return teachGoblin(id, text); },
  sealTeaching: function () { return sealTeaching(); },
  dismissTeaching: function () { return dismissTeaching(); },
  getTeaching: function () { return S.teaching; },
  interpretLesson: function (t) { return interpretLesson(t); },
  goblinCallback: function (id) { return goblinCallback(id); },
  getLulu: function () { return S.lulu; },
  luluMood: function () { return luluMood(); },
  careLulu: function (kind) { return careLulu(kind); },
  setLuluNeeds: function (o) { Object.assign(S.lulu.needs, o || {}); clampLuluNeeds(); applyLuluMood(); saveState(); return S.lulu.needs; },
  luluAbsence: function (mins) { return luluAbsenceMessage(mins); },
  forceReunion: function (ms) { return luluReunion(ms || 3600000); },
  forceLuluRequest: function () { return maybeLuluRequest(); },
  answerLuluRequest: function (a) { return answerLuluRequest(a); },
  tickLulu: function () { tickGoblin("lulu"); },
  getCouncil: function () { return S.council; },
  getCouncilEpisode: function () { return COUNCIL_EPISODE; },
  getCouncilPositions: function () { return councilPositions(); },
  startCouncil: function () { return startCouncil(); },
  councilCard: function (id) { return councilIntervene(id); },
  /* VISION_V1_29 surprise pack */
  startStaring: function () { return startMinigame("staring"); },
  spawnMatchaRain: function () { spawnMatchaRain(); },
  getMatchaRain: function () { return { active: matchaRainActive, caught: matchaRainCaught }; },
  tapTreeForDisco: function () { for (var i = 0; i < 5; i++) checkTreeDisco(); return discoActive; },
  getDiscoActive: function () { return discoActive; },
  fireSurpriseLine: function (k) { luluSurpriseLine(k); return true; },
  getSurpriseURLs: function () { return LULU_SURPRISE_URLS; },
  forceFaintBoop: function (id) { doFaintBoop(id || Object.keys(S.goblins)[0]); },
  forceFaintBoop: function (id) { doFaintBoop(id || Object.keys(S.goblins)[0]); },
  /* VISION_V1_32 §3/§4 — SFX seam debug hooks */
  getSfxUrls: function () { return SFX_URLS; },
  setSfxUrl: function (key, url) { SFX_URLS[key] = url; },
  playSfx: function (key) { playSfx(key, SFX_SYNTH_FNS[key]); },
  getSfxSynthCount: function () { return sfxSynthCount; },
  resetSfxSynthCount: function () { sfxSynthCount = 0; },
  wipe: function () { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} },
  /* v-local.1: generateGoblinLine test surface */
  generateGoblinLine: function (id, mood, events, cb) { generateGoblinLine(id, mood, events, cb); },
  /* QUIZ_TO_ZOL_V1 test surface */
  openHallucinationQuiz: function () { openHallucinationQuiz(); },
  answerHallucinationQuiz: function (idx) { answerHallucinationQuiz(idx); },
  getQuizZolState: function () { return { quizState: S.quizState, villageState: S.villageState }; },
  quizZolRewarded: function () { return quizZolRewarded(); },
  getQuizZolQuestion: function () { return QUIZ_ZOL_V1_QUESTION; },
  /* QUIZ_TO_ZOL_V2 test surface */
  openQuizZol: function (qid) { return openQuizZol(qid); },
  answerQuizZol: function (idx) { return answerQuizZol(idx); },
  quizZolBank: function () { return QUIZ_ZOL_BANK.map(function (q) { return { id: q.id, topic: q.topic, correctIdx: q.correctIdx, effect: q.effect, base: q.base }; }); },
  getQuizZolV2: function () { return { zol: S.learning.zolBalance, streak: S.quizState.streak, bestStreak: S.quizState.bestStreak,
    rewardPaid: Object.assign({}, S.quizState.rewardPaid), effects: S.villageState.unlockedEffects.slice(),
    villageObjects: S.objects.filter(function (o) { return ["Knowledge Lantern", "Learned Mushroom", "Mended Beam"].indexOf(o.sign) >= 0; }).map(function (o) { return o.sign; }),
    replayKinds: S.replay.map(function (r) { return r.choice; }) }; },
  quizZolResetTries: function () { quizZolTries = {}; },
  restoreKnowledgeLantern: function () { restoreKnowledgeLantern(); renderObjects(); },
  /* test utility: force-close the quiz so a second open can proceed without waiting 2800ms */
  forceCloseQuiz: function () { quizOpen = false; currentQuiz = null; },
  /* VISION_V1_33 §6 / VISION_PROGRESSION — the crib gate surface */
  setPrologueSeen: function (v) { return setPrologueSeen(v); },
  replayPrologue: function () { return replayPrologue(); },
  resetCrib: function () { return resetCrib(); },
  tapLuluPrologue: function () { return tapLuluPrologue(); },
  advancePrologue: function () { return advancePrologue(); },
  skipPrologue: function () { return skipPrologue(); },
  getPrologueState: function () { return getPrologueState(); },
  getCribState: function () { return getPrologueState(); },
  getRung: function () { return S.progress.rung; },
  getWorld: function () { return { world: currentWorld(), earned: earnedWorld(), rung: S.progress.rung, staged: !!(S.progress && S.progress.worldStaged) }; },
  rubHearth: function (px) { var o = null; for (var i = 0; i < S.objects.length; i++) if (S.objects[i].sign === "A Cold Hearth") { o = S.objects[i]; break; } if (o) hearthRubFriction(px || 500, o.id); return !!S.flags.hearthLit; },
  spawnHearth: function () { spawnHearth(); },
  checkWorldAdvance: function () { checkWorldAdvance(); return currentWorld(); },
  arrivalPending: function () { return !!arrivalStarEl; },
  catchArrival: function () { catchArrivalStar(); return currentWorld(); },
  getLuluPrologueURLs: function () { return LULU_PROLOGUE_URLS; }
};

/* ---------------------------------------------------------------------
   BOOT
--------------------------------------------------------------------- */

function boot() {
  buildStaticWorld();
  wireInput();
  layoutObjects();
  restoreKnowledgeLantern(); /* QUIZ_TO_ZOL_V1: re-light lantern if already earned */
  applyLevelBackdrop();
  renderAll();
  renderSheetIdle();

  /* ambient goblin ticks reference systems the crib hasn't introduced yet
     ("I found something near the Garden Plot") — they'd shatter the one-being
     illusion. Suppressed during the crib; graduateCrib() starts them. */
  if (S.flags.prologueSeen) {           // graduated players only; the crib defers ticks
    GOBLIN_DEFS.forEach(function (d, i) { scheduleGoblinTick(d.id, 1400 + i * 700); });
    if (S.progress.spireUnlocked) {
      ensureTink();
      scheduleCrown(randi(30000, 90000));
    }
  }
  /* VISION_PROGRESSION §1 — the crib runs whenever the player has not yet
     graduated the Bonding Ladder (prologueSeen false). Unlike the old
     one-session Prologue this is NOT gated on isFreshBoot: a player who woke
     Lulu and offered the seed, then left, is `!isFreshBoot` but must re-enter
     the crib on return for the MEMORY beat (Rung 3) before graduating.
     Established players (prologueSeen true — every existing save, via the
     load grandfather) get EXACTLY today's boot, zero behaviour change: the
     crib is skipped and the full ambient loop runs now. During the crib the
     ambient spawns and the returning-player reunion rituals are deferred to
     graduateCrib(), so the first acts stay uncluttered. */
  var runCrib = !S.flags.prologueSeen;

  if (!runCrib) {
    scheduleRaam(randi(50000, 90000));
    if ((S.progress.raamDefeats || 0) >= 1) scheduleSeren(randi(120000, 200000));
    /* FIRST-MINUTE PACING: the opening arc is choreographed so the first 60s
       always offers something — 12s Lulu's boop hint · ~20s the Moth's first
       riddle · ~35s the circus sparkle · ~55s Raâm crashes in. Later spawns
       relax to the old unhurried cadence. */
    scheduleMoth(randi(16000, 26000));
    scheduleSparkle();
    setTimeout(function () {
      if (!everBooped) showBubble("lulu", "Try booping someone. Gently.", 3600);
    }, 12000);
  }

  /* Gerald quest unlock gate: after 7s, unlock when player interacts */
  if (S.learning.geraldQuest.stage === "LOCKED") {
    setTimeout(function () {
      if (S.learning.geraldQuest.stage === "LOCKED") {
        S.learning.geraldQuest.stage = "AVAILABLE";
        saveState();
      }
    }, GERALD_QUEST.triggerDelay);
  }

  /* Lulu lived while you were away: reunion ritual for returning players */
  var away = S.lulu.lastVisitAt ? (Date.now() - S.lulu.lastVisitAt) : 0;
  S.lulu.lastVisitAt = Date.now();
  if (!isFreshBoot && away > 0) {
    /* the whole Warren aged, not only Lulu: fold absence-as-data into ticks
       (clock read here, in the boot zone — never inside the compost fold),
       then un-tended memories compost into soil. */
    var foldedBuckets = warrenAbsenceTicks(away);
    /* gone an hour or more → the place greets you in its current humor.
       Suppressed during the crib — the crib runs its own memory beat. */
    if (foldedBuckets >= 2 && !runCrib) {
      setTimeout(function () { applyWarrenHumor(foldedBuckets); }, 2600);
    }
  }
  if (!isFreshBoot && away > 120000 && !runCrib) {
    setTimeout(function () { luluReunion(away); }, 1200);
  }
  saveState();

  /* Council convenes for returning players who resolved Gerald but never held the hearing */
  if (!S.council.done && S.learning.geraldQuest.stage === "T5A_RESOLVED") {
    councilTimer = setTimeout(maybeStartCouncil, 30000);
  }
  if (S.council.stage === "DEBATE" || S.council.stage === "UPDATED") {
    /* mid-hearing reload: reopen the chamber (an un-executed card re-runs) */
    if (S.council.card) { S.council.card = null; S.council.stage = "DEBATE"; }
    setTimeout(renderCouncil, 1500);
  }

  if (runCrib) {
    if (isFreshBoot) S.startedAt = Date.now();
    saveState();
    startPrologue(); // bootScriptedArc + the ambient loop hand off from graduateCrib()
  } else if (isFreshBoot) {
    S.startedAt = Date.now();
    saveState();
    bootScriptedArc();
  } else {
    resumeAfterReload();
  }

  /* le Terrier parle la langue qu'on lui a demandée, même après un rechargement */
  applyLang();

  if (!runCrib) {
    /* WORLD 1's embodied quest persists across sessions until lit */
    if (stagedActive() && currentWorld() === 1) setTimeout(spawnHearth, 6000);

    /* the sky sheds a coin now and then — first one comes a little sooner */
    scheduleGoldfall(randi(25000, 55000));

    /* a goblin wants matcha, eventually — a small want, a small tending */
    scheduleMatchaCraving(randi(70000, 120000));

    /* one wanderer, once — it appears only while the Warren has no kin */
    if (!S.adopted) {
      wandererTimer = setTimeout(spawnWanderer, randi(50000, 110000));
    }

    /* today's verdict: resolve the deterministic pick, then drop the scroll
       (only if today is unstamped — the scroll waits, it never nags) */
    pickDailyVerdict(utcDateStr(), DV_DILEMMAS.length, function (idx) {
      dvPickedIndex = idx;
      if (!todayVerdict()) setTimeout(spawnVerdictScroll, 4000);
    });
  }
  /* runCrib === true: every spawn above is deferred to graduateCrib(),
     which fires the exact same calls once the crib graduates (naturally on
     the Rung 3 return, or via skip) — nothing is lost, it only waits. */
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();

})();
