// The anonymous counters on the client (Phase 9C, DECISIONS.md 56): the
// allowlist, the threshold, what `count()` sends and what it never does.
// Node strips the types; `window` and `fetch` are stubbed per test.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { IntlMessageFormat } from 'intl-messageformat';

import { appIds, eraIds } from '../../src/content/eras.ts';
import { STORAGE_KEYS } from '../../src/lib/constants.ts';
import {
  appOpened,
  COUNTER_NAMES,
  eraSolved,
  isCounterName,
  JOURNEY_COMPLETED,
  MIN_PUBLIC_COUNT,
  modeChosen,
  parseCounts,
  publicCount,
  QUIZ_COMPLETED,
} from '../../src/lib/counters.ts';

const LOCALES = ['de', 'en', 'fa'];
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const json = (path) => JSON.parse(read(path));

/** A fresh copy of count.ts, so each test starts with an empty Set. */
let fresh = 0;
const loadCount = () => import(`../../src/lib/count.ts?fresh=${++fresh}`);

/** Stub a browser: `respond(url, init)` answers each fetch. Returns the calls. */
function browser(respond = () => new Response(null, { status: 204 })) {
  const calls = [];
  globalThis.window = {};
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url, init });
    return respond(url, init);
  };
  return calls;
}
const realFetch = globalThis.fetch;
function restore() {
  delete globalThis.window;
  globalThis.fetch = realFetch;
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/* --- the allowlist ----------------------------------------------------------- */

test('allowlist: every era, every app, the quiz, the journey and both modes - built from the registries', () => {
  assert.equal(COUNTER_NAMES.length, eraIds.length + appIds.length + 5);
  assert.equal(new Set(COUNTER_NAMES).size, COUNTER_NAMES.length);
  for (const id of eraIds) assert.ok(COUNTER_NAMES.includes(`era.${id}.solved`), id);
  for (const id of appIds) assert.ok(COUNTER_NAMES.includes(`app.${id}.opened`), id);
  for (const name of ['quiz.completed', 'snake.played', 'journey.completed', 'journey.mode.guided', 'journey.mode.interactive']) assert.ok(COUNTER_NAMES.includes(name), name);
  assert.equal(eraSolved('unix'), 'era.unix.solved');
  assert.equal(appOpened('quiz'), 'app.quiz.opened');
  assert.equal(modeChosen('interactive'), 'journey.mode.interactive');
  assert.equal(QUIZ_COMPLETED, 'quiz.completed');
  assert.equal(JOURNEY_COMPLETED, 'journey.completed');
  for (const name of ['era.atari.solved', 'quiz.score', 'quiz.completed.7', 'snake.score', 'snake.played.12', '', 'app..opened']) assert.equal(isCounterName(name), false, name);
});

test('allowlist: the Worker counts exactly these names - one list, not a copy', () => {
  assert.match(read('worker/api.ts'), /import \{ COUNTER_NAMES, isCounterName \} from '\.\.\/src\/lib\/counters\.ts'/);
});

/* --- the threshold ------------------------------------------------------------ */

test('threshold: below ten, missing, broken or without the API, a number is never shown', () => {
  assert.equal(MIN_PUBLIC_COUNT, 10);
  assert.equal(publicCount(null, QUIZ_COMPLETED), null);
  assert.equal(publicCount({}, QUIZ_COMPLETED), null);
  assert.equal(publicCount({ 'quiz.completed': 0 }, QUIZ_COMPLETED), null);
  assert.equal(publicCount({ 'quiz.completed': 9 }, QUIZ_COMPLETED), null);
  assert.equal(publicCount({ 'quiz.completed': 10 }, QUIZ_COMPLETED), 10);
  assert.equal(publicCount({ 'quiz.completed': 1234 }, QUIZ_COMPLETED), 1234);
  assert.equal(publicCount({ 'quiz.completed': 12.5 }, QUIZ_COMPLETED), null);
});

test('parse: only allowlisted names with non-negative integers survive', () => {
  for (const value of [null, 'counts', 42, [], ['quiz.completed']]) assert.equal(parseCounts(value), null, JSON.stringify(value));
  assert.deepEqual(
    parseCounts({ 'quiz.completed': 12, 'era.eniac.solved': -1, 'app.about.opened': '40', 'x.y': 99, 'journey.completed': 1.5, 'app.cv.opened': 0 }),
    { 'quiz.completed': 12, 'app.cv.opened': 0 },
  );
});

/* --- count() ------------------------------------------------------------------ */

test('count: nothing happens without a browser - the static build and node', async () => {
  const { count, loadCounts } = await loadCount();
  let called = false;
  globalThis.fetch = async () => { called = true; return new Response(null); };
  try {
    count(QUIZ_COMPLETED);
    assert.equal(await loadCounts(), null);
    assert.equal(called, false);
  } finally {
    restore();
  }
});

test('count: one keepalive POST to the own origin, no body, no credentials, no referrer', async () => {
  const { count } = await loadCount();
  const calls = browser();
  try {
    count(QUIZ_COMPLETED);
    await settle();
    assert.equal(calls.length, 1);
    const [{ url, init }] = calls;
    assert.equal(url, '/api/count/quiz.completed');
    assert.equal(init.method, 'POST');
    assert.equal(init.keepalive, true);
    assert.equal(init.credentials, 'omit');
    assert.equal(init.referrerPolicy, 'no-referrer');
    assert.equal(init.body, undefined, 'a count carries nothing but its name');
    assert.equal(init.headers, undefined);
  } finally {
    restore();
  }
});

test('count: the quiz reports that a round ended, never a score', async () => {
  const { count } = await loadCount();
  assert.equal(count.length, 1, 'count() takes a name and nothing else');
  const quiz = read('src/components/apps/quiz/QuizApp.tsx');
  const calls = [...quiz.matchAll(/count\(([^)]*)\)/g)].map((match) => match[1]);
  assert.deepEqual(calls, ['QUIZ_COMPLETED']);
});

