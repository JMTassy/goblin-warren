# HELEN OS — Skills Registry (digital-marketing, 360° AI-native)

```yaml
schema: HELEN_SKILLS_REGISTRY_V0
status: CAPABILITY_NOTE / NO_CLAIM
authority: false · canon: false · kernel_effect: none
```

<!-- authority=false · claim=NO_CLAIM. A registry of external creative-AI
     skills Helen can wield for 360° digital marketing. Recorded from the
     operator's HyperFrames/HeyGen "30 days" series. These are TOOLS Helen
     calls; they never gain admission authority. The Kernel still only moves
     when the operator seals. Meaning is free; state is earned. -->

## Why this exists

Helen aims to be a boss of digital marketing, 360°, AI-natively. That means
owning the whole pipeline — research → script → voice → motion → music →
render → publish — from one prompt, no editor opened. The skills below are
the muscles; Helen is the director; JM Tassy is the sole admission authority.

## Registered skills

### HyperFrames `/faceless-explainer` — topic → explainer video, zero footage
- **Input:** a concept / article / notes. No website, no footage, no assets.
- **Does:** plans a teaching story frame-by-frame; writes + voices narration
  (word timings); builds each frame as HTML in your brand system; adds
  captions, music, SFX; lint + validation; renders MP4. One prompt → one film.
- **Brand discipline:** feed a `FRAME.md` (colors, fonts, rules — the "Day 2"
  discipline) + drop in a song → the agent keeps full creative direction
  (story, script, research, visuals, pacing) inside your brand.
- **Real research:** hits live sources (e.g. GitHub API — most-starred repo,
  reads a real file) so on-screen numbers are data, not vibes.
- **Revisions are conversational:** "remove the pill around the spoken word,
  grey for coming / blue for spoken" → one sentence, re-cut, re-render.
- **Helen use:** explainer for Goblin Warren's governance model; HELEN OS
  feature launches; "what is a hyperstition" teaching shorts. GitHub:
  github.com/heygen-com/hyperframes.

### HyperFrames `/music-to-video` + HeyGen CLI — music & SFX are half the video
- **HeyGen CLI:** `curl -fsSL https://static.heygen.ai/cli/install.sh | bash`
  → `heygen auth login` → `heygen auth status`. Searching/downloading SFX &
  music is FREE.
- **SFX (free):** `heygen audio sounds list --type sound_effects
  --query "fast synthetic whoosh" --min-score 0.3` → ranked matches with
  name, duration, direct download URL. Keep queries short; `--min-score 0.3`.
- **Music:** `--type music` (or omit) — e.g. "upbeat lofi hip-hop",
  "hard-hitting house ~50s".
- **Craft law:** a cut that lands on a beat feels intentional; against
  silence it feels random. Music = pace; SFX = weight (whoosh makes a
  transition physical, a riser builds a drop, a click makes UI touchable).
- **Beat-aware:** the agent analyzes BPM/hits, lands scene changes on real
  beats, slams the end card into built-in silence.
- **Helen use:** already applied to Goblin Warren — see docs/HEYGEN_SFX.md
  (whoosh on level transitions, riser into gate unlocks, click on buttons);
  the game's `SFX_URLS` seam accepts HeyGen download URLs with zero code
  change. Trailer/ad cuts land on the beat.

