# TRACE_SYSTEM.md — the delegation signal (Level 3+)

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign design doc. -->

## Naming note

Design Sheet v0.3 named this mechanic **Trace**; earlier docs in this repo
called it **MARK**. Per operator decision, **Trace is now canonical** —
`AI_LEARNING_SPINE.md` and `ADOPTION_LOOP_ASSET_SPEC.md` have been updated.
This is unrelated to `S.mark` in `first-fire-v2.html` (a post-ignition
memory-persistence flag, the "I'll keep this one" ember mark) — same
English word, different mechanism, left as-is.

## What a Trace is

A **Trace** is a visible environmental signal the player leaves on an
object or location. Goblins do not receive direct orders; they **notice**
traces and act on them according to their own local rule. This is the
game's concrete implementation of **stigmergy over direct control** (v0.3
§2): coordination through the shared environment, not through commands.

```
player action → Trace created/strengthened on object
              → Trace is visible in the world (not a hidden flag)
              → each Goblin's local rule reads nearby Traces
              → a Goblin whose rule matches decides to act
              → the player observes the result and can verify it
```

The player never moves a Goblin directly. This is precisely Level 3's AI
objective: *indirect influence and delegation differ from direct control.*

## Trace properties

| Property | Description |
|---|---|
| **Intensity** | weak / medium / strong (see `ADOPTION_LOOP_ASSET_SPEC.md`'s three visual states). Rises while the player actively reinforces a Trace, decays when left alone. |
| **Decay** | Traces fade over time unless reinforced (v0.3 §4) — a Trace is a claim about *current* relevance, not a permanent flag. This mirrors the NPC gateway's memory law (`experiments/npc-preview/npc/memory.js`): a signal must be actively kept, not assumed to persist forever. |
| **Personality-relative reading** | The same Trace means different things to different Goblins. Bram reads **Warning**-flavored traces strongly (material risk, urgency, effort); Lulu reads **novelty/weak-and-interesting** traces strongly (patterns, the unusual). A single object can carry a trace that only one of them finds compelling — this is the mechanical seed of Level 7 specialization, arriving three levels early as a hint, not a lecture. |
| **Connection** | v0.3 allows traces to be connected to one another (a later, deeper capability — not required for the Level-1/3 opening loop, but worth reserving the data model for). |

## Minimal data shape (engine-facing, not yet implemented)

```js
// A Trace is data the world holds, not a message sent to a Goblin.
{
  id: "trace_1",
  targetObjectId: "woodpile_far",
  intensity: 0.0,          // 0..1, rises on player reinforcement, decays over time
  flavor: "warning",       // or "novelty", etc. -- which Goblin-readable channel this speaks on
  createdAt: <engine tick>,
  lastReinforcedAt: <engine tick>,
}
```

Goblin "noticing" is then a **pure function of world state**: each Goblin's
local rule scans nearby traces, weighs `intensity` × `flavor` affinity, and
decides whether to act — exactly the same shape as the NPC gateway's
model-narrates/engine-decides boundary (`npc-gateway.js`), except here the
"proposal" is environmental rather than linguistic. **The engine still
decides whether the Goblin's action actually changes world state** — a
Goblin "deciding" to fetch wood is a candidate, not an admission, same law
as `admitProposal()` in the V0 reducer and `grantBloomIfEligible()` in the
fire intro.

## Level 1's Trace beat, concretely (from Design Sheet v0.3 §6)

1. Player blows (mic) → fire wakes from nothing → embodied action, no
   Trace involved yet.
2. Player drags a nearby twig into the fire → direct object manipulation,
   still no Trace.
3. Player discovers they cannot reach the larger wood pile → the
   **limitation** beat (`ADOPTION_LOOP_ASSET_SPEC.md`'s "Bram carrying a
   log," not yet built).
4. Player **traces** the distant wood → a visible signal appears on it
   (this is where the three Trace-intensity assets get used).
5. Bram notices the trace (his rule reads `warning`/effort-flavored
   signals strongly), fetches the wood, helps.
6. Fire grows strong enough → lantern lights.

This sequence is richer than what `first-fire-v2.html` currently
implements (which has only the rub-to-heat mechanic and no delegation
beat at all) — Level 2's "clear request" and Level 3's "trace and
delegate" are both still ahead of the current build, not yet coded.

## What this does NOT change

- The absolute boundary from `npc-preview/README.md` still holds: nothing
  a Goblin "decides" from reading a trace may mutate progression, save,
  or reward directly — the deterministic engine still gates every
  consequence.
- This is a **design specification**, not an implementation. No engine
  code has been written against it yet; `first-fire-v2.html` is unchanged
  by this document.

## Open questions for the next pass

- Exact decay rate and reinforcement curve (numbers, not just "decays
  over time").
- Whether Trace flavor is a fixed enum (`warning`, `novelty`, ...) or an
  open vocabulary Goblins interpret loosely — the fixed-enum approach
  matches the existing `response-schema.js` philosophy (bounded,
  validated categories) better than a free-text approach would.
- How "connection between traces" (v0.3 §4) should work mechanically, if
  and when it's needed beyond Level 3.
