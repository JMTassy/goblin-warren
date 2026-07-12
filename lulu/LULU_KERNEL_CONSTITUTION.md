# LULU KERNEL CONSTITUTION — v2.0 Candidate
<!-- authority=false · claim=NO_CLAIM · non-sovereign · playable sandbox only -->

## Namespace law (Architect correction 1)

These are **LuluLocalEvents** in a **LuluEventLog**.

    LuluLocalReceipt ≠ HELENGovernanceReceipt

They are NOT HELEN receipts, NOT ORACLE attestations, NOT a canonical ledger.
The game borrows the event-sourcing *pattern* without inheriting governance
*authority*. No artifact in `lulu/` may use the words canonical, sovereign,
admitted-as-truth, or attestation about itself. (Voice validator enforces
a forbidden-language scan; see LULU_VOICE_CONTRACT.md.)

## The core formula (corrected)

    Lulu_t = Replay(LuluEventLog[0:t]) + Render_voice(state_t)

    Lulu ≠ raw LLM · Lulu ≠ static pet · Lulu ≠ governance authority
    Lulu = deterministic local body + generative voice
         + provenance-bound memories + persistent relationship
         + terrible priorities

The body is replayable. The voice is surprising. The gap between what the
voice proposes and what the kernel admits is the comedy — and the personality.

## Hash-chain & replay contract

- Event: `{kind, payload, prev_hash, hash}` ·
  `hash = sha256(schemaVersion | kind | canonical_json(payload) | prev_hash)`.
- Genesis `prev_hash = "LULU-GENESIS"`. `verify_chain` rejects any tamper.
- **State is never stored.** It is always `replay(log)` — bit-identical
  (gate-tested). Mood is a *derived reading* of state geometry (8 moods),
  never a stored value; a rendered MOOD_EXPRESSION is display, not state.
- Refused candidates leave the log byte-identical (gate-tested).
- `schemaVersion "1.0"` pinned; other versions refused at the gate.

## Time law (Architect correction 2)

Time passage is an explicit event: **one `ABSENCE_TICK_BATCH` per return**
`{fromTs, toTs, elapsedBuckets}` — never thousands of individual ticks.
- One bucket = 30 minutes. Elapsed capped at **7 days** (336 buckets):
  a manipulated device clock cannot destroy her.
- `toTs ≤ fromTs` (clock backward) refused. Overlap with already-replayed
  time refused. `elapsedBuckets` recomputed and cross-checked by the gate.
- Core Formula as test: replay at T+Δ differs from T with zero care actions.

## Deterministic / generative split (Architect correction 6)

**Canonical event** (hashed, replayed): archetype + bounded effects.
**Rendering** (never hashed): the prose. Same event may be re-narrated
into different sentences forever; state replays identically forever.

    event truth deterministic · story rendering generative

The admission gate physically refuses prose fields inside ABSENCE_EVENT.

## Bounded absence effects

Per ABSENCE_EVENT: each need |Δ| ≤ 5 · |zolDelta| ≤ 10 · objects ≤ 1.
The absence story is generative and infinite; its material consequences
are constitutionally capped (gate-tested).

## Seeded randomness (Architect correction 4)

    seed = sha256(previousHash ‖ intentId ‖ schemaVersion)

Never LLM-supplied. The kernel selects among admissible candidates and
records `{selectedIndex, selectedOutcome, seedDigest}` in the event.
Replay exact; same chain + same intent → same outcome (gate-tested).

## Memory law (Architect correction 5)

MEMORY_NOTE is `status: "INTERPRETIVE"` — an interpretation, never fact.
- Must cite existing events (`sourceEventIds`, provenance gate-checked).
- Mutates nothing: needs, ZOL, room, requests all unchanged (gate-tested).
- May be contradicted by the log. Lulu may misremember gracefully;
  the event history stays exact. "The record is trying to distract me."

## Never death

Neglect → cave (`CAVE_DWELLER`), never deletion, never zero-out beyond
clamps. Reconnection is always admissible: one TALK exits the cave,
clears the streak, and lands connection above the threshold (gate-tested).
No guilt mechanics. Curiosity to return, not fear of loss.

## Council coupling law (Architect correction 7)

Lulu state → influences creative proposal *style* → never influences
admission. Export is bands, not values; advisory only; read-only; manual
export first (no live coupling in v2.0):

    {"source":"LULU_LOCAL_GAME","advisoryOnly":true,
     "energyBand":"LOW|MID|HIGH","curiosityBand":…,"connectionBand":…}

Forbidden: mood changing a governance threshold, affection changing a
verdict, Lulu state entering Mayor/Reducer inputs, any live value as an
authority signal. (Gate asserts bands-only shape + advisoryOnly:true.)

## Revised v2.0 MVP boundary (Architect verdict)

1 soul contract · 1 local event schema · 1 append-only hash chain ·
3 needs · 8 derived moods · 4 care verbs · 1 deterministic absence engine ·
1 structured absence event · 1 generative rendering layer · 1 evolving room ·
1 request queue · 1 Council influence hook (export) · 1 offline fallback.

**Postponed:** embeddings, judge ensemble (post-v2.0; MVP voice pipeline =
schema validation + forbidden-language scan + max-length + persona examples
+ deterministic fallback), 30-day drift study, live HELEN coupling,
multiplayer, cross-Warren federation.

## Status (claim-typed)

- KERNEL + 16 CONSTITUTIONAL GATES: **WITNESSED**
  (`python3 lulu/selftest_lulu.py` → 16/16, exit 0).
- ROADMAP: v1.9 → v2.0 **Candidate** Roadmap — "shipped" is embargoed
  until repository, test outputs, deployment and device behavior are
  witnessed end-to-end.
- OPEN (operator): voice language (FR/EN/code-switching) — blocking only
  for tone calibration (step 19). Council coupling: manual export first.
