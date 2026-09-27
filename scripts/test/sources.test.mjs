// The source registry (queue 2026-09-28 A2 item 1, ROADMAP LEG-20): every
// era's insider fact and legend fact must have a matching entry in
// src/content/sources.ts, each with a real-looking URL, a title, a publisher
// and a checked date. This test fails if any insider/legend has no source.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { eraIds } from '../../src/content/eras.ts';
import { sources } from '../../src/content/sources.ts';

const root = new URL('../../', import.meta.url);
const messages = (locale) => JSON.parse(readFileSync(new URL(`src/messages/${locale}.json`, root), 'utf8'));

test('sources.ts: one entry per era insider, with a working-shaped URL, title, publisher and checked date', () => {
  const de = messages('de');
  for (const eraId of eraIds) {
    assert.ok(de.eras[eraId]?.insider, `${eraId}: has an insider fact in messages`);
    const entry = sources.find((source) => source.id === `${eraId}-insider`);
    assert.ok(entry, `${eraId}-insider: has a source entry`);
    assert.equal(entry.era, eraId);
    assert.equal(entry.kind, 'insider');
  }
});

test('sources.ts: one entry per era legend fact (item 2), with a working-shaped URL, title, publisher and checked date', () => {
  for (const eraId of eraIds) {
    const entries = sources.filter((source) => source.id.startsWith(`${eraId}-legend`));
    assert.ok(entries.length > 0, `${eraId}: has at least one legend source entry`);
    for (const entry of entries) {
      assert.equal(entry.era, eraId);
      assert.equal(entry.kind, 'legend');
    }
  }
});

test('sources.ts: the Terminal LO command has a source', () => {
  const entry = sources.find((source) => source.id === 'terminal-lo');
  assert.ok(entry, 'terminal-lo: has a source entry');
});

test('sources.ts: every entry is well-formed (real-looking https URL, non-empty title/publisher/claim, checked date)', () => {
  assert.ok(sources.length >= 15, 'at least 15 sources: 7 insiders + at least 7 legends + the LO command');
  const seen = new Set();
  for (const source of sources) {
    assert.ok(!seen.has(source.id), `${source.id}: no duplicate id`);
    seen.add(source.id);
    assert.match(source.url, /^https?:\/\/[^\s]+\.[a-z]{2,}/i, `${source.id}: url looks like a real link`);
    assert.ok(source.title.length > 0, `${source.id}: has a title`);
    assert.ok(source.publisher.length > 0, `${source.id}: has a publisher`);
    assert.ok(source.claim.length > 0, `${source.id}: has a claim summary`);
    assert.match(source.checked, /^\d{4}-\d{2}-\d{2}$/, `${source.id}: checked date is YYYY-MM-DD`);
    assert.doesNotMatch(source.claim, /\bthe first computer\b/i, `${source.id}: avoids "the first computer"`);
  }
});
