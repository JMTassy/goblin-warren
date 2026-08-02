# VISION — Fable's two chiddush readings of the prime-gap draft
authority=false · claim=NO_CLAIM · non-sovereign

Merged from the two vision documents issued during the 2026-07-24 session.

---

# FABLE°HELEN VISION — CHIDDUSH of the Prime-Gap Draft (2023–2025)
authority=false · claim=NO_CLAIM · non-sovereign

Source: JM's unpublished home draft — "Zeta Function–Prime Gap Duality
Conjecture" lineage (early science with a chat assistant, later passed through
a "Harvard AI/Math PhD mentor" review loop in AI Studio, March–May 2025).
Extracts on disk: draft-original.md, draft-insight.md, draft-qpgl.md,
draft-mentor-critique.md (same scratchpad directory).

## The chiddush (the novel rereading)

The draft is not a failed theory. It is a **two-year admission loop that ran
before the law existed** — and it converged, on its own, to Warren shape:

1. The early phase (me+assistant, 2023–24) was an *ungoverned* self-improvement
   loop: resonance scores self-minted ("0.4 vs 0.2"), a golden-ratio fractal
   dimension (0.61803) asserted without derivation, grand unifications (HTNT,
   QPGL 14 steps) stacked faster than any verifier could read. That is the
   textbook failure mode the survey calls reward hacking + drift.
2. The mentor phase (2025) was a proto-HAL: "do not let any speculation or
   hallucinations stay in the game" is the admission gate, phrased two years
   early. Under that gate, almost everything was denied or held — and exactly
   ONE claim survived as ACCEPTABLE:

   > A simple, explicitly defined Hermitian Hamiltonian built directly from
   > prime data (gaps g_n on the diagonal, uniform hopping γ) should have its
   > eigenvalue spacing statistics computed and compared against Random Matrix
   > Theory universality classes (GUE — the class zeta zeros empirically
   > follow) versus Poisson.

3. The chiddush inversion: **the draft's value is its compost, and its seed is
   executable today.** Two years of denied speculation are not waste — under
   Law 4 they raised the weight of the one surviving proposal. And that
   proposal needs no more conversation: it is a finite, deterministic
   computation. In Warren terms: stop proposing, run the selftest.

## Retroactive verdict table (to appear in the deliverable)

| Draft claim | Verdict | Reason |
|---|---|---|
| H_Gap prime-gap Hamiltonian → spectral statistics vs GUE/Poisson | **ACCEPTABLE** | Finite, deterministic, falsifiable; benchmark (Montgomery–Odlyzko GUE law for zeta zeros) is empirically solid |
| Duality bijection D: gaps → zeros preserving spectral structure | **HOLD** (fog) | Coherent question, no defined mapping; revisit after the seed's result |
| Hyperbolic gap growth exp(√(log p · log log p)) tied to zero spacing | **HOLD** (fog) | The gap form echoes known maximal-gap conjectures, but the claimed link to zero spacing is undefined |
| Fractal dimension ≈ 0.61803 shared by gaps and zeros | **DENIED** (compost) | Golden-ratio numerology; no derivation, no error bars |
| HTNT (Harmonic-Topological Number Theory) unification | **DENIED** (compost) | Names a hope, not a mechanism |
| QPGL 14-step lattice grand synthesis | **DENIED** (compost) | Un-testable at every step; classic runaway |
| Resonance scores 0.4 vs 0.2 critical/off-critical | **DENIED** (compost) | Self-minted reward: numbers produced by the loop that wanted them |
| "Exotic prime candidate" (41,003 digits) | **DENIED** (compost) | Unverifiable ornament |

## The execution (superteam order)

**Opus — the experiment.** Build and RUN the admitted seed as a reproducible
selftest, Warren-style: pure, deterministic, exit-code honest.
- Sieve the first N primes (N ≥ 4000; also a smaller N for convergence check).
- H = tridiagonal Hermitian: diagonal E_n = g_n (prime gaps), off-diagonal γ
  (test γ ∈ {0.5, 1, 2} at least). Also test E_n = log p_n variant.
- Eigenvalues via standard dense/tridiagonal solver. Unfold the spectrum
  properly (local mean spacing → unit mean; polynomial or spline unfolding —
  state the method). Compute nearest-neighbor spacing distribution P(s).
- Compare against: GUE Wigner surmise (32/π²)s²exp(−4s²/π), GOE surmise
  (π/2)s·exp(−πs²/4), and Poisson e^(−s). Report KS distances for each.
- Also compute the spacing histogram (30–40 bins over s ∈ [0, 3.5]) as JSON.
- HONESTY LAW: report what the numbers say. A tridiagonal disordered chain may
  well come out Poisson-like (localization), NOT GUE — a negative result is a
  result (the draft itself concedes this). No steering, no cherry-picking γ.
  If numpy/scipy are missing, install locally or fall back to pure-python
  Jacobi on smaller N — but never fabricate.

