// The automated part of PERF-01: the site in Firefox and WebKit (Playwright),
// next to the Chrome the other checks drive.
//
//   node scripts/verify/serve.mjs --port 3001                      (the export)
//   node scripts/verify/serve.mjs --dir soon/dist --port 3002      (the coming-soon build)
//   node scripts/verify/cross-browser.mjs [--engines firefox,webkit] [--setups desktop,tablet,phone]
//        [--locales de,fa] [--only journey] [--base URL] [--soon URL] [--verbose]
//
// Per engine, setup (1280 desktop, 1024 x 768 touch tablet, 390 x 844 phone)
// and locale (de, fa): the landing page, the journey in Guided and in Play mode
// scrolled to the Convergence, the desktop with every base app opened, About,
// Impressum, Datenschutz, the 404 page, and the coming-soon pages. Each page
// must show no console error or uncaught exception, no horizontal scroll, no
// failed request, and request nothing outside its own origin (which also
// means every font is self-hosted). One screenshot per page, engine, setup and
// locale goes to `Claude outputs/cross-browser/` (git-ignored, JPEG).
//
// playwright-core is a devDependency: this file is the only place it is used
// and nothing of it reaches a visitor. Browsers: `npx playwright-core install
// firefox webkit`.
import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { firefox, webkit } from 'playwright-core';

import { baseAppIds } from '../../src/content/eras.ts';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const BASE = String(args.base ?? 'http://localhost:3001');
const SOON = String(args.soon ?? 'http://localhost:3002');
const ENGINES = String(args.engines ?? 'firefox,webkit').split(',');
const SETUP_NAMES = String(args.setups ?? 'desktop,tablet,phone').split(',');
const LOCALES = String(args.locales ?? 'de,fa').split(',');
const ONLY = typeof args.only === 'string' ? args.only : null;
const VERBOSE = Boolean(args.verbose);
const OUT_DIR = path.resolve('Claude outputs', 'cross-browser');
mkdirSync(OUT_DIR, { recursive: true });

const SETUPS = {
  desktop: { width: 1280, height: 800, touch: false, mobile: false },
  tablet: { width: 1024, height: 768, touch: true, mobile: false },
  phone: { width: 390, height: 844, touch: true, mobile: true },
};
const ENGINE_TYPES = { firefox, webkit };

const ALL_PASSED = ['eniac', 'batch', 'unix', 'dos', 'macintosh', 'win95', 'cloud'];
const seed = (mode) =>
  `localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: ${mode === 'interactive' ? JSON.stringify(ALL_PASSED) : '[]'}, legendEras: [], hasCompletedJourney: false, mode: '${mode}' }, version: 2 }))`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const prefix = (locale) => (locale === 'de' ? '' : `/${locale}`);

