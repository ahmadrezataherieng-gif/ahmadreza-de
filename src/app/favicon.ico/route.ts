import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * `/favicon.ico`, as a static file.
 *
 * Browsers request this path on their own even though every page links
 * `/favicon.svg`. Without a route here the request fell into the locale
 * catch-all and failed there (a 500 in dev). A static route takes precedence
 * over the catch-all, and the export writes it out as a plain file. Cloudflare
 * additionally 301s the path to the SVG (`public/_redirects`), so production
 * serves it with the correct content type.
 *
 * The body is the SVG favicon itself - one icon, one source of truth.
 */
export const dynamic = 'force-static';

const ICON = readFileSync(path.join(process.cwd(), 'public', 'favicon.svg'));

export function GET(): Response {
  return new Response(ICON, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
