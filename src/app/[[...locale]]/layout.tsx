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
import { dirForLocale, htmlLang } from '@/lib/i18n-config';
import { allRouteSegments, matchSegments, viewHref, type View } from '@/lib/routing';
import { SITE_URL } from '@/lib/constants';

type LayoutParams = { locale?: string[] };

/**
 * Only generated routes exist. Without this, any URL under the catch-all -
 * browsers ask for `/favicon.ico` on their own - rendered the layout and threw,
 * which was a 500 in dev. Now such a request is a plain 404.
 */
export const dynamicParams = false;

/**
 * `/`, `/journey`, and the same under `/en` and `/fa`.
 * `/de` is deliberately not generated: it would duplicate `/`, and
 * `public/_redirects` 301s it home.
 */
export function generateStaticParams(): LayoutParams[] {
  return allRouteSegments().map((segments) => ({ locale: segments }));
}

/**
 * Message namespaces each view actually renders. Everything handed to the
 * client provider is serialised into the page's HTML, so the landing page does
 * not carry the journey's copy, and neither carries the puzzles' - those load
 * with the puzzle chunk when a puzzle opens.
 */
const VIEW_NAMESPACES: Record<View, readonly string[]> = {
  landing: ['site', 'nav', 'languages', 'landing', 'mode'],
  journey: ['site', 'nav', 'languages', 'journey', 'eras', 'convergence', 'mode'],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const { locale: segments } = await params;
  const match = matchSegments(segments);
  if (!match) return {};
  const { locale, view } = match;
  const t = await getTranslations({ locale, namespace: 'site' });
  const tLanding = await getTranslations({ locale, namespace: 'landing' });

  const title = view === 'landing' ? t('title') : `${tLanding('journeyTitle')} — ${t('author')}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: t('description'),
    alternates: {
      canonical: viewHref(locale, view),
      languages: {
        'de-DE': viewHref('de', view),
        en: viewHref('en', view),
        'fa-IR': viewHref('fa', view),
        'x-default': viewHref('de', view),
      },
    },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    },
    openGraph: {
      type: view === 'landing' ? 'profile' : 'website',
      locale: htmlLang[locale],
      title,
      description: t('description'),
      siteName: t('author'),
      url: viewHref(locale, view),
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
  const match = matchSegments(segments);
  if (!match) notFound();

  const { locale, view } = match;
  setRequestLocale(locale);
  const allMessages = await getMessages({ locale });
  const messages = Object.fromEntries(
    Object.entries(allMessages).filter(([namespace]) => VIEW_NAMESPACES[view].includes(namespace)),
  );

  return (
    <html lang={htmlLang[locale]} dir={dirForLocale(locale)} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            {children}
            {view === 'journey' && <EraEffectsLayer />}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

