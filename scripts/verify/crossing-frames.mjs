// Screenshots of every crossing at chosen points of its progress (BR-10).
//
//   node scripts/verify/crossing-frames.mjs [--width 390] [--height 844] [--locale de]
//        [--frames 0,25,50,75,100] [--only 1946] [--tier light] [--reduce]
//        [--out "Claude outputs/br10"] [--base URL]
//
// Files are named <from>-<to>-<percent>.png, e.g. 1946-1956-50.png. The page is
// scrolled straight to each point (no gesture), the resolver is given time to
// write its values, and the crossing's own progress is read back from the
// bridge: a frame whose progress is off by more than 2 % is reported, so a
// screenshot always says what it claims to.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

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
const LOCALE = args.locale ?? 'de';
const TIER = args.tier === 'full' ? 'full' : 'light';
const FRAMES = String(args.frames ?? '0,25,50,75,100').split(',').map(Number);
const OUT_DIR = path.resolve(args.out ?? 'Claude outputs/br10');
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const REDUCE = Boolean(args.reduce);
const ONLY = args.only ? String(args.only) : null;

mkdirSync(OUT_DIR, { recursive: true });
const b = await launch({ width: WIDTH, height: HEIGHT, touch: WIDTH < 768, reduce: REDUCE, tag: `frames-${WIDTH}-${LOCALE}` });
await b.goto(`${BASE}${PREFIX}/amonel/?tier=${TIER}`, 2000);
await b.evaluate(
  `localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: ['eniac','batch','unix','dos','macintosh','win95','cloud'], legendEras: [], hasCompletedJourney: false, mode: 'interactive' }, version: 2 })); true`,
);
await b.goto(`${BASE}${PREFIX}/amonel/?tier=${TIER}`, 9000);

const crossings = await b.evaluate(`(() => [...document.querySelectorAll('#journey-scenes > section[data-era-index]')]
  .filter((s) => s.querySelector('[data-bridge-band]'))
  .map((s) => ({ id: s.id, index: Number(s.dataset.eraIndex) })))()`);
const years = [1946, 1956, 1971, 1981, 1984, 1995, 'today'];

let off = 0;
for (const { id, index } of crossings) {
  const label = `${years[index - 2]}-${years[index - 1]}`;
  if (ONLY && !label.startsWith(ONLY)) continue;
  for (const percent of FRAMES) {
    // Where this crossing is at `percent`, from the same markers the resolver
    // reads: a band in flow measures itself, a pinned overlay runs up to the
    // visual's marker.
    const at = await b.evaluate(`(() => {
      const s = document.getElementById('${id}');
      const band = s.querySelector('[data-bridge-band]');
      const panel = band.querySelector('.ao-bridge-panel');
      const inFlow = getComputedStyle(band).position === 'relative';
      const top = s.getBoundingClientRect().top + scrollY;
      let from;
      let travel;
      if (inFlow) {
        from = band.getBoundingClientRect().top + scrollY;
        travel = Math.max(1, band.offsetHeight - panel.offsetHeight);
      } else {
        from = top;
        travel = Math.max(1, s.querySelector('[data-mark="visual"]').getBoundingClientRect().top + scrollY - top);
      }
      window.scrollTo(0, Math.round(from + travel * ${percent / 100}));
      return true;
    })()`);
    void at;
    await sleep(900);
    const seen = await b.evaluate(`(() => {
      const band = document.querySelector('#${id} [data-bridge-band]');
      return Number(band.style.getPropertyValue('--boundary-in') || 1);
    })()`);
    if (!REDUCE && Math.abs(seen * 100 - percent) > 2) {
      off += 1;
      console.log(`${label}-${percent}: progress reads ${(seen * 100).toFixed(1)} %`);
    }
    const shot = await b.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(OUT_DIR, `${label}-${percent}.png`), Buffer.from(shot.result.data, 'base64'));
  }
}
console.log(`frames saved to ${OUT_DIR}${off ? `; ${off} off target` : ''}; console errors: ${b.errors.length || 'none'}`);
b.close();
