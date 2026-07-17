# Playable Constitutional Interfaces: From Attachment to Governed Multi-Agent Literacy in Goblin Warren

**Article type:** Design-and-systems position paper  
**Project:** Goblin Warren / HELEN OS  
**Status:** Reviewable draft; no empirical learning-effect claims  
**Authority:** `false`  
**Canon:** `false`

## Abstract

Public AI literacy is often framed as conceptual knowledge about models, data, bias, or prompting. This framing underrepresents a practical problem: users increasingly interact with agentic systems whose behavior emerges from memory, tools, permissions, delegation, verification, and multi-agent coordination. Goblin Warren is a playable constitutional interface designed to make these structures legible through embodied interaction rather than front-loaded technical exposition. The architecture progresses across three scales: an **AI Pet** scale, where a player forms a relationship with one bounded agent; an **AI Village** scale, where multiple agents exhibit divergent memories and informal coordination; and a **Superteam** scale, where the player configures explicit roles, tools, handoffs, and verification gates. The system separates expressive generation from deterministic world mutation and formalizes governance using a HELEN OS seam: agent policy, evidence evaluation, permission calculation, and operator admission remain distinct. This paper contributes (1) a three-scale model for playable agent literacy, (2) a formal state-transition architecture that prevents language outputs from directly mutating the game world, (3) a three-level vertical slice that teaches bounded agency through fire building, perceptual discrimination, and procedural timing, and (4) a falsifiable evaluation plan. The present work is a design-and-systems contribution. It does not claim that the game improves AI literacy, attachment, or retention; those effects require controlled user studies.

## 1. Introduction

AI systems are increasingly presented to non-specialists through conversational interfaces. Conversation is accessible, but it can conceal the machinery that determines what an agent can remember, what tools it can use, which actions require verification, and who is authorized to make consequential changes. The result is a literacy gap: users may become fluent in issuing prompts while remaining unable to reason about agency boundaries, evidence, coordination, or authority.

Existing AI literacy frameworks emphasize critical evaluation, human accountability, technical foundations, and system design. Long and Magerko define AI literacy as a set of competencies required to critically evaluate and effectively interact with AI systems. UNESCO similarly structures learner competencies around a human-centred mindset, ethics, AI techniques and applications, and AI system design, progressing from understanding to application and creation. These frameworks establish the educational need, but they do not prescribe a concrete interaction form for teaching agent architectures through play.

Goblin Warren addresses this gap through a progressive game architecture. It begins not with a diagram of a multi-agent system, but with Bram, a single goblin near a dying fire. The player first learns that an agent is an individual with bounded perception and action. Only after this relationship is established does the world reveal multiple agents, social divergence, and coordinated work. The design thesis is:

\[
\text{Attachment} \rightarrow \text{Interpretation} \rightarrow \text{Coordination} \rightarrow \text{Governance}.
\]

The ordering matters. Introducing memory, social simulation, delegation, and verification simultaneously creates excessive intrinsic and extraneous load for novice players. Cognitive load theory predicts that instructional design should preserve working-memory capacity for schema construction rather than consume it with avoidable interface complexity. Goblin Warren therefore slows macro-level system expansion while keeping moment-to-moment interaction active.

This paper makes four contributions:

1. **A three-scale playable architecture** connecting individual attachment, emergent society, and explicit team orchestration.
2. **A constitutional state-transition model** separating agent expression, evidence, permission, authority, and world mutation.
3. **A three-level embodied curriculum** in which the player constructs a fire, discriminates trustworthy from deceptive signals, and performs a timed procedural ritual.
4. **A falsifiable evaluation protocol** that distinguishes implementation evidence from future learning hypotheses.

## 2. Related Work

### 2.1 AI literacy

Long and Magerko argue that AI literacy requires competencies beyond tool operation, including recognizing AI, understanding strengths and weaknesses, imagining future applications, and critically evaluating systems. UNESCO extends this concern into a curricular framework emphasizing human agency, ethical responsibility, technical understanding, and AI system design. Goblin Warren aligns most directly with competencies involving human determination, critical judgement, and system design, but adopts a game-based interaction strategy rather than a conventional instructional module.

### 2.2 Generative agents and social simulation

