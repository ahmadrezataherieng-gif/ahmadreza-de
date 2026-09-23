// What each view actually costs: the JavaScript and CSS a browser loads for it
// (lazy chunks included), and its HTML, all gzipped at level 6.
//
//   node scripts/verify/sizes.mjs [--base URL] [--out out]
//
// Next.js reports one "First Load JS" per route, and every view shares the one
// route file `[[...locale]]` - so that number cannot tell the desktop from the
// journey. This measures per view in a real browser instead.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { launch, sleep } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const BASE = args.base ?? 'http://localhost:3001';
const OUT_DIR = args.out ?? 'out';
// --quiet: three lines instead of the whole report.
const QUIET = Boolean(args.quiet);
const say = (...parts) => {
  if (!QUIET) console.log(...parts);
};
const gz = (buffer) => gzipSync(buffer, { level: 6 }).length / 1024;
const kb = (value) => `${value.toFixed(1)} kB`;

const cache = new Map();
async function gzOf(url) {
  if (!cache.has(url)) cache.set(url, gz(Buffer.from(await (await fetch(url)).arrayBuffer())));
  return cache.get(url);
}

async function measure(view, url, afterLoad) {
  const b = await launch({ width: 1280, height: 800, tag: `sizes-${view}` });
  await b.goto(url, 7000);
  if (afterLoad) await afterLoad(b);
  const resources = await b.evaluate(
    `[...performance.getEntriesByType('resource')].map((e) => e.name).filter((n) => /\\.(js|css)(\\?|$)/.test(n))`,
  );
  b.close();
  const rows = [];
  for (const resource of resources) rows.push({ file: resource.split('/').pop(), kind: resource.includes('.css') ? 'css' : 'js', gz: await gzOf(resource) });
  return rows;
}

const views = [
  ['landing', `${BASE}/`],
  ['journey', `${BASE}/amonel/`],
  ['desktop', `${BASE}/desktop/`],
];

const results = {};
for (const [view, url] of views) {
  if (view === 'desktop' && !existsSync(path.join(OUT_DIR, 'desktop', 'index.html'))) continue;
  results[view] = await measure(view, url);
}

// The desktop again, with one app open at a time: each app's own chunks (code
// and copy) load on demand, and only then.
const APPS = ['about', 'terminal', 'tickets', 'traceroute', 'assistant', 'contact', 'quiz'];
const appRows = {};
if (results.desktop) {
  for (const app of APPS) {
    appRows[app] = await measure(`desktop-${app}`, `${BASE}/desktop/`, async (b) => {
      const point = await b.evaluate(`(() => { const r = document.querySelector('[data-app="${app}"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
      await b.click(point.x, point.y);
      await sleep(2500);
    });
  }
}

say('JavaScript and CSS loaded per view (gzip -6):');
for (const [view, rows] of Object.entries(results)) {
  const js = rows.filter((row) => row.kind === 'js');
  const css = rows.filter((row) => row.kind === 'css');
  say(`  ${view.padEnd(8)} JS ${kb(js.reduce((t, r) => t + r.gz, 0)).padStart(9)} in ${js.length} files, CSS ${kb(css.reduce((t, r) => t + r.gz, 0))}`);
}
if (results.desktop) {
  const base = new Set(results.desktop.map((row) => row.file));
  for (const [app, rows] of Object.entries(appRows)) {
    const extra = rows.filter((row) => !base.has(row.file));
    const total = extra.reduce((t, r) => t + r.gz, 0);
    say(`  opening ${app.padEnd(10)} adds ${kb(total).padStart(8)}: ${extra.map((row) => `${row.file} ${kb(row.gz)}`).join(', ') || 'nothing'}`);
  }
  const shared = new Set(results.landing.map((row) => row.file));
  say(`  desktop-only chunks: ${results.desktop.filter((row) => !shared.has(row.file)).map((row) => `${row.file} ${kb(row.gz)}`).join(', ')}`);
}
if (results.journey) {
  const shared = new Set(results.landing.map((row) => row.file));
  say(`  journey-only chunks: ${results.journey.filter((row) => !shared.has(row.file)).map((row) => `${row.file} ${kb(row.gz)}`).join(', ')}`);
}

say('\nHTML per view and locale (gzip -6):');
for (const view of ['', 'amonel', 'desktop']) {
  const cells = ['', 'en', 'fa'].map((locale) => {
    const file = path.join(OUT_DIR, locale, view, 'index.html');
    return existsSync(file) ? kb(gz(readFileSync(file))) : '-';
  });
  say(`  ${(view || 'landing').padEnd(8)} de ${cells[0]} · en ${cells[1]} · fa ${cells[2]}`);
}

if (QUIET) {
  const total = (rows, kind) => rows.filter((row) => row.kind === kind).reduce((t, r) => t + r.gz, 0);
  const views = Object.entries(results).map(([view, rows]) => `${view} JS ${kb(total(rows, 'js'))}`);
  console.log(`sizes (gzip -6): ${views.join(', ')}, CSS ${kb(total(Object.values(results)[0] ?? [], 'css'))}`);
  if (results.desktop) {
    const base = new Set(results.desktop.map((row) => row.file));
    const perApp = Object.entries(appRows).map(([app, rows]) => `${app} ${kb(rows.filter((row) => !base.has(row.file)).reduce((t, r) => t + r.gz, 0))}`);
    console.log(`on open: ${perApp.join(', ')}`);
  }
  const html = ['', 'amonel', 'desktop'].map((view) => {
    const cells = ['', 'en', 'fa'].map((locale) => {
      const page = path.join(OUT_DIR, locale, view, 'index.html');
      return existsSync(page) ? kb(gz(readFileSync(page))) : '-';
    });
    return `${view || 'landing'} ${cells.join('/')}`;
  });
  console.log(`HTML de/en/fa: ${html.join(', ')}`);
}
