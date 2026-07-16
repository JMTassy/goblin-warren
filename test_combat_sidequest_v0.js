/* test_combat_sidequest_v0.js — Node selftest for combat_sidequest_v0.js
 *
 * authority=false · no DOM required.
 * Run: node apps/goblin-warren/test_combat_sidequest_v0.js
 *      node test_combat_sidequest_v0.js   (from goblin-warren directory)
 */
"use strict";

const path = require("path");
const api = require(path.join(__dirname, "combat_sidequest_v0.js"));
const T = api.__test;

let pass = 0;
let fail = 0;
function ok(cond, name) {
  if (cond) {
    pass++;
    console.log("  [ok]", name);
  } else {
    fail++;
    console.log("  [FAIL]", name);
  }
}

console.log("combat_sidequest_v0 selftest\n");

ok(api.SCHEMA === "COMBAT_SIDEQUEST_V0", "schema constant");
ok(typeof api.openCombatSideQuest === "function", "public open");
ok(typeof api.closeCombatSideQuest === "function", "public close");
ok(!api.isCombatSideQuestOpen(), "starts closed (no DOM open in node)");

const st = T.buildEncounter({ encounterSeed: 42, difficultyPreset: "normal" });
ok(st.schema === "COMBAT_SIDEQUEST_V0", "buildEncounter schema");
ok(st.phase === "portal", "starts at portal");
ok(st.player.hp === st.player.maxHp && st.player.hp > 0, "player full HP");
ok(st.enemy.hp === st.enemy.maxHp && st.enemy.alive, "enemy full HP");
ok(st.critters.length >= 3, "critters present");
ok(T.countAliveCritters(st) === st.critters.length, "all critters alive");

// force fight + deterministic attack by placing player next to enemy
st.phase = "fight";
st.player.x = st.enemy.x - 20;
st.player.y = st.enemy.y;
st.player.facing = 1;
st.player.attackCd = 0;
const hp0 = st.enemy.hp;
const hit = T.tryPlayerAttack(st);
ok(hit === true, "attack hits when in range");
ok(st.enemy.hp === hp0 - 1, "enemy HP reduced by 1");
ok(st.hitStop > 0, "hit-stop applied");
ok(st.particles.length > 0, "impact particles");

// dodge grants invuln
st.player.dodgeCd = 0;
T.tryPlayerDodge(st);
ok(st.player.invuln > 0, "dodge grants invulnerability");
const php = st.player.hp;
T.damagePlayer(st, st.enemy.x);
ok(st.player.hp === php, "invuln blocks damage");

// clear invuln and take damage
st.player.invuln = 0;
T.damagePlayer(st, st.enemy.x);
ok(st.player.hp === php - 1, "damage applies after invuln");

// kill enemy → completed
st.phase = "fight";
st.enemy.hp = 1;
st.player.attackCd = 0;
st.player.x = st.enemy.x - 18;
st.player.y = st.enemy.y;
T.tryPlayerAttack(st);
ok(st.phase === "resolve", "defeat enters resolve");
ok(st.status === "completed", "status completed");
ok(st.rewardTraceId === "combat_trace_critter_rescue_v0", "bounded reward id");
ok(T.countAliveCritters(st) > 0, "critters still saved on victory");

// failure when all critters die
const st2 = T.buildEncounter({ encounterSeed: 7 });
st2.phase = "fight";
st2.critters.forEach((c) => {
  c.alive = false;
});
T.finishFight(st2, "failed");
ok(st2.status === "failed", "failed status");
ok(st2.rewardTraceId === null, "no reward on fail");

// sim step advances time
const st3 = T.buildEncounter({ encounterSeed: 99 });
st3.phase = "fight";
const t0 = st3.elapsedMs;
T.simStep(st3, 0.1);
ok(st3.elapsedMs > t0, "simStep advances elapsedMs");

// timeout fail
st3.elapsedMs = st3.durationMs;
T.simStep(st3, 0.016);
ok(st3.status === "failed", "timeout fails if enemy alive");

// reduced effects flag
api.setCombatReducedEffects(true);
const st4 = T.buildEncounter({});
ok(st4.reducedEffects === true, "reduced effects flows into encounter");

// reset for cleanliness
api.setCombatReducedEffects(false);

console.log("\n" + pass + " passed · " + fail + " failed");
process.exit(fail > 0 ? 1 : 0);
