// The light/dark choice of the site's own pages (landing, About, legal, 404).
// Dark is the default always; the operating system's setting is never read.
// The choice is written to localStorage only after the visitor clicks the
// toggle, never sent anywhere, and never a cookie (TDDDG §25 Abs. 2 Nr. 2;
// Datenschutz, DECISIONS 74).

export const SCHEME_KEY = 'ao-scheme';

export type Scheme = 'dark' | 'light';

/**
 * Inline in <head>, before the first paint, so a returning visitor who chose
 * light never sees a dark flash. Storage that fails (private window, blocked)
 * leaves the default: dark.
 */
export const SCHEME_SCRIPT = `try{if(localStorage.getItem('${SCHEME_KEY}')==='light')document.documentElement.dataset.scheme='light'}catch(e){}`;
