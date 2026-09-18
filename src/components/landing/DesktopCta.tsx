'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import { selectHasCompletedJourney, useUnlockStore } from '@/store/unlock-store';

/**
 * The desktop's place on the landing page, in a slot of fixed height.
 *
 * The server renders the default: a quiet shortcut for someone who only wants
 * the résumé and the contact details. A returning visitor - one who has reached
 * the desktop before - gets "Zum Desktop" as the primary call to action in the
 * same slot, and the mode cards step back (DECISIONS.md 49). The slot's height
 * never changes, so the switch after hydration moves nothing.
 */
export function DesktopCta({ desktopHref }: { desktopHref: string }) {
  const t = useTranslations('landing');
  const completed = useUnlockStore(selectHasCompletedJourney);
  // The persisted store only exists after hydration; until then render the
  // server's default, so both renders agree.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const returning = hydrated && completed;

  useEffect(() => {
    // The mode cards read this to step back (a class, not a re-render there).
    document.documentElement.toggleAttribute('data-returning', returning);
  }, [returning]);

  return (
    <div className="ao-desktop-cta flex h-16 items-center" data-returning-cta={returning ? '' : undefined}>
      {returning ? (
        <div className="flex w-full items-center justify-between gap-4 rounded-window border border-accent bg-elevated px-4 py-2.5">
          <span className="font-body text-sm text-muted sm:text-base">{t('welcomeBack')}</span>
          <Link
            href={desktopHref}
            data-action="landing-desktop"
            className="ao-themed inline-flex shrink-0 items-center gap-2 rounded-control border border-accent bg-accent px-4 py-2 font-mono text-sm tracking-wide text-background uppercase hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            {t('desktopCta')}
            <Arrow />
          </Link>
        </div>
      ) : (
        <p className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-window border border-edge px-4 py-2.5 font-body text-sm text-muted">
          <span>{t('desktopShortcutLead')}</span>
          <Link
            href={desktopHref}
            data-action="landing-desktop"
            className={cn(
              'inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-ink uppercase',
              'hover:text-accent focus-visible:text-accent',
            )}
          >
            {t('desktopShortcut')}
            <Arrow />
          </Link>
        </p>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 10" className="h-2.5 w-4 rtl:-scale-x-100" aria-hidden="true">
      <path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
