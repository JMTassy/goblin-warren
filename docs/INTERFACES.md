# INTERFACES — the frozen contract

This document is normative for M1. It is what P1–P4 build against. Where
this document and a source file's comments disagree, **this document
wins** — file it as a bug in the source comment. Where this document and
`VISION_V2.md` disagree, `MAYOR_RULING_V2.md`'s amendments win (it amends
the vision on scope), and where neither ruling nor vision anticipated a
concrete detail needed to freeze a signature, this document's choice is
the tie-break — flagged below wherever that happened.

Written by P0. Frozen per `MAYOR_RULING_V2.md` Amendment 2: "P0 therefore
creates `src/core/{state,finds,growth,ledger,book,persist}.js` with the
final exported signatures and trivial stub bodies... Once P0 lands, those
files belong to P1 alone. P4 imports only through those signatures."

---

## 1 · The ledger and its events (`src/core/events.js`)

```
Ledger = { v: 'GW2', seed: number, events: GWEvent[] }
```

`events[0]` is always a `WARREN_BORN` event whose `seed` matches the
ledger's own `seed` (redundant on purpose — the ledger is self-describing).

M1's event kinds (`EVENT` in `events.js`) — **note the ruling's cut**:
`MAYOR_RULING_V2.md` Amendment 1 removes the Cave of Echoes from M1, so
`FIND_DROPPED.target` is `'tile' | 'compost'` only. `'cave'` is not a legal
value in M1 even though the original vision text mentions it; it returns
in M2.

| kind | payload | meaning |
|---|---|---|
| `WARREN_BORN` | `{ seed: number }` | Only ever `events[0]`. |
| `VISIT` | `{ t: number }` | ms since epoch. **The only source of "now"** the core may use — growth/sleep/day-rollover derive everything from consecutive `VISIT.t` values, never from a wall-clock read inside `src/core`. |
| `WAKE` | `{}` | Lulu wakes for the day: ends sleep, resets energy. |
| `FIND_OFFERED` | `{}` | Lulu holds up a new find. Species chosen deterministically by `finds.nextFind` from `state` + `rng(seed, events.length)`. |
| `FIND_DROPPED` | `{ target: 'tile'\|'compost', tile?: number }` | `tile` is `0..15` and required iff `target === 'tile'`. |
| `PET` | `{}` | Tap-and-hold on sleeping Lulu. Juice only — never changes gameplay state beyond `lastReaction`. |
| `TOGGLE_SOUND` | `{}` | Flips `state.sound`. |

`events.js` also exports convenience constructors (`warrenBorn(seed)`,
`visit(t)`, `findDropped(target, tile)`, …) that build correctly-shaped
event objects — use these instead of hand-rolling `{ kind: '...' }`
literals so a typo in `kind` is a build error, not a silent no-op.

`LEDGER_VERSION` = `'GW2'`. `FIND_DROPPED_TARGETS` = `['tile', 'compost']`.

---

## 2 · Core data shapes (`src/core/state.js`)

```ts
type Species = 'mosscap' | 'glowcap' | 'reedling'
// M1 species only. MAYOR_RULING_V2.md Amendment 1: no bugs, no golden seed.

type Find = {
  id: string
  species: Species
}

type Terrain = 'soil' | 'rock' | 'pond'

type Plant = {
  species: Species | 'lanternmoss' | 'mirrorbloom'
  // A recipe result REPLACES the tile's species in place — it is never a
  // separate Find and never appears in `nextFind()`'s output.
  plantedDay: number
  sleeping: boolean
  // true for a freshly-planted glowcap until a VISIT lands on a later day.
  stage: number   // 0..3 (4 values — see the §9/§11 stage-count note below)
  wilted: boolean
}

type Ground = {
  w: 4
  h: 4
  terrain: Terrain[]   // length 16, row-major: index = row*4 + col
  tiles: (Plant | null)[]   // length 16, same indexing as terrain
}

type Mood = 'curious' | 'happy' | 'worried' | 'tired'
type Reaction = 'hop' | 'bighop' | 'shrug' | null

type State = {
  v: 'GW2'
  seed: number
  day: number
  energy: number        // 0..6, finds remaining before Lulu sleeps
  asleep: boolean
  mood: Mood
  offered: Find | null  // the find currently held up, waiting to be dragged
  ground: Ground
  compost: number        // 0..5, a PLAIN COUNTER in M1 — no golden-seed trigger
  lastReaction: Reaction
  sound: boolean
}
```

