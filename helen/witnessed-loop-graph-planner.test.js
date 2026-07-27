/* =====================================================================
   WITNESSED_LOOP_GRAPH_DISTINCTION_PLANNER_V0 — proof suite.
   Pure, deterministic, no network/LLM/clock. Run:
     node helen/witnessed-loop-graph-planner.test.js
   Exit 0 iff every property holds. `node` is the anchor.
   ===================================================================== */
"use strict";
var path = require("path");
var P = require(path.join(__dirname, "witnessed-loop-graph-planner.js"));

var results = {};
function log(n, p, d) { results[n] = p; console.log((p ? "PASS " : "FAIL ") + n + " — " + d); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

/* the research task from the spec, fully anchored */
function fullTask() {
  return {
    task_id: "research_017",
    required_distinctions: [
      "reported_vs_observed", "exists_vs_supports", "correlated_vs_independent",
      "supported_vs_current", "clear_vs_correct", "produced_vs_verified", "reported_vs_admitted"
    ],
    available_anchors: [
      "independent_probe", "deterministic_check", "temporal_probe", "human_objective"
    ]
  };
}

/* ===================================================================
   D1 — the planner emits the MINIMAL loop set (deduped), one entry per
   loop even when several distinctions share it.
   =================================================================== */
(function () {
  var pl = P.plan(fullTask());
  var loopIds = pl.loops.map(function (l) { return l.loop; }).sort();
  /* source_witness_loop separates BOTH reported_vs_observed and exists_vs_supports;
     audit_loop separates BOTH clear_vs_correct and produced_vs_verified → deduped */
  var swl = pl.loops.filter(function (l) { return l.loop === "source_witness_loop"; })[0];
  var audit = pl.loops.filter(function (l) { return l.loop === "audit_loop"; })[0];
  log("D1_minimal_deduped_loop_set",
    pl.loops.length === 5 && swl.separates.length === 2 && audit.separates.length === 2,
    "loops=[" + loopIds.join(",") + "] ; source_witness separates " + swl.separates.length);
})();

/* ===================================================================
   D2 — a fully-anchored task is PLAN_ADMISSIBLE.
   =================================================================== */
(function () {
  var pl = P.plan(fullTask());
  log("D2_fully_anchored_plan_admissible",
    pl.admissible === true && pl.verdict === "PLAN_ADMISSIBLE" && pl.unseparated_distinctions.length === 0,
    "→ " + pl.verdict);
})();

/* ===================================================================
   D3 — THE INVERSION, PROVEN: adding same-lineage producers separates
   ZERO required distinctions. More agents ≠ more truth.
   =================================================================== */
(function () {
  var task = fullTask();
  var sep0 = P.distinctionsSeparatedByProducers(task, 0);
  var sep20 = P.distinctionsSeparatedByProducers(task, 20);
  var sep1000 = P.distinctionsSeparatedByProducers(task, 1000);
  var producerIsNotAnAnchor =
    Object.keys(P.INDEPENDENT_ANCHOR_CLASSES).indexOf("producer") === -1;
  log("D3_more_producers_separate_nothing",
    sep0 === 0 && sep20 === 0 && sep1000 === 0 && producerIsNotAnAnchor,
    "producers separate 0/20/1000 → " + sep0 + "/" + sep20 + "/" + sep1000 + " ; 'producer' is not an anchor class");
})();

/* ===================================================================
   D4 — a required distinction with NO available anchor is UNSEPARABLE;
   the plan refuses admission (it will not promise to tell the states apart).
   =================================================================== */
(function () {
  var task = fullTask();
  task.available_anchors = ["deterministic_check", "temporal_probe", "human_objective"]; /* drop independent_probe */
  var pl = P.plan(task);
  var offenders = pl.unseparated_distinctions.map(function (u) { return u.distinction; }).sort();
  log("D4_missing_anchor_makes_plan_inadmissible",
    pl.admissible === false && pl.verdict === "UNSEPARABLE_DISTINCTION" &&
    eq(offenders, ["exists_vs_supports", "reported_vs_observed"]) &&
    pl.unseparated_distinctions.every(function (u) { return u.reason === "ANCHOR_UNAVAILABLE"; }),
    "dropping independent_probe → " + pl.verdict + " ; offenders=[" + offenders.join(",") + "]");
})();

/* ===================================================================
   D5 — an unknown distinction is refused (the planner never guesses a
   separator it does not have).
   =================================================================== */
(function () {
  var pl = P.plan({ task_id: "t", required_distinctions: ["exists_vs_supports", "vibes_vs_truth"],
    available_anchors: ["independent_probe"] });
  log("D5_unknown_distinction_refused",
    pl.admissible === false && pl.verdict === "UNKNOWN_DISTINCTION" &&
    eq(pl.unknown_distinctions, ["vibes_vs_truth"]),
    "→ " + pl.verdict + " unknown=[" + pl.unknown_distinctions.join(",") + "]");
})();

/* ===================================================================
   D6 — every loop the planner emits carries an INDEPENDENT anchor class;
   none is separable by producer consensus. (Structural guarantee.)
   =================================================================== */
(function () {
  var pl = P.plan(fullTask());
  var allIndependent = pl.loops.every(function (l) { return l.anchors_independent === true; });
  log("D6_every_emitted_loop_has_an_independent_anchor", allIndependent,
    "loops all anchored on independent evidence: " + allIndependent);
})();

/* ===================================================================
   D7 — determinism: plan(task) is a pure function of the task; identical
   input → identical output; and the module carries no clock/random/net.
   =================================================================== */
(function () {
  var a = P.plan(fullTask()), b = P.plan(fullTask());
  var fs = require("fs");
  var code = fs.readFileSync(path.join(__dirname, "witnessed-loop-graph-planner.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("D7_planner_is_deterministic_and_pure", eq(a, b) && clean,
    "plan≡plan=" + eq(a, b) + " ; no clock/random/net=" + clean);
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
