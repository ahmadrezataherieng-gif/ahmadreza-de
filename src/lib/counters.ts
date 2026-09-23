import { appIds, eraIds, type AppId, type EraId } from '../content/eras.ts';

/**
 * The anonymous public counters (Phase 9C, DECISIONS.md 56): the one list of
 * names the Worker will count, the client may send and the pages may show.
 *
 * A counter is a name and an integer, nothing else - no visitor, no time, no
 * score. The names are built from the era and app registries, so a new era or
 * app is counted without touching this file, and nothing here is typed twice.
 *
 * Imported by the Worker (`worker/index.ts`) and by plain-node tests, so it
 * uses relative `.ts` imports and no `@/` alias.
 */
export type JourneyModeName = 'guided' | 'interactive';

export type CounterName =
  | `era.${EraId}.solved`
  | 'quiz.completed'
  | 'snake.played'
  | 'journey.completed'
  | `journey.mode.${JourneyModeName}`
  | `app.${AppId}.opened`;

export const eraSolved = (id: EraId): CounterName => `era.${id}.solved`;
export const modeChosen = (mode: JourneyModeName): CounterName => `journey.mode.${mode}`;
export const appOpened = (id: AppId): CounterName => `app.${id}.opened`;

export const QUIZ_COMPLETED: CounterName = 'quiz.completed';
/** A Snake game played to its end - never the score (Phase 9D-1, DECISIONS.md 57). */
export const SNAKE_PLAYED: CounterName = 'snake.played';
/** Reached the Convergence - not the Skip control, which never saw it. */
export const JOURNEY_COMPLETED: CounterName = 'journey.completed';

export const COUNTER_NAMES: readonly CounterName[] = [
  ...eraIds.map(eraSolved),
  QUIZ_COMPLETED,
  SNAKE_PLAYED,
  JOURNEY_COMPLETED,
  modeChosen('guided'),
  modeChosen('interactive'),
  ...appIds.map(appOpened),
];

const ALLOWED: ReadonlySet<string> = new Set(COUNTER_NAMES);

export function isCounterName(name: string): name is CounterName {
  return ALLOWED.has(name);
}

/**
 * Below this a number is never shown. "3 people solved this" says little and
 * invites a guess at who; ten is the smallest count that reads as a crowd.
 */
export const MIN_PUBLIC_COUNT = 10;

export type Counts = Partial<Record<CounterName, number>>;

/** A number fit to show, or null: missing, not a count, or below the threshold. */
export function publicCount(counts: Counts | null, name: CounterName): number | null {
  const value = counts?.[name];
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= MIN_PUBLIC_COUNT ? value : null;
}

/**
 * The shape `/api/counts` must have: an object of allowlisted names and
 * non-negative integers. Anything else - HTML from a 404 page, an unknown
 * name, a string - is dropped, never shown.
 */
export function parseCounts(value: unknown): Counts | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const counts: Counts = {};
  for (const [name, n] of Object.entries(value)) {
    if (isCounterName(name) && typeof n === 'number' && Number.isSafeInteger(n) && n >= 0) counts[name] = n;
  }
  return counts;
}
