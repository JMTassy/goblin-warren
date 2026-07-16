# ADOPTION_LOOP_ASSET_SPEC.md — Adoption & First Shared Action Loop

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign design doc. -->

## Scope — read this first

This sheet is deliberately **intimate, not systemic**. It covers only what
the opening loop needs: adopting Bram and lighting the first fire together
(Level 0-1 of `AI_LEARNING_SPINE.md`). It must **not** be merged with
`SPECIALIZATIONS_RESOURCES_STRUCTURES.md` — that sheet is a Level 4-7
expansion (specialized Goblins, infrastructure, resource systems); merging
the two would reintroduce the systemic sprawl this pass exists to remove.
If an asset doesn't serve adoption or the first fire, it belongs on the
other sheet, not this one.

Every asset below follows the same rule as `SPRITE_SPEC.md`: canvas pixel
sprite, `fillRect` blocks at native low-res, colored exclusively from
`tokens.css`. No emoji/glyph substitutes here — this is the intimate scene,
where the two-resolutions problem matters most.

## Bram — poses

| Asset | State trigger | Notes |
|---|---|---|
| **Bram asleep** | pre-adoption, first discovery | Curled, eyes closed (no eye-glow pixel drawn), slow single-breath bob (~4s period). This is the *very first* frame the player sees of him — no words yet, per the Level-0 framing. |
| **Bram awake** | player's first interaction (tap/approach) | Eyes open (`--glow`), ears lift, base `idle` pose from `SPRITE_SPEC.md`. |
| **Bram observing** | mid-fire-making, before ignition | Reuses the existing `curious` pose delta (ears nudge outward, brief `--glow-hot` glance) — but re-triggered here on *player activity near the fire*, not only on `firstSpark`, so he visibly tracks effort, not just the spark event. |
| **Bram carrying a log** | the Level-1 "limitation" beat — the heavy log the player cannot carry alone | New pose: base body pose + a held-object offset (log sprite, see below) at chest height, a slight forward lean (+1px x-offset in walk direction), walk-cycle bob shared with existing ambient bob. This is the one pose not yet built — it is the concrete answer to "I could not carry the heavy log" / "Bram could carry what I could not." |

## Fire — states

Reuses the existing deterministic heat → stage pipeline
(`stageFor(heat)` in `first-fire-v2.html`); this sheet just names the
visual assets per stage for an artist, rather than the procedural
particle-only rendering currently in place.

| Asset | Engine stage | Notes |
|---|---|---|
| **Weak ember** | `stage === "ember"` (heat 40-69) | A single glowing pixel at the hearth center, `--ember` token, low alpha, no particles yet beyond the existing spark emission. |
| **Small flame** | `stage === "flame"` (heat 70-99) | A short flame silhouette (2-3px tall) layered over the ember pixel, `--ember`/`--gold` gradient, existing rising-particle emission continues. |
| **Stable fire** | `S.lit === true` (post-ignition) | The existing ignition burst + sustained rising fire particles; this is already built and verified (zero render errors, `grade` reaches ~1.0). |

## Kindling — objects

| Asset | Role | Notes |
|---|---|---|
| **Brindille (twig)** | player-placed kindling, "direct care" beat | Small single-pixel-width stick, placed at the hearth by the player's own action (not delegated) — the "I placed the twig" moment in the corrected emotional arc. |
| **Grosse bûche (big log)** | the object Bram carries | Same log asset as "Bram carrying a log" above, but also needs a static/idle-on-ground variant (visible before Bram picks it up) so the Trace-and-delegate beat (Level 2-3) has something concrete to leave a trace on. |

## Lantern

| Asset | State | Notes |
|---|---|---|
| **Lantern, unlit** | before the fire ignites | Dim/grey lantern silhouette at the Warren's entrance path, no light-pool. |
| **Lantern, lit** | on ignition (`S.lit === true`) | Warm `--glow`/`--gold` light-pool, matching the existing hearth light-pool logic in `draw()` — this is the "forward promise" asset: *"Now we can enter the Warren together."* Not yet built; the current fire scene ends at the hearth, not at a lit path forward. |

## Trace — intensities

<!-- Renamed from "MARK" (Design Sheet v0.3 adopts "Trace"; see the
     stigmergy/environmental-trace framing there — decay, reinforcement,
     connection between traces is a richer spec than MARK originally had).
     Not to be confused with S.mark in first-fire-v2.html, an unrelated
     post-ignition memory-persistence flag (the "I'll keep this one" ember
     mark) -- different mechanism, same English word, kept as-is. -->

For Level 3 (Observation & Delegation), a visible signal the player leaves
on an object so Bram notices it without being directly moved there.

| Asset | Intensity | Notes |
|---|---|---|
| **Trace, weak** | just traced / decaying | Faint outline pixel-ring, low alpha, on the traced object (e.g. the dry-wood pile from Level 2). |
| **Trace, medium** | held attention | Brighter ring, slight pulse. |
| **Trace, strong** | about to trigger Bram's notice-and-act | Full-brightness ring, matches `--glow-hot`, timed pulse synced to Bram's `curious` pose delta so his noticing reads as caused by the trace, not coincidence. |

## Interaction icons

| Asset | Role | Notes |
|---|---|---|
| **Drag hand** | cursor/touch affordance for dragging kindling | Small hand-icon or drag-trail cue; distinct from the existing rub-to-ignite gesture so the two mechanics (rub stones vs. drag kindling) read as different actions with different feedback. |
| **Breath** | the ember-tending gesture ("My breath changed the ember") | Currently the game only has the rub-to-heat mechanic; a breath-specific cue (a soft outward puff icon, or a distinct particle-nudge on the ember) would make this beat legible as its own embodied action, separate from rubbing stones. |

## Path — states

| Asset | State | Notes |
|---|---|---|
| **Dark path** | pre-ignition | The unlit route from the hearth into the rest of the Warren — should read as present-but-unwelcoming, not simply absent. |
| **Lit path** | post-ignition | The same route, now lantern-lit — the visual payoff of "we lit the lantern... now we can enter the Warren together." This is the one clear extension point beyond the current fire scene's ending (which stops at the hearth).

## What's already built vs. what this sheet adds

**Already built and verified** (in `first-fire-v2.html` /
`first-fire-v2-standalone.html`, per `SPRITE_SPEC.md`): Bram idle/shiver/
curious/warm-hands/content poses, the weak-ember→flame→stable-fire
progression via deterministic heat, the ignition burst and sustained fire
particles, the rub-to-heat mechanic.

**Net-new, named here for the first time**: Bram carrying a log, the
static big-log-on-ground object, the twig placement object, the lit/unlit
lantern pair, the dark/lit path pair, Trace intensities, and the
drag-hand / breath interaction icons. These are the assets Levels 2-3
(clear request, delegation) and the "forward promise" beat need — none of
them exist yet in the current build.
