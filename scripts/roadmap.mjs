// Reads ROADMAP.md, the master plan, and counts its items by priority and
// status. One parser for two readers: the Summary table in ROADMAP.md itself
// (`node scripts/roadmap.mjs --write`) and the progress shown on the
// coming-soon page, computed at build time so it never goes stale.
//
//   node scripts/roadmap.mjs           print the counts
//   node scripts/roadmap.mjs --write   rewrite the Summary table in ROADMAP.md

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = new URL('../ROADMAP.md', import.meta.url);
const STATUSES = ['missing', 'partial', 'done'];
const PRIORITIES = ['P0', 'P1', 'P2'];

/** Every item row: `| ID | description | status | priority | owner | depends |`. */
export function roadmapItems(markdown = readFileSync(file, 'utf8')) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\| [A-Z]+-\d+ \|/.test(line))
    .map((line) => {
      const cells = line.split('|').map((cell) => cell.trim());
      return { id: cells[1], status: cells[3], priority: cells[4], owner: cells[5] };
    })
    .filter((item) => STATUSES.includes(item.status) && PRIORITIES.includes(item.priority));
}

/**
 * Progress as the coming-soon page shows it: done items count fully, partial
 * items half. Rounded to whole percent.
 */
export function roadmapProgress(items = roadmapItems()) {
  const done = items.filter((item) => item.status === 'done').length;
  const partial = items.filter((item) => item.status === 'partial').length;
  const total = items.length;
  return { done, partial, total, percent: total ? Math.round(((done + partial / 2) / total) * 100) : 0 };
}

export function summaryTable(items = roadmapItems()) {
  const count = (priority, status) => items.filter((item) => (!priority || item.priority === priority) && (!status || item.status === status)).length;
  const rows = PRIORITIES.map((priority) => `| ${priority} | ${STATUSES.map((status) => count(priority, status)).join(' | ')} | ${count(priority)} |`);
  const total = `| **total** | ${STATUSES.map((status) => `**${count(null, status)}**`).join(' | ')} | **${items.length}** |`;
  return ['| | missing | partial | done | total |', '|---|---|---|---|---|', ...rows, total].join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const markdown = readFileSync(file, 'utf8');
  const table = summaryTable(roadmapItems(markdown));
  if (process.argv.includes('--write')) {
    const updated = markdown.replace(/\| \| missing \| partial \| done \| total \|\n\|---\|---\|---\|---\|---\|\n(?:\|.*\|\n){4}/, `${table}\n`);
    if (updated === markdown && !markdown.includes(table)) throw new Error('ROADMAP.md: Summary table not found');
    writeFileSync(file, updated);
  }
  console.log(table);
  console.log(roadmapProgress(roadmapItems(markdown)));
}
