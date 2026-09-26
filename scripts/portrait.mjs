// Makes the portrait files in public/images/ from the owner's chosen image.
//
//   node scripts/portrait.mjs "<path to the source image>"
//
// The source stays outside git (Photo/ is ignored; only the outputs are
// committed). Output, all 4:5 and cropped from the centre:
// - portrait.jpg at 1200 x 1500 (PORTRAIT.src in src/content/profile.ts, the
//   JSON-LD image and the fallback) plus 800 and 480 wide, progressive mozjpeg;
// - AVIF at 240, 480, 800 and 1200 wide, which the <picture> offers first.
// A phone at DPR 1 fetches the 4 kB AVIF instead of a 23 kB JPEG for its
// 176 px frame, so the image arrives with the text (LCP, queue B item 1). A
// light unsharp mask after the resize keeps the downscaled ones crisp. sharp
// ships with Next, so this adds no dependency. Keep the list in sync with
// PORTRAIT.sources.
import { mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = process.argv[2];
if (!source) {
  console.error('usage: node scripts/portrait.mjs <source image>');
  process.exit(1);
}

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
mkdirSync(out, { recursive: true });

// The image is AI-generated (DECISIONS 82). IPTC's DigitalSourceType in the
// file's XMP says so to anything that reads image metadata (search engines
// show it as "AI-generated"); the value is the IPTC NewsCodes URI as IPTC
// writes it. Credit is the person shown, who commissioned it.
const XMP = [
  '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>',
  '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
  '<rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">',
  '<Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia</Iptc4xmpExt:DigitalSourceType>',
  '<dc:title><rdf:Alt><rdf:li xml:lang="x-default">Ahmadreza Taheri (AI-generated portrait)</rdf:li></rdf:Alt></dc:title>',
  '<photoshop:Credit>Ahmadreza Taheri, AI-generated</photoshop:Credit>',
  '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>',
].join('');

// [width, file name, format]; the heights follow from 4:5.
const FILES = [
  [1200, 'portrait.jpg', 'jpeg'],
  [800, 'portrait-800.jpg', 'jpeg'],
  [480, 'portrait-480.jpg', 'jpeg'],
  [1200, 'portrait-1200.avif', 'avif'],
  [800, 'portrait-800.avif', 'avif'],
  [480, 'portrait-480.avif', 'avif'],
  [240, 'portrait-240.avif', 'avif'],
];

for (const [width, name, format] of FILES) {
  const file = join(out, name);
  let image = sharp(source)
    .resize(width, (width * 5) / 4, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .sharpen({ sigma: width >= 1200 ? 0.6 : 0.5 });
  image =
    format === 'jpeg'
      ? image.jpeg({ quality: width >= 1200 ? 82 : 80, progressive: true, mozjpeg: true, chromaSubsampling: '4:2:0' })
      : image.avif({ quality: 50, effort: 6 });
  // No EXIF or tool data from the source; only the machine-readable AI
  // marking (the visible one is the label in the frame).
  await image.withXmp(XMP).toFile(file);
  console.log(`${name}: ${width} x ${(width * 5) / 4}, ${(statSync(file).size / 1024).toFixed(1)} kB`);
}
