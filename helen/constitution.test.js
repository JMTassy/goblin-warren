/* =====================================================================
   HELEN_CONSTITUTION_V0.1 — proof suite. The freeze is measurable: the
   fold hash is PINNED here, so any silent redefinition of any element
   breaks this suite. Amending is lawful (edit → re-pin → commit, visible
   in git); drifting silently is not. Run:
     node helen/constitution.test.js
   ===================================================================== */
"use strict";
var path = require("path");
var C = require(path.join(__dirname, "constitution.js"));

var results = {};
function log(n, p, d) { results[n] = p; console.log((p ? "PASS " : "FAIL ") + n + " — " + d); }

/* THE PIN. Changing any element's id, state or meaning changes this hash.
   To amend the constitution: make the edit, re-run to get the new hash,
   update this constant IN THE SAME COMMIT. The diff is the amendment record. */
var PINNED_HASH = "e8bd1806";

/* ===================================================================
   C1 — every element carries a valid state and a meaning; no unmarked
   element exists (the whole point of the freeze).
   =================================================================== */
(function () {
  var bad = C.ELEMENTS.filter(function (e) {
    return C.STATES.indexOf(e.state) === -1 || !e.meaning || !e.id;
  });
  log("C1_every_element_marked_and_meant", bad.length === 0,
    bad.length === 0 ? C.ELEMENTS.length + " elements, all typed " + C.STATES.join("|")
                     : "UNMARKED: " + bad.map(function (e) { return e.id; }).join(","));
})();

/* ===================================================================
   C2 — the freeze holds: fold hash matches the pin. Silent drift breaks
   here; lawful amendment re-pins visibly.
   =================================================================== */
(function () {
  var h = C.foldHash();
  log("C2_fold_hash_matches_pin", h === PINNED_HASH,
    "foldHash=" + h + " pinned=" + PINNED_HASH + (h === PINNED_HASH ? " — frozen" : " — DRIFT DETECTED"));
})();

/* ===================================================================
   C3 — canonical is EARNED: every canonical element cites what enforces
   it (a running test suite or an operator-authored file). Meaning cannot
   promote itself to canon by eloquence.
   =================================================================== */
(function () {
  var canon = C.ELEMENTS.filter(function (e) { return e.state === "canonical"; });
  var unearned = canon.filter(function (e) { return !e.enforced_by; });
  log("C3_canonical_requires_enforcement_citation",
    canon.length > 0 && unearned.length === 0,
    canon.length + " canonical elements, every one cites its enforcement" +
    (unearned.length ? " — UNEARNED: " + unearned.map(function (e) { return e.id; }).join(",") : ""));
})();

/* ===================================================================
   C4 — the load-bearing identities are present and typed: HER, HAL,
   CHRONOS, AUTORESEARCH, MAYOR, DIRECTOR, GOBLINS, and the HELEN/LNOS
   boundary — none canonical (no operator seal yet), none missing.
   =================================================================== */
(function () {
  var ids = ["role/HER", "role/HAL", "role/CHRONOS", "role/AUTORESEARCH", "role/MAYOR", "role/DIRECTOR", "role/GOBLINS", "boundary/helen-os-vs-lnos"];
  var missing = ids.filter(function (id) { return !C.getElement(id); });
  var overClaimed = ids.filter(function (id) { var e = C.getElement(id); return e && e.state === "canonical"; });
  log("C4_identities_present_and_not_overclaimed",
    missing.length === 0 && overClaimed.length === 0,
    "all 8 identities typed provisional (await operator seal); none missing, none self-canonized");
})();

/* ===================================================================
   C5 — the states fold: 14 canonical (test-enforced), 13 provisional,
   4 hypothetical, 2 deprecated, 3 unresolved. Aspirations and reality
   are counted apart, exactly as the CONSOLIDATE order demands.
   =================================================================== */
(function () {
  var s = C.byState();
  log("C5_reality_and_aspiration_counted_apart",
    s.canonical === 14 && s.provisional === 13 && s.hypothetical === 4 && s.deprecated === 2 && s.unresolved === 3,
    JSON.stringify(s));
})();

/* ===================================================================
   C6 — determinism / purity (scan code, not prose).
   =================================================================== */
(function () {
  var fs = require("fs");
  var code = fs.readFileSync(path.join(__dirname, "constitution.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  var clean = !/Date\.now|Math\.random|require\(['"]fs['"]\)|require\(['"]https?|\bfetch\(|\bnet\.|\bhttp\./.test(code);
  log("C6_constitution_is_deterministic_and_pure", clean,
    clean ? "no fs/clock/random/network" : "IMPURITY FOUND");
})();

var failed = Object.keys(results).filter(function (k) { return !results[k]; });
console.log("\n=== SUMMARY ===\nPassed: " + (Object.keys(results).length - failed.length) + "/" + Object.keys(results).length);
process.exit(failed.length ? 1 : 0);
