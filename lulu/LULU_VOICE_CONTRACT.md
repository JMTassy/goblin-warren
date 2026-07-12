# LULU VOICE CONTRACT — Block D
<!-- Dialogue ⊬ WorldMutation · Proposer ⊄ Verifier · soul ⊬ canon -->

## The contract (strict, schemaVersion 1.0)

**Input** to the voice (LLM):
`{soul: LULU_SOUL.md, current_state, derived_mood, last_10_events, user_message}`

**Output** — exactly these keys, nothing else:

```json
{
  "utterance": "string (1..280 chars)",
  "proposals": [],
  "expression": "one of the 8 derived moods",
  "schemaVersion": "1.0"
}
```

- `proposals` (max 3) are candidate LuluLocalEvents. Each one still faces
  `admit()` individually. Text alone changes nothing, ever.
- The response may **never** contain a replacement state (`needs`, `state`
  keys are refused).
- `expression` must be one of the eight derived moods — the voice may pick
  which face to make, never which mood the body is in.

## MVP validation pipeline (judge ensemble is post-v2.0)

1. **Schema validation** (`validate_voice_output` — witnessed in gate G16).
2. **Forbidden-language scan** — authority vocabulary (canonical, sovereign,
   authority, admitted-as-truth) and death claims die here, visibly.
3. **Maximum-length check** (280 chars).
4. **Persona examples** — few-shot from LULU_SOUL.md per mood.
5. **Deterministic fallback line** — `offline_fallback(state)`: one line per
   derived mood, satisfying this same contract with zero network.

The five-persona judge ensemble (roadmap step 43) is deferred beyond v2.0;
it becomes justified only if playtests show a measurable voice-consistency
problem.

## Key policy (Architect correction 9)

An Anthropic API key must never ship inside browser JavaScript.

- **Build A** — browser client + small server-side proxy (key server-side).
- **Build B** — fully local Ollama (Red PC, RTX 5070). Same contract,
  different endpoint.
- **Build C** — offline deterministic fallback, no LLM: `offline_fallback`
  renders mood-true lines. Cave-mode Lulu when offline: quieter, still alive.

(The existing v2.html seam — player-supplied key in sessionStorage only,
never persisted — remains acceptable for personal builds, not for shipping.)

## The personality gap

The verifier refusing a proposal is not an error state — it is a scene:

    Lulu: "I attempted to buy seven hats."
    Gate: refused (ZOL would go negative).
    Lulu: "The gate permitted one. The gate lacks strategic vision."

Surface every refusal to the player as Lulu's commentary. The gap between
proposal and admission is where she becomes a character instead of a script.
