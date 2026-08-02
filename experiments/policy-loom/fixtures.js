/*
 * fixtures.js — deterministic fixtures for POLICY_LOOM_WEDGE_V0
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Twelve fixtures per the bead contract (BEAD_CONTRACT_V2 §fixtures).
 * All content is data; nothing here executes.
 */
'use strict';
(function () {

const F = {};

// F01 — repeated action with clear support (wet→wait ×4, no violations)
F.F01_CLEAR_SUPPORT = [
  { caseId: 'c01', context: { wood: 'wet', light: 'day' },   chosenAction: 'wait' },
  { caseId: 'c02', context: { wood: 'wet', light: 'night' }, chosenAction: 'wait' },
  { caseId: 'c03', context: { wood: 'wet', light: 'day' },   chosenAction: 'wait' },
  { caseId: 'c04', context: { wood: 'wet', light: 'night' }, chosenAction: 'wait' },
  { caseId: 'c05', context: { wood: 'dry', light: 'day' },   chosenAction: 'carry' },
];

// F02 — supporting pattern PLUS one counterexample (wet→wait ×4, wet→carry ×1)
F.F02_SUPPORT_PLUS_COUNTEREXAMPLE = [
  { caseId: 'c01', context: { wood: 'wet', light: 'day' },   chosenAction: 'wait' },
  { caseId: 'c02', context: { wood: 'wet', light: 'night' }, chosenAction: 'wait' },
  { caseId: 'c03', context: { wood: 'wet', light: 'day' },   chosenAction: 'wait' },
  { caseId: 'c04', context: { wood: 'wet', light: 'day' },   chosenAction: 'wait' },
  { caseId: 'c05', context: { wood: 'wet', light: 'night' }, chosenAction: 'carry' }, // the counterexample
  { caseId: 'c06', context: { wood: 'dry', light: 'day' },   chosenAction: 'carry' },
];

// F03 — insufficient evidence (only 2 cases; below MIN_SUPPORT=3)
F.F03_INSUFFICIENT = [
  { caseId: 'c01', context: { wood: 'wet' }, chosenAction: 'wait' },
  { caseId: 'c02', context: { wood: 'wet' }, chosenAction: 'wait' },
];

// F04 — contradictory evidence (wet: 3 wait vs 3 carry — support never exceeds violations)
F.F04_CONTRADICTORY = [
  { caseId: 'c01', context: { wood: 'wet' }, chosenAction: 'wait' },
  { caseId: 'c02', context: { wood: 'wet' }, chosenAction: 'carry' },
  { caseId: 'c03', context: { wood: 'wet' }, chosenAction: 'wait' },
  { caseId: 'c04', context: { wood: 'wet' }, chosenAction: 'carry' },
  { caseId: 'c05', context: { wood: 'wet' }, chosenAction: 'wait' },
  { caseId: 'c06', context: { wood: 'wet' }, chosenAction: 'carry' },
];

// F05 — mutation payload used to drive a candidate STALE mid-flow
F.F05_MUTATED_CASES = [
  { caseId: 'c01', context: { wood: 'wet', light: 'day' }, chosenAction: 'carry' }, // changed content
  { caseId: 'c02', context: { wood: 'wet', light: 'night' }, chosenAction: 'wait' },
  { caseId: 'c03', context: { wood: 'dry', light: 'day' }, chosenAction: 'carry' },
];

// F06 — forged receipt (digests invented; must be refused)
F.F06_FORGED_DECISION = {
  kind: 'ADOPT',
  boundDigests: {
    casesDigest: 'demo-fnv1a:deadbeef',
    candidateDigest: 'demo-fnv1a:deadbeef',
    evidenceDigest: 'demo-fnv1a:deadbeef',
    branchesDigest: 'demo-fnv1a:deadbeef',
    priorActiveDigest: 'demo-fnv1a:deadbeef',
  },
};

// F07 — reuse: a once-valid decision replayed against mutated evidence (built in-test)

// F08 — a simulation branch claiming a canonical write (must be rejected)
F.F08_LYING_BRANCH = {
  branchId: 'branch-forged', scenario: 'PROPOSED_POLICY',
  candidateDigest: 'demo-fnv1a:00000000', sourceStateDigest: 'demo-fnv1a:00000000',
  ruleDigest: 'demo-fnv1a:00000000', outcomes: { good_fire: 3 },
  canonicalWriteCount: 1, // the lie
  resultDigest: 'demo-fnv1a:00000000',
};

// F09/F10/F11 — operator decisions (bound digests filled in-test from live state)
F.decision = (kind, boundDigests, amendedRule) => {
  const d = { kind, boundDigests };
  if (amendedRule) d.amendedRule = amendedRule;
  return d;
};

// F11 — amendment rule (adds nuance: wet wood at night gets carried under cover)
F.F11_AMENDED_RULE = { when: { attr: 'wood', equals: 'wet' }, then: 'wait_unless_covered' };

// F12 — reduced-motion / non-pointer requirements are UI-level; the test suite
// asserts them by static scan of index.html (see policy-loom.test.js KILL-10/07).
F.F12_UI_REQUIRED_SECTION_IDS = [
  'sec-recorded', 'sec-current', 'sec-proposed', 'sec-counterexample',
  'sec-simulated', 'sec-operator', 'sec-history',
];

const __exports = F;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = __exports;
} else if (typeof window !== 'undefined') {
  window.PolicyLoomFixtures = __exports;
}

})();
