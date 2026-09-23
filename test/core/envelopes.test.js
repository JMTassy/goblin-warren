// test/core/envelopes.test.js
//
// Owned by P3. Vitest runs this in plain Node (vite.config.js sets no
// `environment`, so no `window`/AudioContext exists here) -- proof that
// importing src/audio/sfx.js and reading its envelope data table never
// touches the DOM or WebAudio at module scope, per the acceptance in
// VISION_V2.md §11 P3 / docs/INTERFACES.md §4.

import { describe, expect, test } from 'vitest';
import { SFX_CUES } from '../../src/audio/registry.js';
import { ENVELOPES, durationOf, peakGainOf } from '../../src/audio/sfx.js';

describe('sfx envelopes', () => {
  test('every SFX_CUES cue has an envelope', () => {
    for (const cue of SFX_CUES) {
      expect(ENVELOPES[cue], `missing envelope for cue "${cue}"`).toBeTruthy();
    }
  });

  test('no envelope exists for a cue outside SFX_CUES', () => {
    for (const key of Object.keys(ENVELOPES)) {
      expect(SFX_CUES, `"${key}" is not a legal SFX_CUES entry`).toContain(key);
    }
  });

  test('every cue has a distinct set of layer waveforms/types (no accidental duplicate envelope)', () => {
    const signatures = new Set();
    for (const cue of SFX_CUES) {
      const sig = JSON.stringify(ENVELOPES[cue]);
      expect(signatures.has(sig), `"${cue}" has an identical envelope to another cue`).toBe(false);
      signatures.add(sig);
    }
  });

  for (const cue of SFX_CUES) {
    describe(`"${cue}"`, () => {
      test('has at least one layer', () => {
        expect(ENVELOPES[cue].layers.length).toBeGreaterThan(0);
      });

      test('duration is between 30 and 400ms', () => {
        const d = durationOf(ENVELOPES[cue]);
        expect(d).toBeGreaterThanOrEqual(30);
        expect(d).toBeLessThanOrEqual(400);
      });

      test('peak gain is at most 0.5', () => {
        expect(peakGainOf(ENVELOPES[cue])).toBeLessThanOrEqual(0.5);
      });

      test('every layer is a well-formed tone or noise layer', () => {
        for (const layer of ENVELOPES[cue].layers) {
          expect(['tone', 'noise']).toContain(layer.type);
          expect(layer.start).toBeGreaterThanOrEqual(0);
          expect(layer.attack).toBeGreaterThanOrEqual(0);
          expect(layer.release).toBeGreaterThan(0);
          expect(layer.peak).toBeGreaterThan(0);
          expect(layer.peak).toBeLessThanOrEqual(0.5);
          if (layer.type === 'tone') {
            expect(typeof layer.freqStart).toBe('number');
            expect(layer.freqStart).toBeGreaterThan(0);
          }
        }
      });
    });
  }
});
