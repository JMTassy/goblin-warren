// src/game/storage.js
//
// Owned by P4 (VISION_V2.md §11). localStorage I/O for the Warren's
// ledger. This is the ONLY place that touches localStorage -- everything
// else in the game reads/writes a Ledger object in memory and lets
// `src/core/persist.js` (serialize/parse) do the string<->object work.
//
// Fail-closed, per the ruling and docs/INTERFACES.md: a missing or corrupt
// save NEVER throws -- it just means "start a new Warren". This file is
// NOT in a PURE dir (src/core, src/art), so it is free to touch
// window/localStorage/Math.random -- the seed for a brand-new Warren is
// the one place in the whole game a fresh, non-seeded random number is
// appropriate (there is nothing to replay yet).

import { serialize, parse } from '../core/persist.js';
import { warrenBorn } from '../core/events.js';

const STORAGE_KEY = 'gw2:ledger';

/** A fresh 32-bit seed for a brand-new Warren (no prior ledger to derive one from). */
function freshSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

function freshLedger() {
  const seed = freshSeed();
  return { v: 'GW2', seed, events: [warrenBorn(seed)] };
}

/**
 * Load the saved ledger, or start a brand-new Warren if there is none, or
 * if what's saved is corrupt (fail-closed -- never throws).
 *
 * @returns {import('../core/events.js').Ledger}
 */
export function loadLedger() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const ledger = parse(raw);
      if (ledger) return ledger;
    }
  } catch {
    // localStorage unavailable (private mode, disabled, etc.) -- fall through
  }
  return freshLedger();
}

/**
 * Save the ledger. Never throws -- a full/blocked localStorage just means
 * this visit's progress won't persist, not a crash.
 *
 * @param {import('../core/events.js').Ledger} ledger
 */
export function saveLedger(ledger) {
  try {
    window.localStorage.setItem(STORAGE_KEY, serialize(ledger));
  } catch {
    // ignore -- never throw
  }
}
