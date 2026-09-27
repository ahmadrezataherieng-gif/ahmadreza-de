// Builds public/files/ahmadreza-taheri-{de,en,fa}.vcf at build time (queue
// 2026-09-28 A1 item 5), one vCard per language, from the site's own single
// sources: src/content/profile.ts (EMAIL) and src/messages/{locale}.json
// (jobTitle) and src/messages/legal/{locale}.json (the public "country" word,
// not the git-ignored street address). No dependency: plain text, vCard 3.0.
//
//   node scripts/vcard.mjs
//
// Never a phone number, a photo or a street address - only what the site
// already shows: the name, the job title, the e-mail, the site's own URL and
// the city.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { EMAIL } from '../src/content/profile.ts';
import { SITE_URL } from '../src/lib/constants.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const messages = (locale) => JSON.parse(readFileSync(join(root, `src/messages/${locale}.json`), 'utf8'));
const legalCountry = (locale) => JSON.parse(readFileSync(join(root, `src/messages/legal/${locale}.json`), 'utf8')).country;

const LOCALES = [
  { id: 'de', prefix: '' },
  { id: 'en', prefix: 'en/' },
  { id: 'fa', prefix: 'fa/' },
];

// vCard 3.0 (RFC 2426 section 5.1): backslash, comma and newline are escaped
// in every value; a structured field's own `;` separators are added after
// escaping each component, so a component can never fake a new field.
const escapeValue = (value) => String(value).replace(/([\\,])/g, '\\$1').replace(/\r?\n/g, '\\n');
const line = (name, value) => `${name}:${escapeValue(value)}`;
const structuredLine = (name, parts) => `${name}:${parts.map(escapeValue).join(';')}`;

function vcard(locale) {
  const site = messages(locale.id).site;
  const url = `${SITE_URL}/${locale.prefix}`;
  const rows = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    // N: Family;Given;Middle;Prefix;Suffix - the name is one spelling in every language (queue 2026-09-28 A1 item 5).
    structuredLine('N', ['Taheri', 'Ahmadreza', '', '', '']),
    line('FN', 'Ahmadreza Taheri'),
    line('TITLE', site.jobTitle),
    line('EMAIL;TYPE=INTERNET', EMAIL.address),
    line('URL', url),
    // ADR: PO Box;Extended;Street;Locality;Region;PostalCode;Country - city and country only, never the street (DECISIONS.md 58).
    structuredLine('ADR;TYPE=WORK', ['', '', '', 'Trier', '', '', legalCountry(locale.id)]),
    'END:VCARD',
  ];
  return rows.join('\r\n') + '\r\n';
}

const outDir = join(root, 'public', 'files');
mkdirSync(outDir, { recursive: true });
for (const locale of LOCALES) {
  const file = join(outDir, `ahmadreza-taheri-${locale.id}.vcf`);
  writeFileSync(file, vcard(locale));
  console.log(`ahmadreza-taheri-${locale.id}.vcf`);
}
