'use client';

import { create } from 'zustand';
import { defaultThemeId, getTheme, type Theme, type ThemeId } from '@/lib/themes';
import { applyThemeToDocument } from '@/lib/apply-theme';

interface ThemeState {
  themeId: ThemeId;
  /** True while a cross-fade between two themes is in flight. */
  isTransitioning: boolean;
  /** Set by the Time Machine (Phase 9) to pin a theme against era scrolling. */
  isLocked: boolean;
  setTheme: (id: ThemeId, options?: { force?: boolean }) => void;
  lockTheme: (locked: boolean) => void;
  theme: () => Theme;
}

let transitionTimer: ReturnType<typeof setTimeout> | undefined;

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeId: defaultThemeId,
  isTransitioning: false,
  isLocked: false,

  setTheme: (id, options) => {
    const { themeId, isLocked } = get();
    if (id === themeId) return;
    // The Time Machine wins over the journey's automatic era switching.
    if (isLocked && !options?.force) return;

    applyThemeToDocument(getTheme(id));
    set({ themeId: id, isTransitioning: true });

    if (transitionTimer) clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => {
      set({ isTransitioning: false });
    }, readThemeDuration());
  },

  lockTheme: (locked) => set({ isLocked: locked }),

  theme: () => getTheme(get().themeId),
}));

/** Read the cross-fade duration from the stylesheet so CSS stays the source of truth. */
function readThemeDuration(): number {
  if (typeof window === 'undefined') return 600;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--ao-theme-duration')
    .trim();
  const parsed = Number.parseFloat(raw);
  if (Number.isNaN(parsed)) return 600;
  return raw.endsWith('ms') ? parsed : parsed * 1000;
}
