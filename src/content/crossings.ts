import type { EraId } from '@/content/eras';

/**
 * What happened between two eras (BR-10, DECISIONS.md 77).
 *
 * Each crossing shows the technologies that made the next era possible, in year
 * order. Nothing user-facing lives here: `id` points into `crossings.techs` in
 * messages/*.json, and a year is a number (identical in every language). Two
 * entries have no year of their own and say when instead.
 */
export const techIds = [
  'transistor',
  'univac',
  'coreMemory',
  'integratedCircuit',
  'system360',
  'arpanet',
  'intel4004',
  'floppy',
  'ethernet',
  'altair',
  'appleII',
  'mouse',
  'alto',
  'lisa',
  'cdrom',
  'web',
  'linux',
  'modem',
  'search',
  'wifi',
  'cloud',
  'smartphone',
  'ai',
] as const;

export type TechId = (typeof techIds)[number];

export interface CrossingTech {
  id: TechId;
  /** A year, or the key of a `crossings.when` phrase where there is no single year. */
  when: number | 'nineties' | 'today';
}

/** Keyed by the era being left. The last crossing (into the Convergence) has none. */
export const crossingTech: Partial<Record<EraId, readonly CrossingTech[]>> = {
  // CONTENT-TODO CR-1108: 1946 -> 1956
  eniac: [
    { id: 'transistor', when: 1947 },
    { id: 'univac', when: 1951 },
    { id: 'coreMemory', when: 1953 },
  ],
  // CONTENT-TODO CR-1108: 1956 -> 1971
  batch: [
    { id: 'integratedCircuit', when: 1958 },
    { id: 'system360', when: 1964 },
    { id: 'arpanet', when: 1969 },
  ],
  // CONTENT-TODO CR-1108: 1971 -> 1981
  unix: [
    { id: 'intel4004', when: 1971 },
    { id: 'floppy', when: 1971 },
    { id: 'ethernet', when: 1973 },
    { id: 'altair', when: 1975 },
    { id: 'appleII', when: 1977 },
  ],
  // CONTENT-TODO CR-1108: 1981 -> 1984
  dos: [
    { id: 'mouse', when: 1968 },
    { id: 'alto', when: 1973 },
    { id: 'lisa', when: 1983 },
  ],
  // CONTENT-TODO CR-1108: 1984 -> 1995
  macintosh: [
    { id: 'cdrom', when: 1985 },
    { id: 'web', when: 1991 },
    { id: 'linux', when: 1991 },
    { id: 'modem', when: 'nineties' },
  ],
  // CONTENT-TODO CR-1108: 1995 -> today
  win95: [
    { id: 'search', when: 1998 },
    { id: 'wifi', when: 1999 },
    { id: 'cloud', when: 2006 },
    { id: 'smartphone', when: 2007 },
    { id: 'ai', when: 'today' },
  ],
};

/** How many technologies the crossing out of an era shows. */
export const techCount = (leaving: EraId): number => crossingTech[leaving]?.length ?? 0;
