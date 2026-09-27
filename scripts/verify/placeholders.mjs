// Launch gate (queue 2026-09-28 A1 item 6, ROADMAP DEP-06/FIN-01): lists
// every PLACEHOLDER row of CONTENT_REVIEW.md that is visible in the build -
// warn only for now, so it can be run at any time without blocking anything;
// `--strict` turns the same list into a failure, for DEP-06 once FIN-01 (the
// content review with the owner) is done and every remaining row should be a
// hard stop.
//
//   node scripts/verify/placeholders.mjs [--strict] [--quiet]
//
// "Visible in the build" follows the file's own convention (its "How to use
// this file" section): a row filed under a section whose most recent
// `**File:**` line reads "not built yet" is not yet on any page, UNLESS its
// own note already says "(built ...)" - the file's own way of flagging a row
// whose section header is stale because the feature shipped after the
// section was written (CR-1031, CR-1046..CR-1051 and others). Rows outside
// such a section are visible by construction: every other section is a real
// file already read by real code (`src/messages/*.json`, a component, a
// script).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Every PLACEHOLDER row of CONTENT_REVIEW.md, each marked `notBuiltYet` when
 * it is filed under a section whose most recent `**File:**` line reads
 * "not built yet" and neither its location nor its note says "(built ...)"
 * - the file's own way of flagging a row whose section header is stale
 * because the feature shipped after the section was written (CR-1031,
 * CR-1046..CR-1051 and others). Exported for its own test.
 */
export function parsePlaceholders(text) {
  let currentFile = null;
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const file = line.match(/^\*\*File:\*\*\s*(.+)$/);
    if (file) {
      currentFile = file[1].trim();
      continue;
    }
    const row = line.match(/^\|\s*(CR-\d+)\s*\|(.*)\|\s*$/);
    if (!row) continue;
    const rest = row[2].split('|').map((cell) => cell.trim());
    if (rest.length < 5) continue; // a table's own header/separator row
    const [location, type, languages, status, ...noteParts] = rest;
    const note = noteParts.join('|').trim();
    if (status !== 'PLACEHOLDER') continue;
    // "(built ...)" can sit in the location or the note - either overrides a stale "not built yet" section.
    const notBuiltYet = currentFile === 'not built yet' && !/\(built\b/i.test(location) && !/\(built\b/i.test(note);
    rows.push({ id: row[1], location, type, languages, notBuiltYet });
  }
  return rows;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL('../../', import.meta.url);
  const args = new Set(process.argv.slice(2));
  const STRICT = args.has('--strict');
  const QUIET = args.has('--quiet');

  const rows = parsePlaceholders(readFileSync(new URL('CONTENT_REVIEW.md', root), 'utf8'));
  const visible = rows.filter((entry) => !entry.notBuiltYet);
  const notYetBuilt = rows.length - visible.length;

  if (!QUIET) {
    for (const entry of visible) console.log(`${entry.id}  ${entry.type.padEnd(20)}  ${entry.location}`);
  }
  console.log(`placeholders: ${visible.length} PLACEHOLDER row(s) visible in the build, ${notYetBuilt} filed under pages/assets not built yet, ${rows.length} total PLACEHOLDER rows${STRICT ? ' (--strict)' : ''}`);

  if (STRICT && visible.length > 0) process.exit(1);
}
