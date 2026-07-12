# The WULmoji Legend — the Warren's visual grammar

<!-- authority=false · claim=NO_CLAIM · a legend of symbols already in use -->

**One law:** *no decoration without logic.* Every glyph below is one that
already appears in `game.js` and carries a fixed meaning — a state, a
verdict, a place, a feeling. Purely atmospheric marks (drifting fireflies,
scatter-sparkles) are **not** here: they decorate, they don't mean, and a
legend that listed them would be lying about which symbols are grammar.

This document is the audited source of truth (grep-verified against the
shipped code); the in-game "The Warren's Signs" panel in the help overlay
renders a compact subset of it.

## The stamp triad — `🌱 ⏳ 🍂`

The single most important WULmoji: three glyphs meaning **accepted /
held / returned**, used *identically* in the two places the Warren asks
you to decide. This consistency is the grammar working — same mark, same
meaning, two mechanics.

| Glyph | Proposal (`STAMP_GLYPHS`) | Daily Verdict stone (`applyVerdictStamp`) |
|---|---|---|
| 🌱 | TRY — "a seed accepted" | 🟢 you faced it — a seedling at the Tree |
| ⏳ | HOLD — "a door kept ajar" | 🟡 you held it — an hourglass |
| 🍂 | COMPOST — "a gift returned to the soil" | 🔴 you let it pass — a fallen leaf |

The verdict *buttons* are `🟢 🟡 🔴` (face it / give space / let pass);
the *stone* they leave at the Tree is the `🌱 ⏳ 🍂` triad. Button =
choice; stone = receipt.

## Signals — what stirs the Warren (`SIGNAL_ICON`)

Shown in the Proposal Inspector's SIGNAL chip. Each is a kind of thing
that surfaces and asks for a decision.

| 🐛 bug | 😴 fatigue | ✨ mystery | 🌫️ intrusion | 🧭 novelty | 🌳 wonder |
|---|---|---|---|---|---|

## Moods — how a goblin feels (`MOOD_FX_SYMBOL`)

The floating particle above a goblin. Every free-form mood string the
reducer produces folds into one of six buckets (see `moodBucket`), and
each bucket flies one sign:

| ✨ curious | 🌟 happy | 〜 calm | ♡ lonely | ◆ focused | ❣ dramatic |
|---|---|---|---|---|---|

## Zones — the places (`ZONES`)

| 🌳 Akashic Tree | 🌸 Garden Plot | 🪲 Bug Nursery | 🏰 High Spire | 🔥 Receipt Forge | 🍄 Mycelial Gate |
|---|---|---|---|---|---|

## Play surface — the top bar (help overlay)

| 🪙 ZOL purse | 🦋 riddle chip | 🗺️ level chip | 🧌 a goblin | 💚 Lulu's needs |
|---|---|---|---|---|

## Goblin drops — the crumb a boop shakes loose (`BOOP_DROPS`)

Each goblin drops the sign of what they tend: 🍄 Lulu · 📜 Pip (paperwork)
· 🔩 Nib (bolts) · 🌱 Zaz (green) · 🔧 Tink (tools).

## What is *not* in the legend (and why)

- **Fireflies, sparkle bursts, the tree's breathing glow** — atmosphere,
  not grammar. They set mood; they don't encode state. Listing them would
  violate the one law.
- **Kaomoji faces, alchemy sigils, the full EMOWUL overlay set** — those
  belong to the wider conquest/HELEN lineage (parked chiddushim
  #20/#21/#22), not to this game's shipped vocabulary. A legend documents
  what a player will actually meet here.

*A sign that means nothing is decoration. A sign that means one thing,
always, is a word.* 🌱
