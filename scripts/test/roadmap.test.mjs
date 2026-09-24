// ROADMAP.md is parsed for two readers: its own Summary tables and the
// coming-soon page's progress figures. Both must follow the rows.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { AREAS, EFFORT, areaProgress, parseEffort, progressTable, roadmapItems, roadmapProgress, summaryTable } from '../roadmap.mjs';
import { fillPlaceholders, progressValues } from '../soon-progress.mjs';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const row = (id, status, effort, area = 'journey') => `| ${id} | x | ${status} | P1 | C | - | ${effort} | ${area} |`;

test('roadmap: both Summary tables in ROADMAP.md match the rows', () => {
  const markdown = read('ROADMAP.md').replace(/\r\n/g, '\n');
  const items = roadmapItems(markdown);
  assert.ok(markdown.includes(summaryTable(items)), 'run node scripts/roadmap.mjs --write');
  assert.ok(markdown.includes(progressTable(items)), 'run node scripts/roadmap.mjs --write');
});

test('roadmap: every item has an effort and a visitor-facing area; partial items say how much is done', () => {
  const items = roadmapItems(read('ROADMAP.md'));
  assert.ok(items.length >= 90, `${items.length} items`);
  for (const item of items) {
    assert.ok(Object.values(EFFORT).includes(item.weight), item.id);
    assert.ok(AREAS.includes(item.area), item.id);
    if (item.status === 'partial') assert.ok(item.fraction > 0 && item.fraction < 1, item.id);
  }
  assert.ok(AREAS.length >= 5 && AREAS.length <= 7);
  for (const area of AREAS) assert.ok(items.some((item) => item.area === area), `${area} has items`);
});

test('roadmap: progress is done weight over total weight; partial counts its fraction', () => {
  const items = roadmapItems([row('A-1', 'done', 'XL'), row('A-2', 'partial', 'M 40%'), row('A-3', 'missing', 'S'), row('B-1', 'missing', 'XS', 'legal')].join('\n'));
  // (13 + 5 * 0.4) / (13 + 5 + 2 + 1) = 15 / 21 = 71 %
  assert.deepEqual(roadmapProgress(items), { done: 1, partial: 1, missing: 2, total: 4, weight: 21, doneWeight: 15, percent: 71 });
  const byArea = Object.fromEntries(areaProgress(items).map((area) => [area.area, area]));
  assert.equal(byArea.journey.percent, 75);
  assert.equal(byArea.legal.percent, 0);
  assert.equal(byArea.puzzles.weight, 0);
  assert.equal(byArea.puzzles.percent, 0);
});

test('roadmap: a wrong effort cell stops the build instead of counting silently', () => {
  assert.deepEqual(parseEffort('L', 'done'), { size: 'L', weight: 8, fraction: 1 });
  assert.equal(parseEffort('S 25%', 'partial').fraction, 0.25);
  assert.throws(() => parseEffort('M', 'partial'), /partial item needs/);
  assert.throws(() => parseEffort('M 40%', 'done'), /only a partial/);
  assert.throws(() => parseEffort('XXL', 'missing'), /not XS/);
  assert.throws(() => roadmapItems(row('A-1', 'done', 'M', 'nowhere')), /unknown area/);
});

test('coming-soon page: Amonel, no internal codes, every figure a placeholder the build fills', () => {
  const page = read('soon/index.html');
  assert.doesNotMatch(page, /AhmadOS|ahmados/i);
  // No item IDs and no phase numbers anywhere a visitor could read them.
  const visible = page.replace(/<!--[\s\S]*?-->/g, '');
  assert.doesNotMatch(visible, /\b(?:APP|SEO|LEG|PERF|DEP|BR|OWN|POST|FIN|BASE)-\d+\b/);
  assert.doesNotMatch(visible, /\b(?:phase|Phase|phasen?)\b|9D-\d/);
  assert.doesNotMatch(visible, /\d+ %<\/span>/, 'no percentage typed by hand');
  const keys = new Set([...page.matchAll(/\{\{([A-Za-z_]+(?:\.[a-z]+)?)\}\}/g)].map((match) => match[1]));
  assert.ok(keys.has('all.percent'));
  for (const area of AREAS) {
    for (const field of ['percent', 'done', 'partial', 'missing']) assert.ok(keys.has(`${area}.${field}`), `${area}.${field}`);
  }
  const filled = fillPlaceholders(page, progressValues(roadmapItems(read('ROADMAP.md')), new Date('2026-09-24T10:00:00Z')));
  assert.doesNotMatch(filled, /\{\{/);
  assert.match(filled, /datetime="2026-09-24"/);
  assert.match(filled, />24\. September 2026</);
  assert.throws(() => fillPlaceholders('{{nope.percent}}', {}), /unknown placeholder/);
});

test('coming-soon page: the main logo is design 6 (power "o"), the terminal lockup design 1, both inline', () => {
  const page = read('soon/index.html');
  assert.match(page, /class="logo"[^>]*aria-label="Amonel">Am<svg[\s\S]*?<\/svg>nel<\/a>/);
  assert.match(page, /<span class="p">~\$ <\/span>amonel os<span class="cursor"><\/span>/);
  assert.doesNotMatch(page, /<img/);
});
