/* =====================================================================
   EVOLUTION_KERNEL_V0 — proof suite. Synthetic genomes only; no real org,
   no PII, no named people. Run:  node helen/evolution-kernel.test.js
   Exit 0 iff every property holds. `node` is the anchor.
   ===================================================================== */
"use strict";
var path = require("path");
var E = require(path.join(__dirname, "evolution-kernel.js"));

var results = {};
function log(n, p, d) { results[n] = p; console.log((p ? "PASS " : "FAIL ") + n + " — " + d); }

var LAW_LINEAGE = { producer_id: "analyst", packet: "corpus_A", methods: ["compare"], at: "2026-07-27T00:00:00Z" };
function indep(id) {
  return { producer_id: "probe_" + (id || 1), input_hash: "probe_Z_" + (id || 1), method: "field_observation",
    source_class: "INDEPENDENT_RUNTIME_PROBE", observed_at: "2026-07-27T00:00:10Z" };
}
/* an abstract, fully-slotted genome (synthetic — "service→platform" shape) */
function goodGenome(id) {
  return { id: id || "gen_1", start_state: "service_offering", trigger: "demand_scale",
    constraint: "margin_pressure", new_capability: "productized_platform", mutation: "repeatable_delivery",
    stable_invariant: "capability_outlives_project", evidence: ["case_x", "case_y"], maturity: "observed",
    lineage: LAW_LINEAGE };
}

/* ===================================================================
   EK1 — a genome missing a slot or evidence is REFUSED (genome is a
   structured object, not a document).
   =================================================================== */
(function () {
  var full = E.makeGenome(goodGenome());
  var noInv = goodGenome(); delete noInv.stable_invariant;
  var noEv = goodGenome(); noEv.evidence = [];
  var r1 = E.makeGenome(noInv), r2 = E.makeGenome(noEv);
  log("EK1_genome_wellformedness_enforced",
    full.ok === true && r1.ok === false && r1.missing === "stable_invariant" && r2.ok === false && r2.reason === "GENOME_WITHOUT_EVIDENCE",
    "full ok ; missing-slot → " + r1.reason + " ; no-evidence → " + r2.reason);
})();

/* ===================================================================
   EK2 — genome comparison: a case matching trigger + stable_invariant fits
   high; a divergent case fits low. New projects are compared, not stored.
   =================================================================== */
(function () {
  var gm = E.makeGenome(goodGenome()).genome;
  var match = { trigger: "demand_scale", constraint: "margin_pressure", stable_invariant: "capability_outlives_project" };
  var miss = { trigger: "founder_exit", constraint: "regulation", stable_invariant: "brand_dissolves" };
  var mFit = E.matchGenome(match, gm).fit, xFit = E.matchGenome(miss, gm).fit;
  log("EK2_genome_comparison_scores_fit", mFit === 1 && xFit === 0,
    "matching case fit=" + mFit + " ; divergent case fit=" + xFit);
})();

/* ===================================================================
   EK3 — capability transfer log: a transfer to a NEW context is logged; a
   "transfer" with no movement (from==to) is refused. Learning by movement.
   =================================================================== */
(function () {
  var lg = E.newTransferLog();
  var moved = E.logTransfer(lg, { capability: "formulation_science", from_context: "org_A", to_context: "org_B",
    mutation: "retail_scale", witness: indep(1), origin_lineage: LAW_LINEAGE });
  var still = E.logTransfer(lg, { capability: "formulation_science", from_context: "org_A", to_context: "org_A" });
  log("EK3_transfer_requires_movement",
    moved.ok === true && still.ok === false && still.reason === "NO_MOVEMENT" && lg.transfers.length === 1,
    "A→B logged ; A→A → " + still.reason);
})();

/* ===================================================================
   EK4 — CONSERVATION / SURVIVAL SCORE: a structure that survives 5 DISTINCT
   independent contexts scores 5; restating a counted context adds 0; a
   same-lineage observation does not count. Survival is not usage.
   =================================================================== */
