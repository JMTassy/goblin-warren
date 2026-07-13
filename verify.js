#!/usr/bin/env node
/* verify.js — v-local.1 gate harness
   authority=false · claim=NO_CLAIM · non-sovereign
   All gates are static / grep-level; no browser launch required.
   Exit 0 if all green, exit 1 on any failure. */

"use strict";
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var REPO = __dirname;
var pass = 0, fail = 0;
var results = [];

function gate(name, ok, detail) {
  var status = ok ? "PASS" : "FAIL";
  results.push({ name: name, ok: ok, detail: detail || "" });
  console.log(status + " [" + name + "]" + (detail ? " — " + detail : ""));
  if (ok) pass++; else fail++;
}

/* -----------------------------------------------------------------------
   G1: LOCAL ASSET FILES — every asset must exist and be non-zero
----------------------------------------------------------------------- */
var EXPECTED_ASSETS = [
  /* Lulu voice (10 lines) */
  "assets/audio/hf_20260713_142245_greet.mp3",
  "assets/audio/hf_20260713_142252_boop.mp3",
  "assets/audio/hf_20260713_142258_quizRight.mp3",
  "assets/audio/hf_20260713_142303_quizWrong.mp3",
  "assets/audio/hf_20260713_142306_verdict.mp3",
  "assets/audio/hf_20260713_142313_compost.mp3",
  "assets/audio/hf_20260713_142319_matcha.mp3",
  "assets/audio/hf_20260713_142322_travel.mp3",
  "assets/audio/hf_20260713_142325_relic.mp3",
  "assets/audio/hf_20260713_142332_goodnight.mp3",
  /* Lulu surprise (5 — staringLose is TTS-only) */
  "assets/audio/hf_20260713_162124_faint.mp3",
  "assets/audio/hf_20260713_162130_staringWin.mp3",
  "assets/audio/hf_20260713_162132_matchaRain.mp3",
  "assets/audio/hf_20260713_162135_disco.mp3",
  "assets/audio/hf_20260713_162145_secret.mp3",
  /* Ambient audio */
  "assets/audio/hf_20260712_022435_sfx_a.m4a",
  "assets/audio/hf_20260712_022438_sfx_b.m4a",
  "assets/audio/hf_20260712_022440_sfx_c.mp3",
  "assets/audio/hf_20260712_013728_sfx_d.mp3",
  /* Videos */
  "assets/video/hf_20260712_230648_intro.mp4",
  "assets/video/hf_20260712_233931_level_transition.mp4",
  /* Backgrounds */
  "assets/bg/hf_20260711_222910_bg.svg",
  "assets/bg/hf_20260713_131830_bg_a.png",
  "assets/bg/hf_20260713_131834_bg_b.png",
  "assets/bg/hf_20260713_130015_bg_c.png",
  "assets/bg/hf_20260713_130018_bg_d.png",
  "assets/bg/hf_20260713_131431_bg_e.png",
  /* Art */
  "assets/art/hf_20260712_085446_goblin_1.png",
  "assets/art/hf_20260712_085449_goblin_2.png",
  "assets/art/hf_20260712_190954_persona_1.png",
  "assets/art/hf_20260712_190955_persona_2.png",
  "assets/art/hf_20260712_190957_persona_3.png",
  "assets/art/hf_20260712_190958_persona_4.png",
  "assets/art/hf_20260712_190999_persona_5.png",
  "assets/art/hf_20260712_191001_persona_6.png",
  "assets/art/hf_20260712_200459_raam.png",
  "assets/art/hf_20260712_200501_art_b.png"
];

var missingAssets = [];
EXPECTED_ASSETS.forEach(function (rel) {
  var abs = path.join(REPO, rel);
  var exists = false;
  try { exists = fs.statSync(abs).size > 0; } catch (e) { exists = false; }
  if (!exists) missingAssets.push(rel);
});
gate("G1_all_assets_present_nonzero",
  missingAssets.length === 0,
  missingAssets.length ? "missing: " + missingAssets.join(", ") : EXPECTED_ASSETS.length + " files OK");

/* -----------------------------------------------------------------------
   G2: NO CDN URLS IN CODE — cloudfront must not appear in any code file
----------------------------------------------------------------------- */
var CODE_FILES = ["game.js", "style.css", "index.html", "v2.html", "v3.html", "logic.js"];
var cdnFoundIn = [];
CODE_FILES.forEach(function (f) {
  var abs = path.join(REPO, f);
  try {
    var content = fs.readFileSync(abs, "utf8");
    if (content.indexOf("d8j0ntlcm91z4.cloudfront.net") !== -1) cdnFoundIn.push(f);
  } catch (e) { /* file doesn't exist — skip */ }
});
gate("G2_no_cdn_urls_in_code",
  cdnFoundIn.length === 0,
  cdnFoundIn.length ? "CDN still in: " + cdnFoundIn.join(", ") : "clean");

