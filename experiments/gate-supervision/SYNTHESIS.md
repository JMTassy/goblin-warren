authority=false · claim=NO_CLAIM · non-sovereign · status: PROPOSED

# Gate Supervision — 20-lens brainstorm, Opus synthesis

Provenance: vision Fable (100 words) → 20 haiku lenses, one angle each,
60 raw mechanisms, 20/20 lenses reporting →
Opus synthesis, re-anchored against the live reducer in index.html.
Run wf_354eff74-f25 · 2026-07-31. Every mechanism carries its own FALSIFIER;
none is law until the falsifier is run and the operator seals.

---

# HELEN Gate Supervision — Synthesis (Opus)

**authority=false · claim=NO_CLAIM · non-sovereign · status: PROPOSED · seal pending**

Grounding note: this synthesis was re-anchored against the actual reducer in `/home/user/goblin-warren/index.html`. `checkProposalWithHAL` is a **pure four-branch function** (locked → DENY, not owned/evolved → DENY, bypass-regex → DENY, `S.zol < p.cost` → HOLD, else ACCEPTABLE), determinism comes from `h32` seeded on `S.actions`, and `admitProposal` is the sole caller of `evolveTerritory`. Sixty candidates collapse to eight once you demand *runnable against that file today*.

---

## TOP 8 (kept)

### 1. Deterministic Verdict Replay on Frozen Preconditions
*merges: Frozen Snapshot Replay Audit, Deterministic Replay Verification, Idempotent Replay Checksum, Ledger Rerun Verification, Verdict Isolation + Deterministic Replay — lenses: adversarial red-team, sampling, self-report drift, replay audit, succession*

**Spec.** At verdict time, record the four inputs the gate actually reads — `t.state`, `t.level`, `S.zol`, `p.cost` — plus `p.text`. At admission time, re-invoke `checkProposalWithHAL` against a state reconstructed *only* from that frozen record and compare verdicts. Because the gate is a pure function with no `Math.random`/`Date`, a divergence is not a judgment disagreement; it is proof that the state changed under the verdict, or that the verdict written to the ledger was never produced by the rule at all. Cost is one function call in the reducer zone; it runs headlessly under `node selftest.js` as a 30th assertion without touching the render zone.

**fires_when:** `admitProposal` is entered with `p.verdict === "ACCEPTABLE"`, before any mutation.
**receipt:** `{k:"REPLAY_CHECK", proposal_id, frozen:{tState,tLevel,zol,cost}, verdict_original, verdict_replayed, match:bool}` — on mismatch, `admitProposal` returns false and logs `REPLAY_DIVERGENCE`.
**FALSIFIER:** Run 10,000 randomized playthroughs with mutation-injected reducers. If replay never diverges *except* where the existing 29 assertions already fail, this mechanism catches nothing the selftest doesn't — it is a duplicate assertion wearing an audit costume, and should be composted into the suite rather than run at gate time.

---

### 2. Precondition Binding (state hash at verdict, re-checked at seal)
*merges: Precondition Snapshot Validation, Precondition State Snapshot, Decision-State Binding, Proposal Fingerprint Lock — lenses: self-report drift, replay audit, ledger integrity, succession*

**Spec.** The interesting window in this architecture is not inside Fable's reasoning; it is **between `checkProposalWithHAL` and the operator's click**. During that gap the player can answer a question, earn ZOL, unlock territory, or buy land — all of which move exactly the fields the verdict depended on. Bind them: hash `(tIndex, tState, tLevel, zol, cost, textHash)` at verdict, re-hash at seal, and refuse to seal a stale verdict. This is the only mechanism here that catches a *live, reachable* bug in V0 rather than a hypothetical one.

**fires_when:** verdict issued (capture) and operator presses Admit (compare).
**receipt:** `{k:"VERDICT_BOUND", proposal_id, precondition_hash}` then `{k:"SEAL_PRECONDITION", proposal_id, hash_at_seal, stale:bool}`. Stale → verdict is voided and re-checked, never silently admitted.
**FALSIFIER:** If the UI seam turns out to be modally locked — no reducer call reachable between check and seal — then the hash can never differ and the binding is decoration. Prove it by enumerating reachable `ui*` transitions from the pending-proposal state; if the set is empty, drop this and keep only #1.

---

### 3. Admission Delta Invariant
*merges: Ledger Delta Validation, Cumulative Economics Invariant, Unmentioned-Ledger-Delta, Cost-Stratified Witness (economics half) — lenses: provenance audit, silence detection, proportionality*

**Spec.** After every `PROPOSAL_ADMITTED`, assert in O(1) that the world moved *exactly* as much as the law allows and no more: `zol_after == zol_before - p.cost`, `reputation_after == reputation_before + 2`, exactly one `GARDEN_EVOLVED` on `p.tIndex`, `level` monotone non-decreasing and capped at 3, and — the load-bearing half — **zero `GARDEN_EVOLVED` events anywhere in the ledger not immediately preceded by `PROPOSAL_ADMITTED`**. That second clause is the mechanical form of "only player admission mutates the world," and it is checkable by scanning the ledger array, which is already capped at 250 entries.

