# BOUNDED_CONTINUITY — ingestion record + canon proposal

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->
Source: operator synthesis across all epochs + memory scan (2026-07-20),
converging independently with the same-day back-office/front-office
architecture proposal. Status: **PROPOSAL**, tested where the repo permits,
**UNWITNESSED IN THIS ARTIFACT** where it names systems that don't exist here.

## The one correction that matters
As literally stated — *"memory accumulates → patterns become visible →
HELEN resumes prior work"* — this describes a system with cross-session
persistence. **V0 canon has none, by explicit law:** CLAUDE.md: *"ZOL is
session-only. No localStorage, cookies, backend, or any persistence
surface, anywhere in the file."* So the claim is false of this repo's
canon as stated, and true of nothing observed here yet. What *is* true and
now proven (below) is the bounded half without the accumulation half:
within any session, and across the five sovereign-writer artifacts, memory
may grow and diverge — but only the admitted subsequence is ever
sovereign. Cross-session persistence (three clocks, boot-memory, Lulu
receiving media across sessions) is **reported, not observed**: it belongs
to a system this repo doesn't contain, and would be a first for V0 canon
specifically, whose no-persistence law is a hard invariant, not an
oversight.

## The formal law (proven, not just claimed)

```text
⟦PROOF::BOUNDED_CONTINUITY⟧
Ledger(A) ≠ Ledger(B)            narratives diverge — real, not a no-op
Digest(A) ≠ Digest(B)            full memory diverges
Project_gov(A) = Project_gov(B)  sovereign projection converges
where Project_gov(S) = (S.admitted, S.phase, S.level)
```

This is the **dual of replay determinism**, not a restatement: determinism
holds *output identity under input identity*; bounded continuity holds
*governed-output identity under history divergence*, exactly as long as the
admitted subsequence is unchanged. Both collapse to one sentence:
**sovereign state is a pure function of the admitted evidence sequence, and
of nothing else** — not narrative volume, not elapsed noise, not how many
free lessons, VERIFYs, or failed quizzes happened along the way.

## What is delivered now (non-canon, needs no seal)
`bounded-continuity.test.js` — **4/4**, module digest `demo-fnv1a:bfed2530`.
Two full-game playthroughs (clean vs. deliberately noisy: stuttered
scratching, extra VERIFY detours, the stone-template free-lesson taken,
failed-then-retaken quizzes at every gate, a differently-shaped tap/rest
rhythm) reach **identical** `(admitted, phase, level)` while their ledgers
and full digests **provably differ** — and a negative control confirms an
actually-different admitted subsequence does *not* converge, so the
property is bounded, not vacuous.

Corroborating evidence, re-confirmed live this session (not cited from
memory): root canon 29/29, vertical slice 34/34, Policy Loom 55/55 (its
digest-staleness KILL tests are this law's *temporal* axis — a decision
bound to old digests is refused no matter how well-remembered), Metabolism
20/20 (its Memory Orchard — append-only, typed relation, `authority:false`
— is this law's *accumulation* axis). This file adds the fourth,
previously untested axis: divergence across a **full session's narrative**.

## The convergence with the back-office/front-office proposal
This is the same discovery from the product side. Line up the vocabularies:

| This proof | The proposed architecture |
|---|---|
| `Project_gov(S) = (admitted, phase, level)` | `sovereign_state: HELEN_LEDGER` |
| everything outside `Project_gov` (ledger noise, companion chatter, VERIFY detours) | `world_projection: NON_SOVEREIGN` |
| "narrative diverges, sovereignty converges" | `narrative_may_explain_but_never_authorize` |
| a world object must trace to an admitted event | `no_world_object_without_backend_reference` |
| `proposeCompanionLine` is a pure view, zero mutation (R11) | `no_npc_speech_may_mutate_state` |
| the quiz gate: play proposes, verification admits | `no_external_action_without_approval` |

The `{"world_object": "sealed_film_reel", "projection_of": "artifact:film-0042", ...}` shape in the architecture proposal is, structurally, a Memory
Orchard record with a game skin. **If Lulu-as-mailbox / Warren-as-front-office
is ever built, this test file is close to its literal acceptance test**:
divergent player narrative across the Warren must never perturb what HELEN
actually admitted, and every world object must resolve back to a receipt.

## Held for operator — two separate holds, do not conflate
1. **Naming `BOUNDED_CONTINUITY` as a canon law** (referenced from
   CLAUDE.md / a constitution corpus) — a law-surface write, same class of
   hold as `COGNITIVE_ACCESS_IS_NOT_AUTHORITY_V1` and the metabolism seam.
2. **The back-office/front-office architecture itself** — declaring
   `goblin-warren` a "front office of HELEN OS" is a repo-identity and
   cross-repo commitment, not a code change. It touches: whether this
   repo's canon (currently sole-authored V0, explicitly *not* HELEN-branded
   in its own README) gets re-scoped; whether Lulu/mailbox persistence
   (cross-session memory) gets built *at all*, which V0's no-persistence
   law currently forbids outright; and how `helen-os` and `goblin-warren`
   relate as repos going forward. None of that is mine to decide by
   building toward it quietly — it's exactly the kind of divergence the
   operating law requires surfacing, not assuming.

## Disposition (yours)
`SEAL_LAW` (adopt BOUNDED_CONTINUITY as canon) ·
`APPROVE_ARCHITECTURE` (commit to backoffice/frontoffice split — this would
open a large, separately-scoped body of work: Lulu mailbox, goblin↔function
mapping, cross-repo state-projection contract) · `KEEP_AS_IS` (proof stays
a non-canon curiosity) · `HOLD`.
