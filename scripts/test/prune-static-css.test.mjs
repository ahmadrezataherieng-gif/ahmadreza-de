import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

// Queue 3b: `npm run build` (scripts/prune-static-css.mjs) points the static
// pages at a pruned copy of the stylesheet. Skipped without an export that went
// through the step; scripts/verify/css-equal.mjs proves the look is unchanged.
const OUT = new URL('../../out/', import.meta.url);
const CSS = new URL('_next/static/css/', OUT);
const built = existsSync(CSS) && readdirSync(CSS).some((name) => name.startsWith('static-'));

const STATIC = ['index.html', 'en/index.html', 'fa/index.html', 'about/index.html', 'en/about/index.html', 'fa/about/index.html', 'impressum/index.html', 'datenschutz/index.html', 'fa/datenschutz/index.html', '404.html'];
const DYNAMIC = ['amonel/index.html', 'en/amonel/index.html', 'fa/amonel/index.html', 'desktop/index.html', 'en/desktop/index.html', 'fa/desktop/index.html'];
const hrefs = (page) => [...new Set([...readFileSync(new URL(page, OUT), 'utf8').matchAll(/_next\/static\/css\/([a-z0-9-]+\.css)/g)].map((match) => match[1]))];

test('prune-static-css: static pages load the pruned file, the journey and the desktop the full one', { skip: !built }, () => {
  for (const page of STATIC) {
    const files = hrefs(page);
    assert.equal(files.filter((name) => name.startsWith('static-')).length, 1, `${page}: one pruned stylesheet (${files.join(', ')})`);
    assert.ok(!files.some((name) => !name.startsWith('static-') && statSync(new URL(name, CSS)).size > 20000), `${page}: the full stylesheet is not also linked`);
  }
  for (const page of DYNAMIC) {
    assert.ok(!hrefs(page).some((name) => name.startsWith('static-')), `${page} keeps the full stylesheet`);
  }
});

test('prune-static-css: what the static pages use is still there, what only the journey uses is gone', { skip: !built }, () => {
  const pruned = readFileSync(new URL(hrefs('index.html').find((name) => name.startsWith('static-')), CSS), 'utf8');
  const full = readFileSync(new URL(readdirSync(CSS).filter((name) => !name.startsWith('static-')).sort((a, b) => statSync(new URL(b, CSS)).size - statSync(new URL(a, CSS)).size)[0], CSS), 'utf8');
  assert.ok(pruned.length < full.length * 0.5, `pruned ${pruned.length} bytes against ${full.length}`);
  for (const wanted of ['.ao-site-page', '.ao-landing', '.ao-themed']) assert.ok(pruned.includes(wanted), `${wanted} is kept`);
  for (const gone of ['.ao-w95-scene', '.ao-conv-stage', '.ao-crt-beam']) assert.ok(!pruned.includes(gone), `${gone} is pruned`);

  // Every class of a static page that the full sheet styles with a plain rule is still styled.
  const escape = (name) => name.replace(/[^\w-]/g, '\\$&');
  for (const page of STATIC) {
    const html = readFileSync(new URL(page, OUT), 'utf8');
    const classes = new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((match) => match[1].split(/\s+/)).filter(Boolean));
    const missing = [...classes].filter((name) => full.includes(`.${escape(name)}{`) && !pruned.includes(`.${escape(name)}{`));
    assert.deepEqual(missing, [], `${page}: classes styled in the full sheet but not in the pruned one`);
  }
});
