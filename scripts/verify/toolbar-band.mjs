// What a phone's toolbar hides on the journey (queue 8, follow-up to PERF-02).
//
// Since queue 2a the journey's stages are as tall as the screen with the
// toolbar hidden (`--ao-vh` pinned to the large viewport on touch devices), so
// while the toolbar shows - at first load, and whenever it slides back - the
// bottom band of every pinned stage sits under it. Content in document flow
// scrolls out of that band; content in a stuck (sticky or fixed) layer does
// not. This walks the whole journey with the toolbar shown and reports every
// visible text, button or puzzle control that is (a) inside a stuck layer and
// reaches into the band, or (b) covered by the journey's own fixed chrome while
// it would not be with the toolbar hidden.
//
//   node scripts/verify/toolbar-band.mjs [--locale de|fa] [--mode play|watch]
//        [--width 390] [--height 844] [--toolbar 64] [--step 260] [--shots]
//        [--base URL] [--quiet]
//
// Loaded at the full height (the pin takes the large viewport, as on a real
// phone), then the viewport shrinks by the toolbar, exactly what
// Emulation.setDeviceMetricsOverride does for a real toolbar (toolbar.mjs).
// Play mode opens each gate by "show the solution" from the lock cue, after
// checking the gated frame. Exits 1 when anything is hidden.
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
const WIDTH = Number(args.width ?? 390);
const HEIGHT = Number(args.height ?? 844);
const TOOLBAR = Number(args.toolbar ?? 64);
const VISIBLE = HEIGHT - TOOLBAR;
const STEP = Number(args.step ?? 260);
const LOCALE = args.locale ?? 'de';
const MODE = args.mode ?? 'play';
const BASE = args.base ?? 'http://localhost:3001';
const QUIET = !!args.quiet;
const SHOTS = !!args.shots;
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const TAG = `band-${WIDTH}-${LOCALE}-${MODE}`;

const b = await launch({ width: WIDTH, height: HEIGHT, touch: true, tag: TAG });
const store = `localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: [], legendEras: [], hasCompletedJourney: false, mode: '${MODE === 'play' ? 'interactive' : 'guided'}' }, version: 2 })); true`;
await b.goto(`${BASE}${PREFIX}/`, 1500);
await b.evaluate(store);
await b.goto(`${BASE}${PREFIX}/amonel/`, 8000);

const pinned = await b.evaluate(`getComputedStyle(document.documentElement).getPropertyValue('--ao-vh').trim()`);
// The toolbar appears: the layout viewport loses its height, the pin stays.
await b.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: VISIBLE, deviceScaleFactor: 1, mobile: true });
await sleep(800);
const pinnedAfter = await b.evaluate(`getComputedStyle(document.documentElement).getPropertyValue('--ao-vh').trim()`);

/**
 * Runs in the page. Visible leaf text and controls; for each, whether it sits
 * in a stuck layer and reaches below the visible height, and whether the
 * journey's fixed chrome covers its centre.
 */
