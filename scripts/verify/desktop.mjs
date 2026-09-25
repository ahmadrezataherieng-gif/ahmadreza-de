// End-to-end checks for the Amonel OS desktop (Phase 6).
//
//   node scripts/verify/desktop.mjs [--width 1280] [--height 800] [--locale de|en|fa]
//        [--reduce] [--touch] [--base URL]
//
// Without --touch, a wide viewport gets the window manager: windows are opened,
// dragged, resized, minimised, maximised, restored and closed with the mouse,
// with raw touch input (a touchscreen laptop) and with the keyboard alone, and
// z-order and focus are checked after each step. With --touch or a narrow
// viewport the page gets the home screen: apps open fullscreen and Back closes
// them. Both check the launcher or grid, a locked app's message and an unlocked
// bonus app.
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
const REDUCE = Boolean(args.reduce);
const TOUCH = Boolean(args.touch);
const BASE = args.base ?? 'http://localhost:3001';
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
const TAG = `desktop-${WIDTH}-${LOCALE}${REDUCE ? '-rm' : ''}${TOUCH ? '-touch' : ''}`;
const STORE = 'amonel.unlocks.v1';
const RTL = LOCALE === 'fa';

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
// APP-12: count audio contexts and oscillators from the very first script, to prove nothing sounds before the visitor turns sound on.
await b.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { const Original = window.AudioContext; if (!Original) return; window.__audio = { contexts: 0, oscillators: 0 }; window.AudioContext = class extends Original { constructor(...args) { super(...args); window.__audio.contexts++; const make = this.createOscillator.bind(this); this.createOscillator = () => { window.__audio.oscillators++; return make(); }; } }; })();` });

// The 1971 puzzle solved (its artifact unlocks the file tree); everything else locked.
await b.goto(`${BASE}${PREFIX}/`, 2500);
await js(
  `localStorage.setItem('${STORE}', JSON.stringify({ state: { artifacts: ['shell-token'], visitedEras: [], skippedEras: [], passedEras: ['unix'], legendEras: [], hasCompletedJourney: false, mode: 'guided' }, version: 2 })); sessionStorage.setItem('amonel.replay', '1'); true`,
);
await b.goto(`${BASE}${PREFIX}/desktop/`, 5000);

const layout = await js(`document.querySelector('[data-shell]')?.dataset.shellLayout ?? null`);
const expected = !TOUCH && WIDTH >= 768 ? 'desktop' : 'mobile';
check(`layout is the ${expected} shell`, layout === expected, layout);
check('arriving completes the journey', await js(`JSON.parse(localStorage.getItem('${STORE}')).state.hasCompletedJourney === true`));
check('arriving ends a replay', await js(`sessionStorage.getItem('amonel.replay') === null`));
check('modern theme', await js(`document.documentElement.dataset.theme === 'modern' || !document.documentElement.dataset.theme`), await js('document.documentElement.dataset.theme ?? null'));
const scripts = await js(`[...performance.getEntriesByType('resource')].map((e) => e.name).filter((n) => n.endsWith('.js'))`);
const noJourneyCode = await js(`(async () => {
  const urls = [...performance.getEntriesByType('resource')].map((e) => e.name).filter((n) => n.endsWith('.js'));
  for (const url of urls) { const text = await (await fetch(url)).text(); if (/ScrollTrigger|lenis-smooth|data-era-stage/.test(text)) return url; }
  return null;
})()`);
check('no GSAP, Lenis or era code loaded', noJourneyCode === null, noJourneyCode ?? `${scripts.length} scripts`);

const clock = await js(`document.querySelector('[data-clock]')?.textContent ?? ''`);
check(
  `clock in ${LOCALE}`,
  LOCALE === 'fa' ? /[۰-۹]/.test(clock) && !/[0-9]/.test(clock) : /\d{1,2}:\d{2}/.test(clock),
  clock,
);

const rectOf = (selector) =>
  js(`(() => { const e = document.querySelector('${selector}'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
const centre = async (selector) => {
  const r = await rectOf(selector);
  return r ? { x: r.cx, y: r.cy } : null;
};
const clickOn = async (selector) => {
  const point = await centre(selector);
  if (!point) return false;
  await b.click(point.x, point.y);
  await sleep(500);
  return true;
};
const activeIn = (selector) => js(`!!document.activeElement?.closest('${selector}')`);
const tabTo = async (selector, backwards = false, max = 80) => {
  for (let i = 0; i < max; i++) {
    if (await js(`!!document.activeElement?.matches(${JSON.stringify(selector)})`)) return true;
    await b.key('Tab', undefined, backwards ? ['Shift'] : []);
    await sleep(25);
  }
  return false;
};
const press = async (key, modifiers = []) => {
  await b.key(key, key === 'Enter' ? '\r' : undefined, modifiers);
  await sleep(220);
};
const win = (id) => `[data-window="${id}"]`;
const visible = (selector) =>
  js(`(() => { const e = document.querySelector('${selector}'); return !!e && getComputedStyle(e).visibility !== 'hidden' && Number(getComputedStyle(e).opacity) > 0.5; })()`);

if (layout === 'desktop') {
  const area = await rectOf('[data-window-layer]');

  /* --- mouse ---------------------------------------------------------------- */
  await clickOn('[data-app="about"]:not([data-locked])');
  await sleep(600);
  check('mouse: an icon opens its window', await visible(win('about')));
  check('mouse: the window is a labelled non-modal dialog', await js(`(() => { const w = document.querySelector('${win('about')}'); const id = w.getAttribute('aria-labelledby'); return w.getAttribute('role') === 'dialog' && w.getAttribute('aria-modal') === 'false' && !!document.getElementById(id)?.textContent; })()`));
  check('mouse: focus moves into the window', await activeIn(win('about')));
  await b.shot(`${TAG}-open`);

  // Windows open at the inline-start edge, so the room to move is toward the
  // inline end: physical right in German, left in Persian. Every move below
  // stays within the room there is, since a window stops at the edge.
  const toEnd = (rect) => (RTL ? rect.x - area.x : area.x + area.w - rect.x - rect.w);
  const before = await rectOf(win('about'));
  const shift = Math.min(200, toEnd(before) - 40);
  const grip = await centre(`${win('about')} [data-window-grip]`);
  await b.drag(grip, { x: grip.x + (RTL ? -shift : shift), y: grip.y + 90 });
  await sleep(300);
  const moved = await rectOf(win('about'));
  check('mouse: drag moves the window with the pointer', Math.abs(Math.abs(moved.x - before.x) - shift) <= 2 && Math.sign(moved.x - before.x) === (RTL ? -1 : 1) && Math.abs(moved.y - before.y - 90) <= 2, { before, moved, shift });

  // Resize from the bottom corner at the end edge: right in German, left in Persian.
  // Within the room there is on both axes: a window stops at the desktop's edge.
  const grow = Math.min(120, toEnd(moved) - 8);
  const growY = Math.min(70, area.y + area.h - moved.y - moved.h - 8);
  const corner = await centre(`${win('about')} [data-resize="bottom-end"]`);
  await b.drag(corner, { x: corner.x + (RTL ? -grow : grow), y: corner.y + growY });
  await sleep(300);
  const resized = await rectOf(win('about'));
  check('mouse: the corner resizes', growY > 10 && Math.abs(resized.w - moved.w - grow) <= 2 && Math.abs(resized.h - moved.h - growY) <= 2, { moved, resized, grow, growY });

  const grip2 = await centre(`${win('about')} [data-window-grip]`);
  await b.drag(grip2, { x: grip2.x - 3000, y: grip2.y - 3000 });
  await sleep(300);
  const pinned = await rectOf(win('about'));
  check('mouse: the window stays inside the desktop', pinned.x >= area.x - 1 && pinned.y >= area.y - 1 && pinned.x + pinned.w <= area.x + area.w + 1, { pinned, area });

  await clickOn(`${win('about')} [data-action="window-maximise"]`);
  const maxed = await rectOf(win('about'));
  check('mouse: maximise fills the desktop', Math.abs(maxed.w - area.w) <= 2 && Math.abs(maxed.h - area.h) <= 2, { maxed, area });
  await clickOn(`${win('about')} [data-action="window-restore"]`);
  const restored = await rectOf(win('about'));
  check('mouse: restore returns to the previous size', Math.abs(restored.w - pinned.w) <= 2 && Math.abs(restored.h - pinned.h) <= 2, { restored, pinned });
  const bar = await centre(`${win('about')} [data-window-grip]`);
  await b.dblclick(bar.x, bar.y);
  await sleep(400);
  check('mouse: double-clicking the title maximises', (await js(`document.querySelector('${win('about')}').dataset.mode`)) === 'maximised');
  const bar2 = await centre(`${win('about')} [data-window-grip]`);
  await b.dblclick(bar2.x, bar2.y);
  await sleep(400);
  check('mouse: double-clicking again restores', (await js(`document.querySelector('${win('about')}').dataset.mode`)) === 'normal');

  await clickOn(`${win('about')} [data-action="window-minimise"]`);
  await sleep(400);
  check('mouse: minimise hides the window', !(await visible(win('about'))));
  check('mouse: minimise moves focus to its taskbar button', await js(`document.activeElement?.dataset.taskbarWindow === 'about'`));
  await clickOn('[data-taskbar-window="about"]');
  await sleep(400);
  check('mouse: its taskbar button brings it back', await visible(win('about')));

  // z-order: a second window opens on top; clicking the first raises it again.
  // From the launcher: the About window now covers the icon column, as a
  // window on a desktop does.
  await clickOn('[data-action="launcher"]');
  await sleep(300);
  await clickOn('[data-launcher] [data-app="terminal"]');
  await sleep(600);
  const zOf = (id) => js(`getComputedStyle(document.querySelector('${win(id)}')).zIndex`);
  const zOrder = async () => ({ about: Number(await zOf('about')), terminal: Number(await zOf('terminal')) });
  const z1 = await zOrder();
  check('z-order: a new window opens on top', z1.terminal > z1.about, z1);
  const aboutBody = await rectOf(`${win('about')} [data-window-body]`);
  const terminal = await rectOf(win('terminal'));
  // Click a part of the About window the terminal does not cover.
  const spot = RTL ? { x: aboutBody.x + aboutBody.w - 12, y: aboutBody.y + aboutBody.h - 12 } : { x: aboutBody.x + 12, y: aboutBody.y + aboutBody.h - 12 };
  const covered = spot.x > terminal.x && spot.x < terminal.x + terminal.w && spot.y > terminal.y && spot.y < terminal.y + terminal.h;
  await b.click(spot.x, spot.y);
  await sleep(400);
  const z2 = await zOrder();
  check('z-order: clicking a window raises it', covered || z2.about > z2.terminal, { z2, covered });
  check('focus: clicking a window focuses it', covered || (await js(`document.querySelector('${win('about')}').hasAttribute('data-focused')`)));

  // Bring the terminal forward first: the raised About window may cover its close button.
  await clickOn('[data-taskbar-window="terminal"]');
  await sleep(300);
  await clickOn(`${win('terminal')} [data-action="window-close"]`);
  await sleep(700);
  check('mouse: close removes the window', (await rectOf(win('terminal'))) === null);
  // It was opened from the launcher, which has closed since: focus goes to the
  // window that is now in front.
  check('focus: closing moves focus to the next window', await activeIn(win('about')), await js('document.activeElement?.outerHTML.slice(0, 80)'));

  /* --- touch (a touchscreen laptop: fine primary pointer, raw touch input) -- */
  // Toward whichever side has room: the edge test above left it against one.
  const tBefore = await rectOf(win('about'));
  const physicalRoomRight = area.x + area.w - tBefore.x - tBefore.w;
  const tShift = physicalRoomRight > 60 ? 50 : -50;
  const tGrip = await centre(`${win('about')} [data-window-grip]`);
  await b.drag(tGrip, { x: tGrip.x + tShift, y: tGrip.y + 40 }, 12, 'touch');
  await sleep(300);
  const tAfter = await rectOf(win('about'));
  check('touch: dragging the title bar moves the window', Math.abs(tAfter.x - tBefore.x - tShift) <= 3 && Math.abs(tAfter.y - tBefore.y - 40) <= 3, { tBefore, tAfter, tShift });
  const tGrowX = Math.min(40, (RTL ? tAfter.x - area.x : area.x + area.w - tAfter.x - tAfter.w) - 4);
  const tGrowY = Math.min(30, area.y + area.h - tAfter.y - tAfter.h - 4);
  const tCorner = await centre(`${win('about')} [data-resize="bottom-end"]`);
  await b.drag(tCorner, { x: tCorner.x + (RTL ? -tGrowX : tGrowX), y: tCorner.y + tGrowY }, 12, 'touch');
  await sleep(300);
  const tResized = await rectOf(win('about'));
  check('touch: the corner resizes', tGrowX > 10 && tGrowY > 10 && Math.abs(tResized.w - tAfter.w - tGrowX) <= 3 && Math.abs(tResized.h - tAfter.h - tGrowY) <= 3, { tAfter, tResized, tGrowX, tGrowY });
  await clickOn(`${win('about')} [data-action="window-close"]`);
  await sleep(700);

  /* --- keyboard only --------------------------------------------------------- */
  await js(`document.activeElement?.blur(); true`);
  check('keyboard: Tab reaches a desktop icon', await tabTo('[data-app="contact"]'));
  await press('Enter');
  await sleep(500);
  check('keyboard: Enter opens it and focus goes in', await activeIn(win('contact')));
  check('keyboard: Shift+Tab reaches the title bar', await tabTo(`${win('contact')} [data-window-grip]`, true));
  const k0 = await rectOf(win('contact'));
  await press('ArrowRight');
  await press('ArrowRight');
  await press('ArrowDown');
  const k1 = await rectOf(win('contact'));
  check('keyboard: arrow keys move the window', k1.x - k0.x === 32 && k1.y - k0.y === 16, { k0, k1 });
  await press('ArrowRight', ['Shift']);
  await press('ArrowDown', ['Shift']);
  const k2 = await rectOf(win('contact'));
  check('keyboard: Shift+arrows resize it', k2.w - k1.w === 16 && k2.h - k1.h === 16, { k1, k2 });
  await press('Enter');
  check('keyboard: Enter maximises', (await js(`document.querySelector('${win('contact')}').dataset.mode`)) === 'maximised');
  await press('Enter');
  check('keyboard: Enter again restores', (await js(`document.querySelector('${win('contact')}').dataset.mode`)) === 'normal');
  check('keyboard: Tab reaches minimise', await tabTo(`${win('contact')} [data-action="window-minimise"]`));
  await press('Enter');
  await sleep(300);
  check('keyboard: minimised, focus on its taskbar button', !(await visible(win('contact'))) && (await js(`document.activeElement?.dataset.taskbarWindow === 'contact'`)));
  await press('Enter');
  await sleep(400);
  check('keyboard: the taskbar button restores it', (await visible(win('contact'))) && (await activeIn(win('contact'))));

  // A second window, then Alt+Shift+Arrow cycles focus between them.
  await js(`document.activeElement?.blur(); true`);
  await tabTo('[data-app="cv"]');
  await press('Enter');
  await sleep(500);
  const focusedWindow = () => js(`document.activeElement?.closest('[data-window]')?.dataset.window ?? null`);
  const first = await focusedWindow();
  await press('ArrowRight', ['Alt', 'Shift']);
  await sleep(300);
  const second = await focusedWindow();
  await press('ArrowRight', ['Alt', 'Shift']);
  await sleep(300);
  const third = await focusedWindow();
  check('keyboard: Alt+Shift+Arrow cycles windows', first === 'cv' && second === 'contact' && third === 'cv', { first, second, third });
  const zc = { cv: Number(await zOf('cv')), contact: Number(await zOf('contact')) };
  check('z-order: the cycled-to window is on top', zc.cv > zc.contact, zc);
  check('keyboard: Tab reaches close', await tabTo(`${win('cv')} [data-action="window-close"]`));
  await press('Enter');
  await sleep(700);
  check('keyboard: Enter closes it', (await rectOf(win('cv'))) === null);
  check('focus: after close it returns to the opener', await js(`document.activeElement?.dataset.app === 'cv'`));
  await clickOn(`${win('contact')} [data-action="window-close"]`);
  await sleep(700);

  /* --- reduced motion ---------------------------------------------------------- */
  await clickOn('[data-app="about"]:not([data-locked])');
  await sleep(500);
  const motion = await js(`(() => { const w = document.querySelector('${win('about')}'); const s = getComputedStyle(w); return { animation: s.animationName, transition: s.transitionDuration }; })()`);
  // The global reduced-motion reset leaves transitions at 0.01ms: none to see.
  const instant = motion.transition.split(',').every((value) => parseFloat(value) <= 0.00001);
  if (REDUCE) check('reduced motion: windows open without animation', motion.animation === 'none' && instant, motion);
  else check('motion: windows animate open', motion.animation !== 'none', motion);
  await clickOn(`${win('about')} [data-action="window-close"]`);
  await sleep(700);

  /* --- launcher ----------------------------------------------------------------- */
  await clickOn('[data-action="launcher"]');
  await sleep(300);
  check('launcher: opens', await js(`!document.querySelector('[data-launcher]').hidden`));
  check('launcher: lists all sixteen apps', (await js(`document.querySelectorAll('[data-launcher] [data-app]').length`)) === 16);
  check('launcher: focus moves into it', await activeIn('[data-launcher]'));
  await b.shot(`${TAG}-launcher`);
  await clickOn('[data-launcher] [data-app="paint"]');
  await sleep(400);
  const notice = await js(`document.querySelector('[data-locked-notice]')?.textContent ?? ''`);
  check('launcher: a locked app names the puzzle that unlocks it', /1984/.test(notice), notice);
  check('launcher: a locked app opens no window', (await rectOf(win('paint'))) === null);
  await b.shot(`${TAG}-locked`);
  await clickOn('[data-action="launcher"]');
  await sleep(300);
  await clickOn('[data-launcher] [data-app="filesystem"]');
  await sleep(700);
  check('launcher: an unlocked bonus app opens', await visible(win('filesystem')));
  check('launcher: it is the real file tree, not a stand-in', await js(`!!document.querySelector('${win('filesystem')} [data-app-content="filesystem"] [data-fs-tree]')`));
  check('launcher: opening closes it', await js(`document.querySelector('[data-launcher]').hidden`));
  await clickOn('[data-action="launcher"]');
  await press('Escape');
  check('launcher: Escape closes it and returns focus', (await js(`document.querySelector('[data-launcher]').hidden`)) && (await js(`document.activeElement?.dataset.action === 'launcher'`)));
  // From the launcher: windows may cover the icon column by now.
  await clickOn('[data-action="launcher"]');
  await sleep(300);
  await clickOn('[data-launcher] [data-app="time-machine"]');
  const todayNotice = await js(`document.querySelector('[data-locked-notice]')?.textContent ?? ''`);
  check('desktop icon: the last era says "today", not a year', !/2024/.test(todayNotice) && todayNotice.length > 10, todayNotice);
  await clickOn('[data-action="locked-dismiss"]');

  /* --- placeholders --------------------------------------------------------------- */
  await clickOn('[data-app="cv"]');
  await sleep(600);
  check('CV: no download link while the PDF is missing', (await js(`document.querySelectorAll('${win('cv')} a[download]').length`)) === 0);
  check('taskbar: the résumé control is disabled text', (await js(`document.querySelector('[data-action="taskbar-resume"]').tagName`)) === 'SPAN');
  // From the launcher: open windows cover the icon column by now.
  await clickOn('[data-action="launcher"]');
  await sleep(300);
  await clickOn('[data-launcher] [data-app="contact"]');
  await sleep(600);
  // The address was confirmed in Phase 7 (EMAIL.available).
  check('Contact: the confirmed address is a mailto link', (await js(`document.querySelector('${win('contact')} a[href="mailto:ahmadrezataheride@gmail.com"]') !== null`)));
  await b.shot(`${TAG}-windows`);
} else {
  /* --- the home screen ------------------------------------------------------------ */
  await b.shot(`${TAG}-home`);
  const dock = await js(`[...document.querySelectorAll('[data-dock] [data-app]')].map((e) => e.dataset.app)`);
  check('mobile: the dock holds About, CV, Contact, Assistant', JSON.stringify(dock) === JSON.stringify(['about', 'cv', 'contact', 'assistant']), dock);
  check('mobile: the grid holds the other twelve', (await js(`document.querySelectorAll('.ao-home [data-app]').length`)) === 12);
  const lengthBefore = await js('history.length');
  await clickOn('.ao-home [data-app="terminal"]');
  await sleep(500);
  check('mobile: an app opens fullscreen', await js(`(() => { const a = document.querySelector('[data-mobile-app="terminal"]'); if (!a) return false; const r = a.getBoundingClientRect(); return r.width >= innerWidth - 4 && r.height >= innerHeight * 0.95; })()`));
  check('mobile: focus moves into the app', await activeIn('[data-mobile-app]'));
  await b.shot(`${TAG}-app`);
  check('mobile: opening pushed a history entry', (await js('history.length')) === lengthBefore + 1);
  await js('history.back(); true');
  await sleep(700);
  check("mobile: the browser's Back closes the app", (await rectOf('[data-mobile-app]')) === null);
  check('mobile: Back stays on the desktop', (await js('location.pathname')).endsWith('/desktop/'));
  check('mobile: focus returns to the icon', await js(`document.activeElement?.dataset.app === 'terminal'`));
  await clickOn('[data-dock] [data-app="cv"]');
  await sleep(500);
  await clickOn('[data-action="mobile-back"]');
  await sleep(700);
  check('mobile: the back button closes the app', (await rectOf('[data-mobile-app]')) === null);
  await clickOn('.ao-home [data-app="network-tools"]');
  const notice = await js(`document.querySelector('[data-locked-notice]')?.textContent ?? ''`);
  check('mobile: a locked app names the puzzle that unlocks it', /1995/.test(notice), notice);
  await b.shot(`${TAG}-locked`);
  await clickOn('.ao-home [data-app="filesystem"]');
  await sleep(500);
  check('mobile: an unlocked bonus app opens', !!(await rectOf('[data-mobile-app="filesystem"]')));
  await js('history.back(); true');
  await sleep(500);
}


// APP-12: sound is off until a click, and then the desktop's own events make it.
const audio = () => js(`window.__audio ?? { contexts: 0, oscillators: 0 }`);
const soundOn = () => js(`document.querySelector('[data-action="sound-toggle"]')?.getAttribute('aria-pressed')`);
check('sound: nothing sounded on load, in any window opened so far', (await audio()).contexts === 0 && (await audio()).oscillators === 0, await audio());
check('sound: the switch is off to begin with', (await soundOn()) === 'false');
await clickOn('[data-action="sound-toggle"]');
await sleep(300);
check('sound: a click turns it on and answers with a sound', (await soundOn()) === 'true' && (await audio()).contexts === 1 && (await audio()).oscillators > 0, await audio());
const before = (await audio()).oscillators;
// A script click: earlier windows may cover the icon.
await js(`document.querySelector('${layout === 'desktop' ? '[data-layout="desktop"] nav [data-app="quiz"]' : '.ao-home [data-app="quiz"]'}').click(); true`);
await sleep(500);
check('sound: opening an app makes its sound, on the one context', (await audio()).oscillators > before && (await audio()).contexts === 1, await audio());
if (layout !== 'desktop') {
  await js('history.back(); true');
  await sleep(500);
}
await clickOn('[data-action="sound-toggle"]');
await sleep(200);
const muted = (await audio()).oscillators;
check('sound: a second click turns it off', (await soundOn()) === 'false');
await js(`document.querySelector('${layout === 'desktop' ? '[data-layout="desktop"] nav [data-app="tickets"]' : '.ao-home [data-app="tickets"]'}').click(); true`);
await sleep(400);
check('sound: and it stays quiet', (await audio()).oscillators === muted, await audio());
check('sound: nothing is stored for it', !(await js(`Object.keys(localStorage).concat(Object.keys(sessionStorage)).some((key) => /sound|audio/i.test(key))`)));
check('no console errors', b.errors.length === 0, b.errors.slice(0, 3));
const passed = log.filter((entry) => entry.ok).length;
console.log(`${QUIET ? '' : '\n'}${TAG}: ${passed}/${log.length} passed`);
b.close();
process.exit(passed === log.length ? 0 : 1);
