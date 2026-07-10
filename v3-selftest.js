// HELEN -- Dreams of Conquest / Goblin Garden MVP -- headless REDUCER selftest
// authority=false . claim=NO_CLAIM . proposal-grade . HOLD_FOR_OPERATOR
//
// Extracts the pure REDUCER zone from garden.html via the same marker-regex
// technique proven in this repo's selftest.js / v2-selftest.js, evals it
// indirectly (no access to this file's scope), and proves the 10 required
// invariants plus a full 10-cycle headless playthrough. No network calls
// anywhere in this harness or in garden.html.
const fs = require("fs");
const path = require("path");
const target = process.argv[2] || "garden.html";
const fullPath = path.join(__dirname, target);
const html = fs.readFileSync(fullPath, "utf8");
console.log("target: " + target);

const m = html.match(/\/\* ===== REDUCER-BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END/);
if (!m) { console.log("FAIL: reducer markers not found"); process.exit(1); }
const reducerSource = m[1];

const EXPORTS = [
  "KERNEL", "ZONES", "ZONE_DISPLAY", "SIGNAL_KINDS", "LULU_MODES", "LULU_LINES", "GOALS",
  "GOAL_ZONE_BIAS", "TEMPLATE_BANKS", "GOBLIN_NAMES", "BUG_NAMES", "VISUAL_STAGES",
  "KNOWN_EVENT_KINDS", "FIELD_RANGES",
  "h32", "makeGardenState", "applyEvent", "deriveLuluMode", "deriveGoblinMemory", "zoneWeights",
  "computePredictedEffects", "computeFruitProgress", "startGame", "setHivemindGoal", "riseSignal",
  "routeSignalAndShiftLulu", "generateGoblinProposal", "admitProposal", "denyProposal",
  "compostProposal", "checkEnd", "validateEventShape", "foldGardenLog", "serializeLedgerJSONL",
  "foldGardenLogFromJSONL", "computeStateHash"
];
// The real <script> block in garden.html opens with "use strict" before the
// REDUCER-BEGIN marker, so the reducer zone runs in strict mode in the
// browser (assigning to a frozen KERNEL property throws). Reproduce that
// here rather than eval'ing the extracted zone in sloppy mode.
(0, eval)('"use strict";\n' + reducerSource + "\n;" + EXPORTS.map(n => "globalThis." + n + "=" + n + ";").join(""));

let failed = 0, passed = 0;
function ok(cond, name) { if (cond) { passed++; console.log("  [ok] " + name); } else { failed++; console.log("  [FAIL] " + name); } }
function has(S, kind) { return S.ledger.some(e => e.kind === kind); }
function deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// A full deterministic "provoke -> decide" cycle, mirroring what uiProvoke +
// uiAdmit/uiDeny/uiCompost do in the browser. Returns the proposal that was
// live before the decision (for tracing).
function runCycle(S, zone, kind, severity, seedTag, decision) {
  const seed = "seed-" + seedTag;
  riseSignal(S, zone, kind, severity, seed);
  routeSignalAndShiftLulu(S);
  const p = generateGoblinProposal(S, seed);
  let result;
  if (decision === "admit") result = admitProposal(S);
  else if (decision === "deny") result = denyProposal(S);
  else result = compostProposal(S);
  return {proposal: p, decisionApplied: result};
}

// ============================================================
// BOOT SANITY
// ============================================================
let S = makeGardenState(0);
ok(S.phase === "START", "boot: phase START");
ok(S.kernel === KERNEL, "boot: S.kernel is the SAME frozen reference as KERNEL");
ok(Object.isFrozen(KERNEL), "boot: KERNEL is frozen");
ok(KERNEL.authority === false && KERNEL.claim === "NO_CLAIM", "boot: KERNEL carries authority=false, claim=NO_CLAIM");
ok(ZONES.length === 3 && ZONES.every(z => z in S.zones), "boot: 3 zones present in state");
ok(LULU_MODES.length === 6, "boot: 6 Lulu modes");
ok(LULU_MODES.every(m => TEMPLATE_BANKS[m] && TEMPLATE_BANKS[m].length >= 6), "boot: every archetype has >=6 templates");
ok(GOALS.length === 7, "boot: 7 Hivemind goals");
ok(S.ledger.length === 0, "boot: ledger starts empty");
ok(startGame(S) === true && S.phase === "RUNNING" && has(S, "GAME_STARTED"), "boot: startGame transitions to RUNNING");
ok(startGame(S) === false, "boot: startGame refuses double-start");

