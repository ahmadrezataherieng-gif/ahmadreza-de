import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/lib/i18n-config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    // The apps' own copy (messages/apps/) loads with each app, never with a
    // page; the legal copy (messages/legal/) only on the two legal pages.
    messages: (await import(/* webpackExclude: /[\\/](apps|legal)[\\/]/ */ `../messages/${locale}.json`)).default,
  };
});
