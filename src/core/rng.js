// src/core/rng.js
//
// Deterministic randomness for the core. PURE: no wall-clock reads, no
// chance calls, no DOM globals, no engine import. (Enforced by
// test/core/purity.test.js.)
//
// Vision (§8): "randomness only from rng(seed, events.length)". Two
// entry points are exported:
//
//   mulberry32(seed) -> () => number   a stateful generator, for when a
//     caller wants a *sequence* of draws from one seed (tests use this
//     directly to check the algorithm).
//
//   rng(seed, index) -> number         a stateless, single draw, deterministic
//     in both `seed` and `index`. This is what core code should call: pass
//     `events.length` (or another monotonic counter already in the ledger)
//     as `index` and get the same float back on every replay, with no
//     generator state to thread through `apply()`.

/**
 * mulberry32 -- a small, fast, well-distributed 32-bit PRNG.
 * Same seed -> same infinite sequence, always. Reference: public-domain
 * implementation by Tommy Ettinger.
 *
 * @param {number} seed - any 32-bit integer (values are coerced with >>> 0).
 * @returns {() => number} a generator; each call returns a float in [0, 1).
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Combine a Warren seed and an event-log index into one 32-bit hash.
 * Standard xmur3-style avalanche mix, so that neighbouring indices (or
 * neighbouring seeds) don't produce correlated hashes.
 *
 * @param {number} seed
 * @param {number} index
 * @returns {number} a 32-bit unsigned integer
 */
function mixSeedIndex(seed, index) {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (index >>> 0), 2654435761) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 2246822519) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489917) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * One deterministic draw in [0, 1), keyed by (seed, index).
 * Stateless: calling `rng(seed, i)` twice always returns the same value,
 * which is what makes `apply()` replay-safe without carrying a generator
 * across events.
 *
 * @param {number} seed
 * @param {number} index - typically `events.length` at the moment of the draw.
 * @returns {number}
 */
export function rng(seed, index) {
  return mulberry32(mixSeedIndex(seed, index))();
}

/**
 * Deterministic integer in [0, n). Convenience wrapper around rng().
 * @param {number} seed
 * @param {number} index
 * @param {number} n
 * @returns {number}
 */
export function rngInt(seed, index, n) {
  return Math.floor(rng(seed, index) * n);
}

/**
 * Deterministic pick from a non-empty array.
 * @template T
 * @param {number} seed
 * @param {number} index
 * @param {T[]} items
 * @returns {T}
 */
export function rngPick(seed, index, items) {
  return items[rngInt(seed, index, items.length)];
}
