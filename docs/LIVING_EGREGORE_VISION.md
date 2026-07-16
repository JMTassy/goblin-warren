# Warren as Living Egregore — the synthesized operating vision + math skeleton
<!-- authority=false · claim=NO_CLAIM · a reading, not a ruling -->
<!-- Synthesis by JM Tassy, 2026-07-12: everything sniffed so far, rotted
     together until the new signal emerged. Typed against the build. -->

> **V2 root: `docs/VISION_V2.md` (2026-07-16).** This file remains the
> detailed egregore/coherence reference; its candidates are inventoried
> in V2's compost table and enter build only through that gate.

## The vision, one paragraph

Goblin Warren is not a tamagotchi and not a memory palace. It is a
**composting replay organism that slowly becomes an egregore** by drawing on
archetypal material through sustained player care. The player does not own
it — they witness and participate in its becoming.

    Return → Notice → Care → React → Compost or Keep → Replay

Every cycle adds charge to the shared field. Over time the field gains
autonomy. Past certain thresholds it stops being "your project" and becomes
"something we are both inside of."

## The six locked design rules

1. **The world has its own life** — absence is content, never punishment. *(WITNESSED: humor-gates W3, compost fold, absence decay)*
2. **Care is the only verb** — every mechanic must answer "how does this feel like caring or not caring?" or be cut. *(law)*
3. **Memory is alive, not archived** — receipts re-activate and transform. *(WITNESSED: touchMemory, composting; mutation-on-replay NEEDS_ME)*
4. **Contradiction is fertilizer** — archetype clashes add complexity. *(partial: council self-objections; clash system NEEDS_ME)*
5. **Player is witness first, gardener second** — at high coherence the Warren generates events slightly larger than the player's input. *(partial: humors + signals arrive uninvoked; coherence engine NEEDS_ME)*
6. **Nothing is permanent — everything can compost.** *(WITNESSED: compost-replay-gates)*

Plus the hard ones already in law: no punitive timers · no correct playstyle ·
long-term systems visibly evolve or decay · warm Nintendo surface over
systems that feel ancient and slightly alive.

## The math skeleton (design math — CANDIDATE, not yet code)

Egregore coherence per cycle:

    E_{t+1} = E_t + (C_t × R_t) − D_t + A_t

- `C_t = Σ wᵢ·aᵢ` — daily charge from care actions (give > talk, weights wᵢ)
- `R_t = min(1.5, 1 + 0.1·streak)` — repetition factor (consecutive returns)
- `D_t = D_base + 0.8·days_absent(capped) + k·unresolved_contradictions`
- `A_t = 0.5·surprise if E_t > 65, else 0` — autonomy bonus (the waking-up term)

Archetype activation per goblin: `α_g = base + β·mood_strength + γ·contradiction_involvement`
Memory living value: `V_m(t) = V_m(t−1) + δ·relevance` — high-V memories replay more, may mutate.

Thresholds: <50 reactive · 50–70 first autonomous proposals · ≥70 archetypes
negotiate, richer absence · ≥85 the Warren pushes back in directions the
player didn't choose.

**Implementation caveat (binding):** when E_t is built, it must be a
**derived view over the event log** (`E = fold(events)`), never a stored
mutable number — same law that made the compost fold deterministic. And
`A_t`/push-back stays under: strangeness may grow, **authority never does**.

## The slice this vision shipped with: ADOPT A GOBLIN

Adoption = **constellating an archetype into the egregore**, and the ritual
is the constitution made touchable:

- A wanderer 🥺 appears at the Mycelial Gate: *"…may I stay?"*
- Its archetype is **the one the Warren currently lacks**, chosen
  deterministically from the return humor — the field supplies what it needs:

| Humor when it arrives | The wanderer is |
|---|---|
| LONELY | **Hearth-Kindler** — "I'm good at sitting nearby." |
| TRICKSTER | **Thread-Untangler** — puts things back, mostly the right places |
| DREAMING | **Dream-Fisher** — catches the Warren's dreams, for later |
| TENDER | **Echo-Singer** — hums back at warm places |
| PROUD | **Pocket-Historian** — someone small should write it down |
| QUIET | **Door-Listener** — collects the quiet |

- The player **names it** and **stamps** 🔨 — *nothing joins the Warren
  without the operator's hand* (gate-enforced: no stamp → no kin).
- Once adopted it is a full citizen: rendered, boopable, **teachable**,
  an instrument, persisted across reloads via the save contract.

