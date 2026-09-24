// The Time Machine (APP-05): where a year lands, and the one stored choice.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { destinationForYear, ERA_STARTS, readStoredTheme, writeStoredTheme, yearStops } from '../../src/components/apps/time-machine/time-machine.ts';
import { themeIds } from '../../src/lib/themes.ts';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test('a year lands in the era that was current then', () => {
  const cases = { 1946: 'era1946', 1950: 'era1946', 1956: 'era1956', 1969: 'era1956', 1971: 'era1971', 1983: 'era1981', 1990: 'era1984', 1995: 'era1995', 2005: 'era1995', 2006: 'era2024', 2026: 'era2024' };
  for (const [year, theme] of Object.entries(cases)) assert.deepEqual(destinationForYear(String(year), 2026), { kind: 'era', year: Number(year), themeId: theme }, year);
  assert.deepEqual(destinationForYear('1941', 2026), { kind: 'tooEarly', year: 1941 });
  assert.deepEqual(destinationForYear('2030', 2026), { kind: 'future', year: 2030 });
  assert.deepEqual(destinationForYear('neunzehn', 2026), { kind: 'invalid' });
  assert.deepEqual(destinationForYear('', 2026), { kind: 'invalid' });
  // Persian digits are years too.
  assert.deepEqual(destinationForYear('۱۹۸۴', 2026), { kind: 'era', year: 1984, themeId: 'era1984' });
});

test('every era the journey has is a Time Machine stop, in order', () => {
  const starts = ERA_STARTS.map(([year]) => year);
  assert.deepEqual([...starts].sort((a, b) => a - b), starts);
  assert.deepEqual(ERA_STARTS.map(([, theme]) => theme), themeIds.filter((id) => id !== 'modern'));
});

test('the counter settles on the target year', () => {
  const stops = yearStops(2026, 1971, 14);
  assert.equal(stops.length, 14);
  assert.equal(stops.at(-1), 1971);
  for (let index = 1; index < stops.length; index++) assert.ok(stops[index] <= stops[index - 1], 'never turns back');
  assert.deepEqual(yearStops(1984, 1984, 14), [1984]);
});

test('storage: one versioned value, removed on the way back, anything odd reads as no choice', () => {
  const storage = memoryStorage();
  assert.equal(readStoredTheme(storage, themeIds), null);
  writeStoredTheme(storage, 'era1984');
  assert.equal(storage.getItem('amonel.theme.v1'), '{"v":1,"theme":"era1984"}');
  assert.equal(readStoredTheme(storage, themeIds), 'era1984');
  writeStoredTheme(storage, 'modern');
  assert.equal(storage.data.size, 0, 'the present leaves nothing behind');
  for (const raw of ['{', '"era1984"', '{"v":2,"theme":"era1984"}', '{"v":1,"theme":"era2099"}', '{"v":1,"theme":"modern"}', 'null']) {
    assert.equal(readStoredTheme(memoryStorage({ 'amonel.theme.v1': raw }), themeIds), null, raw);
  }
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => {} };
  assert.equal(readStoredTheme(broken, themeIds), null);
  assert.doesNotThrow(() => writeStoredTheme(broken, 'era1971'));
  assert.equal(readStoredTheme(undefined, themeIds), null);
});

test('copy: every theme has a name and a look, in every language', () => {
  for (const locale of ['de', 'en', 'fa']) {
    const copy = JSON.parse(readFileSync(new URL(`../../src/messages/apps/time-machine/${locale}.json`, import.meta.url), 'utf8'));
    for (const id of themeIds) assert.ok(copy.themes[id]?.name && copy.themes[id]?.look, `${locale} ${id}`);
  }
});

test('only the desktop reads the stored era; every other view keeps its own theme', () => {
  const desktop = readFileSync(new URL('../../src/components/os/Desktop.tsx', import.meta.url), 'utf8');
  assert.match(desktop, /<DesktopTheme \/>/);
  for (const file of ['src/components/landing/Landing.tsx', 'src/components/about/AboutPage.tsx', 'src/components/legal/LegalPage.tsx']) {
    assert.match(readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8'), /<UseTheme id="modern" \/>/, file);
  }
});
