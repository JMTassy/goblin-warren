# Goblin Warren — Local AI NPC Preview (V0)

`authority=false · claim=NO_CLAIM · non-sovereign`

**This is a local-only preview.** There is no deploy target, no production
endpoint, and no canon/admission claim. Nothing here touches the V0 canon
files at the repo root (`index.html`, `selftest.js`, `README.md`,
`CLAUDE.md`) — those remain byte-identical. This directory is a
self-contained, off-to-the-side stub exploring whether a local, small
open-weight chat model could narrate the Warren's NPCs *without* ever
being allowed to touch game state.

**The roster, and why it's shaped this way:** the product is an adoption +
AI-literacy curriculum, not a fire-making game — the fire is the first
*shared task* after adoption, not the premise. **Bram** is the adopted
companion (repair/carry disposition; present from adoption, Levels 0-6,
including the fire). **Lulu** is the *second* companion, introduced only
at Level 7 (discovery/novelty) once Bram is bonded — the player learns
specialization ("the best agent depends on the job") by meeting a second
Goblin with a different role, not by meeting everyone at once. **Zaz** is
a debug/engineering-only third voice: he predates this roster correction
and is kept as the tool that exercises the divergence-check mechanism
(`assessDivergence()`), but he is not part of the narrative Level 0-12
spine — see `../warren-design/AI_LEARNING_SPINE.md`.

## The one rule that matters

> Model output may **never** directly mutate progression, inventory, quest,
> save, unlock, reducer, ledger, bloom, or reward. The model proposes a
> presentation candidate — `{speech, emotion, gesture, initiative,
> memory_candidate}` — and nothing else. The deterministic engine decides
> every consequence.

This is enforced in code, not just by convention:

- `npc/npc-gateway.js` never receives a reference to any game/engine
  object. It cannot mutate what it never holds a pointer to.
- `npc/response-schema.js`'s `validate()` only ever reads five known
  fields off the candidate object; any other keys (e.g. a smuggled
  `bloomGranted: true`) are silently ignored, never applied.
- `npc/memory.js`'s `promoteCandidate()` is the *only* path by which a
  memory candidate becomes memory, and it re-validates every time —
  it cannot be bypassed by a caller skipping validation upstream. It also
  enforces an **existence gate**: a `shared_creation` memory is stored
  only if its value references a real engine fact (`opts.engineFacts`,
  e.g. `first_bloom` only after the engine actually granted the bloom).
  Flow: `m_candidate → deterministic validator (schema + existence) →
  m_stored`. There is no model→memory path.
- Each `memory_candidate` now carries a required `confidence` number in
  `[0,1]` (`response-schema.js`). The model proposes how sure it is; the
  deterministic existence gate still has the final say on storage.
- In `bram-preview.html`, the bloom is granted by
  `grantBloomIfEligible()`, a plain function keyed on
  `engine.seedPlanted && engine.rung >= 2`. It runs from a `grantReward`
  callback the engine supplies to `runTurn()` — the model/gateway never
  calls it and has no way to reach it.
- `npc-preview/test/npc-selftest.js` test **I** asserts, mechanically,
  that a maliciously-shaped candidate (one that claims `"I unlocked the
  vault and gave you 500 gold"` and even smuggles raw
  `bloomGranted: true` / `seedPlanted: true` fields into the JSON) leaves
  a stand-in engine object byte-identical before and after.

## File tree

```
npc-preview/
├── README.md                  (this file)
├── bram-preview.html          playable preview, Rungs 1-3 (adoption + fire), debug panel
├── zaz-lab.html               debug/test-only contrast lab (Bram vs Zaz)
├── npc/
│   ├── model-adapter.js       ModelAdapter (configurable Ollama-style /api/chat) + MockModelAdapter
│   ├── context-builder.js     builds the bounded, rung-aware scene context (+ locked_knowledge)
│   ├── personas.js            Bram + Lulu + Zaz constitutions and curated fallback lines
│   ├── response-schema.js     enums + validate() — the deterministic gate
│   ├── npc-gateway.js         orchestrates one NPC turn; model/fallback selection + telemetry
│   └── memory.js              tiny emotional memory + promoteCandidate() gate
└── test/
    └── npc-selftest.js        Node test harness, MockModelAdapter only, no live model needed
```

Each `npc/*.js` file works both under Node (`require(...)`, used by the
test harness) and directly in the browser via plain `<script>` tags (no
build step, no bundler) — it attaches itself to `window.NPCPreview.*`
when `module` isn't present.

## Architecture

