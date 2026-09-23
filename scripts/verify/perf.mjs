// Scroll the whole journey and measure how it holds up.
//
//   node scripts/verify/perf.mjs [--width 1280] [--height 800]
//        [--tier full|light] [--cpu 4] [--locale de] [--base URL]
//
// Frames are counted in the page with requestAnimationFrame, and long tasks
// come from a PerformanceObserver, both while a real input gesture drives the
// scroll - so what is measured is the same path a visitor's finger or wheel
// takes, through Lenis, the resolver and the CSS the crossings are built from.
//
// Headless Chrome with --disable-gpu composites on the CPU, so these numbers
// are a floor, not a phone's real frame rate.
import { launch, sleep } from './cdp.mjs';

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
const CPU = Number(args.cpu ?? 1);
// --quiet: one line of the numbers that matter.
const QUIET = Boolean(args.quiet);
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
// --mode watch (default): guided puzzles play as the page scrolls. --mode open:
// every era already passed in Play, so no gate stops the scroll and no guided
// playback renders - the crossings and eras alone.
const MODE = args.mode === 'open' ? 'open' : 'watch';
const TAG = `perf-${WIDTH}-${TIER}-cpu${CPU}-${MODE}${process.env.VERIFY_GPU ? '-gpu' : ''}`;

const b = await launch({ width: WIDTH, height: HEIGHT, touch: WIDTH < 768, tag: TAG });

// Watch mode: no gate stands in the way of a full scroll.
await b.goto(`${BASE}${PREFIX}/amonel/?tier=${TIER}`, 2000);
await b.evaluate(
  `localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: ${MODE === 'open' ? "['eniac','batch','unix','dos','macintosh','win95','cloud']" : '[]'}, legendEras: [], hasCompletedJourney: false, mode: '${MODE === 'open' ? 'interactive' : 'guided'}' }, version: 2 })); true`,
);
await b.goto(`${BASE}${PREFIX}/amonel/?tier=${TIER}`, 9000);

if (CPU > 1) await b.send('Emulation.setCPUThrottlingRate', { rate: CPU });
await sleep(1500);

// The recorder: frame timestamps and long tasks, collected in the page.
await b.evaluate(`(() => {
  window.__perf = { frames: [], longTasks: [], loafs: [], running: true };
  window.__perf.ys = [];
  const tick = (t) => {
    if (!window.__perf.running) return;
    window.__perf.frames.push(t);
    window.__perf.ys.push(window.scrollY);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__perf.longTasks.push(Math.round(entry.duration));
    });
    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // Long tasks are not observable everywhere; the frame timings still are.
  }
  // Long animation frames say where a slow frame went: script (attributed to
  // its source) or style, layout and paint.
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const renderStart = entry.renderStart || entry.startTime + entry.duration;
        const styleStart = entry.styleAndLayoutStart || renderStart;
        window.__perf.loafs.push({
          duration: entry.duration,
          script: entry.scripts.reduce((sum, s) => sum + s.duration, 0),
          render: entry.startTime + entry.duration - renderStart,
          styleLayout: entry.startTime + entry.duration - styleStart,
          top: entry.scripts
            .slice()
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 2)
            .map((s) => Math.round(s.duration) + 'ms ' + s.invoker + ' ' + String(s.sourceURL).split('/').pop() + ':' + s.sourceFunctionName),
        });
      }
    }).observe({ type: 'long-animation-frame', buffered: false });
  } catch {
    // Not every Chrome has long-animation-frame.
  }
  return true;
})()`);

// Keep scrolling until near the page end: Lenis eases each gesture, so a fixed
// count of gestures does not map to a fixed distance. Not to the very end:
// since Phase 6 that hands over to /desktop/, which would end the measurement
// on another page. The last 1.5 screens are the Convergence's settled frame.
const atEnd = () =>
  b.evaluate('scrollY >= document.documentElement.scrollHeight - innerHeight * 2.5');
