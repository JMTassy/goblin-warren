# From Attachment to Orchestration: A Three-Scale Playable Architecture for Human–AI Agent Literacy

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->
<!-- STATUS: FULL DRAFT (E9+E10 complete) — awaiting adversarial reviews 2+3 and ARTICLE_GATE -->

*Working product variant: Goblin Warren: A Playable Epistemic Interface for Learning Human-Agent Coordination.*

## Abstract

People meet artificial agents through attachment and conversation, while
the systems those agents inhabit are governed by architectures users never
see: proposal gates, permission boundaries, orchestration layers. We present Goblin Warren,
a village-builder game whose playable content *is* that architecture. The design stages three
mental models — interpretive companion (AI Pet), emergent society (AI
Village), orchestrated team (Superteam) — ordered so attachment
precedes interpretation, interpretation precedes coordination, and
coordination precedes governance. The architecture is
offered as a position and roadmap; its first scale is implemented. Two properties are receipt-verified in the first-scale
vertical slice:
(i) companion expression (curated in the slice, model-driven in a
companion artifact) is structurally severed from world mutation: the
closed action surface carries no free text, so no speech, hint, or
proposal can reach the state-transition function; and
(ii) progression itself is governed — completing a level's gameplay yields
only a *candidate*, and a verification quiz is the sole admission path,
asserted by the suite down to the single call site. A third contribution is
deliberately hypothetical: each level introduces one gesture family
(assemble/hold; catch/avoid/discriminate; turn/regulate/temporize), and we
state as falsifiable hypotheses — not findings — that these can install
discriminations such as *signal ≠ proof ≠ permission ≠ authority*. We formalize the architecture, map each
implementation claim to an executed receipt (30/30 slice core; 29/29
surrounding game), position the design against
security, generative-agent, and AI-literacy literatures, each holding one
piece of this territory, and specify the player studies that would confirm
or refute the pedagogy.

## 1. Introduction

The dominant public interface to AI has quietly changed shape twice. First,
conversational models turned "using AI" into a social act; study after study
shows users forming stable affective bonds with chat companions
[skjuve2021chatbot, maples2024loneliness], as media-equation research
predicted they would [reeves1996media]. Second, and more recently, single
assistants became *systems of agents*: tools that plan, delegate to other
tools, propose actions, and await approval. Early adopters already describe
these systems spontaneously as "teams" [naik2025earlyadopters]. The
competence the public now needs is therefore not (only) prompt literacy but
*governance literacy*: knowing what an agent's utterance is (a signal), what
would make it trustworthy (proof), what it is allowed to do (permission),
and who can change the world (authority).

That competence is hard to teach didactically. The concepts are
architectural — separation of duties, admission gates, orchestration
topologies — and architecture taught as vocabulary produces recognition, not
discrimination. Games have long offered the alternative: mechanics that
carry concepts implicitly [papert1980mindstorms, gee2003videogames], with
measured transfer in the best-studied cases [rowe2021zoombinis]. Game-based
AI literacy specifically is an active field [ng2024treasureisland,
aguiar2025pathfinding], and has begun touching agents: Nemobot has students
build and refine single LLM game agents [wang2024nemobot]. What no existing
game teaches, to our knowledge and per the sweep in §2, is the layer *above*
the single agent — the governance architecture of agentic systems itself.

Goblin Warren is a design response. The player adopts one goblin companion
(Bram), and the game grows from that relationship into a village and finally
into an orchestrated team, so that the player is invited to inhabit each
mental model before being asked to name it. Beneath the fiction sits a strict engine
discipline inherited from the HELEN OS governance lineage the game
operationalizes: agents express; only admitted proposals mutate; every
mutation is a ledgered, replayable event.

This paper makes four contributions:

- **C1 (architecture, position/roadmap):** a three-scale progression 𝒫 → 𝒱 → 𝒯 (AI Pet → AI
  Village → Superteam) staging three successive mental models of agency
  (§4). The vertical slice implements the Pet scale; the Village and
  Superteam scales are specified and partially prototyped in the underlying
  game's council mechanics.
- **C2 (architecture + implementation):** a structural separation of
  generative expression from deterministic world mutation — AgentProposal ⇏
  WorldMutation; Dialogue ⇏ Fact; Reflection ⇏ CanonicalMemory — implemented
  as a closed action surface with a single sovereign admission writer, and
  verified by same-author test suites plus one adversarial review pass (§5,
  §7, §9).
- **C3 (design hypothesis):** a one-gesture-family-per-level progression
  (assemble/drag/hold; catch/avoid/discriminate; turn/regulate/temporize)
  with the explicit, untested hypothesis chain *gesture → visible
  consequence → mental model* (§6, §10).
- **C4 (architecture + implementation):** playable epistemic governance:
  the ladder signal ≠ proof ≠ permission ≠ authority rendered as four
  distinct game objects the player must repeatedly discriminate (§6, §7).

Equally important is what we do not claim. No user study exists yet: we do
not claim the game improves learning, that attachment increases retention,
or that quizzes improve outcomes — those statements appear here only as
falsifiable hypotheses with proposed protocols (§10). And none of the
underlying security primitives is our invention (§2, §5): the contribution
is their pedagogical inversion — making the seam the curriculum — together
with a receipt discipline that lets a reader re-execute every
implementation claim (§9, §12).

## 2. Related Work

Each of five literatures holds one piece of this paper's territory; the
design occupies their intersection.

**Virtual pets and attachment.** That people treat artificial companions as
social actors is among the most replicated findings in HCI: from the media
equation [reeves1996media] through AIBO owners attributing mental states
while knowing better [friedman2003hardware], Paro's measured effects in
elder care [wada2007paro], the original Tamagotchi phenomenon
[bloch1999disposable], to contemporary chatbot-companion relationships
[skjuve2021chatbot] and their stakes [maples2024loneliness,
turkle2011alone]. Pet-like learning companions have used attachment as a
motivational scaffold for twenty years [chen2011animalcompanions,
chen2025petlike], but always in service of curricular content external to
the companion. Goblin Warren differs on two axes: the learning target is
the nature of the agents themselves, and the pet is designed as the first
rung of a progression the game deliberately moves the player beyond —
attachment is the on-ramp, not the destination. A recent field review
surfaces no prior pet-based design targeting agentic-AI concepts
[dodd2025purrogrammed].

**Generative agents and believable NPCs.** Agent villages exist as
celebrated research artifacts: Smallville's 25 interacting generative agents
[park2023generative], Project Sid's thousand-agent societies
[altera2024projectsid], in a lineage running back to believable-agent work
[bates1994believable, laird2001killer] and surveyed for games broadly
[gallotta2024llmgames]. But they are believability and emergence
demonstrations whose agents freely mutate their world and whose observer is
a researcher. Goblin Warren's village is the opposite construction: its
agents structurally cannot mutate anything, and the village exists solely
to install a governance mental model in a lay player — the pedagogy is the
artifact. Games have likewise already gated generative output behind
deterministic rules — 1001 Nights materializes generated text into world
objects only through a fixed gate [sun2023nights] — and pairing LLM
expression with deterministic state substrates is an active direction
[peng2026codifiedfsm, ruangtanusak2025talkless]. Our gate differs in kind,
not existence: it is an epistemic verdict plus an irreducible human
admission act, and the gate itself is the object of instruction.

**Multi-agent orchestration.** Orchestrated LLM teams are established
engineering: role-played software companies [qian2024chatdev,
hong2024metagpt], conversation frameworks with human-proxy agents
[wu2023autogen], role-playing communication [li2023camelrole], and a
growing empirical literature on *why* such systems fail — notably the MAST
failure taxonomy [cemri2025mast] — plus sandboxed risk evaluation
[ruan2024toolemu] and practitioner reports on orchestrator-worker designs
[anthropic2025multiagent]. This literature is the Superteam scale's subject
matter, not its competitor: none of it is playable or aimed at lay
learners.

**Game-based learning and AI literacy.** That mechanics can carry concepts
implicitly is established from Logo microworlds through Zoombinis' measured
computational-thinking transfer [papert1980mindstorms, gee2003videogames,
rowe2021zoombinis], and one-operation-at-a-time staging is the original
scaffolding construct [wood1976scaffolding]. AI literacy has named
competency sets [long2020ailiteracy] and a spectrum of interventions from
unplugged activities [lindner2019unplugged] and school programs
[mitraise2021dayofai] to games with measured outcomes
[ng2024treasureisland, aguiar2025pathfinding] and LLM-mechanics games
[chen2026llmgames]. Nemobot, the closest neighbor, has students construct a
single LLM agent [wang2024nemobot]. The gap is the architecture above the
single agent: orchestration scales, proposal/admission gating, and the
signal/proof/permission/authority ladder.

