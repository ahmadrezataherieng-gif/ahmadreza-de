/**
 * Strikes the printed glyphs of an era, one at a time, on their own schedule.
 *
 * Each glyph used to carry its own CSS animation (paused until the section was
 * marked started). Three eras print 275 to 390 glyphs, and starting that many
 * animations at once, then ticking them, was the largest cost of every
 * crossing on a phone: 130 ms frames at the moment the era took the theme, and
 * 50-100 ms frames for as long as it printed (PERF-02). One scheduler that sets
 * `data-struck` on the few glyphs that are due each frame does the same job
 * for a fraction of it.
 *
 * The timing is the animation's: `--strike-delay`, plus the half of the 80 ms
 * strike that `steps(2, jump-none)` spent showing the glyph unstruck.
 */

/** The glyph appears at the middle of the old 80 ms strike animation. */
const STRIKE_MS = 40;

export function startPrinting(section: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const glyphs = Array.from(section.querySelectorAll<HTMLElement>('.ao-type > span'), (element) => ({
    element,
    at: Number.parseFloat(element.style.getPropertyValue('--strike-delay')) * 1000 + STRIKE_MS,
  })).sort((a, b) => a.at - b.at);
  if (glyphs.length === 0) return;

  const start = performance.now();
  let next = 0;
  const tick = (now: number) => {
    const elapsed = now - start;
    while (next < glyphs.length && glyphs[next].at <= elapsed) {
      glyphs[next].element.dataset.struck = '';
      next += 1;
    }
    if (next < glyphs.length) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
