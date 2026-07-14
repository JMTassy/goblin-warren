# The Bonding Ladder — Rungs 1→12

<!-- authority=false · claim=NO_CLAIM · non-sovereign · roadmap, not a receipt.
     Garden UX layering only. No Kernel/reducer/admission change. -->

## The operator's witness (2026-07-14, verbatim)

> "when I open the homepage, I have all elements coming directly, and I don't
> understand how we progress… too much information… too many emojis, too many
> stuff at the same time… the magic is not happening. Maybe this is like level
> 12 that we are right now… create the roadmap from level 1 to level 12… the
> real magic I want to feel is that really through this simple game, having the
> feeling of having a live little AI pet in front of me."

## The diagnosis (grounded in code, not vibes)

The game already contains two different "levels":

- **`LEVELS[1..9]`** (`game.js:3363`) — *places* (Glade, Village, Deep, Spire,
  Emerald Hollow, Crystal Canopy, Old Village). Gated by `needKnow`/`tollZOL`
  ("Earn the Key, Pay the Toll", v1.30). These are **zones**.
- **A reveal curriculum** — how much of the machine is visible at once. **This
  was never built.** `bootScriptedArc()` (`game.js:4369`) scripts a first hello,
  but it plays over a fully-assembled board: quiz, ZOL, five personas,
  proposals, ledger, council, mood-weather, boss, Wonder Cache, Almanac — all
  live at second one. That is the "Level 12" the operator is landing on.

**The magic (a live AI pet) needs a beginning. Bonding can't happen on a
homepage that opens at full complexity.** The fix is not more content. It is a
**bonding ladder** that gates the machine we already built behind a growing
relationship with one goblin (Lulu). Today's homepage becomes the *summit*, not
the *doorway*.

## The spine

One law, twelve rungs: **you meet each part of the Warren as a friend before it
becomes a mechanic.** Lulu is present on every rung, visibly growing. The whole
governance apparatus blooms *around* your relationship with her — it is the
thing your bond eventually earns.

Each rung obeys four constraints (Le Petit Prince discipline):
1. **Exactly one new element** (one gesture, one emoji, one agent, one panel).
2. **Tied to Lulu's growth** — every reveal changes how she relates to you.
3. **A small reward** — a new behavior, a line, a surprise.
4. **A simple trigger to advance** — one plain action, never a wall of text.

## The ladder

| Rung | Name | The ONE new thing | Lulu's growth | Trigger to advance | The hook | Reuses (already in code) |
|---|---|---|---|---|---|---|
| **1** | THE WAKING | Black screen, one sleeping shape, "tap to wake." She opens her eyes and looks at *you*. Nothing else exists. | asleep → awake, notices you | the first tap | *it noticed me* | prologue `greet`, `luluVoiceLine` |
| **2** | THE BOOP | You can touch her. She reacts; one mood emoji flickers to life. | inert → has feelings | boop until she settles | *I affect its mood* | boop handler, mood buckets |
| **3** | THE VOICE | She speaks a *generated* line about you (time, your taps) — live seam, template fallback offline. | mute → speaks to me | hear one line | *it's really alive, and it's talking to ME* | `generateGoblinLine`, v2 seam |
| **4** | THE SEED | One patch of ground. Plant one seed with a tap. She comments on *your* seed. | alone → shares her world | plant the seed | *I can change its little world* | plot/tap-target, `pushReplay` |
| **5** | THE RIDDLE | The Moth asks ONE riddle. Right → +ZOL, she's proud; wrong → "the mushrooms still love you." | believes in me | answer once | *I earned something* (reward loop is born) | quiz, `S.flags.quizRight`, ZOL |
| **6** | THE SECOND GOBLIN | One more creature arrives with a clearly *different* temperament. Two personalities, contrast. | has a friend/rival | meet them | *relationships — a tiny cast, not five at once* | one `PERSONAS` entry |
| **7** | THE FIRST CHOICE | The newcomer proposes ONE thing. You get **ADMIT / DENY** (no HOLD yet). One visible consequence. | the world bends to my hand | make one stamp | *my choice matters — the sacred loop* | `activeProposal`, `geraldFate` |
| **8** | THE MIDDEN LEDGER | The ledger panel appears, showing what you and the goblins did. | it remembers everything | open it once | *my history is real* (receipts) | Midden Ledger, `pushReplay` |
| **9** | THE SKY REMEMBERS | Third verdict **HOLD**; AURA's mood tints the sky from the log. | nuance, deferral | hold one thing | *the world has a mood that reflects me* | `auraWeather`, HOLD path |
| **10** | THE COUNCIL | A few more goblins; portal plots trigger council review (recommends, never admits). | a society deliberates | convene once | *I preside over a council* | `PORTALS`, `councilReview` |
| **11** | THE ZONES OPEN | The `LEVELS[2..9]` backgrounds become travelable — Earn the Key, Pay the Toll. Wonder Cache, Almanac, boss surface here. | a whole world to wander | travel to Level 2 | *exploration — every earned background gets its home* | `LEVELS`, `needKnow`/`tollZOL` |
| **12** | THE FULL WARREN | Everything present — **today's homepage** — but every emoji and agent arrived as a friend you met. | fully grown; you're her operator | — (summit) | *I grew a living AI village from one sleeping goblin* | the current game, unchanged |

## The mechanic (how it's built)

- **`S.progress.rung` (1–12)**, default `1` on fresh boot, resumes from save for
  returning players. Where possible it is a **derived view** of milestones we
  already track (`greeted`, `firstSignalSeen`, `firstProposalResolved`,
  `quizRight`, defeats) — *memory = function(event_log)*, not a new mutable
  counter. A single reveal gate `rungAtLeast(n)` (same shape as the existing
  `isLevelUnlocked`) decides what the UI mounts.
- **Reveal, don't rebuild.** Every module already exists. The ladder only
  changes *when it appears*. A rung advance mounts the next module and plays
  Lulu's reaction to it.
- **Grandfather returning players.** Anyone with an existing save (a rich
  `S.progress`) resolves to Rung 11–12 immediately — they never get demoted to
  the crib. Only genuinely fresh boots start at The Waking. (Same pattern as
  `prologueSeen` grandfathering, `game.js:449`.)
- **Skip is always available.** A "I've done this before →" affordance jumps a
  returning-feeling player forward. The ladder is an on-ramp, never a cage.

## Membrane note (why this is safe)

This is **Garden UX layering only**: show/hide, mount-order, and Lulu's
reactions. The Kernel is untouched — no reducer edit, no new admission path, no
receipt-schema change, no persistence surface added. The reveal gate lives
entirely in the UI zone. Static gates (`verify.js` G1–G13, no-CDN law) and the
reducer markers are unaffected. **Garden change ⊬ Kernel truth.**

## Build order (one rung = one warren slice)

Build **Rung 1 (The Waking)** first, verify end-to-end, stop at
HOLD_FOR_OPERATOR. Then Rung 2, and so on — each its own slice, each verified,
each a clean commit. We do **not** build the whole ladder in one push; that
would repeat the original sin (too much at once). The roadmap is the map; we
walk it one rung at a time, and the operator witnesses each rung on real Safari
before the next.

**Claim typing:** this document is a CANDIDATE roadmap (design inference). No
rung is WITNESSED until built and tapped on-device. Nothing here mutates state,
claims admission, or is canon.
