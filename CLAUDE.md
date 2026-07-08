# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Dream of Conquest — The Goblin Warren (V0)**: a single-file, pixel-styled browser village-builder that makes the HELEN OS governance model playable. Three files, no build step, no dependencies beyond the Three.js CDN loaded at runtime. This repo (`origin` = `github.com/JMTassy/goblin-warren`) is the **published V0 canon** of the conquest/personas lineage (byte-identical to the vault copy `HELEN_OBSIDIAN_OS/goblin-conquest.html`). Genealogy of the home-dir files (`C:\Users\jeanm`), twice-witnessed 2026-07-05: `goblin-conquest.html` there is this repo's **diverged newer draft** (agents-based pixel edition, its own harness); `goblin-warren.html` / `goblin-warren-selftest.js` are a **separate multi-map successor game** (accounts + replay-based persistence, its own 12-test harness) — not drafts of this repo. Naming collision warning: the repo is named *goblin-warren* but its content is conquest-lineage V0.

## Commands

```bash
# Run the full test suite (exit code 1 on any assertion failure)
node selftest.js index.html
```

No build, lint, or package.json. The selftest cannot run individual assertions — it's a sequential script that preserves state; run it whole.

To play: open `index.html` in any browser (one-time network access required for Three.js CDN).
- Controls: click mounds · `Q` riddles · `B` claim site · `P` goblin proposal · `A`/`D`/`H` admit/deny/hold · `R` restart
- ZOL (Session Flash Credit) is earned by answering riddles correctly and spent to buy territory
- Win by owning 7 territories or reaching reputation ≥100

## Architecture: the reducer seam

`index.html` is split in two by comment markers, and everything depends on that split:

- **Pure reducer zone** — between `/* ===== REDUCER-BEGIN` and `/* ===== REDUCER-END` markers. All game logic (`makeState`, `startGame`, `answerQuestion`, `buyTerritory`, `createProposal`, `checkProposalWithHAL`, `councilReview`, `admitProposal`, `denyProposal`, `holdProposal`, `checkWin`, `auraWeather`) plus the data consts (`QUESTIONS`, `PERSONAS`, `TERRITORY_DEFS`). **No DOM, no THREE, no browser APIs** may appear here — `selftest.js` extracts this zone with a regex on the markers and runs it headlessly under Node via indirect eval.
- **Render + UI zone** — everything after `REDUCER-END`: Three.js scene, HUD, and the `ui*` glue functions. Every UI action routes through a reducer function; the UI never mutates state `S` directly.

Consequences:
- Do not rename, move, or reformat the `REDUCER-BEGIN`/`REDUCER-END` marker comments — the selftest's regex match is the extraction mechanism.
- `selftest.js` re-exports `QUESTIONS`, `PERSONAS`, `TERRITORY_DEFS` onto `globalThis` by name after eval; renaming those consts breaks the harness.
- Determinism inside the reducer comes from the FNV hash `h32` seeded by state (`S.actions`, names) — no `Math.random`/`Date` in the reducer zone.

### Game state (S object)

Key properties modified by reducer functions:
- `phase` — current game phase (`"START"`, `"GARDEN_MAP"`, `"GAME_WON"`)
- `zol` — current Session Flash Credit balance (integer)
- `knowledge` — how many riddles answered correctly (unlocks territories)
- `cohesion` — starts at 100; wrong answers cost 1 point
- `reputation` — earned from territory admission; win condition is ≥100
- `ownedCount` — number of owned territories; win condition is ≥7
- `territories` — array of 12 sites with state (`"available"`, `"locked"`, `"owned"`) and level (0–5)
- `compost` — GOBLIN's accumulated denied proposals (raises proposal weight)
- `held` — AURA's accumulated held proposals (affects mood via `auraWeather`)
- `pending` — current proposal object being evaluated
- `ledger` — array of event objects (capped at 250)

### Test coverage (29 assertions)

`selftest.js` validates:
- **Boot**: 12 territories, 4 available initially, QCM ≥20 with correct shape
- **Core loop**: `startGame`, `answerQuestion`, `buyTerritory` state mutations and event logging
- **HAL verdicts**: DENY (locked/bypass), HOLD (insufficient ZOL), ACCEPTABLE (lawful)
- **Admission gate**: `admitProposal` refuses non-ACCEPTABLE; only admits evolves territories
- **Persona feedback**: denied proposals feed GOBLIN compost; held feed AURA fog
- **Council mechanics**: 5 seats with forced self-objections; council mutates only ledger
- **Win condition**: 7 territories triggers `GAME_WON`
- **Determinism**: `auraWeather` derived purely from state

## Governance invariants (the point of the game — do not weaken)

The selftest asserts these as law; any change must keep them true:

