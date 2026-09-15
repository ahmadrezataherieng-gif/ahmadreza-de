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
 * DECISIONS.md entries 33 and 36.
 */
export type JourneyMode = 'guided' | 'interactive';

/** What a visitor gets before choosing: the mode that asks nothing of them. */
export const DEFAULT_MODE: JourneyMode = 'guided';

/**
 * Progress through Act 1.
 *
 * Phase 5 calls `solvePuzzle` / `skipPuzzle`; nothing here blocks anyone.
 * Skipping is a first-class outcome: it records that the era was seen and costs
 * the visitor nothing beyond the bonus app.
 */
interface UnlockState {
  /** Artifacts collected by solving puzzles. */
  artifacts: ArtifactId[];
  /** Eras the visitor has scrolled through, solved or skipped. */
  visitedEras: EraId[];
  /** Eras whose puzzle was explicitly skipped. */
  skippedEras: EraId[];
  /** True once the visitor has reached the desktop at least once. */
  hasCompletedJourney: boolean;
  /** Chosen viewing mode, or null until the visitor chooses one. */
  mode: JourneyMode | null;

  setMode: (mode: JourneyMode) => void;
  solvePuzzle: (eraId: EraId) => void;
  skipPuzzle: (eraId: EraId) => void;
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
          skippedEras: state.skippedEras.filter((id) => id !== eraId),
        }));
      },

      skipPuzzle: (eraId) =>
        set((state) => ({
          skippedEras: addUnique(state.skippedEras, eraId),
          visitedEras: addUnique(state.visitedEras, eraId),
        })),

      markEraVisited: (eraId) =>
        set((state) => ({ visitedEras: addUnique(state.visitedEras, eraId) })),

      completeJourney: () => set({ hasCompletedJourney: true }),

      resetProgress: () =>
        set({
          artifacts: [],
          visitedEras: [],
          skippedEras: [],
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
      version: 1,
      // Methods are recreated on every load; only the data is persisted.
      partialize: (state) => ({
        artifacts: state.artifacts,
        visitedEras: state.visitedEras,
        skippedEras: state.skippedEras,
        hasCompletedJourney: state.hasCompletedJourney,
        mode: state.mode,
      }),
    },
  ),
);
