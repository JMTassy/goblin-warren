#!/usr/bin/env node
/*
 * policy-loom.test.js — POLICY_LOOM_WEDGE_V0 witness suite
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Run: node experiments/policy-loom/policy-loom.test.js  (exit 1 on any failure)
 * Zero dependencies. UI-level kill-tests are STATIC SCANS of index.html
 * (honest tier: UI-SCAN), kernel tests execute real code (tier: KERNEL).
 */
'use strict';
const path = require('path');
const fs = require('fs');
const L = require(path.join(__dirname, 'policy-loom.js'));
const F = require(path.join(__dirname, 'fixtures.js'));

let passed = 0, failed = 0;
function ok(cond, name) {
  if (cond) { passed++; console.log('  [ok] ' + name); }
  else { failed++; console.log('  [FAIL] ' + name); }
}
function deepFreeze(o) {
  if (o && typeof o === 'object') { Object.freeze(o); Object.values(o).forEach(deepFreeze); }
  return o;
}
function runToAwaiting(cases) {
  let s = L.createLoom();
  s = L.step(s, { type: 'LOAD_CASES', cases });
  s = L.step(s, { type: 'INDUCE' });
  s = L.step(s, { type: 'BIND_EVIDENCE' });
  s = L.step(s, { type: 'SIMULATE' });
  s = L.step(s, { type: 'PRESENT' });
  return s;
}
function boundOf(s) {
  return {
    casesDigest: s.casesDigest,
    candidateDigest: s.candidate.candidateDigest,
    evidenceDigest: s.evidence.evidenceDigest,
    branchesDigest: s.branchesDigest,
    priorActiveDigest: s.activePolicyDigest,
  };
}
const HTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

/* ================= UNIT ================= */
console.log('\n-- unit --');
ok(L.digest({ a: 1, b: 2 }) === L.digest({ b: 2, a: 1 }), 'digest: key order never changes a digest');
ok(L.digest({ a: 1 }).startsWith('demo-fnv1a:'), 'digest: demo-fnv1a: prefix');
ok(L.DIGEST_CLASS === 'DEMO_DIGEST', 'digest: classed DEMO_DIGEST');
let threw = false; try { L.canonicalize({ a: NaN }); } catch (e) { threw = /E_NONCANONICAL/.test(e.message); }
ok(threw, 'canonicalize: rejects non-finite numbers (fail closed)');
threw = false; try { L.canonicalize({ a: undefined }); } catch (e) { threw = /E_NONCANONICAL/.test(e.message); }
ok(threw, 'canonicalize: rejects undefined');
threw = false; try { const c = {}; c.self = c; L.canonicalize(c); } catch (e) { threw = /cycle/.test(e.message); }
ok(threw, 'canonicalize: rejects cycles');
threw = false; try { L.canonicalize({ timestamp: 'now' }); } catch (e) { threw = /forbidden key/.test(e.message); }
ok(threw, 'canonicalize: timestamps never enter canonical payloads');
threw = false; try { L.canonicalize({ hover: true }); } catch (e) { threw = /forbidden key/.test(e.message); }
ok(threw, 'canonicalize: UI state never enters canonical payloads (firewall)');

const v1 = L.validateCases(F.F01_CLEAR_SUPPORT);
ok(v1.ok && v1.cases.length === 5, 'validateCases: accepts clear fixture');
const cand1 = L.induce(v1.cases);
ok(cand1.status === 'CANDIDATE' && cand1.rule.when.attr === 'wood' && cand1.rule.when.equals === 'wet' && cand1.rule.then === 'wait',
  'induce: derives wet->wait from F01 (support 4)');
ok(cand1.support === 4 && cand1.violations === 0, 'induce: correct support/violation counts');
const insuff = L.induce(L.validateCases(F.F03_INSUFFICIENT).cases);
ok(insuff.kind === 'INSUFFICIENT_EVIDENCE', 'induce: F03 -> explicit INSUFFICIENT_EVIDENCE (never a covert candidate)');
const contra = L.induce(L.validateCases(F.F04_CONTRADICTORY).cases);
ok(contra.kind === 'INSUFFICIENT_EVIDENCE', 'induce: F04 contradictory 3v3 -> INSUFFICIENT_EVIDENCE (support must EXCEED violations)');

const v2 = L.validateCases(F.F02_SUPPORT_PLUS_COUNTEREXAMPLE);
const cand2 = L.induce(v2.cases);
const cx2 = L.selectCounterexample(cand2, v2.cases);
ok(cx2.kind === 'COUNTEREXAMPLE' && cx2.case.caseId === 'c05', 'counterexample: F02 finds c05');
const cx1 = L.selectCounterexample(cand1, v1.cases);
ok(cx1.kind === 'NO_COUNTEREXAMPLE_FOUND' && /not proof/.test(cx1.law),
  'counterexample: explicit absence sentinel — absence != proof');

