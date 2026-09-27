import { execFileSync } from 'node:child_process';

let cached: { date: Date | undefined } | null = null;

/**
 * When the site's own content last changed: the date of the last commit that
 * touched the source or the public files - a real signal, unlike a build date
 * that moves on every deploy. Without git (a build from a plain archive) there
 * is no date, and the sitemap's `lastmod` and the ProfilePage's `dateModified`
 * are left out rather than invented. Build-time only (server components and
 * the sitemap); read once per build.
 */
export function lastChange(): Date | undefined {
  if (cached) return cached.date;
  let date: Date | undefined;
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', 'src', 'public'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const parsed = new Date(iso);
    date = Number.isNaN(parsed.getTime()) ? undefined : parsed;
  } catch {
    date = undefined;
  }
  cached = { date };
  return date;
}

/** Minutes east of UTC for Europe/Berlin at this instant (+60 CET, +120 CEST), via two Intl round-trips - no timezone database dependency. */
function berlinOffsetMinutes(date: Date): number {
  const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const berlin = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
  return Math.round((berlin.getTime() - utc.getTime()) / 60000);
}

/**
 * `date` as a full ISO 8601 date-time with its Europe/Berlin UTC offset
 * (e.g. "2026-09-27T10:00:00+02:00") and ASCII digits throughout - what
 * schema.org's `dateModified` needs; a date-only string is invalid there
 * (the live Search Console error this fixes). Exported for its own test.
 */
export function toBerlinIso(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  const offset = berlinOffsetMinutes(date);
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/**
 * `lastChange()` formatted for `dateModified`: a full ISO 8601 date-time
 * with the Europe/Berlin offset, or undefined when the date itself is
 * unknown (never an invented one).
 */
export function lastChangeIso(): string | undefined {
  const date = lastChange();
  return date ? toBerlinIso(date) : undefined;
}
