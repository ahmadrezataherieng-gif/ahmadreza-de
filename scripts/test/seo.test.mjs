import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { structuredData, serialiseJsonLd } from '../../src/lib/structured-data.ts';
import { leaksAddress } from './private-address.mjs';
import { EMAIL } from '../../src/content/profile.ts';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('robots.txt: allows everything, names every AI bot the owner chose, points at the sitemap', () => {
  const robots = read('public/robots.txt');
  const lines = robots.split(/\r?\n/).filter((line) => line && !line.startsWith('#'));
  assert.ok(!lines.some((line) => /^Disallow:\s*\S/i.test(line)), 'nothing disallowed');
  assert.ok(!lines.some((line) => /^crawl-delay/i.test(line)), 'no crawl-delay');
  for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'GPTBot', 'ClaudeBot', 'anthropic-ai', 'CCBot', 'Google-Extended', 'meta-externalagent']) {
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
  const copy = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: ['Linux'], inLanguage: 'de-DE', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-de.png', width: 1200, height: 630, alt: 'alt' }, description: 'd', pageUrl: 'https://ahmadreza.de/', isProfilePage: true };
  const landing = structuredData(copy);
  const types = landing['@graph'].map((node) => node['@type']);
  assert.deepEqual(types, ['Person', 'WebSite', 'CreativeWork', 'ImageObject', 'ProfilePage']);
  assert.ok(landing['@graph'][0].alternateName.includes('احمدرضا طاهری'));
  assert.equal(landing['@graph'][4].mainEntity['@id'], landing['@graph'][0]['@id']);
  assert.deepEqual(structuredData({ ...copy, isProfilePage: false })['@graph'].map((node) => node['@type']), ['Person', 'WebSite', 'CreativeWork']);
  const json = serialiseJsonLd(landing);
  assert.doesNotMatch(json, /Momrabadi|streetAddress/);
  assert.ok(!leaksAddress(json));
  assert.ok(!serialiseJsonLd({ x: '</script>' }).includes('</script>'));
});

test('e-mail: one address on the whole site, from EMAIL in content/profile.ts (llms.txt, legal pages, JSON-LD)', () => {
  assert.ok(read('public/llms.txt').includes(`Contact: ${EMAIL.address}`));
  assert.match(read('src/content/legal.ts'), /email: EMAIL\.address/);
  const copy = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: [], inLanguage: 'de-DE', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-de.png', width: 1200, height: 630, alt: 'alt' }, description: 'd', pageUrl: 'https://ahmadreza.de/', isProfilePage: true };
  assert.equal(structuredData(copy)['@graph'][0].email, `mailto:${EMAIL.address}`);
  // The retired domain address appears nowhere a visitor or crawler can read it.
  for (const file of ['public/llms.txt', 'soon/index.html', 'src/content/profile.ts', ...['de', 'en', 'fa'].map((locale) => `src/messages/${locale}.json`)]) {
    assert.doesNotMatch(read(file), /kontakt@ahmadreza/, file);
  }
});

const entity = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: ['IT support'], inLanguage: 'de-DE', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-de.png', width: 1200, height: 630, alt: 'Ahmadreza Taheri' }, description: 'd', pageUrl: 'https://ahmadreza.de/', isProfilePage: true };

test('entity JSON-LD: round-trips as JSON, Person and WebSite carry the name, the name variants are spellings only', () => {
  const graph = JSON.parse(serialiseJsonLd(structuredData(entity)))['@graph'];
  const person = graph.find((node) => node['@type'] === 'Person');
  const website = graph.find((node) => node['@type'] === 'WebSite');
  assert.equal(person.name, 'Ahmadreza Taheri');
  assert.equal(website.name, 'Ahmadreza Taheri');
  assert.equal(website.url, 'https://ahmadreza.de/');
  assert.deepEqual(person.alternateName, ['Ahmadreza', 'Taheri', 'Ahmad Reza Taheri', 'احمدرضا', 'احمدرضا طاهری']);
  assert.ok(Array.isArray(person.sameAs ?? []));
});

test('entity JSON-LD: Amonel is its own work with the Person as creator, never part of the Person', () => {
  const graph = structuredData(entity)['@graph'];
  const person = graph.find((node) => node['@type'] === 'Person');
  const brand = graph.find((node) => node.name === 'Amonel');
  assert.equal(brand['@type'], 'CreativeWork');
  assert.notEqual(brand['@id'], person['@id']);
  assert.equal(brand.creator['@id'], person['@id']);
  assert.doesNotMatch(JSON.stringify(person), /Amonel/i);
  assert.ok(![graph.find((node) => node['@type'] === 'WebSite')].some((node) => /Amonel/i.test(node.name)));
});

test('entity JSON-LD: the primary image is an ImageObject on the ProfilePage, named after the person', () => {
  const graph = structuredData(entity)['@graph'];
  const page = graph.find((node) => node['@type'] === 'ProfilePage');
  const image = graph.find((node) => node['@type'] === 'ImageObject');
  assert.equal(page.primaryImageOfPage['@id'], image['@id']);
  assert.match(image.url, /\/og\/ahmadreza-taheri-de\.png$/);
});

test('entity: every locale and the coming-soon pages keep Amonel out of the Person, and og:image / twitter:image use the renamed file', () => {
  const layout = read('src/app/[[...locale]]/layout.tsx');
  assert.equal([...layout.matchAll(/\/og\/ahmadreza-taheri-\$\{locale\}\.png/g)].length, 3, 'openGraph, twitter and JSON-LD');
  assert.doesNotMatch(layout, /\/og\/og-/);
  const soon = read('soon/index.html');
  assert.match(soon, /property="og:image" content="https:\/\/ahmadreza\.de\/og\/ahmadreza-taheri-de\.png"/);
  assert.match(soon, /name="twitter:image" content="https:\/\/ahmadreza\.de\/og\/ahmadreza-taheri-de\.png"/);
  for (const locale of ['de', 'en', 'fa']) {
    assert.ok(existsSync(`public/og/ahmadreza-taheri-${locale}.png`), locale);
    const site = JSON.parse(read(`src/messages/${locale}.json`)).site;
    assert.ok(site.knowsAbout.length >= 7, `${locale} knowsAbout`);
  }
});
