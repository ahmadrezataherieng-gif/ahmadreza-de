'use client';

import { use, useId, type ReactNode } from 'react';
import { NextIntlClientProvider, useLocale, useMessages, useTranslations, type AbstractIntlMessages } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import { eraSectionHash } from '@/components/apps/unlock';
import type { AppProps } from '@/components/apps/types';
import { careerStations } from '@/content/about';
import { eras } from '@/content/eras';
import { htmlLang, type Locale } from '@/lib/i18n-config';
import { viewHref } from '@/lib/routing';

/**
 * The seven eras on one line, each with its year, name and one truth and a
 * link into the journey at that era (`/amonel/#era-N`), ending with where
 * Ahmadreza stands today. No word is written twice: the era copy is the
 * journey's own (`eras` from the page messages - the same lazy chunk the
 * puzzle layer loads), the station is About's.
 */
export function TimelineApp(props: AppProps) {
  return (
    <AppMessages copy={['timeline', 'about']}>
      <EraMessages>
        <Timeline {...props} />
      </EraMessages>
    </AppMessages>
  );
}

const cache = new Map<Locale, Promise<AbstractIntlMessages>>();

function loadEras(locale: Locale): Promise<AbstractIntlMessages> {
  let pending = cache.get(locale);
  if (!pending) {
    // The same import context as the puzzle layer's, so webpack serves one
    // chunk per locale for both; apps and legal copy stay excluded.
    pending = import(/* webpackExclude: /[\\/](apps|legal)[\\/]/ */ `@/messages/${locale}.json`).then(
      (module: { default: Record<string, AbstractIntlMessages> }) => module.default.eras ?? {},
      () => ({}),
    );
    cache.set(locale, pending);
  }
  return pending;
}

function EraMessages({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale;
  const parent = useMessages();
  const erasCopy = use(loadEras(locale));
  return (
    <NextIntlClientProvider locale={locale} messages={{ ...parent, eras: erasCopy }}>
      {children}
    </NextIntlClientProvider>
  );
}

function Timeline({ appId }: AppProps) {
  const t = useTranslations('timeline');
  const tEras = useTranslations('eras');
  const tAbout = useTranslations('about');
  const locale = useLocale() as Locale;
  const headingId = useId();
  const journey = viewHref(locale, 'journey');
  const station = careerStations.find((entry) => entry.current);
  const since = station?.start
    ? new Intl.DateTimeFormat(htmlLang[locale], { month: 'long', year: 'numeric' }).format(new Date(`${station.start}-01T12:00:00`))
    : null;

  return (
    <article aria-labelledby={headingId} data-app-content={appId} className="@container min-h-full">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 @min-[480px]:p-6">
        <header className="flex flex-col gap-2">
          <h2 id={headingId} className="font-display text-xl font-bold text-ink">
            {t('title')}
          </h2>
          <p className="font-body text-sm text-muted">{t('intro')}</p>
        </header>

        <ol aria-label={t('erasLabel')} className="flex flex-col gap-5 border-s border-edge ps-5">
          {eras.map((era) => (
            <li key={era.id} className="relative flex flex-col gap-1" data-era={era.id}>
              <span aria-hidden="true" className="absolute top-1.5 -start-[calc(1.25rem+4.5px)] h-2 w-2 rounded-full border border-accent bg-surface" />
              <p className="font-mono text-xs tracking-wide text-accent">{era.yearLabelKey ? tEras(era.yearLabelKey) : era.year}</p>
              <h3 className="font-body font-bold text-ink">{tEras(era.nameKey)}</h3>
              <p className="font-body text-sm leading-relaxed text-ink">{tEras(era.descriptionKey)}</p>
              <a href={`${journey}${eraSectionHash(era)}`} className="w-fit font-mono text-xs text-muted underline-offset-4 hover:text-accent hover:underline">
                {t('open')}
              </a>
            </li>
          ))}

          {station ? (
            <li className="relative flex flex-col gap-1" data-era="now">
              <span aria-hidden="true" className="absolute top-1.5 -start-[calc(1.25rem+4.5px)] h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_var(--ao-color-glow)]" />
              <p className="flex flex-wrap items-center gap-1 font-mono text-xs tracking-wide text-accent">
                {t('now')} ·{' '}
                {since ? (
                  t('since', { date: since })
                ) : (
                  <span data-placeholder="" className="rounded-control border border-dashed border-warning/70 px-1.5 text-[11px] text-warning">
                    {tAbout('placeholderDate')}
                  </span>
                )}
              </p>
              <h3 className="font-body font-bold text-ink">{tAbout(`path.stations.${station.id}.title`)}</h3>
              <p className="font-body text-sm text-accent">{tAbout(`path.stations.${station.id}.place`)}</p>
            </li>
          ) : null}
        </ol>
      </div>
    </article>
  );
}
