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
