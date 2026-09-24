// LEG-16: in the Persian legal pages every Latin term (Cloudflare, IP, TDDDG ...) is an
// isolated <bdi> run, so the punctuation next to it lands on the correct side. Checked on
// the shared splitter, on both renderers' source, and on the built coming-soon pages.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { bidiParts } from '../../src/lib/legal-doc.ts';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('legal bidi: Latin runs are split out in Persian only', () => {
  assert.deepEqual(bidiParts('ما از Cloudflare, Inc. استفاده می‌کنیم (TDDDG).', 'fa').filter((part) => part.latin).map((part) => part.text), ['Cloudflare', 'Inc', 'TDDDG']);
  assert.deepEqual(bidiParts('Art. 6 Abs. 1 lit. f DSGVO', 'de'), [{ text: 'Art. 6 Abs. 1 lit. f DSGVO', latin: false }]);
  // Nothing is lost: the runs join back to the original text.
  const text = 'آدرس IP و پورت 443 در سرور example.com ثبت نمی‌شود.';
  assert.equal(bidiParts(text, 'fa').map((part) => part.text).join(''), text);
  // Accented Latin letters belong to the run (German names inside Persian text).
  assert.deepEqual(bidiParts('نهاد Landesbeauftragte für Datenschutz است', 'fa').filter((part) => part.latin).map((part) => part.text), ['Landesbeauftragte für Datenschutz']);
  assert.ok(bidiParts(text, 'fa').some((part) => part.latin && part.text === 'example.com'));
});

test('legal bidi: both renderers isolate every text through the shared splitter', () => {
  assert.match(read('scripts/build-soon.mjs'), /bidiParts\(text, localeId\)/);
  const page = read('src/components/legal/LegalPage.tsx');
  assert.match(page, /bidiParts\(text, locale\)/);
  for (const source of ['document.title', 'section.heading', 'item', 'cell', 'part.text']) assert.ok(page.includes(`<Iso text={${source}}`), `LegalPage does not isolate ${source}`);
});

test('legal bidi: the built Persian legal pages have no loose Latin text', (context) => {
  if (!existsSync(new URL('../../soon/dist/fa/impressum/index.html', import.meta.url))) return context.skip('run npm run build:soon first');
  for (const slug of ['impressum', 'datenschutz']) {
    const html = read(`soon/dist/fa/${slug}/index.html`)
      .replace(/<style[\s\S]*?<\/style>|<title>[\s\S]*?<\/title>|<head>[\s\S]*?<\/head>|<bdi>[^<]*<\/bdi>|<a [^>]*>[^<]*<\/a>|<span dir="ltr">[^<]*<\/span>|<header>[\s\S]*?<\/header>|<footer>[\s\S]*?<\/footer>/g, '');
    const loose = [...html.matchAll(/>([^<]*\p{Script=Latin}[^<]*)</gu)].map((match) => match[1].trim());
    assert.deepEqual(loose, [], `${slug}: Latin text outside <bdi>`);
    assert.match(read(`soon/dist/fa/${slug}/index.html`), /<bdi>/);
  }
});
