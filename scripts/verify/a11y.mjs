// PERF-04: an automated accessibility pass with axe-core over the real export.
//
//   node scripts/verify/a11y.mjs [--locale de|en|fa] [--width 1280] [--touch] [--quiet] [--base URL]
//
// Every view (landing, journey, desktop, About, Impressum, Datenschutz, 404)
// against WCAG 2.2 A and AA; then, on the desktop, every app opened in turn;
// then the desktop in each of the eight themes the Time Machine can set, with
// an app open, for colour contrast. axe-core is a dev dependency, injected
// into the page over CDP - nothing of it ships.
import { readFileSync } from 'node:fs';

import { launch, sleep } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const WIDTH = Number(args.width ?? 1280);
const HEIGHT = Number(args.height ?? 800);
const LOCALE = args.locale ?? 'de';
const TOUCH = Boolean(args.touch);
const QUIET = Boolean(args.quiet);
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const TAG = `a11y-${WIDTH}-${LOCALE}${TOUCH ? '-touch' : ''}`;
const AXE = readFileSync(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const THEMES = ['era1946', 'era1956', 'era1971', 'era1981', 'era1984', 'era1995', 'era2024', 'modern'];
const APPS = ['about', 'terminal', 'tickets', 'traceroute', 'assistant', 'contact', 'timeline', 'cv', 'quiz', 'binary', 'snake', 'paint', 'network-tools', 'time-machine', 'scheduler', 'filesystem'];

const log = [];
const check = (name, ok, detail) => {
  log.push({ name, ok: Boolean(ok) });
  if (QUIET && ok) return;
  const extra = detail === undefined ? '' : ` :: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra}`);
};

const b = await launch({ width: WIDTH, height: HEIGHT, touch: TOUCH, tag: TAG });
// `--scheme light` audits the K6 pages in light mode (the default is the browser's dark run).
if (args.scheme) {
  await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: String(args.scheme) }, { name: 'prefers-reduced-motion', value: 'no-preference' }] });
}
const js = (code) => b.evaluate(code);
const until = async (expression, ms = 6000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await js(expression)) return true;
    await sleep(100);
  }
  return false;
};

/** Runs axe in the page; returns the violations, one line each, with the first offending nodes. */
async function audit(context = 'document', rules = null) {
  const injected = await js(`typeof window.axe !== 'undefined'`);
  if (!injected) await js(`${AXE}; true`);
  const options = rules
    ? { runOnly: { type: 'rule', values: rules } }
    : { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] };
  return js(`(async () => {
    const result = await axe.run(${context}, ${JSON.stringify(options)});
    return result.violations.map((v) => v.id + ' (' + v.impact + '): ' + v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | '));
  })()`);
}

const seed = (theme) =>
  js(`(() => {
    localStorage.clear();
    localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { journeyFinished: true, hasCompletedJourney: true, mode: 'guided' }, version: 3 }));
    ${theme && theme !== 'modern' ? `localStorage.setItem('amonel.theme.v1', JSON.stringify({ v: 1, theme: '${theme}' }));` : ''}
    sessionStorage.setItem('amonel.replay', '1');
    return true;
  })()`);

/* --- every view ---------------------------------------------------------------------- */

const views = [
  ['landing', `${PREFIX}/`],
  ['journey', `${PREFIX}/amonel/`],
  ['about', `${PREFIX}/about/`],
  ['impressum', `${PREFIX}/impressum/`],
  ['datenschutz', `${PREFIX}/datenschutz/`],
  ['404', `/this-page-does-not-exist/`],
];
await b.goto(`${BASE}${PREFIX}/`, 2500);
await js(`localStorage.clear(); sessionStorage.setItem('amonel.replay', '1'); true`);
for (const [name, path] of views) {
  await b.goto(`${BASE}${path}`, name === 'journey' ? 5000 : 2500);
  const violations = await audit();
  check(`${name}: no WCAG A/AA violation`, violations.length === 0, violations);
}

/* --- the desktop and every app ---------------------------------------------------------- */

await seed(null);
await b.goto(`${BASE}${PREFIX}/desktop/`, 5000);
await until(`!!document.querySelector('[data-shell-ready]') || !!document.querySelector('[data-shell]')`, 5000);
check('desktop: no WCAG A/AA violation', (await audit()).length === 0, await audit());
const layout = await js(`document.querySelector('[data-shell]')?.dataset.shellLayout ?? null`);
const icon = (id) => (layout === 'desktop' ? `[data-layout="desktop"] nav [data-app="${id}"]` : `:is(.ao-home, [data-dock]) [data-app="${id}"]`);
const frame = (id) => (layout === 'desktop' ? `[data-window="${id}"]` : `[data-mobile-app="${id}"]`);

async function openApp(id) {
  await js(`document.querySelector(${JSON.stringify(icon(id))})?.click(); true`);
  return until(`!!document.querySelector('${frame(id)} [data-app-content="${id}"]')`, 6000);
}
async function closeApp(id) {
  if (layout === 'desktop') await js(`document.querySelector('${frame(id)} [data-action="window-close"]')?.click(); true`);
  else await js('history.back(); true');
  await until(`!document.querySelector('${frame(id)}')`, 3000);
}

for (const id of APPS) {
  const opened = await openApp(id);
  if (!opened) {
    check(`${id}: opens`, false);
    continue;
  }
  await sleep(400);
  const violations = await audit(`document.querySelector('${frame(id)}')`);
  check(`${id}: no WCAG A/AA violation`, violations.length === 0, violations);
  await closeApp(id);
}

/* --- the eight themes: colour contrast on the desktop, with apps open -------------------- */

for (const theme of THEMES) {
  await b.goto(`${BASE}${PREFIX}/`, 1500);
  await seed(theme);
  await b.goto(`${BASE}${PREFIX}/desktop/`, 4000);
  await until(`document.documentElement.dataset.theme === '${theme}'`, 4000);
  await sleep(900);
  const problems = [];
  for (const id of ['about', 'network-tools', 'time-machine']) {
    if (!(await openApp(id))) continue;
    await sleep(700);
    problems.push(...(await audit(`document.querySelector('${frame(id)}')`, ['color-contrast'])).map((line) => `${id}: ${line}`));
    await closeApp(id);
  }
  check(`theme ${theme}: app text meets AA contrast`, problems.length === 0, problems);
}

check('no console errors', b.errors.length === 0, b.errors.slice(0, 3));
const passed = log.filter((entry) => entry.ok).length;
console.log(`${QUIET ? '' : '\n'}${TAG}: ${passed}/${log.length} passed`);
b.close();
process.exit(passed === log.length ? 0 : 1);
