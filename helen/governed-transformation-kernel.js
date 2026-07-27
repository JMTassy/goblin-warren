/* =====================================================================
   GOVERNED_TRANSFORMATION_KERNEL_V0
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   The merge. The four prior cells govern in isolation:
     seam       — the anchor-cut (no self-confirming promotion)
     schema     — replayable graph + epistemic-lineage components
     planner    — which distinctions a task must separate
     metabolism — what data may become (authority never silently rises)
   This composes them into ONE four-key lock and enforces the property none
   of them has alone: NO_LOCAL_SELF_PROMOTION.

   FOUR KEYS, each held by a DISTINCT authority; no layer turns its own key:
     TYPE    — what effect is permitted (does the render-form match the
               witnessed origin? a model_output may not wear a command_output
               costume — CHRONOS: claimed_source_class ≠ witnessed_source_class
               is a schema-level forgery, not a wisdom call)
     LAW     — which actor may authorize (capability tokens; the authorizer
               may not be the producer — no self-authorization)
     LOOP    — which gates actually passed (an INDEPENDENT anchor closed; the
               witness may not be the same process as the producer)
     RECEIPT — how the transition is reconstructed (a replayable event is
               emitted for EVERY outcome, admit or reject)

   FOUR ENFORCED INVARIANTS:
     NO_LOCAL_SELF_PROMOTION       — ADMIT requires all four keys held by
                                     distinct authorities; no single actor,
                                     at any multiplicity, can produce it.
     NO_IN_PLACE_AUTHORITY_MUTATION — correct(event) := append(correction);
                                     never mutate. In-place authority raises
                                     are denied.
     NO_SELF_WITNESS_UPGRADE       — an actor may not witness its own output;
                                     same_process is a relation, not a witness.
     NO_UNRECEIPTED_STATE_CHANGE   — the kernel never changes state without a
                                     receipt; the parent object is pure-unchanged.

   Fail-closed: any key that fails yields REJECT, a receipt of the rejection,
   and the parent object returned byte-unchanged.

   DETERMINISM: no Date.now(), no Math.random(), no network, no LLM.
   ===================================================================== */

"use strict";
var path = require("path");
var seam = require(path.join(__dirname, "witnessed-loop-graph-seam.js"));
var metab = require(path.join(__dirname, "witnessed-data-metabolism.js"));

/* which witnessed source classes a claimed render-form legitimately requires.
   A transcript that RENDERS AS command_output must ORIGINATE from real
   execution — a model_output cannot lawfully wear that costume. */
var RENDER_FORM_REQUIRES = {
  command_output:  ["command_execution", "deterministic_probe"],
  observation:     ["sensor", "independent_runtime_probe", "command_execution"],
  model_narration: ["model_output"],
  user_statement:  ["user"]
};

/* ---- KEY 1 · TYPE — what effect is permitted ---- */
function keyTYPE(req) {
  var claimed = req.proposed_effect && req.proposed_effect.render_form;
  var witnessed = req.actual_origin && req.actual_origin.source_class;
  if (!claimed || !witnessed) return { ok: false, reason: "TYPE_UNRESOLVED" };
  var allowed = RENDER_FORM_REQUIRES[claimed];
  if (allowed && allowed.indexOf(witnessed) === -1) {
    /* CHRONOS: an illegal type costume — schema catches it, no wisdom needed */
    return { ok: false, reason: "PROVENANCE_MISMATCH",
      detail: "render_form=" + claimed + " but witnessed source_class=" + witnessed };
  }
  return { ok: true, reason: "TYPE_LAWFUL" };
}

/* ---- KEY 2 · LAW — which actor may authorize ---- */
function keyLAW(req) {
  /* the authorizer must hold the capability for this effect */
  var effect = req.proposed_effect && req.proposed_effect.effect;   /* e.g. "admit" */
  var authorizer = req.authorizer && req.authorizer.organ;
  if (!metab.authoritySeparationHolds(authorizer, effect)) {
    return { ok: false, reason: "AUTHORIZER_LACKS_CAPABILITY",
      detail: (authorizer || "?") + " may not " + (effect || "?") };
  }
  /* no self-authorization: the actor who produced the object may not authorize it */
  if (req.producer && req.authorizer && req.producer.actor_id === req.authorizer.actor_id) {
    return { ok: false, reason: "SELF_AUTHORIZATION" };
  }
  /* correct(event) := append, not mutate */
  if (req.mutation_mode === "in_place") {
    return { ok: false, reason: "IN_PLACE_AUTHORITY_MUTATION" };
  }
  return { ok: true, reason: "LAW_SATISFIED" };
}

