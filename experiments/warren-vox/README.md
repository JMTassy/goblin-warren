# WARREN_VOX_DESIGN — skill manifest

<!-- WARREN VOX · authority=false · claim=NO_CLAIM · non-sovereign · cost:0 · render-layer only -->

**WARREN VOX** is a reusable, zero-generation-credit design skill that
transforms verified Goblin Warren mechanics into a coherent, tactile, living
pixel-world interface. It changes only presentation — composition, lighting,
typography, HUD, motion, particles, sprite presentation, camera, transitions,
atmosphere. It **never** changes rules, progression, inventory, receipts, agent
authority, witness gates, or ledger state. It preserves the seam:

```
GAME STATE / REDUCER → read-only projection → WARREN VOX RENDER LAYER → PLAYER
```

## Manifest

```yaml
skill: WARREN_VOX_DESIGN
version: 0.1.0
authority: false
canon: false
non_sovereign: true
ledger_effect: none
layer: render_only               # presentation; never rules/state
cost_policy:
  paid_generation_calls: 0       # zero paid generation, ever
  network_calls: 0
  external_assets: 0             # no font / image / audio / CDN
seam:
  order: [game_state_reducer, read_only_projection, vox_render_layer, player]
  direction: one_way             # projection reads S; VOX never writes S
may_touch:
  - composition
  - lighting
  - typography            # within the fixed --step-* scale and --font-mono
  - hud
  - motion
  - particles
  - sprite_presentation   # pose selection / rim-light / framing, not geometry rules
  - camera
  - transitions
  - atmosphere
may_not_touch:
  - rules
  - progression
  - inventory
  - receipts
  - agent_authority
  - witness_gates
  - ledger_state
  - admission_verdict
  - economics
  - win_condition
outputs:
  - VOX_TOKENS.css                 # frozen token layer (superset of warren-design/tokens.css)
  - VOX_SCENE_GRAMMAR.md           # zone composition + read-only-projection rule + may/may-not
  - VOX_MOTION_GRAMMAR.md          # motion vocabulary + hard reduced-motion contract
  - VOX_CHARACTER_PRESENTATION.md  # Bram/Lulu presentation + provenance labels
  - VOX_COMPONENTS.js              # dependency-free vanilla components (projection -> DOM/canvas)
  - VOX_VISUAL_TESTS.md            # conformance checklist
```

## Invocation

> **Apply WARREN VOX / alter no mechanics / no paid generation.**

That line is the whole contract in one breath: re-skin above the seam, change no
rule, spend no credit.

## Workflow

1. **Read** — the verified source assets (tokens, scene grammar, sprite spec,
   trace system, the live vertical-slice render layer, the codex "alive" and
   first-fire cold→warm references).
2. **Extract** — derive the VOX grammar from what is already tested, never invent
   a style disconnected from the assets.
3. **Freeze** — lock the token layer (`VOX_TOKENS.css`) as a strict superset of
   `warren-design/tokens.css`; never redefine a base token to a conflicting
   value.
4. **Apply above the seam** — build the render layer as a pure function of a
   read-only projection `proj(S)`. Never write state; never add an input route
   into the reducer.
5. **Check** — run `VOX_VISUAL_TESTS.md`: reducer suites stay green (29/29,
   34/34), render/interaction/a11y verified, zero paid calls, reduced-motion
   honored, every companion line labelled.
6. **Before/after** — same admitted sequence, old skin vs. VOX skin, must yield
   an **identical governed projection** (`Project_gov(S) = (S.admitted, S.phase,
   S.level)`; full `stateDigest` byte-identical). Only pixels differ — the
   bounded-continuity property.
7. **Admit only after human review** — VOX proposes; the operator seals
   canonization. This skill never admits itself.

## The extracted VOX grammar (the visual laws)

Derived from the present, tested assets:

1. **One temperature ramp is the whole palette** — every color is an anchor or a
   `mix()` on a single scalar `grade` (0 cold → 1 warm); no hue exists outside
   the ramp. *(tokens.css)*
2. **Four fixed layers, one draw order, token discipline only** — bg → glyph →
   char → hud (VOX interleaves trace/atmosphere/provenance sub-bands); layer
   identity is draw order + token source, not technology. *(scene-grammar.md)*
3. **Pixel technique = quarter-res buffer + nearest-neighbor upscale on one
   `PIX` lattice** shared by canvas and DOM; chunky offset shadow, no
   border-radius, no blur, ever. *(tokens.css + scene-grammar.md)*
4. **One type scale and one mono face** for title and in-scene HUD both — fixed
   px steps snapped to the grid, never a vw-hero; system/local fonts only.
   *(tokens.css)*
5. **HUD reflects, never computes** — it mirrors state the canvas already derives;
   a new color is a new named token, never a literal hex. This is the read-only
   projection rule made concrete. *(scene-grammar.md)*
6. **Motion is a pure projection of game/beat state, graded morally** — the pulse
   ring *is* `beatNearness(S)` recomputed each frame; free-lesson warm-flash vs.
   punishing red-flash; reduced motion removes the tween, never the information;
   companion lines are expression-only and always carry a provenance label.
   *(slice + slice-core.js)*

## Source-asset note — `v3-play.html` was NOT available

The skill's original brief named `v3-play.html` as a source. **That file does
not exist in this repository** (verified 2026-07-20: not tracked by git, no v3
branch, not reachable). The VOX grammar above was therefore extracted from the
present, tested assets instead:

- `experiments/warren-design/tokens.css`
- `experiments/warren-design/scene-grammar.md`
- `experiments/warren-design/SPRITE_SPEC.md`
- `experiments/warren-design/TRACE_SYSTEM.md`
- `experiments/vertical-slice/index.html` (+ `slice-core.js`) — the live render layer
- `experiments/warren-codex.html` — the "alive at zero credits" reference
- `experiments/first-fire-v2.html` — the cold→warm grade reference
- `experiments/bounded-continuity/` — the governed-projection identity property

When `v3-play.html` later arrives, it folds in as an **additional input**: re-run
step 1–3, reconcile any new grammar against this frozen token layer (superset,
never contradiction), and bump the manifest version. Nothing here needs to be
torn up — VOX was built from the canon that exists.

## Non-canon

Everything under `experiments/warren-vox/` is `authority=false · canon=false ·
ledger_effect=none`. It touches no reducer, no test, and no root canon. The
operator seals canonization.
