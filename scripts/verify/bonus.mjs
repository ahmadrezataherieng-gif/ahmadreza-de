// End-to-end checks for the bonus apps and their unlocks (Phase 9D-1).
//
//   node scripts/verify/bonus.mjs [--width 1280] [--height 800] [--locale de|en|fa]
//        [--reduce] [--touch] [--api] [--base URL]
//
// Locked: a fresh visitor sees every bonus app dimmed and padlocked; opening
// one names its era and links straight to it in the journey. Finished journey:
// all unlocked. Then each of Binary & Morse, Snake and Pixel Paint is used for
// real - by mouse, keyboard or touch - and what it stores is checked against
// the storage list: nothing until the visitor does something, never anything
// else. With --api the Snake counter is checked too.
import { launch, sleep } from './cdp.mjs';
import { posted, shownPattern, STUB_COUNTS, wellFormed } from './api-stub.mjs';

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
const API = Boolean(args.api);
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const TAG = `bonus-${WIDTH}-${LOCALE}${REDUCE ? '-rm' : ''}${TOUCH ? '-touch' : ''}${API ? '-api' : ''}`;
const STORE = 'amonel.unlocks.v1';
const ALLOWED_KEYS = ['amonel.unlocks.v1', 'amonel.snake.v1', 'amonel.paint.v1', 'amonel.theme.v1'];
const BONUS = { binary: 1, snake: 4, paint: 5, 'network-tools': 6, 'time-machine': 7 };

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
const apiCalls = API ? await b.stubApi(STUB_COUNTS) : [];

const rectOf = (selector) =>
  js(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
const clickOn = async (selector) => {
  const r = await rectOf(selector);
  if (!r) return false;
  await b.click(r.cx, r.cy);
  await sleep(350);
  return true;
};
const until = async (expression, ms = 6000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await js(expression)) return true;
    await sleep(100);
  }
  return false;
};
const seed = (state) => js(`localStorage.clear(); localStorage.setItem('${STORE}', ${JSON.stringify(JSON.stringify({ state, version: 3 }))}); sessionStorage.setItem('amonel.replay', '1'); true`);
const storageKeys = () => js('Object.keys(localStorage).sort()');

/* --- locked --------------------------------------------------------------------- */

await b.goto(`${BASE}${PREFIX}/`, 2500);
await seed({ hasCompletedJourney: true, mode: 'guided' });
await b.goto(`${BASE}${PREFIX}/desktop/`, 5000);
const layout = await js(`document.querySelector('[data-shell]')?.dataset.shellLayout ?? null`);
check('layout', layout === (!TOUCH && WIDTH >= 768 ? 'desktop' : 'mobile'), layout);
const icon = (id) => (layout === 'desktop' ? `[data-layout="desktop"] nav [data-app="${id}"]` : `.ao-home [data-app="${id}"]`);
const frame = (id) => (layout === 'desktop' ? `[data-window="${id}"]` : `[data-mobile-app="${id}"]`);
const content = (id) => `${frame(id)} [data-app-content="${id}"]`;

const locked = await js(`[...document.querySelectorAll('[data-app][data-locked]')].map((e) => e.dataset.app)`);
for (const id of Object.keys(BONUS)) check(`locked: ${id} is visible and padlocked`, locked.includes(id), locked);

await clickOn(icon('snake'));
const notice = await js(`(() => { const n = document.querySelector('[data-locked-notice]'); return n && { id: n.dataset.lockedNotice, text: n.textContent }; })()`);
check('locked: opening snake shows the notice, not a window', notice?.id === 'snake' && !(await js(`!!document.querySelector('${frame('snake')}')`)), notice);
check('locked: the notice names 1981', /1981/.test(notice?.text ?? ''), notice?.text);
const noticeBox = await rectOf('[data-locked-notice]');
// The notice once covered the lowest icon (desktop, 768 px tall) and the grid on the phone: no icon may sit under it (APP-14).
const iconBoxes = await js(`[...document.querySelectorAll(${JSON.stringify(layout === 'desktop' ? '[data-layout="desktop"] nav [data-app]' : '.ao-home [data-app]')})].map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.app, x: r.left, y: r.top, w: r.width, h: r.height }; }).filter((r) => r.w > 0)`);
const covered = noticeBox ? iconBoxes.filter((r) => r.x < noticeBox.x + noticeBox.w && r.x + r.w > noticeBox.x && r.y < noticeBox.y + noticeBox.h && r.y + r.h > noticeBox.y).map((r) => r.id) : [];
check('locked: the notice leaves every icon free', iconBoxes.length > 0 && covered.length === 0, { noticeBox, covered });
await clickOn('[data-action="locked-play"]');
check('locked: "to the puzzle" opens the journey at 1981', await until(`location.pathname.endsWith('/amonel/') && location.hash === '#era-4'`, 8000), await js('location.pathname + location.hash'));

