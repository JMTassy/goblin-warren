# BUILD_RECEIPT_MAP — implementation claims ↔ executed receipts

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->
Rule: an IMPLEMENTATION_CLAIM may appear in the article only if its receipt
row here says PASS with an actually-executed suite. "NOT DEMONSTRATED"
claims may only appear as FUTURE_WORK, present/future tense.

| # | Implementation claim (article wording constraint) | Receipt | Executed | Status |
|---|---|---|---|---|
| R1 | The V0 game admits world change only through `admitProposal` (sole caller of `evolveTerritory`, index.html:283); HAL judges, council recommends, neither admits | `node selftest.js index.html` → 29/29 | 2026-07-17 this run, + HAL review 1 independent re-run | PASS |
| R2 | The NPC gateway constrains model output to `{speech, emotion, gesture, memory_candidate, curiosity}`; `promoteCandidate` (memory.js:65) is the sole write into companion memory | `node experiments/npc-preview/test/npc-selftest.js` → 15/15 | this run + HAL review 1 re-run | PASS |
| R3 | epoch3 kernel rejects ill-typed epistemic edges without repair; incidence floors status, never inflates proof | `node experiments/epoch3/epoch3.test.js` → 16/16 | this run + HAL review 1 re-run | PASS |
| R4 | HELEN ACP: builder claims are REPORTED-only; operator disposition PENDING unless a human sets it (operator_review.py:35) | `python3 -m pytest tests/acp -q` → 51/51 | HAL review 1 re-run (pytest freshly installed; no CI) | PASS (env-fragility noted) |
| R5 | Policy Loom: `activate()` behind module-private `OPERATOR_SEAL` (policy-loom.js:318-322) is the only path to active policy; 5-digest binding; staleness → E_STALE | `node experiments/policy-loom/policy-loom.test.js` → 55/55 incl. KILL-01..12 | this run + HAL review 1 re-run; + 1 prior adversarial witness pass (12/12 claims, 9 forgery shapes refused) | PASS |
| R6 | Vertical slice L0: 3-stone assembly gate; ~20s sustained scratch with idle decay; ignition produces LEVEL_CANDIDATE, never admission | slice-selftest 30/30, assertions "L0: …" ×4 | 2026-07-17T01:37Z, receipt core_digest demo-fnv1a:070d6d5c | PASS |
| R7 | Vertical slice L1: drops overlap by construction; unrevealed gem/faux indistinguishable in core data until VERIFY; companion hint fallible incl. confidently-wrong; False-Jewel catch = counted mistake with lesson event; 4th mistake resets level | slice-selftest 30/30, assertions "L1: …" ×6 | same receipt | PASS |
| R8 | Vertical slice L2: rest structurally required (8s in-band blend costs 6.4 heat > 5 cap — constant MATCHA_HEAT_WHISK, slice-core.js); overheat locks whisk; rest cools/unlocks; splash penalized | slice-selftest 30/30, assertions "L2: …" ×5 | same receipt | PASS |
| R9 | Vertical slice progression is governed: gameplay completion → CANDIDATE; quiz ≥2/3 is the only admission path; `admitLevel` has exactly one call site (comment-stripped static scan) | slice-selftest 30/30, gate assertions ×4 | same receipt | PASS |
| R10 | Vertical slice determinism: no Math.random/Date/DOM/storage in the core (comment-stripped scan); identical action script → byte-identical digest; ledger capped 250 | slice-selftest 30/30, ×3 | same receipt | PASS |
| R11 | Companion expression cannot mutate: free text has no action kind; unknown action throws pre-mutation; `proposeCompanionLine` digest-neutral | slice-selftest 30/30, boundary assertions ×3 | same receipt | PASS |
| R12 | Playable UI shell renders the three scenes and reaches DONE end-to-end in a real browser | headless Chromium drive-to-DONE | IN FLIGHT (build agent) | PENDING |
| R13 | Root canon untouched by all of the above | `node selftest.js index.html` → 29/29 | 2026-07-17T01:37Z after slice build | PASS |

## Forbidden inference (from HAL review 1)
No row above supports: learning outcomes, retention, attachment effects,
quiz efficacy, independence of replications, cryptographic integrity of
digests, or bypass-proofness of seals. Rows R1-R11 are structural facts
about code plus same-author suites executed on the dates shown.
