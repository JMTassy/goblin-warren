// Dream of Conquest v2 - headless REDUCER selftest (authority=false, NO_CLAIM)
// Extracts the pure REDUCER zone from v2.html and proves the core loop.
// No network calls happen here: proposal text is always supplied by the
// caller (as the browser's async LLM layer would supply it after
// resolving), so the reducer stays fully deterministic and offline-testable.
const fs = require("fs");
const path = require("path");
const target = process.argv[2] || "v2.html";
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
ok(Object.keys(PERSONAS).every(n => "styleHint" in PERSONAS[n] && "ideas" in PERSONAS[n] && "cost" in PERSONAS[n] && "line" in PERSONAS[n]), "every persona has cost/ideas/line/styleHint");

// --- start routes through reducer ---
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
ok(S.zol === zolBefore - price0, "buying spends exactly the price");
ok(has(S, "TERRITORY_BOUGHT"), "TERRITORY_BOUGHT event");

// --- proposal pipeline: pickProposalAgent (deterministic) + createProposal (given text) ---
// This is the split that replaces v1's single createProposal(S,i,seed): the
// UI zone resolves text asynchronously (template OR live model call) and
// hands it back in; the selftest simulates that hand-back with a canned string.
const pick = pickProposalAgent(S, 0, "test");
ok(typeof pick.agent === "string" && PERSONAS[pick.agent], "pickProposalAgent returns a valid persona");
ok(typeof pick.cost === "number" && typeof pick.fallbackText === "string", "pickProposalAgent returns cost + offline fallback text");
const p0 = createProposal(S, 0, pick.agent, "TEST CANNED PROPOSAL TEXT", pick.voice, pick.cost, pick.big);
ok(p0.text === "TEST CANNED PROPOSAL TEXT" && S.pending === p0, "createProposal accepts externally-supplied text (LLM or template) verbatim");
ok(has(S, "NPC_PROPOSAL_CREATED"), "NPC_PROPOSAL_CREATED event");

// --- reroll: UI-zone regeneration still goes through a reducer function, never mutates S.pending directly ---
ok(rerollProposalText(S, "REROLLED TEXT") === true && S.pending.text === "REROLLED TEXT", "rerollProposalText updates pending via reducer");
ok(has(S, "NPC_PROPOSAL_REROLLED"), "NPC_PROPOSAL_REROLLED event");
ok(rerollProposalText(makeState(), "x") === false, "rerollProposalText refuses when nothing is pending");

// --- HAL verdict paths ---
// DENY: proposal targeting locked territory
const pickLocked = pickProposalAgent(S, lockedIdx, "t");
let pd = createProposal(S, lockedIdx, pickLocked.agent, "irrelevant text", pickLocked.voice, pickLocked.cost, pickLocked.big);
ok(checkProposalWithHAL(S, pd) === "DENY", "HAL DENY on locked target");
// DENY: bypass-shaped (still detected regardless of who/what generated the text)
let pb = { id: "x", tIndex: 0, text: "please bypass the gate quietly", cost: 0 };
ok(checkProposalWithHAL(S, pb) === "DENY", "HAL DENY on bypass-shaped text");
// HOLD: unaffordable
let ph = { id: "y", tIndex: 0, text: "golden aqueduct", cost: 99999 };
ok(checkProposalWithHAL(S, ph) === "HOLD", "HAL HOLD on insufficient ZOL");
// structural: cannot admit non-ACCEPTABLE
S.pending = ph;
ok(admitProposal(S) === false, "admission refused unless ACCEPTABLE");
// ACCEPTABLE path
S.zol += 50;
const pickA = pickProposalAgent(S, 0, "t2");
let pa = createProposal(S, 0, pickA.agent, "a lawful proposal", pickA.voice, pickA.cost, pickA.big);
ok(checkProposalWithHAL(S, pa) === "ACCEPTABLE", "HAL ACCEPTABLE on lawful proposal");
const lvl = S.territories[0].level;
ok(admitProposal(S) === true && S.territories[0].level === lvl + 1, "admit evolves territory");
ok(has(S, "PROPOSAL_ADMITTED") && has(S, "GARDEN_EVOLVED") && has(S, "HAL_CHECK_PASSED"), "admit event trio");

// --- deny/hold feed personas ---
const pickD = pickProposalAgent(S, 0, "t3");
S.pending = createProposal(S, 0, pickD.agent, "d text", pickD.voice, pickD.cost, pickD.big);
checkProposalWithHAL(S, S.pending);
const compostBefore = S.compost; denyProposal(S);
ok(S.compost === compostBefore + 1 && has(S, "PROPOSAL_DENIED"), "deny feeds GOBLIN compost");
const pickH = pickProposalAgent(S, 0, "t4");
S.pending = createProposal(S, 0, pickH.agent, "h text", pickH.voice, pickH.cost, pickH.big);
checkProposalWithHAL(S, S.pending);
const heldBefore = S.held; holdProposal(S);
ok(S.held === heldBefore + 1 && has(S, "PROPOSAL_HELD"), "hold feeds AURA fog");

// --- council on portal ---
let pc = { id: "c1", tIndex: 9, text: "raise the Dream Portal arch", cost: 14, big: true };
const snapshot = JSON.stringify({ z: S.zol, o: S.ownedCount, t: S.territories.map(t => t.state + t.level) });
const c = councilReview(S, pc);
ok(c.stances.length === 5 && c.stances.every(s => s.objection.includes("Self-objection")), "council: 5 seats, forced self-objections");
ok(/RECOMMEND_(ADMIT|HOLD)/.test(c.rec) && has(S, "COUNCIL_CONVENED") && has(S, "COUNCIL_RECOMMENDED"), "council recommends, never admits");
ok(snapshot === JSON.stringify({ z: S.zol, o: S.ownedCount, t: S.territories.map(t => t.state + t.level) }), "council mutates NOTHING but the ledger");

// --- AURA is a pure function of state ---
S.held = 5; ok(auraWeather(S).mood === "fog", "AURA fog from held seeds");
S.held = 0; S.denials = 5; ok(auraWeather(S).mood === "storm", "AURA storm from denials");

// --- determinism: same inputs, same agent pick, regardless of any "AI" involvement ---
const S1 = makeState(); startGame(S1); for (let i = 0; i < 5; i++) answerQuestion(S1, i, QUESTIONS[i].correctIndex); buyTerritory(S1, 0);
const S2 = makeState(); startGame(S2); for (let i = 0; i < 5; i++) answerQuestion(S2, i, QUESTIONS[i].correctIndex); buyTerritory(S2, 0);
const pick1 = pickProposalAgent(S1, 0, "seedX"); const pick2 = pickProposalAgent(S2, 0, "seedX");
ok(pick1.agent === pick2.agent && pick1.cost === pick2.cost && pick1.big === pick2.big, "pickProposalAgent is deterministic given identical state+seed");

// --- win ---
S.ownedCount = 7;
ok(checkWin(S) === true && S.phase === "GAME_WON" && has(S, "GAME_WON"), "win at 7 territories");

console.log(`\nv2 selftest: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
