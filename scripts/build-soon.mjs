// Builds the deployable folder of the temporary "coming soon" page
// (Worker `silent-lake-8ae2`, see soon/wrangler.jsonc): soon/index.html plus the
// Impressum and the Datenschutzerklärung in de, en and fa; the page itself is rendered three times (/, /en/, /fa/), rendered from the
// same messages/legal/*.json as the real site, with the `soon` scope - the
// coming-soon page has no counters, no Assistant and only one storage entry.
//
//   node scripts/build-soon.mjs          then, in soon/:  npx wrangler deploy
//
// Output goes to soon/dist/ (git-ignored). Static HTML with one small inline
// script (the language switch) and no external request: the fonts are
// self-hosted from soon/fonts/ with their licences (public/fonts/), and the design
// tokens of soon/tokens.css are injected into every page.

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

import { ensureLegalAddress } from './legal-address.mjs';
import { AREAS } from './roadmap.mjs';
import { fillPlaceholders, progressValues } from './soon-progress.mjs';
import { renderLanding } from './soon-pages.mjs';
import { LOCALES, OG_IMAGES, sitemapXml } from './soon-seo.mjs';
import { bidiParts, linkify, sectionsFor } from '../src/lib/legal-doc.ts';

// Before the legal copy is imported: without the address there is no Impressum.
ensureLegalAddress();
const { LEGAL_CONTACT } = await import('../src/content/legal.ts');

const root = new URL('../', import.meta.url);
const TOKENS = readFileSync(new URL('soon/tokens.css', root), 'utf8').trim();
const dist = new URL('soon/dist/', root);
const locales = LOCALES;
const kinds = [
  { id: 'imprint', slug: 'impressum' },
  { id: 'privacy', slug: 'datenschutz' },
];

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// Text of a legal page: in Persian every Latin term sits in <bdi> so the punctuation next to it stays on the right side (LEG-16).
const iso = (text, localeId) =>
  bidiParts(text, localeId)
    .map((part) => (part.latin ? `<bdi>${escape(part.text)}</bdi>` : escape(part.text)))
    .join('');

const rich = (text, localeId) =>
  linkify(text)
    .map((part) => (part.href ? `<a href="${escape(part.href)}" rel="noopener noreferrer" dir="ltr">${escape(part.text)}</a>` : iso(part.text, localeId)))
    .join('');

function block(item, copy, localeId) {
  switch (item.type) {
    case 'p':
      return `<p>${rich(item.text, localeId)}</p>`;
    case 'list':
      return `<ul>${item.items.map((entry) => `<li>${iso(entry, localeId)}</li>`).join('')}</ul>`;
    case 'table':
      return `<table><thead><tr>${item.head.map((cell) => `<th>${iso(cell, localeId)}</th>`).join('')}</tr></thead><tbody>${item.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${iso(cell, localeId)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`;
    case 'contact':
      return `<address><span dir="ltr">${escape(LEGAL_CONTACT.name)}</span><br><span dir="ltr">${escape(LEGAL_CONTACT.street)}</span><br><span dir="ltr">${escape(
        LEGAL_CONTACT.postcodeCity,
      )}</span><br>${escape(copy.country)}<br><br>${escape(copy.emailLabel)}: <a href="mailto:${escape(LEGAL_CONTACT.email)}" dir="ltr">${escape(
        LEGAL_CONTACT.email,
      )}</a></address>`;
    default:
      throw new Error(`Unknown block type: ${item.type}`);
  }
}