let gestures = 0;
while (!(await atEnd()) && gestures < 400) {
  await b.swipe(Math.round(HEIGHT * 0.8));
  await sleep(120);
  gestures += 1;
}
await sleep(600);

const result = await b.evaluate(`(() => {
  window.__perf.running = false;
  const f = window.__perf.frames;
  const gaps = [];
  for (let i = 1; i < f.length; i++) gaps.push(f[i] - f[i - 1]);
  gaps.sort((a, b) => a - b);
  const at = (q) => gaps[Math.min(gaps.length - 1, Math.max(0, Math.round((gaps.length - 1) * q)))];
  const span = f.length > 1 ? (f[f.length - 1] - f[0]) / 1000 : 0;
  return {
    seconds: Number(span.toFixed(1)),
    frames: f.length,
    fps: Number(((f.length - 1) / span).toFixed(1)),
    medianFrameMs: Number(at(0.5)?.toFixed(1)),
    p95FrameMs: Number(at(0.95)?.toFixed(1)),
    worstFrameMs: Number(gaps[gaps.length - 1]?.toFixed(1)),
    framesOver33ms: gaps.filter((g) => g > 33).length,
    longTasks: window.__perf.longTasks.length,
    worstLongTaskMs: window.__perf.longTasks.length ? Math.max(...window.__perf.longTasks) : 0,
    slowFrames: (() => {
      const l = window.__perf.loafs;
      const sum = (key) => Math.round(l.reduce((t, e) => t + e[key], 0));
      const top = {};
      for (const e of l) for (const s of e.top) { const k = s.slice(s.indexOf('ms ') + 3); top[k] = (top[k] ?? 0) + parseInt(s, 10); }
      return {
        count: l.length,
        totalMs: sum('duration'),
        scriptMs: sum('script'),
        styleLayoutMs: sum('styleLayout'),
        renderMs: sum('render'),
        topScripts: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => v + 'ms ' + k),
      };
    })(),
    // Where the slow frames were: each era split into its crossing in, its
    // own frames and its puzzle segment, by the section's markers.
    slowByPlace: (() => {
      const places = [];
      for (const s of document.querySelectorAll('#journey-scenes > section')) {
        const top = s.getBoundingClientRect().top + scrollY;
        const at = (n) => { const m = s.querySelector('[data-mark="' + n + '"]'); return m ? m.getBoundingClientRect().top + scrollY : top; };
        places.push([s.id + ' crossing', top, at('visual')], [s.id + ' era', at('visual'), at('puzzle')], [s.id + ' puzzle', at('puzzle'), at('out')]);
      }
      const counts = {};
      for (let i = 1; i < f.length; i++) {
        if (f[i] - f[i - 1] <= 20) continue;
        const y = window.__perf.ys[i];
        const place = places.filter((p) => y >= p[1] && y < p[2]).map((p) => p[0]).pop() ?? 'other';
        counts[place] = (counts[place] ?? 0) + 1;
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => v + ' ' + k);
    })(),
    reachedEnd: Math.round(scrollY) >= Math.round(document.documentElement.scrollHeight - innerHeight * 2.5) - 4,
    scrolledPx: Math.round(scrollY),
  };
})()`);

if (QUIET) {
  console.log(`${TAG}: ${result.fps} fps, frame median/p95 ${result.medianFrameMs}/${result.p95FrameMs} ms, ${result.framesOver33ms} frames over 33 ms, ${result.longTasks} long tasks (worst ${result.worstLongTaskMs} ms), ${result.reachedEnd ? 'reached the end' : 'DID NOT REACH THE END'}, console errors: ${b.errors.length || 'none'}`);
} else {
  console.log(TAG, JSON.stringify({ ...result, gestures }, null, 2));
  console.log('console errors:', b.errors.length ? b.errors.slice(0, 3) : 'none');
}
b.close();