/* the witness relation: an actor cannot witness its own output. */
function witnessRelation(producer, witness) {
  if (!witness) return "NONE";
  if (producer && witness.process_id && producer.process_id &&
      witness.process_id === producer.process_id) return "SAME_PROCESS";
  return "WITNESS";
}

/* ---- KEY 3 · LOOP — which gates actually passed ---- */
function keyLOOP(req) {
  var rel = witnessRelation(req.producer, req.witness);
  if (rel !== "WITNESS") {
    return { ok: false, reason: rel === "SAME_PROCESS" ? "SELF_WITNESS" : "NO_WITNESS" };
  }
  /* the witness must be independent of the object's epistemic lineage */
  var claimShape = {
    producer_id: req.object && req.object.producer_id,
    source_packet_hash: req.object && req.object.source_packet_hash,
    derivation_methods: (req.object && req.object.derivation_methods) || [],
    created_at: req.object && req.object.created_at, value: null
  };
  if (!seam.independentlyWitnessed(claimShape, req.witness)) {
    return { ok: false, reason: "WITNESS_NOT_INDEPENDENT" };
  }
  /* seal-class effects require the operator's GO */
  if (req.proposed_effect && req.proposed_effect.requires_operator && req.operator_decision !== "GO") {
    return { ok: false, reason: "OPERATOR_GO_ABSENT" };
  }
  return { ok: true, reason: "LOOP_CLOSED" };
}

/* ---- KEY 4 · RECEIPT — always emitted, for every outcome ---- */
function makeReceipt(req, outcome, reasonCodes) {
  return {
    event: "GOVERNED_TRANSFORM",
    outcome: outcome,                          /* ADMIT | REJECT */
    reason_codes: reasonCodes,
    object_id: req.object && req.object.id,
    proposed_effect: req.proposed_effect && req.proposed_effect.effect,
    parent_unchanged: true,                    /* the kernel is pure */
    authority_effect: outcome === "ADMIT" ? "promotion_admissible" : "none",
    replayable: true
  };
}

/* ---- THE KERNEL — run four keys, fail-closed, always receipt ---- */
function transform(req) {
  var before = JSON.stringify(req.object);     /* prove the parent is untouched */
  var T = keyTYPE(req), L = keyLAW(req), P = keyLOOP(req);
  var reasons = [];
  if (!T.ok) reasons.push(T.reason);
  if (!L.ok) reasons.push(L.reason);
  if (!P.ok) reasons.push(P.reason);
  var outcome = (T.ok && L.ok && P.ok) ? "ADMIT" : "REJECT";
  var receipt = makeReceipt(req, outcome, outcome === "ADMIT" ? ["ALL_KEYS_HELD"] : reasons);
  var after = JSON.stringify(req.object);
  receipt.parent_unchanged = (before === after);   /* measured, not asserted */
  return {
    outcome: outcome,
    keys: { TYPE: T, LAW: L, LOOP: P },
    receipt: receipt,
    parent: req.object                          /* returned unchanged */
  };
}

/* the emergent property, made checkable: no single actor, at any
   multiplicity, can drive ADMIT — promotion exists only in the composition
   of distinct authorities. Returns true iff a monopolising actor is refused. */
function noLocalSelfPromotion(baseReq) {
  /* one actor plays producer AND authorizer AND witness */
  var actor = { actor_id: "solo", organ: "REDUCER", process_id: "pid_1" };
  var req = Object.assign({}, baseReq, {
    producer: actor, authorizer: actor,
    witness: { producer_id: (baseReq.object || {}).producer_id, input_hash: (baseReq.object || {}).source_packet_hash,
      method: ((baseReq.object || {}).derivation_methods || [])[0], source_class: "INDEPENDENT_RUNTIME_PROBE",
      observed_at: "2999-01-01T00:00:00Z", process_id: "pid_1" }
  });
  return transform(req).outcome === "REJECT";
}

module.exports = {
  RENDER_FORM_REQUIRES: RENDER_FORM_REQUIRES,
  keyTYPE: keyTYPE, keyLAW: keyLAW, keyLOOP: keyLOOP, makeReceipt: makeReceipt,
  witnessRelation: witnessRelation, transform: transform, noLocalSelfPromotion: noLocalSelfPromotion
};
