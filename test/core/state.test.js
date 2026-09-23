// test/core/state.test.js
//
// Covers: makeState's seeded terrain layout, apply()'s non-mutation
// contract, VISIT-driven day rollover, WAKE, FIND_OFFERED/energy, PET,
// TOGGLE_SOUND, and fail-closed no-ops for illegal/unrecognised events.

import { describe, expect, test } from 'vitest';
import { makeState, apply } from '../../src/core/state.js';
import { EVENT, warrenBorn, visit, wake, findOffered, findDropped, pet, toggleSound } from '../../src/core/events.js';

function countTerrain(terrain) {
  const counts = { soil: 0, rock: 0, pond: 0 };
  for (const t of terrain) counts[t] += 1;
  return counts;
}

describe('makeState: seeded terrain', () => {
  test('4x4 board with 10 soil, 3 rock, 3 pond', () => {
    const state = makeState(42);
    expect(state.ground.w).toBe(4);
    expect(state.ground.h).toBe(4);
    expect(state.ground.terrain.length).toBe(16);
    expect(state.ground.tiles.length).toBe(16);
    expect(countTerrain(state.ground.terrain)).toEqual({ soil: 10, rock: 3, pond: 3 });
  });

  test('empty ground: every tile starts unplanted', () => {
    const state = makeState(42);
    expect(state.ground.tiles.every((t) => t === null)).toBe(true);
  });

  test('same seed -> same terrain layout (deterministic)', () => {
    const a = makeState(20260923);
    const b = makeState(20260923);
    expect(a.ground.terrain).toEqual(b.ground.terrain);
  });

  test('different seed -> different terrain layout', () => {
    const a = makeState(1);
    const b = makeState(2);
    expect(a.ground.terrain).not.toEqual(b.ground.terrain);
  });

  test('randomness comes only from rng(seed, i), not Math.random: layout is a permutation regardless of seed', () => {
    for (const seed of [0, 1, 7, 999, 20260923]) {
      expect(countTerrain(makeState(seed).ground.terrain)).toEqual({ soil: 10, rock: 3, pond: 3 });
    }
  });
});

describe('apply(): never mutates its input', () => {
  test('FIND_DROPPED does not mutate the state or ground objects passed in', () => {
    const before = makeState(1);
    const snapshot = JSON.parse(JSON.stringify(before));
    let state = apply(before, findOffered());
    state = apply(state, findDropped('compost'));
    expect(before).toEqual(snapshot);
  });

  test('a legal tile drop returns a new ground/tiles array, not the same reference', () => {
    let state = makeState(1);
    const soilIndex = state.ground.terrain.indexOf('soil');
    state = apply(state, findOffered());
    const groundBefore = state.ground;
    const tilesBefore = state.ground.tiles;
    const next = apply(state, findDropped('tile', soilIndex));
    expect(next.ground).not.toBe(groundBefore);
    expect(next.ground.tiles).not.toBe(tilesBefore);
  });

  test('every event kind returns a new top-level object', () => {
    const state = makeState(1);
    for (const event of [warrenBorn(1), visit(1000), wake(), pet(), toggleSound()]) {
      expect(apply(state, event)).not.toBe(state);
    }
  });
});

describe('apply(): VISIT and day rollover', () => {
  test('a VISIT on the same calendar day as the last does not roll the day over', () => {
    let state = makeState(1);
    state = apply(state, visit(1000));
    const day1 = state.day;
    state = apply(state, visit(2000)); // still well within the same 86_400_000ms day
    expect(state.day).toBe(day1);
  });

  test('a VISIT on a later calendar day rolls the day over exactly once', () => {
    let state = makeState(1);
    state = apply(state, visit(0));
    const firstDay = state.day;
    state = apply(state, visit(86400000));
    expect(state.day).toBeGreaterThan(firstDay);
  });

  test('day rollover resets energy to 6 and clears asleep', () => {
    let state = makeState(1);
    state = apply(state, visit(0));
    // drain energy to 0 (asleep), dropping each find so the next offer isn't a no-op
    for (let i = 0; i < 6; i++) {
      state = apply(state, findOffered());
      state = apply(state, findDropped('compost'));
    }
    expect(state.energy).toBe(0);
    expect(state.asleep).toBe(true);
    state = apply(state, visit(86400000));
    expect(state.energy).toBe(6);
    expect(state.asleep).toBe(false);
  });

  test('malformed VISIT (non-numeric t) is a no-op', () => {
    const state = makeState(1);
    const next = apply(state, { kind: EVENT.VISIT, t: 'soon' });
    expect(next.day).toBe(state.day);
  });
});

describe('apply(): WAKE', () => {
  test('WAKE ends sleep and resets energy', () => {
    let state = makeState(1);
    state = apply(state, visit(0));
    for (let i = 0; i < 6; i++) {
      state = apply(state, findOffered());
      state = apply(state, findDropped('compost'));
    }
    expect(state.asleep).toBe(true);
    expect(state.energy).toBe(0);
    state = apply(state, wake());
    expect(state.asleep).toBe(false);
    expect(state.energy).toBe(6);
  });
});

