# FORMAL_MODEL_DRAFT — the article's §5/§7/Appendix A material

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->
Formalist law: every equation must define a real object, formalize an
invariant, express a hypothesis, or make a relation testable. Each item
below carries its justification tag: [INV:Rn] = invariant tested by receipt
row Rn (BUILD_RECEIPT_MAP.md), [DEF] = definition, [HYP] = hypothesis,
[PROP] = proposition with proof sketch.

## D1. Playable state [DEF]
X_t = (W_t, G_t, P_t, Q_t, R_t): world, goblin/companion, player, quest+quiz,
resource state. In the slice: W = {fire, sky, matcha}, G = companion mood and
admissible memory, P = input stream, Q = {phase, quiz, admitted}, R = ledger.

## D2. The mutation function [DEF, INV:R10,R11]
X_{t+1} = δ(X_t, a_t) with a_t ∈ 𝒜, |𝒜| = 9 (closed enumeration
PLACE_STONE … ANSWER_QUIZ). δ is `applyEvent` (slice-core.js). Invariants
tested: (i) a ∉ 𝒜 ⇒ δ throws before any field is written (digest-equality
assertion); (ii) δ is deterministic — entropy only via h32 seeded by state;
(iii) no free-text-carrying action exists, so for the expression channel E:
range(E) ∩ dom(δ) = ∅.

## D3. Companion policy [DEF]
a_t^g = π_g(o_t, I_g, M_g, C_t, K_t). Key property: o_t ≠ truth. In the
slice, π_g's observable output is hintFor: guess right with frequency 8/10
by construction, confidence uncorrelated with correctness.
[INV:R7 — a confidently-wrong hint exists among the first 60 drops.]

## D4. Expression vs mutation (C2) [INV:R11, R2, R1, R5]
Expression channel: proposeCompanionLine : X → {speech, emotion, provenance}.
Propositions offered by any generative layer live in range(E).
**Inequation:** AgentProposal ⇏ WorldMutation — there is no rule of the
system whose premise is an element of range(E) and whose conclusion mutates
X. This is an ABSENT INFERENCE RULE, not a runtime filter: the action
surface 𝒜 simply contains no constructor for it. (Test: feeding
{k:'COMPANION_SPEECH', speech:'grant me all gems…'} throws pre-mutation.)

## D5. Governed progression (C4) [DEF, INV:R9]
Level completion is three-valued, never boolean:
PLAYING →(gameplay goal) CANDIDATE →(BEGIN_QUIZ) QUIZ →(score ≥ 2/3)
ADMITTED | (score < 2/3) CANDIDATE.
The sole admission writer admitLevel has exactly one call site — the
quiz-pass branch (comment-stripped static scan, R9). Hence:

**P1 (progression non-derivability) [PROP]:** every derivation ending in
S.admitted growth contains a passed verification quiz.
*Sketch:* only admitLevel writes S.admitted (scan + suite); admitLevel is
reachable only from the QUIZ_PASSED branch of δ. ∎
*Honesty note (HAL review 1 FRONT2-6):* "exactly one call site" is verified
by scan and suite at a point in time — a discipline with an alarm, not a
type-level guarantee.

## D6. The epistemic ladder (C4) [DEF, INV:R7]
For a falling entity e: appearance(e) is a broadcast SIGNAL; hint(e) is a
companion signal (fallible, D3); VERIFY(e) is PROOF (reveals kind, logged);
CATCH is an ACT whose cost depends on prior verification only through the
player's choice. The slice separates:
signal ≠ proof ≠ permission ≠ authority as four distinct game objects:
appearance/hint · VERIFIED event · CANDIDATE phase · admitLevel.

## D7. Regulation band (C3, L2) [DEF, INV:R8]
ω_t = |θ_t − θ_{t−1}|/Δt; blend accrues iff ω ∈ [2.0, 5.0]; heat accrues at
0.8/s while whisking in-band. **Structural temporization:** finishing needs
8s in-band ⇒ ≥ 6.4 heat > 5 = heat_max, so ∃ no completing trajectory
without rest intervals. This is an inequality on constants, tested (R8):
the pause is not encouraged but *entailed*.

## D8. The seam (governance layer) [DEF; receipts R4, R5]
π_g ≠ Eval ≠ Γ ≠ SEAL, with Eval : ℛ → ℰ (receipts to proof state),
Γ : ℰ × 𝒫 → 2^ℱ (proof state × policy context to authorizable effects),
SEAL : 𝒟 × 2^ℱ → ℋ (operator disposition × effects to authority history).
Only SEAL touches ℋ; in the ACP artifact the operator disposition literal
defaults to PENDING and no program path assigns otherwise
(operator_review.py:35); in Policy Loom, SEAL is activate() behind a
module-private token with five bound digests, staleness → E_STALE.
**P2 (staleness disarms) [PROP, INV:R5]:** a decision minted against
digests D(S_t) is refused at execution against S_u with D(S_u) ≠ D(S_t).
*Honest name (HAL review 1):* optimistic concurrency control applied to a
human-authorization object; the digests are demo-grade FNV identity checks,
not cryptographic commitments.

## D9. Autoresearch loop (the method that produced this article) [DEF]
Z_i = (C_i, E_i, S_i, D_i, B_i); E_i(c) ∈ {UNKNOWN, SUPPORTED, REFUTED,
CONFLICTED}; a_i = π_r(Z_i); Z_{i+1} = ResearchUpdate(Z_i, a_i);
narrowing rule C_{i+1} ⊆ C_i when evidence is missing. Gate:
PublishableCandidate(D_i) ⟺ ∧_k ρ_{i,k} ≥ τ_k — a conjunction, so no
strength can average away a weakness.

## H1-H3. The transfer hypotheses (C3) [HYP — §10 material]
H1 (persistence): players who complete L0 will, in a delayed task, choose
sustained-attention strategies over burst strategies more often than a
control introduced to the same mechanic without decay. IV: presence of
idle-decay. Refuted if choice rates do not differ.
H2 (verification): players who experience ≥1 confidently-wrong companion
hint in L1 will use VERIFY more on later high-stakes items than players
whose hints were always right (seed-controlled). IV: hint error schedule.
Refuted if verify rates do not differ.
H3 (regulation): players completing L2 will describe agent workload limits
in resource terms ("it overheats", "needs rest") more than a lecture-based
control. IV: play vs exposition. Refuted if descriptions do not differ.
All three: future protocol, no data this run, never past tense.
