'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { apps } from '@/components/apps/registry';
import { AppIcon } from '@/components/os/AppIcon';
import { replayJourney } from '@/components/os/replay';
import { AmonelMark } from '@/components/ui/Brand';
import { LAUNCHER_BUTTON_ID } from '@/components/os/window-actions';
import { asStringList } from '@/lib/message-shapes';
import type { Locale } from '@/lib/i18n-config';
import { cn } from '@/lib/cn';

/**
 * The launcher: every app - base apps first, then the bonus apps the puzzles
 * unlock, locked ones grey - plus the way back into the journey and the
 * keyboard shortcuts. A non-modal panel: Escape or a click outside closes it,
 * and Escape returns focus to the button.
 */
export function Launcher() {
  const t = useTranslations('os');
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const base = apps.filter((app) => app.kind === 'base');
  const bonus = apps.filter((app) => app.kind === 'bonus');

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={LAUNCHER_BUTTON_ID}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        data-action="launcher"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'ao-themed flex h-9 cursor-pointer items-center gap-2 rounded-control border px-2.5 font-mono text-xs tracking-wide uppercase',
          'focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
          open ? 'border-accent bg-elevated text-accent' : 'border-edge text-ink hover:border-accent',
        )}
      >
        {/* A small place: the mark alone, never the wordmark (brand kit). */}
        <AmonelMark uid="ao-launcher-mark" className="h-5 w-5" />
        {t('launcher.open')}
      </button>

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-label={t('launcher.title')}
        hidden={!open}
        data-launcher=""
        className="ao-launcher ao-themed absolute start-0 bottom-[calc(100%+0.75rem)] z-[var(--ao-z-modal)] w-[min(26rem,90cqw)] flex-col overflow-hidden rounded-window border border-edge bg-surface shadow-window [&:not([hidden])]:flex"
      >
        <div className="max-h-[min(58cqh,30rem)] min-h-0 overflow-y-auto p-3">
          <LauncherSection title={t('launcher.base')}>
            {base.map((app) => (
              <li key={app.id}>
                <AppIcon appId={app.id} variant="launcher" onLaunch={() => setOpen(false)} />
              </li>
            ))}
          </LauncherSection>
          <LauncherSection title={t('launcher.bonus')}>
            {bonus.map((app) => (
              <li key={app.id}>
                <AppIcon appId={app.id} variant="launcher" onLaunch={() => setOpen(false)} />
              </li>
            ))}
          </LauncherSection>
        </div>
        <div className="flex flex-col gap-2 border-t border-edge bg-elevated/60 p-3">
          <button
            type="button"
            data-action="replay"
            onClick={() => replayJourney(locale)}
            className="ao-themed w-fit cursor-pointer rounded-control border border-edge px-3 py-1.5 font-mono text-xs text-ink hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            {t('replay')}
          </button>
          <details className="font-body text-xs text-muted">
            <summary className="cursor-pointer font-mono tracking-wide uppercase">{t('launcher.shortcutsTitle')}</summary>
            <ul className="mt-2 list-disc space-y-1 ps-4">
              {asStringList(t.raw('launcher.shortcuts')).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}

function LauncherSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-3 last:mb-0">
      <h2 className="mb-1 px-2 font-mono text-[11px] tracking-wide text-muted uppercase">{title}</h2>
      <ul className="grid grid-cols-2 gap-0.5">{children}</ul>
    </section>
  );
}
