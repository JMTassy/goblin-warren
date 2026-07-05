// HERMENEUTIC_INSPECTOR_CANDIDATE.js
// authority=false . claim=NO_CLAIM . ANNOTATE-only . candidate (host missing)
//
// Admitted bead from the WULmoji / cognition-under-law session (2026-07-05):
//   ADMIT NEXT: HermeneuticInspector module
//   Mode: drop-in extension
//   Reads from: GardenGrowth.traces
//   Writes: reflection tags only
//   Authority: ANNOTATE-only
//   Mutation: none
//
// STATUS: HOST NOT FOUND. This module depends on a `GardenGrowth` trace system
// (traces, addTrace, inspectTraceAt; trace kinds AdmittedBloom /
// MycelialShadowTrace / HeldFogTrace / RaidScarTrace / HealingBloomTrace /
// ConstructionRootTrace), an optional `VisualPolish.floatText`, and a global
// `state` — none of which exist in goblin-warren-v0/index.html,
// goblin-warren.html, goblin-conquest.html, or helen-os-JMTC as of 2026-07-05.
// Verified by grep across all of the above. Do not wire this in until the
// GardenGrowth host exists or the operator rules on adaptation.
//
// SEAM: the optional localStorage persistence at the bottom conflicts with the
// goblin-warren-v0 law "no persistence surfaces" (README / spec / selftest
// discipline). Annotation-only persistence may be lawful in a Garden-layer
// host, but that is an operator ruling, not a default.
//
// WITNESS ADDENDUM (2026-07-05, verified on the metal): the likely lawful host
// is goblin-warren.html (home dir, 1245 lines), which is already event-sourced:
// `world = replayEvents(log)` (line ~636), only account event logs persisted
// (STORE_KEY "goblin_warren_v1"), admitted/denied/held/compost first-class.
// Existing event kinds map onto every trace kind this module wants:
//   PROPOSAL_ADMITTED -> AdmittedBloom      PROPOSAL_DENIED -> MycelialShadow
//   PROPOSAL_HELD     -> HeldFog            RISK_SOURED     -> RaidScar
//   RISK_BLOOMED      -> HealingBloom       SITE_CLAIMED    -> ConstructionRoot
// Re-target = derive traces as a read-only view over the log; reflection tags
// become a new `case "tag"` in dispatch() (currently rejects unknown kinds as
// "unknown event", so the case must be added — old logs replay unchanged).
// Even in that host, the fenced localStorage block below STAYS FENCED: a
// separate reflection-tags key would be a second storage surface, violating
// "only account event logs are stored". Tags enter through the replay door.
// NOTE: the Epoch-7 inspector mockups show "Effect Requested / Effect Ceiling /
// exceeded ceiling" receipt fields — that machinery does NOT exist in the
// draft (closest analog: CLAW proposals auto-HOLD as external effects). Those
// fields are net-new spec, not current data.
// GATE UNCHANGED: implementation queued behind hand-playtest of the vertical
// slice and the operator's word (play -> freeze / bridge / rot).

/* ===== MODULE (verbatim from admission) ===== */

