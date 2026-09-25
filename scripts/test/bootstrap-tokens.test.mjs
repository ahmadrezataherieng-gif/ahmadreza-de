// PERF-02: the first mount writes no theme variables for the default theme,
// because the stylesheet's `:root` already declares the same values
// (ThemeProvider, apply-theme.ts). That is only safe while the two agree.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { themeToCssVars } from '../../src/lib/apply-theme.ts';
import { defaultThemeId, themes } from '../../src/lib/themes.ts';

/** The first `:root { ... }` block: the bootstrap tokens. */
function bootstrapTokens() {
  const css = readFileSync('src/styles/globals.css', 'utf8');
  const start = css.indexOf(':root {');
  const end = css.indexOf('\n}', start);
  const block = css.slice(start, end);
  const tokens = {};
  for (const match of block.matchAll(/(--ao-[a-z-]+):\s*([^;]+);/g)) tokens[match[1]] = match[2];
  return tokens;
}

// Colours and shadows are compared as the browser would: case, spaces after
// commas and the `0` before a decimal point do not matter.
const normalise = (value) =>
  String(value).toLowerCase().replace(/\s+/g, ' ').replace(/, /g, ',').replace(/\(\s+/g, '(').trim();

test('bootstrap tokens: :root declares exactly the default theme', () => {
  assert.equal(defaultThemeId, 'modern');
  const declared = bootstrapTokens();
  const wanted = themeToCssVars(themes[defaultThemeId]);
  const differences = [];
  for (const [name, value] of Object.entries(wanted)) {
    if (!(name in declared)) differences.push(`${name}: missing in :root (theme: ${value})`);
    else if (normalise(declared[name]) !== normalise(value)) differences.push(`${name}: :root ${declared[name]} != theme ${value}`);
  }
  assert.deepEqual(differences, []);
});
