// End-to-end verification of the journey with real input over CDP.
//
//   node scripts/verify/journey.mjs --mode play|watch [--width 1280] [--height 800]
//        [--locale de|en|fa] [--reduce] [--touch] [--tag name] [--base http://localhost:3001]
//
// Needs a running dev or static server. Prints PASS/FAIL per check and a
// summary; exits 1 if anything failed. Screenshots go to VERIFY_OUT.
import { launch, sleep, OUT } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const MODE = args.mode === 'watch' ? 'watch' : 'play';
const WIDTH = Number(args.width ?? 1280);
const HEIGHT = Number(args.height ?? 800);
const LOCALE = args.locale ?? 'de';
const REDUCE = Boolean(args.reduce);
const TOUCH = Boolean(args.touch);
const BASE = args.base ?? 'http://localhost:3001';
const TAG = args.tag ?? `${MODE}-${WIDTH}-${LOCALE}${REDUCE ? '-rm' : ''}${TOUCH ? '-touch' : ''}${args.tier ? `-${args.tier}` : ''}`;
const PREFIX = LOCALE === 'de' ? '' : `/${LOCALE}`;
// The motion tier is chosen from the device before first paint; ?tier= forces
// one, so both paths can be walked at any width.
const TIER = args.tier === 'light' || args.tier === 'full' ? args.tier : null;
const JOURNEY = `${BASE}${PREFIX}/journey/${TIER ? `?tier=${TIER}` : ''}`;
const ERAS = ['eniac', 'batch', 'unix', 'dos', 'macintosh', 'win95', 'cloud'];
const STORE = 'ahmados.unlocks.v1';

const log = [];
const check = (name, ok, detail) => {
  log.push({ name, ok: Boolean(ok) });
  const extra = detail === undefined ? '' : ` :: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra}`);
};

const b = await launch({ width: WIDTH, height: HEIGHT, reduce: REDUCE, touch: TOUCH, tag: TAG });
const js = (code) => b.evaluate(code);
const store = () => js(`JSON.parse(localStorage.getItem('${STORE}') ?? '{"state":{}}').state`);
const dialogOpen = () => js(`!!document.querySelector('[role="dialog"]')`);
const dialogText = () => js(`document.querySelector('[role="dialog"]')?.innerText ?? ''`);
const scrollMax = () => js(`document.documentElement.scrollHeight - innerHeight`);
const gated = () => js(`document.querySelector('[data-gated]')?.dataset.era ?? null`);

const scrollTo = async (y) => {
  await js(`window.scrollTo(0, ${y}); true`);
  await sleep(1600);
  await js(`window.scrollTo(0, ${y}); true`);
  await sleep(1100);
};

/** Document y at progress p through an era's puzzle segment. */
const puzzleY = (index, p) =>
  js(`(() => {
    const s = document.getElementById('era-${index}');
    const stage = s.querySelector('[data-era-stage]');
    const layer = s.querySelector('[data-puzzle-layer]');
    const top = s.getBoundingClientRect().top + scrollY;
    if (getComputedStyle(stage).position === 'sticky') {
      // Since Phase 5.5B the section's phases are marked in the document
      // itself, so this reads the same pixels the resolver does.
      const at = (name) => s.querySelector('[data-mark="' + name + '"]').getBoundingClientRect().top + scrollY;
      const start = at('puzzle');
      return Math.round(start + (at('out') - start) * ${p});
    }
    const lt = layer.getBoundingClientRect().top + scrollY;
    const panel = layer.querySelector('[data-puzzle-sticky]');
    const sticky = getComputedStyle(panel).position === 'sticky';
    return Math.round(sticky ? lt + (layer.offsetHeight - panel.offsetHeight) * ${p} : lt - 40);
  })()`);

const tabTo = async (selector, max = 80) => {
  for (let i = 0; i < max; i++) {
    if (await js(`!!document.activeElement?.matches(${JSON.stringify(selector)})`)) return true;
    await b.key('Tab');
    await sleep(30);
  }
  return false;
};

const press = async (key, times = 1) => {
  for (let i = 0; i < times; i++) {
    await b.key(key, key === ' ' ? ' ' : key === 'Enter' ? '\r' : undefined);
    await sleep(70);
  }
};

