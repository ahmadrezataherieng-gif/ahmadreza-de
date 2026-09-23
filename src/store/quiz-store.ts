'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { bestOf } from '@/components/apps/quiz/quiz';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * The Computer-Quiz's best score (Phase 9B, DECISIONS.md 55): one number, kept
 * in this browser only - the same persisted-zustand pattern as the unlock
 * store, under its own key so only the quiz's chunk ever loads it. No round
 * history, no answers, nothing that leaves the device.
 */
interface QuizState {
  /** Best score out of a round of ten, or null before the first round ends. */
  best: number | null;
  recordRound: (score: number) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      best: null,
      recordRound: (score) => set((state) => ({ best: bestOf(state.best, score) })),
    }),
    {
      name: STORAGE_KEYS.quiz,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ best: state.best }),
    },
  ),
);

export const selectQuizBest = (state: QuizState): number | null => state.best;
