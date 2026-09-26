import { getMessages } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';

import type { Locale } from '@/lib/i18n-config';

/**
 * The messages a view's client components read, for the two views that have a
 * client message provider: the journey and the desktop. The static pages (the
 * landing page, About, the legal pages) have none - their client islands take
 * their words as props (queue 3c) - and the provider itself, with the message
 * formatter behind it, loads only inside the journey's and the shell's own
 * chunks (`JourneyRoot`, `ShellRoot`).
 *
 * Everything handed to the client is serialised into the page's HTML, so each
 * view gets only its namespaces, and never the puzzles' - those load with the
 * puzzle chunk when a puzzle opens.
 */
const VIEW_NAMESPACES = {
  journey: ['site', 'nav', 'languages', 'journey', 'eras', 'convergence', 'crossings', 'mode'],
  // No era, journey or puzzle copy: the desktop loads none of that code either.
  desktop: ['site', 'nav', 'languages', 'os'],
} as const;

/** `site` keys used only by metadata and JSON-LD, never by a client component. */
const SERVER_ONLY_SITE_KEYS: readonly string[] = [
  'ogAlt',
  'journeyDescription',
  'desktopDescription',
  'aboutDescription',
  'persianName',
  'jobTitle',
  'knowsAbout',
  'landingTitle',
];

export async function viewMessages(locale: Locale, view: keyof typeof VIEW_NAMESPACES): Promise<AbstractIntlMessages> {
  const all = await getMessages({ locale });
  return Object.fromEntries(
    Object.entries(all)
      .filter(([namespace]) => (VIEW_NAMESPACES[view] as readonly string[]).includes(namespace))
      // The SEO-only `site` keys feed metadata and JSON-LD on the server; no
      // client component reads them, so they stay out of the page payload
      // (the desktop's description would otherwise put the quiz into the
      // landing page's HTML).
      .map(([namespace, value]) =>
        namespace === 'site' && typeof value === 'object'
          ? [namespace, Object.fromEntries(Object.entries(value).filter(([key]) => !SERVER_ONLY_SITE_KEYS.includes(key)))]
          : [namespace, value],
      ),
  );
}
