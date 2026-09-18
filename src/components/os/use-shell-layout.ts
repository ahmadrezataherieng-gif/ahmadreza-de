'use client';

import { useSyncExternalStore } from 'react';

/**
 * Which shell the device gets: the window manager needs room and a precise
 * pointer (at least 768px wide and a fine primary pointer); everything else -
 * phones, and tablets used by touch - gets the home screen with fullscreen apps.
 * Re-evaluated live, so rotating a tablet or docking a keyboard switches over.
 */
const QUERY = '(min-width: 768px) and (pointer: fine)';

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export type ShellLayout = 'desktop' | 'mobile';

export function useShellLayout(): ShellLayout {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(QUERY).matches ? 'desktop' : 'mobile'),
    // The shell is client-only; this is never used, but React requires it.
    () => 'desktop',
  );
}
