/**
 * A viewport height that a phone's toolbar does not move (PERF-02).
 *
 * The journey sizes every stage, scene and crossing in multiples of one
 * viewport (`--ao-vh`, globals.css). Left to the dynamic viewport unit, each
 * time the toolbar shows or hides the whole page changes height, is laid out
 * again and is re-measured by the resolver. On a touch device this pins
 * `--ao-vh` to pixels on the given element instead: the large viewport (the
 * screen with the toolbar hidden), measured once.
 *
 * It follows a real change - a rotation, split screen, or a height that moved
 * by far more than any toolbar (30 %) - and ignores the rest. Fine pointers
 * (a desktop window) are left to the stylesheet, where the units agree and a
 * resize is a resize.
 */

/** A toolbar is at most a few percent of a phone's height; the keyboard and a rotation are far more. */
const REAL_RESIZE = 0.3;

export function holdViewportHeight(scope: HTMLElement): () => void {
  if (!window.matchMedia('(pointer: coarse)').matches) return () => undefined;

  // `100lvh` where the browser knows it; otherwise the probe measures zero and
  // the inner height is the best there is.
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);

  let heldWidth = 0;
  let heldHeight = 0;
  const hold = () => {
    heldWidth = window.innerWidth;
    heldHeight = window.innerHeight;
    const large = probe.offsetHeight;
    // The large viewport is never shorter than the current one.
    const height = Math.max(large, heldHeight);
    scope.style.setProperty('--ao-vh', `${height / 100}px`);
  };
  hold();

  let frame = 0;
  const onResize = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const widthChanged = window.innerWidth !== heldWidth;
      const heightChanged = Math.abs(window.innerHeight - heldHeight) > heldHeight * REAL_RESIZE;
      if (widthChanged || heightChanged) hold();
    });
  };
  window.addEventListener('resize', onResize, { passive: true });

  return () => {
    window.removeEventListener('resize', onResize);
    cancelAnimationFrame(frame);
    probe.remove();
    scope.style.removeProperty('--ao-vh');
  };
}
