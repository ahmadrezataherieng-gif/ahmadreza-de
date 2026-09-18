'use client';

import { requestPuzzleRelease } from '@/components/puzzles/hold';

/**
 * Leaving the journey for the desktop (DECISIONS.md 49).
 *
 * A held puzzle owns a history entry and drops it with a deferred
 * `history.back()` when it closes - which would cancel a navigation started
 * before it. So a held page lets the puzzle go first and leaves once that entry
 * is gone (or after a short wait, should it never report back).
 *
 * `replace`: the end of the journey replaces its own entry, so Back from the
 * desktop never lands on the journey's last frame and bounces straight back.
 * Zum Desktop pushes, so Back returns to the era the visitor left.
 */
export function leaveForDesktop(href: string, { replace = false }: { replace?: boolean } = {}): void {
  let gone = false;
  const go = () => {
    if (gone) return;
    gone = true;
    if (replace) window.location.replace(href);
    else window.location.assign(href);
  };
  if (!document.documentElement.classList.contains('ao-scroll-held')) {
    go();
    return;
  }
  window.addEventListener('popstate', go, { once: true });
  requestPuzzleRelease();
  window.setTimeout(go, 400);
}
