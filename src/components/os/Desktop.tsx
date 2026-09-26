import { getTranslations } from 'next-intl/server';

import { DesktopFrame } from '@/components/os/DesktopFrame';
import { DesktopShellLoader } from '@/components/os/DesktopShellLoader';
import { LegalLinks } from '@/components/ui/SiteFooter';
import { DesktopTheme } from '@/components/theme/DesktopTheme';
import { appIds, baseAppIds } from '@/content/eras';
import { viewHref } from '@/lib/routing';
import { viewMessages } from '@/lib/view-messages';
import type { Locale } from '@/lib/i18n-config';

/**
 * Act 3 - the Amonel OS desktop, at /desktop/ in every locale.
 *
 * The server paints only the empty desktop: the same frame the Convergence ends
 * on, so arriving from the journey changes nothing on screen. The shell - window
 * manager or home screen, taskbar, launcher - is client-only and fades in over
 * it: which of the two it is depends on the pointer, which only the browser
 * knows, and the clock would never match a server render. No GSAP, Lenis or era
 * code is imported anywhere below this component.
 */
export async function Desktop({ locale }: { locale: Locale }) {
  const t = await getTranslations('os');
  const tNav = await getTranslations('nav');
  const tSeo = await getTranslations('desktopSeo');
  const bonusAppIds = appIds.filter((id) => !baseAppIds.includes(id));
  const messages = await viewMessages(locale, 'desktop');

  return (
    <main className="relative h-dvh overflow-hidden bg-background text-ink">
      <DesktopTheme />
      <h1 className="ao-sr-only">{t('heading')}</h1>
      {/*
        What the desktop is and which programs it holds, in the static HTML
        (queue 7e): the apps load only on a click, so without this a crawler
        reads an h1 and nothing else. Visually hidden, so the desktop looks
        exactly as before; screen readers get it too. No links in it, so the
        keyboard never lands on something invisible. `desktopSeo` is read
        here on the server only and never sent to the client.
        CONTENT-TODO CR-1119
      */}
      <div className="ao-sr-only">
        <h2>{tSeo('heading')}</h2>
        <p>{tSeo('intro')}</p>
        <h2>{tSeo('baseHeading')}</h2>
        <ul>
          {baseAppIds.map((id) => (
            <li key={id}>
              {t(`apps.${id}.title`)}: {tSeo(`base.${id}`)}
            </li>
          ))}
        </ul>
        <h2>{tSeo('bonusHeading')}</h2>
        <p>{tSeo('bonusIntro')}</p>
        <ul>
          {bonusAppIds.map((id) => (
            <li key={id}>
              {t(`apps.${id}.title`)}: {t(`apps.${id}.description`)}
            </li>
          ))}
        </ul>
      </div>
      <div className="ao-desktop-screen relative h-dvh w-full bg-background">
        <DesktopFrame seamClassName="ao-desktop-seam" />
        <DesktopShellLoader locale={locale} messages={messages} />
      </div>
      <noscript>
        <div className="absolute inset-x-0 top-[40%] mx-auto max-w-md px-6 text-center font-body text-ink">
          {t('noscript')}{' '}
          <a href={viewHref(locale, 'landing')} className="text-accent underline">
            {t('home')}
          </a>
          <LegalLinks locale={locale} t={tNav} className="mt-3 justify-center text-xs" />
        </div>
      </noscript>
    </main>
  );
}
