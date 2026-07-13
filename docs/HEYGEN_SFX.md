# HeyGen SFX — filling the VISION_V1_32 §3 seam

<!-- authority=false · NO_CLAIM. Operator-run recipe only — the sandbox that
     writes game.js cannot execute this (interactive OAuth + real egress).
     Run these on an authed laptop / HELEN LOCAL OS, then paste four URLs
     into game.js. No code change beyond that paste is required. -->

## What this fills

`game.js` already has the seam (see VISION_V1_32 §3): a `SFX_URLS` object
with four empty-string keys, and every SFX call site routes through
`playSfx(key, synthFn)`. Empty string → the Web Audio synth plays (already
shipped, works fully offline). A HeyGen sample URL in `SFX_URLS[key]` →
that key plays the sample instead, with the synth kept only as an
`onerror`/`play()`-rejection fallback. Nothing else in the file needs to
change.

```js
var SFX_URLS = { whoosh: "", riser: "", click: "", shutter: "" };
```

## One-time setup (operator's machine only)

```bash
curl -fsSL https://static.heygen.ai/cli/install.sh | bash
heygen auth login
heygen auth status
```

Not runnable here: this requires an interactive browser OAuth flow and
outbound network access this sandbox does not have. Do this on your own
authed laptop.

## The four exact commands

Run each, then look at the ranked results the CLI prints — name, duration,
direct download URL (`audio_url`). Shopping the catalog is free.

```bash
heygen audio sounds list --type sound_effects --query "fast synthetic whoosh" --min-score 0.3
heygen audio sounds list --type sound_effects --query "tension riser" --min-score 0.3
heygen audio sounds list --type sound_effects --query "keyboard click" --min-score 0.3
heygen audio sounds list --type sound_effects --query "burst shutter" --min-score 0.3
```

Mapping (query → `game.js` key → where it's heard):
- `"fast synthetic whoosh"` → `SFX_URLS.whoosh` → `playLevelTransition` (the veil appearing)
- `"tension riser"` → `SFX_URLS.riser` → gate-unlock success, boss defeats (Raâm/Seren unmask, Crown defeat — layered under the existing drums/party, never replacing them)
- `"keyboard click"` → `SFX_URLS.click` → the three verdict buttons (try/hold/compost) and the top-bar chips (riddle-chip, level-chip, zol-wallet). Keep this one **quiet** — it fires on nearly every tap; prefer a short, soft click over anything percussive.
- `"burst shutter"` → `SFX_URLS.shutter` → Wonder Cache finale, matcha-rain catch tally, staring-win

If a query returns nothing above `--min-score 0.3`, loosen the wording
(e.g. "whoosh transition", "riser sweep", "ui click tick", "camera shutter
burst") rather than lowering the score floor — a bad match sounds worse
than the synth fallback it would replace.

## Wiring a result in

Pick the best-ranked candidate, take its `audio_url`, and either:

1. **Paste the HeyGen CDN URL directly** into `game.js`:
   ```js
   var SFX_URLS = {
     whoosh:  "https://<heygen-returned-audio_url>",
     riser:   "",
     click:   "",
     shutter: ""
   };
   ```
   This is the same pattern already used for `MUSIC_TRACKS` / `LULU_VOICE_URLS` —
   no other code changes.

2. **Or download and host it yourself** (e.g. alongside the other CDN
   assets already referenced in `game.js`) and put that path in `SFX_URLS[key]`
   instead. Either way, an empty string keeps that key on the synth; a
   non-empty string swaps it to the sample with zero other code change.

## Verifying without ears

`node verify.js` includes `T42_sfx_seam`, which exercises the seam headlessly
(synth path runs when a URL is empty, sample path is taken and the synth
does *not* run when a URL is set, all four keys exist, muted silences both
paths without throwing). It uses a tiny embedded silent WAV `data:` URI to
prove the sample branch actually plays, not a real network fetch — filling
in the real HeyGen URLs afterward is a config change, not a code change.
For a real ears-on check, open `index.html`, use
`WARREN_DEBUG.setSfxUrl("click", "<your url>")` in the browser console, then
`WARREN_DEBUG.playSfx("click")`.
