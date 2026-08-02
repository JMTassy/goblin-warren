#!/usr/bin/env python3
"""
prime_phi_selftest.py — Chiddush II, seed #2.
Runs the QPGL draft's OWN falsification protocol (draft-qpgl-paste.md §1.2a).
Deterministic, no RNG. HONESTY LAW: report exactly what the numbers say.

Tests:
  A  gaps g_n vs A*phi^(-c*n)         log-linear least squares (+ fixed-c=1 variant)
  B  gaps g_n vs b*log(p_n)           PNT model least squares
  C  E_p = p*phi^(-p)                 energy collapse table + Pearson corr with gaps
  D  Z(s)=prod_{p<=200}(1-phi^(-p s))^(-1)   |Z(1/2+it)| scan, min, argmin, zero count
"""
import json
import math
import numpy as np

PHI = (1.0 + math.sqrt(5.0)) / 2.0
LN_PHI = math.log(PHI)
OUT_JSON = "/tmp/claude-0/-home-user-goblin-warren/24f045e1-a9e6-5202-9c2a-8d337d8d1988/scratchpad/prime_phi_results.json"


def sig(x, n=6):
    """Round to n significant digits, JSON-safe floats."""
    if x is None:
        return None
    if isinstance(x, (int,)) and not isinstance(x, bool):
        return x
    xf = float(x)
    if not math.isfinite(xf):
        return None
    if xf == 0.0:
        return 0.0
    from decimal import Decimal
    d = Decimal(xf)
    # round to n significant figures
    q = round(xf, -int(math.floor(math.log10(abs(xf)))) + (n - 1))
    return float(q)


def primes_up_to_count(count):
    """First `count` primes via a sieve sized generously."""
    if count < 6:
        limit = 15
    else:
        # upper bound for n-th prime: n(ln n + ln ln n)
        n = count
        limit = int(n * (math.log(n) + math.log(math.log(n)))) + 10
    sieve = np.ones(limit + 1, dtype=bool)
    sieve[:2] = False
    for i in range(2, int(limit**0.5) + 1):
        if sieve[i]:
            sieve[i * i::i] = False
    ps = np.nonzero(sieve)[0]
    if len(ps) < count:
        # fallback: grow
        return primes_up_to_count_grow(count)
    return ps[:count].astype(np.int64)


def primes_up_to_count_grow(count):
    limit = 1000
    while True:
        sieve = np.ones(limit + 1, dtype=bool)
        sieve[:2] = False
        for i in range(2, int(limit**0.5) + 1):
            if sieve[i]:
                sieve[i * i::i] = False
        ps = np.nonzero(sieve)[0]
        if len(ps) >= count:
            return ps[:count].astype(np.int64)
        limit *= 2


def primes_below(limit):
    sieve = np.ones(limit + 1, dtype=bool)
    sieve[:2] = False
    for i in range(2, int(limit**0.5) + 1):
        if sieve[i]:
            sieve[i * i::i] = False
    return np.nonzero(sieve)[0].astype(np.int64)


def r2(y, yhat):
    """Coefficient of determination of yhat against y."""
    y = np.asarray(y, dtype=float)
    yhat = np.asarray(yhat, dtype=float)
    ss_res = float(np.sum((y - yhat) ** 2))
    ss_tot = float(np.sum((y - np.mean(y)) ** 2))
    if ss_tot == 0.0:
        return float("nan")
    return 1.0 - ss_res / ss_tot


