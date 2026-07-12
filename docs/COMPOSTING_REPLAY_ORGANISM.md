# The Warren as a Composting Replay Organism (slice v1)
<!-- authority=false · claim=NO_CLAIM · WITNESSED where gated -->
<!-- Chiddush by JM Tassy, 2026-07-12. Built as one bounded /warren slice. -->

## The live wire

> A memory field stays true only through re-engagement.
> **What you do not replay does not stay true. What you do not compost
> eventually grows teeth.**

The Warren is not a collection of pets you raise — it is a memory field that
grows, decays, and re-remembers through care, contradiction, and replay.
Lulu is the *interface*; the Warren (the event/memory log) is the *creature*.

## The lie this slice deleted

Before: `if (S.replay.length > 40) S.replay.shift()`. Old memories were
**silently dropped** at entry 41 — forgetting-by-overflow, no soil, no trace.
The cozy layer quietly winning. That line is gone.

## The mechanic (what the code now does)

- **Memories don't drop — they compost.** An un-tended memory older than a
  freshness threshold **transforms into soil** (a `🍄 SOIL` chip + `+soil` +
  a "Composted Memory" object), never a silent delete. *Grows teeth.*
- **Replay is load-bearing.** Tapping a memory chip re-remembers it
  (`touchMemory`), resetting its freshness. Re-engagement keeps a memory
  true; neglect lets absence compost it.
- **Absence ages the whole Warren, not just Lulu.** On return, elapsed time
  is folded once into an integer tick counter; un-touched memories past
  `COMPOST_THRESHOLD_TICKS` (~24h cumulative absence) turn to soil. The
  target feeling — *"I left for three days and the Warren remembered me
  differently"* — now applies to the memory field, not only Lulu's mood.

## The wall, and the derivation through it

The obvious build breaks the constitution: if memory decays by reading the
wall-clock at replay time, the same log composts differently on Tuesday than
Friday → **replay is no longer deterministic**; and a mutable per-memory
`lastTouchedAt` is **hidden memory outside the log**. Both forbidden.

**Resolution (not a patch):** time never decays memory directly. The passage
of absence is recorded as *data* — folded once, in the boot/return zone, into
`S.world.warrenTicks` (an integer). Freshness is then a **pure function of
integer ticks** (`warrenTicks − freshTick ≥ threshold → compost`). The clock
is read exactly once, outside the fold; the fold itself is clock-free and
idempotent. Same door the reducer already uses for Lulu's needs — so this is
**one decay law for the whole Warren**, not a special case. The design got
*simpler* as it got deeper.

## Constants (`game.js`)

| Constant | Value | Meaning |
|---|---|---|
| `COMPOST_BUCKET_MS` | 1 800 000 | 30-min absence bucket (schema-consistent) |
| `COMPOST_MAX_BUCKETS` | 336 | fold caps at 7 days (kernel law) |
| `COMPOST_THRESHOLD_TICKS` | 48 | ~24h un-touched → soil |
| `REPLAY_SOFT_CAP` | 120 | only *settled* soil may fall off the end; fresh never drops |

## Laws, gate-enforced

`compost-replay-gates.js` — **6/6 WITNESSED**:

1. `CR1_threshold_decay` — composts at exactly the threshold tick, not before.
2. `CR2_replay_refreshes` — a touched memory survives while an untouched
   sibling composts (replay is load-bearing).
3. `CR3_compost_one_way` — a composted memory can't be un-composted; only a
   new event grows from that soil.
4. `CR4_fold_idempotent` — re-running the fold with no new ticks composts
   nothing (no clock, no randomness in the fold).
5. `CR5_fresh_never_dropped` — 130 fresh memories, zero absence → none lost
   (the old 40-FIFO lie is dead).
6. `CR6_deterministic_signature` — same (memories + absence) across two
   independent page loads → identical `{ticks, soil, composted}`.

    node compost-replay-gates.js   # 6 assertions

## Claim typing

- The mechanic + its six laws: **WITNESSED** (gate green).
- "grows teeth over multi-day absence" as *felt experience*: **CANDIDATE** —
  the code path is witnessed; the emotional payoff needs playtesting at real
  time-scale.
- Extending compost to the Evolution Journal, Lulu's room, and mini-game
  receipts (so *every* long-term surface composts): **NEEDS_ME** — next
  bounded slices, operator-gated.

*What you do not replay does not stay true. The operator's hand still stamps.* 🍂
