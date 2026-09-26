import { useId, type HTMLAttributes, type ReactNode, type Ref } from 'react';

import { IconTile } from '@/components/illustrations/Icon';
import type { IconName } from '@/components/illustrations/icons';
import type { AppProps } from '@/components/apps/types';
import { careerStations, languages, skillAreas, type CareerStation } from '@/content/about';
import { EMAIL, RESUME } from '@/content/profile';
import { htmlLang, type Locale } from '@/lib/i18n-config';
import { asStringList } from '@/lib/message-shapes';
import { cn } from '@/lib/cn';

/**
 * The About text itself. In a window (`page` false) the name is an h2 under the
 * window title; on the static About page (`/about/`, ROADMAP SEO-09) the same
 * component renders on the server as the page body, with the name as the h1
 * and without the visitor numbers - one component, so the app and the page
 * can never drift apart. It has no `use client` of its own: the app (AboutApp)
 * pulls it into the client bundle with its message provider and the numbers,
 * the page renders it on the server and ships none of it to the browser.
 */
/**
 * The `about` translate function: `getTranslations` on the server (the static
 * page), `useTranslations` in the app's window. It comes in as a parameter,
 * and this module imports no message library: a server module that imports
 * `next-intl` puts the client message provider into every page's script list
 * (queue 3c).
 */
export interface AboutText {
  (key: string): string;
  raw(key: string): unknown;
  rich(key: string, values: Record<string, (chunks: ReactNode) => ReactNode>): ReactNode;
}

// The static page's section and skill icons (BR-09); the window in the desktop stays as it was.
const SKILL_ICONS: Record<(typeof skillAreas)[number]['id'], IconName> = { network: 'network', systems: 'terminal', support: 'support' };

export function AboutContent({
  appId,
  page = false,
  art,
  stats,
  languagesRef,
  t,
  locale,
}: AppProps & {
  t: AboutText;
  locale: Locale;
  page?: boolean;
  art?: ReactNode;
  /** The visitor numbers: the window's, never the page's. */
  stats?: ReactNode;
  /** The last block, which the numbers wait for. */
  languagesRef?: Ref<HTMLUListElement>;
}) {
  const headingId = useId();

  return (
    <article aria-labelledby={headingId} data-app-content={appId} className="@container min-h-full">
      <div className="mx-auto flex max-w-3xl flex-col gap-7 p-4 @min-[480px]:p-6 @min-[720px]:p-8">
        <header className={cn('flex flex-col gap-3', art && 'relative @min-[640px]:pe-52')}>
          {art}
          <p className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase">{t('eyebrow')}</p>
          <Heading level={page ? 1 : 2} id={headingId} className="font-display text-2xl leading-tight font-bold text-ink @min-[480px]:text-3xl">
            {t('name')}
          </Heading>
          <p className="font-body text-base text-muted">{t('role')}</p>
          <div className="flex flex-col gap-3 font-body leading-relaxed text-ink">
            {asStringList(t.raw('intro')).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Actions t={t} />
        </header>

        <Section page={page} icon="route" title={t('path.title')}>
          <ol className="flex flex-col gap-4 border-s border-edge ps-4">
            {careerStations.map((station) => (
              <Station key={station.id} station={station} page={page} t={t} locale={locale} />
            ))}
          </ol>
        </Section>

        <Section page={page} icon="pin" title={t('now.title')}>
          <div className="flex flex-col gap-3 font-body leading-relaxed text-ink">
            {asStringList(t.raw('now.text')).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>

        <Section page={page} icon="chip" title={t('skills.title')}>
          <div className="grid gap-4 @min-[640px]:grid-cols-3">
            {skillAreas.map((area) => (
              <section key={area.id} className="ao-themed rounded-control border border-edge bg-elevated/50 p-3">
                <Heading level={page ? 3 : 4} className="mb-2 flex items-center gap-2 font-mono text-xs tracking-wide text-accent uppercase">
                  {page ? <IconTile name={SKILL_ICONS[area.id]} className="h-7 w-7 rounded-control" /> : null}
                  {t(`skills.areas.${area.id}.title`)}
                </Heading>
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

        <Section page={page} icon="languages" title={t('languages.title')}>
          <ul ref={languagesRef} className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <li
                key={language.id}
                className="ao-themed rounded-control border border-edge px-3 py-1.5 font-body text-sm text-ink"
              >
                {t(`languages.names.${language.id}`)}
              </li>
            ))}
          </ul>
        </Section>

        {/* Last and quiet: nothing about Ahmadreza moves for it. Not on the
            static page, whose HTML is for reading, not for live numbers. */}
        {page ? null : stats}
      </div>
    </article>
  );
}

/** A heading at a given level, so the page and the window share one outline. */
function Heading({ level, ...props }: { level: 1 | 2 | 3 | 4 } & HTMLAttributes<HTMLHeadingElement>) {
  const Tag = `h${level}` as const;
  return <Tag {...props} />;
}

function Section({ title, page, icon, children }: { title: string; page: boolean; icon: IconName; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <Heading level={page ? 2 : 3} id={id} className="flex items-center gap-3 font-display text-lg font-bold text-ink">
        {page ? <IconTile name={icon} /> : null}
        {title}
      </Heading>
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

function Station({ station, page, t, locale }: { station: CareerStation; page: boolean; t: AboutText; locale: Locale }) {
  const format = (month: string) =>
    new Intl.DateTimeFormat(htmlLang[locale], { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`));
  const date = (month: string | null) => (month ? format(month) : <Placeholder>{t('placeholderDate')}</Placeholder>);
  const place = t(`path.stations.${station.id}.place`);

  let period: ReactNode;
  if (station.placeholder) period = <Placeholder>{t('placeholder')}</Placeholder>;
  else if (station.current) period = t.rich('path.since', { date: () => date(station.start) });
  else period = t.rich('path.range', { start: () => date(station.start), end: () => date(station.end) });

  return (
    <li className="relative flex flex-col gap-1">
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1.5 -start-[calc(1rem+4.5px)] h-2 w-2 rounded-full',
          station.current ? 'bg-accent shadow-[0_0_8px_var(--ao-color-glow)]' : 'border border-edge bg-surface',
        )}
      />
      <p className="flex flex-wrap items-center gap-1 font-mono text-xs text-muted">{period}</p>
      <Heading level={page ? 3 : 4} className="font-body font-bold text-ink">
        {t(`path.stations.${station.id}.title`)}
      </Heading>
      {place ? <p className="font-body text-sm text-accent">{place}</p> : null}
      <p className={cn('font-body text-sm leading-relaxed', station.placeholder ? 'text-muted italic' : 'text-ink')}>
        {t(`path.stations.${station.id}.text`)}
      </p>
    </li>
  );
}

/** The résumé (behind its `available` flag, never a link into a 404) and the email. */
function Actions({ t: about }: { t: AboutText }) {
  const t = (key: string) => about(`actions.${key}`);
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
        <a href={`mailto:${EMAIL.address}`} data-action="email" className={cn(button, 'max-w-full flex-wrap border-accent text-accent hover:bg-elevated')}>
          {t('email')}
          <span dir="ltr" className="min-w-0 wrap-anywhere text-ink">
            {EMAIL.address}
          </span>
        </a>
      ) : null}
    </div>
  );
}
