# SMALLEST COHERENT VERTICAL SLICE
## Goblin Warren v1 (iPhone) — Ready-to-Extend Module

**Date:** 2026-07-11  
**Recommendation:** Boot → First Proposal → Resolution

---

## SELECTION CRITERIA

A "coherent vertical slice" must:
1. Execute end-to-end without external dependencies
2. Require zero refactoring to work correctly
3. Serve as foundation for next feature addition
4. Be testable in isolation
5. Contain no partial implementations

---

## THE SLICE: "Gerald's First Choice"

### Scope
The complete flow from game boot through player's first decision:
```
Boot 
  → Load/init state (2s delay)
  → Ambient bug escape (15s)
  → Gerald proposal (25-40s window)
  → Player chooses TRY/HOLD/COMPOST
  → Outcome + state persistence
  → Reload recovery
```

### Entry Point
**File:** game.js line 1924 `boot()`  
**HTML:** index.html (all elements required present)  
**CSS:** style.css (all animations working)

### Exit Point
**File:** game.js line 876 `saveState()` after `resolveProposal()`  
**Witness:** game.js lines 941-969 `resumeAfterReload()` correctly routes on page refresh

---

## CODE BOUNDARIES

### INCLUDED (No refactoring needed)

#### 1. State Management
- **Lines:** game.js 177-244 (makeState, validAndComplete, mergeDefaults, loadState, saveState)
- **Why included:** State contract is complete and frozen
- **Testability:** verify.js T8 confirms reload restores state
- **External deps:** None (localStorage only)

#### 2. Boot Sequence
- **Lines:** game.js 1924-1949, 894-939
- **Functions:** boot(), bootScriptedArc(), ambientBugEscape()
- **Why included:** Scripted timing is critical; no external waits or promises
- **Testability:** verify.js T5 confirms proposal fires 25-40s window
- **External deps:** None (uses setTimeout/requestAnimationFrame only)

#### 3. Signal Creation
- **Lines:** game.js 675-689, 644-667
- **Functions:** createSignal(), pickSignalType(), signalZoneFor()
- **Why included:** Gerald always signals as "bug" type (deterministic)
- **Logic:** World state → weighted probability → forced-text proposal at line 915
- **External deps:** None

#### 4. Proposal Creation & Lulu Modes
- **Lines:** game.js 691-705, 47-66, 56-66
- **Functions:** createProposalFromSignal(), chooseLuluMode()
- **Data:** LULU_MODES, SIGNAL_MODE_MAP, PROPOSALS
- **Why included:** Signal→Mode→Text deterministic; mode display is CSS
- **Testability:** verify.js T5 confirms proposal text appears
- **External deps:** None (DOM writes only)

