# The Bonding Ladder — Rungs 1→12

<!-- authority=false · claim=NO_CLAIM · non-sovereign · roadmap, not a receipt.
     Garden UX layering only. No Kernel/reducer/admission change. -->

> **V2 root: `docs/VISION_V2.md` (2026-07-16).** This file remains the
> detailed rung reference; the pillars, intake law, and process
> constitution now live there.

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

## The ladder — reframed 2026-07-15, one captivating hook per rung

Each rung is tagged with the *specific* psychological principle it leans on
(not vibes — the same vocabulary as the "why it's catchy" essay this vision
has already absorbed: competence loop, variable reward, curiosity gap,
collection instinct, Zeigarnik effect, identity formation). **Status** is
honest: `BUILT` = live and witnessed, `PLANNED` = designed here, not coded.

| Rung | Name | The ONE new thing | Captivating hook (the *why*) | The line | Status |
|---|---|---|---|---|---|
| **1** | THE WAKING | Sleeping Lulu, one tree, tap to wake. | **Competence loop** — the fastest possible "did I understand this?" A tap produces an immediate, unambiguous response. | *"Oh... you found me..."* | **BUILT** ✅ |
| **2** | THE OFFERING | Offer the seed (tap vs. hold — she reads *how*). It blooms. | **Micro-dopamine, three layers** — sensory pop, her line, a flower that persists in the real world. Not one reward, three, stacked. | *"A flower. We made it."* | **BUILT** ✅ |
| **3** | THE RETURN | Tap the mystery behind the tree → the night turns → she remembers. | **The Zeigarnik effect** — an unresolved thread the mind keeps rehearsing. (This rung *was* the wall a real beta tester hit — "not yet, come back" — fixed 2026-07-15; tapping now advances instead of blocking.) | *"You came back... I kept our flower."* | **BUILT** ✅ |
| **4** | THE NEED | Lulu names THREE things at once, but the player has only TWO care actions (feed her matcha, water the bloom). The third — the sound behind the tree — is named, then deliberately deferred as a callback. | **Identity shift + real scarcity** — the pivot from *spectator* to *caretaker*, with an actual trade-off (game-design critique 2026-07-15: "3 visible needs, only 2 actions"), not observe→select→witness. | *"Lulu is a little hungry. Our flower could use water. Something moved again, behind the tree."* | **BUILT** ✅ (2026-07-15, `progression-gates.js` G4d-G4g, 14/14) |
| **5** | THE FIRST QUESTION | She — not a stranger Moth — asks you one gentle thing. Right answer: a real object lights in the world (reuses `QUIZ_TO_ZOL_V2`, unlocked here instead of only post-graduation). | **Earned reward, tangible** — the first time "getting it right" visibly changes the *place*, not a score. | a 🍄/🪔 lights, tied to *her* asking | PLANNED |
| **6** | THE SECOND VOICE | One more goblin arrives, a clearly different temperament — reacts to the *same* flower differently than Lulu did. | **Collection instinct + contrast** — proof the world holds more than one being; the promise of a cast, revealed one at a time. | two reactions to one flower | PLANNED |
| **7** | THE FIRST CHOICE | The newcomer proposes ONE thing. ADMIT / DENY (no HOLD yet). One visible consequence. | **Agency — the sacred loop.** Your tap is the only admission that exists. | the world visibly bends to your stamp | PLANNED |
| **8** | THE MIDDEN LEDGER | The ledger panel appears — what you and the goblins did, in order. | **The place becomes memory** — people remember *places*, not scores. This is where the Warren starts to feel like somewhere, not something. | your own history, readable | PLANNED |
| **9** | THE SKY REMEMBERS | A held verdict; AURA's mood tints the sky from the log. | **Emotional attachment** — the world's mood is a mirror of *you*, never a meter. | the sky itself answers you | PLANNED |
| **10** | THE COUNCIL & THE FIRST SONG | A few more goblins; portal plots trigger council (recommends, never admits). First taste of Serpent tone-play — purely felt, no Wolf/Coherence vocabulary surfaced yet. | **Variable reward** — harmonies aren't the same twice: sometimes she laughs, sometimes a lantern lights, sometimes just quiet. Unpredictability is what keeps a reward alive. | a chord that's never quite the same | PLANNED |
| **11** | THE ZONES OPEN | `LEVELS[2..9]` become travelable — Earn the Key, Pay the Toll. Wonder Cache, Almanac, first boss. | **Curiosity gap at scale** — "one more region," relic collection. A single Almanac line may hint, purely as poetry, that something in her is still tuning itself — texture, never a mechanic. | *"one more region..."* | PLANNED |
| **12** | THE FULL WARREN | Everything present — today's homepage — but every emoji and agent arrived as a friend you met. | **The work is never finished** (the whole project's deepest law, made playable). Wolf Intervals, Coherence, Lulu's archetypal shifts — everything designed in `LIVING_EGREGORE_VISION.md` — live *beyond* this summit, never before it. | *"I grew a living village from one sleeping goblin."* | **BUILT** (as today's game) ✅ — but arrived at with nothing earned between Rung 3 and here yet |

## The graduation gap — an honest finding, partially closed (2026-07-15)

Reframing this ladder surfaced something that needed saying plainly: **only
Rungs 1–3 were actually built** as of the first pass of this document.
`graduateCrib()` jumped straight from Rung 3 to the *entire* Rung-12
complexity dump — every goblin, every zone, every chip, all at once — the
instant the crib ended. Rungs 4–11 were fully designed but not one line of
them was coded, meaning the exact failure mode that bounced a real beta
tester at the front door — *"I get bored because I don't see the step by
step progression"* — was still structurally possible, just delayed by
roughly 90 seconds instead of 0.

