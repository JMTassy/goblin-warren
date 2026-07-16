# experiments/ — non-canon successor-oriented work

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign. -->

**This directory is not part of the V0 canon.** The repo's actual game is the
root `index.html` + `selftest.js` (see the top-level `CLAUDE.md`): a single
file, byte-identical to the vault copy, no build step, no dependencies beyond
the Three.js CDN. Nothing in `experiments/` is wired into it, imported by it,
or required by `node selftest.js index.html` — that suite still passes
29/29 with this directory present.

Everything here targets the **separate multi-map successor Warren app**
(the one CLAUDE.md's genealogy section warns is not a draft of this repo,
and that currently lives on the operator's machine). These are deliverables
built during pairing sessions, fenced here so they're version-controlled and
reachable, until the operator folds each into that app directly.

## The product spine (read this before the folders below)

**The Warren is an adoption + AI-literacy curriculum, not a fire-making
game.** The player adopts one Goblin companion (**Bram**) and learns —
through play, before any formal vocabulary — the intuitions of working
with artificial agents: observe → communicate → delegate → verify →
correct → coordinate → govern, across a Level 0→12 spine. The fire is the
first **shared task** after adoption (a bonding exercise), not the
premise. A second companion, **Lulu**, is introduced only at Level 7
(discovery/novelty) once Bram is bonded, so the player learns
specialization by meeting a second Goblin with a different role, not by
meeting everyone at once. See `warren-design/AI_LEARNING_SPINE.md` for the
full spine and `warren-design/ADOPTION_LOOP_ASSET_SPEC.md` for the
intimate asset list the opening loop actually needs.

## What's in here

### `npc-preview/`
A decoupled local AI-NPC gateway: **Bram** (opening loop) plus **Lulu**
(Level-7 second companion) and a **Zaz** debug/engineering voice, all
voiced by a configurable model adapter (Ollama-compatible `/api/chat` by
default — no model name hard-coded). Enforces the boundary **the model
narrates, the engine decides**: responses are constrained to `{speech,
emotion, gesture, memory_candidate, curiosity}` via a strict schema
validator; nothing from the model can mutate progression, inventory, or
save state. Three isolated gates (Gate 0 connectivity → Gate 1 Bram
continuity → Gate 2 differentiation), a tiny emotional memory with an
existence-gated `promoteCandidate()`, and provenance (`model` /
`curated_fallback` / `memory_derived`) on every rendered line.

Run: `node experiments/npc-preview/test/npc-selftest.js` (15/15, no live
model needed — uses a mock adapter). Open `bram-preview.html` /
`zaz-lab.html` in a browser; point them at a local Ollama-compatible
endpoint to go live. See `npc-preview/README.md` for setup, the Phase 0→6
rollout order, and the 4-question / 3-of-4 acceptance benchmark.

### `warren-design/` + `first-fire-v2*.html`
A design-token system (`tokens.css`) extracted to fix a real visual
incoherence: an earlier fire-making intro mixed crisp DOM chrome with a
separate low-res pixel canvas as if they were two different games. `tokens.css`
is now the single source for both DOM and canvas color/type/spacing;
`SPRITE_SPEC.md` names the canonical Bram representation; `scene-grammar.md`
defines how any zone composes (background / glyph-object / character / HUD
layers, all reading from the tokens). `first-fire-v2.html` re-skins the
"scratch stones ~20s → digital fire ignites → scene grades cold→warm →
Bram remembers" mechanic to that system (engine unchanged from the original
build); `first-fire-v2-standalone.html` is the same thing with `tokens.css`
inlined, for a true single-file drop-in. This is Bram's opening-loop
appearance only — Lulu is not part of this scene.

`COHERENCE_AUDIT.md` is a checklist to run this system against the actual
successor-app crib — it still needs a real screenshot/computed CSS from
that app to lock the token values to the true target rather than this
reconstruction.

`AI_LEARNING_SPINE.md` is the canonical Level 0→12 curriculum (player
fantasy / game mechanic / AI-learning-objective triad per level), restoring
the adoption-and-AI spine after the design pass drifted toward treating the
fire as the game's premise rather than its first shared task.

`ADOPTION_LOOP_ASSET_SPEC.md` is the intimate, adoption-scoped asset list
(Bram's states, the fire's states, the lantern, MARK-trace intensities,
interaction icons, path states) — deliberately smaller and less systemic
than the specializations sheet below; the two must not be merged.

`SPECIALIZATIONS_RESOURCES_STRUCTURES.md` reclassifies a separate, more
systemic concept sheet (specialized Goblins, infrastructure, resources)
that belongs to Levels 4-7 of the spine, not the opening loop.

### `epoch3/`
A pure, dependency-free typed-relation epistemic kernel (no DOM, no game
ties) — `witness/report/hypothesis/decision → claim` relations validated
against an explicit signature table, with a no-repair rule (ill-typed edges
are rejected, never coerced) and a proof path built only from accepted
`SUPPORTS` edges. General-purpose reasoning-integrity tooling, not specific
to any Warren app.

Run: `node experiments/epoch3/epoch3.test.js` (16/16, matches the EPOCH-3
adversarial spec test verbatim).

## Law

- Nothing here reads or writes `localStorage`/cookies/a backend.
- Nothing here is wired into `index.html`'s reducer or ledger.
- `node selftest.js index.html` (repo root) must keep passing untouched —
  verify after any change here.
