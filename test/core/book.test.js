// test/core/book.test.js
//
// Covers: book(ledger)'s derived (never-stored) recipe discovery and
// per-species reaction tracking -- the "learnable" condition.
//
// Seed 1's terrain and its nextFind sequence at day 0 are pinned below
// (verified deterministically): offers are glowcap, mosscap, reedling,
// mosscap, reedling, reedling; tile 6 is soil with a soil neighbour (5)
// and a pond neighbour (2). Planting glowcap@6, mosscap@5, reedling@2
// deterministically fires BOTH M1 recipes on the next day's VISIT.

import { describe, expect, test } from 'vitest';
import { book } from '../../src/core/book.js';
import { warrenBorn, visit, findOffered, findDropped } from '../../src/core/events.js';

const SEED = 1;
const GLOW_TILE = 6; // soil
const MOSS_TILE = 5; // soil, orthogonally adjacent to 6
const REED_TILE = 2; // pond, orthogonally adjacent to 6

function bothRecipesLedger() {
  return {
    v: 'GW2',
    seed: SEED,
    events: [
      warrenBorn(SEED),
      visit(0),
      findOffered(), // glowcap
      findDropped('tile', GLOW_TILE),
      findOffered(), // mosscap
      findDropped('tile', MOSS_TILE),
      findOffered(), // reedling
      findDropped('tile', REED_TILE),
      findOffered(), // mosscap (spare)
      findDropped('compost'),
      findOffered(), // reedling (spare)
      findDropped('compost'),
      findOffered(), // reedling (spare)
      findDropped('compost'),
      visit(86400000), // day rollover: both recipes fire
    ],
  };
}

describe('book: reactions', () => {
  test('records the first reaction shown for each species dropped on a tile', () => {
    const { reactions } = book(bothRecipesLedger());
    expect(reactions.glowcap).toBe('bighop'); // glow species always bighop
    expect(reactions.mosscap).toBe('hop');
    expect(reactions.reedling).toBe('hop'); // tile 2 is row 0, not row 3
  });

  test('a compost drop does not record a reaction', () => {
    const ledger = {
      v: 'GW2',
      seed: SEED,
      events: [warrenBorn(SEED), visit(0), findOffered(), findDropped('compost')],
    };
    const { reactions } = book(ledger);
    expect(Object.keys(reactions).length).toBe(0);
  });
});

describe('book: recipes', () => {
  test('both M1 recipes are discovered, each on the day they first fired', () => {
    const { recipes } = book(bothRecipesLedger());
    expect(recipes.length).toBe(2);

    const lantern = recipes.find((r) => r.result === 'lanternmoss');
    expect(lantern).toBeTruthy();
    expect(lantern.pair).toEqual(['mosscap', 'glowcap']);
    expect(typeof lantern.day).toBe('number');

    const mirror = recipes.find((r) => r.result === 'mirrorbloom');
    expect(mirror).toBeTruthy();
    expect(mirror.pair).toEqual(['reedling', 'glowcap']);
  });

  test('recipes are discovery-ordered (lanternmoss tile index 5 < mirrorbloom tile index 2 is irrelevant; order is scan order)', () => {
    const { recipes } = book(bothRecipesLedger());
    // Scan order is by tile index within the same rollover: tile 2 (reedling->mirrorbloom)
    // is discovered before tile 5 (mosscap->lanternmoss).
    expect(recipes[0].result).toBe('mirrorbloom');
    expect(recipes[1].result).toBe('lanternmoss');
  });

  test('discovering the same pair again on a later day is not recorded twice', () => {
    const ledger = bothRecipesLedger();
    ledger.events.push(visit(86400000 * 2), visit(86400000 * 3));
    const { recipes } = book(ledger);
    const keys = recipes.map((r) => r.pair.join('+') + '=' + r.result);
    expect(new Set(keys).size).toBe(keys.length);
    expect(recipes.length).toBe(2); // still just the two, not re-added
  });
});

describe('book: derived, never stored', () => {
  test('book(ledger) called twice on the same ledger gives an equal result', () => {
    const ledger = bothRecipesLedger();
    expect(book(ledger)).toEqual(book(ledger));
  });

  test('an empty ledger (just WARREN_BORN) yields an empty book', () => {
    const ledger = { v: 'GW2', seed: SEED, events: [warrenBorn(SEED)] };
    expect(book(ledger)).toEqual({ recipes: [], reactions: {} });
  });
});
