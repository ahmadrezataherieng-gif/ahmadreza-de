// The whole verification matrix, quietly: one line per configuration.
//
//   node scripts/verify/matrix.mjs [--only apps|desktop|navigation|journey]
//        [--base http://localhost:3001] [--verbose]
//
// Needs the export served (npm run build, then node scripts/verify/serve.mjs).
// Each configuration runs as its own process with --quiet, so a run costs a page
// of output instead of hundreds of PASS lines: a pass is its summary line, a
// failure is its FAIL lines in full. --verbose drops --quiet. Exits 1 if any
// configuration failed.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const BASE = args.base ?? 'http://localhost:3001';
const VERBOSE = Boolean(args.verbose);
const ONLY = typeof args.only === 'string' ? args.only : null;
const HERE = path.dirname(fileURLToPath(import.meta.url));

const PHONE = ['--width', '380', '--height', '800', '--touch'];
const TABLET = ['--width', '768', '--height', '1024'];
const fa = ['--locale', 'fa'];
const en = ['--locale', 'en'];
const reduce = ['--reduce'];

/** [script, extra arguments], in the order they are cheapest to read. */
const MATRIX = [
  ['apps', []],
  ['apps', en],
  ['apps', fa],
  ['apps', TABLET],
  ['apps', [...TABLET, ...fa]],
  ['apps', PHONE],
  ['apps', [...PHONE, ...en]],
  ['apps', [...PHONE, ...fa]],
  ['apps', reduce],
  ['apps', [...reduce, ...PHONE, ...fa]],
  ['desktop', []],
  ['desktop', fa],
  ['desktop', TABLET],
  ['desktop', [...PHONE, ...en]],
  ['desktop', [...reduce, ...PHONE]],
  ['navigation', []],
  ['navigation', fa],
  ['navigation', [...en, '--width', '380', '--touch']],
  ['navigation', reduce],
  ['journey', ['--mode', 'play']],
  ['journey', ['--mode', 'watch']],
  ['journey', ['--mode', 'play', ...PHONE]],
  ['journey', ['--mode', 'play', ...fa]],
  ['journey', ['--mode', 'play', ...TABLET]],
  ['journey', ['--mode', 'play', ...reduce]],
  ['journey', ['--mode', 'watch', ...reduce]],
];

try {
  const response = await fetch(`${BASE}/`);
  if (!response.ok) throw new Error(String(response.status));
} catch {
  console.error(`No server answering at ${BASE}. Run npm run build, serve out/ with node scripts/verify/serve.mjs, and try again.`);
  process.exit(2);
}

const started = Date.now();
let ran = 0;
let failed = 0;
for (const [script, extra] of MATRIX) {
  if (ONLY && ONLY !== script) continue;
  ran += 1;
  const argv = [path.join(HERE, `${script}.mjs`), '--base', BASE, ...extra, ...(VERBOSE ? [] : ['--quiet'])];
  const run = spawnSync(process.execPath, argv, { encoding: 'utf8', timeout: 20 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 });
  const lines = `${run.stdout ?? ''}\n${run.stderr ?? ''}`.split(/\r?\n/).filter(Boolean);
  const summary = [...lines].reverse().find((line) => / passed/.test(line));
  const failures = lines.filter((line) => line.startsWith('FAIL'));
  const ok = run.status === 0 && Boolean(summary) && failures.length === 0;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${summary ?? `${script} ${extra.join(' ')}: no summary (exit ${run.status})`}`);
  if (!ok) {
    failed += 1;
    // The failures themselves; without any, the tail of the output says why.
    for (const line of failures.length > 0 ? failures : lines.slice(-6)) console.log(`       ${line.slice(0, 300)}`);
  }
}

const minutes = ((Date.now() - started) / 60000).toFixed(1);
console.log(`\n${ran} configurations, ${failed} failed, ${minutes} min`);
process.exit(failed > 0 ? 1 : 0);