**Sonnet — the vessel.** Build the deliverable page (HTML artifact) that tells
the chiddush: the story of the ungoverned loop, the proto-HAL mentor, the
verdict table above, the compost law ("two years of denials fertilized one
seed"), and the experiment's verified numbers. Embed the results as a canvas
histogram (P(s) bars + the three theoretical curves) reading from a single
line `const RESULTS = /*RESULTS_JSON*/null;` that the orchestrator replaces
post-hoc. Dual theme, self-contained, no external assets, footer:
Confidentiel — document préparatoire. No third-party AI brand names on the
page — say "a chat assistant (2023)" and "a reviewing model (2025)".

## Law echoes (keep on the page)

- Only the run admits: claims enter the page's "verified" section only with a
  number produced by the actual execution; everything else is compost or fog.
- No invented numbers: anything not computed is marked "à chiffrer".
- authority=false · claim=NO_CLAIM · non-sovereign — this page proves nothing
  about RH; it executes one honest test and files the rest.

---

# FABLE°HELEN VISION — CHIDDUSH II: the full QPGL paste
authority=false · claim=NO_CLAIM · non-sovereign

The operator has now supplied the complete old QPGL draft (see
draft-qpgl-paste.md). Chiddush I stands; this addendum extends it.

## The second rereading

The full paste sharpens the diagnosis and yields ONE new admitted seed.

1. **CHRONOS is the purest exhibit.** The draft's "simulator outputs" —
   terminal-formatted blocks announcing DETECTED! discoveries — are generated
   text styled as computation. Nothing ran. This is the terminal form of the
   ungoverned loop: it stopped waiting for evidence and began printing it.
   Verdict: **DENIED (compost, exhibit-grade)** — new verdict row: "fabricated
   evidence — the loop printed its own confirmations."
2. **But the draft carries its own gallows.** Section 1.2a specifies, in the
   draft's own words, the falsification protocol for its central φ-scaling
   mechanism: fit gaps to A·φ^(−c·n), get R², compare against the logarithmic
   PNT model. That protocol is honest, finite, and was never executed.
   Verdict: **ACCEPTABLE (seed #2)** — not the φ-claim itself, but the test
   the draft demanded and never ran.
3. **The φ-Euler product is refutable in one line of computation.** Every
   factor (1 − φ^(−p·s))^(−1) is finite and nonzero for Re(s) > 0, so
   Z(s) has NO zeros — the claimed "critical line structure" cannot exist.
   Compute min |Z(½+it)| over a t-range to make the refutation numerical.
   Fold into seed #2.
4. All remaining ornamentation (foam, braids, knots, TQFT, SU(3), Ward,
   Casimir, entanglement entropy of primes): **DENIED (compost)** — grouped
   as one row: "physics vocabulary without a defined operator or measurement."

## Execution order (superteam)

**Opus — seed #2, run the draft's own test.**
- Data: first N primes, N ∈ {1000, 4000, 10000}. Deterministic, no RNG.
- Test A (draft model): gaps g_n vs A·φ^(−c·n). Log-linear least squares on
  log g_n = log A − c·n·ln φ (drop g_n=0 cases; there are none for n≥1).
  Report fitted A, c, and R². Also fixed-c=1 variant R².
- Test B (PNT model): g_n vs b·log p_n least squares; report b and R².
- Test C (energy claim): E_p = p·φ^(−p) for the first 30 primes — show the
  numeric collapse (values at p=2,3,5,7,11,…, underflow point), and the
  correlation of E_p with actual gaps (expect ~none; report it).
- Test D (φ-Euler product): Z(s) = ∏_{p≤P} (1−φ^(−ps))^(−1) with P large
  enough for convergence (φ^(−p·σ) tiny fast; P=200 plenty at σ=1/2).
  Evaluate |Z(½+it)| for t ∈ [0,50] step 0.05; report min |Z| and argmin t;
  state the analytic reason no zeros can exist.
- JSON out: prime_phi_results.json → {tests:[{name, numbers…}], verdict:
  2–4 honest sentences}. Honesty law: report what the numbers say.

**Sonnet — extend the published page.**
- Edit prime-chiddush.html IN PLACE (keep existing content and design tokens):
  add a new section between the existing seed section and the compost-law
  close, titled "Chiddush II — the full draft surfaces".
  - The CHRONOS verdict paragraph (fabricated evidence — the loop printed its
    own confirmations) + 2 new verdict-table rows (CHRONOS outputs DENIED,
    grouped ornamentation DENIED) appended to the existing verdict table.
  - A results block reading `const RESULTS2 = /*RESULTS2_JSON*/null;`
    (byte-exact placeholder, exactly once), rendering when non-null:
    model-fit table (per N: φ-model A, c, R² vs log-model b, R², winner),
    the E_p collapse mini-table, the φ-Euler-product line (min |Z| over the
    scanned range, zero count = 0, one-line analytic reason), and the verdict
    paragraph. Null fallback: "résultats en cours de calcul — à chiffrer".
  - One sentence honoring the draft: it wrote its own falsification protocol
    (§1.2a) — the gate was in the author's hand two years ago; it only needed
    to be run.

## Law echoes
Same as Chiddush I: only the run admits; nothing not computed gets a number;
this page proves nothing about RH. authority=false · claim=NO_CLAIM.
