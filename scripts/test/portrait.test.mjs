// The portrait (queue B item 1, OWN-01, DECISIONS 82): the files, their AI
// marking, the visible label wherever the picture is shown, and the JSON-LD.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { PORTRAIT } from '../../src/content/profile.ts';
import { structuredData } from '../../src/lib/structured-data.ts';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const AI_TERM = 'trainedAlgorithmicMedia';

test('portrait files: 4:5 progressive JPEGs in every srcset width, the full one 1200 x 1500 under 250 kB, marked as AI-made in their XMP', async () => {
  assert.equal(PORTRAIT.available, true);
  assert.equal(PORTRAIT.width, 1200);
  assert.equal(PORTRAIT.height, 1500);
  assert.ok(PORTRAIT.sources.jpeg.some((entry) => entry.src === PORTRAIT.src && entry.width === PORTRAIT.width), 'the full file is in the JPEG srcset');
  for (const [format, files] of Object.entries(PORTRAIT.sources)) {
    for (const { src, width } of files) {
      const file = new URL(`public${src}`, root);
      assert.ok(existsSync(file), src);
      const meta = await sharp(fileURLToPath(file)).metadata();
      assert.equal(meta.format, format === 'jpeg' ? 'jpeg' : 'heif', src);
      assert.equal(meta.width, width, src);
      assert.equal(meta.height, (width * 5) / 4, src);
      if (format === 'jpeg') assert.equal(meta.isProgressive, true, src);
      assert.equal(meta.exif, undefined, `${src}: no EXIF from the source`);
      assert.ok(meta.xmp?.toString().includes(AI_TERM), `${src}: IPTC DigitalSourceType in XMP`);
    }
  }
  assert.ok(statSync(new URL(`public${PORTRAIT.src}`, root)).size < 250 * 1024);
  assert.equal(PORTRAIT.digitalSourceType, `https://cv.iptc.org/newscodes/digitalsourcetype/${AI_TERM}`);
});

test('portrait: nothing from Photo/ is tracked, only the generated files are in public/images/', () => {
  const listed = Object.values(PORTRAIT.sources).flat().map((entry) => entry.src.replace('/images/', ''));
  assert.deepEqual(readdirSync(new URL('public/images/', root)).sort(), listed.sort());
  assert.match(read('.gitignore'), /^\/Photo\/$/m);
});

test('portrait: every place that shows it goes through PortraitImage, which always draws the AI label', () => {
  const component = read('src/components/ui/PortraitImage.tsx');
  assert.match(component, /className="ao-portrait-ai[^"]*"/);
  assert.match(component, /\{aiLabel\}/);
  // No other file renders the picture itself, so no place can lose the label.
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(new URL(dir, root), { withFileTypes: true })) {
      const path = `${dir}${entry.name}`;
      if (entry.isDirectory()) walk(`${path}/`);
      else if (/\.tsx?$/.test(entry.name) && path !== 'src/components/ui/PortraitImage.tsx' && /PORTRAIT\.src|images\/portrait/.test(read(path)) && path !== 'src/content/profile.ts' && path !== 'src/lib/structured-data.ts') offenders.push(path);
    }
  };
  walk('src/');
  assert.deepEqual(offenders, []);
  assert.match(read('src/components/landing/Portrait.tsx'), /<PortraitImage[\s\S]*aiLabel=\{aiLabel\}[\s\S]*priority/);
  assert.match(read('src/components/apps/about/AboutContent.tsx'), /<PortraitImage alt=\{t\('portraitAlt'\)\} aiLabel=\{t\('portraitAi'\)\}/);
});

test('portrait copy: the label and the alt text in de, en and fa, the alt saying it is AI-made', () => {
  const labels = { de: 'KI-Porträt', en: 'AI portrait', fa: 'پرتره‌ی هوش مصنوعی' };
  const altWord = { de: /KI-generiert/, en: /AI-generated/, fa: /هوش مصنوعی/ };
  for (const locale of ['de', 'en', 'fa']) {
    const landing = JSON.parse(read(`src/messages/${locale}.json`)).landing;
    const about = JSON.parse(read(`src/messages/apps/about/${locale}.json`));
    for (const copy of [landing, about]) {
      assert.equal(copy.portraitAi, labels[locale], locale);
      assert.match(copy.portraitAlt, altWord[locale], locale);
    }
  }
});

test('portrait label: fixed colours, 4.5:1 or more even over a white pixel', () => {
  const css = read('src/styles/globals.css');
  const rule = css.match(/\.ao-portrait-ai \{([^}]*)\}/)?.[1] ?? '';
  const colour = rule.match(/color: #([0-9a-f]{6})/)?.[1];
  const alpha = Number(rule.match(/background: rgb\(0 0 0 \/ ([\d.]+)\)/)?.[1]);
  assert.ok(colour && alpha > 0, 'colour and veil');
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = (rgb) => 0.2126 * lin(rgb[0] / 255) + 0.7152 * lin(rgb[1] / 255) + 0.0722 * lin(rgb[2] / 255);
  const text = [0, 2, 4].map((i) => parseInt(colour.slice(i, i + 2), 16));
  const worstBackground = [255, 255, 255].map((v) => v * (1 - alpha));
  const ratio = (lum(text) + 0.05) / (lum(worstBackground) + 0.05);
  assert.ok(ratio >= 4.5, `contrast ${ratio.toFixed(2)}`);
});

test('JSON-LD: with the portrait, the Person has an image that is an ImageObject marked as AI-made; without it (coming-soon), none', () => {
  const copy = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: [], inLanguage: 'de-DE', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-de.png', width: 1200, height: 630, alt: 'alt' }, description: 'd', pageUrl: 'https://ahmadreza.de/', isProfilePage: true };
  const graph = structuredData({ ...copy, portrait: { caption: 'Porträt von Ahmadreza Taheri, KI-generiert' } })['@graph'];
  const person = graph.find((node) => node['@type'] === 'Person');
  const image = graph.find((node) => node['@id'] === person.image['@id']);
  assert.equal(image['@type'], 'ImageObject');
  assert.equal(image.contentUrl, 'https://ahmadreza.de/images/portrait.jpg');
  assert.equal(image.width, 1200);
  assert.equal(image.height, 1500);
  assert.equal(image.digitalSourceType, `https://cv.iptc.org/newscodes/digitalsourcetype/${AI_TERM}`);
  assert.match(image.caption, /KI-generiert/);
  assert.equal(structuredData(copy)['@graph'].find((node) => node['@type'] === 'Person').image, undefined);
  assert.doesNotMatch(read('scripts/soon-seo.mjs'), /portrait/, 'the coming-soon pages do not serve the portrait');
  assert.match(read('src/app/[[...locale]]/layout.tsx'), /portrait: \{ caption:/);
});

test('portrait in the built pages: the landing and About pages of every language carry the img, the label and the Person image', () => {
  const pages = ['index.html', 'en/index.html', 'fa/index.html', 'about/index.html', 'en/about/index.html', 'fa/about/index.html'];
  if (!existsSync(new URL('out/index.html', root))) return;
  for (const page of pages) {
    const html = read(`out/${page}`);
    assert.match(html, /<source type="image\/avif" srcSet="\/images\/portrait-240\.avif 240w/, page);
    assert.match(html, /<img src="\/images\/portrait\.jpg" srcSet="\/images\/portrait-480\.jpg 480w/, page);
    assert.match(html, /class="ao-portrait-ai/, page);
    assert.match(html, /"image":\{"@id":"https:\/\/ahmadreza\.de\/#portrait"\}/, page);
    assert.ok(html.includes(AI_TERM), page);
  }
});
