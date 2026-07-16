# Warren Item Library — V0

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign catalog.
     2026-07-14. Extracted from operator concept sheets: IMG_7463 (feast/props),
     IMG_7460 (creatures), and the Quiz→ZOL gameplay/economy legend sheet
     (World Objects & Buildings / Decor & FX panels). Concept art ⊬ shipped
     asset: the Warren renders ORIGINAL emoji/procedural glyphs (a technique),
     never embeds these renders (IP-safe rule + no-external-assets law).
     Names are original. IMG_7465 arrived 2026-07-16 (Library E) along with
     IMG_7483 (Library F) — catalog now 75 items across six libraries. -->

A placeable catalog for the Warren's existing object systems. Each row maps a
concept item to: **glyph** (emoji, the technique — not borrowed art) ·
**name** (original, goblin-flavored) · **zone** (`tree·garden·nursery·spire·forge·gate`) ·
**kind** (how it behaves) · **line** (optional flavor on tap).

**Kinds** (all reuse code that already exists — nothing new to invent):
- `deco` — ambient placement via `addObject`; taps ring its Tibetan-bowl tone (default).
- `line` — tap → a short flavor bubble (`showBubble`), then the tone.
- `relic` — Wonder-Cache collectible: surfaces on a milestone, found on tap, writes a garden receipt (grants **no ZOL**, admits nothing — membrane law).
- `critter` — ambient wanderer (fireflies/wanderer pattern); optional tap line.
- `npc` — a placed character with presence (roster/scene), no stamp control.

---

## Library A — The Goblin Larder (feast & props · from IMG_7463)

Decorations that make a zone feel *lived in*. A feast set for the Warren.

| id | glyph | name | zone | kind | line |
|---|---|---|---|---|---|
| `pot_peepin` | 🍲 | Peepin' Pot | forge | line | "The stew is watching you back. Politely." |
| `brew_bogberry` | 🫐 | Bog-Berry Brew | gate | deco | — |
| `roast_big` | 🍖 | The Big Roast | forge | deco | — |
| `dumpling_moon` | 🥟 | Moon Dumplings | garden | line | "Tied with garlic. So they don't wander off." |
| `skewer_wiggle` | 🍢 | Wiggle Skewers | nursery | line | "They stopped wiggling. Mostly." |
| `fish_lantern` | 🐟 | Lantern-Fish Feast | gate | deco | — |
| `pie_gravegrape` | 🥧 | Grave-Grape Pie | garden | line | "Grandmother's recipe. Grandmother is fine." |
| `bucket_crispy` | 🍗 | Crispy Wrigglers | nursery | line | "Extra crispy. Extra legs." |
| `dip_moss` | 🥣 | Moss Dip | garden | deco | — |

## Library B — The Warren Bestiary (creatures · from IMG_7460)

Ambient life + rare finds. Critters wander; a few are relics or NPCs.

