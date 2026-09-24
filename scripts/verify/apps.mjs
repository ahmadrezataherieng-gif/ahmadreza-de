// End-to-end checks for the apps: About, Terminal, Tickets, Traceroute (Phase 7) and the Assistant (Phase 8).
//
//   node scripts/verify/apps.mjs [--width 1280] [--height 800] [--locale de|en|fa]
//        [--reduce] [--touch] [--base URL]
//
// On the window manager each app is opened from its desktop icon and from the
// launcher, used, shrunk to the smallest window (300 x 200), maximised and
// closed. On the home screen each opens fullscreen, is used, and closes with
// Back. Every state is checked for horizontal overflow and screenshotted.
import { launch, sleep } from './cdp.mjs';
import { BELOW_THRESHOLD, posted, shownPattern, STUB_COUNTS, wellFormed } from './api-stub.mjs';

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
const TAG = `apps-${WIDTH}-${LOCALE}${REDUCE ? '-rm' : ''}${TOUCH ? '-touch' : ''}`;
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
// --api: answer /api/* with stub counts and record what the page sends
// (Phase 9C). Without it /api is missing, as on any plain web server.
const API = Boolean(args.api);
const apiCalls = API ? await b.stubApi(STUB_COUNTS) : [];

await b.goto(`${BASE}${PREFIX}/`, 2500);
await js(
  `localStorage.setItem('${STORE}', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: [], legendEras: [], hasCompletedJourney: true, mode: 'guided' }, version: 2 })); true`,
);
await b.goto(`${BASE}${PREFIX}/desktop/`, 5000);
const layout = await js(`document.querySelector('[data-shell]')?.dataset.shellLayout ?? null`);

const rectOf = (selector) =>
  js(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
const clickOn = async (selector) => {
  const r = await rectOf(selector);
  if (!r) return false;
  await b.click(r.cx, r.cy);
  await sleep(450);
  return true;
};
const press = async (key, modifiers = []) => {
  await b.key(key, key === 'Enter' ? '\r' : undefined, modifiers);
  await sleep(200);
};
/** Wait until an expression is true, or give up after `ms`. */
const until = async (expression, ms = 6000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await js(expression)) return true;
    await sleep(100);
  }
  return false;
};
const frame = layout === 'desktop' ? (id) => `[data-window="${id}"]` : (id) => `[data-mobile-app="${id}"]`;
const content = (id) => `${frame(id)} [data-app-content="${id}"]`;
/** Nothing in the app scrolls sideways - one overflowing element would. Own scrollers (consoles) are allowed. */
const noOverflow = (id) =>
  js(`(() => {
    const body = document.querySelector('${frame(id)} [data-window-body]');
    return body.scrollWidth <= body.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1;
  })()`);
const inside = (selector, id) =>
  js(`(() => {
    const e = document.querySelector(${JSON.stringify(selector)}); const w = document.querySelector('${frame(id)} [data-window-body]');
    if (!e || !w) return false;
    const a = e.getBoundingClientRect(), b = w.getBoundingClientRect();
    return a.top >= b.top - 1 && a.bottom <= b.bottom + 1 && a.left >= b.left - 1 && a.right <= b.right + 1;
  })()`);

/**
 * Scroll by hand until an element is in view - its own scrolling pane first
 * (the ticket list scrolls itself beside a ticket), then the window body.
 * Never scrollIntoView: it would move the desktop too.
 */
const reveal = async (selector, id) => {
  await js(`(() => {
    const body = document.querySelector('${frame(id)} [data-window-body]');
    const e = document.querySelector(${JSON.stringify(selector)});
    for (let node = e.parentElement; node; node = node.parentElement) {
      const scrolls = /auto|scroll/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight;
      if (scrolls) node.scrollTop += e.getBoundingClientRect().top - node.getBoundingClientRect().top - 8;
      if (node === body) break;
    }
    return true;
  })()`);
  await sleep(150);
};

/* --- opening ------------------------------------------------------------------- */

async function openFromIcon(id) {
  if (layout === 'desktop') await clickOn(`[data-layout="desktop"] nav [data-app="${id}"]`);
  else await clickOn(`.ao-home [data-app="${id}"], [data-dock] [data-app="${id}"]`);
  return until(`!!document.querySelector('${content(id)}')`);
}
async function openFromLauncher(id) {
  await clickOn('[data-action="launcher"]');
  await sleep(250);
  await clickOn(`[data-launcher] [data-app="${id}"]`);
  return until(`!!document.querySelector('${content(id)}')`);
}
async function close(id) {
  if (layout === 'desktop') await clickOn(`${frame(id)} [data-action="window-close"]`);
  else await js('history.back(); true');
  return until(`!document.querySelector('${frame(id)}')`, 3000);
}

