// Builds the deployable folder of the temporary "coming soon" page
// (Worker `silent-lake-8ae2`, see soon/wrangler.jsonc): soon/index.html plus the
// Impressum and the Datenschutzerklärung in de, en and fa, rendered from the
// same messages/legal/*.json as the real site, with the `soon` scope - the
// coming-soon page has no counters, no Assistant and only one storage entry.
//
//   node scripts/build-soon.mjs          then, in soon/:  npx wrangler deploy
//
// Output goes to soon/dist/ (git-ignored). Plain static HTML, no script, no
// external request: the same fonts-from-the-system approach as index.html.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

import { ensureLegalAddress } from './legal-address.mjs';
import { linkify, sectionsFor } from '../src/lib/legal-doc.ts';

// Before the legal copy is imported: without the address there is no Impressum.
ensureLegalAddress();
const { LEGAL_CONTACT } = await import('../src/content/legal.ts');

const root = new URL('../', import.meta.url);
const dist = new URL('soon/dist/', root);
const locales = [
  { id: 'de', prefix: '', dir: 'ltr', label: 'DE' },
  { id: 'en', prefix: 'en/', dir: 'ltr', label: 'EN' },
  { id: 'fa', prefix: 'fa/', dir: 'rtl', label: 'FA' },
];
const kinds = [
  { id: 'imprint', slug: 'impressum' },
  { id: 'privacy', slug: 'datenschutz' },
];

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const rich = (text) =>
  linkify(text)
    .map((part) => (part.href ? `<a href="${escape(part.href)}" rel="noopener noreferrer" dir="ltr">${escape(part.text)}</a>` : escape(part.text)))
    .join('');

function block(item, copy) {
  switch (item.type) {
    case 'p':
      return `<p>${rich(item.text)}</p>`;
    case 'list':
      return `<ul>${item.items.map((entry) => `<li>${escape(entry)}</li>`).join('')}</ul>`;
    case 'table':
      return `<table><thead><tr>${item.head.map((cell) => `<th>${escape(cell)}</th>`).join('')}</tr></thead><tbody>${item.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join('')}</tr>`)
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

const STYLE = `:root{--bg:#080a0f;--panel:#0e1219;--edge:#1d2531;--ink:#e9edf5;--muted:#8e9bb0;--amber:#f0a44a;
--mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,"Liberation Mono",monospace;
--sans:"Segoe UI",system-ui,-apple-system,Roboto,"Helvetica Neue",Arial,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.65;-webkit-font-smoothing:antialiased}
.wrap{max-width:760px;margin:0 auto;padding:22px 20px 48px}
header{display:flex;justify-content:space-between;align-items:center;gap:16px;font-family:var(--mono);font-size:13px}
header nav{display:flex;gap:6px}
header nav a{color:var(--muted);border:1px solid var(--edge);border-radius:999px;padding:5px 11px;text-decoration:none}
header nav a[aria-current]{color:#0b0e13;background:var(--amber);border-color:var(--amber);font-weight:700}
a{color:var(--amber)}h1{font-size:clamp(1.9rem,6vw,2.6rem);margin:36px 0 4px;letter-spacing:-.02em}
h2{font-size:1.1rem;margin:32px 0 8px}.meta{font-family:var(--mono);font-size:12px;color:var(--muted);margin:0}
.note{border:1px solid var(--edge);background:var(--panel);border-radius:10px;padding:12px 14px;margin-top:16px}
address{font-style:normal}ul{padding-inline-start:20px}table{width:100%;border-collapse:collapse;font-size:14px}
th,td{border-bottom:1px solid var(--edge);padding:8px;text-align:start;vertical-align:top}th{font-family:var(--mono);font-size:12px;color:var(--muted)}
footer{margin-top:44px;padding-top:16px;border-top:1px solid var(--edge);display:flex;flex-wrap:wrap;gap:16px;font-size:13px}
footer a{color:var(--ink)}`;

function page(locale, kind, copy, labels) {
  const document = copy[kind.id];
  const sections = sectionsFor(document, 'soon')
    .map((section) => `<section><h2>${escape(section.heading)}</h2>${section.blocks.map((item) => block(item, copy)).join('')}</section>`)
    .join('');
  const switcher = locales
    .map(
      (other) =>
        `<a href="/${other.prefix}${kind.slug}/" hreflang="${other.id}" lang="${other.id}"${other.id === locale.id ? ' aria-current="page"' : ''}>${other.label}</a>`,
    )
    .join('');
  const note = copy.bindingNote ? `<p class="note">${escape(copy.bindingNote)} <a href="/${kind.slug}/" hreflang="de" lang="de">${escape(copy.bindingLink)}</a></p>` : '';
  // The coming-soon page is one URL; it picks its language itself.
  const home = '/';
  return `<!doctype html>
<html lang="${locale.id}" dir="${locale.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(document.title)} – Ahmadreza Taheri</title>
<meta name="description" content="${escape(document.description)}">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="https://ahmadreza.de/${locale.prefix}${kind.slug}/">
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
<header><a href="${home}">ahmadreza.de</a><nav aria-label="${escape(labels.language)}">${switcher}</nav></header>
<main>
<h1>${escape(document.title)}</h1>
<p class="meta">${escape(copy.updated)}</p>
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
writeFileSync(new URL('index.html', dist), readFileSync(new URL('soon/index.html', root)));

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

console.log('soon/dist: index.html + impressum and datenschutz in de, en, fa');