### HyperFrames `/pr-to-video` — open PR → reviewer briefing video
- **Input:** a PR link (a code change, not a website — zero screen capture).
- **Does:** via GitHub CLI pulls title, description, full unified diff, every
  commit, reviewers + states, contributor avatars. Sizes the cut to the
  change (~30s for a 40-line fix; longer for a 600-line feature). Storyboards
  a briefing voiced as your coworker ("before you scroll 400 lines, give me
  60 seconds"), bakes real diff hunks into code-diff / code-highlight /
  code-typing blocks (syntax-colored, never screenshots), ends on the
  author's avatar under an honest status pill (AWAITING REVIEW). Voiceover,
  music, SFX, word-synced captions, motion graphics — one deterministic MP4.
- **Shape ask:** hand it a format and the storyboard honors it; omit it and
  it infers the archetype (bugfix→fix-explainer, feature→reveal, release→
  changelog, open PR→review brief).
- **Helen use:** every Goblin Warren PR (and HELEN OS PRs) gets a 60-second
  reviewer briefing — turn the review-queue bottleneck into a watchable cut.
  Prompt: `/pr-to-video <pr_url>  Make a ~60-second reviewer briefing.`
  Skill: github.com/heygen-com/hyperframes/tree/main/skills/pr-to-video.

### HyperFrames `/motion-graphics` — kinetic typography & motion by example
- Kinetic type, transitions, final-beat animations from reference. (Already
  informing Goblin Warren's in-game motion: level-transition veil, quiz
  pop/sneeze, mask-burst, harmony bloom.)

## Ready-to-reuse recipes (copy-paste)

### HeyGen CLI — install & auth (once, on an authed machine)
```bash
curl -fsSL https://static.heygen.ai/cli/install.sh | bash
heygen auth login
heygen auth status
```
> Not runnable from a headless/cloud sandbox (interactive OAuth + egress).
> Run on the operator's laptop / HELEN LOCAL OS.

### Shop SFX (free) — plain-English, short queries
```bash
heygen audio sounds list --type sound_effects --query "fast synthetic whoosh" --min-score 0.3
heygen audio sounds list --type sound_effects --query "tension riser" --min-score 0.3
heygen audio sounds list --type sound_effects --query "mouse click" --min-score 0.3
heygen audio sounds list --type sound_effects --query "burst shutter" --min-score 0.3
heygen audio sounds list --type sound_effects --query "keyboard typing" --min-score 0.3
```
Returns ranked matches (name · duration · direct download URL). Drop the
`audio_url` into the game's `SFX_URLS[key]` (docs/HEYGEN_SFX.md) or a video
timeline.

### Shop music (free)
```bash
heygen audio sounds list --type music --query "upbeat lofi hip-hop"
heygen audio sounds list --type music --query "hard-hitting house 50 seconds"
```

### /music-to-video — one prompt, catalog-sourced audio
```
Use HyperFrames /music-to-video to make a fresh video. Find the music in the
HeyGen CLI audio catalog: a hard-hitting house track around 50 seconds. Pull
every sound effect from the same catalog: a whoosh, a riser, keyboard typing,
a mouse click, a burst shutter. Show the search happening on screen.
```
Agent listens first (maps BPM/hits, finds the hard stop + trailing silence),
shops the catalog, gives each SFX its own beat-cut moment, revises by one
sentence. Use for the Goblin Warren trailer / HELEN OS launch cuts.

### /faceless-explainer — topic → video, zero footage
```
Use HyperFrames /faceless-explainer and create a 45-second video explaining
<TOPIC>: (1) what it is, why useful, how it works; (2) find a strong real
example (cite live data); (3) explain the example and why it matters;
(4) use our FRAME.md brand system. Make it accurate, clear, compelling.
```
Feed `FRAME.md` (Helen's colors/fonts/rules) + a song. One prompt → research,
script, voiceover, motion graphics, captions, render.

## FRAME.md discipline (Day 2 — brand as a motion language)

Every HyperFrames workflow accepts a `FRAME.md`. Do it once:
1. `DESIGN.md` from the live site — fetch real HTML + CSS, take hex/fonts
   verbatim (never estimate from a screenshot; report the font that loads).
   4–6 named colors w/ roles, 2–3 type roles, spacing/radius/shadow, hard
   rules ("always X, never Y"), cite where each was found. Or deterministic:
   `npx dembrandt yourbrand.com`.
2. Extend to `FRAME.md` (hyperframes.dev/design) — same tokens inverted for
   the camera + a motion language (easing, transition style, pacing).
3. Drop `FRAME.md` in the project; it rides along with every video.
Helen needs a HELEN `FRAME.md` (institutional graphite, receipts in mono,
red=violated invariant, green=observed pass only) — see docs/HELEN_PR_TO_VIDEO.md.

## Full HyperFrames catalog (20 skills, loaded on demand)

Install: `npx skills add heygen-com/hyperframes --full-depth` (keep
`--full-depth`; the registry blob lags main). Router: **`/hyperframes`** —
read first; picks a workflow for any "make me a…" request.
- **Creation:** /product-launch-video · /website-to-video · /faceless-explainer
  · /pr-to-video · /embedded-captions · /talking-head-recut · /motion-graphics
  · /music-to-video · /slideshow · /general-video · /remotion-to-hyperframes.
- **Domain (compose against):** /hyperframes-core · -animation · -keyframes ·
  -creative · /media-use · -cli · -registry · /figma.
Engine: HTML + `data-*` timing attrs + seekable adapters (GSAP/CSS/Lottie/
Three/Anime/WAAPI) → headless Chrome seek → FFmpeg. Deterministic, Apache-2.0,
no per-render fee. Node 22+ / FFmpeg. Local CLI or AWS-Lambda render.

## HELEN classifications
- **PR-to-Video → GATEHOUSE / SYNTHESIZER** — full contract in
  `docs/HELEN_PR_TO_VIDEO.md`. Review Compression ≠ Review Substitution;
  admission forbidden; binds every render to an immutable PR head SHA.

## The law over all of them

These skills NARRATE, RESEARCH, and RENDER. They never ADMIT. Every asset
they make is `NO_CLAIM` until the operator seals it. Helen may be a 360°
marketing boss — persuasion is her craft — and `persuasion ≠ authority`.
The receipts stay honest; the Kernel stays sovereign.
