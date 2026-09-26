// Queue 3c: the static pages (landing, About, legal, 404) ship no message
// formatter. Two things break that, and both are checked here:
//  1. a module in the *server* graph importing `next-intl` itself (not
//     `next-intl/server`): its barrel pulls the client provider - and the
//     formatter behind it - into every page's script list;
//  2. the exported static pages listing the `intl` chunk.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const SRC = path.resolve('src');
const ENTRIES = ['app/layout.tsx', 'app/[[...locale]]/layout.tsx', 'app/[[...locale]]/page.tsx', 'app/not-found.tsx'];

const resolveImport = (from, specifier) => {
  let base;
  if (specifier.startsWith('@/')) base = path.join(SRC, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(from), specifier);
  else return null;
  for (const extension of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
    const file = base + extension;
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
};

test('static pages: no module of the server graph imports the next-intl barrel', () => {
  const seen = new Set();
  const offenders = [];
  const queue = ENTRIES.map((entry) => path.join(SRC, entry));
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const text = readFileSync(file, 'utf8');
    // The server layer stops at a client boundary: what a client component imports is the client's business.
    if (/^['"]use client['"]/.test(text.trimStart())) continue;
    for (const line of text.split('\n')) {
      if (/from 'next-intl'/.test(line) && !/^import type/.test(line.trim())) offenders.push(path.relative(SRC, file));
    }
    for (const match of text.matchAll(/(?:^|\n)\s*(?:import|export)\s(?!type)[^'"]*?from\s+['"]([^'"]+)['"]/g)) {
      const target = resolveImport(file, match[1]);
      if (target && /\.tsx?$/.test(target)) queue.push(target);
    }
  }
  assert.deepEqual([...new Set(offenders)], [], 'these server modules import next-intl; use next-intl/server, or take the translator as a parameter (DECISIONS 80)');
});

const OUT = new URL('../../out/', import.meta.url);
const STATIC = ['index.html', 'en/index.html', 'fa/index.html', 'about/index.html', 'fa/about/index.html', 'impressum/index.html', 'datenschutz/index.html', '404.html'];

test('static pages: the exported pages do not list the intl chunk', { skip: !existsSync(new URL('index.html', OUT)) }, () => {
  for (const page of STATIC) {
    const html = readFileSync(new URL(page, OUT), 'utf8');
    assert.doesNotMatch(html, /_next\/static\/chunks\/intl[.-]/, `${page} loads the message formatter`);
  }
  for (const page of ['amonel/index.html', 'desktop/index.html']) {
    const html = readFileSync(new URL(page, OUT), 'utf8');
    assert.ok(!/formatjs|IntlMessageFormat/.test(html), `${page}: the formatter is a chunk, not inline`);
  }
});
