// make_goblin_warren_nes.js — deterministic transform, re-runnable
// authority=false · NO_CLAIM · builds goblin-warren-nes.html from:
//   goblin-warren.html (vertical slice, UNTOUCHED source)
//   warren-cast-sprites-v0/index.html (procedural sprite zone, HERMES cast)
// Changes: CLAW→HERMES · sprite cast integrated as billboards + portraits ·
// NES-1990 skin (CRT scanlines, title screen, pad legend) · own STORE_KEY.
"use strict";
const fs = require("fs");
let H = fs.readFileSync("goblin-warren.html", "utf8");
const forge = fs.readFileSync("warren-cast-sprites-v0/index.html", "utf8");
const spriteZone = forge.match(/\/\* ===== SPRITE-BEGIN[\s\S]*?SPRITE-END ===== \*\//);
if (!spriteZone) throw new Error("sprite zone not found in forge");

function repAll(from, to, minCount) {
  const n = H.split(from).length - 1;
  if (n < minCount) throw new Error("expected >=" + minCount + " of " + JSON.stringify(from.slice(0, 40)) + " found " + n);
  H = H.split(from).join(to);
  return n;
}
function insertAfter(anchor, text) {
  const i = H.indexOf(anchor);
  if (i < 0) throw new Error("anchor missing: " + JSON.stringify(anchor.slice(0, 60)));
  H = H.slice(0, i + anchor.length) + text + H.slice(i + anchor.length);
}

/* ---- 1. CLAW → HERMES (the held messenger) ---- */
const nClaw = repAll("CLAW", "HERMES", 15);
const nHold = repAll("clawHold", "hermesHold", 3);
console.log("renamed CLAW→HERMES: " + nClaw + " sites, hermesHold: " + nHold);

/* ---- 2. identity + storage isolation ---- */
repAll("<title>The Goblin Warren</title>",
  "<title>HELEN · DREAM OF CONQUEST — GOBLIN WARREN</title>", 1);
repAll('STORE_KEY="goblin_warren_v1"', 'STORE_KEY="goblin_warren_nes_v1"', 1);
repAll('<span class="cap">THE GOBLIN WARREN</span>',
  '<span class="cap">DREAM OF CONQUEST · GOBLIN WARREN</span>', 1);
insertAfter("LAW: authority=false · claim=NO_CLAIM · symbolic game · non-sovereign",
  "\nNES EDITION (2026-07-05): goblin-warren.html + warren-cast procedural sprite\n" +
  "cast (CLAW renamed HERMES — the held messenger). Same reducer, same law.\n" +
  "Own STORE_KEY (goblin_warren_nes_v1) — does not touch the slice's saves.");

/* ---- 3. NES 1990 skin: CSS ---- */
insertAfter(".beatbox{max-width:520px;border-color:var(--dream)}", `
  /* ---- NES 1990 skin ---- */
  #crt{position:fixed;inset:0;pointer-events:none;z-index:400;
    background:repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0 1px,transparent 1px 3px)}
  .panel{border-width:4px;border-style:double}
  .title{font-size:30px;color:var(--bone);text-shadow:4px 4px 0 #000, -2px -2px 0 #453a68}
  .nes-sub{color:var(--dream);letter-spacing:.3em;font-size:11px;text-transform:uppercase;text-align:center}
  .pressstart{animation:psblink 1.1s steps(1) infinite;color:var(--glow);
    letter-spacing:.25em;font-size:12px;margin-top:10px;text-align:center}
  @keyframes psblink{50%{opacity:0}}
  #menu-lineup{text-align:center;margin:10px 0}
  #menu-lineup img{image-rendering:pixelated;margin:0 1px;vertical-align:bottom}
  #padlegend{position:absolute;right:12px;bottom:136px;z-index:30;font-size:9px;color:var(--spore);
    background:#0d1408;border:3px solid var(--moss);padding:3px 8px;letter-spacing:.08em}
  #p-face,.boticon{image-rendering:pixelated}
`);

/* ---- 4. NES 1990 skin: DOM ---- */
insertAfter('<canvas id="cv"></canvas>',
  '\n<div id="crt"></div>\n<div id="padlegend">✚ CLICK MOUND · Q RIDDLE · B CLAIM · P IDEA · A ADMIT · D DENY · H HOLD</div>' +
  '\n<div id="motto">MECHANISM IS VERIFIABLE · MEANING IS INHABITABLE · JM REMAINS THE FINAL GATE</div>');
insertAfter('#padlegend{position:absolute;right:12px;bottom:136px;z-index:30;font-size:9px;color:var(--spore);\n    background:#0d1408;border:3px solid var(--moss);padding:3px 8px;letter-spacing:.08em}', `
  #motto{position:absolute;left:50%;transform:translateX(-50%);bottom:2px;z-index:29;font-size:9px;
    letter-spacing:.16em;color:var(--spore);background:#0d1408;border:3px solid var(--moss);
    border-bottom:none;padding:2px 14px;text-transform:uppercase}`);
repAll('<div id="botlist"></div>',
  '<div id="botlist"></div>\n  <div class="cap" style="margin-top:8px">BOT MINI-GAMES</div>\n  <div id="minigames" style="font-size:9px"></div>', 1);
repAll('💭 ${d.agent}: ${d.teaser}</div>',
  '💭 ${d.agent}: ${d.teaser}<div style="font-size:8px;color:var(--amber);margin-top:2px">▶ pick → HAL judges · ADMIT +2 rep · DENY → compost</div></div>', 1);
repAll('<div class="title">The Goblin Warren</div>',
  '<div class="nes-sub">HELEN OS presents</div>\n' +
  '  <div class="title">Dream of Conquest</div>\n' +
  '  <div class="nes-sub" style="color:var(--glow);font-size:14px">≫ GOBLIN WARREN ≪</div>\n' +
  '  <div id="menu-lineup"></div>', 1);
insertAfter(`<button class="small" onclick="uiEnter('story',true)">ENTER + TUTORIAL</button>`,
  '\n    <div class="pressstart">PRESS ENTER · START</div>\n' +
  '    <div style="font-size:9px;color:var(--spore);margin-top:4px">© 2026 JM TASSY · HELEN OS · AUTHORITY=FALSE · NO_CLAIM</div>');
repAll('<div class="agentname" id="p-agent"></div>',
  '<img id="p-face" width="64" height="64" style="float:right;margin-left:6px;border:3px solid var(--moss)">' +
  '<div class="agentname" id="p-agent"></div>', 1);

/* ---- 5. the procedural sprite cast (pure zone from the forge) ---- */
insertAfter("/* ===== REDUCER-END ===== */", `

${spriteZone[0]}

/* ---- persona → sprite mapping with NES palette-swaps for the extended sixteen ---- */
const RAMPS={GREEN:[2,3,4],EMBER:[5,6,7],BONE:[8,9,10],VIOLET:[11,12,13],ROT:[14,15,16],IRON:[17,18,19],GLOW:[20,21,22]};
const PERSONA_SPRITE={
 GOBLIN:{b:"GOBLIN"},HER:{b:"HER"},CHIDDUSH:{b:"CHIDDUSH"},JESTER:{b:"JESTER"},
 HERMES:{b:"HERMES"},WARDEN:{b:"WARDEN"},ARCHIVIST:{b:"ARCHIVIST"},STEWARD:{b:"STEWARD"},
 MAYOR:{b:"MAYOR"},HAL:{b:"HAL"},
 WITNESS:{b:"ARCHIVIST",sw:[["BONE","IRON"]]},        // the stone-raiser reads in iron
 ORNITH:{b:"CHIDDUSH",sw:[["VIOLET","GLOW"]]},        // pattern-pointer in glow
 ROOTKEEPER:{b:"GOBLIN",sw:[["EMBER","GLOW"]]},       // his sack leaks rootlight
 MUDSAINT:{b:"STEWARD",sw:[["GREEN","ROT"]]},         // blessed muck robes
 BONECOOK:{b:"MAYOR",sw:[["EMBER","BONE"]]},          // a bone-white sash
 MOONRAT:{b:"GOBLIN",sw:[["GREEN","IRON"],["EMBER","VIOLET"]]}}; // pale silver kin
function personaGrid(name,frame,verdict){
 const def=PERSONA_SPRITE[name]||{b:"GOBLIN"};
 let g=buildSprite(def.b,frame,verdict);
 if(def.sw){g={w:g.w,h:g.h,d:g.d.slice()};
  def.sw.forEach(([a,b2])=>{const A=RAMPS[a],B=RAMPS[b2];
   g.d=g.d.map(c=>{const i=A.indexOf(c);return i>=0?B[i]:c})})}
 return g}
`);

/* ---- 6. sprite layer: textures, billboards, portraits ---- */
insertAfter("let scene,camera,renderer,meshes=[],deco=[],labels=[],totem=null,threeReady=false;", `
/* ---- NES sprite layer: the cast lives in the Warren ---- */
let castSprites=[],halSprite=null,castFrame=0,lastBeat=0;
const texCache={},urlCache={};
function gridToCanvas(g,scale){const c=document.createElement("canvas");
 c.width=g.w*scale;c.height=g.h*scale;const x=c.getContext("2d");
 for(let y=0;y<g.h;y++)for(let i=0;i<g.w;i++){const cc=g.d[y*g.w+i];if(!cc)continue;
  x.fillStyle=PAL[cc];x.fillRect(i*scale,y*scale,scale,scale)}return c}
function spriteTex(name,frame,verdict){const key=name+"|"+frame+"|"+(verdict||"");
 if(texCache[key])return texCache[key];
 const t=new THREE.CanvasTexture(gridToCanvas(personaGrid(name,frame,verdict),4));
 t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;
 texCache[key]=t;return t}
function spriteURL(name,scale){const key=name+"@"+(scale||3);
 if(urlCache[key])return urlCache[key];
 return urlCache[key]=gridToCanvas(personaGrid(name,0),scale||3).toDataURL()}
function spawnCast(def){
 castSprites.forEach(o=>scene.remove(o.s));castSprites=[];
 if(halSprite){scene.remove(halSprite);halSprite=null}
 const cast=INHABITANTS.filter(n=>n!=="HAL");
 cast.forEach((n,i)=>{
  const mat=new THREE.SpriteMaterial({map:spriteTex(n,0),transparent:true});
  const s=new THREE.Sprite(mat);
  const h=h32("npc"+n+def.id);
  const r=9+(h%70)/10,a=i/cast.length*Math.PI*2+((h>>>4)%100)/300;
  s.position.set(Math.cos(a)*r,2.6,Math.sin(a)*r);s.scale.set(5.4,5.4,1);
  s.userData={name:n,a,r};scene.add(s);castSprites.push({s,name:n})});
 const hm=new THREE.SpriteMaterial({map:spriteTex("HAL",0,"ACCEPTABLE"),transparent:true});
 halSprite=new THREE.Sprite(hm);halSprite.scale.set(7,7,1);
 halSprite.position.set(0,9.5,0);scene.add(halSprite)}
function castBeat(){ // stepped 450ms — a Warren creature moves like a cuckoo clock
 const now=performance.now();if(now-lastBeat<450)return;lastBeat=now;castFrame=1-castFrame;
 castSprites.forEach((o,i)=>{
  o.s.material.map=spriteTex(o.name,castFrame);o.s.material.needsUpdate=true;
  o.s.userData.a+=0.006;
  o.s.position.x=Math.cos(o.s.userData.a)*o.s.userData.r;
  o.s.position.z=Math.sin(o.s.userData.a)*o.s.userData.r;
  o.s.position.y=2.6+((castFrame&&i%3===0)?0.3:0)});
 if(halSprite){const p=VS?VS.pending:(S?S.pending:null);
  const v=p&&p.verdict?p.verdict:"ACCEPTABLE";
  halSprite.material.map=spriteTex("HAL",castFrame,v==="HOLD"?"HOLD":v==="DENY"?"DENY":"ACCEPTABLE");
  halSprite.material.needsUpdate=true}}
`);
// spawn the cast at every scene rebuild (slice's rebuildScene now continues past this line)
repAll(" renderer.setClearColor(def.colors.bg);",
  " renderer.setClearColor(def.colors.bg);spawnCast(def);", 1);
// beat the cast inside the render loop
repAll(" if(totem)totem.rotation.y+=0.0012;",
  " if(totem)totem.rotation.y+=0.0012;castBeat();", 1);
// agent portrait on every proposal card
repAll('document.getElementById("p-agent").textContent=p.agent',
  'document.getElementById("p-face").src=spriteURL(p.agent,2);\n document.getElementById("p-agent").textContent=p.agent', 1);
// bot roster → V1 stat-bar inhabitants panel (vectors per the Living Minds brief)
repAll('`<div class="bot"><b>${b}</b> <span style="font-size:9px">(${BOTS[b].style})</span><div class="agenda">${BOTS[b].agenda}</div></div>`).join("")',
  '`<div class="bot"><img class="boticon" src="${spriteURL(b,1)}" width="22" height="22" style="vertical-align:middle;margin-right:4px"><b>${b}</b> <span style="font-size:8px;color:var(--spore)">(${BOTS[b].style})</span><div style="margin-top:2px">${["EXP","BEA","DEF","ECO","CHA"].map(k=>`<div style="display:inline-block;width:18%;margin-right:1%"><div style="font-size:7px;color:var(--spore)">${k} ${(VECTORS[b]||{})[k]||0}</div><div style="background:#0a1206;height:5px;border:1px solid #263b24"><div style="height:3px;margin:1px;width:${(VECTORS[b]||{})[k]||0}%;background:${BAR_COLORS[b]||"#5c7a3a"}"></div></div></div>`).join("")}</div></div>`).join("");syncMiniGames("")', 1);
// title-screen lineup at boot
repAll(' uiTab("ledger")};',
  ' uiTab("ledger");\n' +
  ' const lu=document.getElementById("menu-lineup");\n' +
  ' if(lu)lu.innerHTML=["GOBLIN","HAL","HER","CHIDDUSH","HERMES","JESTER","WARDEN","STEWARD","ARCHIVIST","MAYOR"]\n' +
  '  .map(n=>`<img src="${spriteURL(n,2)}" title="${n}" width="${n==="HAL"?48:64}" height="${n==="HAL"?48:64}">`).join("");};', 1);

/* ---- 7. ARENA ONLINE: real 2P internet play via the platform's rules-module
        WebSocket (protocol per Higgsfield client-reference: /ws/<room>,
        join/action/reset, full-state broadcasts). Zero-credit capability —
        the deployed logic.js server was already live, just unspoken-to. ---- */
repAll('<button class="small" onclick="uiSelftest()">SELFTEST</button>',
  '<button class="small" onclick="uiSelftest()">SELFTEST</button>\n' +
  '  <button class="small" onclick="uiArenaOnline()" style="border-color:var(--glow)">⚔ ONLINE 2P</button>', 1);
repAll('<script>\n"use strict";',
`<div id="arenaOL" class="over" style="display:none">
  <div class="panel" style="width:420px;max-height:86vh;overflow-y:auto;text-align:center">
    <div class="title" style="font-size:16px">⚔ THE ARENA — ONLINE</div>
    <div style="font-size:9px;color:var(--spore)">2 keepers · alternate claims on the Heap · first to 5 sites or best reputation · authority=false</div>
    <div id="ar-status" style="margin:8px 0;color:var(--amber);font-size:11px">—</div>
    <div id="ar-players" style="font-size:10.5px;margin-bottom:6px"></div>
    <div id="ar-sites" style="display:grid;grid-template-columns:1fr 1fr;gap:3px"></div>
    <div id="ar-log" style="font-size:9px;color:var(--spore);text-align:left;margin-top:8px;min-height:52px"></div>
    <div style="font-size:9px;margin-top:6px">invite link: <input readonly id="ar-link" style="width:85%;font-size:9px"></div>
    <div style="margin-top:8px">
      <button class="small" id="ar-again" style="display:none" onclick="arSend({type:'reset'})">AGAIN</button>
      <button class="small" onclick="uiArenaClose()">CLOSE</button>
    </div>
  </div>
</div>
<script>
"use strict";`, 1);
insertAfter("function castBeat(){", ""); // anchor sanity: sprite layer must exist before arena JS lands
repAll('/* ---- keyboard ---- */',
`/* ---- V1 protocol: agenda vectors (display), mini-game cards, stakes ---- */
const VECTORS={GOBLIN:{EXP:72,BEA:15,DEF:30,ECO:40,CHA:60},HER:{EXP:30,BEA:88,DEF:25,ECO:10,CHA:40},
 HERMES:{EXP:15,BEA:20,DEF:92,ECO:70,CHA:30},CHIDDUSH:{EXP:50,BEA:45,DEF:10,ECO:80,CHA:20},
 JESTER:{EXP:60,BEA:30,DEF:15,ECO:10,CHA:95}};
const BAR_COLORS={GOBLIN:"#a8d858",HER:"#e0a83c",HERMES:"#b07a62",CHIDDUSH:"#9a8ac0",JESTER:"#d8f0a0"};
function syncMiniGames(){
 const el=document.getElementById("minigames");if(!el||!S)return;
 const matches=S.ledger.filter(e=>e.kind==="ARENA_MATCH").slice(-2).reverse();
 const tally=S.arenaWins?Object.entries(S.arenaWins).map(([n,w])=>n.slice(0,4)+" "+w).join(" · "):"";
 el.innerHTML=(matches.length?matches.map(m=>
   \`<div style="border:2px solid var(--dream);padding:3px;margin:2px 0;background:#151022">⚔ \${m.detail}</div>\`).join(""):
  \`<div style="color:var(--spore)">the arena sleeps — bots duel as the world ticks</div>\`)+
  (tally?\`<div style="font-size:8px;color:var(--amber);margin-top:2px">WINS: \${tally}</div>\`:"")}

/* ---- ARENA ONLINE client (protocol per platform client-reference) ---- */
const AR_SITES=[["Mushroom Cellar",8,5],["Bone-Button Market",12,8],["Fungal Vault",10,7],
 ["Moth Chapel",15,10],["Scrap Bridge",9,6],["Whisper Midden",14,9],["Crooked Stair",11,7],
 ["Glowworm Farm",7,5],["Rot Library",13,9],["Trash Portal",16,12],["Echo Burrow",18,13],
 ["Moon Midden Gate",20,15]]; // must mirror logic.js SITES exactly
let arWS=null,arId=null;
function arSend(o){if(arWS&&arWS.readyState===1)arWS.send(JSON.stringify(o))}
function uiArenaOnline(){
 document.getElementById("arenaOL").style.display="flex";
 const params=new URLSearchParams(location.search);
 let room=params.get("room");
 if(!room){room=h32("r"+Date.now()).toString(36).slice(0,6);
  params.set("room",room);history.replaceState(null,"",location.pathname+"?"+params)}
 document.getElementById("ar-link").value=location.href;
 arId=sessionStorage.getItem("warren-arena-id");
 if(!arId){arId="keeper-"+h32("id"+Date.now()+performance.now()).toString(36).slice(0,8);
  sessionStorage.setItem("warren-arena-id",arId)}
 arConnect(room)}
function uiArenaClose(){document.getElementById("arenaOL").style.display="none";
 if(arWS){arWS.onclose=null;arWS.close();arWS=null}}
function arConnect(room){
 const base=location.pathname.replace(/\\/+$/,"");
 const url=(location.protocol==="https:"?"wss://":"ws://")+location.host+base+"/ws/"+room;
 const st=document.getElementById("ar-status");
 st.textContent="lighting the lanterns…";
 try{arWS=new WebSocket(url)}catch(e){st.textContent="the arena lives on the deployed host only";return}
 arWS.onopen=()=>{arSend({type:"join",playerId:arId})};
 arWS.onerror=()=>{st.textContent="the arena lives on the deployed host only (open the public URL)"};
 arWS.onclose=()=>{if(document.getElementById("arenaOL").style.display!=="none"){
  st.textContent="disconnected — relighting…";setTimeout(()=>arConnect(room),1500)}};
 arWS.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.type==="error"){st.textContent="HAL: "+m.error;return}
  if(m.type==="state")arRender(m)}}
function arRender(s){
 const st=document.getElementById("ar-status"),v=s.view;
 document.getElementById("ar-again").style.display=s.status==="over"?"inline-block":"none";
 if(s.status==="waiting"||!v){st.textContent="waiting for a second keeper — send the invite link";
  document.getElementById("ar-sites").innerHTML="";return}
 const me=s.you,seated=s.seats.includes(me),myTurn=v.turn===me&&s.status==="playing";
 document.getElementById("ar-players").innerHTML=s.seats.map(id=>
  \`<span style="\${id===v.turn?'color:var(--glow)':''}">\${id===me?"YOU":id.slice(0,10)}: \${v.rep[id]} rep · \${v.zol[id]} zol</span>\`).join(" &nbsp;·&nbsp; ");
 document.getElementById("ar-sites").innerHTML=AR_SITES.map((d,i)=>{
  const own=v.owner[i];
  const mine=own===me,taken=own!==null;
  const can=myTurn&&seated&&!taken&&v.zol[me]>=d[1];
  return \`<button class="small" \${can?"":"disabled"} onclick="arSend({type:'action',action:{type:'claim',site:\${i}}})"
   style="\${taken?(mine?'border-color:var(--glow)':'border-color:var(--rot)'):''}">\${d[0]}<br>\${taken?(mine?"YOURS":"THEIRS"):d[1]+"z · "+d[2]+"r"}</button>\`}).join("")+
  \`<button class="small" \${myTurn?"":"disabled"} onclick="arSend({type:'action',action:{type:'pass'}})" style="grid-column:1/3">WATCH THE MOUNDS (PASS)</button>\`;
 document.getElementById("ar-log").innerHTML=(v.log||[]).slice(-6).map(l=>"· "+l).join("<br>");
 if(s.status==="over"){const r=s.result;
  st.textContent=r.draw?"even reputation — the Warren keeps both names":
   (r.winner===me?"YOU TAKE THE ARENA — "+(r.reason||""):"the other keeper takes it — "+(r.reason||""))}
 else st.textContent=myTurn?"YOUR HAND — claim a mound or pass":"the other keeper is choosing…"}

/* ---- keyboard ---- */`, 1);

/* ---- 9. V1.1 "God Simulator" remix layer (display-only, derived from real
        reducer state — no new events, replay untouched). Transplanted per
        the V1.1 guide: 6-resource top bar, 2-minute day parts with NIGHT
        TUNNELS, SOIL→FRUIT promotion ladder framing, Harvest Ceremony. ---- */
insertAfter('<div id="padlegend">✚ CLICK MOUND · Q RIDDLE · B CLAIM · P IDEA · A ADMIT · D DENY · H HOLD</div>',
  '\n<div id="resrow">—</div>');
insertAfter('border-bottom:none;padding:2px 14px;text-transform:uppercase}', `
  #resrow{position:absolute;top:40px;left:50%;transform:translateX(-50%);z-index:19;font-size:9px;
    letter-spacing:.06em;color:var(--bone);background:#0d1408;border:3px solid var(--moss);
    border-top:none;padding:2px 12px;white-space:nowrap}`);
repAll('/* ---- ARENA ONLINE client (protocol per platform client-reference) ---- */',
`/* ---- V1.1 remix layer: resources, day/night tunnels, fruit ladder ---- */
const DAY_MS=120000,LADDER=["SOIL","SEED","LEAF","TRUNK","BLOOM","FRUIT"];
let dayStart=performance.now();
function dayPhase(){const t=(performance.now()-dayStart)/DAY_MS;
 return {d:Math.floor(t)+1,night:(t%1)>0.5}}
function fruitStage(){return S?Math.min(5,Math.floor(S.admitted/2)):0}
function syncResources(){
 const el=document.getElementById("resrow");if(!el||!S)return;
 const ph=dayPhase();
 const trust=S.cohesion>=90?"HIGH":S.cohesion>=60?"OK":"THIN";
 const att=Math.max(0,100-(S.dreams?S.dreams.length:0)*8-S.held*6);
 const risk=S.held*3+S.denials;
 el.innerHTML="🔍 EVIDENCE "+S.admitted+" · ⚙️ COHERENCE "+S.cohesion+" · 🤝 TRUST "+trust+
  " · 🌟 ATTENTION "+att+"% · 🖥 COMPUTE "+(60+S.knowledge*5)+" · 🧪 AUTH.RISK "+risk+
  " &nbsp;·&nbsp; 🌱 "+LADDER[fruitStage()]+
  " &nbsp;|&nbsp; "+(ph.night?"🌙 NIGHT — TUNNELS OPEN":"☀ DAY "+ph.d)}
setInterval(syncResources,5000);

/* ---- ARENA ONLINE client (protocol per platform client-reference) ---- */`, 1);
// resources refresh with every HUD sync; night doubles the cast's tunnel bustle
repAll('  (tally?`<div style="font-size:8px;color:var(--amber);margin-top:2px">WINS: ${tally}</div>`:"")}',
  '  (tally?`<div style="font-size:8px;color:var(--amber);margin-top:2px">WINS: ${tally}</div>`:"");syncResources()}', 1);
repAll('  o.s.userData.a+=0.006;',
  '  o.s.userData.a+=(typeof dayPhase==="function"&&dayPhase().night)?0.013:0.006;', 1);
// Harvest Ceremony framing on the win screen (ladder from real receipt-stones)
repAll('  document.getElementById("win-line").textContent=def.beats[2];',
  '  document.getElementById("win-line").textContent=def.beats[2];\n' +
  '  if(fruitStage()>=5)document.getElementById("win-stats").innerHTML+=\n' +
  '   "<div style=\'color:var(--glow);margin-top:6px\'>🌳 HARVEST CEREMONY — a LEVEL-6 FRUIT ripens on the Akashic Tree</div>";\n' +
  '  else document.getElementById("win-stats").innerHTML+=\n' +
  '   "<div style=\'color:var(--spore);margin-top:6px\'>🌱 promotion: "+LADDER[fruitStage()]+" — admit more blooms to ripen the Fruit</div>";', 1);

fs.writeFileSync("goblin-warren-nes.html", H);
console.log("wrote goblin-warren-nes.html (" + H.length + " bytes)");
