/* =====================================================================
   WITNESSED_LOOP_GRAPH_SEAM_V0 — the anchor-cut proof suite.
   Pure, deterministic, no network, no LLM, no clock. Run:  node helen/witnessed-loop-graph-seam.test.js
   Exit 0 iff every property holds. These assertions ARE the independent
   anchor — the seam is proven by node, not by agent consensus.
   ===================================================================== */
"use strict";
var path = require("path");
var S = require(path.join(__dirname, "witnessed-loop-graph-seam.js"));

var results = {};
function log(name, pass, detail) {
  results[name] = pass;
  console.log((pass ? "PASS " : "FAIL ") + name + " — " + detail);
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

/* ---- the one research claim, made from runtime output (PRODUCER) ---- */
function makeClaim(overrides) {
  return Object.assign({
    claim_id: "claim_model_001",
    claim_type: "ACTIVE_MODEL",
    subject: "helen-kernel:8780",
    value: "gemma-4-26b",                 /* what the producer BELIEVES is serving */
    producer_id: "runtime-interpreter",
    source_packet_hash: "packet_hash_A",  /* the single packet the producer read */
    derivation_methods: ["log_scrape", "prose_inference"],
    created_at: "2026-07-19T18:00:00Z",
    status: "PROPOSED",
    authority: "NONE"
  }, overrides || {});
}

/* ten reviewers that ALL agree — but every one consumed the same packet.
   Nominal count 10; epistemic count 1. */
function sharedLineageReviews(n, verdict) {
  var out = [];
  for (var i = 0; i < n; i++) {
    out.push({ reviewer_id: "reviewer_" + i, verdict: verdict || "SUPPORT",
      model_family: "qwen3.5", source_packet_hash: "packet_hash_A" });
  }
  return out;
}

/* an INDEPENDENT witness: different producer, different input, different
   method, live probe. It is the only thing that can close the gate. */
function independentWitness(overrides) {
  return Object.assign({
    witness_id: "witness_001",
    claim_id: "claim_model_001",
    method: "live_inference_metadata",              /* not in the claim's derivation_methods */
    observed_value: "gemma-4-26b",                  /* agrees, by default */
    observed_at: "2026-07-19T18:00:05Z",            /* after the claim */
    source_class: "INDEPENDENT_RUNTIME_PROBE",
    producer_id: "runtime-probe",                   /* != claim.producer_id */
    input_hash: "probe_hash_Z",                     /* != claim.source_packet_hash */
    content_hash: "sha256:deadbeef",
    authority: "EVIDENCE_ONLY"
  }, overrides || {});
}

/* a FAKE witness that is really the same epistemic source wearing a badge:
   same input packet + a model-derived method already in the claim's lineage. */
function sameLineageWitness(overrides) {
  return Object.assign(independentWitness(), {
    witness_id: "witness_fake_002",
    producer_id: "runtime-interpreter",   /* SAME as the claim producer */
    input_hash: "packet_hash_A",          /* SAME packet the claim read */
    method: "prose_inference"             /* already a claim derivation_method */
  }, overrides || {});
}

/* ===================================================================
   T1 — Consensus without anchor. Many agents agree; all share one source.
   Expected: HOLD / NO_INDEPENDENT_ANCHOR.
   =================================================================== */
(function () {
  var claim = makeClaim();
  var d = S.reduceClaim(claim, sharedLineageReviews(10, "SUPPORT"), [], {});
  log("T1_consensus_without_anchor_holds",
    d.result === "HOLD" && eq(d.reason_codes, ["NO_INDEPENDENT_ANCHOR"]) && d.canon_effect === false,
    "10 SUPPORT reviews, 0 witnesses → " + d.result + " " + d.reason_codes);
})();

/* ===================================================================
   T2 — Nominally different agents, same lineage. A "witness" with a
   different name but the claim's own packet + a model-derived method.
   Expected: not independent → HOLD.
   =================================================================== */
(function () {
  var claim = makeClaim();
  var d = S.reduceClaim(claim, sharedLineageReviews(3, "SUPPORT"), [sameLineageWitness()], {});
  var indep = S.independentlyWitnessed(claim, sameLineageWitness());
  log("T2_shared_lineage_is_not_independence",
    indep === false && d.result === "HOLD" && eq(d.reason_codes, ["NO_INDEPENDENT_ANCHOR"]),
    "same-packet same-method 'witness' independent=" + indep + " → " + d.result);
})();

/* ===================================================================
   T3 — Independent witness confirms. Deterministic external observation
   matches. Expected: ADMITTABLE — but NOT automatically canonical.
   =================================================================== */
(function () {
  var claim = makeClaim();
  var d = S.reduceClaim(claim, sharedLineageReviews(2, "SUPPORT"), [independentWitness()], {});
  log("T3_independent_witness_confirms_is_admittable",
    d.result === "ADMIT" && d.admittable === true && d.canon_effect === false &&
    eq(d.reason_codes, ["INDEPENDENT_ANCHOR_CONFIRMED"]),
    "→ " + d.result + " admittable=" + d.admittable + " canon_effect=" + d.canon_effect +
    " (admittable ≠ canon)");
})();

/* ===================================================================
   T4 — Independent witness contradicts. The anchor observes a different
   state than the producer claimed. Expected: REJECT / ANCHOR_CONTRADICTION.
   =================================================================== */
(function () {
  var claim = makeClaim();                                  /* claims gemma-4-26b */
  var w = independentWitness({ observed_value: "qwen3.5:4b" }); /* the world says otherwise */
  var d = S.reduceClaim(claim, sharedLineageReviews(10, "SUPPORT"), [w], {});
  log("T4_independent_witness_contradicts_rejects",
    d.result === "REJECT" && eq(d.reason_codes, ["ANCHOR_CONTRADICTION"]),
    "10 agree, 1 independent probe disagrees → " + d.result + " " + d.reason_codes);
})();

/* ===================================================================
   T5 — Witness becomes stale. Valid when produced, now beyond the
   freshness horizon. Expected: HOLD_REOBSERVE.
   previously witnessed ⊬ currently true.
   =================================================================== */
(function () {
  var claim = makeClaim();
  var w = independentWitness({ observed_at: "2026-07-19T18:00:05Z" });
  /* now is 10 minutes later; horizon is 60s → the reading is stale */
  var d = S.reduceClaim(claim, [], [w], { now: "2026-07-19T18:10:05Z", freshnessHorizonMs: 60000 });
  log("T5_stale_witness_holds_for_reobservation",
    d.result === "HOLD_REOBSERVE" && eq(d.reason_codes, ["WITNESS_STALE"]),
    "independent but 600s old, horizon 60s → " + d.result + " " + d.reason_codes);
})();

/* ===================================================================
   CENTRAL ADVERSARIAL PROOF — 10 confirmations < 1 independent contradiction.
   Step 1: ten agents confirm a claim, all from the same packet, no witness.
   Step 2: add one live independent witness that contradicts.
   =================================================================== */
(function () {
  var claim = makeClaim();
  var reviews = sharedLineageReviews(10, "SUPPORT");
  var before = S.reduceClaim(claim, reviews, [], {});
  var after = S.reduceClaim(claim, reviews, [independentWitness({ observed_value: "qwen3.5:4b" })], {});
  var proven = before.result === "HOLD" && eq(before.reason_codes, ["NO_INDEPENDENT_ANCHOR"]) &&
               after.result === "REJECT" && eq(after.reason_codes, ["ANCHOR_CONTRADICTION"]);
  log("CENTRAL_ten_confirmations_lt_one_independent_contradiction", proven,
    "10-agree→" + before.result + " ; +1 independent contra→" + after.result);
})();

/* ===================================================================
   THE FIVE PROOF PROPERTIES (§7) — each asserted, not asserted-of.
   =================================================================== */
(function () {
  var claim = makeClaim();
  var manyAgree = S.reduceClaim(claim, sharedLineageReviews(10, "SUPPORT"), [], {}).result === "HOLD";
  var agreementCanBeWrong = S.reduceClaim(claim, sharedLineageReviews(10, "SUPPORT"),
    [independentWitness({ observed_value: "qwen3.5:4b" })], {}).result === "REJECT";
  var sharedLineageNotIndep = S.independentlyWitnessed(claim, sameLineageWitness()) === false;
  var anchorRequired = S.reduceClaim(claim, sharedLineageReviews(999, "SUPPORT"), [], {}).result !== "ADMIT";
  var admissionWithoutAnchorImpossible =
    S.reduceClaim(claim, sharedLineageReviews(10, "SUPPORT"), [], {}).admittable === false &&
    S.reduceClaim(claim, sharedLineageReviews(10, "SUPPORT"), [sameLineageWitness()], {}).admittable === false;
  log("P_many_agents_can_agree", manyAgree, "10 SUPPORT accepted as input");
  log("P_agreement_can_be_wrong", agreementCanBeWrong, "unanimous agreement overridden by 1 anchor");
  log("P_shared_lineage_is_not_independence", sharedLineageNotIndep, "same packet+method ⊬ independent");
  log("P_independent_anchor_is_required", anchorRequired, "even 999 confirmations do not ADMIT");
  log("P_admission_without_anchor_impossible", admissionWithoutAnchorImpossible, "no anchor ⇒ never admittable");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
