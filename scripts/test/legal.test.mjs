import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { matchSegments, allRouteSegments, viewHref } from '../../src/lib/routing.ts';
import { sectionsFor, linkify } from '../../src/lib/legal-doc.ts';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const copy = Object.fromEntries(['de', 'en', 'fa'].map((locale) => [locale, JSON.parse(read(`src/messages/legal/${locale}.json`))]));

function sourceFiles(dir) {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(`${dir}${entry.name}/`) : /\.(ts|tsx)$/.test(entry.name) ? [`${dir}${entry.name}`] : [],
  );
}

test('legal: /impressum/ and /datenschutz/ exist in every locale, with the German slug', () => {
  for (const [prefix, locale] of [['', 'de'], ['en/', 'en'], ['fa/', 'fa']]) {
    assert.equal(viewHref(locale, 'imprint'), `/${prefix}impressum/`);
    assert.equal(viewHref(locale, 'privacy'), `/${prefix}datenschutz/`);
  }
  assert.deepEqual(matchSegments(['en', 'impressum']), { locale: 'en', view: 'imprint' });
  assert.deepEqual(matchSegments(['datenschutz']), { locale: 'de', view: 'privacy' });
  assert.equal(allRouteSegments().length, 15);
});

test('legal: the postal address and legal name are imported only by the legal page', () => {
  const importers = sourceFiles('src/').filter((file) => read(file).includes('@/content/legal'));
  assert.deepEqual(importers, ['src/components/legal/LegalPage.tsx']);
  for (const file of sourceFiles('src/')) {
    if (file === 'src/content/legal.ts') continue;
    assert.doesNotMatch(read(file), /[Adresse entfernt]|Momrabadi|ahmadrezataheride/, file);
  }
});

test('legal: every template import over messages/ excludes the legal copy, so it never reaches a client chunk', () => {
  for (const file of ['src/i18n/request.ts', 'src/components/puzzles/PuzzleMessages.tsx']) {
    assert.match(read(file), /webpackExclude: \/\[\\\\\/\]\(apps\|legal\)\[\\\\\/\]\//, file);
  }
});

test('legal: the three languages have the same structure; only German is binding', () => {
  const shape = (doc) => doc.sections.map((section) => [section.scope ?? '', section.blocks.map((block) => `${block.type}:${block.scope ?? ''}`)]);
  for (const locale of ['en', 'fa']) {
    for (const kind of ['imprint', 'privacy']) assert.deepEqual(shape(copy[locale][kind]), shape(copy.de[kind]), `${locale} ${kind}`);
    assert.ok(copy[locale].bindingNote.length > 20, `${locale} says German is binding`);
  }
  assert.equal(copy.de.bindingNote, '');
  assert.equal(copy.de.imprint.title, 'Impressum');
});

test('legal: the privacy policy lists exactly the storage keys the code uses', () => {
  const constants = read('src/lib/constants.ts');
  const keys = [...constants.matchAll(/'(amonel\.[a-z.0-9]+)'/g)].map((match) => match[1]).filter((key) => key !== 'amonel.theme.v1');
  for (const locale of ['de', 'en', 'fa']) {
    const table = sectionsFor(copy[locale].privacy, 'site').flatMap((section) => section.blocks).find((block) => block.type === 'table');
    assert.deepEqual(table.rows.map((row) => row[0]).sort(), [...keys].sort(), locale);
  }
});

test('legal: the coming-soon version drops the counters, the Assistant and the site storage table', () => {
  const soon = sectionsFor(copy.de.privacy, 'soon');
  assert.ok(!soon.some((section) => /Zähler|Assistent/.test(section.heading)));
  assert.ok(!JSON.stringify(soon).includes('amonel.'));
  assert.ok(JSON.stringify(soon).includes('ao-lang'));
});

test('legal: bare https URLs become links, the rest stays text', () => {
  assert.deepEqual(linkify('Mainz, https://www.datenschutz.rlp.de'), [{ text: 'Mainz, ' }, { text: 'https://www.datenschutz.rlp.de', href: 'https://www.datenschutz.rlp.de' }]);
});
