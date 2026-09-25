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
    // Since Phase 5.5B a section's box starts one crossing above its own era,
    // overlapping the section before it, so the box top no longer says whether
    // the visitor can reach it. The era's visual marker does.
    const start = child.querySelector('[data-mark="visual"]') ?? child;
    const below = bottom !== null && start.getBoundingClientRect().top + window.scrollY >= bottom - 1;
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
 * Without Lenis - reduced motion, or a touch device that scrolls natively - the
 * browser glides, except under reduced motion, which always jumps.
 */
function scrollToY(y: number, immediate: boolean): void {
  if (!activeLenis) {
    const glide = !immediate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: y, behavior: glide ? 'smooth' : 'auto' });
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
 * Go to an era: where the era itself begins, which is its `visual` marker.
 *
 * Since Phase 5.5B a section's box starts where the crossing into it begins -
 * still showing the era before - so its top is the wrong place to land. With
 * Lenis the page glides there, through the crossing; without it (reduced
 * motion) it jumps. Falls back to the element's top for anything unmarked.
 */
export function scrollToEra(id: string, immediate = false): void {
  const section = document.getElementById(id);
  if (!section) return;
  const target = section.querySelector<HTMLElement>('[data-mark="visual"]') ?? section;
  scrollToMovingTarget(() => target.getBoundingClientRect().top + window.scrollY, immediate);
}

/** How long the anchor is held after a change: puzzles above the visitor
 * re-render in their new presentation a few frames to a few hundred ms later. */
const ANCHOR_HOLD_MS = 1200;

/**
 * Run a change that may alter the height of content above the visitor - a mode
 * switch in document flow - and keep the section they are reading where it is.
 * Pinned layouts do not change height at all; this is then a no-op.
 *
 * The anchor is held for a short window rather than corrected once: the
 * change itself lands at once, but puzzles above re-render in their new
 * presentation later, and each of those moves the page again.
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
  // Track where the anchor sits in the document, not on screen: only layout
  // shifts move it there, so a visitor who scrolls meanwhile is never pulled
  // back - each correction covers exactly the shift since the last one.
  // Both rects carry the same scroll offset, so their difference is pure
  // layout; `window.scrollY` can lag a programmatic scroll on mobile viewports
  // and would count one shift twice.
  const inDocument = (element: HTMLElement) =>
    element.getBoundingClientRect().top - document.documentElement.getBoundingClientRect().top;
  let anchoredAt = anchor ? inDocument(anchor) : 0;
  if (anchor) document.documentElement.classList.add('ao-anchor-held');
  change();
  if (!anchor) return;
  const correct = () => {
    if (!anchor.isConnected) return;
    const now = inDocument(anchor);
    const delta = now - anchoredAt;
    anchoredAt = now;
    if (Math.abs(delta) > 1) scrollToY(window.scrollY + delta, true);
  };
  requestAnimationFrame(() => requestAnimationFrame(correct));
  // Layout changes arrive as resizes of the sections. Observe them, not only
  // the scenes container: while a Play-mode gate still limits the container's
  // height, a section can grow inside it without the container resizing.
  const scenes = document.getElementById('journey-scenes');
  const observer =
    scenes && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(correct) : null;
  if (scenes && observer) {
    observer.observe(scenes);
    for (const child of Array.from(scenes.children)) observer.observe(child);
  }
  window.setTimeout(() => {
    observer?.disconnect();
    document.documentElement.classList.remove('ao-anchor-held');
  }, ANCHOR_HOLD_MS);
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
