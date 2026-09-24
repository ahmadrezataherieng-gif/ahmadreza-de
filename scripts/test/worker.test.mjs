// The Worker in front of the static site: the anonymous counters (Phase 9C,
// DECISIONS.md 56). Node strips the types; D1 is an in-memory stand-in that
// understands exactly the two statements the Worker sends. The real D1 is
// exercised by scripts/verify/worker-local.mjs under `wrangler dev --local`.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import worker, { COUNTS_MAX_AGE, INCREMENT_SQL, isAllowedOrigin, READ_SQL } from '../../worker/api.ts';
import { COUNTER_NAMES } from '../../src/lib/counters.ts';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://ahmadreza.de';

/** A D1 double: one Map, and a record of every statement and bound value. */
function fakeDb(rows = {}) {
  const table = new Map(Object.entries(rows));
  const statements = [];
  return {
    table,
    statements,
    prepare(sql) {
      let bound = [];
      const statement = {
        bind(...values) {
          bound = values;
          return statement;
        },
        async run() {
          statements.push({ sql, bound });
          assert.equal(sql, INCREMENT_SQL);
          table.set(bound[0], (table.get(bound[0]) ?? 0) + 1);
          return { success: true };
        },
        async all() {
          statements.push({ sql, bound });
          assert.equal(sql, READ_SQL);
          return { results: [...table].map(([name, n]) => ({ name, n })) };
        },
      };
      return statement;
    },
  };
}

const post = (name, headers = { Origin: SITE }) => new Request(`${SITE}/api/count/${name}`, { method: 'POST', headers });

test('count: an allowlisted name from the site is counted, 204, nothing in the body', async () => {
  const db = fakeDb();
  const response = await worker.fetch(post('era.eniac.solved'), { COUNTERS_DB: db });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.equal(db.table.get('era.eniac.solved'), 1);
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('count: the increment is one INSERT ... ON CONFLICT statement, bound to the name alone', async () => {
  assert.match(INCREMENT_SQL, /^INSERT INTO counters \(name, n\) VALUES \(\?1, 1\) ON CONFLICT\(name\) DO UPDATE SET n = n \+ 1$/);
  const db = fakeDb();
  for (let i = 0; i < 3; i++) await worker.fetch(post('quiz.completed'), { COUNTERS_DB: db });
  assert.equal(db.table.get('quiz.completed'), 3);
  assert.deepEqual(db.statements.map((statement) => statement.bound), [['quiz.completed'], ['quiz.completed'], ['quiz.completed']]);
});

test('count: an unknown name is 404 and touches nothing', async () => {
  const db = fakeDb();
  for (const name of ['era.atari.solved', 'quiz.score.10', 'app.unknown.opened', '', 'era.eniac.solved/x', 'ERA.ENIAC.SOLVED', 'era.eniac.solved%00']) {
    const response = await worker.fetch(post(name), { COUNTERS_DB: db });
    assert.equal(response.status, 404, name);
  }
  assert.equal(db.statements.length, 0);
});

test('count: any method but POST is 405 with Allow: POST', async () => {
  const db = fakeDb();
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
    const response = await worker.fetch(new Request(`${SITE}/api/count/quiz.completed`, { method, headers: { Origin: SITE } }), { COUNTERS_DB: db });
    assert.equal(response.status, 405, method);
    assert.equal(response.headers.get('Allow'), 'POST');
  }
  assert.equal(db.statements.length, 0);
});

test('count: a foreign Origin is 403; no Origin, the site, www and local dev are allowed', async () => {
  const db = fakeDb();
  for (const origin of ['https://evil.example', 'http://ahmadreza.de', 'https://ahmadreza.de.evil.example', 'https://sub.ahmadreza.de', 'null', 'http://localhost.evil.example']) {
    const response = await worker.fetch(post('quiz.completed', { Origin: origin }), { COUNTERS_DB: db });
    assert.equal(response.status, 403, origin);
  }
  assert.equal(db.statements.length, 0);
  for (const origin of [null, 'https://ahmadreza.de', 'https://www.ahmadreza.de', 'http://localhost:8787', 'http://127.0.0.1:3001', 'http://localhost']) {
    assert.ok(isAllowedOrigin(origin), String(origin));
  }
  const response = await worker.fetch(post('quiz.completed', {}), { COUNTERS_DB: db });
  assert.equal(response.status, 204);
});

test('count: the request body is never read', async () => {
  const db = fakeDb();
  const request = post('quiz.completed');
  let read = false;
  for (const method of ['text', 'json', 'arrayBuffer', 'formData', 'blob']) request[method] = async () => { read = true; return ''; };
  Object.defineProperty(request, 'body', { get: () => { read = true; return null; } });
  await worker.fetch(request, { COUNTERS_DB: db });
  assert.equal(read, false);
});

test('count: a failing database is a quiet 503, never a crash', async () => {
  const broken = { prepare: () => ({ bind() { return this; }, run: async () => { throw new Error('D1 down'); }, all: async () => { throw new Error('D1 down'); } }) };
  assert.equal((await worker.fetch(post('quiz.completed'), { COUNTERS_DB: broken })).status, 503);
  assert.equal((await worker.fetch(post('quiz.completed'), {})).status, 503);
  assert.equal((await worker.fetch(new Request(`${SITE}/api/counts`), { COUNTERS_DB: broken })).status, 503);
});

test('counts: JSON of allowlisted names only, cached publicly for a minute', async () => {
  const db = fakeDb({ 'era.eniac.solved': 12, 'quiz.completed': 40, 'someone.injected': 5, 'app.about.opened': 0 });
  const response = await worker.fetch(new Request(`${SITE}/api/counts`), { COUNTERS_DB: db });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /^application\/json/);
  assert.equal(response.headers.get('Cache-Control'), `public, max-age=${COUNTS_MAX_AGE}`);
  assert.equal(COUNTS_MAX_AGE, 60);
  const body = await response.json();
  assert.deepEqual(body, { 'era.eniac.solved': 12, 'quiz.completed': 40, 'app.about.opened': 0 });
  for (const name of Object.keys(body)) assert.ok(COUNTER_NAMES.includes(name), name);
});

