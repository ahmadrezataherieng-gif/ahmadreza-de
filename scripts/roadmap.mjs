// Reads ROADMAP.md, the master plan: every item with its status, priority,
// effort and area. One parser for two readers: the Summary tables in
// ROADMAP.md itself (`node scripts/roadmap.mjs --write`) and the progress shown
// on the coming-soon page, computed at build time so it never goes stale.
//
// Progress is weighted by effort (XS 1, S 2, M 5, L 8, XL 13): a done item
// counts its whole weight, a partial one the fraction written next to its size
// (`M 40%`), a missing one nothing.
//
//   node scripts/roadmap.mjs           print the tables
//   node scripts/roadmap.mjs --write   rewrite the Summary tables in ROADMAP.md

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = new URL('../ROADMAP.md', import.meta.url);
const STATUSES = ['missing', 'partial', 'done'];
const PRIORITIES = ['P0', 'P1', 'P2'];
export const EFFORT = { XS: 1, S: 2, M: 5, L: 8, XL: 13 };
/** The visitor-facing groups, in the order the coming-soon page lists them. */
export const AREAS = ['journey', 'desktop', 'puzzles', 'about', 'legal', 'seo', 'launch'];

/**
 * `M`, or `M 40%` for a partial item. Only a partial item carries a fraction,
 * and it must be strictly between 0 and 100 - otherwise the status is wrong.
 */
export function parseEffort(cell, status, id = '?') {
  const match = /^(XS|S|M|L|XL)(?: (\d{1,2})%)?$/.exec(cell ?? '');
  if (!match) throw new Error(`ROADMAP.md ${id}: effort "${cell}" is not XS, S, M, L or XL`);
  const percent = match[2] === undefined ? null : Number(match[2]);
  if (status === 'partial' && !percent) throw new Error(`ROADMAP.md ${id}: a partial item needs its done fraction, e.g. "${match[1]} 40%"`);
  if (status !== 'partial' && percent !== null) throw new Error(`ROADMAP.md ${id}: only a partial item carries a fraction`);
  const fraction = status === 'done' ? 1 : status === 'missing' ? 0 : percent / 100;
  return { size: match[1], weight: EFFORT[match[1]], fraction };
}

/** Every item row: `| ID | description | status | priority | owner | depends | effort | area |`. */
export function roadmapItems(markdown = readFileSync(file, 'utf8')) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\| [A-Z]+-\d+ \|/.test(line))
    .map((line) => {
      const cells = line.split('|').map((cell) => cell.trim());
      const [id, status, priority, owner, effort, area] = [cells[1], cells[3], cells[4], cells[5], cells[7], cells[8]];
      if (!STATUSES.includes(status)) throw new Error(`ROADMAP.md ${id}: unknown status "${status}"`);
      if (!PRIORITIES.includes(priority)) throw new Error(`ROADMAP.md ${id}: unknown priority "${priority}"`);
      if (!AREAS.includes(area)) throw new Error(`ROADMAP.md ${id}: unknown area "${area}"`);
      return { id, status, priority, owner, area, ...parseEffort(effort, status, id) };
    });
}

/** Weighted progress of a set of items, rounded to whole percent. */
export function roadmapProgress(items = roadmapItems()) {
  const count = (status) => items.filter((item) => item.status === status).length;
  const weight = items.reduce((sum, item) => sum + item.weight, 0);
  const doneWeight = items.reduce((sum, item) => sum + item.weight * item.fraction, 0);
  return {
    done: count('done'),
    partial: count('partial'),
    missing: count('missing'),
    total: items.length,
    weight,
    doneWeight: Math.round(doneWeight * 10) / 10,
    percent: weight ? Math.round((doneWeight / weight) * 100) : 0,
  };
}

/** One entry per area, in the order of AREAS. */
export function areaProgress(items = roadmapItems()) {
  return AREAS.map((area) => ({ area, ...roadmapProgress(items.filter((item) => item.area === area)) }));
}

export function summaryTable(items = roadmapItems()) {
  const count = (priority, status) => items.filter((item) => (!priority || item.priority === priority) && (!status || item.status === status)).length;
  const rows = PRIORITIES.map((priority) => `| ${priority} | ${STATUSES.map((status) => count(priority, status)).join(' | ')} | ${count(priority)} |`);
  const total = `| **total** | ${STATUSES.map((status) => `**${count(null, status)}**`).join(' | ')} | **${items.length}** |`;
  return ['| | missing | partial | done | total |', '|---|---|---|---|---|', ...rows, total].join('\n');
}

export function progressTable(items = roadmapItems()) {
  const row = (label, p) => `| ${label} | ${p.done} | ${p.partial} | ${p.missing} | ${p.doneWeight} / ${p.weight} | ${p.percent} % |`;
  const overall = roadmapProgress(items);
  return [
    '| Area | done | in progress | to do | weight done / total | progress |',
    '|---|---|---|---|---|---|',
    ...areaProgress(items).map((p) => row(`\`${p.area}\``, p)),
    row('**all**', overall).replace(/\| (\d+ %) \|$/, '| **$1** |'),
  ].join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const markdown = readFileSync(file, 'utf8');
  const items = roadmapItems(markdown);
  const table = summaryTable(items);
  const weighted = progressTable(items);
  if (process.argv.includes('--write')) {
    // autocrlf may hand this file over with CRLF; keep whichever ending it has.
    const eol = markdown.includes('\r\n') ? '\r\n' : '\n';
    const withEol = (text) => text.replace(/\n/g, eol);
    let updated = markdown.replace(/\| \| missing \| partial \| done \| total \|\r?\n\|---\|---\|---\|---\|---\|\r?\n(?:\|.*\|\r?\n){4}/, `${withEol(table)}${eol}`);
    if (updated === markdown && !markdown.includes(withEol(table))) throw new Error('ROADMAP.md: Summary table not found');
    const markers = /<!-- progress:start -->[\s\S]*?<!-- progress:end -->/;
    if (!markers.test(updated)) throw new Error('ROADMAP.md: progress markers not found');
    updated = updated.replace(markers, withEol(`<!-- progress:start -->\n${weighted}\n<!-- progress:end -->`));
    writeFileSync(file, updated);
  }
  console.log(weighted);
  console.log(table);
}
