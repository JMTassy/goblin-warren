// authority=false · claim=NO_CLAIM · non-sovereign
//
// HELEN DEPLOY 0.1 — capsule.js
// Provisioning + subprocess execution.
//
// What a capsule run is, precisely:
//   1. a fresh temp workdir is created, empty;
//   2. every file the packet DECLARED is read from the context root, hashed,
//      and compared to the declared digest — a single mismatch aborts the run
//      before any code executes;
//   3. only those verified files are copied into the workdir; nothing else is;
//   4. the capsule is spawned as a child process with cwd = that workdir and a
//      SANITIZED environment containing PATH and nothing else;
//   5. the packet JSON is written to the child's stdin;
//   6. the child writes its result to .helen/result.json inside the workdir;
//   7. the workdir is removed. Only hashed outputs survive.
//
// HONEST CAVEAT (repeated in README.md): this is process isolation plus
// declared-context-only provisioning. It is NOT a security boundary. The child
// runs as the same user with the same filesystem and network reachability. A
// hostile capsule can read outside its workdir and can open sockets regardless
// of what capabilities were granted. In 0.1 the capability system is a
// DECLARATION checked at two seams (required-vs-granted before execution,
// self-reported-used-vs-granted after), not a kernel-enforced sandbox.

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { sha256, canonical } = require('./store');

const CAPABILITY_UNIVERSE = Object.freeze([
  'fs:read:workdir',
  'fs:write:workdir',
  'proc:spawn:node',
  'net:outbound',
]);

// A packet names a capsule. It cannot name a command. There is no endpoint in
// this runtime that executes submitter-supplied code.
const CAPSULE_REGISTRY = Object.freeze({
  'warren-selftest': {
    file: 'warren-selftest.cjs',
    requires: Object.freeze(['fs:read:workdir', 'fs:write:workdir', 'proc:spawn:node']),
    timeout_ms: 120000,
    description: 'Runs the Goblin Warren canon selftest against hash-pinned copies of index.html and selftest.js.',
  },
});

const CAPSULE_DIR = path.resolve(__dirname, '..', 'capsules');
const RESULT_RELATIVE = path.join('.helen', 'result.json');

function listCapsules() {
  return Object.keys(CAPSULE_REGISTRY);
}

// Refuse absolute paths and any '..' escape. A declared context path is a leaf
// of the context root or it is nothing.
function safeRelative(p) {
  if (typeof p !== 'string' || p.length === 0) return null;
  if (path.isAbsolute(p)) return null;
  const normalised = path.normalize(p).split(path.sep).join('/');
  if (normalised === '..' || normalised.startsWith('../') || normalised.includes('/../')) return null;
  if (normalised.startsWith('/')) return null;
  return normalised;
}

// ---------------------------------------------------------------------------
// CONDITION 1 — declared context matches actual context.
// ---------------------------------------------------------------------------
function verifyContext(packet, contextRoot) {
  const rows = [];
  let verified = true;
  for (const decl of packet.context.files) {
    const rel = safeRelative(decl.path);
    const row = { path: String(decl.path), declared_sha256: decl.sha256, actual_sha256: null, match: false };
    if (rel === null) {
      row.detail = 'path refused: must be relative to the context root and free of ".." segments';
      verified = false;
      rows.push(row);
      continue;
    }
    const abs = path.join(path.resolve(contextRoot), rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      row.detail = 'declared context file is absent from the context root';
      verified = false;
      rows.push(row);
      continue;
    }
    row.actual_sha256 = sha256(fs.readFileSync(abs));
    row.match = row.actual_sha256 === decl.sha256;
    if (!row.match) row.detail = 'declared digest does not match the bytes on disk';
    if (!row.match) verified = false;
    rows.push(row);
  }
  return { verified, rows };
}

// ---------------------------------------------------------------------------
// CONDITION 2, first seam — required capabilities must have been granted.
// ---------------------------------------------------------------------------
function checkGrant(packet, capsuleDef) {
  const declared = Array.isArray(packet.capabilities) ? packet.capabilities.slice() : [];
  const violations = [];
  for (const cap of declared) {
    if (CAPABILITY_UNIVERSE.indexOf(cap) === -1) violations.push('unknown capability declared: ' + cap);
  }
  for (const cap of capsuleDef.requires) {
    if (declared.indexOf(cap) === -1) violations.push('capsule requires an ungranted capability: ' + cap);
  }
  return { declared, required: capsuleDef.requires.slice(), violations };
}

// CONDITION 2, second seam — self-reported use must sit inside the grant.
function checkUse(declared, used) {
  const violations = [];
  for (const cap of used) {
    if (declared.indexOf(cap) === -1) violations.push('capsule used an ungranted capability: ' + cap);
  }
  return violations;
}

