# VOX_SCENE_GRAMMAR.md — how any Warren zone composes under WARREN VOX

<!-- WARREN VOX · authority=false · claim=NO_CLAIM · non-sovereign · cost:0 · render-layer only -->

WARREN VOX is a **pure render-layer design system**. It changes only how a
verified Warren zone *looks and feels*; it never changes what the zone *is*.
This document is the VOX refinement of `warren-design/scene-grammar.md` — it
keeps that file's four-layer law verbatim and adds only the composition rules
VOX needs (a trace layer, an atmosphere pass, a provenance band) plus the
explicit read-only-projection contract.

If this file and `warren-design/scene-grammar.md` ever disagree, the base
file wins on the four core layers. VOX is a superset, never a contradiction.

## The seam (the one architectural fact everything else depends on)

```
  GAME STATE / REDUCER            ← the only place rules, progression,
        │  (makeState, applyEvent,   inventory, receipts, agent authority,
        │   admitProposal, ledger)   witness gates, ledger state live
        ▼
  READ-ONLY PROJECTION            ← a pure function proj(S) that copies out
        │  proj(S) → view-model     ONLY what VOX needs to draw. It never
        │                           writes a field of S.
        ▼
  WARREN VOX RENDER LAYER         ← this document. Composition, lighting,
        │  (bg/glyph/trace/char/     type, HUD, motion, particles, camera,
        │   atmos/hud/prov layers)   atmosphere. All presentation.
        ▼
  PLAYER EXPERIENCE
```

The arrow is one-directional. Player input still travels back up through the
**existing** dispatch path (`applyEvent` / the reducer) — VOX adds no new way
for input to reach state. A VOX component receives the projection and emits
DOM/canvas; if it needs to cause a game effect it calls the *same* dispatch the
plain UI already uses. VOX owns pixels, not verbs.

## The read-only-projection rule (stated explicitly)

> Every VOX component is a **pure function of a read-only projection of game
> state**. It may read `proj(S)`; it may never mutate `S`, never import a
> reducer, never open a persistence surface, and never make a network or paid
> call. Two calls with an equal projection must produce an equal rendering.

Concretely, mirroring the live reference implementations:

- `first-fire-v2.html` reads `tokens.css` once at boot into a JS palette and
  draws every frame from engine signals (`grade`, `heat`, `stage`, pose) — it
  never writes engine state from the renderer.
- The vertical slice keeps the one law in its header: *"One state S =
  makeSlice(seed). EVERY interaction routes through applyEvent. This file never
  writes S's fields."* VOX generalizes that law to every zone.

A projection is a plain object — no functions, no live references into `S`.
Building it is the seam made literal:

```js
// proj(S): copy out ONLY what VOX draws. No methods, no aliasing S's arrays.
function project(S) {
  return {
    grade,                       // 0..1 cold->warm (or derived from fire.progress)
    phase: S.phase, level: S.level,
    beat: SliceCore.beatPhase(S),        // {m, onBeat} — read-only view already
    fire: { state, progress, stones },
    meters: { spark, song, fatigue, caught, mistakes },
    companion: SliceCore.proposeCompanionLine(S),  // {speech, emotion, provenance}
    hint: nearestHint,                    // {guess, confidence, provenance}
    traces: S.traces ? S.traces.map(t => ({ ...t })) : [],
    ledgerHead: S.ledger.length ? S.ledger[S.ledger.length-1].n : -1,
  };
}
```

Everything below composes from that object and `tokens.css` / `VOX_TOKENS.css`
— nothing else.

## The layer stack under VOX

The base grammar's four layers are unchanged. VOX interleaves three optional
sub-bands (z-values from `VOX_TOKENS.css`, chosen to slot *between* the named
layers, never to collide with them).

```
 ┌─────────────────────────────────────────────┐
 │ z-prov  (35)  DOM: provenance toasts,         │  ← always labels a source
 │               admission receipts (read-only)  │
 ├─────────────────────────────────────────────┤
 │ z-hud   (30)  DOM: say/hint bubbles, meters,  │  ← var(--token) only,
 │               buttons, gates, ledger panel    │     reflects state only
 ├─────────────────────────────────────────────┤
 │ z-atmos (25)  canvas: vignette / heat-haze /  │  ← alpha wash from `grade`,
 │               ambient dust — atmosphere pass  │     never a new hue
 ├─────────────────────────────────────────────┤
 │ z-char  (20)  canvas: character(s) — Bram     │  ← SPRITE_SPEC.md contract
 ├─────────────────────────────────────────────┤
 │ z-trace (15)  canvas: TRACE glyphs on objects │  ← flavor token × intensity
 ├─────────────────────────────────────────────┤
 │ z-glyph (10)  canvas: hearth stones, flints,  │
 │               particles, ember-mark           │
 ├─────────────────────────────────────────────┤
 │ z-bg    (0)   canvas: background wash —        │
 │               ceiling/sky + floor gradient    │
 └─────────────────────────────────────────────┘
```

### 0 · Background layer (`--z-bg`) — unchanged

A vertical gradient interpolated by the single `grade` between the token pairs
named in the base grammar (`--cold`/`--ceiling-hi`, `--cold-2`/`--ember-2`),
plus floor fill and floor speckle. No color outside the ramp. VOX adds nothing
here except that the gradient stops MAY use the `--vox-*-oklch` mirrors behind
`@supports` for a richer bloom on wide-gamut screens — same color, sRGB
fallback guaranteed.

