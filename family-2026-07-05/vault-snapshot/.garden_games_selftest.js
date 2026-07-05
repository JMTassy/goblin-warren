// GARDEN OF GAMES selftest - the spec's 10 tests + clearability + exploit gates
// authority=false . NO_CLAIM . headless over the extracted REDUCER
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "goblin-warren-mmo.html"), "utf8");
const m = html.match(/\/\* ===== REDUCER-BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END/);
if (!m) { console.log("FAIL: reducer markers"); process.exit(1); }
(0, eval)(m[1] + "\n;globalThis.__G={QUESTIONS,BUILTIN_MINIGAMES,MG_POLICIES,MG_TEMPLATES};");

let passed = 0, failed = 0;
const ok = (c, n) => { c ? passed++ : failed++; console.log(`  [${c ? "ok" : "FAIL"}] ${n}`); };
const fresh = () => { const S = makeState(); startGame(S); return S; };

// 1. built-in mini-game grants bounded reward
let S = fresh(); const z0 = S.zol, k0 = S.knowledge;
playMiniGame(S, "qcm_duel", { hits: [true, true, true] });
ok(S.zol - z0 === 4 && S.zol - z0 <= 6 && S.knowledge - k0 === 2, "1: win grants exactly the bounded reward");

// 2. wrong play does not grant reward
S = fresh(); const z1 = S.zol, k1 = S.knowledge, r1 = S.reputation;
playMiniGame(S, "qcm_duel", { hits: [false, false, false] });
ok(S.zol === z1 && S.knowledge === k1 && S.reputation === r1, "2: losing grants nothing");

// 3. user-created mini-game is data only
const spec = makeMiniGameSpec({ name: "Moth Waltz", tpl: "memory", theme: "moon", difficulty: "easy",
  risk: "low", rounds: 3, rewardType: "knowledge", rewardAmount: 3, desc: "dance", objective: "recall",
  winCond: "match", failCond: "forget" });
ok(JSON.parse(JSON.stringify(spec)).name === spec.name &&
   Object.values(spec).every(v => ["string", "number", "boolean", "undefined"].includes(typeof v) || (typeof v === "object" && v !== null && Object.values(v).every(x => typeof x === "number"))),
   "3: forged spec survives JSON round-trip, no executable anywhere");

// 4. arbitrary script text is rejected
S = fresh();
const evil = makeMiniGameSpec({ name: "<script>alert(1)</script>", tpl: "quiz", theme: "bone",
  difficulty: "easy", risk: "low", rounds: 3, rewardType: "zol", rewardAmount: 3 });
ok(checkMiniGameWithHAL(S, evil).verdict === "DENY", "4: script-shaped name -> HAL DENY");
const evil2 = makeMiniGameSpec({ name: "Cash Out Casino", tpl: "dice", theme: "bone",
  difficulty: "easy", risk: "low", rounds: 1, rewardType: "zol", rewardAmount: 3 });
ok(checkMiniGameWithHAL(S, evil2).verdict === "DENY", "4b: real-money language -> HAL DENY");

// 5. high reward triggers Council
const rich = makeMiniGameSpec({ name: "Golden Root", tpl: "quiz", theme: "rose", difficulty: "hard",
  risk: "low", rounds: 3, rewardType: "zol", rewardAmount: 14 });
ok(mgCouncilNeeded(rich) === true, "5: reward 14 convenes the Tall Ones");
ok(mgCouncilNeeded(makeMiniGameSpec({ name: "Tiny Song", tpl: "quiz", theme: "moon", difficulty: "easy",
  risk: "low", rounds: 2, rewardType: "zol", rewardAmount: 2 })) === false, "5b: tiny game skips council");

// 6. HAL HOLD cannot be admitted
S = fresh(); S.mgCandidate = { spec, verdict: "HOLD", reason: "test" };
ok(admitMiniGame(S) === false && S.customGames.length === 0, "6: HOLD is structurally unadmittable");

// 7. admitted mini-game appears after replay
S = fresh();
const good = makeMiniGameSpec({ name: "Moth Waltz", tpl: "quiz", theme: "moon", difficulty: "easy",
  risk: "low", rounds: 3, rewardType: "knowledge", rewardAmount: 3 });
submitMiniGame(S, good);
ok(S.mgCandidate.verdict === "ACCEPTABLE", "7a: honest forge passes HAL (dry-sim included)");
ok(admitMiniGame(S) === true, "7b: sovereign admits");
let R = replayWorld(S.world);
ok(R.customGames.some(g => g.id === good.id), "7c: booth REBUILT from the event log after replay");
const ev = S.world.find(e => e.k === "mg_admit");
ok(ev && ev.type === "MINIGAME_ADMITTED" && ev.admittedBy === "JM" && ev.halVerdict === "ACCEPTABLE" &&
   "councilRecommendation" in ev && "timestamp" in ev, "7d: admission event carries the full spec-required shape");

// 8. denied mini-game does not appear after replay
S = fresh(); submitMiniGame(S, good); denyMiniGame(S);
R = replayWorld(S.world);
ok(!R.customGames.length, "8: denied game is compost — absent after replay");

// 9. AI can clear at least one built-in mini-game (and in fact all of them)
S = fresh();
const bal = exportMiniGameBalanceReport(S, 40);
ok(Object.values(bal.report.qcm_duel).some(p => p.winRate > 0), "9: AI clears QCM Duel");
ok(bal.allClear === true, "9b: EVERY built-in booth clearable by at least one policy");

// 10. greedy AI cannot create infinite ZOL
ok(bal.report.bone_dice.greedy.netZol <= 0, "10: greedy dice bleeds ZOL (house edge holds)");
ok(bal.anyExploit === false, "10b: no exploit flag on any booth under greed");

// bonus: replayed mini-game plays are deterministic
S = fresh(); S.zol = 30;
playMiniGame(S, "bone_dice", { stake: 3, diceWin: true });
playMiniGame(S, "qcm_duel", { hits: [true, true, false] });
const A = replayWorld(S.world), B = replayWorld(S.world);
ok(JSON.stringify([A.knowledge, A.reputation, A.customGames.length]) ===
   JSON.stringify([B.knowledge, B.reputation, B.customGames.length]), "bonus: mini-game history replays identically");
// bonus: portal reflex locked below reputation threshold
S = fresh();
ok(playMiniGame(S, "portal_reflex", { hits: [1,1,1,1,1] }) === null, "bonus: Portal Reflex refuses before rep 20");

console.log(`\nselftest: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
