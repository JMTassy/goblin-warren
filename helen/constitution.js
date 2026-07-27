/* =====================================================================
   HELEN_CONSTITUTION_V0.1  (the freeze, made measurable)
   authority=false · claim=NO_CLAIM · non-sovereign · HELEN OS lane

   The Director's CONSOLIDATE order: capture the current architecture and
   mark every element canonical | provisional | hypothetical | deprecated
   | unresolved, so no future conversation silently changes the meaning
   of HER, HAL, CHRONOS, DIRECTOR, MAYOR, Goblins, HELEN OS or LNOS.

   The freeze is not prose: `foldHash()` folds every element (id, state,
   meaning) into one deterministic FNV hash, and the test pins that hash.
   Any silent redefinition breaks the suite. Amendment is lawful — edit,
   re-pin, commit — which makes every change VISIBLE in git, the
   append-only ledger. Silent drift is what becomes impossible.

   Honesty note on "canonical": this seat cannot manufacture sovereignty.
   Elements marked canonical here are those already enforced by running
   tests or operator-authored files in this repo. The constitution
   DOCUMENT itself remains provisional until the operator seals it.

   DETERMINISM: no Date.now(), no Math.random(), no fs, no network.
   ===================================================================== */

"use strict";

var STATES = ["canonical", "provisional", "hypothetical", "deprecated", "unresolved"];

