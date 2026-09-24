'use client';

import { useId, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import { careerStations, languages, skillAreas } from '@/content/about';
import { cvCertificates, cvEducation, cvExperience, type CvEntry } from '@/content/cv';
import { EMAIL, RESUME } from '@/content/profile';
import { htmlLang, type Locale } from '@/lib/i18n-config';
import { cn } from '@/lib/cn';

/**
 * The résumé as a readable sheet: who, contact, then work and training,
 * school, skills, languages and certificates. Structure from `content/cv.ts`
 * and `content/about.ts`, words from the app's own messages (the apprenticeship
 * and the skills reuse About's, so the two never disagree).
 *
 * The layout is the finished one; the entries are not. Every fact Ahmadreza
 * has not supplied (OWN-05) is a visibly marked placeholder, never a guess.
 * The PDF control stays "folgt in Kürze" until the file exists (`RESUME`).
 * One column in a small window, the skills side by side once there is room.
 */
export function CvApp(props: AppProps) {
  return (
    <AppMessages copy={['cv', 'about']}>
      <Cv {...props} />
    </AppMessages>
  );
}

function Cv({ appId }: AppProps) {
  const t = useTranslations('cv');
  const tAbout = useTranslations('about');
  const tOs = useTranslations('os.cv');
  const headingId = useId();
  const button =
    'ao-themed inline-flex min-h-10 items-center gap-2 rounded-control border px-3 py-2 font-mono text-xs tracking-wide focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';

  return (
    <article aria-labelledby={headingId} data-app-content={appId} className="@container min-h-full">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 @min-[480px]:p-6 @min-[720px]:p-8">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase">{t('title')}</p>
          <h2 id={headingId} className="font-display text-2xl leading-tight font-bold text-ink @min-[480px]:text-3xl">
            {tAbout('name')}
          </h2>
          <p className="font-body text-base text-muted">{tAbout('role')}</p>
          <p className="font-body text-sm text-muted">{t('intro')}</p>
          <div role="group" aria-label={t('contact')} className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-sm text-ink">
            <span>{t('location')}</span>
            {EMAIL.available ? (
              <a href={`mailto:${EMAIL.address}`} dir="ltr" data-action="email" className="wrap-anywhere text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
                {EMAIL.address}
              </a>
            ) : null}
            {RESUME.available ? (
              <a href={RESUME.href} download data-action="resume-download" className={cn(button, 'border-accent bg-accent text-background hover:bg-accent-muted')}>
                {tOs('download')}
              </a>
            ) : (
              <span data-action="resume-pending" aria-disabled="true" className={cn(button, 'cursor-not-allowed border-edge text-muted')}>
                {tOs('pending')}
              </span>
            )}
          </div>
        </header>

        <Section title={t('sections.experience')}>
          <Entries entries={cvExperience} />
        </Section>

        <Section title={t('sections.education')}>
          <Entries entries={cvEducation} />
        </Section>

        <Section title={t('sections.skills')}>
          <div className="grid gap-3 @min-[560px]:grid-cols-3">
            {skillAreas.map((area) => (
              <div key={area.id} className="ao-themed rounded-control border border-edge bg-elevated/50 p-3">
                <h4 className="mb-2 font-mono text-xs tracking-wide text-accent uppercase">{tAbout(`skills.areas.${area.id}.title`)}</h4>
                <ul className="flex flex-col gap-1 font-body text-sm text-ink">
                  {area.skills.map((skill) => (
                    <li key={skill}>{tAbout(`skills.areas.${area.id}.skills.${skill}`)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title={t('sections.languages')}>
          <ul className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <li key={language.id} lang={language.id} className="ao-themed rounded-control border border-edge px-3 py-1.5 font-body text-sm text-ink">
                {tAbout(`languages.names.${language.id}`)}
                {language.level === null ? (
                  <>
                    {' '}
                    <Placeholder>{tAbout('placeholder')}</Placeholder>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t('sections.certificates')}>
          <Entries entries={cvCertificates} />
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h3 id={id} className="border-b border-edge pb-1 font-display text-lg font-bold text-ink">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** A fact that is still owed: visibly marked, never guessed (TODO.md lists them). */
function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span data-placeholder="" className="inline-flex w-fit items-center rounded-control border border-dashed border-warning/70 px-1.5 font-mono text-[11px] text-warning">
      {children}
    </span>
  );
}

function Entries({ entries }: { entries: readonly CvEntry[] }) {
  return (
    <ol className="flex flex-col gap-4 border-s border-edge ps-4">
      {entries.map((entry) => (
        <Entry key={entry.id} entry={entry} />
      ))}
    </ol>
  );
}

function Entry({ entry }: { entry: CvEntry }) {
  const t = useTranslations('cv');
  const tAbout = useTranslations('about');
  const locale = useLocale() as Locale;
  const format = (month: string) => new Intl.DateTimeFormat(htmlLang[locale], { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`));
  const date = (month: string | null) => (month ? format(month) : <Placeholder>{tAbout('placeholderDate')}</Placeholder>);

  // The apprenticeship is About's own station, so the two tell one story.
  const own = entry.id === 'apprenticeship' ? careerStations.find((station) => station.id === 'apprenticeship') : undefined;
  const title = own ? tAbout(`path.stations.${own.id}.title`) : t(`entries.${entry.id}.title`);
  const place = own ? tAbout(`path.stations.${own.id}.place`) : '';
  const text = own ? tAbout(`path.stations.${own.id}.text`) : t(`entries.${entry.id}.text`);

  let period: ReactNode;
  if (entry.placeholder) period = <Placeholder>{tAbout('placeholder')}</Placeholder>;
  else if (entry.current) period = tAbout.rich('path.since', { date: () => date(entry.start) });
  else period = tAbout.rich('path.range', { start: () => date(entry.start), end: () => date(entry.end) });

  return (
    <li data-cv-entry={entry.id} className="relative flex flex-col gap-1">
      <span
        aria-hidden="true"
        className={cn('absolute top-1.5 -start-[calc(1rem+4.5px)] h-2 w-2 rounded-full', entry.current ? 'bg-accent shadow-[0_0_8px_var(--ao-color-glow)]' : 'border border-edge bg-surface')}
      />
      <p className="flex flex-wrap items-center gap-1 font-mono text-xs text-muted">{period}</p>
      <h4 className="font-body font-bold text-ink">{title}</h4>
      {place ? <p className="font-body text-sm text-accent">{place}</p> : null}
      <p className={cn('font-body text-sm leading-relaxed', entry.placeholder ? 'text-muted italic' : 'text-ink')}>{text}</p>
    </li>
  );
}
