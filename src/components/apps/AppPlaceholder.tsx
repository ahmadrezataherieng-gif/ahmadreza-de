'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import type { AppId } from '@/content/eras';
import { AppGlyph } from '@/components/apps/icons';

/**
 * The Phase 6 stand-in for an app: its glyph, its name, one line on what it
 * will be, and whatever already works (the résumé download, the email).
 * Phase 7 replaces each app's component; the window around it stays.
 */
export function AppPlaceholder({
  appId,
  body,
  children,
}: {
  appId: AppId;
  /** Overrides the app's own `body` line (the bonus apps name their era). */
  body?: string;
  children?: ReactNode;
}) {
  const t = useTranslations('os');
  const text = body ?? (t.has(`apps.${appId}.body`) ? t(`apps.${appId}.body`) : t('soon'));

  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-edge bg-elevated text-accent">
          <AppGlyph appId={appId} className="h-7 w-7" />
        </span>
        <h2 className="font-display text-xl font-bold text-ink">{t(`apps.${appId}.title`)}</h2>
      </div>
      <p className="max-w-prose font-body leading-relaxed text-ink">{text}</p>
      {children}
      {body === undefined && t.has(`apps.${appId}.body`) ? (
        <p className="mt-auto font-mono text-xs tracking-wide text-muted uppercase">{t('soon')}</p>
      ) : null}
    </div>
  );
}
