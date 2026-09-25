// Where the main thread goes while a view loads (PERF-02, the journey's TBT).
//
//   node scripts/verify/load-tasks.mjs [--path /amonel/] [--width 380] [--cpu 4] [--slow]
//
// Same conditions as vitals.mjs's phone profile (touch, 4x CPU, slow 4G with
// --slow, cache off). Prints every long task after FCP with its start time,
// the long animation frames with their script attribution, and a CPU profile
// summed by function (self time) and by script file, so the biggest blocker is
// named rather than guessed.
import { launch, sleep } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const WIDTH = Number(args.width ?? 380);
const HEIGHT = Number(args.height ?? 800);
const CPU = Number(args.cpu ?? 4);
const PATH = args.path ?? '/amonel/';
const BASE = args.base ?? 'http://localhost:3001';
const SLOW = Boolean(args.slow);
const TOUCH = Boolean(args.touch) || WIDTH < 768;

const b = await launch({ width: WIDTH, height: HEIGHT, touch: TOUCH, tag: `load-${WIDTH}-${CPU}` });
await b.send('Network.enable');
await b.send('Network.setCacheDisabled', { cacheDisabled: true });
if (SLOW) {
  await b.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
  });
}
if (CPU > 1) await b.send('Emulation.setCPUThrottlingRate', { rate: CPU });
await b.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `(() => {
    window.__t = { fcp: null, longTasks: [], loafs: [] };
    new PerformanceObserver((list) => { for (const e of list.getEntries()) if (e.name === 'first-contentful-paint') window.__t.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__t.longTasks.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true });
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__t.loafs.push({
          at: Math.round(e.startTime), duration: Math.round(e.duration), blocking: Math.round(e.blockingDuration || 0),
          style: Math.round(e.startTime + e.duration - (e.styleAndLayoutStart || e.startTime + e.duration)),
          scripts: e.scripts.map((s) => Math.round(s.duration) + 'ms ' + s.invokerType + ' ' + String(s.sourceURL).split('/').pop() + ':' + (s.sourceFunctionName || '(anon)')),
        });
      }).observe({ type: 'long-animation-frame', buffered: true });
    } catch {}
  })();`,
});
await b.send('Profiler.enable');
await b.send('Profiler.setSamplingInterval', { interval: 500 });
await b.send('Profiler.start');
await b.goto(`${BASE}${PATH}`, CPU > 1 ? 7000 : 3500);
await b.evaluate('window.scrollBy(0, innerHeight * 0.8); true');
await sleep(1500);
const { result: { profile } } = await b.send('Profiler.stop');
const t = await b.evaluate('window.__t');

const after = t.longTasks.filter(([start]) => t.fcp === null || start >= t.fcp);
const tbt = after.reduce((sum, [, d]) => sum + Math.max(0, d - 50), 0);
console.log(`FCP ${Math.round(t.fcp)} ms; long tasks after FCP: ${after.length}, TBT ${tbt} ms`);
for (const [start, d] of after) console.log(`  task at ${start} ms, ${d} ms`);
console.log('long animation frames:');
for (const l of t.loafs.filter((x) => x.blocking > 0 || x.duration > 80).slice(0, 12)) {
  console.log(`  at ${l.at} ms: ${l.duration} ms (blocking ${l.blocking}, style+layout ${l.style})`, l.scripts.slice(0, 4).join(' | '));
}

const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const interval = (profile.endTime - profile.startTime) / Math.max(1, profile.samples.length) / 1000;
const byFunction = new Map();
const byFile = new Map();
for (const id of profile.samples) {
  const frame = byId.get(id)?.callFrame;
  if (!frame) continue;
  const file = String(frame.url).split('/').pop() || '(native)';
  const key = `${frame.functionName || '(anonymous)'} ${file}:${frame.lineNumber}:${frame.columnNumber}`;
  byFunction.set(key, (byFunction.get(key) ?? 0) + interval);
  byFile.set(file, (byFile.get(file) ?? 0) + interval);
}
console.log('CPU by file (self ms, whole load):');
for (const [k, v] of [...byFile].sort((a, c) => c[1] - a[1]).slice(0, 10)) console.log(`  ${v.toFixed(0).padStart(6)}  ${k}`);
console.log('CPU by function (self ms):');
for (const [k, v] of [...byFunction].sort((a, c) => c[1] - a[1]).slice(0, 16)) console.log(`  ${v.toFixed(0).padStart(6)}  ${k}`);
console.log(b.errors.length ? `console errors: ${b.errors.join(' | ')}` : 'console errors: none');
b.close();
