// EPOCH 3 — typed-relation epistemic kernel (LULU proposes · ZAZ hardens)
// authority=false · claim=NO_CLAIM · ledger_effect=none · pure (no DOM, no net, no Date/random)
//
// LAW (from the REVISION):
//   epistemic status  ⟂  operator disposition
//   object existence  ⇏  relation existence
//   semantic similarity ⇏ type compatibility
//
// A finite typed relation set. Each edge is an explicit triple (subject, relation, object).
// τ gives each relation its (subjectType, objectType) signature. An edge is admitted iff
// well-typed AND both endpoints exist. Ill-typed edges are REJECTED, never reinterpreted.
// Proof path P_c is built ONLY from accepted (witness, SUPPORTS, claim) edges.

"use strict";

// ---- 𝒯 : object domains ----
const OBJECT_TYPES = new Set(["claim", "witness", "report", "hypothesis", "decision"]);
// C=claim  W=witness  R=report  H=hypothesis  D=decision

// ---- τ : relation-signature table  (relation → [subjectType, objectType]) ----
const REL_SIG = {
  SUPPORTS:    ["witness",    "claim"],
  CONTRADICTS: ["witness",    "claim"],
  REPORTS:     ["report",     "claim"],
  PROPOSES:    ["hypothesis", "claim"],
  TARGETS:     ["decision",   "claim"],
};

// status tiers, strongest → weakest. Report/hypothesis/decision "incidence" floors the
// status even when the specific edge was rejected: overclaim is STRIPPED, not rewarded.
const TIER = { SUPPORTED: 6, CONTESTED: 5, REFUTED: 4, REPORTED: 3, PROPOSED: 2, TARGETED: 1, UNSUPPORTED: 0 };

function validate(input, opts) {
  opts = opts || {};
  const objects = (input && input.objects) || [];
  const relations = (input && input.relations) || [];

  // --- index objects; flag structural problems, never silently drop ---
  const byId = new Map();
  const objectErrors = [];
  for (const o of objects) {
    if (!o || typeof o.id !== "string") { objectErrors.push({ object: o, error: "MISSING_ID" }); continue; }
    if (byId.has(o.id)) { objectErrors.push({ id: o.id, error: "DUPLICATE_ID" }); continue; }
    if (!OBJECT_TYPES.has(o.type)) { objectErrors.push({ id: o.id, error: "UNKNOWN_OBJECT_TYPE" }); }
    byId.set(o.id, o);
  }
  const typeOf = (id) => { const o = byId.get(id); return o ? o.type : null; };

  // --- type-check every submitted edge; assign a stable edge_id for inspectability ---
  const accepted = [];
  const rejected = [];
  relations.forEach((r, i) => {
    const edge = { edge_id: i, subject: r && r.subject, relation: r && r.relation, object: r && r.object };
    const sig = REL_SIG[edge.relation];
    if (!sig) { rejected.push(Object.assign({}, edge, { error: "UNKNOWN_RELATION" })); return; }
    if (!byId.has(edge.subject)) { rejected.push(Object.assign({}, edge, { error: "UNKNOWN_SUBJECT" })); return; }
    if (!byId.has(edge.object))  { rejected.push(Object.assign({}, edge, { error: "UNKNOWN_OBJECT" })); return; }
    const stOK = typeOf(edge.subject) === sig[0];
    const otOK = typeOf(edge.object)  === sig[1];
    if (!stOK || !otOK) {
      // no-repair rule: reject the edge, never coerce the object into a fitting type
      rejected.push(Object.assign({}, edge, {
        error: "RELATION_TYPE_MISMATCH",
        expected: { subject: sig[0], object: sig[1] },
        got: { subject: typeOf(edge.subject), object: typeOf(edge.object) },
      }));
      return;
    }
    accepted.push(edge);
  });

  // --- per-claim proof / contradiction paths, from ACCEPTED typed edges only ---
  const claimIds = objects.filter(o => o && o.type === "claim").map(o => o.id);
  const claims = {};
  for (const c of claimIds) {
    const P_c = accepted.filter(e => e.relation === "SUPPORTS"    && e.object === c).map(e => e.subject);
    const N_c = accepted.filter(e => e.relation === "CONTRADICTS" && e.object === c).map(e => e.subject);

    // incidence: which OBJECT TYPES asserted any edge (accepted OR rejected) toward c,
    // where the subject actually exists. This floors — never inflates — the status.
    const incidence = new Set();
    for (const r of relations) {
      if (!r || r.object !== c) continue;
      const t = typeOf(r.subject);
      if (t) incidence.add(t);
    }

    let status;
    if (P_c.length && N_c.length) status = "CONTESTED";
    else if (P_c.length)          status = "SUPPORTED";
    else if (N_c.length)          status = "REFUTED";
    else if (incidence.has("report"))     status = "REPORTED";
    else if (incidence.has("hypothesis")) status = "PROPOSED";
    else if (incidence.has("decision"))   status = "TARGETED";
    else status = "UNSUPPORTED";

    claims[c] = { proof_path: P_c, contradiction_path: N_c, epistemic_status: status };
  }

  const out = {
    accepted_relations: accepted.map(e => ({ subject: e.subject, relation: e.relation, object: e.object })),
    rejected_relations: rejected.map(e => {
      const base = { subject: e.subject, relation: e.relation, object: e.object, error: e.error };
      return base;
    }),
    object_errors: objectErrors,
    claims,
  };

  // Flat mirror for a single focal claim (matches the EPOCH-3 TEST's output shape).
  const focus = opts.focus || (claimIds.length === 1 ? claimIds[0] : null);
  if (focus && claims[focus]) {
    out.proof_path = claims[focus].proof_path;
    out.epistemic_status = claims[focus].epistemic_status;
  }
  return out;
}

module.exports = { validate, REL_SIG, OBJECT_TYPES, TIER };
