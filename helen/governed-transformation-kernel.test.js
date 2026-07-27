/* =====================================================================
   GOVERNED_TRANSFORMATION_KERNEL_V0 — proof suite.
   Includes the Director's minimum acceptance test verbatim. Pure,
   deterministic. Run:  node helen/governed-transformation-kernel.test.js
   Exit 0 iff every invariant holds. `node` is the anchor.
   ===================================================================== */
"use strict";
var path = require("path");
var K = require(path.join(__dirname, "governed-transformation-kernel.js"));

var results = {};
function log(n, p, d) { results[n] = p; console.log((p ? "PASS " : "FAIL ") + n + " — " + d); }

/* a parent object with a stable epistemic lineage */
function parent() {
  return { id: "obj_1", producer_id: "interp", source_packet_hash: "packet_A",
    derivation_methods: ["prose_inference"], created_at: "2026-07-27T00:00:00Z" };
}
/* a genuinely independent, different-process witness (post-dates the object) */
function goodWitness() {
  return { producer_id: "probe", input_hash: "probe_Z", method: "live_probe",
    source_class: "INDEPENDENT_RUNTIME_PROBE", observed_at: "2026-07-27T00:00:10Z", process_id: "pid_probe" };
}
var REDUCER = { actor_id: "reducer_org", organ: "REDUCER", process_id: "pid_reducer" };
var PRODUCER = { actor_id: "producer_org", organ: "PARSER", process_id: "pid_producer" };

/* ===================================================================
   K1 — THE MINIMUM ACCEPTANCE TEST (Director, verbatim):
   Given a model_output rendered as command_output,
     TYPE detects provenance mismatch
     AND LAW denies promotion
     AND LOOP exits fail-closed
     AND RECEIPT records the rejection
     AND the parent object remains unchanged.
   =================================================================== */
(function () {
  var obj = parent();
  var req = {
    object: obj,
    proposed_effect: { effect: "admit", render_form: "command_output", requires_operator: true },
    actual_origin: { source_class: "model_output" },      /* the costume: model wearing command */
    producer: PRODUCER, authorizer: REDUCER, witness: goodWitness(),
    operator_decision: "GO", mutation_mode: "append"
  };
  var r = K.transform(req);
  var typeCaught = r.keys.TYPE.ok === false && r.keys.TYPE.reason === "PROVENANCE_MISMATCH";
  var failClosed = r.outcome === "REJECT";
  var receiptRecords = r.receipt.outcome === "REJECT" && r.receipt.reason_codes.indexOf("PROVENANCE_MISMATCH") !== -1;
  var parentUnchanged = r.receipt.parent_unchanged === true && JSON.stringify(r.parent) === JSON.stringify(parent());
  log("K1_minimum_acceptance_source_class_forgery_rejected",
    typeCaught && failClosed && receiptRecords && parentUnchanged,
    "TYPE=" + r.keys.TYPE.reason + " outcome=" + r.outcome + " receipted=" + receiptRecords + " parent_unchanged=" + parentUnchanged);
})();

/* ===================================================================
   K2 — NO_LOCAL_SELF_PROMOTION: one actor as producer+authorizer+witness
   cannot drive ADMIT, at any multiplicity. Promotion exists only in the
   composition of distinct authorities.
   =================================================================== */
(function () {
  var base = { object: parent(),
    proposed_effect: { effect: "admit", render_form: "model_narration", requires_operator: false },
    actual_origin: { source_class: "model_output" }, mutation_mode: "append" };
  log("K2_no_local_self_promotion", K.noLocalSelfPromotion(base) === true,
    "single actor holding all keys → " + (K.noLocalSelfPromotion(base) ? "REJECT (composition required)" : "ADMIT (BUG)"));
})();

/* ===================================================================
   K3 — NO_SELF_WITNESS_UPGRADE: an actor may not witness its own output;
   same_process is a relation, not a witness. (The operator's own
   correction #1 — "5/5 witnessed" by the actor who ran the retrofit is
   SAME_PROCESS → USER_REPORTED_RETROACTIVE_PASS, not a witness.)
   =================================================================== */
(function () {
  var obj = parent();
  var sameProc = { producer_id: "probe", input_hash: "probe_Z", method: "live_probe",
    source_class: "INDEPENDENT_RUNTIME_PROBE", observed_at: "2026-07-27T00:00:10Z", process_id: "pid_producer" };
  var req = { object: obj,
    proposed_effect: { effect: "admit", render_form: "model_narration", requires_operator: false },
    actual_origin: { source_class: "model_output" },
    producer: PRODUCER, authorizer: REDUCER, witness: sameProc, mutation_mode: "append" };
  var r = K.transform(req);
  var rel = K.witnessRelation(PRODUCER, sameProc);
  log("K3_no_self_witness_upgrade",
    rel === "SAME_PROCESS" && r.outcome === "REJECT" && r.keys.LOOP.reason === "SELF_WITNESS",
    "relation=" + rel + " → " + r.outcome + " (" + r.keys.LOOP.reason + ")");
})();

