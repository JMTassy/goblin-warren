# AI_LEARNING_SPINE.md — the adoption-and-AI curriculum (Levels 0→12)

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign design doc. -->

## Core product promise

**The player adopts a Goblin companion and gradually learns how to work
with increasingly capable artificial agents through play.**

The Warren is not primarily about keeping fires alive, solving
environmental puzzles, collecting Goblins, or tapping abstract verbs.
Those are **experiential vehicles**. The underlying curriculum is:

```
observe → communicate → delegate → verify → correct → coordinate → govern
```

The player develops these intuitions through a relationship with **one**
Goblin (Bram) before any formal AI vocabulary appears. This document is the
canonical reference for that curriculum; a mechanic that doesn't advance
both the relationship and a specific AI-literacy concept doesn't belong in
the opening loop, however fun it is on its own.

## Design lock — the rule every level answers to

Never evaluate an early mechanic only by asking *"Is this fun?"* Also ask:
*"What AI relationship is this mechanic preparing the player to
understand?"*

Every level requires three layers:

1. **Player fantasy** — what does the player emotionally experience?
2. **Game mechanic** — what action and state transition occur?
3. **AI learning objective** — what durable intuition about working with
   artificial agents is being formed?

Example: player fantasy *"My Goblin noticed my signal and helped me"* ·
mechanic *MARK strengthens a visible trace; Bram follows his local rule* ·
AI objective *indirect influence and delegation differ from direct
control.*

## The adoption contract — language and honesty

Preferred language: **companion, partner, Warren Goblin, your Goblin team,
adopt and care for.**

Avoid: slave, servant, property, perfectly obedient, knows everything,
learns everything automatically.

Bram (and every Goblin) is a **fictional interface** for exploring
collaboration with bounded artificial agents. The game must not falsely
claim that current AI systems possess feelings, understand like humans,
autonomously develop loyalty, or become conscious through interaction. The
emotional relationship supports learning; it does not establish factual
claims about AI sentience.

## Opening — adopt a Goblin

The first meaningful decision is **adoption**, not a fire. The player
enters the Warren and meets a small number of Goblins with visibly
different dispositions. For the first prototype this may still be
restricted to Bram, but the framing must stay: *"This is the Goblin who
will learn and work beside me."*

Adoption establishes: Goblin identity, visible strengths, visible
limitations, emotional bond, responsibility, continuity across levels.
**Bram is not a disposable level mechanic** — the same companion persists
through the learning journey so the player can observe what he notices,
what he ignores, what he can and cannot do, how instructions affect him,
when he needs correction, and how past interactions shape future work.

## The fire's correct role

The fire is the **first bonding exercise after adoption**, not the
premise. Correct sequence: (1) the player encounters/adopts Bram; (2) Bram
is cold, tired, or unable to complete the task alone; (3) the player uses
embodied action to revive the fire; (4) Bram visibly responds; (5) player
and Bram complete a small task together; (6) the lantern lights the path
into the Warren. The emotional statement: *"I chose this Goblin. I helped
him. He noticed what I did. We completed something together."* The
lantern is the beginning of the relationship, not merely a level reward.

## Level 1 — corrected emotional arc (the fire, done right)

```
Adoption        "I chose Bram."
Need            "He is cold, and the Warren is dark."
Embodied action "My breath changed the ember."
Direct care     "I placed the twig."
Limitation      "I could not carry the heavy log."
Communication   "I made the right wood noticeable."
Delegation      "Bram understood the signal and carried it."
Verification    "I saw the log reach the fire."
Shared success  "We lit the lantern."
Forward promise "Now we can enter the Warren together."
```

## The spine, Level 0 → 12