| id | glyph | name | zone | kind | line |
|---|---|---|---|---|---|
| `emberling` | 🦎 | Emberling | forge | critter | "A tiny dragon. Mostly tail." |
| `cinderwyrm` | 🐉 | Cinder Wyrm | spire | critter | — |
| `capling` | 🍄 | Capling | garden | line | "The mushroom blinked. You saw it too." |
| `oldcroak` | 🐸 | Old Croak | garden | line | "He has opinions about rain." |
| `bristleback` | 🐗 | Bristleback | nursery | critter | — |
| `geodeshell` | 🐢 | Geode Shell | spire | relic | "A turtle wearing the mountain." |
| `snoutspin` | 🕷️ | Snoutspin | nursery | critter | — |
| `pobble` | 🦫 | Pobble | gate | critter | "Nobody agreed what Pobble is." |
| `pincerknight` | 🦀 | Pincer Knight | gate | critter | — |
| `boneweaver` | 🕸️ | Bone-Weaver | forge | line | "It only spins at night. Don't watch." |
| `thatchrat` | 🐀 | Thatch Rat | forge | critter | — |
| `sporerat` | 🐀 | Spore Rat | nursery | critter | "Half rat, half garden. All hungry." |
| `kingsquelch` | 👑 | King Squelch | spire | npc | "The Blob King. Crowned by acclaim, mostly his own." |
| `grumbles` | 🥔 | The Grumbles | nursery | critter | "Three lumps. Furious. Adorable." |
| `greatsow` | 🐖 | Great Sow | garden | critter | — |
| `toadstooltom` | 🍄 | Toadstool Tom | garden | line | "Half a man, half a mushroom, twice as calm." |
| `drip` | 🟢 | Drip | gate | critter | "It left a trail. The trail is also Drip." |
| `ooze` | 🔵 | Ooze | gate | critter | — |
| `hollowstag` | 🦌 | Hollowstag | tree | relic | "The forest's oldest memory, wearing antlers." |
| `oldboiler` | 🤖 | Old Boiler | forge | line | "Steam-hearted. Grumbles in the cold." |
| `forgeheart` | 🔥 | Forge-Heart | forge | line | "It keeps the Warren warm. It never sleeps." |
| `warrenwardens` | 👹 | Warren Wardens | spire | npc | "Three trolls. Club, shield, and a soft spot for pie." |

## Library D — World Objects, Buildings & Decor (from the Quiz→ZOL gameplay sheet)

Source note (claim honesty): this sheet is a **UI/economy legend** — its
"World Objects & Buildings" and "Decor & FX" panels are icons *standing for*
game concepts (a lantern-icon meaning "the lantern effect"), not a prop
photograph like Libraries A/B. The mapping below is one interpretive step
further from source than A/B, so it's marked here rather than left silent.
Continuity note: this is the same sheet whose tiered ZOL→world-effect design
(`+4 pulse · +10 lantern · +25 repair · +50 upgrade · +100 district`)
independently matches `QUIZ_TO_ZOL_V2` (already shipped, `5592e3e`) — the
`Marker Mushroom` and `Warren Lantern` rows below are the *decorative* kin of
that quiz's `learned-mushroom` / `knowledge-lantern` effects, kept distinct
(placeable ambiance vs. milestone-triggered reward) to avoid double-booking
one glyph for two meanings.

| id | glyph | name | zone | kind | line |
|---|---|---|---|---|---|
| `lantern_warren` | 🏮 | Warren Lantern | gate | deco | — |
| `mushroom_marker` | 🍄 | Marker Mushroom | garden | deco | — |
| `waypost` | 🪧 | Waypost | garden | line | "Mushrooms this way. Allegedly." |
| `chest_mossy` | 📦 | Mossy Chest | nursery | relic | "Locked by moss, not by malice." |
| `cauldron_brewing` | ⚗️ | Brewing Cauldron | forge | deco | — |
| `bench_goblin` | 🪑 | Goblin Bench | garden | deco | — |
| `workshop_lv1` | 🏚️ | Workshop, First Timbers | forge | deco | — |
| `workshop_lv2` | 🏘️ | Workshop, Second Story | forge | deco | — |
| `forge_hall` | ⚒️ | The Forge Hall | forge | deco | — |
| `reading_roots` | 📚 | The Reading Roots | tree | line | "Every page composts eventually." |
| `watch_spire` | 🗼 | The Watch Spire | spire | deco | — |
| `crystal_warren` | 💎 | Warren Crystal | spire | deco | — |
| `vine_trailing` | 🌿 | Trailing Vine | garden | deco | — |
| `banner_warren` | 🎏 | Warren Banner | gate | deco | — |
| `orb_floating` | 🔮 | Floating Orb | spire | deco | — |
| `sparkle_warren` | ✨ | Warren Sparkle | tree | deco | — |
| `zol_mote` | 🪙 | ZOL Mote | forge | deco | — |

## Library E — Crafts, Crew & Provisions (from IMG_7465 · received 2026-07-16)

The long-open slot, finally delivered. Five working goblins, five stations,
five provisions — a village's hands, benches, and pantry.

