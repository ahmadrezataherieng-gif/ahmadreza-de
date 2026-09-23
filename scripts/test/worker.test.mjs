// The Worker in front of the static site: node strips the types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import worker from '../../worker/index.ts';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('worker: every /api/* path is a plain 404, reserved for Phase 9', async () => {
  for (const url of ['https://ahmadreza.de/api/assistant', 'https://ahmadreza.de/api/', 'https://ahmadreza.de/api/anything/at/all']) {
    const response = await worker.fetch(new Request(url), {});
    assert.equal(response.status, 404);
  }
});

test('worker: anything else falls through to the asset binding, unreachable while run_worker_first lists only /api/*', async () => {
  const calls = [];
  const env = { ASSETS: { fetch: async (request) => { calls.push(request.url); return new Response('asset'); } } };
  const response = await worker.fetch(new Request('https://ahmadreza.de/journey/'), env);
  assert.equal(await response.text(), 'asset');
  assert.deepEqual(calls, ['https://ahmadreza.de/journey/']);
});

test('worker: without the asset binding it is still an honest 404, never a crash', async () => {
  const response = await worker.fetch(new Request('https://ahmadreza.de/journey/'), {});
  assert.equal(response.status, 404);
});

test('wrangler: only /api/* runs the Worker first; the site stays assets', () => {
  const config = readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8');
  assert.match(config, /"main":\s*"worker\/index\.ts"/);
  assert.match(config, /"run_worker_first":\s*\["\/api\/\*"\]/);
  assert.match(config, /"not_found_handling":\s*"404-page"/);
  assert.match(config, /"html_handling":\s*"auto-trailing-slash"/);
});