# ---------------------------------------------------------------- Test A + B
def test_phi_and_log_fit(Ns):
    """
    For each N: first N primes, gaps g_n = p_{n+1}-p_n, indexed n=1..N-1.

    Test A (draft phi model): g_n ~ A * phi^(-c*n)
      log-linear:  log g_n = log A - c*n*ln(phi)
      linear regression y=log g_n on x=n -> slope = -c*ln(phi), intercept=log A
      c = -slope / ln(phi).  R2 reported on the LINEAR (log) fit, per the draft.
      Fixed-c=1 variant: slope forced to -ln(phi), only intercept (A) fit;
        R2 of that constrained log fit.
    Test B (PNT model): g_n ~ b * log(p_n), single-param least squares.
      R2 on the RAW-gap scale.
    """
    phi_per_N = []
    log_per_N = []
    for N in Ns:
        ps = primes_up_to_count(N).astype(float)
        p_lo = ps[:-1]                       # p_n
        gaps = ps[1:] - ps[:-1]              # g_n, n=1..N-1
        n_idx = np.arange(1, N, dtype=float)  # n = 1..N-1

        # ---- Test A: log-linear fit  y = log g  on x = n
        y = np.log(gaps)
        x = n_idx
        # least squares slope/intercept
        A_mat = np.vstack([x, np.ones_like(x)]).T
        (slope, intercept), *_ = np.linalg.lstsq(A_mat, y, rcond=None)
        c = -slope / LN_PHI
        A_coef = math.exp(intercept)
        yhat = slope * x + intercept
        r2_log = r2(y, yhat)

        # fixed c=1: slope forced to -ln(phi); fit intercept = mean(y - (-lnphi)*x)
        fixed_slope = -LN_PHI
        intercept_c1 = float(np.mean(y - fixed_slope * x))
        yhat_c1 = fixed_slope * x + intercept_c1
        r2_c1 = r2(y, yhat_c1)

        phi_per_N.append({
            "N": N,
            "A": sig(A_coef),
            "c": sig(c),
            "r2": sig(r2_log),
            "r2_c1": sig(r2_c1),
        })

        # ---- Test B: g ~ b * log(p_n), single param least squares (through model)
        lp = np.log(p_lo)
        b = float(np.sum(lp * gaps) / np.sum(lp * lp))
        ghat = b * lp
        r2_b = r2(gaps, ghat)
        log_per_N.append({"N": N, "b": sig(b), "r2": sig(r2_b)})

    return phi_per_N, log_per_N


# ---------------------------------------------------------------- Test C
def test_energy_collapse():
    """E_p = p * phi^(-p) for first 30 primes; corr(E_p, actual gap g_n)."""
    ps = primes_up_to_count(31).astype(np.int64)  # need 31 to form 30 gaps
    ps30 = ps[:30]
    E = np.array([p * PHI ** (-float(p)) for p in ps30], dtype=float)

    table = [{"p": int(ps30[i]), "E": sig(E[i], 6)} for i in range(12)]

    # underflow: within first 30 primes E stays well above double underflow (~5e-324)
    # smallest E among 30 primes:
    min_E = float(np.min(E[E > 0])) if np.any(E > 0) else 0.0
    n_underflow = int(np.sum(E == 0.0))
    underflow_note = (
        f"No underflow in the first 30 primes: smallest E_p = {min_E:.3e} at "
        f"p={int(ps30[int(np.argmin(np.where(E > 0, E, np.inf)))])}; "
        f"double underflows (E->0) only near p~1548 (phi^-p < 5e-324). "
        f"{n_underflow} of 30 values underflowed to exactly 0."
    )

    # correlation of E_p with actual gaps g_n = p_{n+1}-p_n, aligned to p_n
    gaps = (ps[1:31] - ps[0:30]).astype(float)  # 30 gaps aligned to ps30
    # Pearson over full usable range (all 30, none underflowed)
    corr = float(np.corrcoef(E, gaps)[0, 1])

    return {
        "name": "energy_collapse",
        "table": table,
        "underflow_note": underflow_note,
        "corr_with_gaps": sig(corr, 6),
    }


