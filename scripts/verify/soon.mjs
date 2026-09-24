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
          // Paragraphs and headings whose last line holds a single word.
          orphans: [...document.querySelectorAll('main p, main h1, main h2, main h3, .alt p')]
            // A two-word text (the name) may break into one word per line; that is no orphan.
            .filter((el) => el.textContent.trim().split(/\\s+/).length >= 3)
            .filter((el) => el.getClientRects().length && el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * 1.5)
            .filter((el) => {
              const nodes = [];
              const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
              for (let node = walker.nextNode(); node; node = walker.nextNode()) if (node.data.trim()) nodes.push(node);
              const node = nodes.at(-1);
              if (!node) return false;
              const text = node.data.replace(/\\s+$/, '');
              const cut = text.lastIndexOf(' ');
              if (cut <= 0) return false;
              const top = (from, to) => {
                const range = document.createRange();
                range.setStart(node, from);
                range.setEnd(node, to);
                return range.getClientRects()[0]?.top ?? 0;
              };
              // The last word starts a line of its own when it sits below the character before the space.
              return top(cut + 1, text.length) - top(cut - 1, cut) > 2;
            })
            .map((el) => el.textContent.trim().slice(-40)),
          // The narrowest word space in any heading, in em of its font size.
          space: (() => {
            let min = { ratio: 9, text: '' };
            for (const el of document.querySelectorAll('h1, h2, h3, .overall-label, .fa-name')) {
              const size = parseFloat(getComputedStyle(el).fontSize);
              const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
              for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                for (let i = node.data.indexOf(' '); i >= 0; i = node.data.indexOf(' ', i + 1)) {
                  const rect = (from) => {
                    const range = document.createRange();
                    range.setStart(node, from);
                    range.setEnd(node, from + 1);
                    return range.getBoundingClientRect();
                  };
                  // A space where the line wraps collapses to nothing, as it should.
                  if (i === 0 || i + 1 >= node.data.length || Math.abs(rect(i - 1).top - rect(i + 1).top) > 2) continue;
                  const ratio = rect(i).width / size;
                  if (ratio < min.ratio) min = { ratio: Math.round(ratio * 1000) / 1000, text: el.textContent.trim().slice(0, 40) };
                }
              }
            }
            return min;
          })(),
        };
      })()`);
      const label = `${viewport.name} ${scheme} ${locale}`;
      check(`${label}: lang and dir`, state.lang === locale && state.dir === (locale === 'fa' ? 'rtl' : 'ltr'), `${state.lang}/${state.dir}`);
      check(`${label}: no horizontal scroll`, state.overflow <= 0, `${state.overflow}px`);
      check(`${label}: every placeholder filled`, !state.placeholders);
      check(`${label}: the name is the h1`, state.h1 === 'Ahmadreza Taheri');
      check(`${label}: the Persian name is visible, marked fa and rtl`, state.persianName);
      check(`${label}: every heading keeps a real word space (>= 0.2 em)`, state.space.ratio >= 0.2, `${state.space.ratio} em in "${state.space.text}"`);
      check(`${label}: no line ends in a single orphaned word`, state.orphans.length === 0, state.orphans.join(' | '));
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