/** Load a page and gather what the checks need; `act` may drive it further. */
async function visit(context, { name, url, act, allow404 = false, tag }) {
  const page = await context.newPage();
  const problems = [];
  const origin = new URL(url).origin;
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (allow404 && /404/.test(text)) return;
    // WebKit does not know `interactive-widget` (Next's viewport); it says so as an error. Ignored: no effect on the page.
    if (/interactive-widget/.test(text)) return;
    problems.push(`console error: ${text.slice(0, 160)}`);
  });
  page.on('pageerror', (error) => problems.push(`uncaught: ${String(error.message ?? error).slice(0, 160)}`));
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText ?? '';
    // A navigation the page itself cancelled (the hand-over to the desktop, a prefetch) is not a failure.
    if (/abort|cancel|NS_BINDING_ABORTED|interrupted/i.test(failure)) return;
    problems.push(`request failed: ${request.url().slice(0, 100)} ${failure}`);
  });
  page.on('request', (request) => {
    const target = request.url();
    if (target.startsWith('data:') || target.startsWith('blob:') || target.startsWith('about:')) return;
    if (new URL(target).origin !== origin) problems.push(`external request: ${target.slice(0, 100)}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !(allow404 && response.url() === url)) problems.push(`HTTP ${response.status()}: ${response.url().slice(0, 100)}`);
  });

  let extra = '';
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await sleep(1500);
    if (act) extra = (await act(page, problems)) ?? '';
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return Math.max(root.scrollWidth - root.clientWidth, document.body ? document.body.scrollWidth - root.clientWidth : 0);
    });
    if (overflow > 1) problems.push(`horizontal scroll: ${overflow}px`);
    await page.screenshot({ path: path.join(OUT_DIR, `${tag}-${name}.jpg`), type: 'jpeg', quality: 60 });
  } catch (error) {
    problems.push(`page error: ${String(error.message ?? error).split('\n')[0].slice(0, 200)}`);
  }
  await page.close().catch(() => undefined);
  // The counters' /api/* answers 404 on a plain server (there is no Worker), and the site is built to cope: drop those and the console line each one makes.
  const isApi404 = (problem) => problem.startsWith('HTTP 404') && problem.includes('/api/');
  let toDrop = problems.filter(isApi404).length;
  const kept = problems.filter((problem) => {
    if (isApi404(problem)) return false;
    if (toDrop > 0 && problem.startsWith('console error: Failed to load resource') && problem.includes('404')) {
      toDrop -= 1;
      return false;
    }
    return true;
  });
  return { name, problems: [...new Set(kept)], extra };
}

/* --- the journey ---------------------------------------------------------------- */

async function scrollJourney(page, problems) {
  let stalled = 0;
  let lastY = -1;
  let sawConvergence = false;
  let wheelWorks = true;
  for (let step = 0; step < 700; step += 1) {
    const state = await page.evaluate(() => ({
      y: window.scrollY,
      done: location.pathname.includes('/desktop') || window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4,
      convergence: (() => {
        const el = document.getElementById('convergence');
        if (!el) return false;
        const box = el.getBoundingClientRect();
        return box.top < window.innerHeight * 0.5 && box.bottom > window.innerHeight * 0.5;
      })(),
    }));
    if (state.convergence) sawConvergence = true;
    if (state.done || state.convergence) break;
    // Mobile WebKit has no mouse wheel; a touch device scrolls natively there, so a plain scroll is what a finger does.
    if (wheelWorks) {
      try {
        await page.mouse.move(200, 300);
        await page.mouse.wheel(0, 800);
      } catch {
        wheelWorks = false;
      }
    }
    if (!wheelWorks) await page.evaluate(() => window.scrollBy(0, 800));
    await sleep(60);
    if (state.y === lastY) {
      stalled += 1;
      // Lenis did not take the wheel (touch profiles scroll natively): a plain scroll.
      if (stalled % 3 === 0) await page.evaluate(() => window.scrollBy(0, 800));
    } else {
      stalled = 0;
    }
    lastY = state.y;
    // A Play-mode gate that stopped the page cannot be scrolled past: the seed passes every era, so this is a failure.
    if (stalled > 60) {
      problems.push(`the journey stopped scrolling at ${Math.round(state.y)} px`);
      return 'stopped';
    }
  }
  await sleep(1200);
  const end = await page.evaluate(() => ({
    path: location.pathname,
    convergence: !!document.getElementById('convergence'),
    y: Math.round(window.scrollY),
    height: document.documentElement.scrollHeight,
  }));
  const reached = sawConvergence || end.path.includes('/desktop') || end.y + 1000 >= end.height;
  if (!reached) problems.push(`the Convergence was not reached (y ${end.y} of ${end.height})`);
  return `reached ${end.path.includes('/desktop') ? 'the desktop' : sawConvergence ? 'the Convergence' : 'the end'} at ${end.y}`;
}

async function journeyPage(context, locale, mode, tag) {
  const seedPage = await context.newPage();
  await seedPage.goto(`${BASE}${prefix(locale)}/amonel/?tier=light`, { waitUntil: 'load' });
  await seedPage.evaluate(seed(mode));
  await seedPage.close();
  return visit(context, {
    name: `journey-${mode === 'guided' ? 'guided' : 'play'}`,
    url: `${BASE}${prefix(locale)}/amonel/?tier=light`,
    tag,
    act: scrollJourney,
  });
}

/* --- the desktop ---------------------------------------------------------------- */

async function openApps(page, problems) {
  await page.waitForSelector('[data-shell]', { timeout: 20000 });
  const layout = await page.evaluate(() => document.querySelector('[data-shell]')?.dataset.shellLayout ?? null);
  const opened = [];
  for (const id of baseAppIds) {
    const icon =
      layout === 'desktop'
        ? `[data-layout="desktop"] nav [data-app="${id}"]`
        : `.ao-home [data-app="${id}"], [data-dock] [data-app="${id}"]`;
    const frame = layout === 'desktop' ? `[data-window="${id}"]` : `[data-mobile-app="${id}"]`;
    try {
      await page.locator(icon).first().click({ timeout: 8000 });
      await page.waitForSelector(`${frame} [data-app-content="${id}"]`, { timeout: 15000 });
      opened.push(id);
    } catch {
      problems.push(`the ${id} app did not open (${layout} layout)`);
    }
    // The last app stays open for the screenshot. Each other closes, as it does for a visitor:
    // a window would otherwise cover the next icon (a phone shows one app at a time, Back closes it).
    if (id === baseAppIds[baseAppIds.length - 1]) continue;
    if (layout === 'desktop') {
      await page.locator(`${frame} [data-action="window-close"]`).first().click({ timeout: 5000 }).catch(() => problems.push(`the ${id} window did not close`));
    } else {
      await page.goBack().catch(() => undefined);
    }
    await sleep(300);
  }
  await sleep(500);
  return `${layout}: ${opened.length}/${baseAppIds.length} apps`;
}

/* --- the run -------------------------------------------------------------------- */

let failures = 0;
let checked = 0;

for (const engineName of ENGINES) {
  const engine = ENGINE_TYPES[engineName];
  if (!engine) throw new Error(`unknown engine ${engineName}`);
  let browser;
  try {
    browser = await engine.launch({ headless: true });
  } catch (error) {
    // Reported, never skipped silently: a missing engine is a missing check.
    console.log(`FAIL ${engineName.padEnd(22)} cannot start: ${String(error.message ?? error).split(/\r?\n/)[0].slice(0, 160)}`);
    failures += 1;
    continue;
  }
  for (const setupName of SETUP_NAMES) {
    const setup = SETUPS[setupName];
    for (const locale of LOCALES) {
      const context = await browser.newContext({
        viewport: { width: setup.width, height: setup.height },
        hasTouch: setup.touch,
        isMobile: setup.mobile && engineName === 'webkit',
        deviceScaleFactor: 1,
      });
      const tag = `${engineName}-${setupName}-${locale}`;
      const p = prefix(locale);
      const jobs = [
        ['landing', () => visit(context, { name: 'landing', url: `${BASE}${p}/`, tag })],
        ['journey-guided', () => journeyPage(context, locale, 'guided', tag)],
        ['journey-play', () => journeyPage(context, locale, 'interactive', tag)],
        ['desktop', () => visit(context, { name: 'desktop', url: `${BASE}${p}/desktop/`, tag, act: openApps })],
        ['about', () => visit(context, { name: 'about', url: `${BASE}${p}/about/`, tag })],
        ['impressum', () => visit(context, { name: 'impressum', url: `${BASE}${p}/impressum/`, tag })],
        ['datenschutz', () => visit(context, { name: 'datenschutz', url: `${BASE}${p}/datenschutz/`, tag })],
        ['404', () => visit(context, { name: '404', url: `${BASE}${p === '' ? '' : p}/does-not-exist/`, tag, allow404: true })],
        ['soon', () => visit(context, { name: 'soon', url: `${SOON}${p}/`, tag })],
        ['soon-impressum', () => visit(context, { name: 'soon-impressum', url: `${SOON}${p}/impressum/`, tag })],
        ['soon-datenschutz', () => visit(context, { name: 'soon-datenschutz', url: `${SOON}${p}/datenschutz/`, tag })],
      ];
      const results = [];
      for (const [jobName, job] of jobs) {
        if (ONLY && !jobName.includes(ONLY)) continue;
        results.push(await job());
      }
      const bad = results.filter((result) => result.problems.length > 0);
      checked += results.length;
      failures += bad.length;
      console.log(`${bad.length ? 'FAIL' : 'ok  '} ${tag.padEnd(22)} ${results.length - bad.length}/${results.length} pages${VERBOSE ? ` (${results.map((r) => `${r.name}${r.extra ? `: ${r.extra}` : ''}`).join('; ')})` : ''}`);
      for (const result of bad) for (const problem of result.problems) console.log(`       ${result.name}: ${problem}`);
      await context.close();
    }
  }
  await browser.close();
}
console.log(`cross-browser: ${checked - failures}/${checked} pages clean`);
process.exit(failures ? 1 : 0);
