'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getApp } from '@/components/apps/registry';
import { eraSectionHash, eraYearArgument, unlockingEra } from '@/components/apps/unlock';
import { LockGlyph } from '@/components/apps/icons';
import { replayJourney } from '@/components/os/replay';
import type { Locale } from '@/lib/i18n-config';
import { cn } from '@/lib/cn';
import { useShellStore } from '@/store/shell-store';

/**
 * What activating a locked bonus app says: what the app is, which era's puzzle
 * unlocks it - or that finishing the journey unlocks them all - with a way
 * straight to that era in the journey (DECISIONS.md 57). A status message, announced politely and not
 * focus-stealing; it stays until dismissed (Escape, its button, or opening
 * another app) rather than timing out on a slow reader.
 */
export function LockedNotice({ className }: { className?: string }) {
  const t = useTranslations('os');
  const locale = useLocale() as Locale;
  const appId = useShellStore((store) => store.lockedNotice);
  const dismiss = useShellStore((store) => store.dismissLocked);
  const era = appId ? unlockingEra(appId) : undefined;

  useEffect(() => {
    if (!appId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [appId, dismiss]);

  return (
    <div role="status" aria-live="polite" className={cn('pointer-events-none absolute z-[var(--ao-z-modal)]', className)}>
      {appId ? (
        <div
          data-locked-notice={appId}
          className="ao-notice ao-themed pointer-events-auto flex max-w-[min(34rem,92cqw)] flex-wrap items-center gap-x-3 gap-y-2 rounded-window border border-edge bg-elevated px-4 py-3 shadow-window"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-edge text-muted">
            <LockGlyph className="h-3.5 w-3.5" />
          </span>
          <p className="min-w-0 flex-1 font-body text-sm text-ink">
            <span className="sr-only">{t('locked.label')}: </span>
            {t('locked.message', {
              year: eraYearArgument(era),
              app: t(getApp(appId).titleKey),
            })}{' '}
            {t('locked.orFinish')}
            {t.has(`apps.${appId}.description`) ? (
              <span className="mt-1 block text-xs text-muted">{t(`apps.${appId}.description`)}</span>
            ) : null}
          </p>
          <span className="flex shrink-0 gap-2">
            <button
              type="button"
              data-action="locked-play"
              onClick={() => replayJourney(locale, eraSectionHash(era))}
              className="ao-themed cursor-pointer rounded-control border border-accent px-3 py-1 font-mono text-xs text-accent hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {t('locked.play', { year: eraYearArgument(era) })}
            </button>
            <button
              type="button"
              data-action="locked-dismiss"
              aria-label={t('locked.dismiss')}
              title={t('locked.dismiss')}
              onClick={dismiss}
              className="ao-themed flex h-7 w-7 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
              </svg>
            </button>
          </span>
        </div>
      ) : null}
    </div>
  );
}
