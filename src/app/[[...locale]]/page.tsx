import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Journey } from '@/components/journey/Journey';
import { localeFromSegments } from '@/lib/routing';
import { eras } from '@/content/eras';

type PageParams = { locale?: string[] };

export default async function HomePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale: segments } = await params;
  const locale = localeFromSegments(segments);
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'site' });
  const tEras = await getTranslations({ locale, namespace: 'eras' });

  return (
    <main>
      {/*
        Static text fallback. Act 1 is a client component, so this block is what
        crawlers and screen readers get for free before any JavaScript runs.
        Phase 10 expands it into the full SEO layer.
      */}
      <div className="ao-sr-only">
        <h1>{t('title')}</h1>
        <p>{t('tagline')}</p>
        <p>{t('description')}</p>
        <ul>
          {eras.map((era) => (
            <li key={era.id}>
              <strong>
                {era.year} — {tEras(era.nameKey)}
              </strong>{' '}
              {tEras(era.descriptionKey)}
            </li>
          ))}
        </ul>
      </div>

      <Journey />
    </main>
  );
}
