'use client';

import { create } from 'zustand';
import { eras, type EraId } from '@/content/eras';

interface JourneyState {
  /** The era currently filling the viewport. */
  activeEraId: EraId;
  /** 0..1 progress through the whole of Act 1. */
  progress: number;
  setActiveEra: (eraId: EraId) => void;
  setProgress: (progress: number) => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  activeEraId: eras[0].id,
  progress: 0,
  setActiveEra: (eraId) => set({ activeEraId: eraId }),
  setProgress: (progress) => set({ progress }),
}));