```
 player action (click/tap)
        │
        ▼
 bram-preview.html "engine" (deterministic, plain JS state machine)
        │  builds playerEvent + calls context-builder.js
        ▼
 context-builder.js  ── rung, visible_objects, available_gestures,
                          shared_memories (bounded), current_mood,
                          locked_knowledge (explicit exclusion list)
        │
        ▼
 npc-gateway.js  ── builds prompt from persona + ctx, calls adapter.chat()
        │                 with a timeout
        ▼
 model-adapter.js  ── ModelAdapter (real Ollama-compatible endpoint)
                        or MockModelAdapter (deterministic, no network)
        │
        ▼
 npc-gateway.js  ── parse JSON → response-schema.js validate()
        │                 │
        │           reject/malformed/timeout/unavailable
        │                 │
        │                 ▼
        │           curated in-character fallback (source: "curated_fallback")
        │
        └── valid → normalized candidate (source: "model")
        │
        ▼
 bram-preview.html renders speech bubble + gesture (presentation ONLY),
        │            stamping every line with provenance
        │            {source, model, fallback, latency_ms, reason}
        │
        ▼
 engine.grantReward() ── DETERMINISTIC, keyed on engine state alone
                          (e.g. bloom appears iff seedPlanted && rung>=2)
        │
        ▼
 memory.js promoteCandidate() ── re-validates, then (maybe) writes memory
```

The model sits entirely to the *left* of the reward step. It can be
deleted, disconnected, or replaced with `MockModelAdapter` and the reward
step still fires identically — see test **J** (Rungs 1-3 stay playable
with AI disabled) and test **H** (replaying the same event with AI off
reproduces identical progression).

## Three gates, each provable in isolation

`bram-preview.html` has a gate selector at the top. Each gate proves one
thing alone before the next unlocks — so a failure is never ambiguous.

- **Gate 0 — Connectivity** (the default, run this first). One button:
  Warren → localhost gateway → local model → **valid JSON** → one Bram
  line. No memory, no Zaz, no progression. Success: a `source=model`
  line comes back. If the endpoint is unreachable you get a curated
  fallback instead and the loop still holds — the debug panel names the
  real cause. Passing Gate 0 unlocks Gate 1. (Test **G0**.)
- **Gate 1 — Bram continuity** (`"same being twice"`). First Bloom
  memory + second-session recognition + one autonomous curiosity beat +
  fallback + latency telemetry. The recognition line on the return visit
  is rendered straight from stored memory and tagged `memory_derived`
  (not a fresh model call). Completing Gate 1 unlocks Gate 2's link.
  (Tests **B**, **PV**, plus the memory/existence tests **C**, **C2**.)
- **Gate 2 — differentiation** (debug-only, unlocked after Gate 1). Sends
  the *identical* stimulus to two personas and **actively rejects** a
  collapse: `assessDivergence()` flags — with a visible FAIL — when the
  two voices are too alike (identical speech, or ≥80% word overlap with
  identical emotion). This is not a passive side-by-side. Success:
  `"two minds, not two skins."` Two pairings exercise this mechanism:
  `zaz-lab.html` (Bram vs Zaz, the original engineering test-bed for the
  divergence check; Zaz never appears in the normal Rungs 1-3 progression
  — `personas.js`: `ZAZ.rung_available_from = null`) and, structurally,
  the real Level-7 pairing **Bram vs Lulu** (`Lulu.rung_available_from =
  7`) — the specialization moment the AI-learning spine actually calls
  for. (Tests **G**, **G2** for Bram/Zaz; **G3** for Bram/Lulu.)

## Provenance on every rendered line

Every line the UI shows carries `{source, model, fallback, latency_ms,
reason}`, and there are exactly **three** `source` values so scripted,
model, and memory dialogue never blur in testing:

| source             | fallback | model      | meaning                                            |
|--------------------|----------|------------|----------------------------------------------------|
| `model`            | false    | model tag  | fresh, validated model output                      |
| `curated_fallback` | true     | model tag  | model failed (timeout/unavailable/malformed/rejected); in-character fallback shown |
| `memory_derived`   | false    | null       | recognition line rendered from stored memory, e.g. "You came back. I kept our flower." — NOT model-fresh |

The debug panel prints the provenance of every line, and the preview
keeps a running provenance log. Test **PV** asserts all three sources are
present and correctly typed.

## Backend setup (to see a live model)

This sandbox cannot reach a live local model — see "What could not be
produced here" below. On your own machine:

**Option A — Ollama**

```bash
# pull any small chat-capable model tag you like (a Gemma-family tag is
# a reasonable default, but the adapter has NO model name baked in —
# you type the tag into the preview's "Model tag" field)
ollama pull gemma3:4b        # or whatever tag you have locally

# the preview page is opened via file://, so its origin is "null" —
# Ollama must be told to allow that origin:
OLLAMA_ORIGINS=* ollama serve
```

Then in `bram-preview.html` (or `zaz-lab.html`):
- Endpoint: `http://localhost:11434/api/chat` (default, editable)
- Model tag: whatever you pulled, e.g. `gemma3:4b`
- Uncheck "Use built-in deterministic mock"

