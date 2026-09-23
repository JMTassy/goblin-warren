// src/core/persist.js
//
// Signature frozen by P0 (MAYOR_RULING_V2.md Amendment 2). Body owned and
// written by P1. Full contract: docs/INTERFACES.md; rules in plain
// language: docs/RULES_M1.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.
// This file does NOT touch localStorage -- it only converts a ledger
// to/from a string. `src/game/storage.js` (P4) is what reads/writes
// localStorage and calls these.
//
// Fail-closed: `parse` returns `null` on ANYTHING it isn't sure about,
// never throws, never returns a partially-valid ledger. A null result
// means "start a new Warren", not "crash".

import { EVENT, FIND_DROPPED_TARGETS } from './events.js';

/** @typedef {import('./events.js').Ledger} Ledger */

/**
 * @param {Ledger} ledger
 * @returns {string}
 */
export function serialize(ledger) {
  return JSON.stringify(ledger);
}

const EVENT_KINDS = new Set(Object.values(EVENT));

/** Per-kind payload shape check, beyond "kind is a known string". */
function isWellFormedEvent(event) {
  if (!event || typeof event !== 'object' || typeof event.kind !== 'string') {
    return false;
  }
  if (!EVENT_KINDS.has(event.kind)) {
    return false;
  }
  switch (event.kind) {
    case EVENT.WARREN_BORN:
      return typeof event.seed === 'number' && Number.isFinite(event.seed);
    case EVENT.VISIT:
      return typeof event.t === 'number' && Number.isFinite(event.t);
    case EVENT.FIND_DROPPED:
      if (!FIND_DROPPED_TARGETS.includes(event.target)) return false;
      if (event.target === 'tile') {
        return Number.isInteger(event.tile) && event.tile >= 0 && event.tile <= 15;
      }
      return true;
    case EVENT.WAKE:
    case EVENT.FIND_OFFERED:
    case EVENT.PET:
    case EVENT.TOGGLE_SOUND:
      return true;
    default:
      return false;
  }
}

/**
 * @param {string} input
 * @returns {Ledger|null}
 */
export function parse(input) {
  if (typeof input !== 'string') return null;
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  if (data.v !== 'GW2') return null;
  if (typeof data.seed !== 'number' || !Number.isFinite(data.seed)) return null;
  if (!Array.isArray(data.events)) return null;
  for (const event of data.events) {
    if (!isWellFormedEvent(event)) {
      return null;
    }
  }
  return data;
}
