// test/core/purity.test.js
//
// Anti-regression: src/core and src/art must stay pure -- no Date, no
// Math.random, no window, no document, no engine import. This is what
// lets P1's core logic and P2's art be vitest-tested with no browser, and
// what makes replay() deterministic across machines.
//
// A forbidden token inside a comment or a string still fails the test on
// purpose: the rule is "the substring never appears in this file", which
// is stricter than necessary but impossible to accidentally violate by
// writing the real thing and forgetting to remove a debug line.

import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const PURE_DIRS = ['src/core', 'src/art'];

// Matched as whole-word tokens so e.g. `windowed` or `redocument` (unlikely,
// but still) wouldn't false-positive, while `Math.random(` and `Date.now(`
// and `window.` and `document.` and `from 'phaser'` all do.
const FORBIDDEN = [
  { name: 'Date', pattern: /\bDate\b/ },
  { name: 'Math.random', pattern: /Math\.random/ },
  { name: 'window', pattern: /\bwindow\b/ },
  { name: 'document', pattern: /\bdocument\b/ },
  { name: 'phaser', pattern: /\bphaser\b/i },
];

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listFiles(full));
    else if (entry.endsWith('.js')) out.push(full);
  }
  return out;
}

describe('core/art purity', () => {
  for (const dir of PURE_DIRS) {
    const absDir = join(ROOT, dir);
    let files;
    try {
      files = listFiles(absDir);
    } catch {
      files = [];
    }

    test(`${dir} has files to check`, () => {
      expect(files.length).toBeGreaterThan(0);
    });

    for (const file of files) {
      const rel = file.slice(ROOT.length);
      test(`${rel} contains no forbidden tokens`, () => {
        const src = readFileSync(file, 'utf8');
        for (const { name, pattern } of FORBIDDEN) {
          const hit = pattern.test(src);
          expect(hit, `${rel} must not contain "${name}"`).toBe(false);
        }
      });
    }
  }
});
