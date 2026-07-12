# LEVELS & THE CONSEQUENCE WEB
<!-- authority=false · a map of what connects to what -->

## Four painted chapters

| Level | Name | Backdrop | Mini-games (mechanic) |
|---|---|---|---|
| 1 | THE WARREN | CSS night-garden + painted CDN scene | Mask (rapid tap), Find Gerald (search), Over-Repair (hold/release) |
| 2 | THE GLADE | bundled `bg/level2-glade.jpeg` (operator art) | Stack the Hats (stack), Do Not Tap the Mushroom (inhibition), ZOL Rain (catch, real gravity) |
| 3 | THE DEEP | painted root-cavern (CDN, graceful fallback) | Call the Ingredients (sequence), Memory Match (recall), Feed the Right Goblin (tool-fit) |
| 4 | THE SPIRE | painted crystal tower (CDN, graceful fallback) | Council Bubble Pop (judgment), Mushroom Inflation (tap-vs-timer), Wake the Goblins (rhythm) |

Travel with the 🗺️ chip; each chapter's 🎪 sparkle offers only its three
quests. Backgrounds referenced by URL like the main painted scene —
progressive enhancement: if the CDN is unreachable, the dark scrim +
warren scene shows through (offline-safe, test-witnessed).

## The consequence web (S.echoes)

Nothing here mutates governed state — echoes change *dialogue and
appearance only*, so admission stays deterministic (Dialogue ⊬
WorldMutation holds; every echo is behavior, never a typed act or a
position change). All five persist across reload and are gate-tested
(echo-gates.js 5/5 · echo-gates2.js 2/2).

    Over-Repair overshoot ──► echoes.nibHyper
        └► Nib's next Council opening: "I HAVE ALREADY BUILT SIX WALLS.
           And a spare wall. For the wall."

    Memory Match win ──► echoes.memoryFact = <the object's true name>
        └► Pip aside at Council: "For the record: the {fact}. You
           confirmed it."

    Tap the forbidden Mushroom ──► echoes.mushroomNoticed
        └► Zaz warns Council: "a mushroom is watching us. It has
           noticed things."

    Find Gerald ×3 (Head of Hiding) ──► echoes.geraldHead
        └► Lulu at Council: "Gerald is Head of Hiding now. He cannot
           attend. He is hiding."

    Stack the Hats trophy ──► echoes.luluHat
        └► Lulu wears 🎩 in her care panel's "her things".

## Why this matters

A side quest that only pays ZOL is a vending machine. A side quest whose
outcome *reappears* three screens later — in the mouth of a goblin who
remembers — is a world. The web is small on purpose (five threads) and
grows the same way the Warren always does: one bounded, verifiable
connection at a time.
