// Mayor's amendment after P1: mood is derived from state, never stored.
import { describe, expect, test } from 'vitest';
import { makeState, moodOf, epochDay } from '../../src/core/state.js';

describe('moodOf (derived mood)', () => {
  const base = makeState(7);
  test('mood is not a stored field', () => {
    expect(base).not.toHaveProperty('mood');
  });
  test('fresh warren: curious', () => {
    expect(moodOf(base)).toBe('curious');
  });
  test('big hop: happy', () => {
    expect(moodOf({ ...base, lastReaction: 'bighop' })).toBe('happy');
  });
  test('shrug: worried', () => {
    expect(moodOf({ ...base, lastReaction: 'shrug' })).toBe('worried');
  });
  test('plain hop: curious', () => {
    expect(moodOf({ ...base, lastReaction: 'hop' })).toBe('curious');
  });
  test('asleep beats any reaction: tired', () => {
    expect(moodOf({ ...base, asleep: true, lastReaction: 'bighop' })).toBe('tired');
  });
  test('every mood has a face texture, so every mood can be shown', async () => {
    const { TEXTURE_KEYS } = await import('../../src/art/registry.js');
    for (const m of ['curious', 'happy', 'worried', 'tired']) {
      expect(TEXTURE_KEYS).toContain(`lulu_face_${m}`);
    }
  });
});

describe('epochDay (the one definition of a day)', () => {
  test('same UTC day, same number; next day, +1', () => {
    const t = Date.UTC(2026, 8, 23, 1, 0, 0);
    expect(epochDay(t)).toBe(epochDay(Date.UTC(2026, 8, 23, 23, 59, 59)));
    expect(epochDay(Date.UTC(2026, 8, 24, 0, 0, 0))).toBe(epochDay(t) + 1);
  });
});
