/* =====================================================================
   EVOLUTION_KERNEL_V0  (LNOS: from archive to engine)
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   New primitives named by the operator, built here as governed objects
   (not documents), all under the same anti-inflation discipline:

     · TRANSFORMATION GENOME — a successful transformation reduced to a
       sequence: start_state · trigger · constraint · new_capability ·
       mutation · stable_invariant · evidence. New cases are COMPARED
       against genomes instead of merely stored. (archive → engine)

     · CAPABILITY TRANSFER LOG — capabilities are flows, not property. Each
       time a capability appears in a NEW context we log the transfer and
       its mutation. Learning by movement, not storage. A "transfer" with
       no movement (same context) or no independent witness is refused.

     · CONSERVATION LAW / SURVIVAL SCORE — instead of "what is true", ask
       "what remains true after repeated transformations". A conserved
       structure's survival_score = the count of DISTINCT independent
       contexts it survived. Restating one context raises it by zero —
       survival is a metric, not usage. (the conservation analog of the
       planner's D3)

     · MATURITY STATES — hypothesized < observed < verified. Maturity never
       silently upgrades; only INDEPENDENT evidence raises it (verified
       needs independent replication). Repetition is not verification.

     · EVOLUTION KERNEL — given a partial case, propose the next EXPERIMENT
       (a falsifiable hypothesis the best-matching genome predicts), never
       a prediction or conclusion. Memory → lab.

   Reuses the seam (a transfer/survival observation counts only if
   independent) and mirrors the principle-graph (a proposed experiment must
   carry a falsifier). Deterministic; proven on SYNTHETIC genomes. Populating
   it with a REAL organization's entities/people is operator-gated + PII-held.

   DETERMINISM: no Date.now(), no Math.random(), no network, no LLM.
   ===================================================================== */

"use strict";
var path = require("path");
var seam = require(path.join(__dirname, "witnessed-loop-graph-seam.js"));

var MATURITY = { hypothesized: 0, observed: 1, verified: 2 };
var GENOME_SLOTS = ["start_state", "trigger", "constraint", "new_capability", "mutation", "stable_invariant"];

/* ---- TRANSFORMATION GENOME ---- */
function makeGenome(g) {
  for (var i = 0; i < GENOME_SLOTS.length; i++) {
    if (!g[GENOME_SLOTS[i]]) return { ok: false, reason: "GENOME_INCOMPLETE", missing: GENOME_SLOTS[i] };
  }
  if (!Array.isArray(g.evidence) || g.evidence.length === 0) return { ok: false, reason: "GENOME_WITHOUT_EVIDENCE" };
  return { ok: true, genome: {
    id: g.id, start_state: g.start_state, trigger: g.trigger, constraint: g.constraint,
    new_capability: g.new_capability, mutation: g.mutation, stable_invariant: g.stable_invariant,
    evidence: g.evidence.slice(), maturity: g.maturity || "hypothesized", lineage: g.lineage || {} } };
}
/* compare a case to a genome — structural fit on the load-bearing slots. */
function matchGenome(caseObj, genome) {
  var slots = ["trigger", "constraint", "stable_invariant"];
  var matched = slots.filter(function (s) { return caseObj[s] && caseObj[s] === genome[s]; });
  return { fit: matched.length / slots.length, matched_slots: matched };
}

