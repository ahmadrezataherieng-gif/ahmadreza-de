import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

// Queue 3d: `npm run build` (scripts/drop-woff.mjs) removes the `.woff` fallback
// files and the stylesheet sources that name them. Skipped without an export.
const OUT = new URL('../../out/', import.meta.url);
const MEDIA = new URL('_next/static/media/', OUT);
const CSS = new URL('_next/static/css/', OUT);

test('drop-woff: no .woff file is shipped and no stylesheet names one', { skip: !existsSync(MEDIA) }, () => {
  assert.deepEqual(readdirSync(MEDIA).filter((name) => name.endsWith('.woff')), []);
  for (const name of readdirSync(CSS).filter((file) => file.endsWith('.css'))) {
    assert.doesNotMatch(readFileSync(new URL(name, CSS), 'utf8'), /\.woff(?!2)/, `${name} still names a .woff`);
  }
});

test('drop-woff: every .woff2 a stylesheet names is in the export', { skip: !existsSync(MEDIA) }, () => {
  const present = new Set(readdirSync(MEDIA));
  for (const name of readdirSync(CSS).filter((file) => file.endsWith('.css'))) {
    for (const [, file] of readFileSync(new URL(name, CSS), 'utf8').matchAll(/\/_next\/static\/media\/([^)"']+\.woff2)/g)) {
      assert.ok(present.has(file), `${name} names ${file}, which is not exported`);
    }
  }
});
