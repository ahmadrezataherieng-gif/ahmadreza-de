// Runs after `next build` (npm run build): removes the `.woff` fallback files
// from the export (queue 3d, audit P2).
//
// Every @fontsource stylesheet lists `woff2` first and `woff` second as a
// fallback. Every browser that can run this site takes the woff2 and never asks
// for the woff, so the ten `.woff` files (about 150 kB) only made the deploy
// bigger. The `src` fallback is removed from the built CSS as well - no
// stylesheet may name a file that is not there - and the step stops without
// touching anything if a `.woff` is still referenced afterwards.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.cwd(), 'out');
const MEDIA = path.join(OUT, '_next', 'static', 'media');
const CSS = path.join(OUT, '_next', 'static', 'css');

if (!existsSync(MEDIA) || !existsSync(CSS)) {
  console.warn('drop-woff: no export found - nothing to do');
  process.exit(0);
}

const FALLBACK = /,\s*url\((?:"[^"]*\.woff"|'[^']*\.woff'|[^)"']*\.woff)\)\s*format\((?:"woff"|'woff')\)/g;
let removed = 0;
for (const name of readdirSync(CSS).filter((file) => file.endsWith('.css'))) {
  const file = path.join(CSS, name);
  const css = readFileSync(file, 'utf8');
  const next = css.replace(FALLBACK, () => {
    removed += 1;
    return '';
  });
  if (next !== css) writeFileSync(file, next);
}

// What still mentions a .woff (not .woff2) anywhere in the export's text files.
const stillNamed = [];
const scan = (dir, depth) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (depth < 6) scan(child, depth + 1);
    } else if (/\.(css|js|html|txt)$/.test(entry.name) && /\.woff(?!2)/.test(readFileSync(child, 'utf8'))) {
      stillNamed.push(path.relative(OUT, child));
    }
  }
};
scan(OUT, 0);
if (stillNamed.length > 0) {
  console.warn(`drop-woff: .woff is still named in ${stillNamed.slice(0, 4).join(', ')} - the files stay`);
  process.exit(0);
}

let bytes = 0;
let files = 0;
for (const name of readdirSync(MEDIA).filter((file) => file.endsWith('.woff'))) {
  bytes += readFileSync(path.join(MEDIA, name)).length;
  rmSync(path.join(MEDIA, name));
  files += 1;
}
console.log(`drop-woff: ${removed} fallback sources and ${files} .woff files (${(bytes / 1000).toFixed(0)} kB) removed`);
