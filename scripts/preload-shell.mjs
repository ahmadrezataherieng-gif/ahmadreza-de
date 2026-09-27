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

// Every chunk the shell's dynamic import waits for, not only the shell's own
// (queue 2026-09-27 item 2): webpack splits modules the shell shares with the
// journey (the language switcher, the message helpers) into a chunk of their
// own, and the formatter is the named chunk `intl` (next.config.mjs, queue 3c).
// Unpreloaded, the shared chunk cost one more round trip after hydration. The
// list is the `Promise.all([n.e(A), n.e(B), ...])` in the page chunk that
// names the shell's id; the ids become files through the runtime's name map.
const all = readdirSync(CHUNKS, { recursive: true }).map(String).filter((name) => name.endsWith('.js'));
const read = (name) => readFileSync(new URL(name.replaceAll('\\', '/'), CHUNKS), 'utf8');
const shellId = matches[0].split('.')[0];
const importIds =
  all
    .filter((name) => /(^|[\\/])page-[^\\/]*\.js$/.test(name))
    .flatMap((name) => [...read(name).matchAll(/Promise\.all\(\[((?:\w+\.e\(\d+\),?)+)\]\)/g)].map((match) => match[1]))
    .map((list) => [...list.matchAll(/\.e\((\d+)\)/g)].map((match) => match[1]))
    .find((ids) => ids.includes(shellId)) ?? [shellId];
const runtime = all.find((name) => /^webpack-[^\\/]*\.js$/.test(name));
const fileFor = (id) => {
  const plain = all.find((name) => name.startsWith(`${id}.`) && !/[\\/]/.test(name));
  if (plain) return plain;
  // The runtime maps ids to names and to hashes alike; a name is the one with a file.
  const values = runtime ? [...read(runtime).matchAll(new RegExp(`[{,]${id}:"([\\w-]+)"`, 'g'))].map((match) => match[1]) : [];
  return values
    .map((value) => all.find((name) => name.startsWith(`${value}.`) && !/[\\/]/.test(name)))
    .find(Boolean);
};
const files = importIds.map(fileFor);
if (files.some((file) => !file)) fail(`a chunk of the shell's import (${importIds.join(', ')}) has no file`);
// The shell's own chunk first: it is the one the page cannot do without.
const ordered = [matches[0], ...files.filter((file) => file !== matches[0])];
const tag = ordered.map((file) => `<link rel="preload" as="script" href="/_next/static/chunks/${file}"/>`).join('');

for (const page of PAGES) {
  const file = new URL(page, OUT);
  if (!existsSync(file)) fail(`${page} is missing`);
  const html = readFileSync(file, 'utf8');
  if (html.includes(tag)) continue;
  if (!html.includes('<link rel="stylesheet"')) fail(`${page} has no stylesheet link to put it before`);
  // After the charset and viewport meta tags, before the first stylesheet.
  writeFileSync(file, html.replace('<link rel="stylesheet"', `${tag}<link rel="stylesheet"`));
}
console.log(`preload-shell: ${ordered.join(', ')} preloaded on ${PAGES.length} desktop pages (the shell: ${href})`);
