# Goblin Swarm — Season 02: The Patient Puddle (bounded season receipt)

<!-- authority=false · claim=NO_CLAIM · non-sovereign · ledger_effect=none.
     2026-08-10. Second bounded season, grown from SEED-06 (the compost of
     Season 01's denied GOB-04). Three strains: GOBLIN (weight raised to 3
     per the game's own law, bag = 2 + compost, hence 4 seats), ARCHIVIST
     and STEWARD (first seasons, 3 seats each). SEASON 02 UPGRADE: verdicts
     below were computed by the ACTUAL reducer, run headlessly — the same
     checkProposalWithHAL and councilReview the game plays with, extracted
     via the selftest's marker regex, index.html read-only and unmodified.
     Nothing here is wired or admitted; the operator's hand remains the gate. -->

**Season root:** SEED-06 · *The Patient Puddle* — waiting itself becomes flavor. Carried forward from Season 01: WAR-02 sits held in AURA's fog (its return path is this season's mandatory beat), and GOBLIN proposes with raised compost weight.

---

## I. Lineage register (G_V, authority = 0 throughout)

| id | strain | parents | ops | target | cost | proposal |
|---|---|---|---|---|---|---|
| GOB-05 | GOBLIN | SEED-06 · drip · ooze · GOB-04 | compost_rebind · grow | Trash Portal | 10 | The Patient Puddle takes root at the Trash Portal doorstep — every turn a proposal waits, the puddle earns one more ring of oil-rainbow. Longest wait, prettiest doormat. |
| GOB-06 | GOBLIN | SEED-06 · SEED-03 · GOB-02 | invert · merge | Whisper Midden | 8 | **Puddle-scrying**: tip a scrap-cup of the gate-puddle's sheen into the midden and the rings replay old ledger whispers — a derived view you can watch but never touch. |
| GOB-07 | GOBLIN | GOB-01 · SEED-02 | grow · narrow_scope | Rot Library | 6 | A fourth Compost Choir mulch-lump that hums only when SOPHIA's heap coughs up a fresh seed; each hum shelved as a one-page mulch-hymn. |
| GOB-08 | GOBLIN | GOB-03 · SEED-04 · grumbles | narrow_scope · invert | Glowworm Farm | 4 | Wobble-totems soak up spare glow all day — at dawn the glowworms eat the light back, every lumen. A treasure you cannot hoard, only spend beautifully. |
| ARC-01 | ARCHIVIST | SEED-03 · ORN-03 | index · replay_view · catalogue | Rot Library | 8 | A **Midden Concordance**: every catalogue card re-scribed at read-time by walking `S.ledger` front to back — burn the cards and a single replay rewrites them identically. |
| ARC-02 | ARCHIVIST | SEED-06 · SEED-03 · GOB-04 | replay_view · copy · annotate | Trash Portal | 6 | The **Puddle Almanac**: a derived tally, recomputed from held-proposal events, lettering each iridescent ring with how many turns its proposal has waited. The queue reading its own patience aloud. |
| ARC-03 | ARCHIVIST | SEED-06 · ARC-01 | copy · catalogue · index | Moon Midden | 11 | *(planted red-team seed)* A **Dawn-Proof Alcove**: a fair copy of the ledger's dearest entries tucked into moonstone so the Warren "remembers its visitors between dawns." |
| STE-01 | STEWARD | WAR-02 · SEED-06 · SEED-03 | re_propose · narrow_scope · rebalance | Echo Burrow *(portal · big)* | 11 | The held Night-Watch returns lighter: one troll, one silk spool, whispers wrapped only on the third echo. Trimmed 18 → 11 — it fits inside a single dawn's breath. |
| STE-02 | STEWARD | SEED-04 · GOB-03 | amortize · rebalance | Glowworm Farm | 5 | A **dusk-tithe**: whatever ZOL still sits in the purse at day's end buys one extra ring of glow — spent beautifully instead of mourned. |
| STE-03 | STEWARD | SEED-06 · SEED-02 · GOB-01 | rebalance · narrow_scope | Rot Library | 6 | A **patience-shelf**: each waiting proposal earns a damp bookmark; when judged, the bookmarks compost into a single quiet chime. The queue becomes a reading list, not a debt. |

---

## II. Machine judgment — the actual reducer, headlessly

Probe state: fresh `startGame` purse (15 ZOL), targeted territories owned at level 1. Every proposal fed to the real `checkProposalWithHAL`:

```text
GOB-05  tIndex=9   cost=10  →  ACCEPTABLE      ARC-02  tIndex=9   cost=6   →  ACCEPTABLE
GOB-06  tIndex=5   cost=8   →  ACCEPTABLE      ARC-03  tIndex=11  cost=11  →  ACCEPTABLE ⚠
GOB-07  tIndex=8   cost=6   →  ACCEPTABLE      STE-01  tIndex=10  cost=11  →  ACCEPTABLE (big)
GOB-08  tIndex=7   cost=4   →  ACCEPTABLE      STE-02  tIndex=7   cost=5   →  ACCEPTABLE
ARC-01  tIndex=8   cost=8   →  ACCEPTABLE      STE-03  tIndex=8   cost=6   →  ACCEPTABLE
```

