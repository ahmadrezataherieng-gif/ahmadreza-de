/**
 * A viewport height that a phone's toolbar does not move (PERF-02).
 *
 * The journey sizes every stage, scene and crossing in multiples of one
 * viewport (`--ao-vh`, globals.css). Left to the dynamic viewport unit, each
 * time the toolbar shows or hides the whole page changes height, is laid out
 * again and is re-measured by the resolver. On a touch device `--ao-vh` is
 * pinned to pixels instead: the large viewport (the screen with the toolbar
 * hidden), measured once.
 *
 * The first pin is made by a tiny script in the journey's <head>, before the
 * body exists: writing the property later restyled the whole hydrated page
 * (about 110 ms of the load task on a slow phone). `watchViewportHeight`
 * then only follows a real change - a rotation, split screen, or a height that
 * moved by far more than any toolbar (30 %) - and ignores the rest. Fine
 * pointers (a desktop window) keep the stylesheet's `1lvh`, where the units
 * agree and a resize is a resize.
 */

/** A toolbar is at most a few percent of a phone's height; the keyboard and a rotation are far more. */
const REAL_RESIZE = 0.3;

/** The pin's own probe: `100lvh` where the browser knows it, else the inner height. */
const PIN_BODY = `var p=document.createElement('div');p.style.cssText='position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden';document.documentElement.appendChild(p);var h=Math.max(p.offsetHeight,innerHeight);p.remove();document.documentElement.style.setProperty('--ao-vh',h/100+'px');`;

/** Runs in the journey's <head>, before the first paint. Touch devices only. */
export const VIEWPORT_PIN_SCRIPT = `(function(){try{if(matchMedia('(pointer: coarse)').matches){${PIN_BODY}}}catch(e){}})();`;

export function watchViewportHeight(): () => void {
  if (!window.matchMedia('(pointer: coarse)').matches) return () => undefined;

  let heldWidth = window.innerWidth;
  let heldHeight = window.innerHeight;
  const pin = () => {
    heldWidth = window.innerWidth;
    heldHeight = window.innerHeight;
    const probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
    document.documentElement.appendChild(probe);
    // The large viewport is never shorter than the current one.
    const height = Math.max(probe.offsetHeight, heldHeight);
    probe.remove();
    document.documentElement.style.setProperty('--ao-vh', `${height / 100}px`);
  };

  let frame = 0;
  const onResize = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const widthChanged = window.innerWidth !== heldWidth;
      const heightChanged = Math.abs(window.innerHeight - heldHeight) > heldHeight * REAL_RESIZE;
      if (widthChanged || heightChanged) pin();
    });
  };
  window.addEventListener('resize', onResize, { passive: true });

  return () => {
    window.removeEventListener('resize', onResize);
    cancelAnimationFrame(frame);
  };
}
