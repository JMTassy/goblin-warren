// authority=false · claim=NO_CLAIM · non-sovereign
//
// HELEN DEPLOY 0.1 — evaluator.js
// The five conditions, and the only place in this runtime allowed to write
// certified:true.
//
//   CONDITION 1  context verified       — hashes matched at provision time
//   CONDITION 2  capabilities respected — required ⊆ granted, used ⊆ granted
//   CONDITION 3  outputs stored         — every output content-addressed
//   CONDITION 4  postconditions passed  — all declared, all evaluated, all held
//   CONDITION 5  replay verified        — second execution, identical digests
//
// State mapping:
//   context mismatch | capability violation | unregistered capsule → INVALID
//   capsule fault (spawn, crash, no result, malformed result)      → FAILED
//   stored outputs but a condition short of all five               → PARTIAL
//   all five                                                       → CERTIFIED

'use strict';

const { runAttempt, outputFingerprint } = require('./capsule');
const { canonical } = require('./store');

// ---------------------------------------------------------------------------
// CONDITION 4 — declarative postconditions. No expression language, no eval.
// ---------------------------------------------------------------------------
function selectPath(value, dotPath) {
  if (dotPath === '' || dotPath === undefined || dotPath === null) return { found: true, value };
  let cursor = value;
  for (const segment of String(dotPath).split('.')) {
    if (cursor === null || typeof cursor !== 'object') return { found: false, value: undefined };
    if (Array.isArray(cursor)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= cursor.length) return { found: false, value: undefined };
      cursor = cursor[index];
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(cursor, segment)) return { found: false, value: undefined };
    cursor = cursor[segment];
  }
  return { found: true, value: cursor };
}

function compare(op, actual, expected) {
  switch (op) {
    case 'eq':
      return canonical(actual) === canonical(expected);
    case 'ne':
      return canonical(actual) !== canonical(expected);
    case 'gt':
      return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
    case 'gte':
      return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
    case 'lt':
      return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    case 'lte':
      return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
    case 'contains':
      if (typeof actual === 'string') return actual.indexOf(String(expected)) !== -1;
      if (Array.isArray(actual)) return actual.some((item) => canonical(item) === canonical(expected));
      return false;
    default:
      return false;
  }
}

function evaluatePostconditions(postconditions, outputs) {
  const byName = new Map(outputs.map((o) => [o.name, o]));
  const rows = [];
  let allPass = true;
  for (const pc of postconditions) {
    const row = { name: pc.name, op: pc.op, expected: pc.value, evaluated: false, pass: false };
    const output = byName.get(pc.output);
    if (!output) {
      row.detail = 'no output named "' + pc.output + '" was produced';
      rows.push(row);
      allPass = false;
      continue;
    }
    const picked = selectPath(output.value, pc.path);
    if (!picked.found) {
      row.detail = 'path "' + pc.path + '" is absent from output "' + pc.output + '"';
      rows.push(row);
      allPass = false;
      continue;
    }
    row.evaluated = true;
    row.actual = picked.value;
    row.pass = compare(pc.op, picked.value, pc.value);
    if (!row.pass) row.detail = 'expected ' + pc.op + ' ' + canonical(pc.value) + ', observed ' + canonical(picked.value);
    if (!row.pass) allPass = false;
    rows.push(row);
  }
  return { rows, allPass };
}

