import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { JourneyLoader } from '@/components/journey/JourneyLoader';
import { AboutPage } from '@/components/about/AboutPage';
import { Landing } from '@/components/landing/Landing';
import { LegalPage } from '@/components/legal/LegalPage';
import { Desktop } from '@/components/os/Desktop';
import { eras } from '@/content/eras';
import { asStatList } from '@/lib/message-shapes';
import { matchSegments, viewHref } from '@/lib/routing';
import { viewMessages } from '@/lib/view-messages';

type PageParams = { locale?: string[] };

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { locale: segments } = await params;
  const match = matchSegments(segments);
  if (!match) notFound();

  const { locale, view } = match;
  setRequestLocale(locale);

  if (view === 'landing') return <Landing />;
  if (view === 'desktop') return <Desktop locale={locale} />;
  if (view === 'about') return <AboutPage locale={locale} />;
  if (view === 'imprint' || view === 'privacy') return <LegalPage locale={locale} kind={view} />;

  const t = await getTranslations({ locale, namespace: 'site' });
  const tEras = await getTranslations({ locale, namespace: 'eras' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tConvergence = await getTranslations({ locale, namespace: 'convergence' });

  return (
    <main>
      {/*
        Static text layer (ROADMAP SEO-10). Act 1 hydrates client-side, so this
        is what crawlers and screen readers get before any JavaScript runs: per
        era its year and name, its one truth, the era's own paragraph and
        figures, and the insider detail - the same sentences the scenes show,
        never a second version of them. The puzzles' copy stays out: it loads
        with the puzzle chunk, and the page budget depends on that.
      */}
      <div className="ao-sr-only">
        <h1>{t('title')}</h1>
        <p>{t('tagline')}</p>
        {eras.map((era) => {
          const stats = tEras.has(`${era.id}.visual.stats`) ? asStatList(tEras.raw(`${era.id}.visual.stats`)) : [];
          return (
            <section key={era.id}>
              <h2>
                {era.yearLabelKey ? tEras(era.yearLabelKey) : era.year} — {tEras(era.nameKey)}
              </h2>
              <p>{tEras(era.descriptionKey)}</p>
              {tEras.has(`${era.id}.visual.body`) ? <p>{tEras(`${era.id}.visual.body`)}</p> : null}
              {stats.length > 0 ? (
                <ul>
                  {stats.map((stat) => (
                    <li key={stat.label}>
                      {stat.value} {stat.label}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p>{tEras(`${era.id}.insider`)}</p>
            </section>
          );
        })}
        <section>
          <h2>{tConvergence('title')}</h2>
          <p>
            <a href={viewHref(locale, 'desktop')}>{tNav('skipToDesktop')}</a> ·{' '}
            <a href={viewHref(locale, 'about')}>{tNav('about')}</a>
          </p>
        </section>
      </div>

      <JourneyLoader locale={locale} messages={await viewMessages(locale, 'journey')} />
    </main>
  );
}
