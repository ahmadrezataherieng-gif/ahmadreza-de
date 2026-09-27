// The vCard downloads (queue 2026-09-28 A1 item 5): one .vcf per language,
// generated at build time from the single sources (profile.ts, messages),
// pinned fields, no address/legal name/employer, served with the right
// headers, and reachable from the Contact app and the About pages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { EMAIL } from '../../src/content/profile.ts';
import { EMPLOYER } from './employer-name.mjs';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const exists = (path) => existsSync(new URL(path, root));

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

const FIELDS = {
  de: { title: 'Fachinformatiker für Systemintegration (in Ausbildung)', url: 'https://ahmadreza.de/', country: 'Deutschland' },
  en: { title: 'IT Specialist for System Integration (apprentice)', url: 'https://ahmadreza.de/en/', country: 'Germany' },
  fa: { title: 'کارآموز فناوری اطلاعات، یکپارچه‌سازی سیستم', url: 'https://ahmadreza.de/fa/', country: 'آلمان' },
};

test('vCard 3.0, UTF-8, CRLF: FN/N fixed, TITLE/URL/country per language, EMAIL from the one constant, no phone, no photo, no street, no legal name, no employer', () => {
  for (const [locale, expect] of Object.entries(FIELDS)) {
    const path = `public/files/ahmadreza-taheri-${locale}.vcf`;
    if (!exists(path)) return; // run `node scripts/vcard.mjs` first
    const vcf = read(path);
    assert.match(vcf, /^BEGIN:VCARD\r\nVERSION:3\.0\r\n/, locale);
    assert.match(vcf, /\r\nEND:VCARD\r\n$/, locale);
    assert.doesNotMatch(vcf, /(?<!\r)\n/, `${locale}: every line break is CRLF`);
    assert.match(vcf, /\r\nN:Taheri;Ahmadreza;;;\r\n/, locale);
    assert.match(vcf, /\r\nFN:Ahmadreza Taheri\r\n/, locale);
    assert.match(vcf, new RegExp(`\\r\\nTITLE:${escapeRegExp(expect.title)}\\r\\n`), locale);
    assert.match(vcf, new RegExp(`\\r\\nEMAIL;TYPE=INTERNET:${escapeRegExp(EMAIL.address)}\\r\\n`), locale);
    assert.match(vcf, new RegExp(`\\r\\nURL:${escapeRegExp(expect.url)}\\r\\n`), locale);
    assert.match(vcf, new RegExp(`\\r\\nADR;TYPE=WORK:;;;Trier;;;${expect.country}\\r\\n`), locale);
    assert.doesNotMatch(vcf, /TEL/, `${locale}: no phone`);
    assert.doesNotMatch(vcf, /PHOTO/, `${locale}: no photo`);
    // Only the city, never a street or postal code.
    const adr = vcf.match(/ADR;TYPE=WORK:([^\r]*)/)[1].split(';');
    assert.equal(adr.length, 7, 'PO Box;Extended;Street;Locality;Region;PostalCode;Country');
    assert.equal(adr[3], 'Trier');
    assert.equal(adr[6], expect.country);
    assert.deepEqual([adr[0], adr[1], adr[2], adr[4], adr[5]], ['', '', '', '', ''], 'every other component is empty');
    assert.doesNotMatch(vcf, /Momrabadi/i, locale);
    assert.doesNotMatch(vcf, EMPLOYER, locale);
  }
});

test('vCard: generated at build time by scripts/vcard.mjs, wired into npm run build, served with a download filename', () => {
  assert.match(read('package.json'), /"build": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts\/vcard\.mjs && next build/);
  const headers = read('public/_headers');
  for (const locale of ['de', 'en', 'fa']) {
    assert.match(headers, new RegExp(`/files/ahmadreza-taheri-${locale}\\.vcf\\n {2}Content-Type: text/vcard; charset=utf-8\\n {2}Content-Disposition: attachment; filename="ahmadreza-taheri-${locale}\\.vcf"`));
  }
});

test('vCard: a "save contact" button in the Contact app and on the About pages, one per language file', () => {
  const contact = read('src/components/apps/contact/ContactApp.tsx');
  assert.match(contact, /href=\{`\/files\/ahmadreza-taheri-\$\{locale\}\.vcf`\}/);
  assert.match(contact, /data-action="vcard-download"/);
  const about = read('src/components/apps/about/AboutContent.tsx');
  assert.match(about, /href=\{`\/files\/ahmadreza-taheri-\$\{locale\}\.vcf`\}/);
  assert.match(about, /data-action="vcard-download"/);
  for (const locale of ['de', 'en', 'fa']) {
    const contactCopy = JSON.parse(read(`src/messages/apps/contact/${locale}.json`)).vcard;
    const aboutCopy = JSON.parse(read(`src/messages/apps/about/${locale}.json`)).actions.vcard;
    assert.ok(contactCopy.save.length > 0, `${locale} contact vcard.save`);
    assert.ok(aboutCopy.length > 0, `${locale} about actions.vcard`);
  }
});

test('vCard: built pages link the per-language file with a download attribute', (context) => {
  if (!exists('out/about/index.html')) return context.skip('run npm run build first');
  const pages = { de: 'about/index.html', en: 'en/about/index.html', fa: 'fa/about/index.html' };
  for (const [locale, page] of Object.entries(pages)) {
    const html = read(`out/${page}`);
    assert.match(html, new RegExp(`href="/files/ahmadreza-taheri-${locale}\\.vcf" download`), locale);
  }
});
