/* =====================================================================
   WITNESSED_LOOP_GRAPH_SCHEMA_V0
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   The second cell in the growth sequence:
     anchor-cut seam → [loop-graph schema] → distinction planner
       → minimal loop selector → agent embodiment → Village

   The seam proved the anchor-cut for ONE hand-labelled claim. The schema
   makes it STRUCTURAL and REPLAYABLE:

     · state = fold(event_log)  — append-only, no deletion, replay-identical
       (the Warren Code's ENTRY + CONSERVATION theorems, made concrete)
     · epistemic-lineage components — two differently-named agents with the
       same (model, prompt, retrieval, packet) signature are ONE source; the
       graph collapses them, so a witness that SPOOFS the seam's fields but
       shares the claim's lineage is still caught here
     · graph anchor-cut — a claim is admissible only if a confirming node
       exists OUTSIDE the claim's epistemic component and is independent
     · supersede/rollback — an admitted claim later contradicted is
       SUPERSEDED by an appended event, never deleted (forgetting is itself
       an event)

   It does NOT plan distinctions or select loops (later cells). Bounded.

   DETERMINISM: no Date.now(), no Math.random(), no network, no LLM. Time is
   passed-in data. fold(events) is byte-identical on replay — so a `node`
   run is the independent anchor the schema's own law requires.
   ===================================================================== */

"use strict";
var path = require("path");
var seam = require(path.join(__dirname, "witnessed-loop-graph-seam.js"));

/* ---------------------------------------------------------------------
   LINEAGE SIGNATURE — the graph-level identity of an epistemic SOURCE.
   The identity is the epistemic MACHINERY, not the per-observation input:
   sig = (model_family, prompt_lineage, sorted retrieval_lineage).
   The input packet is deliberately EXCLUDED — an agent with the same model,
   prompt family and retrieval corpus is one source however many different
   packets it reads, and it can hallucinate the same way each time. So a
   witness that fakes a "different input" but runs the same machinery is not
   independent; only a genuinely different observer (a deterministic probe, a
   different model family, a live measurement) earns a different signature.
--------------------------------------------------------------------- */
function lineageSig(node) {
  var lin = node.lineage || {};
  var retr = (lin.retrieval_lineage || []).slice().sort();
  return JSON.stringify([
    lin.model_family || "∅",
    lin.prompt_lineage || "∅",
    retr
  ]);
}

/* ---------------------------------------------------------------------
   THE FOLD — state = fold(event_log). Pure, order-dependent, deletion-free.
   Event kinds: CLAIM_PROPOSED · REVIEW_ADDED · WITNESS_OBSERVED ·
   DECISION_MADE · CLAIM_SUPERSEDED.
--------------------------------------------------------------------- */
function foldGraph(events) {
  var g = { claims: {}, reviews: {}, witnesses: {}, decisions: [], edges: [], log: [] };
  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    g.log.push(e);
    if (e.kind === "CLAIM_PROPOSED") {
      g.claims[e.claim.claim_id] = Object.assign({}, e.claim, { status: "PROPOSED" });
    } else if (e.kind === "REVIEW_ADDED") {
      g.reviews[e.review.review_id] = e.review;
      g.edges.push({ from: e.review.review_id, to: e.review.claim_id, kind: "review" });
    } else if (e.kind === "WITNESS_OBSERVED") {
      g.witnesses[e.witness.witness_id] = e.witness;
      g.edges.push({ from: e.witness.witness_id, to: e.witness.claim_id, kind: "observation" });
    } else if (e.kind === "DECISION_MADE") {
      g.decisions.push(e.decision);
      g.edges.push({ from: e.decision.decision_id, to: e.decision.claim_id, kind: "judgment" });
      var c = g.claims[e.decision.claim_id];
      if (c) {
        c.status = e.decision.result === "ADMIT" ? "ADMITTED"
                 : e.decision.result === "REJECT" ? "REJECTED"
                 : e.decision.result === "HOLD_REOBSERVE" ? "HELD_REOBSERVE" : "HELD";
      }
    } else if (e.kind === "CLAIM_SUPERSEDED") {
      var sc = g.claims[e.claim_id];
      if (sc) { sc.status = "SUPERSEDED"; sc.superseded_by = e.by_decision_id; sc.supersede_reason = e.reason; }
      /* the original claim, its decision and its evidence remain in g.log — nothing is deleted */
    }
  }
  return g;
}

