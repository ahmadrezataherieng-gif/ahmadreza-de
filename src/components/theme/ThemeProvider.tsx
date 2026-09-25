'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useThemeStore } from '@/store/theme-store';
import { applyThemeToDocument } from '@/lib/apply-theme';
import { defaultThemeId, getTheme } from '@/lib/themes';

/**
 * Writes the active theme onto the document on mount, then leaves the store to
 * do the work. There is no context here on purpose: components read tokens from
 * CSS custom properties, so a theme change costs no React re-render at all.
 *
 * The first mount with the default theme writes no variables: the stylesheet's
 * `:root` already holds the same values, and the write restyled the page.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeId = useThemeStore((state) => state.themeId);
  const mounted = useRef(false);

  useEffect(() => {
    const first = !mounted.current;
    mounted.current = true;
    applyThemeToDocument(getTheme(themeId), { bootstrap: first && themeId === defaultThemeId });
  }, [themeId]);

  return <>{children}</>;
}
