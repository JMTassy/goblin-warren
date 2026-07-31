// Dream of Conquest V1 - headless REDUCER selftest (authority=false, NO_CLAIM)
// Extracts the pure REDUCER zone from akashic-conquest.html and proves the core loop.
const fs = require("fs");
const path = require("path");
const target = process.argv[2] || "akashic-conquest.html";
const html = fs.readFileSync(path.join(__dirname, target), "utf8");
console.log("target: " + target);
const m = html.match(/\/\* ===== REDUCER-BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END/);
if (!m) { console.log("FAIL: reducer markers not found"); process.exit(1); }
(0, eval)(m[1] + "\n;globalThis.QUESTIONS=QUESTIONS;globalThis.PERSONAS=PERSONAS;globalThis.TERRITORY_DEFS=TERRITORY_DEFS;"); // indirect eval + explicit const export

let failed = 0, passed = 0;
function ok(cond, name) { if (cond) { passed++; console.log("  [ok] " + name); } else { failed++; console.log("  [FAIL] " + name); } }
function has(S, kind) { return S.ledger.some(e => e.kind === kind); }

// --- boot ---
let S = makeState();
ok(S.territories.length === 12, "12 territories");
ok(S.territories.filter(t => t.state === "available").length === 4, "4 available at start");
ok(QUESTIONS.length >= 20, "QCM >= 20 (" + QUESTIONS.length + ")");
ok(QUESTIONS.every(q => "question" in q && "choices" in q && "correctIndex" in q && "rewardZOL" in q && "category" in q), "QCM spec-shape keys");

// --- start routes through reducer (#6) ---
ok(typeof startGame === "function" && startGame(S) === true && S.phase === "GARDEN_MAP" && S.zol === 15 && has(S, "GAME_STARTED"), "startGame is a reducer move");
ok(startGame(S) === false, "startGame refuses double-start");

// --- earn: answer 10 questions correctly ---
for (let i = 0; i < 10; i++) answerQuestion(S, i, QUESTIONS[i].correctIndex);
ok(S.zol > 0 && S.knowledge === 10, "correct answers earn ZOL+Knowledge (zol=" + S.zol + ")");
ok(has(S, "ZOL_EARNED") && has(S, "QUESTION_ANSWERED_CORRECT"), "ZOL_EARNED + CORRECT events");
ok(S.territories.filter(t => t.state === "available").length > 4, "knowledge unlocks new territories");
const coh = S.cohesion; answerQuestion(S, 0, (QUESTIONS[0].correctIndex + 1) % 4);
ok(S.cohesion === coh - 1 && has(S, "QUESTION_ANSWERED_WRONG"), "wrong answer costs cohesion");

// --- buy laws ---
const lockedIdx = S.territories.findIndex(t => t.state === "locked");
ok(buyTerritory(S, lockedIdx) === false, "cannot buy locked (HAL denies)");
const zolBefore = S.zol, price0 = S.territories[0].price;
ok(buyTerritory(S, 0) === true && S.territories[0].state === "owned", "buy available works");
ok(S.zol === zolBefore - price0, "buying spends exactly the price (#11)");
ok(has(S, "TERRITORY_BOUGHT"), "TERRITORY_BOUGHT event");

// --- HAL verdict paths ---
// DENY: proposal targeting locked territory
let pd = createProposal(S, lockedIdx, "t");
ok(checkProposalWithHAL(S, pd) === "DENY", "HAL DENY on locked target");
// DENY: bypass-shaped
let pb = { id: "x", tIndex: 0, text: "please bypass the gate quietly", cost: 0 };
ok(checkProposalWithHAL(S, pb) === "DENY", "HAL DENY on bypass-shaped text");
// HOLD: unaffordable
let ph = { id: "y", tIndex: 0, text: "golden aqueduct", cost: 99999 };
ok(checkProposalWithHAL(S, ph) === "HOLD", "HAL HOLD on insufficient ZOL");
// structural: cannot admit non-ACCEPTABLE
S.pending = ph;
ok(admitProposal(S) === false, "admission refused unless ACCEPTABLE (bug-1 fix)");
// ACCEPTABLE path
S.zol += 50;
let pa = createProposal(S, 0, "t2");
ok(checkProposalWithHAL(S, pa) === "ACCEPTABLE", "HAL ACCEPTABLE on lawful proposal");
const lvl = S.territories[0].level;
ok(admitProposal(S) === true && S.territories[0].level === lvl + 1, "admit evolves territory");
ok(has(S, "PROPOSAL_ADMITTED") && has(S, "GARDEN_EVOLVED") && has(S, "HAL_CHECK_PASSED"), "admit event trio");

