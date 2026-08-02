# HELEN_FULL_METABOLISM_V0

```text
status: PROPOSAL
authority: NONE
canon: FALSE
```

<!-- non-sovereign · ledger_effect=none -->

Ingested from the operator's metabolism refinement (2026-07-17). The parent
"Full Metabolism" prose it refines (five vessels, Memory Orchard imagery,
Empty Chair) is **UNWITNESSED IN THIS ARTIFACT**:

```text
Reported by existing HELEN materials:
- persistence is intended;
- sovereign and non-sovereign layers are distinguished;
- transition legality is emphasized;
- mature orchestration remains incomplete.

Current implementation status: UNWITNESSED IN THIS ARTIFACT.
```

## Constitutional center

> **Energy and information may circulate through the system, but
> sovereignty never does.**

Star topology: worker_i → HELEN → worker_j. No peer-to-peer authority
transfer, no prompt inheritance, no provenance loss, no recursive consensus
amplification.

## The three tightenings (adopted verbatim)

1. **Orthogonal statuses, not one enum.** epistemic (observed | inferred |
   proposed) × action (not_attempted | attempted | changed | failed |
   unknown) × evidence (untested | tested_pass | tested_fail |
   inconclusive) × review (unreviewed | reviewed_clear |
   reviewed_with_objections) × admission (candidate | held | admitted |
   rejected | revision_requested). An artifact truthfully occupies a
   compound state; "VERIFIED" as a single word is a semantic-promotion trap.
2. **Verification decomposed.** V_schema (0/1) · V_scope (0/1) ·
   V_behavior (pass/fail/inconclusive) · V_governance (admissible /
   insufficient / forbidden). **tests passed ⊬ claim verified.** Pipeline:
   CHANGED → STRUCTURALLY CHECKED → BEHAVIORALLY TESTED → REVIEWED →
   ADMISSION DECISION.
3. **Memory preserves supersession.** new record ≠ overwrite old record;
   new record = append + typed relation (supersedes / contradicts /
   derived_from, all resolvable). Original claims, contradictions, and
   authority levels are all retained.

## Nine organs

M0 intake compiler (no work while ambiguous) · M1 preflight gate (fail
closed) · M2 distinction planner (critical pairs C_Y) · M3 warren selector
(smallest worker set separating all critical pairs; else
INSUFFICIENT_OBSERVABILITY → HOLD_FOR_OPERATOR) · M4 bounded cognition
(narrow role, schema-bound output, zero inherited authority) · M5 candidate
action (builders only, pinned commit, isolated worktree, Δ: S_base →
S_candidate) · M6 witness production (deterministic; never auto-admits) ·
M7 adversarial review (adds objections, never erases evidence) · M8 memory
+ operator admission (A ∈ {ADMIT, HOLD, REJECT, REVISE}; only ADMIT creates
canonical state).

## Seven conservation laws

1. **Authority conservation** — Auth_out(g) ≤ Auth_in(g); workers get 0,
   so 0 out.
2. **Evidence non-creation** — Producer(c) ≠ IndependentWitness(c).
3. **No status strengthening without a witness** — every promotion needs a
   witness satisfying the transition predicate.
4. **Provenance preservation** — Prov(a) ≠ ∅ for every derived artifact.
5. **Mutation isolation** — Δ(S_candidate) ∩ S_canon = ∅ until admission.
6. **Replay determinism** — for components *claimed* deterministic; model
   prose is not deterministic merely because temperature is zero.
7. **Human sovereignty** — ¬HumanSeal(x) ⇒ ¬Canon(x). The Empty Chair as
   governance.

## What is implemented in this slice (and receipted)

`metabolism.js` + `metabolism.test.js` — the spec's own recommended first
seam, **task manifest → preflight → one read-only worker → normalized
packet → HOLD_FOR_OPERATOR**, receipt `METABOLISM_SEAM_V0` **20/20**,
module digest `demo-fnv1a:ba91cf72`. The load-bearing proof is negative
and passes: a worker response self-asserting
`admitted / tested_pass / reviewed_clear / authority:true / canon:true /
seal` is stripped to `proposed · not_attempted · untested · unreviewed ·
candidate`, every bypass attempt is flagged into the packet, a report
cannot cite itself into evidence, and **no ADMIT code path exists**
(statically asserted). Laws 1, 2, 3, 4, 5, 7 are executable checks; Law 6
is honored by scope (nothing in this slice is claimed deterministic that
isn't). Schemas: `schemas/helen-task-manifest.v0.json`,
`schemas/helen-run-packet.v0.json`.

Not implemented in this slice, by design: M2 distinction planner, M3 warren
selector, M5 builders, M7 adversarial review as live agents. Those are the
next seams, each behind its own receipt.

## Divergence note (approximate-pointer law)

The spec places artifacts at repo-root `docs/proposals/` and `schemas/`.
This repo's PR contract is "one fenced directory, canon untouched," so
everything lands under `experiments/metabolism/`. Promoting to root-level
`docs/` + `schemas/` changes the repository's top-level shape and is HELD
FOR OPERATOR along with everything else canon-adjacent.

## Disposition (yours)

`SEAL_STRUCTURE` (promote to root docs/ + schemas/ as the spec names) ·
`NEXT_SEAM` (build M2+M3 distinction planner / warren selector behind the
same discipline) · `KEEP_AS_IS` · `HOLD`.
