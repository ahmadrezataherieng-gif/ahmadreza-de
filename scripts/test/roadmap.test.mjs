// ROADMAP.md is parsed for two readers: its own Summary table and the
// coming-soon page's progress figure. Both must follow the rows.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { currentPhase, roadmapItems, roadmapProgress, summaryTable } from '../roadmap.mjs';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('roadmap: the Summary table in ROADMAP.md matches the rows', () => {
  const markdown = read('ROADMAP.md');
  assert.ok(markdown.replace(/\r\n/g, '\n').includes(summaryTable(roadmapItems(markdown))), 'run node scripts/roadmap.mjs --write');
});

test('roadmap: progress counts done fully and partial half; the current phase is the first unfinished one', () => {
  const sample = [
    '## Phase 1 - old',
    '| A-1 | x | done | P0 | C | - |',
    '## Phase 2 - now',
    '| B-1 | x | done | P1 | C | - |',
    '| B-2 | x | partial | P1 | C | - |',
    '| B-3 | x | missing | P2 | C | - |',
    '| B-4 | x | missing | P2 | C | - |',
  ].join('\n');
  assert.deepEqual(roadmapProgress(roadmapItems(sample)), { done: 2, partial: 1, total: 5, percent: 50 });
  assert.deepEqual(currentPhase(sample), { label: '2', done: 1, partial: 1, total: 4, percent: 38 });
});

test('coming-soon page: Amonel, not AhmadOS; every figure is a placeholder the build fills, none typed by hand', () => {
  const page = read('soon/index.html');
  assert.doesNotMatch(page, /AhmadOS|ahmados/i);
  assert.doesNotMatch(page, /\d+ (von|of) \d+ (Phasen|phases)/);
  const keys = new Set([...page.matchAll(/\{\{([A-Z_]+)\}\}/g)].map((match) => match[1]));
  assert.deepEqual([...keys].sort(), ['DATE', 'DONE', 'PERCENT', 'PHASE', 'PHASE_DONE', 'PHASE_TOTAL', 'TOTAL']);
  assert.match(read('scripts/build-soon.mjs'), /roadmapProgress\(\)/);
});
