import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// public/_redirects is read by Cloudflare, top to bottom, first match wins.
const rules = readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'))
  .map((line) => {
    const [from, to, status] = line.split(/\s+/);
    return { from, to, status };
  });

const firstMatch = (path) =>
  rules.find(({ from }) => (from.endsWith('/*') ? path.startsWith(from.slice(0, -1)) : from === path));

test('redirects: every old journey URL 301s to its /amonel/ page, with and without the slash', () => {
  const moves = { '/journey': '/amonel/', '/en/journey': '/en/amonel/', '/fa/journey': '/fa/amonel/', '/de/journey': '/amonel/' };
  for (const [old, target] of Object.entries(moves)) {
    for (const path of [old, `${old}/`]) {
      assert.deepEqual(firstMatch(path), { from: path, to: target, status: '301' }, path);
    }
  }
});

test('redirects: /de still goes home, and the new pages are never redirected', () => {
  assert.equal(firstMatch('/de/')?.to, '/');
  for (const path of ['/amonel/', '/en/amonel/', '/fa/amonel/', '/desktop/', '/']) {
    assert.equal(firstMatch(path), undefined, path);
  }
});