const HermeneuticInspector = {
  selectedTrace: null,
  reflectionTags: {},
  panelId: "hermeneuticInspector",

  init() {
    if (document.getElementById(this.panelId)) return;

    const panel = document.createElement("div");
    panel.id = this.panelId;
    panel.style.cssText = `
      position: fixed;
      right: 12px;
      top: 12px;
      width: 340px;
      max-height: 92vh;
      overflow-y: auto;
      z-index: 9999;
      display: none;
      padding: 12px;
      background: rgba(10, 16, 12, 0.94);
      color: #e8dcc0;
      border: 2px solid #6fa35f;
      box-shadow: 0 0 18px rgba(111, 163, 95, 0.35);
      font-family: monospace;
      font-size: 12px;
      line-height: 1.35;
    `;

    document.body.appendChild(panel);
  },

  open(trace) {
    this.init();
    this.selectedTrace = trace;
    this.render();
    document.getElementById(this.panelId).style.display = "block";
  },

  close() {
    const panel = document.getElementById(this.panelId);
    if (panel) panel.style.display = "none";
    this.selectedTrace = null;
  },

  render() {
    const t = this.selectedTrace;
    if (!t) return;

    const panel = document.getElementById(this.panelId);
    const receipt = this.buildReceiptLayer(t);
    const systemic = this.buildSystemicLayer(t);
    const interpretation = this.buildInterpretationLayer(t);
    const commentary = this.buildAgentCommentary(t);
    const currentTag = this.reflectionTags[t.id] || "";

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="color:#ffd76a;font-size:14px;font-weight:bold;">${this.escape(t.kind)}</div>
        <button onclick="HermeneuticInspector.close()" style="
          background:#1b2418;color:#e8dcc0;border:1px solid #6fa35f;cursor:pointer;
        ">×</button>
      </div>

      ${this.section("RECEIPT LAYER", receipt, "#7fb7ff")}
      ${this.section("SYSTEMIC LAYER", systemic, "#9ee67a")}
      ${this.section("INTERPRETIVE LAYER — non-binding", interpretation, "#ffd76a")}
      ${this.section("AGENT COMMENTARY", commentary, "#b86cff")}

      <div style="border-top:1px solid #6fa35f;margin-top:10px;padding-top:10px;">
        <div style="color:#ffd76a;font-weight:bold;margin-bottom:6px;">REFLECTION LAYER</div>
        <div style="font-size:11px;color:#aaa;margin-bottom:6px;">
          Player-authored meaning tag. ANNOTATE-only. No authority.
        </div>
        <input id="reflectionTagInput" value="${this.escapeAttr(currentTag)}"
          placeholder="wise refusal, not yet, protect the center..."
          style="
            width:100%;
            box-sizing:border-box;
            background:#0d1408;
            color:#e8dcc0;
            border:1px solid #6fa35f;
            padding:6px;
            font-family:monospace;
            font-size:12px;
          ">
        <button onclick="HermeneuticInspector.saveReflectionTag()" style="
          margin-top:6px;
          background:#1b2418;
          color:#e8dcc0;
          border:1px solid #ffd76a;
          padding:5px 8px;
          cursor:pointer;
        ">Save annotation</button>
        <div style="font-size:10px;color:#888;margin-top:6px;">
          This tag cannot grant ZOL, admit proposals, mutate buildings, or override replay.
        </div>
      </div>
    `;
  },

  section(title, body, color) {
    return `
      <div style="border-top:1px solid #263b24;margin-top:10px;padding-top:8px;">
        <div style="color:${color};font-weight:bold;margin-bottom:5px;">${title}</div>
        <div>${body}</div>
      </div>
    `;
  },

  buildReceiptLayer(t) {
    const source = t.sourceEventId || "not yet measured";
    const role = t.sourceRole || "not yet measured";
    const anchor = t.anchorId || "none";
    const phase = t.phase || "not yet measured";
    const ceiling = t.effectCeiling || "ANNOTATE";
    const replay = t.persistent ? "replayable if source event is in ledger" : "runtime-only";

    return `
      <div>Kind: <b>${this.escape(t.kind)}</b></div>
      <div>Trace ID: ${this.escape(t.id)}</div>
      <div>Source Event: ${this.escape(source)}</div>
      <div>Source Agent: ${this.escape(role)}</div>
      <div>Anchor: ${this.escape(anchor)}</div>
      <div>Phase: ${this.escape(phase)}</div>
      <div>Effect Ceiling: <b>${this.escape(ceiling)}</b></div>
      <div>Replay Status: ${this.escape(replay)}</div>
      <div>Meaning: ${this.escape(t.meaning || "not yet measured")}</div>
    `;
  },

  buildSystemicLayer(t) {
    const traces = GardenGrowth?.traces || [];
    const sameKind = traces.filter(x => x.kind === t.kind).length;
    const sameRole = traces.filter(x => (x.sourceRole || "UNKNOWN") === (t.sourceRole || "UNKNOWN")).length;
    const nearby = traces.filter(x => x.id !== t.id && Math.hypot(x.x - t.x, x.y - t.y) < 70).length;

    const admitted = traces.filter(x => x.kind === "AdmittedBloom").length;
    const denied = traces.filter(x => x.kind === "MycelialShadowTrace").length;
    const held = traces.filter(x => x.kind === "HeldFogTrace").length;
    const scars = traces.filter(x => x.kind === "RaidScarTrace").length;
    const healing = traces.filter(x => x.kind === "HealingBloomTrace").length;

    return `
      <div>Similar traces: ${sameKind}</div>
      <div>Traces from same source role: ${sameRole}</div>
      <div>Nearby traces: ${nearby}</div>
      <div>Admitted blooms: ${admitted}</div>
      <div>Mycelial shadows: ${denied}</div>
      <div>Held fog traces: ${held}</div>
      <div>Raid scars: ${scars}</div>
      <div>Healing blooms: ${healing}</div>
      <div style="margin-top:5px;color:#aaa;">
        Pattern claims are descriptive only. Missing metrics remain not yet measured.
      </div>
    `;
  },

  buildInterpretationLayer(t) {
    const readings = this.readingsForTrace(t);
    return `
      <div style="color:#aaa;margin-bottom:6px;">
        This is not a diagnosis. These are possible readings only.
      </div>
      <ul style="margin:0;padding-left:18px;">
        ${readings.map(r => `<li>${this.escape(r)}</li>`).join("")}
      </ul>
    `;
  },

  readingsForTrace(t) {
    const kind = t.kind;

    if (kind === "AdmittedBloom") {
      return [
        "This may be a commitment that found form.",
        "This may be trust becoming architecture.",
        "This may be a decision you were ready to let grow.",
        "This may later ask to be reread from a different horizon."
      ];
    }

    if (kind === "MycelialShadowTrace") {
      return [
        "This may be discipline and protective restraint.",
        "This may be fear of chaos.",
        "This may be timing — an idea needing another form.",
        "This may be unfinished trust still asking to be tested.",
        "This may become fertile compost for a later proposal."
      ];
    }

    if (kind === "HeldFogTrace") {
      return [
        "This may be unresolved tension.",
        "This may be patience rather than refusal.",
        "This may be a question waiting for evidence.",
        "This may be an open horizon the Garden is not ready to close."
      ];
    }

    if (kind === "RaidScarTrace") {
      return [
        "This may be a wound in the Garden’s memory.",
        "This may mark a repeated vulnerability.",
        "This may become a site of resilience.",
        "This may ask whether protection, repair, or reinterpretation is needed."
      ];
    }

    if (kind === "HealingBloomTrace") {
      return [
        "This may be damage transformed into growth.",
        "This may be repair becoming memory.",
        "This may be a sign that the Warren can metabolize harm.",
        "This may be resilience made visible."
      ];
    }

    if (kind === "ConstructionRootTrace") {
      return [
        "This may be work becoming structure.",
        "This may be intention gaining body.",
        "This may be the quiet labor beneath visible change."
      ];
    }

    return [
      "This may be a sign whose meaning is still forming.",
      "This may belong to a larger pattern not yet visible.",
      "This may ask to be reread later."
    ];
  },

  buildAgentCommentary(t) {
    const roles = ["ARCHIVIST", "HER", "CHIDDUSH", "CLAW", "JESTER", "WARDEN", "STEWARD", "GOBLIN"];
    return roles.map(role => `
      <div style="margin-bottom:5px;">
        <span style="color:#ffd76a;">${role}:</span>
        ${this.escape(this.commentaryFor(role, t))}
      </div>
    `).join("");
  },

  commentaryFor(role, t) {
    const kind = t.kind;

    const byRole = {
      ARCHIVIST: {
        default: "This trace is a witness mark. Its source should remain recoverable.",
        MycelialShadowTrace: "This refusal remains in the record as compost, not erasure.",
        AdmittedBloom: "This commitment is now part of the Garden’s historical horizon.",
        RaidScarTrace: "This scar should be tied to its raid event if the ledger preserved it."
      },
      HER: {
        default: "A trace can become beautiful when its mechanism is allowed to show.",
        MycelialShadowTrace: "The shadow is not ugly. It may be fertile.",
        AdmittedBloom: "This bloom is a commitment made visible.",
        HealingBloomTrace: "Pain has been given a form the Garden can carry."
      },
      CHIDDUSH: {
        default: "A single trace may be small, but repeated traces may reveal structure.",
        MycelialShadowTrace: "Rejected forms often hide the next lawful variant.",
        HeldFogTrace: "Fog is not emptiness. It is unresolved structure.",
        RaidScarTrace: "Three scars in one region would become a theorem of weakness."
      },
      CLAW: {
        default: "No interpretation should exceed its authority ceiling.",
        MycelialShadowTrace: "The boundary held. That matters.",
        AdmittedBloom: "Admission was lawful only if the ceiling was respected.",
        HeldFogTrace: "Holding is safer than pretending certainty."
      },
      JESTER: {
        default: "Meaning grows sideways when the straight road gets bored.",
        MycelialShadowTrace: "You buried a door. Some doors learn roots.",
        HeldFogTrace: "Fog is where jokes go to become weather.",
        RaidScarTrace: "A scar is just a map drawn by trouble."
      },
      WARDEN: {
        default: "Every trace has a perimeter. Protect the boundary.",
        RaidScarTrace: "This is a breach mark. Do not romanticize it before repairing it.",
        AdmittedBloom: "A commitment must be defensible.",
        MycelialShadowTrace: "Refusal can preserve the wall."
      },
      STEWARD: {
        default: "The Garden must remain balanced enough to keep tending itself.",
        AdmittedBloom: "A bloom has maintenance cost, even if it is beautiful.",
        HeldFogTrace: "Too much fog can stall the household.",
        MycelialShadowTrace: "Compost is useful only if it is later integrated."
      },
      GOBLIN: {
        default: "Still smells useful. Maybe smaller. Maybe dirtier. Maybe later.",
        MycelialShadowTrace: "Not dead. Compost has teeth.",
        AdmittedBloom: "Good. Now make it cheaper.",
        RaidScarTrace: "Patch it fast. Or make the scar bite back."
      }
    };

    return (byRole[role] && (byRole[role][kind] || byRole[role].default)) || "not yet measured";
  },

  saveReflectionTag() {
    const t = this.selectedTrace;
    if (!t) return;

    const input = document.getElementById("reflectionTagInput");
    const value = (input?.value || "").trim().slice(0, 80);

    this.reflectionTags[t.id] = value;

    if (typeof VisualPolish !== "undefined" && value) {
      VisualPolish.floatText(t.x, t.y - 18, "tagged", "#ffd76a");
    }

    this.render();
  },

  exportReflectionTags() {
    return JSON.stringify(this.reflectionTags, null, 2);
  },

  importReflectionTags(json) {
    try {
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === "object") {
        this.reflectionTags = parsed;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  escape(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  },

  escapeAttr(s) {
    return this.escape(s).replaceAll('"', "&quot;");
  }
};

/* ===== CLICK INTEGRATION (host must call; traces checked before objects) ===== */

function handleCanvasClick(x, y) {
  if (typeof GardenGrowth !== "undefined" && typeof HermeneuticInspector !== "undefined") {
    const trace = GardenGrowth.inspectTraceAt(x, y);
    if (trace) {
      HermeneuticInspector.open(trace);
      return;
    }
  }

  // Existing NPC / building / proposal click logic continues here.
}

// Initialize once:
// HermeneuticInspector.init();

/* ===== OPTIONAL PERSISTENCE (SEAM — see header; requires operator ruling) =====

function saveHermeneuticAnnotations() {
  localStorage.setItem(
    "goblin_warren_reflection_tags",
    HermeneuticInspector.exportReflectionTags()
  );
}

function loadHermeneuticAnnotations() {
  const raw = localStorage.getItem("goblin_warren_reflection_tags");
  if (raw) HermeneuticInspector.importReflectionTags(raw);
}

// Auto-save patch (replaces saveReflectionTag):
HermeneuticInspector.saveReflectionTag = function () {
  const t = this.selectedTrace;
  if (!t) return;

  const input = document.getElementById("reflectionTagInput");
  const value = (input?.value || "").trim().slice(0, 80);

  this.reflectionTags[t.id] = value;
  localStorage.setItem("goblin_warren_reflection_tags", this.exportReflectionTags());

  if (typeof VisualPolish !== "undefined" && value) {
    VisualPolish.floatText(t.x, t.y - 18, "tagged", "#ffd76a");
  }

  this.render();
};

===== END OPTIONAL PERSISTENCE ===== */

/* ===== SELFTEST (requires GardenGrowth host + global `state`) ===== */

function selftestHermeneuticInspector() {
  HermeneuticInspector.init();
  GardenGrowth.init(640, 480);

  const beforeZol = state?.zol ?? 0;

  const t = GardenGrowth.addTrace("MycelialShadowTrace", 100, 100, {
    sourceEventId: "PROPOSAL_DENIED_TEST",
    sourceRole: "JESTER",
    meaning: "Denied risky shortcut tunnel"
  });

  HermeneuticInspector.open(t);

  const panel = document.getElementById(HermeneuticInspector.panelId);
  const html = panel ? panel.innerHTML : "";

  HermeneuticInspector.reflectionTags[t.id] = "not yet";

  const afterZol = state?.zol ?? 0;

  const tests = [
    ["panel exists", !!panel],
    ["opens selected trace", HermeneuticInspector.selectedTrace?.id === t.id],
    ["receipt layer visible", html.includes("RECEIPT LAYER")],
    ["systemic layer visible", html.includes("SYSTEMIC LAYER")],
    ["interpretive layer visible", html.includes("INTERPRETIVE LAYER")],
    ["non-binding label visible", html.includes("non-binding")],
    ["reflection layer visible", html.includes("REFLECTION LAYER")],
    ["agent commentary visible", html.includes("AGENT COMMENTARY")],
    ["multiple possible readings", html.includes("This may be")],
    ["does not grant ZOL", beforeZol === afterZol],
    ["trace remains annotate only", t.effectCeiling === "ANNOTATE"]
  ];

  return tests.map(([name, ok]) => ({ name, ok }));
}

/* ===== FINAL LOCK =====
HermeneuticInspector is ANNOTATE-only.
It reads traces. It exposes receipts. It reveals patterns.
It offers meanings. It lets the player tag reflection.
It never admits. It never mutates. It never diagnoses.
Next after this: Garden Explorer / Epoch View.
===== */