/* --- unlocked by the finished journey --------------------------------------------- */

// Seed from the landing page: the journey left open above would write its own
// state back over the seed on its next scroll.
await b.goto(`${BASE}${PREFIX}/`, 2500);
await seed({ journeyFinished: true, hasCompletedJourney: true, mode: 'guided' });
await b.goto(`${BASE}${PREFIX}/desktop/`, 5000);
check('finished journey: no app is locked', (await js(`document.querySelectorAll('[data-app][data-locked]').length`)) === 0);
check('storage: opening the desktop stores nothing new', (await storageKeys()).join() === STORE, await storageKeys());

async function open(id) {
  await clickOn(icon(id));
  const ok = await until(`!!document.querySelector('${content(id)}')`);
  check(`${id}: opens`, ok);
  if (layout === 'desktop') await clickOn(`${frame(id)} [data-action="window-maximise"]`);
  return ok;
}
async function close(id) {
  if (layout === 'desktop') await clickOn(`${frame(id)} [data-action="window-close"]`);
  else await js('history.back(); true');
  await until(`!document.querySelector('${frame(id)}')`, 3000);
}
const noOverflow = (id) =>
  js(`(() => { const body = document.querySelector('${frame(id)} [data-window-body]'); return body.scrollWidth <= body.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; })()`);