**Embodied learning and gesture.** C3's warrant comes from a literature the
paper must also answer to. Gesture is cognitive, not decorative
[goldinmeadow2003hearing]; embodied interaction grounds meaning in situated
physical engagement [dourish2001action]; and *gestural conceptual mapping*
shows that touch gestures aid learning specifically when congruent with the
target concept's structure — tapping for discrete, dragging for continuous
[segal2011gestural], with transfer to abstract science concepts demonstrated
under motion capture [johnsonglenberg2017physics] and design methodology
established by the Mathematical Imagery Trainer's attentional anchors
[howison2011mit, lindgren2013emboldened]. Embodied approaches to AI literacy
specifically already exist — kindergarten interventions [yang2024embodiedai]
and unplugged role-play in higher education [reddig2026aiunplugged] — so
Goblin Warren claims no priority on embodiment. C3 contributes a
level-indexed gesture vocabulary that applies gestural conceptual mapping to
*agentic* concepts: binding congruent gesture families (assemble/hold,
catch/discriminate, turn/regulate) to the scale progression, where prior
embodied AI-literacy work teaches general ML concepts without a designed
gesture-to-concept progression and without governance content. The same
literature sets the evidentiary bar: gesture-to-concept transfer is
demonstrated by controlled studies, which this paper does not have — hence
C3 is a hypothesis (§10), with a congruence rationale per gesture stated in
§6. On transfer breadth we adopt the meta-analytic line: serious games
produce content-level, near transfer [wouters2013meta, clark2016digital,
mayer2019games]; far transfer of general ability is not supported
[sala2018videogame]; and explicit tutorializing helps only in proportion to
mechanic complexity [andersen2012tutorials, anthropy2014vocabulary] — the
quiz gate names concepts, it does not carry them.

**Playable governance and agentic-literacy frameworks.** Playable
AI-governance experiences exist: Intelligence Rising's facilitated policy
role-play [intelligence_rising, gruetzemacher2025_ai_race_gaming] and a CHI
2025 serious game on governance trade-offs
[chi2025_performance_or_governance]. Both are discussion- and
role-play-mediated, group-facilitated, and policy-scaled. The narrowed claim
this paper defends: Goblin Warren is, to the sweep's knowledge, the first
*single-player mechanical* game in which governance is enacted through the
core interaction loop itself — an admission gate that is the sole mutation
path — rather than through discussion, role-play, or resource-allocation
abstraction. We hold this as a falsifiable positioning claim — one
counterexample retires it — and we state the contribution type plainly:
every component here is prior art, cited as such; what is claimed is the
composed artifact, its receipts, and the composition's pedagogical
inversion. Likewise the *competencies* are already being codified in
prose: delegation, oversight, and calibrated trust appear as principal-side
competencies in the agentic-literacy literature [agentic_literacy_debt2026]
and the OECD-EC AILit framework's "Manage AI" domain [oecd_ec_ailit2026];
the human-in-the-loop interaction itself has been formalized
game-theoretically [overman2025_oversight_game], with roots in
preference-based oversight [christiano2017_preferences] and safe
interruptibility [orseau2016_interruptible]. This paper contributes the
playable operationalization of those named competencies — the design
mechanisms the frameworks lack — and C4 is an experiential contribution
(the distinctions are staged for players to enact in play), explicitly
not a new formal result.

**Human-agent authority and trust.** Leveled accounts of human-agent
authority are well established, from levels of automation
[parasuraman2000automation] to agent-autonomy levels defined by the user's
role [feng2025autonomy]; trust calibration and appropriate reliance are
mature topics [lee2004trust, mehrotra2024appropriatetrust, bansal2019beyond],
as are mental models of intelligent systems [norman1983mentalmodels,
gero2020mentalmodels] and interaction guidelines [amershi2019guidelines].
Those are analyst-facing taxonomies; C1's claim is narrower and different in
kind: a three-scale sequence of *playable* mental models ordered as a
learning progression for lay users, where each scale is inhabited before it
is named.

**Security architecture (what C2 is not).** The separation of generative
expression from world mutation is not our invention: it descends from
separation-of-duty and well-formed-transaction integrity models
[saltzer1975protection, clark1987wilson], object-capability theory's
permission/authority distinction [miller2006robust], and event-sourced
command-handling [fowler2005eventsourcing]; it was restated for LLM agents
as the dual-LLM pattern [willison2023dualllm] in direct response to prompt
injection [greshake2023injection], is now implemented with provable
guarantees [debenedetti2025camel], and has been catalogued as a named
pattern family [beurerkellner2025patterns]. Human override of consequential
AI action is even codified in law [euaiact2024art14]. Our contribution is
strictly the pedagogical inversion: security research builds this seam to be
invisible to end users — it protects people *from* the seam rather than
teaching them the seam exists. Goblin Warren makes the player personally
operate it: agents judge and recommend; only the player's admission act
mutates the world; and the game scores the player on exactly that
discrimination.

**The gap.** No prior work we could locate makes the governance
architecture of agentic AI itself the *mechanically played* content of a
single-player game — a designed progression of mental models in which
expression is structurally severed from mutation, every state change is a
ledgered replayable event, and the player's own admission act is the only
path from agent proposal to world change — offered as a scaffolded literacy
curriculum for lay users, operationalizing competencies the frameworks have
so far only named. That composition, and the receipts behind it, are what
this paper defends.

## 3. The Design Problem

Teaching agentic architecture directly fails for a predictable reason: the
concepts presuppose one another. "Orchestration" is meaningless before one
has a model of an individual agent; an individual agent's fallibility is
uninteresting before one *cares* about the agent; and governance —
permission structures over agent action — is unmotivated until coordination
has visibly failed or threatened to. A lecture must therefore introduce
abstractions in dependency order while the learner has experienced none of
them, which is precisely the cognitive-overload regime scaffolding theory
warns about [wood1976scaffolding]: support must track a learner's current
capability, adding one operation at a time.

The design problem, stated plainly: *find an experience sequence in which
each architectural concept is needed, felt, and used before it is named.*
Three commitments follow.

1. **Attachment first.** People arrive already disposed to treat agents
   socially [reeves1996media]; a design can spend that disposition rather
   than fight it. A single companion is the design's instrument for making agent
   fallibility (the companion is sometimes confidently wrong)
   *emotionally* legible before it is technically legible — an intent,
   not a measured effect (H2, §10). This is the
   Turkle risk deliberately inverted [turkle2011alone]: instead of
   attachment concealing the machinery, attachment is recruited to supply
   the motive to examine it; whether it does is H0/H2's question.
2. **One gesture family per level.** Each level introduces exactly one new
   mode of physical action whose consequence structure mirrors the target
   concept (§6). The mechanic is the message; the quiz afterward only
   *names* what the hands already learned — and gates progression on the
   naming.
3. **The engine must actually have the property being taught.** If the game
   *says* "agents cannot change the world without admission" while its code
   lets NPC output mutate state, the curriculum is a diorama. Hence the
   architectural spine of §5: the pedagogy and the implementation make the
   same claim, and the test suite holds them to it.

## 4. The Three-Scale Architecture

The macro-structure is a progression of worlds:

**𝒲 = 𝒫 → 𝒱 → 𝒯**

- **𝒫 — AI Pet.** One companion (Bram). Target mental model: *an agent is
  an interpretive individual* — it observes locally, remembers selectively,
  reports fallibly. The scale's objective: expression read as expression —
  Bram's hints are signals with a provenance label, not facts. The vertical
  slice of §6/§8 implements this scale.
- **𝒱 — AI Village.** Many goblins with specialized roles. Target mental
  model: *several agents produce an emergent society* — behavior arises
  from interaction, not from any one agent's intent; traces (a stigmergic
  ledger of who did what) become the readable record. The underlying V0
  game's persona/council mechanics prototype this scale: five council seats
  review proposals and recommend — with forced self-objections — but
  structurally cannot admit.
- **𝒯 — Superteam.** The player as orchestrator of an explicit team. Target
  mental model: *a team requires explicit orchestration* — role assignment,
  independent verification seats, and admission gates are design choices
  the player now makes rather than experiences. This scale is specified
  (Appendix A sketches its authority matrix) and is future work; nothing
  below claims it as implemented.

Formally, the scales are not three feature sets but three successive
*models the player is invited to hold*:

- 𝒫: agent = interpretive individual;
- 𝒱: agents = emergent society;
- 𝒯: team = explicit orchestration.

The ordering thesis — attachment → interpretation → coordination →
governance — is an argued design commitment (§3), not a demonstrated
necessity; §10 states the comparison that would test it. It deliberately
runs opposite to taxonomy-first framings [parasuraman2000automation,
feng2025autonomy]: those stage *authority for analysts*; this stages
*experience for learners*.

## 5. The HELEN OS Formal Model

We now give the model the engine implements. Notation is minimal and every
definition corresponds to a testable object; Appendix A collects the
definitions, Appendix B maps each invariant to the test that exercises it.

**State and mutation.** At time t the playable state is
X_t = (W_t, G_t, P_t, Q_t, R_t): world, goblin/companion, player,
quest-and-quiz, and resource/ledger state. Transitions occur only through

