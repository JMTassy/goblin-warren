# HAL adversarial review #1 — the sovereign-writer seam (feeds article §5, §7, §9, §11)

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->
Reviewer: HAL_SONNET, independent context (did not author any reviewed code).
Scope: the C2 governance-seam claims and their five supporting artifacts.
Executed: 2026-07-17, all five suites re-run live by the reviewer.

## VERDICT: SURVIVES_WITH_REPOSITIONING

## FRONT 1 — Novelty (prior art audit)
- Object-capability model (Dennis & Van Horn 1966; KeyKOS; E language;
  Miller, *Robust Composition*): covers capability-as-unforgeable-reference
  and POLA. Does NOT specify digest-binding to evidence-the-human-saw;
  the evidence-freshness clause is additive.
- POLA: fully subsumes "distribute capability, concentrate authority."
- seL4 / TCB minimization: structurally identical idea with *stronger*
  guarantees (machine-checked); ours is a weaker-guarantee instance, not new.
- Event sourcing / CQRS: "commands are the only mutation path; everything
  else is a projection" — near-identical shape; the ledger discipline is
  textbook CQRS. Not new.
- Confused-deputy literature: covers the failure mode; capability systems
  solve it by design. Countermeasure category not new.
- Two-person rule / separation of duties: structurally identical to
  judge≠admit, recommend≠admit, YES/NO≠admit. Not new.
- Optimistic concurrency control / CAS: the honest name for digest-binding
  + E_STALE — CAS applied to a decision object instead of a database row.
  Must be said explicitly.
- TOCTOU mitigation: standard framing; we add only vocabulary
  (CANDIDATE/ACTIVE, REPORTED floor).
- RLHF/HITL gating: usually a soft/statistical gate; replacing "human
  usually approves" with a structural, non-model-producible token bound to
  fresh evidence is a legitimate delta.
- Willison dual-LLM / model-output-as-untrusted-input: covers the framing;
  the typed-relation status floor (incidence floors status, never inflates
  proof) is a specific, checkable refinement worth keeping.

Net: novelty = (1) the composition into one repeatable code pattern with a
named vocabulary, and (2) the didactic/receipt framing (property asserted as
named KILL-tests) applied uniformly across five artifacts. Position as
"pedagogical synthesis + repeatable implementation checklist of well-known
primitives," never as a new safety primitive.

## FRONT 2 — Forbidden / required wording
1. "the load-bearing safety property" → "a load-bearing safety property";
   the pattern prevents unauthorized activation only, not bad content or bad
   human decisions.
2. "independently implemented five times" → "implemented five times within a
   single author's project lineage, by the same orchestrator across
   sessions" (git log confirms one account + Claude across both repos):
   internal replication, not independent replication.
3. bare "tested" → "covered by same-author self-tests (29/15/16/55/51
   assertions), executed live by this review; no third-party test
   authorship, no fuzzing, no formal proof."
4. digests as security → "demo-grade deterministic identity check
   (self-documented non-cryptographic, policy-loom.js:372, KILL-12);
   defends against accidental staleness, not motivated collision/forgery."
5. "sealed / cannot be bypassed" → "not callable by ordinary external code
   or forged tokens (nine forgery shapes refused); not hardened against a
   compromised module loader or same-process code replacing the module."
6. "exactly one writer, enforced" → "verified by grep/tests at a point in
   time (evolveTerritory sole call site index.html:283; promoteCandidate
   memory.js:65; operator_disposition PENDING operator_review.py:35, but
   dataclasses.replace() could construct other values — discipline, not
   guarantee); a future edit could violate it with no alarm beyond the
   suite failing."
7. ACP "51/51" — reproduced fresh, but pytest had to be installed first; do
   not imply a maintained CI pipeline runs it routinely.

## FRONT 3 — Table verification (all CONFIRMED, suites re-executed)
1. V0 reducer: admitProposal index.html:276; sole evolveTerritory call site
   index.html:283. Suite 29/29.
2. NPC gateway: promoteCandidate memory.js:65, sole write path (memory.js:13).
   Suite 15/15.
3. epoch3: TIER map epoch3-typed-relations.js:31; no-repair :61; floor logic
   :80/:92. Suite 16/16.
4. HELEN ACP: operator_disposition "PENDING" operator_review.py:35, re-assert
   :64; FABLE token YES/NO fable.py:59-64. Suite 51/51 (pytest freshly
   installed).
5. Policy Loom: OPERATOR_SEAL policy-loom.js:318; activate :320-322; sole
   sealed call site :476. Suite 55/55 incl. KILL-01..12.

## REQUIRED LIMITATIONS (must appear in article §11)
- One author/orchestrator lineage; internal, not independent, replication.
- All tests same-party authored; this pass is the first and only adversarial
  witness, run once, not in CI.
- FNV digests non-cryptographic; freshness against accident, not attack.
- Symbol seal / frozen dataclass are same-realm conventions, not sandboxes,
  proofs, or language guarantees.
- "Exactly one caller" holds by inspection + tests, not by type system or
  access control.
- The seam says nothing about the quality of admitted content: an upstream
  classifier that always returns ACCEPTABLE/YES still passes every test.
- Environment fragility: no pinned reproducible CI demonstrated.

## ONE-SENTENCE HONEST THESIS (for the seam contribution only)
Across five same-lineage, same-author artifacts, a repeatable composition of
well-known primitives (POLA-style capability distribution, a single sealed
mutator analogous to a CQRS command handler, and optimistic-concurrency-style
digest freshness checks standing in for cryptographic integrity) was
implemented and self-tested to structurally prevent unauthorized or stale
state mutation — a useful, verifiable engineering pattern and teaching device,
not a new safety primitive nor an independently-replicated scientific result.