/** The smallest window: drag the far corner as far as it goes; the store clamps at 300 x 200. */
async function shrink(id) {
  const corner = await rectOf(`${frame(id)} [data-resize="bottom-end"]`);
  await b.drag({ x: corner.cx, y: corner.cy }, { x: corner.cx + (RTL ? 2000 : -2000), y: corner.cy - 2000 });
  await sleep(400);
  return rectOf(frame(id));
}

/** Open from the icon, close, open from the launcher, then: use, smallest, maximised, closed. */
async function windowRound(id, exercise) {
  if (layout === 'desktop') {
    check(`${id}: opens from its desktop icon`, await openFromIcon(id));
    check(`${id}: closes`, await close(id));
    check(`${id}: opens from the launcher`, await openFromLauncher(id));
  } else {
    check(`${id}: opens fullscreen from the home screen`, await openFromIcon(id));
    const r = await rectOf(frame(id));
    check(`${id}: fullscreen`, r && r.w >= WIDTH - 2 && r.h >= HEIGHT * 0.95, r);
  }
  // A missing message renders as its key path, e.g. "tickets.sections.lesson".
  check(`${id}: its copy loaded`, await until(`!/\\b${id}\\.[a-zA-Z]/.test(document.querySelector('${content(id)}')?.textContent ?? '${id}.x')`, 3000));
  check(`${id}: no horizontal overflow`, await noOverflow(id));
  await exercise();
  await b.shot(`${TAG}-${id}`);

  if (layout === 'desktop') {
    const small = await shrink(id);
    check(`${id}: shrinks to 300 x 200`, small && small.w === 300 && small.h === 200, small);
    check(`${id}: 300 x 200 does not overflow sideways`, await noOverflow(id));
    await smallChecks[id]();
    await b.shot(`${TAG}-${id}-300x200`);
    await clickOn(`${frame(id)} [data-action="window-maximise"]`);
    await sleep(400);
    check(`${id}: maximises`, (await js(`document.querySelector('${frame(id)}').dataset.mode`)) === 'maximised');
    check(`${id}: maximised does not overflow sideways`, await noOverflow(id));
    await b.shot(`${TAG}-${id}-max`);
  }
  if (id !== 'terminal') check(`${id}: closes`, await close(id));
}

/* --- the apps ------------------------------------------------------------------ */

const about = async () => {
  const facts = await js(`(() => {
    const root = document.querySelector('${content('about')}');
    return {
      heading: root.querySelector('h2')?.textContent ?? '',
      sections: [...root.querySelectorAll('h3')].filter((h) => !h.closest('[data-visitor-stats]')).length,
      placeholders: root.querySelectorAll('[data-placeholder]').length,
      resumeLink: root.querySelectorAll('a[download]').length,
      resumePending: !!root.querySelector('[data-action="resume-pending"]'),
      mail: root.querySelector('a[href^="mailto:"]')?.getAttribute('href') ?? null,
      dir: getComputedStyle(root).direction,
    };
  })()`);
  check('about: name, four sections', facts.heading.length > 5 && facts.sections === 4, facts);
  check('about: owed facts are marked, not guessed', facts.placeholders >= 2, facts);
  check('about: no résumé link while the PDF is missing', facts.resumeLink === 0 && facts.resumePending, facts);
  check('about: the confirmed email is a link', facts.mail === 'mailto:ahmadrezataheride@gmail.com', facts);
  check(`about: reads ${RTL ? 'right to left' : 'left to right'}`, facts.dir === (RTL ? 'rtl' : 'ltr'), facts);

  // The anonymous stats (Phase 9C): fetched only once the end of About is in view.
  const countsBefore = apiCalls.filter((call) => call.path === '/api/counts').length;
  if (API) check('about stats: nothing fetched before the end is in view', countsBefore === 0, apiCalls);
  // Where the last section sits inside the scrolled content, whatever the scroll position.
  const lastSectionAt = () =>
    js(`(() => { const body = document.querySelector('${frame('about')} [data-window-body]'); const sections = document.querySelectorAll('${content('about')} section[aria-labelledby]'); const last = [...sections].filter((s) => !s.matches('[data-visitor-stats]')).pop(); return Math.round(last.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop); })()`);
  const bottomBefore = await lastSectionAt();
  await js(`(() => { const body = document.querySelector('${frame('about')} [data-window-body]'); body.scrollTop = body.scrollHeight; return true; })()`);
  await sleep(1500);
  const stats = await js(`(() => {
    const root = document.querySelector('${content('about')} [data-visitor-stats]');
    return root ? { text: root.innerText, names: [...root.querySelectorAll('[data-public-count]')].map((e) => e.dataset.publicCount) } : null;
  })()`);
  if (API) {
    check('about stats: fetched once the end came into view', apiCalls.filter((call) => call.path === '/api/counts').length === 1, apiCalls);
    check(`about stats: shown, in ${LOCALE} digits`, !!stats && shownPattern(LOCALE).test(stats.text), stats);
    check('about stats: numbers below ten are left out', !!stats && !stats.names.some((name) => BELOW_THRESHOLD.has(name)), stats?.names);
    check('about stats: the journey, the Watch mode and five apps', !!stats && stats.names.includes('journey.completed') && stats.names.includes('journey.mode.guided') && stats.names.filter((name) => name.startsWith('app.')).length === 5, stats?.names);
    check('about stats: its copy loaded', !!stats && !/\bstats\.[a-zA-Z]/.test(stats.text), stats?.text);
    check('about stats: no horizontal overflow', await noOverflow('about'));
  } else {
    check('about stats: without the API there is no section and no number', stats === null, stats);
  }
  // Appended below the last section: nothing above it moved.
  const bottomAfter = await lastSectionAt();
  check('about stats: nothing above it moved', typeof bottomBefore === 'number' && bottomBefore === bottomAfter, { bottomBefore, bottomAfter });
  await js(`(() => { document.querySelector('${frame('about')} [data-window-body]').scrollTop = 0; return true; })()`);
};

