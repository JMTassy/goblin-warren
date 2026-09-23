# Mayor's ruling on VISION_V2.md

authority=false · claim=NO_CLAIM · the Mayor proposes scope; only the operator admits.
Proposer: HER_FABLE. Validator: the Mayor (proposer ≠ validator). VISION_V2.md is kept
exactly as written; amendments live here.

## Verdict: ADMIT WITH AMENDMENTS

Kept as written: the diagnosis (§2), the story carried forward and the cuts (§3), the core
loop as the Crossing Law with legality-only lantern (§4), the divergences (§6), the pure
core with state = replay(ledger) (§8), pixel maps in code and synthesized audio (§9).

## Amendment 1: M1 must obey §2's root cause 3

§2 finds that every version failed because "systems were added instead of one loop being
finished" (W1: "everything comes at once"). §10's M1 still ships about ten systems. M1 is
cut to the loop plus the payoff of coming back the next day, and nothing else.

**M1 keeps:** Lulu · 4×4 ground from the seed (soil / rock / pond) · three species with
their terrain rules (mosscap, glowcap sleeps a night, reedling) · two adjacency recipes ·
Lulu's one like and one dislike · legality glow while dragging, spring-back on illegal ·
compost as a plain drop target, the "not this one" answer (a counter, nothing more) ·
six finds a day, then Lulu sleeps · pet (juice only) · real-day growth, sleepers wake,
wilts fall to compost, recipes fire · the Book page, derived by `book(ledger)` (this is the
"learnable" condition: surprise first, mastery fifth) · localStorage ledger · synth
sound and juice · idle wander.

**Moved to M2, after the operator admits M1:** bugs, the wriggle tell, the jar and
fireflies · compost filling into a golden seed · the Cave of Echoes · the replay strip UI.
Replay stays in M1 as *architecture* (state = replay(ledger), proven by tests), not as a
screen.

Ripple: P1 drops the bug, jar, firefly, golden and cave rules; P2 drops the bug, jar and cave
maps; P4 drops the swipe-to-cave and strip; the EVENT enum drops `'cave'` as a drop
target. `FIND_DROPPED.target` is `'tile' | 'compost'`.

## Amendment 2: the core API is frozen by P0, not just its types

P4 calls `apply`, `legal`, `replay`, `book` and `parse` while P1 writes them in parallel.
P0 therefore creates `src/core/{state,finds,growth,ledger,book,persist}.js` with the
final exported signatures and trivial stub bodies, and documents them in
`docs/INTERFACES.md`. Once P0 lands, those files belong to P1 alone. P4 imports only
through those signatures.

## Amendment 3: the engine comes from the bake-off, not the argument

§7's Phaser pick is recorded as the proposer's argument. P0 starts only after the bake-off
names the engine. Result so far (Mayor's own reruns): Phaser 4 passes with 0 frames over
33 ms under 4× CPU throttle, 358 KB gzip JS, 365 source lines. The no-framework baseline
passes at 3 KB but runs at ~30 fps under the same throttle (158 of 191 frames over 33 ms),
because hand-written Canvas redraws gradients and blur every frame. Four contestants are
still running.

## Amendment 4: deploy is the operator's hand

Pushing a Pages branch is a public surface; the harness gates it and chat approval does not
lift the gate. P5 builds and verifies; publishing is the operator's step (Settings → Pages),
and its instructions ship in RECEIPT_M1.md. A deploy counts only when the operator's Safari
shows the ground (§8 already says so).

## Amendment 5: attribution

This repo's CLAUDE.md: JM Tassy is the sole author; no `Co-Authored-By:` lines on commits.
All V2 builders follow it. (v1 commit 29d95a5 carries one in error; left in place,
because pushed history is not rewritten.)

## Engine decision: Phaser 4.2.1 (bake-off, final)

Six contestants built the same gesture (bakeoff/SPEC.md); one harness, run by the Mayor:
iPhone 13 viewport, real CDP touch drags, 4× CPU throttle, 3 runs per cell. All 36 runs
passed every correctness check. "Slow" = frames over 33 ms during a 1 s drag.

| entry | gzip JS | source lines | slow @ 1× density | slow @ 3× (iPhone) |
|---|---|---|---|---|
| **Phaser 4.2.1** | 350 KB | 365 | 0% | 0% |
| LittleJS 1.19.3 | 19 KB | 294 | 6% | 5% |
| no framework | 3 KB | 596 | 0% | 79% |
| Excalibur 0.32 | 123 KB | 592 | 0% | 100% |
| PixiJS 8.21 | 147 KB | 402 | 66% | 100% |
| Kaplay 3001.0.19 | 69 KB | 321 | 84% | 80% |

The last three were measured while P0 was installing, so they read slightly pessimistic;
the ranking does not depend on it. Phaser is the only entry with no slow frames at either
density; its screenshots were correct; its builder hit no v3→v4 trap because the package
ships its own v4 docs. LittleJS was the close second on speed at a fraction of the weight,
but its builder drew the hover glow off the tile. The harness checked state, not pixels;
only the screenshot caught it. Lesson carried into V2: the Mayor reads screenshots, not
just the hook.

The harness originally didn't pin render density, which confounded the first frame
numbers. The Mayor's early diagnosis that the no-framework entry was slow because of
per-frame gradients was wrong; it was rendering at 3× density. Retracted.

## P0 review: ADMIT

Re-run by the Mayor from a clean install: build 360 KB gzip, 25 unit tests, 2 iPhone boot
tests, purity clean, tree clean. P0's six flags: stage 0..3, glow keys, the Playwright
1.56.1 pin, Chromium-for-iPhone-15, and bootScene.js are all accepted. `tile_wet` is cut
(dead art in M1). Standing risk: every automated test runs Chromium, while the operator
plays on Safari (WebKit). The operator's playtest is the only WebKit test until a WebKit
browser is available here.
