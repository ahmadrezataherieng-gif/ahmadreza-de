import { defaultLocale, isLocale, type Locale } from '@/lib/i18n-config';

/**
 * URL shape.
 *
 * German is the default locale and is served at the root path, so it carries no
 * prefix. English and Persian are prefixed. This is expressed with an optional
 * catch-all route segment (`app/[[...locale]]`) rather than middleware, because
 * `output: 'export'` produces plain files and never runs middleware.
 */

/** Read the locale out of the optional catch-all segment. */
export function localeFromSegments(segments: string[] | undefined): Locale {
  const first = segments?.[0];
  return isLocale(first) ? first : defaultLocale;
}

/** Path prefix for a locale: '' for German, '/en' and '/fa' otherwise. */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? '' : `/${locale}`;
}

/** Build an in-app href for a locale. `path` is locale-independent, e.g. '/impressum'. */
export function localeHref(locale: Locale, path = '/'): string {
  const normalised = path === '/' ? '/' : path.replace(/\/$/, '');
  const prefix = localePrefix(locale);
  if (normalised === '/') return prefix === '' ? '/' : `${prefix}/`;
  return `${prefix}${normalised}/`;
}

/** Strip the locale prefix from a pathname, yielding the locale-independent path. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|fa)(?=\/|$)/);
  const rest = match ? pathname.slice(match[0].length) : pathname;
  return rest === '' ? '/' : rest;
}
