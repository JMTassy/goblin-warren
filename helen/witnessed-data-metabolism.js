/* =====================================================================
   WITNESSED_DATA_METABOLISM_V0
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   The data-layer twin of the loop-graph cells. Where the seam/schema/
   planner govern CLAIMS, this governs the DATA those claims are made of.

   Constitutional rule (the whole point):
     transformation may increase usefulness
     transformation must NEVER silently increase authority.
   A summary may become clearer than its source. It does not become truer.

   Every item entering HELEN is a DataBead whose most important field is
   NOT its content but authority.level. The same sentence can exist at once
   as a reported statement, a model inference, and an admitted fact — those
   are DIFFERENT objects with identical text.

   This cell implements: the DataBead, the metabolic states, the four
   membranes (provenance / semantic / authority / temporal), the admission
   equation, and the five toxin detectors — proven deterministically on
   SYNTHETIC beads (no real data). It does NOT ingest, download, persist,
   or admit anything real (later, operator-gated).

   DETERMINISM: no Date.now(), no Math.random(), no network, no LLM.
   Reuses the seam's independence predicate so the anchor-cut is the same
   law at the data layer: derived objects cannot be independent witnesses.
   ===================================================================== */

"use strict";
var path = require("path");
var seam = require(path.join(__dirname, "witnessed-loop-graph-seam.js"));

/* authority is a strict ladder; nothing skips a rung silently */
var AUTHORITY = { none: 0, candidate: 1, "operator-approved": 2, admitted: 3 };

/* the metabolic states, in lawful order */
var STATES = ["INGESTED", "QUARANTINED", "PARSED", "NORMALIZED", "CONNECTED",
  "CHIDDUSH_CANDIDATE", "WITNESSED", "OPERATOR_SELECTED", "ADMISSIBILITY_CHECK",
  "LEDGERED", "REPLAY_VERIFIED"];
var TERMINAL_OFFRAMPS = { COMPOSTED: true, REJECTED: true, DEFERRED: true };

function makeBead(f) {
  f = f || {};
  return {
    id: f.id,
    payload: f.payload || { raw_ref: null, media_type: "text", content_hash: null },
    provenance: Object.assign({ source_type: "unknown", source_id: null,
      acquired_at: null, transformation_chain: [], custody_chain: [] }, f.provenance || {}),
    epistemic: Object.assign({ claim_status: "reported", confidence: 0.0,
      uncertainty_notes: [], contradiction_refs: [] }, f.epistemic || {}),
    /* authority ALWAYS starts at the floor — never inherited from content */
    authority: Object.assign({ level: "none", may_write_memory: false,
      may_trigger_action: false, may_enter_ledger: false }, f.authority || {}),
    lifecycle: Object.assign({ state: "INGESTED", supersedes: [], superseded_by: [], expires_at: null }, f.lifecycle || {}),
    safety: Object.assign({ privacy_class: "internal", prompt_injection_risk: "unknown",
      contamination_risk: "unknown" }, f.safety || {}),
    origin: f.origin || null   /* {synthetic, generator, generated_at, eligible_for_evaluation} */
  };
}

/* ---------- THE FOUR MEMBRANES (predicates) ---------- */

/* provenance: every derived object must point backward to an immutable raw
   source; a broken edge makes it non-admissible (→ REQUEST_WITNESS). */
function provenanceComplete(b) {
  if (!b.payload || !b.payload.raw_ref) return false;
  var chain = b.provenance.transformation_chain || [];
  return chain.every(function (step) { return step && step.from && step.transform; });
}

/* semantic: a reported claim may never be silently retyped as proven.
   Returns false for a prohibited conversion. */
var CLAIM_LADDER = { imagined: 0, modeled: 1, inferred: 2, reported: 3, observed: 4, proven: 5 };
function epistemicTypeExplicit(b) {
  return typeof b.epistemic.claim_status === "string" && b.epistemic.claim_status in CLAIM_LADDER;
}
function isProhibitedRetype(fromStatus, toStatus, newEvidence) {
  /* upgrading toward 'proven'/'observed' without NEW independent evidence is laundering */
  if (CLAIM_LADDER[toStatus] > CLAIM_LADDER[fromStatus]) {
    return !newEvidence || !newEvidence.independent;
  }
  return false;
}

/* authority: capability tokens. No token implies another.
   rank(x) ≠ admit(x); render(x) ≠ endorse(x). */
var ORGAN_CAPABILITY = {
  INGESTOR: ["create_raw"], PARSER: ["create_derived"], CHIDDUSH: ["rank"],
  VALIDATOR: ["check"], OPERATOR: ["select"], REDUCER: ["admit"],
  LEDGER: ["append"], SHELL: ["render"]
};
function authoritySeparationHolds(organ, action) {
  var caps = ORGAN_CAPABILITY[organ] || [];
  return caps.indexOf(action) !== -1;
}

