'use client';

import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/store/theme-store';
import { applyThemeToDocument } from '@/lib/apply-theme';
import { getTheme } from '@/lib/themes';

/**
 * Writes the active theme onto the document on mount, then leaves the store to
 * do the work. There is no context here on purpose: components read tokens from
 * CSS custom properties, so a theme change costs no React re-render at all.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeId = useThemeStore((state) => state.themeId);

  useEffect(() => {
    applyThemeToDocument(getTheme(themeId));
  }, [themeId]);

  return <>{children}</>;
}
