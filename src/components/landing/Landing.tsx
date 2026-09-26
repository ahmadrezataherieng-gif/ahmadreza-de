import { getLocale, getTranslations } from 'next-intl/server';

import { DesktopCta } from '@/components/landing/DesktopCta';
import { EmailLink } from '@/components/landing/EmailLink';
import { JourneyHint } from '@/components/landing/JourneyHint';
import { ModeChoice } from '@/components/landing/ModeChoice';
import { Portrait } from '@/components/landing/Portrait';
import { ResumeLink } from '@/components/landing/ResumeLink';
import { Icon, Tip } from '@/components/illustrations/Icon';
import type { IconName } from '@/components/illustrations/icons';
import { AmonelLogo } from '@/components/ui/Brand';
import { StaticLanguageSwitcher } from '@/components/ui/StaticLanguageSwitcher';
import { SchemeToggle } from '@/components/ui/SchemeToggle';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { UseTheme } from '@/components/theme/UseTheme';
import { PORTRAIT } from '@/content/profile';
import { asStatList } from '@/lib/message-shapes';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

// One icon per key fact, in the order of landing.facts: the training, the place, the focus, the languages.
const FACT_ICONS: readonly IconName[] = ['server', 'pin', 'network', 'languages'];

// Machine text, the same in every language: the loopback address the snippet explains.
const LOCALHOST_CODE = '127.0.0.1  →  localhost';

/**
 * The landing page: present-day Ahmadreza, in the `modern` theme.
 *
 * It is the page a recruiter judges in three seconds and the page Google reads
 * first, so it is a server component with real HTML text and almost no
 * JavaScript: the only client islands are the language switcher, the desktop
 * call to action and the two mode cards (their words come in as props, so the
 * page ships no message provider). The journey's code - GSAP, Lenis, every era - is never loaded
 * here.
 *
 * Reading order, on every width: name, role, the ways to reach him, the key
 * facts in bold, then the two ways into the journey.
 */
export async function Landing() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('landing');
  const tSite = await getTranslations('site');
  const tNav = await getTranslations('nav');
  const tLearn = await getTranslations('learn');
  const facts = asStatList(t.raw('facts'));
  const journeyHref = viewHref(locale, 'journey');
  const desktopHref = viewHref(locale, 'desktop');

  return (
    <main className="ao-landing ao-site-page relative isolate min-h-dvh overflow-hidden bg-background text-ink">
      <UseTheme id="modern" />
      <div
        className="ao-landing-glow pointer-events-none absolute inset-0 z-[var(--ao-z-backdrop)]"
        aria-hidden="true"
      />
      <div
        className="ao-landing-grain pointer-events-none absolute inset-0 z-[var(--ao-z-backdrop)]"
        aria-hidden="true"
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 pt-5 sm:px-8">
        {/* The brand leads the header; the name leads the page (the h1 below). */}
        <p className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-muted uppercase">
          <AmonelLogo uid="ao-landing-logo" label={tSite('brand')} className="h-7 w-auto sm:h-8" />
          <span className="hidden h-4 w-px bg-edge sm:inline" aria-hidden="true" />
          <span className="hidden sm:inline">{t('eyebrow')}</span>
        </p>
        <div className="flex items-center gap-1 sm:gap-3">
          <ResumeLink variant="header" />
          <StaticLanguageSwitcher locale={locale} view="landing" />
          <SchemeToggle
            labels={{
              toLight: tNav('schemeToLight'),
              toDark: tNav('schemeToDark'),
            }}
          />
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
          <p className="-mt-2 max-w-xl font-body text-base leading-snug text-muted">{t('background')}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <ResumeLink variant="inline" />
            <EmailLink />
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 [grid-area:portrait]">
          {/* CONTENT-TODO CR-1123 (alt), CR-1122 (AI label) */}
          <Portrait
            alt={t('portraitAlt')}
            aiLabel={t('portraitAi')}
            placeholder={t('photoPlaceholder')}
            dimensions={t('photoDimensions', {
              width: PORTRAIT.width,
              height: PORTRAIT.height,
            })}
          />
          {/* CONTENT-TODO CR-1105: a learning snippet under the portrait, exactly its width; wide screens only. */}
          <Tip label={tLearn('label')} code={LOCALHOST_CODE} text={tLearn('localhost')} className="hidden w-full md:block" />
        </div>

        <div className="flex min-w-0 flex-col gap-8 [grid-area:details] md:self-start">
          <dl
            aria-label={t('factsLabel')}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-window border border-edge bg-edge"
          >
            {facts.map((fact, index) => (
              <div key={fact.label} className="relative flex min-w-0 flex-col-reverse gap-1 bg-surface py-3.5 ps-4 pe-10">
                <dt className="font-mono text-[10px] tracking-wide text-muted uppercase sm:text-[11px]">
                  {fact.label}
                </dt>
                {/* Long German compounds hyphenate instead of breaking mid-word. */}
                <dd className="font-body text-[0.95rem] leading-tight font-bold break-words hyphens-auto text-ink sm:text-lg">
                  {/* Inside the dd: a dl group may only hold dt and dd. Placed against the cell's corner. */}
                  {FACT_ICONS[index] ? <Icon name={FACT_ICONS[index]} className="absolute end-3 top-3.5 text-accent" /> : null}
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Fixed height: a returning visitor's "Zum Desktop" replaces the
              shortcut here without moving anything below it. */}
          <DesktopCta
            desktopHref={desktopHref}
            labels={{
              welcomeBack: t('welcomeBack'),
              desktopCta: t('desktopCta'),
              desktopShortcutLead: t('desktopShortcutLead'),
              desktopShortcut: t('desktopShortcut'),
            }}
          />

          <section aria-labelledby="choose-mode" className="ao-mode-section flex flex-col gap-4">
            <div>
              <h2 id="choose-mode" className="font-body text-xl font-bold text-ink sm:text-2xl">
                {t('chooseTitle')}
              </h2>
              <p className="mt-1 font-body text-sm text-muted sm:text-base">{t('chooseLead')}</p>
            </div>
            <ModeChoice
              journeyHref={journeyHref}
              lastChosen={t('lastChosen')}
              options={[
                { mode: 'guided', title: t('guidedTitle'), text: t('guidedText'), time: t('guidedTime') },
                { mode: 'interactive', title: t('interactiveTitle'), text: t('interactiveText'), time: t('interactiveTime') },
              ]}
            />
          </section>
        </div>
      </div>

      {/* The hint sits just above the footer, whose legal links close every page. */}
      <JourneyHint label={t('hint')} className="bottom-10" />
      <SiteFooter locale={locale} t={tNav} className="mx-auto flex w-full max-w-6xl justify-center px-5 pb-4 sm:justify-end sm:px-8" />
    </main>
  );
}
