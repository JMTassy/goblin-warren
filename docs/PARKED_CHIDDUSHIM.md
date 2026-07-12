# Parked Chiddushim — received during BUILD_ORDER, held between steps
<!-- authority=false · claim=NO_CLAIM · parking ledger, not a work order -->
<!-- All entries are REPORTED: operator texts received mid-order on
     2026-07-12, condensed faithfully here so compaction cannot eat them.
     Originals live in the session log. NOTHING here is built until the
     order's step protocol reaches it — creep between steps is forbidden
     by the order itself. -->

## Status: BUILD_ORDER WARREN_KILLER_KIT_V1 in progress
- **STEP 1 (Daily Verdict): BUILT, deployed v1.20, gate 7/7 — awaiting
  operator DONE (stamp + copy row on the live link), then "next".**
- STEPS 2–7: not started, per protocol.

## Parked (in arrival order)

1. **Memory Re-contextualization Mechanics** — memories have Original
   Content + Living Context; new events re-interpret old memories via
   tags/archetypes/moods; `V_m(t) = V_m(t−1) + δ·Relevance`.

2. **Relevance Thresholds (the numbers)** —
   `Relevance = 0.4·TagOverlap + 0.3·ArchetypeAlign + 0.2·MoodResonance + 0.1·ContradictionLink`;
   tiers: 0–24 Noise · 25–44 Echo · 45–64 Resonance · 65–79
   Re-contextualization · 80+ Transformation; δ table by event type
   (care 0.6 → autonomy 1.5+); recontext triggers at R≥65, or R≥45 with
   V_m>70; `ΔE = 0.3·Relevance − 0.5·ContradictionCreated`.

3. **Why It's Addictively Relaxing (design-protection rules)** — safety
   (no timers/failure/FOMO) → parasympathetic state; soft attachment loop
   ("this world notices me"); delayed emotional payoff via replay is the
   secret sauce; formula: low friction + emotional responsiveness +
   gentle meaning accumulation + no punishment.

4. **Warren vs Traditional Virtual Pets** — differentiators: memory that
   changes meaning · absence as content not punishment · emergent story ·
   player-as-witness · contradiction as fuel · the Warren develops its
   own personality.

5. **Emergent Narrative Mechanics (the seven engines)** — care loop as
   input · re-contextualization as emotional engine · absence events ·
   contradiction system as drama engine · archetype constellation as
   thematic engine · Mycelial Gate as propagation layer · Evolution
   Journal as narrator. Principles: protect low-friction input, let
   contradictions breathe, give pattern-noticing surfaces, let the
   Warren have opinions.

6. **Background 3: "The Root Hollow at Dusk"** — main overview scene:
   ancient tree, root walls, neon mycelial pulse, bioluminescent
   lighting (warm low, teal/purple high), goblin houses in hollows,
   3–4 parallax layers, mycelium flow animation on charge, glow scales
   with coherence. Palette per operator design sheet.

7. **Egregore Coherence System (full)** — E as the aliveness meter;
   equation E_{t+1}=E_t+(C·R)−D+A with variable table; thresholds
   0–40 Fragmented · 40–65 Awakening · 65–80 Coherent · 80–92
   Self-Sustaining · 92+ Egregore; effects on Gate/archetypes/
   re-contextualization/narrative/quizzes; felt through behavior, never
   a number. **Binding note already pinned in LIVING_EGREGORE_VISION.md:
   E must be a fold over the event log, never a stored mutable number.**