- **Only player admission mutates the world.** `admitProposal` refuses unless HAL's verdict is `ACCEPTABLE`, and nothing else calls `evolveTerritory`. HAL judges (`ACCEPTABLE`/`HOLD`/`DENY`); it never admits.
- **Council recommends, never admits.** `councilReview` mutates *nothing but the ledger* (the selftest snapshots state around it). Its 5 seats always carry forced self-objections.
- **ZOL is session-only.** No `localStorage`, cookies, backend, or any persistence surface, anywhere in the file.
- **Exact economics.** Buying spends exactly the price; denied proposals feed GOBLIN's `compost` (which raises GOBLIN's proposal weight); held ones feed AURA's `held` fog.
- **Every state change writes a ledger event** via `logEvent` (capped at 250 entries). The selftest checks for specific event kinds (`GAME_STARTED`, `TERRITORY_BOUGHT`, `PROPOSAL_ADMITTED`, `COUNCIL_CONVENED`, …) — keep kinds stable.
- HAL text-denies bypass-shaped proposals (`/bypass|without admission|skip the gate|auto-?admit/i`).

The header comment discipline (`authority=false · claim=NO_CLAIM · non-sovereign`) mirrors the wider HELEN project's receipt convention — keep it in place when editing.

### Key constants

- `TERRITORY_DEFS` — array of [name, startPrice] pairs; 12 territories total with escalating prices (7–20)
- `PORTALS=[9,10,11]` — indices that trigger council review when targeted; part of tested design
- `QUESTIONS` — array of QCM objects with required keys: `question`, `choices`, `correctIndex`, `rewardZOL`, `category`; minimum 20 required; tested on boot
- `PERSONAS` — array of proposal-maker characters (GOBLIN, AURA, RUNT, THRALL, WREN); each carries different proposal themes and self-objections for council seats

### Event ledger structure

Events log all game moves via `logEvent(S, kind, data)`. Each entry has:
- `kind` — event type (`GAME_STARTED`, `QUESTION_ANSWERED_CORRECT`, `QUESTION_ANSWERED_WRONG`, `TERRITORY_BOUGHT`, `PROPOSAL_ADMITTED`, `PROPOSAL_DENIED`, `PROPOSAL_HELD`, `COUNCIL_CONVENED`, `COUNCIL_RECOMMENDED`, `GAME_WON`, `ZOL_EARNED`, `GARDEN_EVOLVED`, `HAL_CHECK_PASSED`)
- `data` — event-specific payload (e.g., territory index, amount, persona name)
- timestamp (implicit from insertion order)

Ledger is capped at 250 entries; oldest entries drop when new ones exceed limit. UI renders recent entries in "THE MIDDEN LEDGER" panel.

## UI and debugging

The Three.js renderer and UI (after `REDUCER-END`) follow a unidirectional pattern:
- UI functions like `uiQCM()`, `uiBuy()`, `uiPropose()` collect user input and call reducer functions
- Reducer always returns `true` (success) or `false` (rejected)
- UI updates the DOM based on new state and rerenders the Three.js scene

To debug game state: open browser console and inspect `window.S` to see current state, ledger, and pending proposal. Print to console is the primary debugging method (no debugger breakpoints work well with the render loop).

To verify a change: always run `node selftest.js index.html` after editing reducer code; if it exits 0, the change is safe. If a test fails, the error message points to which invariant broke.

## Content rules

- **IP-safe rule**: all sprites, names, buildings, and mechanics are original; the pixel look is a *technique* (quarter-resolution render + nearest-neighbor upscale via `PIX=4` and `image-rendering: pixelated`), not borrowed art. Do not introduce third-party game content.
- QCM questions must keep the spec shape (`question`/`choices`/`correctIndex`/`rewardZOL`/`category`) and count ≥ 20 — both are asserted.
- Win condition is 7 warrens or reputation ≥ 100; the 12 territory sites and 3 portal indices (`PORTALS=[9,10,11]`, which trigger council) are part of the tested design.

## Authorship

JM Tassy is the sole author. Do **not** add `Co-Authored-By:` lines for any AI model on commits.

## GardenGrowth bead adaptation (CHIDDUSH reading)

The "GardenGrowth" module (see HERMENEUTIC_INSPECTOR_CANDIDATE.js) assumes a spatial `GardenGrowth.traces` substrate that does not exist on disk. Instead, the event log + `replayEvents()` in this project already provides the mechanism:

- Per-account `events` array = tradition / trace.
- `replayEvents()` = rereading the traces.
- `admit` / `deny` / `hold` are first-class counters and events.
- AURA mood, held fog, etc. are already derived views over the log.
- Reflection / annotation tags can be added as `{k: "tag", ...}` events (replay-safe, cannot mutate ZOL or admit).

Re-target the bead at the existing ledger instead of building a new host. In V0 law (no persistence surfaces), keep localStorage fenced. In full goblin-warren.html law, tags enter through the replay door.

This inverts the dependency: the Warren's log *is* the readable second brain substrate. No new spatial system needed first.
