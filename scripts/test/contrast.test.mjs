// PERF-04: every theme's text tokens meet WCAG 2.2 AA (4.5:1) against the
// surfaces they are set on - in all eight themes, because the Time Machine
// (APP-05) can put any of them on the whole desktop.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { themes } from '../../src/lib/themes.ts';

function luminance(hex) {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((at) => parseInt(value.slice(at, at + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Text token -> the surfaces it is read on. `textMuted` is left off the page
 * background on purpose: in 1984 and 1995 that background is a wallpaper that
 * carries no muted text, and every app sets its secondary text on a panel.
 */
const PAIRS = [
  ['textPrimary', ['background', 'surface', 'surfaceElevated']],
  ['textMuted', ['surface', 'surfaceElevated']],
  ['accent', ['surface', 'surfaceElevated']],
  ['error', ['surface']],
  ['success', ['surface']],
  ['warning', ['surface']],
  ['chromeText', ['chrome']],
];

test('contrast: every text token reaches 4.5:1 on its surfaces, in every theme', () => {
  const failures = [];
  for (const [id, theme] of Object.entries(themes)) {
    for (const [text, surfaces] of PAIRS) {
      for (const surface of surfaces) {
        const ratio = contrast(theme.colors[text], theme.colors[surface]);
        if (ratio < 4.5) failures.push(`${id}: ${text} on ${surface} = ${ratio.toFixed(2)}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('contrast: a filled accent button (text-background on bg-accent) is readable in every theme', () => {
  for (const [id, theme] of Object.entries(themes)) {
    assert.ok(contrast(theme.colors.background, theme.colors.accent) >= 4.5, id);
  }
});
