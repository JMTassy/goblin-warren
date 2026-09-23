#!/usr/bin/env node
// scripts/art-sheet.mjs
//
// Node-only (this file is not part of src/art -- it may use fs/zlib
// freely). Rasters every src/art/registry.js TEXTURE_KEYS entry, lays them
// out on one labelled grid at 4x nearest-neighbour scale, and writes
// docs/art-sheet.png with a minimal hand-written PNG encoder (zlib from
// Node -- no image/canvas dependency). Run with `node scripts/art-sheet.mjs`.

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { TEXTURE_KEYS } from '../src/art/registry.js';
import { raster, textureSize } from '../src/art/raster.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(HERE, '..', 'docs', 'art-sheet.png');

// --- tiny bitmap font (uppercase digits/letters/underscore/space) ------
// 5 rows tall; most glyphs 4 columns wide, a few narrower/wider for shape.

const GLYPHS = {
  '0': ['.##.', '#..#', '#..#', '#..#', '.##.'],
  '1': ['.#..', '##..', '.#..', '.#..', '###.'],
  '2': ['.##.', '#..#', '..#.', '.#..', '####'],
  '3': ['###.', '..#.', '.##.', '..#.', '###.'],
  '4': ['..#.', '.##.', '#.#.', '####', '..#.'],
  '5': ['####', '#...', '###.', '...#', '###.'],
  '6': ['.##.', '#...', '###.', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '.#..', '.#..'],
  '8': ['.##.', '#..#', '.##.', '#..#', '.##.'],
  '9': ['.##.', '#..#', '.###', '...#', '.##.'],
  A: ['.##.', '#..#', '####', '#..#', '#..#'],
  B: ['###.', '#..#', '###.', '#..#', '###.'],
  C: ['.###', '#...', '#...', '#...', '.###'],
  D: ['###.', '#..#', '#..#', '#..#', '###.'],
  E: ['####', '#...', '###.', '#...', '####'],
  F: ['####', '#...', '###.', '#...', '#...'],
  G: ['.###', '#...', '#.##', '#..#', '.###'],
  H: ['#..#', '#..#', '####', '#..#', '#..#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..##', '...#', '...#', '#..#', '.##.'],
  K: ['#..#', '#.#.', '##..', '#.#.', '#..#'],
  L: ['#...', '#...', '#...', '#...', '####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.##.', '#..#', '#..#', '#..#', '.##.'],
  P: ['###.', '#..#', '###.', '#...', '#...'],
  Q: ['.##.', '#..#', '#..#', '.##.', '...#'],
  R: ['###.', '#..#', '###.', '#.#.', '#..#'],
  S: ['.###', '#...', '.##.', '...#', '###.'],
  T: ['####', '.#..', '.#..', '.#..', '.#..'],
  U: ['#..#', '#..#', '#..#', '#..#', '.##.'],
  V: ['#..#', '#..#', '#..#', '.##.', '.##.'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#..#', '.##.', '.##.', '.##.', '#..#'],
  Y: ['#..#', '#..#', '.##.', '.#..', '.#..'],
  Z: ['####', '...#', '..#.', '.#..', '####'],
  _: ['....', '....', '....', '....', '####'],
  ' ': ['..', '..', '..', '..', '..'],
};

function glyphWidth(ch) {
  return (GLYPHS[ch] ?? GLYPHS[' ']).length ? (GLYPHS[ch] ?? GLYPHS[' '])[0].length : 2;
}

function textWidth(text, scale) {
  let w = 0;
  for (const ch of text) w += (glyphWidth(ch.toUpperCase()) + 1) * scale;
  return w;
}

// --- a tiny RGBA canvas --------------------------------------------------

function makeCanvas(w, h, bg) {
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    buf[i * 4] = bg[0];
    buf[i * 4 + 1] = bg[1];
    buf[i * 4 + 2] = bg[2];
    buf[i * 4 + 3] = 255;
  }
  return { w, h, buf };
}

function blendPixel(canvas, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= canvas.w || y >= canvas.h || a === 0) return;
  const i = (y * canvas.w + x) * 4;
  if (a >= 255) {
    canvas.buf[i] = r;
    canvas.buf[i + 1] = g;
    canvas.buf[i + 2] = b;
    canvas.buf[i + 3] = 255;
    return;
  }
  const t = a / 255;
  canvas.buf[i] = r * t + canvas.buf[i] * (1 - t);
  canvas.buf[i + 1] = g * t + canvas.buf[i + 1] * (1 - t);
  canvas.buf[i + 2] = b * t + canvas.buf[i + 2] * (1 - t);
  canvas.buf[i + 3] = 255;
}

function fillRect(canvas, x0, y0, x1, y1, [r, g, b, a = 255]) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) blendPixel(canvas, x, y, r, g, b, a);
  }
}

