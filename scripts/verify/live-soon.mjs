// Checks the LIVE coming-soon page after a deploy (ROADMAP BR-03): the same
// things `curl` would show, asserted. Run from the repository root:
//
//   node scripts/verify/live-soon.mjs [--base https://ahmadreza.de]
//
// Every request carries a cache-busting query, so a stale edge copy right after a
// deploy cannot pass for the new page.
import { EMPLOYER } from '../test/employer-name.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((arg, index, all) => (arg.startsWith('--') ? [arg.slice(2), all[index + 1]] : null)).filter(Boolean));
const BASE = (args.base ?? 'https://ahmadreza.de').replace(/\/$/, '');
const bust = `?v=${Date.now()}`;
let failed = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` - ${detail}` : ''}`);
};
const get = async (path, init) => {
  const response = await fetch(`${BASE}${path}${bust}`, { redirect: 'manual', ...init });
  return { response, status: response.status, type: response.headers.get('content-type') ?? '', body: /^(text|application\/(xml|json|ld))|xml/.test(response.headers.get('content-type') ?? '') ? await response.text() : null };
};

const home = await get('/');
check('/ answers 200 as HTML', home.status === 200 && home.type.startsWith('text/html'), `${home.status} ${home.type}`);
const html = home.body ?? '';
check('title has the name, the role and the city', html.includes('<title>Ahmadreza Taheri – Fachinformatiker (Ausbildung), Trier</title>'));
check('meta description names Amonel', /<meta name="description" content="[^"]*Trier[^"]*Amonel[^"]*">/.test(html));
check('canonical is https://ahmadreza.de/', html.includes('<link rel="canonical" href="https://ahmadreza.de/">'));
check('html lang is de, robots index,follow', html.includes('<html lang="de"') && html.includes('<meta name="robots" content="index,follow">'));
check('h1 is the name; the Persian and English lines are visible text', html.includes('<h1>Ahmadreza Taheri</h1>') && html.includes('احمدرضا طاهری،') && html.includes('IT specialist for system integration in training'));
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
let person;
let graph;
try { graph = JSON.parse(ld)['@graph']; person = graph?.find((node) => node['@type'] === 'Person'); } catch { /* reported below */ }
check('JSON-LD parses as a Person with the Persian alternateName, city and country only', person?.['@type'] === 'Person' && person.name === 'Ahmadreza Taheri' && person.alternateName?.includes('احمدرضا طاهری') && person.address?.addressLocality === 'Trier' && person.address?.addressCountry === 'DE' && !('streetAddress' in person.address) && !('postalCode' in person.address), ld?.slice(0, 80));
check('JSON-LD has the site e-mail, the url and no legal name', person?.email?.startsWith('mailto:') && person.url === 'https://ahmadreza.de/' && !/Momrabadi/.test(ld ?? ''));
check('Open Graph and Twitter tags with the share image', ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'og:site_name'].every((name) => html.includes(`property="${name}"`)) && html.includes('name="twitter:card" content="summary_large_image"') && html.includes('name="twitter:image"'));
check('the employer is not named', !EMPLOYER.test(html));
check('no {{ placeholder or marker left over', !/\{\{|@jsonld|@tokens/.test(html));
const external = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((match) => match[1]).filter((url) => !url.startsWith('https://ahmadreza.de') && !url.startsWith('http://www.w3.org'));
check('the HTML links to no other origin for its own assets (scripts, styles, fonts, images)', external.length === 0, external.join(' '));

const robots = await get('/robots.txt');
check('/robots.txt: text, allows all, names the sitemap and the AI bots', robots.status === 200 && robots.type.startsWith('text/plain') && /User-agent: \*\s+Allow: \//.test(robots.body) && robots.body.includes('Sitemap: https://ahmadreza.de/sitemap.xml') && ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'].every((bot) => robots.body.includes(bot)) && !/^Disallow:\s*\S/m.test(robots.body), `${robots.status} ${robots.type}`);
const sitemap = await get('/sitemap.xml');
check('/sitemap.xml: XML with the three language pages and hreflang alternates', sitemap.status === 200 && /xml/.test(sitemap.type) && ['https://ahmadreza.de/', 'https://ahmadreza.de/en/', 'https://ahmadreza.de/fa/'].every((url) => sitemap.body.includes(`<loc>${url}</loc>`)) && sitemap.body.includes('hreflang="x-default"') && !/impressum|datenschutz/.test(sitemap.body), `${sitemap.status} ${sitemap.type}`);

// SEO-15: the English and Persian pages are real pages of their own.
for (const [path, lang, dir, title, canonical] of [['/en/', 'en', 'ltr', 'Ahmadreza Taheri – IT System Integration Apprentice, Trier', 'https://ahmadreza.de/en/'], ['/fa/', 'fa', 'rtl', 'احمدرضا طاهری – کارآموز فناوری اطلاعات، تریر', 'https://ahmadreza.de/fa/']]) {
  const page = await get(path);
  const body = page.body ?? '';
  check(`${path} answers 200 as HTML with lang=${lang} dir=${dir}, its own title, canonical and index,follow`, page.status === 200 && page.type.startsWith('text/html') && body.includes(`<html lang="${lang}" dir="${dir}">`) && body.includes(`<title>${title}</title>`) && body.includes(`<link rel="canonical" href="${canonical}">`) && body.includes('<meta name="robots" content="index,follow">'), `${page.status}`);
  check(`${path} has hreflang de, en, fa, x-default and its own JSON-LD`, ['de', 'en', 'fa', 'x-default'].every((code) => body.includes(`hreflang="${code}"`)) && /"@type":"Person"/.test(body) && body.includes(`"url":"${canonical}"`) && !/{{|@jsonld|@tokens|@alternates/.test(body) && !EMPLOYER.test(body));
}
for (const path of ['/impressum/', '/datenschutz/', '/en/impressum/', '/en/datenschutz/', '/fa/impressum/', '/fa/datenschutz/']) {
  const legal = await get(path);
  check(`${path} answers 200, is noindex, has no employer and no dummy address`, legal.status === 200 && (legal.body ?? '').includes('<meta name="robots" content="noindex,follow">') && !EMPLOYER.test(legal.body ?? '') && !/Musterstra|Musterstadt/.test(legal.body ?? ''), `${legal.status}`);
}
for (const [path, type] of [['/og/ahmadreza-taheri-de.png', 'image/png'], ['/fonts/martian-grotesk-vf.woff2', 'font/woff2'], ['/fonts/geist-latin-wght.woff2', 'font/woff2'], ['/fonts/geist-mono-latin-wght.woff2', 'font/woff2'], ['/fonts/vazirmatn-arabic-wght.woff2', 'font/woff2'], ['/fonts/departure-mono-regular.woff2', 'font/woff2'], ['/fonts/LICENSES.md', ''], ['/fonts/licenses/martian-grotesk-OFL.txt', 'text/plain']]) {
  const asset = await get(path, { method: 'HEAD' });
  check(`${path} answers 200${type ? ` as ${type}` : ''}`, asset.status === 200 && (!type || asset.type.startsWith(type)), `${asset.status} ${asset.type}`);
}
const missing = await get('/does-not-exist/');
check('an unknown path is a 404, not the home page', missing.status === 404, `${missing.status}`);
const www = await fetch('https://www.ahmadreza.de/', { redirect: 'manual' });
check('www redirects to the apex (301)', www.status === 301 && www.headers.get('location') === 'https://ahmadreza.de/', `${www.status} ${www.headers.get('location')}`);

console.log(failed ? `${failed} check(s) FAILED` : 'all live checks passed');
process.exit(failed ? 1 : 0);
