# Goblin Warren Spec (pixel edition)

authority=false · NO_CLAIM · separate file

## Concept
- "Dream of Conquest: The Goblin Warren" as a **separate file** (`goblin-conquest.html`).
- Theme + content swap on the proven V1 reducer architecture (byte-for-byte same law).
- Pixel style via technique (not Supercell IP): chunky low-res retro village-builder.
  - All sprites procedural + original.
  - Render Three.js scene at quarter resolution + nearest-neighbor upscale (`image-rendering: pixelated` + `renderer.setSize(lowW, lowH, false)`).
  - Hard-edged pixel UI (3px borders, mono type, stepped animations).

## World
- Center: the Great Compost Heap (crooked three-cone throne-mound ringed with mushrooms/spores) instead of Kernel Castle.
- 12 original warren sites: Mushroom Cellar, Bone-Button Market, Fungal Vault, Moth Chapel, Scrap Bridge, Whisper Midden, Crooked Stair, Glowworm Farm, Rot Library, Trash Portal, Echo Burrow, Moon Midden.
- Portals: last three (council-triggering).
- Palette: swamp-green / ember-amber / bone-parchment. Spore-motes.
- Octagram governance ring stays (law constant).

## Voice & Governance
- GOBLIN hosts start screen + AURA ("ZOL — shiny-shiny, gone at dawn").
- GOBLIN proposal pool largest on home ground (double weight).
- Council = "the Tall Ones convene" (same 5 seats + HAL, recommendation-only).
- AURA weather: spore-fog / ember-storm / glow-dawn (affects fog + whispers).
- "GOBLIN never decides."

## Content
- QCM keeps general-knowledge core; ~8 swapped for goblin/compost-lore (e.g. "What does GOBLIN never do?" → decide).
- Win: 7 warrens or reputation ≥ 100.
- Same unlock-by-knowledge, events, ZOL non-persistence.

## Verification
- Selftest generalized: `node .conquest_selftest.js goblin-conquest.html`
- Same 29 asserts as V1 (reducer markers + invariants: start-through-reducer, council-mutates-nothing, buy-spends-exact, etc.).
- No persistence surfaces.
- Pixel render + UI verified.
- Swarm fuzz (300 episodes) + regression on V1 both clean.

## Files
- goblin-conquest.html (the playable game)
- .conquest_selftest.js (filename param)
- goblin-warren-spec.md (this file)

Law does not reskin. Designed ⊬ emergent. Play, then freeze / bridge / rot. B0 remains gate.
