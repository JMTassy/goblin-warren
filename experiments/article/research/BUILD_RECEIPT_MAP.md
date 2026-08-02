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
| R6 | Vertical slice L0: 3-stone assembly gate; ~20s sustained scratch with idle decay; ignition produces LEVEL_CANDIDATE, never admission | slice-selftest 34/34 (v2.1), assertions "L0: …" ×4 | 2026-07-17T10:29Z (E17 stone template), receipt core_digest demo-fnv1a:2835ee02 | PASS |
| R7 | Vertical slice L1 (Pluie Sonore): drops overlap by construction; deterministic 0.75s beat grid — true notes catch only on-beat, off-beat bounces rewardless and penalty-free; note/faux indistinguishable in core data until VERIFY; companion hum fallible incl. confidently-wrong; stone-template cost: first catch of each hazard class = free lesson (logged, uncounted, survives resets), repetition = counted mistake; 4th counted mistake resets level | slice-selftest 34/34 (v2.1), assertions "L1: …" ×8 | same receipt | PASS |
| R8 | Vertical slice L2 (Tambour, replaced fragile whisk): rest structurally required (8s in-band resonance costs 6.4 fatigue > 5 cap — CADENCE_FATIGUE_RATE, slice-core.js); strain locks drum; rest cools/unlocks + breaks stream; clatter penalized; long silences restart stream without penalty | slice-selftest 34/34 (v2.1), assertions "L2: …" ×6 | same receipt | PASS |
| R9 | Vertical slice progression is governed: gameplay completion → CANDIDATE; quiz ≥2/3 is the only admission path; `admitLevel` has exactly one call site (comment-stripped static scan) | slice-selftest 34/34 (v2.1), gate assertions ×4 | same receipt | PASS |
| R10 | Vertical slice determinism: no Math.random/Date/DOM/storage in the core (comment-stripped scan); identical action script → byte-identical digest; ledger capped 250 | slice-selftest 34/34 (v2.1), ×3 | same receipt | PASS |
| R11 | Companion expression cannot mutate: free text has no action kind; unknown action throws pre-mutation; `proposeCompanionLine` digest-neutral | slice-selftest 34/34 (v2.1), boundary assertions ×3 | same receipt | PASS |
| R12 | Playable UI shell v2 (Pluie Sonore + Tambour + WebAudio, gesture-gated) renders the three scenes and reaches DONE end-to-end in a real browser | headless Chromium drive-to-DONE: 0 console errors, DONE reached (5/5 on-beat notes, 0 mistakes; resonance 8.18/8, 0 strains, 0 clatters), 3 screenshots; shell grep: 0 direct state writes, 0 storage/network/entropy surfaces outside comments, whisk residue = 1 comment | 2026-07-17 ~09:20Z | PASS |
| R13 | Root canon untouched by all of the above | `node selftest.js index.html` → 29/29 | 2026-07-17T01:37Z after slice build | PASS |

## Forbidden inference (from HAL review 1)
No row above supports: learning outcomes, retention, attachment effects,
quiz efficacy, independence of replications, cryptographic integrity of
digests, or bypass-proofness of seals. Rows R1-R11 are structural facts
about code plus same-author suites executed on the dates shown.
