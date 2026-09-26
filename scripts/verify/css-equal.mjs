// Proves that a pruned stylesheet changes nothing a visitor can see: the same
// static pages are loaded from two servers - the export as built and the export
// with prune-static-css.mjs applied - and the computed style of every element
// (and of its ::before and ::after) must be identical, in dark and light, at
// desktop and phone width, in German, English and Persian, for a first visit
// and for a returning one (queue 3b).
//
//   node scripts/verify/serve.mjs --port 3001                       (the export as built)
//   cp -r out out-pruned && node scripts/prune-static-css.mjs --dir out-pruned
//   node scripts/verify/serve.mjs --dir out-pruned --port 3003
//   node scripts/verify/css-equal.mjs [--full http://localhost:3001] [--pruned http://localhost:3003] [--only "desktop returning /about/"]
//
// The untouched export can flip a computed auto margin between two loads of the
// same page (measured while the layout settles): a page that fails once is run
// again before it is believed. `--only` runs one setup and page.
import { launch, sleep } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const FULL = args.full ?? 'http://localhost:3001';
const PRUNED = args.pruned ?? 'http://localhost:3003';
// --only "desktop returning /about/": a substring of "<setup> <path>".
const ONLY = typeof args.only === 'string' ? args.only : null;

const PAGES = ['/', '/about/', '/impressum/', '/datenschutz/', '/zzz/'];
const LOCALES = ['', '/en', '/fa'];
const SETUPS = [
  { name: 'desktop dark', width: 1440, height: 900, touch: false, scheme: 'dark', returning: false },
  { name: 'phone light', width: 390, height: 844, touch: true, scheme: 'light', returning: false },
  { name: 'desktop returning', width: 1280, height: 800, touch: false, scheme: 'dark', returning: true },
];

const SNAPSHOT = `(() => {
  const skip = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'HEAD', 'TITLE', 'NOSCRIPT', 'NEXT-ROUTE-ANNOUNCER']);
  const pathOf = (el) => { const parts = []; for (let n = el; n && n !== document.documentElement; n = n.parentElement) { const index = [...n.parentElement.children].filter((c) => c.tagName === n.tagName && !skip.has(c.tagName)).indexOf(n); parts.push(n.tagName + index); } return parts.reverse().join('>'); };
  const one = (el, pseudo) => { const cs = getComputedStyle(el, pseudo); const o = {}; for (let i = 0; i < cs.length; i++) o[cs[i]] = cs.getPropertyValue(cs[i]); return o; };
  const out = {};
  const roots = [document.documentElement, ...document.body.querySelectorAll('*')].filter((el) => !skip.has(el.tagName));
  for (const el of roots) {
    const key = el === document.documentElement ? 'html' : 'body>' + pathOf(el).replace(/^BODY0>?/, '');
    out[key] = one(el, null);
    for (const pseudo of ['::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      if (cs.content && cs.content !== 'none' && cs.content !== 'normal') out[key + pseudo] = one(el, pseudo);
    }
  }
  return JSON.stringify(out);
})()`;

const load = async (base, path, setup) => {
  const b = await launch({ width: setup.width, height: setup.height, touch: setup.touch, tag: `ceq${Math.floor(Math.random() * 1e6)}` });
  await b.goto(`${base}${path}`, 800);
  const storage = [];
  if (setup.scheme === 'light') storage.push(`localStorage.setItem('ao-scheme', 'light')`);
  if (setup.returning) storage.push(`localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: ['eniac','batch','unix','dos','macintosh','win95','cloud'], legendEras: [], hasCompletedJourney: true, mode: 'interactive' }, version: 2 }))`);
  if (storage.length) await b.evaluate(`${storage.join(';')}; true`);
  await b.goto(`${base}${path}`, 2500);
  // Finished transitions only: the colours the page settles on.
  await b.evaluate(`document.getAnimations().forEach((a) => { try { a.finish(); } catch {} }); true`);
  await sleep(300);
  const snapshot = JSON.parse(await b.evaluate(SNAPSHOT));
  // The words too: a page that lost or changed a string would still have the same styles.
  const text = await b.evaluate(`document.body.innerText + '|' + document.title + '|' + [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') + '>' + (a.getAttribute('hreflang') || '') + (a.getAttribute('lang') || '')).join(',')`);
  const sheets = await b.evaluate(`[...document.styleSheets].map((s) => (s.href || 'inline').split('/').pop()).join(',')`);
  const errors = b.errors.slice(0, 2);
  b.close();
  await sleep(600);
  return { snapshot, sheets, errors, text };
};

let failed = 0;
let checked = 0;
for (const setup of SETUPS) {
  for (const locale of LOCALES) {
    for (const page of PAGES) {
      if (page === '/zzz/' && locale) continue;
      const path = `${locale}${page}`;
      if (ONLY && !`${setup.name} ${path}`.includes(ONLY)) continue;
      const a = await load(FULL, path, setup);
      const control = await load(FULL, path, setup);
      const b = await load(PRUNED, path, setup);
      checked += 1;
      // What the untouched export does by itself (an animation caught at another
      // moment) is not a difference the pruning made.
      const noisy = new Set();
      for (const key of new Set([...Object.keys(a.snapshot), ...Object.keys(control.snapshot)])) {
        for (const prop of new Set([...Object.keys(a.snapshot[key] ?? {}), ...Object.keys(control.snapshot[key] ?? {})])) {
          if ((a.snapshot[key] ?? {})[prop] !== (control.snapshot[key] ?? {})[prop]) noisy.add(key + '|' + prop);
        }
      }
      const diffs = [];
      for (const key of new Set([...Object.keys(a.snapshot), ...Object.keys(b.snapshot)])) {
        const x = a.snapshot[key];
        const y = b.snapshot[key];
        if (!x || !y) { diffs.push(key + ' (only in ' + (x ? 'full' : 'pruned') + ')'); continue; }
        for (const prop of new Set([...Object.keys(x), ...Object.keys(y)])) {
          if (x[prop] !== y[prop] && !noisy.has(key + '|' + prop)) diffs.push(key + ' ' + prop + ': ' + String(x[prop]).slice(0, 30) + ' vs ' + String(y[prop]).slice(0, 30));
        }
      }
      if (a.text !== b.text) diffs.push('TEXT or links differ: ' + [...a.text].findIndex((c, i) => c !== b.text[i]) + ' ' + JSON.stringify(a.text.slice(0, 0)));
      const ok = diffs.length === 0 && b.errors.length === 0;
      if (!ok) failed += 1;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${setup.name.padEnd(18)} ${path.padEnd(16)} ${Object.keys(a.snapshot).length} nodes (${noisy.size} noisy props), sheets ${b.sheets}${ok ? '' : ` | ${diffs.length} differ: ${diffs.slice(0, 6).join(' ; ')} ${b.errors.join(' ')}`}`);
    }
  }
}
console.log(`css-equal: ${checked - failed}/${checked} pages identical`);
process.exit(failed ? 1 : 0);
