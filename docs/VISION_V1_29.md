# VISION v1.29 — "The Warren Giggles" (CEO: Fable · Executor: Sonnet 5)

<!-- authority=false · claim=NO_CLAIM. Rule: surprises are LOUD, truth stays
     quiet. Every effect is garden-only (mood/anim/sap/coins), never ZOL,
     never kernel. All new audio = Luna (fills like v1.28); TTS fallback. -->

## 1. NINE LEVELS (operator: root-hollow stays #1, grow to 9)

L1 THE WARREN stays exactly as-is (bundled root-hollow — the operator's
favorite; do NOT change it). Append a 9th level, keeping all 8 unchanged:

```
{ id: 9, name: "THE OLD VILLAGE", mgs: ["ingredients","toneweave","feed"], bg: null,
  bgRemote: "https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260713_131431_9fe64662-32de-4eee-b4cc-f31102c33bfc.png",
  scene: "linear-gradient(180deg, #12101f 0%, #1c1730 48%, #241d2e 100%)", tint: "saturate(1.05)" }
```

(This is a previously-generated, already-paid cozy-village image, unused since
Recraft replaced L3/L4.) setLevel cycles `% LEVELS.length` so 9 Just Works;
re-confirm `#level-chip` fits "L9".

## 2. SURPRISE PACK (operator: "unexpected ultra funny surprises")

All pure code except the Luna voice lines (URLs in §3, seam like
LULU_VOICE_URLS). Each is RARE and DELIGHTFUL, never punishing. Add a
`LULU_SURPRISE_URLS`/`LULU_SURPRISE_TEXT` pair mirroring the v1.28 voice
seam, and reuse `luluVoiceLine`-style playback (shared Audio, mute-aware,
TTS fallback).

**(a) The Fainting Boop** — in `doBoop`, ~1 in 18 boops (seeded by boop
count, deterministic-ish is fine; Math.random OK in UI zone) → the goblin
"faints from joy": rotate 90°, ❤️‍🩹/💫 float, googly-eyes overlay for 2.5s,
Luna key `faint`, receipt "A goblin fainted from joy". No state change.

**(b) Staring Contest** (funny minigame, add to MINIGAMES as `staring`,
put in L1 + L5 mgs pools) — a big goblin face 😐 fills the arena making
faces every 0.8s; "DON'T look away — don't tap for 5 seconds." A visible
countdown ring. Tapping anything before 5s = lose (goblin gloats, Luna key
`staringLose`, +0). Surviving 5s = win: coin rain (`zolCelebrate(12)`),
Luna key `staringWin`, +12 ZOL. Pure timers.

**(c) It's Raining Matcha** (graphical + micro-game) — trigger: a rare
sparkle-doorway variant OR debug hook. For 4s, 🍵 cups fall from the top of
`#world` at random x (CSS fall animation); tapping one pops it (+bowl sound,
tiny sparkle). Tally at end → `earn(0, popped>=5 ? 3 : 1)` sap, Luna key
`matchaRain`, receipt "Caught N matcha". Cups auto-clear after 4s.

**(d) The Disco Mushroom** (easter egg + graphical effect) — tapping the
Akashic Tree (`zone-tree`) 5× within 2.5s → 3s disco: `#world` gets a
`.disco` class (hue-rotate keyframe cycle + gentle wobble on goblins),
`Sound.shamanicBurst(2)` + `Sound.party()`, all goblins mood "delighted",
Luna key `disco`, receipt "The disco mushroom woke up". Ends clean, no
lingering state.

**(e) The Secret Whisper** — first time the player opens the Help overlay
AND the Temple in one session (or any one-off cheap trigger you pick),
Luna key `secret` fires once. Low-effort flavor.

Instant-gratification budget: coins already rain (`zolCelebrate`); reuse it
for (b) and lean on sparkles/bowls for the rest. Keep it juicy.

## 3. LULU SURPRISE VOICE (Luna — Fable fills URLs after generation)

Keys + fallback text (the recordings say these words):
- faint: "You booped too well... a goblin has fainted... from pure joy... please... send snacks..."
- staringWin: "You blinked last... which means... you win... at doing absolutely nothing... my favorite sport..."
- staringLose: "You looked away... the goblin is victorious... it will not stop bragging..."
- matchaRain: "It is raining matcha... catch it with your fingers... or your soul... fingers are faster..."
- disco: "Oh no... you woke the disco mushroom... now we must all... vibrate... politely..."
- secret: "You found a secret... I will pretend to be surprised... oh... wow... a secret..."

(staringLose has no clip yet → leave URL empty, TTS covers it. Fable may add
it later.)

## 4. GATES

Keep all 33 green. Add: T33 staring-contest (win path: +12 ZOL, receipt;
lose path via debug: +0, receipt), T34 nine-level cycle (count===9, chip
"L9"), T35 surprise-voice seam (LULU_SURPRISE_URLS has all keys, fallback
no-throw), T36 disco easter egg (5 tree taps → `.disco` class appears then
clears; no lingering state, no ZOL). Matcha-rain: a debug hook
`spawnMatchaRain()` + assertion that catching gives sap only (membrane), no
ZOL.

*Make them laugh. Keep the log honest.* — Fable
