// PERF-05: Core Web Vitals on the real export, per view, as a phone on a
// slow line and as a desktop would see them.
//
//   node scripts/verify/vitals.mjs [--locale de] [--base URL] [--runs 3] [--quiet]
//
// Two profiles: "phone" (380 x 800, touch, 4x CPU slowdown, 1.6 Mbit/s down,
// 150 ms latency - Lighthouse's slow-4G shape) and "desktop" (1280 x 800, no
// throttling). For each view it measures, in the page itself with
// PerformanceObserver: FCP, LCP, CLS (to the end of the run, including a
// scroll) and TBT (the part of every long task beyond 50 ms, from FCP until
// the page is quiet). The median of --runs cold loads is reported and held
// against the budgets below, which follow Google's "good" thresholds
// (LCP 2.5 s, CLS 0.1) and Lighthouse's TBT (200 ms on the phone profile).
import { launch, sleep } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const LOCALE = args.locale ?? 'de';
const BASE = args.base ?? 'http://localhost:3001';
const RUNS = Number(args.runs ?? 3);
const QUIET = Boolean(args.quiet);
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;

const PROFILES = {
  phone: { width: 380, height: 800, touch: true, cpu: 4, network: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 } },
  desktop: { width: 1280, height: 800, touch: false, cpu: 1, network: null },
};
const BUDGET = {
  phone: { lcp: 2500, cls: 0.1, tbt: 200 },
  desktop: { lcp: 1500, cls: 0.1, tbt: 100 },
};
const VIEWS = [
  ['landing', `${PREFIX}/`],
  ['journey', `${PREFIX}/amonel/`],
  ['desktop', `${PREFIX}/desktop/`],
  ['about', `${PREFIX}/about/`],
];

// Installed before any page script: collects the entries from the first paint on.
const OBSERVE = `(() => {
  window.__vitals = { fcp: null, lcp: null, cls: 0, longTasks: [] };
  const v = window.__vitals;
  new PerformanceObserver((list) => { for (const e of list.getEntries()) if (e.name === 'first-contentful-paint') v.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((list) => { const entries = list.getEntries(); v.lcp = entries[entries.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) v.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((list) => { for (const e of list.getEntries()) v.longTasks.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true });
})();`;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const results = [];
let failed = 0;
for (const [profileName, profile] of Object.entries(PROFILES)) {
  for (const [view, path] of VIEWS) {
    const samples = [];
    for (let run = 0; run < RUNS; run++) {
      const b = await launch({ width: profile.width, height: profile.height, touch: profile.touch, tag: `vitals-${profileName}-${view}-${run}` });
      await b.send('Network.enable');
      await b.send('Network.setCacheDisabled', { cacheDisabled: true });
      if (profile.network) await b.send('Network.emulateNetworkConditions', { offline: false, ...profile.network });
      if (profile.cpu > 1) await b.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
      await b.send('Page.addScriptToEvaluateOnNewDocument', { source: OBSERVE });
      await b.goto(`${BASE}${path}`, profile.cpu > 1 ? 7000 : 3500);
      // A scroll, as a visitor would: layout shifts during it count (no input on it).
      await b.evaluate(`window.scrollBy(0, innerHeight * 0.8); true`);
      await sleep(1500);
      const v = await b.evaluate(`window.__vitals`);
      const tbt = (v.longTasks ?? []).filter(([start]) => v.fcp === null || start >= v.fcp).reduce((sum, [, duration]) => sum + Math.max(0, duration - 50), 0);
      samples.push({ fcp: v.fcp ?? NaN, lcp: v.lcp ?? NaN, cls: v.cls, tbt });
      b.close();
    }
    const row = {
      profile: profileName,
      view,
      fcp: Math.round(median(samples.map((s) => s.fcp))),
      lcp: Math.round(median(samples.map((s) => s.lcp))),
      cls: Number(median(samples.map((s) => s.cls)).toFixed(3)),
      tbt: Math.round(median(samples.map((s) => s.tbt))),
    };
    const budget = BUDGET[profileName];
    const ok = row.lcp <= budget.lcp && row.cls <= budget.cls && row.tbt <= budget.tbt;
    if (!ok) failed += 1;
    results.push(row);
    if (!QUIET || !ok) console.log(`${ok ? 'ok  ' : 'FAIL'} ${profileName.padEnd(7)} ${view.padEnd(8)} FCP ${row.fcp} ms  LCP ${row.lcp} ms  CLS ${row.cls}  TBT ${row.tbt} ms`);
  }
}
console.log(`vitals-${LOCALE}: ${results.length - failed}/${results.length} within budget (median of ${RUNS})`);
process.exit(failed === 0 ? 0 : 1);
