// src/core/events.js
//
// FROZEN by P0 (VISION_V2.md §11, amended by MAYOR_RULING_V2.md Amendment 1).
// This file defines the only event kinds the ledger may ever contain for
// M1, and the shape of their payloads. It is documentation-as-code: the
// authoritative prose lives in docs/INTERFACES.md, this file is what you
// import.
//
// PURE. No wall-clock reads, no chance calls, no DOM globals, no engine import.
// (Enforced by test/core/purity.test.js.)

/** The ledger format tag. Bump only with a schema change everyone agrees on. */
export const LEDGER_VERSION = 'GW2';

/**
 * Every event kind the M1 ledger may contain. The ruling (Amendment 1) cut
 * the Cave of Echoes from M1, so `'cave'` is NOT a legal FIND_DROPPED target
 * here even though the original vision text mentions it — that target
 * returns in M2.
 */
export const EVENT = Object.freeze({
  WARREN_BORN: 'WARREN_BORN',
  VISIT: 'VISIT',
  WAKE: 'WAKE',
  FIND_OFFERED: 'FIND_OFFERED',
  FIND_DROPPED: 'FIND_DROPPED',
  PET: 'PET',
  TOGGLE_SOUND: 'TOGGLE_SOUND',
});

/** Legal values for FIND_DROPPED.target in M1 (cave is cut; see EVENT doc above). */
export const FIND_DROPPED_TARGETS = Object.freeze(['tile', 'compost']);

/**
 * @typedef {Object} WarrenBornEvent
 * @property {'WARREN_BORN'} kind
 * @property {number} seed - the Warren's seed. Only ever appears once, as events[0].
 *
 * @typedef {Object} VisitEvent
 * @property {'VISIT'} kind
 * @property {number} t - ms since epoch. The only source of "now" the core may use;
 *   growth/sleep/day-rollover logic derives everything from consecutive VISIT.t values,
 *   never sampled from the system clock.
 *
 * @typedef {Object} WakeEvent
 * @property {'WAKE'} kind - Lulu wakes for the day (ends sleep, resets energy).
 *
 * @typedef {Object} FindOfferedEvent
 * @property {'FIND_OFFERED'} kind - Lulu holds up a new find (species chosen by
 *   `finds.nextFind`, deterministically, from state + rng(seed, events.length)).
 *
 * @typedef {Object} FindDroppedEvent
 * @property {'FIND_DROPPED'} kind
 * @property {'tile'|'compost'} target - M1 has two drop targets only.
 * @property {number} [tile] - 0..15, the ground index. Required when target === 'tile',
 *   absent/ignored when target === 'compost'.
 *
 * @typedef {Object} PetEvent
 * @property {'PET'} kind - tap-and-hold on Lulu while she sleeps. Juice only,
 *   never mutates gameplay state beyond `lastReaction`.
 *
 * @typedef {Object} ToggleSoundEvent
 * @property {'TOGGLE_SOUND'} kind
 *
 * @typedef {WarrenBornEvent|VisitEvent|WakeEvent|FindOfferedEvent|FindDroppedEvent|PetEvent|ToggleSoundEvent} GWEvent
 *
 * @typedef {Object} Ledger
 * @property {'GW2'} v
 * @property {number} seed
 * @property {GWEvent[]} events - events[0] is always a WARREN_BORN event whose
 *   seed matches `seed` above (redundant on purpose: the ledger is self-describing).
 */

/**
 * Convenience constructors. These do NOT validate — `apply()` in state.js is
 * the single place that decides whether an event is legal against the
 * current state. Kept here only so callers don't hand-roll object literals
 * with a typo in `kind`.
 */
export function warrenBorn(seed) {
  return { kind: EVENT.WARREN_BORN, seed };
}

export function visit(t) {
  return { kind: EVENT.VISIT, t };
}

export function wake() {
  return { kind: EVENT.WAKE };
}

export function findOffered() {
  return { kind: EVENT.FIND_OFFERED };
}

export function findDropped(target, tile) {
  return tile === undefined
    ? { kind: EVENT.FIND_DROPPED, target }
    : { kind: EVENT.FIND_DROPPED, target, tile };
}

export function pet() {
  return { kind: EVENT.PET };
}

export function toggleSound() {
  return { kind: EVENT.TOGGLE_SOUND };
}
