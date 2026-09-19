// The Assistant's client logic and copy, run as they are: node strips the types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { demoTopicIds, interpretReply, matchDemoTopic, normalise, phases, typingStep } from '../../src/components/apps/assistant/assistant.ts';

const LOCALES = ['de', 'en', 'fa'];
const copy = (locale) => JSON.parse(readFileSync(new URL(`../../src/messages/apps/assistant/${locale}.json`, import.meta.url), 'utf8'));
const topicsOf = (c) => demoTopicIds.map((id) => ({ id, keywords: c.demo.topics[id].keywords }));

test('every phase has copy in every language', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    for (const phase of phases) assert.ok(c.status[phase], `${locale} status.${phase}`);
    assert.match(c.status.rateLimited, /\{seconds\}/, `${locale} says how long to wait`);
  }
});

test('the demo can never pass for the live assistant', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    assert.ok(c.source.demo.includes(c.mode.demoBadge), `${locale}: every demo answer is labelled with the badge`);
    assert.notEqual(c.mode.demoBadge, c.mode.liveBadge);
    assert.ok(c.mode.demo && c.mode.demoOffline, `${locale}: both reasons for the demo are explained`);
    assert.doesNotMatch(c.source.demo, new RegExp(c.source.live.split(' · ')[1]), `${locale}: the demo label is not the live label`);
  }
});

test('the privacy line says where questions go once the assistant is live', () => {
  for (const locale of LOCALES) assert.match(copy(locale).privacy, /Gemini/, locale);
});

test('every demo topic has a question, keywords and an answer; contact carries the address', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    for (const id of demoTopicIds) {
      const topic = c.demo.topics[id];
      assert.ok(topic.question && topic.answer && topic.keywords.length > 0, `${locale} ${id}`);
    }
    assert.match(c.demo.topics.contact.answer, /\{email\}/, locale);
  }
});

test('every suggested question finds its own topic, in every language', () => {
  for (const locale of LOCALES) {
    const c = copy(locale);
    for (const id of demoTopicIds) assert.equal(matchDemoTopic(c.demo.topics[id].question, topicsOf(c)), id, `${locale} ${id}`);
  }
});

test('the demo never guesses: an off-topic question matches nothing', () => {
  const off = { de: 'Schreibe mir ein Gedicht über den Mond', en: 'Give me a poem about the moon' };
  const fa = 'یک شعر بنویس';
  assert.equal(matchDemoTopic(off.de, topicsOf(copy('de'))), null);
  assert.equal(matchDemoTopic(off.en, topicsOf(copy('en'))), null);
  assert.equal(matchDemoTopic(fa, topicsOf(copy('fa'))), null);
  assert.equal(matchDemoTopic('', topicsOf(copy('de'))), null);
});

test('matching ignores case, umlauts and punctuation', () => {
  assert.equal(normalise('  FÄHIGKEITEN?! '), 'fahigkeiten');
  assert.equal(matchDemoTopic('Welche FÄHIGKEITEN hat er??', topicsOf(copy('de'))), 'skills');
});

test('the demo\'s answers claim nothing the site does not: no dates, no levels, no numbers but the 80 years', () => {
  for (const locale of LOCALES) {
    for (const id of demoTopicIds) {
      const answer = copy(locale).demo.topics[id].answer;
      const numbers = (answer.match(/\d+/g) ?? []).filter((n) => n !== '80');
      assert.deepEqual(numbers, [], `${locale} ${id}`);
    }
  }
});

test('replies: what the Worker says becomes a state, and anything else is offline', () => {
  assert.deepEqual(interpretReply(200, { status: 'ready' }), { kind: 'ready' });
  assert.deepEqual(interpretReply(200, { status: 'answered', text: 'Hallo' }), { kind: 'answered', text: 'Hallo' });
  assert.deepEqual(interpretReply(200, { status: 'refused', text: 'Nein' }), { kind: 'refused', text: 'Nein' });
  assert.deepEqual(interpretReply(200, { status: 'refused' }), { kind: 'refused' });
  assert.deepEqual(interpretReply(503, { status: 'notConfigured' }), { kind: 'notConfigured' });
  assert.deepEqual(interpretReply(429, { status: 'rateLimited', retryAfter: 12.2 }), { kind: 'rateLimited', retryAfter: 13 });
  assert.deepEqual(interpretReply(429, { status: 'rateLimited' }), { kind: 'rateLimited', retryAfter: 60 });
  assert.deepEqual(interpretReply(429, { status: 'rateLimited', retryAfter: 1e9 }), { kind: 'rateLimited', retryAfter: 3600 });
  for (const bad of [null, undefined, 'x', [], {}, { status: 5 }, { status: 'nonsense' }, { status: 'unavailable' }, { status: 'answered', text: '  ' }]) {
    assert.deepEqual(interpretReply(200, bad), { kind: 'offline' }, JSON.stringify(bad));
  }
  // A 404 page from a server with no Worker behind it, even if it were JSON that says "ready".
  assert.deepEqual(interpretReply(404, { status: 'ready' }), { kind: 'offline' });
  assert.deepEqual(interpretReply(502, { status: 'answered', text: 'x' }), { kind: 'offline' });
});

test('typing: any answer takes about 50 steps at most', () => {
  assert.equal(typingStep(1), 1);
  assert.equal(typingStep(50), 1);
  assert.equal(typingStep(900), 18);
  assert.ok(Math.ceil(900 / typingStep(900)) <= 50);
});
