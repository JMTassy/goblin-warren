# Adversarial review #3 — methods-and-rigor referee (executed verification)

<!-- authority=false · canon=false · ledger_effect=none -->
Reviewer: independent Sonnet context; authored nothing under review.
Verdict: **PASS_WITH_CORRECTIONS** (3 corrections, all applied in E12).

## Executed (all re-run live by the reviewer, 2026-07-17)
| Suite | Article claims | Actual | Match |
|---|---|---|---|
| node selftest.js index.html | 29/29 | 29 passed, 0 failed | MATCH |
| slice-selftest.js | 30/30, digest demo-fnv1a:070d6d5c | 30/30, digest identical | MATCH (exact) |
| npc-selftest.js | 15/15 | 15/15 | MATCH |
| epoch3.test.js | 16/16 | 16/16 | MATCH |
| policy-loom.test.js | 55/55 incl. KILL-01..12 | 55/55, all KILLs present | MATCH |

(ACP 51/51 lives in the helen-os repo per the article's own §12 wording —
out of this repo's scope, consistent, not a discrepancy.)

## Code facts: ALL CONFIRMED with file:line
Closed 9-action surface (slice-core.js:244-247); throw-before-write
(:250-253); admitLevel definition :224 + sole call :412 (QUIZ_PASSED
branch); SKY_HINT_ACCURACY=8 (:55) with independent hash seeds ':hint:' vs
':conf:' → confidence uncorrelated by construction; spacing 1.1 vs fall 3.0
(:51-52); 8×0.8=6.4>5 (:59-61); LEDGER_CAP=250 (:72, splice :167); shell:
zero direct S. writes (all reads; dispatch → SC.applyEvent), zero
storage/network surfaces outside comments.

## Citation spot-check: 8/8 VERIFIED, 0 fabrications
park2023generative · clark1987wilson · segal2011gestural · wouters2013meta
(effect sizes in ledger match: d=0.29 learning / 0.36 retention) ·
chi2025_performance_or_governance (DOI 10.1145/3706599.3719951) ·
oecd_ec_ailit2026 (pub. 17 June 2026, 4 domains/19 competences) ·
wang2024nemobot · johnsonglenberg2017physics.

## Hypotheses
H1-H3: IV + measure + explicit refutation each; referenced elsewhere only
hedged. H0: lacked explicit refutation clause (correction 3).

## Reproduction
§12 steps 1-2 followed literally: work exactly as written, digest matches
BUILD_RECEIPT_MAP exactly. Internal cross-references R1-R13/CM ids all
resolve; abstract's numbers match executed reality.

## Corrections required (all applied in E12)
1. §5 companion-policy sentence violated the paper's own ban list ("The
   load-bearing property… guarantees…") → replaced with "A load-bearing
   property… the policy's action follows from… nothing here asserts…".
2. Symbol collision: 𝒫 used both for AI-Pet scale (§4) and policy context
   (§5/A8 Γ signature) → policy context renamed 𝒦 in both places.
3. H0 refutation clause appended: "no difference in
   governance-discrimination outcomes between the two curriculum
   orderings."

## FABRICATIONS_FOUND: 0
