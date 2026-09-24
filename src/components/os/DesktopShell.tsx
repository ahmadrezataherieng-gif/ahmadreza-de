'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { apps } from '@/components/apps/registry';
import { AppIcon } from '@/components/os/AppIcon';
import { AmonelOsLockup } from '@/components/ui/Brand';
import { LegalLinks } from '@/components/ui/SiteFooter';
import { LockedNotice } from '@/components/os/LockedNotice';
import { Taskbar } from '@/components/os/Taskbar';
import { WindowLayer } from '@/components/os/WindowLayer';
import { replayJourney } from '@/components/os/replay';
import { cycleWindows, launchApp } from '@/components/os/window-actions';
import { onOpenAppRequest } from '@/lib/app-handoff';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/** Typing targets keep their own keys; the window shortcut stays out of them. */
function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/**
 * The window manager, for a wide screen with a precise pointer: a top bar over
 * the strip the Convergence ends on, icons down the start edge, windows in the
 * area between, and the taskbar over the seam.
 *
 * Window cycling is Alt+Shift+Arrow (right: next, left: previous). Browsers do
 * not claim it - unlike Alt+Tab (the operating system), Ctrl+Tab (tabs) and
 * Alt+Arrow (history) - and it is ignored while typing in a field, where
 * Option+Shift+Arrow selects words on a Mac.
 */
export function DesktopShell() {
  const t = useTranslations('os');
  const tNav = useTranslations('nav');
  const locale = useLocale() as Locale;

  // An app asking for another (the Terminal's `ask` opens the Assistant, APP-13).
  useEffect(() => onOpenAppRequest((appId) => void launchApp(appId)), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      if (isEditable(event.target)) return;
      event.preventDefault();
      cycleWindows(event.key === 'ArrowRight' ? 1 : -1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-window" data-layout="desktop">
      <div className="ao-topbar ao-reveal absolute inset-x-0 top-0 flex h-[3.5cqh] items-center justify-between gap-3 px-3 text-[max(10px,1.35cqh)]">
        <AmonelOsLockup label={t('brand')} />
        <span className="flex items-center gap-4 font-mono text-muted">
          <Link href={viewHref(locale, 'landing')} className="hover:text-ink focus-visible:text-ink">
            {tNav('home')}
          </Link>
          <button
            type="button"
            data-action="replay"
            onClick={() => replayJourney(locale)}
            className="cursor-pointer hover:text-ink focus-visible:text-ink"
          >
            {t('replay')}
          </button>
          <LegalLinks className="gap-x-4" linkClassName="p-0 hover:no-underline focus-visible:text-ink" />
        </span>
      </div>

      <div className="ao-desktop-area absolute inset-x-0 top-[3.5cqh]" data-desktop-area="">
        <nav aria-label={t('icons')} className="ao-reveal absolute inset-0 z-[var(--ao-z-icons)] p-3">
          <ul className="grid h-full grid-flow-col grid-rows-[repeat(auto-fill,6.75rem)] content-start justify-start gap-x-1">
            {apps.map((app) => (
              <li key={app.id}>
                <AppIcon appId={app.id} variant="desktop" />
              </li>
            ))}
          </ul>
        </nav>
        <WindowLayer />
      </div>

      <Taskbar />
      <LockedNotice className="ao-notice-slot" />
    </div>
  );
}
