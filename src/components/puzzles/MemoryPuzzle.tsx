'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';

/** Conventional memory in kilobytes. */
const TOTAL = 640;
const NEEDED = 384;

const DRIVERS = [
  { id: 'dos', kb: 64, fixed: true },
  { id: 'mouse', kb: 24, fixed: false },
  { id: 'cdrom', kb: 48, fixed: false },
  { id: 'network', kb: 96, fixed: false },
  { id: 'sound', kb: 72, fixed: false },
  { id: 'screensaver', kb: 40, fixed: false },
] as const;

type DriverId = (typeof DRIVERS)[number]['id'];

type Outcome = null | 'tooBig' | 'noNetwork' | 'ok';

interface MemoryState {
  unloaded: DriverId[];
  outcome: Outcome;
}

type MemoryAction = { type: 'toggle'; driver: DriverId } | { type: 'run' };

function used(unloaded: readonly DriverId[]): number {
  return DRIVERS.filter((driver) => !unloaded.includes(driver.id)).reduce((sum, driver) => sum + driver.kb, 0);
}

function reduce(state: MemoryState, action: MemoryAction): MemoryState {
  if (action.type === 'toggle') {
    const unloaded = state.unloaded.includes(action.driver)
      ? state.unloaded.filter((id) => id !== action.driver)
      : [...state.unloaded, action.driver];
    return { unloaded, outcome: null };
  }
  // DOS checks memory first: a program that does not fit never starts at all.
  const free = TOTAL - used(state.unloaded);
  if (free < NEEDED) return { ...state, outcome: 'tooBig' };
  if (state.unloaded.includes('network')) return { ...state, outcome: 'noNetwork' };
  return { ...state, outcome: 'ok' };
}

const definition: PuzzleDefinition<MemoryState, MemoryAction> = {
  // 344 K loaded, 296 K free: 88 K short.
  initial: () => ({ unloaded: [], outcome: null }),
  reduce,
  isSolved: (state) => state.outcome === 'ok',
  script: [
    { kind: 'act', target: 'driver-sound', action: { type: 'toggle', driver: 'sound' } },
    { kind: 'act', target: 'driver-cdrom', action: { type: 'toggle', driver: 'cdrom' } },
    { kind: 'act', target: 'run', action: { type: 'run' } },
  ],
};

/**
 * 1981: the word processor needs 384 K, and the drivers leave 296 K.
 * Truth: memory is finite. Unloading the network driver frees enough, but then
 * the letter cannot be printed - so the obvious answer fails for a real reason.
 */
export function MemoryPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.dos');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;
  const inUse = used(state.unloaded);
  const free = TOTAL - inUse;

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
          {/* Where the word processor has to fit: the top 384 K of the map. */}
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm">
        <span className={cn('font-bold', free >= NEEDED ? 'text-success' : 'text-ink')}>{t('free', { kb: free })}</span>
        <span className="text-muted">{t('needs', { kb: NEEDED })}</span>
        <button
          type="button"
          {...target('run')}
          tabIndex={interactive ? undefined : -1}
          onClick={() => dispatch({ type: 'run' })}
          className="ms-auto cursor-pointer rounded-control border border-accent bg-accent px-3 py-1.5 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted"
        >
          {t('run')}
        </button>
      </div>

      <p aria-live={interactive ? 'polite' : undefined} className="min-h-5 font-mono text-sm">
        {state.outcome === 'tooBig' ? (
          <span dir="ltr" className="text-error">
            {t('tooBig')}
          </span>
        ) : null}
        {state.outcome === 'noNetwork' ? <span className="text-warning">{t('noNetwork')}</span> : null}
      </p>
    </PuzzleSurface>
  );
}