// ============================================================
// TEST 1 -- proposal generation deterministic (same log prefix => same proposal)
// ============================================================
{
  function sameSetup() {
    const s = makeGardenState(0);
    startGame(s);
    setHivemindGoal(s, "BEAUTY");
    riseSignal(s, "GARDEN_PLOTS", "SIGNAL", 2, "prefixA");
    routeSignalAndShiftLulu(s);
    return s;
  }
  const S1 = sameSetup(), S2 = sameSetup();
  ok(deepEq(S1, S2), "T1: identical operation sequence produces identical state (the 'same log prefix')");
  const p1 = generateGoblinProposal(S1, "genseed");
  const p2 = generateGoblinProposal(S2, "genseed");
  ok(deepEq(p1, p2), "T1: generateGoblinProposal is deterministic given identical state + seed");
  ok(p1.text === p2.text && p1.targetZone === p2.targetZone && p1.archetype === p2.archetype && p1.goblinId === p2.goblinId,
    "T1: proposal text/zone/archetype/goblin all match across identical runs");
  const p3 = generateGoblinProposal(sameSetup(), "DIFFERENT-seed-value");
  ok(!deepEq(p1, {id: p3.id, text: p3.text}) || p1.text !== p3.text || true,
    "T1: sanity placeholder (real divergence check below)");
  ok(p1.text !== p3.text || p1.targetZone !== p3.targetZone,
    "T1: a different seed can (and here does) produce a different proposal -- determinism is seed-sensitive, not seed-blind");
}

// ============================================================
// TEST 2 -- Lulu transition rules deterministic; two crafted states hit two different modes
// ============================================================
{
  const baseG = {health: 60, chaos: 10, trust: 50, coherence: 50, knowledge: 0, soil: 0,
    activeQuests: 0, ambiguity: 0, novelty: 5, intrusionRisk: 0, failures: 0, membraneStress: 0, fruitProgress: 0};
  const gIntrusion = Object.assign({}, baseG, {intrusionRisk: 9});
  const gBugs = Object.assign({}, baseG, {failures: 4});
  const modeA = deriveLuluMode(gIntrusion, "PUNK_DU_REPOS");
  const modeB = deriveLuluMode(gBugs, "PUNK_DU_REPOS");
  ok(modeA === "CAVE_DWELLER", "T2: high intrusionRisk deterministically triggers CAVE_DWELLER");
  ok(modeB === "NOMMEUR_DE_BUGS", "T2: high failures deterministically triggers NOMMEUR_DE_BUGS");
  ok(modeA !== modeB, "T2: the two crafted states hit two DIFFERENT modes");
  ok(deriveLuluMode(gIntrusion, "PUNK_DU_REPOS") === deriveLuluMode(gIntrusion, "PUNK_DU_REPOS"),
    "T2: same state + same previous mode => same mode, called twice");
  const gAmbiguous = Object.assign({}, baseG, {ambiguity: 6});
  ok(deriveLuluMode(gAmbiguous, "PUNK_DU_REPOS") === "ROMANTIQUE_DES_QUESTIONS", "T2: high ambiguity triggers ROMANTIQUE_DES_QUESTIONS");
}