const scan = (visible, atEnd) => `(() => {
  const VISIBLE = ${visible};
  const AT_END = ${atEnd};
  const FULL = ${HEIGHT};
  const controls = 'button, a[href], input, select, textarea, [role="button"], [role="slider"], [tabindex="0"]';
  const found = [];
  const stuck = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.position === 'fixed') return { kind: 'fixed', name: n.className && n.className.baseVal === undefined ? String(n.className).split(' ').slice(0, 3).join('.') : n.tagName };
      if (cs.position === 'sticky') {
        const top = parseFloat(cs.top) || 0;
        const r = n.getBoundingClientRect();
        if (Math.abs(r.top - top) < 2) return { kind: 'sticky', name: String(n.className && n.className.baseVal === undefined ? n.className : n.tagName).split(' ').slice(0, 3).join('.') };
      }
    }
    return null;
  };
  const hiddenForReaders = (el) => el.closest('.ao-sr-only, [hidden], template');
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('value') || '').replace(/\\s+/g, ' ').trim().slice(0, 60);
  const place = (el) => {
    const section = el.closest('[id^="era-"], #convergence, section');
    return section ? (section.id || section.className.split(' ')[0]) : 'page';
  };
  for (const el of document.body.querySelectorAll('*')) {
    // Only the foot of the screen can change with the toolbar: the band itself,
    // and the strip above it where the bottom chrome moves to.
    const box = el.getBoundingClientRect();
    if (box.bottom <= VISIBLE - 130 || box.top >= FULL) continue;
    if (el.closest('.ao-journey-chrome') || hiddenForReaders(el)) continue;
    // Content in document flow scrolls out of the band - except at a page end
    // (a closed gate), where the visitor cannot scroll any further.
    const layer = stuck(el) || (AT_END ? { kind: 'end', name: 'page end' } : null);
    if (!layer) continue;
    const isControl = el.matches(controls);
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (!isControl && !ownText) continue;
    if (!isControl && el.closest(controls)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= FULL) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) continue;
    let faint = false;
    for (let n = el; n; n = n.parentElement) if (Number(getComputedStyle(n).opacity) < 0.05) { faint = true; break; }
    if (faint) continue;
    // Clipped away by an overflow ancestor: not on screen in either state.
    let clipped = false;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') {
        const c = n.getBoundingClientRect();
        if (r.top >= c.bottom - 1 || r.bottom <= c.top + 1) { clipped = true; break; }
      }
    }
    if (clipped) continue;
    const under = r.bottom > VISIBLE + 1 && r.top < FULL;
    let covered = null;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    if (cy > 0 && cy < VISIBLE) {
      const hit = document.elementFromPoint(cx, cy);
      const chrome = hit && hit.closest('.ao-journey-chrome');
      if (chrome && !el.contains(hit)) covered = String(chrome.className).split(' ').slice(0, 2).join('.');
    }
    if (!under && !covered) continue;
    // Scene art: text a few pixels tall inside a drawing screen readers skip
    // (the Convergence's miniature era screens flying into the desktop). It
    // is reported, but it is not something a visitor reads.
    const decorative = !isControl && r.height < 9 && !!el.closest('[aria-hidden="true"]');
    found.push({
      decorative,
      kind: isControl ? 'control' : 'text',
      label: label(el),
      tag: el.tagName.toLowerCase(),
      action: el.getAttribute('data-action') || '',
      place: place(el),
      layer: layer ? layer.kind + ':' + layer.name : 'flow',
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      under: !!under,
      covered,
    });
  }
  return found;
})()`;

const setHeight = async (height) => {
  await b.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height, deviceScaleFactor: 1, mobile: true });
  await sleep(350);
};
const toEnd = `window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); true`;
const itemKey = (item) => `${item.place}|${item.label}|${item.tag}`;

/**
 * The same frame with the toolbar hidden: what is hidden or covered there too
 * is not the toolbar's doing (reported, but not counted).
 */
const withoutToolbar = async (atEnd) => {
  await setHeight(HEIGHT);
  if (atEnd) {
    await b.evaluate(toEnd);
    await sleep(300);
  }
  const full = await b.evaluate(scan(HEIGHT, atEnd));
  await setHeight(VISIBLE);
  if (atEnd) {
    await b.evaluate(toEnd);
    await sleep(300);
  }
  return new Set((Array.isArray(full) ? full : []).map(itemKey));
};

const hidden = new Map();
const anyway = new Map();
const art = new Map();
const gates = [];
const record = async (y, note) => {
  const atEnd = note === 'gate';
  const items = await b.evaluate(scan(VISIBLE, atEnd));
  if (!Array.isArray(items)) {
    console.log('scan error', items);
    return;
  }
  if (items.length === 0) return;
  const also = await withoutToolbar(atEnd);
  for (const item of items) {
    const target = also.has(itemKey(item)) ? anyway : item.decorative ? art : hidden;
    const key = `${itemKey(item)}|${item.layer}|${item.under ? 'under' : 'covered'}`;
    if (!target.has(key)) {
      target.set(key, { ...item, firstAt: y, note, count: 0 });
      if (SHOTS && target === hidden) await b.shot(`${TAG}-${hidden.size}`);
    }
    target.get(key).count++;
  }
};

