# Engine notes — Phaser 4.2.1

These are vendored copies of the Phaser 4 agent-skill docs shipped inside
`node_modules/phaser/skills/*/SKILL.md` (pinned to `phaser@4.2.1`). They are
copied here so P1-P4 read **Phaser 4 facts**, not Phaser 3 muscle memory —
the two APIs diverge (Scale Manager, input pipeline, some renderer internals).

Read `v3-to-v4-migration/` first if you have Phaser 3 habits.

| Folder | Use it for |
|---|---|
| `scale-and-responsive/` | ScaleManager, RESIZE mode, `pixelArt`, zoom. This is how `src/main.js` gets 1 game px = 1 CSS px. |
| `input-keyboard-mouse-touch/` | Pointer/touch, `setDraggable`, `dragstart`/`drag`/`dragend`, drop zones, drag thresholds. P4 needs this for the carry-and-drop gesture. |
| `tweens/` | Tween API for squash-stretch, hops, spring-back. P3's `juice.js` is built on this. |
| `graphics-and-shapes/` | `Graphics` + `generateTexture()` — how `placeholders.js` bakes rectangle textures, and how P2's real pixel maps become textures via `raster.js`'s `{w,h,rgba}` output. |
| `sprites-and-images/` | Sprite/Image game objects, frames, texture keys — the consumer side of `TEXTURE_KEYS`. |
| `scenes/` | Scene lifecycle (`init/preload/create/update`), scene data, multi-scene patterns (P3's `?scene=lab` harness). |
| `animations/` | Frame animations, if any species/Lulu state needs more than a tween. |
| `audio-and-sound/` | Phaser's sound manager — P3's `sfx.js` uses raw WebAudio (per §9, "no files"), but this documents how Phaser would wire it if that changes. |
| `events-system/` | EventEmitter patterns used throughout Phaser (scale resize, input, etc). |
| `time-and-timers/` | `this.time.delayedCall`, `time.addEvent` — used for "sleep after 6 finds", idle wander pacing. |
| `v4-new-features/` | What is new vs v3, so you don't miss a v4-only capability. |
| `v3-to-v4-migration/` | Renamed/removed APIs, the biggest gotchas. Read this even if you think you already know Phaser. |

Source of truth is always `node_modules/phaser/skills/*/SKILL.md` for the
exact pinned version (`4.2.1`) — re-copy here if that ever changes.
