// src/audio/sfx.js
//
// Owned by P3 (VISION_V2.md §9/§11, docs/INTERFACES.md §4). WebAudio
// synthesis only -- oscillators + gain envelopes, one shared noise buffer,
// no audio files. `SFX_CUES` (src/audio/registry.js, frozen by P0) is the
// complete list of cues this file must define an envelope for; cut per
// MAYOR_RULING_V2.md Amendment 1: no plink, chime_gold or wriggle.
//
// Not a "PURE" dir (see test/core/purity.test.js's PURE_DIRS): this file
// is free to touch `window`/`AudioContext`/`Math.random`, unlike
// src/core and src/art. It still has to behave in Node (vitest runs with
// no `window`), so nothing at module scope touches the DOM or the audio
// API -- the AudioContext and the noise buffer are both built lazily, on
// first real use, and every entry point that could throw is wrapped so a
// missing/blocked WebAudio implementation degrades to silence, never an
// exception.
//
// --- The envelope data table -------------------------------------------
//
// Each cue is one or more "layers" (a tone or a noise burst) with a
// standard attack/hold/release gain shape:
//
//   gain: 0 --(attack ms)--> peak --(hold ms)--> peak --(release ms)--> ~0
//
// `layer.start` is an offset in ms from the cue's t=0, so a cue can chain
// short notes (see `sprout`, `hop`) without a second call to `play()`.
// `durationOf()` / `peakGainOf()` are pure functions over this table (no
// AudioContext needed), which is what makes it testable in Node --
// test/core/envelopes.test.js imports only these.

/**
 * @typedef {Object} SfxLayer
 * @property {'tone'|'noise'} type
 * @property {'sine'|'triangle'|'square'|'sawtooth'} [wave] - tone only.
 * @property {number} [freqStart] - Hz, tone only.
 * @property {number} [freqEnd] - Hz, tone only; defaults to freqStart (no pitch bend).
 * @property {'lowpass'|'highpass'|'bandpass'} [filterType] - noise only, optional.
 * @property {number} [filterFreq] - Hz, noise only; omit for unfiltered noise.
 * @property {number} start - ms offset from the cue's start.
 * @property {number} attack - ms to ramp 0 -> peak.
 * @property {number} [hold] - ms held at peak. Default 0.
 * @property {number} release - ms to ramp peak -> ~0.
 * @property {number} peak - peak gain, 0..1.
 *
 * @typedef {Object} SfxEnvelope
 * @property {SfxLayer[]} layers
 */

/** @type {Object.<string, SfxEnvelope>} */
export const ENVELOPES = Object.freeze({
  // a find appears above Lulu's head: a bright, quick upward chirp
  pop: {
    layers: [
      { type: 'tone', wave: 'sine', freqStart: 500, freqEnd: 950, start: 0, attack: 8, hold: 10, release: 55, peak: 0.32 },
    ],
  },

  // picked up / drag starts: a soft rising swoosh, no attack transient
  lift: {
    layers: [
      { type: 'tone', wave: 'triangle', freqStart: 260, freqEnd: 420, start: 0, attack: 10, hold: 5, release: 65, peak: 0.22 },
    ],
  },

  // hover over a legal tile: a tiny, bright, unobtrusive blip (this can
  // repeat a lot while dragging, so it is the quietest cue)
  tile_ok: {
    layers: [
      { type: 'tone', wave: 'sine', freqStart: 880, freqEnd: 880, start: 0, attack: 3, hold: 8, release: 25, peak: 0.18 },
    ],
  },

  // hover over an illegal tile: a soft two-note "mm-mm" head-shake, still
  // gentle -- the lantern's "no" is a fact, not a scold
  tile_no: {
    layers: [
      { type: 'tone', wave: 'triangle', freqStart: 300, freqEnd: 300, start: 0, attack: 3, hold: 12, release: 20, peak: 0.2 },
      { type: 'tone', wave: 'triangle', freqStart: 220, freqEnd: 220, start: 45, attack: 3, hold: 12, release: 20, peak: 0.2 },
    ],
  },

  // the find lands on a tile: a low, soft thump (tone) plus a brief
  // filtered-noise transient for physicality
  thunk: {
    layers: [
      { type: 'tone', wave: 'sine', freqStart: 95, freqEnd: 70, start: 0, attack: 2, hold: 8, release: 70, peak: 0.35 },
      { type: 'noise', filterType: 'lowpass', filterFreq: 400, start: 0, attack: 1, hold: 4, release: 35, peak: 0.15 },
    ],
  },

  // a plant appears: a cheerful three-note rising arpeggio with a small
  // shimmer grace-note overshoot at the top, echoing juice.pop()'s
  // overshoot-then-settle motion
  sprout: {
    layers: [
      { type: 'tone', wave: 'sine', freqStart: 440, freqEnd: 440, start: 0, attack: 5, hold: 15, release: 20, peak: 0.28 },
      { type: 'tone', wave: 'sine', freqStart: 550, freqEnd: 550, start: 50, attack: 5, hold: 15, release: 20, peak: 0.28 },
      { type: 'tone', wave: 'sine', freqStart: 660, freqEnd: 660, start: 100, attack: 5, hold: 15, release: 20, peak: 0.3 },
      { type: 'tone', wave: 'sine', freqStart: 880, freqEnd: 880, start: 140, attack: 3, hold: 5, release: 45, peak: 0.22 },
    ],
  },

  // dropped in the compost: a playful downward "boop" with a little
  // noisy pop, never harsh -- "not this one" is a shrug, not a buzzer
  burp: {
    layers: [
      { type: 'tone', wave: 'triangle', freqStart: 320, freqEnd: 150, start: 0, attack: 5, hold: 8, release: 55, peak: 0.28 },
      { type: 'noise', filterType: 'bandpass', filterFreq: 600, start: 0, attack: 2, hold: 4, release: 18, peak: 0.14 },
    ],
  },

  // Lulu falls asleep: a slow, breathy noise swell under a low hum --
  // the longest cue, but still gentle
  snore: {
    layers: [
      { type: 'noise', filterType: 'lowpass', filterFreq: 250, start: 0, attack: 70, hold: 130, release: 140, peak: 0.12 },
      { type: 'tone', wave: 'sine', freqStart: 85, freqEnd: 75, start: 15, attack: 90, hold: 120, release: 110, peak: 0.16 },
    ],
  },

  // petted: a warm, soft rumble -- filtered noise plus a low sine, no
  // sharp edges anywhere in the envelope
  purr: {
    layers: [
      { type: 'noise', filterType: 'lowpass', filterFreq: 180, start: 0, attack: 55, hold: 130, release: 95, peak: 0.1 },
      { type: 'tone', wave: 'sine', freqStart: 105, freqEnd: 115, start: 10, attack: 45, hold: 140, release: 80, peak: 0.14 },
    ],
  },

  // Lulu's reaction (also 'bighop' -- juice.hop()'s height controls the
  // size, this cue stays the same): a bouncy blip with a tiny overshoot
  // grace-note, matching the motion's overshoot feel
  hop: {
    layers: [
      { type: 'tone', wave: 'sine', freqStart: 500, freqEnd: 700, start: 0, attack: 5, hold: 5, release: 45, peak: 0.3 },
      { type: 'tone', wave: 'sine', freqStart: 850, freqEnd: 850, start: 50, attack: 3, hold: 0, release: 22, peak: 0.22 },
    ],
  },
});

