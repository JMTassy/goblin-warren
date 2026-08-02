/*
 * derive-sovereign-writer.js — the DERIVE+KILL spine (goblin-swarm keystone).
 * authority=false · canon=false · ledger_effect=none · non-sovereign
 *
 * WHAT THIS IS. The whole lineage's central governance claim —
 *   "world state changes only through exactly one sealed writer" —
 * is, in the V0 canon, proven only BEHAVIOURALLY (selftest.js:61 asserts
 * that admitting a proposal raises a territory level) and asserted in
 * PROSE (CLAUDE.md). Nothing in the suite would catch a SECOND caller of
 * evolveTerritory being spliced into the reducer zone. That is the wall the
 * 42-goblin swarm found behind the doctrine.
 *
 * This tool closes the gap WITHOUT touching canon. It reads the real
 * index.html, extracts the pure reducer zone with the exact regex the
 * selftest uses, and for a DECLARED manifest of world-mutating verbs
 * (LAW_TABLE) it STATICALLY DERIVES the sole-caller invariant: each verb
 * must have exactly one call site in the reducer zone, and that call site
 * must lie inside the body of its declared sealed gate. A KILL test then
 * splices a synthetic second caller and asserts the derivation flips to
 * DENY — proving the check is a real falsifier, not a tautology.
 *
 * It mutates nothing: it only reads canon and emits a verdict + receipt.
 * The stronger form (relocating LAW_TABLE INTO index.html as the single
 * source of the manifest, and an adoptLawTable sealed writer over the law
 * itself) touches canon / breaks vault byte-identity and is HELD FOR THE
 * OPERATOR — see LAW_TABLE_PROPOSAL.md.
 *
 * Run: node experiments/law-derive/derive-sovereign-writer.js [path/to/index.html]
 *   exit 0 iff every declared invariant DERIVES green AND every KILL denies.
 */
'use strict';

const fs = require('fs');
const path = require('path');

/* ---------- FNV-1a h32 (same family as the game/loom digests) ---------- */
function h32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

/* ---------- the manifest (declared, not discovered) ----------
 * One row per canonical world-mutating verb. This is the thing the
 * operator-sealed version would move INTO the reducer zone. Here it is
 * declared beside the deriver and checked against the code's real shape. */
const LAW_TABLE = [
  { verb: 'evolveTerritory', sealedGate: 'admitProposal', mutatesWorld: true,
    receiptKind: 'TERRITORY_BOUGHT/PROPOSAL_ADMITTED', rung: 'authority',
    lesson: 'Only player admission mutates the world; HAL judges, council recommends, neither writes.' },
];

/* ---------- the exact reducer-zone extraction the selftest performs ---------- */
function extractReducerZone(html) {
  const m = html.match(/\/\* ===== REDUCER-BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END/);
  if (!m) throw new Error('E_NO_REDUCER_ZONE: markers not found (do not rename REDUCER-BEGIN/END)');
  return m[1];
}

/* ---------- source-aware scanning: skip strings + comments ----------
 * A pragmatic scanner good enough for this controlled reducer text: it
 * walks the source once, tracking whether we are inside a '..' "..' `..`
 * string or a // or /* *\/ comment, and yields only "code" offsets. */
function codeMask(src) {
  const mask = new Uint8Array(src.length); // 1 = code, 0 = string/comment
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++;
      while (i < n) { if (src[i] === '\\') { i += 2; continue; } if (src[i] === q) { i++; break; } i++; }
      continue;
    }
    mask[i] = 1; i++;
  }
  return mask;
}

// Is the code-slice starting at `off` the literal token `tok` in code (not string/comment)?
function codeTokenAt(src, mask, off, tok) {
  if (src.substr(off, tok.length) !== tok) return false;
  for (let k = 0; k < tok.length; k++) if (!mask[off + k]) return false;
  return true;
}

/* find [openBrace, closeBrace] span of `function NAME(` in code */
function functionSpan(src, mask, name) {
  const needle = 'function ' + name + '(';
  let start = -1;
  for (let i = 0; i + needle.length <= src.length; i++) {
    if (codeTokenAt(src, mask, i, needle)) { start = i; break; }
  }
  if (start === -1) return null;
  // find first '{' in code after the param list
  let j = start + needle.length, depthParen = 1;
  while (j < src.length && depthParen > 0) { if (mask[j]) { if (src[j] === '(') depthParen++; else if (src[j] === ')') depthParen--; } j++; }
  while (j < src.length && !(mask[j] && src[j] === '{')) j++;
  const open = j;
  let depth = 0;
  for (; j < src.length; j++) {
    if (!mask[j]) continue;
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) return [open, j]; }
  }
  return null;
}

/* all code call-sites `verb(` that are NOT the definition `function verb(` */
function callSites(src, mask, verb) {
  const sites = [];
  const call = verb + '(';
  for (let i = 0; i + call.length <= src.length; i++) {
    if (!codeTokenAt(src, mask, i, call)) continue;
    // reject the definition: preceded by "function "
    const before = src.slice(Math.max(0, i - 9), i);
    if (/function\s$/.test(before)) continue;
    // reject identifier chars immediately before (e.g. someEvolveTerritory()
    if (i > 0 && /[A-Za-z0-9_$]/.test(src[i - 1])) continue;
    sites.push(i);
  }
  return sites;
}

