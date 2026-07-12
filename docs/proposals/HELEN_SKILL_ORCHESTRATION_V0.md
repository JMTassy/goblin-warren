<!-- authority=false · claim=NO_CLAIM · non-sovereign · design packet, not a work order -->

# HELEN Skill Orchestration V0 — design packet (operator brief)

```yaml
classification: HELEN_ORCHESTRATION_PROPOSAL
target_repo: not goblin-warren
authority: false
canon: false
ledger_effect: none
implementation_status: unbuilt
repo_evidence: audited 2026-07-12, see §15
```

## 1. Status and non-claims

This is a design proposal, not a work order. It claims nothing about
this repo's runtime, admits nothing to any ledger, and grants itself
no authority.

- Not built. No code in this packet has been written or run.
- Not for `goblin-warren`. `target_repo` is a separate HELEN
  orchestration surface; the Warren stays a game.
- Not evidence of anything running today — see §15 for what was
  actually found by grep on 2026-07-12.
- Selection quality over generation volume: the point is not to grow
  more skills faster, it is to know, from evidence, which skill
  should have run and whether the one that ran did its job.

## 2. HELEN/Warren separation

```
WARREN  ⊂  presentation / simulation / pedagogy
HELEN_ORCHESTRATION  ⊂  operational infrastructure
```

