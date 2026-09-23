// The bonus-app unlocks (Phase 9D-1, DECISIONS.md 57): the real state creator
// and persist options from src/lib/unlocks.ts, run in a vanilla zustand store
// over a stand-in for localStorage.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

import { appIds, baseAppIds, eras } from '../../src/content/eras.ts';
import { STORAGE_KEYS } from '../../src/lib/constants.ts';
import {
  createUnlockState,
  isAppUnlocked,
  sanitizeUnlockData,
  unlockedAppIds,
  unlockingEra,
  unlockPersistOptions,
  UNLOCK_STORE_VERSION,
} from '../../src/lib/unlocks.ts';

const bonusAppIds = appIds.filter((id) => !baseAppIds.includes(id));

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

const makeStore = (storage) => createStore()(persist(createUnlockState, unlockPersistOptions(() => storage)));
const lockedBonus = (store) => bonusAppIds.filter((id) => !store.getState().isAppUnlocked(id));

/* --- mapping ------------------------------------------------------------------ */

test('mapping: every era unlocks one bonus app, every bonus app has one era', () => {
  assert.equal(bonusAppIds.length, eras.length);
  assert.equal(new Set(eras.map((era) => era.unlocksApp)).size, eras.length, 'no app is unlocked twice');
  for (const era of eras) assert.ok(bonusAppIds.includes(era.unlocksApp), `${era.id} unlocks a bonus app`);
  for (const id of baseAppIds) assert.equal(unlockingEra(id), undefined, `${id} is never gated`);
});

test('mapping: the 9D-1 apps and the 9D-2 slots sit on their eras', () => {
  const expected = { eniac: 'binary', dos: 'snake', macintosh: 'paint', win95: 'network-tools', cloud: 'time-machine' };
  for (const [eraId, appId] of Object.entries(expected)) assert.equal(unlockingEra(appId)?.id, eraId, appId);
});

/* --- unlocking ----------------------------------------------------------------- */

test('a fresh visitor has every base app and no bonus app', () => {
  const store = makeStore(memoryStorage());
  for (const id of baseAppIds) assert.equal(store.getState().isAppUnlocked(id), true, id);
  assert.deepEqual(lockedBonus(store), bonusAppIds);
  assert.deepEqual(store.getState().unlockedApps(), [...baseAppIds]);
});

test('solving a puzzle by hand unlocks exactly its app, with the artifact', () => {
  const store = makeStore(memoryStorage());
  store.getState().solvePuzzle('dos');
  assert.equal(store.getState().isAppUnlocked('snake'), true);
  assert.equal(store.getState().hasArtifact('memory-chip'), true);
  assert.deepEqual(lockedBonus(store), bonusAppIds.filter((id) => id !== 'snake'));
});

test('a shown solution unlocks the app but awards no artifact', () => {
  const store = makeStore(memoryStorage());
  store.getState().revealPuzzle('macintosh');
  assert.equal(store.getState().isAppUnlocked('paint'), true);
  assert.deepEqual(store.getState().artifacts, []);
});

test('guided mode: a watched puzzle unlocks its app, and nothing else', () => {
  const store = makeStore(memoryStorage());
  store.getState().setMode('guided');
  store.getState().watchPuzzle('eniac');
  store.getState().watchPuzzle('eniac');
  const state = store.getState();
  assert.equal(state.isAppUnlocked('binary'), true);
  assert.deepEqual(state.watchedEras, ['eniac'], 'recorded once');
  assert.deepEqual(state.artifacts, [], 'no artifact for a demonstration');
  assert.deepEqual(state.passedEras, [], 'no Play gate opened by watching');
  assert.deepEqual(state.legendEras, []);
});

test('finishing the journey unlocks every bonus app, even with no puzzle solved', () => {
  const store = makeStore(memoryStorage());
  store.getState().finishJourney();
  assert.deepEqual(lockedBonus(store), []);
  assert.equal(store.getState().hasCompletedJourney, true, 'it also counts as having reached the desktop');
});

test('Zum Desktop reaches the desktop but finishes nothing', () => {
  const store = makeStore(memoryStorage());
  store.getState().completeJourney();
  assert.equal(store.getState().hasCompletedJourney, true);
  assert.deepEqual(lockedBonus(store), bonusAppIds);
});

test('reset locks the bonus apps again and keeps the mode', () => {
  const store = makeStore(memoryStorage());
  store.getState().setMode('interactive');
  store.getState().finishJourney();
  store.getState().resetProgress();
  assert.deepEqual(lockedBonus(store), bonusAppIds);
  assert.equal(store.getState().mode, 'interactive');
});

test('the pure check agrees with the store', () => {
  const data = sanitizeUnlockData({ watchedEras: ['unix'], passedEras: ['win95'], artifacts: ['punch-card'] });
  assert.deepEqual(unlockedAppIds(data).filter((id) => !baseAppIds.includes(id)).sort(), ['binary', 'filesystem', 'network-tools']);
  assert.equal(isAppUnlocked(data, 'time-machine'), false);
});