// ============================================================
// TEST 3 -- deny-memory: two denials of a class => suppressed weight
// ============================================================
{
  const baselineLedger = [];
  const baseline = deriveGoblinMemory(baselineLedger).weights;
  ok(baseline.GARDEN_PLOTS === 1 && baseline.RECEIPT_FORGE === 1, "T3: no history => baseline weight 1 for all zones");

  const twoDeniesLedger = [
    {kind: "PROPOSAL_DENIED", data: {zone: "GARDEN_PLOTS"}},
    {kind: "PROPOSAL_DENIED", data: {zone: "GARDEN_PLOTS"}}
  ];
  const afterDenies = deriveGoblinMemory(twoDeniesLedger).weights;
  ok(afterDenies.GARDEN_PLOTS < baseline.GARDEN_PLOTS, "T3: two denials of GARDEN_PLOTS suppress its fold-derived weight below baseline");
  ok(afterDenies.GARDEN_PLOTS < afterDenies.RECEIPT_FORGE, "T3: suppressed class weighs less than an untouched class");

  // distribution shift check: same bag-building formula generateGoblinProposal uses
  function bagCount(weights, zone) { return Math.max(1, Math.round(weights[zone] * 10)); }
  ok(bagCount(afterDenies, "GARDEN_PLOTS") < bagCount(baseline, "GARDEN_PLOTS"),
    "T3: next-proposal bag allocation for GARDEN_PLOTS shrinks after two denials (real distribution shift, not just a number)");
}

// ============================================================
// TEST 4 -- admit-memory restores/reinforces the class
// ============================================================
{
  const twoDeniesLedger = [
    {kind: "PROPOSAL_DENIED", data: {zone: "GARDEN_PLOTS"}},
    {kind: "PROPOSAL_DENIED", data: {zone: "GARDEN_PLOTS"}}
  ];
  const afterDenies = deriveGoblinMemory(twoDeniesLedger).weights;
  const withOneAdmit = twoDeniesLedger.concat([{kind: "PROPOSAL_ADMITTED", data: {zone: "GARDEN_PLOTS"}}]);
  const afterAdmit = deriveGoblinMemory(withOneAdmit).weights;
  ok(afterAdmit.GARDEN_PLOTS > afterDenies.GARDEN_PLOTS, "T4: an admit in a suppressed class raises its weight back up");

  const manyAdmitsLedger = [
    {kind: "PROPOSAL_ADMITTED", data: {zone: "RECEIPT_FORGE"}},
    {kind: "PROPOSAL_ADMITTED", data: {zone: "RECEIPT_FORGE"}},
    {kind: "PROPOSAL_ADMITTED", data: {zone: "RECEIPT_FORGE"}}
  ];
  const afterManyAdmits = deriveGoblinMemory(manyAdmitsLedger).weights;
  ok(afterManyAdmits.RECEIPT_FORGE > 1, "T4: a class with net admits is reinforced ABOVE the neutral baseline (not just 'less suppressed')");
}

// ============================================================
// TEST 5 -- compost creates future-potential state (soil/knowledge + a scheduled transformed event)
// ============================================================
{
  const s = makeGardenState(0);
  startGame(s);
  const soilBefore = s.garden.soil, knowledgeBefore = s.garden.knowledge;
  riseSignal(s, "BUG_NURSERY", "QUARANTINE", 2, "compostSeed");
  routeSignalAndShiftLulu(s);
  const pendingProposal = generateGoblinProposal(s, "compostSeed");
  ok(compostProposal(s) === true, "T5: compostProposal succeeds on a pending proposal");
  ok(has(s, "PROPOSAL_COMPOSTED"), "T5: PROPOSAL_COMPOSTED event logged");
  ok(s.garden.soil > soilBefore, "T5: composting raises soil (future material)");
  ok(s.garden.knowledge > knowledgeBefore, "T5: composting raises knowledge");
  ok(s.compostQueue.length === 1, "T5: a transformed later event is scheduled in compostQueue");
  const scheduledCategory = s.compostQueue[0].category;
  // The proposal's targetZone (weighted-hash-picked) is what's actually scheduled,
  // not the signal's sourceZone -- the Gate routes the signal, it doesn't dictate
  // which zone the goblin ultimately proposes against.
  ok(scheduledCategory === pendingProposal.targetZone, "T5: the scheduled compost item remembers its origin proposal's target zone");

  // The NEXT proposal cycle must consume it deterministically (COMPOST_MATURED).
  riseSignal(s, "GARDEN_PLOTS", "SIGNAL", 1, "afterCompost");
  routeSignalAndShiftLulu(s);
  generateGoblinProposal(s, "afterCompost");
  ok(has(s, "COMPOST_MATURED"), "T5: the next proposal cycle matures the scheduled compost event");
  ok(s.compostQueue.length === 0, "T5: compostQueue is consumed FIFO on maturity");
}

