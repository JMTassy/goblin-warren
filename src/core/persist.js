// src/core/persist.js
//
// STUB, frozen signature (MAYOR_RULING_V2.md Amendment 2). P0 owns the
// signature; P1 owns the body from here on (the fail-closed shape check
// below is a reasonable starting point, but P1 may want to validate event
// kinds/payloads too). Full contract: docs/INTERFACES.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.
// This file does NOT touch localStorage -- it only converts a ledger
// to/from a string. `src/game/storage.js` (P4) is what reads/writes
// localStorage and calls these.
//
// Fail-closed: `parse` returns `null` on ANYTHING it isn't sure about,
// never throws, never returns a partially-valid ledger. A null result
// means "start a new Warren", not "crash".

/** @typedef {import('./events.js').Ledger} Ledger */

/**
 * @param {Ledger} ledger
 * @returns {string}
 */
export function serialize(ledger) {
  return JSON.stringify(ledger);
}

/**
 * @param {string} input
 * @returns {Ledger|null}
 */
export function parse(input) {
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
    if (!event || typeof event !== 'object' || typeof event.kind !== 'string') {
      return null;
    }
  }
  return data;
}