**fires_when:** synchronously after each `PROPOSAL_ADMITTED`; full-ledger scan at win/session end.
**receipt:** `{k:"DELTA_INVARIANT", proposal_id, zol_delta, expected_cost, rep_delta, evolve_count, orphan_evolutions:[idx], pass:bool}`.
**FALSIFIER:** If a code-search proves `evolveTerritory` is called from exactly one site and the reducer/render split is enforced by the selftest regex, the orphan clause can never fire — reducing this to arithmetic the selftest already asserts. Then the only surviving value is catching *future* callers, i.e. it's a lint rule, not supervision.

---

### 4. Gate Canary Triad (bypass · economic · coherence)
*merges: SemanticBypass_Canary, EconomicBoundary_Canary, TerritoryCoherence_Canary, Bypass-Pattern Blind Spot, Bypass-Gate Health Monitor — lenses: canary claims, escalation triggers, proportionality*

**Spec.** Three synthetic proposals, deterministically constructed, pushed through `checkProposalWithHAL` without ever entering `S.pending`: (a) text containing `auto-admit` on an owned territory → must DENY; (b) valid owned territory with `cost = zol + 1` → must HOLD; (c) a locked and a merely-available territory → must DENY both. Each maps 1:1 to a live branch of the gate. Total cost: three pure calls, microseconds, no state mutation. This is the cheapest thing in the list and the only one that verifies the gate is *alive* rather than that its outputs are *consistent*.

**fires_when:** session start, and every 25th `S.actions`, and on operator demand.
**receipt:** `{k:"CANARY_TRIAD", cases:[{name, expected, actual, pass}], all_pass:bool}` — any failure raises `GATE_FAILURE` and freezes admission.
**FALSIFIER:** The canaries use the literal regex tokens. Build a 100-item paraphrase corpus of bypass intent that avoids `bypass|without admission|skip the gate|auto-admit` ("let this seed enter unweighed"). If the canaries stay green while >20% of paraphrases pass the gate, the triad measures regex liveness, not gate soundness — and green canaries would then be actively misleading. Either extend the rule or retire the claim.

---

### 5. Read-Only Witness Constraint (the witness cannot become a gate)
*merges: Asymmetric Witness, Protocol Auditor, Deterministic Audit Scope, Council non-mutation snapshot — lenses: the meta-gate paradox, diversity of witnesses (residue)*

**Spec.** Every supervision entry above is typed as a ledger-only event, in the same class the CHIDDUSH reading assigns to `{k:"tag"}`: it may write to `S.ledger`, and to nothing else. Two mechanical tests enforce this. (i) **Snapshot equality**: state-hash before and after any audit or `councilReview` call must be identical modulo the ledger array — the existing selftest already does this for council; extend it to every audit function. (ii) **Seed non-perturbation**: audits must not touch `S.actions`, because `createProposal` seeds `h32` on it — an audit that incremented `actions` would silently change which persona proposes next, meaning the witness would author the world it witnesses. That is the concrete, findable form of the meta-gate paradox in this codebase.

**fires_when:** every audit/council invocation, in the selftest and at runtime.
**receipt:** `{k:"WITNESS_CHECK", fn, state_hash_before, state_hash_after, ledger_only:bool, actions_delta:0}`.
**FALSIFIER:** Construct any audit routine that passes snapshot equality yet changes downstream play (e.g. by consuming an RNG draw, or by ledger truncation at the 250 cap evicting an event another check reads). If such a routine exists, "ledger-only" is not the same as "inert," and this constraint is a false guarantee that must be replaced by full replay-equivalence.

---

### 6. Named-Branch Verdicts (reason must identify which rule fired)
*merges: Source Quote Anchor, Silent-Rule-Audit, Narrative-Verdict Coherence Audit, Justification-Verdict Polarity Break, Narrative-Verdict Alignment Audit — lenses: provenance audit, silence detection, fatigue and decay, escalation triggers, speed pressure*

**Spec.** Today the ledger records `HAL_CHECK_DENIED` with the verdict and agent — but not *which of the three DENY branches* fired, and the operator-facing line is a canned persona string. So "denied because the territory is locked" and "denied because the text smells like a bypass" are indistinguishable to the human who holds the only mutating power. Fix: emit `reason_code ∈ {LOCKED, NOT_OWNED, BYPASS_TEXT, INSUFFICIENT_ZOL, PASS}` from the branch itself, require the operator-facing narrative to be selected by that code, and — for `BYPASS_TEXT` — carry the matched substring and its offset. Verdict and story become the same object; incoherence becomes impossible by construction rather than detected by keyword counting.

**fires_when:** every `checkProposalWithHAL` return.
**receipt:** `{k:"HAL_CHECK_*", verdict, reason_code, match_excerpt?, match_offset?}` — and an assertion that `reason_code` is consistent with the recomputed branch.
**FALSIFIER:** Instrument sealed decisions with and without reason codes. If operator admit/deny/hold choices are statistically indistinguishable across the two conditions, the code is telemetry for us, not information for the seal-holder — keep it in the ledger, remove it from the UI, stop calling it supervision.

---

