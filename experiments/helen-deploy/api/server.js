// authority=false · claim=NO_CLAIM · non-sovereign
//
// HELEN DEPLOY 0.1 — api/server.js
// node:http. Three endpoints. No others.
//
//   POST /api/run        submit a context packet
//                        → 202 {run_id, state:"QUEUED"} IMMEDIATELY
//   GET  /api/run/:id    the live receipt for that run
//   GET  /api/receipts   the append-only ledger, newest snapshot per run
//
// The Modal-shaped choice: POST returns the moment identity exists, never when
// work finishes. The submitter receives a run_id and a QUEUED state; execution
// happens after the response has been written. A caller therefore cannot be
// handed a verdict by a blocking call — they must come back and read a receipt.
// That is not an ergonomic preference, it is how the law is enforced at the
// transport layer: there is no code path in which the HTTP response IS the
// judgement.

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { Store, canonical, sha256, LAW, isTerminal } = require('../runtime/store');
const { runPipeline } = require('../runtime/evaluator');
const { listCapsules } = require('../runtime/capsule');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_CONTEXT_ROOT = path.resolve(ROOT, '..', '..');
const CONTEXT_ROOT = path.resolve(process.env.HELEN_CONTEXT_ROOT || DEFAULT_CONTEXT_ROOT);
const STORE_ROOT = path.resolve(process.env.HELEN_STORE_ROOT || path.join(ROOT, 'var'));
const PACKET_SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas', 'context-packet.schema.json'), 'utf8'));
const MAX_BODY = 1024 * 1024;

const store = new Store(STORE_ROOT);
const receipts = new Map(); // run_id → live receipt

// ---------------------------------------------------------------------------
// Hand-rolled minimal JSON Schema validator. Supports exactly the keywords the
// packet schema uses; anything else is ignored rather than silently "passed".
// ---------------------------------------------------------------------------
function validate(schema, value, at, errors) {
  if (!schema || typeof schema !== 'object') return;
  if (schema.type) {
    const t = schema.type;
    const ok =
      (t === 'object' && value !== null && typeof value === 'object' && !Array.isArray(value)) ||
      (t === 'array' && Array.isArray(value)) ||
      (t === 'string' && typeof value === 'string') ||
      (t === 'boolean' && typeof value === 'boolean') ||
      (t === 'number' && typeof value === 'number') ||
      (t === 'integer' && Number.isInteger(value));
    if (!ok) {
      errors.push(at + ': expected ' + t);
      return;
    }
  }
  if (schema.enum && schema.enum.indexOf(value) === -1) {
    errors.push(at + ': must be one of ' + schema.enum.join(', '));
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(at + ': shorter than ' + schema.minLength);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(at + ': longer than ' + schema.maxLength);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(at + ': does not match ' + schema.pattern);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(at + ': needs at least ' + schema.minItems + ' item(s)');
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(at + ': allows at most ' + schema.maxItems + ' item(s)');
    if (schema.items) value.forEach((item, i) => validate(schema.items, item, at + '[' + i + ']', errors));
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(at + ': missing required field "' + key + '"');
    }
    for (const key of Object.keys(schema.properties || {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validate(schema.properties[key], value[key], at === '$' ? key : at + '.' + key, errors);
      }
    }
  }
}

function validatePacket(packet) {
  const errors = [];
  validate(PACKET_SCHEMA, packet, '$', errors);
  return errors;
}

// ---------------------------------------------------------------------------
// Receipts. Every transition appends a full snapshot to receipts.jsonl.
// ---------------------------------------------------------------------------
function newReceipt(packet, runId) {
  return {
    run_id: runId,
    packet_id: packet.packet_id,
    capsule: packet.capsule,
    submitted_by: packet.submitted_by,
    packet_sha256: sha256(canonical(packet)),
    state: 'QUEUED',
    transitions: [],
    context_verified: false,
    context: [],
    capabilities_respected: false,
    capabilities: { declared: packet.capabilities || [], required: [], used: [], violations: [] },
    outputs_stored: false,
    outputs: [],
    postconditions_passed: false,
    postconditions: [],
    replay: { verified: false, first_run_hash: null, second_run_hash: null, detail: 'not reached' },
    certified: false,
    reason: 'the packet was accepted for execution; no claim has been made yet',
    law: LAW,
    packet: packet,
  };
}

