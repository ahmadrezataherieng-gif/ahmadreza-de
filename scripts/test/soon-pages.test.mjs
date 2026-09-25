// SEO-15: the coming-soon page exists as three real, separately indexable pages -
// German at /, English at /en/, Persian at /fa/ - rendered from one template and
// one copy table. Checked on the rendered HTML, so no script has to run.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { SEO, T } from '../../soon/copy.mjs';
import { renderLanding } from '../soon-pages.mjs';
import { fillPlaceholders, progressValues } from '../soon-progress.mjs';
import { alternateLinks, graphJsonLd, jsonLdScript, LOCALES, OG_IMAGES, personJsonLd, sitemapXml } from '../soon-seo.mjs';

const template = readFileSync(new URL('../../soon/index.html', import.meta.url), 'utf8');
const filled = fillPlaceholders(template.replace('/*@tokens*/', ''), progressValues());
const pages = Object.fromEntries(LOCALES.map((locale) => [locale.id, renderLanding(filled, locale.id, 2026)]));
const tag = (html, pattern) => html.match(pattern)?.[1];
const meta = (html, attribute, name) => tag(html, new RegExp(`<meta ${attribute}="${name}" content="([^"]*)">`));
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const visibleText = (html) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\s+/g, ' '));

test('soon pages: the German copy table is what the template shows, and every key exists in all three languages', () => {
  const plain = ['dir', 'counts', 'prefix', 'language', 'legalNav', 'title'];
  for (const [key, value] of Object.entries(T.de)) {
    if (!plain.includes(key)) assert.ok(template.includes(`data-t="${key}">${value}</`), `the template text for "${key}" differs from soon/copy.mjs`);
  }
  assert.equal(tag(template, /<title>([^<]*)<\/title>/), T.de.title);
  assert.equal(decode(meta(template, 'name', 'description')), SEO.de.description);
  const keys = [...template.matchAll(/data-t(?:-label)?="(\w+)"/g)].map((match) => match[1]);
  for (const id of ['de', 'en', 'fa']) for (const key of keys) assert.ok(key in T[id], `${id} has no "${key}"`);
});