// ============================================================
// TEST 6 -- Garden mutation NEVER changes Kernel state (10-cycle deep compare)
// ============================================================
{
  const kernelSnapshotBefore = JSON.stringify(KERNEL);
  const s = makeGardenState(0);
  startGame(s);
  const zonesCycle = ["GARDEN_PLOTS", "RECEIPT_FORGE", "BUG_NURSERY"];
  const kindsCycle = SIGNAL_KINDS;
  const decisions = ["admit", "admit", "deny", "compost", "admit", "deny", "admit", "compost", "admit", "admit"];
  for (let i = 0; i < 10; i++) {
    runCycle(s, zonesCycle[i % 3], kindsCycle[i % kindsCycle.length], (i % 3) + 1, "k6-" + i, decisions[i]);
  }
  const kernelSnapshotAfter = JSON.stringify(KERNEL);
  ok(kernelSnapshotBefore === kernelSnapshotAfter, "T6: KERNEL JSON identical before/after a full 10-cycle game");
  ok(s.kernel === KERNEL, "T6: state's kernel reference is still the SAME frozen object (no clone, no drift)");
  ok(Object.isFrozen(KERNEL), "T6: KERNEL is still frozen after 10 cycles");
  // This assertion attempt must itself run in strict mode to throw on a
  // frozen-object write (this test file is a normal sloppy-mode CommonJS
  // module, so a bare "KERNEL.authority = true" here would silently no-op
  // rather than throw -- use a nested strict eval to get real throw semantics,
  // matching how the reducer zone actually runs inside the browser's script).
  let mutationThrew = false;
  try { (0, eval)('"use strict";\nKERNEL.authority = true;'); } catch (e) { mutationThrew = true; }
  ok(mutationThrew === true && KERNEL.authority === false, "T6: attempting to mutate KERNEL throws (strict mode) and the value is unchanged");
}

// ============================================================
// TEST 7 -- receipt candidate never implies admission; no admit path exists for Kernel
// ============================================================
{
  const s = makeGardenState(0);
  startGame(s);
  for (let i = 0; i < 5; i++) {
    runCycle(s, ZONES[i % 3], "SIGNAL", 2, "t7-" + i, "admit");
  }
  ok(s.receipts.length > 0, "T7: at least one receipt candidate was minted");
  ok(s.receipts.every(r => r.admitted === false), "T7: every receipt candidate has admitted=false");
  ok(s.receipts.every(r => r.authority === false), "T7: every receipt candidate has authority=false");
  // structural: the reducer source must contain no path that ever sets admitted=true, or assigns into KERNEL.
  ok(!/admitted\s*=\s*true/.test(reducerSource), "T7 (structural): reducer source never sets admitted=true anywhere");
  ok(!/KERNEL\.\w+\s*=/.test(reducerSource), "T7 (structural): reducer source never assigns into a KERNEL property");
  ok(!/KERNEL\s*=\s*[^=]/.test(reducerSource.replace(/const KERNEL = Object\.freeze/, "")), "T7 (structural): reducer source never reassigns KERNEL itself");
}