**Discrepancy resolved:** `VISION_V2.md` §9 says plant art is "3 stages",
but §11's frozen `Plant` shape says `stage: 0..3`, which is 4 possible
values (0, 1, 2, 3). The data shape in §11 is what's normative for state
(this is the shape Amendment 2 explicitly freezes), so `stage` has **4**
values; art can reuse the same texture for two adjacent stages if it only
wants 3 distinct looks — that's a P2 art choice, not a data-shape one.

**Addition beyond §9's art list:** `tile_glow_ok` / `tile_glow_no` texture
keys exist for the legality-glow overlay (§4: tiles glow green/red under
the finger while dragging). §9's art inventory doesn't name this asset but
the frozen gameplay loop and the test hook's `view().hover` require it, so
P0 added it rather than leaving P4 to invent an ad hoc key. See
`src/art/registry.js`.

**Kept, possibly-unused key:** `tile_wet` is carried over from §9's art
list verbatim. The P0 task brief's cut list for `TEXTURE_KEYS` names only
"no bug, jar, cave, golden" — it does not cut `wet` — but no M1 rule in
`MAYOR_RULING_V2.md`'s "M1 keeps" list reads or writes a wet/dry tile
state. P0 kept the key as literally instructed and flags it here: P1/P4
may simply not use it in M1.

---

## 3 · Core API stubs — frozen signatures (Amendment 2)

All of `src/core/*` is **pure**: no wall-clock reads, no non-seeded
chance, no DOM globals (`window`/`document`), no engine import. Enforced
by `test/core/purity.test.js` (a literal substring check across
`src/core` and `src/art` — this means even a *comment* mentioning the
banned tokens fails the test; write around them, e.g. "wall-clock" instead
of "Date").

Randomness: use `rng(seed, index)` from `src/core/rng.js`, never a raw
chance call. Typical index is `events.length` at the moment of the draw —
see `src/core/rng.js`'s doc comment for the full API (`mulberry32`, `rng`,
`rngInt`, `rngPick`).

### `src/core/state.js`

```ts
makeState(seed: number): State
apply(state: State, event: GWEvent): State
```

