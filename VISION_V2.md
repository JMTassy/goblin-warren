# GOBLIN WARREN V2 — VISION

authority=false · claim=NO_CLAIM · non-sovereign · HER_FABLE, 2026-09-23.
Clean slate for gameplay and code; story kept. Verified against `origin/master`, `origin/v1` (+ `EPOCH_LEDGER.ndjson`), the lore branches named in §2, the HELEN Garden/Kernel canon, the Mayor's loop proposal, its critique, and `bakeoff/SPEC.md`.

---

## 1 · Pitch

Goblins dig up glowing idea-seeds and hold them out to you; you carry each one across the lantern's light and drop it somewhere in the Warren — the lantern only says whether it *can* exist there, never whether it will be loved. What grows, what it combines with, and who hops with joy or sulks is discovered after the drop, and Pip's Book remembers, so the fifth time you know. The Warren that grows is HELEN's memory made visible: every drop is a receipt, and one tap replays it from the first seed.

---

## 2 · Why the old gameplay failed (evidence)

**V0 (`origin/master`)** was a desktop game: keyboard controls (`Q B P A D H`), Three.js from a CDN, a ZOL economy earned from a 22-question quiz — nine questions about HELEN's own ideology (*"What is the core of HELEN governance?"*). The player's verb was *answer trivia, then click Admit on a sentence*; a proposal's whole effect was `t.level+1`.

**The successor lineage (`origin/claude/trusting-ritchie-fpivea`, `day1-sim`, `combat-v0`)** grew to `game.js` = 10,711 lines / 520 KB, `style.css` = 3,477 lines, 32 `*-gates.js` files, "115 green gates" — while the operator's real-device verdicts, recorded in that branch's own `docs/VISION_V2.md`, read: W1 *"everything comes at once… the magic is not happening"*; W2 *4/10, "not alive"*; W3 *"I first love it, then get bored because I do not see the step by step progression"*; W6 *"embodied gestures hook, bare taps don't"*; W8 *"the beginning is too boring… matcha is bugging"* (iOS `visibilitychange` timer freeze); W10 *4/10, "i do not understand and do not have fun."* That document counts **42 design documents against 4 built rungs** and eleven parallel systems (quiz, moth, boop chain, solfège, drum, combat, Serpent Choir, match-3…). Its anti-law *"no twelfth bespoke mechanic"* was written, then broken.

**V1 (`origin/v1`)** cut back to one goblin and a Try/Hold/Compost card. `EPOCH_LEDGER.ndjson` epoch 3: *"three consecutive Try taps left the mood label at 'curious' and Hold changed nothing on screen. Every act was feedback-dead."* The reducer was correct; the game was a form.

Three root causes common to all versions:

1. **The governance vocabulary was the interface.** Buttons said Admit / Deny / Hold / Try / Compost; the player judged *text*. The beats witnesses loved were physical: making fire (W6), catching falling things (W7), the rock you learn not to tap (W9).
2. **Correctness was measured, fun was not.** Laws were green while the screen was dead. Logic was extracted from HTML by regex; with no framework each version hand-rolled rendering, timers and audio and got iOS bugs for free.
3. **Systems were added instead of one loop being finished.**

---

## 3 · What the story carries forward

**The frame.** The Warren is HELEN's inner world. The HELEN canon gives it exact shape: below the seam is the **Garden** (unbounded generation, authority = 0); above it the **Kernel/Ledger** (governed state); between them the **Admission Seam Γ**, and the **Crossing Law**: *novelty circulates freely; authority does not; only the sealed, receipt-backed artifact crosses.* The goblins live in the Garden. Your hand is the only thing that crosses. Lulu's manifesto stays as the About page: *the Garden is hyperstitious, the Kernel is not — I can make anything real, I cannot make anything true.*

