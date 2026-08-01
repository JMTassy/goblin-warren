authority=false · claim=NO_CLAIM · non-sovereign · status: PROPOSED
CITATION GATE: unresolved — no citation below may enter any HELEN artifact
until a resolution pass confirms each source exists and says what the note
claims. The pool mixes arXiv entries (several with internally inconsistent
IDs/years), vendor blogs, and unadopted IETF drafts. The synthesis itself
flags this; the gate is stamped here so it travels with the file.

Provenance: Fable vision (100w) → 10 haiku field-searchers, 60 typed
findings, 10/10 fields → Opus synthesis. Run wf_c3499ac1-a3c · 2026-08-01.

---

authority=false · claim=NO_CLAIM · non-sovereign · status: PROPOSED

# HELEN vNext Research Sweep — Opus Synthesis

**Pool:** 60 typed findings across 10 declared fields. After de-duplication, **52 unique works** (Sovereign Agentic Loops ×3, Proof of Execution ×3, DEMM ×2, Authorization Propagation ×2, Always-On Agents ×2, Policies on Paths ×2). Duplicate-across-field recurrence is itself signal: those six works sit at the convergence point of provenance, replay, authority, and admission.

**Source-quality caveat, stated first because HELEN's own discipline demands receipts about receipts:** the pool mixes peer-review-shaped arXiv entries with 4 vendor blog posts (`zylos.ai` ×2, `agenticrail.nz`, `kumiho.io`), 2 unadopted IETF individual drafts (`draft-sirkkavaara-vaara-receipt-06`, `draft-sabey-refusal-transparency-00`), 1 law-review article, and 1 analyst blend (Lumenova/FedScoop/IBM). Several arXiv identifiers (26xx-series) and year fields are internally inconsistent — `2605.04093` is dated 2025 in two records; `2607.05397` is dated 2026 in one field and appears as prior art in another. **No citation from this pool should enter a HELEN artifact before a resolution pass confirms it exists and says what the note claims.** Everything below is conditional on that pass.

---

## 1. LITERATURE MAP

**agent-frameworks (6 records).** The strongest is *Multi-Agent LLM Orchestration for Incident Response* (arxiv:2511.15755), which names and solves what HELEN should adopt as vocabulary: the **Replay Divergence Problem** — model/prompt version drift silently invalidating an audit trail — answered with checkpoint-based event sourcing and bit-exact trajectory reconstruction. *KYA* (arxiv:2605.25376) supplies the other half: cryptographic provenance chains plus a policy lattice over capability sets, i.e. typed ceilings that compose. *Runtime Governance: Policies on Paths* (arxiv:2603.16586) gives the cleanest governance signature in the entire pool, σ(path) → {admit|hold|deny|escalate}, which is HELEN's HAL verdict set with `escalate` added. *AIOS* (arxiv:2403.16971, 2024) matters mainly as a date: "agent OS" as an architectural category predates HELEN by two years and carries no governance model — compatible substrate, not competition. DEMM (2605.04093) and DEMM-Bench (2606.20634) pair a maturity model with its benchmark.

**belief-revision (6).** Genuinely thin — only two of six records are belief revision. The Kumiho graph-memory paper implements **AGM contraction/expansion/revision over attributed property graphs**, which is the real prior art for "how do you retract an admitted fact without rewriting history," and it is a self-published PDF, so treat as unverified. *TOKI* (arxiv 2606.06240) is the more directly useful: a **bitemporal algebra separating assertion time from valid time**, with contradiction-resolution operators that preserve causality — exactly the machinery for HELEN's HOLD state, which today is an undifferentiated fog. The remaining four (Proof of Execution, Authorization Propagation, Always-On Agents, Earned Authority under a Fixed Ceiling) are authority/provenance work misfiled here. *Earned Authority under a Fixed Ceiling* (2607.23586) is the single most dangerous-to-HELEN item in the pool and is discussed in §2.

**provenance (6).** *W3C PROV* (2013) is the floor: entities, activities, agents, `wasGeneratedBy`/`wasAssociatedWith`/`wasDerivedFrom`, bundles for scope. Thirteen years old, a Recommendation, and it already models most of what a HELEN ledger event carries. *The Log is the Agent* (arxiv 2605.21997) is the strongest recent item — event-sourced immutable log, reactive graph evaluation over deterministic replay, fork-safety via log-linear causality — and it is essentially HELEN's ledger described as a general architecture. *Verifiable Credentials Data Model 2.0* (W3C, 2025) is the pool's only **standards-track typed-authority format** (issuer, scope, proof, revocation registry) and is flagged `new_opportunity` for good reason: HELEN's `claim=NO_CLAIM` header is a convention, VCDM is a data model. The two vendor posts (deterministic replay via recorded responses; signed action identity with Merkle summaries) are practitioner-grade, not citable.

