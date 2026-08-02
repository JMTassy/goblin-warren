// K_basis(b) = |ReplayBasis(b)| — minimal receipt subset sufficient to
// reconstruct belief b, measured by single-event ablation: an event is in the
// basis iff removing it changes the replayed belief. Compares against K_len
// (events consumed). Also checks the LOCALITY property: appending receipts
// that do not touch a belief must leave K(b) unchanged.
// Deterministic. authority=false · NO_CLAIM.
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");
const m = html.match(/\/\* ===== REDUCER-BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END/);
(0, eval)(m[1] + ";globalThis.QUESTIONS=QUESTIONS;globalThis.PERSONAS=PERSONAS;globalThis.TERRITORY_DEFS=TERRITORY_DEFS;");
const lcg = s => { let x = s >>> 0; return () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296; };
const defByName = {}; TERRITORY_DEFS.forEach(d => defByName[d[0]] = { price: d[1], prestige: Math.floor(d[1] / 2) + 2 });

function replay(L) {
  const B = { zol: 0, reputation: 0, knowledge: 0, ownedCount: 0, compost: 0, held: 0, levels: 0 };
  const K = Object.fromEntries(Object.keys(B).map(k => [k, 0])); const lvl = {};
  for (const e of L) {
    if (e.kind === "GAME_STARTED") { B.zol += 15; K.zol++; }
    else if (e.kind === "ZOL_EARNED") { B.zol += parseInt(e.detail, 10); K.zol++; }
    else if (e.kind === "QUESTION_ANSWERED_CORRECT") { B.knowledge++; K.knowledge++; }
    else if (e.kind === "TERRITORY_BOUGHT") {
      const d = defByName[e.detail]; B.zol -= d.price; B.reputation += d.prestige;
      B.ownedCount++; lvl[e.detail] = 1; K.zol++; K.reputation++; K.ownedCount++; K.levels++;
    } else if (e.kind === "PROPOSAL_ADMITTED") {
      const mm = e.detail.match(/^(\S+) at (.+)$/);
      B.zol -= PERSONAS[mm[1]].cost({ price: defByName[mm[2]].price }); B.reputation += 2;
      K.zol++; K.reputation++;
    } else if (e.kind === "GARDEN_EVOLVED") {
      const gm = e.detail.match(/^(.+) L(\d)$/); lvl[gm[1]] = parseInt(gm[2], 10); K.levels++;
    } else if (e.kind === "PROPOSAL_DENIED") { B.compost++; K.compost++; }
    else if (e.kind === "PROPOSAL_HELD") { B.held++; K.held++; }
  }
  B.levels = Object.values(lvl).reduce((a, x) => a + x, 0);
  return { B, K };
}

const RUNS = 20, BELIEFS = ["zol","reputation","knowledge","ownedCount","compost","held","levels"];
const sumLen = {}, sumBasis = {}; let localityPass = 0;
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
      else if (v === "HOLD") holdProposal(S); else denyProposal(S);
    }
  }
  const L = S.ledger, full = replay(L);
  const basis = Object.fromEntries(BELIEFS.map(b => [b, 0]));
  for (let e = 0; e < L.length; e++) {
    const abl = replay(L.slice(0, e).concat(L.slice(e + 1)));
    for (const b of BELIEFS) if (abl.B[b] !== full.B[b]) basis[b]++;
  }
  for (const b of BELIEFS) { sumLen[b] = (sumLen[b] || 0) + full.K[b]; sumBasis[b] = (sumBasis[b] || 0) + basis[b]; }
  // LOCALITY: append 5 tag receipts (touch nothing) — all beliefs and K must be unchanged
  const Ltag = L.concat([1,2,3,4,5].map(i => ({ kind: "tag", detail: "loc" + i })));
  const tagged = replay(Ltag);
  if (BELIEFS.every(b => tagged.B[b] === full.B[b] && tagged.K[b] === full.K[b])) localityPass++;
}
console.log(JSON.stringify({
  runs: RUNS, locality_property: localityPass + "/" + RUNS,
  table: BELIEFS.map(b => ({
    belief: b, K_len: +(sumLen[b] / RUNS).toFixed(1), K_basis: +(sumBasis[b] / RUNS).toFixed(1),
    supersession: sumBasis[b] < sumLen[b] ? "YES — receipts carry absolute state; older ones superseded" : "none — every receipt in the cone is load-bearing"
  }))
}, null, 1));
