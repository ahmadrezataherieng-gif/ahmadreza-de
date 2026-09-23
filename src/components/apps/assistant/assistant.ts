/**
 * The Assistant's small pieces of pure logic (Phase 8B, DECISIONS.md 53). The
 * matching itself lives in `src/lib/search/` - this file only has what the
 * app's phases and its typing animation need. No React, so `npm test` runs it
 * in plain node.
 */

/** What the visitor sees the search doing. Every phase has its own copy. */
export const phases = ['idle', 'searching', 'answered', 'noMatch'] as const;
export type Phase = (typeof phases)[number];

/** How many characters to reveal per tick so that any answer types out in about 1.5 s. */
export function typingStep(length: number, ticks = 50): number {
  return Math.max(1, Math.ceil(length / ticks));
}