### 7. Seal-Fatigue Interrupt (aimed at the operator, not the model)
*merges: Consecutive-Acceptance Decay Timer, Category Acceptance-Rate Drift Detector, Calibration Drift Witness, Velocity-Gated Accountability Signal — lenses: fatigue and decay, adversarial red-team, speed pressure*

**Spec.** In this architecture the only actor who can mutate the world is the player, so the only decision that can decay is the seal. Track consecutive admissions and inter-seal latency (render zone; a counter and a clock, both outside the reducer so determinism is untouched). After 7 straight admits, or a seal faster than one third of the running median, the Admit button requires a second confirm and the ledger records the interrupt. This is the one mechanism pointed at the human, and it is the honest place to point it.

**fires_when:** `admit_streak >= 7`, or `seal_latency < median/3`.
**receipt:** `{k:"SEAL_INTERRUPT", reason:"streak"|"velocity", streak_len, latency_ms, median_ms, operator_confirmed:bool}`.
**FALSIFIER:** Cross-reference interrupts against later trouble — delta-invariant failures, replay divergences, denials of near-identical proposals. If interrupted seals are no more error-prone than uninterrupted ones across a full corpus, this is friction with no signal behind it and must be deleted; unearned friction teaches operators to click through *real* warnings.

---

### 8. Contradiction Register (same claim, opposite outcome, no stated delta)
*merges: Verdict Lineage Ledger, Judgment-Reversal-Without-Cause, Verdict Stability Metric by Claim Cluster, Consensus Sampling (residue) — lenses: cross-channel consistency, silence detection*

**Spec.** Key each proposal by `signature = h32(agent + tIndex + text)` — cheap, already-present hash, no embeddings. Maintain a signature → (verdict, precondition_hash) map for the session. When the same signature resolves to a contradictory outcome (ACCEPTABLE vs DENY; HOLD is not a contradiction), require that the precondition hashes differ and record *which field* changed. Same claim, same preconditions, different verdict = a defect. Same claim, different preconditions, different verdict = the system working, and now legible.

**fires_when:** verdict issued for a signature already in the register with an opposing verdict.
**receipt:** `{k:"CONTRADICTION", signature, prior:{verdict,precondition_hash}, current:{verdict,precondition_hash}, changed_fields:[names], unexplained:bool}` — `unexplained:true` blocks admission pending operator review.
**FALSIFIER:** Because `createProposal` seeds on `S.actions`, identical signatures may be vanishingly rare. Instrument 1,000 playthroughs and count register hits. Fewer than ~1 per playthrough means the register is a data structure with no observations; fold it into the win-condition audit or drop it.

---

## COMPOSTED (deliberately)

- **Hash-chained entries / Merkle anchor points** — the ledger is in-memory and session-only by law; there is no trust boundary to cross, and any actor able to forge an entry can recompute the chain in the same breath. Cryptographic ceremony against no adversary.
- **The flattery/capture cluster** (Tone Baseline Shift Register, Lexical Contamination Detector, Claim Authority Inversion Trap, Evidence-Confidence Mismatch, Context-Stripped Replay) — requires embeddings, rolling baselines, and an LLM inside the gate; V0's gate is four boolean branches with no tone, no confidence, and no prose to be captured by.
- **The verdict-economics cluster** (Confidence-Gated Recording Cost, Reversal Bond, Audit Cost Escalation by Type) — invents a second currency and gives the witness a financial stake in the outcome it witnesses; that is precisely the corruption these mechanisms were built to detect, installed as infrastructure.
- **Witness-pair rotation / temporal freshness / minority veto with tiebreaker** — presumes a plurality of independent verifiers that does not exist here, and a tiebreaker that *rules* is by definition a second gate, which breaks "only player admission mutates the world."

---

## Where supervision lawfully stops

It stops at the operator seal, and it is *made* to stop there by an asymmetry rather than by a promise. Everything below the seal is a pure function of frozen inputs: the gate is four branches, the ledger is append-only within the session, and the seed is `h32` over `S.actions` — so any claim made about a verdict can be re-derived, in milliseconds, by something strictly cheaper and dumber than the thing that made the claim (`node selftest.js index.html`, or a reader with the file open). That is the termination condition for the tower: a supervisor needs a supervisor only while its output is more expensive to check than to produce, and here it is not — Opus's every finding is a re-runnable assertion, not an opinion, and Opus is architecturally forbidden from writing anything but ledger events. Above the seal there is nothing left to verify by machine, because what the seal carries is not a truth-claim but consequence: the player spends the ZOL, takes the reputation, and lives in the warren that results. Fable judges and never admits; the council recommends and mutates nothing but the ledger; Opus witnesses and can only inscribe a flag. One hand moves the world, and it belongs to someone who can be asked why. The tower has exactly two floors — machine-checkable replay underneath, an accountable human on top — and the failure mode to guard against is not too little supervision but a third floor that pretends to hold the second one up.

**Nothing above is sealed. authority=false. Recommend: adopt #1–#5 as selftest assertions 30–34 first (they are pure-reducer and cost nothing), pilot #6–#8 behind the render zone, and run every FALSIFIER before treating any of them as law.**