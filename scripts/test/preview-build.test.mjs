// The Impressum's address guard and its one exception, the non-production preview
// build for cloud sessions (CLAUDE.md, "Cloud sessions"): AMONEL_PREVIEW_BUILD=1
// builds with the dummy address; every production path still refuses dummy data.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

import { ensureLegalAddress, PREVIEW_FLAG } from '../legal-address.mjs';

const target = () => pathToFileURL(join(mkdtempSync(join(tmpdir(), 'amonel-legal-')), 'legal.local.ts'));
const DUMMY = "export const LEGAL_ADDRESS = { street: 'Musterstraße 1', postcodeCity: '00000 Musterstadt' } as const;\n";
const REAL = "export const LEGAL_ADDRESS = { street: 'Teststraße 5', postcodeCity: '54290 Trier' } as const;\n";
const quiet = (run) => {
  const warn = console.warn;
  console.warn = () => {};
  try {
    return run();
  } finally {
    console.warn = warn;
  }
};

test('preview build: the flag name is fixed and only the value 1 counts', () => {
  assert.equal(PREVIEW_FLAG, 'AMONEL_PREVIEW_BUILD');
  for (const value of ['0', 'true', 'yes', '']) assert.throws(() => ensureLegalAddress({ file: target(), env: { [PREVIEW_FLAG]: value } }), /Missing src\/content\/legal\.local\.ts/);
});

test('production build: a missing file, or a file with the dummy address, still stops the build', () => {
  assert.throws(() => ensureLegalAddress({ file: target(), env: {} }), /Missing src\/content\/legal\.local\.ts/);
  const file = target();
  writeFileSync(file, DUMMY);
  assert.throws(() => ensureLegalAddress({ file, env: {} }), /dummy address/);
  assert.throws(() => ensureLegalAddress({ file, env: { LEGAL_STREET: 'X 1' } }), /dummy address/);
  // A real address passes.
  const real = target();
  writeFileSync(real, REAL);
  ensureLegalAddress({ file: real, env: {} });
});

test('preview build: a missing file is filled with the dummy template, and the run says so', () => {
  const file = target();
  const warnings = [];
  const warn = console.warn;
  console.warn = (message) => warnings.push(message);
  try {
    ensureLegalAddress({ file, env: { [PREVIEW_FLAG]: '1' } });
  } finally {
    console.warn = warn;
  }
  assert.ok(existsSync(file));
  assert.match(readFileSync(file, 'utf8'), /Musterstraße 1/);
  assert.match(warnings.join(' '), /DUMMY address.*never deploy/);
  // The same file is refused the moment the flag is gone.
  assert.throws(() => ensureLegalAddress({ file, env: {} }), /dummy address/);
});

test('preview build: never on Cloudflare, and a real address from the environment wins', () => {
  for (const marker of ['WORKERS_CI', 'CF_PAGES']) {
    assert.throws(() => ensureLegalAddress({ file: target(), env: { [PREVIEW_FLAG]: '1', [marker]: '1' } }), /never run on Cloudflare/);
  }
  const file = target();
  quiet(() => ensureLegalAddress({ file, env: { [PREVIEW_FLAG]: '1', LEGAL_STREET: 'Teststraße 5', LEGAL_POSTCODE_CITY: '54290 Trier' } }));
  assert.match(readFileSync(file, 'utf8'), /Teststraße 5/);
});

test('preview build: the build scripts call the guard without options, so the environment decides', () => {
  const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
  assert.match(read('next.config.mjs'), /ensureLegalAddress\(\)/);
  assert.match(read('scripts/build-soon.mjs'), /ensureLegalAddress\(\)/);
  assert.match(read('CLAUDE.md'), /^## Cloud sessions$/m);
});