test('count: each name at most once per page load', async () => {
  const { count } = await loadCount();
  const calls = browser();
  try {
    for (let i = 0; i < 5; i++) count(appOpened('about'));
    count(appOpened('terminal'));
    await settle();
    assert.deepEqual(calls.map((call) => call.url), ['/api/count/app.about.opened', '/api/count/app.terminal.opened']);
  } finally {
    restore();
  }
});

test('count: after the API fails once - 404, 429, a network error - the page sends nothing more', async () => {
  for (const respond of [() => new Response('<html>', { status: 404 }), () => new Response(null, { status: 429 }), () => Promise.reject(new TypeError('offline'))]) {
    const { count } = await loadCount();
    const calls = browser(respond);
    try {
      count(appOpened('about'));
      await settle();
      count(appOpened('terminal'));
      count(QUIZ_COMPLETED);
      await settle();
      assert.equal(calls.length, 1);
    } finally {
      restore();
    }
  }
});

test('count: a fetch that throws synchronously is swallowed', async () => {
  const { count } = await loadCount();
  globalThis.window = {};
  globalThis.fetch = () => { throw new TypeError('blocked'); };
  try {
    assert.doesNotThrow(() => count(QUIZ_COMPLETED));
  } finally {
    restore();
  }
});

/* --- loadCounts() --------------------------------------------------------------- */

test('loadCounts: one GET per page load, parsed and filtered', async () => {
  const { loadCounts } = await loadCount();
  const calls = browser(() => Response.json({ 'quiz.completed': 14, 'evil.name': 3 }));
  try {
    const [first, second] = await Promise.all([loadCounts(), loadCounts()]);
    assert.deepEqual(first, { 'quiz.completed': 14 });
    assert.equal(second, first);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, '/api/counts');
    assert.equal(calls[0].init.method, undefined);
    assert.equal(calls[0].init.credentials, 'omit');
  } finally {
    restore();
  }
});

test('loadCounts: a missing API is null, never an error - the 404 page, a 500, a network error', async () => {
  for (const respond of [
    () => new Response('<!DOCTYPE html><title>404</title>', { status: 404, headers: { 'Content-Type': 'text/html' } }),
    () => new Response('<!DOCTYPE html>', { status: 200, headers: { 'Content-Type': 'text/html' } }),
    () => new Response('oops', { status: 500 }),
    () => new Response('{broken', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    () => Promise.reject(new TypeError('offline')),
  ]) {
    const { loadCounts } = await loadCount();
    browser(respond);
    try {
      assert.equal(await loadCounts(), null);
    } finally {
      restore();
    }
  }
});

/* --- where count() is called ------------------------------------------------- */

test('wiring: a guided auto-solve can never count - only onSolved counts, and guided playback passes noop', () => {
  const shell = read('src/components/puzzles/PuzzleShell.tsx');
  const counts = [...shell.matchAll(/count\(([^)]*\))\)/g)].map((match) => match[1]);
  assert.deepEqual(counts, ['eraSolved(eraId)']);
  const onSolved = shell.slice(shell.indexOf('const onSolved = useCallback'), shell.indexOf('}, [eraId, solvePuzzle]);'));
  assert.match(onSolved, /count\(eraSolved\(eraId\)\)/);
  // The guided demonstration gets noop, and the engine reports a solve in play only.
  const guided = shell.slice(shell.indexOf("presentation={reduced ? 'final' : 'guided'}"), shell.indexOf("presentation={reduced ? 'final' : 'guided'}") + 200);
  assert.match(guided, /onSolved=\{noop\}/);
  const engine = read('src/components/puzzles/engine.ts');
  assert.match(engine, /const solved = interactive && isSolved\(played\);/);
  assert.match(engine, /const interactive = presentation === 'play';/);
});

