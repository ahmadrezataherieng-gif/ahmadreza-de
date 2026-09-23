import { defaultLocale, isLocale, locales, type Locale } from './i18n-config.ts';

/**
 * URL shape.
 *
 * German is the default locale and is served without a prefix; English and
 * Persian are prefixed. Every locale has three views:
 *
 *   /             /en/            /fa/             the landing page
 *   /amonel/      /en/amonel/     /fa/amonel/      Act 1 and the Convergence (the journey)
 *   /desktop/     /en/desktop/    /fa/desktop/     Act 3, the Amonel OS desktop
 *   /about/       /en/about/      /fa/about/       the static About page (indexable text)
 *   /impressum/   /en/impressum/  /fa/impressum/   the Impressum (§ 5 DDG)
 *   /datenschutz/ /en/datenschutz/ /fa/datenschutz/ the Datenschutzerklärung
 *
 * The two legal pages keep their German slug in every language: it is what a
 * German court, a recruiter and a crawler all look for.
 *
 * All of it is one optional catch-all segment (`app/[[...locale]]`) rather than
 * middleware, because `output: 'export'` produces plain files and never runs
 * middleware, and because the catch-all is the only segment that knows the
 * locale early enough to emit a correct static `lang` and `dir`.
 */

export const views = ['landing', 'journey', 'desktop', 'about', 'imprint', 'privacy'] as const;
export type View = (typeof views)[number];

/**
 * URL path of each view, without the locale prefix. The journey's URL carries
 * the brand name (Phase 9A); inside the code the view is still `journey`. The
 * old `/journey/` URLs 301 here (`public/_redirects`).
 */
const VIEW_PATHS: Record<View, string> = {
  landing: '/',
  journey: '/amonel',
  desktop: '/desktop',
  about: '/about',
  imprint: '/impressum',
  privacy: '/datenschutz',
};

/** The path segment of each view that has one. */
const VIEW_SEGMENTS: Record<Exclude<View, 'landing'>, string> = {
  journey: 'amonel',
  desktop: 'desktop',
  about: 'about',
  imprint: 'impressum',
  privacy: 'datenschutz',
};

export interface RouteMatch {
  locale: Locale;
  view: View;
}

/**
 * Resolve the catch-all segments into a locale and a view, or null for a URL
 * that is not a page (a stray `favicon.ico`, `/de/`, `/en/nonsense/`).
 */
export function matchSegments(segments: string[] | undefined): RouteMatch | null {
  const parts = segments ?? [];
  let rest = parts;
  let locale: Locale = defaultLocale;

  // `/de` is never a URL: German lives at the root. `_redirects` 301s it.
  if (parts[0] !== undefined && parts[0] !== defaultLocale && isLocale(parts[0])) {
    locale = parts[0];
    rest = parts.slice(1);
  }

  if (rest.length === 0) return { locale, view: 'landing' };
  if (rest.length !== 1) return null;
  const view = (Object.keys(VIEW_SEGMENTS) as Array<keyof typeof VIEW_SEGMENTS>).find(
    (candidate) => VIEW_SEGMENTS[candidate] === rest[0],
  );
  return view ? { locale, view } : null;
}

/** Every page the static export must generate, as catch-all params. */
export function allRouteSegments(): string[][] {
  return locales.flatMap((locale) => {
    const prefix = locale === defaultLocale ? [] : [locale];
    return [prefix, ...Object.values(VIEW_SEGMENTS).map((segment) => [...prefix, segment])];
  });
}

/** Read the locale out of the optional catch-all segment. */
export function localeFromSegments(segments: string[] | undefined): Locale {
  return matchSegments(segments)?.locale ?? defaultLocale;
}

/** Path prefix for a locale: '' for German, '/en' and '/fa' otherwise. */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? '' : `/${locale}`;
}

/** Build an in-app href for a locale. `path` is locale-independent, e.g. '/amonel'. */
export function localeHref(locale: Locale, path = '/'): string {
  const normalised = path === '/' ? '/' : path.replace(/\/$/, '');
  const prefix = localePrefix(locale);
  if (normalised === '/') return prefix === '' ? '/' : `${prefix}/`;
  return `${prefix}${normalised}/`;
}

/** The href of a view in a locale, with the trailing slash the export uses. */
export function viewHref(locale: Locale, view: View): string {
  return localeHref(locale, VIEW_PATHS[view]);
}

/** Strip the locale prefix from a pathname, yielding the locale-independent path. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|fa)(?=\/|$)/);
  const rest = match ? pathname.slice(match[0].length) : pathname;
  return rest === '' ? '/' : rest;
}
