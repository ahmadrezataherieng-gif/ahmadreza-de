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

// Queue 2026-09-27 item 2: the shell's import also waits for a chunk it shares
// with the journey and for `intl`; one left out cost a round trip after hydration.
test('preload-shell: every chunk the shell import waits for is preloaded, each once', { skip: !existsSync(new URL('desktop/index.html', OUT)) }, () => {
  const chunks = new URL('_next/static/chunks/', OUT);
  const html = readFileSync(new URL('desktop/index.html', OUT), 'utf8');
  const preloads = [...html.matchAll(/<link rel="preload" as="script" href="\/_next\/static\/chunks\/([^"]+)"\/>/g)].map((match) => match[1]);
  assert.equal(new Set(preloads).size, preloads.length, `no chunk preloaded twice: ${preloads.join(', ')}`);
  const shell = preloads.find((name) => readFileSync(new URL(name, chunks), 'utf8').includes('data-shell-layout'));
  const shellId = shell.split('.')[0];
  // Percent-encoded in the HTML, which is also what a file URL expects.
  const page = html.match(/src="\/_next\/static\/chunks\/(app\/[^"]*page-[^"]+\.js)"/)[1];
  const lists = [...readFileSync(new URL(page, chunks), 'utf8').matchAll(/Promise\.all\(\[((?:\w+\.e\(\d+\),?)+)\]\)/g)];
  const ids = lists.map((match) => [...match[1].matchAll(/\.e\((\d+)\)/g)].map((id) => id[1])).find((list) => list.includes(shellId));
  assert.ok(ids && ids.length > 1, `the page chunk imports the shell with its other chunks (${ids})`);
  const runtime = readFileSync(new URL(html.match(/\/_next\/static\/chunks\/(webpack-[^"]+\.js)/)[1], chunks), 'utf8');
  for (const id of ids) {
    // A chunk file is `<id>.<hash>.js`, or `<name>.<hash>.js` for a named one.
    const names = [id, ...[...runtime.matchAll(new RegExp(`[{,]${id}:"([\\w-]+)"`, 'g'))].map((match) => match[1])];
    assert.ok(preloads.some((file) => names.some((name) => file.startsWith(`${name}.`))), `chunk ${id} is preloaded: ${preloads.join(', ')}`);
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