Park et al. introduced generative agents that store observations, synthesize reflections, retrieve memories, plan, and act in a social sandbox. Their work demonstrates how memory, reflection, and planning can produce believable individual and emergent social behavior. Goblin Warren adopts the value of visible social emergence but rejects an unrestricted equation between generated narrative and canonical world state. In the Warren, a generated statement may influence expression or a candidate plan, but deterministic logic governs whether resources move, quests advance, tools activate, or memories become canonical.

### 2.3 Role-based multi-agent orchestration

ChatDev models software development through specialized communicative agents organized into phases and roles. It illustrates a central lesson for agentic systems: competent components do not automatically form a competent team. Goblin Warren translates this insight into a later gameplay scale, the Superteam, where the player configures roles, information, tools, handoffs, and verification points.

### 2.4 Games, constructionism, and cognitive load

Constructionist approaches argue that learners develop understanding by making and manipulating public representations of rules and systems. Goblin Warren does not initially ask players to program agents, but it exposes rule-bound consequences through interaction. Cognitive load theory further motivates the design constraint that only one major new mechanic should be introduced at a time. The aim is not to make the beginning inactive; it is to keep the rules simple while delivering immediate feedback.

## 3. Design Problem

The design problem can be stated as follows:

> How can a game expose the structure of human-agent collaboration without turning the opening into either a technical lecture or an opaque simulation?

Two failure modes dominate.

### Failure mode A: abstraction before attachment

If the player first encounters roles, memory stores, tool permissions, traces, ledgers, and multi-agent routing, the system may be technically complete but emotionally and cognitively inaccessible.

### Failure mode B: attachment without legibility

If the game behaves only as a virtual pet, it may create affection without helping the player understand why an agent acted, what information it used, or who authorized a consequential action.

Goblin Warren resolves this tension through staged disclosure. The player first cares about an individual, then notices differences among individuals, and only later configures an organized team.

## 4. Three-Scale Architecture

Let the overall Warren architecture be

\[
\mathcal{W} = \mathcal{P} \rightarrow \mathcal{V} \rightarrow \mathcal{T},
\]

where:

- \(\mathcal{P}\) is the **AI Pet** scale;
- \(\mathcal{V}\) is the **AI Village** scale;
- \(\mathcal{T}\) is the **Superteam** scale.

### 4.1 AI Pet

At the AI Pet scale, the central question is:

> Who is this agent, and how does it interpret my actions?

The player interacts with Bram through observation, care, play, and small delegated actions. Bram has a stable temperament, bounded perception, local capabilities, and a limited admissible memory. The pedagogical objective is to establish that an agent is neither a passive tool nor an omniscient character.

### 4.2 AI Village

At the Village scale, the central question becomes:

> What changes when several bounded agents observe, remember, and communicate differently?

The same event may produce different local beliefs and actions. Social information may spread, mutate, or conflict. The player encounters coordination without yet possessing a formal orchestration interface.

### 4.3 Superteam

At the Superteam scale, the question is:

> How can individually capable agents become a reliable team?

The player configures roles, tools, information access, handoffs, and verification gates. The design makes explicit that

\[
\text{individual competence} \not\Rightarrow \text{team competence}.
\]

## 5. HELEN OS Formal Model

### 5.1 State

At time \(t\), the playable state is

\[
X_t = (W_t, G_t, P_t, Q_t, R_t, L_t),
\]

where:

- \(W_t\): world state;
- \(G_t\): goblin state;
- \(P_t\): player state;
- \(Q_t\): quest and quiz state;
- \(R_t\): resources and rewards;
- \(L_t\): append-only gameplay ledger.

A legitimate transition is

\[
X_{t+1} = \delta(X_t, a_t, e_t),
\]

where \(a_t\) is an admissible action and \(e_t\) is a validated event.

### 5.2 Expression does not imply mutation

The principal membrane is

\[
\text{AgentProposal} \not\Rightarrow \text{WorldMutation},
\]

\[
\text{Dialogue} \not\Rightarrow \text{Fact},
\]

\[
\text{Reflection} \not\Rightarrow \text{CanonicalMemory}.
\]

An LLM-facing layer may generate dialogue, candidate reflection, candidate plans, or social expression. A deterministic layer controls collisions, inventory, resources, quest progression, tool access, rewards, verification, and persistent world changes.

