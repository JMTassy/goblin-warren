# RECEIPT_M1 — P5 integration

authority=false · claim=NO_CLAIM · non-sovereign. P5 fixes seams onto P0–P4;
it adds no gameplay feature. This is the record the Mayor re-runs against.

## Commit

`2ec2d4d16cfd68aacbbf112d4c4f48609ff94ca6` on branch `v2`, parent
`3c7225c7dc0382c213b7257dcba2a2f168f798ce` ("Mayor: admit P4; remove dead
bootScene.js"). `git log -1` from the repo root confirms it.

## Tests

All commands run from the repo root exactly as `make test` / `scripts/deploy.sh`
run them: `npx vitest run` then `npx playwright test`.

### `npx vitest run` — 312 assertions, 12 files, all green

| file | tests |
|---|---:|
| `test/core/art.test.js` | 147 |
| `test/core/book.test.js` | 7 |
| `test/core/determinism.test.js` | 5 |
| `test/core/envelopes.test.js` | 43 |
| `test/core/finds.test.js` | 20 |
| `test/core/fuzz.test.js` | 1 (a seeded 5,000-event fuzz run) |
| `test/core/growth.test.js` | 13 |
| `test/core/mood.test.js` | 8 |
| `test/core/persist.test.js` | 14 |
| `test/core/purity.test.js` | 14 |
| `test/core/rng.test.js` | 14 |
| `test/core/state.test.js` | 26 |
| **total** | **312** |

### `npx playwright test` — 6 specs × 2 devices = 12, all green

| spec | iPhone 15 | iPhone SE (3rd gen) |
|---|---|---|
| `boot.spec.js` (2 tests) | ✓ | ✓ |
| `juice.spec.js` (2 tests) | ✓ | ✓ |
| `loop.spec.js` (1 test, day 1's full script) | ✓ | ✓ |
| `day2.spec.js` (1 test, new this pass) | ✓ | ✓ |

Re-run 3× in a row (`loop.spec.js` alone, then the full suite twice) with
zero flakes after the stale-Lulu-position fix below. `npm test` (the
package's own script: `vitest run && playwright test`) is green end to end.

## Build

`npm run build` (`vite build`, `base: '/goblin-warren/'`):

```
dist/index.html                    0.71 kB │ gzip:   0.42 kB
dist/assets/index-DEGj4PXg.js  1,408.31 kB │ gzip: 369.46 kB
```

Total `dist/` on disk: 1.4 MB. `scripts/deploy.sh` ran clean end to end
(install → test → build → `touch dist/.nojekyll`) and pushed nothing —
`dist/` and `test-results/` stay gitignored; `git status` is clean after
this pass's commit.

## Screenshots (`docs/m1/`)

- **`day1-start.png`** — boot: the ground, Lulu and the compost heap as
  one centred composition, no more dead space filling the bottom of the
  phone.
- **`day1-drag.png`** — a find mid-drag over a legal soil tile (green
  glow), Lulu's line sitting clear above her head with no overlap.
- **`day1-planted.png`** — the first sprout, now unmistakably sized on its
  72 px tile, with Lulu's "yes, good spot." reply.
- **`day1-asleep.png`** — six finds offered, Lulu asleep, "...zzz..."
  sitting above the still-held find instead of drawn through it.
- **`day2-morning.png`** — the morning after: two grown glowcaps, one
  fresh lanternmoss (from a glowcap+mosscap pair), the wilted pond mosscap
  gone and composted.
- **`day2-book.png`** — Pip's Book open, listing `mosscap + glowcap ->
  lanternmoss` the day it first fired.

## What changed this pass

1. **Stage-0 plants were a speck (Mayor's defect 1).**
   `src/art/pixelmaps.js`: every plant builder (`mosscap`, `glowcap`,
   `reedling`, `lanternmoss`, `mirrorbloom`) redrawn so stage 0 already
   reads as a clear sprout (≥~40% of the tile's raw 24 px height) and
   stage 0 < 1 < 2 < 3 keeps growing strictly through stage 3. `mosscap`
   is now a mound of round lobes (not one stretched blob); `glowcap` and
   `lanternmoss` share a `stemH`/`capR` table; `reedling` is taller
   multi-blade clusters. `test/core/art.test.js` (unchanged) still passes,
   and `docs/art-sheet.png` was regenerated via `node scripts/art-sheet.mjs`.

2. **Lulu's line overlapped the held find (Mayor's defect 2).**
   `src/game/scene.js`: the line bubble and the held-find orb both
   anchored to the exact same point above Lulu's head. Added
   `findHomeY()`/`bubbleY()` — the bubble now sits a full orb-height plus
   an 8px gap higher than the orb — and every `bubble.say(...)` call site
   (`offer`, `pet`/`sleep`, `sleep`, `wake`, `hop`/`bighop`/`shrug`) was
   switched to `bubbleY()`. The orb's own spawn point is unchanged.

3. **The bottom ~40% of the screen was empty (Mayor's defect 3).**
   `src/game/scene.js`'s `computeLayout()`: ground + Lulu + compost are
   now treated as one composition block and centred in the space below
   the top bar (a fixed top/bottom margin, split slack), instead of the
   ground being pinned near the top with Lulu just under it and nothing
   claiming the rest of the phone. Still clamped so the block never has
   to shrink to fit an iPhone SE screen (verified: `computeLayout` never
   returns negative slack at 375×667).

4. **Day 2, proved through the real path.** New
   `test/e2e/day2.spec.js`: seeds `localStorage` with a day-1 ledger built
   by replaying the *real* `apply()`/`makeState()` (not a mock) for a seed
   found by brute-force search so its day-1 draws include the needed
   species, freezes `Date.now()` with `page.clock.setFixedTime()`, then
   advances the clock one day and dispatches a real
   `document.dispatchEvent(new Event('visibilitychange'))` — the same
   listener `src/game/scene.js` already has — so the game itself is what
   calls `dispatchVisit(Date.now())` and fires the day rollover. No hook
   was added to the scene or the test-hook contract. Asserts: a
   day-1-planted glowcap is asleep day 1 and awake (stage 1) day 2; a
   mosscap wilted on the pond is composted and its tile clears; an
   adjacent glowcap+mosscap pair becomes `lanternmoss`; Lulu's energy is
   back to 6 and she's awake; `book(ledger)` (the real, pure function,
   read against the live ledger) lists the recipe.

5. **`iPhone SE (3rd gen)` added as a second Playwright project**
   (`playwright.config.js`), same Chromium-executable override as
   `iPhone 15`. Every e2e spec now runs on both.

6. **Two pre-existing seams, found while making the suite green on two
   devices, fixed (not new features):**
   - `test/e2e/boot.spec.js` asserted `canvasWidth >= 380`, a constant
     sized for `iPhone 15`'s 393px viewport; on `iPhone SE (3rd gen)`'s
     375px viewport the (correctly full-width) canvas failed it. Now
     compares against the page's own `window.innerWidth`.
   - `test/e2e/loop.spec.js` cached Lulu's on-screen position once and
     reused it for every later tap; a `'bighop'` reaction (whenever the
     random first find is `glowcap`) calls `lulu.settleToward()`, which
     nudges her a few px toward the planted tile, occasionally moving her
     out from under the next tap and failing the test (~1 run in 3-4).
     Now re-fetched via `at('lulu')` before each tap. Confirmed with 5
     consecutive clean runs after the fix (it reproduced within 4 runs
     before).

## How to play it (for the operator)

1. `cd goblin-warren && npm ci`
2. `npm run build && npx vite preview` (or open `dist/index.html` after a
   static server, since it's built for the `/goblin-warren/` base path) —
   or just `npm run dev` for a local dev server.
3. Open it on an iPhone in Safari (or Chrome DevTools' iPhone device
   emulation) at a portrait phone width. Tap Lulu's ears to get a find,
   drag it onto the ground — green glow means it can land there, red means
   it can't. Six finds a day, then she sleeps; tap-and-hold to pet her.
   Come back a real day later (or just leave the tab and return
   tomorrow) — sleepers wake, wilted plants compost, and an adjacent
   glowcap next to a mosscap or reedling becomes something new. Tap
   "book" any time to see what's been discovered.
4. Play two real days in a row and see whether coming back the second
   time is its own small payoff — that's the thing this milestone is
   supposed to prove.

## Publishing (operator's step — not done here)

TODO (Mayor): fill in the actual publish instructions/URL once Pages is
enabled — `scripts/deploy.sh` builds and tests `dist/` but deliberately
never pushes (MAYOR_RULING_V2.md Amendment 4). `dist/` from this pass's
`scripts/deploy.sh` run is on disk, gitignored, ready for
`npx --yes gh-pages -d dist --dotfiles` or an equivalent manual push to
`gh-pages` once the operator says go.
