import { getTranslations } from 'next-intl/server';

import { DesktopFrame } from '@/components/os/DesktopFrame';
import { DesktopShellLoader } from '@/components/os/DesktopShellLoader';
import { LegalLinks } from '@/components/ui/SiteFooter';
import { DesktopTheme } from '@/components/theme/DesktopTheme';
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
  const messages = await viewMessages(locale, 'desktop');

  return (
    <main className="relative h-dvh overflow-hidden bg-background text-ink">
      <DesktopTheme />
      <h1 className="ao-sr-only">{t('heading')}</h1>
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
