# Governance Type System

**Thesis:** turn HELEN doctrine from conventions reviewers must *remember* into
structural invariants a linter can *enforce*. This is the natural continuation
of Tier 1 (`p.verdict ⊬ admission`): that fix replaced a convention with a
predicate; this replaces the whole doctrine with a checkable type discipline.

## One frontier, three maturity levels

The six proposed frontiers are consumers of a single substrate — a registry of
**forbidden morphisms** (`X ↛ Y`):

| Level | Name | What it is |
|---|---|---|
| **L0** | Morphism Linter | Greps code/docs for semantic promotions; the runnable checker. |
| **L1** | Forbidden Morphism Registry | Doctrine-as-data. Every review collapses to one question: *did any forbidden morphism occur?* |
| **L2** | Governance Type System | Semantic types + lint/compile-time forbidden conversions. The registry becomes a type lattice. |

The other four are **lenses over the same registry**, not separate systems:
- **Claim → Receipt Compiler** — the morphism `Claim ↛ LedgerFact` applied to prose: a claim word with no receipt token = `NO_RECEIPT`.
- **Opus Autoresearch** — searches for *inhabitants* of forbidden morphisms (duplicated authority, cached truths, mutable witnesses). One fruit per run.
- **Sonnet Constitutional Verifier** — checks a patch introduces no new forbidden morphism and strengthens ≥1 invariant. Pass/fail.
- **Architectural Pressure Map** — visualizes *where* forbidden morphisms cluster. Invariant coverage, not code coverage.

Build the registry + linter (L0/L1) and all six follow.

## Semantic type lattice (grounded in this repo)

Each type names a real inhabitant in `v2.html`, so the discipline is checkable
here, not abstract:

| Type | Inhabitant in code | Authority? |
|---|---|---|
| `Narrative` | persona `line`, `AURA_LINES`, LLM proposal text | none |
| `LLMOutput` | `generateProposalText()` result (external nondeterminism) | none |
| `Candidate` | a freshly `pickProposalAgent`'d proposal, pre-check | none |
| `Proposal` | `S.pending` | none — requests, never mutates |
| `Projection` | cached `p.verdict`, HUD text, `auraWeather()` output | none — display only |
| `Witness` | a *fresh* `checkProposalWithHAL(S,p)` evaluation | evidence, not decision |
| `Authority` | the admit-time predicate + the player's admit click | **sole mutator** |
| `LedgerFact` | an appended `logEvent` entry | recorded, append-only |
| `ReplayFact` | a fact reconstructable by folding the ledger | **uninhabited until Tier 2** |
| `State` | `S.territories[].state/level`, `S.zol`, `S.reputation` | the governed world |

## Forbidden morphism registry (v0 — grounded)

| Morphism | Why | Enforcement today |
|---|---|---|
| `Projection ↛ Authority` | cached verdict can't gate admission | **code** (Tier 1, v2) · **waiver** (v1 canon) |
| `Proposal ↛ State` | proposing ≠ mutating the world | code (`createProposal`/`check`/`council` are non-mutating) |
| `LLMOutput ↛ Truth` | the model narrates, HAL decides | code (same deterministic gate for template/LLM) |
| `Narrative ↛ LedgerFact` | story is not a receipt | code (ledger entries are structured `kind`s) |
| `Proposal ↛ LedgerFact` | a proposal existing ≠ an admitted fact | code (only admit/deny/hold emit facts) |
| `Render ↛ State` | UI never mutates canon | convention (UI zone) — **linter target** |
| `Cache ↛ Witness` | a stale value can't stand in as fresh evidence | Tier 1 generalized — **linter target** |
| `Claim ↛ LedgerFact` | asserting ≠ recording | **linter target** (Claim→Receipt) |
| `Memory ↛ ReplayFact` | `S` is mutated memory, not a fold | **doc-only** until Tier 2 |

## Waivers (honesty about frozen canon)

A forbidden morphism in frozen code is not hidden — it is **waived, with a
reason**. Hiding is the violation; recording is the discipline.

- **Waiver W-1:** `index.html` `admitProposal` inhabits `Projection ↛ Authority`
  (reads cached `p.verdict`). *Reason:* V0 canon, byte-identical to the vault
  copy, frozen. The Tier 1 fix lives in `v2.html`. The linter records this as a
  waiver, not a pass.

## ReplayFact is uninhabited

No value in v0/v2 is a `ReplayFact`. Therefore any sentence asserting
"replayable" over these files is `NO_RECEIPT` until Tier 2 lands an
event-sourced fold. This mechanizes *replay claims require replay receipts* —
the linter can fail the build on an unbacked replay claim.

## Maturity ladder

1. **L0 now:** `morphism-lint.js` — runs like the selftests, checks the highest-value grounded morphisms, exits nonzero on violation. Locks Tier 1 structurally (regression guard) and enforces reducer purity.
2. **L1 next:** externalize the registry as data; add the Claim→Receipt doc linter; add waiver support.
3. **L2 later:** semantic-type annotations (JSDoc `@type Projection` / `@type Authority`) + a checker that rejects forbidden conversions at lint time. The type lattice above is the schema.

## Why this is the continuation of Tier 1

Tier 1 proved one morphism (`Projection ↛ Authority`) structurally, in one
function, with two tests. The Governance Type System is that same move applied
**once, to the whole doctrine** — so the next reviewer (human or model) never
has to remember the rule, because the linter already refuses the code.