describe('apply(): FIND_OFFERED / energy', () => {
  test('six finds can be offered per day, each decrementing energy by 1', () => {
    let state = makeState(1);
    state = apply(state, visit(0));
    for (let i = 0; i < 6; i++) {
      expect(state.offered).toBe(null);
      const before = state.energy;
      state = apply(state, findOffered());
      expect(state.offered).not.toBe(null);
      expect(state.energy).toBe(before - 1);
      state = apply(state, findDropped('compost')); // free the hand for the next offer
    }
    expect(state.energy).toBe(0);
    expect(state.asleep).toBe(true);
  });

  test('FIND_OFFERED at 0 energy is a no-op', () => {
    let state = makeState(1);
    state = apply(state, visit(0));
    for (let i = 0; i < 6; i++) {
      state = apply(state, findOffered());
      state = apply(state, findDropped('compost'));
    }
    expect(state.energy).toBe(0);
    const next = apply(state, findOffered());
    expect(next.offered).toBe(null);
    expect(next.energy).toBe(0);
  });

  test('FIND_OFFERED while already holding a find is a no-op', () => {
    let state = makeState(1);
    state = apply(state, visit(0));
    state = apply(state, findOffered());
    const held = state.offered;
    const next = apply(state, findOffered());
    expect(next.offered).toEqual(held);
  });
});

describe('apply(): FIND_DROPPED', () => {
  test('an illegal drop (rock) is a no-op: offered find is unchanged, no tile planted', () => {
    let state = makeState(1);
    const rockIndex = state.ground.terrain.indexOf('rock');
    state = apply(state, visit(0));
    state = apply(state, findOffered());
    const held = state.offered;
    const next = apply(state, findDropped('tile', rockIndex));
    expect(next.offered).toEqual(held);
    expect(next.ground.tiles[rockIndex]).toBe(null);
  });

  test('an illegal drop (already occupied) is a no-op', () => {
    let state = makeState(1);
    const soilIndex = state.ground.terrain.indexOf('soil');
    state = apply(state, visit(0));
    state = apply(state, findOffered());
    state = apply(state, findDropped('tile', soilIndex));
    expect(state.ground.tiles[soilIndex]).not.toBe(null);
    state = apply(state, findOffered());
    const held = state.offered;
    const next = apply(state, findDropped('tile', soilIndex));
    expect(next.offered).toEqual(held);
  });

  test('dropping on compost increments compost and consumes the find', () => {
    let state = makeState(1);
    state = apply(state, visit(0));
    state = apply(state, findOffered());
    const next = apply(state, findDropped('compost'));
    expect(next.compost).toBe(1);
    expect(next.offered).toBe(null);
  });

  test('compost is capped at 5', () => {
    let state = makeState(1);
    state = { ...state, compost: 5 };
    state = apply(state, visit(0));
    state = apply(state, findOffered());
    state = apply(state, findDropped('compost'));
    expect(state.compost).toBe(5);
  });

  test('FIND_DROPPED with nothing offered is a no-op', () => {
    const state = makeState(1);
    const next = apply(state, findDropped('compost'));
    expect(next).toEqual({ ...state });
  });
});

describe('apply(): PET, TOGGLE_SOUND, unrecognised events', () => {
  test('PET never changes gameplay state beyond lastReaction', () => {
    let state = makeState(1);
    state = apply(state, visit(0));
    const before = { ...state, lastReaction: undefined };
    const next = apply(state, pet());
    expect({ ...next, lastReaction: undefined }).toEqual(before);
    expect(next.lastReaction).not.toBe(undefined);
  });

  test('TOGGLE_SOUND flips state.sound', () => {
    const state = makeState(1);
    expect(state.sound).toBe(true);
    const next = apply(state, toggleSound());
    expect(next.sound).toBe(false);
    expect(apply(next, toggleSound()).sound).toBe(true);
  });

  test('an unrecognised event kind is a fail-closed no-op, never throws', () => {
    const state = makeState(1);
    expect(() => apply(state, { kind: 'NOT_A_REAL_EVENT' })).not.toThrow();
    const next = apply(state, { kind: 'NOT_A_REAL_EVENT' });
    expect(next).toEqual({ ...state });
  });

  test('a malformed event (no kind) is a fail-closed no-op', () => {
    const state = makeState(1);
    expect(() => apply(state, {})).not.toThrow();
    expect(() => apply(state, null)).not.toThrow();
  });

  test('WARREN_BORN encountered mid-ledger is a no-op (not just events[0])', () => {
    const state = makeState(1);
    const next = apply(state, warrenBorn(1));
    expect(next).toEqual({ ...state });
  });
});