const sim = L.simulatePolicyBranches(null, cand2, cx2, v2.cases);
ok(sim.branches.length === 3 &&
   sim.branches.map(b => b.scenario).join(',') === 'CURRENT_POLICY,PROPOSED_POLICY,PROPOSED_POLICY_WITH_EXCEPTION',
  'simulate: exactly the three required branches');

/* ================= INVARIANT ================= */
console.log('\n-- invariant --');
let s = runToAwaiting(F.F02_SUPPORT_PLUS_COUNTEREXAMPLE);
ok(s.machineState === 'AWAITING_DECISION' && s.activePolicy === null && s.version === 1,
  'POLICY_CANDIDATE_NEVER_ACTIVE_BY_DEFAULT: full chain to AWAITING leaves activePolicy null, version 1');
const before = L.digest({ a: s.activePolicyDigest, v: s.version, c: s.casesDigest });
const sim2 = L.simulatePolicyBranches(s.activePolicy, s.candidate, s.counterexample, deepFreeze(JSON.parse(JSON.stringify(s.cases))));
const after = L.digest({ a: s.activePolicyDigest, v: s.version, c: s.casesDigest });
ok(before === after && sim2.branches.every(b => b.canonicalWriteCount === 0),
  'SIMULATION_CANONICAL_WRITES_EQUAL_ZERO: sim over frozen input, state digest unchanged');

const adopt = L.step(s, { type: 'OPERATOR_DECIDE', decision: F.decision('ADOPT', boundOf(s)) });
ok(adopt.machineState === 'ADOPTED' && adopt.version === 2 && adopt.activePolicy.then === 'wait',
  'OPERATOR_RECEIPT_REQUIRED: valid digest-bound ADOPT activates, v1 -> v2');
ok(adopt.lastReceipt.activation === 'ACTIVATED' && adopt.lastReceipt.policyVersionAfter === 'v2',
  'receipt: activation receipt binds versions before/after');
let s3 = L.step(adopt, { type: 'LOAD_CASES', cases: F.F02_SUPPORT_PLUS_COUNTEREXAMPLE });
s3 = L.step(s3, { type: 'INDUCE' }); s3 = L.step(s3, { type: 'BIND_EVIDENCE' });
s3 = L.step(s3, { type: 'SIMULATE' }); s3 = L.step(s3, { type: 'PRESENT' });
const adopt2 = L.step(s3, { type: 'OPERATOR_DECIDE', decision: F.decision('ADOPT', boundOf(s3)) });
ok(adopt2.version === 3, 'ACTIVE_POLICY_VERSION_MONOTONIC: second adoption -> v3, never backwards');

const rej = L.step(s, { type: 'OPERATOR_DECIDE', decision: F.decision('REJECT', boundOf(s)) });
ok(rej.machineState === 'REJECTED' && rej.activePolicy === null && rej.version === 1,
  'REJECT_AND_HOLD_DO_NOT_ACTIVATE: reject leaves policy null');
const held = L.step(s, { type: 'OPERATOR_DECIDE', decision: F.decision('HOLD', boundOf(s)) });
ok(held.machineState === 'HELD' && held.activePolicy === null,
  'REJECT_AND_HOLD_DO_NOT_ACTIVATE: hold leaves policy null');
const amend = L.step(s, { type: 'OPERATOR_DECIDE', decision: F.decision('AMEND', boundOf(s), F.F11_AMENDED_RULE) });
ok(amend.machineState === 'AMENDED' && amend.activePolicy === null &&
   amend.candidate.candidateDigest !== s.candidate.candidateDigest && amend.branches === null,
  'AMENDMENT_CREATES_NEW_CANDIDATE_DIGEST: amend mints new digest, clears sim, activates nothing');

/* ================= REPLAY ================= */
console.log('\n-- replay --');
const rA = runToAwaiting(F.F02_SUPPORT_PLUS_COUNTEREXAMPLE);
const rB = runToAwaiting(F.F02_SUPPORT_PLUS_COUNTEREXAMPLE);
ok(rA.candidate.candidateDigest === rB.candidate.candidateDigest &&
   rA.evidence.evidenceDigest === rB.evidence.evidenceDigest &&
   rA.branchesDigest === rB.branchesDigest,
  'replay: same cases -> byte-identical candidate/evidence/branch digests');
const dA = L.step(rA, { type: 'OPERATOR_DECIDE', decision: F.decision('ADOPT', boundOf(rA)) });
const dB = L.step(rB, { type: 'OPERATOR_DECIDE', decision: F.decision('ADOPT', boundOf(rB)) });
ok(dA.lastReceipt.receiptDigest === dB.lastReceipt.receiptDigest,
  'replay: identical operator action -> identical receipt digest (no timestamps in payload)');

