---
authority: false
admission: NOT_ADMITTED
status: SURVIVOR_MILESTONE
expansion: HOLD_FOR_OPERATOR
---

# QUIZ_TO_ZOL_V1 — Survivor Loop Receipt

## What was built

A single hallucination-correction quiz loop wired into the Goblin Warren's existing quiz
machinery. One question. Lulu presents a confidently wrong historical claim about AI.
The player must identify the hallucination and select the correct rebuttal.

All six beats are live:

1. **Encounter** — `openHallucinationQuiz()` opens the quiz sheet (reuses `#sheet-quiz` DOM)
   with Lulu's hallucinated claim and four multiple-choice answers.
2. **+10 ZOL** — first correct answer credits exactly 10 ZOL to `S.learning.zolBalance`.
3. **Lulu reaction** — `showBubble("lulu", luluReaction, 4800)` fires after 350ms delay,
   ellipsis-heavy style matching the Warren's voice.
4. **Lantern** — `lightKnowledgeLantern()` adds a `🪔 Knowledge Lantern` object to the
   gate zone and records `"knowledge-lantern"` in `S.villageState.unlockedEffects`.
5. **Persistence** — `saveState()` writes the wallet credit, `quizState.rewardPaid`, and
   `villageState` to localStorage. On `boot()`, `restoreKnowledgeLantern()` re-adds the
   object if the effect is already in `villageState`.
6. **Idempotency** — second correct answer: `quizZolRewarded()` returns true, reward = 0,
   feedback shown, no wallet mutation.

## The question

> **Lulu announces:** "Fun fact! The first AI program was written in 1823 by Ada Lovelace
> on her mechanical loom, and it successfully taught the machine to compose symphonies."
> **What is wrong with this claim?**

**Correct answer (index 0):**
"Ada Lovelace wrote notes for Babbage's Analytical Engine in the 1840s — no working program
ran, no loom was used, and no symphony was composed by machine."

**Explanation:**
Ada Lovelace's 1843 notes on Babbage's Analytical Engine are the earliest algorithm on record,
but no machine ran it, no loom was involved, and no music was produced. The claim confidently
combines three wrong details into one plausible-sounding hallucination — the canonical failure
mode this loop trains players to spot.

**Lulu reaction line:**
"Oh… I may have… remembered that… incorrectly… the lantern knows the truth now… it will
remember for me…"

## State separation mapping

| Concern | Lives in | Notes |
|---|---|---|
| ZOL wallet (player-visible) | `S.learning.zolBalance` | Existing field, unchanged |
| Paid/unpaid bookkeeping | `S.quizState.rewardPaid` | reward_key → true |
| Streak tracking | `S.learning.quizStreak` | NOT used by QUIZ_TO_ZOL_V1 (E=0 by design) |
| Village effects | `S.villageState.unlockedEffects` | Array of effect ids |
| Lantern world object | `S.objects` | Added by `addObject("🪔", "Knowledge Lantern", "gate")` |
| HELEN OS kernel | untouched | No writes outside this repo |
| HELEN OS ledger | untouched | No ndjson, no helen_os_v1 path |

## Reward key scheme

```
reward_key = quiz_id + "_v" + completion_version
           = "hallucination_q1" + "_v" + 1
           = "hallucination_q1_v1"
```

Once `S.quizState.rewardPaid["hallucination_q1_v1"] === true`, ΔZOL = 0 forever.
The completion_version suffix allows a future operator to issue a revised question with a
new version number without retroactively voiding the existing reward record.

## Anti-exploit invariant

Reward sequence: validate → calculate → mark paid → persist wallet → emit village effect →
render Lulu reaction. The paid flag is set before `saveState()` so no partial-write path
can produce an un-marked payment. The village animation (`lightKnowledgeLantern`) is
guarded by the `already` check in `villageState.unlockedEffects` — it may re-render
visually on boot from the stored effect, but the object add is not duplicated.

## Gate results

### Pre-existing gates (`node verify.js`)

All 12/12 green after the change:

```
PASS [G1_all_assets_present_nonzero]
PASS [G2_no_cdn_urls_in_code]
PASS [G3_local_paths_wired]
PASS [G4_index_html_splash_local]
PASS [G5_style_css_svg_local]
PASS [G6_lulu_voice_cdn_is_local]
PASS [G7_generateGoblinLine_exists_ui_zone]
PASS [G8_gemma_seam_correct]
PASS [G9_fallback_on_failure]
PASS [G10_no_state_mutation]
PASS [G11_narration_only_callback]
PASS [G12_docs_catalog_intact_and_augmented]
=== verify.js result: 12/12 gates green ===
```

### New acceptance gate (`node quiz-zol-gates.js`)

8 assertions:

- `QZ0` — WARREN_DEBUG exposes all 5 quiz-zol API functions
- `QZ1` — correct first answer credits wallet by exactly +10
- `QZ2` — question marked paid in `quizState.rewardPaid`
- `QZ3` — Knowledge Lantern in `villageState.unlockedEffects` and `S.objects`
- `QZ4a` — wallet value survives page reload
- `QZ4b` — paid flag survives page reload
- `QZ4c` — lantern survives page reload (both villageState and objects)
- `QZ5` — second correct submission pays 0; feedback still shown
- `QZ5b` — feedback text present on repeat attempt
- `QZ6` — no sovereign path (helen_os_v1 / town/ledger / .ndjson) in game.js
- `QZ7` — wrong answer pays 0 and does not light the lantern
- `QZ8` — no page errors

## Files changed

| File | Change |
|---|---|
| `game.js` | Added `quizState`+`villageState` to `makeState()`, `mergeDefaults()`; added `QUIZ_ZOL_V1_*` constants; added `quizZolRewarded()`, `lightKnowledgeLantern()`, `openHallucinationQuiz()`, `renderSheetHallucinationQuiz()`, `answerHallucinationQuiz()`, `restoreKnowledgeLantern()`; wired `restoreKnowledgeLantern()` into `boot()`; exposed all via `WARREN_DEBUG` |
| `quiz-zol-gates.js` | New acceptance gate (8 assertions, Playwright pattern) |
| `docs/QUIZ_TO_ZOL_V1_RECEIPT.md` | This file |

## The law

> **Knowledge earns ZOL. ZOL changes the Warren. The Warren never impersonates authority.**

- The Warren is a garden-layer game. `authority: false`. It earns ZOL, not verdicts.
- `quizState.rewardPaid` is a bookkeeping record, not a receipt in the HELEN OS sense.
- The HELEN OS governed ledger (`town/ledger_v1.ndjson`) is never touched by this code.
- No writes leave the repo. No network calls. No sovereign claims.

## Expansion

`HOLD_FOR_OPERATOR`. The question bank, the scoring formula, and any additional village
effects are blocked until the operator stamps GO. The survivor loop is the gate the bead
must pass through. It passes.
