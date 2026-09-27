// The launch gate (queue 2026-09-28 A1 item 6): parsing CONTENT_REVIEW.md's
// PLACEHOLDER rows and the "not built yet" override, plus a sanity check on
// the real file (warn only, never blocks).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { parsePlaceholders } from '../verify/placeholders.mjs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const SAMPLE = `
## 1. A real section

**File:** \`src/messages/{de,en,fa}.json\`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1 | \`site.title\` | SEO / meta | de / en / fa | PLACEHOLDER | Now (de): «Something» |
| CR-2 | \`site.done\` | SEO / meta | de / en / fa | FINAL (2026-09-01) | Approved already |

## 2. Pages that do not exist yet

**File:** not built yet

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-3 | A future app, all copy | long text | de / en / fa | PLACEHOLDER | Not shipped |
| CR-4 | \`site.shipped\` (built 2026-09-20) | SEO / meta | de / en / fa | PLACEHOLDER | Shipped after the section was written |
`;

test('parsePlaceholders: PLACEHOLDER rows only, "not built yet" excluded unless the row itself says "(built ...)"', () => {
  const rows = parsePlaceholders(SAMPLE);
  assert.deepEqual(rows.map((row) => row.id), ['CR-1', 'CR-3', 'CR-4']);
  assert.equal(rows.find((row) => row.id === 'CR-1').notBuiltYet, false, 'a normal section is visible');
  assert.equal(rows.find((row) => row.id === 'CR-3').notBuiltYet, true, 'not built yet, no override');
  assert.equal(rows.find((row) => row.id === 'CR-4').notBuiltYet, false, '"(built ...)" in the location overrides a stale section');
});

test('parsePlaceholders: the real CONTENT_REVIEW.md parses into a plausible number of rows, never zero and never all excluded', () => {
  const rows = parsePlaceholders(read('../../CONTENT_REVIEW.md'));
  const visible = rows.filter((row) => !row.notBuiltYet);
  assert.ok(rows.length > 500, `found ${rows.length} PLACEHOLDER rows, expected hundreds`);
  assert.ok(visible.length > 0, 'at least some rows are visible in the build');
  assert.ok(rows.length - visible.length < rows.length, 'not every row is excluded');
  for (const row of rows) assert.match(row.id, /^CR-\d+$/);
});

test('placeholders.mjs: warn only by default, --strict fails while any visible PLACEHOLDER row remains', () => {
  const rows = parsePlaceholders(read('../../CONTENT_REVIEW.md'));
  const anyVisible = rows.some((row) => !row.notBuiltYet);
  // The whole site is still a placeholder (CLAUDE.md), so today this must be true; --strict is meant for DEP-06, after FIN-01.
  assert.ok(anyVisible, 'the launch gate has something to warn about before the content review');
  const source = read('../verify/placeholders.mjs');
  assert.match(source, /if \(STRICT && visible\.length > 0\) process\.exit\(1\);/);
});
