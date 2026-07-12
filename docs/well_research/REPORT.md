# THE WELL — FINAL RESEARCH REPORT (epochs 1-22)
<!-- authority=false · claim-typed · swarm receipts: epochs_1-19.json, verdicts_20-22.json -->

**Method:** 14 agents total. 8 observers (16 datasets, WITNESSED card facts),
3 synthesis lenses (9 hypotheses), 3 hostile refuters with literature search
(all three top hypotheses attacked; default = refuted). 630k research tokens.

## Verdict summary — the gate decided

| Hypothesis | Verdict | What survives |
|---|---|---|
| VRMSE>1 = macrostate-degeneracy fingerprint | **REFUTED** — Lyapunov decorrelation alone drives the metric to √2>1 in single-attractor chaos; the exclusion of "chaos alone" is false | Multistability as one *distinct, checkable contributor* to surrogate failure — a diagnostic, not a fingerprint |
| Fate-Replay Benchmarking as new principle | **REFUTED** — it renames the DSR / climate-vs-weather evaluation paradigm (Gilpin, Durstewitz-group, PhyxMamba); fate-classification also rewards mode collapse; multistability-from-one-genesis in the Well is an untested premise | A narrow new *metric instance*: basin-agreement score on viscoelastic_instability with a mode-collapse guard — unpublished, small, real |
| Receipt-Gated Rollouts as new mechanism | **REFUTED** — ProbConserv (2023), ACE/ACE2, CAMulator already enforce conservation at inference without retraining | Two corners: budget-closure gating on *driven-dissipative* (non-invariant) systems with honest 4-arm ablations; and **reject-and-resample among stochastic candidates by receipt validity** — the genuinely unexplored piece |

## The three things that actually survived

**1. The admission gate that SELECTS, not corrects (research).**
Prior art projects a single deterministic prediction back onto the constraint
manifold. Nobody has published the HELEN-shaped version: a *stochastic*
surrogate proposes N candidate futures, and an inference-time gate admits the
one whose physical receipts close. Selection-among-proposals vs correction-of-
one-proposal is exactly Proposer ⊄ Verifier, and the refuter itself flagged it
as "the only genuinely under-explored corner." CANDIDATE — one experiment away.

**2. The Ledger-Indexed Regime Atlas (game — unrefuted, buildable now).**
Gray-Scott's two knobs (feed/kill) map onto the Warren's governance state;
quantized real-trajectory frames become ambient weather addressed by the
state hash. Every ingredient exists (cheap 2D data, auraWeather seam, replay
determinism). No shipped game drives its ambient world from provenance-
carrying scientific simulation data. Testable on children (regime
classification transfer >50% vs chance).

**3. Three cheap decisive experiments, fully specified (the program).**
(a) VRMSE-vs-horizon on a known single-attractor turbulent dataset — kills or
crowns the degeneracy diagnostic. (b) 50 perturbed rollouts from one
viscoelastic genesis snapshot, cluster the fates — decides whether fate
benchmarking has a subject at all. (c) 4-arm gate ablation (no gate / receipt
gate / matched physics-agnostic clamp / placebo gate) on a pretrained FNO —
decides if receipts beat generic stabilizers. All reuse existing data and
checkpoints: inference cost only, no training runs.

## The meta-finding (the quiet crown)

Three plausible, exciting, well-argued hypotheses — each of which would have
made a great blog post — died under adversarial review with citations, and
each left behind a smaller true thing. The swarm architecture (propose →
hostile refute → keep reduced forms) IS the Warren's constitution applied to
research: enthusiasm proposes, the gate admits, and what survives has
receipts. "I attempted seven hats. The gate permitted one."

## Witnessed numbers worth keeping (from the cards)

- 2D→3D of the same physics: 6.9 GB → 744.6 GB, ~100 → 34,560 CPU-hours (~×100 both axes).
- turbulent_radiative_layer_2D: whole 90-trajectory ensemble cost ~100 CPU-h,
  yet FNO/TFNO score VRMSE ≈ 0.50 (barely beats predicting the mean); best
  CNextU-net 0.1956. Cheap to make ≠ easy to learn.
- Every model does worse on the 3D version than its own 2D score.

## Status

- Epochs run: 22 of 50 authorized. **Stopping here on diminishing returns:**
  epochs 23-50 require actual compute (the three experiments), not more
  reading. NEEDS_ME: whether to run experiment (b) — it is the cheapest and
  decides the most.
