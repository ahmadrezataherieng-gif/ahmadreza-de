// The counters Worker against a real local D1, under `wrangler dev --local`
// (Phase 9C, DECISIONS.md 56). Nothing here touches Cloudflare.
//
//   npx wrangler d1 migrations apply amonel-counters --local
//   npx wrangler dev --local --port 8787          (in another terminal)
//   node scripts/verify/worker-local.mjs [--base http://localhost:8787] [--quiet]
//
// Reads the table through `wrangler d1 execute --local`, not through
// /api/counts, whose answer is cached for a minute by design.
import { spawnSync } from 'node:child_process';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const BASE = args.base ?? 'http://localhost:8787';
const QUIET = Boolean(args.quiet);
const log = [];
const check = (name, ok, detail) => {
  log.push({ name, ok: Boolean(ok) });
  if (QUIET && ok) return;
  const extra = detail === undefined ? '' : ` :: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra}`);
};

/** The row as D1 has it, straight from the local database file. */
const stored = (name) => {
  const result = spawnSync(
    `npx wrangler d1 execute amonel-counters --local --json --command "SELECT n FROM counters WHERE name = '${name}'"`,
    { shell: true, encoding: 'utf8' },
  );
  const json = JSON.parse(result.stdout.slice(result.stdout.indexOf('[')));
  return json[0]?.results?.[0]?.n ?? 0;
};

/** workerd drops idle keep-alive sockets now and then; one retry, never more. */
const fetch = (url, init) => globalThis.fetch(url, init).catch(() => globalThis.fetch(url, init));
const LOCAL = 'http://localhost:8787';
const post = (name, origin = LOCAL) => fetch(`${BASE}/api/count/${name}`, { method: 'POST', headers: origin ? { Origin: origin } : {} });

check('count: an allowlisted name is 204', (await post('app.about.opened')).status === 204);
check('count: an unknown name is 404', (await post('era.atari.solved')).status === 404);
check('count: GET is 405', (await fetch(`${BASE}/api/count/app.about.opened`)).status === 405);
check('count: a foreign Origin is 403', (await post('app.about.opened', 'https://evil.example')).status === 403);
check('count: no Origin (not a browser) is counted', (await post('app.about.opened', null)).status === 204);

const NAME = 'app.traceroute.opened';
const before = stored(NAME);
const PARALLEL = 50;
const statuses = await Promise.all(Array.from({ length: PARALLEL }, () => post(NAME).then((response) => response.status)));
check(`count: ${PARALLEL} parallel requests all answered 204`, statuses.every((status) => status === 204), statuses.filter((status) => status !== 204));
const after = stored(NAME);
check(`count: the increment is atomic - exactly +${PARALLEL}`, after - before === PARALLEL, { before, after });

const counts = await fetch(`${BASE}/api/counts`);
const body = await counts.json();
check('counts: 200 JSON, public for a minute', counts.status === 200 && counts.headers.get('cache-control') === 'public, max-age=60');
check('counts: security headers', counts.headers.get('x-content-type-options') === 'nosniff' && /default-src 'none'/.test(counts.headers.get('content-security-policy') ?? ''));
check('counts: numbers only, allowlisted names only', Object.entries(body).every(([name, n]) => /^(era\.[a-z0-9]+\.solved|quiz\.completed|journey\.(completed|mode\.(guided|interactive))|app\.[a-z0-9-]+\.opened)$/.test(name) && Number.isInteger(n)), body);

check('api: anything else under /api/ is 404', (await fetch(`${BASE}/api/assistant`)).status === 404);
const page = await fetch(`${BASE}/`);
check('assets: the site itself is still served from out/', page.status === 200 && /<html/.test(await page.text()));
const missing = await fetch(`${BASE}/no-such-page/`);
check('assets: a missing page is the real 404 page', missing.status === 404 && /<title>404/.test(await missing.text()));

const failed = log.filter((entry) => !entry.ok);
console.log(`worker-local: ${log.length - failed.length}/${log.length} passed${failed.length ? ` - FAILED: ${failed.map((entry) => entry.name).join('; ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
