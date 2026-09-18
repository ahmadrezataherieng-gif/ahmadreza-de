'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  baseAppIds,
  eras,
  type AppId,
  type ArtifactId,
  type EraId,
} from '@/content/eras';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * How the visitor experiences the puzzles.
 *   guided       - watch: every puzzle plays itself as the page scrolls
 *   interactive  - play: puzzles wait for real input
 * One flag over one set of scenes; only the puzzle layer reads it. See
 * DECISIONS.md entries 33, 37 and 39.
 */
export type JourneyMode = 'guided' | 'interactive';

/** What a visitor gets before choosing: the mode that asks nothing of them. */
export const DEFAULT_MODE: JourneyMode = 'guided';

/**
 * Progress through Act 1.
 *
 * In Play mode an era's puzzle is a gate: it opens once the era is *passed* -
 * solved (which also awards the artifact) or revealed (which does not). Watch
 * mode never reads `passedEras`. Legend badges record that a visitor used an
 * era's period trick; nothing displays them yet (the desktop will).
 */
export interface UnlockState {
  /** Artifacts collected by solving puzzles. */
  artifacts: ArtifactId[];
  /** Eras the visitor has scrolled through, solved or skipped. */
  visitedEras: EraId[];
  /** Eras whose puzzle was explicitly skipped (Watch mode). */
  skippedEras: EraId[];
  /** Eras whose Play-mode gate is open: solved or revealed. */
  passedEras: EraId[];
  /** Eras whose period trick the visitor used: the hidden "Legende" badges. */
  legendEras: EraId[];
  /** True once the visitor has reached the desktop at least once. */
  hasCompletedJourney: boolean;
  /** Chosen viewing mode, or null until the visitor chooses one. */
  mode: JourneyMode | null;

  setMode: (mode: JourneyMode) => void;
  solvePuzzle: (eraId: EraId) => void;
  skipPuzzle: (eraId: EraId) => void;
  /** Open the gate without the artifact: the solution was shown. */
  revealPuzzle: (eraId: EraId) => void;
  earnLegend: (eraId: EraId) => void;
  markEraVisited: (eraId: EraId) => void;
  completeJourney: () => void;
  resetProgress: () => void;

  hasArtifact: (artifact: ArtifactId) => boolean;
  isAppUnlocked: (appId: AppId) => boolean;
  unlockedApps: () => AppId[];
}

function addUnique<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list : [...list, value];
}

export const useUnlockStore = create<UnlockState>()(
  persist(
    (set, get) => ({
      artifacts: [],
      visitedEras: [],
      skippedEras: [],
      passedEras: [],
      legendEras: [],
      hasCompletedJourney: false,
      mode: null,

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

      earnLegend: (eraId) =>
        set((state) => (state.legendEras.includes(eraId) ? state : { legendEras: [...state.legendEras, eraId] })),

      markEraVisited: (eraId) =>
        set((state) => ({ visitedEras: addUnique(state.visitedEras, eraId) })),

      completeJourney: () => set({ hasCompletedJourney: true }),

      resetProgress: () =>
        set({
          artifacts: [],
          visitedEras: [],
          skippedEras: [],
          passedEras: [],
          legendEras: [],
          hasCompletedJourney: false,
        }),

      hasArtifact: (artifact) => get().artifacts.includes(artifact),

      isAppUnlocked: (appId) => {
        if (baseAppIds.includes(appId)) return true;
        const era = eras.find((candidate) => candidate.unlocksApp === appId);
        if (!era) return false;
        return get().artifacts.includes(era.artifact);
      },

      unlockedApps: () => {
        const { artifacts } = get();
        const bonus = eras
          .filter((era) => artifacts.includes(era.artifact))
          .map((era) => era.unlocksApp);
        return [...baseAppIds, ...bonus];
      },
    }),
    {
      name: STORAGE_KEYS.unlocks,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // v1 (Phase 5) had no gates: an era solved back then counts as passed.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<UnlockState>;
        if (version < 2) {
          const artifacts = state.artifacts ?? [];
          state.passedEras = eras.filter((era) => artifacts.includes(era.artifact)).map((era) => era.id);
          state.legendEras = [];
        }
        return state as UnlockState;
      },
      // Methods are recreated on every load; only the data is persisted.
      partialize: (state) => ({
        artifacts: state.artifacts,
        visitedEras: state.visitedEras,
        skippedEras: state.skippedEras,
        passedEras: state.passedEras,
        legendEras: state.legendEras,
        hasCompletedJourney: state.hasCompletedJourney,
        mode: state.mode,
      }),
    },
  ),
);

/*
 * Selectors for the desktop. Components subscribe through these rather than
 * calling the store's methods, so a re-render follows exactly the data it shows.
 */

/** The hidden "Legende" badges. Read, not displayed, until Phase 9. */
export const selectLegendEras = (state: UnlockState): readonly EraId[] => state.legendEras;

/** Whether an app can be opened: base apps always, bonus apps with their artifact. */
export const selectIsAppUnlocked =
  (appId: AppId) =>
  (state: UnlockState): boolean => {
    if (baseAppIds.includes(appId)) return true;
    const era = eras.find((candidate) => candidate.unlocksApp === appId);
    return era !== undefined && state.artifacts.includes(era.artifact);
  };

export const selectHasCompletedJourney = (state: UnlockState): boolean => state.hasCompletedJourney;
