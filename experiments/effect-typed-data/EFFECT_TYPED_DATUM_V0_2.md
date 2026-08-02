authority=false · claim=NO_CLAIM · non-sovereign · status: PROPOSED

# EffectTypedDatum V0.2 — derived under the ratchet law

## Lineage (this file practises amendment D)

```
parent:            EFFECT_TYPED_DATUM_V0.md   (retains its original ceiling, unmodified)
transform:         DIRECTOR_REVIEW · verdict KEEP_WITH_AMENDMENTS_A_B_C_D_E
transform_author:  operator (architect channel), session 2026-07-27
witness_relation:  operator_observation
receipt:           ledger line CHECKED, 2026-07-27
ceiling(child):    proposal — unchanged; review authorizes derivation, not admission
```

The parent is not edited. This child exists because a witnessed, authorized
transform occurred. That is the ratchet working on its own specification.

## Corrections to the V0 landing (recorded, not erased)

- The "witnessed 5/5" table in V0 is re-typed: `witness_status:
  USER_REPORTED_RETROACTIVE_PASS · local_replay: not performed ·
  receipt_resolution: pending`. Same actor ran and reported the retro-fit —
  relation `same_process`, which cannot witness itself. The result keeps its
  value as a reported pass; it does not carry a receipt it never had.
- CHRONOS re-typed from "forgery" to **`PROVENANCE_MISMATCH`**:
  `render_form: command_transcript · actual_origin: model_output ·
  execution_receipt: absent · claim_of_execution: unsupported`.
  Intent is not established and the type system does not need it.

## Amendment A — processing is not epistemics

INVALID describes the processing event, not the world.

```
epistemic_status:   [observed, reported, inferred, hypothesized, modeled]
processing_status:  [valid, partial, invalid, unreadable, unsupported, quarantined]
```

A failed extraction becomes representable without contamination:

```
epistemic_status: observed
proposition: "the extractor failed on this artifact"
processing_status: invalid
target_claim_status: unresolved
```

## Amendment B — sensitivity orthogonal to evidence

```
sensitivity:
  classification:   [public, internal, confidential, restricted]
  export_policy:    [unrestricted, redacted_only, operator_approved, prohibited]
  retention_policy: [ephemeral, session, governed, permanent]
```

High evidentiary value AND restricted export is not a paradox; it is a valid
coordinate. **Evidence strength ≠ distribution permission.** (This dissolves
the chiddush #0001 falsifier deadlock: the spend data is
`evidence_role: direct_support · export_policy: prohibited` — inspectable
in place, verdict-only export.)

## Amendment C — witness independence as a typed relation

```
witness:
  witness_ref:
  relation_to_transform:
    [same_process, same_model_same_context, same_model_independent_run,
     independent_tool, independent_source, operator_observation, external_audit]
  shared_dependencies: []
  independence_requirements_met: false   # fail-closed default
```

Law: **a transform may describe its own output; it may not independently
witness its own correctness.** A second run is reproducibility evidence, not
necessarily an independent source.

## Amendment D — the ratchet creates descendants

An existing datum never mutates upward in place.

```
ceiling(child) ≥ ceiling(parent) only when:
  transform is authorized
  AND witness requirement passes
  AND receipt exists
  AND lineage is preserved

for the same object:
  ceiling may remain stable
  ceiling may be lowered by safety policy
  ceiling may NOT silently rise
```

History stays true: the model output never became evidence — a new witnessed
object was derived from it, and the child became evidence.

## Amendment E — one datum, one immediate origin

Multiple origins never collapse into one source_class. Composites are typed:

```
bead_A:  { source_class: model_output }
bead_B:  { source_class: user_report, references: [bead_A] }
composite_packet:
  members: [bead_A, bead_B]
  composition_type: quoted_and_interpreted
```

A composite may contain several origins. A datum has one.

## V0.2 required axes

```
EffectTypedDatum:
  origin                 # one immediate origin (amendment E)
  representation
  processing_status      # (A)
  epistemic_status       # (A)
  evidence_role
  current_authority
  authority_ceiling      # ratchet, descendants only (D)
  sensitivity            # classification · export · retention (B)
  permitted_effects
  forbidden_effects      # derived from sensitivity + ceiling
  lineage                # parent refs, preserved always
  witness                # typed relation, fail-closed (C)
  transition_history
  receipt_references
```

## The three-key epistemic lock (the merge's emergent property)

```
ALLOW_TRANSITION(datum, actor, gate) iff
  datum_type permits target effect          # TYPE layer
  AND actor capability permits transition   # LAW layer
  AND gate's required witnesses passed      # LOOP layer
  AND sensitivity policy permits effect
  AND a receipt can be emitted
```

TYPE says it may become this. LAW says this actor may attempt it. LOOP says
the conditions actually passed. RECEIPT says the transition can be replayed.
No single layer can authorize itself: **NO LOCAL SELF-PROMOTION.**

- A datum cannot promote itself through its content.
- An actor cannot promote it through capability alone.
- A passing test cannot promote it without lawful authority.
- An operator decision cannot erase provenance or failed gates.

## Final law

> Nothing becomes authoritative merely by being persuasive, repeated,
> transformed, rendered, remembered, or successfully processed.
> Authority changes only through a new, typed, witnessed, authorized,
> receipt-bearing derivation.

## Status

```
status: PROPOSED
review_result: KEEP_WITH_AMENDMENTS_A_B_C_D_E
retroactive_test: USER_REPORTED_PASS (no local replay receipt)
admission: NOT_PERFORMED
ledger_effect: CHECKED + PROPOSED lines only
operator_sovereignty: preserved
```
