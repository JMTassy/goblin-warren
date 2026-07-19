#!/usr/bin/env node
/* goblin-warren-selftest.js — headless witness for goblin-warren.html
   1. parse-checks every inline <script> (syntax only, nothing executed)
   2. extracts the REDUCER-BEGIN..REDUCER-END block (pure, no DOM/THREE)
   3. runs runSelftestCore() and reports SELFTEST: PASS x/y
   usage: node goblin-warren-selftest.js [goblin-warren.html]
   authority=false · claim=NO_CLAIM */
"use strict";
const fs = require("fs");
const file = process.argv[2] || "goblin-warren.html";
const html = fs.readFileSync(file, "utf8");
console.log("target: " + file + " (" + html.length + " bytes)");

// 1 — syntax check all inline scripts (compile only, never invoked)
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!inline.length) { console.error("no inline <script> found"); process.exit(1); }
inline.forEach((src, i) => { new Function(src); console.log("[ok] script #" + (i + 1) + " parses (" + src.length + " chars)"); });

// 2 — extract the pure reducer block
const m = html.match(/\/\* ===== REDUCER-BEGIN =====[\s\S]*?\*\/([\s\S]*?)\/\* ===== REDUCER-END ===== \*\//);
if (!m) { console.error("REDUCER markers not found"); process.exit(1); }
const reducer = m[1];
if (/document\.|window\.|THREE\.|localStorage|Math\.random|Date\./.test(reducer)) {
  console.error("[FAIL] reducer block is not pure (DOM/THREE/storage/wall-clock leak)");
  process.exit(1);
}
console.log("[ok] reducer block pure (" + reducer.length + " chars) — no DOM, no THREE, no storage, no wall-clock");

// 3 — run the selftest core
const run = new Function(reducer + "\n;return runSelftestCore();");
const results = run();
let pass = 0;
for (const r of results) {
  if (r.ok) pass++;
  console.log((r.ok ? "[ok]   " : "[FAIL] ") + r.name + (r.err ? " — " + r.err : ""));
}
console.log("SELFTEST: PASS " + pass + "/" + results.length);
process.exit(pass === results.length ? 0 : 1);
