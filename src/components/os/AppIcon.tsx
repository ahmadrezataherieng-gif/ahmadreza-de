'use client';

import { useTranslations } from 'next-intl';

import type { AppId } from '@/content/eras';
import { getApp } from '@/components/apps/registry';
import { AppGlyph, LockGlyph } from '@/components/apps/icons';
import { launchApp } from '@/components/os/window-actions';
import { cn } from '@/lib/cn';
import { selectIsAppUnlocked, useUnlockStore } from '@/store/unlock-store';

/**
 * An app's icon: on the desktop, in the launcher, on the home screen and in the
 * dock. A locked bonus app is grey with a padlock; activating it explains which
 * puzzle unlocks it instead of opening. A single click (or Enter) opens - this
 * is a website, and nobody should have to know to double-click.
 */
export function AppIcon({
  appId,
  variant,
  onLaunch,
  onOpen,
}: {
  appId: AppId;
  variant: 'desktop' | 'launcher' | 'home' | 'dock';
  /** Called after any activation, open or locked (the launcher closes itself). */
  onLaunch?: () => void;
  /** Opens the app instead of the window manager (the mobile shell). */
  onOpen?: (id: AppId) => void;
}) {
  const t = useTranslations('os');
  const unlocked = useUnlockStore(selectIsAppUnlocked(appId));
  const title = t(getApp(appId).titleKey);
  const label = unlocked ? title : t('locked.iconLabel', { app: title });

  const activate = () => {
    if (unlocked && onOpen) onOpen(appId);
    else launchApp(appId);
    onLaunch?.();
  };

  const row = variant === 'launcher';

  return (
    <button
      type="button"
      onClick={activate}
      aria-label={label}
      data-app={appId}
      data-locked={unlocked ? undefined : ''}
      className={cn(
        'ao-app-icon ao-themed group flex cursor-pointer items-center rounded-control text-ink outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent',
        row
          ? 'w-full gap-3 px-2 py-1.5 text-start hover:bg-elevated'
          : 'w-[5.5rem] flex-col gap-1.5 px-1 py-2 text-center hover:bg-surface/70',
        variant === 'dock' && 'w-auto flex-1 py-1',
      )}
    >
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-control border',
          row ? 'h-8 w-8' : 'h-12 w-12',
          unlocked
            ? 'border-edge bg-elevated text-accent group-hover:border-accent'
            : 'border-edge/60 bg-surface text-muted opacity-60 grayscale',
        )}
      >
        <AppGlyph appId={appId} className={row ? 'h-5 w-5' : 'h-7 w-7'} />
        {unlocked ? null : (
          <span className="absolute -end-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-edge bg-background text-muted">
            <LockGlyph className="h-3 w-3" />
          </span>
        )}
      </span>
      <span
        className={cn(
          'font-body leading-tight',
          row ? 'text-sm' : 'line-clamp-2 text-xs',
          variant === 'dock' && 'sr-only',
          unlocked ? 'text-ink' : 'text-muted',
        )}
        aria-hidden="true"
      >
        {title}
      </span>
    </button>
  );
}
