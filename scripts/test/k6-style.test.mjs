// The K6 style of the main site's own pages (ROADMAP BR-06): its tokens are
// readable in both colour schemes, its fonts are files of ours, and it never
// leaks outside `[data-style='k6']`.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(new URL('../../src/styles/globals.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const start = css.indexOf('The K6 style for the main site');
const k6 = css.slice(start);

const luminance = (hex) => {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255).map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const block = (text) => Object.fromEntries([...text.matchAll(/--ao-color-([a-z-]+): (#[0-9a-f]{6});/g)].map((match) => [match[1], match[2]]));

const dark = block(k6.slice(k6.indexOf("[data-style='k6'] {"), k6.indexOf('@media (prefers-color-scheme: light)')));
const light = block(k6.slice(k6.indexOf('@media (prefers-color-scheme: light)')));

test('K6: text, muted text and the accent reach WCAG AA on the page and on the surface, in dark and in light', () => {
  for (const [scheme, tokens] of [['dark', dark], ['light', light]]) {
    for (const ground of ['background', 'surface', 'surface-elevated']) {
      assert.ok(ratio(tokens.text, tokens[ground]) >= 7, `${scheme}: text on ${ground}`);
      assert.ok(ratio(tokens['text-muted'], tokens[ground]) >= 4.5, `${scheme}: muted text on ${ground}`);
      assert.ok(ratio(tokens.accent, tokens[ground]) >= 4.5, `${scheme}: accent on ${ground}`);
      assert.ok(ratio(tokens.warning, tokens[ground]) >= 4.5, `${scheme}: warning on ${ground}`);
      assert.ok(ratio(tokens.error, tokens[ground]) >= 4.5, `${scheme}: error on ${ground}`);
    }
    // Buttons: the page colour on the accent.
    assert.ok(ratio(tokens.background, tokens.accent) >= 4.5, `${scheme}: button text on the accent`);
  }
});

test('K6: every token of the theme engine is set, and only inside the scope', () => {
  const needed = ['background', 'surface', 'surface-elevated', 'border', 'text', 'text-muted', 'accent', 'accent-muted', 'warning', 'success', 'error', 'chrome', 'chrome-text'];
  for (const name of needed) {
    assert.ok(dark[name], `dark ${name}`);
    assert.ok(light[name], `light ${name}`);
  }
  // Every rule after the header starts inside the scope or is a font face or the media query.
  const rules = k6.split('\n').filter((line) => /^[^\s/*}@].*\{$/.test(line));
  for (const rule of rules) assert.match(rule, /^\[data-style='k6'\]/, rule);
});

test('K6: its fonts are files under public/fonts with a licence row, and nothing is fetched from elsewhere', () => {
  const files = [...k6.matchAll(/url\((\/fonts\/[^)]+)\)/g)].map((match) => match[1]);
  assert.equal(files.length, 5, 'five font faces');
  const licences = readFileSync(new URL('../../public/fonts/LICENSES.md', import.meta.url), 'utf8');
  for (const file of files) assert.ok(existsSync(new URL(`../../public${file}`, import.meta.url)), `${file} is missing`);
  for (const name of ['Martian Grotesk', 'Geist', 'Geist Mono', 'Vazirmatn', 'Departure Mono']) assert.ok(licences.includes(`| ${name} |`), `${name} has no licence row`);
  assert.doesNotMatch(k6, /https?:\/\//, 'no absolute URL in the K6 block');
});
