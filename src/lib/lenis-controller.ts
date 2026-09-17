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
 * Called after anything here changes the page's height, so the journey can
 * re-measure (ScrollTrigger.refresh). Set by the journey, which owns GSAP.
 */
let onLayoutChange: (() => void) | null = null;

export function setLayoutChangeHandler(handler: (() => void) | null): void {
  onLayoutChange = handler;
}

/**
 * The scroll limit: the document ends at `bottom` (document px), and nothing
 * after it can be reached or focused.
 *
 * It is a limit on layout, not a fight with the scroll position: the scenes
 * container is clipped to `bottom`, so Lenis, native touch scrolling, the
 * keyboard and reduced motion (no Lenis) all simply meet the end of the page.
 * Section positions are unchanged, so the resolver's measurements stay valid.
 * Sections below the limit are made inert, so focus and the accessibility tree
 * end there too - the gate itself offers the way through.
 */
export function setScrollLimit(container: HTMLElement, bottom: number | null): void {
  const top = container.getBoundingClientRect().top + window.scrollY;
  if (bottom === null) {
    container.style.removeProperty('height');
    container.style.removeProperty('overflow');
  } else {
    container.style.height = `${Math.max(0, Math.round(bottom - top))}px`;
    // clip, not hidden: no scroll container, so sticky stages still pin.
    container.style.overflow = 'clip';
  }
  for (const child of Array.from(container.children)) {
    if (!(child instanceof HTMLElement) || child.dataset.scrollLimitIgnore !== undefined) continue;
    const below = bottom !== null && child.getBoundingClientRect().top + window.scrollY >= bottom - 1;
    // Only undo what this function did; the held dialog manages its own inert.
    if (below) {
      child.setAttribute('inert', '');
      child.dataset.limitInert = '';
    } else if (child.dataset.limitInert !== undefined) {
      child.removeAttribute('inert');
      delete child.dataset.limitInert;
    }
  }
  activeLenis?.resize();
  onLayoutChange?.();
}

/**
 * Go to a document position. With Lenis, glide (or jump when `immediate`).
 * Without Lenis the visitor asked for reduced motion: always jump.
 */
function scrollToY(y: number, immediate: boolean): void {
  if (!activeLenis) {
    window.scrollTo({ top: y, behavior: 'auto' });
    return;
  }
  // force: a held page has Lenis stopped, and restoring position must still work.
  activeLenis.scrollTo(y, { immediate, force: true });
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
