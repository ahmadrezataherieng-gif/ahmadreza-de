// Screenshots of journey frames with a phone toolbar shown and hidden (queue 8):
// loaded at the full height so the pin takes the large viewport, then each
// frame is shot at the visible height (toolbar shown) and at the full height.
//
//   node scripts/verify/toolbar-shots.mjs --at 3900,35880 [--locale de] [--mode play]
//        [--width 390] [--height 844] [--toolbar 64] [--name before] [--base URL]
//
// Files: <VERIFY_OUT>/<name>-<locale>-<scroll>-toolbar.png and -full.png. Play
// mode seeds every era as passed, so no gate stops the scroll.
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
const VISIBLE = HEIGHT - Number(args.toolbar ?? 64);
const LOCALE = args.locale ?? 'de';
const MODE = args.mode ?? 'play';
const NAME = args.name ?? 'frame';
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const AT = String(args.at ?? '0').split(',').map(Number);

const b = await launch({ width: WIDTH, height: HEIGHT, touch: true, tag: `toolbar-shots-${LOCALE}` });
const eras = `['eniac','batch','unix','dos','macintosh','win95','cloud']`;
await b.goto(`${BASE}${PREFIX}/`, 1500);
await b.evaluate(`localStorage.setItem('amonel.unlocks.v1', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: ${MODE === 'play' ? eras : '[]'}, legendEras: [], hasCompletedJourney: false, mode: '${MODE === 'play' ? 'interactive' : 'guided'}' }, version: 2 })); true`);
await b.goto(`${BASE}${PREFIX}/amonel/`, 8000);
const size = async (height) => {
  await b.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height, deviceScaleFactor: 1, mobile: true });
  await sleep(400);
};
for (const y of AT) {
  await size(VISIBLE);
  await b.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' }); true`);
  await sleep(900);
  await b.shot(`${NAME}-${LOCALE}-${y}-toolbar`);
  await size(HEIGHT);
  await b.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' }); true`);
  await sleep(900);
  await b.shot(`${NAME}-${LOCALE}-${y}-full`);
}
console.log(`toolbar-shots: ${AT.length} frames x 2`);
b.close();