// ---------------------------------------------------------------------------
// The pipeline. `emit(state, note)` is called on every transition so a caller
// can keep a live receipt and an append-only ledger in step.
// ---------------------------------------------------------------------------
function runPipeline(packet, options) {
  const store = options.store;
  const contextRoot = options.contextRoot;
  const emit = typeof options.emit === 'function' ? options.emit : function () {};

  const patch = {
    context_verified: false,
    capabilities_respected: false,
    outputs_stored: false,
    postconditions_passed: false,
    outputs: [],
    postconditions: [],
    context: [],
    capabilities: { declared: packet.capabilities || [], required: [], used: [], violations: [] },
    replay: { verified: false, first_run_hash: null, second_run_hash: null, detail: 'not reached' },
    certified: false,
    diagnostics: {},
  };

  emit('RUNNING', 'provisioning declared context and executing capsule');

  const first = runAttempt(packet, { contextRoot });
  patch.context = first.context.rows;
  patch.context_verified = first.context.verified;
  patch.capabilities = {
    declared: first.capabilities.declared || [],
    required: first.capabilities.required || [],
    used: first.capabilities.used || [],
    violations: first.capabilities.violations || [],
  };
  patch.diagnostics = first.diagnostics || {};

  // CONDITION 1 refused.
  if (first.stage === 'context') {
    patch.capabilities_respected = patch.capabilities.violations.length === 0;
    patch.replay.detail = 'no execution took place: context refused';
    return { state: 'INVALID', reason: first.reason, patch };
  }

  // CONDITION 2 refused.
  if (first.stage === 'capability') {
    patch.capabilities_respected = false;
    patch.replay.detail = 'no execution took place: capability refused';
    return { state: 'INVALID', reason: first.reason, patch };
  }

  patch.capabilities_respected = patch.capabilities.violations.length === 0;

  // Capsule fault.
  if (!first.ok) {
    patch.replay.detail = 'no comparable execution: the capsule faulted';
    return { state: 'FAILED', reason: first.reason, patch };
  }

  // CONDITION 3 — store every output, content-addressed.
  const storedRows = [];
  let outputsStored = true;
  for (const output of first.outputs) {
    try {
      const record = store.putBytes(output.bytes);
      if (record.sha256 !== output.sha256) {
        outputsStored = false;
        storedRows.push({ name: output.name, sha256: output.sha256, content_type: output.content_type, stored_at: null, detail: 'store digest disagreed with the computed digest' });
        continue;
      }
      storedRows.push({
        name: output.name,
        sha256: record.sha256,
        bytes: record.bytes,
        content_type: output.content_type,
        stored_at: record.stored_at,
      });
    } catch (err) {
      outputsStored = false;
      storedRows.push({ name: output.name, sha256: output.sha256, content_type: output.content_type, stored_at: null, detail: String(err && err.message) });
    }
  }
  patch.outputs = storedRows;
  patch.outputs_stored = outputsStored && storedRows.length > 0;

  // CONDITION 4 — postconditions.
  const pcResult = evaluatePostconditions(packet.postconditions, first.outputs);
  patch.postconditions = pcResult.rows;
  patch.postconditions_passed = pcResult.allPass;

  // CONDITION 5 — replay. A second execution over the same packet, in a fresh
  // workdir, compared on output digests alone.
  emit('RUNNING', 'replaying the packet a second time for digest comparison');
  const firstHash = outputFingerprint(first.outputs);
  patch.replay.first_run_hash = firstHash;

  const second = runAttempt(packet, { contextRoot });
  if (!second.ok) {
    patch.replay.verified = false;
    patch.replay.detail = 'the replay execution did not complete: ' + second.reason;
  } else {
    const secondHash = outputFingerprint(second.outputs);
    patch.replay.second_run_hash = secondHash;
    patch.replay.verified = secondHash === firstHash;
    patch.replay.detail = patch.replay.verified
      ? 'two independent executions produced identical output digests'
      : 'the second execution produced different output digests: this run is not replayable';
  }

  const conditions = [
    ['context verified', patch.context_verified],
    ['capabilities respected', patch.capabilities_respected],
    ['outputs stored', patch.outputs_stored],
    ['postconditions passed', patch.postconditions_passed],
    ['replay verified', patch.replay.verified],
  ];
  const unmet = conditions.filter((c) => !c[1]).map((c) => c[0]);
  patch.certified = unmet.length === 0;

  if (patch.certified) {
    return { state: 'CERTIFIED', reason: 'all five conditions held: ' + conditions.map((c) => c[0]).join(' · '), patch };
  }
  return { state: 'PARTIAL', reason: 'outputs were stored, but these conditions did not hold: ' + unmet.join(' · '), patch };
}

module.exports = { runPipeline, evaluatePostconditions, selectPath, compare };
