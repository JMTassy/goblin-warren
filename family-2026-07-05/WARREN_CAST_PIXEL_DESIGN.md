# WARREN CAST — PIXEL CHARACTER DESIGN BIBLE

authority=false · NO_CLAIM · design reference, not spec-law · 2026-07-05

**The law first:** per `goblin-warren-spec.md` — *pixel style via technique, not
Supercell IP; all sprites procedural + original.* This document steals the **why**
of the Clash-family look (sourced below), never the **what**. Every character here
is original HELEN expression. Black-fill test before anything ships.

## I. The stolen technique (what actually makes Clash characters read)

Distilled from Supercell's own material and production analyses:

1. **Proportions are a tuned instrument, not a style.** Units are enlarged and
   "cartoonified" — head ≈ ⅓ of height, oversized hands/feet/props — and Supercell
   iterated *dozens of times* on exact head size until a unit read instantly on a
   phone screen mid-combat. → Our grid: **32×32 sprite, head occupies 10–12px.**
2. **Silhouette is role-coded.** Tank = wide + low-slung; ranged = elongated +
   signature weapon; if two silhouettes are similar, that's a *gameplay bug*, not
   an art nit. Test: fill solid black — still identifiable? → Each Warren seat
   gets ONE silhouette rule tied to its governance role (below).
3. **Detail budget is brutal.** "Detail everywhere is as good as no detail." The
   smaller the on-screen unit, the fewer details — 40 rivets become gray smudge.
   Supercell keeps detailing "subtle and very local." → **One (1) signature prop
   per character; max 2 local detail zones; everything else is flat ramp.**
4. **The face is the destination.** Color/value gradients deliberately steer the
   eye to the face. → **Highest value-contrast pixel cluster on every sprite =
   the eyes.** 2px glowing eyes on dark face mass, always.
5. **Color is simple and value-separated.** Uncomplicated albedo, few color
   variations, gradients kept simple; materials pushed rougher than real for
   nicer ramps. → **3-step ramps** (shadow / mid / light) per material, max 3
   materials per sprite, 1px dark outline, house palette only.
6. **Shape language carries personality.** Round = friendly, triangle = threat,
   square = stable. → Assigned per seat from what the seat *does in law*.

## II. House pixel constraints (already law — restated)

Quarter-res render + nearest-neighbor upscale (`PIX=3/4`), hard-edged UI (3px
borders), stepped animations (`steps(N)`, no tweening — a Warren creature moves
in beats, like a cuckoo clock). Palette anchors:
`--swamp #141c0e · --moss #5c7a3a · --glow #a8d858 · --ember #d08a3c ·
--amber #e0a83c · --bone #e8dcc0 · --rot #8a5a4a · --spore #8fae6a ·
--violet #6a5a9a · --night #12101c`

## III. The cast — one silhouette rule each

**GOBLIN — compost & mutation.** *"Still smells useful. Smaller version maybe."*
- Silhouette: small, deep-hunched **C-curve**, one arm dragging a lumpy scrap-sack
  bigger than he is. Black-fill reads as a question mark.
- Shape language: crumpled circles. Nothing on him is symmetric.
- Big ears (technique: oversized feature), patched sack-hood — NOT bare-eared
  green-skin-with-red-hair (that's someone else's goblin). Ours is moss-green skin
  under bone-parchment burlap, ember under-glow from the sack (something in there
  is warm).
- Prop: the scrap-sack. Detail zones: sack patches, one dangling button-string.
- Idle beat (2 frames): sack twitches; GOBLIN doesn't.

**HAL — the gate-lantern.** Not a body. Never a body.
- Silhouette: a **perfect octagonal lantern** on a crooked iron hook-post — the
  only geometrically perfect object in the Warren (law does not reskin; law does
  not slouch).
- Shape language: pure geometry amid organic chaos. That contrast IS the design.
- Verdict states = flame color only, geometry never changes:
  `ACCEPTABLE #a8d858 · HOLD #e0a83c · DENY #8a5a4a` + 1px flicker step.
- Face rule inverted: HAL has no eyes. The flame is the face. 4px core, 2-step halo.

**HER — beauty reveals.**
- Silhouette: tall **S-curve**, moth-wing cloak that widens the top third. Only
  cast member whose outline contains no straight lines.
- Shape language: ellipses. Palette: bone + amber-gold, one `#8b6fc9` iris accent.
- Prop: a single hanging moth-wing veil. Idle beat: cloak breathes (1px swell).

