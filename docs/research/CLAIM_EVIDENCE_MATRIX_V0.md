# Goblin Warren — Claim/Evidence Matrix V0

**Branch:** `autoresearch/three-levels-article-v0`  
**Status:** Initial autoresearch artifact  
**Authority:** `false`  
**Canon:** `false`

| ID | Claim | Type | Evidence state | Evidence | Allowed wording | Forbidden wording |
|---|---|---|---|---|---|---|
| C01 | The current repository contains a browser-playable Goblin Warren prototype. | IMPLEMENTATION_CLAIM | SUPPORTED | `index.html`; README play instructions | “The repository contains a browser prototype.” | “The new three-level slice is complete.” |
| C02 | Current gameplay separates pure reducer logic from Three.js/DOM rendering. | ARCHITECTURE_CLAIM | SUPPORTED | `REDUCER-BEGIN/END` markers; README | “The current V0 isolates reducer logic for headless testing.” | “All future mechanics are already pure.” |
| C03 | Current V0 uses player admission as the final gate for proposal mutation. | IMPLEMENTATION_CLAIM | SUPPORTED | `admitProposal`, HAL verdict logic, README | “Current V0 requires an acceptable verdict and player admission.” | “No code path can ever bypass admission.” |
| C04 | Current V0 includes quiz/riddle mechanics and bounded rewards. | IMPLEMENTATION_CLAIM | SUPPORTED | `QUESTIONS`, `answerQuestion`, UI QCM | “The current prototype contains multiple-choice riddles.” | “The new diegetic quizzes are implemented.” |
| C05 | A three-scale progression can connect AI Pet, AI Village and Superteam learning goals. | ARCHITECTURE_CLAIM | SUPPORTED | Formal design specification; related work | “We propose a three-scale architecture.” | “The architecture has been empirically validated.” |
| C06 | The three-level slice operationalizes bounded agency through fire, sky discrimination and matcha. | DESIGN_HYPOTHESIS | SUPPORTED | Level design specification | “The slice is designed to operationalize...” | “Players learned bounded agency from the slice.” |
| C07 | Attachment-first sequencing improves learning or retention. | EMPIRICAL_CLAIM | UNKNOWN | No user study | “We hypothesize attachment may increase interpretive attention.” | “Attachment improves retention.” |
| C08 | Macro-slow, micro-active pacing reduces overload without boredom. | EMPIRICAL_CLAIM | UNKNOWN | Cognitive-load rationale; no test data | “The design aims to reduce overload while preserving activity.” | “The pacing is proven optimal.” |
| C09 | Multi-cue false-gem discrimination transfers to critical AI judgement. | EMPIRICAL_CLAIM | UNKNOWN | Design analogy only | “Future studies should test transfer.” | “The mechanic teaches verification.” |
| C10 | The three-level slice is implemented and playable end-to-end. | IMPLEMENTATION_CLAIM | UNKNOWN | No build receipt on branch | “Implementation is the next execution bead.” | “Three complete levels were delivered.” |
| C11 | Sky phrases eliminate double scheduling. | IMPLEMENTATION_CLAIM | UNKNOWN | Architecture report only; code not witnessed | “The proposed scheduler has a single-owner invariant.” | “Double scheduling has been fixed.” |
| C12 | Rain audio remains active until the final in-flight object resolves. | IMPLEMENTATION_CLAIM | UNKNOWN | Proposed reference-set design | “The audio design uses active-drop references.” | “The audio bug is fixed.” |
| C13 | Matcha sector recognition is stable at 30/60/120 Hz. | IMPLEMENTATION_CLAIM | UNKNOWN | Proposed tests only | “Frame-rate stability is a required test.” | “The recognizer is frame-rate independent.” |
| C14 | The fire sequence has a valid ordered state machine. | ARCHITECTURE_CLAIM | SUPPORTED | Formal level specification | “The proposed fire state machine is ordered.” | “The implemented game enforces it.” |
| C15 | The article is an empirical learning study. | EMPIRICAL_CLAIM | REFUTED | No participants or outcome data | “This is a design-and-systems position paper.” | “This study demonstrates learning gains.” |

## Readiness Gate

```text
Claim support coverage: PARTIAL
Citation completeness: PASS FOR CURRENT DRAFT
Unsupported empirical claims: 0 IN ARTICLE BODY
Fabricated citations: 0 FOUND
Build-backed three-level claims: 0
Adversarial reviews: 0/2
Disposition: REVIEWABLE_DRAFT
```

## Required next evidence

1. Build receipt for Level 0 fire loop.
2. Build receipt for Level 1 sky phrases and false gem.
3. Build receipt for Level 2 matcha loop.
4. End-to-end playthrough trace.
5. Timing and reset test results.
6. Two independent adversarial article reviews.
7. Citation audit against final prose.