(function () {
  var law = E.makeConservedStructure("trust_fabric", LAW_LINEAGE);
  var s = 0;
  for (var i = 1; i <= 5; i++) s = E.observeSurvival(law, "context_" + i, indep(i)).survival_score || s;
  var repeat = E.observeSurvival(law, "context_1", indep(99));           /* already counted */
  var sameLineage = E.observeSurvival(law, "context_6",
    { producer_id: "analyst", input_hash: "corpus_A", method: "compare", source_class: "INDEPENDENT_RUNTIME_PROBE", observed_at: "2026-07-27T00:00:10Z" });
  log("EK4_survival_counts_distinct_independent_contexts",
    law.survival_score === 5 && repeat.reason === "CONTEXT_ALREADY_COUNTED" && sameLineage.reason === "OBSERVATION_NOT_INDEPENDENT",
    "5 distinct → score " + law.survival_score + " ; restate → " + repeat.reason + " ; same-lineage → " + sameLineage.reason);
})();

/* ===================================================================
   EK5 — SURVIVAL ≠ USAGE (the operator's exact metric): 100 mentions raise
   usage_count but survival_score stays 0 without new independent contexts.
   =================================================================== */
(function () {
  var law = E.makeConservedStructure("clean_semantic_layer", LAW_LINEAGE);
  for (var i = 0; i < 100; i++) E.noteUsage(law);
  log("EK5_survival_is_not_usage",
    law.usage_count === 100 && law.survival_score === 0,
    "100 mentions → usage=" + law.usage_count + " survival=" + law.survival_score);
})();

/* ===================================================================
   EK6 — MATURITY never silently upgrades: hypothesized→observed only on
   INDEPENDENT evidence; repetition never upgrades; verified needs replication.
   =================================================================== */
(function () {
  var noEv = E.upgradeMaturity("hypothesized", { independent: false });
  var toObs = E.upgradeMaturity("hypothesized", { independent: true });
  var stuck = E.upgradeMaturity("observed", { independent: true, replicated: false });
  var toVer = E.upgradeMaturity("observed", { independent: true, replicated: true });
  log("EK6_maturity_upgrades_only_on_independent_evidence",
    noEv === "hypothesized" && toObs === "observed" && stuck === "observed" && toVer === "verified",
    "no-ev→" + noEv + " ; indep→" + toObs + " ; no-replication→" + stuck + " ; replicated→" + toVer);
})();

/* ===================================================================
   EK7 — EVOLUTION KERNEL proposes the next EXPERIMENT: a falsifiable
   hypothesis (maturity=hypothesized) with a mandatory falsifier, never a
   prediction or conclusion. Memory → lab.
   =================================================================== */
(function () {
  var lib = [E.makeGenome(goodGenome("gen_1")).genome];
  var partial = { trigger: "demand_scale", constraint: "margin_pressure", stable_invariant: "capability_outlives_project" };
  var p = E.proposeNextExperiment(partial, lib);
  var none = E.proposeNextExperiment({ trigger: "unrelated" }, lib);
  log("EK7_kernel_proposes_falsifiable_experiment_not_prediction",
    p.ok === true && p.experiment.maturity === "hypothesized" &&
    !!p.experiment.falsifier.what_would_disprove && p.experiment.falsifier.tests.length > 0 &&
    none.ok === false && none.reason === "NO_MATCHING_GENOME",
    "→ hypothesis(maturity=" + p.experiment.maturity + ", has_falsifier=true) ; no-match → " + none.reason);
})();

/* ===================================================================
   EK8 — determinism / purity (scan code, not prose).
   =================================================================== */
(function () {
  var fs = require("fs");
  var code = fs.readFileSync(path.join(__dirname, "evolution-kernel.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("EK8_kernel_is_deterministic_no_clock_no_random_no_net", clean,
    clean ? "no clock/random/network in code" : "IMPURITY FOUND");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