function strokeRect(canvas, x0, y0, x1, y1, rgba) {
  for (let x = x0; x <= x1; x++) {
    blendPixel(canvas, x, y0, ...rgba);
    blendPixel(canvas, x, y1, ...rgba);
  }
  for (let y = y0; y <= y1; y++) {
    blendPixel(canvas, x0, y, ...rgba);
    blendPixel(canvas, x1, y, ...rgba);
  }
}

function drawSprite(canvas, destX, destY, { w, h, rgba }, scale) {
  for (let sy = 0; sy < h; sy++) {
    for (let sx = 0; sx < w; sx++) {
      const i = (sy * w + sx) * 4;
      const r = rgba[i];
      const g = rgba[i + 1];
      const b = rgba[i + 2];
      const a = rgba[i + 3];
      if (a === 0) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          blendPixel(canvas, destX + sx * scale + dx, destY + sy * scale + dy, r, g, b, a);
        }
      }
    }
  }
}

function drawText(canvas, x, y, text, scale, rgb) {
  let cx = x;
  for (const raw of text) {
    const ch = raw.toUpperCase();
    const glyph = GLYPHS[ch] ?? GLYPHS[' '];
    for (let row = 0; row < glyph.length; row++) {
      const line = glyph[row];
      for (let col = 0; col < line.length; col++) {
        if (line[col] !== '#') continue;
        fillRect(
          canvas,
          cx + col * scale,
          y + row * scale,
          cx + col * scale + scale - 1,
          y + row * scale + scale - 1,
          [...rgb, 255],
        );
      }
    }
    cx += (glyph[0].length + 1) * scale;
  }
  return cx - x;
}

// --- layout ---------------------------------------------------------------

const SCALE = 4;
const LABEL_SCALE = 2;
const PANEL_BG = [219, 214, 196, 255]; // warm neutral -- distinct from any palette colour, shows transparency
const INK = [20, 24, 16];
const COLS = 6;
const CELL_W = 220;
const CELL_H = 165;
const MARGIN = 24;
const TITLE_H = 60;

const rows = Math.ceil(TEXTURE_KEYS.length / COLS);
const sheetW = MARGIN * 2 + COLS * CELL_W;
const sheetH = MARGIN * 2 + TITLE_H + rows * CELL_H;

const canvas = makeCanvas(sheetW, sheetH, [243, 239, 227, 255]);

drawText(canvas, MARGIN, MARGIN, 'GOBLIN WARREN V2 - ART SHEET', 3, INK);
drawText(
  canvas,
  MARGIN,
  MARGIN + 26,
  `${TEXTURE_KEYS.length} TEXTURES, 4X NEAREST-NEIGHBOUR, PANEL = TRANSPARENCY CHECK`,
  1,
  [90, 86, 74],
);

TEXTURE_KEYS.forEach((key, index) => {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const cellX = MARGIN + col * CELL_W;
  const cellY = MARGIN + TITLE_H + row * CELL_H;

  const panelX0 = cellX + 6;
  const panelY0 = cellY + 4;
  const panelX1 = cellX + CELL_W - 6;
  const panelY1 = cellY + CELL_H - 30;
  fillRect(canvas, panelX0, panelY0, panelX1, panelY1, PANEL_BG);
  strokeRect(canvas, panelX0, panelY0, panelX1, panelY1, [150, 145, 128, 255]);

  const size = textureSize(key);
  const spriteW = size.w * SCALE;
  const spriteH = size.h * SCALE;
  const panelW = panelX1 - panelX0 + 1;
  const panelH = panelY1 - panelY0 + 1;
  const destX = panelX0 + Math.floor((panelW - spriteW) / 2);
  const destY = panelY0 + Math.floor((panelH - spriteH) / 2);

  // The face and glow layers are meant to be composited by the engine at
  // runtime (over a body frame / over a tile). Drawing that composite
  // here too -- alongside the raw layer everyone else gets -- is a sheet-
  // only visual aid so the Mayor can judge the actual in-game look; it
  // changes nothing about the stored per-key pixel maps or raster() output.
  if (key.startsWith('lulu_face_')) drawSprite(canvas, destX, destY, raster('lulu_body_0'), SCALE);
  if (key === 'tile_glow_ok' || key === 'tile_glow_no') drawSprite(canvas, destX, destY, raster('tile_soil'), SCALE);
  drawSprite(canvas, destX, destY, raster(key), SCALE);

  const label = key;
  const tw = textWidth(label, LABEL_SCALE);
  const labelX = cellX + Math.max(2, Math.floor((CELL_W - tw) / 2));
  drawText(canvas, labelX, panelY1 + 8, label, LABEL_SCALE, INK);
});

// --- minimal PNG encoder (RGBA8, filter-none, zlib via Node) -------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG({ w, h, buf }) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    Buffer.from(buf.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const png = encodePNG(canvas);
writeFileSync(OUT_PATH, png);
console.log(`wrote ${OUT_PATH} (${png.length} bytes, ${sheetW}x${sheetH}, ${TEXTURE_KEYS.length} sprites)`);
