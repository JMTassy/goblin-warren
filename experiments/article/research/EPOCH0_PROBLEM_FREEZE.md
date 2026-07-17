# EPOCH 0 — PROBLEM FREEZE

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->
Run: AUTORESEARCH → PUBLISHABLE ARTICLE LOOP (dual-output, 5h)
Frozen at: 2026-07-17T01:30Z (run clock 00:00)

## Research question
How can a game teach agentic-system architecture progressively — without
starting from technical abstraction — by moving the player from a relationship
with one interpretive agent to the coordination of a multi-agent team?

## Article type
DESIGN + SYSTEMS + POSITION PAPER. No empirical learning claims: the
prototype demonstrates an architecture and operationalizes hypotheses; it does
not validate them.

## Audience
Researchers and practitioners in human-AI interaction, game-based learning,
and agentic-system design who do not know HELEN OS. All internal vocabulary
must be defined on first use.

## Venue (generic target)
CHI PLAY / FDG-class design-and-systems venue, or an interactions/positions
track. The claim gate is calibrated to a design paper, not an empirical study.

## Working title
From Attachment to Orchestration: A Three-Scale Playable Architecture for
Human-AI Agent Literacy
(product variant: Goblin Warren: A Playable Epistemic Interface for Learning
Human-Agent Coordination)

## Central thesis (CLAIM-MAIN, type ARCHITECTURE_CLAIM)
Goblin Warren teaches agentic architecture not by didactic exposition but by a
playable progression in which attachment precedes social observation and
social observation precedes formal orchestration:
Attachment → Interpretation → Coordination → Governance.

## Contributions
- C1 ARCHITECTURE_CLAIM — three-scale architecture 𝒫 (AI Pet) → 𝒱 (AI
  Village) → 𝒯 (Superteam); three successive mental models, not three features.
- C2 ARCHITECTURE_CLAIM + IMPLEMENTATION_CLAIM — expression/mutation
  separation: AgentProposal ⇏ WorldMutation; Dialogue ⇏ Fact; Reflection ⇏
  CanonicalMemory. Backed by the sovereign-writer seam receipts (5 artifacts,
  suites 29/15/16/51/55, one adversarial witness pass — see
  reviews/HAL_REVIEW_1_sovereign_seam.md for mandated repositioning).
- C3 DESIGN_HYPOTHESIS — gesture progression L0 assemble/drag/hold,
  L1 catch/avoid/discriminate, L2 turn/regulate/temporize; transfer chain
  gesture → visible consequence → mental model is a design hypothesis to
  evaluate, never a result.
- C4 ARCHITECTURE_CLAIM + IMPLEMENTATION_CLAIM — playable epistemic
  governance: signal ≠ proof ≠ permission ≠ authority, embodied by true-gem vs
  False Jewel, Bram's fallible perception, verification quizzes, proposed vs
  admitted actions.

## Anti-claims (never assertable in this run)
- The game improves learning / AI literacy (no user study).
- Players develop better AI mastery or become better orchestrators.
- Attachment increases retention.
- Quizzes improve cognitive outcomes.
- The architecture is unprecedented (HAL review 1: components are prior art;
  the contribution is the composition + receipts + pedagogy).
- Anything about the sovereign seam using: "the load-bearing property",
  "independently implemented", bare "enforced", "cannot be bypassed",
  digests as security. (Full forbidden/allowed wording list: HAL review 1
  FRONT2, to be transcribed into CLAIM_MATRIX.md.)

## Claim typing (law of the run)
ARCHITECTURE_CLAIM (spec/code/diagram/invariant/structural test) ·
IMPLEMENTATION_CLAIM (requires feature receipt = PASS, else NOT DEMONSTRATED) ·
OBSERVATION_CLAIM (requires executed trace/log/playthrough) ·
DESIGN_HYPOTHESIS ("We hypothesize…" + IV + expected outcome + protocol +
refutation condition) · EMPIRICAL_CLAIM (forbidden this run) · FUTURE_WORK
(never past tense).

## Formal vocabulary (frozen; defined fully in the article's model section)
X_t = (W_t, G_t, P_t, Q_t, R_t); δ the sole world-mutation function;
π_g(o_t, I_g, M_g, C_t, K_t) the goblin policy with o_t ≠ truth;
seam π_g ≠ Eval ≠ Γ ≠ SEAL; autoresearch state Z_i = (C_i, E_i, S_i, D_i, B_i)
with E_i(c) ∈ {UNKNOWN, SUPPORTED, REFUTED, CONFLICTED}; gate
PublishableCandidate(D_i) ⟺ ∧_k ρ_{i,k} ≥ τ_k (conjunction, no averaging).

## Stop condition
ARTICLE_GATE = PASS (all thresholds conjunctively) or time exhausted; on
failure, narrow the main claim and retest. Epochs: min 8, target 12-16,
hard max 24, ≤12 min each.

## Output A scope (build)
Playable three-level vertical slice under `experiments/vertical-slice/`:
L0 fire (assemble/drag/hold), L1 living sky (catch/avoid/discriminate incl.
True Gem vs False Jewel), L2 matcha (turn/regulate/temporize), integrated
micro-quizzes, deterministic core with its own node selftest + receipts,
design system from `warren-design/tokens.css`. Root `node selftest.js
index.html` must keep passing 29/29 untouched.
