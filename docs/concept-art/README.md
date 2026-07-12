# Concept Art & Design Bible — Goblin Warren

<!-- authority=false · claim=NO_CLAIM · reference art, not shipped assets -->

Vision references from JM Tassy (sole author). These are **design canon** —
the mood, the crew, and the loop the code should keep serving. They are
reference images, **not** shipped game art (the game's pixel look is a
*technique*, not borrowed art — see CLAUDE.md IP-safe rule).

| File | What it pins |
|---|---|
| `warren-realm-master-board.png` | **The capstone.** "The Warren Realm — the Inner Worlds of HELEN." Six realms around the **Akashic Tree** (Dream Grove = imagination/proposals · Receipt Forge = memory/proof · Bug Nursery = errors/learning · Mycelial Gate = connections/flow · Mayor Hall = decision/action · Cave of Echoes = silence/unconscious); the **Evolution Journal** ("Nothing is permanent. What remains… is what worked."); the ten goblin lanes (Lulu/Pip/Nib/Zaz/Gerald + Jester/Warden/Scholar/Mayor/Spark); **Warren Vitals** (Curiosity/Diversity/Memory · Coherence/Trust/Energy → BALANCED); the relic shelf (matcha, WUL coin, bug jar, receipt, glow seed, wish token). "You are not the owner. You are the witness." This board *is* `HELEN_AS_EVOLUTION.md` drawn. |
| `character-sheet.png` | The Warren Crew — **Lulu** (Explorer), **Nib** (Tinkerer), **Pip** (Archivist), **Zaz** (Gardener), **Gerald** (Neighbor); the boss **Mahakrah, the Akashic Guardian**; the 6-mood spectrum; home locations (Garden Plot, Bug Nursery, Receipt Forge, Mycelial Gate); "how to earn their trust." |
| `vision-02.png` (Gameplay deck 3/5) | The core loop **Observe → Tap & Check → Propose → Decide (TRY / HOLD / COMPOST) → Enact → Record**. "No fights, only feelings. No timers. No right answer, only consequence. Everything stays in your device. You are the witness; they are the builders." |
| `lulu-tamagotchi-vision.jpeg` | Lulu's care screen — TALK / REST / EXPLORE, needs bars, "Every action creates a reaction. Care for me, and watch our memories grow." + The Embassy of Bug (CLARIFY / EVIDENCE / SPLIT). |
| `vision-03.png` (Lulu Tamagotchi System) | The full Lulu spec: **three needs only** (Energy / Curiosity / Connection), **eight moods** (energetic, sleepy, curious, lonely, proud, suspicious, dramatic, cave-dweller), **four care actions** (TALK / REST / EXPLORE / GIVE OBJECT), 10+ absence events, ZOL jar reactions, "never let Lulu die" (retreats to the cave, you can always reconnect), and **Lulu's state affects Council**. |
| `vision-04.jpeg` | Companion vision board (Lulu alive / magic touch). |

## Design laws these images encode (already enforced in code)

- **WUL TRUTH: dialogue never mutates the world — only executed actions do.**
  (Chat/voice is rendering; `careLulu` / `sealTeaching` / `resolveProposal`
  are the only state doors. Enforced by the reducer seam + gate board.)
- **Three needs, never more.** Energy / Curiosity / Connection. Bands, not
  raw values, ever leave for the Council (advisory only — see
  `lulu/LULU_LOCAL_EVENT_SCHEMA.json` `CouncilAdvisory`).
- **ZOL is playful, not real money, not authority.** Gates nothing
  constitutional.
- **No timers, no combat, no losing.** Neglected Lulu retreats to the cave;
  you can always reconnect.
- **The Warren remembers everything** via the append-only event log; memory
  = function(event_log), replayable, inspectable.

## Where the vision already lives in the build

- Lulu care loop + eight moods + absence events → `game.js` (`renderLuluCare`,
  `luluMood`, `ABSENCE_MESSAGES`, `careLulu`), gate `lulu-gates.js` (12/12) and
  `lulu/selftest_lulu.py` (19/19).
- Teachable goblins (Pip/Nib/Zaz/Gerald) → `game.js` (`teachGoblin`,
  `interpretLesson`, `sealTeaching`, `goblinCallback`), gate `teach-gates.js`.
- Council coupling (Lulu's state → advisory) → `council-gates.js` (13/13).
- Core TRY / HOLD / COMPOST loop → `resolveProposal`, `verify.js`.

*Reference the vision; keep the laws. Grow one bounded mechanic per slice.* 💜
