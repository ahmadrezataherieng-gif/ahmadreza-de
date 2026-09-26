/**
 * Assets Ahmadreza still has to supply, and where the site expects them.
 *
 * Each is described here rather than probed at runtime: a static export cannot
 * check whether a file exists without requesting it, and a request for a missing
 * file is exactly the noisy 404 this avoids. Flip `available` when the file is
 * in `public/`. TODO.md lists what is still owed.
 */

// CONTENT-TODO CR-045
/**
 * The portrait: the landing page, the About page and the About window. The one
 * raster asset the project allows. 4:5; 1200 x 1500 px (2x of the largest size
 * it is displayed at, 600 x 750 CSS px), progressive JPEG, plus smaller
 * widths and AVIF copies of the same picture for srcset. The owner's choice of 2026-09-26 is
 * an AI-generated image (OWN-01, DECISIONS 82): every place that shows it also
 * shows the AI label (`PortraitImage`), and the JSON-LD says so. The files are
 * made by `node scripts/portrait.mjs <source>`; the source is never committed.
 */
export const PORTRAIT = {
  src: '/images/portrait.jpg',
  width: 1200,
  height: 1500,
  /** Every file by format, smallest first; the `<picture>` offers AVIF and falls back to JPEG. */
  sources: {
    avif: [
      { src: '/images/portrait-240.avif', width: 240 },
      { src: '/images/portrait-480.avif', width: 480 },
      { src: '/images/portrait-800.avif', width: 800 },
      { src: '/images/portrait-1200.avif', width: 1200 },
    ],
    jpeg: [
      { src: '/images/portrait-480.jpg', width: 480 },
      { src: '/images/portrait-800.jpg', width: 800 },
      { src: '/images/portrait.jpg', width: 1200 },
    ],
  },
  /** IPTC: made by a trained model (schema.org `digitalSourceType`, also in the files' XMP). */
  digitalSourceType: 'https://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
  available: true,
} as const;

/** The résumé download. Until the PDF exists the control renders disabled. */
// CONTENT-TODO CR-044
export const RESUME = {
  href: '/files/ahmadreza-taheri-lebenslauf.pdf',
  available: false,
} as const;

// CONTENT-TODO CR-046
/**
 * The one contact address of the whole site - landing page, About, Terminal,
 * Assistant, Contact, JSON-LD, the Impressum and the Datenschutzerklärung all
 * read it from here (`public/llms.txt` is pinned to it by a test). Ahmadreza
 * chose the Gmail address on 2026-09-24 (DECISIONS.md 61); whether it stays or
 * a domain address replaces it is ROADMAP OWN-09. `available` still gates
 * every mailto link.
 */
export const EMAIL = {
  address: 'ahmadrezataheride@gmail.com',
  available: true,
} as const;
