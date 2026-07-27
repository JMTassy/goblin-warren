/* =====================================================================
   WITNESSED_LOOP_GRAPH_DISTINCTION_PLANNER_V0
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   The third cell:
     seam → schema → [distinction planner] → minimal loop selector
       → agent embodiment → Village

   The inversion. Conventional orchestration asks "which agents do we
   need?" and answers with a headcount. This planner asks the prior
   question — "which FALSE STATES must remain distinguishable?" — and emits
   the MINIMAL set of loops that separates them, before any agent exists.

   A distinction is a pair of states an honest system must never confuse,
   e.g. (source exists ≠ source supports claim). Each distinction is
   separated by exactly one loop with a required ANCHOR CLASS: the kind of
   independent evidence that can tell the two states apart. A distinction
   whose only separator is "another producer of the same lineage" is NOT
   separated — that is the redundant-swarm error this cell exists to refuse.

   It does NOT run loops, spawn agents, weight votes, or judge with an LLM
   (later cells). It compiles: distinctions → required loops → anchor
   requirements, and REJECTS a plan that cannot separate a required
   distinction with an independent anchor.

   DETERMINISM: no Date.now(), no Math.random(), no network, no LLM.
   The plan is a pure function of the task; `node` is the anchor.
   ===================================================================== */

"use strict";

/* ---------------------------------------------------------------------
   THE DISTINCTION LIBRARY — the false states an honest research system
   must keep apart, each with the loop that separates it and the ANCHOR
   CLASS that loop must consume. Anchor classes:
     independent_probe        — a live observation from a different source
     deterministic_check      — a schema/type/postcondition test
     disconfirmation_search   — an active hunt for contradicting evidence
     temporal_probe           — a freshness re-observation
     human_objective          — a person's purpose/decision
   A "producer" anchor class is deliberately ABSENT: more producers of the
   same lineage never separate a distinction. That absence is the point.
--------------------------------------------------------------------- */
var DISTINCTION_LIBRARY = {
  reported_vs_observed: {
    a: "a producer reported the state",
    b: "the state was independently observed",
    loop: "source_witness_loop",
    anchor_class: "independent_probe"
  },
  exists_vs_supports: {
    a: "a source exists",
    b: "the source supports the exact claim",
    loop: "source_witness_loop",
    anchor_class: "independent_probe"
  },
  correlated_vs_independent: {
    a: "multiple sources agree",
    b: "the sources are independent",
    loop: "lineage_loop",
    anchor_class: "deterministic_check"   /* lineage-signature comparison, not a vote */
  },
  supported_vs_current: {
    a: "the claim was true when written",
    b: "the claim is true now",
    loop: "freshness_loop",
    anchor_class: "temporal_probe"
  },
  supported_vs_uncontested: {
    a: "evidence supports the claim",
    b: "no evidence disconfirms it",
    loop: "counterclaim_loop",
    anchor_class: "disconfirmation_search"
  },
  clear_vs_correct: {
    a: "the synthesis reads clearly",
    b: "the synthesis matches the evidence",
    loop: "audit_loop",
    anchor_class: "deterministic_check"
  },
  produced_vs_verified: {
    a: "a report was produced",
    b: "its claims were verified against evidence",
    loop: "audit_loop",
    anchor_class: "deterministic_check"
  },
  reported_vs_admitted: {
    a: "a report exists",
    b: "a decision was admitted",
    loop: "reducer_loop",
    anchor_class: "human_objective"
  }
};

/* which anchor classes count as INDEPENDENT of a producer swarm — i.e.
   can actually separate a distinction. Everything real; the only excluded
   class is "producer" (more same-lineage producers), which never appears. */
var INDEPENDENT_ANCHOR_CLASSES = {
  independent_probe: true,
  deterministic_check: true,
  disconfirmation_search: true,
  temporal_probe: true,
  human_objective: true
};

/* ---------------------------------------------------------------------
   PLAN(task) — the compiler.
   task = {
     task_id,
     required_distinctions: [ "exists_vs_supports", ... ],
     available_anchors:     [ "independent_probe", "deterministic_check", ... ]
   }
   Returns a plan: the minimal deduplicated loop set, each with its anchor
   class and whether that anchor is AVAILABLE, plus an admissibility verdict.
--------------------------------------------------------------------- */
function plan(task) {
  var required = task.required_distinctions || [];
  var available = {};
  (task.available_anchors || []).forEach(function (a) { available[a] = true; });

  var unknown = required.filter(function (d) { return !DISTINCTION_LIBRARY[d]; });

  /* map each required distinction to its separating loop + anchor */
  var mapped = required
    .filter(function (d) { return DISTINCTION_LIBRARY[d]; })
    .map(function (d) {
      var def = DISTINCTION_LIBRARY[d];
      return {
        distinction: d,
        loop: def.loop,
        anchor_class: def.anchor_class,
        anchor_is_independent: !!INDEPENDENT_ANCHOR_CLASSES[def.anchor_class],
        anchor_available: !!available[def.anchor_class]
      };
    });

  /* MINIMAL loop set: dedupe by loop id, but a loop must carry EVERY anchor
     class any of its distinctions demand (one loop can separate several). */
  var byLoop = {};
  mapped.forEach(function (m) {
    if (!byLoop[m.loop]) byLoop[m.loop] = { loop: m.loop, separates: [], anchor_classes: {} };
    byLoop[m.loop].separates.push(m.distinction);
    byLoop[m.loop].anchor_classes[m.anchor_class] = true;
  });
  var loops = Object.keys(byLoop).map(function (k) {
    var L = byLoop[k];
    var classes = Object.keys(L.anchor_classes);
    return {
      loop: L.loop,
      separates: L.separates,
      anchor_classes: classes,
      anchors_available: classes.every(function (c) { return !!available[c]; }),
      anchors_independent: classes.every(function (c) { return !!INDEPENDENT_ANCHOR_CLASSES[c]; })
    };
  });

  /* a distinction is UNSEPARABLE if its anchor is not independent, or not
     available in this task. Either way the plan may not promise to tell the
     two states apart. */
  var unseparated = mapped.filter(function (m) {
    return !m.anchor_is_independent || !m.anchor_available;
  }).map(function (m) {
    return { distinction: m.distinction, anchor_class: m.anchor_class,
      reason: !m.anchor_is_independent ? "ANCHOR_NOT_INDEPENDENT" : "ANCHOR_UNAVAILABLE" };
  });

  var admissible = unknown.length === 0 && unseparated.length === 0;

  return {
    task_id: task.task_id,
    loops: loops,                 /* the minimal loop graph to instantiate */
    unknown_distinctions: unknown,
    unseparated_distinctions: unseparated,
    admissible: admissible,       /* may this plan proceed to loop-selection? */
    verdict: admissible ? "PLAN_ADMISSIBLE"
      : unknown.length ? "UNKNOWN_DISTINCTION"
      : "UNSEPARABLE_DISTINCTION"
  };
}

/* diagnostic: given only a headcount of same-lineage producers and no
   anchors, how many required distinctions does adding producers separate?
   Answer must be zero — the formal statement of "more agents ≠ more truth". */
function distinctionsSeparatedByProducers(task, extraProducers) {
  /* producers are not an anchor class in the library at all; adding any
     number separates nothing. */
  return 0;
}

module.exports = {
  DISTINCTION_LIBRARY: DISTINCTION_LIBRARY,
  INDEPENDENT_ANCHOR_CLASSES: INDEPENDENT_ANCHOR_CLASSES,
  plan: plan,
  distinctionsSeparatedByProducers: distinctionsSeparatedByProducers
};
