#!/usr/bin/env node
/* goblin-warren-fuzz.js — GOBLIN swarm debug loop for the FROZEN slice.
   Seeded policy-players fuzz the reducer through dispatch (the one legal door),
   checking invariants every step + full replay equality per run.
   Verification instrument (Fable lane) · authority=false · NO_CLAIM
   usage: node goblin-warren-fuzz.js [goblin-warren.html] [stepsPerRun] */
"use strict";
const fs = require("fs");
const file = process.argv[2] || "goblin-warren.html";
const STEPS = parseInt(process.argv[3] || "1200", 10);
const html = fs.readFileSync(file, "utf8");
const m = html.match(/\/\* ===== REDUCER-BEGIN =====[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END ===== \*\//);
if (!m) { console.error("REDUCER markers not found"); process.exit(1); }
const R = new Function(m[1] + `
;return {h32,QUESTIONS,MAPS,MAP_BY_ID,BOTS,BOT_NAMES,INHABITANTS,makeState,mapState,dispatch,replayEvents,simWorldTick,ownedOnMap};`)();

const V = []; // violations
function check(S, ctx) {
  if (!(Number.isFinite(S.zol) && S.zol >= 0)) V.push(ctx + " :: negative/NaN ZOL " + S.zol);
  if (!(S.cohesion >= 0 && S.cohesion <= 120)) V.push(ctx + " :: cohesion out of bounds " + S.cohesion);
  if (S.dreams.length > 9) V.push(ctx + " :: dream queue overflow " + S.dreams.length);
  const ms = S.maps[S.mapId]; if (ms) ms.sites.forEach((st, i) => {
    if (!["locked","available","owned","evolved"].includes(st.state)) V.push(ctx + " :: bad site state " + st.state);
    if (st.level < 0 || st.level > 3) V.push(ctx + " :: level out of bounds " + st.level);
  });
}
const POLICIES = {
  scholar: h => h % 10 < 7 ? "q_ok" : h % 10 < 9 ? "claim" : "prop_admit",
  hoarder: h => h % 10 < 5 ? "q_ok" : h % 10 < 9 ? "claim" : "prop_hold",
  chaos:   h => ["q_bad","claim","prop_admit","prop_deny","prop_hold","match","dreams","pick","map"][h % 9],
  denier:  h => h % 10 < 5 ? "q_ok" : h % 10 < 8 ? "prop_deny" : "claim",
  holder:  h => h % 10 < 5 ? "q_ok" : h % 10 < 8 ? "prop_hold" : "claim",
  arenafan:h => h % 10 < 4 ? "q_ok" : h % 10 < 7 ? "match" : "claim",
};
let totalSteps = 0, admitted = 0, matches = 0, t0 = Date.now();
for (const [pname, pol] of Object.entries(POLICIES)) {
  for (let seedN = 0; seedN < 4; seedN++) {
    const seed = pname + "#" + seedN;
    const S = R.makeState(); const LOG = [];
    const act = ev => { const ok = R.dispatch(S, ev); if (ok) LOG.push(ev); return ok; };
    act({ k: "start" });
    for (let i = 0; i < STEPS; i++) {
      const h = R.h32(seed + "|" + i);
      const move = pol(h);
      const preZol = S.zol, prePendingV = S.pending ? S.pending.verdict : null;
      try {
        switch (move) {
          case "q_ok": { const qi = h % R.QUESTIONS.length; act({ k: "q", qi, c: R.QUESTIONS[qi].a }); break; }
          case "q_bad": { const qi = h % R.QUESTIONS.length; act({ k: "q", qi, c: (R.QUESTIONS[qi].a + 1 + (h % 3)) % 4 }); break; }
          case "claim": { const ms = R.mapState(S); const av = []; ms.sites.forEach((st, j) => { if (st.state === "available") av.push(j) });
            if (av.length) act({ k: "claim", s: av[h % av.length] }); break; }
          case "prop_admit": case "prop_deny": case "prop_hold": {
            const ms = R.mapState(S); const ow = []; ms.sites.forEach((st, j) => { if (st.state === "owned" || st.state === "evolved") ow.push(j) });
            if (!ow.length) break;
            if (act({ k: "prop", s: ow[h % ow.length], seed: seed + i })) {
              const wasAcceptable = S.pending && S.pending.verdict === "ACCEPTABLE";
              const d = move.slice(5);
              const ok = act({ k: d === "admit" ? "admit" : d === "deny" ? "deny" : "hold" });
              if (d === "admit" && ok && !wasAcceptable) V.push(seed + "@" + i + " :: ADMIT PAST HAL (verdict was not ACCEPTABLE)");
              if (d === "admit" && ok) admitted++;
            } break; }
          case "match": { const a = R.BOT_NAMES[h % 5]; let b = R.BOT_NAMES[(h >>> 4) % 5]; if (a === b) b = R.BOT_NAMES[(h % 5 + 1) % 5];
            const z = S.zol; if (act({ k: "match", a, b, seed: seed + i })) { matches++;
              if (S.zol !== z) V.push(seed + "@" + i + " :: MATCH MINTED/BURNED PLAYER ZOL " + z + "->" + S.zol); } break; }
          case "dreams": act({ k: "dreams", n: 1 + (h % 5), seed: seed + i }); break;
          case "pick": if (S.dreams.length) act({ k: "pick", n: h % S.dreams.length }); break;
          case "map": { const um = S.unlockedMaps; act({ k: "map", m: um[h % um.length] }); break; }
        }
      } catch (e) { V.push(seed + "@" + i + " :: THROW " + String(e).slice(0, 90)); break; }
      check(S, seed + "@" + i);
      if (i % 50 === 0 && S.started) { // world-tick purity probe
        const snap = JSON.stringify(S); R.simWorldTick(S, i);
        if (JSON.stringify(S) !== snap) { V.push(seed + "@" + i + " :: simWorldTick MUTATED STATE"); break; }
      }
      totalSteps++;
    }
    // replay law: reality = replay(log)
    const S2 = R.replayEvents(LOG);
    if (JSON.stringify(S) !== JSON.stringify(S2)) V.push(seed + " :: REPLAY DIVERGENCE (live != replay(log)) after " + LOG.length + " events");
  }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log("fuzz: " + totalSteps + " steps · " + admitted + " admissions · " + matches + " arena matches · " + secs + "s");
if (V.length) { console.log("VIOLATIONS: " + V.length); V.slice(0, 12).forEach(v => console.log("  [x] " + v)); process.exit(1); }
console.log("VIOLATIONS: 0 — the lantern held. Replay law intact across all runs.");
