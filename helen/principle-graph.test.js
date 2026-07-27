/* =====================================================================
   PRINCIPLE_GRAPH_V0 — proof suite (the LNOS research-engine spine).
   Synthetic principles only; no real organization, no PII. Run:
     node helen/principle-graph.test.js
   Exit 0 iff every property holds. `node` is the anchor.
   ===================================================================== */
"use strict";
var path = require("path");
var G = require(path.join(__dirname, "principle-graph.js"));

var results = {};
function log(n, p, d) { results[n] = p; console.log((p ? "PASS " : "FAIL ") + n + " — " + d); }

var INV_LINEAGE = { producer_id: "analyst", packet: "corpus_A", methods: ["cluster"], at: "2026-07-27T00:00:00Z" };
function invariant(id, withFalsifier) {
  var n = { id: id, type: "invariant", claim_status: "inferred",
    statement: "principle " + id, lineage: INV_LINEAGE, confidence: 0.5 };
  if (withFalsifier) n.falsifier = { what_would_disprove: "a lawful counterexample", tests: ["t1"] };
  return n;
}
/* an independent falsification attempt (different lineage, live probe) */
function attempt(refutes) {
  return { producer_id: "probe", input_hash: "probe_Z", method: "live_probe",
    source_class: "INDEPENDENT_RUNTIME_PROBE", observed_at: "2026-07-27T00:00:10Z",
    witness_id: "att_1", refutes: !!refutes };
}

/* ===================================================================
   PG1 — falsification protocol is mandatory: an invariant with no falsifier
   is REFUSED. "A valid claim must include a way to be wrong."
   =================================================================== */
(function () {
  var g = G.newGraph();
  var no = G.addNode(g, invariant("inv_nofals", false));
  var yes = G.addNode(g, invariant("inv_fals", true));
  log("PG1_invariant_without_falsifier_refused",
    no.ok === false && no.reason === "INVARIANT_WITHOUT_FALSIFIER" && yes.ok === true,
    "no-falsifier → refused (" + no.reason + ") ; with-falsifier → stored");
})();

/* ===================================================================
   PG2 — observed vs inferred is mandatory and preserved (no untyped node).
   =================================================================== */
(function () {
  var g = G.newGraph();
  var untyped = G.addNode(g, { id: "e1", type: "entity", statement: "x" });
  var typed = G.addNode(g, { id: "e2", type: "entity", claim_status: "observed", statement: "y" });
  log("PG2_claim_status_mandatory",
    untyped.ok === false && untyped.reason === "CLAIM_STATUS_REQUIRED" &&
    typed.ok === true && g.nodes["e2"].claim_status === "observed",
    "untyped → refused ; observed entity → stored as observed");
})();

/* ===================================================================
   PG3 — competing hypotheses COEXIST; adding a second for one phenomenon
   never evicts the first. The graph does not collapse explanations.
   =================================================================== */
(function () {
  var g = G.newGraph();
  G.addNode(g, { id: "h1", type: "hypothesis", claim_status: "inferred", phenomenon_id: "P", statement: "cause A" });
  G.addNode(g, { id: "h2", type: "hypothesis", claim_status: "inferred", phenomenon_id: "P", statement: "cause B" });
  var live = G.hypothesesFor(g, "P").map(function (h) { return h.id; }).sort();
  log("PG3_competing_hypotheses_coexist",
    live.length === 2 && live[0] === "h1" && live[1] === "h2",
    "phenomenon P holds [" + live.join(",") + "] — neither evicted");
})();

/* ===================================================================
   PG4 — the negative graph: an INDEPENDENT contradicting attempt REFUTES
   (append-only, node retained); a SAME-LINEAGE "attempt" cannot refute.
   =================================================================== */
(function () {
  var g = G.newGraph();
  G.addNode(g, invariant("inv_A", true));
  var sameLineage = { producer_id: "analyst", input_hash: "corpus_A", method: "cluster",
    source_class: "INDEPENDENT_RUNTIME_PROBE", observed_at: "2026-07-27T00:00:10Z", witness_id: "x", refutes: true };
  var badAttempt = G.attemptFalsification(g, "inv_A", sameLineage);
  var goodAttempt = G.attemptFalsification(g, "inv_A", attempt(true));
  var retained = !!g.nodes["inv_A"];
  log("PG4_only_independent_attempt_can_refute",
    badAttempt.ok === false && badAttempt.reason === "ATTEMPT_NOT_INDEPENDENT" &&
    goodAttempt.result === "REFUTED" && g.nodes["inv_A"].status === "REFUTED" && retained,
    "same-lineage attempt → " + badAttempt.reason + " ; independent contradiction → " + goodAttempt.result + " (node retained)");
})();

/* ===================================================================
   PG5 — THE MISSION'S SUCCESS CRITERION, PROVEN: explanatory power counts
   SURVIVING FALSIFIABLE invariants, NOT node count. Volume adds nothing.
   =================================================================== */
(function () {
  var g = G.newGraph();
  var power0 = G.explanatoryPower(g);
  /* dump 100 unfalsifiable "principles" — all refused; node count unchanged */
  for (var i = 0; i < 100; i++) G.addNode(g, invariant("vol_" + i, false));
  var powerAfterVolume = G.explanatoryPower(g);
  var countAfterVolume = G.nodeCount(g);
  /* add ONE falsifiable invariant, then an independent surviving test */
  G.addNode(g, invariant("inv_real", true));
  var powerUntested = G.explanatoryPower(g);           /* still 0 — untested is a candidate */
  G.attemptFalsification(g, "inv_real", attempt(false)); /* survives */
  var powerTested = G.explanatoryPower(g);
  log("PG5_explanatory_power_is_not_volume",
    power0 === 0 && powerAfterVolume === 0 && countAfterVolume === 0 &&
    powerUntested === 0 && powerTested === 1,
    "100 unfalsifiable adds → power " + powerAfterVolume + " nodes " + countAfterVolume +
    " ; 1 tested-surviving → power " + powerTested);
})();

/* ===================================================================
   PG6 — epochs / ontology change are explicit and append-only (versioning).
   =================================================================== */
(function () {
  var g = G.newGraph();
  var e1 = G.newEpoch(g, [{ change: "add_type", type: "ritual" }]);
  var e2 = G.newEpoch(g, [{ change: "rename", from: "method", to: "practice" }]);
  log("PG6_epochs_are_explicit_and_append_only",
    e1 === 1 && e2 === 2 && g.epochs.length === 3 &&
    g.epochs[1].ontology_changes.length === 1 && g.epochs[2].ontology_changes[0].change === "rename",
    "epochs=[0,1,2] with recorded ontology changes");
})();

/* ===================================================================
   PG7 — determinism / purity (scan code, not prose).
   =================================================================== */
(function () {
  var fs = require("fs");
  var code = fs.readFileSync(path.join(__dirname, "principle-graph.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("PG7_engine_is_deterministic_no_clock_no_random_no_net", clean,
    clean ? "no clock/random/network in code" : "IMPURITY FOUND");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
