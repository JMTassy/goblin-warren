# VOX_VISUAL_TESTS.md — the WARREN VOX conformance checklist

<!-- WARREN VOX · authority=false · claim=NO_CLAIM · non-sovereign · cost:0 · render-layer only -->

A VOX application is a re-skin of a *verified* Warren surface. Because VOX
touches only presentation, the **reducer-regression scope is minimal** — but
"minimal reducer risk" is not "no verification." A render layer can still break
event bindings, viewport, accessibility, readability, asset loading, performance,
and — most importantly — the player's ability to *comprehend the true state*.
This checklist is what "a VOX application passes" means.

Run it against any surface before it is proposed for human review. It never
authorizes admission; a human seals canonization.

---

## A · Reducer regression scope (minimal) + render/interaction verification (required)

**Reducer regression (must stay green, proves VOX touched no logic):**

- [ ] `node selftest.js index.html` → **29/29** (V0 canon untouched).
- [ ] `node experiments/vertical-slice/slice-selftest.js` → **34/34** (slice
      logic untouched).
- [ ] Any zone-specific core suite the surface reuses stays at its prior count.
- [ ] `git diff --stat` shows **no** change to any reducer, core, test, or root
      canon file — VOX writes only under its own directory.

**Render + interaction verification (VOX can break these without touching logic):**

- [ ] **Event bindings** — every actionable element dispatches through the
      *existing* `applyEvent`/dispatch path; no VOX element invents a new route
      into state. Click, tap, keyboard (Space/Enter/1–4/arrows/L) all still reach
      the reducer. Pointer + keyboard reach parity.
- [ ] **Viewport** — the page body never scrolls horizontally; the pixel buffer
      resizes on `resize` and keeps `image-rendering: pixelated`; safe on mobile
      widths and at high DPR (buffer stays crisp, not blurred).
- [ ] **A11y** — focus-visible ring present on every control (`--vox-focus`);
      `role="status"` on live bubbles/toasts; controls reachable and operable by
      keyboard alone; `aria-pressed`/`aria-expanded` reflect real state.
- [ ] **Text readability** — all type on the fixed `--step-*` scale; contrast of
      `--bone`/`--glow`/`--dim` on `--panel`/`--cold` stays legible at both ends
      of the grade; no fluid/vw hero type; labels never clip.
- [ ] **Asset loading** — zero external assets. No `url()`, no `@font-face`, no
      remote font/image/script. Opening the file offline renders identically.
- [ ] **Performance** — steady rAF frame; particle counts capped; no per-frame
      allocation storms; wide-gamut/OKLCH and WebGL paths are `@supports`/
      capability-guarded with sRGB/CPU fallbacks.
- [ ] **State comprehension** — a player can read the true game state from the
      render alone: meters match projected values, pose matches fire/phase,
      trace intensity matches the projected rung, gate state is unambiguous.
      Meaning is never carried by motion or color *alone* (there is always a
      label/meter/text channel too).

---

## B · Before/after with IDENTICAL game state → identical GOVERNED projection

This is the heart of VOX conformance and it ties directly to the repo's
**BOUNDED_CONTINUITY** proof
(`experiments/bounded-continuity/`).

> `Project_gov(S) = (S.admitted, S.phase, S.level)` — sovereign state is a pure
> function of the admitted evidence sequence, **and of nothing else**.

VOX is a change to *presentation*, which is by definition *not* admitted
evidence. Therefore:

- [ ] **Same admitted sequence, old skin vs. VOX skin ⇒ identical
      `Project_gov`.** Drive the same action script through the surface before
      and after applying VOX; assert `(S.admitted, S.phase, S.level)` and the
      full `stateDigest(S)` are **byte-identical**. Only pixels differ.
- [ ] **VOX is on the presentation side of the seam.** Re-skinning cannot appear
      in `Project_gov` — if a digest moves when only the skin changed, VOX has
      leaked into state and the surface FAILS.
- [ ] **Divergent decoration, convergent sovereignty.** Two VOX variants
      (different atmosphere/motion/particles) over the same admitted subsequence
      must still land on the same sovereign projection — the dual of replay
      determinism, exactly as `bounded-continuity.test.js` shows for narrative
      noise. VOX is just one more source of governed-irrelevant variation.
- [ ] The reference `stateDigest` / `slice-selftest`'s "byte-identical replay
      across two fresh states" assertion still passes with the VOX surface in
      place.

A crisp way to state the pass: **you can diff the ledger of a VOX run against a
plain run and expect the admitted subsequence and sovereign projection to
match; you should NOT expect the pixels to.**

---

## C · Zero paid generation calls

- [ ] `grep -RniE 'fetch|http|generate|api|localstorage|cookie|websocket' \
      experiments/warren-vox` returns **zero** hits (the design intent is a
      render layer that costs nothing and phones no one). Documented, expected
      result: 0.
- [ ] No component imports or references a model, remote host, or paid service.
      A future local-model companion plugs into the *propose* side of
      `proposeCompanionLine`/`hintFor` and still makes no paid call from VOX.
- [ ] No image/font/audio asset is downloaded; all sound (if any) is synthesized
      in-file (WebAudio), all art is `fillRect`, all color is a token.
- [ ] The skill manifest's `cost_policy.paid_generation_calls: 0` holds for the
      whole surface, not just this directory.

---

## D · prefers-reduced-motion honored (three enforced levels)

- [ ] **Token level** — `VOX_TOKENS.css` collapses `--vox-dur-*`→~1ms and caps
      `--vox-throb-amp` inside `@media (prefers-reduced-motion: reduce)`.
- [ ] **CSS level** — each VOX stylesheet ends with a reduced-motion block
      neutralizing transitions/animations on bubbles, flashes, panels, blinks.
- [ ] **JS level** — components branch amplitude/particle-count/shiver from a
      single `REDUCE` read (`VoxComponents.REDUCE`), never removing the state
      signal.
- [ ] **Invariant** — with reduced motion on, the tween is gone but the
      *information* is not: a beat still recolors, a strain still turns the meter
      hot, a free lesson still flashes glow-not-red. Verify each.

---

## E · Every rendered companion line shows provenance

- [ ] Every say/hum/toast renders a **visible** provenance label — one of
      `curated` / `model` / `memory_derived` / `signal — not proof`. A bubble
      with empty/absent provenance is an automatic FAIL.
- [ ] The hum always reads `signal — not proof` and is presented as an
      invitation to verify (lens/VERIFY reachable beside it), never as truth.
- [ ] Provenance and emotion are shown orthogonally (`curated · warm`); emotion
      never suppresses the source label.
- [ ] No companion text reaches `applyEvent` — confirm there is no text-input
      route into the reducer (the slice's boundary must remain: speech is
      expression-only).

---

## Sign-off (non-canon)

A surface that checks every box above is **ready to propose**, not admitted.
Per the workflow: read → extract → freeze → apply above the seam → check (this
list) → before/after → **admit only after human review**. The operator seals
canonization; this checklist does not.
