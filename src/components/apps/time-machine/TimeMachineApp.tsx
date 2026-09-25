'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import { destinationForYear, writeStoredTheme, yearStops, type Destination } from '@/components/apps/time-machine/time-machine';
import { themeToCssVars } from '@/lib/apply-theme';
import { cn } from '@/lib/cn';
import { getTheme, themeIds, type ThemeEffects, type ThemeId } from '@/lib/themes';
import { playSound } from '@/lib/sound-engine';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { useThemeStore } from '@/store/theme-store';

// CONTENT-TODO CR-1074, CR-1075, CR-1076 (all words in messages/apps/time-machine/)
/** How long the counter runs before the desktop changes, and how many stops it makes. */
const JUMP_MS = 1100;
const JUMP_STOPS = 14;
const EFFECTS = ['scanlines', 'phosphorGlow', 'pixelation', 'dithering', 'noise', 'curvature'] as const satisfies readonly (keyof ThemeEffects)[];

/**
 * Every capsule wears its own era: the same token blocks the journey uses for
 * its crossings (`data-theme-scope`), generated from `themes.ts`, so a capsule
 * is a real, miniature piece of that theme and never a picture of it.
 */
const SCOPE_CSS = themeIds
  .map(
    (id) =>
      `[data-theme-scope="${id}"]{${Object.entries(themeToCssVars(getTheme(id)))
        .map(([name, value]) => `${name}:${value}`)
        .join(';')}}`,
  )
  .join('');

/**
 * The Time Machine (Phase 9D-2, DECISIONS.md 64), unlocked by the last era:
 * one click re-skins the whole desktop into any of the eight themes - colours,
 * fonts, corners, shadows, effects - through the same theme engine the journey
 * uses, unchanged. The choice is remembered in this browser until the visitor
 * comes back to the present.
 */
export function TimeMachineApp(props: AppProps) {
  return (
    <AppMessages copy={['time-machine']}>
      <TimeMachine {...props} />
    </AppMessages>
  );
}

function yearOf(id: ThemeId, currentYear: number): number {
  const year = getTheme(id).year;
  return year === null || year === 'today' ? currentYear : Number(year);
}

