// Goblin Warren is a solo, on-device game: all real logic lives client-side
// in index.html (pure reducer zone). Higgsfield's platform requires a logic.js
// module in every game bundle, so this is the minimal single-player stub.
// authority=false · claim=NO_CLAIM · non-sovereign
export const meta = { game: "goblin-warren", minPlayers: 1, maxPlayers: 1 };
export function setup() { return {}; }
export function validateAction() { return { ok: true }; }
export function applyAction(state) { return state; }
export function isGameOver() { return { over: false }; }
export function viewFor(state) { return state; }