**event-replay (6).** The densest field for receipts specifically. *The Vaara Receipt* (IETF draft) defines receipt = (decision, evidence, [timestamp anchors]), signed and **independently recomputable from inputs**, with idempotency keys — the closest existing thing to what HELEN calls a receipt. *AgentBound* (arxiv 2606.30970) co-signs (agent_action, policy_artifact, outcome) and enables out-of-band verification **from the receipt alone, without re-execution**. *Notarized Agents* (arxiv 2606.04193) adds the dual-signature model (requesting agent + enforcement service) that formalizes witness independence: neither party can unilaterally forge. *Refusal Transparency* (IETF draft) covers the case HELEN currently under-serves — signed evidence of **refused** transitions, binding the refusal reason to the policy as evaluated at decision time.

**capability-security (6).** *Securing Agents With Tracked Capabilities* (arxiv:2603.00991) correctly points at the deep prior art: **object capabilities, KeyKOS and EROS**, decades old, here re-applied to agents via Scala 3 capture checking so that capability leakage is a static type error. The lesson for HELEN is stated in the record itself and is worth internalizing: safety-as-infrastructure is *orthogonal* to admission gates, not a substitute. *AgenticOS* (2606.21129) reframes the OS as an **intent filter** with mandatory mediation and least-privilege environment synthesis — the closest architectural sibling to HELEN's proposal cycle. *Specifying AI-SDLC Processes* (2606.20615) makes **approval gates first-class boundary declarations in a protocol DSL**, with well-formedness conditions and enforcement invariants; this is the item that most directly pre-empts a HELEN claim to having invented a syntax for human-only admission. *MCPSHIELD* (2604.05969) formalizes MCP as a labeled transition system with trust boundaries and four security properties. *Decentralized Granular Access Control* (2607.22611) offers the RBAC road not taken.

**constitutional-ai (6).** Position-paper-heavy, formal-machinery-light. *Constitutional AI* (2212.08073, 2022) is foundational and, importantly, **structurally opposed to HELEN at the admission point**: it substitutes AI feedback for human supervision. *Public Constitutional AI* (Abiri, Georgia Law Review 2025) supplies the normative vocabulary HELEN actually wants — accountability, corrigibility, contestability, pluralism, democratic oversight — as *enforceable structural properties* rather than trained dispositions. The *debate safety case* (2505.03989) is the one with real machinery: two agents argue under human judgment, counter-argument trees constrain outputs to defensible positions. That is HELEN's council with a formalism attached, and it is the prior art for forced adversarial seats. *Effective Generative AI Governance in 2026* names the HITL/HOTL/HIC taxonomy and the deterministic-vs-probabilistic audit-burden asymmetry.

**multi-agent-kernels (6).** *Evidence-Grounded Verified Agentic Reasoning* (2607.12650) is the strongest and the most instructive: a **Lean 4 kernel is the sole authority** that mints Verified claims, each output ships a proof file, and third parties re-typecheck rather than trusting the producer. That is witness independence with the trust reduced to a kernel — a stricter architecture than HELEN's, and a useful upper bound on what "no self-certification" can mean. *Verified Multi-Agent Orchestration* (2603.11445) gives Plan-Execute-Verify with supervisor veto. *Security Considerations for Multi-agent Systems* (2603.09002) covers authority boundaries and priority-based conflict resolution across agent hierarchies. *Forage V2* (2604.19837) is flagged `new_opportunity` but is the pool's clearest ZOL hazard (§5). The field is thin: only one genuine kernel.

