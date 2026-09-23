/**
 * Turns the site's own content and copy into passages the local search can
 * match against (Phase 8B, DECISIONS.md 53). Pure and typed-data-in,
 * typed-data-out - like `worker/sources.ts` used to build for Gemini's
 * context, except this runs in the visitor's browser instead of at the
 * Worker's build time, and every locale gets its own passages from its own
 * copy. Nothing here is written by hand: a passage is always a sentence that
 * already exists in `src/content/` or `messages/`.
 */

import { careerStations, languages, skillAreas } from '../../content/about.ts';
import { eras } from '../../content/eras.ts';
import { EMAIL } from '../../content/profile.ts';
import { projects } from '../../content/projects.ts';
import { tickets } from '../../content/tickets.ts';
import type { Passage } from './types.ts';

interface AboutCopy {
  intro: readonly string[];
  path: { stations: Record<string, { title: string; place: string; text: string }> };
  now: { text: readonly string[] };
  skills: { areas: Record<string, { title: string; skills: Record<string, string> }> };
  languages: { names: Record<string, string> };
}

interface TerminalCopy {
  projects: { items: Record<string, { name: string; text: string }> };
}

interface TicketsCopy {
  tickets: Record<string, { title: string; symptom: string; lesson: string }>;
}

/** Just the two fields the search needs, duplicated from `messages/<locale>.json` (`eras`) into the Assistant's own copy so it stays in the Assistant's own chunk. */
export interface EraSearchCopy {
  name: string;
  description: string;
}

/**
 * Words a visitor might ask with that never appear in the answer itself -
 * "wie erreiche ich ihn" should find the contact passage even though its text
 * says "E-Mail", not "erreichen". One list per passage category, the
 * Assistant's own copy (`messages/apps/assistant/<locale>.json`, `keywords`),
 * the same idea the old demo topics' `keywords` already used - each category
 * nests its list under a `keywords` key so `scripts/test/apps.test.mjs`'s
 * cross-locale shape check (which exempts any `…keywords` array from having
 * to match length between languages) still applies to it.
 */
export interface SearchKeywords {
  about: { keywords: readonly string[] };
  now: { keywords: readonly string[] };
  station: { keywords: readonly string[] };
  skills: { keywords: readonly string[] };
  language: { keywords: readonly string[] };
  project: { keywords: readonly string[] };
  era: { keywords: readonly string[] };
  ticket: { keywords: readonly string[] };
  contact: { keywords: readonly string[] };
}

export interface PassageSources {
  about: AboutCopy;
  terminal: TerminalCopy;
  tickets: TicketsCopy;
  eras: Record<string, EraSearchCopy>;
  keywords: SearchKeywords;
  /** "Am schnellsten per E-Mail an {email}." - the Assistant's own sentence, with the address filled in. */
  contactSentence: string | null;
}

export function buildPassages(sources: PassageSources): Passage[] {
  const passages: Passage[] = [];
  const add = (id: string, source: Passage['source'], text: string, keywords: readonly string[] = []) => {
    if (text.trim() !== '') passages.push({ id, source, text: text.trim(), keywords: keywords.filter((word) => word.trim() !== '') });
  };

  add('about-intro', { kind: 'about' }, sources.about.intro.join(' '), sources.keywords.about.keywords);
  add('about-now', { kind: 'now' }, sources.about.now.text.join(' '), sources.keywords.now.keywords);

  for (const station of careerStations) {
    if (station.placeholder) continue;
    const copy = sources.about.path.stations[station.id];
    if (!copy) continue;
    add('station-' + station.id, { kind: 'station', id: station.id }, `${copy.title}${copy.place ? `, ${copy.place}` : ''}. ${copy.text}`, [copy.title, copy.place, ...sources.keywords.station.keywords]);
  }

  for (const area of skillAreas) {
    const copy = sources.about.skills.areas[area.id];
    if (!copy) continue;
    const items = area.skills.map((skill) => copy.skills[skill]).filter((item): item is string => Boolean(item));
    add('skills-' + area.id, { kind: 'skillArea', id: area.id }, `${copy.title}: ${items.join('; ')}`, [copy.title, ...items, ...sources.keywords.skills.keywords]);
  }

  const languageNames = languages.map((language) => sources.about.languages.names[language.id]).filter((name): name is string => Boolean(name));
  if (languageNames.length > 0) add('languages', { kind: 'language' }, languageNames.join(', '), sources.keywords.language.keywords);

  for (const project of projects) {
    const copy = sources.terminal.projects.items[project.id];
    if (!copy) continue;
    add('project-' + project.id, { kind: 'project', id: project.id }, `${copy.name}: ${copy.text}`, [copy.name, ...project.stack, ...sources.keywords.project.keywords]);
  }

  for (const era of eras) {
    const copy = sources.eras[era.id];
    if (!copy) continue;
    add('era-' + era.id, { kind: 'era', id: era.id, year: era.year }, copy.description, [copy.name, era.year, ...sources.keywords.era.keywords]);
  }

  for (const ticket of tickets) {
    const copy = sources.tickets.tickets[ticket.id];
    if (!copy) continue;
    add('ticket-' + ticket.id, { kind: 'ticket', id: ticket.id, number: ticket.number }, `${copy.title}. ${copy.lesson}`, [copy.title, copy.symptom, ...sources.keywords.ticket.keywords]);
  }

  if (EMAIL.available && sources.contactSentence) {
    add('contact', { kind: 'contact' }, sources.contactSentence.replace('{email}', EMAIL.address), [EMAIL.address, ...sources.keywords.contact.keywords]);
  }

  return passages;
}