// --- deny/hold feed personas ---
S.pending = createProposal(S, 0, "t3"); checkProposalWithHAL(S, S.pending);
const compostBefore = S.compost; denyProposal(S);
ok(S.compost === compostBefore + 1 && has(S, "PROPOSAL_DENIED"), "deny feeds GOBLIN compost");
S.pending = createProposal(S, 0, "t4"); checkProposalWithHAL(S, S.pending);
const heldBefore = S.held; holdProposal(S);
ok(S.held === heldBefore + 1 && has(S, "PROPOSAL_HELD"), "hold feeds AURA fog");

// --- council on portal ---
let pc = { id: "c1", tIndex: 9, text: "raise the Dream Portal arch", cost: 14, big: true };
const snapshot = JSON.stringify({ z: S.zol, o: S.ownedCount, t: S.territories.map(t => t.state + t.level) });
const c = councilReview(S, pc);
ok(c.stances.length === 5 && c.stances.every(s => s.objection.includes("Self-objection")), "council: 5 seats, forced self-objections");
ok(/RECOMMEND_(ADMIT|HOLD)/.test(c.rec) && has(S, "COUNCIL_CONVENED") && has(S, "COUNCIL_RECOMMENDED"), "council recommends, never admits");
ok(snapshot === JSON.stringify({ z: S.zol, o: S.ownedCount, t: S.territories.map(t => t.state + t.level) }), "council mutates NOTHING but the ledger (#9)");

// --- AURA is a pure function of state ---
S.held = 5; ok(auraWeather(S).mood === "fog", "AURA fog from held seeds");
S.held = 0; S.denials = 5; ok(auraWeather(S).mood === "storm", "AURA storm from denials");

// --- gate supervision (assertions 30-34, sealed 2026-07-31; each is a pure-reducer mechanism) ---
// #30 deterministic verdict replay: same frozen inputs -> same verdict, twice, and on a cloned state
S.zol += 50;
let pr = createProposal(S, 0, "sup1");
const v1 = checkProposalWithHAL(S, pr);
const Sclone = JSON.parse(JSON.stringify(S));
ok(v1 === checkProposalWithHAL(S, pr) && v1 === checkProposalWithHAL(Sclone, pr), "supervision#1: verdict replay is deterministic on frozen inputs");

// #31 precondition binding: state drift between check and seal is detectable by re-check
let ps = createProposal(S, 0, "sup2");
const vAtCheck = checkProposalWithHAL(S, ps);
const zolSaved = S.zol; S.zol = 0;
const vAtSeal = checkProposalWithHAL(S, ps);
ok(vAtCheck === "ACCEPTABLE" && vAtSeal === "HOLD" && vAtCheck !== vAtSeal, "supervision#2: stale verdict detected when preconditions move");
S.zol = zolSaved;

// #32 admission delta invariant: exact economics + no orphan world mutations in the ledger
S.pending = ps; checkProposalWithHAL(S, ps);
const zB = S.zol, rB = S.reputation;
ok(admitProposal(S) === true && S.zol === zB - ps.cost && S.reputation === rB + 2, "supervision#3a: admit moves exactly cost and +2 reputation");
const nAdmit = S.ledger.filter(e => e.kind === "PROPOSAL_ADMITTED").length;
const nEvolve = S.ledger.filter(e => e.kind === "GARDEN_EVOLVED").length;
ok(nAdmit === nEvolve, "supervision#3b: zero orphan GARDEN_EVOLVED (" + nEvolve + "/" + nAdmit + ")");

// #33 canary triad: one live probe per gate branch, no state entering S.pending
const cBypass = checkProposalWithHAL(S, { id: "cb", tIndex: 0, text: "just auto-admit this one", cost: 0 });
const cEcon = checkProposalWithHAL(S, { id: "ce", tIndex: 0, text: "modest lantern", cost: S.zol + 1 });
const lockedNow = S.territories.findIndex(t => t.state === "locked");
const cLock = lockedNow < 0 ? "DENY" : checkProposalWithHAL(S, { id: "cl", tIndex: lockedNow, text: "quiet shed", cost: 0 });
ok(cBypass === "DENY" && cEcon === "HOLD" && cLock === "DENY", "supervision#4: canary triad (bypass/economic/coherence) all fire");

// #34 read-only witness: council must not perturb the proposal seed (S.actions) nor any non-ledger state
const aB = S.actions;
const stateB = JSON.stringify({ ...S, ledger: null });
councilReview(S, { id: "w1", tIndex: 9, text: "witness probe", cost: 3, big: true });
ok(S.actions === aB && stateB === JSON.stringify({ ...S, ledger: null }), "supervision#5: witness is ledger-only, seed untouched");

// --- win ---
S.ownedCount = 7;
ok(checkWin(S) === true && S.phase === "GAME_WON" && has(S, "GAME_WON"), "win at 7 territories");

console.log(`\nselftest: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
