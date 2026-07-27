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

## WITNESSED_LOOP_GRAPH_SCHEMA_V0

The second cell. The seam proved the anchor-cut for one hand-labelled
claim; the schema makes it **structural and replayable**.

- **state = fold(event_log)** — append-only, deletion-free, replay-identical
  (`CLAIM_PROPOSED · REVIEW_ADDED · WITNESS_OBSERVED · DECISION_MADE ·
  CLAIM_SUPERSEDED`).
- **epistemic-lineage components** — a node's identity is its *machinery*
  (model family · prompt lineage · retrieval corpus), never the per-input
  packet. Ten differently-named reviewers on one model collapse to one
  source; a witness that fakes a "different input" but runs the same
  machinery is caught here (the schema's added lock over the seam).
- **graph anchor-cut** — a claim is admissible only if a confirming node
  lives *outside* the claim's epistemic component and is independent.
- **supersede / rollback** — an admitted claim later contradicted is
  SUPERSEDED by an appended event; the original claim, decision and
  evidence stay in the log. Forgetting is itself an event.

```bash
node helen/witnessed-loop-graph-schema.test.js   # 9/9; exit 0 iff the law holds
```

Deterministic (G9 scans the code, not the prose, for `Date.now`/`Math.random`/
network) — so a `node` run is again the independent anchor.

## WITNESSED_LOOP_GRAPH_DISTINCTION_PLANNER_V0

The third cell — the inversion. Conventional orchestration asks "which
agents do we need?"; this planner asks the prior question, **"which false
states must remain distinguishable?"**, and emits the minimal loop set that
separates them before any agent exists.

- **distinction library** — the false states an honest system must never
  confuse (`reported ≠ observed`, `exists ≠ supports`, `correlated ≠
  independent`, `supported ≠ current`, `clear ≠ correct`, `produced ≠
  verified`, `reported ≠ admitted`), each mapped to its separating loop and
  the **anchor class** that loop must consume.
- **the absent anchor** — `producer` is deliberately not an anchor class.
  More same-lineage producers separate *nothing*. `plan()` emits the minimal
  deduped loop set and refuses admission (`UNSEPARABLE_DISTINCTION`) when a
  required distinction has no independent anchor available, or
  (`UNKNOWN_DISTINCTION`) when asked to separate something it has no
  separator for. It never guesses a separator it lacks.

```bash
node helen/witnessed-loop-graph-planner.test.js   # 7/7; exit 0 iff the law holds
```

D3 proves the inversion outright: adding 0, 20, or 1000 producers separates
0 distinctions. This is the cell that would have refused the redundant
20-seat swarm — it says "these seats separate zero new false states; you
need one anchor, not twenty producers."

## WITNESSED_DATA_METABOLISM_V0

The data-layer twin of the loop-graph cells. The seam/schema/planner govern
CLAIMS; this governs the DATA claims are made of.

Constitutional rule: **transformation may increase usefulness; it must never
silently increase authority.** A summary may be clearer than its source; it
does not become truer. Every item is a **DataBead** whose most important
field is `authority.level`, not its content — the same sentence at `reported`,
`inferred`, and `admitted` is three different objects.

Implements the four membranes (provenance · semantic · authority ·
temporal), the metabolic states, the admission equation, and the five toxin
detectors (authority inflation · citation laundering · synthetic
contamination · semantic collapse · **recursive self-confirmation** — reusing
the seam so "derived objects cannot be independent witnesses" is the same
anchor-cut at the data layer). Proven on synthetic beads; ingests, downloads,
persists, admits nothing real.

```bash
node helen/witnessed-data-metabolism.test.js   # 11/11; exit 0 iff the law holds
```

B10 is the guardrail that governs any real ingestion: restricted PII cannot
be admitted without an explicit privacy clearance, even when every other
conjunct passes.

## Growth sequence

```
anchor-cut seam (this)  →  loop-graph schema  →  distinction planner
  →  minimal loop selector  →  agent embodiment  →  Goblin Village
```

Each step is its own witnessed proof. The Village is the last layer, not
the first — and each goblin will embody one distinct correction loop
(character is the interface, the loop is the soul).