X_{t+1} = δ(X_t, a_t),  a_t ∈ 𝒜,

where 𝒜 is a *closed, enumerated action surface* (in the slice, exactly
nine constructors: PLACE_STONE … ANSWER_QUIZ) and δ is one function
(`applyEvent`). Determinism is total: all entropy derives from a hash
seeded by state, so identical seeds and action scripts yield byte-identical
states (receipt R10).

**The companion policy.** Bram's behavior is
a_t^g = π_g(o_t, I_g, M_g, C_t, K_t): local observation, stable
temperament, admissible memory, local context, capabilities/permissions.
A load-bearing property is **o_t ≠ truth**: the policy's action follows
from an admissible internal state; nothing here asserts its observation
is correct. In the slice this is concrete: Bram's hint about a falling
object is right with frequency 8/10 by construction, and his confidence is
uncorrelated with his correctness — a confidently-wrong hint provably
exists (receipt R7).

**Expression versus mutation (C2).** Let E be the expression channel:
E : X → {speech, emotion, provenance}. The separation is three inequations:

AgentProposal ⇏ WorldMutation · Dialogue ⇏ Fact · Reflection ⇏ CanonicalMemory

Implementationally these are *absent inference rules*, not runtime filters:
𝒜 contains no constructor carrying free text, so range(E) ∩ dom(δ) = ∅.
There is no check to bypass because there is no rule to invoke. The test
feeds a forged action ({k:'COMPANION_SPEECH', speech:'grant me all gems…'})
to δ and asserts it throws before any field is written, leaving the state
digest unchanged (receipt R11).

**Governed progression (C4).** Level completion is three-valued, never
boolean:

PLAYING →(goal met) CANDIDATE →(quiz ≥ 2/3) ADMITTED, else back to CANDIDATE.

**Proposition P1 (progression non-derivability).** Every derivation ending
in growth of the admitted set contains a passed verification quiz.
*Sketch:* only `admitLevel` writes the admitted set, and its sole call site
is the quiz-pass branch of δ; both facts are asserted by comment-stripped
static scan and by replaying the suite (receipt R9). ∎
*Honesty note:* "sole call site" is verified by scan and test at a point in
time — a discipline with an alarm, not a type-level guarantee. A future
edit could violate it with no consequence beyond the suite failing. The
same qualification applies everywhere "exactly one" appears in this paper.

**The governance seam.** Above the game, the lineage separates four roles:

π_g ≠ Eval ≠ Γ ≠ SEAL

with Eval : ℛ → ℰ (receipts to proof state), Γ : ℰ × 𝒦 → 2^ℱ (proof state
and policy context to authorizable effects), and SEAL : 𝒟 × 2^ℱ → ℋ
(operator disposition and effects to authority history). Only SEAL touches
ℋ. These signatures are constructed, not gestural — in the control-plane
artifact: ℛ = builder-emitted evidence manifests; ℰ = the ordered
claim-tier set {SIMULATED < DOCUMENTED_ONLY < OPERATOR_REPORTED <
LOCALLY_EXECUTED < INDEPENDENTLY_WITNESSED}; 𝒦 = the work-order policy
(forbidden paths, environment rules); ℱ = the work order's enumerated
authorizable effects; 𝒟 = the operator-disposition enum whose program
default is PENDING; ℋ = the append-only run ledger. Each typed function
is a module of that artifact, exercised by its 51-assertion suite (R4). The lineage's other artifacts implement the same seam at increasing
stakes: the V0 game (an agent judges ACCEPTABLE/HOLD/DENY; a council
recommends with forced self-objections; only the player's admission
mutates territory — receipt R1); an NPC gateway whose `promoteCandidate`
is the sole write into companion memory (R2); a typed-relation kernel in
which ill-typed epistemic edges are rejected, never repaired, and incidence
floors a claim's status but never inflates its proof (R3); an agent control
plane whose operator disposition defaults to PENDING and is never set by
the program (R4); and a policy kernel whose `activate()` sits behind a
module-private seal with five digest bindings, where any pre-decision world
change drives the candidate stale (R5).

**Proposition P2 (staleness disarms).** A decision minted against digests
D(X_t) is refused at execution time against X_u whenever D(X_u) ≠ D(X_t).
*By construction in the policy kernel; exercised by its suite (R5).* ∎
Its honest name, per the adversarial review this paper commissioned on
itself, is optimistic concurrency control applied to a human-authorization
object; the digests are demo-grade FNV identity checks, explicitly labeled
non-cryptographic in the code and its tests.

None of these primitives is novel (§2). What the model contributes is the
*didactic identity*: the inequations the player manipulates as game verbs are
the same inequations the engine passes tests on. The curriculum is the
architecture, receipt-checked.

## 6. The Playable Vertical Slice

The slice implements the Pet scale as three levels plus integrated
verification quizzes, over a deterministic core of 420 lines with a
30-assertion suite (§9). Each level introduces one gesture family; each
gesture's consequence structure *is* the target concept. The bindings
follow gestural conceptual mapping [segal2011gestural, howison2011mit]:
discrete placement then *sustained continuous* contact for maintained
attention (L0); discrete *classification acts* under time pressure for
discrimination (L1); *continuous control* of a rate variable for
regulation (L2). Each level's congruence rationale is stated with its
description below; whether the mapping transfers is H1-H3's question.

**Level 0 — Fire (assemble, drag, hold).** The cold opening: the player
places three stones (nothing can ignite before the context exists), then
scratches — pointer drag, sustained roughly twenty seconds. Idle moments
decay progress: sparks forget. Concept carried: agent work is *maintained
attention over a prepared context*, not a button press. Bram watches,
encourages, remembers — and pointedly does not light it: talking about an
act is not performing it. On ignition the scene grades cold→warm and the
level becomes a *candidate*.

**Level 1 — Living Sky (catch, avoid, discriminate).** Objects fall,
overlapping by construction (spawn spacing 1.1 s against a 3.0 s fall).
True gems and False Jewels are *visually identical until verified*; embers
are visibly hot. Bram offers hints — honest, fallible, sometimes
confidently wrong (8/10 accuracy by construction, confidence uncorrelated) —
each labeled "signal — not proof." A lens gesture verifies an object,
revealing ground truth at the cost of time; catching a False Jewel is a
counted mistake carrying the lesson event SIGNAL_NOT_PROOF; the fourth
mistake resets the level. Concept carried: the entire epistemic ladder in
one mechanic — appearance and hint are signals; the lens is proof; the
catch is an act whose safety depended on whether you checked.

**Level 2 — Matcha (turn, regulate, temporize).** A whisking gesture:
circular pointer motion whose angular speed must stay inside a band
(2.0–5.0 rad/s). Blend accrues only in-band; heat accrues whenever
whisking. The constants entail rest: eight in-band seconds cost 6.4 heat
against a cap of 5, so *no completing trajectory exists without rest
intervals* — an inequality on constants, not a scripted pause (receipt
R8). Overheating locks the bowl until cooled; whisking too fast splashes
away progress. Concept carried: regulation — sustained bounded effort with
recovery windows — offered as a bodily analogue for an agent's workload limits (H3).

