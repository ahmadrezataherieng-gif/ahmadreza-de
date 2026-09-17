import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { JourneyLoader } from '@/components/journey/JourneyLoader';
import { Landing } from '@/components/landing/Landing';
import { eras } from '@/content/eras';
import { matchSegments } from '@/lib/routing';

type PageParams = { locale?: string[] };

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { locale: segments } = await params;
  const match = matchSegments(segments);
  if (!match) notFound();

  const { locale, view } = match;
  setRequestLocale(locale);

  if (view === 'landing') return <Landing />;

  const t = await getTranslations({ locale, namespace: 'site' });
  const tEras = await getTranslations({ locale, namespace: 'eras' });

  return (
    <main>
      {/*
        Static text fallback. Act 1 hydrates client-side, so this block is what
        crawlers and screen readers get before any JavaScript runs: every era
        with its one truth and its insider detail. Phase 10 expands it into the
        full SEO layer.
      */}
      <div className="ao-sr-only">
        <h1>{t('title')}</h1>
        <p>{t('tagline')}</p>
        <ul>
          {eras.map((era) => (
            <li key={era.id}>
              <strong>
                {era.yearLabelKey ? tEras(era.yearLabelKey) : era.year} — {tEras(era.nameKey)}
              </strong>{' '}
              {tEras(era.descriptionKey)} {tEras(`${era.id}.insider`)}
            </li>
          ))}
        </ul>
      </div>

      <JourneyLoader />
    </main>
  );
}
