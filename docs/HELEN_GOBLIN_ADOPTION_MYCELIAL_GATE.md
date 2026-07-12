# HELEN_GOBLIN_ADOPTION_MYCELIAL_GATE
<!-- authority=false · canon=false · ledger_effect=none · receipt_effect=none -->
<!-- status=PROPOSAL_GRADE · pinned 2026-07-12 by operator instruction -->

```
CANDIDATE_ID:
HELEN_GOBLIN_ADOPTION_MYCELIAL_GATE_2026-07-12
storage_status: unverified
test_status: unverified
authority: false
canon: false
ledger_effect: none
HOLD_FOR_OPERATOR
```

**Membrane correction, applied:** the sentence *"J'ai sauvegardé cette
couche dans la mémoire HELEN… Vérification mémoire: 20/20 tests passés"*
is not receipt-backed anywhere in this repository and is replaced by the
typed block above. No storage or test status is claimed that a command
cannot cite. (For the avoidance of doubt: that sentence was never uttered
by this session either; the block exists so the claim can never be
smuggled in later.)

## The architectural core (affirmed)

- **Adoption localises care** — care gets an address (WITNESSED: `adopt-gates.js` 7/7).
- **Mycelial Gate propagates consequences** — care gets a path (**NOT BUILT**: the router below is proposal-grade).
- **Absence becomes a visible event** (WITNESSED: absence fold, humors, composting).
- **Reducer preserves authority boundaries** (WITNESSED: V0 seam; this build's stamp-gated doors).
- **Replay preserves verifiable memory** (WITNESSED: compost-replay gates).

## The most important invariant

```
goblin_state → render/proposal effects
goblin_state ↛ governed truth
```

Mood, attachment, neglect, and "egregore coherence" may be **expressive**
forever; they may never become **evidence**. The living-game layer stays
vivid without ever buying admission. This invariant is now
**gate-enforced in this repo**: `membrane-gates.js` (see below).

Supporting architecture: expressive inputs pass through typed, bounded
governance traces before influencing execution; only explicit
ALLOW → INITIATE → TERMINATE chains satisfy an obligation.
*(Source: `WUL_ORACLE_INTEGRATION.md` — **REPORTED**; that document lives
in the vault, not in this repository.)*

## The clean V1 loop (proposal — not yet built)

```
CareAction
  → CareCharge
  → AdoptedGoblinState
  → MycelialGateRoute
  → Signal | Decompose | Redistribute | Quarantine | Transform
  → GardenMutationCandidate
  → HAL review
  → Reducer boundary
  → receipt-backed effect or compost
```

Build note for whoever picks this up: `MycelialGateRoute` must be a pure
function of (event, state) — five named routes, deterministic, no clock,
no randomness in the routing decision — and its output is always a
**candidate**, never an effect. The reducer boundary is the only door.

## Final lock

> Adoption gives care an address.
> Mycelium gives care a path.
> HAL gives the path scrutiny.
> Reducer gives truth a boundary.
> Replay gives admitted state a memory.

## Claim typing

- The affirmations above marked WITNESSED: gates cited, runnable.
- The Mycelial router + HAL review loop: **PROPOSAL_GRADE / NEEDS_ME** —
  awaiting the operator's stamp as its own bounded slice.
- The invariant `goblin_state ↛ governed truth`: **WITNESSED as of this
  commit** — `membrane-gates.js` asserts it directly.
- WUL-ORACLE integration details: **REPORTED** (vault document, unseen here).

*HOLD_FOR_OPERATOR. The stamp is the only door.* 🍄
