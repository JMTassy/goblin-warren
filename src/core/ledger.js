// src/core/ledger.js
//
// STUB, frozen signature (MAYOR_RULING_V2.md Amendment 2). P0 owns the
// signature; P1 owns the body from here on (though the fold below is
// almost certainly the real implementation -- P1 mainly needs to decide
// what to do with a ledger that doesn't start with WARREN_BORN, or that
// carries an event `apply()` can't make sense of). Full contract:
// docs/INTERFACES.md.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.
//
// This is the single source of truth for "what state is the Warren in":
// state is NEVER persisted directly, only replay(ledger) is. Determinism
// contract: replay(ledger) called twice gives deep-equal results, and
// folding `apply` incrementally as events arrive must equal replaying the
// whole ledger from scratch every time.

import { makeState } from './state.js';
import { apply } from './state.js';

/** @typedef {import('./events.js').Ledger} Ledger */
/** @typedef {import('./state.js').State} State */

/**
 * Fold a ledger's events through `apply`, starting from `makeState(ledger.seed)`.
 *
 * @param {Ledger} ledger
 * @returns {State}
 */
export function replay(ledger) {
  let state = makeState(ledger.seed);
  for (const event of ledger.events) {
    state = apply(state, event);
  }
  return state;
}