const outputText = () => js(`document.querySelector('${frame('terminal')} [data-terminal-output]').innerText`);
const inputValue = () => js(`document.querySelector('${frame('terminal')} [data-terminal-input]').value`);
const typeLine = async (text) => {
  await b.type(text);
  await press('Enter');
  await sleep(150);
};

const terminal = async () => {
  const input = `${frame('terminal')} [data-terminal-input]`;
  if (layout === 'desktop') check('terminal: a precise pointer gets the cursor at once', await js(`document.activeElement?.matches('[data-terminal-input]')`));
  else check('terminal: a touchscreen does not raise the keyboard by itself', !(await js(`document.activeElement?.matches('[data-terminal-input]')`)));
  await clickOn(input);
  check('terminal: machine output is left to right', (await js(`getComputedStyle(document.querySelector('${frame('terminal')} [data-terminal-output]')).direction`)) === 'ltr');

  await typeLine('help');
  check('terminal: help lists the commands', /whoami/.test(await outputText()));
  await typeLine('ls');
  check('terminal: ls lists the home directory', /README\.md[\s\S]*projects\//.test(await outputText()));
  await typeLine('cd projects');
  await typeLine('pwd');
  check('terminal: cd and pwd', /\/home\/ahmadreza\/projects\s*$/.test(await outputText()));
  await typeLine('cat amonel.md');
  check('terminal: cat prints a project from content', /github\.com\/ahmadrezataherieng-gif/.test(await outputText()));
  await typeLine('frobnicate');
  check('terminal: an unknown command fails like bash', /bash: frobnicate: command not found/.test(await outputText()));
  await typeLine('cd ..');
  await b.type('cat sk');
  await press('Tab');
  check('terminal: Tab completes a path', (await inputValue()) === 'cat skills.txt ', await inputValue());
  await press('Enter');
  await press('ArrowUp');
  check('terminal: arrow up recalls the last command', (await inputValue()) === 'cat skills.txt', await inputValue());
  await press('ArrowDown');
  check('terminal: arrow down returns to an empty line', (await inputValue()) === '');
  await typeLine('contact');
  check('terminal: contact prints the confirmed address', /ahmadrezataheride@gmail.com/.test(await outputText()));
  // APP-08: a hidden command answers with its drawing and its own words.
  await typeLine('moth');
  check('terminal: the hidden moth answers', /\(\*\)/.test(await outputText()) && /1947|۱۹۴۷/.test(await outputText()), (await outputText()).slice(-200));

  // Keys the terminal answers never reach the document, where the desktop's
  // window cycling listens; other keys still do.
  await js(`window.__keys = []; document.addEventListener('keydown', (e) => window.__keys.push(e.key)); true`);
  await press('ArrowUp');
  await b.type('cat R');
  await press('Tab');
  await b.key('x', 'x');
  const seen = await js('window.__keys');
  check('terminal: handled keys stop at the terminal', !seen.includes('ArrowUp') && !seen.includes('Tab') && seen.includes('x'), seen);
  await press('c', ['Control']);
  check('terminal: Ctrl+C abandons the line', (await inputValue()) === '' && /\^C/.test(await outputText()));

  for (let i = 0; i < 4; i++) await typeLine('help');
  check('terminal: the newest line is in view', await js(`(() => { const o = document.querySelector('${frame('terminal')} [data-terminal-output]'); return o.scrollHeight - o.scrollTop - o.clientHeight <= 2 && o.scrollHeight > o.clientHeight; })()`));
  check('terminal: the input is on screen', await inside(input, 'terminal'));

  if (layout !== 'desktop') {
    // An on-screen keyboard that shrinks the page (interactive-widget=resizes-content):
    // the input must stay visible and the output keep its newest line in view.
    await b.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: Math.round(HEIGHT * 0.55), deviceScaleFactor: 1, mobile: true });
    await sleep(500);
    await typeLine('skills');
    check('terminal: with the keyboard up, the input stays visible', await inside(input, 'terminal'));
    check('terminal: with the keyboard up, the newest line is in view', await js(`(() => { const o = document.querySelector('${frame('terminal')} [data-terminal-output]'); return o.scrollHeight - o.scrollTop - o.clientHeight <= 2; })()`));
    await b.shot(`${TAG}-terminal-keyboard`);
    await b.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: true });
    await sleep(400);
  }
  await press('l', ['Control']);
  check('terminal: Ctrl+L clears the screen', (await js(`document.querySelectorAll('${frame('terminal')} [data-terminal-output] > *').length`)) === 0);
};

