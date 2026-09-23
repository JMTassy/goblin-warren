# RULES_M1 — the Warren's rules, in plain language

This is what the reducer in `src/core/` actually does. It is written for
P4 (the gameplay view) and the Mayor, not for programmers reading source —
no code, just the rules a player would discover by playing. Where
`MAYOR_RULING_V2.md` cut something from M1 (bugs, the jar, the golden
seed, the Cave of Echoes), this document does not mention it again; where
the cut left a gap the vision didn't anticipate, the choice made is
called out explicitly below.

---

## The ground

Every Warren is a 4×4 patch: 10 soil, 3 rock, 3 pond. The layout is fixed
the moment the Warren is born, chosen by its seed — the same seed always
grows the same ground. Rock never grows anything and can never be dropped
on. Soil and pond can each hold one plant at a time.

## The lantern's one judgment

The lantern only checks whether a tile *can* hold a find: not rock, not
already occupied. It never judges the species, the terrain match, or
whether Lulu will like the result — that's discovered after the drop, not
warned about before it. Try to drop on an illegal tile and the find simply
stays in Lulu's hand — nothing is lost, try again.

## What each find becomes

- **Mosscap** sprouts wherever it's dropped, except pond — there it wilts.
- **Glowcap** sleeps through the night it's planted (on soil) and wakes
  the next time you visit on a later day. On pond it wilts instead of
  sleeping.
- **Reedling** thrives on pond. Dropped on soil, it wilts.

A wilted plant doesn't disappear right away — it waits, faded, until the
next real day turns over, then it falls into the compost heap and the
tile is bare again.

## Dropping on the compost heap

Any find can be dropped straight onto the compost heap instead of a tile.
The find is spent and the heap grows by one. The heap holds at most five —
past that, more finds can still be composted, but the heap simply doesn't
grow any fuller. (M1 cuts what happens at a full heap — the golden seed —
so a full heap is just a full heap: no reward, no penalty, no timer.)

## How Lulu reacts

- Anything glowing (glowcap) makes her hop **high** and sit beside it —
  she loves glow, every time, wherever it lands.
- A reedling planted in the row closest to her mound (the bottom row) gets
  a **shrug** — reeds by the mound aren't her favourite.
- Everything else gets an ordinary **hop**.

Petting sleeping Lulu (tap-and-hold) doesn't change anything about the
Warren — it's just for her to purr and show hearts. Since petting isn't
one of the three named reactions in the vision, the simplest rule with no
side effect was chosen: it reads as a happy hop, the same as an ordinary
good drop, with no gameplay consequence beyond that.

## A day at a time

Lulu brings six finds and then she's asleep for the day — a seventh offer
just doesn't come. When you come back on a later real day, several things
happen all at once, the moment you're detected on a new day:

1. Every growing plant gets a stage older (plants have four stages; the
   fourth is as grown as they get).
2. Any sleeping glowcap wakes up.
3. Every wilted plant falls into the compost heap and its tile clears.
4. **Recipes fire.** If a glowcap sits next to a mosscap (up, down, left
   or right — not diagonal), the mosscap becomes **lanternmoss**. If a
   glowcap sits next to a reedling the same way, the reedling becomes
   **mirrorbloom**. The glowcap tile itself never changes — only its
   neighbour transforms, fresh and newly grown (stage 0). A glowcap with
   two different neighbours can trigger both recipes at once.
5. Lulu wakes for a new day: six fresh finds to offer, energy full again.

However many real days passed since your last visit, this happens exactly
once per visit — a week's silence and a day's silence look the same to
the Warren when you come back (no punishment for staying away, per the
vision's "absence has no cost").

## Pip's Book

The Book isn't a thing Lulu carries — it's remembered by reading back
every drop and every day-turn that ever happened, so it's always exactly
right, never out of sync. It records:

- **Recipes**: the first time each pairing (mosscap+glowcap, or
  reedling+glowcap) actually combines, what it made, and which day.
  Combining the same pair again later doesn't add a second entry.
- **Reactions**: the first reaction Lulu ever showed for each species
  she's been given. Recipe results (lanternmoss, mirrorbloom) never get a
  reaction of their own in M1, because they're never directly dropped —
  they only ever arrive by combining on a later day.

## Sound

A quiet toggle, remembered until it's flipped again. It doesn't affect
anything else.

---

## Choices made where the cuts left a gap

The Mayor's cuts (bugs, jar, golden seed, Cave of Echoes, replay strip)
removed several mechanics the original vision leaned on. Nothing that's
left unresolved by those cuts gets a punishment or a timer added back in
— here's exactly what was decided instead:

- **A full compost heap (5)** does nothing further — no golden seed, no
  reset, no block on composting more. It just stays full.
- **Petting** always reads as a plain, happy `hop` reaction. There's no
  reserved "purr" reaction type in the frozen `Reaction` shape
  (`hop`/`bighop`/`shrug`/`null`), so the simplest read was chosen rather
  than inventing a new value that would widen the frozen contract.
- **`mood`** is no longer stored (Mayor's amendment after P1): `moodOf(state)`
  derives it. Asleep -> tired; after a big hop -> happy; after a shrug ->
  worried; otherwise curious. See `docs/INTERFACES.md` §8.
- **A find offered without ever being dropped, and Lulu falling asleep**
  (the vision's cut "sleep with a find offered → cave" rule): in M1 the
  find simply stays in her hand across the sleep/wake boundary — nothing
  is lost, nothing times out, and she can hand it over or you can still
  drop it once she's awake again. No cave to send it to; no need to
  invent a substitute punishment.
- **How "day" is tracked internally.** The frozen `State` shape has one
  `day: number` field and no separate "last visit's timestamp." `day`
  holds the *calendar day of the most recent `VISIT`* (derived purely
  from that event's `t`, in whole days). The very first `VISIT` a Warren
  ever receives just anchors this value without triggering any daily
  effects (nothing has been planted yet, so it would be a no-op anyway).
  Every `VISIT` after that which lands on a later calendar day than the
  last one triggers exactly one day-turn (section "A day at a time"
  above), no matter how many real days actually passed — matching the
  vision's "no streaks, absence has no cost." This needed no addition to
  the frozen shape.
