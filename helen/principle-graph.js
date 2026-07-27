/* =====================================================================
   PRINCIPLE_GRAPH_V0  (the LNOS research-engine spine)
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   A mission arrived (LNOS): "be the principal research engine — output
   reusable principles, not summaries; separate observed from inferred;
   maintain a negative graph and a falsification protocol for every
   invariant; preserve competing hypotheses; success = explanatory power,
   NOT information volume."

   That mission's own success criterion forbids the naive execution
   (generate a big model). A research engine with no corpus produces
   ontology, and ontology is volume. So this cell is not the MODEL — it is
   the ENGINE that structurally cannot inflate:

     · every node is typed observed | inferred (never silently "proven")
     · an INVARIANT with NO falsifier is REFUSED — "a valid claim must
       include a way to be wrong" is an admission gate, not a nicety
     · competing hypotheses COEXIST; the graph never collapses them without
       an independent falsification event (append-only negative graph)
     · explanatory power is measured by SURVIVING FALSIFIABLE invariants,
       never by node count — adding volume adds nothing (the LNOS analog of
       the planner's D3: more producers separate zero distinctions)
     · promotion to canonical routes through the governed kernel, so no
       principle self-promotes

   It reuses the seam (a falsification attempt only counts if independent)
   and the metabolism (claim typing). Deterministic; proven on synthetic
   principles. Running it on a REAL organization needs a corpus + operator
   designation + PII clearance — held for the operator.

   DETERMINISM: no Date.now(), no Math.random(), no network, no LLM.
   ===================================================================== */

"use strict";
var path = require("path");
var seam = require(path.join(__dirname, "witnessed-loop-graph-seam.js"));

var NODE_TYPES = { entity: 1, capability: 1, decision: 1, method: 1,
  invariant: 1, hypothesis: 1, transformation_genome: 1 };
var CLAIM_TYPES = { observed: 1, inferred: 1 };

function newGraph() {
  return { nodes: {}, epochs: [{ epoch: 0, ontology_changes: [] }], events: [] };
}

/* ---- add a node. observed vs inferred is mandatory. an INVARIANT without
   a falsifier is refused — the falsification protocol is an admission gate. */
function addNode(g, node) {
  if (!NODE_TYPES[node.type]) return reject(g, node, "UNKNOWN_NODE_TYPE");
  if (!CLAIM_TYPES[node.claim_status]) return reject(g, node, "CLAIM_STATUS_REQUIRED");
  if (node.type === "invariant") {
    var f = node.falsifier;
    if (!f || !f.what_would_disprove || !Array.isArray(f.tests)) {
      return reject(g, node, "INVARIANT_WITHOUT_FALSIFIER");   /* no way to be wrong → refused */
    }
  }
  var stored = {
    id: node.id, type: node.type, claim_status: node.claim_status,
    statement: node.statement || null,
    citations: node.citations || [],
    confidence: typeof node.confidence === "number" ? node.confidence : 0.0,
    phenomenon_id: node.phenomenon_id || null,        /* groups competing hypotheses */
    falsifier: node.falsifier || null,
    lineage: node.lineage || {},
    status: "ACTIVE",                                  /* ACTIVE | REFUTED | SUPERSEDED */
    tested: false, survived: false, refuted_by: null,
    epoch: g.epochs[g.epochs.length - 1].epoch
  };
  g.nodes[stored.id] = stored;
  g.events.push({ kind: "NODE_ADDED", id: stored.id, type: stored.type });
  return { ok: true, id: stored.id };
}
function reject(g, node, reason) {
  g.events.push({ kind: "NODE_REFUSED", id: node && node.id, reason: reason });
  return { ok: false, reason: reason };
}

/* ---- competing hypotheses coexist. Adding a second hypothesis for the same
   phenomenon NEVER evicts the first; the graph holds both. */
function hypothesesFor(g, phenomenonId) {
  return Object.keys(g.nodes).map(function (k) { return g.nodes[k]; })
    .filter(function (n) { return n.type === "hypothesis" && n.phenomenon_id === phenomenonId && n.status === "ACTIVE"; });
}

/* ---- FALSIFICATION PROTOCOL. An attempt only counts if it is INDEPENDENT
   of the invariant's own lineage (the anchor-cut). A contradicting
   independent attempt REFUTES (moves to the negative graph, append-only,
   evidence retained). A non-refuting independent attempt marks SURVIVED. */
function attemptFalsification(g, invariantId, attempt) {
  var inv = g.nodes[invariantId];
  if (!inv || inv.type !== "invariant") return { ok: false, reason: "NOT_AN_INVARIANT" };
  var claimShape = {
    producer_id: (inv.lineage || {}).producer_id, source_packet_hash: (inv.lineage || {}).packet,
    derivation_methods: (inv.lineage || {}).methods || [], created_at: inv.lineage && inv.lineage.at, value: null
  };
  if (!seam.independentlyWitnessed(claimShape, attempt)) {
    g.events.push({ kind: "FALSIFICATION_REJECTED", id: invariantId, reason: "ATTEMPT_NOT_INDEPENDENT" });
    return { ok: false, reason: "ATTEMPT_NOT_INDEPENDENT" };   /* a same-lineage "test" proves nothing */
  }
  inv.tested = true;
  if (attempt.refutes === true) {
    inv.status = "REFUTED"; inv.survived = false; inv.refuted_by = attempt.witness_id || attempt.producer_id;
    g.events.push({ kind: "INVARIANT_REFUTED", id: invariantId, by: inv.refuted_by });
    return { ok: true, result: "REFUTED" };                   /* negative graph; node retained, not deleted */
  }
  inv.survived = true;
  g.events.push({ kind: "INVARIANT_SURVIVED", id: invariantId, attempt: attempt.witness_id || attempt.producer_id });
  return { ok: true, result: "SURVIVED" };
}

/* ---- EXPLANATORY POWER — the mission's success metric, made executable.
   Counts ONLY invariants that are falsifiable, tested, survived, and active.
   Node count is irrelevant: volume adds nothing. This is the theorem. */
function explanatoryPower(g) {
  return Object.keys(g.nodes).map(function (k) { return g.nodes[k]; })
    .filter(function (n) {
      return n.type === "invariant" && n.status === "ACTIVE" &&
        n.falsifier && n.tested === true && n.survived === true;
    }).length;
}
function nodeCount(g) { return Object.keys(g.nodes).length; }

/* ---- EPOCHS / ontology change — explicit and append-only. */
function newEpoch(g, ontologyChanges) {
  var next = g.epochs[g.epochs.length - 1].epoch + 1;
  g.epochs.push({ epoch: next, ontology_changes: ontologyChanges || [] });
  g.events.push({ kind: "EPOCH_OPENED", epoch: next, changes: (ontologyChanges || []).length });
  return next;
}

module.exports = {
  NODE_TYPES: NODE_TYPES, CLAIM_TYPES: CLAIM_TYPES,
  newGraph: newGraph, addNode: addNode, hypothesesFor: hypothesesFor,
  attemptFalsification: attemptFalsification, explanatoryPower: explanatoryPower,
  nodeCount: nodeCount, newEpoch: newEpoch
};
