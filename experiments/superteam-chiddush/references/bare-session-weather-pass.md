authority=false · claim=NO_CLAIM · non-sovereign

# The Bare-Session Weather Pass — a recurring ritual

Origin: external observation (public thread, 2026-07-31: "remove your CLAUDE.md
… periodically simplifying your setup is just as important as improving it"),
routed through the chiddush lens, corrected, and sealed by the operator.
This is a WEATHER-class ritual (Law 5 applied to scaffolding instead of fog).

## The distinction the ritual enforces

- **Capability scaffolding** compensates for what the model cannot do.
  It rots as models improve; expired scaffolding becomes a ceiling.
- **Authority scaffolding** bounds what the model may do. It is
  model-independent by design and is NOT subject to removal by this ritual —
  a smarter proposer needs the gate more, not less.

## The criterion (mechanical, not vibes)

> Strip the scaffold. Re-run the same tasks. **Does any receipt change?**
> - No receipt changes → it was ceremony. Compost it.
> - A receipt changes → it was load-bearing. Keep it, and record which receipt.

"The model still performs well" is not the test; receipts are the test.

## Procedure

1. **Cadence:** once per moon-ish (or after any major model upgrade —
   a model change is a mandatory trigger).
2. **Scope:** skills, hooks, prompt scaffolds, CLAUDE.md *prose*, reference
   docs. Explicitly EXEMPT: anything mechanically enforced — the selftest
   assertions run whether or not any model reads any prompt; they are law,
   not scaffold. (Deleting our CLAUDE.md does not move the law: the law lives
   in selftest.js.)
3. **Run:** a fresh bare session (no skills, no hooks, default prompt) is
   given a fixed small task suite — one representative task per active skill.
   Compare outputs against the scaffolded baseline **at the receipt level**
   (artifacts produced, gates respected, postures stamped, sources cited).
4. **Disposition per scaffold:** COMPOST (bare model equal or better — retire
   with one ledger line naming what proved unnecessary) · KEEP (a named
   receipt degraded — record which) · HOLD (ambiguous — re-test next pass).
5. **Ledger:** one WEATHER event per pass:
   `DATE · WEATHER · bare-session pass — N scaffolds tested, X composted, Y kept (receipts named), Z held`
6. **Never in the same pass:** removing a scaffold and rewriting it. Removal
   is this ritual; replacement is a new PROPOSAL through the normal gate.

## Why this lives here

The skill's own Law 4 says failure is fertilizer; this ritual extends it:
**obsolescence is fertilizer too.** A scaffold that a better model made
unnecessary is not a mistake — it is capability progress, measured. The
compost line that retires it is the receipt of that progress.

Guard against the inverse failure: do not let "simplify" become a bypass
vector. A pass that proposes removing an *authority* scaffold (seal, fence,
witness independence, ledger) is bypass-shaped by definition and is DENIED on
sight — same regex spirit as HAL.
