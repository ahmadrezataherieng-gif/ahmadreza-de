'use client';

import { lazy, Suspense } from 'react';
import type { AbstractIntlMessages } from 'next-intl';

/**
 * The journey behind a dynamic import.
 *
 * The landing page and the journey share one route file (the optional
 * catch-all), so a static import would put GSAP, Lenis and every era into the
 * landing page's JavaScript too. Behind `lazy()` the journey is its own chunk:
 * still server-rendered into the journey's HTML for crawlers, but only ever
 * downloaded on the journey page.
 *
 * Not `next/dynamic`: in the app router it renders an extra server-only
 * sibling (its chunk preloader), which shifts every `useId` inside the journey
 * and made the SVG pattern ids mismatch on hydration. See DECISIONS.md 38.
 */
const Journey = lazy(() => import('@/components/journey/JourneyRoot'));

export function JourneyLoader({ locale, messages }: { locale: string; messages: AbstractIntlMessages }) {
  return (
    <Suspense fallback={null}>
      <Journey locale={locale} messages={messages} />
    </Suspense>
  );
}
