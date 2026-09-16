'use client';

/**
 * The page-level side of the scroll-hold model (DECISIONS.md 36).
 *
 * At most one puzzle holds the page at a time. Controls outside the puzzle
 * layer - Skip to Desktop - release whatever is holding it through
 * `requestPuzzleRelease()` without knowing which puzzle that is.
 */

/** The element made inert while a puzzle is held. The journey chrome is outside it. */
export const JOURNEY_SCENES_ID = 'journey-scenes';

let release: (() => void) | null = null;

export function registerPuzzleRelease(handler: () => void): () => void {
  release = handler;
  return () => {
    if (release === handler) release = null;
  };
}

export function requestPuzzleRelease(): void {
  release?.();
}
