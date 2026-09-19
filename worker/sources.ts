import { careerStations, languages, skillAreas } from '../src/content/about.ts';
import { eras } from '../src/content/eras.ts';
import { EMAIL, RESUME } from '../src/content/profile.ts';
import { projects } from '../src/content/projects.ts';
import { tickets } from '../src/content/tickets.ts';
import about from '../src/messages/apps/about/de.json' with { type: 'json' };
import terminal from '../src/messages/apps/terminal/de.json' with { type: 'json' };
import ticketCopy from '../src/messages/apps/tickets/de.json' with { type: 'json' };
import site from '../src/messages/de.json' with { type: 'json' };
import { buildContext, type ContextInput } from './context.ts';

/**
 * The real material: typed content plus the German copy, joined by the ids they
 * share. Read at build time by the Worker bundle; nothing here is typed by hand.
 */

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

function eraTruth(id: string): { name: string; truth: string } {
  const copy = (site.eras as Record<string, { name?: string; description?: string }>)[id];
  return { name: text(copy?.name), truth: text(copy?.description) };
}

export const CONTEXT_INPUT: ContextInput = {
  site: 'https://ahmadreza.de',
  name: about.name,
  role: about.role,
  intro: about.intro,
  stations: careerStations.map((station) => {
    const copy = about.path.stations[station.id];
    return { title: copy.title, place: copy.place, text: copy.text, start: station.start, placeholder: station.placeholder };
  }),
  now: about.now.text,
  skills: skillAreas.map((area) => {
    const copy = about.skills.areas[area.id];
    return { area: copy.title, items: area.skills.map((skill) => text((copy.skills as Record<string, string>)[skill])) };
  }),
  languages: languages.map((language) => ({ name: about.languages.names[language.id], level: language.level })),
  projects: projects.map((project) => {
    const copy = terminal.projects.items[project.id];
    return { name: copy.name, text: copy.text, url: project.url, source: project.source, stack: project.stack };
  }),
  eras: eras.map((era) => {
    const { name, truth } = eraTruth(era.id);
    return { year: era.yearLabelKey ? 'Heute' : era.year, name, truth };
  }),
  tickets: {
    note: `${ticketCopy.organisation}: ${ticketCopy.simulation}`,
    cases: tickets.map((ticket) => {
      const copy = (ticketCopy.tickets as Record<string, { title: string; lesson: string }>)[ticket.id];
      return { title: copy.title, lesson: copy.lesson };
    }),
  },
  email: EMAIL.available ? EMAIL.address : null,
  resumeAvailable: RESUME.available,
};

export const CONTEXT = buildContext(CONTEXT_INPUT);
