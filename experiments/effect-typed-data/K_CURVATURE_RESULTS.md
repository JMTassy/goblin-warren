authority=false · claim=NO_CLAIM · non-sovereign · status: MEASURED

# K(belief) — epistemic curvature measured on the Warren (2026-08-01)

K(belief) = number of ledger events whose replay is required to re-derive the
belief from the event stream alone, plus the frozen law surface (TERRITORY_DEFS
prices, the prestige formula, PERSONAS cost functions). 200 deterministic
playthroughs (`node experiments/effect-typed-data/k_curvature.js`).

## The headline: the convergence theorem holds at V0 scale

**full_state_convergence: 200/200.** ReplayEvents(ledger) == reducer state for
all 7 beliefs in every run. The Warren's ledger is a COMPLETE receipt system:
every belief is re-derivable from events + frozen law, nothing needs the live
state. This is a working micro-instance of Reducer(ReplayReceipts) ==
ReplayEvents — small, but real and green.

## Measured curvature

| belief | mean K | replay match | reading |
|---|---|---|---|
| zol | 55.8 | 200/200 | highest curvature — every earn/buy/admit touches it; most expensive to revise, hardest to fake |
| knowledge | 32.2 | 200/200 | high |
| reputation | 22.6 | 200/200 | high |
| levels | 22.6 | 200/200 | high |
| ownedCount | 6.9 | 200/200 | mid |
| compost | 6.3 | 200/200 | mid |
| held | 5.6 | 200/200 | mid — fog is the cheapest belief to revise, as fog should be |

The ordering is meaningful: the ECONOMIC beliefs carry the deepest history
(K≈56) while the ATMOSPHERIC ones (fog, compost) are lightest. Curvature
tracks exactly what the governance treats as load-bearing. Cap horizon: 0/200
runs hit the 250-event cap at 40 steps; past the cap, replayability would
truncate — K has a horizon, worth an assertion in any longer-lived version.

## The instructive failure on the way

First run: levels failed replay 198/200. Cause: the replayer assumed
INCREMENT semantics for GARDEN_EVOLVED; the receipt actually carries ABSOLUTE
state ("name L<n>"), and evolveTerritory caps at L3 while still receipting.
The ledger was right; the reader was wrong. Fixing the READER — never the
ledger — achieved 200/200. Lesson, stated once: replay semantics live in the
receipt, and a replayer that assumes instead of reading is itself a drift
source. (Design note, no action: admission at L3 still costs full ZOL and +2
reputation for a no-op evolution — you pay for the blessing, not the level.
Economically consistent, receipted, and now measured.)

---

## Addendum 2026-08-01 — ReplayBasis (Director's correction, measured)

The Director's refinement: K should be |ReplayBasis(b)| — minimal receipt
subset sufficient to reconstruct b — not replay length. Measured by
single-event ablation over 20 deterministic runs (`k_basis.js`):

| belief | K_len | K_basis | finding |
|---|---|---|---|
| levels | 22.3 | **4.9** | **supersession, 4.5× compression** — GARDEN_EVOLVED receipts carry absolute state ("L3"); only the last per territory is load-bearing |
| zol | 55.4 | **53.2** | **null-effect receipts** — HER's admissions cost 0, so they sit in the dependency cone but not the basis. "Beauty pays nothing" is now a measured basis-degeneracy |
| all others | = | = | incremental receipts: basis = cone, every receipt load-bearing |

Two distinct mechanisms shrink a basis, and the Warren exhibits both:
(1) **supersession** — absolute-state receipts retire their predecessors;
(2) **null effect** — receipts lawfully priced at zero. K_len − K_basis > 0 is
therefore not one phenomenon, and the decomposition matters for any replay
optimizer.

**Locality property: 20/20.** Appending receipts that touch nothing (tag
events) left every belief and every K unchanged — the property holds
empirically on all beliefs, all runs. Monotonicity holds trivially in these
data (no ablation ever *decreased* a basis). The revision property awaits a
version with supersession-rich dynamics.

Formal object now instantiated: **(B, ⪯, K)** with b₁ ⪯ b₂ ⟺ K(b₁) ≤ K(b₂),
read as historical-dependency order, not importance. Measured chain:
held ⪯ compost ⪯ ownedCount ⪯ levels* ⪯ reputation ⪯ knowledge ⪯ zol
(*levels by basis, not length — the order itself changed under the correct
definition, which is the correction earning its keep).