function provision(packet, contextRoot, contextRows) {
  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'helen-capsule-'));
  for (const row of contextRows) {
    const rel = safeRelative(row.path);
    const src = path.join(path.resolve(contextRoot), rel);
    const dest = path.join(workdir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  fs.mkdirSync(path.join(workdir, '.helen'), { recursive: true });
  return workdir;
}

function removeWorkdir(workdir) {
  try {
    fs.rmSync(workdir, { recursive: true, force: true });
  } catch (err) {
    /* the workdir is a temp lease; a failed sweep is reported by the OS, not by law */
  }
}

function normaliseOutputs(rawOutputs) {
  const out = [];
  if (!Array.isArray(rawOutputs)) return { outputs: out, error: 'capsule result: "outputs" must be an array' };
  for (const o of rawOutputs) {
    if (!o || typeof o.name !== 'string' || o.name.length === 0) {
      return { outputs: [], error: 'capsule result: every output needs a name' };
    }
    const contentType = o.content_type === 'text' ? 'text' : 'json';
    let bytes;
    if (contentType === 'text') {
      if (typeof o.data !== 'string') return { outputs: [], error: 'capsule result: text output "' + o.name + '" needs string data' };
      bytes = Buffer.from(o.data, 'utf8');
    } else {
      // Canonical serialisation: the stored bytes depend on meaning, not on the
      // capsule's key ordering. This is what makes replay comparison honest.
      bytes = Buffer.from(canonical(o.data === undefined ? null : o.data), 'utf8');
    }
    out.push({ name: o.name, content_type: contentType, value: o.data, bytes, sha256: sha256(bytes) });
  }
  return { outputs: out, error: null };
}

// ---------------------------------------------------------------------------
// One attempt. Returns a structured result; it never throws for capsule fault.
// stage tells the evaluator which law was touched:
//   'context'      → CONDITION 1 refused, nothing executed
//   'capability'   → CONDITION 2 refused, nothing executed
//   'execute'      → the capsule itself faulted
//   'complete'     → outputs are in hand
// ---------------------------------------------------------------------------
function runAttempt(packet, options) {
  const contextRoot = options.contextRoot;
  const capsuleDef = CAPSULE_REGISTRY[packet.capsule];
  if (!capsuleDef) {
    return {
      stage: 'capability',
      ok: false,
      reason: 'unregistered capsule: ' + packet.capsule,
      context: { verified: false, rows: [] },
      capabilities: { declared: packet.capabilities || [], required: [], used: [], violations: ['unregistered capsule: ' + packet.capsule] },
      outputs: [],
    };
  }

  const grant = checkGrant(packet, capsuleDef);
  const ctx = verifyContext(packet, contextRoot);

  // Context is checked first and refused hardest: a run over unverified bytes
  // is not a run, it is a rumour.
  if (!ctx.verified) {
    return {
      stage: 'context',
      ok: false,
      reason: 'declared context does not match actual context',
      context: ctx,
      capabilities: { ...grant, used: [] },
      outputs: [],
    };
  }
  if (grant.violations.length > 0) {
    return {
      stage: 'capability',
      ok: false,
      reason: grant.violations[0],
      context: ctx,
      capabilities: { ...grant, used: [] },
      outputs: [],
    };
  }

  const workdir = provision(packet, contextRoot, ctx.rows);
  const capsulePath = path.join(CAPSULE_DIR, capsuleDef.file);
  let proc;
  try {
    proc = spawnSync(process.execPath, [capsulePath], {
      cwd: workdir,
      // SANITIZED ENV: PATH and nothing else. No inherited secrets, no HOME,
      // no proxy variables, no store root, no port.
      env: { PATH: process.env.PATH || '/usr/bin:/bin' },
      input: JSON.stringify(packet),
      encoding: 'utf8',
      timeout: capsuleDef.timeout_ms,
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch (err) {
    removeWorkdir(workdir);
    return {
      stage: 'execute',
      ok: false,
      reason: 'capsule could not be spawned: ' + String(err && err.message),
      context: ctx,
      capabilities: { ...grant, used: [] },
      outputs: [],
    };
  }

  const diagnostics = {
    exit_code: proc.status,
    signal: proc.signal || null,
    stdout_tail: String(proc.stdout || '').slice(-2000),
    stderr_tail: String(proc.stderr || '').slice(-2000),
  };

  const resultPath = path.join(workdir, RESULT_RELATIVE);
  let parsed = null;
  let parseError = null;
  if (fs.existsSync(resultPath)) {
    try {
      parsed = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
    } catch (err) {
      parseError = 'capsule result is not valid JSON: ' + String(err && err.message);
    }
  } else {
    parseError = 'capsule wrote no result at ' + RESULT_RELATIVE;
  }

  removeWorkdir(workdir);

  if (proc.status !== 0 || parsed === null) {
    return {
      stage: 'execute',
      ok: false,
      reason: parseError || 'capsule exited with status ' + String(proc.status) + (proc.signal ? ' (signal ' + proc.signal + ')' : ''),
      context: ctx,
      capabilities: { ...grant, used: [] },
      outputs: [],
      diagnostics,
    };
  }

  const used = Array.isArray(parsed.used_capabilities) ? parsed.used_capabilities.slice() : [];
  const useViolations = checkUse(grant.declared, used);
  if (useViolations.length > 0) {
    return {
      stage: 'capability',
      ok: false,
      reason: useViolations[0],
      context: ctx,
      capabilities: { ...grant, used, violations: grant.violations.concat(useViolations) },
      outputs: [],
      diagnostics,
    };
  }

  const norm = normaliseOutputs(parsed.outputs);
  if (norm.error) {
    return {
      stage: 'execute',
      ok: false,
      reason: norm.error,
      context: ctx,
      capabilities: { ...grant, used },
      outputs: [],
      diagnostics,
    };
  }

  return {
    stage: 'complete',
    ok: true,
    reason: 'capsule produced ' + norm.outputs.length + ' declared output(s)',
    context: ctx,
    capabilities: { ...grant, used },
    outputs: norm.outputs,
    diagnostics,
  };
}

// The fingerprint compared across the two executions. Names + digests only:
// wall clocks, paths and process ids are deliberately excluded, because a
// receipt that changes when nothing changed is not a receipt.
function outputFingerprint(outputs) {
  const rows = outputs
    .map((o) => ({ name: o.name, sha256: o.sha256 }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return sha256(canonical(rows));
}

module.exports = {
  CAPABILITY_UNIVERSE,
  CAPSULE_REGISTRY,
  listCapsules,
  runAttempt,
  outputFingerprint,
  verifyContext,
  safeRelative,
};
