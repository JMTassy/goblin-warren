# SOLFEGE_REDESIGN — La Pluie Sonore + Le Tambour de Bram (v2 of L1/L2)

<!-- authority=false · canon=false · ledger_effect=none · non-sovereign -->

## Why (operator verdicts, 2026-07-17)
1. The opening reads as passive rain — the player waits.
2. Matcha "is bugging": the circular-drag whisk gesture is fragile under a
   mouse (angle unwrapping), and the fiction is disconnected.
3. The game gains a second educational axis: solfège/music initiation,
   taught through the same mechanics as the AI axis, not beside them.

## First-principles re-derivation (no patches)
The wall was the *gesture*, not the concept. Both L1 and L2 concepts
survive intact; their carriers become musical:

- **L1 — La Pluie Sonore (catch, avoid, discriminate — ON THE BEAT).**
  Falling objects are now notes on a deterministic beat grid
  (BEAT = 0.75 s). Catching counts only on the beat (±0.15 s window);
  off-beat catches bounce, harmlessly logged. This converts the passive
  rain into an active rhythm skill from minute one. The discrimination
  lesson is unchanged and sharper: the **Fausse Note** looks identical to
  a true note; Bram's hum is a fallible signal; the listening lens
  (VERIFY) is proof. AI axis: timing/observation, signal ≠ proof.
  Solfège axis: pulse, timing, pitch names (Do–Sol), critical ear.
- **L2 — Le Tambour de Bram (tap, regulate, temporize).** Replaces the
  matcha whisk. The player taps a drum; the inter-tap tempo must stay in
  a band (1.5–3.5 taps/s). Resonance accrues only in-band; fatigue
  accrues while drumming. The constants entail rest: 8 s of in-band
  resonance costs 6.4 fatigue against a cap of 5 — **the silences are
  part of the music**, structurally. Tapping absurdly fast clatters and
  costs resonance. AI axis: regulation, bounded sustained effort,
  recovery as work. Solfège axis: tempo, rests, ostinato.
- **L0 — Fire unchanged.** Adoption canon: the fire stays the first
  shared task (assemble/drag/hold). The musical axis enters at L1.

## Operator's four design questions — defaults chosen (overrule any)
1. Solfège level at start: **rhythm first** (most accessible); pitch
   names appear as labels/sounds on L1 notes without being tested.
2. Balance: **AI concepts remain the spine; music is the medium** — the
   gesture vocabulary is now musical, the governance lessons unchanged.
3. Bram musical from the start: **yes, expression-only** — he hums hints
   and reacts to catches through the same provenance-labeled channel;
   nothing about audio touches δ.
4. Falling objects: **kept, but active** — the beat window makes catching
   a rhythm act, answering "too passive" without discarding the tested
   overlap scheduler.

## What changes in code (engine truth, not reskin)
- Kinds: gem→note (faux, ember kept). Events: NOTE_CAUGHT{note, onBeat},
  OFFBEAT_BOUNCE, NOTE_MISSED; L2: TAP action replaces WHISK;
  STRAIN/RESTED/CLATTER replace OVERHEAT/COOLED/SPLASH; state key
  matcha→rhythm. Action surface stays closed at 9 constructors.
- C3 gesture families become: L0 assemble/drag/hold ·
  L1 catch/avoid/discriminate-on-the-beat · L2 tap/regulate/temporize.
  Article §6/§8/abstract updated accordingly; suites re-run; receipts
  re-emitted; changed sections flagged for a focused re-review pass.
