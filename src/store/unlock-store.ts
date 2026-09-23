'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AppId, EraId } from '@/content/eras';
import { createUnlockState, isAppUnlocked, unlockPersistOptions, type UnlockState } from '@/lib/unlocks';

export { DEFAULT_MODE, type JourneyMode, type UnlockState } from '@/lib/unlocks';

/**
 * Progress through Act 1 and the bonus apps it unlocks, persisted in
 * `amonel.unlocks.v1`. The state, its actions and the persist options live in
 * `lib/unlocks.ts`, where plain node tests them (DECISIONS.md 57); this file
 * only binds them to React and to `localStorage`.
 */
export const useUnlockStore = create<UnlockState>()(
  persist(
    createUnlockState,
    unlockPersistOptions(() => (typeof window === 'undefined' ? undefined : window.localStorage)),
  ),
);

/*
 * Selectors for the desktop. Components subscribe through these rather than
 * calling the store's methods, so a re-render follows exactly the data it shows.
 */

/** The hidden "Legende" badges. Read, not displayed, until Phase 9. */
export const selectLegendEras = (state: UnlockState): readonly EraId[] => state.legendEras;

/**
 * Whether an app can be opened: base apps always, a bonus app once its era's
 * puzzle was solved, shown or watched, and every bonus app after the journey.
 */
export const selectIsAppUnlocked =
  (appId: AppId) =>
  (state: UnlockState): boolean =>
    isAppUnlocked(state, appId);

export const selectHasCompletedJourney = (state: UnlockState): boolean => state.hasCompletedJourney;