**Same day, later pass: Rung 4 (THE NEED) is now built** (`cribNeed()` /
`cribFeedLulu()` / `cribWaterBloom()` / `cribCheckNeedsDone()`,
`game.js`) — `cribReturnMemory()`'s tail now leads into it instead of
straight into `graduateCrib()`.

**2026-07-16 — the gap is CLOSED at the staging level (witness #4).** The
operator played the full arc and hit the dump exactly as predicted ("we go
direct to level 12! I want a progression like MARIO or POKEMON — does not
start with end boss"). Built the same day: **THE WORLDS** — earned
graduation opens **World 1** only (Lulu + Zaz, tree + garden, the lantern
quiz, matcha), and Worlds 2/3/4 (rungs 7/9/11) unlock through each prior
world's own loop: 2 lantern answers → World 2 (Pip, forge, the Moth,
goldfall, replay strip) → 3 Moth riddles → World 3 (Nib, remaining zones,
signals/proposals, verdicts, wanderer, quests) → 2 governed proposals →
World 4 (level travel, temple/serpent/relics, **bosses — last**). Rung 12
remains "everything," reached only by skip or grandfathered saves — zero
behavior change for existing players (`worldStaged` flag + load-belt).
Gated by `progression-gates.js` G4f/GW1–GW4/G5a, 19/19. Trigger values
were corrected by an adversarial audit before shipping (a boops-based gate
was measured as a 5-second accidental skip and removed; a sap-based gate
let bosses spawn before proposals existed and was removed). The bespoke
Rung 5–11 *story beats* (her first question, the second voice's arrival
scene, …) remain PLANNED — the staging that contains them is BUILT.

## Game-design critique (2026-07-15) — supersedes the ladder above for Rung 4+

An honest external read on the ladder table above and the several full
12-level campaign drafts generated alongside it: **captivating as a world,
not yet consistently fun as a game.** Most levels above ask
*observe → select dialogue → witness consequence* — compelling for a few
minutes, passive across twelve. The diagnosis, condensed:

- **No scarcity, no trade-offs.** "Care" currently means clicking every
  available positive interaction. A real decision requires giving something
  up: *3 visible needs, only 2 actions* — not *1 need, 1 action, always
  right*.
- **No skill expression.** Nothing the player can practice and get better
  at. The Serpent Choir is the best existing candidate (tension → resolution
  in a short harmonic sequence is a real, learnable pattern).
- **Weak fast feedback.** Text-only consequence is weak game-feel. An action
  should chain visibly: *root bends → droplet travels underground → a
  distant room lights → a sleeping goblin opens one eye.*
- **Escalating conceptual depth ≠ escalating game difficulty.** The ladder
  above deepens *meaning* level over level; it doesn't yet deepen
  *challenge*.

**What this changes, concretely: Rung 4 (THE NEED) cannot ship as "she says
one want, you pick 1 of 2 responses."** That's still observe→select→witness.
The corrected shape, using the critique's own worked example as the
template — Rung 1's actual shipped mechanic (tap to wake, offer the seed)
already has real scarcity built in (one seed, one offer, no do-over) and
that's *why* it worked; Rung 4 needs the same property:

> Lulu is cold. A root is dry. A distant sound calls. **The player has two
> care actions, not three.** Whichever two are chosen, the third's absence is
> felt and remembered — not punished, just real.

**What not to repeat going forward** (from the critique, binding for every
future rung spec): no philosophical text as the primary reward · no new
system introduced once then abandoned · no choices whose outcomes are
nearly identical · no hidden score judging the player · no long exposition
before interaction · **no twelfth bespoke level — three or four excellent
mechanics recombined across twelve increasingly difficult *situations*,**
not twelve different ideas.

**Standing recommendation:** the next design artifact is one real, playable
Rung 4 loop with actual scarcity and fast feedback — not another full
1–12 campaign draft. Several complete alternative campaign structures exist
in chat/session history as raw material (bosses-as-thresholds, Comma as a
felt presence from the midpoint on, the Serpent Choir as the true climax);
none are adopted here. They stay CANDIDATE, unconsolidated, until Rung 4
proves the mechanical loop actually works.

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

Rungs 1–3 are done: built, gated (`progression-gates.js`), and witnessed on a
real device — including the Rung 3 fix, which only happened *because* an
operator actually played it and reported the exact wall. That's the pattern
to repeat, not skip: build one rung, ship a preview, get a real thumb on it,
*then* move on. We still do **not** build the remaining ladder in one push —
that repeats the original sin this whole document exists to fix.

Rung 4 (THE NEED) is now built and gated the same way — `progression-gates.js`
G4d–G4g (real scarcity is named, only 2 of 3 needs are actionable, the third
defers cleanly, a genuine reload mid-need resumes in the same beat, everything
graduates only after both actionable needs are met). **Not yet witnessed** —
built and self-tested, but not yet played by the operator on a real device;
that thumb is still the gate before calling it done.

Next: Rung 5 (reusing `QUIZ_TO_ZOL_V2` instead of inventing a new reward
system — same law as the Egregore doc's "merge, don't fork") — held until
Rung 4 gets its real-device witness.

**Claim typing:** Rungs 1–3 are **WITNESSED** (built, gated, played on a real
device, one real bug found and fixed). **Rung 4 is BUILT + gated
(14/14, `progression-gates.js`) but not yet WITNESSED** — no real-device play
yet. Rungs 5–12's *reframe* (2026-07-15 pass) is **CANDIDATE** — captivating
on paper, not yet coded, not yet tapped. The graduation-gap finding above is
**WITNESSED** as a structural fact (confirmed by reading `graduateCrib()` /
`cribReturnMemory()` / `cribNeed()`), not a guess.
