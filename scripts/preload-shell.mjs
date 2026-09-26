// Runs after `next build` (npm run build): adds a <link rel="preload"> for the
// desktop shell's chunk to the three desktop pages of the static export
// (ROADMAP PERF-09).
//
// The shell is client-only (`next/dynamic`, `ssr: false`), so the page's HTML
// never names its chunk and the browser asks for it only after the eight
// scripts before it have run - one more round trip on a slow phone, which is
// what pushed the desktop view's LCP over 2.5 s. The chunk's name carries a
// content hash that exists only after the build, hence a post-build step that
// finds it by a string only the shell contains and edits the exported HTML.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('../out/', import.meta.url);
const CHUNKS = new URL('_next/static/chunks/', OUT);
// The Shell component alone renders this attribute.
const MARKER = 'data-shell-layout';
const PAGES = ['desktop/index.html', 'en/desktop/index.html', 'fa/desktop/index.html'];

const fail = (message) => {
  console.warn(`preload-shell: ${message} - the desktop pages keep loading the shell after hydration`);
  process.exit(0);
};

if (!existsSync(CHUNKS)) fail('out/ has no chunks folder');
const matches = readdirSync(CHUNKS).filter((name) => name.endsWith('.js') && readFileSync(new URL(name, CHUNKS), 'utf8').includes(MARKER));
if (matches.length !== 1) fail(`expected one chunk containing "${MARKER}", found ${matches.length}`);
const href = `/_next/static/chunks/${matches[0]}`;
// The shell's message provider and the formatter behind it are the chunk named
// `intl` (next.config.mjs, queue 3c): the shell cannot start without it, so it
// is preloaded with it, as it was in the page's own script list before.
const intl = readdirSync(CHUNKS).filter((name) => /^intl[.-].*.js$/.test(name));
const intlTag = intl.length === 1 ? `<link rel="preload" as="script" href="/_next/static/chunks/${intl[0]}"/>` : '';
const tag = `<link rel="preload" as="script" href="${href}"/>${intlTag}`;

for (const page of PAGES) {
  const file = new URL(page, OUT);
  if (!existsSync(file)) fail(`${page} is missing`);
  const html = readFileSync(file, 'utf8');
  if (html.includes(tag)) continue;
  if (!html.includes('<link rel="stylesheet"')) fail(`${page} has no stylesheet link to put it before`);
  // After the charset and viewport meta tags, before the first stylesheet.
  writeFileSync(file, html.replace('<link rel="stylesheet"', `${tag}<link rel="stylesheet"`));
}
console.log(`preload-shell: ${href} preloaded on ${PAGES.length} desktop pages`);
