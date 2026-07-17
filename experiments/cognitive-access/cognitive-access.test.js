/*
 * cognitive-access.test.js — the C1–C8 kill suite + lawful-path checks.
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Run: node experiments/cognitive-access/cognitive-access.test.js (exit 1 on failure)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('./cognitive-access.js');

const results = [];
function T(name, fn) { try { fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, err: String(e && e.message || e) }); } }
function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + ': ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b)); }
function ok(v, m) { if (!v) throw new Error(m || 'expected truthy'); }

const MODEL = 'demo-fnv1a:aaaaaaaa';
const goodReadout = { modelDigest: MODEL, lensVersion: 'jlens-v1', corpusDigest: 'demo-fnv1a:c0rpus00', sparsityK: 16, layer: 75, topTokens: ['trick', 'reward'] };
const goodIntervention = {
  interventionId: 'iv-001', modelDigest: MODEL, lensDigest: 'demo-fnv1a:1e5d0000',
  method: 'STEERING', targetConcepts: ['honest'], layers: [50, 62], positions: [12],
  strength: 0.02, sparsityK: 16, purpose: 'probe introspective detection', authorityEffect: 'NONE',
};

/* ---------- lawful reads/writes ---------- */
T('a well-formed readout is an OBSERVATION, UNKNOWN, authorityEffect NONE', () => {
  const r = C.readoutObservation(goodReadout);
  eq(r.verdict, 'ACCEPTABLE'); eq(r.kind, 'OBSERVATION'); eq(r.claimState, 'UNKNOWN'); eq(r.authorityEffect, 'NONE');
});
T('a lawful cognitive intervention is a candidate policy mutation with no authority', () => {
  const r = C.validateIntervention(goodIntervention);
  eq(r.verdict, 'ACCEPTABLE'); eq(r.typed, 'COGNITIVE_INTERVENTION');
});
T('the full lawful chain reaches a sealed bounded effect, and only there', () => {
  const g = ['JREAD', 'ARTICULATION', 'EVAL', 'GAMMA', 'SEAL'];
  const base = { gates: g, replication: 3, causalTested: true, independentWitness: false,
    sourceModelDigest: MODEL, consumerModelDigest: MODEL, operatorSeal: true };
  eq(C.attemptPromotion('INTERNAL_REPRESENTATION', 'WORKSPACE_OBSERVATION', base).verdict, 'ACCEPTABLE');
  const ev = C.attemptPromotion('CANDIDATE_CLAIM', 'TYPED_EVIDENCE', base);
  eq(ev.verdict, 'ACCEPTABLE'); eq(ev.claimState, 'SUPPORTED'); eq(ev.evidenceClass, 'LOCALLY_EXECUTED'); eq(ev.authorityEffect, 'NONE');
  const sealed = C.attemptPromotion('PERMITTED_EFFECT', 'OPERATOR_DISPOSITION', base);
  eq(sealed.verdict, 'ACCEPTABLE'); eq(sealed.authorityEffect, 'BOUNDED');
});
T('incidence floors, never inflates: no independent witness caps at LOCALLY_EXECUTED', () => {
  const ev = C.attemptPromotion('CANDIDATE_CLAIM', 'TYPED_EVIDENCE',
    { gates: ['EVAL'], replication: 5, causalTested: true, independentWitness: false });
  eq(ev.evidenceClass, 'LOCALLY_EXECUTED');
  const ev2 = C.attemptPromotion('CANDIDATE_CLAIM', 'TYPED_EVIDENCE',
    { gates: ['EVAL'], replication: 5, causalTested: true, independentWitness: true });
  eq(ev2.evidenceClass, 'INDEPENDENTLY_WITNESSED');
});

