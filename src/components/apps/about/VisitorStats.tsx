'use client';

import { Suspense, useId, type RefObject } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import { appIds, type AppId } from '@/content/eras';
import { appOpened, JOURNEY_COMPLETED, MIN_PUBLIC_COUNT, modeChosen, publicCount, type CounterName, type Counts } from '@/lib/counters';
import { usePublicCounts } from '@/lib/use-public-counts';

/** How many of the most-opened apps are listed. */
const TOP_APPS = 5;

type Row = { key: 'journeyCompleted' | 'modeGuided' | 'modeInteractive'; name: CounterName };

const ROWS: readonly Row[] = [
  { key: 'journeyCompleted', name: JOURNEY_COMPLETED },
  { key: 'modeGuided', name: modeChosen('guided') },
  { key: 'modeInteractive', name: modeChosen('interactive') },
];

/**
 * "This site in numbers" at the very end of About (Phase 9C, DECISIONS.md
 * 56): journeys finished, the mode split and the most-opened apps, from the
 * anonymous counters. The counts are fetched only once `observe` - the last
 * section above - scrolls into view; the copy only once there is something
 * to show. Every number below the threshold is left out, and without any,
 * or without the API, there is no section at all - never a 0 or an error.
 */
export function VisitorStats({ observe }: { observe: RefObject<HTMLElement | null> }) {
  const counts = usePublicCounts(observe);
  const rows = shownRows(counts);
  const apps = topApps(counts);
  if (rows.length === 0 && apps.length === 0) return null;
  return (
    <Suspense fallback={null}>
      <AppMessages copy={['stats']}>
        <StatsView rows={rows} apps={apps} />
      </AppMessages>
    </Suspense>
  );
}

function shownRows(counts: Counts | null): { key: Row['key']; name: CounterName; n: number }[] {
  return ROWS.flatMap((row) => {
    const n = publicCount(counts, row.name);
    return n === null ? [] : [{ ...row, n }];
  });
}

function topApps(counts: Counts | null): { id: AppId; n: number }[] {
  return appIds
    .flatMap((id) => {
      const n = publicCount(counts, appOpened(id));
      return n === null ? [] : [{ id, n }];
    })
    .sort((a, b) => b.n - a.n)
    .slice(0, TOP_APPS);
}

function StatsView({ rows, apps }: { rows: ReturnType<typeof shownRows>; apps: ReturnType<typeof topApps> }) {
  const t = useTranslations('stats');
  const os = useTranslations('os');
  const format = useFormatter();
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} data-visitor-stats="" className="ao-themed flex flex-col gap-3 rounded-control border border-edge p-3">
      <h3 id={headingId} className="font-mono text-xs tracking-wide text-accent uppercase">
        {t('title')}
      </h3>
      {rows.length > 0 ? (
        <dl className="flex flex-col gap-1.5 font-body text-sm">
          {rows.map((row) => (
            <div key={row.key} data-public-count={row.name} className="flex items-baseline justify-between gap-3">
              <dt className="text-ink">{t(row.key)}</dt>
              <dd className="font-mono text-muted">{format.number(row.n)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {apps.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <h4 className="font-body text-sm text-ink">{t('topApps')}</h4>
          <ol className="flex flex-col gap-1 font-body text-sm">
            {apps.map((app) => (
              <li key={app.id} data-public-count={appOpened(app.id)} className="flex items-baseline justify-between gap-3">
                <span className="text-muted">{os(`apps.${app.id}.title`)}</span>
                <span className="font-mono text-muted">{format.number(app.n)}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      <p className="font-body text-xs leading-snug text-muted">{t('note', { min: MIN_PUBLIC_COUNT })}</p>
    </section>
  );
}