### 1 · Glyph-object layer (`--z-glyph`) — unchanged

Scenery-as-object: hearth-stone ring, flints, hearth glow pool (radial
`--gold`/`--ember` at runtime alpha), all particles, the ember-mark. Exactly
the base grammar's rule.

### 2 · Trace layer (`--vox-z-trace`) — VOX addition

The concrete render of `TRACE_SYSTEM.md`. A trace is a *visible environmental
signal*, not a hidden flag, so it earns a layer of its own, drawn on top of the
object it marks and beneath the character who reads it.

- **Hue = flavor.** The fixed enum maps to ramp tokens via `--vox-trace-*`
  (`warning`→`--ember`, `novel`→`--gold`, `relational`→`--glow`,
  `resource`→`--moss-warm`, `memory`→`--bone`). A trace never introduces a hue
  outside the ramp.
- **Alpha = intensity.** weak/medium/strong map to `--vox-trace-weak/medium/
  strong`. Intensity is read from the projection (`trace.intensity` 0..1); VOX
  quantizes it to the three rungs. VOX never *computes* decay — decay is engine
  state; VOX only shows the current value.
- **Shape = a pixel diamond/pip on the object anchor**, drawn at the buffer's
  native resolution like every other glyph (nearest-neighbor, `PIX` lattice).
- A trace the engine has not created is not drawn. VOX cannot invent a trace.

### 3 · Character layer (`--z-char`) — unchanged contract

Bram per `SPRITE_SPEC.md`: fixed 10×10 buffer box, fixed palette tokens, five
named poses selected by existing engine signals, warming on the *same* `grade`
as the room. Any new character (Lulu at Level 7, the specialization roster)
ships its own `SPRITE_SPEC.md`-shaped contract before it earns this layer. See
`VOX_CHARACTER_PRESENTATION.md`.

### 4 · Atmosphere pass (`--vox-z-atmos`) — VOX addition

The "alive at zero credits" band, derived from the Warren Codex's techniques
(WebGL2 FBM, scroll-driven CSS, `@property` grade) but held to the ramp:

- A **vignette** (radial alpha darkening at the frame edge) whose strength eases
  down as `grade` rises — the cave opens up as it warms.
- Optional **heat-haze** shimmer above the hearth, amplitude ∝ `grade`,
  disabled under reduced motion.
- Ambient **dust motes** (already in `first-fire-v2`), lifted here as a named
  pass so every zone gets the same living air.

This pass is **alpha only** — it darkens/warms existing pixels, it never paints
a new hue. It is decorative and MUST degrade to nothing without changing
legibility (a headless or reduced-motion run simply skips it).

### 5 · HUD layer (`--z-hud`, DOM) — unchanged law, restated

Say-line, hint, meters, buttons, gates, ledger. The base grammar's five HUD
rules hold exactly and are the heart of VOX:

- **Same type scale as the scene, always** (`--step-*`; VOX's `--vox-step-5/6`
  are up-scale-only additions for VOX title cards, still fixed px on the grid).
- **Same border/shadow idiom everywhere** (`--bw` + `--shadow-*`/`--vox-shadow-*`;
  no `border-radius`, no blur, ever).
- **No gradients or blur on HUD chrome itself**; at most a flat `--scrim`/
  `--vox-scrim-*` wash so the cold canvas stays legible as the same world.
- **Pixel-grid snapped** — every pad/border/gap/shadow offset is a `--px-*`
  multiple.
- **HUD never draws game state directly.** It reflects state the canvas layers
  already compute. A new HUD color is a new *named token*, never a literal hex.

### 6 · Provenance band (`--vox-z-prov`, DOM) — VOX addition

The topmost band exists to carry the one thing VOX must never hide: **where a
rendered claim came from.** Every companion line, hum, and admission receipt
renders with a visible provenance label (`curated` / `model` / `memory_derived`
/ `signal — not proof`). Detail in `VOX_CHARACTER_PRESENTATION.md`. This band is
read-only output; it has no input affordance.

## The one non-negotiable rule (inherited, extended)

**All layers draw only from `tokens.css` / `VOX_TOKENS.css`.** Canvas layers read
the tokens once at boot into a JS palette; DOM reads them natively via
`var(--token)`. A hex literal anywhere outside the token files is a grammar
violation. VOX adds exactly one clause: **the atmosphere and trace layers may
scale alpha but may never introduce a hue that is not a ramp token.**

## What VOX MAY touch (presentation only)

Composition · lighting · typography (within the fixed scale/face) · HUD layout
and styling · motion · particles · sprite *presentation* (pose selection,
rim-light, framing — not sprite geometry rules) · camera / framing · scene
transitions · atmosphere (vignette, haze, dust, grade timing).

## What VOX MAY NOT touch (ever)

Rules · progression · inventory · receipts · agent authority · witness gates ·
ledger state · the admission verdict · economics · win condition · trace decay
math · quiz banks · the reducer seam itself. VOX proposes pixels; the engine
decides consequence. Nothing a VOX layer renders — not a trace glow, not a
companion line, not a provenance toast — may mutate progression, save, or reward.
This is the same absolute boundary as `npc-preview/README.md` and
`admitProposal()` in the V0 reducer: **the deterministic engine still gates
every consequence.**
