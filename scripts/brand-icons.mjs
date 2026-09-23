// Generates the raster icons from the Amonel brand kit's SVGs (Phase 9A):
//
//   public/favicon.ico              16, 32 and 48 px, PNG entries, from public/favicon.svg
//   public/apple-touch-icon.png     180 px, the glass icon full-bleed (iOS rounds it itself)
//   public/brand/icon-192.png       the glass icon with its own rounded corners
//   public/brand/icon-512.png       the same, 512 px
//   public/brand/icon-maskable-512.png  full-bleed, the mark inside the maskable safe zone
//
// Run it only when the kit changes:  node scripts/brand-icons.mjs
//
// The sources live in the repository (public/favicon.svg and scripts/brand/),
// never in Bearbeitung/, which is not committed. Rendering uses the sharp that
// Next.js already installs; if it is ever missing, `npm i -D sharp` first.
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const write = (path, data) => writeFileSync(new URL(path, root), data);

const favicon = read('public/favicon.svg');
const glass = read('scripts/brand/amonel-icon-glass.svg');

// The full-bleed variant: no rounded clip and no bright edge, so a platform's
// own mask (iOS corners, Android circles) cuts a clean shape out of it.
const square = glass
  .replace(/<rect x="0" y="0" width="120" height="120" rx="28"\/>/, '<rect x="0" y="0" width="120" height="120"/>')
  .replace(/<rect x="\.6" y="\.6"[^>]*\/>/, '');
if (square === glass) throw new Error('the glass SVG changed shape; update the full-bleed variant');

// A high density renders the blur and the curves from vectors, not from an upscale.
const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 72 * Math.ceil((size / 120) * 4) })
    .resize(size, size)
    .png({ compressionLevel: 9, palette: true, quality: 95, dither: 1 })
    .toBuffer();

// An .ico may hold PNG images directly; every browser since IE 9 reads them.
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

const icoSizes = [16, 32, 48];
// Tiny sizes keep full colour: a palette on 16 px bands the gradient visibly.
const faviconPng = (size) =>
  sharp(Buffer.from(favicon), { density: 72 * Math.ceil((size / 120) * 4) }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
write('public/favicon.ico', ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await faviconPng(size) })))));
write('public/apple-touch-icon.png', await png(square, 180));
write('public/brand/icon-192.png', await png(glass, 192));
write('public/brand/icon-512.png', await png(glass, 512));
write('public/brand/icon-maskable-512.png', await png(square, 512));

console.log('brand icons written');
