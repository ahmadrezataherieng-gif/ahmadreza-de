// The Computer-Quiz (Phase 9B, DECISIONS.md 55): the bank, the round picker
// and the scoring, run as they are - node strips the types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

import { baseAppIds, eraIds } from '../../src/content/eras.ts';
import { quizOptionIds, quizQuestions } from '../../src/content/quiz.ts';
import { bestOf, pickRound, resultBand, ROUND_SIZE, scoreRound, shuffle } from '../../src/components/apps/quiz/quiz.ts';
import { buildPassages } from '../../src/lib/search/passages.ts';

const LOCALES = ['de', 'en', 'fa'];
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const copy = (locale) => JSON.parse(read(`src/messages/apps/quiz/${locale}.json`));
const appCopy = (app, locale) => JSON.parse(read(`src/messages/apps/${app}/${locale}.json`));

/** A seeded generator (mulberry32), so a failing round can be replayed. */
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/* --- the bank ------------------------------------------------------------- */

test('bank: about thirty questions, unique ids, at least four per era, every era covered', () => {
  assert.ok(quizQuestions.length >= 28 && quizQuestions.length <= 40, `${quizQuestions.length} questions`);
  assert.equal(new Set(quizQuestions.map((question) => question.id)).size, quizQuestions.length);
  for (const era of eraIds) {
    const count = quizQuestions.filter((question) => question.era === era).length;
    assert.ok(count >= 4, `${era}: ${count} questions`);
  }
  for (const question of quizQuestions) assert.ok(eraIds.includes(question.era), question.id);
});

test('bank: three or four distinct options and exactly one correct answer', () => {
  for (const question of quizQuestions) {
    assert.ok(question.options.length >= 3 && question.options.length <= 4, question.id);
    assert.equal(new Set(question.options).size, question.options.length, question.id);
    for (const option of question.options) assert.ok(quizOptionIds.includes(option), `${question.id}.${option}`);
    // One `correct` id, and it is one of the options: exactly one right answer.
    assert.equal(question.options.filter((option) => option === question.correct).length, 1, question.id);
  }
});

test('bank: the right answers are not all in the same place', () => {
  assert.ok(new Set(quizQuestions.map((question) => question.correct)).size >= 3);
});

/* --- the copy ------------------------------------------------------------- */

test('copy: the same question ids and options in de, en and fa, none empty', () => {
  const ids = quizQuestions.map((question) => question.id).sort();
  for (const locale of LOCALES) {
    const quiz = copy(locale);
    assert.deepEqual(Object.keys(quiz.questions).sort(), ids, locale);
    for (const question of quizQuestions) {
      const text = quiz.questions[question.id];
      assert.ok(text.question.trim(), `${locale} ${question.id}.question`);
      assert.ok(text.explanation.trim(), `${locale} ${question.id}.explanation`);
      assert.deepEqual(Object.keys(text.options).sort(), [...question.options].sort(), `${locale} ${question.id}.options`);
      const labels = question.options.map((option) => text.options[option].trim());
      for (const label of labels) assert.ok(label, `${locale} ${question.id}: empty option`);
      assert.equal(new Set(labels).size, labels.length, `${locale} ${question.id}: two options read the same`);
    }
    for (const era of eraIds) assert.ok(quiz.eras[era]?.trim(), `${locale} eras.${era}`);
  }
});

test('copy: every explanation names its era', () => {
  const persianDigits = (text) => text.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
  const today = { de: 'heute', en: 'today', fa: 'امروز' };
  const years = { eniac: '1946', batch: '1956', unix: '1971', dos: '1981', macintosh: '1984', win95: '1995' };
  for (const locale of LOCALES) {
    const quiz = copy(locale);
    for (const question of quizQuestions) {
      const explanation = quiz.questions[question.id].explanation.toLowerCase();
      const year = years[question.era];
      const named = year ? explanation.includes(year) || explanation.includes(persianDigits(year)) : explanation.includes(today[locale]);
      assert.ok(named, `${locale} ${question.id} does not name its era`);
    }
  }
});

test('copy: never an IQ, intelligence or aptitude test, and "Sie", never "du"', () => {
  for (const locale of LOCALES) {
    const text = JSON.stringify(copy(locale));
    assert.doesNotMatch(text, /\bIQ\b|intelligen|begab|aptitude|eignungstest|هوش(?!\s*مصنوعی)|استعداد/i, locale);
  }
  const de = JSON.stringify(copy('de'));
  assert.doesNotMatch(de, /\b(du|dich|dir|dein|deine|deinen)\b/i);
  assert.doesNotMatch(JSON.stringify(copy('fa')), /(^|[\s«"])تو([\s»".،]|$)/);
});

