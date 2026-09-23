// The local search behind the Assistant (Phase 8B, DECISIONS.md 53): node strips the types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { eras } from '../../src/content/eras.ts';
import { tickets } from '../../src/content/tickets.ts';
import { search } from '../../src/lib/search/engine.ts';
import { normalise } from '../../src/lib/search/normalise.ts';
import { buildPassages } from '../../src/lib/search/passages.ts';

import aboutDe from '../../src/messages/apps/about/de.json' with { type: 'json' };
import aboutEn from '../../src/messages/apps/about/en.json' with { type: 'json' };
import aboutFa from '../../src/messages/apps/about/fa.json' with { type: 'json' };
import assistantDe from '../../src/messages/apps/assistant/de.json' with { type: 'json' };
import assistantEn from '../../src/messages/apps/assistant/en.json' with { type: 'json' };
import assistantFa from '../../src/messages/apps/assistant/fa.json' with { type: 'json' };
import terminalDe from '../../src/messages/apps/terminal/de.json' with { type: 'json' };
import terminalEn from '../../src/messages/apps/terminal/en.json' with { type: 'json' };
import terminalFa from '../../src/messages/apps/terminal/fa.json' with { type: 'json' };
import ticketsDe from '../../src/messages/apps/tickets/de.json' with { type: 'json' };
import ticketsEn from '../../src/messages/apps/tickets/en.json' with { type: 'json' };
import ticketsFa from '../../src/messages/apps/tickets/fa.json' with { type: 'json' };

const COPY = {
  de: { about: aboutDe, terminal: terminalDe, tickets: ticketsDe, assistant: assistantDe },
  en: { about: aboutEn, terminal: terminalEn, tickets: ticketsEn, assistant: assistantEn },
  fa: { about: aboutFa, terminal: terminalFa, tickets: ticketsFa, assistant: assistantFa },
};
const LOCALES = Object.keys(COPY);

function passagesFor(locale) {
  const c = COPY[locale];
  return buildPassages({
    about: c.about,
    terminal: c.terminal,
    tickets: c.tickets,
    eras: c.assistant.eras,
    keywords: c.assistant.keywords,
    contactSentence: c.assistant.contactSentence,
  });
}

/* --- normalisation -------------------------------------------------------- */

test('normalise: case and Latin diacritics fold together', () => {
  assert.equal(normalise('  FÄHIGKEITEN?! '), 'fahigkeiten');
});

test('normalise: Persian/Arabic letter variants and ZWNJ fold together', () => {
  assert.equal(normalise('علي'), normalise('علی')); // ي vs ی
  assert.equal(normalise('كار'), normalise('کار')); // ك vs ک
  assert.equal(normalise('می‌شود'), normalise('میشود')); // ZWNJ removed
});

/* --- the passages: every one is real content ------------------------------ */

test('passages: every passage is non-empty and comes from the site\'s own content, in every locale', () => {
  for (const locale of LOCALES) {
    const passages = passagesFor(locale);
    assert.ok(passages.length >= 15, `${locale} builds a real index (${passages.length} passages)`);
    for (const passage of passages) assert.ok(passage.text.trim().length > 0, `${locale} ${passage.id}`);

    for (const era of eras) {
      const passage = passages.find((p) => p.id === `era-${era.id}`);
      assert.ok(passage, `${locale} has a passage for ${era.id}`);
      assert.equal(passage.text, COPY[locale].assistant.eras[era.id].description, `${locale} ${era.id} is the era's real truth, verbatim`);
    }

    for (const ticket of tickets) {
      const passage = passages.find((p) => p.id === `ticket-${ticket.id}`);
      assert.ok(passage, `${locale} has a passage for ${ticket.id}`);
      assert.ok(passage.text.includes(COPY[locale].tickets.tickets[ticket.id].lesson), `${locale} ${ticket.id} carries the ticket's real lesson`);
    }

    const contact = passages.find((p) => p.id === 'contact');
    assert.ok(contact.text.includes('kontakt@ahmadreza.de'), `${locale} contact passage carries the confirmed address`);
  }
});

test('passages: a placeholder career station never becomes a passage presented as fact', () => {
  for (const locale of LOCALES) {
    assert.equal(
      passagesFor(locale).some((p) => p.id === 'station-earlier'),
      false,
      locale,
    );
  }
});

/* --- search: matching, per locale ------------------------------------------ */

const MATCHES = {
  de: [
    ['Welche Fähigkeiten hat er?', 'skills-network'],
    ['Wie ist sein Werdegang?', 'station-apprenticeship'],
    ['Was lehrt die Epoche 1971?', 'era-unix'],
    ['Wie erreiche ich ihn?', 'contact'],
  ],
  en: [
    ['What skills does he have?', 'skills-network'],
    ['What is his career path?', 'station-apprenticeship'],
    ['What does the 1971 era teach?', 'era-unix'],
    ['How can I reach him?', 'contact'],
  ],
  fa: [
    ['چه مهارت‌هایی دارد؟', 'skills-network'],
    ['مسیر شغلی او چگونه است؟', 'station-apprenticeship'],
    ['دوران ۱۹۷۱ چه چیزی یاد می‌دهد؟', 'era-unix'],
    ['چطور می‌توانم با او تماس بگیرم؟', 'contact'],
  ],
};

test('search: a matching question finds the right passage first, in every locale', () => {
  for (const locale of LOCALES) {
    const passages = passagesFor(locale);
    for (const [question, expectedId] of MATCHES[locale]) {
      const hits = search(question, passages);
      assert.ok(hits.length > 0, `${locale}: "${question}" found something`);
      assert.equal(hits[0].passage.id, expectedId, `${locale}: "${question}" -> ${hits[0]?.passage.id}`);
    }
  }
});

test('search: an off-topic question matches nothing - honest, never a guess', () => {
  const off = { de: 'Wie backe ich einen Kuchen?', en: 'How do I bake a chocolate cake?', fa: 'چطور یک کیک شکلاتی بپزم؟' };
  for (const locale of LOCALES) assert.deepEqual(search(off[locale], passagesFor(locale)), []);
  assert.deepEqual(search('', passagesFor('de')), []);
  assert.deepEqual(search('   ', passagesFor('de')), []);
});

test('search: results are capped and sorted best first', () => {
  const hits = search('Netzwerke und Linux, welche Themen und Fähigkeiten?', passagesFor('de'), 2);
  assert.ok(hits.length <= 2);
  for (let i = 1; i < hits.length; i++) assert.ok(hits[i - 1].score >= hits[i].score);
});