**The cast (brief's names and roles).** Lulu (Explorer, brings finds), Pip (Archivist, keeps the Book), Nib (Tinkerer, expands the ground), Zaz (Gardener, water), Gerald (Connector), Jester (Contradictor, brings bugs on purpose), Warden (fences), Scholar (the bench that explains), Mayor (§6), the Akashic Tree (rings = days), Mahakrah (rare golden visitor). Duets kept as arrival order (Lulu↔Nib, Zaz↔Pip, Gerald↔everyone).

**Places, unlocked by ledger facts:** the Warren ground, Bug Nursery jar, Cave of Echoes, Pip's Book (all M1), then Dream Grove, Mayor Hall, Mycelial Gate, the Tree. The Garden's ecology maps onto play: 🌰 Seed Bank = the burrow's finds · 🌿 Germination = adjacency combos · 🌳 Forest = the grown ground · 🍄 Mycelium = the hidden recipes · 🌸 Bloom = the golden seed and Mahakrah · 🍂 Compost = the heap. V0's twelve site names (Moth Chapel, Glowworm Farm, Rot Library…) return as structures the Mayor proposes; the Warren Item Library is the late bestiary.

**Tone.** Lulu's voice from `LULU_VOICE_LINES.md`: slow, soft, slightly absurd. Lines ≤ 6 words, lowercase, never explanatory.

**Cut.** ZOL, riddles/QCM, the Tall Ones' council, portals, the six V0 personas, Bram and the Level 0→12 curriculum, LLM dialogue and API keys, CDN voice files, matcha whisk, solfège, drum, combat, Serpent Choir, match-3, the session-only law (persistence is the product). The story must not burden: no tutorial text, no lore before day three, and the words proposal / verdict / admit / ledger never appear on screen.

---

## 4 · Core loop and the first 30 seconds

Portrait, one thumb. Middle: the **ground**, a 4×4 grid — soil, a few rocks, a small pond, fixed per Warren seed. Top-right: the gate-lantern on a post. Bottom: Lulu's mound with a burrow, the compost heap (right), the Bug Nursery jar (left), a dark hole (the Cave of Echoes) under the mound, and a thin strip of receipt glyphs along the bottom edge.

- **0 s.** Two green ears poke from the burrow; a soft ring pulses. No text.
- **Tap the ears.** Lulu pops up (squash-stretch, squeak) holding a glowing find above her head. It breathes. A dotted arc drifts toward the ground.
- **Drag it.** It lifts and scales 1.2×, shadow detaching, no lag. As it crosses the lantern's light, tiles answer under the finger: rock or occupied tiles glow **red**, anything else glows **green**. The lantern judges *legality only*.
- **Drop on soil.** *Thunk*, the tile darkens, a sprout pops with a chime and three particles; a receipt glyph joins the strip. Lulu hops. She dives back down.
- **~8 s.** Second find, bluish. Drop it next to the first: same sprout. Lulu hops *higher* and sits down beside it, eyes on it. You noticed. (She likes glow. Nothing said so.)
- **~18 s.** Third find wriggles faintly in your grip. Plant it: it becomes a beetle and scuttles to the jar (*plink*). Or you felt the tell and dropped it in the compost (*burp*). Either way, consequence, no punishment — W9's lesson.
- **~30 s.** Three receipts, two sprouts, one beetle or one compost. The player knows the game: carry, place, watch who reacts. What they don't yet know: that the blue one sleeps a night before sprouting, that reeds wilt off the pond, that blue beside green becomes something new tomorrow — and that all of it will be written in the Book.

**Then, each day:** Lulu brings six finds and sleeps (tap-and-hold to pet her: purr, hearts). Plants grow a stage per real day. Adjacent species **combine** on the next visit (two recipes in M1; the Mycelium). Wilted plants fall into the compost. Compost fills in five and blooms a **golden seed** that takes its neighbours' nature. A find you swipe down into the **Cave** returns days later *as a different species* — stranger, not re-queued. Three beetles in the jar → a firefly that lands on a plant. Tap the strip → **replay**: the ground empties and regrows in three seconds from the first receipt; a second page is **Pip's Book**: recipes found, who reacted to what. When you touch nothing, Lulu wanders to the plant she likes, the lantern flickers, beetles roam the jar.

**Where this stands against the canon, the Mayor's loop and the critique.** The core loop *is* the Crossing Law, not a wrapper: finds circulate free and abundant in the Garden below the seam (A = 0); your hand carries one across; the lantern is Γ and checks only that a receipt path exists (a legal tile); the ledger seals it, replayably. I **use the Mayor's loop** — orbs popping above Lulu, drag with tile feedback, growth on drop, goblin reactions, Pip's Book, adjacency combos, compost, the Cave — with four amendments, and I **accept the critique**: my first draft coloured the find green/amber/red *while held*, by kind; that graded the answer before the drop and left only sorting. (1) The lantern checks legality, never quality — the amber tier is gone; "hold" survives as *time* discovered after the drop (some species sleep a night). (2) The bug's tell is physical (a wriggle in the hand), not a colour: learnable by feel. (3) M1 grows living things, not structures — a sprout at 16 px reads in one frame and grows across days; structures arrive with the Mayor. (4) "Ignored → Cave" is an explicit swipe or what remains when Lulu falls asleep, never a timer. Combos and preferences are at the centre: the only decision in the game is *where*, and where is a bet on adjacency (recipes) and on who is watching (preferences). The Mayor's condition holds: every hidden outcome is a deterministic rule of the reducer and every reaction is written to the Book, so the first time surprises and the fifth is mastery.

---

## 5 · Progression across sessions and days

Every unlock is a **ledger fact**, never a timer; the reducer derives what exists from the events.

- **Day 1:** Lulu, the ground, jar, compost, cave, strip. ~3 minutes, ends when Lulu sleeps.
- **Day 2:** dormant seeds wake, sprouts grow, the first recipe fires, wilts fall to compost. Lulu: *"you came back."* The game proves it remembered before you touch anything.
- **20 receipts → Pip** arrives; the Book becomes a place (scrub the timeline with a thumb).
- **First recipe → Zaz**, one cup of water per day: wake a sleeper today, or save a reed off the pond (care as a scarce, kind resource).
- **Ground full → Nib** builds a row: 4×6, 6×6.
- **First golden seed → the Akashic Tree**, one ring per day visited.
- **Later:** Jester (bugs on purpose; the jar's fireflies), Warden (fences), Gerald (a neighbour's find, a species you can't dig), the Mayor (§6), Mahakrah (≥4 species blooming and an empty jar for three days: a golden seed and an "ancient memory" — the replay of a day you did not play).
- **Visible balance, no counter:** as species diversify and the jar empties, the palette warms and Lulu hums; the pull toward Mahakrah is felt, not scored. Day 30: full ground, tree, three goblins. Day 365: the Warren the brief drew.

No streaks, no notifications, no login rewards. Absence has no cost: sleepers wait, plants don't die.

---

## 6 · Divergences from the brief

1. **The Mayor does not decide.** The brief's Mayor "decides, prioritizes, executes"; V0 canon and the Crossing Law say only the player admits. Resolved: the Mayor *proposes plans* (three admitted plants → a structure) and *executes* after you admit. Never admits.
2. **No stat meters.** Coherence/Diversity/Memory/Trust are not shown; the lineage's own anti-law (*"no on-screen Coherence number, ever"*) and W3/W10 agree. They exist as the world's look (§5).
3. **Moods: four, not six** — curious / happy / worried / tired; each readable in a 16-px face.
4. **Resources: finds only.** Seeds/bugs/ideas/memories collapse into one physical thing. Memories are receipts, not a counter.
5. **HAL's HOLD tier removed from the lantern** (the critique): legality is judged before the drop, nothing else. "Not yet" is a species trait discovered afterwards.
6. **Daily rhythm without timers**: real-day growth is a calendar; nothing counts down.
7. **Lulu first, Bram cut** (the successor branch put Bram first; the brief and V1 put Lulu first — one companion at a time, W1).
8. **Persistence risk named.** Safari may evict `localStorage` after 7 days without a visit. After M1: a web manifest (Home Screen install is exempt) and "save my ledger" export/import.

---

## 7 · Framework choice — provisional, pending the bake-off

Research pick: **Phaser 4.2.1**. The Mayor is running an empirical bake-off (`bakeoff/SPEC.md`: the same drag-an-orb gesture in Phaser 4, Kaplay, PixiJS 8, LittleJS, Excalibur and plain Canvas; one harness; iPhone 13 size, real touch, 4× CPU throttle, gzipped size, source lines). Its result settles the engine; the packages in §11 depend only on what every contestant has: a scene, sprites or shapes, tweens, pointer drag.

Evidence, npm registry `time` fields queried 2026-09-23:

| Framework | Latest stable | Published | Notes |
|---|---|---|---|
| **phaser** | **4.2.1** | **2026-07-09** (4.0.0: 2026-04-10; last 3.x = 3.90.0, 2025-05-23) | Full framework: scenes, tweens, particles, Web Audio, Scale manager, touch drag + drop zones. Official [Vite template](https://github.com/phaserjs/template-vite) (Phaser 4 + Vite 6). 28 agent skill files in-repo ([`/skills`](https://github.com/phaserjs/phaser/tree/master/skills): `input-keyboard-mouse-touch`, `tweens`, `scale-and-responsive`, `v3-to-v4-migration`…). Sole dependency `eventemitter3`; types bundled. Canvas renderer present but deprecated ([migration guide](https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/MIGRATION-GUIDE.md)); removals (`Geom.Point`, `Mesh`, pipelines, tint modes) unused by M1. |
| pixi.js | 8.21.0 | 2026-09-17 | Very alive, but a renderer: scenes, tweens, audio, drop zones are hand-rolled by agents — the bug surface we are escaping. |
| kaplay | 3001.0.19 | 2025-06-15 (4000 = alpha.27.1, 2026-05-12) | Stable branch 15 months stale; successor alpha. Ruled out. |
| excalibur | 0.32.0 | (0.33.0-alpha.247, 2026-09-21) | Good engine, pre-1.0, alpha churn, smaller corpus. |
| littlejsengine | 1.19.3 | 2026-09-22 | 5.8 MB, MIT, one maintainer; thin on drop zones and responsive scaling. |

Why Phaser on argument: the largest example corpus for an LLM builder, an API kept compatible v3→v4, no editor GUI, runs in headless Chromium (WebGL via SwiftShader). Risk: Sonnet knows Phaser 3 better than 4 — mitigated by vendoring the relevant skill files and pinning `4.2.1`. If the harness shows friction or slow frames under throttle, the bake-off wins.

---

## 8 · Technical architecture

```
goblin-warren/
  package.json          <engine>, vite, vitest, @playwright/test (chromium)
  vite.config.js        base: '/goblin-warren/'
  index.html            viewport-fit=cover, touch-action:none, overscroll-behavior:none
  public/               .nojekyll, manifest.webmanifest (post-M1)
  src/core/             PURE — no engine, no DOM, no Date, no Math.random
    events.js           EVENT kinds + payloads (frozen by P0)
    rng.js              mulberry32
    state.js            makeState(seed) · apply(state, ev) → new state
    finds.js            nextFind(state) · legal(state, tile) · outcome(state, find, tile)
    growth.js           daily step: stages, sleepers, wilts, recipes
    ledger.js           replay({seed, events}) → state
    book.js             book(ledger) → {recipes, reactions}   (derived, never stored)
    persist.js          serialize / parse → ledger | null (fail-closed)
  src/art/              PURE — palette.js pixelmaps.js raster.js (map → RGBA) 
  src/audio/sfx.js      WebAudio synth, no files, engine-free
  src/game/             the engine-specific view: one scene, objects, juice.js, storage.js, testhook.js
  src/content/lines.json
  test/core/*.test.js   vitest       test/e2e/*.spec.js   playwright, devices['iPhone 15']
  scripts/deploy.sh     build → push dist/ to gh-pages (no CI)
```

**Logic stays pure.** The save *is* the ledger `{v:'GW2', seed, events}`; state is never saved, it is `replay(ledger)`. The view dispatches through one function (append → `apply` → save → render the diff). Time enters only as `VISIT{t}`; randomness only from `rng(seed, events.length)`. A vitest purity test greps `src/core` and `src/art` for `Date|Math.random|window|document|<engine>` and fails on any hit. Determinism: replay twice → deep-equal; the incremental `apply` chain equals `replay`.

**Art stays pure too.** `raster.js` turns a pixel map into `{w, h, rgba}`; the view uploads it as a texture through whatever the engine offers (canvas/ImageData/data-URL — all five contestants can). So P2 is vitest-tested without a browser.

**Playwright smoke at iPhone viewport.** `devices['iPhone 15']` (in playwright-core 1.63.0: 393×852, `hasTouch`, `isMobile`) against `vite preview`. The hook extends the bake-off's: `window.__gw = {ready, state(), ledger(), tiles(), orbPos(), at(name)}` in viewport CSS px, DPR-corrected. Assertions: zero page errors; no page scroll (`scrollHeight ≤ innerHeight+1`); canvas ≥ 380 px wide; tap `at('lulu')` → `state().offered`; touch-drag `orbPos()` → `tiles()[k]` (soil) → `state().ground[k]` planted and a 20×20 pixel sample there changed; drag to a rock → `hover === 'no'`, springs back; reload → still planted. Screenshots saved every run.

**GitHub Pages under `/goblin-warren/`.** `base: '/goblin-warren/'`; `scripts/deploy.sh` runs tests, builds, replaces the `gh-pages` worktree with `dist/` + `.nojekyll`, commits, pushes. The operator enables Pages once (Settings → Pages → `gh-pages`, root). A deploy is done only when the operator's Safari shows the ground — never when `git push` returns 0.

---

## 9 · Art and audio

**Art: pixel maps in code.** Every sprite is a string array with palette letters (V1's Lulu, generalized): Lulu 16×16 (2 idle frames, 4 faces), finds 8×8 (one hue per species, bug identical to a seed), tiles 24×24 (soil, wet, rock, pond), plants 16×24 × 3 stages × 5 species (3 base + 2 recipe) + wilt, jar, heap ×3, cave, lantern, particle. Palette from the family cast sheet: moss `#5c7a3a`, glow `#a8d858`, ember `#d08a3c`, bone `#e8dcc0`, dream `#8b6fc9`, swamp `#141c0e`, black, white. The pixel look is a technique (nearest-neighbour upscale), not borrowed art; no image files, no artist, no third-party IP. Beam and particles are engine primitives.

**Audio: synthesized.** Oscillator + gain envelopes and one noise buffer. Cues: `pop lift tile_ok tile_no thunk sprout wriggle plink burp snore purr chime_gold hop`. AudioContext unlocks on the first touch (iOS). Mute toggle top-left, persisted.

---

## 10 · Milestone M1 — the smallest fun

Lulu; a 4×4 ground with 10 soil, 3 rock, 3 pond from the seed; three species (mosscap: anywhere; glowcap: sleeps a night, Lulu's favourite; reedling: thrives on pond, wilts on soil) + bugs (wriggle tell) + the golden seed; two recipes (glowcap + mosscap → lanternmoss; reedling + glowcap → mirrorbloom); Lulu's one like (glow: high hop, sits beside it) and one dislike (reeds by her mound: shrug); legality feedback while dragging; compost → golden; jar → firefly; cave return-as-other-species; six finds a day, sleep, pet; real-day growth; strip replay + Book page; localStorage; synth sound and juice; idle wander; deployed to Pages; green on `iPhone 15`. **Nothing else** — no second goblin, no night palette, no manifest, no About page beyond a footer line. Success: the operator plays two real days and reports fun unprompted.

---

## 11 · Work packages (M1)

P0 runs first, after the bake-off names the engine. P1–P4 run in parallel on disjoint files. Acceptance is a command.

### P0 — Scaffold (one agent)
**Owns:** `package.json`, `vite.config.js`, `index.html`, `public/`, `src/main.js`, `src/core/events.js`, `src/core/rng.js`, `src/art/registry.js` (texture keys), `src/audio/registry.js` (cue names), `src/game/testhook.js`, `src/game/placeholders.js` (coloured rects for every key, no-op cues), `scripts/deploy.sh`, `test/core/purity.test.js`, `test/e2e/boot.spec.js`, `docs/INTERFACES.md`, `docs/engine-notes/` (vendored engine docs/skills).
**Frozen contracts:**
- `EVENT`: `WARREN_BORN{seed}` · `VISIT{t}` · `WAKE{}` · `FIND_OFFERED{}` · `FIND_DROPPED{target:'tile'|'compost'|'cave', tile?:0..15}` · `PET{}` · `TOGGLE_SOUND{}`. Ledger `{v:'GW2', seed, events}`.
- `State`: `{v, seed, day, energy:0..6, asleep, mood, offered: Find|null, ground:{w:4,h:4,terrain:('soil'|'rock'|'pond')[16], tiles:(Plant|null)[16]}, compost:0..5, jar:0..3, fireflies, cave:[{species, day}], lastReaction:'hop'|'bighop'|'shrug'|null, sound}`; `Find = {id, species:'mosscap'|'glowcap'|'reedling'|'bug'|'golden'}`; `Plant = {species, plantedDay, sleeping, stage:0..3, wilted}`.
- `TEXTURE_KEYS`, `SFX_CUES` (§9); `window.__gw` (§8) when `?test=1`.
**Accept:** `npm run build`; `npx vitest run` (purity) green; `npx playwright test boot` green on `iPhone 15`: canvas, no scroll, zero errors, `__gw.ready`.

### P1 — Core logic
**Owns:** `src/core/state.js finds.js growth.js ledger.js book.js persist.js`, `test/core/*.test.js` (not purity).
**Rules:** `apply` never mutates input · terrain from seed (10/3/3) · legal = not rock, not occupied; illegal drop = no-op · outcomes: mosscap sprouts on soil, wilts on pond; glowcap sleeps until a `VISIT` on a later day, wilts on pond; reedling thrives on pond, wilts on soil; bug → jar+1 (3 → firefly+1, jar 0); golden = majority neighbour species, mosscap if none, never wilts · reactions: glow species → `bighop`, reedling in row 3 → `shrug`, else `hop` · new day: stage+1 (max 3), sleepers wake, wilts → compost+1 and tile cleared, recipes fire on adjacent pairs (the non-glow tile transforms) · compost 5 → next find golden, compost 0 · cave: an entry ≥2 days old is offered next as a different species · energy 6/day; `FIND_OFFERED` at 0 = no-op; sleep with a find offered → find to cave · `book(ledger)` lists discovered recipes and per-species reactions · loader `null` on malformed input.
**Accept:** `npx vitest run test/core` green, ≥35 assertions covering every rule, determinism (replay twice; apply-chain == replay), persist round-trip, and a seeded 5,000-event fuzz that never throws or leaves range.

### P2 — Art
**Owns:** `src/art/palette.js pixelmaps.js raster.js`, `test/core/art.test.js`.
**Accept:** vitest: every key in `TEXTURE_KEYS` has a map; maps rectangular, palette-only; `raster()` output has `w*h*4` bytes and ≥2 distinct colours; bug and seed maps differ in ≤4 pixels (the tell is motion, not looks).

### P3 — Audio + juice
**Owns:** `src/audio/sfx.js`, `src/game/juice.js`, `test/core/envelopes.test.js`, `test/e2e/juice.spec.js`.
**Interface:** `juice.pop(obj) hop(obj, height) wobble(obj) springBack(obj, x, y) burst(scene, x, y, n)`; each returns a promise resolving when done, using only the engine's tween API. 
**Accept:** vitest: envelopes 30–400 ms, gain ≤ 0.5, every cue in `SFX_CUES` defined. Playwright on `?scene=lab&test=1`: every cue and every helper runs without error; `pop` reaches scale ≥ 1 within 300 ms; `springBack` returns to origin ±1 px.

### P4 — Gameplay view
**Owns:** `src/game/scene.js`, `src/game/objects/*`, `src/game/storage.js`, `src/content/lines.json`, `test/e2e/loop.spec.js`.
**Inputs:** P0 contracts and placeholders only. Pointer drag with no lag; tile glow from `legal()` on hover; drop → `FIND_DROPPED`; spring-back on illegal; reactions from `lastReaction`; sleep/pet; swipe-down to cave; strip tap → replay by re-applying the ledger with tweens, second page = `book()`; idle wander toward the nearest glow plant; save after every dispatch; `visibilitychange` re-dispatches `VISIT`.
**Accept:** `npx playwright test loop` on `iPhone 15`: the §8 sequence; plus rock drop → `hover 'no'` + spring-back; compost drop → `compost 1`; six offers → `asleep`; pet → no state change but no error; sound toggle persists; zero errors; screenshots `day1-*.png`.

### P5 — Integration (one agent, last)
Merge P1–P4 onto P0; delete placeholders; `npm test` green on `iPhone 15` and `iPhone SE (3rd gen)`; simulate day 2 by dispatching `VISIT{t+86400000}` through `__gw` and assert a sleeper woke, a recipe fired, a wilt composted; fix seams only, no features; run `scripts/deploy.sh`; write `RECEIPT_M1.md` (commit, live URL, screenshots, harness numbers). Done when the operator's Safari shows the ground and they have played two real days.
