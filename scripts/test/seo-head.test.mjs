// Queue 7 (2026-09-26, from "External SEO check 2026-09-26", owner decisions):
// og:locale in Open Graph form, Persian as plain `fa` everywhere, a real
// dateModified on the ProfilePage, no hreflang on the noindex legal pages, and
// the desktop's static text for search engines with distinct titles and fuller
// descriptions. The built folders (out/, soon/dist/) are checked when they exist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { htmlLang, ogLocale } from '../../src/lib/i18n-config.ts';
import { structuredData } from '../../src/lib/structured-data.ts';
import { graphJsonLd } from '../soon-seo.mjs';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const exists = (path) => existsSync(new URL(path, root));
const LOCALES = ['de', 'en', 'fa'];
const messages = Object.fromEntries(LOCALES.map((locale) => [locale, JSON.parse(read(`src/messages/${locale}.json`))]));
const BASE_APPS = ['about', 'terminal', 'tickets', 'traceroute', 'assistant', 'contact', 'timeline', 'cv', 'quiz'];
const copy = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: [], inLanguage: 'fa', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-fa.png', width: 1200, height: 630, alt: 'alt' }, description: 'd', pageUrl: 'https://ahmadreza.de/fa/', isProfilePage: true };

function walk(folder) {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

test('7a: og:locale is language_TERRITORY, never the <html lang> tag', () => {
  assert.deepEqual(ogLocale, { de: 'de_DE', en: 'en_US', fa: 'fa_IR' });
  assert.match(read('src/app/[[...locale]]/layout.tsx'), /locale: ogLocale\[locale\]/);
});

test('7b: Persian is plain `fa` for every Persian speaker - lang, hreflang, inLanguage, sitemap, coming-soon', () => {
  assert.equal(htmlLang.fa, 'fa');
  const website = structuredData(copy)['@graph'].find((node) => node['@type'] === 'WebSite');
  assert.deepEqual(website.inLanguage, ['de-DE', 'en', 'fa']);
  const soonPage = graphJsonLd('fa')['@graph'].find((node) => node['@type'] === 'ProfilePage');
  assert.equal(soonPage.inLanguage, 'fa');
  const sources = ['src/lib/i18n-config.ts', 'src/lib/structured-data.ts', 'src/app/sitemap.ts', 'src/app/[[...locale]]/layout.tsx', 'scripts/soon-seo.mjs', 'scripts/soon-pages.mjs', 'soon/index.html'];
  for (const file of sources) assert.doesNotMatch(read(file), /['"]fa-IR['"]/, file);
});

test('7c: the ProfilePage carries dateModified only when a real date is known', () => {
  const page = (extra) => structuredData({ ...copy, ...extra })['@graph'].find((node) => node['@type'] === 'ProfilePage');
  assert.equal(page({ dateModified: '2026-09-26T10:00:00.000Z' }).dateModified, '2026-09-26T10:00:00.000Z');
  assert.ok(!('dateModified' in page({})), 'no date, no field - never an invented one');
  assert.equal(graphJsonLd('de', '2026-09-26')['@graph'].find((node) => node['@type'] === 'ProfilePage').dateModified, '2026-09-26');
  const layout = read('src/app/[[...locale]]/layout.tsx');
  assert.match(layout, /dateModified: lastChange\(\)\?\.toISOString\(\)/);
  assert.match(read('src/app/sitemap.ts'), /import \{ lastChange \} from '@\/lib\/last-change'/, 'the sitemap and the ProfilePage share one date');
});

test('7e: the desktop text for search engines exists in every language, stays on the server, and names every app', () => {
  for (const locale of LOCALES) {
    const seo = messages[locale].desktopSeo;
    for (const key of ['pageName', 'heading', 'intro', 'baseHeading', 'bonusHeading', 'bonusIntro']) assert.ok(seo[key]?.length > 0, `${locale} desktopSeo.${key}`);
    assert.deepEqual(Object.keys(seo.base), BASE_APPS, `${locale}: one line per base app, in registry order`);
    assert.ok(seo.intro.includes('Amonel OS') && seo.intro.includes(messages[locale].site.author), `${locale} intro names the OS and the person`);
    const description = messages[locale].site.desktopDescription;
    assert.ok(description.length >= 140 && description.length <= 160, `${locale} desktop description: ${description.length} characters`);
    assert.ok(!('pageName' in messages[locale].os), `${locale}: the title part moved to desktopSeo`);
  }
  assert.notEqual(messages.de.desktopSeo.pageName, messages.en.desktopSeo.pageName, 'German and English desktop titles differ');
  const viewMessages = read('src/lib/view-messages.ts');
  assert.doesNotMatch(viewMessages.match(/VIEW_NAMESPACES = \{[\s\S]*?\} as const/)[0], /desktopSeo/, 'never serialised for the client');
  const desktop = read('src/components/os/Desktop.tsx');
  assert.match(desktop, /<div className="ao-sr-only">/);
  assert.doesNotMatch(desktop.slice(desktop.indexOf('desktopSeo'), desktop.indexOf('ao-desktop-screen')), /<a /, 'no focusable link in the hidden text');
});

test('built out/: og:locale, hreflang, no fa-IR, legal pages without hreflang, dateModified, the desktop text', (context) => {
  if (!exists('out/index.html')) return context.skip('run npm run build first');
  const html = (path) => read(`out/${path}`);
  for (const file of walk(new URL('out/', root).pathname.replace(/^\/([A-Za-z]:)/, '$1')).filter((path) => /\.(html|xml|txt)$/.test(path))) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /fa-IR/, file);
  }
  const prefix = { de: '', en: 'en/', fa: 'fa/' };
  const og = { de: 'de_DE', en: 'en_US', fa: 'fa_IR' };
  for (const locale of LOCALES) {
    for (const view of ['', 'amonel/', 'desktop/', 'about/']) {
      const page = html(`${prefix[locale]}${view}index.html`);
      assert.ok(page.includes(`property="og:locale" content="${og[locale]}"`), `${locale} ${view} og:locale`);
      assert.deepEqual([...page.matchAll(/<link rel="alternate" hrefLang="([^"]+)"/g)].map((match) => match[1]), ['de-DE', 'en', 'fa', 'x-default'], `${locale} ${view} hreflang`);
    }
    assert.ok(html(`${prefix[locale]}index.html`).includes(`<html lang="${htmlLang[locale]}"`), `${locale} lang`);
    for (const view of ['impressum/', 'datenschutz/']) {
      const page = html(`${prefix[locale]}${view}index.html`);
      assert.doesNotMatch(page, /<link rel="alternate" hrefLang/, `${locale} ${view}: no hreflang on a noindex page`);
      assert.match(page, /<link rel="canonical"/, `${locale} ${view} keeps its canonical`);
    }
    // React separates adjacent text with <!-- -->; the reader sees one sentence.
    const desktop = html(`${prefix[locale]}desktop/index.html`).replaceAll('<!-- -->', '');
    const seo = messages[locale].desktopSeo;
    assert.ok(desktop.includes(`<title>${seo.pageName} – `), `${locale} desktop title`);
    for (const id of BASE_APPS) assert.ok(desktop.includes(`${messages[locale].os.apps[id].title}: `), `${locale} desktop text names ${id}`);
    assert.ok(desktop.includes(seo.heading), `${locale} desktop text is in the HTML`);
  }
  const lastmod = html('sitemap.xml').match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  const modified = html('index.html').match(/"dateModified":"([^"]+)"/)?.[1];
  assert.ok(lastmod && modified === lastmod, `ProfilePage dateModified ${modified} = sitemap lastmod ${lastmod}`);
});

test('built soon/dist/: Persian as fa and a dateModified on every ProfilePage', (context) => {
  if (!exists('soon/dist/index.html')) return context.skip('run npm run build:soon first');
  for (const folder of ['', 'en/', 'fa/']) {
    const page = read(`soon/dist/${folder}index.html`);
    assert.doesNotMatch(page, /fa-IR/, folder || 'de');
    const graph = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    assert.match(graph.find((node) => node['@type'] === 'ProfilePage').dateModified ?? '', /^\d{4}-\d{2}-\d{2}$/, `${folder || 'de'} dateModified`);
  }
});
