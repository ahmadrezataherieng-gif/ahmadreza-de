'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';

/**
 * The live end of the last era's "prompt" picture: a line that points to the
 * real assistant on the desktop.
 *
 * Nothing about the assistant may be in the journey's static HTML, so the
 * server renders only this empty box (its height is reserved so nothing shifts
 * when the line arrives). The line - its code and its copy - is fetched only
 * when the box is near the screen. The journey never talks to the Worker; the
 * assistant itself lives in the desktop app.
 */
const Line = lazy(() => import('@/components/journey/AssistantTeaserLine').then((module) => ({ default: module.AssistantTeaserLine })));

export function AssistantTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50% 0px' },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-slot="prompt-line" className="min-h-9">
      {near ? (
        <Suspense fallback={null}>
          <Line />
        </Suspense>
      ) : null}
    </div>
  );
}
