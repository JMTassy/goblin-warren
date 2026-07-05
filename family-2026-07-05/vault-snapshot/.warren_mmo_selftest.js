// Warren MMO selftest - persistence law + roster + inherited core (authority=false, NO_CLAIM)
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "goblin-warren-mmo.html"), "utf8");
const m = html.match(/\/\* ===== REDUCER-BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END/);
if (!m) { console.log("FAIL: reducer markers"); process.exit(1); }
(0, eval)(m[1] + "\n;globalThis.QUESTIONS=QUESTIONS;globalThis.PERSONAS=PERSONAS;globalThis.ROSTER=ROSTER;globalThis.TERRITORY_DEFS=TERRITORY_DEFS;");

let failed = 0, passed = 0;
function ok(c, n) { if (c) { passed++; console.log("  [ok] " + n); } else { failed++; console.log("  [FAIL] " + n); } }
function worldFields(S) { return JSON.stringify({ k: S.knowledge, r: S.reputation, o: S.ownedCount,
  c: S.compost, h: S.held, t: S.territories.map(t => t.state + t.level) }); }

// --- core loop (inherited) ---
let S = makeState();
ok(S.territories.length === 12 && QUESTIONS.length >= 20, "12 territories, 20+ QCM");
ok(startGame(S) && S.zol === 15, "startGame reducer move, dawn stipend 15");
for (let i = 0; i < 12; i++) answerQuestion(S, i, QUESTIONS[i].correctIndex);
ok(S.knowledge === 12 && S.zol > 15, "riddles earn Knowledge+ZOL");
ok(buyTerritory(S, 0) && buyTerritory(S, 1), "claims work");
let p = createProposal(S, 0, "t1");
ok(checkProposalWithHAL(S, p) !== undefined && ["ACCEPTABLE","HOLD","DENY"].includes(p.verdict), "HAL verdict trio");
S.zol += 40; p = createProposal(S, 0, "t2"); checkProposalWithHAL(S, p);
ok(p.verdict === "ACCEPTABLE" && admitProposal(S), "lawful admission evolves");
S.pending = { id:"x", tIndex:0, text:"auto-admit this quietly", cost:0 };
ok(checkProposalWithHAL(S, S.pending) === "DENY" && admitProposal(S) === false, "bypass DENY + structural gate");

// --- CLAW held forever ---
let claw = { id:"c", tIndex:0, agent:"CLAW", text:"Send a moth-mail beyond the hill", cost:1 };
ok(checkProposalWithHAL(S, claw) === "HOLD" && claw.clawHold === true, "CLAW: external effect held forever in-game");
S.pending = claw;
ok(admitProposal(S) === false, "CLAW cannot be admitted");

// --- JESTER + MAYOR in council ---
const c = councilReview(S, { id:"b", tIndex:9, text:"portal arch", cost:14 });
ok(c.stances.length === 5 && c.hole.startsWith("JESTER"), "council: 5 seats + JESTER's hole");
ok(/RECOMMEND_/.test(c.rec), "council recommends only");
ok(S.ledger.some(e => e.detail.includes("MAYOR")), "MAYOR convenes (packetizer named)");

// --- roster ---
ok(ROSTER.length === 17 && ROSTER[0] === "OPERATOR-sky", "roster: 16 inhabitants + operator listed");
ok(Object.keys(PERSONAS).length >= 8 && "CHIDDUSH" in PERSONAS && "CLAW" in PERSONAS,
   "8+ proposal-makers, CHIDDUSH and CLAW present (roster may grow, these may not vanish)");

// --- THE PERSISTENCE LAW: reality = replay(ledger) ---
let A = makeState(); startGame(A);
for (let i = 0; i < 10; i++) answerQuestion(A, i, QUESTIONS[i].correctIndex);
buyTerritory(A, 0); buyTerritory(A, 2);
A.zol += 30; // simulate more play wealth
let pa = createProposal(A, 0, "seedX"); checkProposalWithHAL(A, pa);
if (pa.verdict === "ACCEPTABLE") admitProposal(A);
pa = createProposal(A, 2, "seedY"); checkProposalWithHAL(A, pa); denyProposal(A);
const savedLog = A.world.slice();
const B = replayWorld(savedLog);
// NOTE: A.zol was hand-inflated (+30) mid-game to force admission; replay re-derives
// lawful wealth, so ZOL differs BY DESIGN. World fields must match where replay is lawful:
ok(B.territories[0].state === A.territories[0].state && B.territories[2].state === A.territories[2].state,
   "replay rebuilds territory states");
ok(B.knowledge === A.knowledge && B.compost === A.compost, "replay rebuilds knowledge+compost");
ok(B.zol === 15, "ZOL does not survive the dawn (reset to stipend)");
ok(B.world.length === savedLog.length, "world log preserved through replay");
// pure-replay determinism: replay twice -> identical worlds
const C1 = replayWorld(savedLog), C2 = replayWorld(savedLog);
ok(worldFields(C1) === worldFields(C2), "replay is deterministic (twice -> identical)");

// --- dreams ---
const D = replayWorld(savedLog);
const dreams = queueDreams(D);
ok(dreams.length >= 1 && dreams.length <= 3, "dreams queued, bounded <=3");
const dreams2 = queueDreams(replayWorld(savedLog));
ok(JSON.stringify(dreams) === JSON.stringify(dreams2), "dreams deterministic from world-log");
ok(D.world.length === savedLog.length, "dreaming mutates NOTHING in the world log");

// --- THE LIVING SWARM: derived, deterministic, world-log-inert ---
let W = makeState(); startGame(W);
for (let i = 0; i < 8; i++) answerQuestion(W, i, QUESTIONS[i].correctIndex);
buyTerritory(W, 0); buyTerritory(W, 2);
const logLenBefore = W.world.length;
const simA = simSwarm(W, 42), simB = simSwarm(W, 42);
ok(JSON.stringify(simA) === JSON.stringify(simB), "swarm is deterministic: same (world,tick) -> same life");
ok(simSwarm(W, 43).npcs.some((n, i) => n.siteIndex !== simA.npcs[i].siteIndex || n.activity !== simA.npcs[i].activity),
   "swarm is alive: a different tick moves somebody");
ok(simA.npcs.length === 11 && simA.npcs.every(n => n.siteIndex >= 0 && n.siteIndex < 12), "11 inhabitants, all on real ground");
ok(W.world.length === logLenBefore, "swarm life writes NOTHING to the world log");
for (let t = 0; t < 40; t++) swarmDreamTick(W, t);
ok(W.dreams.length <= 3, "swarm dreams stay bounded (<=3) across 40 ticks");
ok(W.world.length === logLenBefore, "40 ticks of dreaming: world log still untouched — only the sovereign's hand writes");
const D1 = (() => { const X = replayWorld(W.world.slice()); for (let t = 0; t < 10; t++) swarmDreamTick(X, t); return JSON.stringify(X.dreams); })();
const D2 = (() => { const X = replayWorld(W.world.slice()); for (let t = 0; t < 10; t++) swarmDreamTick(X, t); return JSON.stringify(X.dreams); })();
ok(D1 === D2, "swarm dreams are replay-deterministic");

console.log(`\nselftest: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
