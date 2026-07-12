# LULU EMERGENCE DESIGN — steps 40–42 (43 deferred)
<!-- 🧿 emergence points: behavior nobody wrote, from architecture alone -->

## 40 🧿 Self-model injection

Include in the voice context Lulu's own recent **proposals-vs-admissions
ratio** (computable from the log: proposals arrive via voice, admissions are
events; refusals are logged app-side as counters, never as events):

    {"proposed": 9, "admitted": 4, "lastRefusals": ["ZOL would go negative", "room is full"]}

She develops opinions about the verifier — "The gate refused my throne.
The gate has no vision." — personality from architecture, free. The
self-model is *context*, never input to `admit()`.

## 41 🧿 Council coupling — advisory-only (corrected)

    Lulu state → creative proposal style → NEVER admission

- Export: `council_advisory(state)` → bands only (LOW/MID/HIGH),
  `advisoryOnly: true` (shape gate-tested, G15).
- Manual, read-only export first. No live HELEN coupling in v2.0.
- Allowed: high Curiosity → stranger goblin proposals; low Energy →
  advocates HOLD over TRY; high Connection → states her real objection.
- Forbidden: mood → governance threshold; affection → verdict; Lulu state →
  Mayor/Reducer inputs; any live value as authority signal.
- Already witnessed in the shipped game (v1.9): her council *lines* change
  with needs; positions and admission logic do not.

## 42 🧿 WUL learning arc

WULmoji acquisition = event-count predicates over the log (like accessories):
- `LEARNED_WULMOJI` absence events + care interactions accumulate;
- each threshold unlocks one glyph on her room's WUL board;
- her utterances may then include unlocked glyphs (validator whitelists
  only unlocked ones — she cannot speak symbols she has not lived).
The 250-primitive language gains a native speaker whose vocabulary has
provenance: every glyph she uses traces to the events that taught her it.

## 43 — Judge ensemble: DEFERRED beyond v2.0

MVP voice quality = schema + forbidden-scan + length + persona examples +
deterministic fallback (see LULU_VOICE_CONTRACT.md). Revisit only with
playtest evidence of voice drift.

## 44 — Drift study: parking lot (post-v2.0), publishable artifact slot.
