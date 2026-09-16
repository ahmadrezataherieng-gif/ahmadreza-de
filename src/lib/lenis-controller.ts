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

/** Jump or glide to a document position, through Lenis when it runs. */
function scrollToY(y: number, immediate: boolean): void {
  if (activeLenis) {
    // force: a held page has Lenis stopped, and restoring position must still work.
    activeLenis.scrollTo(y, { immediate, force: true });
    return;
  }
  window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

/**
 * Scroll to a position that may move while the scroll is under way.
 *
 * Puzzles mount and era content settles as the page passes them, so a section
 * top or the page end measured at the start can be stale on arrival (up to a
 * few hundred pixels in document flow). Once the page has come to rest, re-aim
 * - but only for small drifts, so a visitor who scrolled elsewhere meanwhile
 * is never pulled back.
 */
function scrollToMovingTarget(resolve: () => number, immediate: boolean): void {
  scrollToY(resolve(), immediate);
  let last = Number.NaN;
  let ticks = 0;
  const settle = () => {
    ticks += 1;
    const here = window.scrollY;
    const resting = Math.abs(here - last) < 1 && !activeLenis?.isScrolling;
    last = here;
    if (resting) {
      const drift = resolve() - here;
      if (Math.abs(drift) <= 2) return;
      if (Math.abs(drift) < window.innerHeight * 1.5) scrollToY(here + drift, true);
    }
    if (ticks < 16) window.setTimeout(settle, 250);
  };
  window.setTimeout(settle, 250);
}

/**
 * Scroll to an element by id. Falls back to native scrolling when Lenis is not
 * running, which is the case under `prefers-reduced-motion`.
 */
export function scrollToElementId(id: string, immediate = false): void {
  const target = document.getElementById(id);
  if (!target) return;
  scrollToMovingTarget(() => target.getBoundingClientRect().top + window.scrollY, immediate);
}

/** Scroll to the very end of the page - the Convergence's empty desktop. */
export function scrollToPageEnd(): void {
  scrollToMovingTarget(() => document.documentElement.scrollHeight - window.innerHeight, false);
}

/**
 * Run a change that may alter the height of content above the visitor - a mode
 * switch in document flow - and keep the section they are reading where it is.
 * Pinned layouts do not change height at all; this is then a no-op.
 */
export function keepScrollAnchor(change: () => void): void {
  const middle = window.innerHeight / 2;
  const spans = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return rect.top <= middle && rect.bottom > middle;
  };
  // The puzzle segment is the finer anchor; the section is the fallback.
  const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-puzzle-layer]'));
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-era], #convergence'));
  const anchor = layers.find(spans) ?? sections.find(spans);
  const before = anchor?.getBoundingClientRect().top;
  change();
  if (!anchor || before === undefined) return;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const delta = anchor.getBoundingClientRect().top - before;
      if (Math.abs(delta) > 1) scrollToY(window.scrollY + delta, true);
    }),
  );
}

/**
 * Hold the page still while a puzzle is being played.
 *
 * Lenis stops listening to wheel and touch; the class blocks native scrolling
 * too - keyboard, scrollbar, and the no-Lenis reduced-motion path. The scroll
 * position is kept, so releasing returns the visitor exactly where they were.
 */
export function holdScroll(): void {
  activeLenis?.stop();
  document.documentElement.classList.add('ao-scroll-held');
}

export function releaseScroll(): void {
  document.documentElement.classList.remove('ao-scroll-held');
  activeLenis?.start();
}