/* nodes reachable-as-evidence for a claim */
function reviewsFor(g, claimId) {
  return Object.keys(g.reviews).map(function (k) { return g.reviews[k]; })
    .filter(function (r) { return r.claim_id === claimId; });
}
function witnessesFor(g, claimId) {
  return Object.keys(g.witnesses).map(function (k) { return g.witnesses[k]; })
    .filter(function (w) { return w.claim_id === claimId; });
}

/* the claim's epistemic component: every node sharing its lineage signature */
function epistemicComponent(g, claimId) {
  var claim = g.claims[claimId];
  var sig = lineageSig(claim);
  var members = [claimId];
  reviewsFor(g, claimId).forEach(function (r) { if (lineageSig(r) === sig) members.push(r.review_id); });
  witnessesFor(g, claimId).forEach(function (w) { if (lineageSig(w) === sig) members.push(w.witness_id); });
  return { sig: sig, members: members };
}

/* GRAPH-LEVEL INDEPENDENCE — the seam predicate AND a different lineage
   signature. This is the schema's added lock: a witness may satisfy every
   seam field yet still be the claim's own epistemic source in disguise;
   the signature check catches it. */
function independentInGraph(claim, witness) {
  return lineageSig(witness) !== lineageSig(claim) && seam.independentlyWitnessed(claim, witness);
}

/* dangerous structure (§5 rejection rule): every confirming node shares the
   claim's epistemic component — a self-confirming SCC with no anchor edge. */
function allConfirmationSharesLineage(g, claimId) {
  var claim = g.claims[claimId];
  var confirmers = reviewsFor(g, claimId).filter(function (r) { return r.verdict === "SUPPORT"; })
    .concat(witnessesFor(g, claimId).filter(function (w) { return w.observed_value === claim.value; }));
  if (confirmers.length === 0) return true; /* no confirmation at all is not an anchor either */
  var claimSig = lineageSig(claim);
  return confirmers.every(function (n) { return lineageSig(n) === claimSig; });
}

/* THE GRAPH ANCHOR-CUT — compute the independent witness set structurally
   from the graph, then run the proven seam reducer over it. */
function graphReduce(g, claimId, opts) {
  var claim = g.claims[claimId];
  var reviews = reviewsFor(g, claimId);
  var independent = witnessesFor(g, claimId).filter(function (w) { return independentInGraph(claim, w); });
  return seam.reduceClaim(claim, reviews, independent, opts || {});
}

/* SUPERSEDE — append-only rollback. Returns the new event to append; never
   mutates or deletes prior events. */
function supersedeEvent(claimId, byDecisionId, reason) {
  return { kind: "CLAIM_SUPERSEDED", claim_id: claimId, by_decision_id: byDecisionId, reason: reason };
}

/* record a reducer decision as an appendable event (the receipt) */
function decisionEvent(decision) { return { kind: "DECISION_MADE", decision: decision }; }

module.exports = {
  lineageSig: lineageSig,
  foldGraph: foldGraph,
  reviewsFor: reviewsFor,
  witnessesFor: witnessesFor,
  epistemicComponent: epistemicComponent,
  independentInGraph: independentInGraph,
  allConfirmationSharesLineage: allConfirmationSharesLineage,
  graphReduce: graphReduce,
  supersedeEvent: supersedeEvent,
  decisionEvent: decisionEvent
};
