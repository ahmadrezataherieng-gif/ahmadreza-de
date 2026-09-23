// What the stubbed /api/counts answers in the browser checks (Phase 9C), and
// how the recorded requests are read. See `stubApi` in cdp.mjs.
import { COUNTER_NAMES, isCounterName, MIN_PUBLIC_COUNT } from '../../src/lib/counters.ts';

/** Shown: 1234 (four digits, so Persian digits are unmistakable). */
export const SHOWN = 1234;
/** One below the threshold: must never appear. */
export const HIDDEN = MIN_PUBLIC_COUNT - 1;
export const BELOW_THRESHOLD = new Set(['era.batch.solved', 'app.cv.opened', 'journey.mode.interactive']);

export const STUB_COUNTS = Object.fromEntries(COUNTER_NAMES.map((name) => [name, BELOW_THRESHOLD.has(name) ? HIDDEN : SHOWN]));

/** The counter names POSTed so far, in order. */
export const posted = (calls) => calls.filter((call) => call.method === 'POST' && call.path.startsWith('/api/count/')).map((call) => call.path.slice('/api/count/'.length));

/** Every request went to an allowlisted counter or to /api/counts, and none carried a body. */
export const wellFormed = (calls) =>
  calls.every(
    (call) =>
      !call.body &&
      ((call.method === 'POST' && isCounterName(call.path.slice('/api/count/'.length))) || (call.method === 'GET' && call.path === '/api/counts')),
  );

/** 1234 as the locale writes it: 1.234, 1,234 or ۱٬۲۳۴. */
export const shownPattern = (locale) => (locale === 'fa' ? /۱٬۲۳۴/ : /1[.,]234/);