/* temporal: old truth is not false — it may be no longer current. */
function currentStanding(b, now) {
  var vu = b.lifecycle.expires_at;
  if ((b.lifecycle.superseded_by || []).length > 0) return "SUPERSEDED";
  if (vu != null && seam.epoch(now) > seam.epoch(vu)) return "EXPIRED";
  return "CURRENT";
}

/* ---------- MEMORY LADDER — retrieval never upgrades claim status ---------- */
function retrieve(b) {
  /* repetition is not confirmation: the retrieved object keeps its label */
  return { text: (b.payload && b.payload.raw_ref) || null, claim_status: b.epistemic.claim_status,
    authority_level: b.authority.level, id: b.id };
}

/* ---------- THE FIVE TOXINS (detectors return true when the toxin is PRESENT) ---------- */
var toxins = {
  authority_inflation: function (outputCertainty, strongestLawfulSupport) {
    return outputCertainty > strongestLawfulSupport;
  },
  citation_laundering: function (claim, citedEvidence) {
    /* the cited evidence must actually entail the claim */
    return !(citedEvidence && citedEvidence.supports_claim_id === claim.id);
  },
  synthetic_contamination: function (bead, evaluationSet) {
    return !!(bead.origin && bead.origin.synthetic) && evaluationSet === true;
  },
  semantic_collapse: function (bead) {
    return !epistemicTypeExplicit(bead);   /* untyped metaphor/fact merge */
  },
  recursive_self_confirmation: function (claim, witness) {
    /* derived objects cannot serve as independent witnesses — the anchor-cut,
       at the data layer. A witness sharing the claim's lineage is not one. */
    return !seam.independentlyWitnessed(claim, witness);
  }
};

/* ---------- THE CHIDDUSH SCORE — novelty is residual, not surprise ----------
   C = N × M × P × T × S × U − A − K − D
   A zero in provenance (P) or testability (T) collapses admissibility even
   when novelty is high. surprise ≠ chiddush. */
function chiddushScore(x) {
  var product = x.N * x.M * x.P * x.T * x.S * x.U;
  return product - (x.A || 0) - (x.K || 0) - (x.D || 0);
}
function admissibleByScore(x) {
  if (x.P === 0 || x.T === 0) return false;   /* the collapse property */
  return chiddushScore(x) > 0;
}

/* ---------- THE ADMISSION EQUATION ----------
   ADMIT(x) iff every conjunct holds. Returns {admit, failed:[...]}. For
   high-impact claims: one source / one model / one test / one impression is
   never enough. */
function admit(bead, ctx) {
  ctx = ctx || {};
  var failed = [];
  if (!provenanceComplete(bead)) failed.push("provenance_complete");
  if (!epistemicTypeExplicit(bead)) failed.push("epistemic_type_explicit");
  if (!authoritySeparationHolds("REDUCER", "admit")) failed.push("authority_separation_holds");
  if (bead.safety.privacy_class === "restricted" && ctx.privacy_cleared !== true) failed.push("privacy_check_passes");
  if (bead.safety.prompt_injection_risk === "high") failed.push("injection_check_passes");
  /* required witnesses must RESOLVE and be genuinely independent of the bead */
  var claimShape = { producer_id: bead.provenance.source_id, source_packet_hash: bead.payload.content_hash,
    derivation_methods: (bead.provenance.transformation_chain || []).map(function (s) { return s.transform; }),
    created_at: bead.provenance.acquired_at, value: null };
  var independent = (ctx.witnesses || []).filter(function (w) { return seam.independentlyWitnessed(claimShape, w); });
  if (independent.length === 0) failed.push("required_witnesses_resolve");
  if (ctx.contradictions_disclosed !== true) failed.push("contradictions_are_disclosed");
  if (ctx.operator_decision !== "GO") failed.push("operator_decision");
  if (ctx.reducer_schema_valid !== true) failed.push("reducer_schema");
  if (typeof ctx.replay !== "function" || ctx.replay() !== "PASS") failed.push("replay");
  return { admit: failed.length === 0, failed: failed };
}

module.exports = {
  AUTHORITY: AUTHORITY, STATES: STATES, CLAIM_LADDER: CLAIM_LADDER, ORGAN_CAPABILITY: ORGAN_CAPABILITY,
  makeBead: makeBead, provenanceComplete: provenanceComplete, epistemicTypeExplicit: epistemicTypeExplicit,
  isProhibitedRetype: isProhibitedRetype, authoritySeparationHolds: authoritySeparationHolds,
  currentStanding: currentStanding, retrieve: retrieve, toxins: toxins,
  chiddushScore: chiddushScore, admissibleByScore: admissibleByScore, admit: admit
};
