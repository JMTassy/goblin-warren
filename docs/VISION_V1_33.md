# VISION v1.33 — "The Petit Prince Prologue" (CEO: Fable · Executor: Sonnet 5)

<!-- authority=false · NO_CLAIM. The most important slice: whether a stranger
     falls in love in the first 30 seconds. The magic is apprivoiser (taming):
     one goblin, one object, noticed slowly, then the Warren blooms. Restraint
     is the wow. First-run only; returning players keep today's full map. -->

## 1. The flag

`S.flags.prologueSeen` (default false; add to makeState + mergeDefaults
grandfather = treat any existing save as `true` so only brand-new players get
the Prologue). `WARREN_DEBUG.setPrologueSeen(bool)` + `replayPrologue()` for
testing and for a "watch it again" affordance later.

## 2. The choreography (first run only — a fresh save with prologueSeen=false)

The map starts NEARLY EMPTY at dusk and blooms as the player tames it. Reuse
existing render/spawn functions; the Prologue only controls VISIBILITY and
ORDER. Add a body/#app class `prologue-active` that CSS uses to dim the scene
(a dusk vignette) and hide not-yet-revealed elements.

Beats (each gated by the prior ACTION, with a gentle fallback timer so it
never stalls):
1. **0s** — only Lulu + the Akashic Tree visible. Everything else hidden
   (other goblins, zones except tree, topbar chips riddle/level/wallet,
   objects, signals). Vignette dim. `luluPrologueLine("greet")` (voice below)
   + her bubble.
2. **First tap on Lulu** (or 8s fallback) — she reacts (a boop-style wobble +
   delighted mood); `luluPrologueLine("boop")`. This is the taming beat.
3. **After the boop** — ONE object blooms near Lulu: a single 🌰 seed "A Seed,
   Yours" (addObject in garden); `luluPrologueLine("seed")`; a soft
   `Sound.bloom()`.
4. **Tap the seed (or 6s)** — the SECOND goblin fades in ("Lulu brought a
   friend"), then the rest of the crew one by one (~1.2s apart), gently.
5. **Then** — the zones fade in (tree already there), then the topbar chips
   (riddle → level → wallet) appear one at a time, then the Moth is scheduled
   for its first riddle. Remove `prologue-active`, lift the vignette.
6. **Done** — set `S.flags.prologueSeen = true`, saveState, hand off to the
   normal ambient loop (the existing bootScriptedArc first-proposal etc.
   proceeds from here — do NOT double-fire the greeting).
Total ~90–120s, fully skippable: a "tap to skip →" chip in a corner jumps to
the end state (reveal all, set flag). Never traps.

## 3. Returning players / tests

If `prologueSeen === true` at boot: skip entirely, render the full map exactly
as today (zero behavior change). All existing systems untouched.

## 4. Voice (Fable fills URLs after generation; TTS fallback always)

`var LULU_PROLOGUE_URLS = { greet:"", boop:"", seed:"" };` +
`LULU_PROLOGUE_TEXT` (the three lines) + `luluPrologueLine(key)` mirroring
`luluVoiceLine` (shared Audio, mute-aware, `onerror`→`luluSpeak(text)`).
NOTE: these are NEW files; keep them as full CDN URLs for now (cloud) — the
dual-source pass localizes them later. TTS fallback covers offline until then.
Lines:
- greet: "Oh... it is you... you came... I did not want to hope... sit with me a moment... tonight the Warren is very small... just you... and me... and the Tree that remembers."
- boop:  "There... you noticed me... that is the whole magic... to be noticed... is to become real... now... shall I call a friend? Slowly. We do everything slowly here."
- seed:  "Here. One seed. It is yours now. In this garden... what you tend... becomes real. Not because you wished it... because you tended it. Begin."

## 5. CSS (style.css) — the wow is restraint

`#app.prologue-active`: a radial dusk vignette over #world (dim to ~0.4),
hidden `.goblin:not(.prologue-shown)`, hidden chips, `#currency` hidden.
`.prologue-reveal` keyframe: a slow 1.2s fade+rise (opacity 0→1, translateY
8px→0, a soft glow settle) applied as each element is revealed. A small
`#prologue-skip` chip (bottom corner, subtle). Everything gentle — no snap,
no strobe. Le Petit Prince, not a fireworks show.

## 6. Gate — new file `prologue-gates.js` (standalone Playwright, like the old behavioral gates)

Launch chromium (/opt/pw-browsers/chromium-1194/chrome-linux/chrome; module
/opt/node22/lib/node_modules/playwright). G1: fresh save (wipe localStorage,
reload) → `prologue-active` present, only Lulu+Tree visible, other goblins
hidden, chips hidden. G2: drive the reveal via WARREN_DEBUG hooks
(tapLuluPrologue()/advancePrologue()) → seed object appears, crew reveals,
chips appear, `prologue-active` removed, `prologueSeen===true`, persists across
reload. G3: with prologueSeen=true on boot → NO prologue-active, all goblins +
chips visible immediately (returning-player path). G4 (membrane): the whole
Prologue writes no ZOL and no admission — snapshot zolBalance/territories
before+after = unchanged (it's pure onboarding theater). Exit 1 on any fail.

## Voice URLs (generated — Luna/ElevenLabs, ~15s each; Fable fills LULU_PROLOGUE_URLS)
Prefix: `https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/`
- greet: `hf_20260713_235654_b09373bb-e500-41c3-b2f5-e36ca89fc222.mp3`
- boop:  `hf_20260713_235657_fce96b88-aa42-40cc-87e1-d256792f5bf6.mp3`
- seed:  `hf_20260713_235703_f7cbbae9-ed14-455d-9ba5-53cdee10034f.mp3`

*Start with one. Tame it slowly. Let the rest be earned.* — Fable
