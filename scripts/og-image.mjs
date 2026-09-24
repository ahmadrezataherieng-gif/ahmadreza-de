// Generates the Open Graph share images (ROADMAP SEO-05): one 1200 x 630 PNG
// per language in public/og/, the one raster the `seo` skill allows besides the
// portrait and the icons. Link previews in LinkedIn, WhatsApp and Telegram need
// a real image; nothing else does.
//
//   node scripts/og-image.mjs          (rerun when the name, job or tagline copy changes)
//
// Rendered as HTML in headless Chrome (scripts/verify/cdp.mjs) so the text uses
// the site's own self-hosted faces from node_modules - sharp's SVG renderer
// cannot load them - then squeezed to a palette PNG with sharp. The words come
// from messages/ (`site.author`, `site.persianName`, `site.jobTitle`,
// `site.tagline`); the colours are the brand kit's, like brand-icons.mjs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

import { launch, sleep, OUT } from './verify/cdp.mjs';

const root = new URL('../', import.meta.url);
const file = (relative) => pathToFileURL(path.join(new URL(root).pathname.replace(/^\/([A-Za-z]:)/, '$1'), relative)).href;
const font = (pkg, name) => file(`node_modules/${pkg}/files/${name}`);

const FACES = `
@font-face{font-family:Inter;font-weight:400;src:url(${font('@fontsource/inter', 'inter-latin-400-normal.woff2')})}
@font-face{font-family:Inter;font-weight:700;src:url(${font('@fontsource/inter', 'inter-latin-700-normal.woff2')})}
@font-face{font-family:Inter;font-weight:400;src:url(${font('@fontsource/inter', 'inter-latin-ext-400-normal.woff2')});unicode-range:U+0100-024F}
@font-face{font-family:Mono;font-weight:700;src:url(${font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff2')})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2')})}
@font-face{font-family:Vazirmatn;font-weight:100 900;src:url(${font('@fontsource-variable/vazirmatn', 'vazirmatn-arabic-wght-normal.woff2')})}`;

function html(locale, site, latinName) {
  const rtl = locale === 'fa';
  // Persian leads with the Persian spelling; the Latin name stays beneath it,
  // since that is the name every profile and search uses.
  const title = rtl ? site.persianName : site.author;
  const subtitle = rtl ? latinName : '';
  return `<!doctype html><html lang="${locale}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>${FACES}
*{margin:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{background:#080a0f;color:#e9edf5;font-family:${rtl ? 'Vazirmatn' : 'Inter'},sans-serif;overflow:hidden;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(700px 500px at 88% 12%,rgba(93,226,164,.18),transparent 60%),radial-gradient(600px 460px at 5% 100%,rgba(240,164,74,.12),transparent 60%)}
.grid{position:absolute;inset:0;opacity:.5;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:60px 60px}
.wrap{position:absolute;inset:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
.brand{display:flex;align-items:center;gap:18px;font-family:Mono;font-weight:700;font-size:30px;letter-spacing:-.01em;direction:ltr}
.brand img{width:64px;height:64px}
.cursor{display:inline-block;width:14px;height:30px;background:#f0a44a;margin-inline-start:6px;vertical-align:-4px}
h1{font-weight:700;font-size:${rtl ? 104 : 96}px;line-height:1.02;letter-spacing:${rtl ? 0 : '-.03em'}}
.sub{font-family:Inter;font-size:36px;color:#8e9bb0;margin-top:10px;direction:ltr;text-align:${rtl ? 'right' : 'left'}}
.role{font-size:36px;line-height:1.3;margin-top:26px;color:#e9edf5;max-width:960px}
.rule{width:96px;height:4px;background:#5de2a4;margin-top:30px}
.foot{display:flex;justify-content:space-between;align-items:flex-end;font-family:Mono;font-size:24px;color:#8e9bb0}
.foot .url{color:#5de2a4;direction:ltr}
</style></head><body><div class="glow"></div><div class="grid"></div><div class="wrap">
<div class="brand"><img src="${file('scripts/brand/amonel-icon-glass.svg')}" alt="">amonel<span class="cursor"></span></div>
<div><h1>${title}</h1>${subtitle ? `<p class="sub">${subtitle}</p>` : ''}<div class="rule"></div><p class="role">${site.jobTitle}</p></div>
<div class="foot"><span>${site.tagline}</span><span class="url">ahmadreza.de</span></div>
</div></body></html>`;
}

mkdirSync(new URL('public/og/', root), { recursive: true });
const chrome = await launch({ width: 1200, height: 630, tag: 'og' });
try {
  const latinName = JSON.parse(readFileSync(new URL('src/messages/en.json', root), 'utf8')).site.author;
  for (const locale of ['de', 'en', 'fa']) {
    const { site } = JSON.parse(readFileSync(new URL(`src/messages/${locale}.json`, root), 'utf8'));
    const page = path.join(OUT, `og-${locale}.html`);
    writeFileSync(page, html(locale, site, latinName));
    await chrome.goto(pathToFileURL(page).href, 1500);
    await chrome.evaluate('document.fonts.ready.then(() => document.fonts.size)');
    await sleep(300);
    const shot = await chrome.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
    const png = await sharp(Buffer.from(shot.result.data, 'base64')).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
    writeFileSync(new URL(`public/og/ahmadreza-taheri-${locale}.png`, root), png);
    console.log(`public/og/ahmadreza-taheri-${locale}.png ${(png.length / 1024).toFixed(1)} kB`);
  }
} finally {
  chrome.close();
}
