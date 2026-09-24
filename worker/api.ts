/**
 * The Worker in front of the static site: the anonymous public counters
 * (Phase 9C, DECISIONS.md 56).
 *
 * `wrangler.jsonc` sends only `/api/*` here (`run_worker_first`); every other
 * path is served from `out/` by Cloudflare's asset layer without running any
 * of this, with `_headers`, `_redirects` and the 404 page exactly as before.
 * The site's own code never imports this folder and never knows it is here.
 *
 *   POST /api/count/<name>  -> 204   one more for an allowlisted counter
 *   GET  /api/counts        -> 200   { name: n } for allowlisted counters
 *   anything else           -> 404
 *
 * What is stored is a counter name and an integer - nothing about who sent
 * it: no IP, no user agent, no identifier, no timestamp, no cookie. No
 * request body is read. Nothing here calls `console`, and Worker logs are off
 * in wrangler.jsonc (DECISIONS.md 62) - two locks, so nothing is kept. Abuse is limited by the allowlist, the Origin
 * check and a Cloudflare rate-limiting rule (TODO.md, Phase 13), which counts
 * inside Cloudflare so this code never has to see an IP at all.
 */
import { COUNTER_NAMES, isCounterName } from '../src/lib/counters.ts';

/** The subset of D1 this Worker uses; wrangler provides the real binding. */
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<unknown>;
  all<Row>(): Promise<{ results: Row[] }>;
}
export interface D1Like {
  prepare(sql: string): D1Statement;
}
interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}
export interface Env {
  COUNTERS_DB?: D1Like;
  ASSETS?: AssetsBinding;
}
interface Context {
  waitUntil(promise: Promise<unknown>): void;
}
/** Workers' `caches.default`; absent in node and on workers.dev it does nothing. */
interface EdgeCaches {
  default?: Cache;
}

/** One statement, so two visitors at the same moment can never lose a count. */
export const INCREMENT_SQL = 'INSERT INTO counters (name, n) VALUES (?1, 1) ON CONFLICT(name) DO UPDATE SET n = n + 1';
export const READ_SQL = 'SELECT name, n FROM counters';

/** Browsers send an Origin with every POST; only the site's own may count. */
const ALLOWED_ORIGINS = new Set(['https://ahmadreza.de', 'https://www.ahmadreza.de']);
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

export function isAllowedOrigin(origin: string | null): boolean {
  // No Origin: not a browser's cross-site request (curl, a server). The
  // allowlist and the rate limit still apply.
  if (origin === null) return true;
  return ALLOWED_ORIGINS.has(origin) || LOCAL_ORIGIN.test(origin);
}

/** Public counts are one minute stale at most, so D1 is read about once a minute per edge. */
export const COUNTS_MAX_AGE = 60;

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Cross-Origin-Resource-Policy': 'same-origin',
};

function respond(status: number, init: { body?: string; headers?: Record<string, string> } = {}): Response {
  return new Response(init.body ?? null, {
    status,
    headers: { 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...init.headers },
  });
}

const COUNT_PREFIX = '/api/count/';

async function count(request: Request, name: string, env: Env): Promise<Response> {
  if (!isCounterName(name)) return respond(404);
  if (request.method !== 'POST') return respond(405, { headers: { Allow: 'POST' } });
  if (!isAllowedOrigin(request.headers.get('Origin'))) return respond(403);
  if (!env.COUNTERS_DB) return respond(503);
  try {
    await env.COUNTERS_DB.prepare(INCREMENT_SQL).bind(name).run();
  } catch {
    return respond(503);
  }
  return respond(204);
}

async function readCounts(request: Request, env: Env, context: Context | undefined): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return respond(405, { headers: { Allow: 'GET, HEAD' } });
  const cache = (globalThis as { caches?: EdgeCaches }).caches?.default;
  // One cache entry for everyone: the key is the bare URL, whatever the query.
  const key = new Request(new URL('/api/counts', request.url).toString(), { method: 'GET' });
  const cached = await cache?.match(key);
  if (cached) return cached;

  if (!env.COUNTERS_DB) return respond(503);
  let rows: { name: string; n: number }[];
  try {
    rows = (await env.COUNTERS_DB.prepare(READ_SQL).all<{ name: string; n: number }>()).results;
  } catch {
    return respond(503);
  }
  const counts: Record<string, number> = {};
  for (const name of COUNTER_NAMES) {
    const row = rows.find((candidate) => candidate.name === name);
    if (row && Number.isSafeInteger(row.n) && row.n >= 0) counts[name] = row.n;
  }
  const response = respond(200, {
    body: JSON.stringify(counts),
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${COUNTS_MAX_AGE}` },
  });
  if (cache) context?.waitUntil(cache.put(key, response.clone()));
  return response;
}

const worker = {
  async fetch(request: Request, env: Env, context?: Context): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith(COUNT_PREFIX)) return count(request, pathname.slice(COUNT_PREFIX.length), env);
    if (pathname === '/api/counts') return readCounts(request, env, context);
    if (pathname.startsWith('/api/')) return respond(404);
    // Unreachable while `run_worker_first` lists only /api/*, but if it ever widens, the site still works.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return respond(404);
  },
};

export default worker;
