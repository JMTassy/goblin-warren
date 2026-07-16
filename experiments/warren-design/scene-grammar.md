# scene-grammar.md — how a Warren "zone" composes

A zone (the fire intro is the first instance) is built from exactly four
layers, always in this order, always reading color/size/spacing from
`tokens.css` and nothing else. Layer identity is a discipline, not a literal
DOM/canvas split — three of the four happen to live inside the canvas buffer
and one lives in the DOM, but what makes them "layers" is draw order and
token discipline, not which technology renders them.

```
 ┌───────────────────────────────────────────┐
 │  z-hud   DOM: say-line, hint, meter,       │  <- var(--...) only
 │          buttons, title screen             │
 ├───────────────────────────────────────────┤
 │  z-char  canvas: character(s) — Bram       │  <- palette read from
 │                                             │     tokens.css at boot
 ├───────────────────────────────────────────┤
 │  z-glyph canvas: glyph-objects — hearth     │
 │          stones, flints, particles, mark   │
 ├───────────────────────────────────────────┤
 │  z-bg    canvas: background wash —         │
 │          ceiling/sky + floor gradient      │
 └───────────────────────────────────────────┘
```

## 1. Background layer (`--z-bg`)

Drawn first, every frame, full-bleed. A vertical gradient interpolated by the
scene's single `grade` (0=cold, 1=warm) between two token pairs
(`--cold`/`--ceiling-hi` for the top stop, `--cold-2`/`--ember-2` for the
bottom stop), plus a floor fill (`--floor-cold`/`--floor-warm`) and floor
speckle (`--speck-cold`/`--speck-warm`). No other color may appear here.

## 2. Glyph-object layer (`--z-glyph`)

Everything that is scenery-as-object rather than a living character: the
hearth-stone ring (`--stone`/`--stone-warm` + highlight edge), the two rubbed
flints (`--flint-cold`/`--flint-warm`), the hearth glow pool (radial gradient
built from `--gold`/`--ember` at runtime alpha, never a new hue), all
particles (`--gold`/`--ember`/`--amber`/`--coal` for fire & spark,
`--smoke`/`--smoke-2` for smoke, `--dust` for ambient motes), and the
post-ignite ember-mark (`--ember`).

## 3. Character layer (`--z-char`)

Bram, drawn per `SPRITE_SPEC.md`: fixed 10×10 px bounding box, fixed palette
tokens, five named poses (idle/shiver/curious/warm-hands/content) selected by
existing engine signals. Any future character added to a zone must ship its
own `SPRITE_SPEC.md`-shaped contract before it earns a place in this layer.

## 4. HUD layer (`--z-hud`, DOM)

Say-line, hint, warmth meter, buttons (start/replay), and the title screen
all live here. Rules that keep this layer from re-diverging into a second
visual language:

- **Same type scale as the scene, always.** Title, kicker and lede use the
  identical `--step-*` tokens as in-scene hint/say text — there is no
  separate "landing page hero" scale. (This was the single biggest source of
  incoherence in v1: `clamp(30px,9vw,64px)` title type next to `10px` in-scene
  hint type is two different sizes-of-world colliding in one frame.)
- **Same border/shadow idiom everywhere.** Every bordered element — button,
  meter track, replay — uses `--bw` + `--shadow-1`/`--shadow-2`. No
  `border-radius`, no blur, ever.
- **No gradients or blur on the HUD chrome itself.** Blurred radial vignettes
  (v1's `#start` backdrop) read as "web overlay," not "part of the pixel
  world." The title screen uses at most a single flat `--scrim` wash so the
  cold canvas underneath stays visible and legible — same trick the game
  itself uses (dim room, no fog-of-war blur).
- **Pixel-grid snapped.** Every HUD element's padding, border width, gap and
  shadow offset is a `--px-*` multiple, so DOM elements land on the same
  lattice the canvas is quantized to, instead of floating at arbitrary
  fractional CSS-px offsets relative to it.
- **HUD never draws game state directly.** It only reflects state the canvas
  layers already compute (`grade`, `heat`, `stage`, pose) — it has no
  independent palette or independent thresholds. If the HUD needs a new
  color, it is a new named token in `tokens.css`, not a literal hex typed
  into a `<style>` block.

## The one non-negotiable rule

**All four layers draw only from `tokens.css`.** Canvas layers read it once at
boot via `getComputedStyle(document.documentElement)` into a JS palette
object; DOM reads it natively via `var(--token)`. A hex literal appearing
anywhere outside `tokens.css` is a scene-grammar violation — see
`COHERENCE_AUDIT.md` for how to check this mechanically.
