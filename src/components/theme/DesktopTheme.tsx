'use client';

import { useEffect } from 'react';

import { readStoredTheme } from '@/components/apps/time-machine/time-machine';
import { themeIds } from '@/lib/themes';
import { useThemeStore } from '@/store/theme-store';

/**
 * The desktop's theme: Amonel OS's own, unless the visitor took the Time
 * Machine to an era (APP-05, DECISIONS.md 64) - then that era, remembered in
 * this browser. The server always paints the modern frame, so arriving from
 * the Convergence stays one picture; a remembered era cross-fades in after.
 */
export function DesktopTheme() {
  useEffect(() => {
    const stored = readStoredTheme(typeof window === 'undefined' ? undefined : window.localStorage, themeIds);
    const { setTheme, lockTheme } = useThemeStore.getState();
    setTheme(stored ?? 'modern', { force: true });
    lockTheme(stored !== null);
    // Leaving the desktop lets every other view choose its own theme again.
    return () => useThemeStore.getState().lockTheme(false);
  }, []);
  return null;
}
