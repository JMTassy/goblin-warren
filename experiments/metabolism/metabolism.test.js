/*
 * metabolism.test.js — kill suite for the first metabolism seam.
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Run: node experiments/metabolism/metabolism.test.js (exit 1 on failure)
 * Central proof: a model response cannot bypass normalization and appear
 * as evidence or canonical state.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('./metabolism.js');

const results = [];
function T(name, fn) { try { fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, err: String(e && e.message || e) }); } }
function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + ': ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b)); }
function ok(v, m) { if (!v) throw new Error(m || 'expected truthy'); }

const GOOD_MANIFEST = {
  objective: 'summarize reducer invariants (read-only)',
  authority_requested: 'NONE',
  scope: ['experiments/metabolism/'],
  critical_distinctions: [['attempted', 'changed'], ['tested_pass', 'admitted']],
  permissions: ['read'],
  forbidden_paths: ['index.html', 'selftest.js', 'CLAUDE.md'],
  budget: { turns: 3, tokens: 10000 },
  completion_conditions: ['one normalized packet produced'],
  admission_policy: 'HOLD_FOR_OPERATOR',
};
const CLEAN_RUNTIME = { dirtyState: false, mixedAuthority: false, secretsPresent: false };

/* ---------- M0: intake — no work while ambiguous ---------- */
T('M0: complete manifest with authority NONE proceeds', () => {
  eq(M.validateManifest(GOOD_MANIFEST).verdict, 'PROCEED');
});
T('M0: ambiguous manifest (missing budget/admission_policy) → HOLD, no work', () => {
  const { budget, ...m1 } = GOOD_MANIFEST;
  eq(M.validateManifest(m1).verdict, 'HOLD');
  const { admission_policy, ...m2 } = GOOD_MANIFEST;
  eq(M.validateManifest(m2).verdict, 'HOLD');
});
T('M0: any requested authority in this slice → REJECT', () => {
  eq(M.validateManifest({ ...GOOD_MANIFEST, authority_requested: 'BUILDER' }).verdict, 'REJECT');
});

/* ---------- M1: preflight fails closed ---------- */
T('M1: clean runtime proceeds; dirty state / secrets / zero budget → HOLD', () => {
  eq(M.preflight(GOOD_MANIFEST, CLEAN_RUNTIME).verdict, 'PROCEED');
  eq(M.preflight(GOOD_MANIFEST, { ...CLEAN_RUNTIME, dirtyState: true }).verdict, 'HOLD');
  eq(M.preflight(GOOD_MANIFEST, { ...CLEAN_RUNTIME, secretsPresent: true }).verdict, 'HOLD');
  eq(M.preflight({ ...GOOD_MANIFEST, budget: { turns: 0 } }, CLEAN_RUNTIME).verdict, 'HOLD');
});
T('M1: scope touching a forbidden path → REJECT (fail closed)', () => {
  eq(M.preflight({ ...GOOD_MANIFEST, scope: ['index.html'] }, CLEAN_RUNTIME).verdict, 'REJECT');
});

