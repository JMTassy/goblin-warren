// test/core/persist.test.js
//
// Covers: persist.parse's fail-closed contract (never throws, null on
// anything unsure) and serialize/parse round-tripping.

import { describe, expect, test } from 'vitest';
import { serialize, parse } from '../../src/core/persist.js';
import { warrenBorn, visit, findOffered, findDropped } from '../../src/core/events.js';

function goodLedger() {
  return {
    v: 'GW2',
    seed: 20260923,
    events: [warrenBorn(20260923), visit(0), findOffered(), findDropped('tile', 4), findDropped('compost')],
  };
}

describe('persist.parse: fail-closed', () => {
  test('malformed JSON -> null', () => {
    expect(parse('{not json')).toBe(null);
  });

  test('non-string input -> null', () => {
    expect(parse(undefined)).toBe(null);
    expect(parse(null)).toBe(null);
    expect(parse(42)).toBe(null);
  });

  test('valid JSON that is not an object -> null', () => {
    expect(parse('42')).toBe(null);
    expect(parse('"a string"')).toBe(null);
    expect(parse('null')).toBe(null);
  });

  test('wrong version tag -> null', () => {
    expect(parse(JSON.stringify({ v: 'GW1', seed: 1, events: [] }))).toBe(null);
  });

  test('non-numeric seed -> null', () => {
    expect(parse(JSON.stringify({ v: 'GW2', seed: '1', events: [] }))).toBe(null);
  });

  test('non-array events -> null', () => {
    expect(parse(JSON.stringify({ v: 'GW2', seed: 1, events: {} }))).toBe(null);
  });

  test('an event without a string kind -> null', () => {
    expect(parse(JSON.stringify({ v: 'GW2', seed: 1, events: [{ notKind: true }] }))).toBe(null);
  });

  test('an event with an unrecognised kind -> null (foreign input)', () => {
    expect(parse(JSON.stringify({ v: 'GW2', seed: 1, events: [{ kind: 'HACK_STATE' }] }))).toBe(null);
  });

  test('a VISIT with a non-numeric t -> null', () => {
    expect(parse(JSON.stringify({ v: 'GW2', seed: 1, events: [{ kind: 'VISIT', t: 'soon' }] }))).toBe(null);
  });

  test('a FIND_DROPPED with an out-of-range tile -> null', () => {
    expect(parse(JSON.stringify({ v: 'GW2', seed: 1, events: [{ kind: 'FIND_DROPPED', target: 'tile', tile: 99 }] }))).toBe(null);
  });

  test('a FIND_DROPPED with a cut target (cave) -> null', () => {
    expect(parse(JSON.stringify({ v: 'GW2', seed: 1, events: [{ kind: 'FIND_DROPPED', target: 'cave' }] }))).toBe(null);
  });

  test('never throws on any of the above', () => {
    const inputs = ['{not json', undefined, null, 42, '42', '"a string"', 'null', '[]', '{}'];
    for (const input of inputs) {
      expect(() => parse(input)).not.toThrow();
    }
  });
});

describe('persist: round-trip', () => {
  test('serialize then parse recovers an equal ledger', () => {
    const ledger = goodLedger();
    const roundTripped = parse(serialize(ledger));
    expect(roundTripped).toEqual(ledger);
  });

  test('a well-formed ledger parses to a non-null result', () => {
    expect(parse(serialize(goodLedger()))).not.toBe(null);
  });
});