/* --- persistence --------------------------------------------------------------- */

test('persistence: progress survives a reload, under the one existing key', () => {
  const storage = memoryStorage();
  const first = makeStore(storage);
  first.getState().setMode('guided');
  first.getState().watchPuzzle('dos');
  first.getState().solvePuzzle('macintosh');

  assert.deepEqual([...storage.data.keys()], [STORAGE_KEYS.unlocks], 'no new storage key');
  const saved = JSON.parse(storage.data.get(STORAGE_KEYS.unlocks));
  assert.equal(saved.version, UNLOCK_STORE_VERSION);
  assert.deepEqual(Object.keys(saved.state).sort(), ['artifacts', 'hasCompletedJourney', 'journeyFinished', 'legendEras', 'mode', 'passedEras', 'skippedEras', 'visitedEras', 'watchedEras']);

  const second = makeStore(storage);
  assert.equal(second.getState().isAppUnlocked('snake'), true);
  assert.equal(second.getState().isAppUnlocked('paint'), true);
  assert.equal(second.getState().isAppUnlocked('binary'), false);
  assert.equal(second.getState().mode, 'guided');
});

test('persistence: a v2 store (Phase 9C) keeps its progress and gains nothing', () => {
  const v2 = { state: { artifacts: ['job-deck'], visitedEras: ['batch'], skippedEras: [], passedEras: ['batch', 'unix'], legendEras: [], hasCompletedJourney: true, mode: 'interactive' }, version: 2 };
  const store = makeStore(memoryStorage({ [STORAGE_KEYS.unlocks]: JSON.stringify(v2) }));
  assert.deepEqual(lockedBonus(store).sort(), bonusAppIds.filter((id) => id !== 'scheduler' && id !== 'filesystem').sort());
  assert.equal(store.getState().hasCompletedJourney, true, 'still a returning visitor');
  assert.equal(store.getState().journeyFinished, false, 'reaching the desktop back then may have been Zum Desktop');
});

test('persistence: a v1 store (Phase 5) still counts its solves as passed', () => {
  const v1 = { state: { artifacts: ['mouse-ball'], visitedEras: [], skippedEras: [], hasCompletedJourney: false, mode: null }, version: 1 };
  const store = makeStore(memoryStorage({ [STORAGE_KEYS.unlocks]: JSON.stringify(v1) }));
  assert.deepEqual(store.getState().passedEras, ['macintosh']);
  assert.equal(store.getState().isAppUnlocked('paint'), true);
});

/* --- failing safe -------------------------------------------------------------- */

test('corrupted storage reads as "nothing unlocked" and never throws', () => {
  const junk = [
    'not json',
    '{',
    'null',
    '42',
    '"text"',
    '[]',
    JSON.stringify({ state: null, version: UNLOCK_STORE_VERSION }),
    JSON.stringify({ state: 'x', version: UNLOCK_STORE_VERSION }),
    JSON.stringify({ state: { artifacts: 'punch-card', journeyFinished: 'yes', watchedEras: [1, null, {}], mode: 'admin' }, version: UNLOCK_STORE_VERSION }),
    JSON.stringify({ state: { passedEras: ['atari'], watchedEras: ['__proto__'], journeyFinished: 1 }, version: UNLOCK_STORE_VERSION }),
    JSON.stringify({ state: { journeyFinished: true }, version: 'three' }),
  ];
  for (const raw of junk) {
    const store = makeStore(memoryStorage({ [STORAGE_KEYS.unlocks]: raw }));
    const label = raw.slice(0, 60);
    if (!raw.includes('"journeyFinished":true')) assert.deepEqual(lockedBonus(store), bonusAppIds, label);
    assert.ok(store.getState().mode === null, label);
    // And the store still works afterwards.
    store.getState().solvePuzzle('eniac');
    assert.equal(store.getState().isAppUnlocked('binary'), true, label);
  }
});

test('missing or broken localStorage: everything locked, nothing throws, the store still works', () => {
  const throwing = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {
      throw new Error('SecurityError');
    },
  };
  const variants = [
    () => undefined,
    () => {
      throw new Error('localStorage is not available');
    },
    () => throwing,
  ];
  for (const getStorage of variants) {
    const store = createStore()(persist(createUnlockState, unlockPersistOptions(getStorage)));
    assert.deepEqual(lockedBonus(store), bonusAppIds);
    store.getState().watchPuzzle('dos');
    assert.equal(store.getState().isAppUnlocked('snake'), true, 'kept in memory for this page');
  }
});

test('sanitising drops unknown ids and duplicates, keeps only real booleans', () => {
  assert.deepEqual(
    sanitizeUnlockData({ artifacts: ['punch-card', 'punch-card', 'gold'], passedEras: ['eniac', 7], hasCompletedJourney: 'true', journeyFinished: false, mode: 'interactive' }),
    { artifacts: ['punch-card'], visitedEras: [], skippedEras: [], passedEras: ['eniac'], watchedEras: [], legendEras: [], hasCompletedJourney: false, journeyFinished: false, mode: 'interactive' },
  );
});