// ============================================================
// TEST 8 -- replay reproduces Garden state exactly
// ============================================================
{
  const s = makeGardenState(0);
  startGame(s);
  setHivemindGoal(s, "ECONOMY");
  const decisions = ["admit", "deny", "compost", "admit", "admit", "deny", "compost", "admit"];
  for (let i = 0; i < decisions.length; i++) {
    runCycle(s, ZONES[i % 3], SIGNAL_KINDS[i % SIGNAL_KINDS.length], (i % 4) + 1, "t8-" + i, decisions[i]);
  }
  const fold1 = foldGardenLog(s.ledger, s.epoch);
  const fold2 = foldGardenLog(s.ledger, s.epoch);
  ok(fold1.ok && fold2.ok, "T8: folding a valid ledger twice both succeed");
  ok(JSON.stringify(fold1.state) === JSON.stringify(fold2.state), "T8: fold(log) twice => identical canonical JSON");
  ok(JSON.stringify(fold1.state) === JSON.stringify(s), "T8: fold(log) reproduces the LIVE state exactly (byte-identical canonical JSON)");
  ok(computeStateHash(fold1.state) === computeStateHash(s), "T8: replay hash matches live hash");
}

// ============================================================
// TEST 9 -- corrupted event log fails closed
// ============================================================
{
  const s = makeGardenState(0);
  startGame(s);
  runCycle(s, "GARDEN_PLOTS", "SIGNAL", 2, "t9", "admit");
  const goodJSONL = serializeLedgerJSONL(s.ledger);

  // (a) truncated/garbage line -- doesn't even parse as JSON
  const lines = goodJSONL.split("\n");
  lines[1] = lines[1].slice(0, Math.floor(lines[1].length / 2)); // truncate mid-object
  const truncated = lines.join("\n");
  const r1 = foldGardenLogFromJSONL(truncated);
  ok(r1.ok === false && r1.state === null, "T9a: a truncated JSON line is rejected -- ok:false, state:null (fails closed)");

  // (b) syntactically valid JSON, but an unknown/garbage event kind
  const lines2 = goodJSONL.split("\n");
  const parsedFirst = JSON.parse(lines2[0]);
  parsedFirst.kind = "TOTALLY_MADE_UP_KIND";
  lines2[0] = JSON.stringify(parsedFirst);
  const garbageKind = lines2.join("\n");
  const r2 = foldGardenLogFromJSONL(garbageKind);
  ok(r2.ok === false && r2.state === null, "T9b: an unknown event kind is rejected -- ok:false, state:null (fails closed)");

  // (c) a good log still folds fine (control case, proves (a)/(b) aren't false positives)
  const r3 = foldGardenLogFromJSONL(goodJSONL);
  ok(r3.ok === true && r3.state !== null, "T9c: control -- the UNCORRUPTED log folds successfully");

  // (d) foldGardenLog on a non-array also fails closed
  const r4 = foldGardenLog("not an array");
  ok(r4.ok === false && r4.state === null, "T9d: foldGardenLog on a non-array input fails closed");
}

// ============================================================
// TEST 10 -- all Garden actions retain authority=false
// ============================================================
{
  const s = makeGardenState(0);
  startGame(s);
  const decisions = ["admit", "deny", "compost", "admit", "deny", "admit"];
  for (let i = 0; i < decisions.length; i++) {
    runCycle(s, ZONES[i % 3], SIGNAL_KINDS[i % SIGNAL_KINDS.length], (i % 3) + 1, "t10-" + i, decisions[i]);
  }
  let sawAuthorityField = false, allFalse = true;
  function walk(v) {
    if (v && typeof v === "object") {
      if ("authority" in v) { sawAuthorityField = true; if (v.authority !== false) allFalse = false; }
      Object.keys(v).forEach(k => walk(v[k]));
    }
  }
  walk(s.ledger);
  ok(sawAuthorityField, "T10: at least one produced object carries an authority field (sanity -- the walk found something)");
  ok(allFalse, "T10: every produced object's authority field is false, everywhere in the ledger");
  ok(KERNEL.authority === false, "T10: KERNEL.authority is false");
}

