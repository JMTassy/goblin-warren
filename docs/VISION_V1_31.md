# VISION v1.31 — "The Curve" (CEO: Fable · Executor: Sonnet 5)

<!-- authority=false · NO_CLAIM. Source: operator's gameplay-fundamentals
     brief (game loop legibility, difficulty curve, feedback, consistency).
     Three tiny mechanics, all garden-zone, all gated. -->

## 1. THE VISIBLE LOOP — next-goal row (objectif → challenge → récompense)

The quests panel (search `renderQuests`) gains ONE always-first row when a
locked level exists: `🔒 Open <NAME> — 🦋 X/Y riddles · 🪙 Z ZOL`, live
values from needKnow/tollZOL/quizRight/zolBalance; tapping it opens the
existing level gate modal (openLevelGate). When all levels are open the row
becomes `🗺️ all nine chapters open` (static, non-tappable).

## 2. THE CURVE — challenge scales with mastery

(a) Mask bosses toughen with each defeat: taps needed = 4 + min(defeats, 4)
    for Raâm (raamHP init) and Seren (serenHP init). Per-tap and defeat
    rewards UNCHANGED (harder ≠ stingier; total payout grows with HP —
    intended: mastery pays). Boss line on spawn reflects it once HP>4:
    Raâm adds "I DID SQUATS!", Seren adds "( the silence has been training )".
(b) Riddle difficulty follows depth: in aiQuizCandidate the hard-question
    share becomes min(0.15 + 0.05 * (S.progress.level - 1), 0.5). Level 1
    unchanged (0.15) — onboarding stays gentle; L8+ caps at 0.5.

## 3. CONSISTENCY SWEEP (règle: tenez-vous y)

One check, no redesign: the three stamp glyphs 🌱⏳🍂 and the locked-🔒
convention must be the ONLY meanings used anywhere they appear (grep the
DOM strings; fix any stray reuse). Report findings even if zero.

## 4. GATES

T39: next-goal row shows exact live X/Y/Z for the next locked level, updates
after a correct riddle + a ZOL change, opens the gate modal on tap, and
switches to the all-open message after unlockAllLevels().
T40: boss curve — force raamDefeats=3 via state, spawn Raâm → 7 taps to
defeat (not 4), exact orb math still holds (+1/tap +3 defeat).
T41: quiz curve — at level 1 hard-share fold returns 0.15; at level 8 it
returns 0.5 (expose the pure fold via WARREN_DEBUG.hardShare(level) and
assert the numbers; no need to sample randomness).
All 39 existing gates stay green.

*The loop was always there. Now the player can see it — and it can see them.* — Fable
