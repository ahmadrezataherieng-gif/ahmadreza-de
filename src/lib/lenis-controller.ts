'use client';

import type Lenis from 'lenis';

/**
 * A module-level handle on the running Lenis instance.
 *
 * Lenis takes over the scroll position without emitting native `scroll` events,
 * so anything that scrolls programmatically - in-page anchors, "skip to era",
 * a restored hash - has to go through Lenis or ScrollTrigger never finds out
 * the page moved. This is the single place that knows about that.
 */
let activeLenis: Lenis | null = null;

export function setActiveLenis(instance: Lenis | null): void {
  activeLenis = instance;
}

export function getActiveLenis(): Lenis | null {
  return activeLenis;
}

/**
 * Scroll to an element by id. Falls back to native scrolling when Lenis is not
 * running, which is the case under `prefers-reduced-motion`.
 */
export function scrollToElementId(id: string, immediate = false): void {
  const target = document.getElementById(id);
  if (!target) return;

  if (activeLenis) {
    activeLenis.scrollTo(target, { offset: 0, immediate });
    return;
  }

  target.scrollIntoView({
    behavior: immediate ? 'auto' : 'smooth',
    block: 'start',
  });
}