| id | glyph | name | zone | kind | line |
|---|---|---|---|---|---|
| `gob_stewmaster` | 👨‍🍳 | The Stewmaster | forge | npc | "Taste it? It tastes you first." |
| `gob_twinsting` | 🗡️ | Twinsting | gate | npc | "Two knives. Zero plans." |
| `gob_ironshell` | 🛡️ | Ironshell | spire | npc | "The armor squeaks. It's singing." |
| `gob_bonewhisper` | 💀 | Bonewhisper | gate | npc | "The skulls agree with me. Always." |
| `gob_lampkeeper` | 🏮 | The Lampkeeper | tree | npc | "I carry the light. The light carries me." |
| `hut_hearthhome` | 🛖 | Hearth-Home | garden | deco | — |
| `bench_bubblework` | ⚗️ | Bubblework Bench | forge | line | "Green means done. Purple means run." |
| `bench_bonewright` | 🦴 | Bonewright Table | gate | deco | — |
| `cauldron_evercook` | 🍯 | The Evercook | forge | line | "It has never been empty. Nobody remembers filling it." |
| `crate_sporecrate` | 🍄 | Spore Crate | nursery | line | "Do not open indoors. Or outdoors." |
| `board_butcherblock` | 🔪 | Butcher's Block | forge | deco | — |
| `map_hidehide` | 🗺️ | The Hide-Hide Map | gate | relic | — |
| `bowl_bogberries` | 🫐 | Bog-Berry Bowl | garden | deco | — |
| `hoard_gleampile` | 🪙 | Gleam-Pile | spire | relic | — |
| `splash_gloop` | 🟢 | Gloop | nursery | line | "It waved. Wave back. Slowly." |

## Library F — Diggers, Sleepers & Dangerous Furniture (from IMG_7483 · received 2026-07-16)

Miners and watchers, camp structures, and things that only pretend to be loot.
(The sheet arrived twice — the two copies are identical.)

| id | glyph | name | zone | kind | line |
|---|---|---|---|---|---|
| `gob_lampline` | ⛏️ | Lampline the Miner | spire | npc | "Down is just up, for later." |
| `gob_shardseer` | 💎 | Shardseer | tree | npc | "The crystal hums. I hum back. We're friends." |
| `gob_spearwall` | 🔱 | Spearwall | spire | npc | "I stand where standing matters." |
| `gob_napper` | 😴 | The Deep Napper | garden | critter | "Do not wake. Warmth in progress." |
| `fence_boneline` | 🦴 | The Bone-Line Fence | gate | deco | — |
| `tent_hidehall` | ⛺ | Hide-Hall | garden | deco | — |
| `altar_glowshrine` | 🕯️ | The Glow-Shrine | gate | relic | — |
| `pile_oldquarrels` | ⚔️ | Old Quarrels | spire | line | "Every blade here lost an argument." |
| `chest_biter` | 🧰 | The Biter | forge | line | "It's not a chest. Say hello anyway." |
| `hoard_bonegold` | 💰 | Bone-Gold Hoard | spire | relic | — |
| `jug_ooze` | 🏺 | The Weeping Jug | nursery | line | "It leaks on purpose. It's expressive." |
| `burrow_dusty` | 🕳️ | Dusty Door | gate | deco | — |

## Key-art references (not items — mood canon, received 2026-07-16)

- **IMG_7482 — "The Fire and the Lantern"**: a goblin kindles a night fire, a
  lantern in hand, a second pair of eyes watching from the dark, teal traces
  glowing in the roots. This is the *Tactile First* law as a single painting —
  both lanes' fire openings (the Warren's HEARTH, day1's Dying Fire) share
  this exact mood target. Note the watcher: the deferred third wish, painted.
- **IMG_7466 — Match-and-Transform poster**: concept art for the parked
  Match-3 CANDIDATE ("the first toy after the crib" — swap→match→transform,
  goblin reactions, village growth). Stays parked; the poster is its brief
  when its turn comes.

---

## Ready-to-place data (drop-in for the object system)

