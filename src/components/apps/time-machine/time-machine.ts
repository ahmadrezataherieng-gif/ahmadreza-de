/**
 * The Time Machine's logic (Phase 9D-2, DECISIONS.md 64): where a year lands,
 * and the one stored preference. Pure and alias-free, so `npm test`
 * runs it in plain node.
 */
import type { StorageLike } from '../../../lib/safe-storage.ts';
import type { ThemeId } from '../../../lib/themes.ts';
import { STORAGE_KEYS } from '../../../lib/constants.ts';

/**
 * The year each era's look begins, oldest first. The last era, "today", is the
 * cloud: it starts when renting computers by the hour became public, in 2006.
 * `modern` is Amonel OS's own look and has no year - it is the present.
 */
// CONTENT-TODO CR-1076
export const ERA_STARTS: readonly (readonly [number, ThemeId])[] = [
  [1946, 'era1946'],
  [1956, 'era1956'],
  [1971, 'era1971'],
  [1981, 'era1981'],
  [1984, 'era1984'],
  [1995, 'era1995'],
  [2006, 'era2024'],
];

export type Destination =
  | { kind: 'era'; year: number; themeId: ThemeId }
  | { kind: 'tooEarly'; year: number }
  | { kind: 'future'; year: number }
  | { kind: 'invalid' };

/** Any year from 1946 to now lands in the era that was current then. */
export function destinationForYear(input: string, currentYear: number): Destination {
  const text = input.trim().replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
  if (!/^\d{1,4}$/.test(text)) return { kind: 'invalid' };
  const year = Number(text);
  if (year > currentYear) return { kind: 'future', year };
  let landing: ThemeId | null = null;
  for (const [start, themeId] of ERA_STARTS) if (year >= start) landing = themeId;
  return landing ? { kind: 'era', year, themeId: landing } : { kind: 'tooEarly', year };
}

/**
 * The counter's stops on the way from one year to another: `steps` numbers,
 * easing into the target so the last years tick slowly, like a dial settling.
 */
export function yearStops(from: number, to: number, steps: number): number[] {
  if (steps <= 1 || from === to) return [to];
  return Array.from({ length: steps }, (_, index) => {
    const t = (index + 1) / steps;
    const eased = 1 - (1 - t) ** 3;
    return Math.round(from + (to - from) * eased);
  });
}

/** What is stored under `amonel.theme.v1`: the chosen era, versioned. Nothing else. */
interface StoredChoice {
  v: 1;
  theme: ThemeId;
}

/**
 * Reads the visitor's chosen era. Anything unexpected - no key, broken JSON,
 * an unknown id, a blocked storage - reads as "no choice", never as a crash.
 */
export function readStoredTheme(storage: StorageLike | undefined, known: readonly ThemeId[]): ThemeId | null {
  try {
    const raw = storage?.getItem(STORAGE_KEYS.theme);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredChoice> | null;
    if (!parsed || parsed.v !== 1 || typeof parsed.theme !== 'string') return null;
    const theme = known.find((id) => id === parsed.theme);
    return theme && theme !== 'modern' ? theme : null;
  } catch {
    return null;
  }
}

/** Remembers an era; returning to the present removes the key entirely. */
export function writeStoredTheme(storage: StorageLike | undefined, theme: ThemeId): void {
  try {
    if (theme === 'modern') storage?.removeItem(STORAGE_KEYS.theme);
    else storage?.setItem(STORAGE_KEYS.theme, JSON.stringify({ v: 1, theme } satisfies StoredChoice));
  } catch {
    // Blocked storage: the jump still happens, it is just not remembered.
  }
}
