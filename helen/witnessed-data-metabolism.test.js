/* =====================================================================
   WITNESSED_DATA_METABOLISM_V0 — proof suite. Synthetic beads only; no
   real data, no PII, no ingestion. Run:
     node helen/witnessed-data-metabolism.test.js
   Exit 0 iff every property holds. `node` is the anchor.
   ===================================================================== */
"use strict";
var path = require("path");
var M = require(path.join(__dirname, "witnessed-data-metabolism.js"));

var results = {};
function log(n, p, d) { results[n] = p; console.log((p ? "PASS " : "FAIL ") + n + " — " + d); }

/* an independent witness of a different lineage (reused shape from the seam) */
function indepWitness(overrides) {
  return Object.assign({
    method: "live_probe", observed_value: null, observed_at: "2026-07-27T00:00:10Z",
    source_class: "INDEPENDENT_RUNTIME_PROBE", producer_id: "probe", input_hash: "probe_Z"
  }, overrides || {});
}

/* ===================================================================
   B1 — a fresh bead sits at the authority FLOOR whatever its content says.
   =================================================================== */
(function () {
  var b = M.makeBead({ id: "bead_synth_1", epistemic: { claim_status: "reported" },
    payload: { raw_ref: "synthetic://x", media_type: "text", content_hash: "h1" } });
  log("B1_fresh_bead_is_authority_floor",
    b.authority.level === "none" && b.authority.may_write_memory === false &&
    b.authority.may_enter_ledger === false && b.lifecycle.state === "INGESTED",
    "level=" + b.authority.level + " may_write_memory=" + b.authority.may_write_memory);
})();

/* ===================================================================
   B2 — memory laundering blocked: retrieving a REPORTED bead N times never
   upgrades its claim status. Repetition ≠ confirmation.
   =================================================================== */
(function () {
  var b = M.makeBead({ id: "bead_rep", epistemic: { claim_status: "reported" },
    payload: { raw_ref: "synthetic://y", content_hash: "h2" } });
  var statuses = [];
  for (var i = 0; i < 5; i++) statuses.push(M.retrieve(b).claim_status);
  log("B2_repetition_never_upgrades_claim_status",
    statuses.every(function (s) { return s === "reported"; }),
    "5 retrievals → [" + statuses.join(",") + "]");
})();

/* ===================================================================
   B3 — recursive self-confirmation toxin: a witness derived from the
   claim's own lineage is NOT independent (the anchor-cut, data layer).
   =================================================================== */
(function () {
  var claim = { producer_id: "interp", source_packet_hash: "packet_A",
    derivation_methods: ["prose_inference"], created_at: "2026-07-27T00:00:00Z", value: "x" };
  var sameLineage = indepWitness({ producer_id: "interp", input_hash: "packet_A" }); /* same source+packet */
  var present = M.toxins.recursive_self_confirmation(claim, sameLineage);
  var absent = M.toxins.recursive_self_confirmation(claim, indepWitness());
  log("B3_derived_object_is_not_an_independent_witness",
    present === true && absent === false,
    "same-lineage witness toxin=" + present + " ; genuinely independent toxin=" + absent);
})();

/* ===================================================================
   B4 — chiddush collapse: high novelty with zero provenance or zero
   testability is inadmissible however surprising. surprise ≠ chiddush.
   =================================================================== */
(function () {
  var dazzling = { N: 10, M: 5, P: 0, T: 9, S: 8, U: 7, A: 0, K: 0, D: 0 }; /* P=0 */
  var untestable = { N: 10, M: 5, P: 9, T: 0, S: 8, U: 7, A: 0, K: 0, D: 0 }; /* T=0 */
  var sound = { N: 3, M: 3, P: 3, T: 3, S: 3, U: 3, A: 1, K: 0, D: 0 };
  log("B4_high_novelty_zero_provenance_collapses",
    M.admissibleByScore(dazzling) === false && M.admissibleByScore(untestable) === false &&
    M.admissibleByScore(sound) === true,
    "P=0→" + M.admissibleByScore(dazzling) + " T=0→" + M.admissibleByScore(untestable) + " sound→" + M.admissibleByScore(sound));
})();

/* ===================================================================
   B5 — synthetic contamination: a synthetic bead is excluded from the
   evaluation set.
   =================================================================== */
(function () {
  var synth = M.makeBead({ id: "gen_1", origin: { synthetic: true, generator: "model-x", eligible_for_evaluation: false } });
  var real = M.makeBead({ id: "obs_1", origin: { synthetic: false } });
  log("B5_synthetic_excluded_from_evaluation",
    M.toxins.synthetic_contamination(synth, true) === true &&
    M.toxins.synthetic_contamination(real, true) === false,
    "synthetic-in-eval toxin=" + M.toxins.synthetic_contamination(synth, true));
})();

/* ===================================================================
   B6 — semantic membrane: a reported claim may not be silently retyped to
   'proven' without NEW independent evidence.
   =================================================================== */
