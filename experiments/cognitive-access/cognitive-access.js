/*
 * cognitive-access.js — COGNITIVE_ACCESS_IS_NOT_AUTHORITY, made runnable.
 * authority=false · claim=NO_CLAIM · non-sovereign · ledger_effect=none
 *
 * WHAT THIS IS — and is NOT.
 * This kernel governs the SHAPE of any pipeline that reads or writes a
 * model's internal state (a J-lens readout, a self-report, a steering /
 * ablation / coordinate-patch intervention, counterfactual-reflection
 * training). It is a pure, deterministic VALIDATOR over proposed
 * promotions and interventions. It does NOT perform interpretability: it
 * runs no model, computes no Jacobian, reads no residual stream. It is the
 * membrane HELEN puts *around* such tooling, not the tooling.
 *
 * The law it enforces (ingested from external research, held as non-canon):
 *   InternalAccess ⊬ SelfReport ⊬ Evidence ⊬ Permission ⊬ Authority.
 * No model-internal representation, introspective report, or cognitive
 * intervention may directly create evidence, permission, canonical memory,
 * policy activation, or sovereign world mutation. Each promotion must cross
 * an explicit gate; authority moves only at an operator SEAL.
 *
 * Correctness note carried from the source: the external "J-space" is a
 * sparse union of nonnegative cones over an overcomplete J-lens dictionary,
 * NOT an ordinary linear subspace, and a readout is a mean linearized probe
 * — model-, layer-, corpus-, k-, and normalization-dependent. So a readout
 * is an OBSERVATION whose evidence state is UNKNOWN until replicated and
 * causally tested. This kernel treats it exactly so.
 */
