/**
 * Assets Ahmadreza still has to supply, and where the site expects them.
 *
 * Each is described here rather than probed at runtime: a static export cannot
 * check whether a file exists without requesting it, and a request for a missing
 * file is exactly the noisy 404 this avoids. Flip `available` when the file is
 * in `public/`. TODO.md lists what is still owed.
 */

/**
 * The landing-page portrait. The one raster asset the project allows.
 * 4:5 portrait orientation; supply at 1200 x 1500 px (2x of the largest size it
 * is displayed at, 600 x 750 CSS px), as a progressive JPEG under ~250 kB.
 */
export const PORTRAIT = {
  src: '/images/portrait.jpg',
  width: 1200,
  height: 1500,
  available: false,
} as const;

/** The résumé download. Until the PDF exists the control renders disabled. */
export const RESUME = {
  href: '/files/ahmadreza-taheri-lebenslauf.pdf',
  available: false,
} as const;

/**
 * The contact address, confirmed by Ahmadreza in Phase 7. `available` still
 * gates every mailto link. Before launch the address must really receive mail
 * (TODO.md, Phase 13): the Impressum depends on a working contact.
 */
export const EMAIL = {
  address: 'kontakt@ahmadreza.de',
  available: true,
} as const;
