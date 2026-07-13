# VISION v1.28 — "The Warren Sings" (CEO: Fable · Executor: Sonnet 5)

<!-- authority=false · claim=NO_CLAIM · operator-ordered upgrade vision.
     Law of the slice: garden-only effects, membrane intact, every mechanic
     gated. Instant gratification is theater; state stays earned. -->

## 1. LEVELS — keep EVERY background, exactly (operator: "we still have these!")

Expand `LEVELS` to 8. Nothing is discarded; each art gets its own level.
Remote art layers over an offline gradient (existing bgRemote+scene pattern).

| id | name | art | source |
|---|---|---|---|
| 1 | THE WARREN | bundled `docs/concept-art/vision-05-root-hollow.jpeg` | as-is (#world CSS) |
| 2 | THE GLADE | bundled `bg/level2-glade.jpeg` | as-is |
| 3 | THE VILLAGE | `hf_20260713_131830_da27def8-b3ca-4b38-87d1-c5709d8bc6e5.png` | Recraft, as-is |
| 4 | THE WORKSHOPS | `hf_20260713_131834_5bdbe42c-db84-42fb-b8dc-1e6a79441348.png` | Recraft, as-is |
| 5 | THE DEEP | `hf_20260712_085446_bd9a2977-8bcd-4980-9c17-55ffb94752ce.png` | restored |
| 6 | THE SPIRE | `hf_20260712_085449_3f48a705-ffc6-4ce4-b497-458de2146ba9.png` | restored |
| 7 | THE EMERALD HOLLOW | `hf_20260713_130015_1bd48783-3a62-4215-9bae-2d2ef874db0c.png` | kept |
| 8 | THE CRYSTAL CANOPY | `hf_20260713_130018_0a11dbfd-6b6f-4ea0-a8a3-a4b8a8b2e6ee.png` | kept |

All remote URLs prefix: `https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/`.
mgs pools: L5 `["ingredients","memory","feed"]` · L6 `["bubblepop","inflation","bell"]`
· L7 `["mask","toneweave","gerald"]` · L8 `["stackhats","zolrain","toneweave"]`.
Slots 9–10 stay reserved for the operator's classic scenes (pasted refs are
not on disk; bundle them the day the files land in the repo).

## 2. QUIZ × SOLFEGGIO (operator: "each quiz a different solfeggio harmony")

Map quiz topics → SOLFEGGIO keys (deterministic; unknown topic → connection):
evidence→liberation(396) · hallucination→intuition(741) · training_data→
regeneration(285) · determinism→order(852) · receipts→grounding(174) ·
causation→change(417) · authority→crown(963) · repetition→connection(639) ·
sources→intuition(741) · default→love(528).
On quiz OPEN: `Sound.bijaTone(freq)` under the question (the question has a
key). On CORRECT: `Sound.harmonyShimmer(freq)` layered over the existing
riddleCorrect. On WRONG: nothing extra (never punitive). Moth cadence after a
visit: 90–150s → 60–100s (more ZOL interruptions, still polite).

## 3. MATCHA CRAVING (operator: "goblin asks for matcha, depressed if ignored")

Every 70–120s (UI zone timer, not reducer), if no craving active: one random
goblin shows a 🍵 want-bubble ("...matcha? for me?") + a matcha cup 🍵 spawns
near the Receipt Forge. Player taps the cup (picks it up — cursor/held state),
then taps the craving goblin within 25s → DELIVERED: goblin mood "delighted",
+1 magic sap exactly, small zolCelebrate-style coin sprinkle, gratitude line,
Lulu voice key `matcha`, receipt `Matcha delivered`. Timer lapses → goblin
mood "wistful" (render as lonely bucket) for ~60s + a sad line + receipt
`Matcha craving passed`. No ZOL, no world mutation. Membrane: moods + 1 sap.
Gate T29: spawn craving (debug hook), deliver → sap +1 exact, mood delighted,
receipt; second run: ignore (debug fast-forward) → mood lonely, receipt, no sap.

## 4. CLICK CONGAS (operator: "more drums and congas on clic")

Tapping empty `#world` ground (existing world click handler where
`e.target.id === "world"`) plays a rotating conga/djembe voice: cycle
`drumHit(180,0,0.16,0.18,120)` → `drumHit(85,0,0.3,0.25,42)+noiseBurst slap`
→ `noiseBurst(0,0.09,0.14,2400)` → `drumHit(240,0,0.12,0.14,190)`. Rate-limit
250ms. Every tap is a hand-drum: the map becomes a percussion instrument.

## 5. LULU VOICE FILES (10 hypnotic lines, generated — Fable fills URLs)

Add `var LULU_VOICE_URLS = { greet:"", boop:"", quizRight:"", quizWrong:"",
verdict:"", compost:"", matcha:"", travel:"", relic:"", goodnight:"" };`
(top of UI zone) + `function luluVoiceLine(key)`: if URL non-empty, play
`new Audio(url)` (volume 0.55, respect S.settings.muted, one at a time —
keep a single shared Audio element, pause before replay; on error fall back
to `luluSpeak(<the line's text>)`). Hook: greet→bootScriptedArc greeting ·
boop→Lulu booped · quizRight/quizWrong→answerQuiz (only every 3rd, don't
spam) · verdict→daily verdict open · compost→resolveProposal compost ·
matcha→delivery · travel→playLevelTransition · relic→discoverCollectible ·
goodnight→wonderCacheFinale. Fable fills URLs after generation completes.

## 6. ESOTERICA, NO_CLAIM (operator: "door to real transformation" — held as parable)

The Little Temple gains an "Eternal Now" reading layer: 4 new lines in its
rotation ("past = present = future — the log holds all three as one scroll",
"alchemy is attention: nigredo names the bug, albedo names the fix",
"the circle on the cauldron is the replay: what returns, returns changed",
"transformation is admitted, never proclaimed — your hand is the athanor").
Organ harmony label gains epithets: fifth "the golden agreement" · fourth
"the pillar" · octave "the return" · third "the smile" · tritone "the fertile
tension". Footer law UNCHANGED: "a reading, not a ruling — the Kernel did not
stir." Every symbol maps to a real mechanic; none claims the outer world.

## 7. GATES

All 28 stay green. Add T29 (matcha membrane, above). Playwright witness:
8 levels cycle, congas handler present, LULU_VOICE_URLS seam exists.

*Instant gratification is allowed to be loud. Truth stays quiet.* — Fable
