authority=false · claim=NO_CLAIM · non-sovereign

# Mechanism map — survey → Warren re-reading

Source: the Awesome-Self-Improving-Agents survey
(github.com/selfimproving-agent/Awesome-Self-Improving-Agents), a taxonomy of
self-improving agentic systems (July 2026 state). The survey names its own hole:
reward hacking, drift, runaway, verifier gaps, and misalignment are listed as
open research questions without elaborated mitigation.

The chiddush inversion: each survey mechanism becomes safe when re-targeted at
the Warren's governance substrate (proposal → HAL verdict → council
recommendation → operator admission → ledger event). Nothing new is built; the
ledger + replay already IS the memory-evolution substrate. The improver
proposes, the verifier judges, only the operator admits.

## Survey mechanism → Warren re-reading (14 rows)

| Survey mechanism | Warren re-reading |
|---|---|
| Self-reflection / iterative refinement | councilReview: 5 seats, forced self-objections, mutates only the ledger |
| Memory evolution | ledger + replay; tags as events; views derived, never authoritative |
| Autonomous skill/tool creation | allowed as PROPOSAL for a new skill; enters the gate like anything else |
| Intrinsic reward learning | permitted as recommender signal only; an intrinsic reward may never admit |
| Curriculum self-generation | QCM economics: earn budget by answered questions, spend exactly the price to buy capability — no self-minted rewards |
| Test-time RL / online adaptation | in-session only (ZOL is session-only); nothing persists except sealed admissions + ledger |
| Textual gradient optimization | the DENY/HOLD reasons are the gradient; compost carries it forward |
| Multi-agent knowledge sharing | superteam roles: Fable envisions & judges, Opus executes, operator seals; discoveries shared via ledger events |
| Verifier-free self-improvement | DENIED by law — a verifier gap is bypass-shaped by definition |
| Population/tournament prompt evolution | judge panels allowed PRE-gate (generate N, score, pick) — winner still enters the gate |
| Epistemic self-assessment | the held-fog count is the uncertainty metric; thick fog = schedule a weather pass |
| World models / planning | plan freely; plans are free — only admission touches the world |
| Computational runaway | seal terminates every loop; ledger cap; cost preflight (get cost first, announce budget) |
| Superficial improvement / drift / collapse | replay from ledger is ground truth; any view that can't be recomputed from events is drift and is discarded |

## Risk → which law kills it

| Survey risk | Law(s) |
|---|---|
| Reward hacking | Laws 2 + 3 — no self-minted admission |
| Drift / collapse | Law 7 — replay is ground truth |
| Verification gap | Law 2 — verifier-free is bypass-shaped |
| Runaway | Law 8 — seal terminates every loop; ledger cap; cost preflight |
| Misalignment | Law 3 — human operator seal |
| Cascading hallucination | Law 6 — every change evented, auditable |
| Superficial gains | Law 4 — denials teach (compost) |
