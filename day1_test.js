/* day1_test.js — Node selftest for day1_sim.js
 *
 * authority=false · no DOM
 * Run: node day1_test.js
 */
"use strict";

var path = require("path");
var sim = require(path.join(__dirname, "day1_sim.js"));

var pass = 0;
var fail = 0;

function ok(cond, name) {
  if (cond) {
    pass++;
    console.log("  [ok] " + name);
  } else {
    fail++;
    console.log("  [FAIL] " + name);
  }
}

function throws(fn, name) {
  var threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
  }
  ok(threw, name);
}

console.log("day1_sim selftest\n");

// 1. Initial state: 2 zones, 2 goblins, 3 needs
var s0 = sim.makeInitialState();
ok(Object.keys(s0.zones).length === 2, "1. exactly 2 zones");
ok(Object.keys(s0.agents).length === 2, "1. exactly 2 goblins");
ok(Object.keys(s0.needs).length === 3, "1. exactly 3 needs");
ok(s0.zones.garden && s0.zones.archive, "1. Garden + Archive");
ok(s0.agents.lulu && s0.agents.bram, "1. Lulu + Bram");
ok(
  s0.needs.dry_seedlings && s0.needs.cracked_root && s0.needs.fading_memory,
  "1. three named needs"
);

// 2. Player receives exactly 2 actions
ok(s0.actionsRemaining === 2, "2. actionsRemaining === 2");
ok(sim.MAX_ACTIONS === 2, "2. MAX_ACTIONS === 2");
throws(function () {
  sim.runDay(s0, [
    { verb: "MARK", target: "cracked_root" },
    { verb: "INTERVENE", target: "dry_seedlings" },
    { verb: "INTERVENE", target: "fading_memory" },
  ]);
}, "2. third action fails closed");

// 3. MARK changes strength, does not resolve
var sMark = sim.runDay(s0, [{ verb: "MARK", target: "cracked_root" }]);
var before = s0.traces.cracked_root_warning.strength;
var after = sMark.traces.cracked_root_warning.strength;
ok(after === before + sim.MARK_DELTA, "3. MARK raises trace strength");
ok(sMark.needs.cracked_root.resolved === true, "3b. (after release Bram may resolve)");
// Pure MARK effect before release: re-check via events
var markOnlyStrength = sMark.events.some(function (e) {
  return e.kind === "TRACE_STRENGTHEN" && e.strength === before + sim.MARK_DELTA;
});
ok(markOnlyStrength, "3. TRACE_STRENGTHEN event records boost");
// MARK alone does not INTERVENE
ok(
  !sMark.events.some(function (e) {
    return e.kind === "INTERVENE" && e.needId === "cracked_root";
  }),
  "3. MARK is not INTERVENE"
);

// Isolate: MARK without agent release would need internal — prove via Path A
// that MARK event does not set resolved on the MARK target at player phase
var pathA = sim.runDay(s0, sim.pathAActions());
var playerPhaseResolvedRoot = false;
for (var i = 0; i < pathA.events.length; i++) {
  var e = pathA.events[i];
  if (e.kind === "INTERVENE" && e.needId === "cracked_root") playerPhaseResolvedRoot = true;
  if (e.kind === "BRAM_REPAIR_COMPLETE") break;
  if (e.kind === "MARK_PULSE" && e.needId === "cracked_root") {
    // after MARK pulse, need not yet resolved by player
  }
}
ok(!playerPhaseResolvedRoot, "3. player never INTERVENEs cracked_root on Path A");

// 4. Bram follows strongest warning
// Strengthen cracked_root, ensure he picks it
var sBram = sim.runDay(s0, [{ verb: "MARK", target: "cracked_root" }]);
ok(
  sBram.events.some(function (e) {
    return e.kind === "BRAM_REPAIR_COMPLETE" && e.needId === "cracked_root";
  }),
  "4. Bram repairs strongest garden warning (cracked_root)"
);

// 5. INTERVENE directly resolves
var sInt = sim.runDay(s0, [{ verb: "INTERVENE", target: "fading_memory" }]);
ok(sInt.needs.fading_memory.resolved === true, "5. INTERVENE resolves fading_memory");
ok(
  sInt.events.some(function (e) {
    return e.kind === "INTERVENE" && e.needId === "fading_memory" && e.who === "player";
  }),
  "5. INTERVENE is a player event"
);

