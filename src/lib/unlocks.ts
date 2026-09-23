import type { StateCreator } from 'zustand';
import type { PersistOptions, PersistStorage, StorageValue } from 'zustand/middleware';

import { artifactIds, baseAppIds, eraIds, eras, type AppId, type ArtifactId, type Era, type EraId } from '../content/eras.ts';
import { STORAGE_KEYS } from './constants.ts';

/**
 * The unlock store's logic, kept free of React and of the `@/` alias so plain
 * node runs it in `scripts/test/unlocks.test.mjs` - the same state creator and
 * persist options the store uses, not a copy. `store/unlock-store.ts` only
 * binds them to zustand's React hook and `localStorage`.
 *
 * Only type imports from zustand: node strips them, and the module has no
 * runtime dependency at all.
 */

/**
 * How the visitor experiences the puzzles.
 *   guided       - watch: every puzzle plays itself as the page scrolls
 *   interactive  - play: puzzles wait for real input
 * One flag over one set of scenes; only the puzzle layer reads it. See
 * DECISIONS.md entries 33, 37 and 39.
 */
export type JourneyMode = 'guided' | 'interactive';

export const journeyModes: readonly JourneyMode[] = ['guided', 'interactive'];

/** What a visitor gets before choosing: the mode that asks nothing of them. */
export const DEFAULT_MODE: JourneyMode = 'guided';

/**
 * Progress through Act 1, as persisted.
 *
 * In Play mode an era's puzzle is a gate: it opens once the era is *passed* -
 * solved (which also awards the artifact) or revealed (which does not). Watch
 * mode never reads `passedEras`. Legend badges record that a visitor used an
 * era's period trick.
 *
 * Bonus apps (DECISIONS.md 57) unlock with an era's puzzle however the visitor
 * saw it solved - by hand, by "Lösung zeigen", or by watching it play itself -
 * and all of them at once when the journey reaches its end. Artifacts, badges
 * and the public counters stay reserved for a solve by hand.
 */
export interface UnlockData {
  /** Artifacts collected by solving puzzles by hand. */
  artifacts: ArtifactId[];
  /** Eras the visitor has scrolled through, solved or skipped. */
  visitedEras: EraId[];
  /** Eras whose puzzle was explicitly skipped (Watch mode). */
  skippedEras: EraId[];
  /** Eras whose Play-mode gate is open: solved or revealed. */
  passedEras: EraId[];
  /** Eras whose guided demonstration played to its end (Watch mode). */
  watchedEras: EraId[];
  /** Eras whose period trick the visitor used: the hidden "Legende" badges. */
  legendEras: EraId[];
  /** True once the visitor has reached the desktop at least once, by any way. */
  hasCompletedJourney: boolean;
  /** True once the journey itself was finished - the Convergence reached, not skipped. */
  journeyFinished: boolean;
  /** Chosen viewing mode, or null until the visitor chooses one. */
  mode: JourneyMode | null;
}

export interface UnlockActions {
  setMode: (mode: JourneyMode) => void;
  solvePuzzle: (eraId: EraId) => void;
  skipPuzzle: (eraId: EraId) => void;
  /** Open the gate without the artifact: the solution was shown. */
  revealPuzzle: (eraId: EraId) => void;
  /** The guided demonstration played to its end: unlocks the era's app only. */
  watchPuzzle: (eraId: EraId) => void;
  earnLegend: (eraId: EraId) => void;
  markEraVisited: (eraId: EraId) => void;
  /** Reached the desktop, by the Convergence or by Zum Desktop. */
  completeJourney: () => void;
  /** Reached the Convergence: every bonus app unlocks. */
  finishJourney: () => void;
  resetProgress: () => void;

  hasArtifact: (artifact: ArtifactId) => boolean;
  isAppUnlocked: (appId: AppId) => boolean;
  unlockedApps: () => AppId[];
}

export type UnlockState = UnlockData & UnlockActions;

export const EMPTY_UNLOCKS: UnlockData = {
  artifacts: [],
  visitedEras: [],
  skippedEras: [],
  passedEras: [],
  watchedEras: [],
  legendEras: [],
  hasCompletedJourney: false,
  journeyFinished: false,
  mode: null,
};

/* --- the mapping ------------------------------------------------------------ */

/** The era whose puzzle unlocks a bonus app, or undefined for a base app. */
export function unlockingEra(appId: AppId): Era | undefined {
  return eras.find((era) => era.unlocksApp === appId);
}

export function isBaseApp(appId: AppId): boolean {
  return baseAppIds.includes(appId);
}

/** Which unlock state the visitor's data gives one app. */
export function isAppUnlocked(data: Pick<UnlockData, 'artifacts' | 'passedEras' | 'watchedEras' | 'journeyFinished'>, appId: AppId): boolean {
  if (isBaseApp(appId)) return true;
  const era = unlockingEra(appId);
  if (!era) return false;
  if (data.journeyFinished) return true;
  return data.passedEras.includes(era.id) || data.watchedEras.includes(era.id) || data.artifacts.includes(era.artifact);
}

export function unlockedAppIds(data: Pick<UnlockData, 'artifacts' | 'passedEras' | 'watchedEras' | 'journeyFinished'>): AppId[] {
  const bonus = eras.map((era) => era.unlocksApp).filter((appId) => isAppUnlocked(data, appId));
  return [...baseAppIds, ...bonus];
}

/* --- reading what was stored ------------------------------------------------ */

function listOf<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const item of value) {
    if (typeof item === 'string' && (allowed as readonly string[]).includes(item) && !out.includes(item as T)) out.push(item as T);
  }
  return out;
}

