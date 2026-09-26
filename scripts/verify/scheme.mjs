// The sun/moon toggle of the site's own pages (DECISIONS 74, queue 5c).
//
//   node scripts/verify/serve.mjs --port 3001
//   node scripts/verify/scheme.mjs [--base URL] [--quiet]
//
// The promise: dark on a first visit whatever the operating system prefers, no
// `ao-scheme` key in the browser until the visitor clicks the toggle, the key
// set by the click (and only then), the choice kept across a reload without a
// flash, and never a cookie. Checked on the landing page, About, Impressum,
// Datenschutz and the 404 page in German and Persian, with the OS set to light.
import { launch, sleep } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const BASE = String(args.base ?? 'http://localhost:3001');
const QUIET = Boolean(args.quiet);

const PAGES = ['/', '/about/', '/impressum/', '/datenschutz/', '/zzz/', '/fa/', '/fa/about/', '/fa/impressum/'];
const log = [];
const check = (label, ok, detail) => {
  log.push({ label, ok });
  if (!QUIET || !ok) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail !== undefined && !ok ? ` :: ${JSON.stringify(detail)}` : ''}`);
};

const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map((value) => Number(value) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

for (const [index, path] of PAGES.entries()) {
  const b = await launch({ width: 1280, height: 800, tag: `scheme${index}` });
  // The operating system asks for light: the site must not follow it.
  await b.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-color-scheme', value: 'light' },
      { name: 'prefers-reduced-motion', value: 'no-preference' },
    ],
  });
  const state = () =>
    b.evaluate(`(() => ({
      scheme: document.documentElement.dataset.scheme ?? null,
      key: localStorage.getItem('ao-scheme'),
      keys: Object.keys(localStorage).filter((name) => name.startsWith('ao-')),
      background: getComputedStyle(document.body).backgroundColor,
      canvas: getComputedStyle(document.documentElement).backgroundColor,
      cookie: document.cookie,
      pressed: document.querySelector('button[aria-label][title]')?.getAttribute('aria-label') ?? null,
    }))()`);

  await b.goto(`${BASE}${path}`, 2500);
  const first = await state();
  const tag = path.padEnd(14);
  check(`${tag} a first visit is dark, the OS asking for light or not`, first.scheme === null && luminance(first.background) < 0.3, first);
  check(`${tag} a first visit writes no ao-scheme key`, first.key === null && first.keys.length === 0, first.keys);

  const button = await b.evaluate(`(() => { const e = [...document.querySelectorAll('button')].find((x) => x.querySelector('svg') && /light|dark|hell|dunkel|روشن|تیره/i.test(x.getAttribute('aria-label') ?? '')); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  check(`${tag} the toggle is there`, button !== null);
  if (!button) {
    b.close();
    continue;
  }
  await b.click(button.x, button.y);
  await sleep(500);
  const light = await state();
  check(`${tag} the click makes the page light and sets the key`, light.scheme === 'light' && light.key === 'light' && luminance(light.background) > 0.6, light);
  check(`${tag} the key is the only one`, light.keys.length === 1, light.keys);
  check(`${tag} no cookie`, light.cookie === '', light.cookie);

  await b.reload(2500);
  const kept = await state();
  check(`${tag} the choice survives a reload, set before the page painted`, kept.scheme === 'light' && luminance(kept.background) > 0.6, kept);

  await b.click(button.x, button.y);
  await sleep(500);
  const dark = await state();
  check(`${tag} the second click is dark again, and remembered`, dark.scheme === null && dark.key === 'dark' && luminance(dark.background) < 0.3, dark);
  await b.reload(2500);
  const stillDark = await state();
  check(`${tag} dark survives a reload`, stillDark.scheme === null && luminance(stillDark.background) < 0.3, stillDark);
  b.close();
  await sleep(600);
}

// The journey and the desktop have no toggle and must not write the key.
for (const [index, path] of ['/amonel/', '/desktop/', '/fa/desktop/'].entries()) {
  const b = await launch({ width: 1280, height: 800, tag: `schemeapp${index}` });
  await b.goto(`${BASE}${path}`, 3500);
  const keys = await b.evaluate(`Object.keys(localStorage).filter((name) => name === 'ao-scheme')`);
  check(`${path.padEnd(14)} visiting writes no ao-scheme key`, keys.length === 0, keys);
  b.close();
  await sleep(600);
}

const passed = log.filter((entry) => entry.ok).length;
console.log(`${QUIET ? '' : '\n'}scheme: ${passed}/${log.length} passed`);
process.exit(passed === log.length ? 0 : 1);