| Lvl | Experience | AI concept | Child-facing understanding | Later terminology |
|---|---|---|---|---|
| 0 | Adoption — meet Bram, inspect traits, choose to bring him in, learn one thing he's good at and one he can't do alone | Different agents have different capabilities and limits | "Bram is good at carrying and repairing." "He does not always know what I want." | *(none yet — no models, prompts, context windows, orchestration, training)* |
| 1 | The Dying Fire — player drags kindling, blows the ember, cares for the fire directly; Bram observes warmth, later carries the heavy log | Human and agent contribute different capabilities | "I could make the flame grow." "Bram could carry what I could not." | complementary action |
| 2 | Clear Request — several objects visible (wet wood, dry wood, a decorative branch); player must show Bram which matters; a vague signal produces hesitation or safe non-action | An agent needs a clear target | "Bram needs to know which one I mean." | instruction, prompt, target |
| 3 | Observation & Delegation — the first true MARK sequence: player marks dry wood → signal visible → Bram notices → evaluates by his local rule → acts | The player modifies what an agent notices rather than controlling every movement | "I did not move Bram. I helped him notice the right thing." | attention, context, agentic action |
| 4 | Verify the Result — Bram repairs a shelter but one support is still loose; player inspects, tests, decides | Agent output must be checked; completion animation ≠ correctness | "Bram finished, but I still need to check." | verification, evaluation, test, receipt |
| 5 | Correction Loop — player identifies what's wrong, gives a more precise correction; result → inspection → feedback → revised action → reinspection | Feedback improves the next attempt | "I showed Bram what needed changing. He tried again differently." | feedback loop, iteration, refinement |
| 6 | Memory Boundary — Bram remembers some shared facts but not everything; player distinguishes what he currently sees / was explicitly told / was stored / was forgotten | Memory is bounded, selective, and should not be assumed | "Bram cannot remember something unless it was kept." | working context, memory, persistence |
| 7 | Multiple Goblins — **Lulu** is introduced; Bram repairs and warns of materials, Lulu discovers novelty and patterns | Different agents should receive tasks suited to their capabilities | "Bram fixes. Lulu discovers. I should ask the right Goblin." | specialization, routing, multi-agent coordination |
| 8 | Conflicting Signals — several traces compete for attention; player must make priorities explicit | Agents prioritize by rules, not unstated human wishes | "Bram followed the strongest signal. If I want something else first, I must change the signal." | priority, objective, policy |
| 9 | Governance — a Goblin is capable of an action but not permitted without consent | Capability is different from authority | "Bram could open the gate, but he needed permission." | authorization, permission, governance |
| 10 | Evidence — the Goblin says a task is complete; the world must show visible evidence | Claims require receipts | "Bram said it was repaired. The test showed whether it really was." | evidence, receipt, audit |
| 11 | Coordination — several Goblins collaborate across tasks | Multi-agent systems need explicit roles, handoffs, shared state | "Each Goblin needs to know its part. They need to pass the right information." | roles, handoffs, shared state |
| 12 | Human Responsibility — the player makes a consequential decision with recommendations from several Goblins | AI may observe, propose, calculate, act within bounds — it does not replace responsibility | "The Goblins helped me see the choices. I made the final decision." | judgment, final authority |

## Where the existing `npc-preview/` work fits

- **Bram** (`personas.js: BRAM`) is the Level 0-6 companion — present from
  adoption (`rung_available_from: 0`), voiced through the local NPC
  gateway with the model-narrates/engine-decides boundary already built
  and tested.
- **Lulu** (`personas.js: LULU`) is the Level 7 second companion
  (`rung_available_from: 7`) — defined, tested for structural
  distinctness from Bram (test **G3**), not yet wired into a full preview
  scene (that's Level-7 future work).
- **Zaz** predates this spine and is kept as a debug/engineering tool for
  the `assessDivergence()` mechanism (`zaz-lab.html`); he is not part of
  the narrative Level 0-12 roster.
- The **fire** (`first-fire-v2.html`) is Bram's Level-1 bonding exercise —
  the design-token pass fixed its visual coherence, but the mechanic
  itself already matches the corrected emotional arc (embodied action →
  shared success → forward promise) reasonably well; a future pass should
  make the "carry the heavy log" limitation and "MARK the right wood"
  delegation beat (Levels 2-3) explicit rather than implied.

## What this corrects

Prior work (the design-system pass, the NPC gateway build) treated the
fire as if it were the game and Lulu as the first/only companion. Neither
is true to the product: the fire is level-1 content inside a much larger
adoption-and-AI curriculum, and Lulu belongs at Level 7, introduced only
after Bram is bonded. See `experiments/npc-preview/npc/personas.js` and
`experiments/npc-preview/README.md` for the renamed, spine-correct
implementation.
