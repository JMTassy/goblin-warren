// Falsifier run for supervision mechanism #8 (contradiction register).
// Claim under test: identical proposal signatures recurring with OPPOSING
// verdicts are frequent enough to observe. Opus's falsifier: instrument 1,000
// playthroughs; fewer than ~1 register hit per playthrough => the register is
// a data structure with no observations — fold it or drop it.
// Deterministic: seeded LCG, no Math.random/Date. authority=false.
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");
const m = html.match(/\/\* ===== REDUCER-BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END/);
(0, eval)(m[1] + ";globalThis.QUESTIONS=QUESTIONS;globalThis.h32=h32;");

function lcg(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

let totalProposals = 0, totalHits = 0, opposing = 0, playsWithHit = 0;
const RUNS = 1000, STEPS = 40;
for (let run = 0; run < RUNS; run++) {
  const rnd = lcg(run + 1);
  const S = makeState(); startGame(S);
  const reg = new Map(); let hitThis = false;
  for (let i = 0; i < STEPS; i++) {
    const qi = Math.floor(rnd() * QUESTIONS.length);
    answerQuestion(S, qi, rnd() < 0.8 ? QUESTIONS[qi].correctIndex : (QUESTIONS[qi].correctIndex + 1) % 4);
    const avail = S.territories.map((t, ix) => t.state === "available" ? ix : -1).filter(x => x >= 0);
    if (avail.length && rnd() < 0.5) buyTerritory(S, avail[Math.floor(rnd() * avail.length)]);
    const owned = S.territories.map((t, ix) => t.state === "owned" ? ix : -1).filter(x => x >= 0);
    if (owned.length) {
      const ti = owned[Math.floor(rnd() * owned.length)];
      const p = createProposal(S, ti, "s" + Math.floor(rnd() * 4));
      const v = checkProposalWithHAL(S, p);
      totalProposals++;
      const sig = h32(p.agent + p.tIndex + p.text);
      if (reg.has(sig)) {
        totalHits++; hitThis = true;
        const prior = reg.get(sig);
        if ((prior === "ACCEPTABLE" && v === "DENY") || (prior === "DENY" && v === "ACCEPTABLE")) opposing++;
      } else reg.set(sig, v);
      if (v === "ACCEPTABLE" && rnd() < 0.6) { S.pending = p; admitProposal(S); }
    }
    if (S.phase === "GAME_WON") break;
  }
  if (hitThis) playsWithHit++;
}
const perPlay = totalHits / RUNS;
console.log(JSON.stringify({
  runs: RUNS, proposals: totalProposals,
  signature_recurrences: totalHits, recurrences_per_playthrough: +perPlay.toFixed(3),
  opposing_verdict_hits: opposing, playthroughs_with_any_hit: playsWithHit,
  falsifier_threshold: "~1 per playthrough",
  verdict: perPlay < 1 ? "FALSIFIED — register has (almost) nothing to observe; fold into win-audit or drop"
                       : "SURVIVES — enough recurrences to justify the register"
}, null, 1));
