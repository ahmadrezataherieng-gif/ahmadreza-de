// The coming-soon pages' look: the original style of 03300d5, restored by the
// owner on 2026-09-25 (ROADMAP BR-07, DECISIONS.md 73). The design tokens keep
// WCAG contrast, the page is dark-only, Persian is set in Vazirmatn, and every
// font file is licensed, used and served from the domain itself.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const css = read('soon/tokens.css');

/** The custom properties of `:root` (dark, the default) and of the light proposal on top. */
const props = (block) => Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
function tokens() {
  const root = css.match(/\n:root\{([^}]*)\}/)?.[1];
  assert.ok(root, 'a :root block');
  return props(root);
}
function lightTokens() {
  const light = css.match(/@media \(prefers-color-scheme:light\)\{\s*:root\{([^}]*)\}/)?.[1];
  assert.ok(light, 'a light-scheme block');
  return { ...tokens(), ...props(light) };
}

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('soon style: body text 7:1, the mint 4.5:1, non-text 3:1 - dark and light', () => {
  for (const palette of [tokens(), lightTokens()]) {
    const pairs = [
      ['ink', 'bg', 7], ['ink', 'surface', 7], ['muted', 'bg', 7], ['muted', 'surface', 7],
      ['brand', 'bg', 4.5], ['brand', 'surface', 4.5], ['on-brand', 'brand', 4.5], ['on-brand', 'brand-deep', 4.5],
      ['amber', 'bg', 3], ['amber', 'surface', 3], ['brand', 'track', 3], ['brand-deep', 'track', 3],
    ];
    for (const [fg, bg, minimum] of pairs) {
      const value = contrast(palette[fg], palette[bg]);
      assert.ok(value >= minimum, `${palette.bg}: ${fg} on ${bg} is ${value.toFixed(2)}, needs ${minimum}`);
    }
  }
});

test('soon style: the old look - navy page, blue-grey cards, mint accent - dark by default, light proposal follows the system', () => {
  const palette = tokens();
  assert.equal(palette.bg, '#0b0f15');
  assert.equal(palette.surface, '#111722');
  assert.equal(palette.brand, '#5de2a4');
  assert.match(css, /color-scheme:dark/);
  const page = read('soon/index.html');
  assert.match(page, /<meta name="color-scheme" content="dark light">/);
});

test('soon style: Persian in Vazirmatn ahead of the system faces; no letter-spacing in Persian headings', () => {
  const palette = tokens();
  assert.equal(palette['font-fa'], '"Vazirmatn"');
  for (const stack of ['stack-head', 'stack-body', 'font-mono']) assert.match(palette[stack], /^var\(--font-fa\),/, `${stack} starts with Vazirmatn`);
  const page = read('soon/index.html');
  assert.match(page, /html\[lang="fa"\] h2,html\[lang="fa"\] h3,[^{]*\{letter-spacing:0;word-spacing:normal\}/);
  // Latin terms in Persian strings are isolated with <bdi>.
  // (Rendered at build time by scripts/soon-pages.mjs since SEO-15; behaviour is checked in soon-pages.test.mjs.)
  const renderer = read('scripts/soon-pages.mjs');
  assert.match(renderer, /export function bidi\(text\)/);
  assert.match(renderer, /localeId === 'fa' \? bidi\(text\)/);
});

test('soon fonts: every file is licensed, used, and served from the domain - no candidates committed', () => {
  const files = readdirSync(new URL('../../soon/fonts/', import.meta.url)).sort();
  assert.deepEqual(files, ['vazirmatn-arabic-wght.woff2']);
  const index = read('public/fonts/LICENSES.md');
  const sources = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1]);
  for (const file of files) {
    assert.ok(index.includes(`\`${file}\``), `${file} is not listed in public/fonts/LICENSES.md`);
    assert.ok(sources.includes(`/fonts/${file}`), `${file} is never used by soon/tokens.css`);
  }
  for (const source of sources) assert.ok(source.startsWith('/fonts/') && files.includes(source.slice(7)), `${source} is not a local, committed font`);
  for (const licence of ['vazirmatn']) {
    const path = `public/fonts/licenses/${licence}-OFL.txt`;
    assert.ok(existsSync(new URL(`../../${path}`, import.meta.url)), path);
    assert.match(read(path), /SIL OPEN FONT LICENSE Version 1\.1/i, `${path} is not the OFL`);
    assert.ok(index.includes(`licenses/${licence}-OFL.txt`), `${licence} has no row in LICENSES.md`);
  }
  // Font files live in soon/fonts/ and nowhere else in the repository.
  const tracked = execFileSync('git', ['ls-files'], { cwd: new URL('../../', import.meta.url), encoding: 'utf8' }).split('\n');
  const stray = tracked.filter((file) => /\.(woff2?|ttf|otf|eot)$/i.test(file) && !file.startsWith('soon/fonts/'));
  assert.deepEqual(stray, []);
});
