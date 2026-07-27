/* =====================================================================
   MASTER_REGISTRY_V0 — the actual entries (2026-07-27 fold).
   authority=false · claim=NO_CLAIM · non-sovereign

   Every WITNESSED entry's receipt is a path IN THIS REPO plus the exact
   replay command. Everything another lane reported is typed REPORTED and
   marked absent_from_this_repo (checked, not assumed). The UZIK and
   Manucurist skill families register EMPTY on purpose: their members must
   be extracted from real sources under operator GO + PII clearance —
   never invented here. No private individual is named in this file.
   ===================================================================== */

"use strict";

var RECAP = "operator_recap_2026-07-27";

var ENTRIES = [

  /* ---- ARTIFACTS · WITNESSED (receipts replayable in this repo) ---- */
  { id: "helen/witnessed-loop-graph-seam", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/witnessed-loop-graph-seam.js", replay: "node helen/witnessed-loop-graph-seam.test.js" },
    note: "anchor-cut law; 11/11" },
  { id: "helen/witnessed-loop-graph-schema", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/witnessed-loop-graph-schema.js", replay: "node helen/witnessed-loop-graph-schema.test.js" },
    note: "fold(event_log) + epistemic lineage; 9/9" },
  { id: "helen/witnessed-loop-graph-planner", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/witnessed-loop-graph-planner.js", replay: "node helen/witnessed-loop-graph-planner.test.js" },
    note: "distinction planner; 7/7" },
  { id: "helen/witnessed-data-metabolism", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/witnessed-data-metabolism.js", replay: "node helen/witnessed-data-metabolism.test.js" },
    note: "DataBead + membranes + toxins; 11/11" },
  { id: "helen/governed-transformation-kernel", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/governed-transformation-kernel.js", replay: "node helen/governed-transformation-kernel.test.js" },
    note: "four-key lock; NO_LOCAL_SELF_PROMOTION; 8/8 — SEAL = operator" },
  { id: "helen/principle-graph", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/principle-graph.js", replay: "node helen/principle-graph.test.js" },
    note: "LNOS spine; explanatory power ≠ volume; 7/7" },
  { id: "helen/evolution-kernel", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "helen/evolution-kernel.js", replay: "node helen/evolution-kernel.test.js" },
    note: "genomes · transfer log · survival ≠ usage · maturity · experiments; 8/8" },
  { id: "game/index-v0", kind: "artifact", claim_type: "WITNESSED", status: "frozen",
    receipt: { path: "index.html", replay: "node selftest.js index.html" },
    note: "V0 canon, byte-identical to vault; 29 assertions; never edited" },
  { id: "game/v2-ai-council", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "v2.html", replay: "node v2-selftest.js v2.html" },
    note: "live-model seam, sovereign ledger; 61 assertions" },
  { id: "game/v3-garden", kind: "artifact", claim_type: "WITNESSED", status: "verified",
    receipt: { path: "v3.html", replay: "node v3-selftest.js v3.html" },
    note: "Garden slice + AI goblin NPC; Garden change ⊬ Kernel truth; 83 assertions" },

  /* ---- ARTIFACTS · REPORTED (other lanes; checked ABSENT here) ---- */
  { id: "lane/sourcebound-object-os-v0", kind: "artifact", claim_type: "REPORTED", status: "absent_from_this_repo",
    reported_by: RECAP, reported_state: "16/16 green; DIRTY→ADMISSIBLE pipeline; authority=false",
    local_inspection: "no matching file or branch in this repo" },
  { id: "lane/goblin-mvp-factory-v0.1", kind: "artifact", claim_type: "REPORTED", status: "absent_from_this_repo",
    reported_by: RECAP, reported_state: "37/37 green; mayor_review_packet_candidate.json; admitted=false",
    local_inspection: "no matching file or branch in this repo" },
  { id: "lane/purple-e115", kind: "artifact", claim_type: "REPORTED", status: "absent_from_this_repo",
    reported_by: RECAP, reported_state: "saturation at epoch 115/500; 89 'breakthroughs' → label inflation; dedup ordered",
    local_inspection: "no matching file or branch in this repo" },
  { id: "lane/helen-runtime-local-v1", kind: "artifact", claim_type: "REPORTED", status: "absent_from_this_repo",
    reported_by: RECAP, reported_state: "engaged on branch docs/helen-chat-modes",
    local_inspection: "branch not present on this repo's remote (git ls-remote checked)" },

  /* ---- ROLES (constitutional spec — CANDIDATE until embodied w/ receipts;
          HAL alone has a playable witnessed embodiment in this repo) ---- */
  { id: "role/HER", kind: "role", claim_type: "CANDIDATE", status: "hypothesized", note: "continuity & possibility; never decides truth" },
  { id: "role/HAL", kind: "role", claim_type: "CANDIDATE", status: "observed",
    note: "falsification & governance; playable embodiment witnessed: checkProposalWithHAL in index.html (receipt = game/index-v0)" },
  { id: "role/CHRONOS", kind: "role", claim_type: "CANDIDATE", status: "observed",
    note: "time/provenance/replay; source-class forgery check witnessed in helen/governed-transformation-kernel" },
  { id: "role/AUTORESEARCH", kind: "role", claim_type: "CANDIDATE", status: "hypothesized", note: "bounded improvement; never redefines goals or truth criteria" },
  { id: "role/MAYOR", kind: "role", claim_type: "CANDIDATE", status: "hypothesized", note: "final gate before human authority; applies the reducer" },
  { id: "role/DIRECTOR", kind: "role", claim_type: "CANDIDATE", status: "hypothesized", note: "orchestration of a protocol, not an authority" },
  { id: "role/GOBLINS", kind: "role", claim_type: "CANDIDATE", status: "observed",
    note: "governed divergence; sandbox freedom, zero silent promotion; embodied across the game lane" },

  /* ---- FRAMES (each must eventually own formalized skills) ---- */
  { id: "frame/INTAKE", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/ORIENT", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/EXTRACT", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/DIVERGE", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/VERIFY", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/SYNTHESIZE", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/DECIDE", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/EXECUTE", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/RECEIPT", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },
  { id: "frame/LEARN", kind: "frame", claim_type: "CANDIDATE", status: "hypothesized" },

  /* ---- SKILL FAMILIES (named absences are honest; members are not
          invented — extraction from real sources is the only door) ---- */
  { id: "family/source-skills", kind: "skill_family", claim_type: "CANDIDATE", status: "hypothesized",
    note: "ingestion · extraction · source binding · provenance · confidentiality classes" },
  { id: "family/knowledge-skills", kind: "skill_family", claim_type: "CANDIDATE", status: "hypothesized",
    note: "entities · identity resolution · chronology · claim split · evidence · graph linking" },
  { id: "family/reasoning-skills", kind: "skill_family", claim_type: "CANDIDATE", status: "hypothesized",
    note: "synthesis · falsification · causal reconstruction · invariants · mechanisms" },
  { id: "family/creation-skills", kind: "skill_family", claim_type: "CANDIDATE", status: "hypothesized",
    note: "direction artistique · image · video · narration · campaign · brand" },
  { id: "family/institutional-skills", kind: "skill_family", claim_type: "CANDIDATE", status: "observed",
    note: "routing · receipts · reducer · replay · admission — partially witnessed across the helen cells" },
  { id: "family/director-skills", kind: "skill_family", claim_type: "CANDIDATE", status: "hypothesized",
    note: "agent selection · frame orchestration · multi-agent synthesis · final packet" },
  { id: "family/uzik-skills", kind: "skill_family", claim_type: "NEEDS_ME", status: "awaiting_corpus",
    note: "members must be EXTRACTED from the real UZIK corpus (Drive ingestion) — operator GO + protected zone + PII clearance required; zero members registered by design" },
  { id: "family/manucurist-skills", kind: "skill_family", claim_type: "NEEDS_ME", status: "awaiting_corpus",
    note: "members must be EXTRACTED from the real Manucurist corpus — operator GO + PII clearance required; zero members registered by design" }
];

module.exports = { ENTRIES: ENTRIES, RECAP: RECAP };
