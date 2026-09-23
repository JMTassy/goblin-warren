// test/core/fuzz.test.js
//
// A seeded 5,000-event fuzz: apply() must never throw and every field must
// stay in its documented range, no matter what garbage (including
// out-of-range tiles and malformed events) the ledger contains. The
// generator itself is seeded with rng.js's mulberry32 for a reproducible
// run -- this is a test file, not src/core, so it is exempt from the
// purity check, but determinism is still worth keeping.

import { describe, expect, test } from 'vitest';
import { mulberry32 } from '../../src/core/rng.js';
import { makeState, apply, moodOf } from '../../src/core/state.js';
import { EVENT } from '../../src/core/events.js';

const EVENT_COUNT = 5000;
const SPECIES = ['mosscap', 'glowcap', 'reedling', 'lanternmoss', 'mirrorbloom'];
const TERRAIN = ['soil', 'rock', 'pond'];
const MOODS = ['curious', 'happy', 'worried', 'tired'];
const REACTIONS = [null, 'hop', 'bighop', 'shrug'];

function assertInRange(state) {
  expect(state.energy).toBeGreaterThanOrEqual(0);
  expect(state.energy).toBeLessThanOrEqual(6);
  expect(state.compost).toBeGreaterThanOrEqual(0);
  expect(state.compost).toBeLessThanOrEqual(5);
  expect(typeof state.asleep).toBe('boolean');
  expect(typeof state.sound).toBe('boolean');
  expect(typeof state.day).toBe('number');
  expect(MOODS).toContain(moodOf(state));
  expect(state).not.toHaveProperty('mood');
  expect(REACTIONS).toContain(state.lastReaction);
  expect(state.ground.terrain.length).toBe(16);
  expect(state.ground.tiles.length).toBe(16);
  for (const t of state.ground.terrain) expect(TERRAIN).toContain(t);
  for (const plant of state.ground.tiles) {
    if (plant === null) continue;
    expect(SPECIES).toContain(plant.species);
    expect(plant.stage).toBeGreaterThanOrEqual(0);
    expect(plant.stage).toBeLessThanOrEqual(3);
    expect(typeof plant.wilted).toBe('boolean');
    expect(typeof plant.sleeping).toBe('boolean');
    expect(typeof plant.plantedDay).toBe('number');
  }
  if (state.offered !== null) {
    expect(['mosscap', 'glowcap', 'reedling']).toContain(state.offered.species);
    expect(typeof state.offered.id).toBe('string');
  }
}

describe('fuzz: 5000 seeded events never throw and never leave state out of range', () => {
  test('runs clean end to end', () => {
    const gen = mulberry32(0xf00d);
    const pick = (arr) => arr[Math.floor(gen() * arr.length)];
    const kinds = [
      EVENT.VISIT,
      EVENT.WAKE,
      EVENT.FIND_OFFERED,
      EVENT.FIND_DROPPED,
      EVENT.FIND_DROPPED,
      EVENT.FIND_DROPPED,
      EVENT.PET,
      EVENT.TOGGLE_SOUND,
      'GARBAGE_KIND', // an unrecognised kind, to exercise the fail-closed default
    ];

    let state = makeState(20260923);
    let t = 1_700_000_000_000;

    for (let i = 0; i < EVENT_COUNT; i++) {
      const kind = pick(kinds);
      let event;
      if (kind === EVENT.VISIT) {
        t += Math.floor(gen() * 2 * 86400000); // 0..~2 days forward
        event = { kind, t };
      } else if (kind === EVENT.FIND_DROPPED) {
        const target = gen() < 0.5 ? 'tile' : 'compost';
        event =
          target === 'tile'
            ? { kind, target, tile: Math.floor(gen() * 24) - 4 } // sometimes deliberately out of 0..15
            : { kind, target };
      } else if (kind === 'GARBAGE_KIND') {
        event = { kind, whatever: gen() };
      } else {
        event = { kind };
      }

      expect(() => {
        state = apply(state, event);
      }).not.toThrow();
      assertInRange(state);
    }
  });
});
