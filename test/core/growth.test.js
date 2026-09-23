// test/core/growth.test.js
//
// Covers: newDay's stage cap, sleeper wake, wilt-to-compost sweep, and the
// two M1 adjacency recipes.

import { describe, expect, test } from 'vitest';
import { makeState } from '../../src/core/state.js';
import { newDay } from '../../src/core/growth.js';

function plant(species, overrides = {}) {
  return { species, plantedDay: 0, sleeping: false, stage: 0, wilted: false, ...overrides };
}

function stateWithTiles(tileOverrides, extra = {}) {
  const base = makeState(1);
  const tiles = base.ground.tiles.slice();
  for (const [i, p] of Object.entries(tileOverrides)) tiles[Number(i)] = p;
  return { ...base, ground: { ...base.ground, tiles }, ...extra };
}

describe('newDay: does not mutate input', () => {
  test('returns a new state, leaves the original untouched', () => {
    const state = stateWithTiles({ 0: plant('mosscap') });
    const snapshot = JSON.parse(JSON.stringify(state));
    newDay(state);
    expect(state).toEqual(snapshot);
  });
});

describe('newDay: stage growth', () => {
  test('stage increments by 1', () => {
    const state = stateWithTiles({ 0: plant('mosscap', { stage: 1 }) });
    const next = newDay(state);
    expect(next.ground.tiles[0].stage).toBe(2);
  });

  test('stage caps at 3', () => {
    const state = stateWithTiles({ 0: plant('mosscap', { stage: 3 }) });
    const next = newDay(state);
    expect(next.ground.tiles[0].stage).toBe(3);
  });

  test('day advances by 1', () => {
    const state = { ...makeState(1), day: 5 };
    expect(newDay(state).day).toBe(6);
  });

  test('energy resets to 6 and asleep clears', () => {
    const state = { ...makeState(1), energy: 0, asleep: true };
    const next = newDay(state);
    expect(next.energy).toBe(6);
    expect(next.asleep).toBe(false);
  });
});

describe('newDay: sleepers wake', () => {
  test('a sleeping glowcap wakes (sleeping -> false) after one day', () => {
    const state = stateWithTiles({ 0: plant('glowcap', { sleeping: true }) });
    const next = newDay(state);
    expect(next.ground.tiles[0].sleeping).toBe(false);
  });
});

describe('newDay: wilted plants fall into compost', () => {
  test('a wilted tile clears and compost increments by 1', () => {
    const state = stateWithTiles({ 0: plant('reedling', { wilted: true }) }, { compost: 2 });
    const next = newDay(state);
    expect(next.ground.tiles[0]).toBe(null);
    expect(next.compost).toBe(3);
  });

  test('multiple wilted tiles each add to compost, capped at 5', () => {
    const state = stateWithTiles(
      { 0: plant('mosscap', { wilted: true }), 1: plant('reedling', { wilted: true }), 2: plant('glowcap', { wilted: true }) },
      { compost: 4 },
    );
    const next = newDay(state);
    expect(next.compost).toBe(5);
    expect(next.ground.tiles[0]).toBe(null);
    expect(next.ground.tiles[1]).toBe(null);
    expect(next.ground.tiles[2]).toBe(null);
  });
});

describe('newDay: recipes fire on orthogonal adjacency', () => {
  test('glowcap + mosscap -> the mosscap tile becomes lanternmoss', () => {
    // index 5 and 6 are orthogonally adjacent (same row)
    const state = stateWithTiles({ 5: plant('glowcap'), 6: plant('mosscap') });
    const next = newDay(state);
    expect(next.ground.tiles[6].species).toBe('lanternmoss');
    expect(next.ground.tiles[6].stage).toBe(0);
    expect(next.ground.tiles[5].species).toBe('glowcap'); // glow tile itself is unchanged
  });

  test('reedling + glowcap -> the reedling tile becomes mirrorbloom', () => {
    const state = stateWithTiles({ 5: plant('glowcap'), 1: plant('reedling') }); // 1 and 5 are vertically adjacent
    const next = newDay(state);
    expect(next.ground.tiles[1].species).toBe('mirrorbloom');
    expect(next.ground.tiles[5].species).toBe('glowcap');
  });

  test('diagonal adjacency does not trigger a recipe', () => {
    const state = stateWithTiles({ 5: plant('glowcap'), 0: plant('mosscap') }); // 0 and 5 are diagonal, not orthogonal
    const next = newDay(state);
    expect(next.ground.tiles[0].species).toBe('mosscap');
  });

  test('a glowcap with two different non-glow neighbours transforms both', () => {
    const state = stateWithTiles({ 5: plant('glowcap'), 4: plant('mosscap'), 6: plant('reedling') });
    const next = newDay(state);
    expect(next.ground.tiles[4].species).toBe('lanternmoss');
    expect(next.ground.tiles[6].species).toBe('mirrorbloom');
  });

  test('no glow neighbour: no transform', () => {
    const state = stateWithTiles({ 4: plant('mosscap'), 6: plant('reedling') }); // not adjacent to each other or any glow
    const next = newDay(state);
    expect(next.ground.tiles[4].species).toBe('mosscap');
    expect(next.ground.tiles[6].species).toBe('reedling');
  });
});