/** Bring an element on screen the way a visitor would, then click or tap it. */
const clickOn = async (selector) => {
  const off = await js(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= innerHeight - 70) return false;
    window.scrollTo(0, scrollY + r.top - innerHeight / 2);
    return true;
  })()`);
  if (off === null) return false;
  if (off) await sleep(1400);
  // Only click what a visitor could: the element must be what the pointer hits
  // there, and visible. A click that lands on an invisible layer proves nothing.
  const r = await js(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const r = el?.getBoundingClientRect();
    if (!r) return null;
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    let visible = true;
    for (let n = el; n; n = n.parentElement) if (Number(getComputedStyle(n).opacity) < 0.05) visible = false;
    return { x, y, hits: !!hit && (hit === el || el.contains(hit)), visible };
  })()`);
  if (!r) return false;
  if (!r.hits || !r.visible) {
    console.log(`  (not clickable: ${selector} ${JSON.stringify(r)})`);
    return false;
  }
  await b.click(r.x, r.y);
  await sleep(600);
  return true;
};

const inDialog = (selector) => `[role="dialog"] ${selector}`;
const outcome = () => js(`document.querySelector('[role="dialog"] [role="status"]')?.innerText ?? null`);

/* --- landing ----------------------------------------------------------------- */

await b.goto(`${BASE}${PREFIX}/`, 5000);
await b.shot(`${TAG}-landing`);
const landing = await js(`(() => ({
  h1: document.querySelector('h1')?.textContent,
  facts: [...document.querySelectorAll('dl dd')].map((d) => getComputedStyle(d).fontWeight),
  resume: document.querySelectorAll('[aria-disabled="true"]').length,
  mailto: document.querySelectorAll('a[href^="mailto:"]').length,
  gsap: [...document.scripts].some((s) => (s.textContent ?? '').includes('ScrollTrigger')),
  overflow: document.documentElement.scrollWidth - innerWidth,
}))()`);
check('landing: name heading', landing.h1?.includes('Taheri') || landing.h1?.includes('طاهری'), landing.h1);
check('landing: facts bold', landing.facts.every((w) => Number(w) >= 700), landing.facts);
check('landing: two disabled résumé controls', landing.resume === 2, landing.resume);
check('landing: no mailto while email unavailable', landing.mailto === 0);
check('landing: no horizontal overflow', landing.overflow <= 0, landing.overflow);