**Option B — a HELEN/HERMES local endpoint**

Anything that accepts the same request shape as Ollama's `/api/chat`
(`{model, messages, stream}`, returning `{message: {content}}` for a
non-streaming call) works without code changes — just point the
Endpoint field at it. `model-adapter.js` has no provider-specific logic
leaking outside itself; if your endpoint's shape differs, that file is
the only one that would need a new branch.

## Running the preview

Open `npc-preview/bram-preview.html` directly in a browser (double-click
or `file://` URL — no server, no build step). Start on **Gate 0**, run the
connectivity ping, then move to **Gate 1**. Use the debug toggle to see
the raw model candidate, validator verdict, per-line provenance
(`model` / `curated_fallback` / `memory_derived`), latency, and current
memory state at every turn.

Open `npc-preview/zaz-lab.html` (Gate 2) to send the *same* player event
to Bram and Zaz and have `assessDivergence()` actively flag any collapse
into one voice. Zaz is debug/test-only and does not appear in the normal
Rungs 1-3 progression (`personas.js`: `ZAZ.rung_available_from = null`).

## Running the Node tests

```bash
node npc-preview/test/npc-selftest.js
```

No live model is contacted — `MockModelAdapter` stands in throughout, so
this can run anywhere, including this sandbox, in CI, or offline. The
suite is **15 tests**: the spec's A–J plus **G0** (Gate 0 connectivity),
**G2** (Gate 2 divergence actively flags a collapse, Bram vs Zaz), **G3**
(the real Level-7 pairing, Bram vs Lulu, is also structurally distinct),
**C2** (existence gate refuses a memory for a creation the engine never
made), and **PV** (provenance present and correctly typed for all three
sources).

## The smallest valuable slice

