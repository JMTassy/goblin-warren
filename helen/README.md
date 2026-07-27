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

## GOVERNED_TRANSFORMATION_KERNEL_V0 — the merge

Composes the four cells into one four-key lock. The property none of them
has alone lives only here: **NO_LOCAL_SELF_PROMOTION**.

- **TYPE** — what effect is permitted. CHRONOS: `claimed_source_class ≠
  witnessed_source_class` is a schema-level forgery, not a wisdom call — a
  `model_output` may not wear a `command_output` costume.
- **LAW** — which actor may authorize (capability tokens; the authorizer may
  not be the producer — no self-authorization; in-place authority raises
  denied, `correct(event) := append`).
- **LOOP** — which gates passed (an independent, different-process anchor
  closed; an actor may not witness its own output).
- **RECEIPT** — a replayable event for every outcome; the parent object is
  returned byte-unchanged (measured, not asserted).

Four enforced invariants: `NO_LOCAL_SELF_PROMOTION` · `NO_IN_PLACE_AUTHORITY_MUTATION`
· `NO_SELF_WITNESS_UPGRADE` · `NO_UNRECEIPTED_STATE_CHANGE`. Fail-closed.

```bash
node helen/governed-transformation-kernel.test.js   # 8/8; K1 is the Director's
                                                    # minimum acceptance test verbatim
```

**Merge = GO (this artifact). Seal = HOLD — the sealing authority is the
operator\'s; HELEN produces a review verdict and a replayable recommendation,
never sovereign approval.**

## PRINCIPLE_GRAPH_V0 — the LNOS research-engine spine

A mission arrived (LNOS): be a research engine that outputs reusable
principles, separates observed from inferred, keeps a falsification protocol
for every invariant, preserves competing hypotheses, and measures success as
**explanatory power, not information volume**.

That criterion forbids the naive execution: a research engine with no corpus
produces ontology, and ontology is volume. So this cell is the ENGINE that
structurally cannot inflate, not the model:

- every node typed `observed | inferred` (mandatory; never silently proven);
- an **invariant with no falsifier is REFUSED** — a valid claim must include a
  way to be wrong;
- competing hypotheses **coexist**; the graph never collapses them without an
  independent falsification event (append-only negative graph);
- a falsification attempt counts **only if independent** of the invariant's
  lineage (the anchor-cut again);
