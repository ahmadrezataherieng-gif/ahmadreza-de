import { getLocale, getTranslations } from 'next-intl/server';

import { EmailLink } from '@/components/landing/EmailLink';
import { JourneyHint } from '@/components/landing/JourneyHint';
import { ModeChoice } from '@/components/landing/ModeChoice';
import { Portrait } from '@/components/landing/Portrait';
import { ResumeLink } from '@/components/landing/ResumeLink';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { UseTheme } from '@/components/theme/UseTheme';
import { PORTRAIT } from '@/content/profile';
import { asStatList } from '@/lib/message-shapes';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/**
 * The landing page: present-day Ahmadreza, in the `modern` theme.
 *
 * It is the page a recruiter judges in three seconds and the page Google reads
 * first, so it is a server component with real HTML text and almost no
 * JavaScript: the only client islands are the language switcher and the two
 * mode cards. The journey's code - GSAP, Lenis, every era - is never loaded
 * here.
 *
 * Reading order, on every width: name, role, the ways to reach him, the key
 * facts in bold, then the two ways into the journey.
 */
export async function Landing() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('landing');
  const facts = asStatList(t.raw('facts'));
  const journeyHref = viewHref(locale, 'journey');

  return (
    <main className="ao-landing relative isolate min-h-dvh overflow-hidden bg-background text-ink">
      <UseTheme id="modern" />
      <div className="ao-landing-glow pointer-events-none absolute inset-0 z-[var(--ao-z-backdrop)]" aria-hidden="true" />
      <div className="ao-landing-grain pointer-events-none absolute inset-0 z-[var(--ao-z-backdrop)]" aria-hidden="true" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 pt-5 sm:px-8">
        <p className="flex items-center gap-2.5 font-mono text-xs tracking-[0.3em] text-muted uppercase">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-control border border-edge font-display text-sm tracking-normal text-ink"
            aria-hidden="true"
          >
            A
          </span>
          <span className="hidden sm:inline">{t('eyebrow')}</span>
        </p>
        <div className="flex items-center gap-2 sm:gap-3">
          <ResumeLink variant="header" />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Phones read identity, portrait, details; wide screens put the
          portrait beside both. Grid areas keep it one DOM order for both, so the
          name - the strongest element - is always the first thing read. */}
      <div className="mx-auto grid w-full max-w-6xl items-center gap-x-14 gap-y-8 px-5 pt-8 pb-28 [grid-template-areas:'identity'_'portrait'_'details'] sm:px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:pt-14 md:[grid-template-areas:'portrait_identity'_'portrait_details'] lg:gap-x-20">
        <div className="flex min-w-0 flex-col gap-4 [grid-area:identity] md:self-end">
          <p className="font-mono text-[11px] tracking-[0.3em] text-accent uppercase sm:hidden">{t('eyebrow')}</p>
          <h1 className="flex flex-col font-display leading-[0.92] tracking-tight">
            <span className="ao-landing-name text-[clamp(3rem,8.5vw,6.25rem)] font-bold">{t('firstName')}</span>
            {/* A real space, so the heading's text is "Ahmadreza Taheri" for
                search engines and screen readers; flex layout hides it. */}{' '}
            <span className="mt-2 text-[clamp(1.4rem,4vw,2.4rem)] font-normal text-muted">{t('lastName')}</span>
          </h1>
          <span className="h-px w-16 bg-accent" aria-hidden="true" />
          <p className="max-w-xl font-body text-lg leading-snug text-ink sm:text-xl">{t('role')}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <ResumeLink variant="inline" />
            <EmailLink />
          </div>
        </div>

        <div className="[grid-area:portrait]">
          <Portrait
            alt={t('portraitAlt')}
            placeholder={t('photoPlaceholder')}
            dimensions={t('photoDimensions', { width: PORTRAIT.width, height: PORTRAIT.height })}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-8 [grid-area:details] md:self-start">
          <dl aria-label={t('factsLabel')} className="grid grid-cols-2 gap-px overflow-hidden rounded-window border border-edge bg-edge">
            {facts.map((fact) => (
              <div key={fact.label} className="flex min-w-0 flex-col-reverse gap-1 bg-surface px-4 py-3.5">
                <dt className="font-mono text-[10px] tracking-wide text-muted uppercase sm:text-[11px]">{fact.label}</dt>
                {/* Long German compounds hyphenate instead of breaking mid-word. */}
                <dd className="font-body text-[0.95rem] leading-tight font-bold break-words hyphens-auto text-ink sm:text-lg">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="choose-mode" className="flex flex-col gap-4">
            <div>
              <h2 id="choose-mode" className="font-body text-xl font-bold text-ink sm:text-2xl">
                {t('chooseTitle')}
              </h2>
              <p className="mt-1 font-body text-sm text-muted sm:text-base">{t('chooseLead')}</p>
            </div>
            <ModeChoice journeyHref={journeyHref} />
          </section>
        </div>
      </div>

      <JourneyHint label={t('hint')} />
    </main>
  );
}
