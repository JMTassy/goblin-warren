authority=false · claim=NO_CLAIM · non-sovereign · status: PILOT

# Mechanisms #6–8 — falsifier runs and pilots (2026-07-31)

## #8 Contradiction register — falsifier RUN (falsifier8.js, deterministic, 1000 playthroughs)

`{runs:1000, proposals:20037, recurrences/playthrough:1.18, opposing_verdict_hits:0}`

Split verdict. The numeric threshold survives (1.18 ≥ ~1), but **zero opposing
verdicts in 20,037 proposals** — and the reason is structural, not statistical:
ownership is monotone in V0 (owned never relocks), so ACCEPTABLE↔DENY flips are
near-unreachable; only ACCEPTABLE↔HOLD occurs, which #8 itself excludes.
**Disposition: demoted to ledger-only instrumentation.** Its real value begins
only in a future version where territories can relock. Rerun: `node
experiments/gate-supervision/falsifier8.js`.

## #6 Reason codes — PILOTED, falsifier PENDING DATA

Render-zone only: `uiPropose` now derives the fired branch (R0 membrane /
R1 not-owned / R2 bypass-shaped / R3 insufficient ZOL), shows it in the HAL
line, logs `HAL_REASON`. The falsifier (operator decisions indistinguishable
with vs without codes → remove from UI) **requires operator behavior data that
does not yet exist**; the pilot is what generates it. Not falsifiable today —
that is a statement about data, not a pass.

## #7 Seal-fatigue interrupt — PILOTED, falsifier PENDING DATA

Render-zone only: admit streak + seal latency tracked; ≥7 straight admits or a
seal faster than a third of the running median triggers a confirm and logs
`SEAL_INTERRUPT`. Deny/hold reset the streak. Falsifier (interrupted seals no
more error-prone than uninterrupted → delete, unearned friction) runs later on
collected `SEAL_INTERRUPT` ledger data.

Reducer untouched; suite 35/35. New event kinds (`HAL_REASON`,
`SEAL_INTERRUPT`) are additive; all asserted kinds unchanged.
