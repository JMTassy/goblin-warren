# Dual-Model Governance Loop

## Organ mapping (cost-law V0)

The game's org chart, run by real models. Exploration moves downward,
judgment moves upward; each tier is cheaper and more numerous than the
one above it.

| Organ | Model | Law |
|---|---|---|
| Goblin swarm | Haiku (many, cheap) | lateral thinkers, NO_CLAIM — insight → compost → chiddush |
| HAL | Sonnet | routes and audits; checks admissibility; owns nothing |
| Mayor gate | Fable (wakes once, sees only top-3 + score table, never the raw heap) | compression judge; verdict ⊬ admission |
| Operator | JM | the only hand that admits; receipt only after green tests + reviewed diff |

Cost law: goblins burn cycles · HAL verifies · Fable wakes once ·
one survivor exits · expensive judgment ⊬ admission · ledger sleeps.
Target ratio ≈ 95% goblin/local · 4% deterministic scripts · 1% Fable/Sonnet.

The working protocol for evolving HELEN-lineage code (index.html V0 canon,
v2.html AI-Council edition). Separates *proposing truth* from *proving
behavior*, with a human admission gate. Mirrors the game's own constitution:
cognition ≠ authority; proposals ≠ admission; neither model admits.

## Roles

**Opus — Architect / Red Team.** Finds invariant compression, category errors,
unsafe promotions, replay lies. Reads state; proposes the smallest invariant
that kills a bug without expanding sovereignty. Reviews diffs for drift.
Does not implement.

**Sonnet — Implementer / Verifier.** Makes the smallest patch, adds
failing-then-passing tests, runs the selftests, reports the diff. Only local
reducer / UI stale-guard changes. No refactor. Does not architect.

## Loop

1. **Opus reads state** → outputs: one invariant · one target · two tests ·
   forbidden edits.
2. **Sonnet patches Tier 1** → only local reducer / UI stale-guard changes.
3. **Sonnet runs tests** → `node selftest.js index.html` + `node v2-selftest.js v2.html`.
4. **Opus reviews diff** → checks: no kernel drift · no replay claim ·
   no cached-verdict authority.
5. **Sonnet fixes only review blockers** → no refactor.
6. **Human admits or rejects** → receipt only after green tests AND reviewed diff.

## Prompt split

- **Opus:** "Find the smallest invariant that kills the bug without expanding sovereignty."
- **Sonnet:** "Implement exactly that invariant, with two failing-then-passing assertions."

## Rule

Opus proposes truth. Sonnet proves behavior. **Neither admits.**

The receipt is the human's. Tests-green + diff-reviewed is a *precondition* for
admission, not admission itself. No receipt → no ship.

## Standing boundaries

- `index.html` / `selftest.js` are byte-identical V0 canon — do not touch
  without an explicit constitution-level instruction.
- Do not claim replayability until Tier 2 (event-sourced fold) lands. Until
  then V0/v2 are governed *projections*, not sovereign replay.
- Cached verdict is display-only: `p.verdict ⊬ admission`; `verdict(S,move) ⊢ admission`.

## Receipt log (append-only)

**Protocol frozen: OPUS + SONNET AUTORESEARCH LOOP V0.**
- Opus proposes truth — invariant compression, risks, category errors, forbidden morphisms.
- Sonnet proves behavior — smallest patch, assertions, run tests, report diff.
- Neither admits — human gate + receipt decide admission.
- Cached verdicts are projections — admit-time predicate is sole authority.
- Replay claims require replay receipts — until Tier 2: governed projection, not sovereign replay.

**Receipts:**
- `d5d06d3` — Tier 1 (verdict-as-function, v2). Tests green (selftest 29, v2-selftest 46). Diff reviewed by Opus: no kernel drift, no replay claim, no cached-verdict authority. Human admission: _pending_. Split applies from next turn.
- `efbb659` — Debug-sweep cycle, first full run of the split (Fable architect seat). Two Sonnet verifiers swept reducer+harness and UI zones (9 findings); Fable triaged; one Sonnet implementer applied 8 patches; failing-then-passing proven for the 4 new assertions (46+4 FAIL → 50 pass). Fable diff review: no kernel drift, no replay claim, no cached-verdict authority. Deferred: id-collision latency, stale council stances after reroll, quote hygiene. Human admission: _pending_.
- `26ed45f` — Warren UI patch set V0 (operator packet), first cost-law cycle: Sonnet/HAL implemented the epoch delta (gameEpoch + territoryKey + use-time revalidation in checkProposalWithHAL, GAME_WON DENY) and the new UI harness v2-ui-selftest.js (scenarios A/B/C/E, 24 assertions); items 3–8 verified already-present. Fable Mayor pass: SELECT_ONE (~600 output tokens, one wake). Tests: canon 29, reducer 56, UI 24 — all green. Commit is a PRESERVATION SNAPSHOT under the stop-hook, explicitly marked NOT ADMITTED; commit ≠ admission. Human admission: _pending_ — revert `26ed45f` to reject.
