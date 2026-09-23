'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { bestOf } from '@/components/apps/snake/game';
import { STORAGE_KEYS } from '@/lib/constants';
import { safeJSONStorage } from '@/lib/safe-storage';

/**
 * Snake's best score (Phase 9D-1, DECISIONS.md 57): one number in this
 * browser, under its own key so only Snake's chunk loads it. No name, no
 * history, no leaderboard - nothing leaves the device.
 */
interface SnakeStore {
  best: number;
  recordGame: (score: number) => void;
}

export const useSnakeStore = create<SnakeStore>()(
  persist(
    (set) => ({
      best: 0,
      recordGame: (score) => set((state) => ({ best: bestOf(state.best, score) })),
    }),
    {
      name: STORAGE_KEYS.snake,
      storage: safeJSONStorage<{ best: number }>(() => (typeof window === 'undefined' ? undefined : window.localStorage)),
      version: 1,
      partialize: (state) => ({ best: state.best }),
      // A hand-edited or broken value counts as no best score, never as a crash.
      merge: (persisted, current) => ({ ...current, best: bestOf((persisted as { best?: unknown } | null)?.best, 0) }),
    },
  ),
);

export const selectSnakeBest = (state: SnakeStore): number => state.best;
