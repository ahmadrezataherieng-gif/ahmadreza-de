'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { DEFAULT_MODE, useUnlockStore, type JourneyMode } from '@/store/unlock-store';
import { cn } from '@/lib/cn';
import { keepScrollAnchor } from '@/lib/lenis-controller';
import { requestPuzzleRelease } from '@/components/puzzles/hold';

/**
 * Persistent, unobtrusive switch between watching and playing.
 *
 * Switching is a single store write. Section heights are identical in both
 * modes, so the scroll position is untouched and the visitor stays exactly
 * where they were; only the puzzle layer re-renders.
 */
export function ModeSwitch() {
  const t = useTranslations('mode');
  const storedMode = useUnlockStore((state) => state.mode);
  const setMode = useUnlockStore((state) => state.setMode);

  // The persisted value arrives after hydration; render the default until then
  // so server and client markup agree.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const mode: JourneyMode = hydrated ? (storedMode ?? DEFAULT_MODE) : DEFAULT_MODE;

  const options: JourneyMode[] = ['guided', 'interactive'];

  return (
    <div
      role="group"
      aria-label={t('label')}
      className="ao-themed ao-chrome-backdrop flex items-center rounded-control border border-edge p-0.5"
    >
      {options.map((option) => {
        const active = option === mode;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            data-mode-option={option}
            onClick={() => {
              // Watching cannot hold the page: end a puzzle being played first.
              if (option === 'guided') requestPuzzleRelease();
              // The two modes render puzzles of different heights in document
              // flow (reduced motion); keep the visitor's place.
              keepScrollAnchor(() => setMode(option));
            }}
            className={cn(
              'ao-themed flex cursor-pointer items-center gap-1.5 rounded-control px-2 py-1 font-mono text-[11px] tracking-wide uppercase transition-colors',
              active ? 'bg-accent text-background' : 'text-muted hover:text-ink',
            )}
          >
            <svg viewBox="0 0 20 20" className="h-3 w-3 shrink-0" aria-hidden="true">
              {option === 'guided' ? (
                <path d="M6 4l10 6-10 6z" fill="currentColor" />
              ) : (
                <path d="M4 2l11 7-5 1 3 6-2 1-3-6-4 3z" fill="currentColor" />
              )}
            </svg>
            {/* Labels collapse to icons on phones, but stay readable to AT. */}
            <span className="sr-only sm:not-sr-only">{t(option)}</span>
          </button>
        );
      })}
    </div>
  );
}