// 6. Path A — MARK invokes Bram
var A = sim.runDay(s0, sim.pathAActions());
ok(sim.bramInvoked(A), "6. Path A invokes Bram");
ok(A.needs.cracked_root.resolved, "6. Path A cracked_root resolved");
ok(A.needs.dry_seedlings.resolved, "6. Path A dry_seedlings resolved");
ok(!A.needs.fading_memory.resolved, "6. Path A fading_memory still open");
ok(
  A.events.some(function (e) {
    return e.kind === "BRAM_REPAIR_COMPLETE" && e.needId === "cracked_root";
  }),
  "6. Bram repaired cracked_root"
);
ok(
  A.events.some(function (e) {
    return e.kind === "INTERVENE" && e.needId === "dry_seedlings";
  }),
  "6. seedlings resolved by INTERVENE"
);

// 7. Path B — double INTERVENE does not invoke Bram repair
var B = sim.runDay(s0, sim.pathBActions());
ok(!sim.bramInvoked(B), "7. Path B does not invoke Bram repair");
ok(B.needs.cracked_root.resolved, "7. Path B cracked_root resolved");
ok(B.needs.dry_seedlings.resolved, "7. Path B dry_seedlings resolved");
ok(!B.needs.fading_memory.resolved, "7. Path B fading_memory still open");
ok(
  B.events.some(function (e) {
    return e.kind === "BRAM_IDLE";
  }),
  "7. Bram idles on Path B"
);

// 8. Determinism — identical inputs → identical final state
var A2 = sim.runDay(s0, sim.pathAActions());
ok(JSON.stringify(A) === JSON.stringify(A2), "8. Path A deterministic");
var B2 = sim.runDay(s0, sim.pathBActions());
ok(JSON.stringify(B) === JSON.stringify(B2), "8. Path B deterministic");
ok(JSON.stringify(A) !== JSON.stringify(B), "8. Path A history ≠ Path B history");

// 9. Invalid actions fail closed
throws(function () {
  sim.runDay(s0, [{ verb: "BRIDGE", target: "cracked_root" }]);
}, "9. unknown verb fails");
throws(function () {
  sim.runDay(s0, [{ verb: "MARK", target: "nope" }]);
}, "9. unknown need fails");
throws(function () {
  sim.runDay(s0, [{ verb: "INTERVENE", target: "cracked_root" }, { verb: "INTERVENE", target: "cracked_root" }]);
}, "9. double resolve same need fails");
throws(function () {
  sim.runDay(null, []);
}, "9. null state fails");

// 10. No indirect resolve of fading_memory
var Amem = sim.runDay(s0, sim.pathAActions());
var Bmem = sim.runDay(s0, sim.pathBActions());
ok(!Amem.needs.fading_memory.resolved, "10. Path A does not touch fading_memory");
ok(!Bmem.needs.fading_memory.resolved, "10. Path B does not touch fading_memory");
// MARK archive memory does not summon Bram
var sMemMark = sim.runDay(s0, [{ verb: "MARK", target: "fading_memory" }]);
ok(!sMemMark.needs.fading_memory.resolved, "10. MARK fading_memory does not resolve it");
ok(
  !sMemMark.events.some(function (e) {
    return e.who === "bram" && e.needId === "fading_memory" && e.kind.indexOf("REPAIR") >= 0;
  }),
  "10. Bram never repairs Archive memory"
);

// 11. Day 1 imports no systems outside bounded module
// (static check: this test file only requires day1_sim.js)
var fs = require("fs");
var src = fs.readFileSync(path.join(__dirname, "day1_sim.js"), "utf8");
ok(
  src.indexOf("require(") === -1 && src.indexOf("import ") === -1,
  "11. day1_sim.js has no require/import (bounded module)"
);
ok(src.indexOf("combat_sidequest") === -1, "11. no combat import");
ok(src.indexOf("game.js") === -1, "11. no game.js coupling");

// 12. HTML shell / empty day — valid; P0: no free Bram
var idle = sim.runDay(s0, []);
ok(Array.isArray(idle.events), "12. zero-action day still produces state");
ok(idle.needs.dry_seedlings.resolved === false, "12. zero-action seedlings open");
ok(idle.needs.cracked_root.resolved === false, "12. P0 zero-action root NOT free-repaired");
ok(!sim.bramInvoked(idle), "12. P0 zero-action Bram not invoked");
ok(
  idle.events.some(function (e) {
    return e.kind === "BRAM_SIGNAL_FAINT" || e.kind === "BRAM_IDLE";
  }),
  "12. P0 Bram idles / signal faint on empty day"
);

// 13. P0 — MARK is required for Bram influence
ok(
  s0.traces.cracked_root_warning.strength < sim.BRAM_ACT_THRESHOLD,
  "13. P0 initial warning below Bram threshold"
);
ok(
  s0.traces.cracked_root_warning.strength + sim.MARK_DELTA >= sim.BRAM_ACT_THRESHOLD,
  "13. P0 one MARK reaches Bram threshold"
);
var onlySeed = sim.runDay(s0, [{ verb: "INTERVENE", target: "dry_seedlings" }]);
ok(
  onlySeed.needs.dry_seedlings.resolved && !onlySeed.needs.cracked_root.resolved,
  "13. P0 INTERVENE seedlings alone does not free-repair root"
);
ok(!sim.bramInvoked(onlySeed), "13. P0 no Bram without loud warning");

