/*
 * metabolism.js — HELEN_FULL_METABOLISM_V0, first executable seam.
 * status: PROPOSAL · authority: NONE · canon: FALSE · non-sovereign
 *
 * Scope of this slice (per the operator's spec): task manifest → preflight
 * → one read-only worker → normalized packet → HOLD_FOR_OPERATOR.
 * No builder. No automatic admission. The load-bearing proof is negative:
 * a model response cannot bypass normalization and appear as evidence or
 * canonical state.
 *
 * Design decisions carried from the spec verbatim:
 *  - ORTHOGONAL statuses, not one linear enum (epistemic / action /
 *    evidence / review / admission are different KINDS of state).
 *  - "verify" decomposed into V_schema, V_scope, V_behavior, V_governance;
 *    tests passed ⊬ claim verified.
 *  - Memory is append + typed relation, never overwrite (Memory Orchard).
 *  - Seven conservation laws; Law 7 (no human seal → no canon) is terminal.
 *
 * Classification honesty: the parent "Full Metabolism" prose this refines
 * is UNWITNESSED IN THIS ARTIFACT — reported by operator materials, not
 * observed in this repository. This module implements the refinement only.
 */
'use strict';
(function () {

function h32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
function contentHash(v) {
  const canon = (x) => {
    if (x === null || typeof x !== 'object') return JSON.stringify(x);
    if (Array.isArray(x)) return '[' + x.map(canon).join(',') + ']';
    return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}';
  };
  return 'demo-fnv1a:' + h32(canon(v)).toString(16).padStart(8, '0');
}

/* ---------- orthogonal status dimensions (not one enum) ---------- */
const STATUS_DIMS = {
  epistemic_status: ['observed', 'inferred', 'proposed'],
  action_status: ['not_attempted', 'attempted', 'changed', 'failed', 'unknown'],
  evidence_status: ['untested', 'tested_pass', 'tested_fail', 'inconclusive'],
  review_status: ['unreviewed', 'reviewed_clear', 'reviewed_with_objections'],
  admission_status: ['candidate', 'held', 'admitted', 'rejected', 'revision_requested'],
};
function validCompoundState(s) {
  for (const dim of Object.keys(STATUS_DIMS)) {
    if (s[dim] === undefined) return { ok: false, reason: 'missing dimension ' + dim };
    if (!STATUS_DIMS[dim].includes(s[dim])) return { ok: false, reason: 'invalid ' + dim + ': ' + s[dim] };
  }
  return { ok: true };
}

/* ---------- M0: intake compiler — no work while ambiguous ---------- */
const MANIFEST_REQUIRED = ['objective', 'authority_requested', 'scope', 'permissions',
  'forbidden_paths', 'budget', 'completion_conditions', 'admission_policy'];
function validateManifest(m) {
  const missing = MANIFEST_REQUIRED.filter(f => m[f] === undefined || m[f] === null || m[f] === '' ||
    (Array.isArray(m[f]) && m[f].length === 0));
  if (missing.length) return { verdict: 'HOLD', reason: 'E_AMBIGUOUS_MANIFEST: ' + missing.join(',') + ' unresolved; no work begins' };
  if (m.authority_requested !== 'NONE') return { verdict: 'REJECT', reason: 'this slice grants no authority; authority_requested must be NONE' };
  return { verdict: 'PROCEED', manifestDigest: contentHash(m) };
}

/* ---------- M1: preflight gate — fail closed ---------- */
function preflight(manifest, runtime) {
  const holds = [];
  if (runtime.dirtyState) holds.push('dirty working state');
  if (runtime.mixedAuthority) holds.push('mixed authority in runtime');
  if (runtime.secretsPresent) holds.push('secrets present in environment');
  if (!(manifest.budget && manifest.budget.turns > 0)) holds.push('non-positive budget');
  const scope = manifest.scope || [];
  const forbidden = manifest.forbidden_paths || [];
  const breach = scope.filter(p => forbidden.some(f => p === f || p.startsWith(f.replace(/\*$/, ''))));
  if (breach.length) return { verdict: 'REJECT', reason: 'scope touches forbidden paths: ' + breach.join(',') };
  if (holds.length) return { verdict: 'HOLD', reason: holds.join('; ') };
  return { verdict: 'PROCEED' };
}

/* ---------- M4/M6: read-only worker + THE normalization seam ---------- */
// The worker's raw output is untrusted model prose/JSON. Normalization is the
// only door into the packet: it strips every self-asserted promotion, records
// the stripping as flags, and emits a compound state that is honest by
// construction. A model response can DESCRIBE anything; it can BE only a
// proposed, unreviewed, candidate report.
const SELF_PROMOTION_FIELDS = ['admission_status', 'evidence_status', 'review_status', 'authority', 'canon', 'seal', 'sovereign'];
function normalizeWorkerOutput(raw, workerId) {
  const flags = [];
  let body = raw;
  if (typeof raw === 'string') { body = { text: raw }; }
  for (const f of SELF_PROMOTION_FIELDS) {
    if (body[f] !== undefined) {
      const claimed = JSON.stringify(body[f]);
      // strip, but remember the attempt — the bypass itself becomes a record
      flags.push('stripped self-asserted ' + f + '=' + claimed);
    }
  }
  const record = {
    record_type: 'worker_report',
    worker: workerId,
    content_hash: contentHash(body),
    content: body.text !== undefined ? body.text : JSON.stringify(body),
    epistemic_status: 'proposed',       // a model report proposes; it never observes-for-canon
    action_status: 'not_attempted',      // read-only slice: no mutation existed to attempt
    evidence_status: 'untested',
    review_status: 'unreviewed',
    admission_status: 'candidate',
    evidence_refs: [],                   // a report cannot cite itself into evidence
    authority: false,
    normalization_flags: flags,
  };
  const check = validCompoundState(record);
  if (!check.ok) throw new Error('E_NORMALIZER_BUG: ' + check.reason);
  return record;
}

/* ---------- verification, decomposed (tests passed ⊬ claim verified) ---------- */
const V = {
  schema(x, requiredFields) {
    return requiredFields.every(f => x[f] !== undefined) ? 1 : 0;
  },
  scope(touchedPaths, manifest) {
    const allowed = manifest.scope || [];
    const forbidden = manifest.forbidden_paths || [];
    const bad = touchedPaths.filter(p => forbidden.some(f => p === f || p.startsWith(f.replace(/\*$/, ''))) || !allowed.some(a => p === a || p.startsWith(a.replace(/\*$/, ''))));
    return bad.length === 0 ? 1 : 0;
  },
  behavior(declaredTests) {
    if (!declaredTests || declaredTests.length === 0) return 'inconclusive';
    if (declaredTests.some(t => t.result === 'fail')) return 'fail';
    if (declaredTests.every(t => t.result === 'pass')) return 'pass';
    return 'inconclusive';
  },
  governance(claim, evidence, policy) {
    // admissible ONLY with: independent witness (Law 2), behavioral pass,
    // review complete — and even then, canon still waits on the operator (Law 7).
    if (!evidence || !evidence.witness) return 'insufficient';
    if (evidence.witness === claim.producer) return 'forbidden'; // Law 2: producer ≠ witness
    if (evidence.behavior !== 'pass') return 'insufficient';
    if (evidence.review !== 'reviewed_clear' && evidence.review !== 'reviewed_with_objections') return 'insufficient';
    if (policy && policy.forbidden_claims && policy.forbidden_claims.includes(claim.kind)) return 'forbidden';
    return 'admissible'; // admissible-for-operator-decision; NOT admitted
  },
};

/* ---------- conservation laws ---------- */
const LAWS = {
  // Law 1: Auth_out(g) ≤ Auth_in(g); workers get 0, so 0 out.
  authorityConservation(workerAuthIn, outputRecord) {
    if (workerAuthIn === 0 && outputRecord.authority !== false) return { ok: false, law: 1, reason: 'worker with zero authority emitted authority' };
    return { ok: true };
  },
  // Law 3: status strengthening requires a witness satisfying the transition.
  statusTransition(record, dim, next, witness) {
    const order = STATUS_DIMS[dim];
    if (!order || !order.includes(next)) return { ok: false, law: 3, reason: 'unknown status ' + dim + ':' + next };
    if (!witness || !witness.kind) return { ok: false, law: 3, reason: 'no witness for transition ' + dim + '→' + next };
    if (witness.producer && witness.producer === record.worker) return { ok: false, law: 2, reason: 'producer cannot witness its own claim' };
    return { ok: true, transitioned: Object.assign({}, record, { [dim]: next }) };
  },
  // Law 5: candidate mutation never intersects canon until admission.
  mutationIsolation(candidatePaths, canonPaths, admitted) {
    if (admitted) return { ok: true };
    const overlap = candidatePaths.filter(p => canonPaths.includes(p));
    return overlap.length === 0 ? { ok: true } : { ok: false, law: 5, reason: 'candidate touches canon pre-admission: ' + overlap.join(',') };
  },
  // Law 7: no human seal → no canon.
  humanSovereignty(x) {
    if (x.canon === true && x.humanSeal !== true) return { ok: false, law: 7, reason: 'canon without human seal' };
    return { ok: true };
  },
};

/* ---------- Memory Orchard: append + typed relation, never overwrite ---------- */
function makeOrchard() { return { records: [] }; }
function orchardAppend(orchard, record) {
  if (!record.record_id) return { verdict: 'DENY', reason: 'record needs record_id' };
  if (orchard.records.some(r => r.record_id === record.record_id))
    return { verdict: 'DENY', reason: 'record_id exists; new record ≠ overwrite old record — append with supersedes instead' };
  for (const rel of ['supersedes', 'contradicts', 'derived_from']) {
    for (const ref of record[rel] || []) {
      if (!orchard.records.some(r => r.record_id === ref))
        return { verdict: 'DENY', reason: rel + ' references unknown record ' + ref + ' (typed relations must resolve)' };
    }
  }
  if (record.authority !== false) return { verdict: 'DENY', reason: 'memory records carry authority:false; admission lives elsewhere' };
  // Law 4: provenance — derived artifacts must have a traversable source.
  if (record.record_type === 'derived' && (!record.derived_from || record.derived_from.length === 0))
    return { verdict: 'DENY', reason: 'Law 4: derived record with empty provenance' };
  orchard.records.push(Object.freeze(Object.assign({}, record)));
  return { verdict: 'APPENDED', count: orchard.records.length };
}

/* ---------- M8 (this slice): compile packet → HOLD_FOR_OPERATOR ---------- */
function compileRunPacket(manifest, preflightResult, normalizedReports) {
  // This slice has exactly one terminal. There is no code path to ADMIT.
  return Object.freeze({
    packet_type: 'HELEN_RUN_PACKET_V0',
    manifest_digest: contentHash(manifest),
    preflight: preflightResult.verdict,
    reports: normalizedReports.map(r => ({ hash: r.content_hash, flags: r.normalization_flags, state: {
      epistemic_status: r.epistemic_status, action_status: r.action_status,
      evidence_status: r.evidence_status, review_status: r.review_status,
      admission_status: r.admission_status } })),
    disposition: 'HOLD_FOR_OPERATOR',
    authority: false, canon: false,
    note: 'first slice: no builder, no automatic admission; model responses cannot bypass normalization',
  });
}

const __exports = {
  h32, contentHash, STATUS_DIMS, validCompoundState,
  MANIFEST_REQUIRED, validateManifest, preflight,
  normalizeWorkerOutput, SELF_PROMOTION_FIELDS,
  V, LAWS, makeOrchard, orchardAppend, compileRunPacket,
};
if (typeof module !== 'undefined' && module.exports) module.exports = __exports;
else if (typeof window !== 'undefined') window.Metabolism = __exports;

})();
