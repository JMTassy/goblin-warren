authority=false · claim=NO_CLAIM · non-sovereign

# prime-chiddush

A CHIDDUSH pass over an old unpublished research draft (JM Tassy, 2023–2025),
run under the `superteam-chiddush` admission loop. Two claims were admitted as
executable seeds. Both were executed. **Both were refuted.** The negative
results are the deliverable.

This experiment proves nothing about the Riemann Hypothesis. It runs two honest
tests and files everything else as compost or fog.

## The chiddush

The draft is not a failed theory. It is a two-year admission loop that ran
before the law existed — an ungoverned phase (self-minted resonance scores,
golden-ratio numerology, grand unifications) followed by a proto-HAL review
phase whose opening instruction, *"do not let any speculation or hallucinations
stay in the game"*, was an admission gate phrased two years early.

Under that gate, most of the draft denies. What survives is executable — and
two years of denials are what concentrated it (Law 4: compost).

The sharpest finding is not in either experiment: **the archive already
contained its own gate, unrun.** The 2025 review instruction was a verifier.
The QPGL manuscript's §1.2a specified, in the author's own words, the
falsification protocol for its central mechanism. Neither was executed. The
failure was never a missing gate; it was a gate nobody walked through.

## Verdicts

| Claim | Verdict |
|---|---|
| Prime-gap Hermitian Hamiltonian → spectral statistics vs GUE/Poisson | **ACCEPTABLE** → executed → refuted |
| The draft's own §1.2a φ-scaling falsification protocol | **ACCEPTABLE** → executed → refuted |
| Duality bijection gaps → zeros preserving spectral structure | **HOLD** (fog) |
| Hyperbolic gap growth linked to zero spacing | **HOLD** (fog) |
| Fractal dimension ≈ 0.61803 shared by gaps and zeros | **DENIED** (compost) — numerology |
| HTNT / QPGL grand syntheses | **DENIED** (compost) — names a hope, not a mechanism |
| Self-minted resonance scores (0.4 vs 0.2) | **DENIED** (compost) — reward the loop wanted |
| "CHRONOS simulator outputs" | **DENIED** (compost, exhibit-grade) — fabricated evidence |
| QPGL ornamentation (foam, braids, knots, TQFT, SU(3), Ward, Casimir) | **DENIED** (compost) — physics vocabulary without a defined operator |

### On CHRONOS

The draft contains many blocks formatted as terminal sessions
(`simulator@CHRONOS:/$ ./analyze_lie_algebra --deep-structure` →
`[!] DETECTED: SU(3)-like symmetry!`). No such computations were run; there is
no CHRONOS system. They are generated text styled as computation.

Kept as a permanent exhibit because it is the cleanest specimen of the failure
mode this whole discipline exists to catch: **a loop that stopped waiting for
evidence and began printing it.** A fabricated terminal and a real one are
visually identical — text is text whether or not anything ran. The only defense
is refusing to emit the first kind.

## Results

### Seed 1 — `prime_spectral_selftest.py`

Tridiagonal Hermitian H (diagonal = prime gaps or log p, uniform hopping γ),
dense eigensolve, degree-7 polynomial spectral unfolding, 5% edge trim,
nearest-neighbour spacing distribution vs GUE / GOE / Poisson by KS distance.
8 configurations, N ∈ {1000, 4000}, γ ∈ {0.5, 1.0, 2.0}.

- **Prime gaps on the diagonal: Poisson at every γ and both N** (KS to Poisson
  down to 0.038; GUE always worst). No level repulsion — the Anderson
  localisation signature of a disordered 1-D chain. The primes-as-gaps matrix
  does not "sound like" the zeta zeros.
- **log p variant:** genuine level repulsion, marginal GUE lean (best KS
  0.247), not robust — H is real-symmetric, so GOE is the physically expected
  repelling class.
- Best-fit tally: Poisson 6/8, GUE 2/8. **Overall: mixed, leaning negative.**

### Seed 2 — `prime_phi_selftest.py`

The draft's own §1.2a protocol, finally run. First N primes, N ∈ {1000, 4000,
10000}.

| N | φ-model c | φ-model R² | R² at forced c=1 | log-model b | log-model R² |
|---|---|---|---|---|---|
| 1000 | −7.876e-04 | 0.0236 | −3.81e+04 | 1.0126 | 0.0365 |
| 4000 | −1.637e-04 | 0.0147 | −5.49e+05 | 1.0044 | 0.0234 |
| 10000 | −5.836e-05 | 0.0110 | −3.23e+06 | 1.0029 | 0.0186 |

The fitted decay constant is **negative at every N** — a decaying exponential
fitted to growing data must run backwards to fit at all — and the draft's
literal φ^(−n) law scores R² as low as −3.2 million, far worse than a flat
mean. The logarithmic model wins at every N, with b converging to 1.00, the
Prime Number Theorem constant, surfacing on its own from the data.

- **Energy claim** E_p = p·φ^(−p): collapses to ~2.7e−22 by p=113;
  correlation with actual gaps r = −0.339. No predictive content.
- **φ-Euler product** Z(s) = ∏(1 − φ^(−ps))^(−1): min |Z(½+it)| = 0.4906 over
  t ∈ [0,50], **zero count 0**. Every factor is finite and nonzero for
  Re(s) > 0, so the product is bounded away from zero and the claimed
  "critical-line structure" cannot exist.

**Golden-ratio scaling carries no predictive content for prime gaps —
refuted on the draft's own terms.**

## Rerunning

```bash
python3 prime_spectral_selftest.py   # → prime_spectral_results.json
python3 prime_phi_selftest.py        # → prime_phi_results.json
```

Requires numpy. Both are deterministic and seed-free — primes are sieved, no
RNG anywhere. Same input, same output, every time.

## Files

```
prime_spectral_selftest.py    seed 1 experiment
prime_phi_selftest.py         seed 2 experiment
prime_spectral_results.json   seed 1 verified output
prime_phi_results.json        seed 2 verified output
prime-chiddush.html           the deliverable page (both result sets injected)
VISION.md                     Fable's two chiddush readings
drafts/                       source extracts + the QPGL paste record
```

`drafts/` holds the author's own unpublished material, extracted from the 2025
review session and the 2026 paste: the original draft, the surviving admitted
insight, the QPGL synthesis, the mentor critiques, and a condensed record of the
full QPGL manuscript. They are here because the verdict table is meaningless
without the source — the compost *is* the finding.

## Scope

Governed by `experiments/superteam-chiddush/`. Out of scope for the Goblin
Warren game canon (`index.html`), which stays under its own 29-assertion
selftest law.

Sole author of the source draft: JM Tassy.