function transition(receipt, state, note) {
  receipt.state = state;
  receipt.transitions.push({
    state: state,
    at_monotonic: store.tick(),
    // Observational only. Never identity, never ordering.
    observed_at: new Date().toISOString(),
    note: note,
  });
  store.appendReceipt(receipt);
}

function execute(receipt) {
  let outcome;
  try {
    outcome = runPipeline(receipt.packet, {
      store: store,
      contextRoot: CONTEXT_ROOT,
      emit: function (state, note) {
        if (receipt.state !== state) transition(receipt, state, note);
        else receipt.transitions.push({ state: state, at_monotonic: store.tick(), observed_at: new Date().toISOString(), note: note });
      },
    });
  } catch (err) {
    receipt.reason = 'the runtime itself faulted: ' + String(err && err.message);
    transition(receipt, 'FAILED', receipt.reason);
    return;
  }
  Object.assign(receipt, outcome.patch);
  receipt.reason = outcome.reason;
  transition(receipt, outcome.state, outcome.reason);
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------
function send(res, code, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    // The Context Player is opened from disk; it must be able to read receipts.
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
  });
  res.end(body);
}

function readBody(req, cb) {
  let size = 0;
  const chunks = [];
  req.on('data', (c) => {
    size += c.length;
    if (size > MAX_BODY) {
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on('end', () => cb(null, Buffer.concat(chunks).toString('utf8')));
  req.on('error', (err) => cb(err));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const route = url.pathname.replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && route === '/api/run') {
    readBody(req, (err, raw) => {
      if (err) return send(res, 400, { error: 'the request body could not be read', detail: String(err.message) });
      let packet;
      try {
        packet = JSON.parse(raw);
      } catch (e) {
        return send(res, 400, { error: 'the packet is not valid JSON', detail: String(e.message) });
      }
      const errors = validatePacket(packet);
      if (errors.length > 0) {
        return send(res, 400, { error: 'the packet does not satisfy context-packet.schema.json', violations: errors });
      }
      if (listCapsules().indexOf(packet.capsule) === -1) {
        return send(res, 400, { error: 'unregistered capsule', detail: packet.capsule, registered: listCapsules() });
      }

      // Identity is minted here: sha256(canonical packet + monotonic counter).
      const counter = store.tick();
      const runId = store.mintRunId(packet, counter);
      const receipt = newReceipt(packet, runId);
      receipts.set(runId, receipt);
      transition(receipt, 'QUEUED', 'packet accepted, counter ' + counter);

      // The response leaves before the work starts. This is the seam.
      send(res, 202, { run_id: runId, state: 'QUEUED', receipt_url: '/api/run/' + runId });
      setImmediate(() => execute(receipt));
    });
    return;
  }

  if (req.method === 'GET' && route.startsWith('/api/run/')) {
    const id = route.slice('/api/run/'.length);
    const receipt = receipts.get(id);
    if (!receipt) return send(res, 404, { error: 'no run with that id in this process', run_id: id });
    return send(res, 200, { ...receipt, terminal: isTerminal(receipt.state) });
  }

  if (req.method === 'GET' && route === '/api/receipts') {
    const ledger = store.readReceipts();
    const latest = new Map();
    for (const r of ledger) if (r && r.run_id) latest.set(r.run_id, r);
    return send(res, 200, {
      law: LAW,
      ledger_lines: ledger.length,
      runs: Array.from(latest.values()).map((r) => ({
        run_id: r.run_id,
        packet_id: r.packet_id,
        capsule: r.capsule,
        state: r.state,
        certified: r.certified,
        replay_verified: !!(r.replay && r.replay.verified),
        reason: r.reason,
      })),
    });
  }

  send(res, 404, { error: 'no such endpoint', detail: 'this runtime serves POST /api/run, GET /api/run/:id, GET /api/receipts' });
});

const PORT = process.env.PORT !== undefined ? Number(process.env.PORT) : 8787;

if (require.main === module) {
  server.listen(PORT, '127.0.0.1', () => {
    const addr = server.address();
    // e2e.cjs parses this line to discover the port when PORT=0.
    process.stdout.write('helen-deploy listening on port ' + addr.port + '\n');
    process.stdout.write('context root: ' + CONTEXT_ROOT + '\n');
    process.stdout.write('store root:   ' + STORE_ROOT + '\n');
    process.stdout.write('capsules:     ' + listCapsules().join(', ') + '\n');
  });
}

module.exports = { server, validatePacket, store, CONTEXT_ROOT, STORE_ROOT };
