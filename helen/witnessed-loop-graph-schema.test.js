/* =====================================================================
   WITNESSED_LOOP_GRAPH_SCHEMA_V0 — proof suite.
   Pure, deterministic, no network/LLM/clock. Run:
     node helen/witnessed-loop-graph-schema.test.js
   Exit 0 iff every graph property holds. `node` is the anchor.
   ===================================================================== */
"use strict";
var path = require("path");
var G = require(path.join(__dirname, "witnessed-loop-graph-schema.js"));

var results = {};
function log(n, p, d) { results[n] = p; console.log((p ? "PASS " : "FAIL ") + n + " — " + d); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

/* ---- fixtures ---- */
var CLAIM_LINEAGE = { model_family: "qwen3.5", prompt_lineage: "prompt_hash:abc", retrieval_lineage: ["packet_001"] };

function claimEvent(value) {
  return { kind: "CLAIM_PROPOSED", claim: {
    claim_id: "claim_model_001", claim_type: "ACTIVE_MODEL", subject: "helen-kernel:8780",
    value: value || "gemma-4-26b", producer_id: "runtime-interpreter",
    source_packet_hash: "packet_hash_A", derivation_methods: ["log_scrape", "prose_inference"],
    lineage: CLAIM_LINEAGE, created_at: "2026-07-19T18:00:00Z" } };
}
/* reviewers that share the claim's exact lineage — one epistemic source, many names */
function sharedReviewEvents(n) {
  var out = [];
  for (var i = 0; i < n; i++) out.push({ kind: "REVIEW_ADDED", review: {
    review_id: "review_" + i, claim_id: "claim_model_001", verdict: "SUPPORT",
    source_packet_hash: "packet_hash_A", lineage: CLAIM_LINEAGE } });
  return out;
}
/* a genuinely independent witness: different lineage, live probe, post-dates */
function indepWitnessEvent(value, overrides) {
  return { kind: "WITNESS_OBSERVED", witness: Object.assign({
    witness_id: "witness_001", claim_id: "claim_model_001", method: "live_inference_metadata",
    observed_value: value || "gemma-4-26b", observed_at: "2026-07-19T18:00:05Z",
    source_class: "INDEPENDENT_RUNTIME_PROBE", producer_id: "runtime-probe",
    input_hash: "probe_hash_Z", content_hash: "sha256:beef",
    lineage: { model_family: "deterministic-probe", prompt_lineage: "∅", retrieval_lineage: ["live"] }
  }, overrides || {}) };
}
/* a SPOOFED witness: fakes the seam fields but carries the claim's own lineage */
function spoofWitnessEvent() {
  return { kind: "WITNESS_OBSERVED", witness: {
    witness_id: "witness_spoof", claim_id: "claim_model_001", method: "live_inference_metadata",
    observed_value: "gemma-4-26b", observed_at: "2026-07-19T18:00:05Z",
    source_class: "INDEPENDENT_RUNTIME_PROBE", producer_id: "impostor", input_hash: "different_looking",
    lineage: CLAIM_LINEAGE /* <-- but the epistemic signature is the claim's own */ } };
}

/* ===================================================================
   G1 — fold determinism: fold twice → identical; nothing is lost.
   =================================================================== */
(function () {
  var events = [claimEvent()].concat(sharedReviewEvents(3), [indepWitnessEvent()]);
  var a = G.foldGraph(events), b = G.foldGraph(events);
  log("G1_fold_is_replay_deterministic",
    eq(a, b) && a.log.length === events.length && Object.keys(a.claims).length === 1,
    "fold≡fold, log preserved (" + a.log.length + " events)");
})();

/* ===================================================================
   G2 — epistemic-component grouping: 10 differently-named reviewers with
   the claim's lineage collapse into ONE component (with the claim).
   =================================================================== */
(function () {
  var g = G.foldGraph([claimEvent()].concat(sharedReviewEvents(10)));
  var comp = G.epistemicComponent(g, "claim_model_001");
  log("G2_same_lineage_collapses_to_one_component",
    comp.members.length === 11,   /* claim + 10 reviews, all one source */
    "10 named reviewers + claim → 1 epistemic component of " + comp.members.length + " nodes");
})();

/* ===================================================================
   G3 — graph anchor-cut ADMIT: an independent witness (different
   component) confirms. Expected ADMIT, admittable, not auto-canon.
   =================================================================== */
(function () {
  var g = G.foldGraph([claimEvent()].concat(sharedReviewEvents(5), [indepWitnessEvent()]));
  var d = G.graphReduce(g, "claim_model_001", {});
  log("G3_independent_confirmation_admits",
    d.result === "ADMIT" && d.admittable === true && d.canon_effect === false,
    "→ " + d.result + " (admittable, canon_effect=" + d.canon_effect + ")");
})();

/* ===================================================================
   G4 — graph anchor-cut HOLD + dangerous-structure detector: all
   confirmation shares one lineage → self-confirming SCC, no anchor.
   =================================================================== */
(function () {
  var g = G.foldGraph([claimEvent()].concat(sharedReviewEvents(10)));
  var d = G.graphReduce(g, "claim_model_001", {});
  var dangerous = G.allConfirmationSharesLineage(g, "claim_model_001");
  log("G4_self_confirming_scc_holds_and_is_flagged",
    d.result === "HOLD" && eq(d.reason_codes, ["NO_INDEPENDENT_ANCHOR"]) && dangerous === true,
    "10 same-lineage confirmers → " + d.result + " ; dangerous_scc=" + dangerous);
})();

/* ===================================================================
   G5 — SPOOF DEFENCE: a witness that fakes the seam fields but carries the
   claim's lineage is NOT independent at graph level (the schema's added
   lock over the seam). Expected HOLD, not ADMIT.
   =================================================================== */
(function () {
  var g = G.foldGraph([claimEvent()].concat(sharedReviewEvents(3), [spoofWitnessEvent()]));
  var claim = g.claims["claim_model_001"];
  var spoof = g.witnesses["witness_spoof"];
  var indep = G.independentInGraph(claim, spoof);
  var d = G.graphReduce(g, "claim_model_001", {});
  log("G5_lineage_spoof_is_caught_at_graph_level",
    indep === false && d.result === "HOLD",
    "spoofed 'independent' witness with claim's lineage → independent=" + indep + " → " + d.result);
})();

/* ===================================================================
   G6 — graph anchor-cut REJECT: independent witness contradicts.
   =================================================================== */
(function () {
  var g = G.foldGraph([claimEvent("gemma-4-26b")].concat(sharedReviewEvents(10), [indepWitnessEvent("qwen3.5:4b")]));
  var d = G.graphReduce(g, "claim_model_001", {});
  log("G6_independent_contradiction_rejects",
    d.result === "REJECT" && eq(d.reason_codes, ["ANCHOR_CONTRADICTION"]),
    "10 agree, independent probe disagrees → " + d.result);
})();

/* ===================================================================
   G7 — SUPERSEDE / rollback (append-only): a claim admitted, then a later
   independent anchor contradicts → CLAIM_SUPERSEDED appended. The claim is
   SUPERSEDED but the original claim, decision and evidence remain in the log.
   =================================================================== */
(function () {
  /* admit first (independent confirmation) */
  var events = [claimEvent()].concat(sharedReviewEvents(3), [indepWitnessEvent()]);
  var g1 = G.foldGraph(events);
  var d1 = G.graphReduce(g1, "claim_model_001", {});
  events.push(G.decisionEvent(d1));                                    /* receipt appended */
  /* later: the world changed; a fresh independent probe contradicts */
  events.push(indepWitnessEvent("qwen3.5:4b", { witness_id: "witness_later", observed_at: "2026-07-19T19:00:00Z" }));
  var g2 = G.foldGraph(events);
  var d2 = G.graphReduce(g2, "claim_model_001", {});                   /* now REJECT */
  events.push(G.decisionEvent(Object.assign({ decision_id: "decision_002" }, d2)));
  events.push(G.supersedeEvent("claim_model_001", "decision_002", "ANCHOR_CONTRADICTION_POST_ADMISSION"));
  var g3 = G.foldGraph(events);
  var c = g3.claims["claim_model_001"];
  var originalDecisionSurvives = g3.decisions.some(function (d) { return d.result === "ADMIT"; });
  var originalWitnessSurvives = !!g3.witnesses["witness_001"];
  log("G7_supersede_is_append_only_nothing_deleted",
    c.status === "SUPERSEDED" && c.superseded_by === "decision_002" &&
    originalDecisionSurvives && originalWitnessSurvives && g3.log.length === events.length,
    "status=" + c.status + " ; original ADMIT + evidence still in log (" + g3.log.length + " events)");
})();

/* ===================================================================
   G8 — replay after supersede reproduces SUPERSEDED status byte-identically.
   =================================================================== */
(function () {
  var events = [claimEvent()].concat(sharedReviewEvents(3), [indepWitnessEvent()]);
  var d1 = G.graphReduce(G.foldGraph(events), "claim_model_001", {});
  events.push(G.decisionEvent(d1));
  events.push(G.supersedeEvent("claim_model_001", "decision_001", "reason"));
  var a = G.foldGraph(events), b = G.foldGraph(events);
  log("G8_replay_after_supersede_deterministic",
    eq(a, b) && a.claims["claim_model_001"].status === "SUPERSEDED",
    "fold≡fold with supersede; status=" + a.claims["claim_model_001"].status);
})();

/* ===================================================================
   G9 — the module carries no clock/random/network (source-level check),
   so the fold is genuinely replay-safe and `node` is a valid anchor.
   =================================================================== */
(function () {
  var fs = require("fs");
  var src = fs.readFileSync(path.join(__dirname, "witnessed-loop-graph-schema.js"), "utf8");
  /* scan CODE, not prose: strip block + line comments first (else the very
     comment boasting "no Date.now()" trips the check). */
  var code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("G9_schema_is_deterministic_no_clock_no_random_no_net", clean,
    clean ? "no Date.now / Math.random / network in code" : "IMPURITY FOUND");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
