// The language switcher's "فارسی" is drawn from a 2 kB cut of Vazirmatn
// (src/styles/fonts/vazirmatn-label-400.woff2, scripts/vazirmatn-label.mjs) so a
// German or English page does not download the 46 kB Arabic-script file for one
// word. If the word changes, or the CSS range drifts from it, the label would
// quietly fall back to the full font again - or to a system face.
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync('src/styles/globals.css', 'utf8');
const face = css.slice(css.indexOf("font-family: 'Vazirmatn Label'"));
const range = /unicode-range:\s*([^;]+);/.exec(face)?.[1] ?? '';
const covered = new Set([...range.matchAll(/U\+([0-9A-F]+)/g)].map((match) => parseInt(match[1], 16)));

test('vazirmatn label: every letter of the word is in the face and the file is small', () => {
  for (const locale of ['de', 'en', 'fa']) {
    const word = JSON.parse(readFileSync(`src/messages/${locale}.json`, 'utf8')).languages.fa;
    for (const letter of word) assert.ok(covered.has(letter.codePointAt(0)), `${locale}: U+${letter.codePointAt(0).toString(16)} is not in the Vazirmatn Label range`);
  }
  assert.ok(covered.has(0x20), 'the space is in the range, or the browser fetches the Latin file for it');
  assert.ok(statSync('src/styles/fonts/vazirmatn-label-400.woff2').size < 4096, 'the label file grew: was it made from the wrong text?');
});

test('vazirmatn label: only non-Persian pages use it, and the full font stays as the fallback', () => {
  assert.match(css, /html:not\(\[lang\^='fa'\]\) \.ao-site-page \[data-language-switcher\] \[lang\^='fa'\]\s*\{\s*font-family: 'Vazirmatn Label', var\(--ao-font-vazirmatn\);/);
});
