# ETA_SEED_001 — Empirical Witness Receipt (V0 reducer)

<!-- authority=false · claim=NO_CLAIM · non-sovereign · ledger_effect=none.
     2026-08-09. First seed planted after the L2/L3 boot acknowledgment.
     This receipt records an EMPIRICAL WITNESS RUN: the ETA V0.1 invariant
     family (χ_gov, χ_mem, χ_med + replay/genesis/non-bootstrap laws) was
     executed against the actual reducer of index.html — the one place in
     the HELEN family where these laws run as code, not prose. The harness
     extracted the reducer with the same REDUCER-BEGIN/END regex the
     selftest uses; index.html was READ ONLY and is unmodified. -->

**Scope discipline (referee-safe):** ETA V0.1's open transport problems (AT, RT, ICT, RIT, BCA functoriality, the core groupoid) are category-level research targets — nothing here claims them. What a 180-line game reducer *can* witness is the concrete instance: that the three χ-invariants and the replay laws hold on one real, running admission machine. Witnessed ≠ proved-in-general. `PASS` below means "held on this reducer, on this run, under these probes" — nothing more.

## Witness table — 9/9 PASS

| id | ETA law | probe | result |
|---|---|---|---|
| W1 | **χ_mem** — replay parity: `x₁=x₂ ⇒ H(core(x₁))=H(core(x₂))` | Same action word folded from genesis twice, independently; SHA-256 of full state compared | **PASS** — `e8a9727fea37…` both runs, byte-equal |
| W2 | Genesis stability — `R(s₀,ε)=s₀` well-defined | Two independent `makeState()` calls hashed | **PASS** — identical |
| W3 | **Authority Non-Bootstrap** — `A((S∘G)ⁿ(x))=0 ∀n` | 100 propose→HAL→deny/hold cycles with zero admissions | **PASS** — ZOL, reputation, ownedCount, every territory state+level unchanged; only compost/held/ledger grew (lineage accumulated, authority did not) |
| W4 | **χ_med** (structural) — no proposer bypass | Source scan of the reducer zone: `evolveTerritory(` call sites | **PASS** — exactly 2 occurrences: definition + the single call inside `admitProposal` |
| W5 | **χ_med** (dynamic) — `HAL ≠ ACCEPTABLE ⇒ ΔG = 0` | `admitProposal` invoked on a HOLD-verdict pending proposal | **PASS** — refused; level and ZOL unchanged |
| W6 | **χ_gov** — no receipt = no claim | Full mutation episode; ledger checked for one event kind per mutation class | **PASS** — GAME_STARTED, ZOL_EARNED, TERRITORY_BOUGHT, NPC_PROPOSAL_CREATED, HAL_CHECK_PASSED, PROPOSAL_ADMITTED, GARDEN_EVOLVED all present |
| W7 | Bounded history (V0 session law) | 300 correct answers (~600 events) pushed through `logEvent` | **PASS** — ledger capped at 250 |
| W8 | Council recommends, never admits | State snapshot compared around `councilReview` on a portal proposal | **PASS** — snapshot identical; verdict `RECOMMEND_ADMIT` emitted to ledger only |
| W9 | CWL §2 — no wall-time / randomness in hashed core | Source scan for `Math.random`, `Date`, `performance.now` in the reducer zone | **PASS** — none (determinism comes from the FNV `h32` seeded by state) |

## Reading

- **W1+W9 together are the empirical form of the determinism finding** from the CWL v1.0.1 audit: this reducer passes the exact re-run-and-compare-hashes test that caught `generated_at_unix` in FAILURE_CLUSTER_V1. The V0 reducer has no wall-time in its core, so replay parity holds byte-for-byte.
- **W3 is the Authority Non-Bootstrap theorem run as an experiment**: a hundred compositions of Garden-side operations (propose, judge, refuse) accumulated lineage — compost rose, GOBLIN's proposal weight rose, AURA's fog thickened — and manufactured zero authority. *Novelty accumulates lineage, not authority*, observed live.
- **W4+W5 are χ_med from both sides**: structurally there is exactly one door (`admitProposal → evolveTerritory`), and dynamically that door refuses a non-ACCEPTABLE verdict. In this repo, the seam the wider HELEN project still lists as OPEN is closed — at V0 scale, and the selftest asserts it on every run.
- What this receipt does **not** witness: ETA's transport frontier (AT/RT/ICT/RIT), BCA functoriality conditions, the ETA category/core groupoid. Those need mathematics, not a warren.

## Provenance

- Harness: scratchpad `eta_seed_001.js` (session-local, deliberately not committed — the receipt records the probes fully enough to re-derive it; the repo's canonical harness remains `selftest.js` alone).
- Reducer extraction: identical regex to `selftest.js`; markers untouched; `index.html` unmodified.
- Selftest before and after: 29/29 PASS.

```text
STATUS        : WITNESS RECEIPT (empirical · one machine · one run · re-runnable)
AUTHORITY     : DENY
CANON         : FALSE
LEDGER_EFFECT : NONE
```
