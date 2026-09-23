// test/core/determinism.test.js
//
// Covers the determinism contract (docs/INTERFACES.md, ledger.js):
// replay(ledger) called twice is deep-equal, and folding apply()
// incrementally as events arrive equals replaying the whole ledger from
// scratch.

import { describe, expect, test } from 'vitest';
import { makeState, apply } from '../../src/core/state.js';
import { replay } from '../../src/core/ledger.js';
import { warrenBorn, visit, findOffered, findDropped, wake, pet, toggleSound } from '../../src/core/events.js';

function sampleLedger(seed) {
  return {
    v: 'GW2',
    seed,
    events: [
      warrenBorn(seed),
      visit(0),
      findOffered(),
      findDropped('tile', 4),
      findOffered(),
      findDropped('compost'),
      pet(),
      toggleSound(),
      visit(86400000),
      findOffered(),
      findDropped('tile', 9),
      visit(86400000 * 2),
      wake(),
      findOffered(),
      findDropped('tile', 20), // deliberately illegal (out of range) -- exercises a no-op mid-ledger
    ],
  };
}

describe('determinism', () => {
  test('replay(ledger) called twice is deep-equal', () => {
    const ledger = sampleLedger(20260923);
    expect(replay(ledger)).toEqual(replay(ledger));
  });

  test('replaying two different seeds gives different results', () => {
    expect(replay(sampleLedger(1))).not.toEqual(replay(sampleLedger(2)));
  });

  test('incremental apply chain equals replay from scratch', () => {
    const ledger = sampleLedger(7);
    let incremental = makeState(ledger.seed);
    for (const event of ledger.events) {
      incremental = apply(incremental, event);
    }
    expect(incremental).toEqual(replay(ledger));
  });

  test('incremental apply chain equals replay, appended one event at a time (as a live game would dispatch)', () => {
    const ledger = sampleLedger(555);
    let incremental = makeState(ledger.seed);
    for (let i = 0; i < ledger.events.length; i++) {
      incremental = apply(incremental, ledger.events[i]);
      const partialLedger = { v: 'GW2', seed: ledger.seed, events: ledger.events.slice(0, i + 1) };
      expect(incremental).toEqual(replay(partialLedger));
    }
  });

  test('rng draws are identical across two independent replays (no hidden entropy)', () => {
    const ledger = sampleLedger(999);
    const a = replay(ledger);
    const b = replay(ledger);
    expect(a.offered).toEqual(b.offered);
    expect(a.ground).toEqual(b.ground);
  });
});