(function () {
  var launder = M.isProhibitedRetype("reported", "proven", null);
  var launder2 = M.isProhibitedRetype("reported", "proven", { independent: false });
  var lawful = M.isProhibitedRetype("reported", "proven", { independent: true });
  var downgradeOk = M.isProhibitedRetype("reported", "inferred", null);
  log("B6_no_silent_retype_to_proven",
    launder === true && launder2 === true && lawful === false && downgradeOk === false,
    "reported→proven (no evidence)=" + launder + " ; (+independent)=" + lawful);
})();

/* ===================================================================
   B7 — authority membrane: capability tokens do not imply one another.
   rank ≠ admit ; render ≠ endorse ; only REDUCER admits.
   =================================================================== */
(function () {
  var chiddushCanAdmit = M.authoritySeparationHolds("CHIDDUSH", "admit");
  var shellCanEndorse = M.authoritySeparationHolds("SHELL", "admit");
  var reducerAdmits = M.authoritySeparationHolds("REDUCER", "admit");
  var chiddushRanks = M.authoritySeparationHolds("CHIDDUSH", "rank");
  log("B7_capability_tokens_do_not_imply_each_other",
    chiddushCanAdmit === false && shellCanEndorse === false && reducerAdmits === true && chiddushRanks === true,
    "CHIDDUSH.admit=" + chiddushCanAdmit + " SHELL.admit=" + shellCanEndorse + " REDUCER.admit=" + reducerAdmits);
})();

/* ===================================================================
   B8 — temporal membrane: an expired admitted bead reads SUPERSEDED/EXPIRED,
   not deleted — old truth is not false, only no longer current.
   =================================================================== */
(function () {
  var b = M.makeBead({ id: "t1", lifecycle: { state: "LEDGERED", supersedes: [], superseded_by: [], expires_at: "2026-07-27T00:00:00Z" } });
  var standing = M.currentStanding(b, "2026-07-27T01:00:00Z");
  var stillHere = b.id === "t1";   /* the object is not deleted */
  log("B8_expired_is_superseded_not_deleted",
    standing === "EXPIRED" && stillHere,
    "standing=" + standing + " ; bead retained=" + stillHere);
})();

/* ===================================================================
   B9 — THE ADMISSION EQUATION: a bead missing provenance / operator GO /
   independent witness / replay is NOT admitted; the full lawful bundle is.
   =================================================================== */
(function () {
  var incomplete = M.makeBead({ id: "c1", payload: { raw_ref: null, content_hash: "h" },
    provenance: { source_id: "s", acquired_at: "2026-07-27T00:00:00Z", transformation_chain: [] } });
  var rIncomplete = M.admit(incomplete, { operator_decision: "HOLD", witnesses: [], replay: function () { return "FAIL"; } });

  var complete = M.makeBead({ id: "c2",
    payload: { raw_ref: "synthetic://z", content_hash: "hz" },
    provenance: { source_id: "interp", acquired_at: "2026-07-27T00:00:00Z",
      transformation_chain: [{ from: "raw", transform: "parse" }] },
    epistemic: { claim_status: "reported" } });
  var rComplete = M.admit(complete, {
    operator_decision: "GO",
    witnesses: [indepWitness()],           /* independent of the bead's lineage */
    contradictions_disclosed: true,
    reducer_schema_valid: true,
    replay: function () { return "PASS"; }
  });
  log("B9_admission_equation_all_conjuncts_required",
    rIncomplete.admit === false && rIncomplete.failed.length >= 3 && rComplete.admit === true,
    "incomplete → admit=" + rIncomplete.admit + " failed=[" + rIncomplete.failed.join(",") + "] ; complete → admit=" + rComplete.admit);
})();

/* ===================================================================
   B10 — restricted PII cannot be admitted without an explicit privacy
   clearance, even with everything else lawful (the guardrail that applies
   to the real scan pasted by the operator).
   =================================================================== */
(function () {
  var pii = M.makeBead({ id: "s3",
    payload: { raw_ref: "synthetic://reservation", content_hash: "hp" },
    provenance: { source_id: "provider-email", acquired_at: "2026-07-27T00:00:00Z",
      transformation_chain: [{ from: "raw", transform: "parse" }] },
    epistemic: { claim_status: "reported" }, safety: { privacy_class: "restricted" } });
  var ctx = { operator_decision: "GO", witnesses: [indepWitness()], contradictions_disclosed: true,
    reducer_schema_valid: true, replay: function () { return "PASS"; } };
  var noClearance = M.admit(pii, ctx);
  var withClearance = M.admit(pii, Object.assign({ privacy_cleared: true }, ctx));
  log("B10_restricted_pii_needs_explicit_privacy_clearance",
    noClearance.admit === false && noClearance.failed.indexOf("privacy_check_passes") !== -1 &&
    withClearance.admit === true,
    "restricted w/o clearance → admit=" + noClearance.admit + " (failed privacy) ; w/ clearance → " + withClearance.admit);
})();

/* ===================================================================
   B11 — determinism / purity (scan code, not prose).
   =================================================================== */
(function () {
  var fs = require("fs");
  var code = fs.readFileSync(path.join(__dirname, "witnessed-data-metabolism.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("B11_metabolism_is_deterministic_no_clock_no_random_no_net", clean,
    clean ? "no clock/random/network in code" : "IMPURITY FOUND");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
