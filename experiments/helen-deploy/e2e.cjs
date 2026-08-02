#!/usr/bin/env node
// authority=false · claim=NO_CLAIM · non-sovereign
//
// HELEN DEPLOY 0.1 — e2e.cjs
// This script IS the component's admission evidence.
//
// It starts the API on a free port with an isolated store, submits three
// packets, and requires three different verdicts:
//
//   1. the honest packet          → CERTIFIED, replay.verified true
//   2. one tampered sha256        → INVALID    (refused before any execution)
//   3. a postcondition expecting
//      36 passes instead of 35    → PARTIAL    (ran, stored, replayed, failed)
//
// Exit 0 only when all three behave. Any other combination exits 1. A green run
// is not "the tests passed"; it is a demonstration that the gate discriminates.

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

const ROOT = __dirname;
const CONTEXT_ROOT = path.resolve(ROOT, '..', '..');
const SERVER = path.join(ROOT, 'api', 'server.js');

function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}
function line(ch) {
  return ch.repeat(74);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function request(port, method, route, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request(
      {
        host: '127.0.0.1',
        port: port,
        method: method,
        path: route,
        headers: payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {},
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let parsed = null;
          try {
            parsed = JSON.parse(text);
          } catch (err) {
            return reject(new Error('unparseable response from ' + route + ': ' + text.slice(0, 200)));
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function startServer(storeRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SERVER], {
      cwd: ROOT,
      env: {
        PATH: process.env.PATH || '/usr/bin:/bin',
        PORT: '0',
        HELEN_STORE_ROOT: storeRoot,
        HELEN_CONTEXT_ROOT: CONTEXT_ROOT,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let buffered = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      reject(new Error('the server did not announce a port within 15s'));
    }, 15000);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffered += chunk;
      const m = buffered.match(/listening on port (\d+)/);
      if (m && !settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ child: child, port: Number(m[1]) });
      }
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (c) => process.stderr.write('[server] ' + c));
    child.on('exit', (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error('the server exited before listening (code ' + code + '): ' + buffered));
      }
    });
  });
}

const TERMINAL = ['PARTIAL', 'INVALID', 'CERTIFIED', 'FAILED'];

async function submitAndAwait(port, packet, label) {
  const posted = await request(port, 'POST', '/api/run', packet);
  if (posted.status !== 202) {
    throw new Error(label + ': POST /api/run answered ' + posted.status + ' — ' + JSON.stringify(posted.body));
  }
  if (posted.body.state !== 'QUEUED' || !/^[0-9a-f]{64}$/.test(posted.body.run_id || '')) {
    throw new Error(label + ': POST must answer {run_id, state:"QUEUED"} — got ' + JSON.stringify(posted.body));
  }
  const runId = posted.body.run_id;
  const deadline = Date.now() + 240000;
  let receipt = null;
  while (Date.now() < deadline) {
    const got = await request(port, 'GET', '/api/run/' + runId);
    if (got.status !== 200) throw new Error(label + ': GET /api/run/:id answered ' + got.status);
    receipt = got.body;
    if (TERMINAL.indexOf(receipt.state) !== -1) return { runId, receipt, accepted: posted.body };
    await sleep(200);
  }
  throw new Error(label + ': the run never reached a terminal state (last state ' + (receipt && receipt.state) + ')');
}

function printReceipt(title, expectation, r) {
  const states = r.transitions.map((t) => t.state);
  const collapsed = states.filter((s, i) => i === 0 || s !== states[i - 1]);
  console.log('');
  console.log(line('='));
  console.log('  ' + title);
  console.log('  expected: ' + expectation);
  console.log(line('='));
  console.log('  run_id                 ' + r.run_id);
  console.log('  packet_id              ' + r.packet_id);
  console.log('  capsule                ' + r.capsule);
  console.log('  state                  ' + r.state);
  console.log('  timeline               ' + collapsed.join(' -> '));
  console.log('  context_verified       ' + r.context_verified);
  console.log('  capabilities_respected ' + r.capabilities_respected);
  console.log('  outputs_stored         ' + r.outputs_stored);
  console.log('  postconditions_passed  ' + r.postconditions_passed);
  console.log('  replay.verified        ' + r.replay.verified);
  console.log('  certified              ' + r.certified);
  console.log('  reason                 ' + r.reason);
  for (const c of r.context || []) {
    console.log('    context  ' + (c.match ? 'match  ' : 'MISMATCH') + '  ' + c.path + '  ' + String(c.actual_sha256).slice(0, 16) + '…');
  }
  for (const o of r.outputs || []) {
    console.log('    output   ' + o.name + '  ' + String(o.sha256).slice(0, 16) + '…  ' + o.bytes + ' bytes  -> ' + o.stored_at);
  }
  for (const p of r.postconditions || []) {
    console.log('    postcond ' + (p.pass ? 'PASS' : 'FAIL') + '  ' + p.name + (p.detail ? '  (' + p.detail + ')' : ''));
  }
  if (r.replay.first_run_hash) console.log('    replay   first ' + String(r.replay.first_run_hash).slice(0, 16) + '…  second ' + String(r.replay.second_run_hash).slice(0, 16) + '…');
  console.log('    replay   ' + r.replay.detail);
}

