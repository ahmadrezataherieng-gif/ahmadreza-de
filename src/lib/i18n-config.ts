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

/**
 * BCP-47 tags used for hreflang and <html lang>. Persian is plain `fa`: the
 * site speaks to every Persian speaker (Iran, Afghanistan, Germany, anywhere),
 * not to Iran alone (queue 7b). Intl formats `fa` exactly as `fa-IR`.
 */
export const htmlLang: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en',
  fa: 'fa',
};

/** Open Graph wants `language_TERRITORY`, not a BCP-47 tag (queue 7a). */
export const ogLocale: Record<Locale, string> = {
  de: 'de_DE',
  en: 'en_US',
  fa: 'fa_IR',
};
