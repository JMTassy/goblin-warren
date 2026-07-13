# VISION v1.32 — "SFX Make Moments Land" (CEO: Fable · Executor: Sonnet 5)

<!-- authority=false · NO_CLAIM. Source: operator's HeyGen-CLI / HyperFrames
     Day 8 brief — "music and SFX are half the video." The game already has a
     music bed (MUSIC_TRACKS/NATURE_LOOP/BIRD_CLIP). The gap is PUNCH: whoosh
     on transitions, riser into drops, click on the interface. Deliver synth
     now; leave a seam so HeyGen-catalog samples slot in with zero code change
     (same pattern as MUSIC_TRACKS and LULU_VOICE_URLS). No credits, no egress. -->

## 1. Four synth SFX (Web Audio, add to the Sound object)

Reuse existing `tone`/`drumHit`/`noiseBurst`/`ensureAudio`; all respect
`S.settings.muted` already via tone/noiseBurst guards.
- `Sound.whoosh()` — bandpass noise sweep, center 400→3000Hz over ~0.35s,
  quick in/out. "A whoosh makes a transition physical."
- `Sound.riser()` — ~1.2s rising: a sine glide 200→900Hz + noise build
  swelling in gain, ending on a soft cymbal-ish noise burst. Tension → drop.
- `Sound.uiClick()` — 12ms tick (square 1800Hz, tiny gain) + 6ms noise.
  Makes buttons feel touchable. Keep it QUIET (gain ≤0.06) — it fires often.
- `Sound.shutter()` — 3 fast noise bursts (burst-shutter feel) for finales.

## 2. Bind SFX to moments (the article's core: land on the beat)

- `playLevelTransition` (veil appears): `Sound.whoosh()`.
- Gate unlock success (`tryUnlockLevel`, after deduct, before transition):
  `Sound.riser()`.
- Boss defeat (Raâm/Seren unmask, Crown defeat): `Sound.riser()` under the
  existing party/drums (layer, don't replace).
- Wonder Cache finale + it's-raining-matcha catch tally + staring-win coin
  rain: `Sound.shutter()`.
- The three verdict/proposal buttons (btn-try/hold/compost) and the top-bar
  chips (riddle-chip, level-chip, zol-wallet): `Sound.uiClick()` on tap.
  (Add to existing handlers; do not duplicate handlers.)

## 3. The HeyGen seam (samples override synth when present)

`var SFX_URLS = { whoosh:"", riser:"", click:"", shutter:"" };` (top of UI
zone, near MUSIC_TRACKS). `function playSfx(key, synthFn)`: if
`SFX_URLS[key]` non-empty → play a pooled `Audio` (small pool of ~3 so rapid
clicks overlap), volume 0.5, skip if muted, `onerror`→ synthFn(); else run
synthFn(). Route every §2 call through `playSfx("whoosh", Sound.whoosh)`
etc. so dropping a HeyGen download URL into SFX_URLS swaps synth→sample with
no other change. Document the fetch recipe in docs/HEYGEN_SFX.md (commands +
where the URLs go).

## 4. Gates

T42: `playSfx("click", fn)` with empty URL runs the synth fn (spy flag) and
never throws; with `SFX_URLS.click` set via a debug hook it does NOT run the
synth fn (sample path taken); all four keys exist; muted → neither path makes
noise but never throws. Expose `WARREN_DEBUG.setSfxUrl(key,url)` +
`WARREN_DEBUG.playSfx(key)`. Keep all 42 gates green.

*Music gives pace; SFX give weight. The moments were already there — make
them land.* — Fable