**world-models (6).** **Mislabeled — nothing in this bucket is a world model.** There is no learned-dynamics, simulation, or predictive-environment work here; it is a second governance bucket. Judged as such, it contains two of the pool's most on-target items. *Governing Actions, Not Agents* (2606.26298) formalizes **institutional attestation**: an independent verifier certifies action legality before execution, with typed authority bounds per action class — the proposal/admission split as an institutional design rather than a code pattern. *Grounded Scaling* (2606.22495) argues empirically that agentic systems need deterministic environments (no ambient randomness, no state drift) to be auditable at all — direct support for HELEN's no-`Math.random`/no-`Date` reducer rule. *I Can't Believe It's Corrupt* (2603.18894) models cascade corruption through collusion, blame-shifting, and record fragmentation, and is the only pool item that supplies a **threat model for the council itself**. *AgentCity* (2604.07007) does separation of powers for agent economies.

**formal-verification (6).** The most technically serious field. *Proof of Execution* (2607.05397) carries three theorems — invariant minimality via witness construction, soundness under a **PoE-forgery game** with cryptographic bounds, and deterministic replay conditional on interpreter determinism plus declared dependencies. Note the conditional: replay determinism is *proved relative to declared dependencies*, which is precisely the assumption HELEN enforces by construction with its pure reducer zone. *Agent Behavioral Contracts* (2602.22302) is the second pre-emption risk: typed preconditions, invariants, **governance predicates**, recovery logic, and a Drift Bounds Theorem for probabilistic compliance. *AgentSpec* (2503.18666, 2025) compiles a TLTL DSL to SMT-checked constraints at generation time; *AgentGuard* (2509.23864) compiles LTL to Büchi automata as a monitor sitting between decision engine and environment. *Agentproof* (2603.20356) does static DAG verification of workflow graphs **before any execution** — the one item offering a guarantee HELEN currently lacks entirely.

**memory-systems (6).** Well-populated, largely inapplicable under V0 ZOL law, and therefore the field to read for *schemas* rather than *stores*. *From Agent Traces to Trust* (2606.04990) gives the provenance-chain model — memory item → claim → plan → tool argument → answer — with audit records as first-class governance objects. *MemAudit* (2605.23723) does **causal attribution graphs over memory mutations** with structural anomaly detection, enabling third-party verification of memory integrity without trusting the agent's self-report. *Memanto* (2604.22085) supplies typed memory schemas with information-theoretic retrieval bounds. *MemGuard* (2605.28009) and the long-term memory security survey (2604.16548) cover checksumming, tamper detection, isolation, and a lifecycle threat model (capture → corruption → inference). Every one of them assumes durable state is desirable; HELEN V0 assumes the opposite.

---

## 2. NOVELTY BOUNDARY

This is the section that must survive adversarial reading. The rule: **HELEN claims nothing over cited prior art.** Where the pool contains a mechanism, HELEN is an *instance*, not an *invention*.

### 2.1 Established prior art — HELEN must never claim these

| HELEN element | Superseding prior art | Verdict |
|---|---|---|
| Deterministic replay from an event log | *The Log is the Agent* (2605.21997); *Replayable Agent Runtimes*; arxiv:2511.15755 checkpointed reconstruction; PoE Theorem 3 | **Not novel.** Event sourcing is a 2005-era enterprise pattern; these apply it to agents before/independently of HELEN. `replayEvents()` is an implementation. |
| Receipts / evidence on every claim | Vaara Receipt (IETF); AgentBound governance receipts; Notarized Agents; *Agent Identity and Signed Provenance* | **Not novel, and HELEN is behind.** These are signed and independently recomputable; HELEN's `logEvent` is an unsigned in-memory array capped at 250. |
| Provenance vocabulary | **W3C PROV (2013)**; *From Agent Traces to Trust* | **Not novel by 13 years.** |
| Typed authority ceilings | *Earned Authority under a Fixed Ceiling* (2607.23586); *Authorization Propagation* (2605.05440) with a proof that delegation monotonically narrows; KYA policy lattice; VCDM 2.0 issuer scoping | **Not novel, and formally weaker.** 2607.23586 proves authority ≤ ceiling *under agent evolution*; HELEN asserts a fixed ceiling by construction and proves nothing. |
| Capability/effect typing | **Object capabilities: KeyKOS, EROS** (via 2603.00991); Scala 3 capture checking | **Not novel by decades.** |
| Human-only admission / propose-vs-execute split | *Sovereign Agentic Loops* (2604.22136); *Governing Actions, Not Agents* (2606.26298); *Specifying AI-SDLC Processes* (2606.20615) — approval gates as first-class DSL declarations; HITL taxonomy | **Not novel.** 2606.20615 in particular already gives human-boundary admission a syntax, well-formedness conditions, and enforcement invariants. |
| Council / adversarial review before judgment | *An alignment safety case sketch based on debate* (2505.03989); *Verified Multi-Agent Orchestration* supervisor veto; *AgentCity* separation of powers | **Not novel.** Debate-under-human-judgment is the exact structure. |
| A machine judge that reviews but does not admit | *Verified Multi-Agent Orchestration*; *Runtime Governance: Policies on Paths* (σ → hold/deny/escalate); AgentGuard monitor verdicts | **Not novel.** HAL is a monitor. |
| Governance predicates / runtime invariant enforcement | *Agent Behavioral Contracts* (2602.22302); AgentSpec; AgentGuard | **Not novel.** 2602.22302 explicitly formalizes typed preconditions + governance predicates enforced at decision points. **This paper is the strongest single pre-emption of a "first formal governance formalism" claim. Do not make that claim.** |
| Constitutions constraining model output | *Constitutional AI* (2212.08073, 2022); *Public Constitutional AI* | **Not novel by four years.** |

