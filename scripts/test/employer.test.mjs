// The employer is never named anywhere on the site (owner, 2026-09-24, ROADMAP
// LEG-08): only with its written permission. This fails if the name reaches a
// tracked source file or any built output - the real site's `out/` and the
// coming-soon page's `soon/dist/`, whichever exist when the tests run.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { EMPLOYER } from './employer-name.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

const TEXT = /\.(?:html?|txt|xml|json|js|mjs|ts|tsx|css|md|jsonc|webmanifest|svg)$/i;

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (TEXT.test(entry)) files.push(path);
  }
  return files;
}

const offenders = (files) => files.filter((file) => EMPLOYER.test(readFileSync(file, 'utf8')));

test('employer: the name is in no tracked source file', () => {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((file) => TEXT.test(file) && existsSync(join(root, file)))
    .map((file) => join(root, file));
  assert.ok(tracked.length > 100, 'git ls-files listed the repository');
  assert.deepEqual(offenders(tracked), []);
});

test('employer: the name is in no built output (out/, soon/dist/)', (context) => {
  const outputs = ['out', 'soon/dist'].map((folder) => join(root, folder)).filter((folder) => existsSync(folder));
  if (outputs.length === 0) return context.skip('nothing built yet');
  assert.deepEqual(offenders(outputs.flatMap(walk)), []);
});

test('employer: the pattern catches every spelling it is meant to', () => {
  for (const sample of ['bei der Stadt' + 'verwaltung Trier', 'Stadt' + ' Trier', 'the city ' + 'administration of Trier', 'در شهر' + 'داری تریر']) {
    assert.match(sample, EMPLOYER);
  }
  assert.doesNotMatch('Fachinformatiker für Systemintegration in Ausbildung · Trier', EMPLOYER);
});
