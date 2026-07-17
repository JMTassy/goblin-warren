/* ramp_test.js — Node selftest for ramp_sim.js (levels 1–2)
 *
 * authority=false · no DOM
 * Run: node ramp_test.js
 */
"use strict";

var path = require("path");
var sim = require(path.join(__dirname, "ramp_sim.js"));

var pass = 0;
var fail = 0;

function ok(cond, name) {
  if (cond) { pass++; console.log("  [ok] " + name); }
  else { fail++; console.log("  [FAIL] " + name); }
}

function throws(fn, name) {
  var threw = false;
  try { fn(); } catch (e) { threw = true; }
  ok(threw, name);
}

console.log("ramp_sim selftest\n");

/* ── Level 1 — The Seedlings ─────────────────────────────── */

var L1 = sim.makeLevel1();
ok(L1.level === 1, "L1. level is 1");
ok(L1.verbs.length === 1 && L1.verbs[0] === "FIX", "L1. only FIX exists");
ok(Object.keys(L1.needs).length === 1, "L1. exactly one need");
ok(Object.keys(L1.agents).length === 0, "L1. no goblins on screen");
ok(L1.complete === false, "L1. starts incomplete");

// The one valid move
var L1done = sim.runLevel1(L1, { verb: "FIX", target: "dry_seedlings" });
ok(L1done.needs.dry_seedlings.resolved === true, "L1. FIX resolves seedlings");
ok(L1done.complete === true, "L1. level completes");
ok(
  sim.eventKinds(L1done).join(",") === "FIX,BLOOM,LEVEL_COMPLETE",
  "L1. event chain is FIX → BLOOM → LEVEL_COMPLETE"
);

// Cannot fail — but invalid input still fails closed
throws(function () { sim.runLevel1(L1, { verb: "MARK", target: "dry_seedlings" }); },
  "L1. MARK does not exist yet");
throws(function () { sim.runLevel1(L1, { verb: "FIX", target: "nope" }); },
  "L1. unknown need fails closed");
throws(function () { sim.runLevel1(L1done, { verb: "FIX", target: "dry_seedlings" }); },
  "L1. double-fix fails closed");
throws(function () { sim.runLevel1(null, { verb: "FIX", target: "dry_seedlings" }); },
  "L1. null state fails closed");

// Determinism
var L1b = sim.runLevel1(sim.makeLevel1(), { verb: "FIX", target: "dry_seedlings" });
ok(JSON.stringify(L1done) === JSON.stringify(L1b), "L1. deterministic");

/* ── Level 2 — The Heavy Rock ────────────────────────────── */

var L2 = sim.makeLevel2();
ok(L2.level === 2, "L2. level is 2");
ok(L2.verbs.indexOf("MARK") >= 0, "L2. MARK appears for the first time");
ok(L2.agents.bram && L2.agents.bram.state === "wandering", "L2. Bram wanders, unengaged");
ok(L2.traces.cracked_root_warning.strength === 0, "L2. warning too faint for Bram alone");

// FIX fails softly — this is the Goomba
var L2f = sim.runLevel2(L2, { verb: "FIX", target: "cracked_root" });
ok(L2f.needs.cracked_root.resolved === false, "L2. FIX does not resolve the rock");
ok(L2f.complete === false, "L2. level not complete after FIX");
ok(L2f.fixAttempts === 1, "L2. fix attempt counted");
ok(
  L2f.events.some(function (e) { return e.kind === "FIX_FAIL"; }),
  "L2. FIX_FAIL event fires (too heavy)"
);
ok(
  L2f.events.some(function (e) { return e.kind === "BRAM_NEARBY"; }),
  "L2. world nudges toward Bram after failed FIX"
);

// Retry allowed — soft fail is not a dead end
var L2f2 = sim.runLevel2(L2f, { verb: "FIX", target: "cracked_root" });
ok(L2f2.fixAttempts === 2, "L2. FIX can be retried (soft fail)");
ok(L2f2.needs.cracked_root.resolved === false, "L2. retry still fails");

// MARK is the only path through
var L2done = sim.runLevel2(L2f, { verb: "MARK", target: "cracked_root" });
ok(L2done.needs.cracked_root.resolved === true, "L2. MARK → Bram resolves the rock");
ok(L2done.complete === true, "L2. level completes via MARK");
ok(L2done.agents.bram.state === "done", "L2. Bram finished repairing");
ok(
  sim.eventKinds(L2done).join(",") ===
    "MARK_PULSE,BRAM_NOTICE,BRAM_PATH,BRAM_REPAIR_START,BRAM_REPAIR_COMPLETE,LEVEL_COMPLETE",
  "L2. MARK chain: pulse → notice → path → repair → complete"
);

// MARK works without a prior FIX attempt too (discovery is allowed)
var L2direct = sim.runLevel2(sim.makeLevel2(), { verb: "MARK", target: "cracked_root" });
ok(L2direct.complete === true, "L2. MARK works even without trying FIX first");

// Player never resolves the rock directly — only Bram does
ok(
  !L2done.events.some(function (e) { return e.who === "player" && e.kind === "BRAM_REPAIR_COMPLETE"; }),
  "L2. repair completion belongs to Bram, not player"
);
ok(
  L2done.events.some(function (e) { return e.who === "bram" && e.kind === "BRAM_REPAIR_COMPLETE"; }),
  "L2. Bram is the repairer of record"
);

// Guard rails
throws(function () { sim.runLevel2(L2, { verb: "BRIDGE", target: "cracked_root" }); },
  "L2. unknown verb fails closed");
throws(function () { sim.runLevel2(L2, { verb: "MARK", target: "nope" }); },
  "L2. unknown need fails closed");
throws(function () { sim.runLevel2(L2done, { verb: "MARK", target: "cracked_root" }); },
  "L2. acting on resolved need fails closed");
throws(function () { sim.runLevel2(L1, { verb: "FIX", target: "dry_seedlings" }); },
  "L2. level 1 state rejected by level 2 runner");

// Determinism
var L2b = sim.runLevel2(sim.makeLevel2(), { verb: "MARK", target: "cracked_root" });
ok(JSON.stringify(L2direct) === JSON.stringify(L2b), "L2. deterministic");

/* ── Ramp isolation ──────────────────────────────────────── */

var fs = require("fs");
var src = fs.readFileSync(path.join(__dirname, "ramp_sim.js"), "utf8");
ok(src.indexOf("require(") === -1 && src.indexOf("import ") === -1,
  "R. ramp_sim.js is a bounded module (no imports)");
ok(src.indexOf("day1_sim") === -1, "R. no coupling to day1_sim.js");

/* ── Progression law in code ─────────────────────────────── */
// Level 1 vocabulary is a strict subset of level 2 vocabulary.
ok(
  sim.makeLevel1().verbs.every(function (v) { return sim.makeLevel2().verbs.indexOf(v) >= 0; }),
  "P. level 1 verbs ⊂ level 2 verbs (one new thing per level)"
);
ok(
  sim.makeLevel2().verbs.length === sim.makeLevel1().verbs.length + 1,
  "P. level 2 adds exactly ONE new verb"
);

console.log("\n--- L1 chain ---\n" + sim.eventKinds(L1done).join(" → "));
console.log("--- L2 FIX (fail) ---\n" + sim.eventKinds(L2f).join(" → "));
console.log("--- L2 MARK chain ---\n" + sim.eventKinds(L2done).join(" → "));

console.log("\nramp_test: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
