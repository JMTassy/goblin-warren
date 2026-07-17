# LAW_TABLE — the canon step, HELD FOR OPERATOR

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->

## What the swarm cracked
The 42-goblin swarm's single surviving SYSTEMIC_BREAKTHROUGH (1 of 5 forged
designs cleared all three independent HAL skeptics — novelty, lawfulness,
buildability):

> The lineage's load-bearing invariant — *"`evolveTerritory` has exactly one
> caller, and it is `admitProposal`"* — stops being **doctrine** (prose in
> CLAUDE.md + a behavioural assertion at `selftest.js:61`) and becomes a
> **generative, kill-tested static assertion** read off a declared manifest.

Verified true on disk (this session): `evolveTerritory` defined
`index.html:271`, sole call at `283` inside `admitProposal` (`276`); the
only other caller `uiAdmit` (`501`) is *after* the `REDUCER-END` marker
(`307`), outside the reducer text the selftest extracts. Baseline suite: 29.

## What is already delivered (needs no seal — `experiments/`, reads canon)
`derive-sovereign-writer.js` — the **DERIVE + KILL spine**. It reads the real
`index.html`, extracts the reducer zone with the selftest's exact regex, and
proves the sole-caller invariant generatively over canon as it stands:
- **DERIVE** `evolveTerritory` sole-caller = `admitProposal` → ACCEPTABLE.
- **KILL(a)** splice a second caller into `checkWin` → DENY (2 call sites).
- **KILL(b)** manifest lies about the gate → DENY (call site outside claimed body).
- **KILL(c)** structural floor: a live world-mutator must be declared.

Receipt: `SOVEREIGN_WRITER_DERIVED_V1`, 4/4, reducer_digest
`demo-fnv1a:2d2eb964`. It mutates nothing; canon stays byte-identical.

## The canon step — REQUIRES YOUR SEAL
The design's deeper form relocates `LAW_TABLE` **into** `index.html`'s
reducer zone as the single source of the manifest, and adds a second sealed
writer of identical shape — `adoptLawTable(seal, decision)` behind an
`OPERATOR_SEAL`, digest-bound to the pre-change table, `E_STALE` on drift —
so the Warren admits changes to its own governing law through the same gate
it defines for the world. **No prior sovereign-writer artifact governs its
own governing constants**; that reflexive closure is the genuinely new
capability.

This step is held, not taken, because it is **sacred-canon mutation**:

1. It edits `index.html` + `selftest.js` — the root canon I have kept at
   29/29 untouched all session.
2. It **breaks the "byte-identical to the vault copy" property** that
   CLAUDE.md's genealogy section treats as load-bearing. That is a property
   only you can trade away.
3. `adoptLawTable` + `OPERATOR_SEAL` + digest-binding + `E_STALE` depend on
   the Policy-Loom machinery (`experiments/policy-loom/policy-loom.js` — it
   exists and carries those symbols, but is not wired into canon).

### If you seal it, the honest step-1 (minimal, in-canon)
- Add `LAW_TABLE` (one row per canonical verb) inside the reducer zone —
  **an ADD**, no marker renames, no `QUESTIONS/PERSONAS/TERRITORY_DEFS`
  renames.
- In `selftest.js`, reuse the already-extracted `m[1]`; for each
  `mutatesWorld:true` row, derive the sole-caller invariant and add one KILL
  assertion. Suite goes **29 → ~31**, all green.
- Print the `LAW_TABLE` FNV digest so step-2's `adoptLawTable` can bind its
  `E_STALE` check to that exact table.

### Watch-points the swarm named (not violations, but guard them)
- Step-1 introduces **no persistence and no new authority** — clean under
  V0 law. The risk is downstream: any "lesson kept across resets" wording
  must stay **declarative** (re-taught each session from `LAW_TABLE`), never
  a persisted event, or it breaches no-persistence-in-V0.
- `TEACH` / `PRINT` / `SIMULATE` readers are, in isolation, restatements of
  existing capability; the novelty lives in **manifest-as-single-source +
  DERIVE + the reflexive adopt gate**, not the readers alone.

## Runner-up (cleanest fallback if LAW_TABLE is judged too ambitious)
*"One gate for all proposers: `agent='model'` is a new **proposer**, never a
new **writer**."* Lawful and buildable now; it failed only on novelty (a
faithful restatement of the admission invariant). It is the correct lawful
shape for admitting AI-generated proposals into the Warren, and composes as
a consumer of `LAW_TABLE`'s declared gate.

## Disposition (yours)
`SEAL_STEP_1` (add LAW_TABLE + derive/KILL into canon, accept vault
byte-identity break) · `SEAL_FULL` (also wire adoptLawTable reflexive gate) ·
`KEEP_NON_CANON` (leave the deriver in experiments/ only) · `RUNNER_UP` ·
`HOLD`.