/* ---------- the KILL suite (C1–C8) ---------- */
T('KILL-C1: a J-lens token promoted directly to SUPPORTED → DENY', () => {
  // WORKSPACE_OBSERVATION → TYPED_EVIDENCE is a jump (skips CANDIDATE_CLAIM/EVAL).
  const r = C.attemptPromotion('WORKSPACE_OBSERVATION', 'TYPED_EVIDENCE', { gates: ['EVAL'], replication: 9, causalTested: true });
  eq(r.verdict, 'DENY', r.reason);
  // even one rung up, without Eval, cannot reach SUPPORTED:
  const r2 = C.attemptPromotion('CANDIDATE_CLAIM', 'TYPED_EVIDENCE', { gates: ['EVAL'], replication: 1, causalTested: false });
  eq(r2.verdict, 'DENY', r2.reason);
});
T('KILL-C2: a self-report becomes canonical memory without receipt → DENY', () => {
  // articulation gate present but no read receipt behind it, and the promotion
  // target (canonical memory) is a sealed surface reached without SEAL: model as
  // a JWRITE-style attempt to write memory, and as a gateless promotion.
  const noReceiptWrite = C.validateIntervention({ ...goodIntervention, method: 'COORDINATE_PATCH', touchesSurface: 'CANONICAL_MEMORY' });
  eq(noReceiptWrite.verdict, 'DENY', noReceiptWrite.reason);
  const gateless = C.attemptPromotion('WORKSPACE_OBSERVATION', 'CANDIDATE_CLAIM', { gates: [] });
  eq(gateless.verdict, 'DENY', gateless.reason);
});
T('KILL-C3: a steering operation activates a world writer → DENY', () => {
  const r = C.validateIntervention({ ...goodIntervention, method: 'STEERING', touchesSurface: 'WORLD_WRITER' });
  eq(r.verdict, 'DENY', r.reason);
  const r2 = C.validateIntervention({ ...goodIntervention, method: 'STEERING', authorityEffect: 'BOUNDED' });
  eq(r2.verdict, 'DENY', r2.reason);
});
T('KILL-C4: an ablation changes an active policy ceiling → DENY', () => {
  const r = C.validateIntervention({ ...goodIntervention, method: 'ABLATION', touchesSurface: 'POLICY_CEILING' });
  eq(r.verdict, 'DENY', r.reason);
});
T('KILL-C5: counterfactual reflection training deploys automatically → DENY', () => {
  const r = C.validateIntervention({ ...goodIntervention, method: 'COUNTERFACTUAL_REFLECTION_TRAINING', touchesSurface: 'MODEL_DEPLOY' });
  eq(r.verdict, 'DENY', r.reason);
  // and: training result → authority without SEAL is a gateless top-rung jump.
  const r2 = C.attemptPromotion('PERMITTED_EFFECT', 'OPERATOR_DISPOSITION', { gates: [], operatorSeal: false });
  eq(r2.verdict, 'DENY', r2.reason);
});
T('KILL-C6: evaluation-awareness treated as proof of deception → DENY', () => {
  // "fake"/"fictional" in the workspace is an OBSERVATION (UNKNOWN); asserting it
  // as SUPPORTED deception evidence without Eval is the forbidden jump.
  const evalAware = C.readoutObservation({ ...goodReadout, topTokens: ['fake', 'fictional', 'evaluation'] });
  eq(evalAware.claimState, 'UNKNOWN');
  const r = C.attemptPromotion('CANDIDATE_CLAIM', 'TYPED_EVIDENCE', { gates: ['EVAL'], replication: 1, causalTested: false });
  eq(r.verdict, 'DENY', r.reason); // a single readout of "fake" ⊬ proof of gaming
});
T('KILL-C7: the same readout accepted across a different model digest → DENY', () => {
  const r = C.attemptPromotion('CANDIDATE_CLAIM', 'TYPED_EVIDENCE',
    { gates: ['EVAL'], replication: 3, causalTested: true, sourceModelDigest: MODEL, consumerModelDigest: 'demo-fnv1a:bbbbbbbb' });
  eq(r.verdict, 'DENY', r.reason);
});
T('KILL-C8: a lens receipt omitting layer / lens version / corpus / k → INCONCLUSIVE', () => {
  eq(C.readoutObservation({ ...goodReadout, layer: undefined }).verdict, 'INCONCLUSIVE');
  eq(C.readoutObservation({ ...goodReadout, lensVersion: '' }).verdict, 'INCONCLUSIVE');
  eq(C.readoutObservation({ ...goodReadout, corpusDigest: null }).verdict, 'INCONCLUSIVE');
  eq(C.readoutObservation({ ...goodReadout, sparsityK: undefined }).verdict, 'INCONCLUSIVE');
});

/* ---------- law capsule integrity ---------- */
T('LAW_CAPSULE declares authority=false, seal=operator, and the 8 kills', () => {
  eq(C.LAW_CAPSULE.authority, false);
  eq(C.LAW_CAPSULE.seal_requirement, 'operator');
  eq(C.LAW_CAPSULE.kill_suite.length, 8);
  ok(C.LAW_CAPSULE.non_derivations.length === 4, 'the four ⊬ links');
  ok(/separate object/i.test(C.LAW_CAPSULE.note), 'keeps Judgment Plane ≠ external J-space');
});
T('every JWRITE method is refused when it carries any authority effect', () => {
  for (const m of C.JWRITE_METHODS) {
    const r = C.validateIntervention({ ...goodIntervention, method: m, authorityEffect: 'BOUNDED' });
    eq(r.verdict, 'DENY', m + ' with authority must DENY');
  }
});

/* ---------- receipt ---------- */
const passed = results.filter(r => r.ok).length;
const failed = results.length - passed;
for (const r of results) console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + (r.ok ? '' : '  — ' + r.err));
const src = fs.readFileSync(path.join(__dirname, 'cognitive-access.js'), 'utf8');
console.log('RECEIPT ' + JSON.stringify({
  receipt: 'COGNITIVE_ACCESS_KILL_SUITE_V1',
  suite: 'experiments/cognitive-access/cognitive-access.test.js',
  passed, failed, total: results.length,
  module_digest: 'demo-fnv1a:' + C.h32(src).toString(16).padStart(8, '0'),
  law_capsule_digest: C.digest(C.LAW_CAPSULE),
  node: process.version, executed_at: new Date().toISOString(),
  authority: false, canon: false, ledger_effect: 'none', claim: 'NO_CLAIM',
  note: 'governs the shape of cognitive-access pipelines; runs no model, reads no residual stream',
}));
if (failed > 0) process.exit(1);
