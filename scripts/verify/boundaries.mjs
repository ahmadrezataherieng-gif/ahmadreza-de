// Walk every crossing between eras and look at it.
//
//   node scripts/verify/boundaries.mjs [--width 1280] [--height 800]
//        [--locale de|en|fa] [--tier full|light] [--steps 5] [--base URL]
//
// At each sampled point it captures a screenshot and checks that the frame has
// real content: no blank background, no gap where neither era is on screen.
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { launch, sleep, OUT } from './cdp.mjs';
import { frameStats } from './png.mjs';

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
const TIER = args.tier === 'light' ? 'light' : 'full';
const STEPS = Number(args.steps ?? 5);
const BASE = args.base ?? 'http://localhost:3001';
const TAG = args.tag ?? `boundary-${WIDTH}-${LOCALE}-${TIER}${args.reduce ? '-rm' : ''}`;
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const SECTIONS = ['era-2', 'era-3', 'era-4', 'era-5', 'era-6', 'era-7', 'convergence'];

// A frame is blank when it is one flat fill and nothing is on it. A legitimate
// era frame can be very flat - the 1995 teal desktop with one small dialog on it
// is mostly a single colour - so the thresholds only catch an empty screen, and
// the real "no gap" rule is checked on the elements themselves: at every scroll
// position either the era's scene or the crossing's art must be visible.
const MIN_DEVIATION = 1.5;
const MIN_COLOURS = 3;

const REDUCE = args.reduce === true;
// --quiet: failures in full, one summary line.
const QUIET = Boolean(args.quiet);
const b = await launch({ width: WIDTH, height: HEIGHT, touch: WIDTH < 768, reduce: REDUCE, tag: TAG });
const results = [];
let failures = 0;

// Watch mode, so no gate stands in the way of the crossings.
await b.goto(`${BASE}${PREFIX}/amonel/?tier=${TIER}`, 2000);
await b.evaluate(
  `localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: [], legendEras: [], hasCompletedJourney: false, mode: 'guided' }, version: 2 })); true`,
);
await b.goto(`${BASE}${PREFIX}/amonel/?tier=${TIER}`, 9000);
if (!QUIET) console.log('tier', await b.evaluate('document.documentElement.dataset.tier'));

/** Document y at which the crossing into `id` stands at progress `p`. */
const boundaryY = (id, p) =>
  b.evaluate(`(() => {
    const section = document.getElementById('${id}');
    const band = section.querySelector('[data-bridge-band]');
    const mark = section.querySelector('[data-mark="visual"]');
    const top = section.getBoundingClientRect().top + scrollY;
    const inFlow = band && getComputedStyle(band).position !== 'absolute';
    if (inFlow) {
      const bandTop = band.getBoundingClientRect().top + scrollY;
      const panel = band.querySelector('.ao-bridge-panel');
      const travel = band.offsetHeight - (panel ? panel.offsetHeight : innerHeight);
      return Math.round(bandTop + travel * ${p});
    }
    const markTop = mark.getBoundingClientRect().top + scrollY;
    return Math.round(top + (markTop - top) * ${p});
  })()`);

