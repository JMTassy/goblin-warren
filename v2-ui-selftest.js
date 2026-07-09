// Dream of Conquest v2 - headless UI-ZONE selftest (authority=false, NO_CLAIM)
//
// Complements v2-selftest.js (which only exercises the pure REDUCER zone).
// This harness extracts the FULL script (REDUCER zone + UI zone) from v2.html
// and evaluates it against a minimal stubbed browser surface, then drives the
// real ui*() glue functions directly (uiStart, uiPropose, uiAdmit, uiRestart,
// ...) — never initThree(), never a real THREE/WebGL context.
//
// Why: the packet's admitted findings are about UI-zone async races (a
// pending fetch()/LLM continuation writing into a world that has since moved
// on: selection changed, or the game restarted) and about untrusted LLM text
// reaching innerHTML unescaped. Those can only be observed by driving the
// actual async UI functions with a controllable fetch() — the pure reducer
// harness cannot see them because it never calls generateProposalText().
//
// No network calls happen here: fetch() is fully stubbed and its resolution
// timing is controlled by each test, to force real interleavings (change
// selection mid-await, restart mid-await, resolve malicious text, etc).
const fs = require("fs");
const path = require("path");
const target = process.argv[2] || "v2.html";
const html = fs.readFileSync(path.join(__dirname, target), "utf8");
console.log("target: " + target);

const startMarker = '"use strict";';
const startIdx = html.indexOf(startMarker);
const endIdx = html.lastIndexOf("</script>");
if (startIdx === -1 || endIdx === -1) { console.log("FAIL: could not locate script body"); process.exit(1); }
const scriptBody = html.slice(startIdx + startMarker.length, endIdx);

let failed = 0, passed = 0;
function ok(cond, name) { if (cond) { passed++; console.log("  [ok] " + name); } else { failed++; console.log("  [FAIL] " + name); } }
function has(ledger, kind) { return ledger.some(e => e.kind === kind); }

// ---- minimal browser-surface stubs ----
function makeStubElement() {
  return { style: {}, textContent: "", innerHTML: "", disabled: false, value: "", checked: false,
    className: "", onclick: null, appendChild() {}, addEventListener() {} };
}
function makeDocumentStub() {
  const elements = new Map();
  return {
    _elements: elements,
    getElementById(id) { if (!elements.has(id)) elements.set(id, makeStubElement()); return elements.get(id); },
    createElement() { return makeStubElement(); },
    body: { appendChild() {} },
    addEventListener() {}
  };
}
function makeWindowStub() {
  return { addEventListener() {}, removeEventListener() {}, innerWidth: 800, innerHeight: 600, prompt() { return null; }, onload: null };
}
function makeSessionStorageStub() {
  const store = {};
  return {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; }
  };
}
// Controllable fetch: each call parks a deferred promise instead of hitting the network.
// Tests decide exactly when (and with what payload) each pending request resolves,
// so we can force real mid-await interleavings deterministically.
function makeFetchStub() {
  const pending = [];
  function fetchFn(url, opts) {
    let resolve, reject;
    const p = new Promise((res, rej) => { resolve = res; reject = rej; });
    pending.push({ url, opts, resolve, reject });
    return p;
  }
  fetchFn.pending = pending;
  fetchFn.resolveNext = function (bodyObj, ok) {
    const entry = pending.shift();
    if (!entry) throw new Error("no pending fetch to resolve");
    entry.resolve({ ok: ok !== false, status: ok === false ? 500 : 200, json: async () => bodyObj });
  };
  return fetchFn;
}

