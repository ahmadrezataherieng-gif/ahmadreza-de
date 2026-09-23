// The ways between the journey and the desktop (Phase 6, DECISIONS.md 49).
//
//   node scripts/verify/navigation.mjs [--width 1280] [--height 800] [--locale de|en|fa]
//        [--reduce] [--touch] [--base URL]
//
// - The Convergence's last frame and the desktop's first frame are compared
//   pixel by pixel (the desktop captured with JavaScript off, so it is the
//   server's frame before any shell arrives).
// - Reaching the end of the journey hands over to the desktop; Back then
//   returns to where the journey was entered from, not to its end.
// - Zum Desktop works from every era, and from a gated era with and without a
//   puzzle held open; Back returns to the journey without a redirect.
// - A returning visitor: the landing page leads with "Zum Desktop" without a
//   layout shift, a direct visit to the journey goes to the desktop, and
//   "Reise erneut ansehen" or a mode card opens the journey anyway.
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { launch, sleep, OUT } from './cdp.mjs';
import { decodePng } from './png.mjs';

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
const REDUCE = Boolean(args.reduce);
const TOUCH = Boolean(args.touch);
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const TAG = `nav-${WIDTH}-${LOCALE}${REDUCE ? '-rm' : ''}${TOUCH ? '-touch' : ''}`;
const STORE = 'amonel.unlocks.v1';
const LANDING = `${BASE}${PREFIX}/`;
const JOURNEY = `${BASE}${PREFIX}/amonel/`;
const DESKTOP = `${BASE}${PREFIX}/desktop/`;

// --quiet: failures in full, passes only in the final count.
const QUIET = Boolean(args.quiet);
const log = [];
const check = (name, ok, detail) => {
  log.push({ name, ok: Boolean(ok) });
  if (QUIET && ok) return;
  const extra = detail === undefined ? '' : ` :: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra}`);
};

const b = await launch({ width: WIDTH, height: HEIGHT, reduce: REDUCE, touch: TOUCH, tag: TAG });
const js = (code) => b.evaluate(code);
const pathname = () => js('location.pathname');
const isAt = async (view) => {
  const current = await pathname();
  return view === 'landing' ? current === `${PREFIX}/` : current.endsWith(`/${view}/`);
};

const freshStore = (extra = {}) =>
  js(
    `localStorage.setItem('${STORE}', JSON.stringify({ state: Object.assign({ artifacts: [], visitedEras: [], skippedEras: [], passedEras: [], legendEras: [], hasCompletedJourney: false, mode: 'guided' }, ${JSON.stringify(extra)}), version: 2 })); sessionStorage.clear(); true`,
  );
