# CHIDDUSH: HELEN performs artificial *evolution*, not artificial *learning*
<!-- authority=false · claim=NO_CLAIM · a reading, not a ruling -->
<!-- Framing by JM Tassy (sole author), 2026-07-12. Typed per /warren law:
     the mapping is CANDIDATE (interpretation); the pieces it maps ONTO are
     WITNESSED in the build. This document admits nothing. -->

## The missing observation

> A governed self-improving system is structurally much closer to an
> **evolving game world** than to a continuously trained neural network.

That single move reframes the whole project — and explains why *games*
(not dashboards, not training runs) are the natural body for HELEN.

## The two loops

Classical ML:

    θ_{t+1} = θ_t + Δθ        (gradient → backprop → weights)

HELEN:

    P → V → S → R              (Propose → Verify → Select → Retain)

That is the **Darwinian loop**: variation → selection → inheritance.
Mathematically HELEN sits closer to evolution, theorem proving, software
engineering, and immune systems than to SGD. The model stays fixed; the
**world** accumulates.

## The ten chiddushim (each: reading → what it maps onto here)

1. **HELEN is artificial evolution.** Variation/selection/inheritance, not
   gradient/backprop/weights. → the P→V→S→R loop is the Warren's whole
   spine (`resolveProposal` = the Decide gate; the ledger = retention).

2. **Goblins are evolutionary *operators*, not agents.** Each goblin is a
   *pressure*, not an NPC. Scout = mutation, Critic = culling, Receipt =
   recording, Replay = copying survivors, Operator = environmental
   selection. → already the `/warren` law: goblin lanes are pressures that
   *re-rank*, and **no lane gets admission**. (Builder/Jester/Archivist/
   Warden/Artist/Economist/Tester ≈ the operator set above.)

3. **The Warren is the genome.** Memory stores *selected adaptations*, not
   *everything experienced*. DNA keeps what survived selection, not the
   diary. → this is why **unlimited memory is harmful**, and why V0 caps the
   ledger while v2 keeps receipts *that justify surviving effects* sovereign.
   `Memory = Selected Adaptations`, everything else disappears.

4. **Replay is reproduction, not execution.** `G_{t+1} = Replay(G_t, A)` is
   inheritance: it asks *"what survives?"* not *"what happened?"* → the
   Warren's `replayEvents()` / deterministic fold is exactly this door;
   memory = function(event_log), replayable and inspectable.

5. **Receipts are genes.** A receipt is hereditary material, not
   documentation — without it, an adaptation can't propagate.
   Receipt → Replay → Inheritance is the genetic pipeline. → the append-only
   event log is the heredity substrate (see `lulu/LULU_LOCAL_EVENT_SCHEMA`).

6. **Skills are organs, not knowledge.** An organ is reusable computation
   that survives because it keeps solving a problem. Skill admission = organ
   evolution. → `skills/` and the `/warren` slice discipline: admit reusable
   structure, not notes.

7. **HAL is natural selection, not a judge.** HAL sets *fitness*, of which
   truth is one axis. Fitness could become multi-objective: correctness,
   reproducibility, cost, replay value, interpretability, operator
   usefulness. → in the game, the admission gate + selector
   `S(p)=value+falsifiability+reversibility+goal−complexity−authority_risk`
   is already a multi-axis fitness score with **authority_risk weighted ≫**.

8. **Goblin Warren is converging on an artificial scientific community.**
   Researcher→Scout, Reviewer→Critic, Journal→Receipt Ledger,
   Replication Lab→Replay, Editor→HAL, Community→Operator. It simulates
   **knowledge evolution**, not "intelligence" — a more stable paradigm.

9. **Pokémon accidentally found the same scaling law.** It scales because the
   *ecosystem* accumulates (creatures, mechanics, regions, lore) while
   identity holds: `E_{t+1} = U(E_t, Δ)`. Model fixed, world grows — the
   same shape as HELEN's governed environment updates.

10. **The real scaling axis is environmental complexity.**
    `Performance = f(Model, Environment)`. The frontier bet:
    `∂P/∂E > ∂P/∂M` — improving the *governed environment* may beat
    marginally improving the base model. **Stated as a hypothesis to test,
    not an established law.**

## What this changes for the game (the product consequence)

Measure progress by the **evolution of the Warren**, not the level of any
individual goblin. Players should feel that:

- the Warren discovers better rituals,
- better tools become *inherited*,
- failed ideas quietly disappear (compost, not deletion),
- trusted recipes become tradition,
- institutions grow more capable over time.

The fantasy shifts from *raising a powerful character* to *cultivating a
civilization*. Each session leaves behind only adaptations that survived
verification and admission — so the Warren feels older, wiser, more
coherent, **without confusing accumulated history with accumulated truth.**

    the enduring object is not the Goblin, nor the model —
    it is the evolving ecosystem:
        variation + evaluation + selection + retention

## Claim typing (mandatory)

- The evolution/Darwin mapping (all 10): **CANDIDATE** — interpretation.
- The pieces it maps onto (P→V→S→R loop, replay fold, append-only receipts,
  multi-axis selector with authority_risk, goblin-lanes-as-pressures,
  operator-only admission): **WITNESSED** — enforced by the gate board
  (114 assertions green) and the `/warren` constitution.
- `∂P/∂E > ∂P/∂M`, multi-objective HAL, skills-as-organs at kernel scale:
  **NEEDS_ME** — operator decides whether/when to test these.

*No morphism here becomes a receipt. This is a reading. The operator's hand
is still the only admission.* 💜
