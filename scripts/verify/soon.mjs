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
// Calibrated on 2026-09-24: Mona Sans, which the owner read as one word, measured
// 0.40; IBM Plex and Space Grotesk, which read well, 0.45.
const MIN_RELATIVE = Number(args['min-space'] ?? 0.45);

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
  // Every request the pages make: none may leave the domain (no CDN, no font service).
  const requests = [];
  await page.send('Network.enable');
  page.on('Network.requestWillBeSent', (message) => requests.push(message.params.request.url));
  await page.goto(BASE, 2500);
  for (const scheme of ['dark', 'light']) {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
    for (const locale of ['de', 'en', 'fa']) {
      await page.evaluate(`document.querySelector('[data-lang="${locale}"]').click()`);
      await sleep(300);
      const state = await page.evaluate(`(async () => {
        await document.fonts.ready;
        const root = document.documentElement;
        const inLatinContext = (el) => el.closest('bdi, script, style, [dir="ltr"]') || getComputedStyle(el).direction === 'ltr';
        return {
          lang: root.lang, dir: root.dir,
          fontsLoaded: [...document.fonts].filter((face) => face.status === 'loaded').map((face) => face.family.replace(/"/g, '')),
          heading: getComputedStyle(document.querySelector('h1')).fontFamily,
          os: (() => { const os = getComputedStyle(document.querySelector('.os')); return { size: os.fontSize, family: os.fontFamily }; })(),
          // A text node that mixes Persian letters with unwrapped Latin ones: the bidi algorithm would misplace the punctuation.
          bidiMixed: (() => {
            const bad = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              if (/[A-Za-z]/.test(node.data) && /[\\u0600-\\u06FF]/.test(node.data) && !inLatinContext(node.parentElement)) bad.push(node.data.trim().slice(0, 50));
            }
            return bad;
          })(),
          // Punctuation right after an isolated Latin term must sit on the far side of it: to its left in a right-to-left line.
          bidiPunctuation: (() => {
            const bad = [];
            for (const term of document.querySelectorAll('bdi')) {
              const next = term.nextSibling;
              if (!next || next.nodeType !== 3 || !/^[.،؛:؟!)]/.test(next.data) || getComputedStyle(term.parentElement).direction !== 'rtl') continue;
              const range = document.createRange();
              range.setStart(next, 0);
              range.setEnd(next, 1);
              const mark = range.getBoundingClientRect();
              const box = term.getBoundingClientRect();
              if (mark.top > box.bottom || mark.bottom < box.top) continue; // the mark wrapped onto another line
              if (mark.right > box.left + 1) bad.push(term.textContent + next.data.slice(0, 1));
            }
            return bad;
          })(),
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
            let min = { ratio: 9, text: '', relative: 9, relText: '' };
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
                  // A space reads as a gap only next to the letters around it: a wide
                  // face needs a wider space. Compare it with the heading's average letter.
                  // Lowercase Latin only: capitals are wide and Persian letters join.
                  // Only for real headings, and only a space between two Latin letters.
                  const latin = /[A-Za-zÄÖÜäöüß]/;
                  const between = el.matches('h1, h2, h3') && latin.test(node.data[i - 1]) && latin.test(node.data[i + 1]);
                  const lower = [...node.data].map((ch, at) => (/[a-zäöüß]/.test(ch) ? rect(at).width : null)).filter((w) => w !== null);
                  const relative = between && lower.length >= 4 ? rect(i).width / (lower.reduce((a, b) => a + b, 0) / lower.length) : 9;
                  if (ratio < min.ratio) min = { ...min, ratio: Math.round(ratio * 1000) / 1000, text: el.textContent.trim().slice(0, 40) };
                  if (relative < (min.relative ?? 9)) min = { ...min, relative: Math.round(relative * 100) / 100, relText: el.textContent.trim().slice(0, 40) };
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
      check(
        `${label}: every heading space is wide next to its letters (>= ${MIN_RELATIVE} of an average letter)`,
        state.space.relative >= MIN_RELATIVE,
        `${state.space.relative} in "${state.space.relText}"`,
      );
      check(`${label}: no line ends in a single orphaned word`, state.orphans.length === 0, state.orphans.join(' | '));
      check(`${label}: seven areas`, state.areas === 7, String(state.areas));
      const wanted = ['Martian Grotesk', 'Geist', 'Geist Mono', 'Departure Mono', 'Vazirmatn'];
      check(`${label}: the five self-hosted fonts are loaded`, wanted.every((name) => state.fontsLoaded.includes(name)), `loaded: ${state.fontsLoaded.join(', ')}`);
      check(`${label}: the headings use Martian Grotesk`, state.heading.startsWith('"Martian Grotesk"'), state.heading);
      check(`${label}: the terminal line is Departure Mono at 22 px (2x its grid)`, state.os.size === '22px' && state.os.family.startsWith('"Departure Mono"'), `${state.os.size} ${state.os.family}`);
      check(`${label}: every Latin term in Persian text is isolated in a <bdi>`, state.bidiMixed.length === 0, state.bidiMixed.join(' | '));
      check(`${label}: punctuation after a Latin term in Persian text lands on the correct side`, state.bidiPunctuation.length === 0, state.bidiPunctuation.join(' | '));
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
  // The legal pages: same look, no horizontal scroll, the same fonts, still noindex.
  const origin = new URL(BASE).origin;
  for (const legal of ['impressum', 'en/impressum', 'fa/impressum', 'datenschutz', 'en/datenschutz', 'fa/datenschutz']) {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
    await page.goto(`${origin}/${legal}/`, 1500);
    const info = await page.evaluate(`(async () => {
      await document.fonts.ready;
      return { overflow: document.documentElement.scrollWidth - innerWidth, robots: document.querySelector('meta[name=robots]')?.content,
        h1: getComputedStyle(document.querySelector('h1')).fontFamily, bg: getComputedStyle(document.body).backgroundColor,
        loaded: [...document.fonts].filter((face) => face.status === 'loaded').map((face) => face.family.replace(/"/g, '')) };
    })()`);
    check(`${viewport.name} /${legal}/: noindex, no horizontal scroll, near-black, Martian Grotesk headings`, info.robots === 'noindex,follow' && info.overflow <= 0 && info.bg === 'rgb(7, 9, 10)' && info.h1.startsWith('"Martian Grotesk"') && info.loaded.includes('Martian Grotesk'), JSON.stringify(info));
  }
  const external = [...new Set(requests.filter((url) => !url.startsWith(origin) && !url.startsWith('data:')))];
  check(`${viewport.name}: no request leaves the domain (${requests.length} requests, all to ${origin})`, external.length === 0, external.join(' | '));
  check(`${viewport.name}: no console errors`, page.errors.length === 0, page.errors.join(' | '));
  page.close();
}

const failed = results.filter((result) => !result.ok).length;
console.log(`soon.mjs ${TAG}: ${results.length - failed}/${results.length} passed${failed ? `, ${failed} FAILED` : ''}; screenshots in ${OUT}`);
process.exit(failed ? 1 : 0);
