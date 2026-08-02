// EPOCH 3 — adversarial receipt. No deps. `node epoch3.test.js` → exit 1 on any failure.
"use strict";
const { validate } = require("./epoch3-typed-relations.js");

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log("  [ok] " + name); }
  else { fail++; console.log("  [FAIL] " + name + (extra ? "\n         " + extra : "")); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- THE spec TEST (verbatim adversarial input) ----------
const spec = validate({
  objects: [
    { id: "c1", type: "claim",      content: "Model A passed the benchmark." },
    { id: "r1", type: "report",     content: "A vendor says Model A passed." },
    { id: "h1", type: "hypothesis", content: "Model A probably passed." },
  ],
  relations: [
    { subject: "r1", relation: "SUPPORTS", object: "c1" },
    { subject: "h1", relation: "PROPOSES", object: "c1" },
  ],
});
console.log("\nEPOCH-3 spec TEST output:\n" + JSON.stringify({
  accepted_relations: spec.accepted_relations,
  rejected_relations: spec.rejected_relations.map(r => ({ subject: r.subject, relation: r.relation, object: r.object, error: r.error })),
  proof_path: spec.proof_path,
  epistemic_status: spec.epistemic_status,
}, null, 2) + "\n");

// the four explicit failure conditions from the spec, each asserted:
ok(!spec.proof_path.includes("r1"), "does NOT coerce r1 (report) into a witness / proof path");
ok(!spec.proof_path.includes("h1"), "does NOT include h1 (hypothesis) in the proof path");
ok(spec.epistemic_status !== "PROVEN", "does NOT return PROVEN");
ok(spec.rejected_relations.some(r => r.subject === "r1" && r.relation === "SUPPORTS" && r.error === "RELATION_TYPE_MISMATCH"),
   "does NOT suppress the malformed edge (surfaced as RELATION_TYPE_MISMATCH)");
// exact required-behavior match:
ok(eq(spec.accepted_relations, [{ subject: "h1", relation: "PROPOSES", object: "c1" }]), "accepted_relations == [h1 PROPOSES c1]");
ok(eq(spec.proof_path, []), "proof_path == []");
ok(spec.epistemic_status === "REPORTED", "epistemic_status == REPORTED (report incidence floors it above the mere hypothesis)");

// ---------- valid witness support → SUPPORTED ----------
const sup = validate({
  objects: [{ id: "c", type: "claim" }, { id: "w", type: "witness" }],
  relations: [{ subject: "w", relation: "SUPPORTS", object: "c" }],
});
ok(eq(sup.proof_path, ["w"]) && sup.epistemic_status === "SUPPORTED", "witness SUPPORTS → proof_path [w], SUPPORTED");

// ---------- support + contradiction → CONTESTED, separate paths ----------
const con = validate({
  objects: [{ id: "c", type: "claim" }, { id: "w1", type: "witness" }, { id: "w2", type: "witness" }],
  relations: [
    { subject: "w1", relation: "SUPPORTS",    object: "c" },
    { subject: "w2", relation: "CONTRADICTS", object: "c" },
  ],
});
ok(eq(con.claims.c.proof_path, ["w1"]) && eq(con.claims.c.contradiction_path, ["w2"]) && con.claims.c.epistemic_status === "CONTESTED",
   "SUPPORTS + CONTRADICTS → P_c and N_c stay separate, CONTESTED");

// ---------- contradiction only → REFUTED ----------
const ref = validate({
  objects: [{ id: "c", type: "claim" }, { id: "w", type: "witness" }],
  relations: [{ subject: "w", relation: "CONTRADICTS", object: "c" }],
});
ok(ref.epistemic_status === "REFUTED" && eq(ref.proof_path, []), "witness CONTRADICTS only → REFUTED, empty proof path");

// ---------- decision TARGETS claim → not a witness; TARGETED floor ----------
const dec = validate({
  objects: [{ id: "c", type: "claim" }, { id: "d", type: "decision" }],
  relations: [{ subject: "d", relation: "TARGETS", object: "c" }],
});
ok(eq(dec.proof_path, []) && dec.epistemic_status === "TARGETED", "decision TARGETS → not in proof path, TARGETED");

// ---------- decision tries to SUPPORT (type mismatch) → rejected, not coerced ----------
const decBad = validate({
  objects: [{ id: "c", type: "claim" }, { id: "d", type: "decision" }],
  relations: [{ subject: "d", relation: "SUPPORTS", object: "c" }],
});
ok(eq(decBad.proof_path, []) && decBad.rejected_relations[0].error === "RELATION_TYPE_MISMATCH",
   "decision→SUPPORTS rejected (no operator disposition leaks into proof)");

// ---------- unknown relation → rejected ----------
const unk = validate({
  objects: [{ id: "c", type: "claim" }, { id: "w", type: "witness" }],
  relations: [{ subject: "w", relation: "PROVES", object: "c" }],
});
ok(unk.rejected_relations[0] && unk.rejected_relations[0].error === "UNKNOWN_RELATION", "unknown relation PROVES → UNKNOWN_RELATION");

// ---------- dangling reference → rejected, no phantom proof ----------
const dang = validate({
  objects: [{ id: "c", type: "claim" }],
  relations: [{ subject: "w_missing", relation: "SUPPORTS", object: "c" }],
});
ok(dang.rejected_relations[0].error === "UNKNOWN_SUBJECT" && eq(dang.proof_path, []),
   "edge to non-existent witness → UNKNOWN_SUBJECT, no phantom proof");

// ---------- object existence ⇏ relation existence ----------
const noRel = validate({
  objects: [{ id: "c", type: "claim" }, { id: "w", type: "witness" }],
  relations: [],
});
ok(eq(noRel.proof_path, []) && noRel.epistemic_status === "UNSUPPORTED",
   "witness present but no edge → UNSUPPORTED (object existence ⇏ relation existence)");

// ---------- edge identity: every submitted relation is inspectable ----------
const ident = validate({
  objects: [{ id: "c", type: "claim" }, { id: "r", type: "report" }, { id: "w", type: "witness" }],
  relations: [
    { subject: "r", relation: "SUPPORTS", object: "c" }, // rejected
    { subject: "w", relation: "SUPPORTS", object: "c" }, // accepted
  ],
});
ok(ident.accepted_relations.length === 1 && ident.rejected_relations.length === 1,
   "mixed batch: exactly which edge justified the output is inspectable (1 accepted, 1 rejected)");

console.log(`\nEPOCH-3 receipt: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
