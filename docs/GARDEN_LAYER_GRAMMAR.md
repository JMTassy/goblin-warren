# Garden-Layer Grammar (non-sovereign)

Preserves the Goblin Garden / Goblin Warren / Dreams-of-Conquest render+game
grammar as **Garden-layer architecture**. Extends `GOVERNANCE_TYPE_SYSTEM.md`
with Garden semantic types and forbidden morphisms. Nothing here is kernel.

## Evidence status (honesty ledger)

- **Proven this run:** screenshots showing the visual/interface concepts.
- **Reported / visual only:** Goblin Garden, Goblin Warren, Dreams of Conquest, emotional receipts, side quests, Akashic Tree, Mycelial Gate, Chaos/Coherence/Membrane meters.
- **Not proven:** no external app, live build, animation, repo runtime, or evaluator-backed metric exists. This doc preserves *grammar*, not a shipped system.

## Position in the HELEN spine

```
kernel defines truth · shell renders truth · tools/skills propose
Garden generates candidates · Reducer admits only through receipts
Replay is the only memory that counts as state
```

The batch sits in **Garden / render / game**, not the kernel. Its value: it
makes HELEN's governance *legible as a playable world* —

```
Question → ZOL → Territory → Goblin Action → Garden Evolution → Replay
```

That is an excellent teaching/game loop. It is **not** a sovereign state loop
unless later connected to real receipts, reducer decisions, and replay.

## Garden semantic types (extend the lattice)

| Type | Inhabitant | Authority? |
|---|---|---|
| `Gauge` | Chaos / Coherence / Membrane meters | none — visual until receipted |
| `PressureSignal` | Drama / Stillness / Wonder / Spark / Shadow / Glitch | none |
| `GameReceipt` | `emotional_receipt` / `lulu.receipt` / `game_receipt` | none — game namespace only |
| `SideQuest` | an affect/detour promoted to a quest | none |
| `HealthView` | Akashic Tree (aggregate dashboard) | none — render object |
| `ExchangeFilter` | Mycelial Gate (zone filter/decompose/quarantine) | none — filters flow, never admits truth |

## Forbidden morphisms (Garden extension of the registry)

| Morphism | Why |
|---|---|
| `GameReceipt ↛ LedgerFact` | emotional/game receipt is **not** a kernel ledger receipt |
| `Gauge ↛ Metric` | a visual gauge is not a measurement until defined as `f(events)→value` |
| `HealthView ↛ State` | Akashic Tree judges/reflects; it is render, not sovereign memory |
| `Feeling ↛ Proof` | affect is a signal, not evidence |
| `SideQuest ↛ Canon` | a quest is play, not admitted truth |
| `ExchangeFilter ↛ Admission` | Mycelial Gate redistributes pressure; it never admits to kernel |
| `FlavorText ↛ GameReceipt` | a receipt must be emitted by a logged game event, not authored ad hoc |

**Core rule (kernel-safe form):** *Nothing is trash* — unsorted material becomes
compost, quarantine, redistribution, side quest, or proof target. But:
`render ↛ state · feeling ↛ proof · game receipt ↛ ledger receipt ·
side quest ↛ canon · beauty must expose mechanism.`

## Strict naming firewall

| Garden/game term | must NEVER be read as |
|---|---|
| `emotional_receipt` / `lulu.receipt` / `game_receipt` | kernel ledger receipt (`LedgerFact`) |
| Akashic Tree | sovereign memory / `State` |
| Chaos / Coherence / Membrane | measured metric |
| side quest | canon |
| Garden candidate | admitted state |
| Mycelial Gate | HAL / admission gate |

## Candidate event schema (non-authority by construction)

```json
{
  "event_type": "warren.trigger",
  "source_surface": "goblin_warren",
  "pressure_family": "Drama|Stillness|Wonder|Spark|Shadow|Glitch",
  "trigger_text": "visible phrase or event",
  "candidate_effect": "side_quest|emotional_receipt|bug_naming|compost|quarantine|redistribution",
  "authority": false,
  "ledger_effect": "none",
  "promotion_allowed": false
}
```

Correctly shaped: `authority:false · ledger_effect:none · promotion_allowed:false`
make it a **candidate**, structurally unable to promote to kernel. Recommended
additions for provenance (see Open Decision 2): a `game_receipt_id` written to
the **game** log (never the kernel ledger) and a `replayable_from` pointer, so a
GameReceipt's origin can be folded out of game state rather than trusted.

## Open decisions — architect recommendations

1. **Gauges vs metrics?** Today `Gauge` (visual). Promote to `Metric` only when
   each is defined as a pure function over a logged event stream — the model
   already exists: `auraWeather(S)` is exactly this. `Gauge ↛ Metric` until then.
2. **What proves an emotional receipt is game state, not flavor?** A `GameReceipt`
   is real iff it folds out of an append-only **game** log (its own namespace),
   with `source_surface` + `trigger_text` tied to a logged transition. Same
   replay discipline as kernel, scoped to the game.
3. **Compost vs quarantine vs side quest?** Shape: a *pure deterministic*
   `classifyPressure(state, trigger) → effect` seeded like the reducer (`h32`),
   NOT model-decided, so it replays. Thresholds are a human design decision;
   the structure is a reducer over game events.
4. **Mycelial Gate a formal module?** Yes — strongest signal in the batch. It's
   the Garden's exchange/filter primitive: `MycelialGate(zoneA, zoneB, flow) →
   filtered_flow`, non-authority, `ledger_effect:none`. It filters candidates
   and quarantines toxic zones; it never admits truth. (Human-gate the scope.)
5. **One product or two?** **Two skins over one spine.** Goblin Garden Edu
   (child-facing, concepts-as-questions) and Goblin Warren (affect/pressure) share
   the proposal → gate → replay reducer. Fork the render, not the spine — exactly
   what `index.html` vs `v2.html` already demonstrate (two skins, one reducer
   discipline). "One primitive over five."

## What this doc does NOT do

No build, no kernel change, no runtime, no claim that any live app exists. It
preserves grammar and locks naming so Garden receipts can never be mistaken for
kernel receipts.