const cardIndex = MODE === 'watch' ? 0 : 1;
const card = await js(`(() => { const el = document.querySelectorAll('a[href*="journey"]')[${cardIndex}]; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
await sleep(400);
await b.click(card.x, card.y);
await sleep(9000);
check('landing card opens the journey', (await js('location.pathname')).includes('journey'));
check('mode stored', (await store()).mode === (MODE === 'watch' ? 'guided' : 'interactive'));
if (TIER) {
  // The mode is persisted, so reloading with the tier forced keeps the run.
  await b.goto(JOURNEY, 9000);
  check(`tier forced: ${TIER}`, (await js('document.documentElement.dataset.tier')) === TIER);
}

/* --- watch mode ---------------------------------------------------------------- */

if (MODE === 'watch') {
  check('watch: no gate', (await gated()) === null);
  // Real input alone must carry the visitor through the whole journey - a
  // puzzle card under the finger or the pointer must never stop the page.
  if (!REDUCE) {
    let swipes = 0;
    while (swipes < 160 && !(await js('scrollY >= document.documentElement.scrollHeight - innerHeight - 4'))) {
      await b.swipe(Math.round(HEIGHT * 0.7));
      await sleep(140);
      swipes += 1;
    }
    check(`watch: ${TOUCH ? 'swipes' : 'the wheel'} alone reach the end`, await js('scrollY >= document.documentElement.scrollHeight - innerHeight - 4'), { swipes, y: await js('Math.round(scrollY)') });
    await js('window.scrollTo(0, 0); true');
    await sleep(1500);
  }
  for (const [i, era] of ERAS.entries()) {
    const index = i + 1;
    await scrollTo(await puzzleY(index, 0.02));
    await scrollTo(await puzzleY(index, 0.5));
    const mid = await js(`(() => {
      const root = document.querySelector('[data-puzzle="${era}"]');
      return { mounted: !!root, pointer: !!root?.querySelector('.ao-guided-pointer'), moth: !!root?.querySelector('.ao-moth') };
    })()`);
    await b.shot(`${TAG}-${era}-mid`);
    await scrollTo(await puzzleY(index, 0.97));
    const end = await js(`(() => {
      const root = document.querySelector('[data-puzzle="${era}"]');
      const success = root?.querySelector('p.text-success');
      return { success: success ? getComputedStyle(success).opacity : null, name: !!root?.querySelector('svg[aria-label="AHMADREZA"]'), insider: /insider|خودی/i.test(root?.innerText ?? '') };
    })()`);
    await b.shot(`${TAG}-${era}-end`);
    check(`watch ${era}: mounted`, mid.mounted);
    if (!REDUCE) check(`watch ${era}: pointer mid-way`, mid.pointer);
    if (era === 'eniac' && !REDUCE) check('watch eniac: moth on the card', mid.moth);
    check(`watch ${era}: success at the end`, Number(end.success) > 0.9, end.success);
    if (era === 'eniac') check('watch eniac: name built at the end', end.name);
    check(`watch ${era}: insider note at the end`, end.insider);
  }
  const s = await store();
  check('watch: no artifacts, no badges, nothing passed', !s.artifacts?.length && !s.legendEras?.length && !s.passedEras?.length, s);

  // Take over one puzzle: the mode flips, the dialog opens, the gate stays off
  // for eras already behind the visitor.
  await scrollTo(await puzzleY(4, 0.5));
  const took = await clickOn('[data-puzzle="dos"] [data-action="try"]');
  await sleep(900);
  check('watch: try myself opens the puzzle', took && (await dialogOpen()));
  check('watch: try myself switches to play', (await store()).mode === 'interactive');
  await press('Escape');
  await sleep(800);
  check('watch: escape closes', !(await dialogOpen()));
}

/* --- play mode ----------------------------------------------------------------- */

if (MODE === 'play') {
  // The gate: nothing past era 1's puzzle can be reached, by any input.
  await sleep(500);
  check('play: era 1 gated', (await gated()) === 'eniac', await gated());
  const limit = await scrollMax();
  // Since Phase 5.5B era 2's box overlaps era 1's puzzle - it carries the
  // crossing between them - so what matters is that none of era 2 is visible
  // at the end of the page, not where its box begins.
  // In document flow (phones, reduced motion) nothing overlaps, so the page
  // simply has to end above era 2's box.
  const era2 = await js(`(() => {
    const s = document.getElementById('era-2');
    const scene = s.querySelector('[data-era-scene]');
    const art = s.querySelector('.ao-bridge-art');
    return {
      pinned: getComputedStyle(s.querySelector('[data-era-stage]')).position === 'sticky',
      top: Math.round(s.getBoundingClientRect().top + scrollY),
      visual: Math.round(s.querySelector('[data-mark="visual"]').getBoundingClientRect().top + scrollY),
      scene: Number(getComputedStyle(scene).opacity),
      art: art ? Number(getComputedStyle(art).opacity) : 0,
    };
  })()`);
  check(
    'play: page ends before era 2',
    era2.pinned
      ? limit + HEIGHT <= era2.visual + 1 && era2.scene < 0.01 && era2.art < 0.01
      : limit + HEIGHT <= era2.top + 1,
    { limit, ...era2 },
  );
  // The input itself must scroll the page, or the gate checks below would pass
  // on a page that cannot move at all.
  await js('window.scrollTo(0, 0); true');
  await sleep(1200);
  await b.swipe(500);
  await sleep(1500);
  const moved = await js('Math.round(scrollY)');
  check(`play: ${TOUCH ? 'a touch swipe' : 'the wheel'} scrolls the page`, moved > 100, moved);
  await js('window.scrollTo(0, 1e7); true');
  await sleep(1500);
  check('play: scrollTo cannot pass the gate', (await js('scrollY')) <= limit + 1);
  for (let i = 0; i < 6; i++) await b.swipe(1500);
  await sleep(1500);
  check(`play: ${TOUCH ? 'touch swipes' : 'wheel'} cannot pass the gate`, (await js('scrollY')) <= limit + 1, await js('scrollY'));
  await js(`document.activeElement?.blur(); true`);
  await press('End');
  await press('PageDown', 3);
  await sleep(1200);
  check('play: keyboard cannot pass the gate', (await js('scrollY')) <= limit + 1);
  check('play: later eras are inert', await js(`document.getElementById('era-2').hasAttribute('inert') && document.getElementById('convergence').hasAttribute('inert')`));
  const cue = await js(`(() => { const c = document.querySelector('.ao-gate-cue'); if (!c) return null; const r = c.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), text: c.innerText }; })()`);
  check('play: the lock cue is on screen at the gate', cue && cue.top >= 0 && cue.top < HEIGHT, cue);
  await b.shot(`${TAG}-gate`);

  // 1946 by keyboard, opened from the lock cue, with the deck trick.
  await clickOn('[data-action="gate-open"]');
  await sleep(1500);
  check('eniac: cue opens the puzzle', await dialogOpen());
  check('eniac: moth crawls in', await js(`!!document.querySelector('[role="dialog"] .ao-moth--timed')`));
  check('eniac: hint and reveal offered at once', await js(`!!document.querySelector('${inDialog('[data-action="hint"]')}:not([disabled])') && !!document.querySelector('${inDialog('[data-action="reveal"]')}:not([disabled])')`));
  check('eniac: no skip in play', !(await js(`!!document.querySelector('[role="dialog"] [data-action="skip"]')`)));
  await tabTo(inDialog('[data-action="hint"]'));
  await press('Enter');
  await sleep(300);
  check('eniac: hint shown', (await js(`document.querySelector('[role="dialog"] [aria-live="polite"]')?.innerText.length ?? 0`)) > 10);
  check('eniac: deck by keyboard', await tabTo(inDialog('[data-target="deck-5"]')));
  await press('Enter');
  await tabTo(inDialog('[data-target="deck-2"]'));
  await press('Enter');
  await tabTo(inDialog('[data-target="deck-7"]'));
  await press('Enter');
  await tabTo(inDialog('[data-target="deck-6"]'));
  await press('Enter');
  await sleep(300);
  check('eniac: deck sorted awards the legend badge', (await store()).legendEras?.includes('eniac'));
  check('eniac: grid by keyboard', await tabTo(inDialog('[role="grid"] button')));
  await press('ArrowRight', 4);
  await press('ArrowDown', 7);
  await press(' ');
  await press('ArrowUp');
  await press(' ');
  await sleep(900);
  const eniac = await js(`(() => { const d = document.querySelector('[role="dialog"]'); return {
    status: !!d?.querySelector('[role="status"]'),
    leaving: !!d?.querySelector('.ao-moth--leave'),
    name: !!d?.querySelector('svg[aria-label="AHMADREZA"]'),
    bits: d?.querySelectorAll('.ao-bit').length ?? 0,
    text: d?.innerText ?? '' }; })()`);
  check('eniac: solved', eniac.status);
  check('eniac: moth leaves', REDUCE || eniac.leaving);
  check('eniac: name built from bits', eniac.name && eniac.bits > 100, eniac.bits);
  check('eniac: bug history is Harvard 1947, not ENIAC', /1947|۱۹۴۷/.test(eniac.text) && /Harvard|هاروارد/.test(eniac.text));
  check('eniac: artifact awarded', (await store()).artifacts?.includes('punch-card'));
  await sleep(REDUCE ? 200 : 2200);
  await b.shot(`${TAG}-eniac-solved`);
  check('eniac: continue focused', await js(`document.activeElement?.dataset.action === 'continue'`));
  await press('Enter');
  await sleep(3000);
  // Continue lands where era 2 itself begins - after the crossing into it,
  // which the page glides through on the way.
  check('eniac: continue reaches era 2', Math.abs(await js(`Math.round(document.getElementById('era-2').querySelector('[data-mark="visual"]').getBoundingClientRect().top)`)) < 30);
  check('play: gate moved to era 2', (await gated()) === 'batch', await gated());

  // 1956 with the sense switch. Its Start button exists visibly - and takes the
  // pointer - only once the puzzle segment is on screen.
  await scrollTo(await puzzleY(2, 0.4));
  await clickOn('[data-puzzle="batch"] [data-action="start"]');
  await sleep(900);
  check('batch: opened inline', await dialogOpen());
  const queueText = () => js(`document.querySelector('[role="dialog"] ol')?.innerText ?? ''`);
  check('batch: waits hidden before the switch', !(await queueText()).match(/wartet|waits|انتظار|منتظر/));
  await tabTo(inDialog('[data-target="switch-3"]'));
  await press(' ');
  await sleep(200);
  check('batch: sense switch 3 prints waits', !!(await queueText()).match(/wartet|waits|انتظار|منتظر/));
  check('batch: legend badge', (await store()).legendEras?.includes('batch'));
  await tabTo(inDialog('[data-target="up-report"]'));
  await press('Enter', 3);
  await tabTo(inDialog('[data-target="up-inventory"]'));
  await press('Enter');
  await tabTo(inDialog('[data-target="up-invoices"]'));
  await press('Enter');
  await sleep(400);
  check('batch: solved by keyboard', !!(await outcome()));
  await press('Enter');
  await sleep(3000);

  // A reload keeps passed gates open.
  await b.reload(9000);
  check('reload: gate is at era 3, not era 1', (await gated()) === 'unix', await gated());

  // 1971 with chdir.
  await scrollTo(await puzzleY(3, 0.4));
  await clickOn('[data-puzzle="unix"] [data-action="start"]');
  await sleep(1500);
  check('unix: prompt focused', await js(`document.activeElement?.tagName === 'INPUT'`));
  for (const command of ['ls', 'cd /home/ahmadreza', 'chdir projects', 'ls -a']) {
    await b.type(command);
    await press('Enter');
    await sleep(150);
  }
  check('unix: chdir earns the badge', (await store()).legendEras?.includes('unix'));
  check('unix: insider note appears after the trick', /chdir/.test(await dialogText()));
  await press('ArrowUp');
  check('unix: history recall', (await js('document.activeElement.value')) === 'ls -a');
  await press('ArrowDown');
  await b.type('cat .secret');
  await press('Enter');
  await sleep(500);
  check('unix: solved', !!(await outcome()));
  await press('Enter');
  await sleep(3000);

  // 1981 with F3; also the mode switch removes gates without moving the page.
  await scrollTo(await puzzleY(4, 0.4));
  const anchor = () => js(`Math.round(document.getElementById('era-4').querySelector('[data-puzzle-layer]').getBoundingClientRect().top)`);
  const before = { anchor: await anchor(), max: await scrollMax() };
  await clickOn('[data-mode-option="guided"]');
  await sleep(1400);
  const watching = { anchor: await anchor(), max: await scrollMax(), gated: await gated() };
  check('switch to watch: gate removed', watching.gated === null && watching.max > before.max + 500, { before, watching });
  check('switch to watch: page did not move', Math.abs(watching.anchor - before.anchor) < 4, { before, watching });
  await clickOn('[data-mode-option="interactive"]');
  await sleep(1400);
  check('switch back to play: gate at era 4', (await gated()) === 'dos', await gated());
  // Back in Play the page may settle on era 4's gate line, never beyond it.
  check('switch back: still at era 4', Math.abs((await anchor()) - before.anchor) < HEIGHT / 2, { before: before.anchor, after: await anchor() });

  await clickOn('[data-puzzle="dos"] [data-action="start"]');
  await sleep(1500);
  check('dos: prompt focused', await js(`document.activeElement?.tagName === 'INPUT'`));
  await b.type('dir');
  await press('Enter');
  await b.type('hello');
  await press('Enter');
  await b.type('wp');
  await press('Enter');
  await sleep(200);
  const dos1 = await dialogText();
  check('dos: DIR lists the disk', dos1.includes('WP       EXE'));
  check('dos: unknown command is a bad command', dos1.includes('Bad command or file name'));
  check('dos: WP is too big', dos1.includes('Program too big to fit in memory'));
  for (const driver of ['driver-sound', 'driver-cdrom']) {
    await tabTo(inDialog(`[data-target="${driver}"]`));
    await press(' ');
  }
  await tabTo(inDialog('[data-target="prompt"] input'));
  await press('F3');
  await sleep(150);
  check('dos: F3 brings back the last command', (await js('document.activeElement.value')).toUpperCase() === 'WP');
  check('dos: F3 earns the badge', (await store()).legendEras?.includes('dos'));
  await press('Enter');
  await sleep(500);
  check('dos: solved', !!(await outcome()));
  await press('Enter');
  await sleep(3000);

  // 1984 by keyboard (no trick: see DECISIONS.md 40), and by pointer/touch drag.
  await scrollTo(await puzzleY(5, 0.4));
  await clickOn('[data-puzzle="macintosh"] [data-action="start"]');
  await sleep(1200);
  await tabTo(inDialog('[data-target="item-vita"]'));
  await press(' ');
  await sleep(250);
  await press('ArrowRight');
  await sleep(150);
  await press('Enter');
  await sleep(300);
  const live = await js(`[...document.querySelectorAll('[role="dialog"] [aria-live="polite"]')].map((node) => node.textContent).join(' | ')`);
  check('mac: wrong drop refused', /Papierkorb|Trash|سطل/.test(live), live);
  await tabTo(inDialog('[data-target="item-vita"]'));
  await press(' ');
  await sleep(250);
  await press('Escape');
  await sleep(250);
  check('mac: escape cancels the carry only', (await dialogOpen()) && (await js(`document.activeElement?.dataset.target === 'item-vita'`)));
  await press(' ');
  await sleep(250);
  await press('Enter');
  await sleep(400);
  const pos = (selector) => js(`(() => { const r = document.querySelector('${selector}').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await b.drag(await pos(inDialog('[data-target="item-old"]')), await pos(inDialog('[data-target="drop-trash"]')));
  await sleep(500);
  check(`mac: solved (keyboard + ${TOUCH ? 'touch' : 'mouse'} drag)`, !!(await outcome()));
  await b.shot(`${TAG}-mac-solved`);
  await press('Escape');
  await sleep(800);

  // 1995 with winipcfg, and Zum Desktop while the page is gated.
  await scrollTo(await puzzleY(6, 0.4));
  check('play: era 6 gated', (await gated()) === 'win95');
  await clickOn('[data-puzzle="win95"] [data-action="start"]');
  await sleep(1200);
  await tabTo(inDialog('[data-target="start-run"]'));
  await press('Enter');
  await sleep(200);
  await tabTo(inDialog('#win95-run'));
  await b.type('ipconfig');
  await press('Enter');
  await sleep(200);
  check('win95: ipconfig does not exist on Windows 95', /ipconfig/.test(await js(`document.querySelector('[role="dialog"] .text-error')?.textContent ?? ''`)));
  await b.type('winipcfg');
  await press('Enter');
  await sleep(300);
  check('win95: winipcfg shows the configuration', /192\.168\.2\.50/.test(await dialogText()));
  check('win95: winipcfg earns the badge', (await store()).legendEras?.includes('win95'));
  await tabTo(inDialog('#win95-ip'));
  await press('End');
  await press('Backspace', 16);
  await b.type(LOCALE === 'fa' ? '۱۹۲.۱۶۸.۱.۵۰' : '192.168.1.50');
  await press('Enter');
  await sleep(500);
  check('win95: solved (Persian digits accepted in fa)', !!(await outcome()));
  await press('Enter');
  await sleep(3000);

  // Today: the solution shown from the lock cue opens the gate without the
  // artifact.
  await js('window.scrollTo(0, 1e7); true');
  await sleep(2500);
  check('play: era 7 gated', (await gated()) === 'cloud');
  await clickOn('[data-action="gate-reveal"]');
  const seconds = REDUCE ? 1 : 8;
  await sleep(seconds * 1000);
  await b.shot(`${TAG}-cloud-revealed`);
  check('cloud: solution played', !!(await outcome()), await outcome());
  const afterReveal = await store();
  check('cloud: gate opened', afterReveal.passedEras?.includes('cloud'));
  check('cloud: no artifact for a shown solution', !afterReveal.artifacts?.includes('firewall-key'), afterReveal.artifacts);
  check('cloud: no badge for a shown solution', !afterReveal.legendEras?.includes('cloud'));
  await press('Enter');
  await sleep(3000);
  check('play: no gate left', (await gated()) === null);
  check('play: convergence reached', Math.abs(await js(`Math.round(document.getElementById('convergence').querySelector('[data-mark="visual"]').getBoundingClientRect().top)`)) < 30);

  // Zum Desktop while gated: un-pass era 3 from the landing page (the journey
  // would write its own state back), then open the journey at the top.
  await b.goto(`${BASE}${PREFIX}/`, 3000);
  await js(`(() => { const raw = JSON.parse(localStorage.getItem('${STORE}')); raw.state.passedEras = raw.state.passedEras.filter((id) => id !== 'unix'); raw.state.hasCompletedJourney = false; localStorage.setItem('${STORE}', JSON.stringify(raw)); return true; })()`);
  await b.goto(JOURNEY, 9000);
  await js('window.scrollTo(0, 0); true');
  await sleep(1500);
  check('reload: era 3 gated again', (await gated()) === 'unix');
  await clickOn('[data-action="to-desktop"]');
  await sleep(4500);
  const end = await js(`({ atEnd: scrollY + innerHeight >= document.documentElement.scrollHeight - 40, gated: document.querySelector('[data-gated]') !== null })`);
  check('Zum Desktop passes a closed gate', end.atEnd && !end.gated, end);
  check('Zum Desktop completes the journey', (await store()).hasCompletedJourney === true);
}

check('no console errors', b.errors.length === 0, b.errors.slice(0, 4));
const failed = log.filter((entry) => !entry.ok).length;
console.log(`\n${TAG}: ${log.length - failed}/${log.length} passed (screenshots in ${OUT})`);
b.close();
process.exit(failed ? 1 : 0);