/* ---------- the derivation: verdict for one manifest row ---------- */
function deriveRow(reducer, mask, row) {
  const sites = callSites(reducer, mask, row.verb);
  const gate = functionSpan(reducer, mask, row.sealedGate);
  if (!gate) return { verb: row.verb, verdict: 'DENY', reason: 'sealed gate ' + row.sealedGate + ' not found in reducer zone' };
  if (sites.length !== 1) return { verb: row.verb, verdict: 'DENY', reason: 'expected exactly 1 call site, found ' + sites.length + ' at ' + JSON.stringify(sites) };
  const off = sites[0];
  const inside = off > gate[0] && off < gate[1];
  if (!inside) return { verb: row.verb, verdict: 'DENY', reason: 'sole call site is OUTSIDE ' + row.sealedGate + ' body' };
  return { verb: row.verb, verdict: 'ACCEPTABLE', reason: 'sole caller is ' + row.sealedGate + ' (offset ' + off + ' within [' + gate[0] + ',' + gate[1] + '])' };
}

function deriveAll(reducer) {
  const mask = codeMask(reducer);
  return LAW_TABLE.map(row => deriveRow(reducer, mask, row));
}

/* ---------- run ---------- */
function main() {
  const target = process.argv[2] || path.join(__dirname, '..', '..', 'index.html');
  const html = fs.readFileSync(target, 'utf8');
  const reducer = extractReducerZone(html);

  const results = [];
  function T(name, ok, detail) { results.push({ name, ok: !!ok, detail: detail || '' }); }

  // 1. DERIVE — every manifest row must be ACCEPTABLE on the real canon.
  const derived = deriveAll(reducer);
  for (const d of derived) {
    T('DERIVE ' + d.verb + ' sole-caller=' + LAW_TABLE.find(r => r.verb === d.verb).sealedGate,
      d.verdict === 'ACCEPTABLE', d.reason);
  }

  // 2. KILL(a): a second caller spliced into a DIFFERENT reducer function must DENY.
  //    We inject the call inside checkWin's body (a real reducer fn), never touching canon on disk.
  const maskReal = codeMask(reducer);
  const cw = functionSpan(reducer, maskReal, 'checkWin');
  let killA = { verdict: 'N/A', reason: 'checkWin not found' };
  if (cw) {
    const injected = reducer.slice(0, cw[0] + 1) + '\n evolveTerritory(S,0);\n' + reducer.slice(cw[0] + 1);
    killA = deriveRow(injected, codeMask(injected), LAW_TABLE[0]);
  }
  T('KILL(a) second caller in checkWin → DENY', killA.verdict === 'DENY', killA.reason);

  // 3. KILL(b): a relabeled sealedGate (claim a different gate) must DENY —
  //    the scan checks the manifest's claim against the code's ACTUAL sole caller.
  const relabeled = { ...LAW_TABLE[0], sealedGate: 'checkWin' };
  const killB = deriveRow(reducer, maskReal, relabeled);
  T('KILL(b) manifest lies about the gate (checkWin) → DENY', killB.verdict === 'DENY', killB.reason);

  // 4. KILL(c): dropping the world-mutator row cannot vacuously pass —
  //    an empty manifest with a live evolveTerritory in canon is a floor breach.
  const liveMutatorPresent = callSites(reducer, maskReal, 'evolveTerritory').length >= 1;
  const emptyManifestWouldMissIt = liveMutatorPresent && LAW_TABLE.length === 0;
  T('KILL(c) structural floor: a live world-mutator must be declared', !emptyManifestWouldMissIt && liveMutatorPresent,
    'evolveTerritory present in canon and declared in LAW_TABLE');

  const passed = results.filter(r => r.ok).length;
  const failed = results.length - passed;
  for (const r of results) console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + (r.detail ? '  — ' + r.detail : ''));

  const receipt = {
    receipt: 'SOVEREIGN_WRITER_DERIVED_V1',
    target: path.relative(path.join(__dirname, '..', '..'), target),
    law_table_digest: 'demo-fnv1a:' + h32(JSON.stringify(LAW_TABLE)).toString(16).padStart(8, '0'),
    reducer_digest: 'demo-fnv1a:' + h32(reducer).toString(16).padStart(8, '0'),
    derived: derived.map(d => d.verb + ':' + d.verdict),
    passed, failed, total: results.length,
    authority: false, canon: false, ledger_effect: 'none', claim: 'NO_CLAIM', non_sovereign: true,
    note: 'demo FNV-1a identity digest — NOT cryptographic; reads canon, mutates nothing',
  };
  console.log('RECEIPT ' + JSON.stringify(receipt));
  if (failed > 0) process.exit(1);
}

if (require.main === module) main();
module.exports = { extractReducerZone, deriveAll, deriveRow, callSites, functionSpan, codeMask, LAW_TABLE, h32 };
