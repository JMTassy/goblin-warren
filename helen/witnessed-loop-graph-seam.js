/* =====================================================================
   WITNESSED_LOOP_GRAPH_SEAM_V0
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   Proves ONE narrow constitutional property, and nothing more:

       A self-confirming group of agents cannot promote a claim
       without independent evidence.

   This is NOT the general loop-graph compiler. It is the single
   executable cell that shows the central law is enforceable. Per the
   spec's §7, it deliberately excludes: dynamic graph optimization,
   worker spawning, weighted voting, reputation, LLM-based independence
   judgments, automatic canonical mutation, ontology, Village sim.

   DETERMINISM: no Date.now(), no Math.random(), no network. Time enters
   only as passed-in data (created_at / observed_at / now) so the seam is
   replay-identical — the same discipline the game reducer holds, and the
   reason a `node` run can itself serve as the independent anchor.

   Vocabulary maps 1:1 onto the loop-graph chiddush:
     producer  — proposes the transition (may be a swarm; may all agree)
     reviewer  — critiques using the SAME packet (agreement ≠ evidence)
     witness   — independently observes whether the claim holds (the anchor)
     reducer   — decides admission; consumes evidence, never confidence
   ===================================================================== */

"use strict";

/* epoch(): tolerant time reader — accepts an ISO string or an epoch ms
   number. Pure; never reads the system clock. */
function epoch(t) {
  if (typeof t === "number") return t;
  if (typeof t === "string") {
    var ms = Date.parse(t);          /* parse of a supplied string is pure */
    return isNaN(ms) ? NaN : ms;
  }
  return NaN;
}

/* ---------------------------------------------------------------------
   THE INDEPENDENCE PREDICATE — the load-bearing function.

   I(claim, witness) = 1 only when the witness does NOT share the claim's
   decisive dependencies. Intentionally STRICT: false independence is more
   dangerous than an extra required check. Two nominally different agents
   can still be one epistemic source — so identity of name is never enough;
   the lineage (producer, input packet, derivation method) must differ, and
   the observation must post-date the claim (you cannot witness the past).
--------------------------------------------------------------------- */
function independentlyWitnessed(claim, witness) {
  return (
    witness.source_class === "INDEPENDENT_RUNTIME_PROBE" &&
    witness.producer_id !== claim.producer_id &&
    witness.input_hash !== claim.source_packet_hash &&
    (claim.derivation_methods || []).indexOf(witness.method) === -1 &&
    epoch(witness.observed_at) >= epoch(claim.created_at)
  );
}

/* build a reduction-decision object (the §2 shape). canon_effect is ALWAYS
   false here: passing the anchor-cut is NECESSARY, never SUFFICIENT, for
   canon — a downstream reducer/human receipt still promotes. ADMIT means
   "admittable", not "admitted". */
function decision(claim, result, reasonCodes, evidenceRefs) {
  return {
    claim_id: claim.claim_id,
    result: result,                       /* ADMIT | REJECT | HOLD | HOLD_REOBSERVE */
    reason_codes: reasonCodes,
    evidence_refs: evidenceRefs || [],
    authority: "REDUCER",
    admittable: result === "ADMIT",
    canon_effect: false                   /* anchor-cut is necessary, not sufficient */
  };
}

/* ---------------------------------------------------------------------
   THE ANCHOR-CUT GATE.

   Admit(c) ⇒ ∃ a ∉ C : a ⇝ c ∧ Independent(a, C)

   Supportive reviews may improve a proposal; they can NEVER replace the
   anchor. Order of judgment:
     1. no independent witness at all        → HOLD           (NO_INDEPENDENT_ANCHOR)
     2. independent witnesses all stale       → HOLD_REOBSERVE (WITNESS_STALE)
        (previously witnessed ⊬ currently true — a stale reading may
         neither confirm nor contradict; it must be re-observed)
     3. a fresh independent witness disagrees → REJECT         (ANCHOR_CONTRADICTION)
     4. fresh independent witness(es) agree   → ADMIT          (INDEPENDENT_ANCHOR_CONFIRMED)
--------------------------------------------------------------------- */
function reduceClaim(claim, reviews, witnesses, opts) {
  opts = opts || {};
  var horizon = typeof opts.freshnessHorizonMs === "number" ? opts.freshnessHorizonMs : Infinity;
  var now = opts.now;

  /* reviews are collected for the record but do NOT control admission */
  reviews.filter(function (r) { return r.verdict === "SUPPORT"; });

  var independent = witnesses.filter(function (w) { return independentlyWitnessed(claim, w); });
  if (independent.length === 0) {
    return decision(claim, "HOLD", ["NO_INDEPENDENT_ANCHOR"], []);
  }

  var fresh = independent.filter(function (w) {
    if (now === undefined || horizon === Infinity) return true;
    return (epoch(now) - epoch(w.observed_at)) <= horizon;
  });
  if (fresh.length === 0) {
    return decision(claim, "HOLD_REOBSERVE", ["WITNESS_STALE"],
      independent.map(function (w) { return w.witness_id; }));
  }

  var contradicting = fresh.filter(function (w) { return w.observed_value !== claim.value; });
  if (contradicting.length > 0) {
    return decision(claim, "REJECT", ["ANCHOR_CONTRADICTION"],
      contradicting.map(function (w) { return w.witness_id; }));
  }

  return decision(claim, "ADMIT", ["INDEPENDENT_ANCHOR_CONFIRMED"],
    fresh.map(function (w) { return w.witness_id; }));
}

module.exports = { epoch: epoch, independentlyWitnessed: independentlyWitnessed, reduceClaim: reduceClaim };
