import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-ext-400.css';
import '@fontsource-variable/vazirmatn/index.css';
import '@fontsource/vt323/latin-400.css';
import '@fontsource/press-start-2p/latin-400.css';
import '@/styles/globals.css';

import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { EraEffectsLayer } from '@/components/theme/EraEffectsLayer';
import { dirForLocale, htmlLang, locales, type Locale } from '@/lib/i18n-config';
import { localeFromSegments } from '@/lib/routing';
import { SITE_URL } from '@/lib/constants';

type LayoutParams = { locale?: string[] };

/**
 * German is generated at `/`, the other locales at `/en` and `/fa`.
 * `/de` is deliberately NOT generated: it would be a duplicate of `/`.
 * nginx should 301 `/de/` to `/`.
 */
export function generateStaticParams(): LayoutParams[] {
  return [
    { locale: [] },
    ...locales
      .filter((locale) => locale !== 'de')
      .map((locale) => ({ locale: [locale] })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const { locale: segments } = await params;
  const locale = localeFromSegments(segments);
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('title'),
      template: `%s — ${t('author')}`,
    },
    description: t('description'),
    alternates: {
      canonical: locale === 'de' ? '/' : `/${locale}/`,
      languages: {
        'de-DE': '/',
        en: '/en/',
        'fa-IR': '/fa/',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: htmlLang[locale],
      title: t('title'),
      description: t('description'),
      siteName: t('author'),
      url: locale === 'de' ? '/' : `/${locale}/`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { locale: segments } = await params;

  // A non-empty first segment that is not a known locale is a 404, not German.
  if (segments && segments.length > 0 && !isKnownLocale(segments[0])) {
    notFound();
  }

  const locale = localeFromSegments(segments);
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={htmlLang[locale]} dir={dirForLocale(locale)} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            {children}
            <EraEffectsLayer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function isKnownLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
