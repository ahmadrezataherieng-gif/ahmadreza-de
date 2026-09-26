/**
 * The schema.org graph each indexed page carries as JSON-LD (the `seo` skill,
 * ROADMAP SEO-03): the Person, the WebSite, and on the landing page a
 * ProfilePage whose main entity is the Person. One `@id` per node, so every
 * page describes the same person and site rather than new ones.
 *
 * Never the legal name or the postal address: those belong to the Impressum
 * alone (DECISIONS.md 58). Amonel is its own CreativeWork with the Person as
 * `creator`, never a name or alternateName of the Person. `sameAs` waits for the
 * owner's profiles (ROADMAP OWN-03); it is added here when they exist. Relative imports so plain node can test it.
 * CONTENT-TODO CR-1046
 */

import { EMAIL } from '../content/profile.ts';
import { PROFILES } from '../content/profiles.ts';
import { SITE_URL } from './constants.ts';

export interface PersonCopy {
  /** Display name, identical in every language. */
  name: string;
  jobTitle: string;
  knowsAbout: readonly string[];
  /** The page's own language tag, e.g. `de-DE` or `fa`. */
  inLanguage: string;
  /** The brand, Amonel: its own work, never part of the person. */
  siteName: string;
  /** The share image (also the page's primary image) and its alt text. */
  image: { url: string; width: number; height: number; alt: string };
  description: string;
  /** Absolute URL of the page carrying the graph. */
  pageUrl: string;
  isProfilePage: boolean;
  /** When the page last really changed (ISO 8601), for the ProfilePage; left out when unknown, never invented. */
  dateModified?: string;
}

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const BRAND_ID = `${SITE_URL}/#amonel`;

/**
 * Spellings of the name only - skills and activities belong in knowsAbout.
 * Machine text, identical in every language; never the legal name.
 */
export const NAME_VARIANTS: readonly string[] = ['Ahmadreza', 'Taheri', 'Ahmad Reza Taheri', 'احمدرضا', 'احمدرضا طاهری'];

type JsonLd = Record<string, unknown>;

export function structuredData(copy: PersonCopy): JsonLd {
  const sameAs = PROFILES.flatMap((profile) => (profile.url ? [profile.url] : []));
  const person: JsonLd = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: copy.name,
    alternateName: [...NAME_VARIANTS],
    jobTitle: copy.jobTitle,
    url: `${SITE_URL}/`,
    address: { '@type': 'PostalAddress', addressLocality: 'Trier', addressCountry: 'DE' },
    knowsAbout: [...copy.knowsAbout],
    knowsLanguage: ['de', 'en', 'fa'],
    ...(EMAIL.available ? { email: `mailto:${EMAIL.address}` } : {}),
    // The owner's profiles, as soon as `content/profiles.ts` has their URLs.
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
  const website: JsonLd = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: copy.name,
    url: `${SITE_URL}/`,
    inLanguage: ['de-DE', 'en', 'fa'],
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };
  const brand: JsonLd = {
    '@type': 'CreativeWork',
    '@id': BRAND_ID,
    name: copy.siteName,
    url: `${SITE_URL}/`,
    creator: { '@id': PERSON_ID },
  };
  const graph: JsonLd[] = [person, website, brand];
  if (copy.isProfilePage) {
    const imageId = `${copy.pageUrl}#primaryimage`;
    graph.push({
      '@type': 'ImageObject',
      '@id': imageId,
      url: copy.image.url,
      contentUrl: copy.image.url,
      width: copy.image.width,
      height: copy.image.height,
      caption: copy.image.alt,
    });
    graph.push({
      '@type': 'ProfilePage',
      '@id': `${copy.pageUrl}#profile`,
      url: copy.pageUrl,
      name: `${copy.name} – ${copy.jobTitle}`,
      description: copy.description,
      inLanguage: copy.inLanguage,
      isPartOf: { '@id': WEBSITE_ID },
      primaryImageOfPage: { '@id': imageId },
      mainEntity: { '@id': PERSON_ID },
      ...(copy.dateModified ? { dateModified: copy.dateModified } : {}),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON for a `<script type="application/ld+json">`, safe inside HTML. */
export function serialiseJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
