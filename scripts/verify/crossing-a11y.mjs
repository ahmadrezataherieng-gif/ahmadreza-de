// axe-core over the crossing cards at rest (BR-10).
//
//   node scripts/verify/crossing-a11y.mjs [--locale de|en|fa] [--width 390] [--reduce] [--quiet] [--base URL]
//
// a11y.mjs audits every view where it opens, and the cards are hidden there.
// This scrolls each crossing to the moment each card is at rest (its own
// progress 0.5: the point the still version shows too) and runs axe on the page
// with the card in view: WCAG 2.2 A and AA on the card layer
// only (the eras around it are audited by a11y.mjs; mid-fade they read as low
// contrast to axe). Colour contrast of the cards cannot be settled by axe under
// their 3D transform (it reports them as needing review); it holds by
// construction, because a card only sets text, muted and accent tokens on the
// surface token, and contrast.test.mjs checks those pairs in every theme.
// With --reduce
// the still row is audited once per crossing instead.
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
const WIDTH = Number(args.width ?? 390);
const HEIGHT = Number(args.height ?? (WIDTH < 768 ? 844 : 800));
const LOCALE = args.locale ?? 'de';
const REDUCE = Boolean(args.reduce);
const QUIET = Boolean(args.quiet);
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const AXE = readFileSync(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const TECH_FROM = 0.24;
const TECH_TO = 0.74;

let passed = 0;
let failed = 0;
const check = (name, ok, detail) => {
  if (ok) passed += 1;
  else failed += 1;
  if (QUIET && ok) return;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail === undefined ? '' : ` :: ${JSON.stringify(detail)}`}`);
};

const b = await launch({ width: WIDTH, height: HEIGHT, touch: WIDTH < 768, reduce: REDUCE, tag: `crossing-a11y-${WIDTH}-${LOCALE}` });
await b.goto(`${BASE}${PREFIX}/amonel/?tier=light`, 2000);
await b.evaluate(
  `localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: ['eniac','batch','unix','dos','macintosh','win95','cloud'], legendEras: [], hasCompletedJourney: false, mode: 'interactive' }, version: 2 })); true`,
);
await b.goto(`${BASE}${PREFIX}/amonel/?tier=light`, 9000);

async function audit(context) {
  if (!(await b.evaluate(`typeof window.axe !== 'undefined'`))) await b.evaluate(`${AXE}; true`);
  return b.evaluate(`(async () => {
    const result = await axe.run(${JSON.stringify(context)}, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
    return result.violations.map((v) => v.id + ' (' + v.nodes.length + '): ' + v.nodes.slice(0, 2).map((n) => n.target.join(' ') + ' ' + (n.any[0]?.message ?? '')).join(' | '));
  })()`);
}

const crossings = await b.evaluate(`(() => [...document.querySelectorAll('#journey-scenes > section[data-era-index]')]
  .filter((s) => s.querySelector('[data-shots]'))
  .map((s) => ({ id: s.id, shots: Number(s.querySelector('[data-shots]').dataset.shots) })))()`);

for (const { id, shots } of crossings) {
  const points = REDUCE ? [null] : Array.from({ length: shots }, (_, i) => TECH_FROM + ((i + 0.5) * (TECH_TO - TECH_FROM)) / shots);
  for (const [index, p] of points.entries()) {
    await b.evaluate(`(() => {
      const s = document.getElementById('${id}');
      const band = s.querySelector('[data-bridge-band]');
      const panel = band.querySelector('.ao-bridge-panel');
      const top = s.getBoundingClientRect().top + scrollY;
      if (${REDUCE}) { band.scrollIntoView({ block: 'center' }); return true; }
      const inFlow = getComputedStyle(band).position === 'relative';
      const from = inFlow ? band.getBoundingClientRect().top + scrollY : top;
      const travel = inFlow
        ? Math.max(1, band.offsetHeight - panel.offsetHeight)
        : Math.max(1, s.querySelector('[data-mark="visual"]').getBoundingClientRect().top + scrollY - top);
      window.scrollTo(0, Math.round(from + travel * ${p}));
      return true;
    })()`);
    await sleep(900);
    const shown = REDUCE
      ? await b.evaluate(`document.querySelectorAll('#${id} .ao-shot').length`)
      : await b.evaluate(`(() => { const c = [...document.querySelectorAll('#${id} .ao-shot')].filter((e) => getComputedStyle(e).display !== 'none'); return c.length; })()`);
    check(`${id} card ${index + 1}: on screen`, shown > 0, shown);
    const violations = await audit(`#${id} .ao-bridge-tech`);
    check(`${id} card ${index + 1}: axe clean`, violations.length === 0, violations);
  }
}
console.log(`crossing-a11y-${WIDTH}-${LOCALE}${REDUCE ? '-reduce' : ''}: ${passed}/${passed + failed} passed`);
b.close();
process.exit(failed ? 1 : 0);