#### 5. Resolution (TRY/HOLD/COMPOST)
- **Lines:** game.js 776-878
- **Function:** resolveProposal()
- **State mutations:** 
  - S.world (warmth, treeHealth, bugPressure, soil, gardenToxicity)
  - S.goblins[id].mood, memory, task
  - S.objects (Gerald's Apartment, observation jar, mushroom bloom)
  - S.flags.firstProposalResolved
- **Why included:** Three-way split is complete; all branches tested
- **Testability:** verify.js T6/T7 confirm try/hold/compost work
- **External deps:** Sound functions (but mutable via settings.muted)

#### 6. Replay Logging
- **Lines:** game.js 255-261, 853
- **Function:** pushReplay()
- **Why included:** Event logging is atomic to resolution
- **Testability:** verify.js T7 confirms replay entry created
- **External deps:** None

#### 7. Persistence After Choice
- **Lines:** game.js 250-253, 1928 (renderAll line before saveState called)
- **Functions:** saveState(), renderAll(), renderReplayStrip()
- **Why included:** Save is called after resolution; reload tests it
- **Testability:** verify.js T8 confirms reload restores choice outcome
- **External deps:** localStorage (with try/catch fallback)

#### 8. Reload Recovery
- **Lines:** game.js 941-969, 234-244
- **Function:** resumeAfterReload()
- **Logic:** 
  - If !greeted: boot arc
  - Else if !firstSignalSeen: ambient bug
  - Else if !firstProposalResolved: auto-fire Gerald
  - Else if !secondEventReferencedFirst: fireArcFollowUp
  - Else: resume ambient loop
- **Why included:** Recovery routing is deterministic; no external waits
- **Testability:** verify.js T8/T9 confirm reload recovery works
- **External deps:** None

#### 9. Rendering System
- **Lines:** game.js 975-1186, style.css (all animations)
- **Functions:** buildStaticWorld(), buildGoblinEl(), renderGoblins(), renderObjects(), 
  renderSheetProposal(), renderReplayStrip(), renderTopbar()
- **Why included:** Render pipeline is complete; all CSS animations work standalone
- **Testability:** verify.js screenshots (01-boot, 02-first-proposal, 03-after-try) verify rendering
- **External deps:** Three.js (for world viewport only; fallback to CSS if missing)

#### 10. Audio System
- **Lines:** game.js 266-323, 384
- **Functions:** ensureAudio(), resumeAudio(), tone(), Sound.* (all audio synths)
- **Why included:** All sounds work offline; no API calls
- **Testability:** verify.js T11 confirms mute toggle; sound callbacks in resolveProposal()
- **External deps:** Web Audio API (with graceful degradation if not available)

#### 11. Goblin AI & Movement
- **Lines:** game.js 157-175, 566-639, 602-638
- **Functions:** makeGoblin(), scoreZone(), pickTargetZone(), tickGoblin(), 
  moveGoblinToZone(), scheduleGoblinTick()
- **Why included:** Movement is independent of proposal system; runs in parallel
- **Testability:** verify.js T3 confirms goblins move without input
- **External deps:** None (uses Math.random → seeds via S.actions)

#### 12. Input Wiring
- **Lines:** game.js 1827-1887, 1298-1328
- **Functions:** wireInput(), onTapGoblin(), doBoop()
- **Event listeners:** mute, proposal buttons, goblin taps
- **Why included:** Core input pipeline is stable
- **Testability:** verify.js T4/T6 confirm taps work; T11 mute works
- **External deps:** None (pure event listeners)

---

### EXCLUDED (These have gaps; don't ship in this slice)

#### Memory Seed Quest
- **Location:** game.js 387-535
- **Reason:** Cascade system not implemented; evaluateCarrier() unused
- **Impact on slice:** NOT USED in Gerald → First Choice flow
- **When to add:** After cascade is implemented (separate PR)

#### Maestro Moss Lesson
- **Location:** game.js 507-529, index.html 109-115
- **Reason:** Quest is never triggered by first proposal alone
- **Logic:** `triggerMemorySeedQuest()` checks `S.replay.length < 3` (line 464)
- **Trigger event:** Line 865, called AFTER third proposal resolved, NOT after first
- **Impact on slice:** UNREACHABLE in "Gerald's First Choice" flow
- **When to add:** After cascade is implemented (separate PR)

#### Boss Encounters (Raâm, False Crown)
- **Location:** game.js 1509-1662
- **Reason:** Spawned via separate timers (lines 1936, 1934)
- **Timing:** First spawn 50-90s after boot (line 1936), Crown only after Spire unlocks
- **Impact on slice:** May appear AFTER first proposal if timing aligns, but not required
- **When to add:** Can be included (doesn't break slice) but adds complexity
- **Recommendation:** OPTIONAL (add if testing concurrent event handling desired)

#### Memory Moth Quiz
- **Location:** game.js 1665-1814
- **Reason:** Spawned via separate timer (line 1937)
- **Timing:** First spawn 45-80s after boot
- **Impact on slice:** May appear AFTER first proposal, but not required
- **When to add:** OPTIONAL (add if testing quiz integration desired)

#### Tree Party / Boop Chain
- **Location:** game.js 1188-1295
- **Reason:** Triggered only by player boops (deliberate multi-tap combo)
- **Impact on slice:** NOT TRIGGERED unless player taps goblins in right sequence
- **When to add:** OPTIONAL (add if testing emergent mechanics desired)

#### Spire/Tink Progression
- **Location:** game.js 1330-1370
- **Reason:** Requires 10+ sap earned (line 1345)
- **Impact on slice:** NOT TRIGGERED in single proposal (max sap earned is 2 from quiz)
- **When to add:** OPTIONAL (add if testing long-play progression desired)

#### Temple/Oracle
- **Location:** game.js 1402-1499, index.html 159-168
- **Reason:** Clickable element; not required for first proposal flow
- **Impact on slice:** Can be included without breaking flow
- **When to add:** OPTIONAL (add if testing symbolic layer desired)

#### WULmath/Sigma/WULmoji
- **Status:** Not implemented (no code found)
- **Impact on slice:** ZERO (does not exist)

---

## VERTICAL SLICE SPECIFICATION

### Happy Path (TRY choice)
```
1. Boot screen fades (0-3s)
2. Lulu greets (2.2s) — bubble visible
3. Bug critter escapes (15s) — animation runs
4. Gerald proposal fires (25-40s window) — sheet-proposal shown
5. Player taps "TRY IT" button
6. Gerald's Apartment object appears in Nursery
7. Pip mood → "delighted"
8. Replay chip logged: 🌱 TRY
9. State persisted to localStorage
10. Reload page → all state + choice outcome restored
```

### Alternate Paths (HOLD/COMPOST)
```
HOLD path:
  → Observation Jar object in Forge
  → Pip task → "watching"
  → Replay chip logged: ⏳ HOLD

COMPOST path:
  → Mushroom Bloom object in Garden
  → Zaz mood → "delighted"
  → Soil +8
  → Replay chip logged: 🍂 COMPOST
```

### Reload Path
```
1. Reload page
2. localStorage restored to S
3. firstProposalResolved = true
4. resumeAfterReload() → detects state 4
5. Schedule fireArcFollowUp (5-20s)
6. Second proposal fires ("Gerald's neighbor…" or jar variant)
```

---

## FILE CHECKLIST

### Must Include (No Changes)
- [x] game.js (full file)
- [x] index.html (full file)
- [x] style.css (full file)
- [x] manifest.json (not read, but referenced in index.html line 8)

### Can Be Stubbed
- [ ] v2.html — not used in v1
- [ ] v3.html — not used in v1
- [ ] v2-selftest.js — not used in v1
- [ ] v3-selftest.js — not used in v1

### Test Suite
- [x] verify.js — 22 tests, all pass for this slice

### Documentation
- [x] CLAUDE.md — reference only
- [x] v1.9-spec.md — reference only
- [x] README.md — reference only

---

## TESTING CHECKLIST (Verify.js)

### Tests covering Gerald's First Choice slice:
- [x] **T1:** No console errors ✓
- [x] **T2:** No horizontal overflow (320/390 viewports) ✓
- [x] **T3:** Goblins move (parallelverification) ✓
- [x] **T4:** First interaction <10s ✓
- [x] **T5:** First proposal 25-40s ✓
- [x] **T6:** TRY/HOLD/COMPOST work ✓
- [x] **T7:** Visible change logged ✓
- [x] **T8:** Reload restores state ✓
- [x] **T9:** Second event references first ✓
- [x] **T10:** Tap targets ≥44px ✓
- [x] **T11:** Mute toggle ✓
- [x] **T12:** No forbidden words ✓
- [x] **T13:** No backend requests ✓
- [x] **T18:** Label collision avoidance ✓

### Tests NOT in slice (but passing):
- [ ] T15: Boop reaction (optional mechanic)
- [ ] T16: Tree Party (optional mechanic)
- [ ] T17: Memory Moth quiz (optional, may appear)
- [ ] T19: Spire unlock (unreachable in slice)
- [ ] T20: False Crown (optional, may appear)
- [ ] T21: Raâm (optional, may appear)
- [ ] T22: Temple (optional, clickable)
- [ ] M23-M26: Quest (unreachable in slice)

---

## EXTENSION VECTOR FOR NEXT PR

### Once This Slice Ships
The memory seed quest is built on top of this foundation:
1. `resolveProposal()` calls `triggerMemorySeedQuest()` after **third** proposal (line 865)
2. Quest overlays (maestro-quest, maestro-lesson) already in index.html
3. Input wiring already exists (maestro-choice-btn, maestro-lesson-close)
4. evaluateCarrier() skeleton exists but unused

### What Needs Work
1. **Wire evaluateCarrier()** → show ranked choices
2. **Implement cascades** → process nextStep field
3. **Log causal chains** → 3 replay entries per quest resolution
4. **Test with M27-M30** → cascade tests in verify.js (ready to enable)

### Effort Estimate
- Cascade implementation: 6-8 hours
- Testing: 2-3 hours
- Documentation: 1-2 hours
- **Total:** ~1 day for complete quest system

---

## INDEPENDENCE TEST

### What breaks if we remove optional systems?

**Remove Bosses (Raâm + Crown)?**
- ✓ No breakage (separate event loop, no state deps)
- ✓ Rendering, sound, quests unaffected
- ✓ Progression unaffected

**Remove Moth Quiz?**
- ✓ No breakage (separate event loop)
- ✓ World state mutations (warmth/soil) could be done elsewhere
- ✓ Replay chip generation could be stubbed

**Remove Boop Chain?**
- ✓ No breakage (input system still works)
- ✓ Warren Dance/Tree Party are emergent only
- ✓ Progress/earnings unaffected if skipped

**Remove Temple/Oracle?**
- ✓ No breakage (pure UI layer)
- ✓ No state mutations
- ✓ No side effects

**Remove Memory Seed Quest?**
- ✓ No breakage (triggered after slice ends)
- ✓ UI overlays present but hidden
- ✓ learning state initialized but unused

**Conclusion:** This slice is **fully independent**. All optional systems can be removed without causing state inconsistency or crashes.

---

## COHERENCE BOUNDARIES

### This slice is COHERENT because:
1. ✓ All systems are working (no TODOs)
2. ✓ No circular dependencies
3. ✓ State flow is unidirectional (boot → signal → proposal → resolution → save → reload)
4. ✓ All paths tested (verify.js T1-T13)
5. ✓ No partial implementations (cascade system excluded)

### This slice is NOT coherent if:
- ✗ We include Maestro quest (relies on third proposal, cascade system)
- ✗ We include WULmath/Sigma (not implemented)

---

## DELIVERY CHECKLIST

Before shipping this slice, verify:
- [x] **Run:** `node verify.js` → all 22 tests pass
- [x] **Coverage:** Browser (390×844, 320×568 viewports)
- [x] **Offline:** No network calls required
- [x] **Audio:** Works muted, works unmuted, graceful fallback
- [x] **Reload:** State persists and recovery paths work
- [x] **Mobile:** Touch input, tap targets ≥44px, safe-area respected
- [x] **Accessibility:** Buttons labeled, focus order sensible
- [x] **No Errors:** Zero console errors (bg image load exception allowed)

---

## CONCLUSION

**"Gerald's First Choice"** is the smallest coherent vertical slice. It:
- ✓ Requires ZERO refactoring (all code working)
- ✓ Runs end-to-end in <50 seconds
- ✓ Is fully testable (14 verify.js tests confirm)
- ✓ Serves as foundation for Memory Seed Quest
- ✓ Exercises all critical systems (state, render, audio, persistence, reload)

**Deploy this first.** Once shipping, cascade system becomes the next PR with zero refactoring of this slice needed.

