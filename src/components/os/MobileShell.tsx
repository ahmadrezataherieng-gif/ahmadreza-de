'use client';

import { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import type { AppId } from '@/content/eras';
import { LegalLinks } from '@/components/ui/SiteFooter';
import { apps, dockAppIds, getApp } from '@/components/apps/registry';
import { AppGlyph } from '@/components/apps/icons';
import { AppIcon } from '@/components/os/AppIcon';
import { Clock } from '@/components/os/Clock';
import { LockedNotice } from '@/components/os/LockedNotice';
import { replayJourney } from '@/components/os/replay';
import { SoundToggle } from '@/components/os/SoundToggle';
import { onOpenAppRequest } from '@/lib/app-handoff';
import { playSound } from '@/lib/sound-engine';
import { AmonelOsLockup } from '@/components/ui/Brand';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { viewHref } from '@/lib/routing';
import { useIntentPrefetch } from '@/lib/intent-prefetch';
import { count } from '@/lib/count';
import { appOpened } from '@/lib/counters';
import type { Locale } from '@/lib/i18n-config';
import { useShellStore } from '@/store/shell-store';

/** The history-state key marking an entry on which an app is open. */
const HISTORY_KEY = '__aoApp';

function appInState(state: unknown): AppId | null {
  const value = (state as Record<string, unknown> | null)?.[HISTORY_KEY];
  return typeof value === 'string' && apps.some((app) => app.id === value) ? (value as AppId) : null;
}

/**
 * The home screen, for phones and touch tablets: a status bar with the clock
 * over the top strip, a grid of apps, and a dock of the four a recruiter came
 * for over the seam. Apps open fullscreen with a back button.
 *
 * Opening an app pushes a history entry, so the browser's Back button closes it
 * and does not leave the desktop. The entry keeps whatever state the router
 * stored (as the journey's puzzle dialog does), and nothing here touches
 * `history.scrollRestoration`, which the journey manages per entry.
 */
export function MobileShell() {
  const t = useTranslations('os');
  const tNav = useTranslations('nav');
  const locale = useLocale() as Locale;
  const homeIntent = useIntentPrefetch(viewHref(locale, 'landing'));
  const [openId, setOpenId] = useState<AppId | null>(null);
  const dismissLocked = useShellStore((store) => store.dismissLocked);

  useEffect(() => {
    // A reload lands on a clean home screen, as the desktop does.
    if (appInState(window.history.state)) {
      const rest = { ...(window.history.state as Record<string, unknown>) };
      delete rest[HISTORY_KEY];
      window.history.replaceState(rest, '', window.location.href);
    }
    const onPopState = (event: PopStateEvent) => setOpenId(appInState(event.state));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const open = useCallback(
    (id: AppId) => {
      dismissLocked();
      const current = (window.history.state as Record<string, unknown> | null) ?? {};
      window.history.pushState({ ...current, [HISTORY_KEY]: id }, '', window.location.href);
      setOpenId(id);
      playSound('open');
    },
    [dismissLocked],
  );

  // An app asking for another (the Terminal's `ask` opens the Assistant, APP-13); Back returns to the app it came from.
  useEffect(() => onOpenAppRequest((appId) => open(appId)), [open]);

  const home = apps.filter((app) => !dockAppIds.includes(app.id));

  return (
    <div className="absolute inset-0 overflow-hidden rounded-window" data-layout="mobile">
      <div className="ao-reveal absolute inset-x-0 top-0 flex h-[3.5cqh] items-center justify-between px-4 text-[max(11px,1.5cqh)]">
        <Clock className="text-ink" />
        <AmonelOsLockup label={t('brand')} />
      </div>

      <div className="ao-home ao-reveal absolute inset-x-0 top-[3.5cqh] overflow-y-auto" inert={openId !== null}>
        <nav aria-label={t('mobile.apps')} className="px-3 pt-5">
          <ul className="grid grid-cols-4 justify-items-center gap-y-3">
            {home.map((app) => (
              <li key={app.id}>
                <AppIcon appId={app.id} variant="home" onOpen={open} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 flex flex-col items-center gap-3 px-4 pb-4 font-mono text-xs text-muted">
          <button
            type="button"
            data-action="replay"
            onClick={() => replayJourney(locale)}
            className="ao-themed cursor-pointer rounded-control border border-edge px-3 py-1.5 text-ink hover:border-accent"
          >
            {t('replay')}
          </button>
          <Link href={viewHref(locale, 'landing')} {...homeIntent} className="hover:text-ink">
            {t('home')}
          </Link>
          <SoundToggle />
          <LanguageSwitcher />
          <LegalLinks locale={locale} t={tNav} className="justify-center" />
        </div>
      </div>

      <nav
        data-dock=""
        aria-label={t('mobile.dock')}
        className="ao-dock ao-reveal ao-themed absolute z-[var(--ao-z-taskbar)] flex items-center rounded-window border border-edge bg-surface/90 p-1.5 shadow-window backdrop-blur-sm"
        inert={openId !== null}
      >
        {dockAppIds.map((id) => (
          <AppIcon key={id} appId={id} variant="dock" onOpen={open} />
        ))}
      </nav>

      <LockedNotice className="ao-notice-slot ao-notice-slot--mobile" />

      {openId ? <MobileApp id={openId} /> : null}
    </div>
  );
}

/** One app, fullscreen. Back - the button or the browser's - returns home. */
function MobileApp({ id }: { id: AppId }) {
  const t = useTranslations('os');
  const titleId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const app = getApp(id);

  useEffect(() => count(appOpened(id)), [id]);

  useEffect(() => {
    bodyRef.current?.focus({ preventScroll: true });
    return () => {
      // Back on the home screen: focus returns to the icon the app came from.
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-app="${id}"]`)?.focus({ preventScroll: true }));
    };
  }, [id]);

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-mobile-app={id}
      className="ao-mobile-app ao-themed absolute inset-0 z-[var(--ao-z-modal)] flex flex-col bg-surface"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-edge px-2">
        <button
          type="button"
          data-action="mobile-back"
          onClick={() => window.history.back()}
          className="ao-themed flex h-10 cursor-pointer items-center gap-1.5 rounded-control px-2 font-mono text-xs tracking-wide text-accent uppercase focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          {t('mobile.back')}
        </button>
        <AppGlyph appId={id} className="ms-auto h-5 w-5 text-muted" />
        <h2 id={titleId} className="me-2 font-display text-base font-bold text-ink">
          {t(app.titleKey)}
        </h2>
      </header>
      <div ref={bodyRef} tabIndex={-1} data-window-body="" className="min-h-0 flex-1 overflow-y-auto outline-none">
        <Suspense fallback={<p className="p-6 font-mono text-xs text-muted">{t('window.loading')}</p>}>
          <app.Component appId={id} />
        </Suspense>
      </div>
    </section>
  );
}
