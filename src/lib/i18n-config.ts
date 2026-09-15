export const locales = ['de', 'en', 'fa'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

/** Locales that render right-to-left. */
export const rtlLocales: readonly Locale[] = ['fa'];

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

export function dirForLocale(locale: Locale): 'ltr' | 'rtl' {
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

/** BCP-47 tags used for hreflang and <html lang>. */
export const htmlLang: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en',
  fa: 'fa-IR',
};