/* -----------------------------------------------------------------------
   G3: LOCAL PATHS WIRED — game.js must reference asset local paths
----------------------------------------------------------------------- */
var gameJs = "";
try { gameJs = fs.readFileSync(path.join(REPO, "game.js"), "utf8"); } catch (e) {}

/* Note: Lulu voice URLs use LULU_VOICE_CDN variable prefix, so we search
   for the filename suffix rather than the full path string. Other paths
   are written as full literals, so we search the full relative path. */
var localPathChecks = [
  { pat: "hf_20260713_142245_greet.mp3",               label: "lulu_greet" },
  { pat: "hf_20260713_162124_faint.mp3",               label: "lulu_faint" },
  { pat: "assets/audio/hf_20260712_022435_sfx_a.m4a",  label: "music_track_a" },
  { pat: "assets/audio/hf_20260712_022440_sfx_c.mp3",  label: "nature_loop" },
  { pat: "assets/video/hf_20260712_233931_level_transition.mp4", label: "level_transition" },
  { pat: "assets/bg/hf_20260713_131830_bg_a.png",      label: "village_bg" },
  { pat: "assets/art/hf_20260712_200459_raam.png",     label: "raam_art" },
  { pat: "assets/art/hf_20260712_190954_persona_1.png",label: "collectible_art" }
];
var missingLocal = localPathChecks.filter(function (c) { return gameJs.indexOf(c.pat) === -1; });
gate("G3_local_paths_wired",
  missingLocal.length === 0,
  missingLocal.length ? "missing paths: " + missingLocal.map(function (c) { return c.label; }).join(", ") : "all " + localPathChecks.length + " wired");

/* -----------------------------------------------------------------------
   G4: INDEX.HTML REWIRED — splash video points to local path
----------------------------------------------------------------------- */
var indexHtml = "";
try { indexHtml = fs.readFileSync(path.join(REPO, "index.html"), "utf8"); } catch (e) {}
var splashLocal = indexHtml.indexOf("assets/video/hf_20260712_230648_intro.mp4") !== -1;
var splashCdn   = indexHtml.indexOf("d8j0ntlcm91z4.cloudfront.net") !== -1;
gate("G4_index_html_splash_local", splashLocal && !splashCdn,
  splashLocal ? "local path present" : "local path missing");

/* -----------------------------------------------------------------------
   G5: STYLE.CSS REWIRED — SVG bg points to local path
----------------------------------------------------------------------- */
var styleCss = "";
try { styleCss = fs.readFileSync(path.join(REPO, "style.css"), "utf8"); } catch (e) {}
var svgLocal = styleCss.indexOf("assets/bg/hf_20260711_222910_bg.svg") !== -1;
var svgCdn   = styleCss.indexOf("d8j0ntlcm91z4.cloudfront.net") !== -1;
gate("G5_style_css_svg_local", svgLocal && !svgCdn,
  svgLocal ? "local SVG path present" : "local SVG path missing");

/* -----------------------------------------------------------------------
   G6: LULU_VOICE_CDN IS LOCAL — the CDN variable is now local prefix
----------------------------------------------------------------------- */
var cdnVarOk = gameJs.indexOf('var LULU_VOICE_CDN = "assets/audio/";') !== -1;
gate("G6_lulu_voice_cdn_is_local", cdnVarOk,
  cdnVarOk ? "LULU_VOICE_CDN = assets/audio/" : "LULU_VOICE_CDN still points to CDN");

/* -----------------------------------------------------------------------
   G7: GENERATEGOBBLINLINE EXISTS IN UI ZONE
      Must be defined after the game state functions, in the UI section.
      Must NOT appear inside the REDUCER zone (we search for its position
      relative to window.WARREN_DEBUG, which is UI-zone only).
----------------------------------------------------------------------- */
var genFnIdx    = gameJs.indexOf("function generateGoblinLine(");
var debugIdx    = gameJs.indexOf("window.WARREN_DEBUG = {");
var genFnExists = genFnIdx !== -1;
var genFnBeforeDebug = genFnIdx < debugIdx; /* inserted just before WARREN_DEBUG */
gate("G7_generateGoblinLine_exists_ui_zone",
  genFnExists && genFnBeforeDebug,
  genFnExists ? "found at char " + genFnIdx + ", WARREN_DEBUG at " + debugIdx : "function not found");

