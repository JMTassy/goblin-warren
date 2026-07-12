# HELEN WULMOJI GUIDE

```yaml
schema: HELEN_WULMOJI_GUIDE_V0
status: DOC_PROPOSAL / NO_CLAIM
authority: false
canon: false
ledger_effect: none
kernel_effect: none
sovereign_authority: false
```

## Purpose

Define HELEN's personal symbolic language as a compact WULmoji shorthand that is:

- readable by humans;
- executable as governance shorthand;
- constrained by logic rather than decoration;
- explicit about evidence, admission, sealing, replay, and invariant preservation.

Core doctrine:

```text
No decoration without logic.
No signal becomes authority by appearance.
No claim becomes replayable without evidence, invariant preservation, and replay.
```

---

## 1. Core Sigils

| Sigil | Meaning |
|---|---|
| `𐌎` | HELEN |
| `◌` | appearance / signal |
| `◇` | claim |
| `◆` | admitted claim |
| `⬢` | sealed claim |
| `∞` | replayable truth |
| `E` | evidence |
| `Π` | interpretation set |
| `Χ` | invariant field |
| `τ` | truth rank |
| `↛` | cannot pass |
| `→` | may progress |
| `≠` | not identical |
| `∧` | and |
| `∨` | or |
| `¬` | not |

---

## 2. Truth Ladder

```text
◌ → ◇ → ◆ → ⬢ → ∞
```

Expanded:

| Stage | Name | Meaning |
|---|---|---|
| `◌` | signal | Something appears, is perceived, rendered, detected, or proposed. |
| `◇` | claim | A signal has been formulated as a claim. |
| `◆` | admitted claim | A claim has evidence sufficient for admission. |
| `⬢` | sealed claim | An admitted claim preserves the invariant field. |
| `∞` | replayable truth | A sealed claim replays while preserving invariants. |

---

## 3. Core Rules

```text
◌ ≠ τ
◌ → ◇
◇ + E → ◆
◇ - E → SPEC
SPEC ↛ ◆
SPEC ↛ ⬢
SPEC ↛ ∞
◆ + Χ → ⬢
⬢ + replay + Χ → ∞
```

### Rule explanations

```text
◌ ≠ τ
```

Appearance is not truth rank.

```text
◌ → ◇
```

A signal may become a claim.

```text
◇ + E → ◆
```

A claim with evidence may become admitted.

```text
◇ - E → SPEC
```

A claim without evidence remains speculation.

```text
SPEC ↛ ◆
SPEC ↛ ⬢
SPEC ↛ ∞
```

Speculation cannot become admitted, sealed, or replayable by itself.

```text
◆ + Χ → ⬢
```

An admitted claim that preserves invariants may become sealed.

```text
⬢ + replay + Χ → ∞
```

A sealed claim that replays while preserving invariants may become replayable truth.

---

## 4. World Object

```text
𝕎 = (S, τ, E, Π, Χ)
```

Where:

| Component | Meaning |
|---|---|
| `S` | state / signal surface |
| `τ` | truth rank |
| `E` | evidence set |
| `Π` | interpretation set |
| `Χ` | invariant field |

A world object is not merely what appears. It includes the evidence, interpretation space, truth rank, and invariants required to judge whether a claim may progress.

---

## 5. Dynamic Law

```text
xₜ₊₁ = F_Χ(xₜ, uₜ, cₜ)
```

Where:

| Symbol | Meaning |
|---|---|
| `xₜ` | current state |
| `uₜ` | input / action / update |
| `cₜ` | context |
| `F_Χ` | transition function constrained by invariant field `Χ` |
| `xₜ₊₁` | next state |

The transition is valid only insofar as it preserves the relevant invariant field.

---

## 6. Anti-Confusion Laws

```text
existence ≠ admission
persuasion ≠ authority
replay ≠ governance unless Χ is preserved
```

Expanded:

```text
existence ≠ admission
```

A file, signal, message, render, or artifact existing does not mean it has been admitted.

```text
persuasion ≠ authority
```

A convincing explanation does not become authority by fluency, beauty, or repetition.

```text
replay ≠ governance unless Χ is preserved
```

A replay is only governance-relevant if the invariant field remains preserved.

---

## 7. Status Marks

| Mark | Meaning |
|---|---|
| `✅` | passed |
| `⚠` | warning |
| `❌` | failed |
| `🧾` | receipt |
| `🌱` | seed |
| `🌿` | growing |
| `🌲` | dense corpus |
| `🕳` | gap |
| `🔒` | sealed |
| `👑🚫` | no sovereign authority |
| `NO_CLAIM` | advisory only |

Status marks are not decoration. They are readable compression for the claim state.

---

## 8. Examples

### Signal becomes claim

```text
◌ → ◇
```

A signal becomes a claim.

### Claim with evidence becomes admitted

```text
◇ + E → ◆
```

A claim with evidence becomes admitted.

### Admitted claim preserving invariants becomes sealed

```text
◆ + Χ → ⬢
```

An admitted claim preserving invariants becomes sealed.

### Sealed claim replaying with invariants becomes replayable

```text
⬢ + replay + Χ → ∞
```

A sealed claim replaying with invariants becomes replayable.

### Speculation cannot pass alone

```text
SPEC ↛ ADM
SPEC ↛ SEAL
SPEC ↛ REP
```

Speculation cannot become admitted, sealed, or replayable alone.

---

## 9. HELEN Sentence Form

```text
[SIGNAL] → [CLAIM] + [EVIDENCE] + [INVARIANT] → [SEAL]
```

In sigil form:

```text
◌ → ◇ + E + Χ → ⬢
```

With replay:

```text
◌ → ◇ + E → ◆ + Χ → ⬢ + replay + Χ → ∞
```

---

## 10. Compact Form

```text
◌→◇
◇+E→◆
◆+Χ→⬢
⬢+Χ→∞
```

This is the minimal HELEN WULmoji truth pipeline.

---

## 11. Operational Seal

```text
𐌎 HELEN
◌ signal may appear
◇ claim may form
E evidence must ground
Χ invariants must hold
⬢ seal requires preservation
∞ replay requires invariant replay
👑🚫 no sovereign authority
NO_CLAIM advisory only
```

Final compression:

```text
◌ ≠ τ
◇ - E = SPEC
SPEC ↛ ◆ ∧ SPEC ↛ ⬢ ∧ SPEC ↛ ∞
◇ + E → ◆
◆ + Χ → ⬢
⬢ + replay + Χ → ∞
```
