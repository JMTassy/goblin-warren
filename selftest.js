#!/usr/bin/env node
/*
  Goblin Warren V1 selftest — headless assertions over the pure reducer zone.
  authority=false · claim=NO_CLAIM · non-sovereign
  Usage: node selftest.js index.html
  Extracts the code between REDUCER-BEGIN/REDUCER-END markers and runs it
  under Node with no DOM. Exit 1 on any failure.
*/
"use strict";
const fs = require("fs");

const file = process.argv[2] || "index.html";
const html = fs.readFileSync(file, "utf8");

const m = html.match(/\/\* ===== REDUCER-BEGIN =[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END =/);
if (!m) { console.error("FATAL: reducer markers not found in " + file); process.exit(1); }
const zone = m[1];

/* --- static law checks on the reducer zone itself ------------------------ */
let passed = 0, failed = 0;
function assert(name, cond){
  if (cond) { passed++; console.log("  ok  " + name); }
  else { failed++; console.error("FAIL  " + name); }
}

assert("reducer zone: no Math.random", !/Math\.random/.test(zone));
assert("reducer zone: no Date constructor or Date.now", !/\bnew Date\b|\bDate\.now\b/.test(zone));
assert("reducer zone: no DOM/browser APIs", !/\bdocument\.|\bwindow\.|\blocalStorage\b|\bTHREE\b/.test(zone));

/* --- evaluate the zone headlessly ---------------------------------------- */
(0, eval)(zone);

const T0 = 1750000000000;             // fixed epoch for determinism
const DAY = 86400000;

/* --- makeState ----------------------------------------------------------- */
let S = makeState(T0);
assert("makeState: version stamped", S.v === "GW_V1_M1");
assert("makeState: Lulu present with mood+energy", S.goblin.name === "Lulu" && S.goblin.mood === 50 && S.goblin.energy === 80);
assert("makeState: starting resources", S.res.seeds === 1 && S.res.ideas === 2 && S.res.bugs === 0 && S.res.memories === 0);
assert("makeState: WARREN_STARTED logged", S.events.length === 1 && S.events[0].k === "WARREN_STARTED");

/* --- proposal determinism ------------------------------------------------ */
let A = makeState(T0), B = makeState(T0);
nextProposal(A, T0); nextProposal(B, T0);
assert("proposal: same state → same proposal", A.current && B.current && A.current.id === B.current.id);
assert("proposal: PROPOSAL_MADE logged", A.events.some(e => e.k === "PROPOSAL_MADE"));

/* --- TRY: exact effects, mood up, event logged --------------------------- */
S = makeState(T0); nextProposal(S, T0);
const p = S.current;
const moodBefore = S.goblin.mood, seedsBefore = S.res.seeds, bugsBefore = S.res.bugs, ideasBefore = S.res.ideas;
decide(S, "try", T0 + 1000);
assert("try: exact resource effects", S.res.seeds === seedsBefore + p.seeds && S.res.bugs === bugsBefore + p.bugs && S.res.ideas === ideasBefore + p.ideas);
assert("try: mood rises by proposal mood", S.goblin.mood === moodBefore + p.mood);
assert("try: energy cost applied", S.goblin.energy === 74);
assert("try: proposal cleared + action counted", S.current === null && S.actions === 1);
assert("try: PROPOSAL_TRIED logged", S.events.some(e => e.k === "PROPOSAL_TRIED"));

/* --- memory born every 3rd try ------------------------------------------ */
S = makeState(T0);
for (let i = 0; i < 3; i++){ nextProposal(S, T0 + i); decide(S, "try", T0 + i); }
assert("memory: born after 3 tries", S.memories.length === 1 && S.res.memories === 1);
assert("memory: MEMORY_BORN logged", S.events.some(e => e.k === "MEMORY_BORN"));

/* --- HOLD ---------------------------------------------------------------- */
S = makeState(T0); nextProposal(S, T0);
const heldId = S.current.id;
decide(S, "hold", T0 + 1);
assert("hold: recorded in held list", S.heldCount === 1 && S.held[0] === heldId);
assert("hold: PROPOSAL_HELD logged", S.events.some(e => e.k === "PROPOSAL_HELD"));

/* --- COMPOST: 3 composts bloom a seed ------------------------------------ */
S = makeState(T0);
const seeds0 = S.res.seeds;
for (let i = 0; i < 3; i++){ nextProposal(S, T0 + i); decide(S, "compost", T0 + i); }
assert("compost: 3 composts → +1 seed", S.compost === 3 && S.res.seeds === seeds0 + 1);
assert("compost: COMPOST_BLOOMED logged", S.events.some(e => e.k === "COMPOST_BLOOMED"));

/* --- invalid decision is a no-op (fail-closed) --------------------------- */
S = makeState(T0); nextProposal(S, T0);
const snap = JSON.stringify(S);
decide(S, "yeet", T0 + 1);
assert("decide: unknown choice mutates nothing", JSON.stringify(S) === snap);

/* --- care: diminishing returns ------------------------------------------- */
S = makeState(T0);
const m0 = S.goblin.mood;
care(S, "listen", T0);            // +8
const gain1 = S.goblin.mood - m0;
const m1 = S.goblin.mood;
care(S, "listen", T0 + 1);        // +5
const gain2 = S.goblin.mood - m1;
assert("care: listen lifts mood", gain1 === 8);
assert("care: diminishing returns", gain2 < gain1 && gain2 === 5);
assert("care: CARE_GIVEN logged", S.events.filter(e => e.k === "CARE_GIVEN").length === 2);
S = makeState(T0); S.goblin.energy = 40;
care(S, "matcha", T0);
assert("care: matcha restores energy", S.goblin.energy === 58);
S = makeState(T0);
care(S, "bonk", T0);
assert("care: unknown verb is a no-op", S.actions === 0 && S.goblin.mood === 50);

/* --- mood labels --------------------------------------------------------- */
S = makeState(T0);
S.goblin.energy = 10; assert("mood: low energy → tired", moodLabel(S) === "tired");
S.goblin.energy = 80;
S.goblin.mood = 80;  assert("mood: 80 → happy",   moodLabel(S) === "happy");
S.goblin.mood = 50;  assert("mood: 50 → curious", moodLabel(S) === "curious");
S.goblin.mood = 30;  assert("mood: 30 → calm",    moodLabel(S) === "calm");
S.goblin.mood = 5;   assert("mood: 5 → focused",  moodLabel(S) === "focused");
S.goblin.mood = -40; assert("mood: -40 → worried",moodLabel(S) === "worried");

/* --- day passage --------------------------------------------------------- */
S = makeState(T0);
S.goblin.energy = 30;
tick(S, T0 + 2 * DAY);
assert("tick: two days pass", S.day === 3);
assert("tick: energy regenerates", S.goblin.energy === 90);
assert("tick: DAY_PASSED logged", S.events.some(e => e.k === "DAY_PASSED"));
const evCount = S.events.length;
tick(S, T0 + 2 * DAY + 1000);
assert("tick: same day → no event", S.events.length === evCount);

/* --- persistence round-trip (fail-closed loader) ------------------------- */
S = makeState(T0); nextProposal(S, T0); decide(S, "try", T0); care(S, "listen", T0);
const json = serialize(S);
const L = loadState(json, T0 + 1000);
assert("persist: round-trip restores state", L && L.res.seeds === S.res.seeds && L.goblin.mood === S.goblin.mood && L.memories.length === S.memories.length);
assert("persist: WARREN_LOADED logged", L.events.some(e => e.k === "WARREN_LOADED"));
assert("persist: corrupt JSON → null", loadState("{nope", T0) === null);
assert("persist: wrong version → null", loadState(JSON.stringify({v:"OLD", createdAt:1, actions:0}), T0) === null);
assert("persist: empty string → null", loadState("", T0) === null);

/* --- event cap ----------------------------------------------------------- */
S = makeState(T0);
for (let i = 0; i < 300; i++) care(S, "listen", T0 + i);
assert("events: capped at 250", S.events.length <= 250);

/* --- state stays JSON-plain ---------------------------------------------- */
S = makeState(T0); nextProposal(S, T0);
assert("state: survives JSON round-trip identically", JSON.stringify(JSON.parse(JSON.stringify(S))) === JSON.stringify(S));

/* ------------------------------------------------------------------------- */
console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