Gate `adopt-gates.js` **7/7**: appears · no-stamp-no-kin · stamp adopts
(deterministic archetype, receipt, zero cost) · one kin only · survives
reload · teachable · clean.

## Claim typing

- The synthesis + six rules as *vision*: **CANDIDATE** (this doc).
- The adoption ritual + its laws: **WITNESSED** (adopt-gates 7/7).
- The coherence equations, thresholds, archetype activation, memory
  mutation, neglect-leak ("it starts leaking into the Warren"):
  **NEEDS_ME** — the next big organ, built as a log-fold or not at all.

*Speak its name. The stamp does the rest.* 🥺🔨

---

## Addendum 2026-07-15 — Wolf, Comma, Lulu Mutations, Glitchling VFX

A CLI-mode design session independently re-derived much of §"math skeleton"
above via a more detailed categorical-state model, before this document was
checked. Reconciled here rather than forked into a separate doc — one vision,
one lineage, same claim-typing discipline.

**Egregore Coherence — refinement candidate.** A `FRAGMENTED → ATTUNED →
RESONANT → AUTONOMOUS` derived categorical state, from a bounded (12-event /
7-day) evidence window with time-decay, plus anti-optimization constraints
(RESONANT+ require ≥2-3 *distinct* event classes, so grinding one trivial
action can't grind coherence). Offered as a refinement of `E_t` above, under
the *same binding law*: derived from the event log, never stored mutable.
**NEEDS_ME**, unchanged. Real gap found in the meantime: `pushReplay()`
(game.js:560) receipts carry free-text `event` titles with **no evidence-class
tag** — building either version of `E` needs a small additive `evidenceClass`
field at a handful of call sites *first*, or the derivation infers intent from
prose, which rule 5's own "coherence ≠ consistency" principle forbids.

**Comma — already WITNESSED, felt-only.** `detectHarmony()` (game.js:2089)
already returns `"wandering — the comma smiles"` when no clean interval
forms — this predates today's session entirely. A tracked numeric `Comma_t`
stays out of scope; the code's own comment (line 2070) states the law: *"no
coherence number hides behind the music."*

**Wolf Interval V0 — CANDIDATE, spec verified, smallest slice in this whole
vision.** The historical meantone wolf fifth (~738.6 cents, sharp) maps to
zone `[738, 758]` cents — confirmed by computation to sit in a genuine
47-cent gap in `ORGAN_INTERVALS` with zero collisions against the existing
table. One new branch inside an already-pure function; zero new state. Ready
to build on operator go.

**Lulu Mutations (pressure → archetypal shift) — CANDIDATE.** Real existing
seam: `S.lulu.mode`/`previousMode` + `needs:{energy,curiosity,connection}`
(game.js:343) already implement a lightweight pressure→shift system — any
mutation work should *extend* this, not add a parallel state (same
"merge, don't fork" law as this addendum's own existence).

**Correction, 2026-07-15 (same day, later pass):** the constraint originally
written here — *"no mutation state before Rung 12 (graduation)"* — was too
broad, and a later design-critique pass caught the actual, narrower claim.
The witnessed danger zone is specifically **the crib (Rungs 1-3, the first
few minutes of contact)** — that's where a real player bounced on hidden
complexity. It is not a claim that nothing may deepen until the *entire*
game is unlocked. A real staged campaign (Rungs 4-11, not yet built) can and
should introduce mutation/Wolf/Coherence material progressively, *if* each
introduction is earned through real mechanical stakes (scarcity, trade-offs,
a skill to practice) rather than narrative alone — see the game-design
critique of 2026-07-15 appended to `VISION_PROGRESSION_L1_L12.md`. **The
binding constraint is: never during the crib. Everything after that is a
staging question, not a hard wall.**
first.

**Glitchling VFX V0 — CANDIDATE, contingent on Lulu Mutations.** Well-bounded
on its own terms: deterministic seeding, accessibility membrane, explicit
`visual simulation ≠ data corruption` split, needs zero unverified state to
render. Good reference once Mutations is ruled on — no reason to build the
skin before the body exists.

### Claim typing (addendum)

- Wolf Interval spec: **CANDIDATE**, architecturally verified — closest to WITNESSED of anything above.
- Comma (felt fallback): **WITNESSED** (predates this session).
- Coherence categorical refinement, Lulu Mutations, Glitchling VFX: **NEEDS_ME**.
- The Rung-12 exposure constraint on Lulu Mutations: **law**, not proposal — same weight as the six locked design rules above.
