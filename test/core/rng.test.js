// test/core/rng.test.js

import { describe, expect, test } from 'vitest';
import { mulberry32, rng, rngInt, rngPick } from '../../src/core/rng.js';

describe('mulberry32', () => {
  test('same seed produces the same sequence', () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  test('different seeds produce different sequences', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  test('every draw is within [0, 1)', () => {
    const gen = mulberry32(42);
    for (let i = 0; i < 5000; i++) {
      const v = gen();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test('draws are not degenerate (not all identical, decent spread)', () => {
    const gen = mulberry32(7);
    const draws = Array.from({ length: 1000 }, () => gen());
    const unique = new Set(draws);
    expect(unique.size).toBeGreaterThan(950);
    const mean = draws.reduce((a, b) => a + b, 0) / draws.length;
    expect(mean).toBeGreaterThan(0.4);
    expect(mean).toBeLessThan(0.6);
  });

  test('seed is coerced with >>> 0 (negative/float seeds do not throw)', () => {
    expect(() => mulberry32(-5)()).not.toThrow();
    expect(() => mulberry32(3.7)()).not.toThrow();
  });
});

describe('rng(seed, index)', () => {
  test('is deterministic: same (seed, index) -> same value', () => {
    expect(rng(20260923, 0)).toBe(rng(20260923, 0));
    expect(rng(20260923, 7)).toBe(rng(20260923, 7));
  });

  test('different index gives a different draw (no accidental collisions in a small run)', () => {
    const draws = new Set();
    for (let i = 0; i < 200; i++) draws.add(rng(1, i));
    expect(draws.size).toBe(200);
  });

  test('different seed gives a different draw for the same index', () => {
    expect(rng(1, 0)).not.toBe(rng(2, 0));
  });

  test('is always within [0, 1)', () => {
    for (let i = 0; i < 500; i++) {
      const v = rng(999, i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test('matches replaying the ledger: same seed+index sequence twice is identical', () => {
    const seed = 555;
    const first = Array.from({ length: 50 }, (_, i) => rng(seed, i));
    const second = Array.from({ length: 50 }, (_, i) => rng(seed, i));
    expect(first).toEqual(second);
  });
});

describe('rngInt', () => {
  test('is within [0, n)', () => {
    for (let i = 0; i < 500; i++) {
      const v = rngInt(1, i, 6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
    }
  });

  test('is deterministic', () => {
    expect(rngInt(1, 2, 16)).toBe(rngInt(1, 2, 16));
  });
});

describe('rngPick', () => {
  test('always picks an element from the array', () => {
    const items = ['mosscap', 'glowcap', 'reedling'];
    for (let i = 0; i < 100; i++) {
      expect(items).toContain(rngPick(1, i, items));
    }
  });

  test('is deterministic', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(rngPick(9, 3, items)).toBe(rngPick(9, 3, items));
  });
});
