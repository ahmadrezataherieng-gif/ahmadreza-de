// Every self-hosted font ships with its licence: the SIL OFL asks that the
// licence and copyright notice accompany the font. For each font package in
// package.json there must be a licence file in public/fonts/licenses/ that is
// the package's own LICENSE, and a row in public/fonts/LICENSES.md.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const normalise = (text) => text.replace(/\r\n/g, '\n').trim();

const pkg = JSON.parse(read('package.json'));
const fontPackages = Object.keys(pkg.dependencies).filter((name) => name.startsWith('@fontsource'));

test('fonts: every self-hosted font package has its licence file and a row in LICENSES.md', () => {
  assert.ok(fontPackages.length >= 5, 'the site self-hosts its fonts through @fontsource');
  const index = read('public/fonts/LICENSES.md');
  for (const name of fontPackages) {
    const slug = name.split('/')[1];
    const file = `public/fonts/licenses/${slug}-OFL.txt`;
    assert.ok(existsSync(new URL(`../../${file}`, import.meta.url)), `${file} is missing`);
    const own = read(`node_modules/${name}/LICENSE`);
    assert.match(own, /SIL Open Font License/, `${name} is not OFL - check before shipping it`);
    assert.equal(normalise(read(file)), normalise(own), `${file} differs from ${name}/LICENSE`);
    assert.ok(index.includes(`licenses/${slug}-OFL.txt`), `LICENSES.md has no row for ${slug}`);
  }
});

test('fonts: never loaded from a third party', () => {
  for (const file of ['src/app/layout.tsx', 'src/styles/globals.css', 'soon/index.html']) {
    assert.doesNotMatch(read(file), /fonts\.googleapis|fonts\.gstatic|use\.typekit|cdn\.jsdelivr|unpkg\.com|fonts\.bunny/, file);
  }
});
