#!/usr/bin/env node
// authority=false · claim=NO_CLAIM · non-sovereign
//
// HELEN DEPLOY 0.1 — capsule: warren-selftest
//
// The first real capability put behind the gate. It runs the Goblin Warren
// canon selftest against HASH-PINNED COPIES of index.html and selftest.js that
// the runtime provisioned into this workdir. It never touches the repository:
// its cwd is a temp directory whose entire contents are the declared context.
//
// Contract with the runtime:
//   in   — the context packet as JSON on stdin
//   in   — cwd contains exactly the declared, hash-verified context files
//   out  — .helen/result.json  { used_capabilities: [...], outputs: [...] }
//   exit — 0 when the capsule ran; non-zero only for capsule fault (→ FAILED).
//
// Note the separation of concerns that makes the state machine mean something:
// a selftest that REPORTS FAILURES is not a capsule fault. The capsule's job is
// to observe and report honestly. Whether "35 passed, 0 failed" is acceptable
// is a POSTCONDITION, judged by the evaluator against what the packet declared.
//
// Determinism: the reported value carries no clock, no path, no process id, no
// duration. Two executions of the same canon produce byte-identical output, and
// that is exactly what CONDITION 5 (replay) checks.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const USED_CAPABILITIES = ['fs:read:workdir', 'fs:write:workdir', 'proc:spawn:node'];
const SUMMARY = /selftest:\s*(\d+)\s+passed,\s*(\d+)\s+failed/;

function fault(code, message) {
  process.stderr.write('capsule fault: ' + message + '\n');
  process.exit(code);
}

function writeResult(result) {
  const dir = path.join(process.cwd(), '.helen');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(result));
}

let packet;
try {
  packet = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch (err) {
  fault(2, 'the packet on stdin was unreadable: ' + String(err && err.message));
}

// The capsule re-reads its own provisioning rather than trusting the label:
// the declared file list must actually be present in the workdir.
const declared = ((packet.context || {}).files || []).map((f) => String(f.path));
for (const rel of declared) {
  if (!fs.existsSync(path.join(process.cwd(), rel))) {
    fault(3, 'declared context file was not provisioned into the workdir: ' + rel);
  }
}
if (declared.indexOf('selftest.js') === -1 || declared.indexOf('index.html') === -1) {
  fault(3, 'this capsule requires index.html and selftest.js in the declared context');
}

const run = spawnSync(process.execPath, ['selftest.js', 'index.html'], {
  cwd: process.cwd(),
  env: { PATH: process.env.PATH || '/usr/bin:/bin' },
  encoding: 'utf8',
  timeout: 90000,
  maxBuffer: 8 * 1024 * 1024,
});

if (run.error) fault(4, 'the selftest could not be spawned: ' + String(run.error.message));

const transcript = String(run.stdout || '') + String(run.stderr || '');
const match = transcript.match(SUMMARY);
if (!match) {
  fault(5, 'the selftest printed no parseable summary line; nothing can be reported honestly');
}

const passed = parseInt(match[1], 10);
const failed = parseInt(match[2], 10);

// Assertion lines are counted, not quoted in full: the output must stay small
// and stable enough to hash.
const assertionLines = transcript.split('\n').filter((l) => l.indexOf('[ok]') !== -1 || l.indexOf('[FAIL]') !== -1);
const failures = transcript
  .split('\n')
  .filter((l) => l.indexOf('[FAIL]') !== -1)
  .map((l) => l.trim())
  .slice(0, 20);

writeResult({
  used_capabilities: USED_CAPABILITIES,
  outputs: [
    {
      name: 'output.json',
      content_type: 'json',
      data: {
        capsule: 'warren-selftest',
        command: 'node selftest.js index.html',
        passed: passed,
        failed: failed,
        assertion_lines: assertionLines.length,
        selftest_exit_code: run.status === null ? -1 : run.status,
        summary_line: match[0],
        failures: failures,
        context_files: declared.slice().sort(),
      },
    },
    {
      name: 'transcript.txt',
      content_type: 'text',
      data: transcript,
    },
  ],
});

process.exit(0);
