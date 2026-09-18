// Record a Chrome performance trace of a stretch of the journey and total up
// where the renderer spent its time: script, style, layout, paint, raster,
// compositing. The raw trace is saved too, for chrome://tracing or DevTools.
//
//   node scripts/verify/trace.mjs [--width 1280] [--tier full] [--cpu 1]
//        [--from era-3] [--screens 6] [--mode watch|open] [--invalidations]
//
// Like perf.mjs, it drives the scroll with real wheel or touch input.
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { launch, sleep, OUT } from './cdp.mjs';

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
const TIER = args.tier === 'light' ? 'light' : 'full';
const CPU = Number(args.cpu ?? 1);
const FROM = args.from ?? 'era-3';
const SCREENS = Number(args.screens ?? 6);
const MODE = args.mode === 'open' ? 'open' : 'watch';
const BASE = args.base ?? 'http://localhost:3001';
const TAG = `trace-${WIDTH}-${TIER}-cpu${CPU}-${FROM}`;

const b = await launch({ width: WIDTH, height: HEIGHT, touch: WIDTH < 768, tag: TAG });
await b.goto(`${BASE}/journey/?tier=${TIER}`, 2000);
const passed = MODE === 'open' ? "['eniac','batch','unix','dos','macintosh','win95','cloud']" : '[]';
await b.evaluate(
  `localStorage.setItem('ahmados.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: ${passed}, legendEras: [], hasCompletedJourney: false, mode: '${MODE === 'open' ? 'interactive' : 'guided'}' }, version: 2 })); true`,
);
await b.goto(`${BASE}/journey/?tier=${TIER}`, 8000);

// Start just before the crossing into FROM.
await b.evaluate(`(() => {
  const s = document.getElementById('${FROM}');
  window.scrollTo(0, Math.max(0, Math.round(s.getBoundingClientRect().top + scrollY - innerHeight)));
  return true;
})()`);
await sleep(2000);
if (CPU > 1) await b.send('Emulation.setCPUThrottlingRate', { rate: CPU });

const events = [];
const done = new Promise((resolve) => {
  b.on('Tracing.dataCollected', (msg) => events.push(...msg.params.value));
  b.on('Tracing.tracingComplete', resolve);
});
await b.send('Tracing.start', {
  transferMode: 'ReportEvents',
  traceConfig: {
    includedCategories: [
      'devtools.timeline',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-devtools.timeline.frame',
      'blink.user_timing',
      'v8.execute',
      'cc',
      'gpu',
      ...(args.invalidations ? ['disabled-by-default-devtools.timeline.invalidationTracking'] : []),
    ],
  },
});
for (let i = 0; i < SCREENS; i++) {
  await b.swipe(Math.round(HEIGHT * 0.8));
  await sleep(120);
}
await sleep(800);
await b.send('Tracing.end');
await done;
writeFileSync(path.join(OUT, `${TAG}.json`), JSON.stringify({ traceEvents: events }));

// Complete events (ph X) carry a duration; B/E pairs are rare in these
// categories and skipped. Totals per name, per thread.
const threads = new Map();
for (const e of events) {
  if (e.ph === 'M' && e.name === 'thread_name') threads.set(`${e.pid}:${e.tid}`, e.args.name);
}
const WATCH = [
  'RunTask', 'FunctionCall', 'EvaluateScript', 'FireAnimationFrame', 'EventDispatch', 'TimerFire',
  'UpdateLayoutTree', 'RecalculateStyles', 'Layout', 'PrePaint', 'Paint', 'PaintImage',
  'Layerize', 'UpdateLayer', 'Commit', 'RasterTask', 'ImageDecodeTask', 'GPUTask', 'CompositeLayers',
  'ScrollLayer', 'HitTest',
];
const totals = {};
for (const e of events) {
  if (e.ph !== 'X' || !WATCH.includes(e.name)) continue;
  const thread = threads.get(`${e.pid}:${e.tid}`) ?? 'other';
  const key = `${thread} ${e.name}`;
  totals[key] = (totals[key] ?? 0) + (e.dur ?? 0) / 1000;
}
console.log(TAG, `${events.length} events, dropped-frame events: ${events.filter((e) => e.name === 'DroppedFrame').length}`);
for (const [k, ms] of Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 22)) {
  console.log(`${Math.round(ms).toString().padStart(6)} ms  ${k}`);
}
// With --invalidations: what made styles dirty, by reason and element.
if (args.invalidations) {
  const why = {};
  for (const e of events) {
    if (!/InvalidationTracking/.test(e.name)) continue;
    const d = e.args?.data ?? {};
    const key = `${e.name.replace('InvalidationTracking', '')} ${d.reason ?? d.invalidatedSelectorId ?? ''} ${d.nodeName ?? ''} ${(d.changedAttribute ?? d.changedClass ?? d.changedPseudo ?? '')}`.trim();
    why[key] = (why[key] ?? 0) + 1;
  }
  console.log('invalidations:');
  for (const [k, n] of Object.entries(why).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`${String(n).padStart(6)}  ${k}`);
}
console.log('trace saved:', path.join(OUT, `${TAG}.json`));
b.close();
