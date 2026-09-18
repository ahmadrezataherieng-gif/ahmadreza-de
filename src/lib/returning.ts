import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Returning visitors - those who have reached the desktop once - go straight to
 * it (DECISIONS.md 49). A direct visit to the journey redirects to the desktop,
 * unless this tab asked to see the journey again: the desktop's "Reise erneut
 * ansehen" and the landing page's mode cards set a flag in sessionStorage.
 *
 * Only a real navigation redirects. Back, forward and reload return the visitor
 * to where they were - a redirect there would turn the Back button into a trap.
 */

/** Let this tab open the journey without being sent to the desktop. */
export function allowJourneyReplay(): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.replay, '1');
  } catch {
    // Storage can be unavailable (private modes); the redirect is then skipped
    // only if the visitor never completed the journey, which is the safe side.
  }
}

/** Arriving at the desktop ends a replay; the next direct visit redirects again. */
export function clearJourneyReplay(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.replay);
  } catch {
    // Nothing to clear.
  }
}

/**
 * The inline script the journey runs in <head>, before its first paint, so a
 * returning visitor never sees the journey flash. Plain ES5, no imports: it runs
 * before any bundle. Reads the persisted unlock store directly.
 */
export function returningRedirectScript(desktopHref: string): string {
  const keys = JSON.stringify({ unlocks: STORAGE_KEYS.unlocks, replay: STORAGE_KEYS.replay, href: desktopHref });
  return `(function(){try{var k=${keys};var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];
if(n&&n.type!=='navigate')return;if(sessionStorage.getItem(k.replay)==='1')return;
var raw=localStorage.getItem(k.unlocks);if(!raw)return;var s=JSON.parse(raw);
if(s&&s.state&&s.state.hasCompletedJourney===true)location.replace(k.href);}catch(e){}})();`;
}
