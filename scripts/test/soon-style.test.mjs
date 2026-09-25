// The coming-soon pages' approved style (ROADMAP BR-04, owner 2026-09-24): the
// design tokens keep WCAG contrast, the dark mode stays near-black and neutral,
// and every font file is licensed, used and served from the domain itself.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const css = read('soon/tokens.css');

/** The custom properties of `:root` (dark) and of the light-scheme override. */
function tokens() {
  const props = (block) => Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
  const light = css.match(/@media \(prefers-color-scheme:light\)\{\s*:root\{([^}]*)\}/)?.[1];
  assert.ok(light, 'a light-scheme block');
  const root = css.match(/\n:root\{([^}]*)\}/)?.[1];
  assert.ok(root, 'a :root block');
  const dark = props(root);
  return { dark, light: { ...dark, ...props(light) } };
}

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('soon style: body text 7:1, the green 4.5:1, non-text 3:1 - dark and light', () => {
  const { dark, light } = tokens();
  const pairs = [
    ['ink', 'bg', 7], ['ink', 'surface', 7], ['muted', 'bg', 7], ['muted', 'surface', 7],
    ['brand', 'bg', 4.5], ['brand', 'surface', 4.5], ['on-brand', 'brand', 4.5], ['on-brand', 'brand-deep', 4.5],
    ['amber', 'bg', 3], ['amber', 'surface', 3], ['brand', 'track', 3], ['brand-deep', 'track', 3],
  ];
  for (const [scheme, palette] of [['dark', dark], ['light', light]]) {
    for (const [fg, bg, minimum] of pairs) {
      const value = contrast(palette[fg], palette[bg]);
      assert.ok(value >= minimum, `${scheme}: ${fg} on ${bg} is ${value.toFixed(2)}, needs ${minimum}`);
    }
  }
});

test('soon style: the dark mode is near-black and neutral - green is only the accent', () => {
  const { dark } = tokens();
  assert.equal(dark.bg, '#07090a');
  assert.equal(dark.surface, '#0d1110');
  const spread = (hex) => Math.max(...[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))) - Math.min(...[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
  for (const name of ['bg', 'surface', 'edge', 'track']) assert.ok(spread(dark[name]) <= 6, `${name} ${dark[name]} carries a colour tint`);
  assert.ok(luminance(dark.bg) < 0.005 && luminance(dark.surface) < 0.008);
  assert.ok(luminance(dark.edge) < 0.02 && luminance(dark.track) < 0.02, 'borders and tracks stay dark and low-contrast');
  const alpha = Number(dark.glow.match(/,\s*([.\d]+)\)$/)?.[1]);
  assert.ok(alpha <= 0.05, `the glow is ${alpha}`);
});

test('soon style: extra word spacing for Latin only; the terminal line is Departure Mono at 2x its grid', () => {
  const page = read('soon/index.html');
  assert.match(page, /h1,h2,h3,\.big\{word-spacing:\.08em\}/);
  assert.match(page, /html\[lang="fa"\] h2,html\[lang="fa"\] h3,[^{]*\{letter-spacing:0;word-spacing:normal\}/);
  assert.match(page, /h2 bdi,h3 bdi\{word-spacing:\.08em\}/);
  assert.match(page, /\.os\{[^}]*font-family:var\(--font-pixel\)[^}]*font-size:22px/);
  assert.match(css, /--font-pixel:"Departure Mono"/);
  // Only the terminal line uses the pixel face.
  assert.equal([...page.matchAll(/var\(--font-pixel\)/g)].length, 1);
  // Latin terms in Persian strings are isolated with <bdi>.
  // (Rendered at build time by scripts/soon-pages.mjs since SEO-15; behaviour is checked in soon-pages.test.mjs.)
  const renderer = read('scripts/soon-pages.mjs');
  assert.match(renderer, /export function bidi\(text\)/);
  assert.match(renderer, /localeId === 'fa' \? bidi\(text\)/);
});

test('soon fonts: every file is licensed, used, and served from the domain - no candidates committed', () => {
  const files = readdirSync(new URL('../../soon/fonts/', import.meta.url)).sort();
  assert.deepEqual(files, [
    'departure-mono-regular.woff2', 'geist-latin-wght.woff2', 'geist-mono-latin-wght.woff2', 'martian-grotesk-vf.woff2', 'vazirmatn-arabic-wght.woff2',
  ]);
  const index = read('public/fonts/LICENSES.md');
  const sources = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1]);
  for (const file of files) {
    assert.ok(index.includes(`\`${file}\``), `${file} is not listed in public/fonts/LICENSES.md`);
    assert.ok(sources.includes(`/fonts/${file}`), `${file} is never used by soon/tokens.css`);
  }
  for (const source of sources) assert.ok(source.startsWith('/fonts/') && files.includes(source.slice(7)), `${source} is not a local, committed font`);
  for (const licence of ['martian-grotesk', 'geist', 'geist-mono', 'departure-mono', 'vazirmatn']) {
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
