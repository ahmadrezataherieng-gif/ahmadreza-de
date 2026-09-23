import { parseCounts, type CounterName, type Counts } from './counters.ts';

/**
 * The client side of the anonymous counters (Phase 9C, DECISIONS.md 56).
 *
 * `count()` says "this happened once more" and nothing else: a POST to the
 * site's own `/api/count/<name>`, no body, no cookie, no referrer. It never
 * waits, never throws and never retries. Each name goes at most once per page
 * load - remembered in memory only, so no storage key is written for it. When
 * the API answers anything but success (not deployed, a plain web server,
 * `next dev`, the rate limit), the rest of the page load sends nothing more.
 *
 * Only `fetch` is used, never a third party. Nothing here runs during the
 * static build or in node: both have no `window`.
 */
const sent = new Set<CounterName>();
let unavailable = false;

const REQUEST: RequestInit = { credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' };

export function count(name: CounterName): void {
  if (typeof window === 'undefined' || typeof fetch !== 'function' || unavailable || sent.has(name)) return;
  sent.add(name);
  try {
    // keepalive: a count sent as the page navigates away still arrives.
    fetch(`/api/count/${name}`, { ...REQUEST, method: 'POST', keepalive: true }).then(
      (response) => {
        if (!response.ok) unavailable = true;
      },
      () => {
        unavailable = true;
      },
    );
  } catch {
    unavailable = true;
  }
}

let counts: Promise<Counts | null> | null = null;

/**
 * The public counts, fetched at most once per page load and only when asked -
 * by a place that shows a number becoming visible. Null whenever there is
 * nothing trustworthy to show: no API, an error, HTML from a 404 page.
 */
export function loadCounts(): Promise<Counts | null> {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return Promise.resolve(null);
  counts ??= fetch('/api/counts', { ...REQUEST, cache: 'default' })
    .then((response) => (response.ok && /json/.test(response.headers.get('Content-Type') ?? '') ? response.json() : null))
    .then(parseCounts)
    .catch(() => null);
  return counts;
}
