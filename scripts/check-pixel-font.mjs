// Verify that every string rendered in Press Start 2P has a real glyph for each
// character.
//
// Why this exists: a CSS unicode-range only says which code points a font file
// is *served* for, not which ones it actually draws. In Phase 3 a non-breaking
// hyphen (U+2011) sat inside the declared range, had no glyph, and rendered as a
// stray fallback character. This reads the font's own cmap table instead.
//
// Usage: node scripts/check-pixel-font.mjs
// Exits non-zero and lists offenders if any character is missing.
//
// No dependencies: WOFF 1.0 tables are zlib-deflated, which node:zlib inflates.

import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const FONT =
  'node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff';

/**
 * Message keys rendered in Press Start 2P, per locale. Persian is deliberately
 * absent: for `fa` the pixel stack resolves to Vazirmatn first (globals.css), so
 * no Persian string is ever set in this face.
 */
const PIXEL_KEYS = [
  'eras.dos.name',
  'eras.macintosh.name',
  'eras.macintosh.visual.menu',
  'eras.macintosh.visual.menuItems',
  'eras.macintosh.visual.windowTitle',
  'eras.macintosh.visual.icons',
  'eras.macintosh.visual.desktopIcons',
  'eras.macintosh.visual.pointerCaption',
  // Phase 5: the 1984 drag-and-drop puzzle labels its icons in the pixel face.
  'puzzles.macintosh.items',
  'puzzles.macintosh.window',
];
const LOCALES = ['de', 'en'];

function readCmap(buffer) {
  const numTables = buffer.readUInt16BE(12);
  let cmap = null;
  for (let i = 0; i < numTables; i++) {
    const entry = 44 + i * 20;
    const tag = buffer.toString('ascii', entry, entry + 4);
    if (tag !== 'cmap') continue;
    const offset = buffer.readUInt32BE(entry + 4);
    const compLength = buffer.readUInt32BE(entry + 8);
    const origLength = buffer.readUInt32BE(entry + 12);
    const raw = buffer.subarray(offset, offset + compLength);
    cmap = compLength === origLength ? raw : inflateSync(raw);
  }
  if (!cmap) throw new Error('cmap table not found');

  const covered = new Set();
  const subtables = cmap.readUInt16BE(2);
  for (let i = 0; i < subtables; i++) {
    const subOffset = cmap.readUInt32BE(4 + i * 8 + 4);
    const format = cmap.readUInt16BE(subOffset);

    if (format === 4) {
      const segX2 = cmap.readUInt16BE(subOffset + 6);
      const ends = subOffset + 14;
      const starts = ends + segX2 + 2;
      const deltas = starts + segX2;
      const rangeOffsets = deltas + segX2;
      for (let s = 0; s < segX2 / 2; s++) {
        const end = cmap.readUInt16BE(ends + s * 2);
        const start = cmap.readUInt16BE(starts + s * 2);
        const delta = cmap.readInt16BE(deltas + s * 2);
        const rangeOffset = cmap.readUInt16BE(rangeOffsets + s * 2);
        for (let code = start; code <= end && code !== 0xffff; code++) {
          let glyph;
          if (rangeOffset === 0) {
            glyph = (code + delta) & 0xffff;
          } else {
            const at = rangeOffsets + s * 2 + rangeOffset + (code - start) * 2;
            glyph = cmap.readUInt16BE(at);
            if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
          }
          if (glyph !== 0) covered.add(code);
        }
      }
    } else if (format === 12) {
      const groups = cmap.readUInt32BE(subOffset + 12);
      for (let g = 0; g < groups; g++) {
        const at = subOffset + 16 + g * 12;
        const start = cmap.readUInt32BE(at);
        const end = cmap.readUInt32BE(at + 4);
        const startGlyph = cmap.readUInt32BE(at + 8);
        for (let code = start; code <= end; code++) {
          if (startGlyph + (code - start) !== 0) covered.add(code);
        }
      }
    }
  }
  return covered;
}

function lookup(messages, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), messages);
}

function strings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const covered = readCmap(readFileSync(FONT));
const problems = [];

for (const locale of LOCALES) {
  const messages = JSON.parse(readFileSync(`src/messages/${locale}.json`, 'utf8'));
  for (const key of PIXEL_KEYS) {
    const value = lookup(messages, key);
    if (value === undefined) {
      problems.push(`${locale}: ${key} is missing from messages`);
      continue;
    }
    for (const text of strings(value)) {
      for (const char of text) {
        const code = char.codePointAt(0);
        if (!covered.has(code)) {
          problems.push(
            `${locale}: ${key} -> "${text}" uses U+${code.toString(16).toUpperCase().padStart(4, '0')} (${char}) with no glyph`,
          );
        }
      }
    }
  }
}

console.log(`Press Start 2P covers ${covered.size} code points.`);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`All ${PIXEL_KEYS.length} pixel-font keys in ${LOCALES.join(', ')} are fully covered.`);
