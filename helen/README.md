# HELEN OS — the loop-graph lane

`authority=false · claim=NO_CLAIM · non-sovereign`

This directory holds HELEN OS architecture proofs that live alongside the
game (the game is the OS's playable embodiment). Nothing here is a game
feature; the game's witness stop-rule does not gate it. What gates it is
its own deterministic test suite — which is the whole point.

## WITNESSED_LOOP_GRAPH_SEAM_V0

**Proves one narrow constitutional property, and nothing else:**

> A self-confirming group of agents cannot promote a claim without
> independent evidence.

The loop-graph chiddush (see `docs/VISION_V2.md`) reframed HELEN: not a
society of agents, but a **graph of error-correcting loops temporarily
embodied by agents**, whose one safety condition is the **anchor-cut** —
no strongly-connected, mutually-confirming component may promote a claim
to canon without an incoming edge from an independent anchor.

This seam is the first executable cell of that law. It does **not** build
the general loop-graph compiler (that is a later layer). It demonstrates
that the central law is enforceable, with four roles:

- **producer** — proposes the claim from runtime output (may be a whole
  swarm; they may all agree)
- **reviewer** — critiques using the *same* packet (agreement is not
  evidence and cannot admit)
- **witness** — independently observes whether the claim holds (the anchor)
- **reducer** — decides admission; consumes evidence, never confidence

### The anchor-cut gate

```
Admit(c) ⇒ ∃ a ∉ C : a ⇝ c ∧ Independent(a, C)
```

`reduceClaim` returns `HOLD` with no independent witness, `HOLD_REOBSERVE`
when the only independent witness is stale, `REJECT` when a fresh
independent witness contradicts the claim, and `ADMIT` (admittable — never
automatically canonical) only when a fresh independent witness confirms it.
Supportive reviews may improve a proposal; they can never replace the anchor.

### The independence predicate

Strict by design — false independence is more dangerous than an extra
check. Two nominally different agents can be one epistemic source, so a
witness counts as independent only when it differs in **producer**, **input
packet**, and **derivation method**, is a live probe, and post-dates the
claim (you cannot witness the past).

### Run

```bash
node helen/witnessed-loop-graph-seam.test.js   # 11/11; exit 0 iff the law holds
```

Deterministic: no `Date.now()`, no `Math.random()`, no network, no LLM.
Time enters only as passed-in data, so the run is replay-identical — which
is exactly why a `node` invocation can itself serve as the independent
anchor these tests demand. The proof honours its own law.

### Proven properties (§7 of the spec)

- many agents can agree — `true`
- agreement can be wrong — `true`
- shared lineage is not independence — `true`
- an independent anchor is required — `true`
- admission without an anchor — impossible

### Deliberately excluded (later layers)

Dynamic graph optimization · worker spawning · weighted voting ·
reputation · LLM-based independence judgments · automatic canonical
mutation · generalized ontology · Village simulation.

## Growth sequence

```
anchor-cut seam (this)  →  loop-graph schema  →  distinction planner
  →  minimal loop selector  →  agent embodiment  →  Goblin Village
```

Each step is its own witnessed proof. The Village is the last layer, not
the first — and each goblin will embody one distinct correction loop
(character is the interface, the loop is the soul).
