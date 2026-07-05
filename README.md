# Dream of Conquest — The Goblin Warren (V0)

A one-file, pixel-styled village-builder where **nothing becomes real until you admit it**.

Sixteen ideas an hour, one lantern, one sovereign hand. Answer riddles, earn ZOL
(a session-only credit — *shiny-shiny, gone at dawn*), claim warren mounds, and let
the goblin folk propose crooked improvements. **HAL** the gate-lantern judges every
proposal (ACCEPTABLE / HOLD / DENY); big moves convene **the Tall Ones' council** —
which may only *recommend*. Your click is the only admission. A local ledger
records every move.

> Imagination is free. The Garden obeys admitted moves.
> No receipt = no change. Law does not reskin.

## Play

Open `index.html` in any browser (needs network once, for the Three.js CDN) — or play
the hosted version via GitHub Pages.

**Controls:** click mounds · `Q` riddles · `B` claim · `P` proposal · `A`/`D`/`H` admit/deny/hold · `R` restart

## Honest engineering

- Single HTML file; the game logic lives in a **pure reducer zone** (no DOM, no THREE)
  between `REDUCER-BEGIN/END` markers — headlessly testable.
- `node selftest.js index.html` → 29 assertions over the full loop (economy, HAL's
  three verdicts, the structural admission gate, council recommends-never-admits, win).
- Property-fuzzed by a swarm of simulated goblin players (5 hostile policies,
  ~28,000 steps): zero rule violations.
- ZOL is never persisted — no localStorage, no cookies, no backend, no accounts.

## Provenance

Part of the **HELEN OS** project — a governed, non-sovereign AI operating substrate
where proposals, verdicts, admissions, and ledgers are the whole law. This game is
that membrane, made playable.

Inspired by the broad village-builder genre. All characters, names, buildings,
mechanics, and art are original. No third-party game content.

© 2026 JM Tassy — sole author. All rights reserved.