- One-way arrow only: orchestration may use Warren as a visualization
  surface (render its own state through Warren's pixel/DOM idiom).
- `WARREN ⊬ HELEN_ORCHESTRATION` — nothing the Warren does can cause
  HELEN orchestration to change skills, thresholds, or roles.
- The Warren gains **no** skill graph, **no** meta-optimizer, **no**
  autonomous role creation. Ever, under this packet.

**Warren-safe dramatization subset** — the only mechanics from this
packet that may ever land in the game, and only as their own future
bounded slice under `/warren` law: observe, object, evaluate, hold,
admit-by-operator, replay. Explicitly excluded from the game,
permanently: recursive self-improvement, kernel growth, skill
ecology.

## 3. Cathedral organs

Seven organs, each with one job. No organ substitutes for another.

| organ | role | law |
|---|---|---|
| 🔴 Sanctum | constrain-only | never generates, never ranks — only forbids |
| 🟣 Nave | possibility space | enumerates candidates, holds no authority |
| 🔵 Scriptorium | knowledge / registry | source of typed facts and Skill Cards |
| 🟢 Tribunal | validation | checks candidates against Sanctum's constraints |
| 🟠 Choir | display-metadata-only | emotion ⊬ priority/authority/truth |
| 🟡 Forge | cost / budget | plan rejected if Σcost > budget |
| ⚪ Gatehouse | single ranked next action | emits exactly one action, never a batch |

Choir is the one organ most likely to be misread as a decision-maker
because it carries affect/mood signals — it is display metadata only.
No priority, authority, or truth value may be derived from it.

## 4. Skill taxonomy

Ten categories, each with a type signature. One primary category per
skill — a skill that needs two is two skills.

| category | type signature | notes |
|---|---|---|
| Sensor | `env → Observation` | reads, never interprets |
| Classifier | `Observation → Label` | closed label set |
| Researcher | `Query → EvidenceSet` | gathers, does not conclude |
| Synthesizer | `EvidenceSet → Draft` | combines, does not validate |
| Critic | `Draft → ObjectionSet` | finds problems, proposes no fix |
| Evaluator | `Draft → Score` | scores; must not be the generator |
| Planner | `Goal, Constraints → Plan` | never executes its own plan |
| Executor (rare) | `Plan → Effect` | the only category permitted side effects; gated |
| Recorder | `Effect → Receipt` | append-only, never edits history |
| Optimizer | `TraceSet → RepairProposal` | proposes only, `OPTIMIZER ↛ APPLY` (§14) |

## 5. SKILL_CARD_V2

```yaml
skill_id: <string>
version: <semver>
organ: <owning subsystem name>
category: >-
  one of: Sensor | Classifier | Researcher | Synthesizer | Critic |
  Evaluator | Planner | Executor | Recorder | Optimizer
authority:
  authority: false
  admission: forbidden
  ledger_effect: none
interface:
  input_type: <typed>
  output_type: <typed>
forbidden_surfaces:
  - kernel
  - reducer
  - ledger
  - secrets
  - deploy
execution:
  deterministic: <bool>
  idempotent: <bool>
  timeout_s: <int>
cost_model:
  unit: <tokens|calls|seconds>
  budget: <int>
evolution:
  mutable: [prompt, thresholds, triggers]
  immutable: [authority, forbidden_surfaces, output_schema]
```

Mutable fields are the only ones a loop-B/loop-C proposal may ever
touch (§7, §12). Immutable fields require a new `skill_id`, not an
edit — this is what makes `|ΔS_t| ≤ 1` (§13) checkable.

## 6. Typed skill graph

Edges are typed and schema'd: `(from_skill, to_skill, edge_type,
data_schema)`. An edge that does not validate against both skills'
`interface` types does not get to exist.

Allowed edge:

```yaml
from: researcher.web_search
to: synthesizer.draft_writer
edge_type: data_flow
data_schema: EvidenceSet
status: allowed
```

Forbidden edge:

```yaml
from: optimizer.repair_proposer
to: reducer_mutate
edge_type: control_flow
data_schema: n/a
status: forbidden
reason: non_sovereign_boundary
```

No optimizer output may target a reducer-mutating surface directly —
`AUTORESEARCH ↛ REDUCER`. Every optimizer edge terminates at a human
gate (§14), never at an effectful skill.

## 7. Three-loop cadence

| loop | scope | frequency | symbol |
|---|---|---|---|
| A | task execution — every request | every request | τ_A |
| B | skill quality — evaluator feedback | every 20–50 runs | τ_B |
| C | architecture — graph/role change proposals | every 100–500 runs | τ_C |

Never merged. `τ_A ≪ τ_B ≪ τ_C` — a single bad task never reaches
architecture; architecture change requires accumulated, cross-run
evidence from loop B, not a single loop A outcome.

## 8. Ten-phase autoresearch cycle

Loop C's internal shape, when it runs at all. Every phase is
evidence-in, evidence-out — no phase may write to a kernel, reducer,
or ledger (`AUTORESEARCH ↛ KERNEL`, `AUTORESEARCH ↛ REDUCER`,
`AUTORESEARCH ↛ LEDGER`; see §10).

1. **Observation** — collect raw traces from loop A/B runs.
2. **Compression** — cluster traces into recurring patterns.
3. **Hypothesis** — propose a candidate cause for a repeated failure.
4. **Falsification** — actively try to disprove the hypothesis against
   held-out traces.
5. **Candidate repairs** — enumerate possible fixes (mutable fields
   only, §5).
6. **Counterfactual replay ΔQ_R** — replay held traces under each
   candidate, measure quality delta.
7. **Cost-risk score** — score each surviving candidate on cost and
   blast radius.
8. **Survivor selection (exactly one)** — pick a single candidate;
   ties do not both survive.
9. **Human gate** — operator reviews per §14; nothing applies without
   this step.
10. **Verify and record** — after operator admission, verify the
    applied change against the original failure and record the
    receipt.

## 9. Metrics

| metric | definition |
|---|---|
| routing precision | fraction of runs where the chosen skill matched the evaluator's post-hoc best skill |
| routing regret | quality gap between chosen skill and best-available skill, summed over runs |
| operator correction rate | fraction of proposals the operator edits or rejects at §14 |
| duplicate skill ratio | skills with >X% interface/behavior overlap ÷ total skills |
| trace completeness | fraction of runs with a full RUN_V1 record (§11) |
| evidence grounding rate | fraction of Researcher/Synthesizer outputs citing retrievable evidence |
| skill utility `U(s)` | weighted function of routing precision, cost, and dormancy for skill `s` |
| dormancy | runs since a skill was last selected |

`dormant AND duplicate AND untested ⇒ deprecation candidate` — all
three, not any one, before a skill is even proposed for removal.

## 10. Failure controls

| failure mode | control |
|---|---|
| skill inflation | new skill forbidden unless the graph cannot express the task **and** ≥3 distinct failures support the need |
| prompt drift | hash + fixtures + replay test on every mutable-field change |
| authority drift | `authority=false` is machine-checked, not just declared |
| evaluator capture | generator ≠ evaluator, enforced at the graph-edge level |
| metric gaming | holdout traces the optimizer never sees + operator-correction rate as a check on the metric itself |
| recursive complexity | one repair per cycle (`|ΔS_t| ≤ 1`, §13); no new organ without repeated, independent evidence |

Boundary laws, machine-checkable, referenced throughout this packet:

```
AUTORESEARCH ↛ KERNEL
AUTORESEARCH ↛ REDUCER
AUTORESEARCH ↛ LEDGER
```

## 11. Minimal data schemas

```yaml
# RUN_V1 (condensed)
run_id: <uuid>
skill_id: <string>
input_hash: <string>
output: <typed, per skill's output_type>
cost: <int>
evaluator_score: <float | null>
timestamp: <iso8601>
```

- `OBSERVATION_BATCH_V1` — a timestamped array of `RUN_V1` records
  plus a `cluster_id`, produced by §8 phase 2.
- `FAILURE_CLUSTER_SET_V1` — a set of `cluster_id`s with a shared
  hypothesis string and falsification result, produced by §8 phases
  3–4.

## 12. First three implementation slices

Each slice below is **ASPIRATIONAL — NOT FOR THIS REPO**.

1. **SKILL_REGISTRY_V1** *(ASPIRATIONAL — NOT FOR THIS REPO)* — typed
   catalog of skills as Skill Cards, no execution logic.
2. **WORKSPACE_TRACE_V1** *(ASPIRATIONAL — NOT FOR THIS REPO)* —
   observable per-run traces (input, skill chosen, output, cost) with
   no write path into any kernel.
3. **SKILL_EVALUATOR_V1** *(ASPIRATIONAL — NOT FOR THIS REPO)* — a
   separate evaluator skill scoring traces against category-
   appropriate criteria; produces recommendations, not mutations.

Automated mutation proposals are permitted only after all three exist
and have accumulated enough loop-B evidence to satisfy the ≥3-failure
bar in §10.

## 13. One-change control law

`|ΔS_t| ≤ 1` — at most one bounded state change per cycle, selected
by:

```
argmax over candidate repairs of ( ΔQ − λ·C − μ·Risk )
```

where `ΔQ` is the counterfactual quality delta from §8 phase 6, `C` is
cost, and `Risk` is blast radius. Without this bound, attribution is
impossible: a batch of simultaneous changes leaves no way to know
which change caused which downstream effect, which breaks every
metric in §9 that depends on before/after comparison.

## 14. Operator gate

The optimizer proposes; it never applies. `OPTIMIZER ↛ APPLY` is
absolute — no code path in this packet lets loop C or loop B write
directly to a skill, an organ, or a kernel surface.

At the gate, the operator sees, and only the operator admits:

- the observed failure
- the evidence behind it
- the proposed repair (one, per §13)
- expected gain (`ΔQ`)
- risk (blast radius, `Risk`)
- the test plan
- the rollback plan

No field may be omitted; a proposal missing any of the above is not
gate-eligible.

## 15. Evidence-status table

Audited against this branch, 2026-07-12. `EXISTS` = found at the cited
site. `UNSEEN_FROM_CURRENT_REPO` = zero grep hits on this branch (may
exist elsewhere in the lineage — not claimed absent, only unseen here).
`ASPIRATIONAL` = named only in vision/prompt docs, no code.

| component | evidence (file:line) | status |
|---|---|---|
| pushReplay (receipts) | game.js:356 | EXISTS |
| resolveProposal (operator gate) | game.js:3530 | EXISTS |
| applyVerdictStamp (bounded daily choice) | game.js:2045 | EXISTS |
| compostStaleMemories (log fold) | game.js:388 | EXISTS |
| Oracle (reading-not-ruling UI) | game.js:4935, index.html:182-190 | EXISTS (expressive only) |
| "sandbox" | index.html:12, game.js:2 | EXISTS as label, not component |
| HAL (checkProposalWithHAL) | 0 hits this branch | UNSEEN_FROM_CURRENT_REPO |
| council (councilReview) | 0 hits | UNSEEN_FROM_CURRENT_REPO |
| logEvent ledger | 0 hits (superseded by S.replay) | UNSEEN_FROM_CURRENT_REPO |
| Mayor | docs/DUAL_MODEL_LOOP.md:13 only | ASPIRATIONAL (vision-doc mention) |
| autoresearch | docs/HELEN_OS_ARCHITECT_PROMPT.md et al. only | ASPIRATIONAL |
| HER, Librarian | 0 hits anywhere | ASPIRATIONAL |

⚠️ **DISCREPANCY** — CLAUDE.md and the `warren` skill's SKILL.md
describe a frozen V0-canon `index.html` (REDUCER-BEGIN/END markers,
HAL, council, logEvent, `node selftest.js index.html`). This branch's
`index.html` is a 216-line shell that loads `game.js`; it does not
contain those markers or functions. `selftest.js`'s marker-regex
extraction likely cannot find a REDUCER zone here and likely cannot
pass (**inferred from grep, not executed** — no test run was performed
for this packet). This is a reconciliation question for the operator,
separate from and prior to anything in this packet. Do not resolve it
here.

---

The Warren models governance. HELEN runs orchestration. The Warren
must not become the orchestrator.
