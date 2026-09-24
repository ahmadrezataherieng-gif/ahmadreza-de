import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// PERF-09: `npm run build` (scripts/preload-shell.mjs) adds a preload for the
// desktop shell's chunk to the three desktop pages. Skipped without an export.
const OUT = new URL('../../out/', import.meta.url);

test('preload-shell: every desktop page preloads the chunk that holds the Shell', { skip: !existsSync(new URL('desktop/index.html', OUT)) }, () => {
  for (const page of ['desktop/index.html', 'en/desktop/index.html', 'fa/desktop/index.html']) {
    const html = readFileSync(new URL(page, OUT), 'utf8');
    const preloads = [...html.matchAll(/<link rel="preload" as="script" href="(\/_next\/static\/chunks\/[^"]+)"\/>/g)].map((match) => match[1]);
    const shell = preloads.filter((href) => readFileSync(new URL(href.slice(1), OUT), 'utf8').includes('data-shell-layout'));
    assert.equal(shell.length, 1, `${page}: one preloaded chunk holds the Shell (preloads: ${preloads.join(', ')})`);
  }
});

test('preload-shell: the landing page and the journey do not preload it', { skip: !existsSync(new URL('index.html', OUT)) }, () => {
  for (const page of ['index.html', 'amonel/index.html']) {
    const html = readFileSync(new URL(page, OUT), 'utf8');
    for (const [, href] of html.matchAll(/<link rel="preload" as="script" href="(\/_next\/static\/chunks\/[^"]+)"/g)) {
      assert.ok(!readFileSync(new URL(href.slice(1), OUT), 'utf8').includes('data-shell-layout'), `${page} preloads ${href}`);
    }
  }
});
