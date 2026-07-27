/* =====================================================================
   HELEN_MASTER_REGISTRY_V0.1 — the actual entries (2026-07-27 fold,
   upgraded to the Director's record schema).
   authority=false · claim=NO_CLAIM · non-sovereign

   Reality and aspiration, counted apart:
     operational — exists and can be executed now (receipt required)
     tested      — implementation passed defined tests (receipt required)
     specified   — contract exists, implementation incomplete
     imagined    — valuable concept without implementation
     unknown     — mentioned but insufficiently understood
   evidence_class proven requires a local receipt; reported is testimony;
   hypothesized is a candidate direction. No entry here carries authority
   (authority_level=none everywhere; not grantable by this seat). The
   ONE canonical entry cites its operator-authored seal. No private
   individual is named in this file.
   ===================================================================== */

"use strict";

var RECAP = "operator_recap_2026-07-27";
var OWNER = "JM Tassy";

function cell(name, note) {
  return { id: "helen/" + name, name: name, class: "artifact", domain: "helen-os",
    maturity: "tested", status: "provisional", evidence_class: "proven", owner: OWNER,
    receipt: { path: "helen/" + name + ".js", replay: "node helen/" + name + ".test.js" }, purpose: note };
}

var ENTRIES = [

  /* ---- ARTIFACTS · proven in this repo (receipts replayable now) ---- */
  cell("witnessed-loop-graph-seam", "anchor-cut law; 11/11"),
  cell("witnessed-loop-graph-schema", "fold(event_log) + epistemic lineage; 9/9"),
  cell("witnessed-loop-graph-planner", "distinction planner; 7/7"),
  cell("witnessed-data-metabolism", "DataBead + membranes + toxins; 11/11"),
  cell("governed-transformation-kernel", "four-key lock; NO_LOCAL_SELF_PROMOTION; 8/8 — SEAL = operator"),
  cell("principle-graph", "LNOS spine; explanatory power ≠ volume; 7/7"),
  cell("evolution-kernel", "genomes · transfer log · survival ≠ usage · maturity · experiments; 8/8"),
  cell("constitution", "HELEN_CONSTITUTION_V0.1 — the freeze, hash-pinned; 6/6"),
  { id: "helen/master-registry", name: "master-registry", class: "artifact", domain: "helen-os",
    maturity: "tested", status: "provisional", evidence_class: "proven", owner: OWNER,
    receipt: { path: "helen/master-registry.js", replay: "node helen/master-registry.test.js" },
    purpose: "this registry (V0.1) — the columns are admission gates" },

  { id: "game/index-v0", name: "Goblin Warren V0", class: "artifact", domain: "game",
    maturity: "operational", status: "canonical", evidence_class: "proven", owner: OWNER,
    sealed_by: "CLAUDE.md (operator-authored: frozen V0 canon, byte-identical to vault, never edited)",
    receipt: { path: "index.html", replay: "node selftest.js index.html" },
    purpose: "playable HELEN governance; 29 assertions; the one canonical artifact" },
  { id: "game/v2-ai-council", name: "AI Council edition", class: "artifact", domain: "game",
    maturity: "operational", status: "provisional", evidence_class: "proven", owner: OWNER,
    receipt: { path: "v2.html", replay: "node v2-selftest.js v2.html" },
    purpose: "live-model seam; sovereign ledger; 61 assertions" },
  { id: "game/v3-garden", name: "HELEN Garden slice", class: "artifact", domain: "game",
    maturity: "operational", status: "provisional", evidence_class: "proven", owner: OWNER,
    receipt: { path: "v3.html", replay: "node v3-selftest.js v3.html" },
    purpose: "Garden change ⊬ Kernel truth; AI goblin NPC; 83 assertions" },

  /* ---- ARTIFACTS · reported by other lanes (checked ABSENT here) ---- */
  { id: "lane/sourcebound-object-os-v0", name: "SOURCEBOUND_OBJECT_OS_V0", class: "artifact", domain: "helen-os",
    maturity: "unknown", status: "provisional", evidence_class: "reported", owner: OWNER,
    evidence_sources: [RECAP], purpose: "reported 16/16; DIRTY→ADMISSIBLE pipeline; not present in this repo" },
  { id: "lane/goblin-mvp-factory-v0.1", name: "GOBLIN_MVP_FACTORY_V0.1", class: "artifact", domain: "helen-os",
    maturity: "unknown", status: "provisional", evidence_class: "reported", owner: OWNER,
    evidence_sources: [RECAP], purpose: "reported 37/37; mayor_review_packet_candidate; not present in this repo" },
  { id: "lane/purple-e115", name: "PURPLE E115", class: "artifact", domain: "research",
    maturity: "unknown", status: "deprecated", evidence_class: "reported", owner: OWNER,
    evidence_sources: [RECAP], purpose: "breakthrough-label saturation at epoch 115; dedup ordered before reuse" },
  { id: "lane/helen-runtime-local-v1", name: "HELEN local runtime v1", class: "artifact", domain: "helen-os",
    maturity: "unknown", status: "provisional", evidence_class: "reported", owner: OWNER,
    evidence_sources: [RECAP], purpose: "reported on branch docs/helen-chat-modes; branch absent from this repo's remote (git ls-remote checked)" },

  /* ---- ROLES (contracts described in the recap → specified) ---- */
  { id: "role/HER", name: "HER", class: "role", domain: "helen-os", maturity: "specified", status: "provisional",
    evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP], purpose: "continuity & possibility; never decides truth" },
  { id: "role/HAL", name: "HAL", class: "role", domain: "helen-os", maturity: "specified", status: "provisional",
    evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP, "index.html checkProposalWithHAL (playable embodiment)"],
    purpose: "institutional scepticism; falsification & admissibility" },
  { id: "role/CHRONOS", name: "CHRONOS", class: "role", domain: "helen-os", maturity: "specified", status: "provisional",
    evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP, "helen/governed-transformation-kernel.js (source-class check)"],
    purpose: "time, provenance, versions, replay" },
  { id: "role/AUTORESEARCH", name: "AUTORESEARCH", class: "role", domain: "helen-os", maturity: "specified", status: "provisional",
    evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP],
    purpose: "bounded optimization of non-sovereign layers only", may_write_to: ["ranking", "prompt_patterns", "skill_routing", "compression"] },
  { id: "role/MAYOR", name: "MAYOR", class: "role", domain: "helen-os", maturity: "specified", status: "provisional",
    evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP], purpose: "final gate before human authority" },
  { id: "role/DIRECTOR", name: "DIRECTOR", class: "role", domain: "helen-os", maturity: "specified", status: "provisional",
    evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP], purpose: "orchestrates a protocol, never an authority" },
  { id: "role/GOBLINS", name: "GOBLINS", class: "role", domain: "helen-os", maturity: "specified", status: "provisional",
    evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP, "game lane (embodied divergence)"],
    purpose: "governed divergence; sandbox freedom, zero silent promotion" },

  /* ---- FRAMES (named steps, no contracts yet → imagined) ---- */
  { id: "frame/INTAKE", name: "INTAKE", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/ORIENT", name: "ORIENT", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/EXTRACT", name: "EXTRACT", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/DIVERGE", name: "DIVERGE", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/VERIFY", name: "VERIFY", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/SYNTHESIZE", name: "SYNTHESIZE", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/DECIDE", name: "DECIDE", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/EXECUTE", name: "EXECUTE", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/RECEIPT", name: "RECEIPT", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },
  { id: "frame/LEARN", name: "LEARN", class: "frame", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP] },

  /* ---- SKILL FAMILIES (named absences; members only by extraction) ---- */
  { id: "family/source-skills", name: "source skills", class: "skill_family", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP],
    purpose: "ingestion · extraction · source binding · provenance · confidentiality" },
  { id: "family/knowledge-skills", name: "knowledge skills", class: "skill_family", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP],
    purpose: "entities · identity resolution · chronology · claims · evidence · linking" },
  { id: "family/reasoning-skills", name: "reasoning skills", class: "skill_family", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP],
    purpose: "synthesis · falsification · causal reconstruction · invariants · mechanisms" },
  { id: "family/creation-skills", name: "creation skills", class: "skill_family", domain: "creation", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP],
    purpose: "direction artistique · image · video · narration · campaign · brand" },
  { id: "family/institutional-skills", name: "institutional skills", class: "skill_family", domain: "helen-os", maturity: "specified", status: "provisional", evidence_class: "reported", owner: OWNER,
    evidence_sources: [RECAP, "helen cells (routing/receipts/reducer/replay/admission partially witnessed)"],
    purpose: "routing · receipts · reducer · replay · audit · admission · rollback" },
  { id: "family/director-skills", name: "director skills", class: "skill_family", domain: "helen-os", maturity: "imagined", status: "provisional", evidence_class: "reported", owner: OWNER, evidence_sources: [RECAP],
    purpose: "agent selection · frame orchestration · synthesis · final packet" },
  { id: "family/uzik-skills", name: "UZIK skills", class: "skill_family", domain: "uzik", maturity: "imagined", status: "provisional", evidence_class: "hypothesized", owner: OWNER,
    purpose: "members must be EXTRACTED from the real UZIK corpus — operator GO + protected zone + PII clearance; zero members by design" },
  { id: "family/manucurist-skills", name: "Manucurist skills", class: "skill_family", domain: "manucurist", maturity: "imagined", status: "provisional", evidence_class: "hypothesized", owner: OWNER,
    purpose: "members must be EXTRACTED from the real Manucurist corpus — operator GO + PII clearance; zero members by design" },

  /* ---- THE PILOT (specified here; execution HELD by law) ---- */
  { id: "protocol/pilot-partner-uzik-operating-model", name: "end-to-end pilot: one partner × UZIK operating model",
    class: "protocol", domain: "uzik", maturity: "specified", status: "provisional", evidence_class: "hypothesized", owner: OWNER,
    purpose: "one bounded case proving the full loop: source inventory → identity resolution → timeline → atomic claims → evidence attachment → repeated patterns → candidate invariants → HAL falsification → capability extraction → skill specifications → human review → receipts → registry update. Outputs: sourced person model · relationship/project graph · tested invariants · reusable methods · candidate skills · contradiction records · a REUSABLE extraction protocol (the template for every later corpus)",
    dependencies: ["family/uzik-skills", "helen/witnessed-data-metabolism", "helen/principle-graph", "helen/evolution-kernel"],
    execution_held: "requires the primary corpus + operator GO + PII clearance + an out-of-repo destination; the pilot subject is a real private individual, designated in the operator channel and deliberately NOT named in this public repo" }
];

module.exports = { ENTRIES: ENTRIES, RECAP: RECAP };
