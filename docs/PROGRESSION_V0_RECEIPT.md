# Progression Rebuild V0 — The Crib (Rungs 1–3) · Implementation Receipt

<!-- authority=false · claim=NO_CLAIM · non-sovereign · Garden UX layering only.
     No kernel/reducer/ledger/guard edit. No admission, canon, or state claim.
     2026-07-14. Not deployed. -->

Answers the operator brief *"GO BUILD GOBLIN WARREN PROGRESSION V0"* and its
steer *"build only Levels 1–3 first."* Turns the opening from a Level-12 dump
into a staged bond with one goblin. **Not deployed** (no authorization given).

## What shipped

The v1.33 Prologue was a ~30s one-session flourish that **dumped the whole
Warren** at its end. This replaces it with a multi-session bonding arc that
reveals nothing above one goblin until a relationship is earned:

| Rung | Beat | What the player does | Reward | Advances when |
|---|---|---|---|---|
| **1 NOTICE** | dusk, Lulu asleep under the tree, one pulsing cue, zero menus | taps Lulu | she wakes, notices *you*; a seed appears | she wakes |
| **2 GESTURE** | offer the seed | taps the seed | it blooms into a **persistent** flower; a mystery stirs behind the tree; *"come back tomorrow"* | seed offered |
| **3 MEMORY** | a later visit | returns | she remembers: *"I kept our flower. It waited."* → the wider Warren opens (graduate) | on return |

Established players (every existing save) are grandfathered straight to the
full Warren — **exactly today's boot, zero behaviour change.**

## Progression state schema (`S.progress`)

