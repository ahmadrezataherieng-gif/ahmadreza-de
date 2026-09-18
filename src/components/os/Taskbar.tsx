'use client';

import { useTranslations } from 'next-intl';

import { getApp } from '@/components/apps/registry';
import { AppGlyph } from '@/components/apps/icons';
import { Clock } from '@/components/os/Clock';
import { Launcher } from '@/components/os/Launcher';
import { ResumeControl } from '@/components/os/ResumeControl';
import { toggleFromTaskbar } from '@/components/os/window-actions';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { cn } from '@/lib/cn';
import { useWindowStore } from '@/store/window-store';

/**
 * The taskbar grows out of the seam of light the Convergence ends on. From the
 * start: the launcher, a button per open window, then the résumé, the language
 * and the clock at the end.
 */
export function Taskbar() {
  const t = useTranslations('os');
  // The store's own array: its reference changes only when a window does. A
  // selector that built new objects here never compared equal and re-rendered
  // without end.
  const allWindows = useWindowStore((store) => store.windows);
  const windows = allWindows
    .filter((w) => !w.closing)
    .map((w) => ({ id: w.id, minimised: w.mode === 'minimised' }));
  const focusedId = useWindowStore((store) => store.focusedId);

  return (
    // A labelled region, not role="toolbar": that pattern promises arrow-key
    // navigation between the items, and these are reached with Tab.
    <section
      aria-label={t('taskbar.label')}
      data-taskbar=""
      className="ao-taskbar ao-reveal ao-themed absolute z-[var(--ao-z-taskbar)] flex h-12 items-center gap-2 rounded-window border border-edge bg-surface/90 px-2 shadow-window backdrop-blur-sm"
    >
      <Launcher />
      <span className="h-6 w-px shrink-0 bg-edge" aria-hidden="true" />
      <ul aria-label={t('taskbar.windows')} className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {windows.map(({ id, minimised }) => {
          const active = focusedId === id && !minimised;
          const title = t(getApp(id).titleKey);
          return (
            <li key={id} className="min-w-0">
              <button
                type="button"
                data-taskbar-window={id}
                aria-pressed={active}
                title={title}
                onClick={() => toggleFromTaskbar(id)}
                className={cn(
                  'ao-themed relative flex h-9 max-w-[10rem] min-w-0 cursor-pointer items-center gap-2 rounded-control border px-2.5 font-body text-xs',
                  'focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                  active ? 'border-accent/60 bg-elevated text-ink' : 'border-transparent text-muted hover:bg-elevated hover:text-ink',
                  minimised && 'opacity-70',
                )}
              >
                <AppGlyph appId={id} className={cn('h-4 w-4 shrink-0', active ? 'text-accent' : '')} />
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{title}</span>
                {active ? (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" aria-hidden="true" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <ResumeControl />
      <LanguageSwitcher className="shrink-0" />
      <Clock className="shrink-0 px-2 text-sm text-ink" />
    </section>
  );
}