test('wiring: the mode on the landing page, the Convergence (not Skip), and every app window', () => {
  assert.match(read('src/components/landing/ModeChoice.tsx'), /count\(modeChosen\(option\.mode\)\)/);
  const journey = read('src/components/journey/Journey.tsx');
  assert.match(journey, /finishJourney\(\);\s*count\(JOURNEY_COMPLETED\);/);
  assert.doesNotMatch(read('src/components/journey/SkipToDesktop.tsx'), /count\(/);
  assert.match(read('src/components/os/Window.tsx'), /count\(appOpened\(id\)\)/);
  assert.match(read('src/components/os/MobileShell.tsx'), /count\(appOpened\(id\)\)/);
});

/* --- nothing on the device ------------------------------------------------------ */

test('storage: STORAGE_KEYS is unchanged, and the counters touch no storage and no cookie', () => {
  // Phase 9D-1 added snake and paint, deliberately: both are in the storage
  // table of the deployment-legal skill and in TODO.md for the privacy page.
  assert.deepEqual(STORAGE_KEYS, {
    unlocks: 'amonel.unlocks.v1',
    theme: 'amonel.theme.v1',
    quiz: 'amonel.quiz.v1',
    snake: 'amonel.snake.v1',
    paint: 'amonel.paint.v1',
    replay: 'amonel.replay',
  });
  for (const file of ['src/lib/count.ts', 'src/lib/counters.ts', 'src/lib/use-public-counts.ts', 'src/components/apps/about/VisitorStats.tsx', 'worker/api.ts']) {
    assert.doesNotMatch(read(file), /localStorage|sessionStorage|indexedDB|document\.cookie|Set-Cookie|caches\.open/i, file);
  }
});

test('no third party: the client talks to its own /api only', () => {
  const source = read('src/lib/count.ts');
  const urls = [...source.matchAll(/fetch\(([^,)]+)/g)].map((match) => match[1].trim());
  assert.deepEqual(urls, ['`/api/count/${name}`', "'/api/counts'"]);
  assert.doesNotMatch(source, /https?:\/\//);
});

/* --- copy ----------------------------------------------------------------------- */

test('copy: every new line exists in de, en and fa, and Persian numbers are Persian digits', () => {
  const lines = [
    ['puzzles.common.solvedBy', (locale) => json(`src/messages/${locale}.json`).puzzles.common.solvedBy, { count: 1234 }],
    ['quiz.result.rounds', (locale) => json(`src/messages/apps/quiz/${locale}.json`).result.rounds, { count: 1234 }],
    ['stats.note', (locale) => json(`src/messages/apps/stats/${locale}.json`).note, { min: MIN_PUBLIC_COUNT }],
  ];
  for (const [key, get, values] of lines) {
    for (const locale of LOCALES) {
      const message = get(locale);
      assert.equal(typeof message, 'string', `${key}/${locale}`);
      const text = new IntlMessageFormat(message, locale).format(values);
      if (locale === 'fa') {
        assert.doesNotMatch(text, /[0-9]/, `${key}/fa: ${text}`);
        assert.match(text, /[۰-۹]/, `${key}/fa: ${text}`);
      } else {
        assert.match(text, /\d/, `${key}/${locale}: ${text}`);
      }
    }
  }
});

test('copy: the numbers are counts of events, never claims about people or scores', () => {
  for (const locale of LOCALES) {
    const texts = [
      json(`src/messages/${locale}.json`).puzzles.common.solvedBy,
      json(`src/messages/apps/quiz/${locale}.json`).result.rounds,
      ...Object.values(json(`src/messages/apps/stats/${locale}.json`)),
    ].join(' ');
    assert.doesNotMatch(texts, /score|Punkte|امتیاز|IP|Cookie/i, locale);
  }
});