- `rung` — 1..12 reveal curriculum. Fresh crib = 1; graduated / established = 12.
- `onboarding` — `{ woke, offered, mystery, seedObjId, bloomObjId, visits }`
  (the crib's completed-moments memory; drives re-entry after a reload).
- `S.flags.prologueSeen` — the single source of truth for "graduated". `false`
  only for an un-graduated crib; grandfathered `true` for every prior save.

## Visibility map (the membrane)

One coherent layer, not per-element hacks. `#app` carries:
- `.prologue-active` (existing) → hides every un-revealed `.goblin`/`.zone`/`.wobject` and the top-bar chips.
- `.crib-active` (new) → additionally hides `#topbar`, `#bottombar`, `#temple`,
  `.serpent`, `.collectible`, and deepens the dusk vignette — a true zero-menu Rung 1.

Only `.prologue-shown` elements appear: at Rung 1 that's Lulu + the tree; Rung 2
adds the seed→bloom and the mystery. Graduation removes both classes and reveals
everything (crew, zones, chips, bars) in one gentle pass, then hands off to the
ordinary ambient loop. Ambient **goblin ticks** are deferred to graduation too —
during the crib Lulu never references a system she hasn't introduced.

## Returning-player compatibility

Grandfather runs on every boot (load belt + mergeDefaults), keyed on
`prologueSeen`. A whole `validAndComplete` save (which skips `mergeDefaults`)
is covered by the load-belt block, so no existing player is ever demoted to the
crib or loses data. Verified by gate G5.

## Behavioral tests — `progression-gates.js` (10/10, Playwright)

- G1 Rung-1 one goblin, zero menus (topbar+bottombar hidden), step 1 / rung 1.
- G2 notice wakes Lulu, seed appears, rung 2.
- G3 gesture blooms a **persistent** 🌸 and **the wider Warren stays hidden** (no one-session dump).
- G3b the mystery promise appears; session still un-graduated.
- G4 a return remembers the flower (rung 3); G4b graduation opens the full Warren, bars back, bloom persists.
- G5 established player → full Warren, no crib (grandfather).
- G6 membrane: the whole crib mutates no ZOL / no territory.
- G7 skip never traps. · G8 no page errors.

Static gates `verify.js` 13/13 (no-CDN / local-path invariants intact).
`prologue-gates.js` retired (encoded the old one-session dump); `magic-gates.js`
and `council-gates.js` now graduate the crib first (post-onboarding systems).

## Before / after (`docs/shots/`)

`before-full-warren.png` (today's Level-12 opening) · `after-rung1-crib.png`
(one goblin, one tree, zero menus) · `after-rung2-bloom.png` (the first bloom +
the mystery behind the tree).

## Known limitations (honest blockers, not gambiarra)

1. **Rungs 4–11 are not staged yet.** After the Rung-3 return, graduation still
   reveals the full Warren in one pass — the later rungs (need, co-creation,
   secret, meet Zaz, dialogue, quest, zones) that split that reveal are the
   next slices. This slice proves Rungs 1–3 feel alive first, per the steer.
2. **Prologue voice** for the crib lines still uses the base Lulu voice /
   TTS fallback (the 3 dedicated Prologue mp3s remain a laptop download).
3. **Background** is the existing rich L1 art dimmed by the dusk vignette, not a
   bespoke "quiet dusk" plate — graceful, but a future art pass could go quieter.
4. **Gesture quality** (quick-tap vs slow-hold changing Lulu's reaction) is not
   yet implemented — the offer is a single tap for reliability.

## Refinement pass — "make Lulu a being" (after the 4/10 witness) — 2026-07-14

Operator witnessed the first crib on iPhone/Safari and scored it **4/10** — not
alive. Diagnosis (operator-confirmed, all four): background too busy · Lulu too
small/far · doesn't react to me · voice weak. Refined against exactly those,
membrane and gates unchanged:

- **Its own quiet-dusk world.** The crib no longer dims the Level-12 art — it
  paints a bespoke backdrop (low moon, deep-violet night) and shows the tree as
  one soft silhouette. `#app.crib-active #world` overrides the map art.
- **Lulu is a being you meet.** Centred and enlarged (1.85×); she **sleeps**
  (closed eyes, slow breath, z-z-z) until your touch **stirs then wakes** her
  (a warm flash), so the "magic moment" is staged, not instant.
- **She reads how you act.** First touch stirs her (recognition beat before the
  wake); the seed reads **quick-tap vs held-offer** and she reacts differently
  ("you surprised me" vs "so gently, I felt that").
- **Her real voice.** Crib beats now play the **bundled Luna mp3s**
  (`LULU_VOICE_URLS` — greet/relic/matcha/goodnight, all local, real hypnotic
  voice) instead of robotic TTS; `showBubble(..., noSpeak)` stops the double
  voice; a Tibetan-bowl note sings on the bloom. TTS remains the final fallback.

Still `progression-gates.js` 10/10 · `verify.js` 13/13 · membrane untouched.
Shots: `docs/shots/v2-rung1-sleeping.png`, `v2-rung1-awake.png`,
`v2-rung2-seed.png`, `v2-rung2-bloom.png`.

## Preview witness deploy (NOT production) — 2026-07-14

Operator-authorized *preview-only* deploy for a real iPhone/Safari witness pass.
A **new, separate game** — production `forest-frost-277` (game_id d95bb0da…) is
untouched, and `publish_game` was **not** called.

- PREVIEW_URL: https://honest-leaf-372.higgsfield.gg/
- PREVIEW_GAME_ID: bae2b538-52d6-4cc1-879d-f1af1fdec275 · slug honest-leaf-372 · mode rules
- SOURCE: raw @ `88e8f0d` `deploy/goblin-warren-crib-preview.zip` · sha256 `e000cc1e16e38a06f29cbc6600ff27e39f17cd397cbcb6cb071910a705586a4c` (38,873,667 bytes)
- CREDITS: 0 (thumbnail/favicon reused from existing key-art; deploy_game logs no charge).
- Egress from this seat blocks `*.higgsfield.gg` (403) — **serving is UNWITNESSED here.**
  The witness is the operator's thumb: does Lulu feel alive in the first 30s?
- Path note: the media-upload route (`upload.higgsfield.ai`) is org-egress-blocked
  from this seat; deploy used the proven github-raw source (server-side fetch).

## Membrane law

No reducer/kernel/ledger/guard edit. No ZOL spend, no admission, no territory
mutation anywhere in the crib (gate G6). Garden change ⊬ Kernel truth.