// Loads a FRESH instance of the whole v2.html script (reducer + UI zones) into
// globalThis. Indirect eval of non-strict top-level code makes every
// `function foo(){}` declaration land on globalThis (this is exactly how
// v2-selftest.js already calls startGame/answerQuestion/etc. directly after
// eval, with no manual export) — so uiPropose, uiAdmit, uiRestart, selectNode,
// startGame, buyTerritory etc. are all callable as bare globals immediately
// after loadModule() returns. Only the top-level `let` bindings (S, selected,
// meshes, scene, ...) are NOT globalThis properties; for those we append a
// tiny `__internal` export block (same technique v2-selftest.js uses for
// QUESTIONS/PERSONAS/TERRITORY_DEFS) plus a one-shot stub setup for the
// THREE-backed render vars normally populated by initThree() — which this
// harness deliberately never calls.
function loadModule() {
  const doc = makeDocumentStub();
  const win = makeWindowStub();
  const storage = makeSessionStorageStub();
  const fetchStub = makeFetchStub();
  globalThis.document = doc;
  globalThis.window = win;
  globalThis.sessionStorage = storage;
  globalThis.fetch = fetchStub;
  globalThis.performance = { now: () => Date.now() };
  globalThis.THREE = { Color: function (v) { this.hex = v; } };
  globalThis.console = console;

  const exportBlock = `
;globalThis.__internal = {
  getS: function(){ return S; },
  getSelected: function(){ return selected; }
};
meshes = S.territories.map(function(){ return { material: { color: { setHex: function(){} }, emissive: null } }; });
scene = { fog: { density: 0.01 } };
renderer = { setClearColor: function(){} };
castle = { getObjectByName: function(){ return null; } };
`;
  (0, eval)(scriptBody + exportBlock); // indirect eval -> sloppy top-level scope, matches v2-selftest.js technique
  return { doc, win, storage, fetchStub, internal: globalThis.__internal };
}

// Common setup shared by every scenario: fresh module, force the LLM path
// (so fetch() actually gets called and we control its timing), start the
// game, and make territory 0 owned with ample ZOL so uiPropose() is legal.
function setupOwned(idx) {
  const mod = loadModule();
  mod.storage.setItem("gw_llm_key", "sk-ant-test-fake-key");
  uiStart(); // -> phase GARDEN_MAP, selected=0 (bare global call: see loadModule doc comment)
  const S = mod.internal.getS();
  S.zol = 999;
  S.territories[idx].state = "owned";
  S.territories[idx].level = 1;
  selectNode(idx);
  return mod;
}

// ============================================================
// Scenario A: propose on X, change selection to Y mid-await,
// resolve, attempt admit -> must attach to X, no mutation of Y,
// portal-council not skipped.
// ============================================================
(async function scenarioA() {
  const X = 9; // a PORTALS index (9,10,11) - forces council-scale (p.big) regardless of cost
  const Y = 0;
  const mod = setupOwned(X);
  const S = mod.internal.getS();
  const yBefore = JSON.stringify(S.territories[Y]);

  const inflight = uiPropose(); // captures pick.tIndex=X synchronously, then pauses at fetch()
  ok(mod.fetchStub.pending.length === 1, "A: uiPropose reached the fetch() await point");

  // mid-await: player changes selection to Y before the LLM call resolves
  selectNode(Y);
  ok(mod.internal.getSelected() === Y, "A: selection changed to Y mid-await");

  mod.fetchStub.resolveNext({ content: [{ text: "A crooked improvement for the portal" }] });
  await inflight;

  ok(S.pending && S.pending.tIndex === X, "A: resolved proposal attaches to X, the territory captured pre-await, not Y");
  ok(JSON.stringify(S.territories[Y]) === yBefore, "A: territory Y was not mutated by the stale continuation");
  ok(mod.doc.getElementById("council").style.display === "flex", "A: portal-council was not skipped despite mid-await selection change");
  ok(S.pending.big === true, "A: pending proposal retains council-scale flag from the pre-await capture");
})().then(next1, fail1);

function fail1(err) { failed++; console.log("  [FAIL] scenario A threw: " + err.stack); next1(); }
function next1() { scenarioB(); }