/** Last ms offset this layer's envelope touches (start+attack+hold+release). */
export function layerEnd(layer) {
  return layer.start + layer.attack + (layer.hold || 0) + layer.release;
}

/** Total duration of a cue's envelope, in ms -- the latest layerEnd() of any of its layers. */
export function durationOf(envelope) {
  return Math.max(...envelope.layers.map(layerEnd));
}

/** The loudest any layer in this envelope gets, 0..1. */
export function peakGainOf(envelope) {
  return Math.max(...envelope.layers.map((l) => l.peak));
}

// --- WebAudio engine -----------------------------------------------------
//
// Everything below only runs when actually invoked (play/unlock), never at
// module load, so importing this file is safe with no `window` (Node/vitest).

let _ctx = null;
let _noiseBuffer = null;
let _muted = false;

/** Lazily create (once) and return the shared AudioContext, or null if unavailable. */
function getContext() {
  if (_ctx) return _ctx;
  try {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _ctx = new AC();
    return _ctx;
  } catch {
    return null;
  }
}

/** Lazily build (once) the single shared white-noise buffer used by every noise layer. */
function getNoiseBuffer(ctx) {
  if (_noiseBuffer) return _noiseBuffer;
  const length = Math.max(1, Math.floor(ctx.sampleRate * 1)); // 1s, looped as needed
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  _noiseBuffer = buffer;
  return _noiseBuffer;
}

/**
 * Unlock the AudioContext on the first user touch (iOS rule: audio can only
 * start/resume from inside a user-gesture handler). Safe to call more than
 * once; safe to call with no WebAudio support; never throws.
 */
export function unlock() {
  try {
    const ctx = getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch {
    // never throw
  }
}

/** Set/clear the module-level mute flag used by play() when no per-call `mute` is given. */
export function setMuted(value) {
  _muted = !!value;
}

export function isMuted() {
  return _muted;
}

function scheduleLayer(ctx, master, layer, now) {
  const t0 = now + layer.start / 1000;
  const tAttackEnd = t0 + layer.attack / 1000;
  const tHoldEnd = tAttackEnd + (layer.hold || 0) / 1000;
  const tRelease = tHoldEnd + layer.release / 1000;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, t0);
  gainNode.gain.linearRampToValueAtTime(layer.peak, tAttackEnd);
  gainNode.gain.setValueAtTime(layer.peak, tHoldEnd);
  gainNode.gain.linearRampToValueAtTime(0.0001, tRelease);
  gainNode.connect(master);

  let source;
  if (layer.type === 'noise') {
    source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    source.loop = true;
    if (layer.filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = layer.filterType || 'lowpass';
      filter.frequency.value = layer.filterFreq;
      source.connect(filter);
      filter.connect(gainNode);
    } else {
      source.connect(gainNode);
    }
  } else {
    source = ctx.createOscillator();
    source.type = layer.wave || 'sine';
    source.frequency.setValueAtTime(layer.freqStart, t0);
    source.frequency.linearRampToValueAtTime(layer.freqEnd ?? layer.freqStart, tAttackEnd);
    source.connect(gainNode);
  }

  source.start(t0);
  source.stop(tRelease + 0.02);
}

/**
 * Play a cue by name. No-op (never throws) when: the cue is unknown, the
 * caller or module is muted, WebAudio is unavailable, or scheduling fails
 * for any other reason.
 *
 * @param {string} cueName - one of SFX_CUES (src/audio/registry.js).
 * @param {{mute?: boolean}} [opts] - per-call mute override; defaults to
 *   the module-level flag set via setMuted().
 */
export function play(cueName, opts = {}) {
  const envelope = ENVELOPES[cueName];
  if (!envelope) return;

  const muted = opts.mute ?? _muted;
  if (muted) return;

  try {
    const ctx = getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    for (const layer of envelope.layers) {
      scheduleLayer(ctx, master, layer, now);
    }
  } catch {
    // never throw -- a broken/blocked WebAudio implementation just means silence
  }
}
