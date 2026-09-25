// Regenerates src/styles/fonts/vazirmatn-label-400.woff2: Vazirmatn at weight 400,
// reduced to the five letters of the language switcher's "فارسی" (2 kB instead
// of the 46 kB Arabic-script file). The shaping tables stay, so the letters join
// exactly as in the full font.
//
//   npm install --no-save subset-font && node scripts/vazirmatn-label.mjs
//
// subset-font (HarfBuzz) is a build-time tool and not a dependency of the site;
// the generated file is committed.
import { readFileSync, writeFileSync } from 'node:fs';

const { default: subsetFont } = await import('subset-font');
const source = readFileSync('node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2');
const label = 'فارسی';
// The space too: without it the browser asks the next family for it (the Latin file).
const glyphs = ` ${label}`;
const out = await subsetFont(source, glyphs, { targetFormat: 'woff2', variationAxes: { wght: 400 } });
writeFileSync('src/styles/fonts/vazirmatn-label-400.woff2', out);
console.log(`${label}: ${source.length} -> ${out.length} bytes`);
