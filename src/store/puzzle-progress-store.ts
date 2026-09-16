'use client';

import { create } from 'zustand';
import type { EraId } from '@/content/eras';

/**
 * Scroll progress through each era's puzzle segment, for the puzzle layer.
 *
 * The resolver writes `--puzzle-progress` to CSS every frame, but guided
 * playback is React state - which step of the script is on screen - so it needs
 * the number too. The resolver only publishes here when the value moves by at
 * least half a percent, and each puzzle subscribes to its own era, so a
 * scroll re-renders at most one puzzle, a bounded number of times.
 */
interface PuzzleProgressState {
  progress: Partial<Record<EraId, number>>;
  setProgress: (eraId: EraId, value: number) => void;
}

export const usePuzzleProgressStore = create<PuzzleProgressState>((set) => ({
  progress: {},
  setProgress: (eraId, value) =>
    set((state) =>
      state.progress[eraId] === value ? state : { progress: { ...state.progress, [eraId]: value } },
    ),
}));
