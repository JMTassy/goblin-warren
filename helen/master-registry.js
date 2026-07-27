/* =====================================================================
   MASTER_REGISTRY_V0  (HELEN/LNOS — the registry the recap names as the
   next step: agents · Directors · frames · skills · artifacts, each with
   its REAL status)
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   The recap's own laws, made structural instead of editorial:

     · CLAIM TYPING IS MANDATORY — every entry is WITNESSED | REPORTED |
       CANDIDATE | NEEDS_ME. "Real status" is not a prose column; it is
       an admission gate.
     · CLOSURE VOCABULARY IS EMBARGOED WITHOUT A RECEIPT — an entry may
       not register as WITNESSED unless it carries a receipt (a path in
       this repo + the command that replays it). NO RECEIPT → NO SHIP.
     · REPORTED NEVER INFLATES WITNESSED — another lane's "16/16 green"
       is testimony. It registers, it is preserved, it counts as zero in
       the witnessed fold. (report ↛ receipt — forbidden morphism)
     · SKILLS ARE EXTRACTED, NEVER INVENTED — a skill entry with no
       `extracted_from` sources is REFUSED outright (§13.3 of the recap:
       "extraits des sources réelles, et non inventés abstraitement").
       Empty skill FAMILIES may register — a named absence is honest;
       an invented member is not.
     · VERIFICATION IS MEASURED, NOT ASSERTED — `verifyReceipts` takes an
       injected `fileExists` probe and checks every WITNESSED receipt
       against the actual filesystem. A WITNESSED entry whose receipt
       path is missing is flagged RECEIPT_PATH_MISSING and drops out of
       the verified fold. The engine itself touches no fs (the probe is
       the anchor, injected from outside — the seam's shape again).

   DETERMINISM: no Date.now(), no Math.random(), no network, no fs, no LLM.
   ===================================================================== */

"use strict";

var KINDS = ["role", "frame", "skill_family", "skill", "artifact", "agent", "director"];
var CLAIM_TYPES = ["WITNESSED", "REPORTED", "CANDIDATE", "NEEDS_ME"];
var STATUSES = ["hypothesized", "observed", "verified", "frozen", "awaiting_corpus", "absent_from_this_repo"];

function newRegistry() { return { entries: {}, order: [] }; }

function register(reg, e) {
  if (!e || !e.id) return { ok: false, reason: "ID_REQUIRED" };
  if (reg.entries[e.id]) return { ok: false, reason: "DUPLICATE_ID" };
  if (KINDS.indexOf(e.kind) === -1) return { ok: false, reason: "UNKNOWN_KIND" };
  if (CLAIM_TYPES.indexOf(e.claim_type) === -1) return { ok: false, reason: "CLAIM_TYPE_REQUIRED" };
  if (STATUSES.indexOf(e.status) === -1) return { ok: false, reason: "STATUS_REQUIRED" };
  if (e.claim_type === "WITNESSED" && !(e.receipt && e.receipt.path && e.receipt.replay)) {
    return { ok: false, reason: "WITNESSED_WITHOUT_RECEIPT" };          /* closure embargo */
  }
  if (e.kind === "skill" && !(Array.isArray(e.extracted_from) && e.extracted_from.length > 0)) {
    return { ok: false, reason: "SKILL_NOT_EXTRACTED_FROM_SOURCES" };   /* invention refused */
  }
  var stored = JSON.parse(JSON.stringify(e));
  stored.verified = false;                                              /* measured later, never asserted */
  reg.entries[e.id] = stored;
  reg.order.push(e.id);
  return { ok: true, id: e.id };
}

/* Measure every WITNESSED receipt against an injected filesystem probe.
   The probe is the independent anchor: the engine cannot verify itself. */
function verifyReceipts(reg, fileExists) {
  var missing = [];
  reg.order.forEach(function (id) {
    var e = reg.entries[id];
    if (e.claim_type !== "WITNESSED") { e.verified = false; return; }
    var present = fileExists(e.receipt.path);
    e.verified = present === true;
    if (!e.verified) missing.push({ id: id, path: e.receipt.path, reason: "RECEIPT_PATH_MISSING" });
  });
  return { ok: missing.length === 0, missing: missing };
}

/* The fold: real status of the whole registry. Witnessed counts only
   VERIFIED receipts; testimony and candidates are preserved but never
   pooled into the witnessed number. */
function summary(reg) {
  var s = { total: reg.order.length, by_kind: {}, by_claim: {}, witnessed_verified: 0, witnessed_unverified: 0 };
  reg.order.forEach(function (id) {
    var e = reg.entries[id];
    s.by_kind[e.kind] = (s.by_kind[e.kind] || 0) + 1;
    s.by_claim[e.claim_type] = (s.by_claim[e.claim_type] || 0) + 1;
    if (e.claim_type === "WITNESSED") {
      if (e.verified) s.witnessed_verified += 1; else s.witnessed_unverified += 1;
    }
  });
  return s;
}

module.exports = {
  KINDS: KINDS, CLAIM_TYPES: CLAIM_TYPES, STATUSES: STATUSES,
  newRegistry: newRegistry, register: register,
  verifyReceipts: verifyReceipts, summary: summary
};