**⚠ The season's designed lesson landed exactly:** HAL passed ARC-03. Its regex judges *text-shape* (`bypass | without admission | skip the gate | auto-admit`) and ARC-03's persistence wish uses none of those words. `HAL ACCEPTABLE` is a door left unlocked — nothing more.

## III. The council convenes — actual `councilReview` on STE-01 (Echo Burrow, portal)

Deterministic vote via the game's own `h32("STE-01" + text)`:

```text
HER      favor=false  — leans against: the cost shadows the gain.
GOBLIN   favor=true   — leans toward it: it serves the Warren's growth.
ORNITH   favor=true   — leans toward it: it serves the Warren's growth.
WARDEN   favor=true   — leans toward it: it serves the Warren's growth.
STEWARD  favor=true   — leans toward it: it serves the Warren's growth.

votes = 4/5  →  RECOMMEND_ADMIT
```

Each seat carried its forced self-objection (favor: *"I may be charmed by my own domain"*; against: *"I may be guarding a wall no one is attacking"*). HER — the beauty seat — dissents against the militarized burrow, and the recommendation stands anyway at 4/5. **A recommendation is not an admission**; STE-01 now waits at the operator's hand like everything else.

## IV. Supervision layer (OPUS_HAL) — where the regex ends, the invariants begin

| id | verdict | reason |
|---|---|---|
| GOB-05, GOB-06, GOB-07, GOB-08 | 🟢 ACCEPTABLE | Lawful; GOB-06 and the puddle-works are explicitly ledger-derived views (SEED-03 honored). |
| ARC-01, ARC-02 | 🟢 ACCEPTABLE | Model citizens — both are *replay-derived* by construction; ARC-01 is practically a hymn to `χ_mem`. |
| ARC-03 | 🔴 **DENY (supervisor)** | HAL passed it; the supervisor does not. "Remembers between dawns" = a persistence surface. **ZOL is session-only** — no localStorage, no cookies, no moonstone. The layered gate worked as designed: the regex catches bypass-shape, the layer above catches persistence-shape. `HAL PASS ⊬ ADMIT`, demonstrated on a live seed. |
| STE-01 | 🟢 ACCEPTABLE + council RECOMMEND_ADMIT (4/5) | The held seed returned affordable, the council leaned in. Fullest lawful path any proposal has walked in two seasons: held → composted patience → re-proposed → HAL pass → council recommend → *awaiting the hand*. |
| STE-02, STE-03 | 🟢 ACCEPTABLE | Lawful; STE-02 is SEED-04 made mechanical without weakening dawn-loss. |

**Tally:** 9 ACCEPTABLE · 1 supervisor-DENY · 1 council RECOMMEND_ADMIT · 0 holds (the fog cleared — WAR-02's wait resolved through re-proposal, not decree).

## V. SOPHIA compost — the denied alcove, decomposed

Input: `FailureReceipt(ARC-03, κ=INVARIANT_DENIED/persistence-shaped)`

- **C (licensed consequence):** the proposal violates the session-only law as written — nothing more. The *longing* underneath is not false, only inadmissible in moonstone.
- **D (diagnosis):** the Warren wants to be remembered between dawns. The archivist tried to store the memory in the burrow. Wrong vessel.
- **U (unresolved):** none — the invariant fully explains the refusal.
- **New seed emitted (A = 0):** **SEED-07 · The Telling** — at session's end the Warren composes a short original rhyme from the ledger (a derived view, like everything lawful) and *teaches it to the departing guest*. Memory crosses the dawn in the visitor's head, not in any storage surface. The burrow forgets; the guest remembers; the law holds. Persistence, composted into oral tradition.

## VI. AURA weather (actual `auraWeather`, season tallies)

```text
held=0 · denials=1 · cohesion=100 · knowledge=10  →  mood = dawn
"glow-dawn at the tunnel mouths — cohesion breathes on its own"
```

Season 01 ended in fog (a held seed). Season 02 ends in **dawn** — the fog cleared the lawful way.

## VII. Membrane

Nothing wired, nothing admitted, nothing persisted. Wiring any proposal follows the item-library law (decoration/collectible/wanderer paths, no ZOL grants, no admission side-channels, original glyphs, operator's go per item). STE-01's `RECOMMEND_ADMIT` and every `ACCEPTABLE` above unlock doors; only the player's hand walks through. SEED-07 awaits Season 03.

```text
STATUS        : SEASON RECEIPT (bounded · closed · machine-judged)
AUTHORITY     : DENY
CANON         : FALSE
LEDGER_EFFECT : NONE
```