test('the quiz is a base app with a title in every language', () => {
  assert.ok(baseAppIds.includes('quiz'));
  for (const locale of LOCALES) {
    const site = JSON.parse(read(`src/messages/${locale}.json`));
    assert.ok(site.os.apps.quiz.title.trim(), locale);
  }
});

/* --- a round -------------------------------------------------------------- */

test('pickRound: ten distinct questions, every era, no era more than twice', () => {
  for (let seed = 1; seed <= 500; seed += 1) {
    const round = pickRound(quizQuestions, seeded(seed));
    assert.equal(round.length, ROUND_SIZE, `seed ${seed}`);
    assert.equal(new Set(round.map((question) => question.id)).size, ROUND_SIZE, `seed ${seed}: repeats`);
    const perEra = new Map();
    for (const question of round) perEra.set(question.era, (perEra.get(question.era) ?? 0) + 1);
    assert.equal(perEra.size, eraIds.length, `seed ${seed}: an era is missing`);
    for (const [era, count] of perEra) assert.ok(count <= 2, `seed ${seed}: ${era} ${count} times`);
  }
});

test('pickRound: options are shuffled, never lost, and the right answer stays right', () => {
  const orders = new Set();
  for (let seed = 1; seed <= 100; seed += 1) {
    for (const asked of pickRound(quizQuestions, seeded(seed))) {
      const source = quizQuestions.find((question) => question.id === asked.id);
      assert.deepEqual([...asked.options].sort(), [...source.options].sort());
      assert.equal(asked.correct, source.correct);
      assert.equal(asked.era, source.era);
      if (asked.id === 'byte-bits') orders.add(asked.options.join(''));
    }
  }
  assert.ok(orders.size > 1, 'the option order changes between rounds');
});

test('pickRound: with Math.random, too', () => {
  const round = pickRound(quizQuestions);
  assert.equal(new Set(round.map((question) => question.id)).size, ROUND_SIZE);
});

test('shuffle: a permutation, and the input is untouched', () => {
  const input = [1, 2, 3, 4, 5];
  const output = shuffle(input, seeded(7));
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual([...output].sort(), input);
});

/* --- scoring -------------------------------------------------------------- */

test('scoreRound: counts right answers and names each missed era once, in the order asked', () => {
  const round = pickRound(quizQuestions, seeded(42));
  const allRight = round.map((question) => question.correct);
  assert.deepEqual(scoreRound(round, allRight), { score: 10, total: 10, missedEras: [] });

  const wrong = (question) => question.options.find((option) => option !== question.correct);
  const answers = round.map((question, index) => (index === 1 ? wrong(question) : index === 4 ? null : question.correct));
  const result = scoreRound(round, answers);
  assert.equal(result.score, 8);
  assert.equal(result.total, 10);
  const expected = [...new Set([round[1].era, round[4].era])];
  assert.deepEqual(result.missedEras, expected);

  const none = scoreRound(round, round.map(wrong));
  assert.equal(none.score, 0);
  assert.equal(none.missedEras.length, new Set(round.map((question) => question.era)).size);
});

test('resultBand and bestOf', () => {
  assert.equal(resultBand(10, 10), 'all');
  assert.equal(resultBand(9, 10), 'most');
  assert.equal(resultBand(7, 10), 'most');
  assert.equal(resultBand(6, 10), 'half');
  assert.equal(resultBand(4, 10), 'half');
  assert.equal(resultBand(3, 10), 'start');
  assert.equal(resultBand(0, 10), 'start');
  assert.equal(bestOf(null, 4), 4);
  assert.equal(bestOf(7, 4), 7);
  assert.equal(bestOf(7, 9), 9);
});

/* --- the Assistant never sees the quiz ------------------------------------ */

test('the Assistant\'s search neither imports the quiz nor finds its text', () => {
  const searchDir = new URL('../../src/lib/search/', import.meta.url);
  const sources = [
    ...readdirSync(searchDir).map((file) => read(`src/lib/search/${file}`)),
    read('src/components/apps/assistant/AssistantApp.tsx'),
    read('src/components/apps/assistant/assistant.ts'),
  ];
  for (const source of sources) assert.doesNotMatch(source, /quiz/i);

  for (const locale of LOCALES) {
    const assistant = appCopy('assistant', locale);
    const passages = buildPassages({
      about: appCopy('about', locale),
      terminal: appCopy('terminal', locale),
      tickets: appCopy('tickets', locale),
      eras: assistant.eras,
      keywords: assistant.keywords,
      contactSentence: assistant.contactSentence,
    });
    const index = passages.map((passage) => passage.text).join('\n');
    for (const question of Object.values(copy(locale).questions)) {
      assert.ok(!index.includes(question.explanation), `${locale}: a quiz explanation is in the index`);
      assert.ok(!index.includes(question.question), `${locale}: a quiz question is in the index`);
    }
  }
});
