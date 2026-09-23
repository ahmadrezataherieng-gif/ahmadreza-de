// The Assistant's client logic and copy, run as they are: node strips the types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { phases, typingStep } from '../../src/components/apps/assistant/assistant.ts';

const LOCALES = ['de', 'en', 'fa'];
const copy = (locale) => JSON.parse(readFileSync(new URL(`../../src/messages/apps/assistant/${locale}.json`, import.meta.url), 'utf8'));

test('every phase has copy in every language', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    for (const phase of phases) assert.ok(c.status[phase], `${locale} status.${phase}`);
  }
});

test('the app presents itself as a search and explicitly denies being AI, in every language', () => {
  const denial = { de: /keine\s*KI/i, en: /not\s*AI/i, fa: /نه\s*هوش\s*مصنوعی/ };
  const namesSearch = { de: /Suche/i, en: /search/i, fa: /جست‌?وجو/ };
  for (const locale of LOCALES) {
    const c = copy(locale);
    assert.match(c.banner, namesSearch[locale], locale);
    assert.match(c.banner, denial[locale], `${locale}: the banner explicitly says it is not AI`);
    assert.doesNotMatch(c.privacy, /\bAI\b|\bKI\b|هوش مصنوعی/i, `${locale}: the privacy line never mentions AI at all`);
  }
});

test('the privacy line says nothing ever leaves the device, not "once it is live"', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    assert.doesNotMatch(c.privacy, /gemini/i, locale);
    assert.doesNotMatch(c.privacy, /demo/i, locale);
  }
});

test('every source label exists, and era and ticket carry their placeholder', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    for (const kind of ['about', 'now', 'station', 'skillArea', 'language', 'project', 'era', 'ticket', 'contact']) {
      assert.ok(c.source[kind], `${locale} source.${kind}`);
    }
    assert.match(c.source.era, /\{year\}/, locale);
    assert.match(c.source.ticket, /\{number\}/, locale);
  }
});

test('five examples per language, and the contact sentence carries the email placeholder', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    assert.equal(c.examples.length, 5, locale);
    for (const example of c.examples) assert.ok(example.trim().length > 0, locale);
    assert.match(c.contactSentence, /\{email\}/, locale);
  }
});

test('every search keyword category has at least one entry, in every language', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    for (const kind of ['about', 'now', 'station', 'skills', 'language', 'project', 'era', 'ticket', 'contact']) {
      const list = c.keywords[kind]?.keywords;
      assert.ok(Array.isArray(list) && list.length > 0, `${locale} keywords.${kind}.keywords`);
    }
  }
});

test('the seven era truths in the assistant\'s own copy match the site\'s own eras.<id>.description, in every language', () => {
  for (const locale of LOCALES) {
    const site = JSON.parse(readFileSync(new URL(`../../src/messages/${locale}.json`, import.meta.url), 'utf8'));
    const c = copy(locale);
    assert.equal(Object.keys(c.eras).length, 7, locale);
    for (const id of Object.keys(c.eras)) {
      assert.equal(c.eras[id].description, site.eras[id].description, `${locale} ${id}`);
      assert.equal(c.eras[id].name, site.eras[id].name, `${locale} ${id}`);
    }
  }
});

test('typing: any answer takes about 50 steps at most', () => {
  assert.equal(typingStep(1), 1);
  assert.equal(typingStep(50), 1);
  assert.equal(typingStep(900), 18);
  assert.ok(Math.ceil(900 / typingStep(900)) <= 50);
});