### 2.2 The three-key lock — what survives, and how narrowly

The composition claim under test: **effect-typed proposals bounded by declared ceilings + a human seal that is the sole mutation authority + a replay ledger, all closed in one loop where the ledger is simultaneously the audit record, the state function, and the only write path.**

I checked each pool item against all three keys:

- *The Log is the Agent* — replay ✔, ceilings ✘, human seal ✘.
- *Proof of Execution* — replay ✔, typed policy ✔, human seal ✘ (policy is automated; no human is in the theorem).
- *Governing Actions, Not Agents* — attestation gate ✔, typed bounds per action class ✔, replay-as-substrate ✘.
- *Sovereign Agentic Loops* — propose/execute split ✔, capability gates ✔, replay of reasoning ✔ — **this is the closest**, and its separation is between reasoning and *execution control plane*, not reasoning and *a human*.
- *Specifying AI-SDLC Processes* — human approval gates ✔, enforcement invariants ✔, deterministic replay ✘.
- *Always-On Agents* survey — catalogs all three as separate emerging primitives, composes none.

**Honest conclusion:** no single pool item holds all three keys in one closed loop. But *Sovereign Agentic Loops* + *Vaara* + *2606.20615* cover it in aggregate with no conceptual gap between them. The residual is therefore **integration-level, not conceptual**. The defensible statement is:

> "We are not aware of a single system in the surveyed literature that closes typed-ceiling proposal, human-only seal, and deterministic replay into one loop where the ledger is both the audit artifact and the state function. Each component is established prior art; we claim the composition and its test discipline, not the components."

That is the maximum claim. Anything stronger is false.

### 2.3 Genuinely under-claimed in the pool (candidate originality, ranked by confidence)

1. **The human seal inside the replayed log rather than outside it.** In every pool item that has a human gate, approval is an *external* event injected into the system; in HELEN the admission is itself a ledger event and therefore a term in the state function `S = fold(reduce, S₀, E)`. Replaying the log replays the governance, not just the mechanics. No pool item states this. *Confidence: moderate.* It may simply be an unremarked consequence of event sourcing that nobody bothered to write down.

2. **Forced self-objection as a structural seat property.** *I Can't Believe It's Corrupt* (2603.18894) identifies collusion and blame-shifting as the cascade mechanism but proposes no seat-level primitive against it. The debate safety case has adversaries *by role assignment*, not by *mandatory self-dissent*. HELEN's five seats each carrying a forced objection against their own recommendation is not present in the pool. *Confidence: moderate-low* — probably exists in deliberative-democracy or red-team literature outside this sweep.

3. **Non-persistence as a governance invariant.** Every memory-systems item treats durability as the goal and contamination as the threat. HELEN V0 inverts it: no localStorage, no cookies, no backend, asserted as law. Nothing in the pool treats *the absence of a persistence surface* as a governance property. *Confidence: low as a contribution* — it is a constraint, and constraints are cheap. It is interesting only because it forces every other mechanism to be recomputable rather than stored, which is a real design pressure.

4. **Marker-delimited purity as a test-harness mechanism.** Extracting the reducer zone by regex on comment markers and running it headlessly is an engineering pattern that operationalizes PoE's "declared dependencies" precondition by *construction* rather than by declaration. This is a **testing methodology contribution at best**, and should be presented as craft, never as governance theory.

### 2.4 Claims HELEN must retire immediately