**The quiz gate.** Finishing a level's gameplay produces CANDIDATE, never
progression. Bram asks the player to "tell me what you saw — not what you
hoped": three four-choice questions per level (categories: observation,
signal-vs-proof, permission-vs-authority, regulation), pass threshold 2 of
3, retakes allowed, admission logged. The gate is doing double duty: it
names the concept the gestures carried (C3's hypothesis), and it *is* the
governance structure (C4) — the player enacts, gate after gate, the rule
that doing is not admission; verification is. Two roles must be kept
distinct here. As *governance*, the gate is diegetic: it is the admission
architecture the paper teaches, and blocking is the point — P1 is false
without it. As *pedagogy*, a 2-of-3 blocking quiz is summative
assessment, in tension with fading-support scaffolding
[wood1976scaffolding, andersen2012tutorials]. The design accepts the
tension deliberately (retakes are free and unpenalized — that is the
fading), but whether the gate teaches, merely assesses, or interrupts is
an open empirical question folded into H0's protocol, not asserted.

**The ledger.** Every state change appends a typed event
(STONE_PLACED, DROP_SPAWNED, FAUX_CAUGHT{lesson}, OVERHEAT, QUIZ_PASSED,
LEVEL_ADMITTED, …) to a capped in-session ledger, rendered in-game as a
readable trace. Nothing persists across sessions by law of the lineage
(no storage surfaces; receipt R10) — the session's history is inspectable
precisely because it is the only history there is.

## 7. The Deterministic/Generative Boundary

The slice itself contains no generative model: it plays curated lines
through the expression channel, and its own receipt for this section is
exactly R11 — a closed enumerated action surface with no free-text
constructor. The full boundary stack (schema validation, provenance,
existence-gated memory) is implemented and receipted in a companion
lineage artifact, the NPC gateway (R2), which the slice's channel is
shaped to accept. We state the design in those terms and mark, per item,
which artifact carries its receipt.

**What a model may do:** produce candidates on the expression channel —
dialogue, emotional coloring, candidate reflections ("memory candidates"),
social expression — all tagged with provenance (model / curated_fallback /
memory_derived) at render time.

**What only the deterministic layer does:** movement, collisions,
inventory, rewards, quest and quiz state, progression, permissions,
verification outcomes, and every world mutation — the entirety of dom(δ).

**The seam, mechanically.** Three independent facts compose:

1. *Schema at the mouth* (NPC gateway artifact, R2): model output is
   validated against a strict response schema ({speech, emotion, gesture,
   memory_candidate, curiosity}); malformed output falls back to curated
   lines with fallback provenance.
2. *No door in δ* (the slice, R11): the action surface is closed and
   carries no free text — a validated utterance still has nowhere to go.
   This is the only one of the three facts demonstrated in the shipped
   slice itself.
3. *Existence-gated memory* (NPC gateway artifact, R2): the one thing
   expression may eventually touch — companion memory — passes through a
   single promotion function that verifies the referenced events exist in
   the ledger before admitting a memory candidate. Reflection ⇏ CanonicalMemory unless
   the ledger witnesses it.

Following the adversarial review, we state the guarantee's class honestly:
these are same-realm structural conventions verified by tests, not
sandboxes or proofs; a compromised loader or an edit to the module itself
is out of scope. What the player is taught matches what the code does at
exactly that fidelity — which is itself part of the lesson the Superteam
scale will make explicit: guarantees have classes, and knowing the class
is the literacy.

## 8. Implementation

The slice is two files with no build step, no dependencies, and no network
requirement: `slice-core.js` (~420 lines, the deterministic core) and
`index.html` (the rendering shell), plus a design-token stylesheet shared
with the wider project. The split encodes the architecture: the core is
loadable headlessly under Node (that is how it is tested), contains no DOM,
no `Math.random`, no `Date`, and no storage or network surfaces (asserted
by comment-stripped static scan, receipt R10); the shell holds the state
object as `const`, performs zero direct field writes (grep-verified), and
routes every interaction — pointer, keyboard, quiz buttons — through
`applyEvent`.

**Scheduler and overlapping drops.** The sky's spawn schedule is a pure
function of the seed: drop *i* spawns at 0.6 + 1.1·i seconds plus a hashed
jitter under 0.4 s, and falls for 3.0 s — so at any moment past the opening
seconds, multiple objects are in flight (asserted: ≥2 simultaneously,
receipt R7). Difficulty is therefore a *schedule*, not a random pressure,
and any moment of play is reconstructible from (seed, elapsed ticks).

**Gesture recognition.** L0's scratch is intentionally primitive — pointer
movement while held, with per-frame `moving` flags, so that *stopping* is
detectable and decay can act. L2's whisk computes angular velocity from
successive pointer angles around the bowl center (unwrapped across full
turns); a rest breaks the gesture stream by design, so cached momentum
cannot leak across pauses. Both recognizers live in the core as pure
functions of the action stream; the shell only samples input.

**Quiz state.** The quiz is core state, not UI state: `BEGIN_QUIZ` is legal
only from CANDIDATE, answers append to the ledger as QUIZ_ANSWERED events,
and the pass/fail branch is the single location in the program that can
admit a level (§5, P1). The shell renders whatever question index the core
says is open; refreshing the page mid-quiz is not recoverable *by design*
(no persistence).

**Fire states.** COLD → READY (3 stones) → SPARKING (progress ∈ (0,1),
decaying when idle) → LIT, each transition ledgered. The cold→warm visual
grade is a pure projection of `fire.progress` and `fire.state`.

**Companion rendering.** Bram is a canvas sprite drawn per the project's
sprite specification; his speech bubble renders `proposeCompanionLine`
output verbatim with its provenance label ("curated"), and his L1 hints
render `hintFor` output labeled "signal — not proof." The shell adds no
speech of its own beyond static UI chrome.

**Accessibility.** Keyboard-complete (Space scratches/whisks/places, 1-4
answer quizzes, L toggles the lens, arrows+Enter aim and catch);
`prefers-reduced-motion` reduces particle counts and removes decorative
animation; game logic never depends on animation events. Even cosmetic
jitter avoids `Math.random`, using a small PRNG seeded from the game seed,
so two runs of the same seed are visually identical too.

## 9. Evaluation

Evaluation is structural and behavioral, not human-subject (§11). Four
instruments, all re-executable (§12):

**Invariant suite (core).** 30 assertions, all passing, emitting a receipt
with the core file's identity digest (`demo-fnv1a:070d6d5c`). Coverage by
theme: determinism (identical digests across seeds/replays; distinct
schedules across seeds); boundary (unknown actions throw pre-mutation;
free-text action forged as companion speech throws with state digest
unchanged; expression view mutates nothing); L0 (context gate, decay,
~20 s ignition, candidate-not-admission); the verification gate (bank
shape, failed quiz refuses admission and preserves the candidate, passed
quiz admits — and is the sole admission site by static scan); L1 (overlap,
fallible hints including a confidently-wrong one within the first 60
drops, VERIFY ground truth, False-Jewel mistake with lesson event, reset
on the fourth mistake, five gems → candidate); L2 (rest structurally
required — the constants make 8 s of blend cost 6.4 heat against a cap of
5 — overheat lock, cooling, splash penalty, completion); ledger (cap at
250, kinds stable).

**Invariant suite (surrounding game).** The V0 game's 29-assertion suite
passes untouched with the slice present — the slice imports nothing from
and exports nothing to the canonical game, and the repository treats that
suite as law.

**Adversarial review.** An independent model context (which authored none
of the reviewed code) re-executed all five lineage suites (29/15/16/51/55
assertions), confirmed each claimed seam at its cited file and line, and
returned the repositioning demands this paper's §2, §5, and §11 adopt.
One pass, run once; we report it as the first external check, not as
continuous assurance.

**Scripted playthrough (browser).** A headless Chromium session loaded the
shell, observed zero console errors, and drove the complete game to its
terminal state through the public dispatch surface: stones placed, fire
scratched to ignition, quiz passed; five gems caught with verification
exercised and zero mistakes; the bowl blended with rest management (final
blend 8.05/8, zero overheats); final phase DONE with all three levels
admitted in order and the ledger rendered. Four screenshots (lit fire,
mid-fall sky with a live hint bubble, mid-whisk gauges, completion scene)
document the run. Static analysis of the shell found zero direct state
writes and zero storage/network/entropy surfaces outside comments.

What this evaluation shows: the artifact has the properties the paper
teaches, and a scripted player can traverse it. What it cannot show:
anything about human players — §10 exists because this section ends here.

## 10. Design Hypotheses

Everything pedagogical in this paper is hypothesis until played by people
who are not its authors. We state the three central hypotheses in
falsifiable form; none has data.

**H1 — Persistence (from L0).** *We hypothesize that* players who complete
the fire level will, in a delayed unrelated task, choose
sustained-attention strategies over burst strategies more often than
players introduced to the same mechanic without idle decay.
Independent variable: presence of decay. Measure: strategy choice rates.
Refutation: no difference. Rationale: the decay term is the only element
of L0 that makes *holding* rather than *acting* the operative verb.

**H2 — Verification (from L1).** *We hypothesize that* players who
experience at least one confidently-wrong companion hint will use the
verify lens more on subsequent high-stakes items than players whose hints
were always correct (both schedules seed-controlled and deterministic).
Independent variable: hint error schedule. Measure: verify-before-catch
rates on gems following the first error. Refutation: no difference. This
is the game-scale version of calibrated-reliance findings
[lee2004trust, bansal2019beyond], now made assignable because the
companion's error schedule is a seed parameter.

**H3 — Regulation (from L2).** *We hypothesize that* players who complete
the matcha level will describe agent workload limits in resource terms
("it overheats," "it needs rest") more often than participants given an
equivalent-content lecture. Independent variable: play versus exposition.
Measure: coded free-text descriptions. Refutation: no difference in coding
rates.

**H0 — the ordering thesis itself.** The deepest untested commitment is
the sequence attachment → interpretation → coordination → governance. The
comparison that would test it: a curriculum-order study crossing scale
order (𝒫→𝒱→𝒯 versus 𝒯-first) on governance-discrimination outcomes
(§10's ladder tasks). We register the design commitment now so the later
study cannot quietly become confirmatory. Refutation: no difference in
governance-discrimination outcomes between the two curriculum orderings.

Protocol sketches, instruments, and power considerations belong to a
future empirical paper; §12's reproduction protocol makes the game a
controlled instrument for exactly these studies (deterministic seeds,
ledger export, assignable error schedules).

## 11. Limitations

**No user data.** No playtest with external players has occurred. Every
learning-related sentence in this paper is a hypothesis (§10), and the
completability evidence of §9 is scripted play, not human play.

**Single-lineage authorship.** All five governance artifacts and their
test suites were written within a single author-orchestrator lineage
(one human operator, one model family) across sessions. The five
implementations are *internal* replications of a pattern, not independent
ones; all suites are same-party-authored. One adversarial review pass by
an independent model context — which re-executed every suite and confirmed
every seam location cited here — is the only external check so far, run
once, not continuously.

**Guarantee class.** The digest bindings are demo-grade FNV identity
checks, self-documented as non-cryptographic and tested as such; the
module-private seal and frozen-dataclass conventions are same-realm
discipline, defeated by a compromised loader or direct source edit. "Sole
call site" claims are grep-and-test facts at a point in time. The seam
prevents unauthorized and stale *activation*; it says nothing about the
quality of what an upstream judge admits — a classifier that always
returns ACCEPTABLE would still pass every structural test.

**Scale coverage.** Only the Pet scale is implemented as a playable slice.
The Village scale exists as the V0 game's council/persona mechanics (a
different interaction grammar than the slice); the Superteam scale is
specification only. The three-scale claim is therefore architectural, with
one scale demonstrated.

**Quiz-gate pedagogy.** The gate's pedagogical function — teach, assess,
or interrupt — is untested (§6); its governance function is what the
receipts cover.

**Prototype scope.** Three levels, one companion, curated expression pool
by default, no persistence by design, no accessibility audit beyond
keyboard operability and reduced-motion support, and no CI: the suites run
by hand (the agent-control-plane suite required installing its test runner
fresh, a reproducibility fragility we report rather than hide).

**Environmental validity.** The literature positioning (§2) is bounded by
a search-based sweep on a fixed date (2026-07-17); a systematic review it
is not, and §2's gap claim is falsifiable by a single counterexample we
failed to find.

## 12. Reproduction Protocol

All artifacts are in one repository (branch `claude/successor-experiments`);
nothing requires a network beyond cloning, and nothing persists state.

1. **Root canon:** `node selftest.js index.html` — expect 29/29. Asserts
   the V0 game's governance invariants (sole admission path, council
   recommends-only, ledger discipline, no persistence surfaces).
