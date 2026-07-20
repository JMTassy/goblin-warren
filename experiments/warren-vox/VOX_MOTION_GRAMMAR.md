# VOX_MOTION_GRAMMAR.md — the WARREN VOX motion vocabulary

<!-- WARREN VOX · authority=false · claim=NO_CLAIM · non-sovereign · cost:0 · render-layer only -->

Motion in WARREN VOX is **projection, not logic**. Every animation is a pure
function of game/beat state and the frame clock; no animation *event* ever
feeds back into the reducer, and no game consequence waits on an animation
finishing. This is the motion form of the read-only-projection rule: if you
paused the renderer mid-tween and read the state, the game would be in exactly
the state it would have been in with motion off.

All durations, easings and amplitudes come from `VOX_TOKENS.css` (which lifted
them from the vertical slice's real numbers). Nothing here invents a timing the
reference implementations don't already use — it names and generalizes them.

## The core principle: derivable, not event-driven

Two ways to animate a beat pulse:

- ❌ **Event-driven** (forbidden): on a "beat" event, start a keyframe; the
  animation owns a timeline the game doesn't know about; a missed/dropped event
  desyncs visuals from truth.
- ✅ **Projection** (VOX law): every frame, compute the visual straight from
  state. The slice's pulse ring does exactly this:

  ```js
  // slice index.html, updatePulseRing() — recomputed every frame, pure of state
  const n  = beatNearness();               // 0..1 from beatPhase(S), read-only
  const amp = REDUCE ? 0.12 : 0.30;        // == --vox-throb-amp(-calm)
  let sc = 1 + amp * n*n*n;                 // scale is a function of state, period
  ```

  There is no "beat animation" to get out of sync — the ring simply *is* the
  current beat nearness, drawn now. That is the whole grammar.

Consequence for VOX components: a motion helper takes `(projection, tNow)` and
returns a style/transform. It stores no animation state that isn't recoverable
from the projection. (A tiny amount of *view-only* easing memory — e.g. the
slice's `V.grade` low-pass toward its target — is allowed because it is a pure
render smoothing of a state-derived target, never a source of truth.)

## The vocabulary

### 1 · Pulse / throb — the heartbeat (from the L1 beat ring)

The signature VOX motion. A ring (or any element) scales toward the beat and
recolors on it.

- **Scale**: `1 + amp · nearness³`, `amp = var(--vox-throb-amp)` (0.30 full /
  0.12 calm). The cubic makes the swell tight to the beat instead of a lazy sine.
- **Color**: on-beat → `--ember` (or `--gold` on a hit), off-beat → `--dim`.
  The recolor is the part that survives reduced motion (see contract).
- **Duration token**: `--vox-dur-throb` (120ms) for any discrete throb kick.
- Source: slice `updatePulseRing()` / `beatNearness()`.

### 2 · Tactile press — input acknowledgement

Every actionable element confirms a press *physically*, matching the slice's
button rule (`button:active{transform:translate(2px,2px);box-shadow:none}`): the
element drops by 2px onto its own shadow, shadow collapses. On the drum, the tap
also flashes the skin toward `--gold` (`V.tapFlash`, decaying over
`--vox-dur-instant`). Press feedback is immediate and local — it never gates the
dispatch, which has already fired.

### 3 · Cold → warm grade — the atmospheric ramp

The one *slow* motion. A view-only low-pass eases the rendered grade toward its
state-derived target (`warmTarget` from `fire.progress` / level / phase), over
`--vox-dur-grade` with `--vox-ease-grade`. Everything colored by the ramp warms
in lockstep — background, glyphs, and Bram on the *same* scalar (SPRITE_SPEC.md:
"she never warms faster or slower than her surroundings"). The grade is the only
place VOX uses a smooth easing; the pixel world quantizes everything else.

### 4 · Free-lesson warm-flash vs. punishing red-flash — moral motion

VOX encodes the slice's teaching distinction *in the motion itself*:

| | Free lesson (first hazard of a class) | Punishing (repeat offense) |
|---|---|---|
| Flash color | `--glow` (`#flash.freeLesson`) | `--ember` (`#flash.bad`) |
| Sound | soft descending chime (`sndLessonChime`) | dull thud (`sndThud`) |
| Character | gentle head-shake ("we learn") | disappointed shake |
| Counter | visibly **unchanged** — no mistake booked | mistake increments |
| Duration | `--vox-dur-flash` in, ~1.6s hold, out | same envelope, red |

The rule: **the first time you touch a new hazard, the world teaches; after
that, it holds you.** Motion carries the difference so the lesson lands before
any text is read. VOX must never render a red punishing-flash for an event the
engine logged as a free lesson, or vice-versa — the flash *reads* the ledger
event kind (`FAUX_LESSON`/`EMBER_LESSON` vs `FAUX_CAUGHT`/`EMBER_CAUGHT`), it
does not decide it.

### 5 · Strain — bounded effort made visible

When sustained effort crosses the engine's fatigue/lock thresholds (L2 drum),
VOX escalates: a `--vox-dur-warn` `steps(2)` brightness blink on the fatigue
meter (`@keyframes pulseWarn`), a heat halo whose alpha ∝ `fatigue`, smoke
particles, and the lock banner. All are projections of `S.rhythm.fatigue` /
`S.rhythm.locked`; VOX never sets the lock — it shows it. When locked, the drum
skin scorches toward `--coal`. The message is somatic: *let the silence play.*

### 6 · Particle rules

Particles are glyph-layer, view-only, deterministic-jitter (mulberry32 seeded
from `h32(seed)`, never `Math.random`). VOX inherits the slice's discipline:

- Every emitter is gated by state (fire lit, tap landed, fatigue high,
  resonance high) — no idle confetti.
- Color is always a ramp token (`--amber`/`--ember`/`--coal`/`--gold` for fire,
  `--smoke`/`--smoke-2` for smoke, `--dust` for motes, `--glow` for affirming).
- Particles carry **no meaning the HUD doesn't also state** — they dramatize a
  fact, they are never the only channel for it (accessibility: a colorblind or
  reduced-motion player still gets the meter/label/text).
- Under reduced motion, counts are cut (`REDUCE ? n/3 : n`) and a hard cap
  applies; the *event* still registers, only the spectacle shrinks.

### 7 · Scene / camera transitions

Zone-to-zone and camera framing changes use the chunky pixel register: a
`steps(4)` wipe or a flat `--scrim` cross-fade, never a blurred web-style
dissolve. Framing (which part of the buffer is centered) is a projection of
phase/level; VOX may reframe but the buffer resolution and `PIX` lattice are
fixed — the camera moves the world, it never smears the pixels.

## The hard reduced-motion contract

`prefers-reduced-motion: reduce` is honored at **three** enforced levels; a VOX
surface is non-conforming if any is missing:

1. **Token level** — `VOX_TOKENS.css` collapses `--vox-dur-*` to ~1ms and caps
   `--vox-throb-amp` to the calm value inside the media query. Any pure-CSS VOX
   surface degrades correctly with no JS.
2. **CSS level** — every VOX stylesheet ends with a
   `@media (prefers-reduced-motion: reduce)` block that sets `transition:none` /
   `animation:none` on bubbles, flashes, panels, and blink keyframes (mirrors
   the slice's block exactly).
3. **JS level** — components read
   `matchMedia("(prefers-reduced-motion: reduce)").matches` once and branch
   amplitude/particle-count/shiver from it (the slice's `REDUCE` constant),
   never removing the *state signal*, only the tween.

**The invariant across all three: reduced motion removes the tween, never the
information.** A beat still recolors on the beat; a strain still turns the meter
hot; a free lesson still flashes glow-not-red — they simply stop *moving*.
Meaning is never motion-only. This also guarantees a headless render (no rAF, no
matchMedia) shows correct *static* state — the property the visual tests check.
