/*
  warren-vox/VOX_COMPONENTS.js
  ------------------------------------------------------------------
  WARREN VOX · authority=false · claim=NO_CLAIM · non-sovereign · cost:0

  THE SEAM (read this before using anything below):

    GAME STATE / REDUCER  →  read-only projection  →  VOX RENDER LAYER  →  player

  Every function in this file is a PURE FUNCTION OF A READ-ONLY PROJECTION.
  It reads a plain projection object (see VOX_SCENE_GRAMMAR.md `project(S)`)
  and returns DOM nodes or draws onto a canvas context you pass in. None of
  these functions:
    - import, require, or reference a reducer / applyEvent / game state S,
    - mutate their inputs (projections are treated as frozen),
    - open any persistence surface (no localStorage / cookies),
    - make any network or paid call (no remote requests of any kind).

  They are presentation only. If a rendered element needs to cause a game
  effect, the host page wires its event to the SAME dispatch the plain UI
  already uses (applyEvent) — these helpers never reach the reducer.

  Zero dependencies, zero build step, framework-free vanilla. Colors come
  from tokens.css / VOX_TOKENS.css via var(--token); this file types no hex
  literal (the two mix helpers operate on colors the CALLER read out of the
  token palette at boot, exactly as first-fire-v2.html / the slice do).

  Offline law: system/local only. This file references no font, no image,
  no url(), no remote host. Grep proof in VOX_VISUAL_TESTS.md.
  ------------------------------------------------------------------
*/
"use strict";
(function (root, factory) {
  var mod = factory();
  if (typeof module === "object" && module.exports) module.exports = mod;
  else root.VoxComponents = mod;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {

  /* ---------- environment (guarded for headless) ---------- */
  var HAS_DOM = typeof document !== "undefined" && !!document.createElement;
  var REDUCE = (typeof matchMedia === "function")
    ? matchMedia("(prefers-reduced-motion: reduce)").matches
    : false; // headless / SSR => treat as reduced (static, correct-state render)

  /* ---------- pure view math (no state, no I/O) ---------- */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Mix two "#rrggbb" strings the caller already read from the token palette.
  // Returns an rgb() string. This is the slice's mixHex, verbatim in spirit.
  function mixHex(c1, c2, t) {
    var a = parseInt(String(c1).slice(1), 16), b = parseInt(String(c2).slice(1), 16);
    var r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
    var g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
    var bl = Math.round(lerp(a & 255, b & 255, t));
    return "rgb(" + r + "," + g + "," + bl + ")";
  }
  function rgbaHex(hex, alpha) {
    var n = parseInt(String(hex).slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  // Quantize a 0..1 trace intensity to weak/medium/strong alpha (VOX_TOKENS).
  // Pure: same intensity in, same rung out. No decay computed here — decay is
  // engine state; VOX only shows the value the projection carries.
  var TRACE_ALPHA = { weak: 0.28, medium: 0.55, strong: 0.85 };
  function traceRung(intensity) {
    var i = clamp01(intensity);
    if (i >= 0.66) return "strong";
    if (i >= 0.33) return "medium";
    return "weak";
  }

  // Provenance tag -> the four canonical labels (VOX_CHARACTER_PRESENTATION).
  // Anything unrecognized falls back to the most cautious label.
  function provLabel(tag) {
    var t = String(tag || "").toLowerCase();
    if (t.indexOf("curated") !== -1) return "curated";
    if (t.indexOf("memory") !== -1) return "memory_derived";
    if (t.indexOf("model") !== -1) return "model";
    if (t.indexOf("signal") !== -1 || t.indexOf("companion") !== -1) return "signal — not proof";
    return "signal — not proof";
  }

  /* ---------- tiny DOM helper (no framework) ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }

  /* ==================================================================
     COMPONENT: VoxMeter — a HUD meter fill from a projected value.
     projection field shape: { value, max, tone } (tone: "warm"|"green")
     Returns a { root, update } handle. update(view) re-reads and re-sizes
     from a fresh projection slice — it never stores game state.
     ================================================================== */
  function VoxMeter(opts) {
    opts = opts || {};
    if (!HAS_DOM) return { root: null, update: function () {} };
    var root = el("div", "vox-meter");
    var label = el("div", "vox-meter-label");
    var name = el("span", null, opts.label || "");
    var read = el("span", "vox-meter-read", "");
    label.appendChild(name); label.appendChild(read);
    var track = el("div", "vox-meter-track");
    var fill = el("div", "vox-meter-fill" + (opts.tone === "green" ? " green" : ""));
    track.appendChild(fill);
    root.appendChild(label); root.appendChild(track);

    function update(view) {
      view = view || {};
      var max = view.max || opts.max || 1;
      var v = clamp01((view.value || 0) / max);
      fill.style.width = (v * 100).toFixed(1) + "%";
      read.textContent = view.readout != null
        ? view.readout
        : (Math.round((view.value || 0) * 10) / 10) + "/" + max;
      // warn state is a projection of a flag the engine sets; VOX only shows it
      fill.classList.toggle("warn", !!view.warn && !REDUCE);
      return root;
    }
    if (opts.initial) update(opts.initial);
    return { root: root, update: update };
  }

  /* ==================================================================
     COMPONENT: VoxProvenanceBubble — a speech/hum bubble that ALWAYS
     renders a visible provenance label. Input is the projected companion
     line: { speech, emotion, provenance }. Expression only — this cannot
     and does not touch state (VOX_CHARACTER_PRESENTATION boundary).
     ================================================================== */
  function VoxProvenanceBubble(opts) {
    opts = opts || {};
    if (!HAS_DOM) return { root: null, update: function () {} };
    var root = el("div", "vox-bubble" + (opts.hum ? " vox-bubble-hum" : ""));
    root.setAttribute("role", "status");
    var body = el("span", "vox-bubble-text", "");
    var prov = el("span", "vox-bubble-prov", "");
    root.appendChild(body); root.appendChild(prov);

    function update(line) {
      line = line || {};
      var speech = line.speech || "";
      body.textContent = speech;
      // MANDATORY: a line never renders without a provenance label.
      var label = provLabel(line.provenance);
      var emo = line.emotion ? " · " + String(line.emotion).replace(/_/g, " ") : "";
      prov.textContent = opts.hum ? "bram's hum · signal — not proof" : (label + emo);
      root.classList.toggle("show", speech.length > 0);
      // affirming voice vs neutral — presentation delta only
      root.classList.toggle("affirm", line.emotion === "warm" || (opts.hum === true));
      return root;
    }
    update(opts.initial || {});
    return { root: root, update: update };
  }

  /* ==================================================================
     COMPONENT: VoxPulseRing — the heartbeat. Pure projection of beat
     state onto a transform, recomputed every frame (VOX_MOTION_GRAMMAR
     §1). No animation timeline is stored; the ring simply IS the current
     beat nearness. palette = { ember, gold, dim } read from tokens by host.
     ================================================================== */
  function VoxPulseRing(opts) {
    opts = opts || {};
    if (!HAS_DOM) return { root: null, frame: function () {} };
    var pal = opts.palette || {};
    var root = el("div", "vox-ring");
    var amp = REDUCE ? 0.12 : 0.30; // == --vox-throb-amp(-calm)

    // frame(view): view = { nearness, onBeat, hit } — all read-only projections.
    // hit is a short-lived view timer (0..1) the host decays; still not state.
    function frame(view) {
      view = view || {};
      var n = clamp01(view.nearness || 0);
      var sc = 1 + amp * n * n * n;
      if (view.hit) sc += 0.4 * clamp01(view.hit);
      root.style.transform = "scale(" + sc.toFixed(3) + ")";
      var col = view.hit ? pal.gold : (view.onBeat ? pal.ember : pal.dim);
      if (col) root.style.borderColor = col;
      root.style.boxShadow = (view.hit || view.onBeat) && pal.ember
        ? "0 0 0 2px " + rgbaHex(view.hit ? (pal.gold || pal.ember) : pal.ember, 0.25)
        : "none";
      return root;
    }
    return { root: root, frame: frame };
  }

  /* ==================================================================
     COMPONENT: drawVoxTrace — draws ONE trace glyph onto a canvas ctx at
     the buffer's native resolution (nearest-neighbor, PIX lattice). Pure
     of state: it reads a projected trace { x, y, flavor, intensity } and a
     palette object the host built from the token flavor map. It draws; it
     returns nothing; it cannot create a trace (VOX_SCENE_GRAMMAR §2).
     ================================================================== */
  var TRACE_TOKEN = {
    warning: "ember", novel: "gold", relational: "glow",
    resource: "mossWarm", memory: "bone"
  };
  function drawVoxTrace(ctx, trace, palette) {
    if (!ctx || !trace) return;
    var flavorKey = TRACE_TOKEN[trace.flavor] || "ember";
    var hex = (palette && palette[flavorKey]) || (palette && palette.ember);
    if (!hex) return;
    var a = TRACE_ALPHA[traceRung(trace.intensity)];
    var x = Math.round(trace.x), y = Math.round(trace.y);
    // pixel diamond pip on the object anchor — hue = flavor, alpha = intensity
    ctx.fillStyle = rgbaHex(hex, a);
    ctx.fillRect(x - 1, y, 3, 1);
    ctx.fillRect(x, y - 1, 1, 3);
    ctx.fillStyle = rgbaHex(hex, Math.min(1, a + 0.15));
    ctx.fillRect(x, y, 1, 1);
  }

  /* ==================================================================
     COMPONENT: VoxProvenanceToast — a read-only receipt toast for the
     provenance band (z-prov). Shows "<kind> — <label>" for a ledger/admit
     event. Output only; no input affordance; cannot admit anything.
     ================================================================== */
  function VoxProvenanceToast() {
    if (!HAS_DOM) return { root: null, show: function () {} };
    var root = el("div", "vox-toast");
    root.setAttribute("role", "status");
    var k = el("span", "vox-toast-kind", "");
    var l = el("span", "vox-toast-prov", "");
    root.appendChild(k); root.appendChild(l);
    function show(view) {
      view = view || {};
      k.textContent = view.kind || "";
      l.textContent = " — " + provLabel(view.provenance);
      root.classList.add("show");
      return root;
    }
    return { root: root, show: show };
  }

  /* ---------- public surface ---------- */
  return {
    // components
    VoxMeter: VoxMeter,
    VoxProvenanceBubble: VoxProvenanceBubble,
    VoxPulseRing: VoxPulseRing,
    VoxProvenanceToast: VoxProvenanceToast,
    drawVoxTrace: drawVoxTrace,
    // pure helpers (exported for hosts + tests)
    clamp01: clamp01,
    lerp: lerp,
    mixHex: mixHex,
    rgbaHex: rgbaHex,
    traceRung: traceRung,
    provLabel: provLabel,
    REDUCE: REDUCE
  };
});