/* ===================================================================
   K4 — NO_IN_PLACE_AUTHORITY_MUTATION: correct(event) := append. An
   in-place authority raise is denied; only appended correction is lawful.
   =================================================================== */
(function () {
  var req = { object: parent(),
    proposed_effect: { effect: "admit", render_form: "model_narration", requires_operator: false },
    actual_origin: { source_class: "model_output" },
    producer: PRODUCER, authorizer: REDUCER, witness: goodWitness(), mutation_mode: "in_place" };
  var r = K.transform(req);
  log("K4_no_in_place_authority_mutation",
    r.outcome === "REJECT" && r.keys.LAW.reason === "IN_PLACE_AUTHORITY_MUTATION",
    "mutation_mode=in_place → " + r.outcome + " (" + r.keys.LAW.reason + ")");
})();

/* ===================================================================
   K5 — NO_UNRECEIPTED_STATE_CHANGE: every outcome, admit OR reject, emits
   a replayable receipt naming the parent-unchanged fact.
   =================================================================== */
(function () {
  var reject = K.transform({ object: parent(),
    proposed_effect: { effect: "admit", render_form: "command_output", requires_operator: false },
    actual_origin: { source_class: "model_output" },
    producer: PRODUCER, authorizer: REDUCER, witness: goodWitness(), mutation_mode: "append" });
  var admit = K.transform({ object: parent(),
    proposed_effect: { effect: "admit", render_form: "model_narration", requires_operator: false },
    actual_origin: { source_class: "model_output" },
    producer: PRODUCER, authorizer: REDUCER, witness: goodWitness(), mutation_mode: "append" });
  log("K5_no_unreceipted_state_change",
    reject.receipt.event === "GOVERNED_TRANSFORM" && reject.receipt.replayable === true &&
    admit.receipt.event === "GOVERNED_TRANSFORM" && admit.receipt.replayable === true &&
    reject.receipt.parent_unchanged === true && admit.receipt.parent_unchanged === true,
    "reject receipted=" + (reject.receipt.event === "GOVERNED_TRANSFORM") + " admit receipted=" + (admit.receipt.event === "GOVERNED_TRANSFORM"));
})();

/* ===================================================================
   K6 — THE FULL LAWFUL PATH: honest command_output + distinct authorities
   + independent different-process witness + operator GO → ADMIT, receipt,
   parent unchanged.
   =================================================================== */
(function () {
  var req = { object: parent(),
    proposed_effect: { effect: "admit", render_form: "command_output", requires_operator: true },
    actual_origin: { source_class: "command_execution" },   /* honestly a real run */
    producer: PRODUCER, authorizer: REDUCER, witness: goodWitness(),
    operator_decision: "GO", mutation_mode: "append" };
  var r = K.transform(req);
  log("K6_full_lawful_path_admits",
    r.outcome === "ADMIT" && r.keys.TYPE.ok && r.keys.LAW.ok && r.keys.LOOP.ok &&
    r.receipt.parent_unchanged === true,
    "all four keys held → " + r.outcome + " (receipt " + r.receipt.reason_codes.join(",") + ")");
})();

/* ===================================================================
   K7 — CHRONOS is a SCHEMA check, not a wisdom call: even a maximally
   plausible model_output is rejected purely because claimed_source_class
   ≠ witnessed_source_class. No evaluator judgement is consulted.
   =================================================================== */
(function () {
  var t = K.keyTYPE({ proposed_effect: { render_form: "command_output" },
    actual_origin: { source_class: "model_output" } });
  var honest = K.keyTYPE({ proposed_effect: { render_form: "model_narration" },
    actual_origin: { source_class: "model_output" } });
  log("K7_type_costume_is_schema_not_wisdom",
    t.ok === false && t.reason === "PROVENANCE_MISMATCH" && honest.ok === true,
    "model-as-command → " + t.reason + " ; model-as-narration → " + honest.reason);
})();

/* ===================================================================
   K8 — determinism / purity (scan code, not prose).
   =================================================================== */
(function () {
  var fs = require("fs");
  var code = fs.readFileSync(path.join(__dirname, "governed-transformation-kernel.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("K8_kernel_is_deterministic_no_clock_no_random_no_net", clean,
    clean ? "no clock/random/network in code" : "IMPURITY FOUND");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