for (const id of SECTIONS) {
  for (let step = 0; step <= STEPS; step++) {
    const p = step / STEPS;
    const y = await boundaryY(id, p);
    await b.evaluate(`window.scrollTo(0, ${y}); true`);
    await sleep(900);
    await b.evaluate(`window.scrollTo(0, ${y}); true`);
    await sleep(700);

    const name = `${TAG}-${id}-${String(Math.round(p * 100)).padStart(3, '0')}`;
    const shot = await b.send('Page.captureScreenshot', { format: 'png' });
    const png = Buffer.from(shot.result.data, 'base64');
    writeFileSync(path.join(OUT, `${name}.png`), png);
    const stats = frameStats(png);
    const state = await b.evaluate(`(() => {
      const section = document.getElementById('${id}');
      // The crossing's progress is written onto the bridge (DECISIONS.md 48).
      const band = section.querySelector('[data-bridge-band]');
      const scene = section.querySelector('[data-era-scene]');
      const bridge = section.querySelector('.ao-bridge-art');
      // At the very start of a crossing the era being left is still the whole
      // picture, so coverage has to count it too.
      const before = section.previousElementSibling;
      const prev = before && before.querySelector('[data-era-scene], .ao-conv-scene');
      return {
        bIn: band ? Number(getComputedStyle(band).getPropertyValue('--boundary-in')) : 1,
        theme: document.documentElement.dataset.theme,
        scene: scene ? Number(getComputedStyle(scene).opacity) : null,
        art: bridge ? Number(getComputedStyle(bridge).opacity) : null,
        prev: prev ? Number(getComputedStyle(prev).opacity) : null,
      };
    })()`);

    // Either era must be on screen: never a gap between the two.
    const covered =
      (state.scene ?? 0) > 0.01 || (state.art ?? 0) > 0.01 || (state.prev ?? 0) > 0.01;
    const ok = covered && stats.deviation >= MIN_DEVIATION && stats.colours >= MIN_COLOURS;
    if (!ok) failures += 1;
    results.push({ id, p, ...state, colours: stats.colours, deviation: Math.round(stats.deviation) });
    if (!QUIET || !ok) console.log(
      `${ok ? 'PASS' : 'FAIL'} ${id} @${p.toFixed(2)} bIn=${state.bIn.toFixed(2)} theme=${state.theme} ` +
        `scene=${state.scene?.toFixed(2)} art=${state.art?.toFixed(2)} colours=${stats.colours} dev=${Math.round(stats.deviation)}`,
    );
  }
}

// The theme must hand over in the middle of each crossing, not at its edges:
// one step before the midpoint it is still the old era, one step after the new.
if (!QUIET) console.log('');
for (const id of SECTIONS) {
  const mid = await boundaryY(id, 0.5);
  const themes = [];
  for (const delta of [-6, 6]) {
    await b.evaluate(`window.scrollTo(0, ${mid + delta}); true`);
    await sleep(420);
    themes.push(await b.evaluate('document.documentElement.dataset.theme'));
  }
  const handover = themes[0] !== themes[1];
  if (!handover) failures += 1;
  if (!QUIET || !handover) console.log(`${handover ? 'PASS' : 'FAIL'} ${id} handover ${themes[0]} -> ${themes[1]}`);
}
// Once a crossing is over it must be gone - lifted where it is an overlay,
// scrolled away where it is a band - or it covers the era it led into.
if (!QUIET) console.log('');
for (const id of SECTIONS) {
  const cleared = await b.evaluate(`(() => {
    const section = document.getElementById('${id}');
    const mark = section.querySelector('[data-mark="visual"]');
    window.scrollTo(0, Math.round(mark.getBoundingClientRect().top + scrollY + innerHeight * 0.3));
    return true;
  })()`);
  await sleep(900);
  const state = await b.evaluate(`(() => {
    const veil = document.getElementById('${id}').querySelector('.ao-bridge-veil--to');
    if (!veil || veil.getClientRects().length === 0) return { gone: true, why: 'hidden' };
    const rect = veil.getBoundingClientRect();
    const opacity = Number(getComputedStyle(veil).opacity);
    return { gone: opacity < 0.01 || rect.bottom <= 0, opacity, bottom: Math.round(rect.bottom) };
  })()`);
  if (!cleared || !state.gone) failures += 1;
  if (!QUIET || !state.gone) console.log(`${state.gone ? 'PASS' : 'FAIL'} ${id} crossing cleared ${JSON.stringify(state)}`);
}
if (QUIET) {
  const total = results.length + SECTIONS.length * 2;
  console.log(`${TAG}: ${total - failures}/${total} passed (frames, hand-overs, crossings), console errors: ${b.errors.length ? JSON.stringify(b.errors.slice(0, 3)) : 'none'}`);
} else {
  console.log(`${TAG}: ${results.length - failures}/${results.length} frames have content`);
  console.log('console errors:', b.errors.length ? b.errors.slice(0, 3) : 'none');
}
b.close();
process.exit(failures || b.errors.length ? 1 : 0);