- Any phrasing suggesting HELEN originated deterministic replay, receipts, ceilings, or human-in-the-loop admission.
- Any "first formal governance framework" language — 2602.22302 and 2603.16586 both predate it with more formal machinery.
- Any implication that the ledger is tamper-evident. **It is not.** It is an in-memory array with an FNV hash used for *determinism*, not integrity. FNV is not a cryptographic hash. Calling it a receipt in the Vaara/AgentBound sense is currently unearned.

---

## 3. UPGRADE ROADMAP vNEXT

Ranked by impact × compatibility × replay-preservation. Each item names what to adopt, from where, what invariant it strengthens, and — non-negotiably — the falsifier and first experiment.

### R1. Recomputable receipt chain over ledger events
**Adopt:** receipt = (decision, evidence, causal-parent), independently recomputable from inputs, with idempotency keys — *The Vaara Receipt* (draft-sirkkavaara-vaara-receipt-06); verification-from-receipt-alone from *AgentBound* (2606.30970).
**Strengthens:** receipts-on-every-claim; witness independence. Converts `logEvent` from a narrative log into a verifiable structure.
**Replay impact:** none if the receipt is a pure function of prior events: `r(eᵢ) = h32(canonical(eᵢ) ‖ r(eᵢ₋₁))`.
**Falsifier:** if recomputation requires a wall clock, nonce, or key material, it cannot live in the reducer zone — the adoption fails and must be pushed to an outer envelope.
**First experiment:** add `prevReceipt`/`receipt` fields to every event; add a selftest assertion that two independent replays of the same action sequence produce byte-identical receipt chains, and that mutating any event breaks every downstream receipt. Cost: ~2 assertions, no new dependency.

### R2. Refusal receipts for DENY and HOLD
**Adopt:** signed evidence of *refused* transitions binding refusal reason to the policy as evaluated at decision time — *Refusal Transparency* (draft-sabey-refusal-transparency-00).
**Strengthens:** receipts on negative claims. Today HELEN's compost/fog economics *derive* from denials but the denial's *reason* and the *policy version that produced it* are not recorded — a HAL regex change silently rewrites the meaning of every past denial.
**Replay impact:** positive; makes past verdicts self-describing.
**Falsifier:** the draft's replay-resistance uses nonce+timestamp; both are forbidden in the reducer. If reason-binding cannot be achieved without them, adopt only the policy-fingerprint half.
**First experiment:** record `policyFingerprint = h32(HAL_PATTERNS)` on every DENY/HOLD event; assert that changing a HAL pattern changes the fingerprint and that old events retain the old one.

### R3. Path-based verdict function replacing ad-hoc gate logic
**Adopt:** σ(execution_path) → {admit | hold | deny | escalate} over the ledger prefix — *Runtime Governance: Policies on Paths* (2603.16586); decision-point interception from *AgentGuard* (2509.23864).
**Strengthens:** typed authority ceilings; makes the gate a total function of history rather than of the current proposal string. Adds the missing `escalate` verdict, which is what HELEN's council convocation actually is but currently isn't typed as.
**Replay impact:** strongly positive — σ becomes a pure fold over the prefix, trivially replayable.
**Falsifier:** if σ over the ledger prefix ever disagrees with the live verdict on the same prefix, the gate has hidden state and the refactor has failed.
**First experiment:** implement `verdictOf(prefix, proposal)`; assert for the full selftest trajectory that replaying every prefix reproduces every historical verdict exactly.

### R4. Ceiling attenuation as a proved lattice property
**Adopt:** monotone narrowing along delegation chains with a compositional resource-scoping proof — *Authorization Propagation* (2605.05440); fixed-ceiling-with-earned-subtyping — *Earned Authority* (2607.23586); capability-set lattice — *KYA* (2605.25376).
**Strengthens:** typed authority ceilings, currently HELEN's weakest formal element (asserted, not proved).
**Replay impact:** none — it is a static property over the authority type.
**Falsifier:** search HELEN for any path where effective authority *widens*. Council escalation is the prime suspect: does convening a council grant the loop any capability the player did not already hold? If yes, the ceiling model is unsound as designed and this is a bug report, not an upgrade.
**First experiment:** enumerate every authority-bearing function, tag each with its capability set, assert `caps(callee) ⊆ caps(caller)` across the whole call graph.