const setValue = (selector, value) =>
  js(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
const text = (selector) => js(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? null`);

/* --- Binary & Morse ------------------------------------------------------------------ */

await open('binary');
await setValue('[data-binary-input]', 'Aس😀');
await sleep(150);
check('binary: A is 01000001 in binary', (await text('[data-binary-output="binary"]'))?.startsWith('01000001'), await text('[data-binary-output="binary"]'));
check('binary: UTF-8 rows are 1, 2 and 4 bytes', (await js(`[...document.querySelectorAll('[data-utf8-bytes]')].map((r) => r.dataset.utf8Bytes).join()`)) === '1,2,4');
check('binary: byte output stays left-to-right', (await js(`[...document.querySelectorAll('[data-binary-output]')].every((e) => e.dir === 'ltr')`)));
await clickOn('[data-binary-source="hex"]');
await setValue('[data-binary-input]', '48 69');
await sleep(150);
check('binary: hex reads back to text', (await text('[data-binary-output="text"]')) === 'Hi');
await setValue('[data-binary-input]', 'd8');
await sleep(150);
check('binary: half a Persian letter is invalid UTF-8, and says so', (await js(`document.querySelector('[data-binary-status]').dataset.binaryStatus`)) === 'invalidUtf8');
check('binary: no sideways scroll', await noOverflow('binary'));

await clickOn('[data-binary-tab="morse"]');
await setValue('[data-morse-input]', 'SOS سلام');
await sleep(150);
check('morse: SOS', (await text('[data-morse-output]')) === '... --- ...');
check('morse: Persian letters are named as unsupported', /س/.test((await text('[data-morse-unsupported]')) ?? ''));
check('morse: the timeline is drawn', (await js(`document.querySelector('[data-morse-timeline]')?.children.length ?? 0`)) > 5);
check(`morse: ${REDUCE ? 'no flashing light under reduced motion' : 'the light is there'}`, (await js(`!!document.querySelector('[data-morse-lamp]')`)) === !REDUCE);
check('morse: no sound before a click', !(await js(`!!document.querySelector('[data-action="morse-stop"]')`)));
await setValue('[data-morse-input]', 'E E');
await sleep(150);
await clickOn('[data-action="morse-play"]');
check('morse: play turns into stop', await until(`!!document.querySelector('[data-action="morse-stop"]')`, 2000));
if (!REDUCE) check('morse: the light switches on', await until(`document.querySelector('[data-morse-lamp]')?.dataset.morseLamp === 'on'`, 3000));
check('morse: it ends by itself', await until(`!!document.querySelector('[data-action="morse-play"]')`, 6000));
check('storage: the converter stores nothing', (await storageKeys()).join() === STORE, await storageKeys());
await close('binary');

/* --- Snake ----------------------------------------------------------------------------- */

await open('snake');
check('snake: waiting to start', (await js(`document.querySelector('[data-snake-board]').dataset.snakeStatus`)) === 'ready');
check('snake: the board keeps touch gestures for itself', (await js(`getComputedStyle(document.querySelector('[data-snake-board]')).touchAction`)) === 'none');
check(`snake: ${TOUCH ? 'the pad is shown on a touchscreen' : 'no pad with a mouse'}`, (await js(`getComputedStyle(document.querySelector('[data-snake-pad]')).display !== 'none'`)) === TOUCH);
const boardPixel = await js(`[...document.querySelector('[data-snake-board] canvas').getContext('2d').getImageData(3, 3, 1, 1).data].join()`);
check('snake: the canvas is painted', boardPixel !== '0,0,0,0', boardPixel);
if (TOUCH) {
  await clickOn('[data-snake-pad-button="up"]');
} else {
  await clickOn('[data-snake-board]');
  await b.key('ArrowUp');
}
check('snake: running', await until(`document.querySelector('[data-snake-board]').dataset.snakeStatus === 'running'`, 2000));
if (!TOUCH) {
  await b.key(' ');
  check('snake: Space pauses', await until(`document.querySelector('[data-snake-board]').dataset.snakeStatus === 'paused'`, 1000));
  await b.key(' ');
}
await js(`window.dispatchEvent(new Event('blur')); true`);
check('snake: losing focus pauses', await until(`document.querySelector('[data-snake-board]').dataset.snakeStatus === 'paused'`, 1000));
// Resume and let it run into the wall above.
if (TOUCH) await clickOn('[data-snake-board]');
else await b.key(' ');
check('snake: the wall ends the game', await until(`document.querySelector('[data-snake-board]').dataset.snakeStatus === 'over'`, 12000));
check('storage: the best score is one number', /^\{"state":\{"best":\d+\},"version":1\}$/.test((await js(`localStorage.getItem('amonel.snake.v1')`)) ?? ''), await js(`localStorage.getItem('amonel.snake.v1')`));
check('snake: no sideways scroll', await noOverflow('snake'));
if (API) {
  // The number loads only once its line is in view: scroll the window body down.
  await js(`(() => { const body = document.querySelector('${frame('snake')} [data-window-body]'); body.scrollTop = body.scrollHeight; return true; })()`);
  const played = await until(`/${shownPattern(LOCALE).source}/.test(document.querySelector('[data-public-count="snake.played"]')?.textContent ?? '')`, 4000);
  check('api: games played are shown from the public count', played, await text('[data-public-count="snake.played"]'));
  check('api: a finished game counts snake.played once, never a score', posted(apiCalls).filter((name) => name.startsWith('snake')).join() === 'snake.played', posted(apiCalls));
} else {
  check('snake: without /api no number is shown', (await text('[data-public-count="snake.played"]')) === null);
}
await close('snake');

/* --- Pixel Paint ---------------------------------------------------------------------- */

await open('paint');
await sleep(900);
check('storage: opening Paint stores nothing', !(await js(`localStorage.getItem('amonel.paint.v1')`)));
const canvas = await rectOf('[data-paint-canvas]');
const cell = canvas.w / 32;
const at = (x, y) => ({ x: canvas.x + (x + 0.5) * cell, y: canvas.y + (y + 0.5) * cell });
const pixel = (x, y) => js(`[...document.querySelector('[data-paint-canvas]').getContext('2d').getImageData(${x}, ${y}, 1, 1).data].slice(0, 3).join()`);
const white = await pixel(5, 5);
await b.drag(at(2, 5), at(12, 5), 10);
await sleep(200);
check(`paint: a ${TOUCH ? 'finger' : 'mouse'} stroke draws a gapless line`, (await Promise.all([2, 5, 8, 12].map((x) => pixel(x, 5)))).every((value) => value !== white));
await clickOn('[data-action="paint-undo"]');
check('paint: undo takes the stroke back', (await pixel(8, 5)) === white);
await clickOn('[data-action="paint-redo"]');
check('paint: redo brings it again', (await pixel(8, 5)) !== white);
await clickOn('[data-paint-tool="fill"]');
await b.click(at(20, 20).x, at(20, 20).y);
await sleep(200);
check('paint: fill covers the area', (await pixel(31, 31)) !== white && (await pixel(0, 0)) !== white);
await clickOn('[data-paint-palette-option="bit1"]');
check('paint: 1 bit leaves 2 swatches', (await js(`document.querySelector('[data-paint-swatches]').dataset.paintSwatches`)) === '2');
await clickOn('[data-paint-size-option="64"]');
check('paint: a new size asks first', await until(`!!document.querySelector('[data-paint-confirm]')`, 1000));
await clickOn('[data-action="paint-size-confirm"]');
check('paint: then starts a 64 x 64 canvas', (await js(`document.querySelector('[data-paint-canvas]').width`)) === 64);
await clickOn('[data-action="paint-undo"]');
check('paint: undo restores the old picture', (await js(`document.querySelector('[data-paint-canvas]').width`)) === 32);
// Keyboard: the cursor, then Space with the pencil.
await clickOn('[data-paint-tool="pencil"]');
await js(`document.querySelector('[data-paint-canvas]').focus(); true`);
await b.key('ArrowRight');
await b.key('ArrowDown');
check('paint: the arrow keys show a cursor', await until(`!!document.querySelector('[data-paint-cursor]')`, 1000));
check('paint: autosaves after a change', await until(`!!localStorage.getItem('amonel.paint.v1')`, 3000));
const saved = await js(`JSON.parse(localStorage.getItem('amonel.paint.v1'))`);
check('paint: the save is small and only the picture', saved?.v === 1 && Object.keys(saved).sort().join() === 'palette,pixels,size,v' && JSON.stringify(saved).length < 16384);
// The PNG: capture the blob instead of saving a file.
await js(`(() => { window.__png = null; const original = URL.createObjectURL; URL.createObjectURL = (blob) => { window.__png = blob; return original.call(URL, blob); }; HTMLAnchorElement.prototype.click = function () {}; return true; })()`);
// Scroll the window body by hand (never scrollIntoView, which moves the desktop too).
await js(`(() => { const body = document.querySelector('${frame('paint')} [data-window-body]'); const button = document.querySelector('[data-action="paint-download"]'); body.scrollTop += button.getBoundingClientRect().top - body.getBoundingClientRect().top - 40; return true; })()`);
await sleep(150);
await clickOn('[data-action="paint-download"]');
await until('!!window.__png', 3000);
const png = await js(`(async () => { const blob = window.__png; if (!blob) return null; const bitmap = await createImageBitmap(blob); return { type: blob.type, w: bitmap.width, h: bitmap.height }; })()`);
check('paint: the download is a 512 px PNG made in the browser', png?.type === 'image/png' && png.w === 512 && png.h === 512, png);
check('paint: no sideways scroll', await noOverflow('paint'));
await close('paint');

/* --- Network tools (APP-04) ----------------------------------------------------------- */

const setInput = (selector, value) =>
  js(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
const resourcesBefore = await js(`performance.getEntriesByType('resource').length`);
const keysBeforeNetwork = (await storageKeys()).join();
// Bring an element into the window body's view by hand (never scrollIntoView), then click it.
const clickIn = async (selector, app = 'network-tools') => {
  // Aim at what is actually visible: the window body, cut to the viewport (on a
  // phone the body can be taller than the screen).
  await js(`(() => { const body = document.querySelector('${frame(app)} [data-window-body]'); const el = document.querySelector(${JSON.stringify(selector)}); if (!body || !el) return false; const frameBox = body.getBoundingClientRect(); const top = Math.max(frameBox.top, 0); const bottom = Math.min(frameBox.bottom, innerHeight); const box = el.getBoundingClientRect(); const centre = box.top + box.height / 2; if (centre < top + 20 || centre > bottom - 20) body.scrollTop += centre - (top + bottom) / 2; return true; })()`);
  await sleep(120);
  return clickOn(selector);
};
await open('network-tools');
check('network: the subnet tab computes the default /24', await until(`document.querySelector('[data-subnet-fact="broadcast"]')?.textContent === '192.168.1.255'`, 3000), await text('[data-subnet-fact="broadcast"]'));
await setInput('[data-subnet-input]', '192.168.178.23/26');
await sleep(150);
check('network: /26 has 62 usable hosts', /62/.test((await text('[data-subnet-fact="usable"]')) ?? '') || /۶۲/.test((await text('[data-subnet-fact="usable"]')) ?? ''), await text('[data-subnet-fact="usable"]'));
check('network: the bits stay left-to-right', (await js(`document.querySelector('[data-subnet-bits] [role="img"]').dir`)) === 'ltr');
check('network: the gateway 192.168.1.1 is outside 192.168.178.0/26', (await js(`document.querySelector('[data-gateway-verdict]').dataset.gatewayVerdict`)) === 'otherSubnet');
await setInput('[data-gateway-input]', '192.168.178.1');
await sleep(150);
check('network: 192.168.178.1 fits', (await js(`document.querySelector('[data-gateway-verdict]').dataset.gatewayVerdict`)) === 'ok');
await clickIn('[data-network-example="169.254.12.7/16"]');
check('network: APIPA is recognised', (await js(`document.querySelector('[data-subnet-kind="linkLocal"]') !== null`)), await js(`[document.querySelector('[data-subnet-input]')?.value, document.querySelector('[data-subnet-kind]')?.dataset.subnetKind, document.querySelector('[data-network-panel]')?.dataset.networkPanel]`));
await clickIn('[data-split="18"]');
check('network: splitting a /16 lists four /18', (await js(`document.querySelector('[data-split-result]')?.dataset.splitResult`)) === '4');
check('network: subnet tab has no sideways scroll', await noOverflow('network-tools'));

await clickIn('[data-network-tab="ping"]');
check('network: ping says it is a simulation', (await js(`document.querySelector('[data-network-panel="ping"] [data-simulation]') !== null`)));
await clickIn('[data-network-example="127.0.0.1"]');
check('network: ping 127.0.0.1 finishes', await until(`document.querySelector('[data-ping-state]')?.dataset.pingState === 'done'`, 6000));
check('network: loopback answers in under a millisecond', /time<1ms/.test((await text('[data-ping-output]')) ?? '') && (await js(`document.querySelector('[data-ping-note="loopback"]') !== null`)));
await clickIn('[data-network-example="192.0.2.99"]');
check('network: a documentation address stays silent', await until(`document.querySelector('[data-ping-note="silent"]') !== null`, 6000) && /100% loss/.test((await text('[data-ping-output]')) ?? ''));
check('network: ping tab has no sideways scroll', await noOverflow('network-tools'));

await clickIn('[data-network-tab="dns"]');
await clickIn('[data-action="dns"]');
check('network: DNS walks resolver, root, TLD, authoritative', await until(`document.querySelector('[data-dns-state]')?.dataset.dnsState === 'found'`, 8000) && (await js(`document.querySelector('[data-dns-steps]').dataset.dnsSteps`)) === '4');
check('network: the CNAME is followed to the address', /CNAME[\s\S]*198\.51\.100\.140/.test((await text('[data-dns-output]')) ?? ''));
await clickIn('[data-action="dns"]');
check('network: the second lookup comes from the cache', await until(`document.querySelector('[data-dns-step]')?.dataset.dnsStep === 'cache' && document.querySelector('[data-dns-state]')?.dataset.dnsState === 'found'`, 4000));
await clickIn('[data-network-example="amonel.example TXT"]');
check('network: the hidden TXT record greets', await until(`/hello=curious-visitor/.test(document.querySelector('[data-dns-output]')?.textContent ?? '')`, 8000));
check('network: DNS tab has no sideways scroll', await noOverflow('network-tools'));

await clickIn('[data-network-tab="ports"]');
check('network: the port list starts complete', Number(await js(`document.querySelector('[data-port-table]')?.dataset.portTable`)) >= 20);
await setInput('[data-port-input]', '443');
await sleep(150);
check('network: 443 is https', (await js(`[...document.querySelectorAll('[data-port]')].map((row) => row.dataset.port).join()`)) === '443');
await setInput('[data-port-input]', '31337');
await sleep(150);
check('network: 31337 tells its story', (await js(`document.querySelector('[data-port-story="elite"]') !== null`)));
check('network: the firewall link goes to the last era', /\/amonel\/#era-7$/.test((await js(`document.querySelector('[data-port-era]')?.getAttribute('href')`)) ?? ''), await js(`document.querySelector('[data-port-era]')?.getAttribute('href')`));
check('network: ports tab has no sideways scroll', await noOverflow('network-tools'));
// The app's own chunk and copy load; after that, nothing: no request to anywhere.
const late = await js(`performance.getEntriesByType('resource').slice(${resourcesBefore}).map((entry) => entry.name).filter((name) => !name.startsWith(location.origin))`);
check('network: nothing is sent to any other host', late.length === 0, late);
check('storage: the network tools store nothing', (await storageKeys()).join() === keysBeforeNetwork, await storageKeys());

// APP-16: Ping and DNS hand their host to the Traceroute app, which opens and traces it.
await clickIn('[data-network-tab="ping"]');
await clickIn('[data-network-example="www.newyork.example"]');
check('network: ping offers "trace this host"', await until(`!!document.querySelector('[data-action="ping-trace"]')`, 6000));
await clickIn('[data-action="ping-trace"]');
check('network: ping hands the host to the Traceroute app, which traces it', await until(`document.querySelector('[data-app-content="traceroute"] [data-trace-input]')?.value === 'www.newyork.example' && !!document.querySelector('[data-app-content="traceroute"] [data-trace]')`, 6000), await js(`document.querySelector('[data-app-content="traceroute"] [data-trace-input]')?.value ?? null`));
await close('traceroute');
await clickIn('[data-network-tab="dns"]');
await clickIn('[data-action="dns"]');
check('network: DNS offers "trace this host" once it found something', await until(`!!document.querySelector('[data-action="dns-trace"]')`, 8000));
await clickIn('[data-action="dns-trace"]');
check('network: DNS hands the name to the Traceroute app too', await until(`!!document.querySelector('[data-app-content="traceroute"] [data-trace]')`, 6000));
await close('traceroute');
await close('network-tools');

/* --- Time Machine (APP-05) ------------------------------------------------------------ */

const htmlTheme = () => js(`document.documentElement.dataset.theme ?? null`);
await open('time-machine');
// On a phone the app slides in fullscreen: let it settle before aiming at a capsule.
await sleep(700);
check('time machine: eight capsules', (await js(`document.querySelectorAll('[data-time-capsule]').length`)) === 8);
check('time machine: starts in the present', (await htmlTheme()) === 'modern' && (await js(`document.querySelector('[data-time-capsule="modern"]').getAttribute('aria-pressed')`)) === 'true');
check('storage: opening the Time Machine stores nothing', !(await js(`localStorage.getItem('amonel.theme.v1')`)));
await clickIn('[data-time-capsule="era1971"]', 'time-machine');
if (!REDUCE) check('time machine: the dial counts on the way', await until(`document.querySelector('[data-time-dial]')?.dataset.timeDial === 'travelling'`, 1000));
check('time machine: the whole desktop lands in 1971', await until(`document.documentElement.dataset.theme === 'era1971'`, 4000), await htmlTheme());
check('time machine: the choice is one versioned value', (await js(`localStorage.getItem('amonel.theme.v1')`)) === '{"v":1,"theme":"era1971"}', await js(`localStorage.getItem('amonel.theme.v1')`));
check('time machine: no sideways scroll', await noOverflow('time-machine'));
await b.goto(`${BASE}${PREFIX}/desktop/`, 5000);
check('time machine: a reload keeps the era on the desktop', await until(`document.documentElement.dataset.theme === 'era1971'`, 4000), await htmlTheme());
await b.goto(`${BASE}${PREFIX}/about/`, 3000);
check('time machine: other pages keep their own theme', (await htmlTheme()) === 'modern', await htmlTheme());
await b.goto(`${BASE}${PREFIX}/desktop/`, 5000);
await open('time-machine');
await js(`(() => { const el = document.querySelector('[data-time-year-input]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '1990'); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
await sleep(100);
await js(`(() => { const body = document.querySelector('${frame('time-machine')} [data-window-body]'); const el = document.querySelector('[data-action="time-year"]'); body.scrollTop += el.getBoundingClientRect().top - body.getBoundingClientRect().top - 80; return true; })()`);
await sleep(120);
await clickOn('[data-action="time-year"]');
check('time machine: 1990 lands in the Macintosh era', await until(`document.documentElement.dataset.theme === 'era1984'`, 4000), await htmlTheme());
await js(`document.querySelector('${frame('time-machine')} [data-window-body]').scrollTop = 0; true`);
await sleep(120);
await clickOn('[data-action="time-home"]');
check('time machine: back to the present', await until(`document.documentElement.dataset.theme === 'modern'`, 4000), await htmlTheme());
check('storage: the present removes the key', !(await js(`localStorage.getItem('amonel.theme.v1')`)));
await close('time-machine');

/* --- Batch planner (APP-06) ------------------------------------------------------------ */

const keysBeforeScheduler = (await storageKeys()).join();
await open('scheduler');
check('scheduler: its copy loaded', await until(`!/\\bscheduler\\.[a-zA-Z]/.test(document.querySelector('${content('scheduler')}')?.textContent ?? 'scheduler.x')`, 3000));
check('scheduler: the puzzle\'s four jobs in arrival order wait 28.75 minutes on average', (await js(`document.querySelector('[data-average-waiting]')?.dataset.averageWaiting`)) === '28.75', await js(`document.querySelector('[data-average-waiting]')?.dataset.averageWaiting`));
await clickIn('[data-scheduler-choice="sjf"]', 'scheduler');
check('scheduler: shortest first waits 7.75 and is marked the shortest of the three', (await js(`document.querySelector('[data-average-waiting]')?.dataset.averageWaiting`)) === '7.75' && (await js(`[...document.querySelectorAll('[data-compare][data-best]')].map((e) => e.dataset.compare).join()`)) === 'sjf');
check('scheduler: the sequence is drawn to scale', (await js(`[...document.querySelectorAll('[data-segment]')].map((e) => e.dataset.segment).join('')`)) === 'DBCA' && Number(await js(`document.querySelector('[data-scheduler-timeline]').dataset.schedulerTimeline`)) === 52);
await clickIn('[data-scheduler-choice="rr"]', 'scheduler');
check('scheduler: round robin asks for a time slice and counts the switches', (await js(`!!document.querySelector('[data-scheduler-quantum]') && Number(document.querySelector('[data-scheduler-switches]')?.dataset.schedulerSwitches) > 3`)));
await setInput('[data-scheduler-burst="A"]', '2');
await sleep(150);
check('scheduler: editing a job redraws the plan (2 + 5 + 15 + 2 = 24 minutes)', Number(await js(`document.querySelector('[data-scheduler-timeline]').dataset.schedulerTimeline`)) === 24);
await clickIn('[data-scheduler-preset="staggered"]', 'scheduler');
await clickIn('[data-scheduler-choice="fcfs"]', 'scheduler');
check('scheduler: the second example (arrivals over time) waits 9.75 in order', (await js(`document.querySelector('[data-average-waiting]')?.dataset.averageWaiting`)) === '9.75', await js(`document.querySelector('[data-average-waiting]')?.dataset.averageWaiting`));
await clickIn('[data-action="scheduler-add"]', 'scheduler');
check('scheduler: a job can be added', (await js(`document.querySelector('[data-scheduler-jobs]').dataset.schedulerJobs`)) === '5');
await clickIn('[data-action="scheduler-remove"][data-job="E"]', 'scheduler');
check('scheduler: and removed', (await js(`document.querySelector('[data-scheduler-jobs]').dataset.schedulerJobs`)) === '4');
check('scheduler: no sideways scroll', await noOverflow('scheduler'));
check('storage: the batch planner stores nothing', (await storageKeys()).join() === keysBeforeScheduler, await storageKeys());
await close('scheduler');

/* --- File tree (APP-07) ----------------------------------------------------------------- */

const keysBeforeFiles = (await storageKeys()).join();
await open('filesystem');
check('filesystem: its copy loaded', await until(`!/\\bfilesystem\\.[a-zA-Z]/.test(document.querySelector('${content('filesystem')}')?.textContent ?? 'filesystem.x')`, 3000));
const selectedPath = () => js(`document.querySelector('[data-fs-selected]')?.dataset.fsSelected ?? null`);
check('filesystem: it starts in the visitor\'s home, with the way down open', (await selectedPath()) === '/home/ahmadreza' && (await js(`!!document.querySelector('[data-fs-node="/home/ahmadreza/README.md"]')`)));
check('filesystem: hidden files are hidden until asked for', !(await js(`!!document.querySelector('[data-fs-node="/home/ahmadreza/.bash_history"]')`)));
await clickIn('[data-fs-hidden]', 'filesystem');
check('filesystem: "show hidden files" shows the dot file', await until(`!!document.querySelector('[data-fs-node="/home/ahmadreza/.bash_history"]')`, 2000));
await clickIn('[data-fs-node="/home/ahmadreza/projects"]', 'filesystem');
check('filesystem: clicking a folder selects it and opens it', (await selectedPath()) === '/home/ahmadreza/projects' && (await js(`!!document.querySelector('[data-fs-node="/home/ahmadreza/projects/amonel.md"]')`)));
await clickIn('[data-fs-node="/home/ahmadreza/projects/amonel.md"]', 'filesystem');
check('filesystem: clicking a file shows its path, from the root', (await text('[data-fs-path]')) === '/home/ahmadreza/projects/amonel.md' && (await js(`document.querySelectorAll('[data-fs-step]').length`)) === 5);
check('filesystem: it names the Terminal command that reads the file', /\$ cat \/home\/ahmadreza\/projects\/amonel\.md/.test((await text('[data-fs-commands]')) ?? ''), await text('[data-fs-commands]'));
await clickIn('[data-fs-step="/home"]', 'filesystem');
check('filesystem: a step in the path goes back up to that folder', (await selectedPath()) === '/home');
await clickIn('[data-fs-step="/"]', 'filesystem');
await clickIn('[data-fs-node="/etc"]', 'filesystem');
await clickIn('[data-fs-node="/etc/hostname"]', 'filesystem');
check('filesystem: a small file shows its contents', (await text('[data-fs-content="text"]')) === 'amonel', await text('[data-fs-content="text"]'));
await clickIn('[data-fs-node="/etc/motd"]', 'filesystem');
check('filesystem: a file of prose shows its words in the visitor\'s language', ((await text('[data-fs-content="message"]')) ?? '').length > 20 && !/^motd$/.test((await text('[data-fs-content="message"]')) ?? ''));
check('filesystem: no sideways scroll', await noOverflow('filesystem'));
check('storage: the file tree stores nothing', (await storageKeys()).join() === keysBeforeFiles, await storageKeys());
await close('filesystem');

/* --- storage and errors ---------------------------------------------------------------- */

const keys = await storageKeys();
check('storage: only listed keys', keys.every((key) => ALLOWED_KEYS.includes(key)), keys);
if (API) check('api: only allowlisted counters and /api/counts, never a body', wellFormed(apiCalls), apiCalls.slice(0, 8));
check('no console errors', b.errors.length === 0, b.errors.slice(0, 3));

const passed = log.filter((entry) => entry.ok).length;
console.log(`${QUIET ? '' : '\n'}${TAG}: ${passed}/${log.length} passed`);
b.close();
process.exit(passed === log.length ? 0 : 1);