/**
 * Whatever came out of storage, as data the store can trust. Storage is the
 * visitor's to edit, an older build's to have written, or simply broken: every
 * field that is not what it should be falls back to "nothing unlocked", and
 * unknown ids are dropped. It never throws.
 */
export function sanitizeUnlockData(value: unknown): UnlockData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...EMPTY_UNLOCKS };
  const raw = value as Record<string, unknown>;
  return {
    artifacts: listOf(raw.artifacts, artifactIds),
    visitedEras: listOf(raw.visitedEras, eraIds),
    skippedEras: listOf(raw.skippedEras, eraIds),
    passedEras: listOf(raw.passedEras, eraIds),
    watchedEras: listOf(raw.watchedEras, eraIds),
    legendEras: listOf(raw.legendEras, eraIds),
    hasCompletedJourney: raw.hasCompletedJourney === true,
    journeyFinished: raw.journeyFinished === true,
    mode: journeyModes.includes(raw.mode as JourneyMode) ? (raw.mode as JourneyMode) : null,
  };
}

/** The minimal `Storage` surface, so tests can hand in a stand-in. */
export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/**
 * JSON storage that fails safe. Unreadable JSON reads as "nothing stored";
 * a storage that throws (blocked, private mode, quota) is treated as absent.
 * The page keeps working either way - progress is then simply not remembered.
 */
export function safeJSONStorage<S>(getStorage: () => StorageLike | undefined): PersistStorage<S> {
  const storage = (): StorageLike | undefined => {
    try {
      return getStorage();
    } catch {
      return undefined;
    }
  };
  return {
    getItem: (name) => {
      try {
        const raw = storage()?.getItem(name);
        if (raw === null || raw === undefined) return null;
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed as StorageValue<S>;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        storage()?.setItem(name, JSON.stringify(value));
      } catch {
        // Quota or blocked storage: keep the state in memory only.
      }
    },
    removeItem: (name) => {
      try {
        storage()?.removeItem(name);
      } catch {
        // Nothing to remove.
      }
    },
  };
}

/* --- the store -------------------------------------------------------------- */

function addUnique<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list : [...list, value];
}

export const createUnlockState: StateCreator<UnlockState> = (set, get) => ({
  ...EMPTY_UNLOCKS,

  setMode: (mode) => {
    if (get().mode !== mode) set({ mode });
  },

  solvePuzzle: (eraId) => {
    const era = eras.find((candidate) => candidate.id === eraId);
    if (!era) return;
    set((state) => ({
      artifacts: addUnique(state.artifacts, era.artifact),
      visitedEras: addUnique(state.visitedEras, eraId),
      passedEras: addUnique(state.passedEras, eraId),
      skippedEras: state.skippedEras.filter((id) => id !== eraId),
    }));
  },

  skipPuzzle: (eraId) =>
    set((state) => ({
      skippedEras: addUnique(state.skippedEras, eraId),
      visitedEras: addUnique(state.visitedEras, eraId),
    })),

  revealPuzzle: (eraId) =>
    set((state) => ({
      passedEras: addUnique(state.passedEras, eraId),
      visitedEras: addUnique(state.visitedEras, eraId),
    })),

  watchPuzzle: (eraId) =>
    set((state) => (state.watchedEras.includes(eraId) ? state : { watchedEras: [...state.watchedEras, eraId] })),

  earnLegend: (eraId) =>
    set((state) => (state.legendEras.includes(eraId) ? state : { legendEras: [...state.legendEras, eraId] })),

  markEraVisited: (eraId) => set((state) => ({ visitedEras: addUnique(state.visitedEras, eraId) })),

  completeJourney: () => {
    if (!get().hasCompletedJourney) set({ hasCompletedJourney: true });
  },

  finishJourney: () => {
    if (!get().journeyFinished || !get().hasCompletedJourney) set({ journeyFinished: true, hasCompletedJourney: true });
  },

  resetProgress: () => set({ ...EMPTY_UNLOCKS, mode: get().mode }),

  hasArtifact: (artifact) => get().artifacts.includes(artifact),
  isAppUnlocked: (appId) => isAppUnlocked(get(), appId),
  unlockedApps: () => unlockedAppIds(get()),
});

/** Bumped whenever the persisted shape changes; `migrate` carries old data forward. */
export const UNLOCK_STORE_VERSION = 3;

type PersistedUnlocks = UnlockData;

export function unlockPersistOptions(getStorage: () => StorageLike | undefined): PersistOptions<UnlockState, PersistedUnlocks> {
  return {
    name: STORAGE_KEYS.unlocks,
    storage: safeJSONStorage<PersistedUnlocks>(getStorage),
    version: UNLOCK_STORE_VERSION,
    migrate: (persisted, version) => {
      const state = sanitizeUnlockData(persisted);
      // v1 (Phase 5) had no gates: an era solved back then counts as passed.
      if (version < 2) {
        state.passedEras = eras.filter((era) => state.artifacts.includes(era.artifact)).map((era) => era.id);
        state.legendEras = [];
      }
      // v2 (up to Phase 9C) did not know watched eras or a finished journey:
      // both start empty, so nobody gains an app they had not earned.
      return state;
    },
    // Whatever was stored, only sanitised data reaches the store.
    merge: (persisted, current) => ({ ...current, ...sanitizeUnlockData(persisted) }),
    // Methods are recreated on every load; only the data is persisted.
    partialize: (state) => ({
      artifacts: state.artifacts,
      visitedEras: state.visitedEras,
      skippedEras: state.skippedEras,
      passedEras: state.passedEras,
      watchedEras: state.watchedEras,
      legendEras: state.legendEras,
      hasCompletedJourney: state.hasCompletedJourney,
      journeyFinished: state.journeyFinished,
      mode: state.mode,
    }),
  };
}
