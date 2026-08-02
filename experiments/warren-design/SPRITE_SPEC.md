# SPRITE_SPEC.md — canonical Bram

## The pick: canvas pixel sprite (not CSS/emoji/glyph)

**Canonical representation: a canvas-drawn, nearest-neighbor pixel sprite**, built
from `fillRect` blocks at the engine's native low-res resolution (the `PIX`
buffer), colored exclusively from `tokens.css`.

Why, against the alternatives:

- **Not emoji/glyph.** The multi-map successor (`goblin-warren.html`) already uses
  a CSS/emoji or glyph representation for its NPCs — that is *its* register (accounts,
  replay, a different, more abstract world). Reusing it here would blur the two
  lineages this repo's CLAUDE.md is explicit about keeping separate, and emoji
  glyphs render with OS/browser-specific fonts and colors that cannot be locked to
  a fixed palette — the opposite of coherence.
- **Not a separate DOM/CSS sprite (div grid, background-image, SVG).** Any DOM
  character layer is a *second* rendering pipeline sitting on top of the canvas,
  at DOM's subpixel/antialiased precision — exactly the two-resolutions problem
  this whole pass exists to remove. A DOM Bram would need its own upscaling logic
  to stay pixel-perfect against a canvas whose internal size changes with `resize()`.
  A canvas sprite is *by construction* the same resolution as the room she stands in.
- **Offline-safe.** No web font, no image asset, no CDN — just `fillRect` calls,
  consistent with the project's "no build step, no dependencies" law.

The engine already draws Bram this way (`drawBram()`); this spec formalizes her
shape/palette/states as a contract so future assets (new zones, new characters)
follow the same rule instead of inventing a new technique per scene.

## Bounding box

Fixed **10 px wide × 10 px tall**, drawn at low-res canvas units (i.e. before the
`PIX`-factor CSS upscale — at `PIX=5` this is a 50×50 device-pixel character on
screen at 1x zoom, larger at higher DPR/zoom, always crisp because it's nearest-
neighbor scaled like everything else in the buffer).

Anchor: all offsets below are relative to a single origin point `(x, y)` — her
feet-center at the floor line. This is the same anchor the engine already uses
(`x = bramX`, `y = floorY - 10 + bob`).

```
col:   -3 -2 -1  0 +1 +2 +3 +4 +5 +6 +7
row -1              ear         ear
row  0  body top band (x-2..+3, 6px wide, 2px tall)
row +1  body band (x-3..+4, 8px wide)
row +2  body band (eyes sit here, x-2 & x+2)
row +3  body + belly starts (belly x-1..+2)
row +4..+6  belly band
row +7  body band
row +8  feet (x-3..-2 and x+3..+4)
row +9  ground contact / shadow row (implicit, no draw)
```

(This matches the existing `drawBram()` rectangles exactly — the spec codifies
what's already drawn, so adopting it required zero geometry changes, only
palette-token and pose-state cleanup.)

## Fixed palette (all tokens, no ad-hoc hex)

| Part | Cold token | Warm/lit token |
|---|---|---|
| Body | `--moss` | `--moss-warm` |
| Belly | `--belly` | `--belly-warm` |
| Ears + feet | `--ear` | `--ear-warm` |
| Eye socket | `--ink` (constant) | `--ink` (constant) |
| Eye glow | `--glow` | `--glow-hot` (once fire gives rim light) |
| Cold-breath puff | `--breath` (constant, cold-only) | — |
| Fire rim-light edge | — | `--rim` |

Body/belly/ear all mix `cold -> warm` on the *same* `grade` value (0..1) the room
uses — she never warms faster or slower than her surroundings; that synchrony is
part of what reads as "one world."

## Named states (per-state deltas)

Each state is a **pose delta** layered on the same base draw — no new geometry,
only which optional strokes are active and how the base offsets are nudged. This
keeps the contract cheap to extend (a new state = a new small delta table row,
not a new sprite).

| State | Trigger (engine signal, unchanged) | Delta from base pose |
|---|---|---|
| **idle** | `!started` or (`started && !lit` and not shivering) | Base pose, no deltas. Slow ambient bob only if lit (`sin(t·3)·0.6`); otherwise still. |
| **shiver** | `!lit && grade < 0.25` | ±0.6px horizontal jitter at ~33Hz (`sin(t·33)`); cold-breath puff every 3rd tick, alpha .4, `--breath`; **disabled under `prefers-reduced-motion`** (already the case — kept). |
| **curious** | first spark noticed (existing `firstSpark` flag), held ~1.6s | Ears nudge outward/up +1px each (`y-2` instead of `y-1`), eye glow briefly to `--glow-hot` then back to `--glow`. Purely cosmetic — reads the *existing* flag, adds no new engine state, no new threshold. |
| **warm-hands** | `bramWarm > 0` (already set 1.4s into `ignite()`) | Existing "reach" stroke toward the fire, band color `body` token, ramps 0→2px over `bramWarm` 0→1; rim spark pixel added once `rim` is true. |
| **content** | `S.mark === true` (post "I'll keep this one") | Eye glow locked to `--glow-hot`; slow idle bob active (shared with lit-ambient bob); ember-mark pixel drawn at her feet (existing `S.mark` visual, now token-colored `--ember`). |

States are evaluated in the order above and are not mutually exclusive with
`idle` (idle is the fallback when no other pose condition holds); `shiver` and
`curious` and `warm-hands`/`content` are mutually exclusive by their triggers
(cold vs. lit-sequence) so there's never an ambiguous pose.

## Non-goals

This spec covers Bram's *first-fire* scene appearance only. It does not define
walk cycles, a sprite sheet, or additional NPCs — those get their own spec when
built, but must reuse this bounding-box convention and `tokens.css` palette
unless a documented reason says otherwise.
