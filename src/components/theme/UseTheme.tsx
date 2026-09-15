'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme-store';
import type { ThemeId } from '@/lib/themes';

/**
 * Put the document into a theme when a view mounts.
 *
 * The landing page is server-rendered in the modern bootstrap palette, but a
 * visitor who navigates back to it from the journey still has an era's tokens
 * written on <html>. This restores the view's own theme. `force` wins over a
 * Time Machine lock: a page's identity is not a user preference.
 */
export function UseTheme({ id }: { id: ThemeId }) {
  const setTheme = useThemeStore((state) => state.setTheme);
  useEffect(() => {
    setTheme(id, { force: true });
  }, [id, setTheme]);
  return null;
}