// ============================================================
// Scenario B: propose, uiRestart mid-await, resolve, press A ->
// no crash, no phantom admission, fresh game clean.
// ============================================================
async function scenarioB() {
  try {
    const X = 0;
    const mod = setupOwned(X);
    const oldS = mod.internal.getS();
    const oldEpoch = oldS.gameEpoch;

    const inflight = uiPropose();
    ok(mod.fetchStub.pending.length === 1, "B: uiPropose reached the fetch() await point");

    // mid-await: player restarts the game entirely
    uiRestart();
    const freshS = mod.internal.getS();
    ok(freshS !== oldS, "B: uiRestart replaced S with a fresh object");
    ok(freshS.gameEpoch === oldEpoch + 1, "B: uiRestart increments gameEpoch");
    ok(freshS.pending === null, "B: fresh state has no pending proposal immediately after restart");

    mod.fetchStub.resolveNext({ content: [{ text: "a stale idea from a dead epoch" }] });
    await inflight;

    const S = mod.internal.getS();
    ok(S === freshS, "B: post-await, the live S is still the fresh (post-restart) state");
    ok(S.pending === null, "B: no phantom proposal was attached after the stale continuation resolved");
    ok(!has(S.ledger, "NPC_PROPOSAL_CREATED"), "B: stale continuation did not write a proposal into the fresh ledger");

    const ledgerLenBefore = S.ledger.length;
    let threw = false;
    try { uiAdmit(); } catch (e) { threw = true; }
    ok(!threw, "B: pressing A after a mid-await restart does not crash");
    ok(S.pending === null, "B: uiAdmit after restart still has no pending proposal (no phantom admission)");
    ok(S.ledger.length === ledgerLenBefore, "B: uiAdmit no-op after restart writes no ledger entries");
    ok(S.phase === "START", "B: fresh game is clean (still on START screen, restart doesn't auto-start)");
  } catch (err) {
    failed++; console.log("  [FAIL] scenario B threw: " + err.stack);
  }
  scenarioC();
}

// ============================================================
// Scenario C: LLM text containing a script-injection payload must
// reach the ledger HTML escaped, never as live markup.
// ============================================================
async function scenarioC() {
  try {
    const X = 0;
    const mod = setupOwned(X);
    const payload = "<img src=x onerror=alert(1)>";

    const inflight = uiPropose();
    mod.fetchStub.resolveNext({ content: [{ text: payload }] });
    await inflight;

    const S = mod.internal.getS();
    ok(S.pending && S.pending.text.includes("<img"), "C: sanity — the raw malicious text did land in proposal state (unsanitized in-memory, as expected)");
    const ledgerHTML = mod.doc.getElementById("ledger").innerHTML;
    ok(ledgerHTML.includes("&lt;img"), "C: ledger innerHTML contains the HTML-escaped payload");
    ok(!/<img[\s/]/i.test(ledgerHTML), "C: ledger innerHTML does NOT contain the raw, live <img> tag");
  } catch (err) {
    failed++; console.log("  [FAIL] scenario C threw: " + err.stack);
  }
  scenarioE();
}

// ============================================================
// Scenario E: reach GAME_WON with a pending proposal -> uiAdmit/
// uiDeny/uiHold must all no-op: no state or ledger delta.
// ============================================================
async function scenarioE() {
  try {
    const mod = loadModule();
    uiStart();
    const S = mod.internal.getS();
    S.zol = 999;
    S.territories[0].state = "owned"; S.territories[0].level = 1;
    S.pending = { id: "pWin", tIndex: 0, agent: "GOBLIN", text: "irrelevant text", voice: "heh.",
      cost: 0, big: false, verdict: "ACCEPTABLE", gameEpoch: S.gameEpoch, territoryKey: S.territories[0].name };
    S.phase = "GAME_WON"; // canon-closed

    const before = JSON.stringify(S);
    uiAdmit();
    ok(JSON.stringify(S) === before, "E: uiAdmit no-ops after GAME_WON (no state delta)");
    uiDeny();
    ok(JSON.stringify(S) === before, "E: uiDeny no-ops after GAME_WON (no state delta)");
    uiHold();
    ok(JSON.stringify(S) === before, "E: uiHold no-ops after GAME_WON (no state delta)");
    ok(S.pending !== null && S.pending.id === "pWin", "E: pending proposal survives untouched (never nulled by a no-op)");
  } catch (err) {
    failed++; console.log("  [FAIL] scenario E threw: " + err.stack);
  }
  finish();
}

function finish() {
  console.log(`\nv2 UI selftest: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
