# HELEN_PR_TO_VIDEO_V0 — the visual Gatehouse

```yaml
skill_id: HELEN_PR_TO_VIDEO_V0
organ: GATEHOUSE
category: SYNTHESIZER
authority: false
canon: false
ledger_effect: none
admission: forbidden
```

<!-- authority=false · claim=NO_CLAIM. Recorded verbatim-in-spirit from the
     operator's classification. PR-to-Video is a review-COMPRESSION interface,
     not code review and not review substitution. It reduces the reviewer's
     reconstruction cost; it never moves the admission membrane. -->

## The distinction

```
PR-to-Video ≠ code review
PR-to-Video = review-compression interface
Review Compression ≠ Review Substitution
```

HELEN protects `proposal → evidence → review → admission`. Review can still
become a human bottleneck when evidence is technically available yet
cognitively expensive to absorb. PR-to-Video inserts a compression layer:

```
PR diff --extract--> typed change model --storyboard--> visual review brief
        --> human reviewer --> review decision
```

It does not alter the admission membrane. Cognition and presentation may
propose; sovereign mutation stays bound to receipts, deterministic
adjudication, and replay. (Same discipline as the Riemann work: finite
computational objects and diagnostic summaries stay distinct from claims
about the full continuum.)

## Contract

```yaml
input:  [github_pr_url, immutable_head_sha]
output: [reviewer_briefing_mp4, narration_script, source_manifest, claims_map]
forbidden_claims: ["safe to merge","tests passed","review complete","verified","approved"]
required_footer:  ["VISUAL BRIEF ONLY","SOURCE PR HEAD: <sha>","REVIEW STILL REQUIRED"]
```

## The five questions every brief must answer

1. What changed? 2. Why? 3. Which invariant is affected? 4. What evidence
exists? 5. Where should the reviewer attack?

Final scene never says "ready to merge." It says:
```
AWAITING HUMAN REVIEW
Highest-risk seam: <one concrete seam>
Evidence available: <tests / diff / receipt references>
Not established:    <safety, correctness, admission>
```

## Staleness safeguard (immutable-revision binding)

```
V = F(repository, PR number, head SHA, manifest)
current SHA ≠ video SHA  ⟹  STALE BRIEF
```
The video must visibly go stale rather than silently represent an obsolete diff.

## PR_REVIEW_PACKET_V1 (the extractor output)

```yaml
schema: PR_REVIEW_PACKET_V1
repository: string · pr_number: int · head_sha: string · base_sha: string
files_changed: [] · diff_hunks_used: [] · commits: [] · test_receipts: []
review_state: string · unsupported_claims: [] · highest_risk_seam: string
authority: false · ledger_effect: none
```

Slice: `GitHub PR → PR evidence extractor → PR_REVIEW_PACKET_V1 →
HyperFrames /pr-to-video → MP4 + source manifest → human reviewer`.

## Exact prompt (HELEN reviewer briefing)

```
/pr-to-video <PR_URL>
Create a 60-second HELEN reviewer briefing.
PURPOSE Compress the change for human review. Do not approve, certify, or
recommend merging.
SOURCE LOCK Read title, description, commits, full unified diff, review state,
test evidence, and exact PR head SHA.
STORY 1 REVIEW HOOK ("here is the invariant it is supposed to protect")
2 PREVIOUS FAILURE (real old-code path, one-sentence failure)
3 PATCH MODEL (data flow before/after) 4 CORE INVARIANT (as an equation)
5 REAL CODE (2–4 decisive hunks, code-diff/code-highlight)
6 EVIDENCE (exact commands + reported results ONLY when present; never infer
missing tests) 7 ADVERSARIAL REVIEW (highest-risk seam · one counterexample
to attempt · files needing close inspection) 8 HANDOFF (author avatar +
AWAITING HUMAN REVIEW)
LABELS VISUAL BRIEF ONLY · PR HEAD: <sha> · REVIEW STILL REQUIRED
FORBIDDEN safe to merge · approved · certified · verified · production ready · all good
STYLE Institutional HELEN. Graphite bg. Receipts in monospace. Red for
removed/violated invariants. Green ONLY for observed passing checks, never for
admission. Real code only. No simulated terminal. No fake tests.
```

## First target (recommended)

A bounded, already-tested HELEN PR with a visual invariant — e.g. the
consumption organ (triage=eye · operator_pen=hand · outbox_guard=pressure
gauge): `triage receipt ⊬ consumption` and `operator mark ⟹ consumption
count decreases`. The brief animates BEFORE (guard counts every packet,
operator marks inert) → PATCH (guard reads effective pen decisions) → AFTER
(triage leaves count unchanged, operator_pen lowers it, broken log fails
closed).

## The seal

> HyperFrames becomes HELEN's visual Gatehouse: it tells the reviewer where
> to look, while the reviewer, tests, receipts, and reducer keep their
> distinct roles. Review Compression ≠ Review Substitution. `persuasion ≠
> authority`. 👑🚫
