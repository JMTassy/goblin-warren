/* =====================================================================
   HELEN_MASTER_REGISTRY_V0.1  (upgraded from V0 under the Director's
   CONSOLIDATE order — git history preserves V0)
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   The registry is the address book, capability map and constitutional
   inventory. V0.1 adopts the Director's record schema and makes each of
   its columns an ADMISSION GATE:

     · maturity: imagined < specified < prototyped < tested < operational
       (+ unknown for things mentioned but insufficiently understood).
       `tested` and `operational` REQUIRE a receipt (path + replay).
     · status: canonical | provisional | deprecated. `canonical` REQUIRES
       an operator seal reference — this seat cannot canonize.
     · evidence_class: proven | reported | hypothesized. `proven` REQUIRES
       a receipt; reported and hypothesized register but add zero to the
       proven fold. Ceremony must not impersonate progress.
     · authority_level defaults to "none" and is NOT GRANTABLE HERE — any
       other value requires an operator seal reference.
     · kernel sovereignty: no entry may declare write access to a
       sovereign surface (kernel truth, sovereign ledger, replay,
       identity, sovereign memory rules). Every entry's
       must_not_write_to is auto-extended with those surfaces.
     · skills are extracted, never invented (kept from V0).
     · verification is measured, never asserted: `verifyReceipts` takes an
       injected filesystem probe (the engine has no fs — the probe is the
       outside anchor).

   DETERMINISM: no Date.now(), no Math.random(), no fs, no network, no LLM.
   ===================================================================== */

"use strict";

var VERSION = "0.1";
var CLASSES = ["agent", "skill", "meta_skill", "frame", "protocol", "artifact", "role", "skill_family", "director"];
var MATURITIES = ["imagined", "specified", "prototyped", "tested", "operational", "unknown"];
var STATUSES = ["canonical", "provisional", "deprecated"];
var EVIDENCE_CLASSES = ["proven", "reported", "hypothesized"];
var SOVEREIGN_SURFACES = ["kernel_truth", "sovereign_ledger", "replay", "identity", "sovereign_memory_rules"];

function newRegistry() { return { version: VERSION, entries: {}, order: [] }; }

function register(reg, e) {
  if (!e || !e.id) return { ok: false, reason: "ID_REQUIRED" };
  if (reg.entries[e.id]) return { ok: false, reason: "DUPLICATE_ID" };
  if (CLASSES.indexOf(e.class) === -1) return { ok: false, reason: "UNKNOWN_CLASS" };
  if (MATURITIES.indexOf(e.maturity) === -1) return { ok: false, reason: "MATURITY_REQUIRED" };
  if (STATUSES.indexOf(e.status) === -1) return { ok: false, reason: "STATUS_REQUIRED" };
  if (EVIDENCE_CLASSES.indexOf(e.evidence_class) === -1) return { ok: false, reason: "EVIDENCE_CLASS_REQUIRED" };

  var hasReceipt = !!(e.receipt && e.receipt.path && e.receipt.replay);
  if ((e.maturity === "tested" || e.maturity === "operational") && !hasReceipt) {
    return { ok: false, reason: "RECEIPT_REQUIRED_FOR_MATURITY" };      /* closure embargo */
  }
  if (e.evidence_class === "proven" && !hasReceipt) {
    return { ok: false, reason: "PROVEN_WITHOUT_RECEIPT" };
  }
  if (e.status === "canonical" && !e.sealed_by) {
    return { ok: false, reason: "CANONICAL_WITHOUT_OPERATOR_SEAL" };    /* this seat cannot canonize */
  }
  var authority = e.authority_level || "none";
  if (authority !== "none" && !e.sealed_by) {
    return { ok: false, reason: "AUTHORITY_NOT_GRANTABLE_HERE" };       /* authority defaults to false */
  }
  if (e.class === "skill" && !(Array.isArray(e.extracted_from) && e.extracted_from.length > 0)) {
    return { ok: false, reason: "SKILL_NOT_EXTRACTED_FROM_SOURCES" };   /* invention refused */
  }
  var wants = Array.isArray(e.may_write_to) ? e.may_write_to : [];
  for (var i = 0; i < wants.length; i++) {
    if (SOVEREIGN_SURFACES.indexOf(wants[i]) !== -1) {
      return { ok: false, reason: "SOVEREIGN_WRITE_REFUSED", surface: wants[i] };
    }
  }

  var stored = JSON.parse(JSON.stringify(e));
  stored.authority_level = authority;
  stored.must_not_write_to = SOVEREIGN_SURFACES.concat(
    (Array.isArray(e.must_not_write_to) ? e.must_not_write_to : []).filter(function (s) {
      return SOVEREIGN_SURFACES.indexOf(s) === -1;
    }));
  stored.verified = false;                                              /* measured later, never asserted */
  reg.entries[e.id] = stored;
  reg.order.push(e.id);
  return { ok: true, id: e.id };
}

/* Measure every receipt-bearing entry against an injected filesystem
   probe. The probe is the independent anchor: the engine cannot verify
   itself. */
function verifyReceipts(reg, fileExists) {
  var missing = [];
  reg.order.forEach(function (id) {
    var e = reg.entries[id];
    if (!(e.receipt && e.receipt.path)) { e.verified = false; return; }
    e.verified = fileExists(e.receipt.path) === true;
    if (!e.verified) missing.push({ id: id, path: e.receipt.path, reason: "RECEIPT_PATH_MISSING" });
  });
  return { ok: missing.length === 0, missing: missing };
}

/* The fold: the real status of the whole institution. Proven counts only
   VERIFIED receipts; testimony and candidates are preserved apart. */
function summary(reg) {
  var s = { version: reg.version, total: reg.order.length,
    by_class: {}, by_maturity: {}, by_status: {}, by_evidence: {},
    proven_verified: 0, proven_unverified: 0 };
  reg.order.forEach(function (id) {
    var e = reg.entries[id];
    s.by_class[e.class] = (s.by_class[e.class] || 0) + 1;
    s.by_maturity[e.maturity] = (s.by_maturity[e.maturity] || 0) + 1;
    s.by_status[e.status] = (s.by_status[e.status] || 0) + 1;
    s.by_evidence[e.evidence_class] = (s.by_evidence[e.evidence_class] || 0) + 1;
    if (e.evidence_class === "proven") {
      if (e.verified) s.proven_verified += 1; else s.proven_unverified += 1;
    }
  });
  return s;
}

module.exports = {
  VERSION: VERSION, CLASSES: CLASSES, MATURITIES: MATURITIES, STATUSES: STATUSES,
  EVIDENCE_CLASSES: EVIDENCE_CLASSES, SOVEREIGN_SURFACES: SOVEREIGN_SURFACES,
  newRegistry: newRegistry, register: register,
  verifyReceipts: verifyReceipts, summary: summary
};
