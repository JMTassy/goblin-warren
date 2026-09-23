// test/core/finds.test.js
//
// Covers: nextFind's determinism/energy gating, legal()'s rock/occupied/
// range checks, and outcome()'s species x terrain wilt/sleep table plus
// Lulu's reactions.

import { describe, expect, test } from 'vitest';
import { makeState } from '../../src/core/state.js';
import { nextFind, legal, outcome } from '../../src/core/finds.js';

function stateWithTerrain(terrainOverrides, extra = {}) {
  const base = makeState(1);
  const terrain = base.ground.terrain.slice();
  for (const [i, t] of Object.entries(terrainOverrides)) terrain[Number(i)] = t;
  return { ...base, ground: { ...base.ground, terrain }, ...extra };
}

describe('nextFind', () => {
  test('returns null at 0 energy', () => {
    const state = { ...makeState(1), energy: 0 };
    expect(nextFind(state)).toBe(null);
  });

  test('returns null while asleep', () => {
    const state = { ...makeState(1), asleep: true, energy: 6 };
    expect(nextFind(state)).toBe(null);
  });

  test('returns one of the three M1 species with energy > 0', () => {
    const state = makeState(1);
    const find = nextFind(state);
    expect(find).not.toBe(null);
    expect(['mosscap', 'glowcap', 'reedling']).toContain(find.species);
  });

  test('is deterministic: same state -> same find', () => {
    const state = makeState(1);
    expect(nextFind(state)).toEqual(nextFind(state));
  });

  test('is a pure function of state (no Find is a bug/golden species)', () => {
    for (let day = 0; day < 5; day++) {
      for (let energy = 1; energy <= 6; energy++) {
        const find = nextFind({ ...makeState(1), day, energy });
        expect(['mosscap', 'glowcap', 'reedling']).toContain(find.species);
      }
    }
  });
});

describe('legal', () => {
  test('rock is illegal', () => {
    const state = stateWithTerrain({ 0: 'rock' });
    expect(legal(state, 0)).toBe(false);
  });

  test('soil is legal when empty', () => {
    const state = stateWithTerrain({ 0: 'soil' });
    expect(legal(state, 0)).toBe(true);
  });

  test('pond is legal when empty (legality is not species-dependent)', () => {
    const state = stateWithTerrain({ 0: 'pond' });
    expect(legal(state, 0)).toBe(true);
  });

  test('an occupied tile is illegal', () => {
    const base = stateWithTerrain({ 0: 'soil' });
    const state = {
      ...base,
      ground: {
        ...base.ground,
        tiles: base.ground.tiles.map((t, i) => (i === 0 ? { species: 'mosscap', plantedDay: 0, sleeping: false, stage: 0, wilted: false } : t)),
      },
    };
    expect(legal(state, 0)).toBe(false);
  });

  test('out-of-range tile indices are illegal', () => {
    const state = makeState(1);
    expect(legal(state, -1)).toBe(false);
    expect(legal(state, 16)).toBe(false);
    expect(legal(state, 1.5)).toBe(false);
  });
});

describe('outcome: terrain rules', () => {
  test('mosscap sprouts on soil', () => {
    const state = stateWithTerrain({ 5: 'soil' });
    const { plant } = outcome(state, { id: 'f1', species: 'mosscap' }, 5);
    expect(plant.species).toBe('mosscap');
    expect(plant.wilted).toBe(false);
    expect(plant.sleeping).toBe(false);
    expect(plant.stage).toBe(0);
  });

  test('mosscap wilts on pond', () => {
    const state = stateWithTerrain({ 5: 'pond' });
    const { plant } = outcome(state, { id: 'f1', species: 'mosscap' }, 5);
    expect(plant.wilted).toBe(true);
  });

  test('glowcap sleeps a night on soil', () => {
    const state = stateWithTerrain({ 5: 'soil' });
    const { plant } = outcome(state, { id: 'f1', species: 'glowcap' }, 5);
    expect(plant.wilted).toBe(false);
    expect(plant.sleeping).toBe(true);
  });

  test('glowcap wilts on pond', () => {
    const state = stateWithTerrain({ 5: 'pond' });
    const { plant } = outcome(state, { id: 'f1', species: 'glowcap' }, 5);
    expect(plant.wilted).toBe(true);
  });

  test('reedling thrives on pond', () => {
    const state = stateWithTerrain({ 5: 'pond' });
    const { plant } = outcome(state, { id: 'f1', species: 'reedling' }, 5);
    expect(plant.wilted).toBe(false);
    expect(plant.sleeping).toBe(false);
  });

  test('reedling wilts on soil', () => {
    const state = stateWithTerrain({ 5: 'soil' });
    const { plant } = outcome(state, { id: 'f1', species: 'reedling' }, 5);
    expect(plant.wilted).toBe(true);
  });
});

describe('outcome: reactions', () => {
  test('glowcap always gets bighop (Lulu likes glow)', () => {
    const state = stateWithTerrain({ 0: 'soil', 1: 'pond' });
    expect(outcome(state, { id: 'a', species: 'glowcap' }, 0).reaction).toBe('bighop');
    expect(outcome(state, { id: 'b', species: 'glowcap' }, 1).reaction).toBe('bighop');
  });

  test('reedling in row 3 (nearest Lulu\'s mound) gets shrug', () => {
    const state = stateWithTerrain({ 12: 'pond' });
    expect(outcome(state, { id: 'a', species: 'reedling' }, 12).reaction).toBe('shrug');
  });

  test('reedling outside row 3 gets hop', () => {
    const state = stateWithTerrain({ 0: 'pond' });
    expect(outcome(state, { id: 'a', species: 'reedling' }, 0).reaction).toBe('hop');
  });

  test('mosscap always gets hop', () => {
    const state = stateWithTerrain({ 0: 'soil', 13: 'soil' });
    expect(outcome(state, { id: 'a', species: 'mosscap' }, 0).reaction).toBe('hop');
    expect(outcome(state, { id: 'b', species: 'mosscap' }, 13).reaction).toBe('hop');
  });
});
