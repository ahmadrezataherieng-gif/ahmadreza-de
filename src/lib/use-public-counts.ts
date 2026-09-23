'use client';

import { useEffect, useState, type RefObject } from 'react';

import { loadCounts } from '@/lib/count';
import type { Counts } from '@/lib/counters';

/**
 * The public counts, once `ref`'s element comes into view - never before, so
 * no view pays for a request it does not show, and nothing on the critical
 * path waits for it. Null until then, and for good if the request fails:
 * the caller shows nothing rather than a 0 or an error.
 */
export function usePublicCounts(ref: RefObject<Element | null>): Counts | null {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;
    const load = () => {
      void loadCounts().then((loaded) => {
        if (!cancelled) setCounts(loaded);
      });
    };
    if (typeof IntersectionObserver === 'undefined') {
      load();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      load();
    });
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [ref]);

  return counts;
}