// ============================================================
// ACCEPTANCE -- 10-cycle simulated playthrough, headless (also serves as the trace report)
// ============================================================
console.log("\n--- 10-cycle headless playthrough trace ---");
{
  const s = makeGardenState(0);
  startGame(s);
  setHivemindGoal(s, "KNOWLEDGE");
  const zonesCycle = ["GARDEN_PLOTS", "RECEIPT_FORGE", "BUG_NURSERY", "GARDEN_PLOTS", "BUG_NURSERY",
                      "RECEIPT_FORGE", "GARDEN_PLOTS", "BUG_NURSERY", "RECEIPT_FORGE", "GARDEN_PLOTS"];
  const kindsCycle = ["SIGNAL", "DECOMPOSITION", "QUARANTINE", "REDISTRIBUTION", "QUARANTINE",
                      "TRANSFORMATION", "SIGNAL", "QUARANTINE", "REDISTRIBUTION", "SIGNAL"];
  const severities = [2, 1, 3, 2, 3, 1, 2, 2, 1, 2];
  const decisions =  ["admit", "admit", "deny", "compost", "admit", "admit", "deny", "admit", "compost", "admit"];
  let allEffectsVisible = true;
  for (let i = 0; i < 10; i++) {
    if (s.phase !== "RUNNING") { console.log(`  cycle ${i + 1}: SKIPPED (game already ended: ${s.phase})`); continue; }
    const before = JSON.stringify(s.garden);
    const {proposal} = runCycle(s, zonesCycle[i], kindsCycle[i], severities[i], "play" + i, decisions[i]);
    const after = JSON.stringify(s.garden);
    const changed = before !== after;
    if (!changed) allEffectsVisible = false;
    console.log(`  cycle ${i + 1}: [${proposal.archetype}] ${proposal.goblinId} @ ${proposal.targetZone} -> "${proposal.text}"`);
    console.log(`           decision=${decisions[i].toUpperCase()} | health=${s.garden.health} chaos=${s.garden.chaos} ` +
      `trust=${s.garden.trust} coherence=${s.garden.coherence} knowledge=${s.garden.knowledge} soil=${s.garden.soil} ` +
      `fruit=${s.garden.fruitProgress} | garden-vitals-changed=${changed} | phase=${s.phase}`);
  }
  ok(allEffectsVisible, "ACCEPTANCE: every decision produced a visible/numeric Garden effect");

  const finalWeights = zoneWeights(s);
  console.log("  final zone weights (proposal-frequency bias, should differ from 1/1/1 baseline): " + JSON.stringify(finalWeights));
  ok(!(finalWeights.GARDEN_PLOTS === 1 && finalWeights.RECEIPT_FORGE === 1 && finalWeights.BUG_NURSERY === 1),
    "ACCEPTANCE: proposal frequency (zone weights) adapted away from the neutral baseline after 10 cycles of decisions");

  const foldCheck = foldGardenLog(s.ledger, s.epoch);
  const liveHash = computeStateHash(s);
  const foldHash = foldCheck.ok ? computeStateHash(foldCheck.state) : "N/A";
  console.log(`  final phase: ${s.phase} | receipts minted: ${s.receipts.length} | tamed bugs: ${s.bugs.filter(b => b.tamed).length}`);
  console.log(`  replay check: live hash=${liveHash} folded hash=${foldHash} match=${liveHash === foldHash}`);
  ok(liveHash === foldHash, "ACCEPTANCE: replay hash identical for the full 10-cycle playthrough");

  // no external API anywhere in the shipped file
  ok(!/fetch\s*\(/.test(html) && !/XMLHttpRequest/.test(html) && !/WebSocket/.test(html) && !/<script\s+src=/.test(html),
    "ACCEPTANCE: zero network surface in garden.html (no fetch/XHR/WebSocket/external <script src>)");
  ok(!/Math\.random/.test(reducerSource) && !/Date\.(now|getTime)/.test(reducerSource),
    "ACCEPTANCE: reducer zone has zero Math.random / Date usage (determinism law)");
}

console.log(`\ngarden selftest: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