### 5.3 Local agent policy

For goblin \(g\), action selection is

\[
a_t^g = \pi_g(o_t, I_g, M_g, C_t, K_g),
\]

where:

- \(o_t\): local observation;
- \(I_g\): stable temperament;
- \(M_g\): admissible memory;
- \(C_t\): local cultural context;
- \(K_g\): capabilities and permissions.

The observation is not equivalent to truth:

\[
o_t \neq \text{Truth}.
\]

### 5.4 Governance seam

HELEN OS separates four functions:

\[
\pi_g \neq Eval \neq \Gamma \neq SEAL.
\]

- \(\pi_g\) maps observations to candidate actions.
- \(Eval\) maps typed receipts to evidence state.
- \(\Gamma\) maps evidence and policy context to a permitted-effect ceiling.
- \(SEAL\) records an operator disposition within that ceiling.

Let the effect set be

\[
\mathcal{F} = \{OBSERVE, ANNOTATE, PROPOSE, TEST, REQUEST\_ADMISSION, EXECUTE, LEDGER\_APPEND, CANONIZE\}.
\]

A policy decision returns a downward-closed set of permitted effects. Authority is never inferred from personality, narrative coherence, model confidence, or group consensus.

## 6. The Three-Level Vertical Slice

The initial vertical slice operationalizes the AI Pet scale through three levels. The levels are small enough to build and test independently, yet together form a complete emotional and mechanical arc.

### 6.1 Level 0: The Cold Night

**Player goal:** construct a stable fire and wake Bram.

The player:

1. completes a stone fire ring;
2. chooses dry tinder rather than wet material;
3. adds kindling before a heavy log;
4. creates an ember;
5. supplies air through blowing or an accessible hold gesture;
6. watches Bram add the final twig.

The fire state is

\[
F_t \in \{UNBUILT, TINDERED, EMBER, SMALL\_FLAME, STABLE\_FIRE\}.
\]

A valid transition requires the appropriate precursor:

\[
UNBUILT \rightarrow TINDERED \rightarrow EMBER \rightarrow SMALL\_FLAME \rightarrow STABLE\_FIRE.
\]

A micro-quiz asks the player to select what the fire needs: dry fuel and air. Errors produce corrective animation rather than punishment.

The level teaches ordered prerequisites, cooperative action, and bounded causality.

### 6.2 Level 1: The Living Sky

**Player goal:** collect beneficial objects, avoid hazards, and distinguish a genuine gem from a deceptive one.

Objects arrive in short deterministic sky phrases rather than isolated random drops. Let a phrase be

\[
\Phi = (D, \tau, c),
\]

where \(D\) is an ordered set of drops, \(\tau\) contains temporal offsets, and \(c\) is the maximum allowed concurrency.

The scheduler invariant is

\[
\#ActivePhrases \le 1
\]

and

\[
\#InFlightDrops \le c.
\]

Catch and miss handlers only report resolution:

\[
resolve(dropId, CAUGHT)
\]

or

\[
resolve(dropId, MISSED).
\]

They do not schedule the next drop. This prevents double scheduling and makes the temporal sequence replayable.

The object vocabulary is intentionally small:

- slow coin: positive, low demand;
- fast coin: positive, higher timing demand;
- gem: rare positive reward;
- stone: announced hazard;
- false gem: visually similar but signalled by smoke, crackle, and irregular pulse.

The false gem embodies a key literacy concept:

\[
\text{salience} \neq \text{reliability}.
\]

A micro-quiz asks the player to sort the genuine and false gems using multiple cues, not colour alone.

### 6.3 Level 2: The Matcha Ritual

**Player goal:** prepare and serve matcha to Bram.

The player performs a circular whisking gesture and then serves during a generous timing window. The gesture recognizer does not demand a geometrically perfect circle. The bowl is divided into eight sectors, and regular adjacent-sector transitions accumulate progress.

Let \(s_t \in \{0,\ldots,7\}\) be the current sector. A transition is valid when

\[
(s_{t+1}-s_t) \bmod 8 \in \{1,7\}.
\]

This formulation correctly handles the wraparound transitions \(7 \rightarrow 0\) and \(0 \rightarrow 7\).

Foam quality is discretized:

