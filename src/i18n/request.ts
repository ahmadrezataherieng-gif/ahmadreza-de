import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/lib/i18n-config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    // The apps' own copy (messages/apps/) loads with each app, never with a page.
    messages: (await import(/* webpackExclude: /[\\/]apps[\\/]/ */ `../messages/${locale}.json`)).default,
  };
});