test('counts: only GET and HEAD', async () => {
  const response = await worker.fetch(new Request(`${SITE}/api/counts`, { method: 'POST' }), { COUNTERS_DB: fakeDb() });
  assert.equal(response.status, 405);
});

test('counts: served from the edge cache when there is one, stored there after a read', async () => {
  const stored = new Map();
  const waits = [];
  globalThis.caches = { default: { match: async (request) => stored.get(request.url)?.clone(), put: async (request, response) => { stored.set(request.url, response); } } };
  try {
    const db = fakeDb({ 'quiz.completed': 11 });
    const context = { waitUntil: (promise) => waits.push(promise) };
    await worker.fetch(new Request(`${SITE}/api/counts`), { COUNTERS_DB: db }, context);
    await Promise.all(waits);
    await worker.fetch(new Request(`${SITE}/api/counts?x=1`), { COUNTERS_DB: db }, context);
    assert.equal(db.statements.length, 1, 'the second read came from the cache');
  } finally {
    delete globalThis.caches;
  }
});

test('worker: every other /api/* path is a plain 404', async () => {
  for (const url of [`${SITE}/api/assistant`, `${SITE}/api/`, `${SITE}/api/count`, `${SITE}/api/counts/x`, `${SITE}/api/anything/at/all`]) {
    const response = await worker.fetch(new Request(url, { method: 'POST' }), { COUNTERS_DB: fakeDb() });
    assert.equal(response.status, 404, url);
  }
});

test('worker: anything else falls through to the asset binding, unreachable while run_worker_first lists only /api/*', async () => {
  const calls = [];
  const env = { ASSETS: { fetch: async (request) => { calls.push(request.url); return new Response('asset'); } } };
  const response = await worker.fetch(new Request(`${SITE}/amonel/`), env);
  assert.equal(await response.text(), 'asset');
  assert.deepEqual(calls, [`${SITE}/amonel/`]);
});

test('worker: without the asset binding it is still an honest 404, never a crash', async () => {
  const response = await worker.fetch(new Request(`${SITE}/amonel/`), {});
  assert.equal(response.status, 404);
});

test('worker: stores nothing about the sender and never logs', () => {
  const source = readFileSync(path.join(ROOT, 'worker/api.ts'), 'utf8');
  assert.doesNotMatch(source, /console\./);
  assert.doesNotMatch(source, /CF-Connecting-IP|X-Forwarded-For|User-Agent|request\.cf|Date\.now|new Date/i);
  const migration = readFileSync(path.join(ROOT, 'migrations/0001_counters.sql'), 'utf8');
  assert.match(migration, /CREATE TABLE IF NOT EXISTS counters \(\s*name TEXT PRIMARY KEY,\s*n INTEGER NOT NULL DEFAULT 0\s*\);/);
});

test('worker: the entry module exports the handler only (workerd rejects anything else)', async () => {
  const entry = await import('../../worker/index.ts');
  assert.deepEqual(Object.keys(entry), ['default']);
  assert.equal(entry.default, worker);
});

test('wrangler: only /api/* runs the Worker first; the site stays assets; D1 is bound', () => {
  const config = readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8');
  assert.match(config, /"main":\s*"worker\/index\.ts"/);
  assert.match(config, /"run_worker_first":\s*\["\/api\/\*"\]/);
  assert.match(config, /"not_found_handling":\s*"404-page"/);
  assert.match(config, /"html_handling":\s*"auto-trailing-slash"/);
  assert.match(config, /"binding":\s*"COUNTERS_DB"/);
  assert.match(config, /"migrations_dir":\s*"migrations"/);
});

test('wrangler: Worker logs are off for both Workers, and the privacy policy no longer mentions a counter log', () => {
  for (const file of ['wrangler.jsonc', 'soon/wrangler.jsonc']) {
    const config = readFileSync(path.join(ROOT, file), 'utf8');
    assert.match(config, /"observability":\s*\{\s*"enabled":\s*false,\s*"logs":\s*\{\s*"enabled":\s*false,\s*"invocation_logs":\s*false\s*\}\s*\}/, file);
  }
  for (const locale of ['de', 'en', 'fa']) {
    const copy = readFileSync(path.join(ROOT, `src/messages/legal/${locale}.json`), 'utf8');
    assert.doesNotMatch(copy, /Fehlersuche|troubleshooting|رفع خطا/, locale);
  }
});
