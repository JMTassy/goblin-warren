# Warren as Living Egregore — the synthesized operating vision + math skeleton
<!-- authority=false · claim=NO_CLAIM · a reading, not a ruling -->
<!-- Synthesis by JM Tassy, 2026-07-12: everything sniffed so far, rotted
     together until the new signal emerged. Typed against the build. -->

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
