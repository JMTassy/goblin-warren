/* =====================================================================
   HELEN_MASTER_REGISTRY_V0.1 — proof suite. The Director's record schema
   with every column enforced as an admission gate. Run:
     node helen/master-registry.test.js
   Exit 0 iff every property holds. `node` + the real filesystem are the
   anchors: MR5 measures every receipt against the actual repo.
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
function base(over) {
  var e = { id: "t", class: "artifact", maturity: "imagined", status: "provisional", evidence_class: "hypothesized" };
  Object.keys(over || {}).forEach(function (k) { e[k] = over[k]; });
  return e;
}

/* ===================================================================
   MR1 — CLOSURE EMBARGO: maturity tested/operational and evidence
   `proven` all REQUIRE a receipt (path + replay). NO RECEIPT → NO SHIP.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  var t = R.register(reg, base({ id: "a", maturity: "tested" }));
  var o = R.register(reg, base({ id: "b", maturity: "operational" }));
  var p = R.register(reg, base({ id: "c", evidence_class: "proven" }));
  var ok = R.register(reg, base({ id: "d", maturity: "tested", evidence_class: "proven",
    receipt: { path: "helen/master-registry.js", replay: "node helen/master-registry.test.js" } }));
  log("MR1_closure_embargo_receipt_required",
    t.reason === "RECEIPT_REQUIRED_FOR_MATURITY" && o.reason === "RECEIPT_REQUIRED_FOR_MATURITY" &&
    p.reason === "PROVEN_WITHOUT_RECEIPT" && ok.ok === true,
    "tested/operational/proven all refuse without receipt; with receipt → registered");
})();

/* ===================================================================
   MR2 — SKILLS ARE EXTRACTED, NEVER INVENTED; empty families register.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  var invented = R.register(reg, base({ id: "skill/x", class: "skill" }));
  var sourced = R.register(reg, base({ id: "skill/y", class: "skill", extracted_from: ["helen/witnessed-loop-graph-seam.js"] }));
  var family = R.register(reg, base({ id: "family/z", class: "skill_family" }));
  log("MR2_skill_invention_refused_extraction_required",
    invented.reason === "SKILL_NOT_EXTRACTED_FROM_SOURCES" && sourced.ok === true && family.ok === true,
    "invented skill refused; sourced skill + empty family registered");
})();

/* ===================================================================
   MR3 — CANONIZATION AND AUTHORITY ARE NOT GRANTABLE HERE: canonical
   requires an operator seal reference; authority_level ≠ none requires
   the same. Authority defaults to none.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  var canon = R.register(reg, base({ id: "a", status: "canonical" }));
  var auth = R.register(reg, base({ id: "b", authority_level: "admit" }));
  var sealed = R.register(reg, base({ id: "c", status: "canonical", sealed_by: "CLAUDE.md (operator-authored)" }));
  var dflt = R.register(reg, base({ id: "d" }));
  log("MR3_canon_and_authority_require_operator_seal",
    canon.reason === "CANONICAL_WITHOUT_OPERATOR_SEAL" && auth.reason === "AUTHORITY_NOT_GRANTABLE_HERE" &&
    sealed.ok === true && dflt.ok === true && reg.entries["d"].authority_level === "none",
    "self-canonization refused; self-authority refused; default authority=none");
})();

/* ===================================================================
   MR4 — KERNEL SOVEREIGNTY: no entry may declare write access to a
   sovereign surface; every entry's must_not_write_to is auto-extended
   with all sovereign surfaces. The autoresearch boundary, structural.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  var grab = R.register(reg, base({ id: "a", may_write_to: ["ranking", "sovereign_ledger"] }));
  var lawful = R.register(reg, base({ id: "b", may_write_to: ["ranking", "prompt_patterns"] }));
  var fence = reg.entries["b"].must_not_write_to;
  var fenced = R.SOVEREIGN_SURFACES.every(function (s) { return fence.indexOf(s) !== -1; });
  log("MR4_sovereign_surfaces_unwritable",
    grab.reason === "SOVEREIGN_WRITE_REFUSED" && grab.surface === "sovereign_ledger" &&
    lawful.ok === true && fenced,
    "write-to-ledger refused; lawful entry auto-fenced from all " + R.SOVEREIGN_SURFACES.length + " sovereign surfaces");
})();

/* ===================================================================
   MR5 — THE REAL FOLD, MEASURED: every entry in the data file registers,
   and every receipt path EXISTS in this repo right now.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  var refused = [];
  DATA.ENTRIES.forEach(function (e) { var r = R.register(reg, e); if (!r.ok) refused.push(e.id + ":" + r.reason); });
  var v = R.verifyReceipts(reg, repoFileExists);
  log("MR5_real_registry_registers_and_all_receipts_exist",
    refused.length === 0 && v.ok === true,
    refused.length ? "REFUSED: " + refused.join(" ") :
      (v.ok ? "all " + DATA.ENTRIES.length + " entries registered; every receipt path exists on disk"
            : "MISSING: " + JSON.stringify(v.missing)));
})();

/* ===================================================================
   MR6 — REALITY AND ASPIRATION COUNTED APART: 12 proven-verified
   (9 helen cells incl. constitution+registry, 3 game harnesses); the 4
   reported lane artifacts and every imagined/specified entry add ZERO
   to the proven fold; exactly ONE canonical entry, operator-sealed.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  DATA.ENTRIES.forEach(function (e) { R.register(reg, e); });
  R.verifyReceipts(reg, repoFileExists);
  var s = R.summary(reg);
  var canonId = reg.order.filter(function (id) { return reg.entries[id].status === "canonical"; });
  log("MR6_reported_never_inflates_proven_one_sealed_canon",
    s.proven_verified === 12 && s.proven_unverified === 0 &&
    s.by_evidence.reported === 27 && s.by_evidence.hypothesized === 3 &&
    s.by_status.canonical === 1 && canonId[0] === "game/index-v0" &&
    !!reg.entries["game/index-v0"].sealed_by,
    "proven_verified=" + s.proven_verified + " ; reported=" + s.by_evidence.reported +
    " → +0 ; canonical=[" + canonId.join(",") + "] (operator-sealed)");
})();

/* ===================================================================
   MR7 — SPOOF: a phantom receipt registers (shape ok) but FAILS
   measurement — flagged RECEIPT_PATH_MISSING, excluded from the fold.
   =================================================================== */
(function () {
  var reg = R.newRegistry();
  R.register(reg, base({ id: "spoof", maturity: "tested", evidence_class: "proven",
    receipt: { path: "helen/does-not-exist.js", replay: "node nothing" } }));
  var v = R.verifyReceipts(reg, repoFileExists);
  var s = R.summary(reg);
  log("MR7_missing_receipt_measured_and_excluded",
    v.ok === false && v.missing[0].reason === "RECEIPT_PATH_MISSING" && s.proven_verified === 0 && s.proven_unverified === 1,
    "phantom receipt → RECEIPT_PATH_MISSING ; proven fold = 0");
})();

/* ===================================================================
   MR8 — determinism / purity of the ENGINE (scan code, not prose): no
   fs, no clock, no random, no network — the probe is injected.
   =================================================================== */
(function () {
  var code = fs.readFileSync(path.join(__dirname, "master-registry.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]fs['"]\)|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("MR8_engine_is_pure_probe_is_injected", clean,
    clean ? "no fs/clock/random/network in the engine" : "IMPURITY FOUND");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