/* ================= MALFORMED ================= */
console.log('\n-- malformed --');
const dup = L.validateCases([
  { caseId: 'x', context: { wood: 'wet' }, chosenAction: 'wait' },
  { caseId: 'x', context: { wood: 'dry' }, chosenAction: 'wait' },
]);
ok(!dup.ok && dup.errors.some(e => /E_CONFLICT/.test(e)),
  'duplicate caseId with DIFFERENT content -> E_CONFLICT (never silently skipped)');
const dupSame = L.validateCases([
  { caseId: 'x', context: { wood: 'wet' }, chosenAction: 'wait' },
  { caseId: 'x', context: { wood: 'wet' }, chosenAction: 'wait' },
  { caseId: 'y', context: { wood: 'wet' }, chosenAction: 'wait' },
]);
ok(dupSame.ok && dupSame.cases.length === 2,
  'duplicate caseId with SAME content -> idempotent retransmission, accepted once');
ok(!L.validateCases([]).ok, 'empty cases rejected');
ok(!L.validateCases([{ caseId: 'z', context: { n: 4 }, chosenAction: 'wait' }]).ok,
  'non-string context attr rejected');
const badKind = L.validateOperatorDecision(s, { kind: 'FORCE', boundDigests: boundOf(s) });
ok(!badKind.ok, 'unknown decision kind rejected');
const noDigests = L.validateOperatorDecision(s, { kind: 'ADOPT' });
ok(!noDigests.ok && noDigests.errors.some(e => /boundDigests missing/.test(e)),
  'decision with missing digests rejected');
const badEvent = L.step(s, { type: 'SELF_CROWN' });
ok(badEvent.machineState === s.machineState &&
   badEvent.history.some(h => h.kind === 'E_TRANSITION'),
  'unknown event -> state unchanged + explicit error entry');

/* ================= FIREWALL ================= */
console.log('\n-- semantic firewall --');
const fromNoCases = L.step(L.createLoom(), { type: 'INDUCE' });
ok(fromNoCases.machineState === 'NO_CASES' && fromNoCases.history.some(h => h.kind === 'E_TRANSITION'),
  'disallowed transition (INDUCE from NO_CASES) rejected, no implicit transition');
const stale1 = L.step(s, { type: 'MUTATE_CASES', cases: F.F05_MUTATED_CASES });
ok(stale1.machineState === 'STALE', 'digest-changing input pre-decision -> STALE');
const staleAdopt = L.step(stale1, { type: 'OPERATOR_DECIDE', decision: F.decision('ADOPT', boundOf(s)) });
ok(staleAdopt.machineState === 'STALE' && staleAdopt.activePolicy === null,
  'a STALE candidate cannot be adopted');
const applic = L.checkReceiptApplicability(stale1, { boundDigests: boundOf(s) });
ok(!applic.applicable && applic.mismatches.length > 0,
  'checkReceiptApplicability: prior binding no longer applies after mutation');

/* ================= KILL-TESTS ================= */
console.log('\n-- kill-tests --');
// KILL-01 [KERNEL] — no path activates without explicit operator ADOPT
let k1 = runToAwaiting(F.F02_SUPPORT_PLUS_COUNTEREXAMPLE);
for (const t of ['LOAD_CASES', 'INDUCE', 'BIND_EVIDENCE', 'SIMULATE', 'PRESENT', 'MUTATE_CASES']) {
  k1 = L.step(k1, { type: t, cases: F.F02_SUPPORT_PLUS_COUNTEREXAMPLE });
}
ok(k1.activePolicy === null && k1.version === 1,
  'KILL-01 [KERNEL]: nothing but explicit ADOPT ever activates');
// KILL-02 [KERNEL] — covered structurally above; assert again on fresh flow
const k2 = runToAwaiting(F.F01_CLEAR_SUPPORT);
ok(k2.branches.every(b => b.canonicalWriteCount === 0),
  'KILL-02 [KERNEL]: all simulation branches carry canonicalWriteCount 0');
// KILL-03 [KERNEL] — a receipt bound to OLD digests, replayed after the world
// changed and a NEW valid candidate reached AWAITING, must be refused.
const staleF01 = L.step(s, { type: 'MUTATE_CASES', cases: F.F01_CLEAR_SUPPORT });
let reuse = L.step(staleF01, { type: 'INDUCE' });
reuse = L.step(L.step(L.step(reuse, { type: 'BIND_EVIDENCE' }), { type: 'SIMULATE' }), { type: 'PRESENT' });
const oldReceiptAttempt = L.step(reuse, { type: 'OPERATOR_DECIDE', decision: F.decision('ADOPT', boundOf(s)) });
ok(reuse.machineState === 'AWAITING_DECISION' &&
   oldReceiptAttempt.machineState === 'AWAITING_DECISION' &&
   oldReceiptAttempt.activePolicy === null &&
   oldReceiptAttempt.history.some(h => h.kind === 'DECISION_REFUSED' && /E_STALE/.test(h.detail)),
  'KILL-03 [KERNEL]: receipt bound to old digests refused against new evidence (E_STALE, no activation)');
