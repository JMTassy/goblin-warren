# CLAIM_MATRIX — every load-bearing sentence, typed and gated

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->
States: UNKNOWN | SUPPORTED | REFUTED | CONFLICTED. A claim enters the
article only in its `allowed_wording`; `forbidden_wording` is banned even in
paraphrase. Receipts: see BUILD_RECEIPT_MAP.md (R-rows) and
reviews/HAL_REVIEW_1_sovereign_seam.md.

| claim_id | type | claim | evidence | state | allowed wording | forbidden wording |
|---|---|---|---|---|---|---|
| CM-01 | ARCHITECTURE_CLAIM | The system architecture stages three mental models: single interpretive agent (Pet) → emergent multi-agent society (Village) → explicit orchestration (Superteam) | spec + AI_LEARNING_SPINE.md + this article's model section; only the Pet scale has running code (slice, NPC gateway); Village/Superteam are specified, partially prototyped (V0 council/personas) | SUPPORTED (as design), Village/Superteam implementation NOT DEMONSTRATED | "the architecture defines"; "the vertical slice implements the Pet scale; Village and Superteam scales are specified and partially prototyped in the V0 council mechanics" | "the game implements all three scales"; past tense for Superteam features |
| CM-02 | ARCHITECTURE_CLAIM + IMPLEMENTATION_CLAIM | Generative expression is structurally separated from world mutation: AgentProposal ⇏ WorldMutation, Dialogue ⇏ Fact, Reflection ⇏ CanonicalMemory | R1, R2, R5, R11; HAL review 1 FRONT3 all CONFIRMED | SUPPORTED | "verified by same-author test suites and one adversarial review pass"; "a closed action surface: free text has no action kind" | "enforced" (bare); "cannot be bypassed"; "guaranteed"; "the load-bearing safety property" |
| CM-03 | IMPLEMENTATION_CLAIM | One sovereign writer per artifact; digest-bound operator decisions; staleness disarms (E_STALE) | R5 (55/55, KILL-01..12), R9 (slice admitLevel single call site) | SUPPORTED | "a repeatable composition of known primitives (POLA, single command handler, optimistic-concurrency freshness)" — HAL review 1 one-sentence thesis | "novel safety primitive"; "independently implemented five times"; digests as security |
| CM-04 | DESIGN_HYPOTHESIS | Gesture → visible consequence → mental model transfer (L0 hold/maintain → attention persistence; L1 discriminate → signal vs proof; L2 regulate/temporize → bounded effort) | The mechanics EXIST and are receipt-backed (R6-R8); the TRANSFER is untested | UNKNOWN (hypothesis) | "We hypothesize that…" + IV/DV/protocol/refutation per hypothesis (article §10) | any claim that players learn, transfer, or understand |
| CM-05 | ARCHITECTURE_CLAIM + IMPLEMENTATION_CLAIM | Epistemic governance is playable: signal ≠ proof (fallible companion hint vs VERIFY), proof ≠ permission (candidate ≠ admitted), permission ≠ authority (quiz-pass is the sole admission path) | R7, R9, R11; hint fallibility incl. confidently-wrong asserted | SUPPORTED (as implemented mechanics) | "the slice operationalizes the distinctions"; "a confidently-wrong hint exists by construction" | "players internalize the distinctions" |
| CM-06 | OBSERVATION_CLAIM | The slice is completable end-to-end (all three levels to DONE) under scripted play | R6-R11 core path (scripted, 30/30); R12 browser path PENDING | SUPPORTED (core), UNKNOWN (browser UI) until R12 lands | "completable under scripted play in the deterministic core; browser completion verified headlessly ⟨iff R12 PASS⟩" | "playtested with users" |
| CM-07 | ARCHITECTURE_CLAIM | Determinism: same seed + same actions → byte-identical state; all entropy from a seeded FNV hash | R10 | SUPPORTED | "byte-identical replay demonstrated by suite" | "cryptographically verifiable" |
| CM-08 | EMPIRICAL_CLAIM | (any learning/retention/engagement outcome) | none | FORBIDDEN THIS RUN | n/a — appears only in §10 hypotheses / §11 limitations | all of it |
| CM-09 | ARCHITECTURE_CLAIM | Attachment precedes interpretation precedes coordination precedes governance (the ordering thesis) | design rationale + literature (pending sweep synthesis: does prior work already stage this?) | UNKNOWN → pending related-work synthesis | "we argue"; "the design commits to the ordering" | "we show the ordering is necessary/effective" |
| CM-10 | FUTURE_WORK | Village-scale live NPCs, Superteam orchestration levels, user studies, cryptographic receipts, CI | — | — | future tense only | past/present-perfect tense |

## Wording bans inherited wholesale (HAL review 1 FRONT2)
1-7 transcribed to §11 duty list: "a load-bearing property" not "the";
"within a single author's lineage" not "independently"; "same-author
self-tests, executed live" not bare "tested"; "demo-grade deterministic
identity check" not "digest security"; seal wording per FRONT2-5; "verified
by grep/tests at a point in time" not "enforced"; ACP env-fragility note.
