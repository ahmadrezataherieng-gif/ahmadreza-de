// Replaces or adds one item row in ROADMAP.md from a small JSON file, so rows
// can be edited from the shell without escaping trouble (Git Bash eats
// backslashes in inline scripts on this machine).
//
//   node scripts/roadmap-row.mjs rows.json
//
// rows.json: [{ "id": "APP-04", "row": "| APP-04 | ... |", "after": "APP-03" }]
// A row whose id exists is replaced; otherwise it is inserted after `after`.
// The Summary table is recounted afterwards.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const file = new URL('../ROADMAP.md', import.meta.url);
const rows = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const text = readFileSync(file, 'utf8');
const eol = text.includes('\r\n') ? '\r\n' : '\n';
const lines = text.split(/\r?\n/);
const find = (id) => lines.findIndex((line) => line.startsWith(`| ${id} |`));

for (const { id, row, after } of rows) {
  if (!row.startsWith(`| ${id} |`)) throw new Error(`row for ${id} must start with "| ${id} |"`);
  const at = find(id);
  if (at >= 0) {
    lines[at] = row;
    continue;
  }
  const anchor = find(after);
  if (anchor < 0) throw new Error(`${id}: anchor ${after} not found`);
  lines.splice(anchor + 1, 0, row);
}
writeFileSync(file, lines.join(eol));
execFileSync(process.execPath, [new URL('./roadmap.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), '--write'], { stdio: 'inherit' });