var ELEMENTS = [
  /* ---- laws already enforced by running tests in this repo → canonical ---- */
  { id: "law/authority-defaults-false", state: "canonical",
    meaning: "every object enters with authority=false; no agent self-declares authority", enforced_by: "all helen cells + game selftests" },
  { id: "law/no-receipt-no-ship", state: "canonical",
    meaning: "closure vocabulary is embargoed without a replayable receipt", enforced_by: "helen/master-registry.test.js MR1" },
  { id: "law/anchor-cut", state: "canonical",
    meaning: "no self-confirming component promotes a claim without an independent anchor", enforced_by: "helen/witnessed-loop-graph-seam.test.js" },
  { id: "law/state-is-fold-of-ledger", state: "canonical",
    meaning: "state = fold(reducer, boot, ledger); append-only; replay is authority, snapshots are caches", enforced_by: "helen/witnessed-loop-graph-schema.test.js + game reducers" },
  { id: "law/no-local-self-promotion", state: "canonical",
    meaning: "no single actor at any multiplicity drives ADMIT; the property exists only in composition", enforced_by: "helen/governed-transformation-kernel.test.js K2" },
  { id: "law/conjunctive-admission", state: "canonical",
    meaning: "Admit = Claim AND Evidence AND Receipt AND CHRONOS; no averaging, no vibes, no beauty compensates a failed gate", enforced_by: "helen/witnessed-data-metabolism.test.js + kernel" },
  { id: "law/transformation-never-raises-authority", state: "canonical",
    meaning: "a summary may get clearer, never truer; authority moves only through admission", enforced_by: "helen/witnessed-data-metabolism.test.js" },
  { id: "law/reported-never-inflates-witnessed", state: "canonical",
    meaning: "testimony registers and is preserved; it adds zero to the witnessed fold", enforced_by: "helen/master-registry.test.js MR5" },
  { id: "law/skills-extracted-never-invented", state: "canonical",
    meaning: "a skill without real sources is refused at any claim type; named absences are honest", enforced_by: "helen/master-registry.test.js MR2" },
  { id: "law/survival-is-not-usage", state: "canonical",
    meaning: "conservation counts distinct independent contexts survived, never mentions", enforced_by: "helen/evolution-kernel.test.js EK5" },
  { id: "law/explanatory-power-is-not-volume", state: "canonical",
    meaning: "success counts surviving falsifiable invariants, never node count", enforced_by: "helen/principle-graph.test.js PG5" },
  { id: "law/operator-authority", state: "canonical",
    meaning: "irreversible / public / paid / kernel-affecting actions require explicit human authority; autonomy = propose freely, never execute side effects freely", enforced_by: "CLAUDE.md §7 (operator-authored)" },
  { id: "law/kernel-sovereignty", state: "canonical",
    meaning: "the kernel owns identity, truth, ledger, replay; nothing adaptive, pretty, prompt-based or shell-facing may overwrite it", enforced_by: "v3-selftest.js (Garden change ⊬ Kernel truth) + kernel cell" },
  { id: "law/two-realities-selective-bridge", state: "canonical",
    meaning: "Trust Reality = Replay(L) sovereign; Runtime Reality = Probe(now) non-sovereign; the only bridge is observation → receipt candidate → admission", enforced_by: "v2 seam pattern (resolved text enters reducer as event data) + seam cell" },

  /* ---- described contracts, partially embodied → provisional ---- */
  { id: "role/HER", state: "provisional", meaning: "continuity & possibility; reconstructs meaning; never decides truth" },
  { id: "role/HAL", state: "provisional", meaning: "institutional scepticism; falsification, admissibility, risk markers; playable embodiment witnessed in index.html" },
  { id: "role/CHRONOS", state: "provisional", meaning: "time, provenance, versions, replay; source-class forgery is a schema check, witnessed in the kernel cell" },
  { id: "role/AUTORESEARCH", state: "provisional", meaning: "bounded read→propose→execute→measure→keep/discard loop; optimizes non-sovereign layers only; never rewrites kernel truth, identity, ledger, replay or sovereign memory rules" },
  { id: "role/MAYOR", state: "provisional", meaning: "final gate; verifies objections handled; applies the reducer; presents to human authority" },
  { id: "role/DIRECTOR", state: "provisional", meaning: "orchestrates a protocol — role selection, frame sequencing, arbitration; never an authority" },
  { id: "role/GOBLINS", state: "provisional", meaning: "governed divergence; sandbox freedom, zero silent promotion; embodied across the game lane" },
  { id: "boundary/helen-os-vs-lnos", state: "provisional",
    meaning: "HELEN OS = the constitutional core (identity, memory, governance, ledger, roles, admission); LNOS = the operational network around it (agents, skills, Directors, frames, corpora, engines). Convention awaits operator seal" },
  { id: "law/shell-render-only", state: "provisional",
    meaning: "shell presents, explains, gathers input; it never authors truth — enforced in the game lane (UI never mutates S), not yet enforced for any HELEN shell" },
  { id: "law/candidate-artifact-default", state: "provisional",
    meaning: "model outputs, summaries, diagrams, findings begin as candidates; strengthened only via normalization, witness, review, receipt, admission" },
  { id: "protocol/pipeline-dirty-to-admissible", state: "provisional",
    meaning: "DIRTY → SOURCE_BOUND → CLAIM_SPLIT → EVIDENCE_ATTACHED → VALIDATED → RECEIPTED → ADMISSIBLE; still authority=false at the end", enforced_by: "reported 16/16 in another lane; not witnessed in this repo" },
  { id: "model/persistence-classes", state: "provisional",
    meaning: "EPHEMERAL · REBUILDABLE · LOCAL_SOVEREIGN · FEDERATED_SOVEREIGN · PUBLIC_SOVEREIGN · SEALED; meaning determines persistence" },
  { id: "model/evidence-classes", state: "provisional",
    meaning: "proven (local witness) · reported (described, not witnessed now) · hypothesized (candidate direction); load-bearing — ceremony must not impersonate progress" },

  /* ---- named, valuable, no contract or implementation yet → hypothetical ---- */
  { id: "surface/presence-cockpit", state: "hypothetical",
    meaning: "five surfaces (operator state deck, compass, action grammar, sovereign ledger, presence); mood → mode → object → action → receipt" },
  { id: "layer/wulmoji", state: "hypothetical",
    meaning: "teaching/render layer; clarifies role, boundary, flow; carries NO_CLAIM unless separately backed by witness, receipt, test or admitted state" },
  { id: "protocol/context-pipeline", state: "hypothetical",
    meaning: "user → context router → scope isolation → sandboxed skill → compressor → dedup → context packet → /init → evaluator → shell" },
  { id: "myth/layer", state: "hypothetical",
    meaning: "myth proposes meaning; evidence establishes claims; governance authorizes action — mythology preserved, moved to its layer, never suppressed" },

  /* ---- superseded by evidence → deprecated ---- */
  { id: "label/purple-breakthrough", state: "deprecated",
    meaning: "the PURPLE 'breakthrough' label saturated at E115 (89 hits = label inflation); dedup to 5–8 mechanisms ordered before any reuse" },
  { id: "practice/invent-before-register", state: "deprecated",
    meaning: "naming capabilities before proving them; multiplying agents instead of improving protocols — the CONSOLIDATE order's target" },

  /* ---- open questions the seat cannot close → unresolved ---- */
  { id: "open/plural-witness-one-hand", state: "unresolved",
    meaning: "many witnesses may inform; one hand admits — how plural witnessing scales without becoming a vote is undecided" },
  { id: "open/who-pays-who-hosts", state: "unresolved",
    meaning: "runtime, storage and model-call economics for any deployed HELEN are undecided" },
  { id: "open/uzik-corpus-protected-zone", state: "unresolved",
    meaning: "the protected ingestion zone, PII clearance and out-of-repo destination for real corpora await operator designation" }
];

/* deterministic FNV-1a over the sorted fold of (id · state · meaning) */
function h32(str) {
  var h = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  return ("0000000" + h.toString(16)).slice(-8);
}
function foldHash() {
  var lines = ELEMENTS.map(function (e) { return e.id + "" + e.state + "" + e.meaning; }).sort();
  return h32(lines.join(""));
}
function getElement(id) {
  for (var i = 0; i < ELEMENTS.length; i++) if (ELEMENTS[i].id === id) return ELEMENTS[i];
  return null;
}
function byState() {
  var out = {};
  STATES.forEach(function (s) { out[s] = 0; });
  ELEMENTS.forEach(function (e) { out[e.state] += 1; });
  return out;
}

module.exports = { STATES: STATES, ELEMENTS: ELEMENTS, foldHash: foldHash, getElement: getElement, byState: byState, h32: h32 };
