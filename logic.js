// PLATFORM COMPATIBILITY SHIM ONLY — the deploy engine requires a rules
// module with these six exports at the zip root. Goblin Warren V1 is a
// fully client-side sandbox: every rule lives in game.js and runs in the
// browser; the Warren remembers only in localStorage. This module holds
// NO game rules, accepts NO actions, and can never change what the player
// sees. shim ⊆ platform adaptation; not a redesign; no hidden backend.
export const meta = { game: "goblin-warren", minPlayers: 1, maxPlayers: 1 };

export function setup(players) {
  return { warren: "client-side", seats: players.length };
}

export function validateAction(state, playerId, action) {
  return { ok: false, error: "The Warren lives entirely in your browser; the server holds no rules." };
}

export function applyAction(state, playerId, action) {
  return { ...state };
}

export function isGameOver(state) {
  return { over: false };
}

export function viewFor(state, playerId) {
  return { ...state };
}
