/* ramp_sim.js — Goblin Warren levels 1–2 · the Mario ramp
 *
 * Level 1 "The Seedlings"  — teaches FIX.  One need, one verb, cannot fail.
 * Level 2 "The Heavy Rock" — teaches MARK by necessity: FIX fails softly
 *                            ("too heavy"), only MARK summons Bram.
 * Level 3 is the existing Day-1 shell (unchanged) — choice arrives only
 * after both verbs are learned. This file imports nothing.
 *
 * Deterministic. No DOM. No floats, no RNG.
 * SCHEMA = RAMP_SIM_V0
 * authority=false · claim=NO_CLAIM · non-sovereign · sandbox only
 *
 * Run: node ramp_test.js
 */
"use strict";

var SCHEMA = "RAMP_SIM_V0";

function fail(msg) {
  var err = new Error(msg);
  err.code = "RAMP_FAIL_CLOSED";
  throw err;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function pushEvent(s, ev) {
  s.events.push(Object.assign({ t: s.events.length }, ev));
}

/* ── Level 1 — The Seedlings ─────────────────────────────────────────── */

function makeLevel1() {
  return {
    schema: SCHEMA,
    level: 1,
    title: "The Seedlings",
    verbs: ["FIX"], // MARK does not exist yet
    needs: {
      dry_seedlings: {
        id: "dry_seedlings",
        label: "Dry seedlings",
        zone: "garden",
        resolved: false,
      },
    },
    agents: {}, // no goblins on screen — nothing to explain
    complete: false,
    events: [],
  };
}

/**
 * runLevel1(state, action) → new state
 * Only { verb: "FIX", target: "dry_seedlings" } is valid.
 */
function runLevel1(state, action) {
  if (!state || state.schema !== SCHEMA || state.level !== 1) fail("invalid level 1 state");
  if (!action || typeof action !== "object") fail("action must be an object");
  if (action.verb !== "FIX") fail("level 1 knows only FIX, got: " + action.verb);
  var need = state.needs[action.target];
  if (!need) fail("unknown need: " + action.target);
  if (need.resolved) fail("need already resolved: " + action.target);

  var s = cloneState(state);
  s.events = [];
  s.needs[action.target].resolved = true;
  pushEvent(s, { kind: "FIX", who: "player", needId: action.target, ui: "water_pours" });
  pushEvent(s, { kind: "BLOOM", who: "world", needId: action.target, ui: "seedlings_bloom" });
  s.complete = true;
  pushEvent(s, { kind: "LEVEL_COMPLETE", who: "world", level: 1, ui: "banner" });
  return s;
}

/* ── Level 2 — The Heavy Rock ────────────────────────────────────────── */

function makeLevel2() {
  return {
    schema: SCHEMA,
    level: 2,
    title: "The Heavy Rock",
    verbs: ["FIX", "MARK"], // MARK appears for the first time
    needs: {
      cracked_root: {
        id: "cracked_root",
        label: "Cracked root",
        zone: "garden",
        resolved: false,
        tooHeavy: true, // player FIX always fails softly
      },
    },
    agents: {
      bram: {
        id: "bram",
        name: "Bram",
        role: "repairer",
        zone: "garden",
        state: "wandering", // visible but unengaged until a MARK exists
      },
    },
    traces: {
      cracked_root_warning: {
        id: "cracked_root_warning",
        needId: "cracked_root",
        type: "warning",
        strength: 0, // too faint — Bram ignores it until MARK raises it
      },
    },
    fixAttempts: 0,
    complete: false,
    events: [],
  };
}

/**
 * runLevel2(state, action) → new state
 * FIX cracked_root  → soft fail (FIX_FAIL), need stays, retry allowed.
 * MARK cracked_root → pulse → Bram notices → walks → repairs → complete.
 */
function runLevel2(state, action) {
  if (!state || state.schema !== SCHEMA || state.level !== 2) fail("invalid level 2 state");
  if (!action || typeof action !== "object") fail("action must be an object");
  if (action.verb !== "FIX" && action.verb !== "MARK") {
    fail("level 2 knows only FIX and MARK, got: " + action.verb);
  }
  var need = state.needs[action.target];
  if (!need) fail("unknown need: " + action.target);
  if (need.resolved) fail("need already resolved: " + action.target);

  var s = cloneState(state);
  s.events = [];

  if (action.verb === "FIX") {
    // Soft fail: the rock is too heavy for the player. Nothing is consumed.
    s.fixAttempts = state.fixAttempts + 1;
    pushEvent(s, {
      kind: "FIX_FAIL",
      who: "player",
      needId: action.target,
      attempt: s.fixAttempts,
      ui: "too_heavy_shake",
    });
    // After the first failed try, the world nudges toward Bram — show, don't tell.
    if (s.fixAttempts >= 1) {
      pushEvent(s, {
        kind: "BRAM_NEARBY",
        who: "world",
        detail: "Bram wanders past, strong arms idle",
        ui: "bram_glance",
      });
    }
    return s;
  }

  // MARK — the only path through
  var tr = s.traces.cracked_root_warning;
  tr.strength = tr.strength + 1;
  pushEvent(s, {
    kind: "MARK_PULSE",
    who: "player",
    needId: action.target,
    strengthAfter: tr.strength,
    ui: "pulse",
  });
  pushEvent(s, {
    kind: "BRAM_NOTICE",
    who: "bram",
    needId: action.target,
    ui: "bram_notices",
  });
  s.agents.bram.state = "repairing";
  pushEvent(s, {
    kind: "BRAM_PATH",
    who: "bram",
    needId: action.target,
    ui: "bram_changes_path",
  });
  pushEvent(s, {
    kind: "BRAM_REPAIR_START",
    who: "bram",
    needId: action.target,
    ui: "repair_starts",
  });
  s.needs[action.target].resolved = true;
  s.agents.bram.state = "done";
  pushEvent(s, {
    kind: "BRAM_REPAIR_COMPLETE",
    who: "bram",
    needId: action.target,
    ui: "repair_completes",
  });
  s.complete = true;
  pushEvent(s, { kind: "LEVEL_COMPLETE", who: "world", level: 2, ui: "banner" });
  return s;
}

/* ── shared ──────────────────────────────────────────────────────────── */

function eventKinds(state) {
  return state.events.map(function (e) { return e.kind; });
}

var api = {
  SCHEMA: SCHEMA,
  makeLevel1: makeLevel1,
  runLevel1: runLevel1,
  makeLevel2: makeLevel2,
  runLevel2: runLevel2,
  eventKinds: eventKinds,
  cloneState: cloneState,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}
if (typeof window !== "undefined") {
  window.RampSim = api;
}
