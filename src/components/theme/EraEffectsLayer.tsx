'use client';

/**
 * Full-screen overlay carrying the era rendering effects.
 *
 * Every layer is always mounted; its opacity is driven by the --ao-fx-*
 * intensities, so switching eras cross-fades scanlines, grain and CRT vignette
 * instead of popping them in and out.
 */
export function EraEffectsLayer() {
  return (
    <div className="ao-fx-layer" aria-hidden="true">
      <div className="ao-fx-scanlines" />
      <div className="ao-fx-noise" />
      <div className="ao-fx-vignette" />
    </div>
  );
}