8. **Egregore theory deep-dive** (Enoch → Lévi/Papus → Golden Dawn →
   Crowley → chaos magic; formation mechanism; "egregore as living
   process, not object") + 5 reference images.

9. **Archetype Constellation** (mechanics + Tarot/Yi-Jing hybrid + the
   "guru level" alchemical/theurgic reading). Engine unbuilt — the
   adoption archetypes and serpent symbolism are its only shipped organs.

10. **Alchemical phases of the ascent** (Nigredo/Albedo/Citrinitas/Rubedo
    mapped to serpent stations, non-linear regression allowed) + **the
    Four Temple Bosses** (Rââm the Unmasker · Seren the Silent · Mâa the
    Bone-Bearer · Orr the Witness — full profiles, arcana, hexagrams).
    ⚠️ MEMBRANE FLAG, needs operator ruling before build: Mâa's spec says
    "if the player has been neglectful, she becomes punitive — damaging
    coherence or creating lasting contradictions" and Seren "can
    temporarily seal zones" — both collide with the locked kid-law (no
    punishment, no guilt, absence is content). Their *tests* can ship;
    their *punishments* cannot, as written.

11. **The Akashic Organ effect-layer** (harmonies boost E, calm bosses,
    trigger re-contextualization, verdict "charge" windows) — the
    INSTRUMENT is built (organ-gates 5/5); the EFFECTS await E.

