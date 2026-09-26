import { getTranslations } from 'next-intl/server';

import { AboutContent, type AboutText } from '@/components/apps/about/AboutContent';
import { Tip } from '@/components/illustrations/Icon';
import { RouteScene } from '@/components/illustrations/scenes';
import { AmonelLogo } from '@/components/ui/Brand';
import { StaticLanguageSwitcher } from '@/components/ui/StaticLanguageSwitcher';
import { SchemeToggle } from '@/components/ui/SchemeToggle';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { UseTheme } from '@/components/theme/UseTheme';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/**
 * The static About page (`/about/`, `/en/about/`, `/fa/about/`; ROADMAP
 * SEO-09). The About *app* loads its text only when a visitor opens it, so a
 * crawler that never runs the desktop never reads it. This page renders the
 * very same component on the server - the text is in the HTML - with the
 * name as the h1, then offers the two ways into the site.
 */
// Machine text, the same in every language. 203.0.113.0/24 is reserved for documentation (RFC 5737), so the example address belongs to no one.
const DNS_CODE = 'ahmadreza.de  →  203.0.113.10';
const CHMOD_CODE = 'chmod 755 backup.sh  →  rwxr-xr-x';

export async function AboutPage({ locale }: { locale: Locale }) {
  const tSite = await getTranslations('site');
  const tNav = await getTranslations('nav');
  const tLearn = await getTranslations('learn');
  const tAbout = (await getTranslations('about')) as unknown as AboutText;
  const link =
    'ao-themed rounded-control border border-edge px-3 py-2 font-mono text-sm text-ink hover:border-accent hover:text-accent';

  return (
    <div className="ao-site-page min-h-dvh bg-background text-ink">
      {/* One container for header, text, buttons and footer, padded like the article inside it, so they all share its left edge. */}
      <div className="@container mx-auto w-full max-w-3xl">
        <UseTheme id="modern" />
        <header className="flex items-center justify-between gap-3 px-4 pt-5 @min-[480px]:px-6 @min-[720px]:px-8">
          <a href={viewHref(locale, 'landing')} aria-label={tNav('home')} className="rounded-control">
            <AmonelLogo uid="ao-about-logo" label={tSite('brand')} className="h-7 w-auto" />
          </a>
          <div className="flex items-center gap-1">
            <StaticLanguageSwitcher locale={locale} view="about" />
            <SchemeToggle
              labels={{
                toLight: tNav('schemeToLight'),
                toDark: tNav('schemeToDark'),
              }}
            />
          </div>
        </header>

        <main className="pb-8">
          {/* The way from Tehran to Trier beside the header, where the text leaves room (BR-09). */}
          <AboutContent
            appId="about"
            page
            t={tAbout}
            locale={locale}
            art={<RouteScene className="absolute end-0 top-2 hidden w-48 @min-[640px]:block" />}
          />
          {/* CONTENT-TODO CR-1106: two learning snippets between the text and the ways on. */}
          <div className="grid gap-3 px-4 pb-7 @min-[480px]:px-6 @min-[640px]:grid-cols-2 @min-[720px]:px-8">
            <Tip label={tLearn('label')} code={DNS_CODE} text={tLearn('dns')} />
            <Tip label={tLearn('label')} code={CHMOD_CODE} text={tLearn('chmod')} />
          </div>
          <nav aria-label={tNav('home')} className="flex flex-wrap gap-2 px-4 @min-[480px]:px-6 @min-[720px]:px-8">
            <a href={viewHref(locale, 'journey')} className={link}>
              {tNav('journey')}
            </a>
            <a href={viewHref(locale, 'desktop')} className={link}>
              {tNav('skipToDesktop')}
            </a>
          </nav>
        </main>

        <div className="px-4 @min-[480px]:px-6 @min-[720px]:px-8">
          {/* The first link's own padding would push its text off the edge. */}
          <SiteFooter locale={locale} t={tNav} className="border-t border-edge py-5 [&>a:first-child]:-ms-1" />
        </div>
      </div>
    </div>
  );
}
