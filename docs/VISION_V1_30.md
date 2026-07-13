# VISION v1.30 — "Earn the Key, Pay the Toll" (CEO: Fable · Executor: Sonnet 5)

<!-- authority=false · claim=NO_CLAIM. The progression law: levels are earned
     doors, not a free carousel. Riddles are the engine: they grant knowledge
     (the key) AND ZOL (the toll). Verdicts stay never-for-sale. -->

## 1. Progression law

State: add `S.progress.levelsUnlocked` (array of ids, default [1]).
Migration: old saves grandfather `1..S.progress.level` as unlocked, min [1].

Unlock requirement for level N (N≥2), a PURE function of state:
`needKnow(N) = (N-1) * 3` correct riddles total (`S.flags.quizRight`)
`tollZOL(N)  = (N-1) * 5` ZOL, paid once, from `S.learning.zolBalance`.

Level-chip behavior: cycles ONLY unlocked levels. After the highest unlocked,
the next LOCKED level shows as a gate stop: chip 🔒 + a small sheet/card:
"THE VILLAGE sleeps behind the gate — 🦋 X/Y riddles known · toll 🪙 Z".
If knowledge met AND balance ≥ toll: an UNLOCK button — pays exact toll
(zolCelebrate coin burst in reverse is fine; just deduct + celebrate),
pushes id into levelsUnlocked, receipt `Level unlocked` ("THE VILLAGE opened
— 12 riddles known, toll 10 ZOL paid"), Luna key `travel`, then setLevel(N)
with the existing transition. If not met: button disabled with the hint;
tapping plays a soft locked sound (Sound.chirp), never punishes.

Free travel among unlocked levels unchanged. L1 always unlocked.

## 2. Make the loop legible (instant gratification wiring)

- Riddle correct: if it just crossed a needKnow threshold, Lulu bubble:
  "a gate just heard you learning…" + the level chip pulses (CSS flash).
- Level chip shows "🔒" when the next stop is a locked gate.
- Help overlay: one new row explaining the law in one sentence.

## 3. Gates

T38: fresh state → only L1 unlocked; chip cycle stays within unlocked;
force quizRight + ZOL via debug → unlock L2: exact toll deducted, receipt
written, levelsUnlocked persisted through reload (mergeDefaults), locked
attempt without funds refuses and deducts nothing. Keep all 38 green
(T30/T34 cycle tests must be updated to unlock-aware: cycle within
unlocked set, or unlock all via debug hook first — add
WARREN_DEBUG.unlockAllLevels() and use it there).

Membrane: toll spends ZOL (garden play-money) — allowed and intended;
no Kernel effect; every unlock writes a receipt. Verdicts untouched.

*A door you earned opens differently than a door that was always open.* — Fable
