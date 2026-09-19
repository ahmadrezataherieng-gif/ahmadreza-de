/**
 * The material the assistant may answer from: the site's own content, and
 * nothing else. `sources.ts` fills it from `src/content/` and the German
 * message files at build time, so this text is never written by hand and
 * cannot drift from what the site says.
 *
 * It is German because German is the source language of the copy; the prompt
 * tells the model to answer in the visitor's language.
 */

export interface ContextInput {
  site: string;
  name: string;
  role: string;
  intro: readonly string[];
  stations: readonly { title: string; place: string; text: string; start: string | null; placeholder: boolean }[];
  now: readonly string[];
  skills: readonly { area: string; items: readonly string[] }[];
  languages: readonly { name: string; level: string | null }[];
  projects: readonly { name: string; text: string; url: string; source: string; stack: readonly string[] }[];
  /** The seven eras with the one truth each teaches. */
  eras: readonly { year: string; name: string; truth: string }[];
  /** Nine invented helpdesk cases: a title and what each one teaches. */
  tickets: { note: string; cases: readonly { title: string; lesson: string }[] };
  email: string | null;
  resumeAvailable: boolean;
}

export function buildContext(input: ContextInput): string {
  const lines: string[] = [];
  const section = (title: string) => lines.push('', `## ${title}`);

  lines.push(`Website: ${input.site}`, `Name: ${input.name}`, `Rolle: ${input.role}`);

  section('Über Ahmadreza');
  lines.push(...input.intro);

  section('Werdegang');
  for (const station of input.stations) {
    if (station.placeholder) continue;
    lines.push(`- ${station.title}${station.place ? `, ${station.place}` : ''}: ${station.text}`);
  }
  lines.push(...input.now);

  section('Fähigkeiten (ohne Stufen)');
  for (const area of input.skills) lines.push(`- ${area.area}: ${area.items.join('; ')}`);

  section('Sprachen');
  lines.push(input.languages.map((language) => language.name).join(', '));

  section('Projekte');
  for (const project of input.projects) {
    lines.push(`- ${project.name}: ${project.text} Technik: ${project.stack.join(', ')}. Website: ${project.url}. Quellcode: ${project.source}`);
  }

  section('Die sieben Epochen dieser Website (jede lehrt eine Wahrheit über Computer)');
  for (const era of input.eras) lines.push(`- ${era.year}, ${era.name}: ${era.truth}`);

  section('Das Ticketsystem auf dem Desktop');
  lines.push(input.tickets.note);
  for (const ticket of input.tickets.cases) lines.push(`- ${ticket.title}: ${ticket.lesson}`);

  section('Kontakt');
  lines.push(input.email ? `E-Mail: ${input.email}` : 'Eine Kontaktadresse ist noch nicht veröffentlicht.');
  lines.push(input.resumeAvailable ? 'Ein Lebenslauf als PDF steht auf der Website zum Download bereit.' : 'Ein Lebenslauf als PDF ist noch nicht veröffentlicht.');

  // What the site does not say, listed so that "I don't know" has a reason.
  const unknown = [
    ...(input.stations.some((station) => station.start === null && !station.placeholder) ? ['der Beginn der Ausbildung'] : []),
    ...(input.stations.some((station) => station.placeholder) ? ['frühere Stationen wie Schule, Studium und frühere Tätigkeiten'] : []),
    ...(input.languages.some((language) => language.level === null) ? ['das Niveau der Sprachkenntnisse'] : []),
    'Alter, Wohnort, Gehalt, Verfügbarkeit, Zeugnisse, Referenzen und alles Private',
  ];
  section('Nicht bekannt (die Website sagt dazu nichts)');
  lines.push(unknown.join('; '));

  return lines.join('\n');
}