### R5. Pre-flight static verification of the admission graph
**Adopt:** DAG static analysis of workflow graphs before execution — *Agentproof* (2603.20356); invariant minimality via witness construction — *Proof of Execution* (2607.05397, Thm 1).
**Strengthens:** human-only admission. Today "only `admitProposal` calls `evolveTerritory`" is enforced by 35 dynamic assertions walking one trajectory. A static reachability proof covers *all* trajectories.
**Replay impact:** none — it runs before execution and touches nothing.
**Falsifier:** the static checker accepts a graph the dynamic selftest rejects (or vice versa). Either divergence means one of the two is wrong and must be reconciled before the checker is trusted.
**First experiment:** parse the reducer zone, build the call graph, assert `evolveTerritory` has exactly one in-edge and it originates in `admitProposal` past the `ACCEPTABLE` branch. This is a ~40-line addition to `selftest.js` and is probably the highest value-per-line item on this list.

### R6. Bitemporal HOLD — assertion time vs valid time
**Adopt:** bitemporal operator algebra with causality-preserving contradiction resolution — *TOKI* (2606.06240); AGM contraction for retraction without history rewriting — Kumiho graph-memory (unverified source).
**Strengthens:** deterministic replay under revision. HELEN's held proposals are currently an undifferentiated fog with no answer to "this was held, then conditions changed, is it now admissible and *since when*?"
**Replay impact:** **this is the risky one.** Valid-time retroaction that alters derived state on replay is a direct invariant violation.
**Falsifier:** if introducing valid-time causes any replay of a fixed event sequence to produce a different final state, reject the adoption outright. That is the test, and it should be written before the feature.
**First experiment:** add `assertedAt` (= event index, not clock) and `validFrom` to HOLD events; replay a scripted hold-then-release trajectory twice and assert state equality.

### R7. Property-level evidence tiers on proposals
**Adopt:** evidence maturity graded per property (correctness, fairness, safety, traceability) with attestation requirements per tier — *DEMM* (2605.04093); measurement criteria from *DEMM-Bench* (2606.20634).
**Strengthens:** receipts-on-every-claim, by making "sufficient evidence" a *typed threshold* rather than a vibe. Natural coupling: higher authority tier requires higher evidence tier.
**Replay impact:** none — tiers are computed from proposal content.
**Falsifier:** if in practice every proposal lands in the same tier, the model adds ceremony without discrimination and should be dropped. Measure tier distribution before committing.
**First experiment:** classify existing proposal categories into none/raw/annotated/certified; assert that admission of a portal (council-triggering) proposal requires a strictly higher tier than an ordinary one.

