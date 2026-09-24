// The coming-soon page's search-engine data (ROADMAP BR-02, Part 4 of the
// 2026-09-24 brief): the Person JSON-LD and the sitemap. Both are built from the
// site's own single sources - messages/de.json `site`, EMAIL, PROFILES - so they
// never drift from the main site (`src/lib/structured-data.ts`). Separate from
// build-soon.mjs so the tests can validate them without the legal address.
//
// Never the legal name, the street or the postal code, and never the employer
// (DECISIONS.md 58, ROADMAP LEG-08): a city and a country only.
// CONTENT-TODO CR-1084

import { readFileSync } from 'node:fs';

import { EMAIL } from '../src/content/profile.ts';
import { PROFILES } from '../src/content/profiles.ts';
import { SITE_URL } from '../src/lib/constants.ts';
import { serialiseJsonLd } from '../src/lib/structured-data.ts';

const site = JSON.parse(readFileSync(new URL('../src/messages/de.json', import.meta.url), 'utf8')).site;

/** schema.org Person for the coming-soon page. Empty profiles are skipped. */
export function personJsonLd() {
  const sameAs = PROFILES.flatMap((profile) => (profile.url ? [profile.url] : []));
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: site.author,
    alternateName: site.persianName,
    jobTitle: site.jobTitle,
    url: `${SITE_URL}/`,
    address: { '@type': 'PostalAddress', addressLocality: 'Trier', addressCountry: 'DE' },
    knowsLanguage: ['de', 'en', 'fa'],
    knowsAbout: [...site.knowsAbout],
    ...(EMAIL.available ? { email: `mailto:${EMAIL.address}` } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** The `<script>` element that goes into the page's head. */
export function jsonLdScript() {
  return `<script type="application/ld+json">${serialiseJsonLd(personJsonLd())}</script>`;
}

/** One indexable URL: the legal pages are noindex and stay out, as on the real site. */
export function sitemapXml(date) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${date}</lastmod>\n  </url>\n</urlset>\n`;
}

export const OG_IMAGE = { file: 'public/og/og-de.png', url: `${SITE_URL}/og/og-de.png`, width: 1200, height: 630 };