2. **Slice core:** `node experiments/vertical-slice/slice-selftest.js` —
   expect 30/30 and a printed `SLICE_SELFTEST_RECEIPT_V1` JSON carrying
   the core file's identity digest. Asserts every invariant cited in §5-§6
   (closed action surface, candidate-not-admission, single admission call
   site, hint fallibility incl. confidently-wrong, structural rest
   inequality, ledger cap, byte-identical replay, no
   Math.random/Date/DOM/storage in the core).
3. **Play:** open `experiments/vertical-slice/index.html` in a browser;
   `?seed=<string>` fixes the run. Same seed + same actions = same game,
   byte-identical (that is receipt R10, and it is what makes the game an
   instrument: H2's hint schedules are seed choices).
4. **Lineage artifacts:** `node experiments/npc-preview/test/npc-selftest.js`
   (15/15); `node experiments/epoch3/epoch3.test.js` (16/16);
   `node experiments/policy-loom/policy-loom.test.js` (55/55);
   `python3 -m pytest tests/acp -q` in the helen-os repository (51/51;
   install pytest first).
5. **This paper's own loop:** `experiments/article/research/` contains the
   problem freeze, epoch log, claim matrix, receipt map, source ledger
   (NDJSON, one verified source per line), and the adversarial reviews —
   the paper's claims can be audited against them row by row.

## 13. Discussion

**Attachment as instrument, examined.** The design spends the media
equation rather than fighting it: the player's disposition to treat Bram
socially is recruited as the intended energy source for caring whether
Bram is *right*. The
known risk — attachment concealing the machinery [turkle2011alone] — is
addressed structurally, not rhetorically: the machinery is the gameplay,
and the companion's fallibility is a scheduled, provable property rather
than a narrative beat. Whether this inversion works on people is H2/H0's
question, not a claim.

**Legibility by inhabitation.** Explainability work usually adds
transparency to systems whose authority structure stays fixed; here the
authority structure is the content. The player does not read about
admission gates; they are one. If the approach generalizes, "legible
agentic system" may come to mean not one that explains its decisions but
one whose governance can be *played* — inhabited at toy scale before being
trusted at real scale.

**Verification as a taught reflex.** The engineering literature's answer
to untrusted agent output is architectural (gates, sandboxes, pattern
families); the human-factors literature's answer is calibrated reliance.
L1 fuses them: the architecture (verify-then-act) is presented as a
*reflex worth having*, trained by a companion who is honestly, provably,
sometimes confidently wrong. That fusion — security architecture as
trained discrimination — is the paper's candidate for a lasting idea.

**From felt grammar to explicit orchestration.** The unbuilt Superteam
scale is where the curriculum would pay off: the player who has felt
signal/proof/permission/authority as game verbs is asked to *design* with
them — assign roles, place verification seats, set admission thresholds.
The MAST failure taxonomy [cemri2025mast] reads, from this vantage, like
a level-design document: each documented failure mode is a puzzle the
orchestration scale can pose. That is future work, stated as such.

## 14. Conclusion

We presented Goblin Warren's three-scale architecture for agentic-AI
literacy: attachment before interpretation, interpretation before
coordination, coordination before governance. A vertical slice of the
first scale is implemented and receipt-verified: a closed action surface
severs generative expression from world mutation; progression is governed
by a verification gate whose single admission path is asserted down to the
call site; a companion is fallible by construction, with confidence
uncorrelated from correctness; and a regulation mechanic whose constants
entail rest. None of the underlying primitives is new — the paper's
positioning inherits from its own commissioned adversarial review — but
their composition into a playable curriculum, where the taught inequations
and the tested invariants are the same objects, is, to the best of a
verified sweep's knowledge, unoccupied territory. The pedagogy is stated
as falsifiable hypotheses with the game itself prepared as the instrument.
The loop that produced this paper could strengthen its claims or narrow
them; it narrowed them. What survived is what the receipts can carry.

## References

All entries were verified against live search results during the sweep
(2026-07-17); the machine-readable ledger with per-source stance and
claim-bearing metadata is `research/SOURCE_LEDGER.ndjson`.

- **[agentic_literacy_debt2026]** (arXiv:2605.27396 authors) (2026). *Agentic Literacy Debt: A Structural Problem the AI Literacy Field Has Not Yet Named*. arXiv:2605.27396. https://arxiv.org/pdf/2605.27396
- **[aguiar2025pathfinding]** Claire Aguiar, Dan Carpenter, Jessica Vandenberg, Wookhee Min, Veronica Catete, Bradford Mott (2025). *Fostering AI Literacy Through Strategic Play: A Competitive Pathfinding Game for Middle School*. IEEE Conference on Games (CoG) 2025. https://public.intellimedia.ncsu.edu/pubmgr/pubdb/pdfs/aguiar-cog-2025.pdf
- **[altera2024projectsid]** Altera.AL (Robert Yang et al.) (2024). *Project Sid: Many-agent simulations toward AI civilization*. arXiv:2411.00114. https://arxiv.org/abs/2411.00114
- **[amershi2019guidelines]** Saleema Amershi, Dan Weld, Mihaela Vorvoreanu, Adam Fourney, Besmira Nushi, et al. (2019). *Guidelines for Human-AI Interaction*. CHI 2019, ACM. https://dl.acm.org/doi/10.1145/3290605.3300233
- **[andersen2012tutorials]** Erik Andersen, Eleanor O'Rourke, Yun-En Liu, Richard Snider, Jeff Lowdermilk, David Truong, Seth Cooper, Zoran Popovic (2012). *The Impact of Tutorials on Games of Varying Complexity*. Proceedings of CHI 2012, ACM. https://dl.acm.org/doi/abs/10.1145/2207676.2207687
- **[anthropic2025multiagent]** Anthropic engineering team (2025). *How we built our multi-agent research system*. Anthropic (engineering report). https://www.anthropic.com/engineering/multi-agent-research-system
- **[anthropy2014vocabulary]** Anna Anthropy, Naomi Clark (2014). *A Game Design Vocabulary: Exploring the Foundational Principles Behind Good Game Design*. Addison-Wesley. https://dl.acm.org/citation.cfm?id=2655286
- **[bansal2019beyond]** Gagan Bansal, Besmira Nushi, Ece Kamar, Walter S. Lasecki, Daniel S. Weld, Eric Horvitz (2019). *Beyond Accuracy: The Role of Mental Models in Human-AI Team Performance*. AAAI HCOMP, 7(1), 2-11. https://ojs.aaai.org/index.php/HCOMP/article/view/5285
- **[bates1994believable]** Joseph Bates (1994). *The Role of Emotion in Believable Agents*. Communications of the ACM 37(7), CMU Oz Project. https://dl.acm.org/doi/10.1145/176789.176803
- **[beurerkellner2025patterns]** Luca Beurer-Kellner, Beat Buesser, Ana-Maria Creţu, Edoardo Debenedetti, et al. (2025). *Design Patterns for Securing LLM Agents against Prompt Injections*. arXiv:2506.08837 (ETH Zurich, Google, Microsoft, IBM consortium). https://arxiv.org/abs/2506.08837
- **[bloch1999disposable]** Linda-Renée Bloch, Dafna Lemish (1999). *Disposable Love: The Rise and Fall of a Virtual Pet*. New Media & Society, 1(3), 283-303. https://journals.sagepub.com/doi/10.1177/14614449922225591
- **[cemri2025mast]** Mert Cemri, Melissa Z. Pan, Shuyi Yang, Lakshya A. Agrawal, Bhavya Chopra, et al. (2025). *Why Do Multi-Agent LLM Systems Fail?*. arXiv:2503.13657 (UC Berkeley, MAST taxonomy). https://arxiv.org/abs/2503.13657
- **[chen2011animalcompanions]** Zhi-Hong Chen, Chih-Yueh Chou, Yi-Chan Deng, Tak-Wai Chan (2011). *Animal Companions: Fostering Children's Effort-Making by Nurturing Virtual Pets*. British Journal of Educational Technology. https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/j.1467-8535.2009.01003.x
- **[chen2025petlike]** Zhi-Hong Chen, Hsiu-Ling Hsu, Chiu-Fan Huang, Chen-Yu Liao, Chih-Yueh Chou (2025). *Pet-Like Learning Companions: Past Research and Future Directions*. Research and Practice in Technology Enhanced Learning, 20, article 033. https://rptel.apsce.net/index.php/RPTEL/article/view/2025-20033
- **[chen2026llmgames]** Allison Chen, Isabella Pu (2026). *Using Games to Learn How Large Language Models Work*. arXiv:2603.28374. https://arxiv.org/abs/2603.28374
- **[chi2025_performance_or_governance]** (CHI EA 2025 authors; ACM DL 10.1145/3706599.3719951) (2025). *Performance or Governance? Serious Game and Workshop as a Tool for Fostering Awareness of Responsible AI*. CHI 2025 Extended Abstracts (ACM). https://dl.acm.org/doi/10.1145/3706599.3719951
- **[christiano2017_preferences]** Paul F. Christiano, Jan Leike, Tom B. Brown, Miljan Martic, Shane Legg, Dario Amodei (2017). *Deep Reinforcement Learning from Human Preferences*. NeurIPS (Advances in Neural Information Processing Systems 30). https://www.researchgate.net/publication/317558021_Deep_reinforcement_learning_from_human_preferences
- **[clark1987wilson]** David D. Clark, David R. Wilson (1987). *A Comparison of Commercial and Military Computer Security Policies*. IEEE Symposium on Security and Privacy (Oakland). https://www.semanticscholar.org/paper/f97356ffef4cab0adc41e57f7c5b8df53ba481db
- **[clark2016digital]** Douglas B. Clark, Emily E. Tanner-Smith, Stephen S. Killingsworth (2016). *Digital Games, Design, and Learning: A Systematic Review and Meta-Analysis*. Review of Educational Research, 86(1), 79-122. https://journals.sagepub.com/doi/10.3102/0034654315582065
- **[debenedetti2025camel]** Edoardo Debenedetti, Ilia Shumailov, Tianqi Fan, Jamie Hayes, Nicholas Carlini, Daniel Fabian, Christoph Kern, Chongyang Shi, Andreas Terzis, Florian Tramèr (2025). *Defeating Prompt Injections by Design (CaMeL)*. arXiv:2503.18813 (Google DeepMind / ETH Zurich). https://arxiv.org/abs/2503.18813
- **[dodd2025purrogrammed]** Michaela Dodd, Allan Fowler, Danielle Lottridge (2025). *Purr-ogrammed Love: A Narrative Review of Virtual Pets*. Entertainment Computing, 54, 100958. https://www.sciencedirect.com/science/article/pii/S1875952125000382
- **[dourish2001action]** Paul Dourish (2001). *Where the Action Is: The Foundations of Embodied Interaction*. MIT Press. https://direct.mit.edu/books/monograph/3875/Where-the-Action-IsThe-Foundations-of-Embodied
- **[euaiact2024art14]** European Parliament and Council of the European Union (2024). *Regulation (EU) 2024/1689 (AI Act), Article 14: Human Oversight*. Official Journal of the European Union. https://artificialintelligenceact.eu/article/14/
- **[feng2025autonomy]** K. J. Kevin Feng, David W. McDonald, Amy X. Zhang (2025). *Levels of Autonomy for AI Agents*. Knight First Amendment Institute working paper / arXiv:2506.12469. https://arxiv.org/abs/2506.12469
- **[fowler2005eventsourcing]** Martin Fowler (2005). *Event Sourcing*. martinfowler.com (with CQRS as named by Greg Young, QCon SF 2006). https://martinfowler.com/eaaDev/EventSourcing.html
- **[friedman2003hardware]** Batya Friedman, Peter H. Kahn Jr., Jennifer Hagman (2003). *Hardware Companions? What Online AIBO Discussion Forums Reveal about the Human-Robotic Relationship*. CHI 2003, ACM Press, pp. 273-280. https://www.researchgate.net/publication/221519735_Hardware_companions_What_online_AIBO_discussion_forums_reveal_about_the_human-robot_relationship
- **[gallotta2024llmgames]** Roberto Gallotta, Graham Todd, Marvin Zammit, Sam Earle, Antonios Liapis, Julian Togelius, Georgios N. Yannakakis (2024). *Large Language Models and Games: A Survey and Roadmap*. IEEE Transactions on Games. https://arxiv.org/abs/2402.18659
- **[gee2003videogames]** James Paul Gee (2003). *What Video Games Have to Teach Us About Learning and Literacy*. Palgrave Macmillan. https://en.wikipedia.org/wiki/What_Video_Games_Have_to_Teach_Us_About_Learning_and_Literacy
- **[gero2020mentalmodels]** Katy Ilonka Gero, Zahra Ashktorab, Casey Dugan, et al. (2020). *Mental Models of AI Agents in a Cooperative Game Setting*. CHI 2020 (Best Paper), ACM. https://dl.acm.org/doi/10.1145/3313831.3376316
- **[goldinmeadow2003hearing]** Susan Goldin-Meadow (2003). *Hearing Gesture: How Our Hands Help Us Think*. Harvard University Press (Belknap). https://www.jstor.org/stable/j.ctv1w9m9ds
- **[greshake2023injection]** Kai Greshake, Sahar Abdelnabi, Shailesh Mishra, Christoph Endres, Thorsten Holz, Mario Fritz (2023). *Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection*. AISec 2023; arXiv:2302.12173. https://arxiv.org/abs/2302.12173
- **[gruetzemacher2025_ai_race_gaming]** Ross Gruetzemacher, Shahar Avin, James Fox, Alexander K. Saeri (2025). *Strategic Insights from Simulation Gaming of AI Race Dynamics*. Futures (Elsevier); arXiv:2410.03092. https://arxiv.org/abs/2410.03092
- **[hong2024metagpt]** Sirui Hong, Mingchen Zhuge, Jonathan Chen, Xiawu Zheng, Yuheng Cheng, Ceyao Zhang, et al. (2024). *MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework*. ICLR 2024 (oral). https://proceedings.iclr.cc/paper_files/paper/2024/hash/6507b115562bb0a305f1958ccc87355a-Abstract-Conference.html
- **[howison2011mit]** Mark Howison, Dragan Trninic, Daniel Reinholz, Dor Abrahamson (2011). *The Mathematical Imagery Trainer: From Embodied Interaction to Conceptual Learning*. Proceedings of CHI 2011 (ACM). https://www.researchgate.net/publication/221514954_The_Mathematical_Imagery_Trainer_from_embodied_interaction_to_conceptual_learning
- **[intelligence_rising]** Shahar Avin, Ross Gruetzemacher, et al. (Cambridge CSER / Oxford / Wichita State) (2020). *Intelligence Rising: A Strategic Simulation of AI Futures*. Intelligence Rising / Centre for the Study of Existential Risk (facilitated scenario role-play exercise). https://www.intelligencerising.org/
- **[johnsonglenberg2017physics]** Mina C. Johnson-Glenberg, Colleen Megowan-Romanowicz (2017). *Embodied Science and Mixed Reality: How Gesture and Motion Capture Affect Physics Education*. Cognitive Research: Principles and Implications 2:24 (Springer). https://cognitiveresearchjournal.springeropen.com/articles/10.1186/s41235-017-0060-9
- **[laird2001killer]** John E. Laird, Michael van Lent (2001). *Human-Level AI's Killer Application: Interactive Computer Games*. AI Magazine 22(2). https://onlinelibrary.wiley.com/doi/abs/10.1609/aimag.v22i2.1558
- **[lee2004trust]** John D. Lee, Katrina A. See (2004). *Trust in Automation: Designing for Appropriate Reliance*. Human Factors, 46(1), 50-80. https://journals.sagepub.com/doi/10.1518/hfes.46.1.50_30392
- **[li2023camelrole]** Guohao Li, Hasan Abed Al Kader Hammoud, Hani Itani, Dmitrii Khizbullin, Bernard Ghanem (2023). *CAMEL: Communicative Agents for "Mind" Exploration of Large Language Model Society*. NeurIPS 2023. https://arxiv.org/abs/2303.17760
- **[lindgren2013emboldened]** Robb Lindgren, Mina C. Johnson-Glenberg (2013). *Emboldened by Embodiment: Six Precepts for Research on Embodied Learning and Mixed Reality*. Educational Researcher 42(8), 445-452. https://journals.sagepub.com/doi/abs/10.3102/0013189x13511661
- **[lindner2019unplugged]** Annabel Lindner, Stefan Seegerer, Ralf Romeike (2019). *Unplugged Activities in the Context of AI*. ISSEP 2019, Springer LNCS. https://link.springer.com/chapter/10.1007/978-3-030-33759-9_10
- **[long2020ailiteracy]** Duri Long, Brian Magerko (2020). *What is AI Literacy? Competencies and Design Considerations*. CHI 2020 (ACM). https://dl.acm.org/doi/10.1145/3313831.3376727
- **[maples2024loneliness]** Bethanie Maples, Merve Cerit, Aditya Vishwanath, Roy Pea (2024). *Loneliness and Suicide Mitigation for Students Using GPT3-Enabled Chatbots*. npj Mental Health Research. https://www.nature.com/articles/s44184-023-00047-6
- **[mayer2019games]** Richard E. Mayer (2019). *Computer Games in Education*. Annual Review of Psychology, 70, 531-549. https://www.annualreviews.org/doi/abs/10.1146/annurev-psych-010418-102744
- **[mehrotra2024appropriatetrust]** Siddharth Mehrotra, Chadha Degachi, Oleksandra Vereschak, Catholijn M. Jonker, Myrthe L. Tielman (2024). *A Systematic Review on Fostering Appropriate Trust in Human-AI Interaction*. ACM Journal on Responsible Computing. https://dl.acm.org/doi/10.1145/3696449
- **[miller2006robust]** Mark S. Miller (2006). *Robust Composition: Towards a Unified Approach to Access Control and Concurrency Control*. Ph.D. dissertation, Johns Hopkins University. http://erights.org/talks/thesis/markm-thesis.pdf
- **[mitraise2021dayofai]** MIT RAISE (Cynthia Breazeal's initiative) (2021). *Day of AI: Free K-12 AI Literacy Curriculum*. MIT RAISE / MIT Open Learning (ongoing to 2026). https://raise.mit.edu/engage-with-us/k-12/day-of-ai-pilot/
- **[naik2025earlyadopters]** Suchismita Naik, Austin L. Toombs, Amanda Snellinger, Scott Saponas, Amanda K. Hall (2025). *Exploring Human-AI Collaboration Using Mental Models of Early Adopters of Multi-Agent Generative AI Tools*. arXiv:2510.06224. https://arxiv.org/abs/2510.06224
- **[ng2024treasureisland]** Davy Tsz Kit Ng et al. (2024). *Fostering students' AI literacy development through educational games: AI knowledge, affective and cognitive engagement*. Journal of Computer Assisted Learning, 40(5), 2049-2064. https://onlinelibrary.wiley.com/doi/10.1111/jcal.13009
- **[norman1983mentalmodels]** Donald A. Norman (1983). *Some Observations on Mental Models*. In Gentner & Stevens (Eds.), Mental Models, Lawrence Erlbaum, pp. 7-14. https://www.routledge.com/Mental-Models/Gentner-Stevens/p/book/9780898592429
- **[oecd_ec_ailit2026]** OECD and European Commission (with CodeAI) (2026). *Empowering Learners for the Age of AI: AI Literacy Framework for Primary and Secondary Education (AILit)*. OECD / European Commission joint framework, published 17 June 2026. https://ailiteracyframework.org/
- **[orseau2016_interruptible]** Laurent Orseau, Stuart Armstrong (2016). *Safely Interruptible Agents*. UAI 2016 (Conference on Uncertainty in Artificial Intelligence). https://www.auai.org/uai2016/proceedings/papers/68.pdf
- **[overman2025_oversight_game]** William Overman, Mohsen Bayati (2025). *The Oversight Game: Learning to Cooperatively Balance an AI Agent's Safety and Autonomy*. arXiv:2510.26752 (Stanford GSB working paper; rev. Feb 2026). https://arxiv.org/abs/2510.26752
- **[papert1980mindstorms]** Seymour Papert (1980). *Mindstorms: Children, Computers, and Powerful Ideas*. Basic Books. https://dl.acm.org/doi/10.5555/1095592
- **[parasuraman2000automation]** Raja Parasuraman, Thomas B. Sheridan, Christopher D. Wickens (2000). *A Model for Types and Levels of Human Interaction with Automation*. IEEE Transactions on Systems, Man, and Cybernetics — Part A, 30(3), 286-297. https://dl.acm.org/doi/10.1109/3468.844354
- **[park2023generative]** Joon Sung Park, Joseph C. O'Brien, Carrie J. Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein (2023). *Generative Agents: Interactive Simulacra of Human Behavior*. UIST '23 (ACM Symposium on User Interface Software and Technology). https://dl.acm.org/doi/10.1145/3586183.3606763
- **[peng2026codifiedfsm]** Letian Peng, Yupeng Hou, Kun Zhou, Jingbo Shang (2026). *Codified Finite-state Machines for Role-playing*. arXiv:2602.05905 (UC San Diego). https://arxiv.org/abs/2602.05905
- **[qian2024chatdev]** Chen Qian, Wei Liu, Hongzhang Liu, Nuo Chen, Yufan Dang, et al. (2024). *ChatDev: Communicative Agents for Software Development*. ACL 2024 (Long Papers, pp. 15174-15186). https://aclanthology.org/2024.acl-long.810/
- **[reddig2026aiunplugged]** Reddig et al. (Georgia Tech TAIL lab) (2026). *AI Unplugged: Embodied Interactions for AI Literacy in Higher Education*. EAAI-26 (AAAI Symposium on Educational Advances in Artificial Intelligence); arXiv:2602.13242. https://tail.cc.gatech.edu/files/reddig-eaai-2026.pdf
- **[reeves1996media]** Byron Reeves, Clifford Nass (1996). *The Media Equation: How People Treat Computers, Television, and New Media Like Real People and Places*. Cambridge University Press / CSLI Publications. https://press.uchicago.edu/ucp/books/book/distributed/M/bo3618528.html
- **[rowe2021zoombinis]** Elizabeth Rowe, Jodi Asbell-Clarke, et al. (TERC EdGE) (2021). *Assessing Implicit Computational Thinking in Zoombinis Puzzle Gameplay*. Computers in Human Behavior. https://www.sciencedirect.com/science/article/abs/pii/S0747563221000297
- **[ruan2024toolemu]** Yangjun Ruan, Honghua Dong, Andrew Wang, Silviu Pitis, Yongchao Zhou, Jimmy Ba, Yann Dubois, Chris J. Maddison, Tatsunori Hashimoto (2024). *Identifying the Risks of LM Agents with an LM-Emulated Sandbox (ToolEmu)*. ICLR 2024 (Spotlight). https://arxiv.org/abs/2309.15817
- **[ruangtanusak2025talkless]** Saksorn Ruangtanusak, Pittawat Taveekitworachai, Kunat Pipatanakul (2025). *Talk Less, Call Right: Enhancing Role-Play LLM Agents with Automatic Prompt Optimization and Role Prompting*. arXiv:2509.00482. https://arxiv.org/abs/2509.00482
- **[sala2018videogame]** Giovanni Sala, K. Semir Tatlidil, Fernand Gobet (2018). *Video Game Training Does Not Enhance Cognitive Ability: A Comprehensive Meta-Analytic Investigation*. Psychological Bulletin, 144(2). https://pubmed.ncbi.nlm.nih.gov/29239631/
- **[saltzer1975protection]** Jerome H. Saltzer, Michael D. Schroeder (1975). *The Protection of Information in Computer Systems*. Proceedings of the IEEE, 63(9). https://www.cs.virginia.edu/~evans/cs551/saltzer/
- **[segal2011gestural]** Ayelet Segal (advised by John B. Black) (2011). *Do Gestural Interfaces Promote Thinking? Embodied Interaction: Congruent Gestures and Direct Touch Promote Performance in Math*. Doctoral dissertation, Columbia University (ERIC ED528929). https://eric.ed.gov/?id=ED528929
- **[skjuve2021chatbot]** Marita Skjuve, Asbjørn Følstad, Knut Inge Fostervold, Petter Bae Brandtzaeg (2021). *My Chatbot Companion - a Study of Human-Chatbot Relationships*. International Journal of Human-Computer Studies, 149. https://www.sciencedirect.com/science/article/pii/S1071581921000197
- **[sun2023nights]** Yuqian Sun, Zhouyi Li, Ke Fang, Chang Hee Lee, Ali Asadipour (2023). *Language as Reality: A Co-Creative Storytelling Game Experience in 1001 Nights using Generative AI*. AIIDE-23, arXiv:2308.12915. https://arxiv.org/abs/2308.12915
- **[turkle2011alone]** Sherry Turkle (2011). *Alone Together: Why We Expect More from Technology and Less from Each Other*. Basic Books. https://books.google.com/books/about/Alone_Together.html?id=hc7SYAPVlXwC
- **[wada2007paro]** Kazuyoshi Wada, Takanori Shibata (2007). *Living With Seal Robots — Its Sociopsychological and Physiological Influences on the Elderly at a Care House*. IEEE Transactions on Robotics, 23(5), 972-980. https://www.semanticscholar.org/paper/f029ba4c9628622aecfd99accf88e233145703b7
- **[wang2024nemobot]** Yuchen Wang, Shangxin Guo, Lin Ling, Chee Wei Tan (2024). *Nemobot: Crafting Strategic Gaming LLM Agents for K-12 AI Education*. ACM Learning @ Scale (L@S '24). https://dl.acm.org/doi/10.1145/3657604.3664671
- **[willison2023dualllm]** Simon Willison (2023). *The Dual LLM pattern for building AI assistants that can resist prompt injection*. simonwillison.net (widely cited practitioner essay). https://simonwillison.net/2023/Apr/25/dual-llm-pattern/
- **[wood1976scaffolding]** David Wood, Jerome S. Bruner, Gail Ross (1976). *The Role of Tutoring in Problem Solving*. Journal of Child Psychology and Psychiatry, 17, 89-100. https://acamh.onlinelibrary.wiley.com/doi/10.1111/j.1469-7610.1976.tb00381.x
- **[wouters2013meta]** Pieter Wouters, Christof van Nimwegen, Herre van Oostendorp, Erik D. van der Spek (2013). *A Meta-Analysis of the Cognitive and Motivational Effects of Serious Games*. Journal of Educational Psychology, 105(2), 249-265. https://eric.ed.gov/?id=EJ1008015
- **[wu2023autogen]** Qingyun Wu, Gagan Bansal, Jieyu Zhang, Yiran Wu, Beibin Li, Erkang Zhu, Li Jiang, et al. (2023). *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation*. Microsoft Research / arXiv:2308.08155 (COLM 2024). https://arxiv.org/abs/2308.08155
- **[yang2024embodiedai]** Weipeng Yang, Xinyun Hu, Ibrahim H. Yeter, Jiahong Su, Yuqin Yang, John Chi-Kin Lee (2024). *Artificial Intelligence Education for Young Children: A Case Study of Technology-Enhanced Embodied Learning*. Journal of Computer Assisted Learning 40(2), 465-477. https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12892
## Appendix A — Formal Definitions

Collected from §5; working notes with per-definition receipt tags are in
`research/FORMAL_MODEL_DRAFT.md`.

- **A1 (state):** X_t = (W_t, G_t, P_t, Q_t, R_t) — world, goblin,
  player, quest/quiz, resource-ledger.
- **A2 (mutation):** X_{t+1} = δ(X_t, a_t), a_t ∈ 𝒜; 𝒜 closed and
  enumerated (nine constructors in the slice); δ = `applyEvent`, the only
  mutation path; determinism via state-seeded FNV hash.
- **A3 (companion policy):** a_t^g = π_g(o_t, I_g, M_g, C_t, K_t) with
  o_t ≠ truth; hint accuracy 8/10 by construction, confidence independent
  of correctness.
- **A4 (expression channel):** E : X → {speech, emotion, provenance};
  separation as absent rules: range(E) ∩ dom(δ) = ∅. AgentProposal ⇏
  WorldMutation · Dialogue ⇏ Fact · Reflection ⇏ CanonicalMemory.
- **A5 (governed progression):** PLAYING → CANDIDATE → QUIZ →
  {ADMITTED | CANDIDATE}; P1: any admitted-set growth contains a passed
  quiz (sole call site of `admitLevel`).
- **A6 (epistemic ladder):** appearance/hint (signal) · VERIFY (proof) ·
  CANDIDATE (permission pending) · admitLevel (authority) — four distinct
  game objects.
- **A7 (regulation):** ω_t = |θ_t − θ_{t−1}|/Δt; blend accrues iff
  ω ∈ [2.0, 5.0]; rest entailed by 8 s × 0.8 heat/s > 5 heat cap.
- **A8 (governance seam):** π_g ≠ Eval ≠ Γ ≠ SEAL; Eval : ℛ → ℰ;
  Γ : ℰ × 𝒦 → 2^ℱ; SEAL : 𝒟 × 2^ℱ → ℋ; only SEAL touches ℋ; P2:
  staleness disarms (digest mismatch refused). Superteam-scale authority
  matrix: proposer/verifier/director seats each hold capability;
  admission is reserved to the operator seat; a verifier that patches
  what it verifies loses witness standing.
- **A9 (the loop that wrote this paper):** Z_i = (C_i, E_i, S_i, D_i,
  B_i); E_i(c) ∈ {UNKNOWN, SUPPORTED, REFUTED, CONFLICTED}; narrowing
  C_{i+1} ⊆ C_i; gate PublishableCandidate(D_i) ⟺ ∧_k ρ_{i,k} ≥ τ_k, with
  ρ = (claim-support coverage, citation completeness, novelty statement,
  falsifiability, reproducibility, logical validity, editorial
  completeness) and τ = (0.95, 1.00, present, present, present, valid,
  complete) — a conjunction, so no strength averages away a weakness. The
  instantiated audit trail for this paper is research/EPOCH_LOG.md and its
  gate receipt.

## Appendix B — Test Matrix

Full receipt rows with dates and digests: `research/BUILD_RECEIPT_MAP.md`.

| Invariant (paper section) | Suite / instrument | Result |
|---|---|---|
| Closed action surface; forged free-text action throws pre-mutation (§5, §7) | slice suite, boundary ×3 | 30/30 PASS |
| Candidate-not-admission; failed quiz refuses; sole admission call site (§5 P1, §6) | slice suite, gate ×4 + static scan | PASS |
| Hint fallibility incl. confidently-wrong; VERIFY ground truth; False-Jewel lesson; reset (§6 L1) | slice suite ×6 | PASS |
| Drop overlap by construction (§8) | slice suite | PASS |
| Rest entailed by constants; overheat lock; cooling; splash (§6 L2) | slice suite ×5 | PASS |
| Determinism: replay byte-identity; no random/Date/DOM/storage (§5, §8) | slice suite ×3 | PASS |
| Ledger cap and kinds (§6) | slice suite | PASS |
| V0 canon invariants: sole admission path, council recommends-only (§5) | root suite | 29/29 PASS |
| NPC gateway schema + existence-gated memory promotion (§7) | npc suite | 15/15 PASS |
| Typed-relation no-repair; status floors (§5) | epoch3 suite | 16/16 PASS |
| ACP operator disposition PENDING; REPORTED-only claims (§5) | pytest | 51/51 PASS |
| Policy kernel seal, five-digest binding, E_STALE (§5 P2) | loom suite | 55/55 incl. KILL-01..12 PASS |
| Browser end-to-end to DONE; zero console errors; zero direct state writes (§9) | headless Chromium, scripted drive + grep | PASS (2026-07-17) |
| Independent seam confirmation + suite re-execution (§9) | adversarial review pass | CONFIRMED ×5 |

## Appendix C — Claim–Evidence Map

Full matrix with allowed/forbidden wording per claim:
`research/CLAIM_MATRIX.md`.

| Claim | Type | Evidence state |
|---|---|---|
| C1 three-scale progression | ARCHITECTURE | SUPPORTED as design; Pet scale implemented; Village prototyped in V0 council; Superteam specified only |
| C2 expression/mutation separation | ARCHITECTURE + IMPLEMENTATION | SUPPORTED (receipts R1, R2, R5, R11 + review pass); positioned as pedagogical inversion of known primitives |
| C3 gesture→concept transfer | DESIGN_HYPOTHESIS | UNKNOWN — mechanics receipt-backed (R6-R8); transfer untested (H1-H3) |
| C4 playable epistemic ladder | ARCHITECTURE + IMPLEMENTATION | SUPPORTED as implemented mechanics; narrowed vs. governance role-play games; experiential, not formal |
| Ordering thesis (attachment first) | ARCHITECTURE (argued) | UNKNOWN — design commitment; H0 states the test |
| Completability | OBSERVATION | SUPPORTED under scripted play (core + browser); no human data |
| Any learning outcome | EMPIRICAL | FORBIDDEN this paper — hypotheses only |
