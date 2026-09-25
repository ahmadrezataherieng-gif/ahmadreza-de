// A phone's toolbar shows and hides while the visitor scrolls, and the layout
// viewport's height changes by its height each time (PERF-02). The journey's
// pinned and scene heights must not follow it: every move would relayout and
// re-measure the whole page.
//
//   node scripts/verify/toolbar.mjs [--width 390] [--height 844] [--delta 64]
//        [--moves 6] [--at 0.45] [--tablet] [--base URL] [--locale de]
//
// The page is scrolled to a point inside the journey (a fraction of the page),
// then the viewport height is changed by `delta` back and forth, exactly what
// Emulation.setDeviceMetricsOverride does for the toolbar of a real phone.
// Counted between the first and the last move: layouts, style recalculations,
// long tasks; and what should not move: the document height and the scroll
// position. Exits 1 when the layout count or the document height change beyond
// the limits below.
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
const HEIGHT = Number(args.height ?? 844);
const DELTA = Number(args.delta ?? 64);
const MOVES = Number(args.moves ?? 6);
const AT = Number(args.at ?? 0.45);
const LOCALE = args.locale ?? 'de';
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
// Toolbar moves happen on touch devices only; a desktop window that changes
// height is a real resize and is followed on purpose.
const b = await launch({ width: WIDTH, height: HEIGHT, touch: true, tag: `toolbar-${WIDTH}-${HEIGHT}` });

const seed = `localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: ['eniac','batch','unix','dos','macintosh','win95','cloud'], legendEras: [], hasCompletedJourney: false, mode: 'interactive' }, version: 2 })); true`;
await b.goto(`${BASE}${PREFIX}/amonel/?tier=light`, 2000);
await b.evaluate(seed);
await b.goto(`${BASE}${PREFIX}/amonel/?tier=light`, 8000);

// Into the journey, by real swipes: past the first crossings, inside a pinned
// or flowing era, wherever AT lands.
const target = await b.evaluate(`Math.round((document.documentElement.scrollHeight - innerHeight) * ${AT})`);
let guard = 0;
while ((await b.evaluate('scrollY')) < target && guard++ < 200) {
  await b.swipe(Math.round(HEIGHT * 0.7));
  await sleep(80);
}
await sleep(1200);

await b.send('Performance.enable');
await b.evaluate(`(() => {
  window.__tb = { longTasks: [], ro: 0 };
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__tb.longTasks.push(Math.round(entry.duration));
    }).observe({ entryTypes: ['longtask'] });
  } catch {}
  return true;
})()`);

const metrics = async () => {
  const { result } = await b.send('Performance.getMetrics');
  return Object.fromEntries(result.metrics.map((m) => [m.name, m.value]));
};
const state = () =>
  b.evaluate(`(() => ({
    scrollY: Math.round(scrollY),
    docHeight: document.documentElement.scrollHeight,
    stage: (() => { const s = document.querySelector('[data-era-stage], .ao-conv-stage'); return s ? Math.round(s.getBoundingClientRect().height) : 0; })(),
    era: document.documentElement.getAttribute('data-theme') || '',
  }))()`);

await sleep(500);
const before = await state();
const m0 = await metrics();

let low = null;
for (let i = 0; i < MOVES; i++) {
  const height = i % 2 === 0 ? HEIGHT - DELTA : HEIGHT;
  await b.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height, deviceScaleFactor: 1, mobile: true });
  await sleep(350);
  if (i === 0) low = await state();
}
await sleep(600);

const m1 = await metrics();
const after = await state();
const longTasks = await b.evaluate('window.__tb.longTasks');
const delta = (key) => Math.round((m1[key] ?? 0) - (m0[key] ?? 0));
const summary = {
  viewport: `${WIDTH}x${HEIGHT}, -${DELTA} px, ${MOVES} moves`,
  layouts: delta('LayoutCount'),
  styleRecalcs: delta('RecalcStyleCount'),
  layoutMs: Math.round(((m1.LayoutDuration ?? 0) - (m0.LayoutDuration ?? 0)) * 1000),
  styleMs: Math.round(((m1.RecalcStyleDuration ?? 0) - (m0.RecalcStyleDuration ?? 0)) * 1000),
  scriptMs: Math.round(((m1.ScriptDuration ?? 0) - (m0.ScriptDuration ?? 0)) * 1000),
  longTasks: longTasks.length,
  worstLongTaskMs: longTasks.length ? Math.max(...longTasks) : 0,
  docHeight: `${before.docHeight} -> ${low.docHeight} (toolbar shown) -> ${after.docHeight}`,
  stageHeight: `${before.stage} -> ${low.stage} -> ${after.stage}`,
  scrollY: `${before.scrollY} -> ${low.scrollY} -> ${after.scrollY}`,
};
console.log(JSON.stringify(summary, null, 2));
if (b.errors.length) console.log('console errors:', b.errors);

// Limits: the toolbar may cost a handful of layouts (the visual viewport, the
// fixed chrome), never a relayout of the journey per move, and the pages must
// not change height or scroll position.
const problems = [];
if (before.docHeight !== low.docHeight || before.docHeight !== after.docHeight) problems.push('document height changed');
if (Math.abs(before.scrollY - low.scrollY) > 2 || Math.abs(before.scrollY - after.scrollY) > 2) problems.push('scroll position moved');
if (delta('LayoutCount') > MOVES * 3) problems.push(`layout count ${delta('LayoutCount')} > ${MOVES * 3}`);
if (longTasks.length > 0) problems.push(`${longTasks.length} long tasks`);
console.log(problems.length ? `FAIL: ${problems.join('; ')}` : 'ok: the toolbar moves cost no journey relayout');
b.close();
process.exit(problems.length ? 1 : 0);
