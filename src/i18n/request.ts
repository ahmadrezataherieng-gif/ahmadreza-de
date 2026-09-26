import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/lib/i18n-config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    // Nothing here formats a date or time through next-intl; naming a zone stops
    // its server-side build warning (ENVIRONMENT_FALLBACK) about a missing one.
    timeZone: 'Europe/Berlin',
    // The apps' own copy (messages/apps/) loads with each app, never with a
    // page; the legal copy (messages/legal/) only on the two legal pages.
    // The exception is About's, which the static About page renders on the
    // server (server messages are never shipped to the browser).
    messages: {
      ...(await import(/* webpackExclude: /[\\/](apps|legal)[\\/]/ */ `../messages/${locale}.json`)).default,
      about: (await import(`../messages/apps/about/${locale}.json`)).default,
    },
  };
});
