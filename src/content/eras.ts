import type { ThemeId } from '@/lib/themes';

/**
 * Act 1 content, as typed data.
 *
 * Nothing user-facing lives here: `nameKey` and `descriptionKey` point into
 * messages/*.json. This file only describes structure and wiring.
 */

export const eraIds = [
  'eniac',
  'batch',
  'unix',
  'dos',
  'macintosh',
  'win95',
  'cloud',
] as const;

export type EraId = (typeof eraIds)[number];

/** The artifact a visitor collects by solving that era's puzzle. */
export const artifactIds = [
  'punch-card',
  'job-deck',
  'shell-token',
  'memory-chip',
  'mouse-ball',
  'dial-tone',
  'firewall-key',
] as const;

export type ArtifactId = (typeof artifactIds)[number];

/** Applications on the AhmadOS desktop. Bonus apps start locked. */
export const appIds = [
  'about',
  'terminal',
  'tickets',
  'traceroute',
  'assistant',
  'contact',
  'timeline',
  'cv',
  'punchcard-lab',
  'scheduler',
  'filesystem',
  'memory-map',
  'paint',
  'dialup',
  'firewall',
] as const;

export type AppId = (typeof appIds)[number];

export interface Era {
  id: EraId;
  /** Ordinal position in Act 1, 1-based. */
  index: number;
  /** Displayed as-is; not localized, years are years. */
  year: string;
  /**
   * For an era that is not a year - "today" - an i18n key under `eras` whose
   * value is shown instead of `year`. A hardcoded year here would age.
   */
  yearLabelKey?: string;
  themeId: ThemeId;
  /** i18n keys under the `eras` namespace. */
  nameKey: string;
  descriptionKey: string;
  /** Awarded when the era's puzzle is solved. Wired up in Phase 5. */
  artifact: ArtifactId;
  /** The bonus app that artifact unlocks. */
  unlocksApp: AppId;
  /** The real computing concept the puzzle teaches. Used for SEO copy later. */
  teaches: string;
}

export const eras: readonly Era[] = [
  {
    id: 'eniac',
    index: 1,
    year: '1946',
    themeId: 'era1946',
    nameKey: 'eniac.name',
    descriptionKey: 'eniac.description',
    artifact: 'punch-card',
    unlocksApp: 'punchcard-lab',
    teaches: 'binary and character encoding',
  },
  {
    id: 'batch',
    index: 2,
    year: '1956',
    themeId: 'era1956',
    nameKey: 'batch.name',
    descriptionKey: 'batch.description',
    artifact: 'job-deck',
    unlocksApp: 'scheduler',
    teaches: 'scheduling and why operating systems exist',
  },
  {
    id: 'unix',
    index: 3,
    year: '1971',
    themeId: 'era1971',
    nameKey: 'unix.name',
    descriptionKey: 'unix.description',
    artifact: 'shell-token',
    unlocksApp: 'filesystem',
    teaches: 'the filesystem tree and paths',
  },
  {
    id: 'dos',
    index: 4,
    year: '1981',
    themeId: 'era1981',
    nameKey: 'dos.name',
    descriptionKey: 'dos.description',
    artifact: 'memory-chip',
    unlocksApp: 'memory-map',
    teaches: 'memory constraints',
  },
  {
    id: 'macintosh',
    index: 5,
    year: '1984',
    themeId: 'era1984',
    nameKey: 'macintosh.name',
    descriptionKey: 'macintosh.description',
    artifact: 'mouse-ball',
    unlocksApp: 'paint',
    teaches: 'the WIMP paradigm and keyboard shortcuts',
  },
  {
    id: 'win95',
    index: 6,
    year: '1995',
    themeId: 'era1995',
    nameKey: 'win95.name',
    descriptionKey: 'win95.description',
    artifact: 'dial-tone',
    unlocksApp: 'dialup',
    teaches: 'subnetting fundamentals',
  },
  {
    id: 'cloud',
    index: 7,
    year: '2024',
    yearLabelKey: 'cloud.yearLabel',
    themeId: 'era2024',
    nameKey: 'cloud.name',
    descriptionKey: 'cloud.description',
    artifact: 'firewall-key',
    unlocksApp: 'firewall',
    teaches: 'ports and firewall basics',
  },
];

/** Apps every visitor gets, puzzle or no puzzle. Recruiters are never gated. */
export const baseAppIds: readonly AppId[] = [
  'about',
  'terminal',
  'tickets',
  'traceroute',
  'assistant',
  'contact',
  'timeline',
  'cv',
];

export function getEra(id: EraId): Era {
  const era = eras.find((candidate) => candidate.id === id);
  if (!era) throw new Error(`Unknown era: ${id}`);
  return era;
}

export function getEraByIndex(index: number): Era | undefined {
  return eras.find((era) => era.index === index);
}
