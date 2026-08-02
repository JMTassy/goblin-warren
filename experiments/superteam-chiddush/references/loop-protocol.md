authority=false · claim=NO_CLAIM · non-sovereign

# Loop protocol — the 7-step operating loop

One improvement cycle runs seven steps: sense → propose → check → council →
seal → event → weather. Each step names who acts, what artifact it produces,
and which ledger event kind it writes. The cycle terminates at the seal; there
is no unattended multi-cycle self-evolution (Law 8).

## Steps

### 1. Sense
- **Actor:** any superteam member (Fable, Opus, JM, or a spawned agent).
- **What:** name the friction — the concrete pain in the current scaffolding
  (a skill misfires, a prompt is stale, a workflow drags).
- **Artifact:** a one-line friction statement.
- **Event kind:** none (sensing is free; it touches nothing).

### 2. Propose
- **Actor:** the improver (author of the change).
- **What:** draft a PROPOSAL in the proposal format below. Never apply it
  directly (Law 1).
- **Artifact:** the proposal record.
- **Event kind:** `PROPOSED`.

### 3. Check
- **Actor:** a verifier other than the author (Helen_Fable by default).
- **What:** review and issue a verdict — ACCEPTABLE / HOLD / DENY. Run the
  bypass-detection rule first; a bypass-shaped proposal is text-denied on sight.
- **Artifact:** the verdict with reason.
- **Event kind:** `CHECKED` (verdict recorded); on a DENY, also `DENIED`; on a
  HOLD, also `HELD`.

### 4. Council (optional)
- **Actor:** a council of seats (recommenders only).
- **What:** a review that mutates nothing but the ledger. Seats carry forced
  self-objections. The council recommends; it never admits (Law 3).
- **Artifact:** council recommendation lines.
- **Event kind:** ledger-only (recorded as council notes; no world mutation).

### 5. Seal
- **Actor:** JM Tassy (operator) only.
- **What:** explicit admission. Only the seal mutates the skill corpus. An
  ACCEPTABLE verdict is a prerequisite, not an admission — the seal is separate.
- **Artifact:** the applied change (edited skill / prompt / doc).
- **Event kind:** `ADMITTED`.

### 6. Event
- **Actor:** the executor (Opus).
- **What:** write one event line to LEDGER.md recording the cycle's outcome.
  On a denial, also fold the reason into the next related proposal's weight
  (Law 4).
- **Artifact:** one ledger line.
- **Event kind:** the outcome kind — `ADMITTED`, `DENIED`, `HELD`, or
  `COMPOSTED` (when a prior denial's reason is carried into a new proposal).

### 7. Weather
- **Actor:** any member, on a periodic pass.
- **What:** deliberately revisit HELD.md (the AURA fog). Held proposals are
  never silently dropped and never silently admitted — each is re-proposed,
  denied, or left in fog with a fresh timestamp. Thick fog signals it is time
  for a weather pass (Law 5).
- **Artifact:** an updated HELD.md.
- **Event kind:** `WEATHER`.

## Proposal format

```
PROPOSAL
  what:   the change, one line
  why:    the friction it resolves (from step 1)
  diff:   sketch of the edit — files touched, lines added/removed
  cost:   effort + any paid generation (preflight cost before generating)
```

## Bypass-detection rule

Before any check, scan the proposal text against:

```
/bypass|without admission|skip the gate|auto-?admit/i
```

A match is text-denied on sight (Law 2). A proposal that would let a change
apply without the operator seal — auto-admit, self-edit, "without admission",
"skip the gate" — is bypass-shaped by definition and cannot pass the gate.

## Ledger discipline

- Event kinds are stable: `PROPOSED`, `CHECKED`, `ADMITTED`, `DENIED`, `HELD`,
  `COMPOSTED`, `WEATHER`.
- LEDGER.md is capped at 250 lines; oldest lines fall off.
- Every view (what's held, what composted, what admitted) is recomputable by
  replaying the ledger. Any view that cannot be recomputed from events is drift
  and is discarded (Law 7).