let y = 0;
let guard = 0;
while (guard++ < 600) {
  await b.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' }); true`);
  await sleep(260);
  const at = await b.evaluate('Math.round(scrollY)');
  const max = await b.evaluate('Math.round(document.documentElement.scrollHeight - innerHeight)');
  if (!QUIET) process.stdout.write(`${at}/${max} `);
  await record(at, '');
  if (at < y - 4) {
    // Stopped short of the target: the page ends here.
    const gated = await b.evaluate(`document.querySelector('[data-action="gate-reveal"]') ? true : false`);
    if (gated && MODE === 'play') {
      await b.evaluate(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); true`);
      await sleep(600);
      const end = await b.evaluate('Math.round(scrollY)');
      await record(end, 'gate');
      gates.push(end);
      if (SHOTS) await b.shot(`${TAG}-gate-${gates.length}`);
      const passedCount = `(JSON.parse(localStorage.getItem('amonel.unlocks.v1') || '{}').state?.passedEras || []).length`;
      const before = await b.evaluate(passedCount);
      await b.evaluate(`document.querySelector('[data-action="gate-reveal"]').click(); true`);
      // A shown solution plays itself; the longest takes about 20 s.
      for (let i = 0; i < 60 && (await b.evaluate(passedCount)) <= before; i++) await sleep(500);
      await sleep(800);
      await b.evaluate(`(document.querySelector('[data-action="continue"]') || document.querySelector('[data-action="close"]'))?.click(); true`);
      await sleep(2500);
      if ((await b.evaluate(passedCount)) <= before) {
        console.log(`gate at ${end} did not open`);
        break;
      }
      continue;
    }
    if (at >= max - 2) break;
  }
  if (at >= max - 2 && y > at) break;
  y = at + STEP;
}
// The Convergence's last frame, where the hand-over starts.
const end = await b.evaluate('location.pathname');

const list = [...hidden.values()];
const summary = {
  setup: `${WIDTH}x${HEIGHT} with a ${TOOLBAR} px toolbar (visible ${VISIBLE}), ${LOCALE}, ${MODE}`,
  pin: `${pinned} -> ${pinnedAfter}`,
  gates: gates.length,
  endedOn: end,
  hidden: list.length,
};
if (!QUIET || list.length) console.log(JSON.stringify(summary));
for (const item of list) {
  console.log(`  ${item.under ? 'UNDER TOOLBAR' : 'UNDER CHROME '} ${item.kind} ${item.tag}${item.action ? `[${item.action}]` : ''} "${item.label}" in ${item.place} (${item.layer}), y ${item.top}-${item.bottom}${item.covered ? `, covered by ${item.covered}` : ''}, first at scroll ${item.firstAt}${item.note ? ` (${item.note})` : ''}, ${item.count} frames`);
}
if (art.size) {
  console.log(`  decorative scene text, not counted: ${[...art.values()].map((item) => `"${item.label.slice(0, 20)}" in ${item.place} (${item.bottom - item.top} px tall)`).join('; ')}`);
}
if (!QUIET && anyway.size) {
  console.log(`  not the toolbar's doing (the same with the toolbar hidden): ${[...anyway.values()].map((item) => `"${item.label.slice(0, 30)}" in ${item.place} (${item.under ? 'below the screen' : `covered by ${item.covered}`})`).join('; ')}`);
}
if (b.errors.length) console.log('console errors:', b.errors.slice(0, 5));
if (SHOTS) console.log(`screenshots: ${path.join(OUT)}`);
console.log(`${TAG}: ${list.length === 0 ? 'nothing hidden by the toolbar' : `${list.length} hidden`}${pinned === pinnedAfter ? '' : ' (the pin moved!)'}`);
b.close();
process.exit(list.length || pinned !== pinnedAfter ? 1 : 0);