test('soon pages: lang, dir, title, description and canonical are per language', () => {
  for (const locale of LOCALES) {
    const html = pages[locale.id];
    assert.ok(html.includes(`<html lang="${locale.id}" dir="${locale.dir}">`), `${locale.id} lang/dir`);
    const title = decode(tag(html, /<title>([^<]*)<\/title>/));
    assert.equal(title, T[locale.id].title);
    assert.ok(title.length <= 60, `${locale.id} title is ${title.length} characters`);
    const description = decode(meta(html, 'name', 'description'));
    assert.equal(description, SEO[locale.id].description);
    assert.ok(description.length >= 100 && description.length <= 160, `${locale.id} description is ${description.length} characters`);
    assert.ok(html.includes(`<link rel="canonical" href="https://ahmadreza.de/${locale.prefix}">`), `${locale.id} canonical`);
    assert.equal(meta(html, 'name', 'robots'), 'index,follow');
    assert.doesNotMatch(html, /\{\{|@jsonld|@tokens|@alternates/);
  }
  // The Persian title carries the name in Persian script; the others the Latin name.
  assert.ok(pages.fa.includes('<title>احمدرضا طاهری'));
  assert.ok(T.en.title.startsWith('Ahmadreza Taheri') && T.de.title.startsWith('Ahmadreza Taheri'));
});

test('soon pages: hreflang alternates cover de, en, fa and x-default on every page', () => {
  const expected = alternateLinks();
  assert.deepEqual([...expected.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((match) => [match[1], match[2]]), [
    ['de', 'https://ahmadreza.de/'],
    ['en', 'https://ahmadreza.de/en/'],
    ['fa', 'https://ahmadreza.de/fa/'],
    ['x-default', 'https://ahmadreza.de/'],
  ]);
  for (const locale of LOCALES) assert.ok(pages[locale.id].includes(expected), `${locale.id} has the alternates`);
});

test('soon pages: the text is in the page language, nothing is left over from another', () => {
  const en = visibleText(pages.en);
  const de = visibleText(pages.de);
  const fa = visibleText(pages.fa);
  assert.ok(en.includes(T.en.intro) && en.includes(T.en.whatTitle) && en.includes(T.en.next));
  assert.ok(!en.includes(T.de.intro) && !en.includes(T.de.whatTitle));
  assert.ok(de.includes(T.de.intro) && !de.includes(T.en.intro));
  assert.ok(fa.includes(T.fa.whatTitle) && !fa.includes(T.de.intro) && !fa.includes(T.en.intro));
  // Numbers and the date in the page language: Persian digits and calendar in fa.
  assert.match(fa, /[۰-۹]+٪/);
  assert.doesNotMatch(fa, /\b\d+ ?%/);
  assert.match(en, /Last updated: /);
  assert.match(de, /Stand: \d+\. \S+ \d{4}/);
  assert.match(fa, /آخرین به‌روزرسانی: [۰-۹]+ \S+ [۰-۹]{4}/);
  assert.ok(en.includes('done ·') && de.includes('fertig ·') && fa.includes('انجام شده'));
});

test('soon pages: the language links are real URLs, the current one marked; the legal links follow the language', () => {
  for (const locale of LOCALES) {
    const html = pages[locale.id];
    const nav = html.match(/<nav class="langs"[^>]*>([\s\S]*?)<\/nav>/)[1];
    assert.deepEqual([...nav.matchAll(/<a href="([^"]*)" hreflang="(\w+)"/g)].map((match) => [match[2], match[1]]), [['de', '/'], ['en', '/en/'], ['fa', '/fa/']]);
    assert.equal(nav.match(/aria-current="page"/g)?.length, 1);
    assert.ok(new RegExp(`hreflang="${locale.id}" lang="${locale.id}" aria-current="page"`).test(nav), `${locale.id} is the current link`);
    // The only button is the sun/moon toggle (DECISIONS 74), and it labels its action in the page language.
    assert.deepEqual([...html.matchAll(/<button [^>]*class="scheme"/g)].length, 1);
    assert.equal(html.match(/<button/g)?.length, 1);
    assert.ok(html.includes(`<a href="/${locale.prefix}impressum/"`) && html.includes(`<a href="/${locale.prefix}datenschutz/"`));
    assert.ok(html.includes(`<a class="logo" href="/${locale.prefix}"`));
  }
});

test('soon pages: Persian text isolates its Latin terms in <bdi>; English and German use none', () => {
  const strip = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  const fa = strip(pages.fa);
  assert.match(fa, /<bdi>Amonel OS<\/bdi>/);
  assert.match(fa, /<bdi>ENIAC<\/bdi>/);
  assert.doesNotMatch(strip(pages.en), /<bdi>/);
  assert.doesNotMatch(strip(pages.de), /<bdi>/);
});

test('soon pages: the name is visible in both scripts on every page; JSON-LD and share tags are per language', () => {
  for (const locale of LOCALES) {
    const html = pages[locale.id];
    const text = visibleText(html);
    assert.ok(text.includes('Ahmadreza Taheri') && text.includes('احمدرضا طاهری'), `${locale.id}: both names visible`);
    assert.match(html, /<h1>Ahmadreza Taheri<\/h1>/);
    const inner = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    assert.deepEqual(JSON.parse(inner), graphJsonLd(locale.id));
    assert.ok(html.includes(jsonLdScript(locale.id)));
    assert.equal(personJsonLd(locale.id).url, 'https://ahmadreza.de/', 'the one entity URL in every language');
    assert.equal(personJsonLd(locale.id)['@id'], 'https://ahmadreza.de/#person', 'one Person entity across the languages');
    assert.ok(personJsonLd(locale.id).alternateName.includes('احمدرضا طاهری'));
    assert.equal(meta(html, 'property', 'og:url'), `https://ahmadreza.de/${locale.prefix}`);
    assert.equal(meta(html, 'property', 'og:locale'), locale.ogLocale);
    assert.equal(meta(html, 'property', 'og:image'), OG_IMAGES[locale.id].url);
    assert.equal(decode(meta(html, 'property', 'og:title')), T[locale.id].title);
    assert.equal(decode(meta(html, 'name', 'twitter:title')), T[locale.id].title);
    assert.deepEqual(
      [...html.matchAll(/og:locale:alternate" content="([^"]*)"/g)].map((match) => match[1]).sort(),
      LOCALES.filter((other) => other.id !== locale.id).map((other) => other.ogLocale).sort(),
    );
    assert.doesNotMatch(html, /display:\s*none|visibility:\s*hidden|\shidden[\s>]/);
  }
});

test('soon pages: the sitemap lists the three pages, each with all alternates; the legal pages stay out', () => {
  const xml = sitemapXml('2026-09-24');
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]), ['https://ahmadreza.de/', 'https://ahmadreza.de/en/', 'https://ahmadreza.de/fa/']);
  assert.equal(xml.match(/hreflang="x-default"/g)?.length, 3);
  assert.equal(xml.match(/xhtml:link rel="alternate"/g)?.length, 12);
  assert.doesNotMatch(xml, /impressum|datenschutz/);
});

test('soon pages: the storage entry the privacy policy describes is the only one, and only a language click writes it', () => {
  const script = template.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.deepEqual([...new Set([...script.matchAll(/localStorage\.\w+\('([^']+)'/g)].map((match) => match[1]))], ['ao-lang']);
  assert.match(script, /location\.pathname==='\/'/, 'only the bare address follows the remembered language');
  assert.doesNotMatch(script, /navigator\.language/, 'no guessing by browser language: a crawler must see every language');
});
