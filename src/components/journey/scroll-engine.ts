'use client';

import type { gsap as GsapCore } from 'gsap';
import type { ScrollTrigger as ScrollTriggerClass } from 'gsap/ScrollTrigger';

/**
 * GSAP and ScrollTrigger, loaded after the journey's first frames (PERF-02).
 *
 * Imported with the journey, their chunk was evaluated in one ~100 ms task on
 * the phone profile, right in the load. The resolver needs neither to show the
 * first frame - it measures and resolves on its own and follows native scroll
 * events until ScrollTrigger is connected - so they load once the page is up,
 * each chunk in its own task.
 */
export interface ScrollEngine {
  gsap: typeof GsapCore;
  ScrollTrigger: typeof ScrollTriggerClass;
}

let engine: ScrollEngine | null = null;
let loading: Promise<ScrollEngine> | null = null;

/** The engine once it has loaded, else null (nothing to refresh yet). */
export function loadedScrollEngine(): ScrollEngine | null {
  return engine;
}

/** Loads GSAP and ScrollTrigger once; every caller shares the same promise. */
export function loadScrollEngine(): Promise<ScrollEngine> {
  loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([core, plugin]) => {
    core.gsap.registerPlugin(plugin.ScrollTrigger);
    engine = { gsap: core.gsap, ScrollTrigger: plugin.ScrollTrigger };
    return engine;
  });
  // A failed fetch may be tried again; until then the resolver keeps following
  // native scroll events, so the journey still works.
  loading.catch(() => {
    loading = null;
  });
  return loading;
}