async function main() {
  const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'helen-e2e-store-'));
  const indexHash = sha256File(path.join(CONTEXT_ROOT, 'index.html'));
  const selftestHash = sha256File(path.join(CONTEXT_ROOT, 'selftest.js'));

  console.log(line('#'));
  console.log('  HELEN DEPLOY 0.1 — end-to-end admission evidence');
  console.log('  context root : ' + CONTEXT_ROOT);
  console.log('  store root   : ' + storeRoot);
  console.log('  index.html   : ' + indexHash);
  console.log('  selftest.js  : ' + selftestHash);
  console.log(line('#'));

  const honestContext = {
    files: [
      { path: 'index.html', sha256: indexHash },
      { path: 'selftest.js', sha256: selftestHash },
    ],
  };
  const capabilities = ['fs:read:workdir', 'fs:write:workdir', 'proc:spawn:node'];

  const packetCertified = {
    packet_id: 'warren-canon-35',
    capsule: 'warren-selftest',
    context: honestContext,
    capabilities: capabilities,
    postconditions: [
      { name: 'canon_35_passed', output: 'output.json', path: 'passed', op: 'eq', value: 35 },
      { name: 'canon_0_failed', output: 'output.json', path: 'failed', op: 'eq', value: 0 },
    ],
    submitted_by: 'e2e.cjs',
    note: 'the canon law, declared exactly as it stands',
  };

  const tamperedHash = 'f'.repeat(64);
  const packetInvalid = {
    packet_id: 'warren-canon-tampered',
    capsule: 'warren-selftest',
    context: {
      files: [
        { path: 'index.html', sha256: tamperedHash },
        { path: 'selftest.js', sha256: selftestHash },
      ],
    },
    capabilities: capabilities,
    postconditions: [{ name: 'canon_35_passed', output: 'output.json', path: 'passed', op: 'eq', value: 35 }],
    submitted_by: 'e2e.cjs',
    note: 'index.html declared with a digest that is not the digest on disk',
  };

  const packetPartial = {
    packet_id: 'warren-canon-36',
    capsule: 'warren-selftest',
    context: honestContext,
    capabilities: capabilities,
    postconditions: [{ name: 'canon_36_passed', output: 'output.json', path: 'passed', op: 'eq', value: 36 }],
    submitted_by: 'e2e.cjs',
    note: 'a postcondition that asks for an assertion the canon does not contain',
  };

  const started = await startServer(storeRoot);
  const port = started.port;
  console.log('\n  server listening on 127.0.0.1:' + port + '\n');

  const failures = [];
  let ledgerLines = 0;
  try {
    const one = await submitAndAwait(port, packetCertified, 'scenario 1');
    printReceipt('SCENARIO 1 — the canon, declared honestly', 'CERTIFIED with replay.verified true', one.receipt);
    if (one.receipt.state !== 'CERTIFIED') failures.push('scenario 1: expected CERTIFIED, observed ' + one.receipt.state);
    if (one.receipt.certified !== true) failures.push('scenario 1: expected certified true');
    if (one.receipt.replay.verified !== true) failures.push('scenario 1: expected replay.verified true');
    if (!one.receipt.outputs.length) failures.push('scenario 1: expected stored outputs');

    const two = await submitAndAwait(port, packetInvalid, 'scenario 2');
    printReceipt('SCENARIO 2 — one declared sha256 tampered', 'INVALID, refused before any execution', two.receipt);
    if (two.receipt.state !== 'INVALID') failures.push('scenario 2: expected INVALID, observed ' + two.receipt.state);
    if (two.receipt.certified !== false) failures.push('scenario 2: expected certified false');
    if (two.receipt.context_verified !== false) failures.push('scenario 2: expected context_verified false');
    if ((two.receipt.outputs || []).length !== 0) failures.push('scenario 2: nothing may be executed or stored on a context mismatch');

    const three = await submitAndAwait(port, packetPartial, 'scenario 3');
    printReceipt('SCENARIO 3 — postcondition expects 36 passes', 'PARTIAL, stored and replayed but not certified', three.receipt);
    if (three.receipt.state !== 'PARTIAL') failures.push('scenario 3: expected PARTIAL, observed ' + three.receipt.state);
    if (three.receipt.certified !== false) failures.push('scenario 3: expected certified false');
    if (three.receipt.context_verified !== true) failures.push('scenario 3: expected context_verified true');
    if (three.receipt.outputs_stored !== true) failures.push('scenario 3: expected outputs_stored true');
    if (three.receipt.postconditions_passed !== false) failures.push('scenario 3: expected postconditions_passed false');

    const ledger = await request(port, 'GET', '/api/receipts');
    ledgerLines = ledger.body.ledger_lines;
    console.log('');
    console.log(line('='));
    console.log('  LEDGER — ' + ledgerLines + ' append-only lines, ' + ledger.body.runs.length + ' runs');
    console.log(line('='));
    for (const r of ledger.body.runs) {
      console.log('  ' + r.state.padEnd(10) + ' certified=' + String(r.certified).padEnd(6) + ' replay=' + String(r.replay_verified).padEnd(6) + ' ' + r.packet_id);
    }
    if (ledger.body.runs.length !== 3) failures.push('ledger: expected 3 runs, observed ' + ledger.body.runs.length);
  } finally {
    started.child.kill('SIGTERM');
  }

  console.log('');
  console.log(line('#'));
  if (failures.length === 0) {
    console.log('  VERDICTS: CERTIFIED / INVALID / PARTIAL — the gate discriminates.');
    console.log('  The store used by this run remains at ' + storeRoot);
    console.log(line('#'));
    process.exit(0);
  }
  console.log('  ADMISSION REFUSED:');
  for (const f of failures) console.log('    - ' + f);
  console.log(line('#'));
  process.exit(1);
}

main().catch((err) => {
  console.error('\ne2e faulted: ' + (err && err.stack ? err.stack : String(err)));
  process.exit(1);
});