**CHIDDUSH — pattern-hound, scholar.**
- Silhouette: lean, forward-leaning **diagonal** — always mid-stride toward
  something it noticed. Oversized single lens held to one eye.
- Shape language: spirals (cloak hem coils). Palette: violet + spore.
- Prop: the lens — its glass is the sprite's second-brightest pixel cluster.
- Idle beat: lens glint sweeps 3 px.

**CLAW — external effects, held forever.**
- Silhouette: wide, low, **square-shouldered**, one enormous gauntlet permanently
  clamped shut. The gauntlet is ⅓ of the whole silhouette.
- Shape language: locked squares. Palette: rot-red + iron gray. The only red-led
  character — red = boundary, not blood.
- Prop: the clamped gauntlet (it is never open in any frame — structural, like
  the law it embodies). Idle beat: shoulders rise 1px, gauntlet never moves.

**JESTER — chaos, doors that learn roots.**
- Silhouette: **asymmetric triangle** — one shoulder high, one bell-tipped hood
  point flopped opposite. No two frames mirror.
- Shape language: colliding triangles. Palette: violet + glow-green mismatch
  (deliberate palette-clash — the only character allowed to break color harmony).
- Prop: one bell that hangs *still* when he moves and *rings* when he stops.

**WARDEN — perimeter, the wall is love with a spine.**
- Silhouette: **rectangle**. Widest character. Tower-shield planted, body behind
  it — black-fill reads as a gate with legs.
- Shape language: stacked squares. Palette: moss + iron + bone trim.
- Prop: the shield, carved with the octagram (2px etch — subtle, very local).
- Idle beat: none. WARDEN is the only zero-idle sprite. Stillness is the design.

**STEWARD — balance, calm economy.**
- Silhouette: perfectly **symmetric pear**, hand-scales held level at chest.
- Shape language: balanced circles on a square base. Palette: moss + bone.
- Prop: brass hand-scales; the pans tilt 1px with the ZOL economy (the one
  data-driven pixel in the cast). Idle beat: robe hem sways opposite the scales.

**ARCHIVIST — memory, what is recorded can be replayed.**
- Silhouette: narrow vertical, bent-neck **reading posture**, back-mounted scroll
  rack fanning like a peacock of paper.
- Shape language: rolled cylinders. Palette: bone + amber, ink-dark hands.
- Prop: button-string ledger dangling to the floor — it drags 1px behind all
  movement (memory has inertia). Detail zone: 3 scroll-ends, nothing more.

**MAYOR — leader, packetizer of proposals.**
- Silhouette: GOBLIN's body-type **un-hunched** — same species, straightened by
  office. Sash is the widest color block in the cast.
- Shape language: GOBLIN circles + one civic square (the sash clasp).
- Palette: moss skin + ember sash + bone chain. Idle beat: chest inflates before
  every council line (wind-up telegraph, Clash-style anticipation).

## IV. Production rules

- Sprite sheet: 32×32 per character, 2-frame idle, 2-frame walk, 1 accent frame.
  HAL: 24×24, 3 verdict flames × 2 flicker frames.
- Procedural first (house law: sprites procedural + original) — these specs are
  written to be drawable with rects/ellipses + 3-step ramps in canvas code.
- The lineup test: render all ten black-filled at 50% size. If any two confuse,
  the *silhouette rule* gets fixed, never the detail budget raised.

## Implementation

This bible is executable: `warren-cast-sprites-v0/index.html` draws all ten
characters procedurally (pure `SPRITE-BEGIN/END` zone, node-testable), and its
`selftest.js` enforces the rules above as 25 assertions — eye-brightest, HAL
geometry lock, WARDEN zero-idle, CLAW gauntlet lock, STEWARD mirror, GOBLIN/JESTER
anti-mirror, ≤13-color budget, and the black-fill test as a pairwise Jaccard
threshold. The lineup test in §IV is now a button and an assert.

## Sources (technique only — no assets, no likenesses)

- Supercell Make, official troop character guidelines (make.supercell.com)
- Adobe Substance 3D magazine — Supercell Helsinki Creature Shop interview
  ("subtle and very local", broken-PBR ramps, face-first gradients)
- VSQUAD 2D unit art production guide (iterated head-size readability,
  role-based silhouettes, detail-vs-size budget)
- 80 Level / Big Red Illustration — shape language & black-fill silhouette test
