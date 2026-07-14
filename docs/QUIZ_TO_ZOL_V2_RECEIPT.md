# QUIZ_TO_ZOL_V2 — "knowledge builds the village" · Receipt

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign.
     2026-07-14. Extends V1; not a rewrite. Not deployed. -->

Answers the bead *"turn quizzes into the Warren's first reliable reward loop."*
**Finding first:** section J's "best first milestone" (find-the-hallucination →
+10 ZOL → lantern → persists) **already existed and passed** (`quiz-zol-gates.js`
12/12). So this slice builds the part that was missing — section **D: "ZOL
earned ⊢ world responds"** with *tiered, variable, visible* effects — extending
V1's exact truth-source, not forking it.

## What shipped (bounded slice)

- **A small bank, 3 topics** (`QUIZ_ZOL_BANK`, 4 questions: prompting,
  hallucinations ×2, agents). q1 shares V1's reward key (`hallucination_q1_v1`)
  so the two entry paths can never double-pay — one truth.
- **ZOL formula B + S** — first-try base `10`, retry `6`, `+5` streak bonus on
  every 3rd first-try-correct. **Never negative**; a wrong answer only breaks
  the streak.
- **Tiered VISIBLE village effects** (the point): a correct answer lights a
  *different* persistent thing — `knowledge-lantern` 🪔 (gate), `learned-mushroom`
  🍄 (garden), `mended-beam` 🪵 (forge, Nib does a repair) — each idempotent in
  `villageState`, re-pulsing so the reward is *seen* in the world, not just a
  number. ≥3 distinct effects (section I).
- **8 Lulu reactions** (correct ×4 / wrong ×2 / streak ×2), varied per answer.
- **Persistence** — `quizState.rewardPaid` (per question, never twice),
  `streak`/`bestStreak`, `villageState.unlockedEffects` re-materialised on boot
  (`restoreQuizVillage`). localStorage only. **No HELEN ledger path.**
- **Entry, graduated-Warren-only** (`quizZolAvailable` requires `prologueSeen`
  and `!prologueActive`): Lulu offers her first fun fact once on tap
  (`quizZolMet`), then the lit lantern is the repeat door. **Never in the crib.**

## Law held

`ZOL = game currency · ZOL ⊬ receipt ⊬ admission ⊬ kernel authority.` It only
lit cosmetics/objects. No reducer/guard/canon touched. Membrane intact: the
quiz cannot appear during Rungs 1–3 (gate + tests).

## Tests — `quiz-zol-v2-gates.js` (10/10, Playwright)

exact first-try ZOL + visible effect · retry pays reduced (6) not base ·
same question can't pay twice · wrong never subtracts + resets streak · mute
doesn't change reward logic · **3 distinct visible effects** · streak bonus at 3
· reload restores wallet+completed+effects · logs to game replay only · no page
errors. Regression: `quiz-zol-gates.js` V1 12/12 · `progression-gates.js` (crib)
10/10 · `verify.js` 13/13 · `lulu-gates.js` 12/12.

Shots: `docs/shots/quiz-question.png`, `quiz-reward.png`, `quiz-village.png`.

## Known limitations (honest, next slices)

- **4 questions, 1 interaction type** (multiple-choice). The bead's fuller
  vision (12 questions, drag-fragment / order-workflow / match-tool formats,
  daily-set / perfect-set bonuses, collections, districts, identity/levels) is
  deliberately deferred — one loop excellent first (section J's own rule).
- **Not folded into the preview yet.** The quiz lives in the graduated Warren;
  witnessing it needs a play-through past the crib. Fold-in is one "deploy" away.
