// authority=false · claim=NO_CLAIM · non-sovereign
//
// HELEN DEPLOY 0.1 — store.js
// Content-addressed artifact store + append-only receipt ledger + the monotonic
// counter that supplies run identity and transition ordering.
//
// Nothing in this file reads a clock in order to decide anything. Wall-clock
// strings are written into receipts as observational fields only; ordering and
// identity come from the persisted counter.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const LAW =
  'No agent endpoint returns a finished-and-trust-me verdict. An execution may return CERTIFIED only when: ' +
  'declared context matches actual context · permissions were respected · outputs were stored · ' +
  'postconditions were evaluated · the complete receipt is replayable.';

const STATES = Object.freeze(['QUEUED', 'RUNNING', 'PARTIAL', 'INVALID', 'CERTIFIED', 'FAILED']);
const TERMINAL_STATES = Object.freeze(['PARTIAL', 'INVALID', 'CERTIFIED', 'FAILED']);

function isState(s) {
  return STATES.indexOf(s) !== -1;
}
function isTerminal(s) {
  return TERMINAL_STATES.indexOf(s) !== -1;
}

// ---------------------------------------------------------------------------
// canonical JSON: recursively key-sorted, no incidental whitespace.
// Two structurally equal values always serialise to identical bytes, so a hash
// over this is a hash over meaning, not over formatting.
// ---------------------------------------------------------------------------
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value === undefined ? null : value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function sha256File(absPath) {
  return sha256(fs.readFileSync(absPath));
}

class Store {
  constructor(root) {
    this.root = path.resolve(root);
    this.artifactDir = path.join(this.root, 'artifact_store');
    this.receiptsPath = path.join(this.root, 'receipts.jsonl');
    this.counterPath = path.join(this.root, 'counter');
    fs.mkdirSync(this.artifactDir, { recursive: true });
    if (!fs.existsSync(this.receiptsPath)) fs.writeFileSync(this.receiptsPath, '');
    if (!fs.existsSync(this.counterPath)) fs.writeFileSync(this.counterPath, '0');
  }

  // Monotonic, persisted, never derived from a clock. Supplies both the run_id
  // nonce and the ordering stamp on every state transition.
  tick() {
    const current = parseInt(fs.readFileSync(this.counterPath, 'utf8').trim() || '0', 10);
    const next = current + 1;
    fs.writeFileSync(this.counterPath, String(next));
    return next;
  }

  // run_id = sha256(canonical packet JSON + ':' + monotonic counter)
  mintRunId(packet, counter) {
    return sha256(canonical(packet) + ':' + String(counter));
  }

  putBytes(buf) {
    const digest = sha256(buf);
    const dest = path.join(this.artifactDir, digest);
    if (!fs.existsSync(dest)) {
      const tmp = dest + '.part-' + this.tick();
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, dest);
    }
    return { sha256: digest, bytes: buf.length, stored_at: path.join('artifact_store', digest) };
  }

  getBytes(digest) {
    const p = path.join(this.artifactDir, digest);
    return fs.existsSync(p) ? fs.readFileSync(p) : null;
  }

  // Append-only. A receipt snapshot is appended on every transition; the file
  // is a ledger of how a run's claim evolved, not a mutable record of its end.
  appendReceipt(receipt) {
    fs.appendFileSync(this.receiptsPath, JSON.stringify(receipt) + '\n');
  }

  readReceipts() {
    const raw = fs.readFileSync(this.receiptsPath, 'utf8');
    const out = [];
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      try {
        out.push(JSON.parse(t));
      } catch (err) {
        // A malformed ledger line is reported, never silently repaired.
        out.push({ ledger_line_unreadable: true, detail: String(err && err.message) });
      }
    }
    return out;
  }
}

module.exports = { Store, canonical, sha256, sha256File, LAW, STATES, TERMINAL_STATES, isState, isTerminal };