// Lulu never resolves
ok(
  !A.events.some(function (e) {
    return e.who === "lulu" && e.kind && e.kind.indexOf("REPAIR") >= 0;
  }) &&
    !A.events.some(function (e) {
      return e.who === "lulu" && e.kind === "INTERVENE";
    }),
  "Lulu never resolves a need"
);

// ── Day 1.1 (MARK_INTERVENE_SURFACE_CONTRACT_V0 deltas) ─────────────────

// 14. Materials: INTERVENE consumes declared cost
var sM = sim.runDay(s0, [{ verb: "INTERVENE", target: "dry_seedlings" }]);
ok(sM.materials.water === 0, "14. INTERVENE dry_seedlings consumes 1 water");
ok(sM.materials.resin === 1 && sM.materials.ink === 1, "14. other materials untouched");
ok(
  sM.events.some(function (e) { return e.kind === "INTERVENE" && e.materialSpent && e.materialSpent.material === "water"; }),
  "14. INTERVENE event records materialSpent"
);

// 15. Fail closed without materials: typed event, no mutation, no action spent
var broke = sim.makeInitialState();
broke.materials.water = 0;
var sF = sim.runDay(broke, [{ verb: "INTERVENE", target: "dry_seedlings" }]);
ok(sF.needs.dry_seedlings.condition === "active", "15. need stays active on failed INTERVENE");
ok(sF.needs.dry_seedlings.resolved === false, "15. legacy mirror stays false");
ok(
  sF.events.some(function (e) { return e.kind === "INTERVENE_FAILED" && e.reason === "INSUFFICIENT_MATERIALS"; }),
  "15. INTERVENE_FAILED typed event with reason"
);
// action not consumed: player can still act (second action in same day succeeds)
var sF2 = sim.runDay(broke, [
  { verb: "INTERVENE", target: "dry_seedlings" },
  { verb: "INTERVENE", target: "cracked_root" },
]);
ok(sF2.needs.cracked_root.condition === "inactive", "15. failed INTERVENE does not consume the action");

// 16. condition/durability split
var sC = sim.runDay(s0, [{ verb: "INTERVENE", target: "cracked_root" }]);
ok(sC.needs.cracked_root.condition === "inactive", "16. INTERVENE sets condition inactive");
ok(sC.needs.cracked_root.durability === "unknown", "16. durability stays unknown (no VERIFY yet)");
ok(sC.needs.cracked_root.addressSource.actor === "player", "16. addressSource = player");
// MARK never touches condition or materials
var sMk = sim.runDay(s0, [{ verb: "MARK", target: "fading_memory" }]);
ok(sMk.needs.fading_memory.condition === "active", "16. MARK leaves condition active");
ok(sMk.materials.water === 1 && sMk.materials.resin === 1 && sMk.materials.ink === 1,
  "16. MARK consumes no materials (support test)");

// 17. Bram capacity + provenance
var sB = sim.runDay(s0, [{ verb: "MARK", target: "cracked_root" }]);
ok(sB.agents.bram.actionsRemaining === 0, "17. Bram repair consumes HIS capacity, not player's");
ok(sB.needs.cracked_root.addressSource.actor === "bram", "17. addressSource = bram");
ok(
  sB.events.some(function (e) { return e.kind === "BRAM_REPAIR_COMPLETE" && e.ruleId === sim.BRAM_RULE_ID; }),
  "17. Bram events carry inspectable ruleId"
);
var noCap = sim.makeInitialState();
noCap.agents.bram.actionsRemaining = 0;
var sB0 = sim.runDay(noCap, [{ verb: "MARK", target: "cracked_root" }]);
ok(!sim.bramInvoked(sB0), "17. Bram with zero capacity idles even above threshold");
ok(sB0.needs.cracked_root.condition === "active", "17. need untouched when Bram lacks capacity");

// 18. No semantic promotion in event vocabulary
var allKinds = sB.events.concat(sM.events, sF.events).map(function (e) { return e.kind; });
ok(
  !allKinds.some(function (k) { return /VERIFIED|ADMITTED|CANONICAL|VALIDATED|SUCCEEDED/.test(k); }),
  "18. no event kind implies verification or admission"
);

// Print path summaries
console.log("\n--- Path A events ---\n" + sim.eventKinds(A).join(" → "));
console.log("--- Path B events ---\n" + sim.eventKinds(B).join(" → "));

console.log("\nday1_test: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
