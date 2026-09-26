'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/illustrations/Icon';
import { useUnlockStore, type JourneyMode } from '@/store/unlock-store';
import { cn } from '@/lib/cn';
import { count } from '@/lib/count';
import { modeChosen } from '@/lib/counters';
import { allowJourneyReplay } from '@/lib/returning';
import { useIntentPrefetch } from '@/lib/intent-prefetch';

/**
 * The two ways into the journey, as the landing page's primary call to action.
 *
 * Each is a real link to the journey, so it works before hydration and without
 * JavaScript; clicking it also stores the chosen mode. Neither is styled as the
 * lesser option - they differ only in how much time the visitor has. For a
 * returning visitor both step back behind "Zum Desktop" (`html[data-returning]`,
 * set by DesktopCta), without changing size. The Play
 * card's copy must describe the gates honestly: an era opens once its puzzle is
 * solved or its solution shown.
 */
export function ModeChoice({
  journeyHref,
  options,
  lastChosen: lastChosenLabel,
}: {
  journeyHref: string;
  options: Array<{ mode: JourneyMode; title: string; text: string; time: string }>;
  /** "Last chosen", next to the card the visitor took before. */
  lastChosen: string;
}) {
  const intent = useIntentPrefetch(journeyHref);
  const storedMode = useUnlockStore((state) => state.mode);
  const setMode = useUnlockStore((state) => state.setMode);

  // The persisted mode only exists after hydration; until then render as if
  // nothing was chosen, so server and client markup agree.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const lastChosen = hydrated ? storedMode : null;

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option, index) => (
        <li key={option.mode}>
          <Link
            href={journeyHref}
            {...intent}
            onClick={() => {
              setMode(option.mode);
              count(modeChosen(option.mode));
              // Choosing a mode is choosing the journey: a returning visitor
              // is not redirected to the desktop for it.
              allowJourneyReplay();
            }}
            className={cn(
              'ao-themed group relative flex h-full flex-col gap-2 overflow-hidden rounded-window border bg-surface p-5 shadow-window transition-colors',
              'hover:border-accent hover:bg-elevated focus-visible:border-accent',
              lastChosen === option.mode ? 'border-accent' : 'border-edge',
            )}
          >
            {/* A thin accent rule that grows on hover: the card's only motion. */}
            <span
              className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100 rtl:origin-right"
              aria-hidden="true"
            />
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs text-muted" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-xl font-bold text-ink">{option.title}</span>
              </span>
              {/* Watch it happen, or do it yourself: the icon set's play and pointer (BR-09). */}
              <Icon name={option.mode === 'guided' ? 'play' : 'pointer'} className="h-6 w-6 text-accent" />
            </span>
            <span className="font-body text-sm leading-snug text-muted">{option.text}</span>
            <span className="mt-auto flex items-center justify-between gap-2 pt-2 font-mono text-[11px] tracking-wide text-accent uppercase">
              {option.time}
              {lastChosen === option.mode && <span className="text-muted normal-case">{lastChosenLabel}</span>}
            </span>
            <span
              className="absolute end-4 bottom-4 translate-x-0 text-accent opacity-0 transition-all group-hover:opacity-100 rtl:-scale-x-100"
              aria-hidden="true"
            >
              <svg viewBox="0 0 16 10" className="h-2.5 w-4">
                <path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