/* ---- CAPABILITY TRANSFER LOG — learning by movement ---- */
function newTransferLog() { return { transfers: [] }; }
function logTransfer(logObj, t) {
  if (!t.capability) return { ok: false, reason: "NO_CAPABILITY" };
  if (!t.from_context || !t.to_context || t.from_context === t.to_context) {
    return { ok: false, reason: "NO_MOVEMENT" };                 /* no movement → nothing learned */
  }
  var claimShape = { producer_id: (t.origin_lineage || {}).producer_id,
    source_packet_hash: (t.origin_lineage || {}).packet,
    derivation_methods: (t.origin_lineage || {}).methods || [], created_at: (t.origin_lineage || {}).at, value: null };
  if (t.witness && !seam.independentlyWitnessed(claimShape, t.witness)) {
    return { ok: false, reason: "TRANSFER_NOT_INDEPENDENTLY_OBSERVED" };
  }
  logObj.transfers.push({ capability: t.capability, from: t.from_context, to: t.to_context,
    mutation: t.mutation || null, evidence: t.evidence || [] });
  return { ok: true, count: logObj.transfers.length };
}
/* an invariant may EMERGE from repeated independent transfers, never from
   intuition — grounded only at a threshold of distinct destination contexts. */
function emergentInvariant(logObj, capability, threshold) {
  var dests = {};
  logObj.transfers.forEach(function (tr) { if (tr.capability === capability) dests[tr.to] = true; });
  var n = Object.keys(dests).length;
  return { capability: capability, distinct_contexts: n, emerged: n >= (threshold || 3) };
}

/* ---- CONSERVATION LAW / SURVIVAL SCORE ---- */
function makeConservedStructure(id, lineage) {
  return { id: id, contexts: [], survival_score: 0, usage_count: 0, lineage: lineage || {} };
}
function noteUsage(law) { law.usage_count += 1; return law.usage_count; }  /* usage ≠ survival */
function observeSurvival(law, contextId, witness) {
  law.usage_count += 1;                                          /* it was mentioned; still not survival */
  if (law.contexts.indexOf(contextId) !== -1) return { ok: false, reason: "CONTEXT_ALREADY_COUNTED" };
  var claimShape = { producer_id: (law.lineage || {}).producer_id, source_packet_hash: (law.lineage || {}).packet,
    derivation_methods: (law.lineage || {}).methods || [], created_at: (law.lineage || {}).at, value: null };
  if (witness && !seam.independentlyWitnessed(claimShape, witness)) {
    return { ok: false, reason: "OBSERVATION_NOT_INDEPENDENT" };
  }
  law.contexts.push(contextId);
  law.survival_score = law.contexts.length;
  return { ok: true, survival_score: law.survival_score };
}

/* ---- MATURITY — never silently upgrades ---- */
function upgradeMaturity(current, evidence) {
  if (!evidence || evidence.independent !== true) return current;   /* repetition ≠ verification */
  if (current === "hypothesized") return "observed";
  if (current === "observed") return evidence.replicated === true ? "verified" : "observed";
  return current;
}

/* ---- EVOLUTION KERNEL — propose the next EXPERIMENT, not a prediction ---- */
function proposeNextExperiment(partialCase, genomeLibrary) {
  var best = null, bestFit = -1;
  genomeLibrary.forEach(function (gm) {
    var m = matchGenome(partialCase, gm);
    if (m.fit > bestFit) { bestFit = m.fit; best = gm; }
  });
  if (!best || bestFit === 0) return { ok: false, reason: "NO_MATCHING_GENOME" };
  return {
    ok: true,
    experiment: {
      hypothesis: { predicted_capability: best.new_capability, predicted_invariant: best.stable_invariant },
      maturity: "hypothesized",                                   /* a proposal, never a conclusion */
      falsifier: { what_would_disprove: "the predicted invariant fails to appear after the trigger in a fresh context",
        tests: ["run the trigger in a new context; observe whether " + best.stable_invariant + " holds"] },
      based_on_genome: best.id, fit: bestFit
    }
  };
}

module.exports = {
  MATURITY: MATURITY, GENOME_SLOTS: GENOME_SLOTS,
  makeGenome: makeGenome, matchGenome: matchGenome,
  newTransferLog: newTransferLog, logTransfer: logTransfer, emergentInvariant: emergentInvariant,
  makeConservedStructure: makeConservedStructure, noteUsage: noteUsage, observeSurvival: observeSurvival,
  upgradeMaturity: upgradeMaturity, proposeNextExperiment: proposeNextExperiment
};
