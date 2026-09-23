'use client';

import { useId, useRef, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import { VisitorStats } from '@/components/apps/about/VisitorStats';
import type { AppProps } from '@/components/apps/types';
import { careerStations, languages, skillAreas, type CareerStation } from '@/content/about';
import { EMAIL, RESUME } from '@/content/profile';
import { htmlLang, type Locale } from '@/lib/i18n-config';
import { asStringList } from '@/lib/message-shapes';
import { cn } from '@/lib/cn';

/**
 * The app a recruiter reads: who Ahmadreza is, his path, what he does now and
 * what he works with. Structure from `content/about.ts`, words from the app's
 * own messages. Laid out against its window, not the viewport: one column in a
 * 300 px window, the skills side by side once there is room.
 */
export function AboutApp(props: AppProps) {
  return (
    <AppMessages copy={['about']}>
      <About {...props} />
    </AppMessages>
  );
}

function About({ appId }: AppProps) {
  const t = useTranslations('about');
  const headingId = useId();
  const lastRef = useRef<HTMLUListElement>(null);

  return (
    <article aria-labelledby={headingId} data-app-content={appId} className="@container min-h-full">
      <div className="mx-auto flex max-w-3xl flex-col gap-7 p-4 @min-[480px]:p-6 @min-[720px]:p-8">
        <header className="flex flex-col gap-3">
          <p className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase">{t('eyebrow')}</p>
          <h2 id={headingId} className="font-display text-2xl leading-tight font-bold text-ink @min-[480px]:text-3xl">
            {t('name')}
          </h2>
          <p className="font-body text-base text-muted">{t('role')}</p>
          <div className="flex flex-col gap-3 font-body leading-relaxed text-ink">
            {asStringList(t.raw('intro')).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Actions />
        </header>

        <Section title={t('path.title')}>
          <ol className="flex flex-col gap-4 border-s border-edge ps-4">
            {careerStations.map((station) => (
              <Station key={station.id} station={station} />
            ))}
          </ol>
        </Section>

        <Section title={t('now.title')}>
          <div className="flex flex-col gap-3 font-body leading-relaxed text-ink">
            {asStringList(t.raw('now.text')).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>

        <Section title={t('skills.title')}>
          <div className="grid gap-4 @min-[640px]:grid-cols-3">
            {skillAreas.map((area) => (
              <section key={area.id} className="ao-themed rounded-control border border-edge bg-elevated/50 p-3">
                <h4 className="mb-2 font-mono text-xs tracking-wide text-accent uppercase">{t(`skills.areas.${area.id}.title`)}</h4>
                <ul className="flex flex-col gap-1.5 font-body text-sm text-ink">
                  {area.skills.map((skill) => (
                    <li key={skill} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {t(`skills.areas.${area.id}.skills.${skill}`)}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Section>

        <Section title={t('languages.title')}>
          <ul ref={lastRef} className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <li
                key={language.id}
                lang={language.id}
                className="ao-themed rounded-control border border-edge px-3 py-1.5 font-body text-sm text-ink"
              >
                {t(`languages.names.${language.id}`)}
              </li>
            ))}
          </ul>
        </Section>

        {/* Last and quiet: nothing about Ahmadreza moves for it. */}
        <VisitorStats observe={lastRef} />
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h3 id={id} className="font-display text-lg font-bold text-ink">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** A fact that is still owed: visibly marked, never guessed (TODO.md lists them). */
function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span
      data-placeholder=""
      className="inline-flex w-fit items-center rounded-control border border-dashed border-warning/70 px-1.5 font-mono text-[11px] text-warning"
    >
      {children}
    </span>
  );
}

function Station({ station }: { station: CareerStation }) {
  const t = useTranslations('about');
  const locale = useLocale() as Locale;
  const format = (month: string) =>
    new Intl.DateTimeFormat(htmlLang[locale], { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`));
  const date = (month: string | null) => (month ? format(month) : <Placeholder>{t('placeholderDate')}</Placeholder>);
  const place = t(`path.stations.${station.id}.place`);

  let period: ReactNode;
  if (station.placeholder) period = <Placeholder>{t('placeholder')}</Placeholder>;
  else if (station.current) period = t.rich('path.since', { date: () => date(station.start) });
  else period = t.rich('path.range', { start: () => date(station.start), end: () => date(station.end) });

  return (
    <li className={cn('relative flex flex-col gap-1', station.placeholder && 'opacity-80')}>
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1.5 -start-[calc(1rem+4.5px)] h-2 w-2 rounded-full',
          station.current ? 'bg-accent shadow-[0_0_8px_var(--ao-color-glow)]' : 'border border-edge bg-surface',
        )}
      />
      <p className="flex flex-wrap items-center gap-1 font-mono text-xs text-muted">{period}</p>
      <h4 className="font-body font-bold text-ink">{t(`path.stations.${station.id}.title`)}</h4>
      {place ? <p className="font-body text-sm text-accent">{place}</p> : null}
      <p className={cn('font-body text-sm leading-relaxed', station.placeholder ? 'text-muted italic' : 'text-ink')}>
        {t(`path.stations.${station.id}.text`)}
      </p>
    </li>
  );
}

/** The résumé (behind its `available` flag, never a link into a 404) and the email. */
function Actions() {
  const t = useTranslations('about.actions');
  const button =
    'ao-themed inline-flex min-h-10 items-center gap-2 rounded-control border px-3 py-2 font-mono text-xs tracking-wide focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';

  return (
    <div role="group" aria-label={t('label')} className="mt-1 flex flex-wrap gap-2">
      {RESUME.available ? (
        <a href={RESUME.href} download data-action="resume-download" className={cn(button, 'border-accent bg-accent text-background hover:bg-accent-muted')}>
          {t('resume')}
        </a>
      ) : (
        <span data-action="resume-pending" className={cn(button, 'cursor-not-allowed border-edge text-muted')}>
          {t('resumePending')}
        </span>
      )}
      {EMAIL.available ? (
        <a href={`mailto:${EMAIL.address}`} data-action="email" className={cn(button, 'border-accent text-accent hover:bg-elevated')}>
          {t('email')}
          <span dir="ltr" className="text-ink">
            {EMAIL.address}
          </span>
        </a>
      ) : null}
    </div>
  );
}
