import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/constants';
import { htmlLang, locales } from '@/lib/i18n-config';
import { views, viewHref, type View } from '@/lib/routing';

// A static file in the export: `out/sitemap.xml`.
export const dynamic = 'force-static';

/**
 * Pages worth indexing. The legal pages are `noindex` (DECISIONS.md 58) and
 * so never listed here.
 */
const INDEXED: readonly View[] = views.filter((view) => view !== 'imprint' && view !== 'privacy');

/**
 * Every indexed page in every locale, each with its hreflang alternates and
 * `x-default` (German), matching the `alternates` each page emits itself.
 * CONTENT-TODO CR-1048
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXED.flatMap((view) => {
    const languages = {
      ...Object.fromEntries(locales.map((locale) => [htmlLang[locale], `${SITE_URL}${viewHref(locale, view)}`])),
      'x-default': `${SITE_URL}${viewHref('de', view)}`,
    };
    return locales.map((locale) => ({
      url: `${SITE_URL}${viewHref(locale, view)}`,
      changeFrequency: 'monthly' as const,
      priority: view === 'landing' ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