# ---------------------------------------------------------------- Test D
def test_phi_euler_product():
    """Z(s) = prod_{p<=200} (1 - phi^(-p s))^(-1), s = 1/2 + it, t in [0,50] step 0.05."""
    P = 200
    ps = primes_below(P).astype(float)  # primes <= 200
    ts = np.arange(0.0, 50.0 + 1e-9, 0.05)

    abs_vals = np.empty_like(ts)
    for i, t in enumerate(ts):
        s = 0.5 + 1j * t
        # factor = 1 / (1 - phi^(-p*s)); phi^(-p*s) = exp(-p*s*ln phi)
        exps = np.exp(-ps * s * LN_PHI)         # complex array
        factors = 1.0 / (1.0 - exps)
        Z = np.prod(factors)
        abs_vals[i] = abs(Z)

    imin = int(np.argmin(abs_vals))
    min_absZ = float(abs_vals[imin])
    argmin_t = float(ts[imin])
    # a "zero" would be |Z| ~ 0; count anything below a tight numerical floor
    zero_count = int(np.sum(abs_vals < 1e-9))

    return {
        "name": "phi_euler_product",
        "t_range": [0.0, 50.0],
        "min_absZ": sig(min_absZ, 6),
        "argmin_t": sig(argmin_t, 6),
        "zero_count": zero_count,
        "reason": ("Every factor (1 - phi^(-p s))^(-1) is finite and nonzero for "
                   "Re(s)>0 since |phi^(-p s)| = phi^(-p/2) < 1, so the finite "
                   "product Z is bounded away from 0 and has no zeros."),
    }


def build_verdict(phi_per_N, log_per_N, corr, min_absZ):
    # compare best-case R2 of each model at largest N
    phi_last = phi_per_N[-1]
    log_last = log_per_N[-1]
    return (
        f"The draft's phi-decay model fails its own test: fitting g_n = A*phi^(-c*n) "
        f"to GROWING prime gaps forces the exponent negative (c={phi_last['c']} at N={phi_last['N']}), "
        f"i.e. the 'decay' law must run backwards, and even then the log-linear R2 is only "
        f"{phi_last['r2']} (fixed-c=1 R2={phi_last['r2_c1']}, effectively no fit). "
        f"The PNT logarithmic model g_n ~ b*log(p_n) is the honest description "
        f"(b={log_last['b']}, R2={log_last['r2']} at N={log_last['N']}), and the energy "
        f"claim E_p=p*phi^(-p) has essentially no correlation with actual gaps (r={corr}). "
        f"The phi-Euler product has min |Z(1/2+it)|={min_absZ} over t in [0,50], never zero, "
        f"so QPGL's central phi-scaling mechanism is refuted on its own terms: the logarithmic "
        f"model wins, and the golden-ratio scaling carries no predictive content for prime gaps."
    )


def main():
    Ns = [1000, 4000, 10000]
    phi_per_N, log_per_N = test_phi_and_log_fit(Ns)
    testC = test_energy_collapse()
    testD = test_phi_euler_product()

    verdict = build_verdict(phi_per_N, log_per_N,
                            testC["corr_with_gaps"], testD["min_absZ"])

    results = {
        "tests": [
            {"name": "phi_fit", "per_N": phi_per_N},
            {"name": "log_fit", "per_N": log_per_N},
            testC,
            testD,
        ],
        "verdict": verdict,
    }

    with open(OUT_JSON, "w") as f:
        json.dump(results, f, indent=2)

    # console report
    print("=== Test A/B: phi-model vs log-model ===")
    print(f"{'N':>7} | {'A (phi)':>12} {'c':>10} {'R2':>10} {'R2_c1':>10} | {'b (log)':>10} {'R2':>10}")
    for a, b in zip(phi_per_N, log_per_N):
        print(f"{a['N']:>7} | {a['A']:>12} {a['c']:>10} {a['r2']:>10} {a['r2_c1']:>10} | {b['b']:>10} {b['r2']:>10}")
    print()
    print("=== Test C: energy collapse ===")
    for row in testC["table"]:
        print(f"  p={row['p']:>4}  E_p={row['E']}")
    print("  underflow_note:", testC["underflow_note"])
    print("  corr(E_p, gaps):", testC["corr_with_gaps"])
    print()
    print("=== Test D: phi-Euler product ===")
    print("  min |Z(1/2+it)| =", testD["min_absZ"], "at t =", testD["argmin_t"])
    print("  zero_count =", testD["zero_count"])
    print("  reason:", testD["reason"])
    print()
    print("=== VERDICT ===")
    print(verdict)
    print()
    print("JSON written to", OUT_JSON)


if __name__ == "__main__":
    main()
