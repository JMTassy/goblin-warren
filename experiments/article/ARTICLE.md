# From Attachment to Orchestration: A Three-Scale Playable Architecture for Human–AI Agent Literacy

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->
<!-- STATUS: DRAFT E9 — sections 8, 9, and appendices land after receipt R12; gate not yet run -->

*Working product variant: Goblin Warren: A Playable Epistemic Interface for Learning Human-Agent Coordination.*

## Abstract

People increasingly meet artificial agents the way they meet pets and
strangers — through attachment and conversation — while the systems those
agents inhabit are governed by architectures the users never see: proposal
gates, permission boundaries, orchestration layers. We present Goblin Warren,
a village-builder game whose playable content *is* that architecture. The
design stages three successive mental models — a single interpretive
companion (AI Pet), an emergent multi-agent society (AI Village), and an
explicitly orchestrated team (Superteam) — and commits to an ordering in
which attachment precedes interpretation, interpretation precedes
coordination, and coordination precedes governance. Two properties are
implemented and receipt-verified in a vertical slice of the first scale:
(i) generative expression is structurally severed from world mutation — no
action in the game's closed action surface carries free text, so an agent's
speech, hint, or proposal cannot reach the state-transition function; and
(ii) progression itself is governed — completing a level's gameplay yields
only a *candidate*, and a verification quiz is the sole admission path, a
fact asserted by the test suite down to the single call site. A third
contribution is deliberately hypothetical: each level introduces exactly one
gesture family (assemble/hold; catch/avoid/discriminate; turn/regulate/
temporize), and we state as falsifiable hypotheses — not findings — that
these gestures can install governance discriminations such as *signal ≠
proof ≠ permission ≠ authority*. We formalize the architecture, map every
implementation claim to an executed test receipt (30/30 for the slice core;
29/29 for the surrounding game's invariants), position the design against
security, generative-agent, and AI-literacy literatures that each hold one
piece of this territory, and specify the player studies that would confirm
or refute the pedagogy. (238 words)

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
into an orchestrated team, so that the player inhabits each mental model
before being asked to name it. Beneath the fiction sits a strict engine
discipline inherited from the HELEN OS governance lineage the game
operationalizes: agents express; only admitted proposals mutate; every
mutation is a ledgered, replayable event.

This paper makes four contributions:

- **C1 (architecture):** a three-scale progression 𝒫 → 𝒱 → 𝒯 (AI Pet → AI
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
architecture of agentic AI itself the playable content of a game — a
designed progression of mental models in which expression is structurally
severed from mutation, every state change is a ledgered replayable event,
and the player's own admission act is the only path from agent proposal to
world change — offered as a scaffolded literacy curriculum for lay users.
That composition, and the receipts behind it, are what this paper defends.

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
   than fight it. A single companion the player cares about makes agent
   fallibility (the companion is sometimes confidently wrong)
   *emotionally* legible before it is technically legible. This is the
   Turkle risk deliberately inverted [turkle2011alone]: instead of
   attachment concealing the machinery, attachment supplies the motive to
   examine it.
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
  reports fallibly. The player learns to read expression as expression:
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
The load-bearing property is **o_t ≠ truth**: the policy guarantees its
action follows from an admissible internal state, not that its observation
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

with Eval : ℛ → ℰ (receipts to proof state), Γ : ℰ × 𝒫 → 2^ℱ (proof state
and policy context to authorizable effects), and SEAL : 𝒟 × 2^ℱ → ℋ
(operator disposition and effects to authority history). Only SEAL touches
ℋ. The lineage's other artifacts implement the same seam at increasing
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
*didactic identity*: the inequations the player learns as game verbs are
the same inequations the engine passes tests on. The curriculum is the
architecture, receipt-checked.

## 6. The Playable Vertical Slice

The slice implements the Pet scale as three levels plus integrated
verification quizzes, over a deterministic core of 420 lines with a
30-assertion suite (§9). Each level introduces one gesture family; each
gesture's consequence structure *is* the target concept.

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
recovery windows — as the felt model of an agent's workload limits.

**The quiz gate.** Finishing a level's gameplay produces CANDIDATE, never
progression. Bram asks the player to "tell me what you saw — not what you
hoped": three four-choice questions per level (categories: observation,
signal-vs-proof, permission-vs-authority, regulation), pass threshold 2 of
3, retakes allowed, admission logged. The gate is doing double duty: it
names the concept the gestures carried (C3's hypothesis), and it *is* the
governance structure (C4) — the player experiences that doing is not
admission, verification is.

**The ledger.** Every state change appends a typed event
(STONE_PLACED, DROP_SPAWNED, FAUX_CAUGHT{lesson}, OVERHEAT, QUIZ_PASSED,
LEVEL_ADMITTED, …) to a capped in-session ledger, rendered in-game as a
readable trace. Nothing persists across sessions by law of the lineage
(no storage surfaces; receipt R10) — the session's history is inspectable
precisely because it is the only history there is.

## 7. The Deterministic/Generative Boundary

The slice ships with a curated expression pool, but the boundary is
designed for a generative layer and inherits from the lineage's NPC
gateway (R2), so we state it in those terms.

**What a model may do:** produce candidates on the expression channel —
dialogue, emotional coloring, candidate reflections ("memory candidates"),
social expression — all tagged with provenance (model / curated_fallback /
memory_derived) at render time.

**What only the deterministic layer does:** movement, collisions,
inventory, rewards, quest and quiz state, progression, permissions,
verification outcomes, and every world mutation — the entirety of dom(δ).

**The seam, mechanically.** Three independent facts compose:

1. *Schema at the mouth:* model output is validated against a strict
   response schema ({speech, emotion, gesture, memory_candidate,
   curiosity}); malformed output falls back to curated lines with
   fallback provenance (R2).
2. *No door in δ:* the action surface is closed and carries no free text
   (R11) — a validated utterance still has nowhere to go.
3. *Existence-gated memory:* the one thing expression may eventually
   touch — companion memory — passes through a single promotion function
   that verifies the referenced events exist in the ledger before
   admitting a memory candidate (R2). Reflection ⇏ CanonicalMemory unless
   the ledger witnesses it.

Following the adversarial review, we state the guarantee's class honestly:
these are same-realm structural conventions verified by tests, not
sandboxes or proofs; a compromised loader or an edit to the module itself
is out of scope. What the player is taught matches what the code does at
exactly that fidelity — which is itself part of the lesson the Superteam
scale will make explicit: guarantees have classes, and knowing the class
is the literacy.

<!-- §8 IMPLEMENTATION, §9 EVALUATION — pending receipt R12 (headless browser E2E) -->

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
study cannot quietly become confirmatory.

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
socially is the energy source for caring whether Bram is *right*. The
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

<!-- REFERENCES — final list assembled at citation-audit epoch from SOURCE_LEDGER.ndjson (+ gap sweep) -->
<!-- APPENDIX A — formal definitions (from FORMAL_MODEL_DRAFT.md D1-D9, P1-P2) -->
<!-- APPENDIX B — test matrix (from BUILD_RECEIPT_MAP.md R1-R13 × suite assertions) -->
<!-- APPENDIX C — claim-evidence map (from CLAIM_MATRIX.md CM-01..CM-10) -->
