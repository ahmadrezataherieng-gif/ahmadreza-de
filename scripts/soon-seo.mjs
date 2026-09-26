// The coming-soon pages' search-engine data (ROADMAP BR-02 and SEO-15): the
// Person JSON-LD, the sitemap and the three language versions' addresses. All
// built from the site's own single sources - messages/<locale>.json `site`,
// the same builder - so they never drift from the main site
// (`src/lib/structured-data.ts`). Separate from build-soon.mjs so the tests can
// validate them without the legal address.
//
// Never the legal name, the street or the postal code, and never the employer
// (DECISIONS.md 58, ROADMAP LEG-08): a city and a country only.
// CONTENT-TODO CR-1084

import { readFileSync } from 'node:fs';

import { SITE_URL } from '../src/lib/constants.ts';
import { serialiseJsonLd, structuredData } from '../src/lib/structured-data.ts';

const messages = (locale) => JSON.parse(readFileSync(new URL(`../src/messages/${locale}.json`, import.meta.url), 'utf8')).site;

/** The three coming-soon pages: German at /, English at /en/, Persian at /fa/ (right to left). */
export const LOCALES = [
  { id: 'de', prefix: '', dir: 'ltr', label: 'DE', ogLocale: 'de_DE' },
  { id: 'en', prefix: 'en/', dir: 'ltr', label: 'EN', ogLocale: 'en_US' },
  { id: 'fa', prefix: 'fa/', dir: 'rtl', label: 'FA', ogLocale: 'fa_IR' },
];

/** The absolute URL of a locale's coming-soon page. */
export const pageUrl = (locale) => `${SITE_URL}/${locale.prefix}`;

/** The whole schema.org graph (Person, WebSite, Amonel, image, ProfilePage) for one coming-soon page: the main site's own builder, so the two never drift. */
export function graphJsonLd(localeId = 'de', dateModified = undefined) {
  const site = messages(localeId);
  const locale = LOCALES.find((entry) => entry.id === localeId);
  return structuredData({
    name: site.author,
    jobTitle: site.jobTitle,
    knowsAbout: [...site.knowsAbout],
    // Persian for every Persian speaker, not only those in Iran (queue 7b): `fa`, as the main site.
    inLanguage: { de: 'de-DE', en: 'en', fa: 'fa' }[localeId],
    dateModified,
    siteName: site.brand,
    image: { url: `${SITE_URL}/og/ahmadreza-taheri-${localeId}.png`, width: 1200, height: 630, alt: site.ogAlt },
    description: site.description,
    pageUrl: pageUrl(locale),
    isProfilePage: true,
  });
}

/** The Person node of that graph. */
export const personJsonLd = (localeId = 'de') => ({ '@context': 'https://schema.org', ...graphJsonLd(localeId)['@graph'][0] });

/** The `<script>` element that goes into a page's head. */
export function jsonLdScript(localeId = 'de', dateModified = undefined) {
  return `<script type="application/ld+json">${serialiseJsonLd(graphJsonLd(localeId, dateModified))}</script>`;
}

/** hreflang alternates for the head (every language, itself included, and x-default = German). */
export function alternateLinks() {
  const links = LOCALES.map((locale) => `<link rel="alternate" hreflang="${locale.id}" href="${pageUrl(locale)}">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${pageUrl(LOCALES[0])}">`);
  return links.join('\n');
}

/** Three indexable URLs, each listing all alternates: the legal pages are noindex and stay out, as on the real site. */
export function sitemapXml(date) {
  const alternates = [...LOCALES.map((locale) => [locale.id, pageUrl(locale)]), ['x-default', pageUrl(LOCALES[0])]]
    .map(([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`)
    .join('\n');
  const urls = LOCALES.map((locale) => `  <url>\n    <loc>${pageUrl(locale)}</loc>\n    <lastmod>${date}</lastmod>\n${alternates}\n  </url>\n`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}</urlset>\n`;
}

/** The share image per language (public/og/, made by scripts/og-image.mjs). */
export const OG_IMAGES = Object.fromEntries(
  LOCALES.map((locale) => [locale.id, { file: `public/og/ahmadreza-taheri-${locale.id}.png`, path: `og/ahmadreza-taheri-${locale.id}.png`, url: `${SITE_URL}/og/ahmadreza-taheri-${locale.id}.png`, width: 1200, height: 630 }]),
);
export const OG_IMAGE = OG_IMAGES.de;
