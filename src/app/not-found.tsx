import type { Metadata } from 'next';

import de from '@/messages/de.json';
import en from '@/messages/en.json';
import fa from '@/messages/fa.json';
import { locales, type Locale } from '@/lib/i18n-config';
import { viewHref } from '@/lib/routing';

/**
 * The one 404 page (`out/404.html`), which Cloudflare serves with a real 404
 * status (`not_found_handling: "404-page"`). A stray URL carries no reliable
 * locale, so the page speaks all three languages: German first, then English
 * and Persian, each with its own links home, into the journey and to the
 * desktop. The root layout is a pass-through, so this renders its own
 * <html>. No client code: plain anchors and static text.
 * CONTENT-TODO CR-1031
 */

const COPY: Record<Locale, typeof de.notFound> = { de: de.notFound, en: en.notFound, fa: fa.notFound };

export const metadata: Metadata = {
  // CONTENT-TODO CR-1031
  title: `${de.notFound.title} – ${de.site.author} | ${de.site.brand}`,
  robots: { index: false, follow: true },
};

const link = 'rounded-control border border-edge px-3 py-1.5 font-mono text-sm text-ink hover:border-accent hover:text-accent';

export default function NotFound() {
  return (
    <html lang="de-DE" dir="ltr">
      <body className="antialiased">
        <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-10 bg-background px-5 py-16 text-ink sm:px-8">
          <p className="font-mono text-6xl font-bold tracking-tight text-accent sm:text-7xl" aria-hidden="true">
            404
          </p>
          {locales.map((locale, index) => {
            const copy = COPY[locale];
            const Heading = index === 0 ? 'h1' : 'h2';
            return (
              <section
                key={locale}
                lang={locale}
                dir={locale === 'fa' ? 'rtl' : 'ltr'}
                className="flex flex-col gap-3 border-t border-edge pt-6 first-of-type:border-t-0 first-of-type:pt-0"
              >
                <Heading className={index === 0 ? 'font-display text-3xl font-bold' : 'font-display text-xl font-bold'}>
                  {copy.title}
                </Heading>
                <p className="font-body text-muted">{copy.text}</p>
                <nav className="flex flex-wrap gap-2">
                  <a href={viewHref(locale, 'landing')} className={link}>
                    {copy.home}
                  </a>
                  <a href={viewHref(locale, 'journey')} className={link}>
                    {copy.journey}
                  </a>
                  <a href={viewHref(locale, 'desktop')} className={link}>
                    {copy.desktop}
                  </a>
                </nav>
              </section>
            );
          })}
          <nav aria-label={de.nav.legal} className="flex gap-4 font-mono text-xs text-muted">
            <a href={viewHref('de', 'imprint')} className="hover:text-ink hover:underline">
              {de.nav.imprint}
            </a>
            <a href={viewHref('de', 'privacy')} className="hover:text-ink hover:underline">
              {de.nav.privacy}
            </a>
          </nav>
        </main>
      </body>
    </html>
  );
}
