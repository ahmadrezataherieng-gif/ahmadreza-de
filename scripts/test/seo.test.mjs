import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { structuredData, serialiseJsonLd } from '../../src/lib/structured-data.ts';
import { leaksAddress } from './private-address.mjs';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('robots.txt: allows everything, names every AI bot the owner chose, points at the sitemap', () => {
  const robots = read('public/robots.txt');
  const lines = robots.split(/\r?\n/).filter((line) => line && !line.startsWith('#'));
  assert.ok(!lines.some((line) => /^Disallow:\s*\S/i.test(line)), 'nothing disallowed');
  assert.ok(!lines.some((line) => /^crawl-delay/i.test(line)), 'no crawl-delay');
  for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'meta-externalagent']) {
    assert.ok(lines.includes(`User-agent: ${bot}`), bot);
  }
  assert.ok(lines.includes('Sitemap: https://ahmadreza.de/sitemap.xml'));
});

test('sitemap: built from the views, the noindex legal pages left out', () => {
  const source = read('src/app/sitemap.ts');
  assert.match(source, /view !== 'imprint' && view !== 'privacy'/);
  assert.match(source, /'x-default'/);
});

test('llms.txt: names the person in both spellings, links the site, never the address or the legal name', () => {
  const llms = read('public/llms.txt');
  assert.match(llms, /^# Ahmadreza Taheri/);
  assert.ok(llms.includes('احمدرضا طاهری'));
  assert.ok(llms.includes('https://ahmadreza.de/amonel/'));
  assert.doesNotMatch(llms, /Momrabadi/);
  assert.ok(!leaksAddress(llms));
});

test('JSON-LD: one Person and one WebSite by @id, a ProfilePage only on the landing page, never the legal name or address', () => {
  const copy = { name: 'Ahmadreza Taheri', persianName: 'احمدرضا طاهری', jobTitle: 'Job', knowsAbout: ['Linux'], inLanguage: 'de-DE', siteName: 'Amonel', description: 'd', pageUrl: 'https://ahmadreza.de/', isProfilePage: true };
  const landing = structuredData(copy);
  const types = landing['@graph'].map((node) => node['@type']);
  assert.deepEqual(types, ['Person', 'WebSite', 'ProfilePage']);
  assert.deepEqual(landing['@graph'][0].alternateName, ['احمدرضا طاهری']);
  assert.equal(landing['@graph'][2].mainEntity['@id'], landing['@graph'][0]['@id']);
  assert.deepEqual(structuredData({ ...copy, isProfilePage: false })['@graph'].map((node) => node['@type']), ['Person', 'WebSite']);
  const json = serialiseJsonLd(landing);
  assert.doesNotMatch(json, /Momrabadi|streetAddress/);
  assert.ok(!leaksAddress(json));
  assert.ok(!serialiseJsonLd({ x: '</script>' }).includes('</script>'));
});
