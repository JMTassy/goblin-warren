authority=false · claim=NO_CLAIM · non-sovereign · status: PROPOSED

# EffectTypedDatum V0 — data as material with an effect ceiling

Source: operator (JM), session 2026-07-24 — verbatim core below, amendments
clearly separated. This document is itself typed: `source_class: user_report`,
`epistemic_status: hypothesized`, `authority_ceiling: proposal`. It awaits the
gate it describes. Routing: third layer of the pending skill merge
(law layer: superteam-chiddush · loop layer: governed-self-improvement ·
type layer: this).

---

## The claim (operator's formulation, verbatim core)

HELEN data is not information. **HELEN data is material with an effect
ceiling.** A datum is never just "true" or "useful" — it has a lawful type:

```
D = (payload, provenance, claim_scope, evidence_role,
     authority_ceiling, transform_history)
```

and the core question is: **what is this datum allowed to become?**

### The lawful pipeline — each arrow is a gate; no object skips its gate

```
RawData -> ObservationCandidate -> EvidenceCandidate -> ProposalMaterial
        -> ReceiptCandidate -> AdmissionCandidate -> LedgerReceipt -> ReplayState
```

Forbidden shortcuts:

```
RawData        -/-> Truth
ParsedData     -/-> Truth
Metadata       -/-> Evidence
CHIDDUSHCluster -/-> Receipt
ReceiptCandidate -/-> LedgerReceipt
```

### The three questions (the third is the HELEN move)

1. What does it say?
2. What can witness it?
3. **What effect may it legally have?**

A beautiful cluster may carry high meaning-effect and zero governance-effect.
A boring test log may carry low poetry and strong witness value.

### CHIDDUSH as lens, not judge — output is a typed routing decision

```
chiddush_route:
  COMPOST             meaningful but not actionable
  MOTIF               useful for render/style/memory, not proof
  BEAD_CANDIDATE      small mechanism worth testing
  EVIDENCE_CANDIDATE  may support a claim if witnessed
  BLOCK               dangerous, unsupported, or authority-smuggling
  REQUEST_WITNESS     promising but missing source/proof
```

**CHIDDUSH does not discover truth. CHIDDUSH discovers which transformations
are worth attempting.**

### The forbidden collapse

```
interesting data -> compelling pattern -> confident summary -> accepted belief
```

must be replaced by:

```
interesting data -> candidate pattern -> source-resolved packet -> witness
                 -> operator collapse -> reducer review -> receipt -> replay
```

Anti-ceremony compression: **No witness, no upgrade. No receipt, no ship.
No replay, no state.**

### Schema (operator's V0)

```
EffectTypedDatum:
  datum_id:
  payload_ref:
  payload_hash:
  source_class:
    one_of: [local_file, command_output, user_report, model_output,
             web_source, generated_artifact, test_result, receipt, replay_output]
  epistemic_status:
    one_of: [proven, reported, hypothesized]
  evidence_role:
    one_of: [none, pointer, witness, report_authenticity, direct_support,
             contradiction, replay_input, evaluator_input]
  authority_ceiling:
    one_of: [render_only, memory_candidate, proposal, evidence_candidate,
             receipt_candidate, admission_candidate, ledger_receipt]
  forbidden_effects:
    [kernel_write, ledger_append, canon_promotion, identity_update,
     training_use, external_publish]
  transform_history:
    - {transform_id, input_hash, output_hash, tool_or_model, witness_ref, authority}
```

### Final compression (operator's)

> HELEN data is compost until typed. Typed data is candidate until witnessed.
> Witnessed data is evidence only for scoped claims. Evidence becomes state
> only through receipt, admission, and replay. CHIDDUSH is the organ that
> detects which compost contains a mechanism worth carrying toward the gate.

---

## Witness record — retro-validation against 2026-07-24 material

Run before landing; five real cases, five correct classifications:

| Case | Route under this system | Matches what actually happened |
|---|---|---|
| CHRONOS "simulator outputs" | **BLOCK** — source_class forgery: claimed `command_output`, was `model_output` | Yes — and sharper: fabrication becomes a *type error*, not a judgment |
| φ-scaling central mechanism | BEAD_CANDIDATE → tested → COMPOST with receipt | Yes — exact route taken (`94f60a5`) |
| "OUR LABORATORY" deck verbatim | EVIDENCE_CANDIDATE → witnessed (bilan falsifier run) → admitted | Yes (`715af26`) |
| Founder-name conflict | REQUEST_WITNESS(operator); merge forbidden | Yes — the hold that fired twice |
| Prime chiddush overall | "discovered which transformation was worth attempting" (§1.2a as runnable transform) | Yes — the sharpest retroactive fit |

## Amendments proposed by the verifier (NOT merged into the V0 above)

**A. Add `epistemic_status: invalid`.** Extraction/parse/access failure is a
harness event, not a world-fact (corpus Rule 6; the 146 MB deck case). Without
a fourth value, failures launder into `reported`.

**B. Add an orthogonal `sensitivity_tier: [S0..S3]` and derive
`forbidden_effects` from it.** Proof of need: chiddush #0001's falsifier —
financial data is simultaneously a strong `evidence_candidate` (high evidence
ceiling) and S3-fenced (hard export prohibition). Evidence strength and
export permission are different axes; conflating them made a falsifier that
structurally could not fire.

**C. Witness independence clause.** `witness_ref` MUST NOT identify the author
of the transform it witnesses (law-layer Law 2). A loop witnessing itself is
the CHRONOS mechanism; this clause is the entire defense.

**D. The ratchet law.** `authority_ceiling` is monotone-per-gate: only a
witnessed transform may RAISE a ceiling; any actor may LOWER one. Implied by
the pipeline arrows; stated here so it is load-bearing.

## Status

PROPOSED. Not admitted, not canon. Enters the pending three-layer skill merge
as the type layer. Seal: operator only.