\[
M \in \{LIGHT, SOFT, PERFECT\}.
\]

The final result combines preparation and service timing without allowing one late tap to erase all prior skill. Bram responds positively even to an imperfect result, preserving care without removing mastery.

A micro-quiz asks the player to identify or perform the gesture that creates stable foam.

## 7. Quizzes as Diegetic Verification

The quizzes are not a separate school-like interface. Each is embedded in the action grammar of its level.

Let a quiz be

\[
q = (p, O, c, h, r),
\]

where:

- \(p\): prompt;
- \(O\): visual options;
- \(c\): correct condition;
- \(h\): hint policy;
- \(r\): bounded reward.

Each level has one quiz, two or three options, immediate feedback, no harsh penalty, and a guaranteed recovery path. The quiz verifies that the player noticed the governing distinction rather than merely completed a motor action.

## 8. Deterministic and Generative Boundaries

The current Goblin Warren prototype already expresses a constitutional design: proposals are evaluated, the player admits or rejects them, and the ledger records gameplay events. Its reducer is separated from rendering and can be tested headlessly. The three-level redesign extends this principle to embodied mechanics.

The generative layer may enrich:

- Bram's phrasing;
- candidate reflections;
- optional social remarks;
- later Village rumours;
- candidate plans.

The deterministic layer remains authoritative over:

- fire state;
- object spawning;
- collisions;
- score;
- quiz state;
- matcha recognition;
- progression;
- canonical receipts.

The design therefore preserves expressive variation while maintaining replayable consequences.

## 9. Evaluation Plan

The evaluation is divided into implementation evidence and future human-subject evidence.

### 9.1 Implementation evaluation

The prototype should be tested for:

- deterministic replay under a fixed seed;
- no duplicate catch or miss resolution;
- no stale timers after reset;
- bounded concurrent drops;
- reference-counted or identifier-based rain audio;
- valid fire-state ordering;
- stable matcha sector recognition at different frame rates;
- single reward issuance per quiz;
- complete Level 0 \(\rightarrow\) Level 1 \(\rightarrow\) Level 2 traversal;
- no crash or softlock under adversarial input.

These tests support claims about system behavior, not learning outcomes.

### 9.2 Future player study

A future study can compare the playable progression with a diagram-and-text tutorial.

Possible dependent variables include:

1. ability to distinguish proposal, evidence, permission, and authority;
2. transfer to a novel agent-orchestration task;
3. recall of system boundaries after delay;
4. perceived cognitive load;
5. attachment to the initial agent;
6. calibration of trust in agent-generated signals.

A central hypothesis is:

> Players exposed to embodied, progressively disclosed mechanics will construct a more transferable model of bounded agency than players exposed to an equivalent amount of declarative instruction.

This is a hypothesis, not a demonstrated result.

## 10. Design Hypotheses

### H1: Attachment-first sequencing

\[
AttachmentFirst \Rightarrow HigherInterpretiveAttention
\]

Players who care about Bram may attend more closely to why he reacts differently to signals. This should be tested against a non-character control.

### H2: Macro-slow, micro-active pacing

\[
LowSystemExpansion + HighMomentActivity \Rightarrow LowerBoredomWithoutOverload.
\]

The design delays new systems while maintaining frequent low-complexity interactions.

### H3: Multi-cue deception supports verification literacy

\[
MultiCueDiscrimination \Rightarrow BetterSignalVerificationTransfer.
\]

The false gem uses sound, motion, smoke, and character reaction so that the lesson is not reducible to colour recognition.

### H4: Diegetic quizzes strengthen causal schemas

\[
Action + ImmediateVerification \Rightarrow StrongerRuleRecall.
\]

This should be evaluated against quiz-free play and detached multiple-choice questions.

## 11. Limitations

The current work has several limitations.

First, it is a design-and-systems paper, not an empirical validation of learning. Second, the proposed three-level slice focuses on the AI Pet scale; the Village and Superteam scales remain architectural commitments requiring later implementation and study. Third, emotional attachment can increase engagement but may also encourage over-trust or anthropomorphism. The governance layer must therefore preserve visible boundaries and avoid presenting affect as evidence. Fourth, deterministic safeguards do not guarantee that generated dialogue is unbiased, appropriate, or educationally effective. Finally, the mathematical notation formalizes software contracts and hypotheses; it should not be interpreted as a psychological theory validated by the present prototype.

