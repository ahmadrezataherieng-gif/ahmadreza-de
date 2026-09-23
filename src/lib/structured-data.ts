/**
 * The schema.org graph each indexed page carries as JSON-LD (the `seo` skill,
 * ROADMAP SEO-03): the Person, the WebSite, and on the landing page a
 * ProfilePage whose main entity is the Person. One `@id` per node, so every
 * page describes the same person and site rather than new ones.
 *
 * Never the legal name or the postal address: those belong to the Impressum
 * alone (DECISIONS.md 58). `image` waits for the portrait and `sameAs` for the
 * owner's profiles (ROADMAP OWN-01, OWN-03); both are added here when they
 * exist. Relative imports so plain node can test it.
 * CONTENT-TODO CR-1046
 */

import { EMAIL } from '../content/profile.ts';
import { SITE_URL } from './constants.ts';

export interface PersonCopy {
  /** Display name, identical in every language. */
  name: string;
  /** The Persian spelling, احمدرضا طاهری. */
  persianName: string;
  jobTitle: string;
  knowsAbout: readonly string[];
  /** The page's own language tag, e.g. `de-DE`. */
  inLanguage: string;
  /** The site's name, Amonel. */
  siteName: string;
  description: string;
  /** Absolute URL of the page carrying the graph. */
  pageUrl: string;
  isProfilePage: boolean;
}

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type JsonLd = Record<string, unknown>;

export function structuredData(copy: PersonCopy): JsonLd {
  const person: JsonLd = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: copy.name,
    alternateName: [copy.persianName],
    jobTitle: copy.jobTitle,
    url: `${SITE_URL}/`,
    address: { '@type': 'PostalAddress', addressLocality: 'Trier', addressCountry: 'DE' },
    knowsAbout: [...copy.knowsAbout],
    knowsLanguage: ['de', 'en', 'fa'],
    ...(EMAIL.available ? { email: `mailto:${EMAIL.address}` } : {}),
  };
  const website: JsonLd = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: copy.siteName,
    url: `${SITE_URL}/`,
    inLanguage: ['de-DE', 'en', 'fa-IR'],
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };
  const graph: JsonLd[] = [person, website];
  if (copy.isProfilePage) {
    graph.push({
      '@type': 'ProfilePage',
      '@id': `${copy.pageUrl}#profile`,
      url: copy.pageUrl,
      name: `${copy.name} – ${copy.jobTitle}`,
      description: copy.description,
      inLanguage: copy.inLanguage,
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: { '@id': PERSON_ID },
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON for a `<script type="application/ld+json">`, safe inside HTML. */
export function serialiseJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