// The legal pages share the coming-soon page's tokens (soon/tokens.css), so the
// whole domain has one look. Their text is legal copy, never decoration.
const STYLE = `*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 var(--stack-body);-webkit-font-smoothing:antialiased;overflow-x:hidden}
html[lang="fa"] body{font-size:17.5px;line-height:1.8}
.wrap{max-width:760px;margin:0 auto;padding:22px 20px 48px}
header{display:flex;justify-content:space-between;align-items:center;gap:16px;font-family:var(--font-mono);font-size:13px}
header nav{display:flex;gap:6px}
header nav a{color:var(--muted);border:1px solid var(--edge);border-radius:999px;padding:6px 12px;text-decoration:none}
header nav a[aria-current]{color:var(--on-brand);background:var(--brand);border-color:var(--brand);font-weight:700}
a{color:var(--brand);text-underline-offset:3px}a:focus-visible{outline:2px solid var(--amber);outline-offset:3px}
h1{font:var(--head-weight) clamp(1.9rem,6vw,2.6rem)/1.15 var(--stack-head);letter-spacing:var(--head-tracking);word-spacing:.08em;margin:36px 0 4px;text-wrap:balance}
h2{font:600 1.1rem/1.3 var(--stack-head);margin:32px 0 8px;text-wrap:balance}
html[lang="fa"] h1,html[lang="fa"] h2{letter-spacing:0;word-spacing:normal}
p,li{text-wrap:pretty}
.meta{font-family:var(--font-mono);font-size:12px;color:var(--muted);margin:0}
.note{border:1px solid var(--edge);background:var(--surface);border-radius:10px;padding:12px 14px;margin-top:16px}
address{font-style:normal}ul{padding-inline-start:20px}table{width:100%;border-collapse:collapse;font-size:14px}
th,td{border-bottom:1px solid var(--edge);padding:8px;text-align:start;vertical-align:top}th{font-family:var(--font-mono);font-size:12px;color:var(--muted)}
footer{margin-top:44px;padding-top:16px;border-top:1px solid var(--edge);display:flex;flex-wrap:wrap;gap:16px;font-size:13px}
footer a{color:var(--ink)}`;
function page(locale, kind, copy, labels) {
  const document = copy[kind.id];
  const sections = sectionsFor(document, 'soon')
    .map((section) => `<section><h2>${iso(section.heading, locale.id)}</h2>${section.blocks.map((item) => block(item, copy, locale.id)).join('')}</section>`)
    .join('');
  const switcher = locales
    .map(
      (other) =>
        `<a href="/${other.prefix}${kind.slug}/" hreflang="${other.id}" lang="${other.id}"${other.id === locale.id ? ' aria-current="page"' : ''}>${other.label}</a>`,
    )
    .join('');
  const note = copy.bindingNote ? `<p class="note">${iso(copy.bindingNote, locale.id)} <a href="/${kind.slug}/" hreflang="de" lang="de">${escape(copy.bindingLink)}</a></p>` : '';
  // Back to the coming-soon page in this page's language.
  const home = `/${locale.prefix}`;
  return `<!doctype html>
<html lang="${locale.id}" dir="${locale.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(document.title)} – Ahmadreza Taheri</title>
<meta name="description" content="${escape(document.description)}">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="https://ahmadreza.de/${locale.prefix}${kind.slug}/">
<meta name="theme-color" content="#07090a" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f5f4ee" media="(prefers-color-scheme: light)">
<style>${TOKENS}${STYLE}</style>
</head>
<body>
<div class="wrap">
<header><a href="${home}">ahmadreza.de</a><nav aria-label="${escape(labels.language)}">${switcher}</nav></header>
<main>
<h1>${iso(document.title, locale.id)}</h1>
<p class="meta">${iso(copy.updated, locale.id)}</p>
${note}
${sections}
<p><a href="${home}">${escape(copy.backHome)}</a></p>
</main>
<footer><a href="/${locale.prefix}impressum/">${escape(labels.imprint)}</a><a href="/${locale.prefix}datenschutz/">${escape(labels.privacy)}</a></footer>
</div>
</body>
</html>
`;
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
// The progress figures come from ROADMAP.md at build time, never typed by hand.
const values = progressValues();
const filled = fillPlaceholders(readFileSync(new URL('soon/index.html', root), 'utf8').replace('/*@tokens*/', () => TOKENS), values);
// One real page per language (SEO-15): / in German, /en/ and /fa/, each rendered from the same template and copy table.
for (const locale of locales) {
  const folder = new URL(locale.prefix, dist);
  mkdirSync(folder, { recursive: true });
  writeFileSync(new URL('index.html', folder), renderLanding(filled, locale.id));
}
console.log(`progress: ${values['all.percent']} % (${AREAS.map((area) => `${area} ${values[`${area}.percent`]} %`).join(', ')})`);

for (const locale of locales) {
  const copy = JSON.parse(readFileSync(new URL(`src/messages/legal/${locale.id}.json`, root), 'utf8'));
  const nav = JSON.parse(readFileSync(new URL(`src/messages/${locale.id}.json`, root), 'utf8')).nav;
  const labels = { imprint: nav.imprint, privacy: nav.privacy, language: nav.language };
  for (const kind of kinds) {
    const folder = new URL(`${locale.prefix}${kind.slug}/`, dist);
    mkdirSync(folder, { recursive: true });
    writeFileSync(new URL('index.html', folder), page(locale, kind, copy, labels));
  }
}

// Fonts and their licences travel together (the SIL OFL asks for it).
cpSync(new URL('soon/fonts/', root), new URL('fonts/', dist), { recursive: true });
cpSync(new URL('public/fonts/LICENSES.md', root), new URL('fonts/LICENSES.md', dist));
cpSync(new URL('public/fonts/licenses/', root), new URL('fonts/licenses/', dist), { recursive: true });

// Search engines: the share image, robots.txt (every crawler welcome, AI bots included) and a sitemap of the three language pages. The legal pages are noindex and stay out of it.
mkdirSync(new URL('og/', dist), { recursive: true });
for (const image of Object.values(OG_IMAGES)) cpSync(new URL(image.file, root), new URL(image.path, dist));
cpSync(new URL('public/robots.txt', root), new URL('robots.txt', dist));
cpSync(new URL('soon/_redirects', root), new URL('_redirects', dist));
writeFileSync(new URL('sitemap.xml', dist), sitemapXml(values.DATE));

console.log('soon/dist: index.html + en/ and fa/ landing pages, robots.txt, sitemap.xml, og/, fonts/ + impressum and datenschutz in de, en, fa');
