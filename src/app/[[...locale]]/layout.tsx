import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { EraEffectsLayer } from '@/components/theme/EraEffectsLayer';
import { dirForLocale, htmlLang, type Locale } from '@/lib/i18n-config';
import { allRouteSegments, matchSegments, viewHref, type View } from '@/lib/routing';
import { SITE_URL } from '@/lib/constants';
import { returningRedirectScript } from '@/lib/returning';
import { loadLegalCopy } from '@/components/legal/LegalPage';
import { serialiseJsonLd, structuredData } from '@/lib/structured-data';
import { SCHEME_SCRIPT } from '@/lib/scheme';
import { VIEWPORT_PIN_SCRIPT } from '@/lib/stable-viewport';

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
 * `/`, `/amonel` (the journey), `/desktop`, and the same under `/en` and `/fa`.
 * `/de` is deliberately not generated: it would duplicate `/`, and
 * `public/_redirects` 301s it home.
 */
export function generateStaticParams(): LayoutParams[] {
  return allRouteSegments().map((segments) => ({ locale: segments }));
}

/**
 * Page title per view, the name always ahead of the brand (the `seo` skill):
 * the landing page is "name – job | Amonel", every other page
 * "page – name | Amonel".
 */
async function viewTitle(locale: Locale, view: View): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'site' });
  // CONTENT-TODO CR-1043
  // A draft that fits the 60 characters a result page shows, the name first and whole (SEO-14, CR-1095).
  if (view === 'landing') return t('landingTitle');
  if (view === 'about') {
    return `${(await getTranslations({ locale, namespace: 'nav' }))('about')} – ${t('author')} | ${t('brand')}`;
  }
  if (view === 'imprint' || view === 'privacy') {
    return `${(await loadLegalCopy(locale))[view].title} – ${t('author')} | ${t('brand')}`;
  }
  const page =
    view === 'journey'
      ? (await getTranslations({ locale, namespace: 'landing' }))('journeyTitle')
      : (await getTranslations({ locale, namespace: 'os' }))('pageName');
  return `${page} – ${t('author')} | ${t('brand')}`;
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

export async function generateMetadata({ params }: { params: Promise<LayoutParams> }): Promise<Metadata> {
  const { locale: segments } = await params;
  const match = matchSegments(segments);
  if (!match) return {};
  const { locale, view } = match;
  const t = await getTranslations({ locale, namespace: 'site' });
  const title = await viewTitle(locale, view);
  const legal = view === 'imprint' || view === 'privacy' ? (await loadLegalCopy(locale))[view] : null;
  // Each view its own description, so no two pages share a search snippet.
  // CONTENT-TODO CR-1051
  const description = legal
    ? legal.description
    : view === 'journey'
      ? t('journeyDescription')
      : view === 'desktop'
        ? t('desktopDescription')
        : view === 'about'
          ? t('aboutDescription')
          : t('description');

  return {
    metadataBase: new URL(SITE_URL),
    // CONTENT-TODO CR-1044
    title,
    description,
    // The legal pages carry the home address: kept out of search results for
    // the name, while their links are still followed (DECISIONS.md 58).
    ...(legal ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: viewHref(locale, view),
      languages: {
        'de-DE': viewHref('de', view),
        en: viewHref('en', view),
        'fa-IR': viewHref('fa', view),
        'x-default': viewHref('de', view),
      },
    },
    // The Amonel icon set (Phase 9A), all files in public/, none fetched from
    // elsewhere. Browsers that read SVG favicons take it; the .ico is for the
    // rest; iOS takes the touch icon, Android and installs the manifest's.
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    // One manifest per language, so an install from /en/ or /fa/ starts there (SEO-13).
    manifest: locale === 'de' ? '/manifest.webmanifest' : `/manifest.${locale}.webmanifest`,
    openGraph: {
      type: view === 'landing' ? 'profile' : 'website',
      locale: htmlLang[locale],
      title,
      description,
      siteName: t('brand'),
      url: viewHref(locale, view),
      // One share image per language (scripts/og-image.mjs, ROADMAP SEO-05).
      // CONTENT-TODO CR-1050
      images: [
        {
          url: `/og/ahmadreza-taheri-${locale}.png`,
          width: 1200,
          height: 630,
          alt: t('ogAlt'),
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: `/og/ahmadreza-taheri-${locale}.png`, alt: t('ogAlt') }],
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
  // Structured data on every indexed page; the noindex legal pages carry none.
  const tSite = await getTranslations({ locale, namespace: 'site' });
  const jsonLd =
    view === 'imprint' || view === 'privacy'
      ? null
      : serialiseJsonLd(
          structuredData({
            name: tSite('author'),
            jobTitle: tSite('jobTitle'),
            knowsAbout: tSite.raw('knowsAbout') as string[],
            inLanguage: htmlLang[locale],
            siteName: tSite('brand'),
            image: {
              url: `${SITE_URL}/og/ahmadreza-taheri-${locale}.png`,
              width: 1200,
              height: 630,
              alt: tSite('ogAlt'),
            },
            description: tSite('description'),
            pageUrl: `${SITE_URL}${viewHref(locale, view)}`,
            isProfilePage: view === 'landing',
          }),
        );

  const page = (
    <ThemeProvider>
      {children}
      {view === 'journey' && <EraEffectsLayer />}
    </ThemeProvider>
  );

  return (
    <html lang={htmlLang[locale]} dir={dirForLocale(locale)} suppressHydrationWarning>
      <head>
        {/* The light/dark choice of the site's own pages, before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: SCHEME_SCRIPT }} />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
        {/* The journey's motion tier, decided before the first paint so nothing
            shifts afterwards. Inline and tiny on purpose: it has to run before
            the first frame, and it only sets one attribute. */}
        {view === 'journey' ? (
          <>
            {/* A returning visitor goes straight to the desktop, before the
                journey paints (DECISIONS.md 49). First, so nothing else runs. */}
            <script
              dangerouslySetInnerHTML={{
                __html: returningRedirectScript(viewHref(locale, 'desktop')),
              }}
            />
            <script dangerouslySetInnerHTML={{ __html: MOTION_TIER_SCRIPT }} />
            {/* The journey's viewport unit, pinned on touch devices before the
                body exists, so a toolbar move never relayouts it (PERF-02). */}
            <script dangerouslySetInnerHTML={{ __html: VIEWPORT_PIN_SCRIPT }} />
          </>
        ) : null}
        {/* The desktop's apps animate by the same tiers (Traceroute's packet). */}
        {view === 'desktop' ? <script dangerouslySetInnerHTML={{ __html: MOTION_TIER_SCRIPT }} /> : null}
      </head>
      <body className="antialiased">
        {page}
      </body>
    </html>
  );
}
