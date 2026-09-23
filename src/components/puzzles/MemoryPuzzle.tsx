'use client';

import { useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';

/** Conventional memory in kilobytes. */
const TOTAL = 640;
const NEEDED = 384;

/** The word processor's command. Machine text, the same in every language. */
// CONTENT-TODO CR-209
const PROGRAM = 'WP';

// CONTENT-TODO CR-210
const DRIVERS = [
  { id: 'dos', kb: 64, fixed: true },
  { id: 'mouse', kb: 24, fixed: false },
  { id: 'cdrom', kb: 48, fixed: false },
  { id: 'network', kb: 96, fixed: false },
  { id: 'sound', kb: 72, fixed: false },
  { id: 'screensaver', kb: 40, fixed: false },
] as const;

type DriverId = (typeof DRIVERS)[number]['id'];

type Outcome = null | 'noNetwork' | 'ok';

/** What the DOS screen shows: commands as typed, and DOS's own replies. */
type ScreenLine =
  | { kind: 'command'; text: string }
  | { kind: 'reply'; reply: 'tooBig' | 'badCommand' }
  | { kind: 'listing' };

/** What DIR shows on this disk. Machine text. */
// CONTENT-TODO CR-211
const LISTING = ['AUTOEXEC BAT', 'CONFIG   SYS', 'COMMAND  COM', 'WP       EXE'];

interface MemoryState {
  unloaded: DriverId[];
  outcome: Outcome;
  screen: ScreenLine[];
  draft: string;
  /** The previous command line: what F3 brings back. */
  last: string | null;
  /** F3 was used: the era's insider trick. */
  recalled: boolean;
}

type MemoryAction =
  | { type: 'toggle'; driver: DriverId }
  | { type: 'type'; text: string }
  | { type: 'recall' }
  | { type: 'enter'; text?: string };

function used(unloaded: readonly DriverId[]): number {
  return DRIVERS.filter((driver) => !unloaded.includes(driver.id)).reduce((sum, driver) => sum + driver.kb, 0);
}

function reduce(state: MemoryState, action: MemoryAction): MemoryState {
  switch (action.type) {
    case 'toggle': {
      const unloaded = state.unloaded.includes(action.driver)
        ? state.unloaded.filter((id) => id !== action.driver)
        : [...state.unloaded, action.driver];
      return { ...state, unloaded, outcome: null };
    }
    case 'type':
      return { ...state, draft: action.text };
    case 'recall':
      // DOS's F3 copies the rest of the previous command line to the prompt.
      return state.last === null ? state : { ...state, draft: state.last, recalled: true };
    case 'enter': {
      const text = (action.text ?? state.draft).trim();
      const screen: ScreenLine[] = [...state.screen, { kind: 'command', text }];
      const base = { ...state, draft: '', last: text === '' ? state.last : text };
      if (text === '') return { ...base, screen: screen.slice(-6) };
      // The two built-ins a visitor is likely to try behave as DOS's did.
      if (text.toUpperCase() === 'CLS') return { ...base, screen: [] };
      if (text.toUpperCase() === 'DIR') return { ...base, screen: [...screen, { kind: 'listing' as const }].slice(-6) };
      if (text.toUpperCase() !== PROGRAM) {
        return { ...base, outcome: null, screen: [...screen, { kind: 'reply' as const, reply: 'badCommand' as const }].slice(-6) };
      }
      // DOS checks memory first: a program that does not fit never starts at all.
      if (TOTAL - used(state.unloaded) < NEEDED) {
        return { ...base, outcome: null, screen: [...screen, { kind: 'reply' as const, reply: 'tooBig' as const }].slice(-6) };
      }
      const outcome = state.unloaded.includes('network') ? 'noNetwork' : 'ok';
      return { ...base, outcome, screen: screen.slice(-6) };
    }
  }
}

const definition: PuzzleDefinition<MemoryState, MemoryAction> = {
  // 344 K loaded, 296 K free: 88 K short.
  initial: () => ({ unloaded: [], outcome: null, screen: [], draft: '', last: null, recalled: false }),
  reduce,
  isSolved: (state) => state.outcome === 'ok',
  usedTrick: (state) => state.recalled,
  script: [
    { kind: 'type', target: 'prompt', text: PROGRAM, action: { type: 'enter', text: PROGRAM } },
    { kind: 'act', target: 'driver-sound', action: { type: 'toggle', driver: 'sound' } },
    { kind: 'act', target: 'driver-cdrom', action: { type: 'toggle', driver: 'cdrom' } },
    // The demonstration brings the command back with F3 instead of retyping it.
    { kind: 'act', target: 'f3', action: { type: 'recall' } },
    { kind: 'act', target: 'prompt', action: { type: 'enter' } },
  ],
};

/**
 * 1981: the word processor needs 384 K, and the drivers leave 296 K.
 * Truth: memory is finite. Unloading the network driver frees enough, but then
 * the letter cannot be printed - so the obvious answer fails for a real reason.
 *
 * The prompt is real: `WP` starts the program, anything else is a bad command,
 * and F3 brings back the previous line (the era's insider trick). The on-screen
 * F3 key does the same for touch screens.
 */
export function MemoryPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.dos');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;
  const inUse = used(state.unloaded);
  const free = TOTAL - inUse;
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  const typed = engine.typingFor('prompt');
  const shown = interactive ? state.draft : (typed ?? state.draft);

  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (screen) screen.scrollTop = screen.scrollHeight;
  }, [state.screen.length]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      dispatch({ type: 'enter' });
    } else if (event.key === 'F3') {
      // The browser's own F3 (find) would take the key otherwise.
      event.preventDefault();
      dispatch({ type: 'recall' });
    }
  };

  return (
    <PuzzleSurface pointer={engine.pointer} eraIndex={props.eraIndex} className="flex flex-col gap-3">
      <div dir="ltr" className="flex flex-col gap-1 font-mono">
        {/* The memory map: one bar, 640 K wide, a segment per loaded driver. */}
        <div
          role="img"
          aria-label={t('memoryLabel', { used: inUse })}
          className="relative flex h-6 w-full overflow-hidden rounded-control border border-edge"
        >
          {DRIVERS.filter((driver) => !state.unloaded.includes(driver.id)).map((driver) => (
            <span
              key={driver.id}
              className={cn('h-full border-e border-background', driver.fixed ? 'bg-muted' : 'bg-accent')}
              style={{ width: `${(driver.kb / TOTAL) * 100}%` }}
            />
          ))}
          <span className="h-full flex-1" />
          {/* Where the word processor has to fit: the top 384 K of the map.
              Physical: the map is a left-to-right memory address range. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 right-0 border-l-2 border-dashed border-ink"
            style={{ width: `${(NEEDED / TOTAL) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>0 K</span>
          <span>640 K</span>
        </div>
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-2">
        {DRIVERS.map((driver) => {
          const loaded = !state.unloaded.includes(driver.id);
          const name = t(`drivers.${driver.id}`);
          return (
            <li key={driver.id}>
              <button
                type="button"
                {...target(`driver-${driver.id}`)}
                aria-pressed={loaded}
                disabled={driver.fixed}
                tabIndex={interactive ? undefined : -1}
                aria-label={t('toggleLabel', { driver: name, kb: driver.kb })}
                onClick={() => dispatch({ type: 'toggle', driver: driver.id })}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-control border px-2 py-1.5 text-start font-mono text-sm',
                  'disabled:cursor-default',
                  loaded ? 'border-accent text-ink' : 'border-edge text-muted line-through',
                )}
              >
                <span dir="ltr" aria-hidden="true">
                  {loaded ? '[X]' : '[ ]'}
                </span>
                <span className="flex-1">{name}</span>
                <span dir="ltr" className="text-xs">
                  {driver.kb} K
                </span>
                {driver.fixed ? <span className="text-xs text-muted">{t('fixed')}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="flex flex-wrap gap-x-4 font-mono text-sm">
        <span className={cn('font-bold', free >= NEEDED ? 'text-success' : 'text-ink')}>{t('free', { kb: free })}</span>
        <span className="text-muted">{t('needs', { kb: NEEDED, command: PROGRAM })}</span>
      </p>

      {/* The DOS prompt. Machine text: left to right, English, in every locale. */}
      <div dir="ltr" className="flex flex-col rounded-control border border-edge bg-background px-3 py-2 font-mono text-sm text-ink">
        <div ref={screenRef} role="log" aria-live={interactive ? 'polite' : undefined} className="max-h-28 overflow-y-auto">
          {state.screen.map((line, index) =>
            line.kind === 'command' ? (
              <div key={index} className="whitespace-pre">
                C:\&gt;{line.text}
              </div>
            ) : line.kind === 'listing' ? (
              <pre key={index} className="font-mono text-muted">
                {LISTING.join(String.fromCharCode(10))}
              </pre>
            ) : (
              <div key={index} className="text-error">
                {t(line.reply)}
              </div>
            ),
          )}
        </div>
        <div className="flex items-center gap-2">
          <label {...target('prompt')} className="flex min-w-0 flex-1 items-baseline">
            <span aria-hidden="true">C:\&gt;</span>
            <span className="ao-sr-only">{t('promptLabel', { command: PROGRAM })}</span>
            <input
              ref={inputRef}
              data-autofocus=""
              value={shown}
              readOnly={!interactive}
              tabIndex={interactive ? undefined : -1}
              onChange={(event) => dispatch({ type: 'type', text: event.target.value })}
              onKeyDown={onKeyDown}
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="min-w-0 flex-1 bg-transparent uppercase caret-accent outline-none"
            />
          </label>
          {/* A keycap, as on the PC's function-key block: the touch-screen way
              to press F3, and the quiet cue that it does something. */}
          <button
            type="button"
            {...target('f3')}
            tabIndex={interactive ? undefined : -1}
            aria-label={t('f3Label')}
            onClick={() => {
              dispatch({ type: 'recall' });
              inputRef.current?.focus({ preventScroll: true });
            }}
            className="cursor-pointer rounded-[3px] border border-edge px-1.5 py-0.5 text-[10px] text-muted shadow-[0_2px_0_var(--ao-color-border)] hover:text-ink"
          >
            F3
          </button>
          <button
            type="button"
            {...target('run')}
            tabIndex={interactive ? undefined : -1}
            aria-label={t('run')}
            onClick={() => dispatch({ type: 'enter', text: PROGRAM })}
            className="cursor-pointer rounded-control border border-accent bg-accent px-2 py-0.5 text-xs tracking-wide text-background uppercase hover:bg-accent-muted"
          >
            {PROGRAM}
          </button>
        </div>
      </div>

      <p aria-live={interactive ? 'polite' : undefined} className="min-h-5 font-body text-sm">
        {state.outcome === 'noNetwork' ? <span className="text-warning">{t('noNetwork')}</span> : null}
      </p>
    </PuzzleSurface>
  );
}
