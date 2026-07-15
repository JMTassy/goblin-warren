# COHERENCE_AUDIT.md

A checklist to run against any Warren zone — used here on `first-fire-v2.html`,
reusable for every future scene. Each row: what to check, how to check it
mechanically (not "does it look right"), and this pass's result.

## Checklist

| # | Check | How to verify | v1 (`warren-intro-firemaking.html`) | v2 (`first-fire-v2.html`) |
|---|---|---|---|---|
| 1 | **Palette from tokens?** | `grep -oE '#[0-9a-fA-F]{6}' file.html` outside a `tokens.css` link — any hit is a violation. | ~40 hardcoded hex literals across `<style>` and `<script>` (two independent palettes). | Zero hex literals in the file. All color is `var(--token)` (DOM) or `PAL.x` read once via `getComputedStyle` from `tokens.css` (canvas). |
| 2 | **Type on scale?** | Every `font-size` resolves to one of `--step-0..4`. No `clamp(..vw..)`, no one-off px value. | Title/kicker/lede use `clamp(Npx, Mvw, Kpx)` — a scale disconnected from the in-scene `10–14px` HUD text. | Title=`--step-4`(34px), kicker=`--step-3`(20px), lede=`--step-1`(13px) — same 5-step scale the in-scene hint/say text uses. |
| 3 | **Pixel-grid aligned?** | Every `padding`/`border`/`gap`/shadow-offset is an integer multiple of `--px-base`(5px). | Ad hoc values: `14px`, `22px`, `12px 22px`, `4px 4px 0 #000`, `2px` — not tied to any base unit. | All spacing/borders use `var(--px-1..8)`; both shadow idioms are `var(--shadow-1)`/`var(--shadow-2)`, both `--px-*` multiples. |
| 4 | **One resolution / one world?** | Does the title screen read as the same rendered space as gameplay, or as a webpage laid over a game? | `#start` used a blurred `radial-gradient` vignette + AA'd hero type at up to 64px — a distinct "landing page" layer. | `#start` background is a single flat `--scrim` wash; the cold, dim canvas (hearth, floor, Lulu) is visible and legible underneath at all times — title screen *is* the cold-open of the same scene. |
| 5 | **Lulu matches SPRITE_SPEC?** | 10×10px bbox, fixed palette tokens, 5 named poses present and reachable. | Sprite existed but palette was inline hex; only shiver/warm-hands/(implicit content) poses; no "curious" beat. | Palette is 100% `PAL.*` tokens; `idle/shiver/curious/warm-hands/content` all implemented and reachable via existing engine signals (`firstSpark`, `S.shiver`, `S.luluWarm`, `S.mark`) — no new mechanic added. |
| 6 | **Engine untouched?** | Diff the reducer-shaped logic (heat/stage thresholds, `ignite()` timing, `window.__warren` hooks, `source:"curated"` comment, audio, reduced-motion) between v1 and v2. | — | `diff` shows only rename (`mix`→`mixHex`, new `rgbaHex` helper) and color-source swap (hex literal → `PAL.x`) inside draw calls, plus the additive `noticeSpark()`/`curious` cosmetic pose. All thresholds, timings, hook signatures, and provenance comments are byte-identical. Verified: `node verify-v2.mjs` → 0 page errors, 0 console errors; heat/stage/lit/grade values at mid and lit checkpoints match the same trajectory v1 produced. |

## Result of this pass

5/6 fully closed against the built-in design system; #6 (engine parity) spot-
checked via diff + a scripted Playwright run (`verify-v2.mjs`) rather than a
byte-for-byte hash, since two intentional cosmetic lines changed (the pose
helper and the palette-read swap) inside `draw()`/`drawLulu()`, which are
render-only functions, not the reducer-equivalent state machine (`update()`'s
heat/stage/idle math is untouched).

## What locking this to the REAL crib still needs

This system was built to a *description* of the incoherence ("crisp DOM
chrome... floating over a low-res pixel canvas"), not to the actual Mac crib
screenshot. Before OPUS treats this as final, the operator needs to supply:

1. **A screenshot (or screen recording) of the actual crib** — the real
   before-state on their Mac, not the scratchpad's `warren-intro-firemaking.html`
   reconstruction. If the crib differs from what's in this scratchpad (different
   fonts loaded, different DPI/zoom, a different HUD layout), the token values
   here are a best guess, not a lock.
2. **The crib's actual computed CSS** (`getComputedStyle` dump or the raw
   `<style>` block) if it's a different file/build than what's in this
   scratchpad — so `--cold`/`--ember`/`--gold`/etc. can be set to the exact
   hex values in play there, not re-derived from this reconstruction.
3. **Viewport / DPR the operator actually plays at** — this pass verified at
   900×560 @1x headless; the Mac crib may run at a different logical
   resolution or Retina DPR, which changes how forgiving the `--px-base:5px`
   grid is against real font hinting.
4. **Confirmation of which file is canonical** — CLAUDE.md's genealogy note
   says `goblin-conquest.html` (home dir) is a diverged newer draft with "its
   own harness," separate from this repo's V0. If the "crib" the operator
   means is that file (or something under `HELEN_OBSIDIAN_OS/`), the fire
   intro shown here may not be the same artifact at all — worth a one-line
   confirmation before further design work builds on the wrong base file.
5. **Any existing brand/typeface constraint** — this pass kept `Courier New`
   monospace (matches v1). If the operator's crib uses a different pixel font
   or a bitmap font asset, `--font-mono` in `tokens.css` is the one line to
   change, but it should be confirmed rather than assumed.
