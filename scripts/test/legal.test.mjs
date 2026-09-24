import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { matchSegments, allRouteSegments, viewHref } from '../../src/lib/routing.ts';
import { sectionsFor, linkify } from '../../src/lib/legal-doc.ts';
import { leaksAddress } from './private-address.mjs';

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
  // Six views (landing, journey, desktop, about and the two legal pages) in three locales.
  assert.equal(allRouteSegments().length, 18);
});

test('legal: the postal address and legal name are imported only by the legal page', () => {
  const importers = sourceFiles('src/').filter((file) => read(file).includes('@/content/legal'));
  assert.deepEqual(importers, ['src/components/legal/LegalPage.tsx']);
  for (const file of sourceFiles('src/')) {
    if (file === 'src/content/legal.ts') continue;
    assert.doesNotMatch(read(file), /Momrabadi/, file);
    if (file !== 'src/content/legal.local.ts') assert.ok(!leaksAddress(read(file)), `${file} carries the private address`);
  }
});

test('legal: the postal address stays out of the repository - git-ignored local file, a dummy template, a build guard', () => {
  assert.match(read('.gitignore'), /^src\/content\/legal\.local\.ts$/m);
  assert.match(read('src/content/legal.ts'), /from '\.\/legal\.local\.ts'/);
  assert.doesNotMatch(read('src/content/legal.ts'), /street:\s*'/);
  assert.match(read('src/content/legal.example.ts'), /Musterstraße 1/);
  assert.match(read('next.config.mjs'), /ensureLegalAddress\(\)/);
  assert.match(read('scripts/build-soon.mjs'), /ensureLegalAddress\(\)/);
  for (const file of ['README.md', 'ROADMAP.md', 'PROJECT_STATE.md', 'TODO.md', 'DECISIONS.md', 'CONTENT_REVIEW.md', 'soon/index.html']) {
    assert.ok(!leaksAddress(read(file)), `${file} carries the private address`);
  }
});

test('legal: every template import over messages/ excludes the legal copy, so it never reaches a client chunk', () => {
  for (const file of ['src/i18n/request.ts', 'src/components/puzzles/PuzzleMessages.tsx', 'src/components/apps/timeline/TimelineApp.tsx']) {
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
  const keys = [...constants.matchAll(/'(amonel\.[a-z.0-9]+)'/g)].map((match) => match[1]);
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

test('legal: the Content-Security-Policy allows this origin only - no third-party host can ever load', () => {
  const line = read('public/_headers').split(/\r?\n/).find((entry) => entry.trim().startsWith('Content-Security-Policy:'));
  assert.ok(line, 'a CSP header exists');
  const policy = Object.fromEntries(
    line.split(':').slice(1).join(':').split(';').map((part) => part.trim().split(/\s+/)).map(([name, ...values]) => [name, values]),
  );
  assert.deepEqual(policy['default-src'], ["'self'"]);
  assert.deepEqual(policy['connect-src'], ["'self'"]);
  assert.deepEqual(policy['font-src'], ["'self'"]);
  assert.deepEqual(policy['form-action'], ["'none'"]);
  assert.deepEqual(policy['frame-ancestors'], ["'none'"]);
  for (const [name, values] of Object.entries(policy)) {
    for (const value of values) assert.doesNotMatch(value, /^(https?:|\*|[a-z0-9-]+\.[a-z])/i, `${name} ${value}`);
  }
});
