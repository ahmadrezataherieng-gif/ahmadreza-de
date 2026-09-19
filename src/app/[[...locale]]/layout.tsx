import type { Metadata, Viewport } from 'next';
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
import { dirForLocale, htmlLang, type Locale } from '@/lib/i18n-config';
import { allRouteSegments, matchSegments, viewHref, type View } from '@/lib/routing';
import { SITE_URL } from '@/lib/constants';
import { returningRedirectScript } from '@/lib/returning';

type LayoutParams = { locale?: string[] };

/**
 * Picks the motion tier for the journey and the desktop (DECISIONS.md 46).
 *
 * `full` - a mouse on a wide screen with enough cores and memory: every depth
 * layer, the camera dolly and the pointer tilt.
 * `light` - phones, coarse pointers and weak hardware: the same crossings with
 * fewer layers and smaller moves.
 * `?tier=full|light` forces one, which is how the verification runs both.
 *
 * A missing reading is not a weak device: `deviceMemory` does not exist in
 * Safari or Firefox, so defaulting it low would put every desktop visitor who
 * is not on Chrome into the light tier. Both counts fall back to the threshold.
 */
const MOTION_TIER_SCRIPT = `(function(){try{var d=document.documentElement,f=new URLSearchParams(location.search).get('tier');
if(f!=='full'&&f!=='light'){var fine=matchMedia('(pointer: fine)').matches&&matchMedia('(hover: hover)').matches;
var wide=innerWidth>=768&&innerHeight>=600;var c=navigator.hardwareConcurrency||4;var m=navigator.deviceMemory||4;
f=fine&&wide&&c>=4&&m>=4?'full':'light';}d.dataset.tier=f;}catch(e){document.documentElement.dataset.tier='light';}})();`;

/**
 * Only generated routes exist. Without this, any URL under the catch-all -
 * browsers ask for `/favicon.ico` on their own - rendered the layout and threw,
 * which was a 500 in dev. Now such a request is a plain 404.
 */
export const dynamicParams = false;

/**
 * `/`, `/journey`, `/desktop`, and the same under `/en` and `/fa`.
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
  // No era, journey or puzzle copy: the desktop loads none of that code either.
  desktop: ['site', 'nav', 'languages', 'os'],
};

/** Page title per view; the landing page uses the site title as it is. */
async function viewTitle(locale: Locale, view: View): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'site' });
  if (view === 'landing') return t('title');
  if (view === 'journey') {
    const tLanding = await getTranslations({ locale, namespace: 'landing' });
    return `${tLanding('journeyTitle')} — ${t('author')}`;
  }
  const tOs = await getTranslations({ locale, namespace: 'os' });
  return `${tOs('title')} — ${t('author')}`;
}

/**
 * The desktop asks Android's on-screen keyboard to shrink the page rather than
 * cover it, so a phone app's input (the Terminal's prompt) stays in view. The
 * other views keep the default: the journey's pinned stages must not jump when
 * a puzzle's keyboard opens.
 */
export async function generateViewport({ params }: { params: Promise<LayoutParams> }): Promise<Viewport> {
  const { locale: segments } = await params;
  const view = matchSegments(segments)?.view;
  return {
    width: 'device-width',
    initialScale: 1,
    ...(view === 'desktop' ? { interactiveWidget: 'resizes-content' as const } : {}),
  };
}

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
  const title = await viewTitle(locale, view);

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
      <head>
        {/* The journey's motion tier, decided before the first paint so nothing
            shifts afterwards. Inline and tiny on purpose: it has to run before
            the first frame, and it only sets one attribute. */}
        {view === 'journey' ? (
          <>
            {/* A returning visitor goes straight to the desktop, before the
                journey paints (DECISIONS.md 49). First, so nothing else runs. */}
            <script dangerouslySetInnerHTML={{ __html: returningRedirectScript(viewHref(locale, 'desktop')) }} />
            <script dangerouslySetInnerHTML={{ __html: MOTION_TIER_SCRIPT }} />
          </>
        ) : null}
        {/* The desktop's apps animate by the same tiers (Traceroute's packet). */}
        {view === 'desktop' ? <script dangerouslySetInnerHTML={{ __html: MOTION_TIER_SCRIPT }} /> : null}
      </head>
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

