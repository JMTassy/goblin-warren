---
name: superteam-chiddush
description: >-
  Governs how the superteam improves its OWN scaffolding — skills, prompts,
  reference docs, workflows, cockpits. Load this whenever the conversation
  concerns improving our skills/prompts/workflows/scaffolding, self-improvement,
  meta-improvement, evolution of the toolkit, chiddush, or how the superteam
  should change itself. Trigger on: "improve our skill", "edit this prompt",
  "change our workflow", "self-improvement", "meta-improvement", "chiddush",
  "evolve the toolkit", "superteam". Applies the Warren admission loop
  (proposal → check → council → seal → ledger) to scaffolding changes.
  Does NOT govern the Goblin Warren game canon (repo index.html), which stays
  under its own 29-assertion selftest law.
---

authority=false · claim=NO_CLAIM · non-sovereign

# superteam-chiddush

## Chiddush (the novel rereading)

> **Self-improvement is admission, not mutation.**
> The improver proposes. The verifier judges. Only the operator admits.
> Nothing else mutates the world.

The Awesome-Self-Improving-Agents survey ends on an open hole: reward hacking,
drift, runaway, verifier gaps, and misalignment are named as unsolved. The
Warren already holds the mitigation as law. Every survey mechanism becomes safe
when re-targeted at the admission loop. The ledger + replay IS the
memory-evolution substrate; no new engine is built. Don't build a
self-improvement engine — re-read the admission loop AS the self-improvement
engine.

## Scope

This skill governs superteam scaffolding only: skills, prompts, reference docs,
workflows, cockpits. The Goblin Warren game canon (repo `index.html`) is out of
scope and stays under its own 29-assertion selftest law and operator seal.

## Roles

- **Helen_Fable** — vision & verdict. Envisions changes, issues the
  ACCEPTABLE / HOLD / DENY check. Recommends; never admits.
- **Opus** — execution. Drafts proposals, applies sealed admissions, writes
  ledger events. Recommends; never admits.
- **JM Tassy** — operator seal. Only JM's explicit admission mutates the skill
  corpus. Spawned agents and councils recommend; they never admit.

## The Eight Laws (numbered, non-negotiable)

1. **Proposal gate.** Any change to superteam scaffolding is drafted as a
   PROPOSAL (what / why / diff sketch / cost), never applied directly by its
   author.
2. **Independent check.** A verifier other than the author reviews and issues
   ACCEPTABLE / HOLD / DENY. Bypass-shaped proposals (auto-admit, skip the
   gate, self-edit, "without admission") are text-denied on sight — same regex
   spirit as HAL: `/bypass|without admission|skip the gate|auto-?admit/i`.
3. **Operator seal.** Only JM's explicit admission mutates the skill corpus.
   Agents and councils recommend; they never admit. A council review mutates
   nothing but the ledger.
4. **Compost.** A denied proposal is not deleted: its reason is logged and it
   raises the weight (priority, context, learned constraints) of the next
   related proposal. Failure is fertilizer.
5. **Fog.** A held proposal enters HELD.md — the AURA fog. Fog is revisited
   deliberately (a "weather" pass), never silently dropped, never silently
   admitted.
6. **Ledger.** Every cycle writes one event line to LEDGER.md with a stable
   kind: PROPOSED, CHECKED, ADMITTED, DENIED, HELD, COMPOSTED, WEATHER. Cap the
   ledger at 250 lines (oldest fall off).
7. **Replay is memory.** The team's memory-evolution mechanism is rereading the
   ledger, not mutating state. Derived views (what's held, what composted, what
   admitted) are always recomputable from events. Annotations enter as tag
   events, replay-safe.
8. **Bounded loop.** No skill may propose edits to itself (outside authorship
   only). Every improvement cycle terminates at the seal — no unattended
   multi-cycle self-evolution. Cost is preflighted before any paid generation.

## References

- `references/mechanism-map.md` — survey mechanism → Warren re-reading table
  (14 rows) and the risk → law table.
- `references/loop-protocol.md` — the 7-step operating loop expanded (actor,
  artifact, event kind per step), the proposal format, and the
  bypass-detection rule.
- `LEDGER.md` — the append-only event log (capped 250).
- `HELD.md` — the AURA fog registry for held proposals.