## 12. Reproduction Protocol

A reproduction package should include:

1. the exact repository commit;
2. a browser-compatible build;
3. deterministic seeds for each level;
4. a scripted three-level traversal;
5. reducer and invariant tests;
6. adversarial input tests;
7. a claim-evidence matrix;
8. a receipt listing passed, failed, and inconclusive obligations.

A build claim is admissible only when accompanied by a test or witnessed playthrough artifact.

## 13. Discussion

Goblin Warren reframes AI literacy as interaction with constitutional boundaries. The player does not merely learn what an agent says; the player learns what an agent can observe, propose, execute, remember, and authorize. The game's emotional layer is not separate from this objective. Attachment motivates attention, but the system must continuously demonstrate that affection, confidence, and narrative coherence do not substitute for evidence or permission.

This distinction becomes increasingly important as AI products move from answer generation toward tool use and coordinated action. A conversational interface can obscure the transition from suggestion to execution. A playable constitutional interface makes that transition visible and contestable.

The three scales also provide a curriculum for increasing complexity. The AI Pet makes bounded agency legible. The Village makes divergent interpretation and emergent coordination visible. The Superteam turns coordination into an explicit design problem involving roles, tools, handoffs, and verification. The architecture therefore connects affective interaction with operational literacy without collapsing one into the other.

## 14. Conclusion

Goblin Warren proposes a progressive, governed approach to agent literacy. Its central design law is simple:

\[
\text{First a relationship, then a society, then a team.}
\]

Its central systems law is stricter:

\[
\text{expression} \neq \text{evidence} \neq \text{permission} \neq \text{authority}.
\]

The three-level vertical slice translates these laws into embodied interaction: build a fire with a bounded companion, inspect a living stream of trustworthy and deceptive signals, and execute a timed care ritual. The contribution is not a claim that these mechanics already improve AI literacy. It is a formal, testable design for turning agent architecture into something a player can experience, question, and eventually govern.

## References

- Chandler, P., & Sweller, J. (1991). Cognitive Load Theory and the Format of Instruction. *Cognition and Instruction, 8*(4), 293–332. https://doi.org/10.1207/s1532690xci0804_2
- Kafai, Y. B., & Burke, Q. (2015). Constructionist Gaming: Understanding the Benefits of Making Games for Learning. *Educational Psychologist, 50*(4), 313–334. https://doi.org/10.1080/00461520.2015.1124022
- Long, D., & Magerko, B. (2020). What is AI Literacy? Competencies and Design Considerations. *Proceedings of CHI 2020*, 1–16. https://doi.org/10.1145/3313831.3376727
- Park, J. S., O'Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., & Bernstein, M. S. (2023). Generative Agents: Interactive Simulacra of Human Behavior. *UIST 2023*. https://arxiv.org/abs/2304.03442
- Qian, C., Liu, W., Liu, H., et al. (2023). ChatDev: Communicative Agents for Software Development. https://arxiv.org/abs/2307.07924
- Sweller, J. (1988). Cognitive Load During Problem Solving: Effects on Learning. *Cognitive Science, 12*(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4
- Sweller, J. (2020). Cognitive Load Theory and Educational Technology. *Educational Technology Research and Development, 68*, 1–16. https://doi.org/10.1007/s11423-019-09701-3
- UNESCO. (2024). *AI Competency Framework for Students*. UNESCO.

## Appendix A. Claim Discipline

The article uses the following claim classes:

- `ARCHITECTURE_CLAIM`
- `IMPLEMENTATION_CLAIM`
- `OBSERVATION_CLAIM`
- `DESIGN_HYPOTHESIS`
- `EMPIRICAL_CLAIM`
- `FUTURE_WORK`

No empirical learning-effect claim is admitted in this version.

## Appendix B. Publication State

```text
ARTICLE_STATE: REVIEWABLE_DRAFT
BUILD_STATE: CURRENT_V0_INSPECTED; THREE_LEVEL_SLICE_NOT_YET_WITNESSED
EMPIRICAL_STATE: UNKNOWN
AUTHORITY: false
CANON: false
OPERATOR_SEAL_REQUIRED: true
```