12. **Temple Boss mask design pass** — reference images sent for the four
    bosses, plus a research summary on ancient African ceremonial mask
    traditions (Dan, Yoruba, Dogon, Fang, Punu, Baule — spirit embodiment,
    transformation, ritual power) as inspiration for boss visual language.
    ⚠️ SOURCING NOTE (not a membrane flag, a content-origin one): the
    IP-safe rule already in `CLAUDE.md` — "all sprites... are original;
    do not introduce third-party game content" — is written against
    fictional IP, but the same principle covers this case: these are
    *living* peoples' sacred ritual objects, not folklore in the public
    domain. Reproducing specific named traditions' mask forms onto
    "boss" enemies the player unmasks/defeats reads as extraction, not
    homage. **What carries over cleanly:** the *design technique* —
    exaggerated symbolic features, large eyes, transformation-through-
    wearing as a game mechanic idea, "mask as portal for a larger force."
    **What doesn't:** copying any specific tradition's actual mask forms.
    If the operator wants boss faces built, they should be original
    goblin-warren design using that technique, same discipline as the
    pixel-art rule. No art generated against this entry yet — still
    behind the Seren/Mâa/Orr body-and-punishment ruling (#10) regardless.

13. **Boss percussion motif** — a shamanic drum/tam-tam layer that joins
    the music when a Temple Boss is present, one distinct percussive
    frequency per boss drawn from the existing sacred solfeggio set (so
    it's the same 7-tone vocabulary the Serpent and Organ already use, not
    a new sound system). CANDIDATE mapping only, nothing built: Rââm
    (unmasking, root/fire) → 396/528 · Seren (silence, stillness) → 852 ·
    Mâa (bone, grounding) → 417 · Orr (witness, crown) → 963. Blocked by
    the same thing #10 is blocked by — there is no boss-presence game
    state to hang "boss is here" off of yet (only Raâm exists in-game).
    When bosses get bodies, this is a cheap add: reuse `Sound.bijaTone`
    plumbing from the Organ, gate it on `S.boss.active`, test it moves no
    governed truth (pure audio, same law as the Organ).

14. **Matcha as a resource economy** — a second currency alongside ZOL:
    a global reserve (bar/cap/decay/generation), per-goblin/zone
    distribution, five spend actions (give to goblin, brew, sustain
    Serpent harmony, offer to a boss, speed Daily Verdict cooldown), plus
    a full 3-phase minigame ("Matcha Brew": Heating → Whisking →
    Infusion, rhythm-timed to the target station's solfeggio tone,
    archetype-modified, 1–5★ output with escalating bonus effects up to
    "powerful harmonic effect on the Tree + possible new Evolution
    Journal proposal").
    **AUDIT (WITNESSED, this repo):** Matcha does not exist as a system.
    The only hit in `game.js` is a one-off joke object from Nib's
    minigame ("Hot Mechanical Matcha" — flavor text, not a resource).
    Everything above is CANDIDATE.
    ⚠️ MEMBRANE FLAG, needs correction before build: "Sustain Serpent
    Harmony: 3–8 Matcha/min" and "higher stations consume Matcha to
    maintain their drone" is spend-to-sustain — a Matcha shortfall could
    degrade the ascent. That collides with `serpentHeight()`'s locked
    law: pure, monotonic, unpurchasable, ZOL-absent by construction,
    "more care never lowers the serpent." Same shape of conflict as
    Mâa's punitive clause (#10) — the *idea* survives, the *mechanism*
    doesn't: any Matcha↔Serpent link must be boost-only (same pattern as
    the Daily Verdict feeding the climb), never a decay/spend risk on
    height or Organ access.
    Also depends on unbuilt/blocked systems as written: archetype-synergy
    bonuses need the Archetype Constellation engine (NEEDS_ME, #9); boss
    tribute needs the #10 ruling. **What's actually free-standing:** a
    stripped Matcha Brew minigame — rhythm-timed to an existing solfeggio
    tone, existing goblins, existing mood-boost hooks (`careLulu` etc.),
    dropping the archetype-synergy and boss-tribute layers — is close to
    a real bounded slice if the operator wants to jump the BUILD_ORDER
    queue for it.

15. **Goblin mood visual system** — a 10-mood table (Curious, Focused,
    Happy, Calm, Thoughtful, Lonely, Proud, Suspicious, Tired, Dramatic,
    Resting) each with a facial-expression + posture + particle/glow +
    color-accent spec, archetype-flavored variants (e.g. "a Proud
    Nurturer looks warm; a Proud Trickster looks mischievous"), a
    "shadow mood" desaturated state for neglect, and a build-order
    starting with Curious/Happy/Resting/Lonely/Focused/Dramatic.
    **AUDIT (WITNESSED, this repo):** the *state* this wants to visualize
    already exists and is richer than the proposal — `game.js` tracks
    per-goblin `mood` as free-form strings (curious, wistful, giggly,
    dreamy, proud, calm, moved, deflated, grateful, quietly proud, and
    more; see `luluMood()` L1222, `applyLuluMood()` L1234, the Daily
    Verdict mood shifts L2059-2076). What doesn't exist is any *render*
    of it: `buildGoblinEl()` (L3670) draws every goblin as the same
    `.g-body` + two ear divs, no expression, no posture, no
    mood-keyed particle layer at all. So this is CANDIDATE art direction
    for a real (and empty) rendering gap, not a duplicate ask.
    No membrane conflict in the core table — pure UI/CSS layer over
    existing state, same shape as the completed Phase 1 asset-polish
    work. The **archetype-flavored variants** sub-piece still needs the
    Constellation engine (#9, NEEDS_ME); **boss mood visuals** (the
    third option offered) is blocked by #10, same as #12/#13.
    Nearest-term buildable slice if the operator wants it: the 6
    priority moods, base version only (no archetype flavor, no shadow
    state) — CSS + a small mood→class map, no reducer touch, own
    selftest gate.

## Where they'll land (when the order reaches them)
- 1+2+7 → the coherence/re-contextualization organ (post-STEP-7, or as
  operator re-orders; membrane-gates.js stands as their adversary).
- 3+4 → design-protection rules for STEP 3 (Attention Law) and STEP 7
  (the kid test).
- 5 → Evolution Journal narrator (post-order bead).
- 6 → art direction for STEP 4 (the Aquarium).
- 12+13 → boss visual + audio design, both gated behind #10's punishment
  ruling (no bodies to paint or drum for yet).
- 14 → a new resource-economy bead, post-order; the minigame slice could
  jump the queue standalone if the operator calls for it; the full
  global-reserve/distribution/boss-tribute shape waits for #9 and #10.
- 15 → art direction for goblin rendering, post-order; the 6-mood base
  slice could jump the queue standalone (pure UI, no reducer risk);
  archetype flavor waits for #9, boss moods wait for #10.

*The scroll waits. It never nags.* 📜
