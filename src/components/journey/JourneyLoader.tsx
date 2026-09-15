'use client';

import dynamic from 'next/dynamic';

/**
 * The journey behind a dynamic import.
 *
 * The landing page and the journey share one route file (the optional
 * catch-all), so a static import would put GSAP, Lenis and every era into the
 * landing page's JavaScript too. Behind `dynamic()` the journey is its own
 * chunk: still server-rendered into the journey's HTML for crawlers, but only
 * ever downloaded on the journey page.
 */
const Journey = dynamic(() => import('@/components/journey/Journey').then((module) => module.Journey));

export function JourneyLoader() {
  return <Journey />;
}