Deliberately **not wired** into `game.js` yet (respects the witness-first hold —
this is a catalog, not an admitted feature). When you say go, this array feeds a
`placeItem(id)` helper over the existing `addObject` + collectible + wanderer
paths, gated to the graduated Warren.

```js
/* WARREN_ITEM_LIBRARY_V0 — original glyph/name mapping of operator concept art.
   No render embedded (IP-safe technique). kind ∈ deco|line|relic|critter|npc. */
var WARREN_ITEMS = [
  // Larder
  { id:"pot_peepin",     glyph:"🍲", name:"Peepin' Pot",        zone:"forge",   kind:"line",    line:"The stew is watching you back. Politely." },
  { id:"brew_bogberry",  glyph:"🫐", name:"Bog-Berry Brew",     zone:"gate",    kind:"deco" },
  { id:"roast_big",      glyph:"🍖", name:"The Big Roast",       zone:"forge",   kind:"deco" },
  { id:"dumpling_moon",  glyph:"🥟", name:"Moon Dumplings",      zone:"garden",  kind:"line",    line:"Tied with garlic. So they don't wander off." },
  { id:"skewer_wiggle",  glyph:"🍢", name:"Wiggle Skewers",      zone:"nursery", kind:"line",    line:"They stopped wiggling. Mostly." },
  { id:"fish_lantern",   glyph:"🐟", name:"Lantern-Fish Feast",  zone:"gate",    kind:"deco" },
  { id:"pie_gravegrape", glyph:"🥧", name:"Grave-Grape Pie",     zone:"garden",  kind:"line",    line:"Grandmother's recipe. Grandmother is fine." },
  { id:"bucket_crispy",  glyph:"🍗", name:"Crispy Wrigglers",    zone:"nursery", kind:"line",    line:"Extra crispy. Extra legs." },
  { id:"dip_moss",       glyph:"🥣", name:"Moss Dip",            zone:"garden",  kind:"deco" },
  // Bestiary
  { id:"emberling",      glyph:"🦎", name:"Emberling",           zone:"forge",   kind:"critter", line:"A tiny dragon. Mostly tail." },
  { id:"cinderwyrm",     glyph:"🐉", name:"Cinder Wyrm",         zone:"spire",   kind:"critter" },
  { id:"capling",        glyph:"🍄", name:"Capling",             zone:"garden",  kind:"line",    line:"The mushroom blinked. You saw it too." },
  { id:"oldcroak",       glyph:"🐸", name:"Old Croak",           zone:"garden",  kind:"line",    line:"He has opinions about rain." },
  { id:"bristleback",    glyph:"🐗", name:"Bristleback",         zone:"nursery", kind:"critter" },
  { id:"geodeshell",     glyph:"🐢", name:"Geode Shell",         zone:"spire",   kind:"relic",   line:"A turtle wearing the mountain." },
  { id:"snoutspin",      glyph:"🕷️", name:"Snoutspin",           zone:"nursery", kind:"critter" },
  { id:"pobble",         glyph:"🦫", name:"Pobble",              zone:"gate",    kind:"critter", line:"Nobody agreed what Pobble is." },
  { id:"pincerknight",   glyph:"🦀", name:"Pincer Knight",       zone:"gate",    kind:"critter" },
  { id:"boneweaver",     glyph:"🕸️", name:"Bone-Weaver",         zone:"forge",   kind:"line",    line:"It only spins at night. Don't watch." },
  { id:"thatchrat",      glyph:"🐀", name:"Thatch Rat",          zone:"forge",   kind:"critter" },
  { id:"sporerat",       glyph:"🐀", name:"Spore Rat",           zone:"nursery", kind:"critter", line:"Half rat, half garden. All hungry." },
  { id:"kingsquelch",    glyph:"👑", name:"King Squelch",        zone:"spire",   kind:"npc",     line:"The Blob King. Crowned by acclaim, mostly his own." },
  { id:"grumbles",       glyph:"🥔", name:"The Grumbles",        zone:"nursery", kind:"critter", line:"Three lumps. Furious. Adorable." },
  { id:"greatsow",       glyph:"🐖", name:"Great Sow",           zone:"garden",  kind:"critter" },
  { id:"toadstooltom",   glyph:"🍄", name:"Toadstool Tom",       zone:"garden",  kind:"line",    line:"Half a man, half a mushroom, twice as calm." },
  { id:"drip",           glyph:"🟢", name:"Drip",                zone:"gate",    kind:"critter", line:"It left a trail. The trail is also Drip." },
  { id:"ooze",           glyph:"🔵", name:"Ooze",                zone:"gate",    kind:"critter" },
  { id:"hollowstag",     glyph:"🦌", name:"Hollowstag",          zone:"tree",    kind:"relic",   line:"The forest's oldest memory, wearing antlers." },
  { id:"oldboiler",      glyph:"🤖", name:"Old Boiler",          zone:"forge",   kind:"line",    line:"Steam-hearted. Grumbles in the cold." },
  { id:"forgeheart",     glyph:"🔥", name:"Forge-Heart",         zone:"forge",   kind:"line",    line:"It keeps the Warren warm. It never sleeps." },
  { id:"warrenwardens",  glyph:"👹", name:"Warren Wardens",      zone:"spire",   kind:"npc",     line:"Three trolls. Club, shield, and a soft spot for pie." },
  // World Objects, Buildings & Decor (Library D — from the gameplay/economy legend)
  { id:"lantern_warren",  glyph:"🏮", name:"Warren Lantern",         zone:"gate",    kind:"deco" },
  { id:"mushroom_marker", glyph:"🍄", name:"Marker Mushroom",        zone:"garden",  kind:"deco" },
  { id:"waypost",         glyph:"🪧", name:"Waypost",                zone:"garden",  kind:"line",  line:"Mushrooms this way. Allegedly." },
  { id:"chest_mossy",     glyph:"📦", name:"Mossy Chest",            zone:"nursery", kind:"relic", line:"Locked by moss, not by malice." },
  { id:"cauldron_brewing",glyph:"⚗️", name:"Brewing Cauldron",       zone:"forge",   kind:"deco" },
  { id:"bench_goblin",    glyph:"🪑", name:"Goblin Bench",           zone:"garden",  kind:"deco" },
  { id:"workshop_lv1",    glyph:"🏚️", name:"Workshop, First Timbers",zone:"forge",   kind:"deco" },
  { id:"workshop_lv2",    glyph:"🏘️", name:"Workshop, Second Story", zone:"forge",   kind:"deco" },
  { id:"forge_hall",      glyph:"⚒️", name:"The Forge Hall",         zone:"forge",   kind:"deco" },
  { id:"reading_roots",   glyph:"📚", name:"The Reading Roots",      zone:"tree",    kind:"line",  line:"Every page composts eventually." },
  { id:"watch_spire",     glyph:"🗼", name:"The Watch Spire",        zone:"spire",   kind:"deco" },
  { id:"crystal_warren",  glyph:"💎", name:"Warren Crystal",         zone:"spire",   kind:"deco" },
  { id:"vine_trailing",   glyph:"🌿", name:"Trailing Vine",          zone:"garden",  kind:"deco" },
  { id:"banner_warren",   glyph:"🎏", name:"Warren Banner",          zone:"gate",    kind:"deco" },
  { id:"orb_floating",    glyph:"🔮", name:"Floating Orb",           zone:"spire",   kind:"deco" },
  { id:"sparkle_warren",  glyph:"✨", name:"Warren Sparkle",         zone:"tree",    kind:"deco" },
  { id:"zol_mote",        glyph:"🪙", name:"ZOL Mote",               zone:"forge",   kind:"deco" }
];
```

## Membrane

Placing any item mutates only `S.objects` (a decoration) or the collectible /
wanderer views — **no ZOL, no admission, no reducer/ledger touch**, same law as
every object in the Warren. Renders stay original glyphs. `item placed ⊬ item admitted`.