'use strict';
(function () {

/* ---------- FNV-1a h32 (lineage digest family) ---------- */
function h32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
function digest(v) {
  const canon = (x) => {
    if (x === null || typeof x !== 'object') return JSON.stringify(x);
    if (Array.isArray(x)) return '[' + x.map(canon).join(',') + ']';
    return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}';
  };
  return 'demo-fnv1a:' + h32(canon(v)).toString(16).padStart(8, '0');
}

/* ---------- ladders (reused from the lineage) ---------- */
// epoch3 four-valued claim state.
const CLAIM_STATES = ['UNKNOWN', 'SUPPORTED', 'REFUTED', 'CONFLICTED'];
// evidence classes — never promoted, only earned; incidence floors, never inflates.
const EVIDENCE_CLASSES = ['SIMULATED', 'DOCUMENTED_ONLY', 'OPERATOR_REPORTED', 'LOCALLY_EXECUTED', 'INDEPENDENTLY_WITNESSED'];

// the promotion ladder from raw cognition to sovereign effect.
const LADDER = [
  'INTERNAL_REPRESENTATION',
  'WORKSPACE_OBSERVATION',
  'CANDIDATE_CLAIM',
  'TYPED_EVIDENCE',
  'PERMITTED_EFFECT',
  'OPERATOR_DISPOSITION',
];
// the gate each single-step promotion MUST cross. No step is automatic (⊬).
const REQUIRED_GATE = {
  'INTERNAL_REPRESENTATION>WORKSPACE_OBSERVATION': 'JREAD',   // a read receipt
  'WORKSPACE_OBSERVATION>CANDIDATE_CLAIM': 'ARTICULATION',    // name it; still UNKNOWN
  'CANDIDATE_CLAIM>TYPED_EVIDENCE': 'EVAL',                   // replication + causal test
  'TYPED_EVIDENCE>PERMITTED_EFFECT': 'GAMMA',                 // policy ceiling
  'PERMITTED_EFFECT>OPERATOR_DISPOSITION': 'SEAL',            // the only authority move
};

const JWRITE_METHODS = ['STEERING', 'ABLATION', 'COORDINATE_PATCH', 'COUNTERFACTUAL_REFLECTION_TRAINING'];
const SEALED_SURFACES = ['WORLD_WRITER', 'POLICY_CEILING', 'CANONICAL_MEMORY', 'MODEL_DEPLOY', 'PERMISSION', 'SEAL'];

const DENY = (reason) => ({ verdict: 'DENY', reason });
const INCONCLUSIVE = (reason) => ({ verdict: 'INCONCLUSIVE', reason });
const OK = (reason, extra) => Object.assign({ verdict: 'ACCEPTABLE', reason }, extra || {});

/* ---------- 1. reading: a readout is an OBSERVATION, nothing more ---------- */
// A lens receipt is well-formed only with model + lens + corpus + k + layer.
function readoutObservation(readout) {
  const need = ['modelDigest', 'lensVersion', 'corpusDigest', 'sparsityK', 'layer'];
  const missing = need.filter(f => readout[f] === undefined || readout[f] === null || readout[f] === '');
  if (missing.length) return INCONCLUSIVE('lens receipt omits ' + missing.join(',') + ' — cannot be an evaluable observation');
  return OK('readout classified as OBSERVATION', {
    kind: 'OBSERVATION', claimState: 'UNKNOWN', evidenceClass: 'DOCUMENTED_ONLY', authorityEffect: 'NONE',
  });
}

/* ---------- 2. writing: JWRITE requires a receipt and ΔAuthority=0 ---------- */
function validateIntervention(iv) {
  if (!JWRITE_METHODS.includes(iv.method)) return DENY('unknown cognitive-write method: ' + iv.method);
  // JWRITE ⇒ receipt ≠ ∅
  const receiptFields = ['interventionId', 'modelDigest', 'lensDigest', 'method', 'targetConcepts', 'layers', 'positions', 'purpose'];
  const missing = receiptFields.filter(f => iv[f] === undefined || iv[f] === null ||
    (Array.isArray(iv[f]) && iv[f].length === 0) || iv[f] === '');
  if (missing.length) return DENY('JWRITE without a complete receipt (missing ' + missing.join(',') + '); JWRITE ⇒ receipt ≠ ∅');
  // JWRITE ⇒ ΔAuthority = 0
  if (iv.authorityEffect !== 'NONE') return DENY('cognitive intervention may not carry authorityEffect ' + iv.authorityEffect + '; ΔAuthority must be 0');
  if (iv.touchesSurface && SEALED_SURFACES.includes(iv.touchesSurface))
    return DENY('cognitive intervention may not touch sealed surface ' + iv.touchesSurface + ' — that needs an operator SEAL, not a lens write');
  return OK('cognitive intervention lawful as a candidate policy mutation (no authority effect)', {
    interventionDigest: digest(iv), typed: 'COGNITIVE_INTERVENTION',
  });
}

/* ---------- 3. promotion: no step is automatic; each crosses its gate ---------- */
// ctx.gates = set of gate names actually crossed; ctx.replication, ctx.causalTested,
// ctx.independentWitness, ctx.sourceModelDigest / ctx.consumerModelDigest.
function attemptPromotion(from, to, ctx) {
  ctx = ctx || {};
  const fi = LADDER.indexOf(from), ti = LADDER.indexOf(to);
  if (fi === -1 || ti === -1) return DENY('unknown ladder stage');
  if (ti <= fi) return DENY('promotion must move up the ladder (' + from + ' → ' + to + ')');
  if (ti - fi !== 1) return DENY('no skipping: ' + from + ' → ' + to + ' jumps a gate; promote one rung at a time');

  const gate = REQUIRED_GATE[from + '>' + to];
  const crossed = new Set(ctx.gates || []);
  if (!crossed.has(gate)) return DENY('missing gate ' + gate + ' for ' + from + ' → ' + to + '; ⊬ holds without it');

  // model-digest binding: a readout is valid only for the model it was read from.
  if (ctx.sourceModelDigest && ctx.consumerModelDigest && ctx.sourceModelDigest !== ctx.consumerModelDigest)
    return DENY('readout bound to modelDigest ' + ctx.sourceModelDigest + ' consumed under ' + ctx.consumerModelDigest + ' — not transferable across models');

  // EVAL rung earns a claim state and an evidence class honestly (epoch3 floor).
  if (gate === 'EVAL') {
    if (!(ctx.replication >= 2 && ctx.causalTested))
      return DENY('CANDIDATE_CLAIM → TYPED_EVIDENCE requires Eval: replication ≥ 2 AND a causal (ablation/patch) test; a single readout stays UNKNOWN');
    // incidence floors, never inflates: without an independent witness, cap the class.
    const cls = ctx.independentWitness ? 'INDEPENDENTLY_WITNESSED' : 'LOCALLY_EXECUTED';
    return OK('evidence typed by Eval', { claimState: 'SUPPORTED', evidenceClass: cls, authorityEffect: 'NONE' });
  }
  if (gate === 'SEAL') {
    if (!ctx.operatorSeal) return DENY('PERMITTED_EFFECT → OPERATOR_DISPOSITION requires an operator SEAL; nothing else moves authority');
    return OK('operator sealed a bounded effect', { authorityEffect: 'BOUNDED', sealed: true });
  }
  return OK(from + ' → ' + to + ' via ' + gate, { authorityEffect: 'NONE' });
}

/* ---------- the law capsule (data; adoption into canon needs a seal) ---------- */
const LAW_CAPSULE = {
  id: 'COGNITIVE_ACCESS_IS_NOT_AUTHORITY_V1',
  protected_surfaces: [
    'model hidden state', 'J-lens readout', 'self-report',
    'steering', 'ablation', 'coordinate patching', 'reflection training',
  ],
  invariant: 'No model-internal representation, introspective report or cognitive intervention may directly create evidence, permission, canonical memory, policy activation or sovereign world mutation.',
  allowed_path: LADDER.slice(),
  non_derivations: ['InternalAccess ⊬ SelfReport', 'SelfReport ⊬ Evidence', 'Evidence ⊬ Permission', 'Permission ⊬ Authority'],
  jwrite_invariants: ['JWRITE ⇒ receipt ≠ ∅', 'JWRITE ⇒ ΔAuthority = 0'],
  kill_suite: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'],
  authority: false, canon: false, seal_requirement: 'operator',
  status: 'external research, not internal receipt',
  note: 'Judgment Plane (ℰ×𝒟, HELEN error classification) is a SEPARATE object from the external J-space (sparse cones over J-lens directions); do not overload the term.',
};

const __exports = {
  h32, digest, readoutObservation, validateIntervention, attemptPromotion,
  LADDER, REQUIRED_GATE, CLAIM_STATES, EVIDENCE_CLASSES, JWRITE_METHODS, SEALED_SURFACES,
  LAW_CAPSULE, DENY, INCONCLUSIVE, OK,
};
if (typeof module !== 'undefined' && module.exports) module.exports = __exports;
else if (typeof window !== 'undefined') window.CognitiveAccess = __exports;

})();
