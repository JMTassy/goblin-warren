// K(belief) — epistemic curvature on the Warren. authority=false · NO_CLAIM.
// K(belief) = number of ledger events whose replay is required to re-derive
// the belief from the event stream alone (plus the frozen law surface:
// TERRITORY_DEFS prices/prestige, PERSONAS cost functions).
// Doubles as a V0-scale instance of the convergence test:
//   ReplayEvents(ledger) =?= live reducer state, per belief.
// Deterministic (seeded LCG). Also probes the 250-event cap horizon.
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");
const m = html.match(/\/\* ===== REDUCER-BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END/);
(0, eval)(m[1] + ";globalThis.QUESTIONS=QUESTIONS;globalThis.PERSONAS=PERSONAS;globalThis.TERRITORY_DEFS=TERRITORY_DEFS;");
const lcg = s => { let x = s >>> 0; return () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296; };
const defByName = {}; TERRITORY_DEFS.forEach(d => defByName[d[0]] = { price: d[1], prestige: Math.floor(d[1]/2)+2 }); // frozen law surface: [name, price] + prestige formula from makeState

function replayBeliefs(L) {  // reconstruction from events alone
  const B = { zol: 0, reputation: 0, knowledge: 0, ownedCount: 0, compost: 0, held: 0, levels: 0 };
  const K = Object.fromEntries(Object.keys(B).map(k => [k, 0]));
  const lvl = {};  // per-territory level, read from receipts (absolute, not incremental)
  for (const e of L) {
    if (e.kind === "GAME_STARTED") { B.zol += 15; K.zol++; }
    else if (e.kind === "ZOL_EARNED") { B.zol += parseInt(e.detail, 10); K.zol++; }
    else if (e.kind === "QUESTION_ANSWERED_CORRECT") { B.knowledge++; K.knowledge++; }
    else if (e.kind === "TERRITORY_BOUGHT") {
      const d = defByName[e.detail]; B.zol -= d.price; B.reputation += d.prestige;
      B.ownedCount++; lvl[e.detail] = 1; K.zol++; K.reputation++; K.ownedCount++; K.levels++;
    } else if (e.kind === "PROPOSAL_ADMITTED") {
      const mm = e.detail.match(/^(\S+) at (.+)$/);
      const cost = PERSONAS[mm[1]].cost({ price: defByName[mm[2]].price });
      B.zol -= cost; B.reputation += 2;
      K.zol++; K.reputation++;
    } else if (e.kind === "GARDEN_EVOLVED") {
      const gm = e.detail.match(/^(.+) L(\d)$/); lvl[gm[1]] = parseInt(gm[2], 10); K.levels++;
    } else if (e.kind === "PROPOSAL_DENIED") { B.compost++; K.compost++; }
    else if (e.kind === "PROPOSAL_HELD") { B.held++; K.held++; }
  }
  B.levels = Object.values(lvl).reduce((a, x) => a + x, 0);
  return { B, K };
}

const RUNS = 200, agg = {}, mism = {};
let capHits = 0, fullMatchRuns = 0;
for (let run = 0; run < RUNS; run++) {
  const rnd = lcg(run + 7); const S = makeState(); startGame(S);
  for (let i = 0; i < 40 && S.phase !== "GAME_WON"; i++) {
    const qi = Math.floor(rnd() * QUESTIONS.length);
    answerQuestion(S, qi, rnd() < 0.8 ? QUESTIONS[qi].correctIndex : (QUESTIONS[qi].correctIndex + 1) % 4);
    const avail = S.territories.map((t, ix) => t.state === "available" ? ix : -1).filter(x => x >= 0);
    if (avail.length && rnd() < 0.5) buyTerritory(S, avail[Math.floor(rnd() * avail.length)]);
    const owned = S.territories.map((t, ix) => t.state === "owned" || t.state === "evolved" ? ix : -1).filter(x => x >= 0);
    if (owned.length && rnd() < 0.7) {
      const p = createProposal(S, owned[Math.floor(rnd() * owned.length)], "k" + i);
      const v = checkProposalWithHAL(S, p); S.pending = p;
      if (v === "ACCEPTABLE") { rnd() < 0.7 ? admitProposal(S) : denyProposal(S); }
      else if (v === "HOLD") holdProposal(S);
      else denyProposal(S);
    }
  }
  if (S.ledger.length >= 250) capHits++;
  const { B, K } = replayBeliefs(S.ledger);
  const live = { zol: S.zol, reputation: S.reputation, knowledge: S.knowledge,
    ownedCount: S.ownedCount, compost: S.compost, held: S.held,
    levels: S.territories.reduce((a, t) => a + t.level, 0) };
  let all = true;
  for (const k of Object.keys(B)) {
    agg[k] = (agg[k] || 0) + K[k];
    if (B[k] !== live[k]) { mism[k] = (mism[k] || 0) + 1; all = false; }
  }
  if (all) fullMatchRuns++;
}
const table = Object.keys(agg).map(k => ({
  belief: k, mean_K: +(agg[k] / RUNS).toFixed(1),
  replay_matches_reducer: RUNS - (mism[k] || 0) + "/" + RUNS,
  curvature: agg[k] / RUNS > 20 ? "high (stable, deeply historied)" : agg[k] / RUNS > 5 ? "mid" : "low (fragile, cheap to revise)"
}));
console.log(JSON.stringify({ runs: RUNS, ledger_cap_hits: capHits,
  full_state_convergence_runs: fullMatchRuns + "/" + RUNS, K_table: table }, null, 1));
