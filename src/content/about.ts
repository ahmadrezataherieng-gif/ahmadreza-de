/**
 * Who Ahmadreza is, as typed data: career stations, skills by area, languages.
 *
 * Structure only. Every word a visitor reads lives in
 * `messages/apps/about/<locale>.json` under the same ids, so the About app and
 * the Terminal's `about` and `skills` commands tell the same story in every
 * language.
 *
 * Nothing here is guessed. A fact Ahmadreza has not supplied yet is `null` and
 * renders as a visibly marked placeholder; TODO.md lists each one.
 */

export const careerStationIds = ['apprenticeship', 'earlier'] as const;
export type CareerStationId = (typeof careerStationIds)[number];

export interface CareerStation {
  id: CareerStationId;
  /** `YYYY-MM`, or null while the date is still owed. */
  start: string | null;
  /** `YYYY-MM`, or null: still running when `current`, otherwise owed. */
  end: string | null;
  current: boolean;
  /** The whole station is a placeholder for facts still to come. */
  placeholder: boolean;
}

export const careerStations: readonly CareerStation[] = [
  // The one station already on the site: the apprenticeship. Its start date is owed.
  { id: 'apprenticeship', start: null, end: null, current: true, placeholder: false },
  // Schooling, earlier work, the move to Germany: not supplied yet.
  { id: 'earlier', start: null, end: null, current: false, placeholder: true },
];

/**
 * Skills grouped by area. No levels and no percentages: a bar at "80 %" is a
 * number nobody can check. The areas follow the site's two stated focuses,
 * networks and Linux, and the work of the apprenticeship itself.
 */
export const skillAreas = [
  { id: 'network', skills: ['tcpip', 'subnetting', 'dnsDhcp', 'firewall', 'wifi'] },
  { id: 'systems', skills: ['linux', 'shell', 'windows', 'accounts'] },
  { id: 'support', skills: ['troubleshooting', 'tickets', 'documentation', 'hardware'] },
] as const satisfies readonly { id: string; skills: readonly string[] }[];

export type SkillAreaId = (typeof skillAreas)[number]['id'];

/**
 * The three languages on the landing page. Their levels are owed (TODO.md);
 * until then none is shown rather than one guessed.
 */
export const languages = [
  { id: 'de', level: null },
  { id: 'en', level: null },
  { id: 'fa', level: null },
] as const satisfies readonly { id: string; level: string | null }[];