const clickOn = async (selector) => {
  const point = await js(`(() => {
    const e = document.querySelector('${selector}');
    if (!e) return null;
    // Landing-page links can sit below the fold; fixed chrome is always in view.
    const r0 = e.getBoundingClientRect();
    if (r0.bottom > innerHeight || r0.top < 0) e.scrollIntoView({ block: 'center' });
    const r = e.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  await sleep(300);
  if (!point) return false;
  await b.click(point.x, point.y);
  return true;
};
/** Document y of a point in a section: its visual marker, or a share of its own frames. */
const eraY = (id, share = 0) =>
  js(`(() => {
    const s = document.getElementById('${id}');
    const at = (n) => s.querySelector('[data-mark="' + n + '"]').getBoundingClientRect().top + scrollY;
    return Math.round(at('visual') + (at('puzzle') - at('visual')) * ${share});
  })()`);
const scrollToY = async (y) => {
  await js(`window.scrollTo(0, ${y}); true`);
  await sleep(1200);
  await js(`window.scrollTo(0, ${y}); true`);
  await sleep(800);
};

await b.goto(LANDING, 2500);

/* --- the frames match --------------------------------------------------------- */
if (!REDUCE) {
  await freshStore();
  await b.goto(JOURNEY, 8000);
  // Just short of the hand-over (0.98): the Convergence's final frame.
  await scrollToY(await eraY('convergence', 0.975));
  await js(`document.querySelector('header.ao-journey-chrome').parentElement.setAttribute('data-handover', ''); true`);
  await sleep(600);
  const journeyShot = Buffer.from((await b.send('Page.captureScreenshot', { format: 'png' })).result.data, 'base64');
  writeFileSync(path.join(OUT, `${TAG}-journey-last-frame.png`), journeyShot);

  await b.send('Emulation.setScriptExecutionDisabled', { value: true });
  await b.goto(DESKTOP, 3000);
  // With scripts off the <noscript> note would show; the first frame never has it.
  const { result: doc } = await b.send('DOM.getDocument', { depth: -1 });
  const { result: found } = await b.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'noscript' });
  if (found?.nodeId) await b.send('DOM.removeNode', { nodeId: found.nodeId });
  await sleep(500);
  const desktopShot = Buffer.from((await b.send('Page.captureScreenshot', { format: 'png' })).result.data, 'base64');
  writeFileSync(path.join(OUT, `${TAG}-desktop-first-frame.png`), desktopShot);
  await b.send('Emulation.setScriptExecutionDisabled', { value: false });

  const one = decodePng(journeyShot);
  const two = decodePng(desktopShot);
  let differing = 0;
  let worst = 0;
  for (let i = 0; i < one.pixels.length; i += 4) {
    const delta = Math.max(
      Math.abs(one.pixels[i] - two.pixels[i]),
      Math.abs(one.pixels[i + 1] - two.pixels[i + 1]),
      Math.abs(one.pixels[i + 2] - two.pixels[i + 2]),
    );
    worst = Math.max(worst, delta);
    if (delta > 6) differing += 1;
  }
  const share = differing / (one.pixels.length / 4);
  check('hand-over: the desktop opens on the journey\'s last frame', one.width === two.width && share < 0.001, {
    differingPixels: differing,
    share: Number(share.toFixed(5)),
    worstChannelDelta: worst,
  });
}

/* --- reaching the end hands over -------------------------------------------------- */
await b.goto(LANDING, 2500);
await freshStore();
await b.goto(LANDING, 3000);
await clickOn('a[href*="amonel"]');
await sleep(8000);
check('landing card opens the journey', await isAt('amonel'));
await js('window.scrollTo(0, document.documentElement.scrollHeight); true');
await sleep(1500);
await js('window.scrollTo(0, document.documentElement.scrollHeight); true');
await sleep(4000);
check('the end of the journey hands over to the desktop', await isAt('desktop'), await pathname());
check('the hand-over completes the journey', await js(`JSON.parse(localStorage.getItem('${STORE}')).state.hasCompletedJourney === true`));
await js('history.back(); true');
await sleep(3500);
check('Back from the desktop returns to the landing page, not the journey\'s end', await isAt('landing'), await pathname());

/* --- Zum Desktop from every era ------------------------------------------------------ */
const eraCount = 7;
for (let index = 1; index <= eraCount; index++) {
  await b.goto(LANDING, 1500);
  await freshStore();
  await b.goto(JOURNEY, 7000);
  await scrollToY(await eraY(`era-${index}`, 0.3));
  await clickOn('[data-action="to-desktop"]');
  await sleep(3500);
  check(`Zum Desktop from era ${index}`, await isAt('desktop'), await pathname());
  if (index === 3) {
    await js('history.back(); true');
    await sleep(5000);
    check('Back after Zum Desktop returns to the journey, not redirected', await isAt('amonel'), await pathname());
  }
}

// Play mode: era 1 is gated. First with the gate closed, then with its puzzle held open.
for (const held of [false, true]) {
  await b.goto(LANDING, 1500);
  await freshStore({ mode: 'interactive' });
  await b.goto(JOURNEY, 7000);
  const gated = await js(`document.querySelector('[data-gated]')?.dataset.era ?? null`);
  if (held) {
    await scrollToY(await eraY('era-1', 1.4));
    if (!(await clickOn('[data-puzzle="eniac"] [data-action="start"]'))) await clickOn('[data-action="gate-open"]');
    await sleep(1500);
  }
  const isHeld = await js(`document.documentElement.classList.contains('ao-scroll-held')`);
  await clickOn('[data-action="to-desktop"]');
  await sleep(3500);
  check(`Zum Desktop while era 1 is gated${held ? ' and its puzzle held open' : ''}`, gated === 'eniac' && (!held || isHeld) && (await isAt('desktop')), { gated, isHeld, at: await pathname() });
  if (held) {
    await js('history.back(); true');
    await sleep(5000);
    check('Back after leaving a held puzzle returns to the journey', await isAt('amonel'), await pathname());
  }
}

/* --- the returning visitor --------------------------------------------------------- */
await b.goto(LANDING, 1500);
await freshStore({ hasCompletedJourney: true });

// Where the mode cards' heading sits in the server's HTML, before any island runs.
await b.send('Emulation.setScriptExecutionDisabled', { value: true });
await b.goto(LANDING, 2500);
const serverTop = await b.send('Runtime.evaluate', { expression: `Math.round(document.getElementById('choose-mode').getBoundingClientRect().top)`, returnByValue: true });
await b.send('Emulation.setScriptExecutionDisabled', { value: false });

await b.goto(LANDING, 3500);
const landing = await js(`(() => ({
  cta: !!document.querySelector('[data-returning-cta] [data-action="landing-desktop"]'),
  returning: document.documentElement.hasAttribute('data-returning'),
  top: Math.round(document.getElementById('choose-mode').getBoundingClientRect().top),
}))()`);
check('returning: the landing page leads with Zum Desktop', landing.cta && landing.returning, landing);
check('returning: the switch shifts nothing', landing.top === serverTop.result.result.value, { server: serverTop.result.result.value, hydrated: landing.top });
await b.shot(`${TAG}-landing-returning`);

await b.goto(JOURNEY, 5000);
check('returning: a direct visit to the journey goes to the desktop', await isAt('desktop'), await pathname());

await sleep(1000);
await clickOn('[data-action="replay"]');
await sleep(6000);
check('returning: "Reise erneut ansehen" opens the journey', await isAt('amonel'), await pathname());
await b.reload(6000);
check('returning: a reload of the replayed journey stays', await isAt('amonel'), await pathname());

await b.goto(DESKTOP, 4000);
await b.goto(JOURNEY, 5000);
check('returning: back on the desktop, the next direct visit redirects again', await isAt('desktop'), await pathname());

await b.goto(LANDING, 3500);
await clickOn('[data-mode-option], a[href*="amonel"]');
await sleep(6000);
check('returning: a mode card still opens the journey', await isAt('amonel'), await pathname());

check('no console errors', b.errors.length === 0, b.errors.slice(0, 3));
const passed = log.filter((entry) => entry.ok).length;
console.log(`${QUIET ? '' : '\n'}${TAG}: ${passed}/${log.length} passed`);
b.close();
process.exit(passed === log.length ? 0 : 1);