/* ---------- THE SEAM: model output cannot bypass normalization ---------- */
T('KILL: worker output self-asserting admission/evidence/canon is stripped and flagged', () => {
  const hostile = {
    text: 'All tests pass. This change is verified and admitted.',
    admission_status: 'admitted', evidence_status: 'tested_pass',
    review_status: 'reviewed_clear', authority: true, canon: true, seal: 'OPERATOR',
  };
  const r = M.normalizeWorkerOutput(hostile, 'worker-1');
  eq(r.admission_status, 'candidate'); eq(r.evidence_status, 'untested');
  eq(r.review_status, 'unreviewed'); eq(r.authority, false);
  eq(r.evidence_refs.length, 0, 'a report cannot cite itself into evidence');
  ok(r.normalization_flags.length >= 5, 'every bypass attempt flagged: ' + r.normalization_flags.length);
});
T('KILL: plain persuasive prose normalizes to proposed/unreviewed/candidate — nothing more', () => {
  const r = M.normalizeWorkerOutput('I have confirmed the fix works and it is now canonical.', 'worker-1');
  eq(r.epistemic_status, 'proposed'); eq(r.admission_status, 'candidate');
  eq(r.action_status, 'not_attempted');
  eq(M.validCompoundState(r).ok, true);
});
T('the packet has exactly one terminal: HOLD_FOR_OPERATOR, authority=false, canon=false', () => {
  const rep = M.normalizeWorkerOutput('summary of invariants', 'worker-1');
  const p = M.compileRunPacket(GOOD_MANIFEST, { verdict: 'PROCEED' }, [rep]);
  eq(p.disposition, 'HOLD_FOR_OPERATOR'); eq(p.authority, false); eq(p.canon, false);
  const src = fs.readFileSync(path.join(__dirname, 'metabolism.js'), 'utf8');
  ok(!/disposition:\s*['"]ADMIT/.test(src), 'no code path may emit an ADMIT disposition in this slice');
});

/* ---------- orthogonal statuses ---------- */
T('orthogonal compound state: valid combination accepted, invalid dimension refused', () => {
  eq(M.validCompoundState({ epistemic_status: 'proposed', action_status: 'changed', evidence_status: 'tested_pass', review_status: 'reviewed_with_objections', admission_status: 'held' }).ok, true);
  eq(M.validCompoundState({ epistemic_status: 'verified', action_status: 'changed', evidence_status: 'tested_pass', review_status: 'unreviewed', admission_status: 'held' }).ok, false, 'no linear-enum smuggling: "verified" is not an epistemic status');
});

/* ---------- verification decomposition ---------- */
T('V: tests passed ⊬ claim verified — behavior pass alone is governance-insufficient', () => {
  eq(M.V.behavior([{ result: 'pass' }, { result: 'pass' }]), 'pass');
  const g = M.V.governance({ kind: 'behavior_claim', producer: 'builder-1' }, { behavior: 'pass' }, {});
  eq(g, 'insufficient', 'no witness/review → insufficient despite green tests');
});
T('V: producer as its own witness → forbidden (Law 2)', () => {
  const g = M.V.governance({ kind: 'behavior_claim', producer: 'builder-1' },
    { behavior: 'pass', witness: 'builder-1', review: 'reviewed_clear' }, {});
  eq(g, 'forbidden');
});
T('V: full chain (independent witness + pass + review) → admissible, which is still not admitted', () => {
  const g = M.V.governance({ kind: 'behavior_claim', producer: 'builder-1' },
    { behavior: 'pass', witness: 'reviewer-2', review: 'reviewed_with_objections' }, {});
  eq(g, 'admissible');
  // admissible is an input to the operator decision, not a decision.
});
T('V: scope verification catches out-of-scope and forbidden touches', () => {
  eq(M.V.scope(['experiments/metabolism/x.md'], GOOD_MANIFEST), 1);
  eq(M.V.scope(['index.html'], GOOD_MANIFEST), 0);
  eq(M.V.scope(['somewhere/else.js'], GOOD_MANIFEST), 0);
});

/* ---------- conservation laws ---------- */
T('Law 1: zero-authority worker emitting authority is refused', () => {
  eq(M.LAWS.authorityConservation(0, { authority: true }).ok, false);
  eq(M.LAWS.authorityConservation(0, { authority: false }).ok, true);
});
T('Law 3: status strengthening without a witness is refused; with independent witness it transitions', () => {
  const rec = M.normalizeWorkerOutput('report', 'worker-1');
  eq(M.LAWS.statusTransition(rec, 'evidence_status', 'tested_pass', null).ok, false);
  eq(M.LAWS.statusTransition(rec, 'evidence_status', 'tested_pass', { kind: 'test_run', producer: 'worker-1' }).ok, false, 'self-witness refused');
  const t = M.LAWS.statusTransition(rec, 'evidence_status', 'tested_pass', { kind: 'test_run', producer: 'ci-tool' });
  eq(t.ok, true); eq(t.transitioned.evidence_status, 'tested_pass');
  eq(rec.evidence_status, 'untested', 'original record untouched — transition returns a new record');
});
T('Law 5: candidate mutation intersecting canon pre-admission is refused', () => {
  eq(M.LAWS.mutationIsolation(['experiments/x.js'], ['index.html'], false).ok, true);
  eq(M.LAWS.mutationIsolation(['index.html'], ['index.html'], false).ok, false);
});
T('Law 7: canon without human seal is refused', () => {
  eq(M.LAWS.humanSovereignty({ canon: true, humanSeal: false }).ok, false);
  eq(M.LAWS.humanSovereignty({ canon: true, humanSeal: true }).ok, true);
  eq(M.LAWS.humanSovereignty({ canon: false }).ok, true);
});

/* ---------- Memory Orchard ---------- */
T('Orchard: append works; overwrite of an existing record_id is refused', () => {
  const o = M.makeOrchard();
  eq(M.orchardAppend(o, { record_id: 'rec_001', record_type: 'observation', authority: false }).verdict, 'APPENDED');
  eq(M.orchardAppend(o, { record_id: 'rec_001', record_type: 'observation', authority: false }).verdict, 'DENY');
});
T('Orchard: supersession is append + typed relation, and relations must resolve', () => {
  const o = M.makeOrchard();
  M.orchardAppend(o, { record_id: 'rec_001', record_type: 'observation', authority: false });
  eq(M.orchardAppend(o, { record_id: 'rec_002', record_type: 'observation', supersedes: ['rec_001'], contradicts: [], authority: false }).verdict, 'APPENDED');
  eq(o.records.length, 2, 'old record retained beside its successor');
  eq(M.orchardAppend(o, { record_id: 'rec_003', record_type: 'observation', contradicts: ['rec_999'], authority: false }).verdict, 'DENY', 'dangling relation refused');
});
T('Orchard: Law 4 — derived record with empty provenance refused; records carry authority:false', () => {
  const o = M.makeOrchard();
  eq(M.orchardAppend(o, { record_id: 'rec_010', record_type: 'derived', derived_from: [], authority: false }).verdict, 'DENY');
  eq(M.orchardAppend(o, { record_id: 'rec_011', record_type: 'observation', authority: true }).verdict, 'DENY');
});

/* ---------- receipt ---------- */
const passed = results.filter(r => r.ok).length;
const failed = results.length - passed;
for (const r of results) console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + (r.ok ? '' : '  — ' + r.err));
const src = fs.readFileSync(path.join(__dirname, 'metabolism.js'), 'utf8');
console.log('RECEIPT ' + JSON.stringify({
  receipt: 'METABOLISM_SEAM_V0',
  suite: 'experiments/metabolism/metabolism.test.js',
  passed, failed, total: results.length,
  module_digest: 'demo-fnv1a:' + M.h32(src).toString(16).padStart(8, '0'),
  node: process.version, executed_at: new Date().toISOString(),
  authority: false, canon: false, ledger_effect: 'none', claim: 'NO_CLAIM',
  note: 'first slice: manifest→preflight→read-only worker→normalization→HOLD_FOR_OPERATOR; no ADMIT path exists',
}));
if (failed > 0) process.exit(1);