- `makeState` builds the initial State for a freshly-born Warren.
  **STUB today**: all-soil 4×4, empty ground. P1 replaces this with the
  real seed → terrain layout (10 soil / 3 rock / 3 pond, per
  `MAYOR_RULING_V2.md`'s "M1 keeps" list) using `rng(seed, i)`.
- `apply` must **never mutate its `state` argument** (or anything
  reachable from it) — always return a new object. An illegal event
  (e.g. `FIND_DROPPED` on a rock tile) is a no-op that still returns a new,
  structurally-equal object. **STUB today**: returns `{ ...state }`
  (shallow copy) for every event, ignoring `event` entirely.

### `src/core/finds.js`

```ts
nextFind(state: State): Find | null
legal(state: State, tileIndex: number): boolean
outcome(state: State, find: Find, tileIndex: number): { plant: Plant | null, reaction: Reaction }
```

- `nextFind` picks the next find deterministically from `state` (species
  distribution + `rng`). Returns `null` when `state.energy === 0`.
  **STUB today**: always `null`.
- `legal` — the lantern's *only* judgment (§4: "the lantern judges
  legality only"). Legal = tile index in range, terrain is not `'rock'`,
  and `ground.tiles[tileIndex]` is `null`. **STUB today**: always `false`.
- `outcome` is a pure function: given `state`, the `find` being dropped,
  and the target `tileIndex`, returns the `Plant` it becomes (terrain
  rules: mosscap sprouts anywhere but wilts on pond; glowcap sleeps a
  night; reedling thrives on pond but wilts on soil) and Lulu's `reaction`
  (glow species → `'bighop'`, reedling planted in row 3 → `'shrug'`, else
  `'hop'`). It does **not** itself mutate `ground` — `apply()` commits the
  result. **STUB today**: `{ plant: null, reaction: null }`.

### `src/core/growth.js`

```ts
newDay(state: State): State
```

Advances the Warren by one real day: stage+1 (max 3) on every growing
plant, sleepers wake, wilted plants fall into compost (tile cleared,
`compost`+1), adjacent recipe pairs fire, energy resets. Called once per
elapsed calendar day between two `VISIT`s — **never** on a timer.
**STUB today**: `day += 1`, everything else unchanged.

### `src/core/ledger.js`

```ts
replay(ledger: Ledger): State
```

Folds `ledger.events` through `apply()`, starting from
`makeState(ledger.seed)`. This is likely the **real, final**
implementation already (it's a generic fold — correctness follows once
`apply()` is correct); P1 mainly needs to decide what to do with a ledger
that doesn't start with `WARREN_BORN`, or an event `apply()` can't make
sense of. **Determinism contract**: `replay(ledger)` called twice is
deep-equal, and folding `apply` incrementally as events arrive must equal
replaying the whole ledger from scratch.

### `src/core/book.js`

```ts
book(ledger: Ledger): { recipes: RecipeEntry[], reactions: Record<string, Reaction> }
// RecipeEntry = { pair: [Species, Species], result: 'lanternmoss' | 'mirrorbloom', day: number }
```

Pip's Book is **derived**, never stored — a read of the ledger, not a
piece of `State`. `recipes` is discovery-ordered, one entry per pair on
first discovery. `reactions` maps species (including recipe results once
discovered) to the reaction last/first shown. **STUB today**:
`{ recipes: [], reactions: {} }`.

### `src/core/persist.js`

```ts
serialize(ledger: Ledger): string
parse(input: string): Ledger | null
```

Convert a ledger to/from a string — **not** localStorage I/O (that's
`src/game/storage.js`, P4's file — it reads/writes localStorage and calls
these). **Fail-closed**: `parse` returns `null` on anything it isn't sure
about (bad JSON, wrong `v`, non-numeric `seed`, non-array `events`, an
event without a string `kind`) — never throws, never returns a
partially-valid ledger. `null` means "start a new Warren," not "crash."
This is already close to the real implementation; P1 may extend the
per-event validation (kind/payload shape) if it's found wanting.

---

## 4 · Art & audio registries

### `src/art/registry.js`

```ts
TEXTURE_KEYS: readonly string[]     // every texture key the game may use
TEXTURE_GROUPS: { lulu, finds, tiles, glow, plants, wilt, heap, misc }
TEXTURE_SIZES: { lulu: {w:16,h:16}, find: {w:8,h:8}, tile: {w:24,h:24}, plant: {w:16,h:24} }
plantTextureKey(species, stage): string   // `plant_${species}_${stage}`
```

Full key list (see the file for the literal array — this is the grouped
view):

- **Lulu** (`lulu` group): `lulu_body_0`, `lulu_body_1` (2 idle frames) +
  `lulu_face_curious|happy|worried|tired` (4 faces) — composited as body +
  face overlay, not 8 baked permutations.
- **Finds** (`finds`): `find_mosscap`, `find_glowcap`, `find_reedling`. No
  `find_bug` (cut, Amendment 1).
- **Tiles** (`tiles`): `tile_soil`, `tile_wet`, `tile_rock`, `tile_pond`.
- **Legality glow** (`glow`): `tile_glow_ok`, `tile_glow_no` — see §2's
  "addition beyond §9" note.
- **Plants** (`plants`): `plant_<species>_<stage>` for
  `species ∈ {mosscap, glowcap, reedling, lanternmoss, mirrorbloom}` ×
  `stage ∈ {0,1,2,3}` — 20 keys.
- **Wilt** (`wilt`): `plant_wilted` — one shared look for any species.
- **Heap** (`heap`): `heap_0`, `heap_1`, `heap_2` (3 fill levels). No jar
  or cave art (cut, Amendment 1).
- **Misc** (`misc`): `lantern`, `particle`.

Cut vs. `VISION_V2.md` §9, per the P0 task brief and Amendment 1: no bug,
jar, cave, or golden art.

### `src/audio/registry.js`

```ts
SFX_CUES: readonly string[]
```

`['pop', 'lift', 'tile_ok', 'tile_no', 'thunk', 'sprout', 'burp', 'snore', 'purr', 'hop']`

Cut vs. §9's full list: `wriggle` (bug tell), `plink` (bug→jar), `chime_gold`
(golden seed) — all M2, per Amendment 1. `'bighop'` reactions reuse the
`'hop'` cue; `juice.hop(obj, height)` (P3) is what makes the *motion*
bigger, not a separate sound.

---

## 5 · `window.__gw` test hook (`src/game/testhook.js`)

Active only when the URL has `?test=1`. Shape:

```ts
window.__gw = {
  ready: boolean,
  state(): State,
  ledger(): Ledger,
  view(): { dragging: boolean, hover: 'ok' | 'no' | null },
  tiles(): Array<{ x: number, y: number, w: number, h: number, terrain: Terrain, occupied: boolean }>,
  orbPos(): { x: number, y: number } | null,
  at(name: string): { x: number, y: number } | null,
}
```

All coordinates are **viewport CSS px, DPR-correct** (`testhook.js`
exports `toViewport(scene, x, y)` for this — it reads the canvas's
`getBoundingClientRect()` and canvas-space→CSS-space scale factor).

`testhook.js` owns the on/off switch and the shape; it does **not** know
how to compute any value itself. A scene wires it up by implementing
whichever of these optional methods it has data for, then calling
`installTestHook(this)` once from `create()`:

```ts
scene.getState?(): State
scene.getLedger?(): Ledger
scene.getView?(): { dragging, hover }
scene.getTiles?(): Tile[]
scene.getOrbPos?(): { x, y } | null
scene.getAt?(name: string): { x, y } | null
```

Any method a scene doesn't implement falls back to a safe default
(`view()` → `{dragging:false, hover:null}`, `tiles()`/`ledger()` etc. →
`[]`/`null`) so `window.__gw` never throws mid-migration. Call
`markReady()` once the scene's initial render is done.

P0's boot scene (`src/game/bootScene.js`) implements `getState`,
`getLedger`, `getView` (always idle), `getTiles`, and `getAt('lulu')`.
`getOrbPos()` returns `null` in the boot scaffold — no find is ever
offered until P1/P4 land. P4's real gameplay scene should implement the
same methods against its own live state instead of reusing the boot
scene's.

---

## 6 · File ownership recap (who writes the body, not just who reads it)

| File | Owner | Status after P0 |
|---|---|---|
| `src/core/events.js` | P0 | **Final.** |
| `src/core/rng.js` | P0 | **Final**, fully implemented and tested. |
| `src/core/state.js` | P1 | Signatures + shapes frozen; body is a stub. |
| `src/core/finds.js` | P1 | Signatures frozen; body is a stub. |
| `src/core/growth.js` | P1 | Signature frozen; body is a stub. |
| `src/core/ledger.js` | P1 | Signature frozen; body already looks final (generic fold). |
| `src/core/book.js` | P1 | Signature frozen; body is a stub. |
| `src/core/persist.js` | P1 | Signature frozen; body already looks close to final. |
| `src/art/registry.js` | P0 | **Final** (`TEXTURE_KEYS` etc.). |
| `src/art/palette.js`, `pixelmaps.js`, `raster.js` | P2 | Not created by P0. |
| `src/audio/registry.js` | P0 | **Final** (`SFX_CUES`). |
| `src/audio/sfx.js` | P3 | Not created by P0. |
| `src/game/testhook.js` | P0 | **Final** shape; scenes wire their own data in. |
| `src/game/placeholders.js` | P0 | **Final** for M1 (may become dead weight, not a blocker, once P2/P3 land). |
| `src/game/bootScene.js` | P0 | Scaffold only — P5 replaces its *usage* in `main.js` once P4's `src/game/scene.js` lands. Not on P4's file list, so no collision. |
| `src/game/scene.js`, `src/game/objects/*`, `src/game/storage.js` | P4 | Not created by P0. |
| `src/content/lines.json` | P4 | Not created by P0. |

P4 imports **only** through the six `src/core/*` signatures above and the
two registries — never Phaser objects living inside `src/core` (there
aren't any) and never reaches into P1's internals.

---

## 7 · What didn't hold up when built (see also the P0 handback report)

- **§9's "3 stages" vs §11's `stage: 0..3`.** Resolved in favour of the
  frozen `Plant` shape (4 values) — see §2 above.
- **`tile_wet` has no wired mechanic in M1.** Kept because the P0 task's
  explicit cut list for `TEXTURE_KEYS` didn't name it, but flagged since
  it may be dead art for this milestone.
- **`tile_glow_ok`/`tile_glow_no` aren't in §9's inventory** but are
  required by the frozen loop; added rather than left implicit.