const tickets = async () => {
  const root = content('tickets');
  const count = () => js(`document.querySelectorAll('${root} [data-ticket]').length`);
  check('tickets: nine tickets', (await count()) === 9, await count());
  await clickOn(`${root} [data-filter="waiting"]`);
  check('tickets: filter by status', (await count()) === 1 && (await js(`[...document.querySelectorAll('${root} [data-ticket] [data-status]')].every((e) => e.dataset.status === 'waiting')`)));
  await clickOn(`${root} [data-filter="resolved"]`);
  const resolved = await count();
  await clickOn(`${root} [data-filter="all"]`);
  check('tickets: resolved and all', resolved === 7 && (await count()) === 9, { resolved });
  check('tickets: sorted by priority first', (await js(`[...document.querySelectorAll('${root} [data-ticket]')].slice(0, 2).map((e) => e.dataset.ticket).join()`)) === 'no-network,print-queue');
  await js(`(() => { const s = document.querySelector('${root} [data-sort]'); s.value = 'number'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  await sleep(200);
  check('tickets: sort by number', (await js(`document.querySelector('${root} [data-ticket]').dataset.ticket`)) === 'no-network');

  const panes = await js(`document.querySelector('${root}').dataset.panes`);
  await reveal(`${root} [data-ticket="account-lockout"]`, 'tickets');
  await clickOn(`${root} [data-ticket="account-lockout"]`);
  await sleep(300);
  const detail = await js(`(() => {
    const d = document.querySelector('${root} [data-ticket-detail="account-lockout"]');
    if (!d) return null;
    return {
      steps: d.querySelectorAll('ol > li').length,
      consoles: [...d.querySelectorAll('[data-console]')].map((c) => getComputedStyle(c).direction),
      lesson: !!d.querySelector('[data-lesson]')?.textContent,
      focus: document.activeElement?.id === 'ticket-account-lockout',
    };
  })()`);
  check('tickets: a ticket shows its diagnosis, evidence and lesson', detail && detail.steps === 3 && detail.consoles.length === 3 && detail.consoles.every((d) => d === 'ltr') && detail.lesson, detail);
  if (panes === '1') {
    check('tickets: one pane - the ticket replaces the list, focus on it', detail?.focus && (await js(`!document.querySelector('${root} [data-ticket-list]')`)));
    await clickOn(`${root} [data-action="ticket-back"]`);
    await sleep(300);
    check('tickets: back returns to the list, focus on the ticket', await js(`document.activeElement?.dataset.ticket === 'account-lockout'`));
  } else {
    check('tickets: two panes - list and ticket side by side', await js(`!!document.querySelector('${root} [data-ticket-list]')`));
  }
};

const traceroute = async () => {
  const root = content('traceroute');
  check('traceroute: says it is a simulation', await js(`!!document.querySelector('${root} [data-simulation]')?.textContent`));
  await clickOn(`${root} [data-trace-target="newyork"]`);
  const hopsNow = await js(`document.querySelectorAll('${root} [data-hop-state="done"]').length`);
  if (REDUCE) {
    check('traceroute: reduced motion shows the finished trace at once', await until(`!!document.querySelector('${root} [data-trace-done]')`, 600));
    check('traceroute: reduced motion - nothing animates', await js(`[...document.querySelectorAll('${root} .ao-trace-row, ${root} .ao-trace-bar, ${root} .ao-trace-packet')].every((e) => getComputedStyle(e).animationName === 'none')`));
  } else {
    check('traceroute: the packet travels hop by hop', hopsNow < 8, { hopsNow });
    check('traceroute: and arrives', await until(`!!document.querySelector('${root} [data-trace-done]')`, 15000));
  }
  const trace = await js(`(() => ({
    hops: document.querySelectorAll('${root} [data-hop]').length,
    jump: document.querySelector('${root} [data-trace-jump]')?.closest('[data-hop]')?.dataset.hop ?? null,
    summary: !!document.querySelector('${root} [data-trace-summary]'),
    raw: document.querySelector('${root} [data-trace-raw]')?.textContent ?? '',
  }))()`);
  check('traceroute: eight hops, the jump at the Atlantic, a summary', trace.hops === 8 && trace.jump === '6' && trace.summary, trace);
  check('traceroute: raw output as a real traceroute prints it', /traceroute to www\.newyork\.example \(198\.51\.100\.140\), 30 hops max/.test(trace.raw) && / 6 {2}ae1\.nyc\.carrier\.example/.test(trace.raw));

  await clickOn(`${root} [data-trace-input]`);
  await js(`(() => { const i = document.querySelector('${root} [data-trace-input]'); i.select(); return true; })()`);
  await b.type('example.jp');
  await press('Enter');
  check('traceroute: free input borrows a prepared route, and says so', (await until(`!!document.querySelector('${root} [data-trace="tokyo"] [data-trace-mapped]')`, 2000)));
  await js(`(() => { const i = document.querySelector('${root} [data-trace-input]'); i.focus(); i.select(); return true; })()`);
  await b.type('foo_bar');
  await press('Enter');
  check('traceroute: an invalid name fails', await until(`/Name or service not known/.test(document.querySelector('${root} [data-trace-error]')?.textContent ?? '')`, 2000));
  check('traceroute: target input is left to right', (await js(`getComputedStyle(document.querySelector('${root} [data-trace-input]')).direction`)) === 'ltr');
  await clickOn(`${root} [data-trace-target="tokyo"]`);
  await until(`!!document.querySelector('${root} [data-trace-done]')`, 15000);
  check('traceroute: a silent router shows as * * *', /\* \* \*/.test(await js(`document.querySelector('${root} [data-trace="tokyo"]').textContent`)));
};

/* --- the Assistant (Phase 8B, DECISIONS.md 53: a local search, no Worker, no Gemini) ------ */

const A = (rest = '') => `${content('assistant')}${rest ? ` ${rest}` : ''}`;
const aMessages = () =>
  js(`[...document.querySelectorAll('${A('[data-assistant-message]')}')].map((m) => ({ role: m.dataset.assistantMessage, tone: m.dataset.tone ?? null, text: m.textContent, typed: m.querySelector('[data-typed]')?.dataset.typed ?? null }))`);
const aStateIs = (name) => until(`document.querySelector('${A()}')?.dataset.assistantState === '${name}'`, 4000);
const aAsk = async (text) => {
  await clickOn(A('[data-assistant-input]'));
  await js(`(() => { const i = document.querySelector('${A('[data-assistant-input]')}'); i.select(); return true; })()`);
  await b.type(text);
  await press('Enter');
};

const assistant = async () => {
  const input = A('[data-assistant-input]');
  check('assistant: the badge and banner say this is a search, not AI', await js(`(() => { const badge = document.querySelector('${A('[data-assistant-badge]')}'); const t = document.querySelector('${A('[data-assistant-banner]')}')?.textContent ?? ''; return !!badge && t.length > 40; })()`));
  check('assistant: the privacy line never mentions Gemini or a KI model', await js(`!/gemini|KI-Modell/i.test(document.querySelector('${A('[data-assistant-privacy]')}')?.textContent ?? '')`));
  check('assistant: the input is capped at 400 characters', (await js(`document.querySelector('${input}').maxLength`)) === 400);
  if (layout === 'desktop') check('assistant: a precise pointer gets the cursor at once', await js(`document.activeElement?.matches('[data-assistant-input]')`));
  else check('assistant: a touchscreen does not raise the keyboard by itself', !(await js(`document.activeElement?.matches('[data-assistant-input]')`)));
  check('assistant: five example questions', (await js(`document.querySelectorAll('${A('[data-example]')}').length`)) === 5);

  // The last example is always the contact question: searching, then a labelled answer built from the site's own content.
  const seen = await js(`(async () => { document.querySelector('${A('[data-example="4"]')}').click(); await new Promise((r) => setTimeout(r, 120)); return document.querySelector('${A()}').dataset.assistantState; })()`);
  if (!REDUCE) check('assistant: searching is a visible state', seen === 'searching', seen);
  check('assistant: the answer arrives', await aStateIs('answered'));
  const first = (await aMessages()).at(-1);
  check('assistant: the answer is a real passage carrying the confirmed address', first.role === 'assistant' && /ahmadrezataheride@gmail.com/.test(first.text), first);
  if (REDUCE) check('assistant: reduced motion - the finished answer at once, no typing', first.typed === 'done', first);
  else check('assistant: the answer types out and finishes', await until(`document.querySelector('${A('[data-typed]')}')?.dataset.typed === 'done'`, 4000));
  check('assistant: nothing overflows sideways', await noOverflow('assistant'));

  // An off-topic question finds nothing - honest, never a guess.
  await aAsk('zzqx not a real word');
  check('assistant: an off-topic question is an honest no-match', await aStateIs('noMatch'));
  const noMatch = (await aMessages()).at(-1);
  check('assistant: the no-match message is its own tone', noMatch.role === 'assistant' && noMatch.tone === 'noMatch', noMatch);
  check('assistant: the examples return after a no-match, so nobody is stuck', (await js(`document.querySelectorAll('${A('[data-example]')}').length`)) === 5);

  // Keys it answers stop at the field; others still pass.
  await js(`window.__keys = []; document.addEventListener('keydown', (e) => window.__keys.push(e.key)); true`);
  await press('ArrowUp');
  const recalled = await js(`document.querySelector('${input}').value`);
  await b.key('x', 'x');
  const keys = await js('window.__keys');
  check('assistant: arrow up recalls the last question', recalled === 'zzqx not a real word', recalled);
  check('assistant: handled keys stop at the field', !keys.includes('ArrowUp') && keys.includes('x'), keys);
  await js(`(() => { const i = document.querySelector('${input}'); i.focus(); return true; })()`);
  for (let i = 0; i < 30; i++) await press('Backspace');
  await press('ArrowUp');
  await press('ArrowDown');
  check('assistant: arrow down returns to an empty field', (await js(`document.querySelector('${input}').value`)) === '');
  check('assistant: the input is on screen', await inside(input, 'assistant'));
  check('assistant: send is off while the field is empty', await js(`document.querySelector('${A('[data-action="assistant-send"]')}').disabled`));

  if (layout !== 'desktop') {
    await b.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: Math.round(HEIGHT * 0.55), deviceScaleFactor: 1, mobile: true });
    await sleep(500);
    await aAsk('zzqy also not real');
    await aStateIs('noMatch');
    check('assistant: with the keyboard up, the input stays visible', await inside(input, 'assistant'));
    await b.shot(`${TAG}-assistant-keyboard`);
    await b.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: true });
    await sleep(400);
  }
};

/** The Computer-Quiz (Phase 9B): played by keyboard, verdicts in words and live, the best score stored locally. */
const quiz = async () => {
  const root = content('quiz');
  const Q = (selector) => `${root} ${selector}`;
  check('quiz: says it grades nobody', /keine Prüfung|not an exam|نه امتحان/.test(await js(`document.querySelector('${root}').textContent`)));
  check(`quiz: reads ${RTL ? 'right to left' : 'left to right'}`, (await js(`getComputedStyle(document.querySelector('${root}')).direction`)) === (RTL ? 'rtl' : 'ltr'));
  await js(`localStorage.removeItem('amonel.quiz.v1'); true`);
  await reveal(Q('[data-action="quiz-start"]'), 'quiz');
  await clickOn(Q('[data-action="quiz-start"]'));
  check('quiz: a round starts, focus on the question', await until(`!!document.activeElement?.matches('${Q('[data-quiz-question] h2')}')`, 2000));
  check('quiz: three or four options, real buttons in a labelled group', await js(`(() => {
    const group = document.querySelector('${Q('[role="group"]')}');
    const options = group?.querySelectorAll('button[data-quiz-option]').length ?? 0;
    return !!group?.getAttribute('aria-labelledby') && options >= 3 && options <= 4;
  })()`));
  // An isolated label with no letters falls back to left to right; in Persian that reverses "۲، ۵، ۱۰".
  check('quiz: every option label has the direction of its own script', await js(`[...document.querySelectorAll('${Q('[data-quiz-option] bdi')}')].every((e) => e.getAttribute('dir') === ([...e.textContent].some((c) => c.charCodeAt(0) >= 0x0600 && c.charCodeAt(0) <= 0x06ff) ? 'rtl' : 'ltr'))`));
  // Keyboard only: Tab to the first option, Enter.
  await press('Tab');
  check('quiz: Tab reaches an option, with a visible focus ring', await js(`(() => { const e = document.activeElement; return !!e?.matches('[data-quiz-option]') && getComputedStyle(e).boxShadow !== 'none'; })()`));
  await press('Enter');
  check('quiz: Enter answers', await until(`!!document.querySelector('${Q('[data-quiz-answered]')}')`, 1500));
  check('quiz: the verdict is announced live', await js(`(() => { const l = document.querySelector('${Q('[data-quiz-announcement]')}'); return l.getAttribute('aria-live') === 'polite' && l.textContent.length > 20; })()`));
  check('quiz: right and wrong are words and a mark, not only colour', await js(`(() => { const r = document.querySelector('${Q('[data-quiz-state="right"]')}'); return !!r && !!r.querySelector('svg path') && r.textContent.length > r.querySelector('bdi').textContent.length; })()`));
  check('quiz: the feedback names the era', await js(`/\\d{4}|[۰-۹]{4}|Heute|Today|امروز/.test(document.querySelector('${Q('[data-quiz-feedback]')}')?.textContent ?? '')`));
  check('quiz: nothing overflows sideways', await noOverflow('quiz'));
  for (let i = 0; i < 10; i++) {
    if (i > 0) await js(`(() => { document.querySelector('${Q('[data-quiz-option]')}').click(); return true; })()`);
    await sleep(80);
    await js(`(() => { document.querySelector('${Q('[data-action="quiz-next"]')}').click(); return true; })()`);
    await sleep(80);
  }
  check('quiz: ten questions, then the result', await until(`!!document.querySelector('${Q('[data-quiz-result]')}')`, 2000));
  const result = await js(`(() => ({
    score: Number(document.querySelector('${Q('[data-quiz-result]')}').dataset.quizResult),
    live: document.querySelector('${Q('[data-quiz-announcement]')}').textContent,
    stored: localStorage.getItem('amonel.quiz.v1'),
    focus: document.activeElement?.tagName,
  }))()`);
  check('quiz: the score is announced, focus on the result', result.live.length > 5 && result.focus === 'H2', result);
  check('quiz: the best score is stored in this browser, one number', JSON.parse(result.stored ?? '{}').state?.best === result.score, result.stored);
  // APP-11: every era that was missed leads into the journey at its section.
  const missed = await js(`[...document.querySelectorAll('${Q('[data-quiz-missed] li')}')].map((li) => ({ era: li.dataset.era, hash: li.querySelector('[data-action="quiz-to-era"]')?.dataset.eraHash ?? null }))`);
  check('quiz: every missed era has a link to its journey section', missed.every((item) => /^#era-[1-7]$/.test(item.hash ?? '')), missed);
  // Phase 9C: the round is counted - that it ended, nothing more - and the total shown under the button.
  await sleep(800);
  const rounds = await js(`document.querySelector('${Q('[data-public-count="quiz.completed"]')}')?.textContent ?? null`);
  if (API) {
    const quizCalls = apiCalls.filter((call) => call.path === '/api/count/quiz.completed');
    check('api: a finished round is counted once, as a bare POST with no body', quizCalls.length === 1 && quizCalls[0].method === 'POST' && !quizCalls[0].body, quizCalls);
    check('api: no score in any request', !apiCalls.some((call) => /score|\d/.test(call.path)), apiCalls.map((call) => call.path));
    check(`quiz: the rounds played are shown, in ${LOCALE} digits`, shownPattern(LOCALE).test(rounds ?? ''), rounds);
  } else {
    check('quiz: without the API no number is shown', rounds === null, rounds);
  }
  await clickOn(Q('[data-action="quiz-again"]'));
  check('quiz: a new round starts at the first question', await until(`!!document.querySelector('${Q('[data-quiz-question]')}') && !document.querySelector('${Q('[data-quiz-answered]')}')`, 2000));
};

/** The journey and the landing page carry nothing of the assistant in their HTML, and no AI claim anywhere. */
async function assistantStaysOutOfStaticHtml() {
  const html = await js(`(async () => ({
    landing: await (await fetch('${PREFIX}/')).text(),
    journey: await (await fetch('${PREFIX}/amonel/')).text(),
  }))()`);
  check('landing page: no assistant, Gemini or AI claim in its HTML', !/assistant|gemini/i.test(html.landing));
  // One name was already there before Phase 8: the mount point's attribute. The teaser adds nothing named so.
  const names = (html.journey.match(/assistant/gi) ?? []).length;
  check('journey: the assistant adds nothing to its HTML', names === 1 && !/gemini/i.test(html.journey), { names });
  check('landing page and journey: nothing of the quiz in their HTML', !/quiz/i.test(html.landing) && !/quiz/i.test(html.journey));
  check('journey: the teaser box is an empty slot', /data-slot="prompt-line"[^>]*><\/div>/.test(html.journey));
}

/** What must still work in the smallest window. */
const smallChecks = {
  about: async () => check('about 300x200: the name is in view', await inside(`${content('about')} h2`, 'about')),
  terminal: async () => {
    await clickOn(`${frame('terminal')} [data-terminal-input]`);
    await typeLine('whoami');
    check('terminal 300x200: input in view, newest line in view', (await inside(`${frame('terminal')} [data-terminal-input]`, 'terminal')) && /guest\s*$/.test(await outputText()));
  },
  tickets: async () => {
    check('tickets 300x200: one pane, scrolling as a whole', (await js(`document.querySelector('${content('tickets')}').dataset.panes`)) === '1');
    await reveal(`${content('tickets')} [data-ticket="print-queue"]`, 'tickets');
    await clickOn(`${content('tickets')} [data-ticket="print-queue"]`);
    check('tickets 300x200: a ticket opens', await js(`!!document.querySelector('${content('tickets')} [data-ticket-detail="print-queue"]')`));
    check('tickets 300x200: the way back is in view', await inside(`${content('tickets')} [data-action="ticket-back"]`, 'tickets'));
    await clickOn(`${content('tickets')} [data-action="ticket-back"]`);
    check('tickets 300x200: back returns to the list', await js(`!!document.querySelector('${content('tickets')} [data-ticket-list]')`));
  },
  assistant: async () => {
    check('assistant 300x200: the field and the send button are in view', (await inside(A('[data-assistant-input]'), 'assistant')) && (await inside(A('[data-action="assistant-send"]'), 'assistant')));
    check('assistant 300x200: the state line is in view', await inside(A('[data-assistant-status]'), 'assistant'));
  },
  quiz: async () => {
    await reveal(`${content('quiz')} [data-quiz-question] h2`, 'quiz');
    check('quiz 300x200: the question is in view', await inside(`${content('quiz')} [data-quiz-question] h2`, 'quiz'));
  },
  traceroute: async () => {
    await reveal(`${content('traceroute')} [data-trace-input]`, 'traceroute');
    check('traceroute 300x200: the target field scrolls into view', await inside(`${content('traceroute')} [data-trace-input]`, 'traceroute'));
  },
};

check('layout', layout === (!TOUCH && WIDTH >= 768 ? 'desktop' : 'mobile'), layout);
await windowRound('about', about);
await windowRound('traceroute', traceroute);
await windowRound('tickets', tickets);
await windowRound('assistant', assistant);
await windowRound('quiz', quiz);
await assistantStaysOutOfStaticHtml();
await windowRound('terminal', terminal);

// `exit` closes the Terminal, like a real one.
await clickOn(`${frame('terminal')} [data-terminal-input]`);
await typeLine('exit');
check('terminal: exit closes it', await until(`!document.querySelector('${frame('terminal')}')`, 3000));
if (layout !== 'desktop') check('terminal: exit on a phone returns home', (await js('location.pathname')).endsWith('/desktop/') && !(await js(`!!document.querySelector('[data-mobile-app]')`)));

if (API) {
  // Every app above was opened two or three times: each counted once in this page load.
  const opened = posted(apiCalls).filter((name) => name.startsWith('app.'));
  const expected = ['about', 'traceroute', 'tickets', 'assistant', 'quiz', 'terminal'].map((id) => `app.${id}.opened`);
  check('api: every app opened is counted, once per page load', opened.join() === expected.join(), opened);
  check('api: only allowlisted counters and /api/counts, never a body', wellFormed(apiCalls), apiCalls.slice(0, 8));
}


// APP-10: the hidden Legende badges show in the Timeline once earned, and only then. After the counter checks above: this reloads the page, which resets what counts once per page load.
const timelineBadges = `document.querySelectorAll('${content('timeline')} [data-legend-badge]').length`;
check('timeline: no badge before one is earned', (await openFromIcon('timeline')) && (await until(`!!document.querySelector('${content('timeline')} [data-era]')`, 3000)) && (await js(timelineBadges)) === 0);
await close('timeline');
await js(`localStorage.setItem('${STORE}', JSON.stringify({ state: { artifacts: [], visitedEras: [], skippedEras: [], passedEras: [], legendEras: ['unix', 'dos'], hasCompletedJourney: true, mode: 'guided' }, version: 2 })); true`);
await b.goto(`${BASE}${PREFIX}/desktop/`, 4000);
check('timeline: the earned badges are shown, with their count', (await openFromIcon('timeline')) && (await until(`${timelineBadges} === 2`, 3000)) && (await js(`document.querySelector('${content('timeline')} [data-legend-count]')?.dataset.legendCount`)) === '2');
await close('timeline');
check('no console errors', b.errors.length === 0, b.errors.slice(0, 3));
const passed = log.filter((entry) => entry.ok).length;
console.log(`${QUIET ? '' : '\n'}${TAG}: ${passed}/${log.length} passed`);
b.close();
process.exit(passed === log.length ? 0 : 1);
