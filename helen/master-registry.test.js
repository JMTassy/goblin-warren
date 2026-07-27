/* =====================================================================
   MASTER_REGISTRY_V0 — proof suite. The registry the recap names as the
   next step, with its laws enforced structurally. Run:
     node helen/master-registry.test.js
   Exit 0 iff every property holds. `node` + the real filesystem are the
   anchors: MR4 measures every WITNESSED receipt against the actual repo.
   ===================================================================== */
"use strict";
var path = require("path");
var fs = require("fs");
var R = require(path.join(__dirname, "master-registry.js"));
var DATA = require(path.join(__dirname, "master-registry.data.js"));

var results = {};
function log(n, p, d) { results[n] = p; console.log((p ? "PASS " : "FAIL ") + n + " — " + d); }

var REPO_ROOT = path.join(__dirname, "..");
function repoFileExists(p) { return fs.existsSync(path.join(REPO_ROOT, p)); }

/* ===================================================================
   MR1 — CLOSURE EMBARGO: an entry may not register as WITNESSED without
   a receipt (path + replay command). NO RECEIPT → NO SHIP.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  var bare = R.register(reg, { id: "x1", kind: "artifact", claim_type: "WITNESSED", status: "verified" });
  var half = R.register(reg, { id: "x2", kind: "artifact", claim_type: "WITNESSED", status: "verified", receipt: { path: "a.js" } });
  var full = R.register(reg, { id: "x3", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/master-registry.js", replay: "node helen/master-registry.test.js" } });
  log("MR1_witnessed_without_receipt_refused",
    bare.ok === false && bare.reason === "WITNESSED_WITHOUT_RECEIPT" &&
    half.ok === false && half.reason === "WITNESSED_WITHOUT_RECEIPT" && full.ok === true,
    "no receipt → " + bare.reason + " ; path-only → " + half.reason + " ; path+replay → registered");
})();

/* ===================================================================
   MR2 — SKILLS ARE EXTRACTED, NEVER INVENTED: a skill entry with no
   extracted_from sources is refused at ANY claim type. Empty FAMILIES
   register fine — a named absence is honest.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  var invented = R.register(reg, { id: "skill/uzik-brand-voice", kind: "skill", claim_type: "CANDIDATE", status: "hypothesized" });
  var inventedW = R.register(reg, { id: "skill/uzik-brand-voice-2", kind: "skill", claim_type: "REPORTED", status: "hypothesized", extracted_from: [] });
  var extracted = R.register(reg, { id: "skill/anchor-cut-check", kind: "skill", claim_type: "CANDIDATE", status: "hypothesized",
    extracted_from: ["helen/witnessed-loop-graph-seam.js"] });
  var family = R.register(reg, { id: "family/empty-ok", kind: "skill_family", claim_type: "NEEDS_ME", status: "awaiting_corpus" });
  log("MR2_skill_invention_refused_extraction_required",
    invented.ok === false && invented.reason === "SKILL_NOT_EXTRACTED_FROM_SOURCES" &&
    inventedW.ok === false && inventedW.reason === "SKILL_NOT_EXTRACTED_FROM_SOURCES" &&
    extracted.ok === true && family.ok === true,
    "invented skill → " + invented.reason + " ; sourced skill + empty family → registered");
})();

/* ===================================================================
   MR3 — no duplicate ids; unknown kind / claim / status refused.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  R.register(reg, { id: "d1", kind: "role", claim_type: "CANDIDATE", status: "hypothesized" });
  var dup = R.register(reg, { id: "d1", kind: "role", claim_type: "CANDIDATE", status: "hypothesized" });
  var badKind = R.register(reg, { id: "d2", kind: "wizard", claim_type: "CANDIDATE", status: "hypothesized" });
  var badClaim = R.register(reg, { id: "d3", kind: "role", claim_type: "TRUE", status: "hypothesized" });
  var badStatus = R.register(reg, { id: "d4", kind: "role", claim_type: "CANDIDATE", status: "done" });
  log("MR3_shape_enforced",
    dup.reason === "DUPLICATE_ID" && badKind.reason === "UNKNOWN_KIND" &&
    badClaim.reason === "CLAIM_TYPE_REQUIRED" && badStatus.reason === "STATUS_REQUIRED",
    "dup/kind/claim/status all refused (" + [dup.reason, badKind.reason, badClaim.reason, badStatus.reason].join(", ") + ")");
})();

/* ===================================================================
   MR4 — THE REAL FOLD, MEASURED: every entry in the data file registers,
   and every WITNESSED receipt path EXISTS in this repo right now. The
   filesystem is the injected anchor — the registry cannot verify itself.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  var refused = [];
  DATA.ENTRIES.forEach(function (e) { var r = R.register(reg, e); if (!r.ok) refused.push(e.id + ":" + r.reason); });
  var v = R.verifyReceipts(reg, repoFileExists);
  log("MR4_real_registry_registers_and_all_receipts_exist",
    refused.length === 0 && v.ok === true,
    refused.length ? "REFUSED: " + refused.join(" ") :
      (v.ok ? "all " + DATA.ENTRIES.length + " entries registered; every WITNESSED receipt path exists on disk"
            : "MISSING: " + JSON.stringify(v.missing)));
})();

/* ===================================================================
   MR5 — REPORTED NEVER INFLATES WITNESSED: the summary's witnessed count
   comes only from verified receipts; the 4 other-lane reports contribute
   zero, whatever their reported test counts say.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  DATA.ENTRIES.forEach(function (e) { R.register(reg, e); });
  R.verifyReceipts(reg, repoFileExists);
  var s = R.summary(reg);
  log("MR5_reported_never_inflates_witnessed",
    s.witnessed_verified === 10 && s.by_claim.REPORTED === 4 &&
    s.by_claim.WITNESSED === 10 && s.witnessed_unverified === 0,
    "witnessed_verified=" + s.witnessed_verified + " (7 cells + 3 game harnesses) ; REPORTED=" + s.by_claim.REPORTED + " → +0");
})();

/* ===================================================================
   MR6 — SPOOF: registering a WITNESSED entry whose receipt points at a
   file that does not exist passes registration (shape is fine) but FAILS
   measurement — flagged RECEIPT_PATH_MISSING, excluded from the verified
   fold. Verification is measured, not asserted.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  R.register(reg, { id: "spoof", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/does-not-exist.js", replay: "node nothing" } });
  var v = R.verifyReceipts(reg, repoFileExists);
  var s = R.summary(reg);
  log("MR6_missing_receipt_measured_and_excluded",
    v.ok === false && v.missing[0].reason === "RECEIPT_PATH_MISSING" &&
    s.witnessed_verified === 0 && s.witnessed_unverified === 1,
    "phantom receipt → " + v.missing[0].reason + " ; verified fold = 0");
})();

/* ===================================================================
   MR7 — determinism / purity of the ENGINE (scan code, not prose): the
   engine itself has no fs, no clock, no random, no network — the probe
   is injected from outside.
   =================================================================== */
(function () {
  var code = fs.readFileSync(path.join(__dirname, "master-registry.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]fs['"]\)|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("MR7_engine_is_pure_probe_is_injected", clean,
    clean ? "no fs/clock/random/network in the engine" : "IMPURITY FOUND");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