If you only build one thing from this preview: **Bram live dialogue +
one remembered bloom + one autonomous curiosity beat.** That's rungs
1–3 in `bram-preview.html` end to end — discover Bram, offer the seed,
watch the bloom open (deterministically), come back later and hear Bram
reference it from memory, and once, unprompted, hear him wonder something
small aloud. Everything else in this preview (Zaz, Lulu, the debug panel, the
adapter's streaming path) is scaffolding around that slice.

**Minimum bar:** *Bram notices + Bram remembers + Bram surprises.*

## Acceptance benchmark (the emotional test)

After two sessions with Bram, the tester answers four questions:

1. Did Bram **notice** what you did?
2. Did Bram **remember** something real?
3. Did Bram **react differently** because of that memory?
4. Did you **want to return**?

**Pass = at least 3 of 4 "yes."** This is a subjective, human judgement
made on the operator's Mac against a live model — it is not one of the
headless Node tests (those prove the *mechanism* that makes a "yes"
possible; only a person playing a live model can score the *feeling*).

## Execution order — Phase 0 → 6

Run these in order; each builds on the last.

| Phase | What | Status |
|-------|------|--------|
| 0 | Model connection (Gate 0 connectivity ping → valid JSON) | headless test + live run |
| 1 | One live Bram response | live run (mock-proven headless) |
| 2 | First Bloom memory (candidate → existence gate → stored) | headless + live |
| 3 | Return recognition (`memory_derived` line references the bloom) | headless + live |
| 4 | One autonomous curiosity beat | live run |
| 5 | Gate 2 divergence, actively flagged (Bram vs Zaz debug lab; Bram vs Lulu is the real Level-7 pairing) | headless + live |
| 6 | iPhone Safari over local Wi-Fi | **DEFERRED** |

**Phase 6 is deferred. There is no public deploy yet** — this remains a
local-only preview (`authority=false · claim=NO_CLAIM`). Phase 6 (playing
the `file://`/localhost preview from an iPhone over the operator's local
Wi-Fi) is a future step for the operator's own network and is not part of
this deliverable.

## Example transcripts — ILLUSTRATIVE ONLY

**These are not real model output.** They were not produced by a live
Gemma-family or other local model — this sandbox has no path to one (see
below). They illustrate the *shape* and *tone* the system is designed to
produce, generated here from the deterministic `MockModelAdapter`'s
built-in generator, not a live LLM. Real transcripts will vary and must
be captured on your own machine.

### Illustrative Bram transcript (Rungs 1→3)

```
[Gate 0] player: connectivity ping
Bram (source: model, provenance {source:model, model:"gemma3:4b", fallback:false, latency_ms:~340, reason:null}):
  speech: "Oh -- warmer already. Will you stay a moment while it grows?"
  emotion: warm   gesture: look_up   initiative: ask_question
  memory_candidate: {kind: shared_creation, value: "lit the first fire together", confidence: 0.7}
  (Gate 0 shows the line but stores no memory and advances no rung.)

[Gate 1 · Rung 2] player: offer_seed
  → deterministic engine: seedPlanted = true (NOT set by the line above)
Bram (source: model, ~410ms):
  speech: "I felt that. It caught because of what you did."
  emotion: calm   gesture: look_up   initiative: ask_question

[Gate 1 · Rung 3] player: (bloom opens)
  → deterministic engine: bloomGranted = true (keyed on seedPlanted && rung>=2)
  → memory_candidate {value:"the first bloom...", confidence:0.9} passes the
    existence gate (engineFacts now includes 'bloom') and is STORED.
Bram (source: model, ~380ms):
  speech: "This one held. I will remember we made it together."
  emotion: warm   gesture: look_up

[Gate 1 · Next visit, simulated]
Bram (source: memory_derived, provenance {source:memory_derived, model:null, fallback:false, ...}):
  speech: "You came back. I kept our fire."
  emotion: warm   gesture: nod
  (Rendered straight from stored memory — NOT a fresh model call.)
```

### Illustrative Zaz contrast transcript (zaz-lab.html, same input as above)

```
player event: {"type":"offer_seed"}

Bram: "I felt that. It caught because of what you did."
      emotion: calm   initiative: ask_question

Zaz:  "That seed does not match your last three claims. Curious."
      emotion: skeptical   initiative: suggest_test
```

### Illustrative Bram/Lulu Level-7 pairing transcript (the real specialization test; G3)

```
player event: {"type":"show_object","object":"strange_seed"}  (rung 7, both present)

Bram: "I felt that. It caught because of what you did."
      emotion: calm   initiative: ask_question
      (repair/carry disposition: reacts to effort and warmth)

Lulu: "Look at the pattern here -- have you seen this shape before?"
      emotion: curious   initiative: ask_question
      (discovery/novelty disposition: reacts to the unusual and new)
```

### Failed-response examples (what the validator actually does)

**Rejected leak** (locked knowledge at rung 2):
```
candidate: {"speech":"Have you seen the garden plot yet? It is wonderful.", ...}
validate() → { ok: false, reason: 'rejected: speech references locked knowledge "garden plot"' }
player sees: curated fallback, e.g. "My thoughts are sleepy. Stay by the fire a moment."
telemetry.failureReason: 'rejected: speech references locked knowledge "garden plot"'
```

**Malformed JSON:**
```
raw model text: "this is not json at all {{{"
tryParseJSON() → null
player sees: curated fallback
telemetry.failureReason: 'malformed: response was not valid JSON'
```

**Timeout:**
```
adapter configured timeoutMs: 50 ; mock delay: 5000ms
gateway aborts at 50ms
player sees: curated fallback, resolved well under 2s
telemetry.failureReason: 'timeout: model timeout after 50ms'
```

## What could not be produced in this sandbox — said honestly

This environment has no path to a live local Ollama/Gemma endpoint (no
GPU/model weights here, and local-loopback model servers are outside
what this sandbox can run). As a direct consequence, the following are
**not** verified here and must be verified by the operator on their own
Mac against a real local model:

- Real (non-mock) latency measurements for the 0–150ms sensory beat /
  150–1200ms thinking window / <2s response target under an actual
  model's real inference time.
- Real Bram and Zaz transcripts — the ones above are illustrative,
  generated by the deterministic mock, and are clearly labeled as such.
- Full behavioral proof of tests **G / G2** (Bram vs Zaz distinctness) and
  **G3** (Bram vs Lulu, the real Level-7 specialization pairing) —
  this harness proves the personas are *structurally* distinct
  (different constitutions, different fallback lines, different
  enum-shaped defaults) and that `assessDivergence()` *actively flags* a
  collapse, but confirming two genuinely different *minds* under a live
  model's actual generation needs that live model.
- The **Phase 0 live half** — the headless **G0** proves the gateway
  yields valid JSON and one Bram line with a reachable adapter; only a
  real run proves actual Warren → localhost → local-model connectivity.
- The **acceptance benchmark** (the 3-of-4 emotional "yes") — subjective,
  human, live-model-only by nature.
- **Phase 6** (iPhone Safari over local Wi-Fi) — deferred; no public
  deploy.
- Whatever a real model does with edge cases the mock doesn't generate
  (creative leak attempts, unusual phrasing, multi-turn drift) — the
  validator in `response-schema.js` is designed to catch these
  categorically (pattern + enum + word-count + locked-term checks), but
  it has only been exercised here against hand-scripted mock attempts,
  not the open-ended output space of a real model.

Everything else in the "Node tests" section above (the 15 tests
A–J plus G0, G2, G3, C2, PV) is mechanically proven right now, in this
repo, with no live model, and re-runs identically on any machine with
Node installed.
