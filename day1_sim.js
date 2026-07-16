/* day1_sim.js — Goblin Warren Day 1 · MARK versus INTERVENE
 *
 * LOAD-BEARING CLAIM (unproven until playtest):
 *   Indirectly shaping agent behavior can be understandable, strategic, and fun.
 *
 * Deterministic. No DOM. Pure simulation.
 * SCHEMA = DAY1_SIM_V0
 * authority=false · claim=NO_CLAIM · non-sovereign · sandbox only
 *
 * Nintendo discipline: experience before terminology.
 * Do not name "AI agent", "routing", "context", "MCP", "orchestration" in UI.
 *
 * Run: node day1_test.js
 */
"use strict";

var SCHEMA = "DAY1_SIM_V0";
var MAX_ACTIONS = 2;
var MARK_DELTA = 1; // integer strength units — no floats, no rng
// P0: Bram only acts when a garden warning is loud enough.
// Initial cracked_root warning strength is BELOW this; MARK raises it over the line.
// Empty day / no MARK ⇒ no free repair (MARK = influence).
var BRAM_ACT_THRESHOLD = 3;

/** @returns {object} fresh initial state (never mutated by runDay) */
function makeInitialState() {
  return {
    schema: SCHEMA,
    day: 1,
    actionsRemaining: MAX_ACTIONS,
    zones: {
      garden: { id: "garden", name: "Garden" },
      archive: { id: "archive", name: "Archive" },
    },
    agents: {
      lulu: {
        id: "lulu",
        name: "Lulu",
        role: "explorer",
        zone: "garden",
        // Day 1: visual/novelty only — never resolves a need
      },
      bram: {
        id: "bram",
        name: "Bram",
        role: "repairer",
        zone: "garden",
        // warning traces only; strongest with strength >= BRAM_ACT_THRESHOLD
      },
    },
    needs: {
      dry_seedlings: {
        id: "dry_seedlings",
        label: "Dry seedlings",
        zone: "garden",
        resolved: false,
        // no warning trace — INTERVENE only on Day 1
      },
      cracked_root: {
        id: "cracked_root",
        label: "Cracked root",
        zone: "garden",
        resolved: false,
      },
      fading_memory: {
        id: "fading_memory",
        label: "Fading memory",
        zone: "archive",
        resolved: false,
      },
    },
    // Environmental traces. MARK strengthens; Bram reads warning only.
    traces: {
      cracked_root_warning: {
        id: "cracked_root_warning",
        needId: "cracked_root",
        type: "warning",
        // below BRAM_ACT_THRESHOLD until MARK (P0 — no free Bram)
        strength: 2,
        zone: "garden",
      },
      dry_seedlings_novelty: {
        id: "dry_seedlings_novelty",
        needId: "dry_seedlings",
        type: "novelty",
        strength: 1,
        zone: "garden",
      },
      fading_memory_echo: {
        id: "fading_memory_echo",
        needId: "fading_memory",
        type: "memory",
        strength: 1,
        zone: "archive",
      },
    },
    // Presentation / feel cues (deterministic strings for the thin shell)
    bramPath: "idle",
    luluMood: "curious",
    events: [],
  };
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function fail(msg) {
  var err = new Error(msg);
  err.code = "DAY1_FAIL_CLOSED";
  throw err;
}

function pushEvent(s, ev) {
  s.events.push(Object.assign({ t: s.events.length }, ev));
}

/**
 * Apply one player action. Fail closed on invalid.
 * @param {object} s mutable day state
 * @param {{ verb: string, target: string }} action
 *   target = need id for both MARK and INTERVENE
 */
function applyPlayerAction(s, action) {
  if (!action || typeof action !== "object") fail("action must be an object");
  var verb = action.verb;
  var target = action.target;
  if (verb !== "MARK" && verb !== "INTERVENE") fail("unknown verb: " + verb);
  if (s.actionsRemaining <= 0) fail("no actions remaining");

  var need = s.needs[target];
  if (!need) fail("unknown need: " + target);
  if (need.resolved) fail("need already resolved: " + target);

  if (verb === "MARK") {
    // Strengthen one existing trace tied to this need (does not resolve).
    var traceIds = Object.keys(s.traces).sort(); // stable order
    var hit = null;
    for (var i = 0; i < traceIds.length; i++) {
      var tr = s.traces[traceIds[i]];
      if (tr.needId === target) {
        hit = tr;
        break;
      }
    }
    if (!hit) fail("no trace to MARK for need: " + target);

    var before = hit.strength;
    hit.strength = before + MARK_DELTA;
    s.actionsRemaining -= 1;

    pushEvent(s, {
      kind: "MARK_PULSE",
      who: "player",
      needId: target,
      traceId: hit.id,
      strengthBefore: before,
      strengthAfter: hit.strength,
      ui: "pulse",
    });
    pushEvent(s, {
      kind: "TRACE_STRENGTHEN",
      who: "world",
      needId: target,
      traceId: hit.id,
      type: hit.type,
      strength: hit.strength,
      ui: "warning_trace_strengthens",
    });
    // Lulu may react to novelty marks only (visual, never resolves)
    if (hit.type === "novelty") {
      s.luluMood = "alert";
      pushEvent(s, {
        kind: "LULU_REACT",
        who: "lulu",
        needId: target,
        detail: "notices a brighter novelty shimmer",
        ui: "lulu_react",
      });
    }
    return;
  }

  // INTERVENE — direct resolve, no goblin training
  need.resolved = true;
  s.actionsRemaining -= 1;
  pushEvent(s, {
    kind: "INTERVENE",
    who: "player",
    needId: target,
    ui: "need_resolves_immediately",
  });
}

/**
 * Release phase: agents act by explicit local rules only.
 * Order is fixed: Lulu (react only) then Bram (repair).
 */
function releaseAgents(s) {
  // Lulu: visual only — never resolve
  var noveltyAlive = false;
  var tids = Object.keys(s.traces).sort();
  for (var i = 0; i < tids.length; i++) {
    var tr = s.traces[tids[i]];
    var n = s.needs[tr.needId];
    if (tr.type === "novelty" && n && !n.resolved) {
      noveltyAlive = true;
      break;
    }
  }
  if (noveltyAlive) {
    s.luluMood = "curious";
    pushEvent(s, {
      kind: "LULU_WATCH",
      who: "lulu",
      detail: "watches novelty but does not fix anything",
      ui: "lulu_idle",
    });
  } else {
    pushEvent(s, {
      kind: "LULU_WAIT",
      who: "lulu",
      detail: "no novelty left to watch",
      ui: "lulu_idle",
    });
  }

  // Bram: warning traces only, strongest ABOVE threshold, repair if unresolved.
  // P0: strength < BRAM_ACT_THRESHOLD ⇒ idle (no free autopilot).
  var best = null;
  var loudestFaint = null;
  for (var j = 0; j < tids.length; j++) {
    var w = s.traces[tids[j]];
    if (w.type !== "warning") continue;
    var need = s.needs[w.needId];
    if (!need || need.resolved) continue;
    // Day 1: Bram only acts in Garden (his zone) — Archive memory is not his
    if (need.zone !== s.agents.bram.zone) continue;
    if (w.strength < BRAM_ACT_THRESHOLD) {
      if (
        !loudestFaint ||
        w.strength > loudestFaint.strength ||
        (w.strength === loudestFaint.strength && w.id < loudestFaint.id)
      ) {
        loudestFaint = w;
      }
      continue;
    }
    if (
      !best ||
      w.strength > best.strength ||
      (w.strength === best.strength && w.id < best.id)
    ) {
      best = w;
    }
  }

  if (!best) {
    s.bramPath = "idle";
    if (loudestFaint) {
      pushEvent(s, {
        kind: "BRAM_SIGNAL_FAINT",
        who: "bram",
        needId: loudestFaint.needId,
        traceId: loudestFaint.id,
        strength: loudestFaint.strength,
        threshold: BRAM_ACT_THRESHOLD,
        detail: "warning too quiet — needs a clearer mark",
        ui: "bram_idle",
      });
    }
    pushEvent(s, {
      kind: "BRAM_IDLE",
      who: "bram",
      detail: loudestFaint
        ? "heard a faint warning but did not act"
        : "no visible garden warning to follow",
      ui: "bram_idle",
    });
    return;
  }

  s.bramPath = "to:" + best.needId;
  pushEvent(s, {
    kind: "BRAM_NOTICE",
    who: "bram",
    needId: best.needId,
    traceId: best.id,
    strength: best.strength,
    ui: "bram_notices",
  });
  pushEvent(s, {
    kind: "BRAM_PATH",
    who: "bram",
    needId: best.needId,
    ui: "bram_changes_path",
  });
  pushEvent(s, {
    kind: "BRAM_REPAIR_START",
    who: "bram",
    needId: best.needId,
    ui: "repair_starts",
  });

  s.needs[best.needId].resolved = true;
  pushEvent(s, {
    kind: "BRAM_REPAIR_COMPLETE",
    who: "bram",
    needId: best.needId,
    ui: "repair_completes",
  });
}

/**
 * runDay(state, actions) → new state
 * actions: [{ verb: "MARK"|"INTERVENE", target: needId }, ...] length 0..2
 */
function runDay(state, actions) {
  if (!state || state.schema !== SCHEMA) fail("invalid state schema");
  if (!Array.isArray(actions)) fail("actions must be an array");
  if (actions.length > MAX_ACTIONS) fail("Day 1 allows at most " + MAX_ACTIONS + " actions");

  var s = cloneState(state);
  s.events = [];
  s.actionsRemaining = MAX_ACTIONS;

  for (var i = 0; i < actions.length; i++) {
    applyPlayerAction(s, actions[i]);
  }

  releaseAgents(s);

  s.day = state.day + 1;
  s.actionsRemaining = 0;
  return s;
}

/** Path A fixture actions (spec) */
function pathAActions() {
  return [
    { verb: "MARK", target: "cracked_root" },
    { verb: "INTERVENE", target: "dry_seedlings" },
  ];
}

/** Path B fixture actions (spec) */
function pathBActions() {
  return [
    { verb: "INTERVENE", target: "cracked_root" },
    { verb: "INTERVENE", target: "dry_seedlings" },
  ];
}

function summarize(state) {
  var resolved = [];
  var pending = [];
  var ids = Object.keys(state.needs).sort();
  for (var i = 0; i < ids.length; i++) {
    var n = state.needs[ids[i]];
    if (n.resolved) resolved.push(n.id);
    else pending.push(n.id);
  }
  var bramRepaired = state.events.some(function (e) {
    return e.kind === "BRAM_REPAIR_COMPLETE";
  });
  return {
    schema: SCHEMA,
    day: state.day,
    resolved: resolved,
    pending: pending,
    bramRepaired: bramRepaired,
    eventKinds: state.events.map(function (e) { return e.kind; }),
  };
}

function eventKinds(state) {
  return state.events.map(function (e) { return e.kind; });
}

function bramInvoked(state) {
  return state.events.some(function (e) {
    return e.kind === "BRAM_REPAIR_COMPLETE" || e.kind === "BRAM_REPAIR_START";
  });
}

var api = {
  SCHEMA: SCHEMA,
  MAX_ACTIONS: MAX_ACTIONS,
  MARK_DELTA: MARK_DELTA,
  BRAM_ACT_THRESHOLD: BRAM_ACT_THRESHOLD,
  makeInitialState: makeInitialState,
  runDay: runDay,
  summarize: summarize,
  eventKinds: eventKinds,
  bramInvoked: bramInvoked,
  pathAActions: pathAActions,
  pathBActions: pathBActions,
  cloneState: cloneState,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}
if (typeof window !== "undefined") {
  window.Day1Sim = api;
}