- `explanatoryPower()` counts **surviving falsifiable invariants**, never node
  count — PG5 proves 100 unfalsifiable adds raise power by 0 (the LNOS analog
  of the planner's D3).

```bash
node helen/principle-graph.test.js   # 7/7; exit 0 iff the law holds
```

This is the engine. Running it on a real organization needs a corpus, an
operator designation, and PII clearance — held for the operator.

## EVOLUTION_KERNEL_V0 — from archive to engine

The principle-graph stores what survives; this cell turns the archive into a
lab. Five named primitives, all built as governed objects (never documents)
under the same anti-inflation discipline:

- **transformation genome** — a successful transformation reduced to a slotted
  structure (`start_state · trigger · constraint · new_capability · mutation ·
  stable_invariant · evidence`). A genome missing a slot or carrying no
  evidence is REFUSED; new cases are **compared** to genomes, not merely
  stored. (archive → engine)
- **capability transfer log** — capabilities are flows, not property. A
  transfer is logged only when it **moves** (same context → `NO_MOVEMENT`) and
  only when the movement is **independently witnessed** (the seam again). An
  invariant may *emerge* from a threshold of distinct destinations — never from
  intuition.
- **conservation law / survival score** — instead of "what is true", ask "what
  remains true after repeated transformations". `survival_score` = the count of
  **distinct independent contexts** a structure survived. Restating a counted
  context adds 0; a same-lineage observation adds 0. **Survival is not usage** —
  EK5 proves 100 mentions raise `usage_count` to 100 and `survival_score` by 0
  (the conservation analog of the planner's D3).
- **maturity states** — `hypothesized < observed < verified`. Maturity never
  silently upgrades; only INDEPENDENT evidence raises it, and `verified` needs
  independent replication. Repetition is not verification.
- **evolution kernel** — given a partial case, propose the next **experiment**:
  a falsifiable hypothesis (`maturity: hypothesized`) carrying a mandatory
  falsifier, drawn from the best-matching genome — never a prediction or a
  conclusion. Memory → lab.

```bash
node helen/evolution-kernel.test.js   # 8/8; exit 0 iff the law holds
```

Proven on **synthetic genomes only**. Populating it with a real organization's
entities, people, or confidential strategy is operator-gated and PII-held — the
real canonical data an operator may supply is not committed to this repo.

## HELEN_MASTER_REGISTRY_V0.1 — the constitutional inventory

Built as V0 in answer to the consolidated recap, upgraded to V0.1 under
the Director's CONSOLIDATE order (git history preserves V0). The registry
is the address book, capability map and constitutional inventory — and
every column of the Director's record schema is an **admission gate**:

- **closure embargo** — maturity `tested`/`operational` and evidence
  `proven` all refuse to register without a receipt (a path in this repo +
  the exact replay command). NO RECEIPT → NO SHIP, structurally (MR1).
- **canonization and authority are not grantable here** — `status:
  canonical` and any `authority_level ≠ none` require an operator seal
  reference; authority defaults to none (MR3). Exactly ONE entry is
  canonical: the frozen V0 game, sealed by the operator-authored CLAUDE.md.
- **kernel sovereignty** — no entry may declare write access to a
  sovereign surface (kernel truth · sovereign ledger · replay · identity ·
  sovereign memory rules); every entry is auto-fenced from all five (MR4).
  This is the autoresearch boundary, structural.
- **reported never inflates proven** — testimony registers, is preserved,
  and adds zero to the proven fold (MR6). Ceremony must not impersonate
  progress.
- **skills are extracted, never invented** — the UZIK and Manucurist
  families register with zero members by design (MR2).
- **verification is measured, not asserted** — an injected filesystem
  probe checks every receipt against the actual repo; phantom receipts are
  flagged `RECEIPT_PATH_MISSING` and excluded (MR5/MR7). The engine itself
  has no fs.

The 2026-07-27 fold (42 entries): **12 proven-verified artifacts** (9
helen cells + 3 game harnesses) · 4 other-lane artifacts `reported ·
unknown` (checked absent here) · 7 roles `specified` · 10 frames
`imagined` · 8 skill families · **1 pilot protocol `specified`** whose
execution is HELD (real corpus + operator GO + PII clearance + out-of-repo
destination; the pilot subject is a real private individual, deliberately
not named in this public repo).

```bash
node helen/master-registry.test.js   # 8/8; MR5 measures the real registry
                                     # against the real filesystem
```

## HELEN_CONSTITUTION_V0.1 — the freeze, made measurable

The Director's other CONSOLIDATE deliverable: capture the current
architecture so no future conversation silently changes the meaning of
HER, HAL, CHRONOS, DIRECTOR, MAYOR, Goblins, HELEN OS or LNOS.

36 elements, each marked `canonical | provisional | hypothetical |
deprecated | unresolved` — and the freeze is not prose: `foldHash()` folds
every element into one deterministic FNV hash, **pinned in the test**. Any
silent redefinition breaks the suite; amending is lawful (edit → re-pin →
commit — the git diff is the amendment record). Canonical is **earned**:
every canonical element must cite the running test suite or
operator-authored file that enforces it (C3) — 14 qualify. The 8 core
identities are all `provisional` (none self-canonized; the seal is the
operator's). The 2026-07-27 fold: 14 canonical · 13 provisional · 4
hypothetical · 2 deprecated (including the PURPLE breakthrough label and
invent-before-register itself) · 3 unresolved.

```bash
node helen/constitution.test.js   # 6/6; C2 is the pinned freeze
```

## Growth sequence

```
anchor-cut seam (this)  →  loop-graph schema  →  distinction planner
  →  minimal loop selector  →  agent embodiment  →  Goblin Village
```

Each step is its own witnessed proof. The Village is the last layer, not
the first — and each goblin will embody one distinct correction loop
(character is the interface, the loop is the soul).
