// Checks the coming-soon page as built by `npm run build:soon`, served from
// soon/dist (`node scripts/verify/serve.mjs --dir soon/dist --port 3002`):
// on a wide screen and a touch phone, dark and light, in de, en and fa -
// no unfilled placeholder, no horizontal scroll, the right lang and dir, the
// name visible in both scripts, numbers in the page's language - and saves a
// full-page screenshot of each to VERIFY_OUT.
//
//   node scripts/verify/soon.mjs [--base http://localhost:3002/] [--tag soon] [--quiet]
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { launch, OUT, sleep } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const BASE = args.base ?? 'http://localhost:3002/';
const TAG = args.tag ?? 'soon';
const QUIET = Boolean(args.quiet);

const VIEWPORTS = [
  { name: 'wide', width: 1280, height: 800, touch: false },
  { name: 'phone', width: 375, height: 812, touch: true },
];
const results = [];
const check = (label, ok, detail = '') => {
  results.push({ label, ok });
  if (!ok || !QUIET) console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` - ${detail}` : ''}`);
};

for (const viewport of VIEWPORTS) {
  const page = await launch({ width: viewport.width, height: viewport.height, touch: viewport.touch, tag: `${TAG}-${viewport.name}` });
  await page.goto(BASE, 2500);
  for (const scheme of ['dark', 'light']) {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
    for (const locale of ['de', 'en', 'fa']) {
      await page.evaluate(`document.querySelector('[data-lang="${locale}"]').click()`);
      await sleep(300);
      const state = await page.evaluate(`(() => {
        const root = document.documentElement;
        return {
          lang: root.lang, dir: root.dir,
          overflow: root.scrollWidth - window.innerWidth,
          placeholders: /\\{\\{/.test(document.documentElement.outerHTML),
          h1: document.querySelector('h1').textContent,
          persianName: [...document.querySelectorAll('[lang="fa"]')].some((el) => el.textContent.includes('احمدرضا طاهری') && el.dir === 'rtl' && el.getClientRects().length > 0),
          percent: document.querySelector('.big').textContent,
          areas: document.querySelectorAll('.area').length,
          height: root.scrollHeight,
        };
      })()`);
      const label = `${viewport.name} ${scheme} ${locale}`;
      check(`${label}: lang and dir`, state.lang === locale && state.dir === (locale === 'fa' ? 'rtl' : 'ltr'), `${state.lang}/${state.dir}`);
      check(`${label}: no horizontal scroll`, state.overflow <= 0, `${state.overflow}px`);
      check(`${label}: every placeholder filled`, !state.placeholders);
      check(`${label}: the name is the h1`, state.h1 === 'Ahmadreza Taheri');
      check(`${label}: the Persian name is visible, marked fa and rtl`, state.persianName);
      check(`${label}: seven areas`, state.areas === 7, String(state.areas));
      check(
        `${label}: the overall figure is in the page's digits`,
        locale === 'fa' ? /^[۰-۹]+٪$/.test(state.percent.trim()) : /^\d+\s?%$/.test(state.percent.trim()),
        state.percent,
      );
      // A full-page picture, for the eye.
      const shot = await page.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: viewport.width, height: state.height, scale: 1 },
      });
      writeFileSync(path.join(OUT, `${TAG}-${viewport.name}-${scheme}-${locale}.png`), Buffer.from(shot.result.data, 'base64'));
    }
  }
  check(`${viewport.name}: no console errors`, page.errors.length === 0, page.errors.join(' | '));
  page.close();
}

const failed = results.filter((result) => !result.ok).length;
console.log(`soon.mjs ${TAG}: ${results.length - failed}/${results.length} passed${failed ? `, ${failed} FAILED` : ''}; screenshots in ${OUT}`);
process.exit(failed ? 1 : 0);
