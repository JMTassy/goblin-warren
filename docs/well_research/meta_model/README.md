# HELEN-META-1 — "The Volatility Compass"
<!-- authority=false · claim-typed · built 2026-07-12 from server-side reads only -->

## What this is

A meta-model **of the surrogate models**, assembled from two things The Well
ships but has never joined:

1. **`stats.yaml`** in every dataset repo — per-field `std` and `std_delta`
   (statistics of the fields AND of their per-step changes), computed by the
   corpus authors over the full 15TB. We define the **volatility** of a
   dataset as ν = mean over field channels of `std_delta / std` — the
   fraction of a field's spread that moves in a single timestep. Pure data;
   zero downloads; WITNESSED via `hf_fs` server-side reads (raw files in
   `stats/`).
2. **The published benchmark tables** on each card — VRMSE for two spectral
   architectures (FNO, TFNO) and two local ones (U-net, CNextU-net) —
   harvested verbatim (`benchmarks.json`, incl. oddities: rayleigh_taylor
   "every model >10", MHD's literal "3561" typo, PNS-merger's missing
   U-nets).

Define R = mean(spectral VRMSE) / min(local VRMSE): R > 1 means local wins.

## The finding (CANDIDATE, pre-registered here before any human reviewed it)

**ν predicts which architecture family wins: Spearman ρ(ν, R) = 0.736,
n = 15, permutation p = 0.0014** (100k shuffles, one-sided, seed 42).

The compass reads cleanly at the extremes:
- ν ≥ 0.37 (7 datasets): local convolutional wins **every time** — up to
  R = 33 on acoustic_scattering_maze.
- ν ≤ 0.13 (5 datasets): spectral operators win 4/5 — down to R = 0.10 on
  helmholtz_staircase (FNO better by 60×).
- Decision rule "ν > 0.30 → train local" scores 12/15 vs 11/15 majority
  baseline; the rank correlation, not the thresholded rule, is the result.

Physical reading: ν is a shipped, two-number proxy for how much sharp,
fast-moving structure the dynamics carries per step. Violent per-step
change (interfaces, scattering fronts, plastic events) favors local
convolutional inductive bias; slow smooth evolution favors global spectral
bases. Known residuals worth keeping honest: euler_multi_quadrants
(ν = 0.195 but local wins — shocks are sharp *in space* while slow per
step) and gray_scott (ν = 0.084, R = 1.42, marginal).

## The honest negatives (as important)

- ν does **not** predict absolute difficulty: Spearman(ν, best-VRMSE) =
  0.45 with LOO R² = −0.15. Don't use the compass to guess scores.
- The three catastrophic/absent-benchmark datasets (rayleigh_taylor >10,
  both acoustic hold-outs) sit at LOW ν (0.28–0.34): whatever kills
  surrogates there, it is not per-step volatility — consistent with the
  epoch-20 refuter's chaos/degeneracy account.

## Why "unseen so far by humans" is typed CANDIDATE, not certified

Every input number is public. The JOIN — architecture-selection from
shipped normalization statistics across the whole corpus — matched nothing
in our epoch-20–22 literature sweeps (which did surface ProbConserv, ACE2,
Gilpin, PDE-Refiner…). We claim novelty as CANDIDATE pending a proper
prior-art pass; the artifact is reproducible from the committed inputs by
`helen_meta_1` computations documented in HELEN_META_1_results.json.

## Files
- `stats/*.yaml` — 19 raw stats files (WITNESSED, verbatim)
- `benchmarks.json` — harvested VRMSE tables (WITNESSED from cards)
- `volatility_features.json` — ν per dataset
- `HELEN_META_1_results.json` — correlation, permutation p, rule accuracy, full table

## Next decisive test (NEEDS_ME)
Hold-out prediction: the two acoustic datasets without published tables
(discontinuous ν=0.339, inclusions ν=0.326) sit just above the compass
threshold → **prediction: local (CNextU-net) beats spectral on both when
anyone trains them.** Falsifiable by one training run on Red PC.