// KILL-04 [KERNEL] — counterexample never hidden
ok(cand2.counterexampleCaseIds.length === 1 &&
   L.buildEvidenceBundle(cand2, v2.cases).counterexampleCaseIds.length === 1,
  'KILL-04 [KERNEL]: counterexample ids present in candidate AND evidence bundle');
ok(/sec-counterexample/.test(HTML), 'KILL-04 [UI-SCAN]: counterexample section exists in the page');
// KILL-05 [KERNEL] — candidate never presented as truth
ok(cand2.status === 'CANDIDATE' && runToAwaiting(F.F02_SUPPORT_PLUS_COUNTEREXAMPLE).activePolicy === null,
  'KILL-05 [KERNEL]: candidate is CANDIDATE; active policy stays null until adoption');
// KILL-06 [UI-SCAN] — no animation-completion handler can touch authority
ok(!/animationend|transitionend/.test(HTML),
  'KILL-06 [UI-SCAN]: no animationend/transitionend handlers in the wedge page');
// KILL-07 [KERNEL + UI-SCAN] — checkbox alone is never permission
ok(/id="btnAdopt"/.test(HTML) && !/type="checkbox"[^>]*onchange/i.test(HTML),
  'KILL-07 [UI-SCAN]: ADOPT is a distinct button; no checkbox wired to state change');
ok(!L.validateOperatorDecision(s, { kind: 'ADOPT', boundDigests: {} }).ok,
  'KILL-07 [KERNEL]: a bare toggle cannot construct a valid digest-bound decision');
// KILL-08 [KERNEL] — score cannot activate
const bestBranch = sim.branches.slice().sort((a, b) => (b.outcomes.good_fire || 0) - (a.outcomes.good_fire || 0))[0];
ok(bestBranch && s.activePolicy === null,
  'KILL-08 [KERNEL]: computing/ranking branch scores changes nothing canonical');
// KILL-09 [KERNEL] — non-operator cannot reach the sovereign writer
const forged = L.activate(s, { seal: Symbol('OPERATOR_SEAL'), decision: F.decision('ADOPT', boundOf(s)) });
ok(!forged.ok && /E_AUTHORITY/.test(forged.error),
  'KILL-09 [KERNEL]: forged seal refused by activate()');
const forged2 = L.activate(s, F.F06_FORGED_DECISION);
ok(!forged2.ok, 'KILL-09 [KERNEL]: raw forged decision refused by activate()');
// KILL-10 [UI-SCAN] — reduced motion keeps the whole causal chain
ok(F.F12_UI_REQUIRED_SECTION_IDS.every(id => HTML.includes('id="' + id + '"')),
  'KILL-10 [UI-SCAN]: all causal-chain sections exist unconditionally in the page');
const rmBlock = (HTML.match(/prefers-reduced-motion[^}]*\{([\s\S]*?)\n\s*\}/) || [,''])[1];
ok(!/display\s*:\s*none/.test(rmBlock),
  'KILL-10 [UI-SCAN]: reduced-motion CSS hides no content');
// KILL-11 [KERNEL] — rejected/held proposals never vanish
let k11 = L.step(s, { type: 'OPERATOR_DECIDE', decision: F.decision('REJECT', boundOf(s)) });
k11 = L.step(k11, { type: 'LOAD_CASES', cases: F.F01_CLEAR_SUPPORT });
ok(k11.history.some(h => h.kind === 'REJECTED'),
  'KILL-11 [KERNEL]: REJECTED entry survives subsequent cycles (append-only ledger)');
// KILL-12 [KERNEL + UI-SCAN] — lightweight hash never overclaimed
ok(L.digest({ x: 1 }).startsWith('demo-fnv1a:') && /NOT a cryptographic/.test(adopt.lastReceipt.digestNote),
  'KILL-12 [KERNEL]: digests self-describe as demo FNV-1a, not cryptographic');
ok(!/sha-?256/i.test(HTML),
  'KILL-12 [UI-SCAN]: the wedge page never labels anything sha256 (repairs the reference Codex flaw)');

/* ================= purity of step() ================= */
console.log('\n-- purity --');
const frozen = deepFreeze(runToAwaiting(F.F01_CLEAR_SUPPORT));
let pureOk = true;
try { L.step(frozen, { type: 'OPERATOR_DECIDE', decision: F.decision('HOLD', boundOf(frozen)) }); }
catch (e) { pureOk = false; }
ok(pureOk, 'step(): never mutates its input loom (deep-frozen input, no throw)');

console.log('\npolicy-loom: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
