// The coming-soon page's search-engine layer (ROADMAP BR-02, Part 4 of the
// 2026-09-24 brief): title and description, visible names in both scripts, the
// Person JSON-LD, Open Graph and Twitter tags, robots.txt, sitemap.xml and the
// noindex legal pages. The built folder (soon/dist) is checked when it exists.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { EMAIL } from '../../src/content/profile.ts';
import { PROFILES } from '../../src/content/profiles.ts';
import { jsonLdScript, OG_IMAGE, personJsonLd, sitemapXml } from '../soon-seo.mjs';
import { EMPLOYER } from './employer-name.mjs';
import { leaksAddress } from './private-address.mjs';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(`../../${path}`, import.meta.url));
const page = read('soon/index.html');
const meta = (attribute, name) => page.match(new RegExp(`<meta ${attribute}="${name}" content="([^"]*)">`))?.[1];
const TITLE = 'Ahmadreza Taheri – Fachinformatiker für Systemintegration in Ausbildung, Trier';

test('soon SEO: title and description carry the name, the role and the city', () => {
  assert.equal(page.match(/<title>([^<]*)<\/title>/)?.[1], TITLE);
  const description = meta('name', 'description');
  assert.ok(description.length >= 100 && description.length <= 160, `the description is ${description.length} characters`);
  for (const word of ['Ahmadreza Taheri', 'Fachinformatiker für Systemintegration', 'Trier', 'Amonel']) assert.ok(description.includes(word), word);
  assert.match(page, /<html lang="de" dir="ltr">/);
  assert.match(page, /<link rel="canonical" href="https:\/\/ahmadreza\.de\/">/);
  assert.equal(meta('name', 'robots'), 'index,follow');
});

test('soon SEO: the name is visible text - h1, a Persian line marked fa and rtl, an English line - never hidden', () => {
  assert.match(page, /<h1>Ahmadreza Taheri<\/h1>/);
  assert.match(page, /<p lang="fa" dir="rtl">احمدرضا طاهری،[^<]*<\/p>/);
  assert.match(page, /<p lang="en" dir="ltr">IT specialist for system integration in training, Trier[^<]*<\/p>/);
  // Nothing on the page is hidden from a visitor: no display:none, no hidden attribute, no off-screen text.
  assert.doesNotMatch(page, /display:\s*none|visibility:\s*hidden|\shidden[\s>]|text-indent:\s*-\d|clip:\s*rect\(0/);
  assert.doesNotMatch(page.replace(/<!--[\s\S]*?-->/g, ''), /aria-hidden="true"[^>]*>\s*(?:Ahmadreza|احمدرضا)/);
});

test('soon SEO: the Person JSON-LD is valid, has the right facts and nothing private', () => {
  const person = personJsonLd();
  assert.equal(person['@context'], 'https://schema.org');
  assert.equal(person['@type'], 'Person');
  assert.equal(person.name, 'Ahmadreza Taheri');
  assert.equal(person.alternateName, 'احمدرضا طاهری');
  assert.equal(person.jobTitle, 'Fachinformatiker für Systemintegration (in Ausbildung)');
  assert.equal(person.url, 'https://ahmadreza.de/');
  // A city and a country, never a street, a postcode or the employer.
  assert.deepEqual(person.address, { '@type': 'PostalAddress', addressLocality: 'Trier', addressCountry: 'DE' });
  assert.equal(person.email, `mailto:${EMAIL.address}`);
  const profiles = PROFILES.flatMap((profile) => (profile.url ? [profile.url] : []));
  if (profiles.length > 0) assert.deepEqual(person.sameAs, profiles);
  else assert.ok(!('sameAs' in person), 'an empty sameAs is left out');
  for (const url of person.sameAs ?? []) assert.match(url, /^https:\/\//);
  const text = JSON.stringify(person);
  assert.doesNotMatch(text, /Momrabadi|streetAddress|postalCode/i);
  assert.doesNotMatch(text, EMPLOYER);
  assert.ok(!leaksAddress(text));
  // The script element round-trips as JSON and cannot break out of the page.
  const script = jsonLdScript();
  const inner = script.match(/^<script type="application\/ld\+json">([\s\S]*)<\/script>$/)?.[1];
  assert.ok(inner && !inner.includes('<'), 'no raw < inside the script');
  assert.deepEqual(JSON.parse(inner), person);
  assert.equal(page.match(/<!--@jsonld-->/g)?.length, 1, 'one JSON-LD marker in the template');
});

test('soon SEO: Open Graph and Twitter tags point at the existing share image', () => {
  assert.equal(meta('property', 'og:type'), 'website');
  assert.equal(meta('property', 'og:url'), 'https://ahmadreza.de/');
  assert.equal(meta('property', 'og:title'), TITLE);
  assert.equal(meta('property', 'og:site_name'), 'Amonel');
  assert.equal(meta('property', 'og:locale'), 'de_DE');
  assert.equal(meta('property', 'og:image'), OG_IMAGE.url);
  assert.equal(meta('property', 'og:image:width'), '1200');
  assert.equal(meta('property', 'og:image:height'), '630');
  assert.ok(meta('property', 'og:image:alt').includes('Ahmadreza Taheri'));
  assert.ok(meta('property', 'og:description').length > 40);
  assert.equal(meta('name', 'twitter:card'), 'summary_large_image');
  assert.equal(meta('name', 'twitter:image'), OG_IMAGE.url);
  assert.equal(meta('name', 'twitter:title'), TITLE);
  assert.ok(meta('name', 'twitter:image:alt').includes('Ahmadreza Taheri'));
  // The image is a real 1200 x 630 PNG.
  const png = readFileSync(new URL(`../../${OG_IMAGE.file}`, import.meta.url));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});

test('soon SEO: robots.txt welcomes every crawler and names the sitemap; the sitemap has the one indexable URL', () => {
  const robots = read('public/robots.txt');
  assert.match(robots, /^User-agent: \*\nAllow: \//m);
  assert.doesNotMatch(robots, /^Disallow:\s*\S/m, 'nothing is disallowed - the noindex legal pages must stay crawlable');
  assert.ok(robots.includes('Sitemap: https://ahmadreza.de/sitemap.xml'));
  const xml = sitemapXml('2026-09-24');
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]), ['https://ahmadreza.de/']);
  assert.match(xml, /<lastmod>2026-09-24<\/lastmod>/);
  assert.doesNotMatch(xml, /impressum|datenschutz/);
});

test('soon SEO: the built folder has robots.txt, sitemap.xml, the share image, the JSON-LD; the legal pages are noindex', (context) => {
  if (!exists('soon/dist/index.html')) return context.skip('run npm run build:soon first');
  const dist = (path) => read(`soon/dist/${path}`);
  assert.equal(dist('robots.txt'), read('public/robots.txt'));
  assert.match(dist('sitemap.xml'), /<loc>https:\/\/ahmadreza\.de\/<\/loc>\s*<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.ok(exists('soon/dist/og/og-de.png'));
  const html = dist('index.html');
  const inner = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.deepEqual(JSON.parse(inner), personJsonLd());
  assert.doesNotMatch(html, /\{\{|@jsonld|@tokens/, 'nothing left unfilled');
  assert.doesNotMatch(html, /Momrabadi/);
  assert.ok(!leaksAddress(html));
  for (const path of ['impressum', 'datenschutz', 'en/impressum', 'en/datenschutz', 'fa/impressum', 'fa/datenschutz']) {
    assert.match(dist(`${path}/index.html`), /<meta name="robots" content="noindex,follow">/, path);
  }
});