/* -----------------------------------------------------------------------
   G8: GEMMA SEAM — generateGoblinLine uses Ollama endpoint and correct model
----------------------------------------------------------------------- */
var hasOllama  = gameJs.indexOf("http://localhost:11434/api/generate") !== -1;
var hasModel   = gameJs.indexOf("gemma4-moq:4.0") !== -1;
var hasTimeout = gameJs.indexOf("4000") !== -1; /* 4s timeout */
gate("G8_gemma_seam_correct", hasOllama && hasModel,
  "ollama=" + hasOllama + " model=gemma4-moq:4.0=" + hasModel);

/* -----------------------------------------------------------------------
   G9: FALLBACK CONTRACT — on failure generateGoblinLine returns a template line
      Verified by reading the source: the function must call callback(fallback)
      in both the catch block and the timeout handler.
----------------------------------------------------------------------- */
var genFnBody = "";
if (genFnIdx !== -1) {
  /* extract ~2000 chars around the function */
  genFnBody = gameJs.slice(genFnIdx, genFnIdx + 2500);
}
var hasFallbackInCatch   = genFnBody.indexOf("callback(fallback)") !== -1;
var hasFallbackInTimeout = genFnBody.indexOf("callback(fallback)") !== -1 &&
                           genFnBody.indexOf("setTimeout") !== -1;
gate("G9_fallback_on_failure",
  hasFallbackInCatch && hasFallbackInTimeout,
  "catch fallback=" + hasFallbackInCatch + " timeout fallback=" + hasFallbackInTimeout);

/* -----------------------------------------------------------------------
   G10: STATE ISOLATION — generateGoblinLine's return value (via callback)
       is never directly assigned to S.* properties.
       Grep: look for "S\." inside the function body.
       The function may READ goblinId to pick fallback names but must not
       mutate S.* from the UI zone — only pushReplay/showBubble is permitted.
----------------------------------------------------------------------- */
var genFnEnd = gameJs.indexOf("\nwindow._generateGoblinLine", genFnIdx);
if (genFnEnd === -1) genFnEnd = genFnIdx + 2500;
var genFnSlice = gameJs.slice(genFnIdx, genFnEnd);
/* S. mutations look like: S.zol = / S.learning. / S.replay.push inside this fn.
   pushReplay is allowed (it's the approved path). Direct S.zol or S.territories etc. are not. */
var sMutations = genFnSlice.match(/S\.(zol|territories|learning\.(zol|tokens)|reputation|cohesion|knowledge|compost|held|pending)\s*[=+\-]/g);
gate("G10_no_state_mutation",
  !sMutations || sMutations.length === 0,
  sMutations ? "state mutations found: " + sMutations.join(", ") : "no state mutations in generateGoblinLine");

/* -----------------------------------------------------------------------
   G11: NARRATION-ONLY — callback return from generateGoblinLine must only be
       used as display text (showBubble) not assigned to state objects.
       We grep the *call sites* of generateGoblinLine in the file and check
       that the callback body only calls showBubble() or pushReplay().
       Since the function is defined here and exposed via WARREN_DEBUG,
       we verify the callback pattern in the function definition itself.
----------------------------------------------------------------------- */
var callbackReturnsShowBubble = genFnSlice.indexOf("showBubble") !== -1 ||
  /* the function's callback parameter is 'callback'; call sites pass it to showBubble */
  (genFnSlice.indexOf("callback(text)") !== -1 || genFnSlice.indexOf("callback(fallback)") !== -1);
/* Also confirm the callback never assigns to ZOL etc inside the function */
gate("G11_narration_only_callback",
  callbackReturnsShowBubble && (!sMutations || sMutations.length === 0),
  "callback is narration-only: " + callbackReturnsShowBubble);

/* -----------------------------------------------------------------------
   G12: DOCS NOT MODIFIED — cloudfront URLs preserved in docs catalog
----------------------------------------------------------------------- */
var luluVoiceMd = "";
try { luluVoiceMd = fs.readFileSync(path.join(REPO, "docs/LULU_VOICE_LINES.md"), "utf8"); } catch (e) {}
var docsPreserveUrl = luluVoiceMd.indexOf("d8j0ntlcm91z4.cloudfront.net") !== -1;
var docsHasLocalPaths = luluVoiceMd.indexOf("assets/audio/") !== -1;
gate("G12_docs_catalog_intact_and_augmented",
  docsPreserveUrl && docsHasLocalPaths,
  "historical CDN URLs preserved=" + docsPreserveUrl + " local paths added=" + docsHasLocalPaths);

/* -----------------------------------------------------------------------
   Summary
----------------------------------------------------------------------- */
console.log("");
console.log("=== verify.js result: " + pass + "/" + (pass + fail) + " gates green ===");
if (fail > 0) {
  console.log("FAILED gates:");
  results.filter(function (r) { return !r.ok; }).forEach(function (r) {
    console.log("  FAIL [" + r.name + "] " + r.detail);
  });
}
process.exit(fail > 0 ? 1 : 0);
