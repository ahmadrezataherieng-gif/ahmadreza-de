import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('robots.txt: allows everything, names every AI bot the owner chose, points at the sitemap', () => {
  const robots = read('public/robots.txt');
  const lines = robots.split(/\r?\n/).filter((line) => line && !line.startsWith('#'));
  assert.ok(!lines.some((line) => /^Disallow:\s*\S/i.test(line)), 'nothing disallowed');
  assert.ok(!lines.some((line) => /^crawl-delay/i.test(line)), 'no crawl-delay');
  for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'meta-externalagent']) {
    assert.ok(lines.includes(`User-agent: ${bot}`), bot);
  }
  assert.ok(lines.includes('Sitemap: https://ahmadreza.de/sitemap.xml'));
});

test('sitemap: built from the views, the noindex legal pages left out', () => {
  const source = read('src/app/sitemap.ts');
  assert.match(source, /view !== 'imprint' && view !== 'privacy'/);
  assert.match(source, /'x-default'/);
});
