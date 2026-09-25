// The technologies shown between two eras (BR-10, DECISIONS.md 77): every one
// is named in all three languages, the cards run in year order, no trademark is
// drawn, and the scroll length of a crossing follows its number of cards.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { crossingTech, techIds } from '../../src/content/crossings.ts';
import { crossingLength, TECH_FROM, TECH_TO } from '../../src/components/journey/crossing-timing.ts';

const messages = Object.fromEntries(
  ['de', 'en', 'fa'].map((locale) => [
    locale,
    JSON.parse(readFileSync(new URL(`../../src/messages/${locale}.json`, import.meta.url), 'utf8')).crossings,
  ]),
);

const cards = Object.values(crossingTech).flat();

test('crossings: each technology is used once and every id has a card', () => {
  assert.deepEqual([...cards.map((card) => card.id)].sort(), [...techIds].sort());
});

test('crossings: names in de, en and fa, and the same notes in each', () => {
  for (const locale of ['de', 'en', 'fa']) {
    assert.ok(messages[locale].between, `${locale}: between`);
    for (const id of techIds) {
      assert.ok(messages[locale].techs[id]?.name, `${locale}: ${id}`);
      assert.equal(
        Boolean(messages[locale].techs[id].note),
        Boolean(messages.de.techs[id].note),
        `${locale}: ${id} note`,
      );
    }
    for (const key of new Set(cards.flatMap((card) => (typeof card.when === 'string' ? [card.when] : [])))) {
      assert.ok(messages[locale].when[key], `${locale}: when.${key}`);
    }
  }
});

test('crossings: within a crossing the years never go backwards', () => {
  for (const [era, list] of Object.entries(crossingTech)) {
    const years = list.map((card) => (typeof card.when === 'number' ? card.when : Infinity));
    assert.deepEqual(years, [...years].sort((a, b) => a - b), era);
  }
});

test('crossings: the years are the ones the owner gave', () => {
  const year = (id) => cards.find((card) => card.id === id)?.when;
  assert.deepEqual(
    ['transistor', 'coreMemory', 'univac', 'integratedCircuit', 'system360', 'arpanet'].map(year),
    [1947, 1953, 1951, 1958, 1964, 1969],
  );
  assert.deepEqual(['intel4004', 'floppy', 'ethernet', 'altair', 'appleII'].map(year), [1971, 1971, 1973, 1975, 1977]);
  assert.deepEqual(['mouse', 'alto', 'lisa'].map(year), [1968, 1973, 1983]);
  assert.deepEqual(['cdrom', 'web', 'linux'].map(year), [1985, 1991, 1991]);
  assert.deepEqual(['search', 'wifi', 'cloud', 'smartphone'].map(year), [1998, 1999, 2006, 2007]);
});

test('crossings: a card gets about a third of a screen of scrolling, whatever their number', () => {
  for (const [era, list] of Object.entries(crossingTech)) {
    const perCard = ((TECH_TO - TECH_FROM) * crossingLength(list.length)) / list.length;
    assert.ok(perCard > 0.25 && perCard < 0.36, `${era}: ${perCard.toFixed(2)} screens per card`);
  }
  assert.equal(crossingLength(0), 1.4, 'the crossing into the Convergence keeps its length');
});

test('crossings: the drawings use no raster and no brand colours', () => {
  const art = readFileSync(new URL('../../src/components/journey/tech/TechArt.tsx', import.meta.url), 'utf8');
  assert.ok(!/<image|<img|href=|url\(|#[0-9a-f]{3,8}\b/i.test(art), 'raster, link or hard-coded colour in TechArt');
  assert.ok(!/rainbow/i.test(art));
});