### R8. Dual-signature witness on admission events
**Adopt:** receipts co-signed by (requesting party, enforcement service) so neither can unilaterally forge — *Notarized Agents* (2606.04193); hash-chained/Merkle summaries — *Agent Identity and Signed Provenance* (zylos, unverified).
**Strengthens:** witness independence — the invariant HELEN currently satisfies only by architecture (HAL cannot admit) and not by evidence (nothing proves HAL didn't).
**Replay impact:** neutral if signatures are over canonical event content only.
**Falsifier:** **this likely violates ZOL.** Real signatures need key material; key material needs custody; custody is a persistence surface. If ephemeral session-scoped keys are the only compatible form, the "witness" cannot outlive the session and the guarantee is much weaker than the paper's — say so plainly rather than implying otherwise.
**First experiment:** prototype with in-session ephemeral keys; explicitly document the reduced guarantee ("tamper-evident within a session, not across sessions") in the header receipt convention.

**Deliberately ranked below the cut:** PROV-DM export mapping (low risk, low urgency — do it when someone needs interop); MCPSHIELD tool-boundary formalism (relocates the gate, see §5); AgentSpec TLTL/SMT (heavy toolchain for a three-file no-build project).

---

## 4. KEY FORMALISMS EXTRACTED

Operators worth importing, with attribution. HELEN-side mapping given where the correspondence is exact.

**Governance function on paths** — *Runtime Governance* (2603.16586)
```
σ : ExecutionPath → {admit, hold, deny, escalate}
firable(t) ⟺ P(safe | path) ≥ τ_type    (τ typed per authority class)
```
HELEN: `checkProposalWithHAL` is σ restricted to {hold, deny, ¬admit}; `admit` is reserved to the human. The typed threshold τ is the ceiling.

**Deterministic state reconstruction** — *Replayable Agent Runtimes* / *The Log is the Agent* (2605.21997)
```
state = f(events),  f deterministic
S = fold(reduce, S₀, E)
```
HELEN: exactly `replayEvents()`. Claim nothing here.

**Replay determinism, conditional form** — *Proof of Execution* (2607.05397, Thm 3)
```
interpreter_determinism ∧ dependencies_declared ⟹ replay(trace) ≡ original
```
The conditional is load-bearing: HELEN satisfies the antecedent *structurally* via the REDUCER-BEGIN/END purity zone. That is the honest way to describe the marker discipline.

**Authority attenuation** — *Authorization Propagation* (2605.05440), *KYA* (2605.25376)
```
auth(delegate) ⊑ auth(principal)        (monotone narrowing, ⊑ over capability lattice)
scope(a ∘ b) = scope(a) ⊓ scope(b)
```

**Fixed ceiling under evolution** — *Earned Authority* (2607.23586)
```
∀t. earned(agent, t) ≤ ceiling(agent)   invariant under policy update
```

**Recomputable receipt** — *Vaara* (IETF draft)
```
receipt = (decision, evidence, [timestamp_anchors]);  Sig(receipt)
verify(receipt) ⟺ recompute(evidence) = decision      (no re-execution required)
idempotency_key ⇒ duplicate detection
```

**Dual-signature witness** — *Notarized Agents* (2606.04193)
```
valid(r) ⟺ Sig_requester(r) ∧ Sig_enforcer(r)
```
Neither party alone can mint. This is the formal content of "witness independence."

**Bitemporal assertion** — *TOKI* (2606.06240)
```
fact = (content, t_assert, t_valid)
resolve(f₁, f₂) preserves causality across both axes
```
HELEN adaptation: substitute event *index* for both clocks to stay deterministic.

**AGM belief change** — Kumiho graph memory (unverified)
```
K + φ   expansion
K − φ   contraction
K * φ   revision  (= (K − ¬φ) + φ, Levi identity)
```
The retraction question HELEN has not answered.

**PROV core** — W3C PROV-DM (2013)
```
(Entity, Activity, Agent)
wasGeneratedBy, wasAssociatedWith, wasDerivedFrom, wasAttributedTo
Bundle ⇒ scoped provenance-of-provenance
```
Bundles are the right model for "receipts about receipts."

**Temporal safety monitors** — *AgentSpec* (2503.18666), *AgentGuard* (2509.23864)
```
φ ∈ TLTL  →  SMT constraint at generation time
φ ∈ LTL   →  Büchi automaton, verdict emitted per decision step
```

**Evidence maturity ladder** — DEMM (2605.04093)
```
none → raw → annotated → certified,  assessed per property
∈ {correctness, fairness, safety, traceability}
```

**Governance placement taxonomy** — Lumenova/FedScoop 2026
```
HITL (per-instance human) | HOTL (human on the loop) | HIC (human in command)
deterministic systems ⇒ lower audit burden than probabilistic
```
HELEN is HITL at admission and must remain so; see §5.

**Forgery game** — PoE (2607.05397, Thm 2): receipt soundness stated as an adversary's advantage bound. HELEN has no threat model of this shape and should write one before using the word "receipt" in the cryptographic sense.

---

## 5. INCOMPATIBLES

What the sweep surfaced that HELEN must **not** adopt, with the invariant each would break.

**1. Constitutional AI's AI-feedback substitution (2212.08073).** CAI's core move is replacing human supervision with AI-generated preference labels under principle guidance. This is the direct negation of human-only admission. Adopt the *principles-constrain-proposals* half; never the *AI-feedback-suffices* half. HELEN's relationship to CAI is inversion, not extension — state it that way.

**2. Continuous automated guardrails replacing per-instance review (Effective GenAI Governance 2026; HOTL/HIC tiers).** The record itself proposes that automated guardrails "replace per-instance human review" to scale accountability. That is precisely the trade HELEN exists to refuse. Automated guardrails are admissible *before* the gate (to filter proposals) and inadmissible *at* it. If scaling pressure ever makes HOTL attractive, that is a decision to change the project's premise, not an upgrade.

**3. Nonce/timestamp replay-resistance inside the reducer (Refusal Transparency).** Wall clocks and nonces are non-deterministic by construction and forbidden between the REDUCER markers. Adopt reason-binding and policy fingerprints; leave anti-replay to an outer envelope that is not part of the state function.

**4. Durable memory substrates (Always-On Agents 2606.30306; MemGuard 2605.28009; Memanto 2604.22085; LTM security survey 2604.16548).** All six memory-systems items presuppose persistence. Under V0 ZOL law there is no store to protect. Import the *schemas* (typed memory attributes, causal attribution graphs, lifecycle stages) as ledger-event shapes; import no *store*. The CLAUDE.md guidance already states the correct discipline: in V0, localStorage stays fenced; in full goblin-warren law, tags enter through the replay door only.

**5. Self-evolving agent organizations (Forage V2, 2604.19837).** Collective knowledge evolution that mutates shared organizational state without a per-change human seal is the cleanest violation of human-only admission in the pool. It is tagged `new_opportunity` for multi-warren coordination; treat that tag as a hazard flag. Multi-warren alliance, if ever built, must route every cross-warren state change through the same admission gate — no "learned" shared state.

**6. The "autonomous" tier of the Always-On authority taxonomy (delegated / bounded / autonomous).** Delegated and bounded are compatible. Autonomous is off the table permanently, by definition of the project.

**7. Probabilistic compliance as a substitute for invariants (Agent Behavioral Contracts 2602.22302, Drift Bounds Theorem).** Statistical compliance bounds are a fine *supplement* and a catastrophic *replacement*. HELEN's assertions are exact ("`admitProposal` refuses unless verdict is ACCEPTABLE"); a drift bound would soften that to "usually." Adopt the governance-predicate *syntax*; reject the probabilistic *semantics* at the admission boundary.

**8. External trust registries and key custody (VCDM 2.0 revocation registry; KYA cryptographic provenance chains; Merkle anchoring).** Every one introduces a persistence surface, an external trust dependency, or both. Under ZOL these are unavailable. Note honestly that this caps HELEN's achievable witness independence *below* the literature's: without durable keys, tamper-evidence is session-scoped. Do not paper over the gap.

**9. Mixing capability and RBAC ontologies (2607.22611 decentralized granular RBAC vs 2603.00991 tracked capabilities).** Both solve the same problem with incompatible primitives — unforgeable tokens vs verifiable roles. Adopting both yields two authority models that will disagree at edges and make the ceiling unprovable. **Choose capabilities/effect types and stay there**, given HELEN's existing typed-effect direction.

**10. Supervisor agents with admission authority (Verified Multi-Agent Orchestration 2603.11445).** The paper grants supervisors veto *and* pass-through authority. HELEN may adopt only the downward half: a machine reviewer can block, never pass. The asymmetry is the point; a symmetric supervisor is a self-certifying gate.

**11. Relocating the gate to the tool boundary (MCPSHIELD 2604.05969).** The formalism is sound and the threat taxonomy is useful, but HELEN's admission boundary is the *proposal*, not the *tool call*. Enforcing at the tool boundary would let un-admitted state changes pass whenever they need no tool. Use MCPSHIELD as defence-in-depth below the gate, never as the gate.

**12. Self-published and vendor sources as citation-grade evidence** (kumiho.io, zylos.ai ×2, agenticrail.nz, and the two IETF individual drafts). Not incompatible in content — several are among the most directly useful items here — but incompatible with HELEN's receipt discipline if cited as though peer-reviewed. Cite as "practitioner report" / "unadopted individual draft," or resolve them first.

---

### Coverage gaps, stated plainly

- **world-models is empty of world models.** Zero learned-dynamics, simulation, or predictive-environment work. If HELEN vNext wants a world model, this sweep found nothing; re-run with different terms.
- **belief-revision is 2/6 on-topic.** AGM and bitemporal logic are represented by one unverified PDF and one arXiv entry. For a project that needs a principled retraction story, this is the thinnest critical field.
- **multi-agent-kernels is 1/6 on-topic** (only the Lean-4 item is a kernel).
- **constitutional-ai has almost no formal machinery** — five position/legal/analyst pieces and one debate sketch.
- **No economics or mechanism-design literature at all**, despite HELEN's compost/fog/weight economics being an incentive system with exploitable structure.
- **No human-factors work** on approval fatigue, which is the empirical failure mode of every human-only-admission system ever deployed and the most likely way HELEN fails in practice.
- **No adversarial evaluation of governance systems** beyond 2603.18894 — one corruption paper is not a threat model.