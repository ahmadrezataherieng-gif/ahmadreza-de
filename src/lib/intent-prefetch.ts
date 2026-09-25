'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Props for a `<Link>` from a static page to the journey or the desktop: no
 * prefetch when it scrolls into view, one when the visitor shows intent
 * (pointer over it, focus, a touch).
 *
 * The static pages load a pruned stylesheet (scripts/prune-static-css.mjs).
 * The journey's and the desktop's payload names the full one, so a prefetch on
 * sight made every landing-page visit download the 25 kB it had just been
 * spared, and the payloads of routes most visitors never open.
 */
export function useIntentPrefetch(href: string) {
  const router = useRouter();
  const start = useCallback(() => router.prefetch(href), [router, href]);
  return { prefetch: false as const, onPointerEnter: start, onFocus: start, onTouchStart: start };
}