function TimeMachine({ appId }: AppProps) {
  const t = useTranslations('time-machine');
  const id = useId();
  const reduced = useReducedMotion();
  const active = useThemeStore((state) => state.themeId);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [jump, setJump] = useState<{ to: ThemeId; stops: number[]; step: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [destination, setDestination] = useState<Destination | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const arrive = (to: ThemeId) => {
    const { setTheme, lockTheme } = useThemeStore.getState();
    setTheme(to, { force: true });
    // The era's own sound, when the visitor has turned sound on (APP-17).
    playSound('arrive');
    lockTheme(to !== 'modern');
    writeStoredTheme(window.localStorage, to);
    setJump(null);
    setAnnouncement(to === 'modern' ? t('backHome') : t('arrived', { era: label(to) }));
  };

  const label = (theme: ThemeId) => {
    const year = getTheme(theme).year;
    return `${year === null ? t('present') : year === 'today' ? t('today') : year} · ${t(`themes.${theme}.name`)}`;
  };

  // The counter: each stop after the last, then the desktop changes at once.
  useEffect(() => {
    if (!jump) return;
    if (jump.step >= jump.stops.length) {
      arrive(jump.to);
      return;
    }
    timer.current = window.setTimeout(() => setJump({ ...jump, step: jump.step + 1 }), JUMP_MS / JUMP_STOPS);
    return () => window.clearTimeout(timer.current);
    // `arrive` only reads the store and copy; re-running on it would restart the counter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump]);

  const travel = (to: ThemeId) => {
    if (jump) return;
    if (to === active) return;
    window.clearTimeout(timer.current);
    if (reduced) {
      arrive(to);
      return;
    }
    setAnnouncement(t('jumping', { era: label(to) }));
    setJump({ to, stops: yearStops(yearOf(active, currentYear), yearOf(to, currentYear), JUMP_STOPS), step: 0 });
  };

  const onYear = (event: FormEvent) => {
    event.preventDefault();
    const next = destinationForYear(yearInput, currentYear);
    setDestination(next);
    if (next.kind === 'era') travel(next.themeId);
  };

  const shownYear = jump ? jump.stops[Math.min(jump.step, jump.stops.length - 1)] : yearOf(active, currentYear);

  return (
    <div data-app-content={appId} data-time-machine={active} className="@container min-h-full">
      <style>{SCOPE_CSS}</style>
      <div className="flex flex-col gap-4 p-4 @min-[520px]:p-5">
        <p className="font-body text-sm leading-relaxed text-ink">{t('intro')}</p>

        {/* The dial: where the desktop is now, and the counter while travelling. */}
        <div className="ao-themed flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control border border-edge bg-surface px-4 py-3" data-time-dial={jump ? 'travelling' : 'idle'}>
          <span dir="ltr" aria-hidden="true" className={cn('font-mono text-3xl font-bold tabular-nums text-accent', jump && 'ao-time-dial')} data-time-year={shownYear}>
            {shownYear}
          </span>
          <span className="min-w-0 flex-1 font-body text-sm text-ink">
            {jump ? t('jumping', { era: label(jump.to) }) : t('current', { era: label(active) })}
          </span>
          {active !== 'modern' && !jump ? (
            <button
              type="button"
              data-action="time-home"
              onClick={() => travel('modern')}
              className="ao-themed min-h-10 cursor-pointer rounded-control border border-accent px-3 font-mono text-xs tracking-wide text-accent uppercase hover:bg-elevated focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {t('backButton')}
            </button>
          ) : null}
        </div>
        <p className="ao-sr-only" aria-live="polite" data-time-announcement="">
          {announcement}
        </p>

        <section aria-labelledby={`${id}-capsules`} className="flex flex-col gap-2">
          <h3 id={`${id}-capsules`} className="font-display text-sm font-bold text-ink">
            {t('capsules')}
          </h3>
          <ul className="grid grid-cols-1 gap-3 @min-[420px]:grid-cols-2 @min-[680px]:grid-cols-4">
            {themeIds.map((theme) => (
              <li key={theme}>
                <Capsule theme={theme} active={theme === active} busy={jump !== null} onTravel={() => travel(theme)} label={label(theme)} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${id}-year`} className="ao-themed flex flex-col gap-2 rounded-control border border-edge bg-surface p-3">
          <h3 id={`${id}-year`} className="font-display text-sm font-bold text-ink">
            {t('destination.title')}
          </h3>
          <p className="font-body text-xs leading-relaxed text-muted">{t('destination.explain')}</p>
          <form onSubmit={onYear} className="flex gap-2" aria-labelledby={`${id}-year`}>
            <label htmlFor={`${id}-year-input`} className="ao-sr-only">
              {t('destination.label')}
            </label>
            <input
              id={`${id}-year-input`}
              data-time-year-input=""
              dir="ltr"
              inputMode="numeric"
              maxLength={4}
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              placeholder={t('destination.placeholder')}
              autoComplete="off"
              className="ao-themed min-h-10 w-28 rounded-control border border-edge bg-background px-3 font-mono text-sm text-ink placeholder:text-muted focus-visible:border-accent focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={jump !== null}
              data-action="time-year"
              className="ao-themed min-h-10 cursor-pointer rounded-control border border-accent bg-accent px-4 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('destination.go')}
            </button>
          </form>
          {destination ? (
            <p aria-live="polite" className="font-body text-xs text-ink" data-time-destination={destination.kind}>
              {destination.kind === 'era'
                ? t('destination.landed', { year: destination.year, era: label(destination.themeId) })
                : destination.kind === 'invalid'
                  ? t('destination.invalid')
                  : t(`destination.${destination.kind}`, { year: destination.year })}
            </p>
          ) : null}
        </section>

        <p className="font-body text-xs leading-relaxed text-muted">{t('storage')}</p>
        <p className="font-body text-xs leading-relaxed text-muted">{t('truth')}</p>
      </div>
    </div>
  );
}

/** One era in miniature, drawn with that era's own tokens. */
function Capsule({ theme, active, busy, onTravel, label }: { theme: ThemeId; active: boolean; busy: boolean; onTravel: () => void; label: string }) {
  const t = useTranslations('time-machine');
  const data = getTheme(theme);
  const effects = EFFECTS.filter((effect) => data.effects[effect] > 0);
  return (
    <button
      type="button"
      onClick={onTravel}
      disabled={busy}
      aria-pressed={active}
      data-time-capsule={theme}
      className={cn(
        'group flex w-full cursor-pointer flex-col overflow-hidden rounded-control border-2 text-start focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-wait',
        active ? 'border-accent' : 'border-edge hover:border-accent',
      )}
    >
      {/* The miniature: its own tokens, its own fonts, its own corners. */}
      <span data-theme-scope={theme} className="flex flex-col bg-background" aria-hidden="true">
        <span className="flex items-center justify-between gap-2 bg-chrome px-2 py-1 font-mono text-[10px] text-chrome-ink">
          <span dir="ltr">{data.year === null ? '~$' : data.year === 'today' ? t('today') : data.year}</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-chrome-ink/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-chrome-ink/60" />
          </span>
        </span>
        <span className="flex flex-col gap-1.5 p-2">
          <span className="truncate font-display text-sm text-ink">{t(`themes.${theme}.name`)}</span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-5 rounded-control bg-accent" />
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="h-2.5 w-2.5 rounded-full bg-error" />
            <span className="ms-auto font-mono text-[10px] text-ink">Aa</span>
          </span>
          <span className="h-5 rounded-window border border-edge bg-surface shadow-window" />
        </span>
      </span>
      <span className="flex flex-col gap-1 bg-surface px-2.5 py-2">
        <span className="font-body text-xs font-bold text-ink">{label}</span>
        <span className="font-body text-[11px] leading-snug text-muted">{t(`themes.${theme}.look`)}</span>
        {effects.length > 0 ? (
          <span className="flex flex-wrap gap-1">
            {effects.map((effect) => (
              <span key={effect} className="rounded-control border border-edge px-1.5 font-mono text-[10px] text-muted">
                {t(`effects.${effect}`)}
              </span>
            ))}
          </span>
        ) : null}
        <span className="font-mono text-[10px] tracking-wide text-accent uppercase">{active ? t('here') : t('travel')}</span>
      </span>
    </button>
  );
}
