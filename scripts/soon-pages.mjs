// Renders the coming-soon template (soon/index.html, written in German) once per
// language (ROADMAP SEO-15): /, /en/ and /fa/ are three real pages with their own
// lang and dir, title, description, canonical, hreflang alternates, share tags,
// JSON-LD and the whole text in that language - nothing depends on a script.
// Separate from build-soon.mjs so the tests can render the pages without the
// legal address that build needs.

import { ALT, FA_NAME, SEO, T } from '../soon/copy.mjs';
import { alternateLinks, jsonLdScript, LOCALES, OG_IMAGES, pageUrl } from './soon-seo.mjs';

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// A Latin term inside Persian text is an isolated left-to-right run (<bdi>), so the
// punctuation next to it - the full stop after "Amonel OS" - lands on the correct
// side instead of being reordered by the bidi algorithm.
const LATIN_RUN = /[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]|[A-Za-z]/g;
export function bidi(text) {
  let out = '';
  let last = 0;
  for (const match of text.matchAll(LATIN_RUN)) {
    out += escape(text.slice(last, match.index)) + `<bdi>${escape(match[0])}</bdi>`;
    last = match.index + match[0].length;
  }
  return out + escape(text.slice(last));
}

/** Text for an element's content: escaped, and in Persian with its Latin terms isolated. */
const content = (localeId, text) => (localeId === 'fa' ? bidi(text) : escape(text));

/** Replaces the text of every element that has `attribute`; the callback gets the attribute's value. */
function mapText(html, attribute, replace) {
  const pattern = new RegExp(`(<(\\w+)[^>]*\\s${attribute}="([^"]*)"[^>]*>)([^<]*)(</\\2>)`, 'g');
  return html.replace(pattern, (whole, open, tag, value, old, close) => `${open}${replace(value, old)}${close}`);
}

/** Replaces the content attribute of the one tag that matches `head` (e.g. `meta property="og:title"`). */
function setContent(html, head, value) {
  const pattern = new RegExp(`(<${head} content=")[^"]*(">)`);
  if (!pattern.test(html)) throw new Error(`soon/index.html: no <${head}> to fill`);
  return html.replace(pattern, (whole, open, close) => `${open}${escape(value)}${close}`);
}

/**
 * The finished page of one language. `filled` is the template after the
 * roadmap figures were put in (`fillPlaceholders`).
 */
export function renderLanding(filled, localeId, year = new Date().getFullYear()) {
  const locale = LOCALES.find((entry) => entry.id === localeId);
  const t = T[localeId];
  const seo = SEO[localeId];
  const image = OG_IMAGES[localeId];
  let html = filled;

  html = html.replace('<html lang="de" dir="ltr">', `<html lang="${locale.id}" dir="${locale.dir}">`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(t.title)}</title>`);
  html = setContent(html, 'meta name="description"', seo.description);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${pageUrl(locale)}">`);
  html = html.replace('<!--@alternates-->', () => alternateLinks());
  html = html.replace('<!--@jsonld-->', () => jsonLdScript(localeId));

  // Open Graph and Twitter: this language's own texts and share image.
  html = setContent(html, 'meta property="og:title"', t.title);
  html = setContent(html, 'meta property="og:description"', seo.shareDescription);
  html = setContent(html, 'meta property="og:url"', pageUrl(locale));
  html = setContent(html, 'meta property="og:image"', image.url);
  html = setContent(html, 'meta property="og:image:alt"', seo.imageAlt);
  html = setContent(html, 'meta name="twitter:title"', t.title);
  html = setContent(html, 'meta name="twitter:description"', seo.shareDescription);
  html = setContent(html, 'meta name="twitter:image"', image.url);
  html = setContent(html, 'meta name="twitter:image:alt"', seo.imageAlt);
  html = setContent(html, 'meta property="og:locale"', locale.ogLocale);
  const others = LOCALES.filter((entry) => entry.id !== localeId);
  html = html.replace(
    /<meta property="og:locale:alternate" content="[^"]*">\s*<meta property="og:locale:alternate" content="[^"]*">/,
    others.map((entry) => `<meta property="og:locale:alternate" content="${entry.ogLocale}">`).join('\n'),
  );

  // The page's text.
  html = mapText(html, 'data-t', (key) => {
    if (!(key in t)) throw new Error(`soon/copy.mjs: no "${key}" in ${localeId}`);
    return content(localeId, t[key]);
  });
  html = html.replace(/aria-label="[^"]*"( data-t-label="(\w+)")/g, (_whole, tail, key) => `aria-label="${escape(t[key])}"${tail}`);
  // Numbers in the page language: Persian digits and the Persian calendar in fa.
  const number = new Intl.NumberFormat(localeId);
  const percent = new Intl.NumberFormat(localeId, { style: 'percent' });
  html = mapText(html, 'data-pct', (value) => percent.format(Number(value) / 100));
  html = mapText(html, 'data-counts', (value) => {
    const [done, partial, missing] = value.split(',').map(Number);
    return escape(t.counts.replace('{d}', number.format(done)).replace('{p}', number.format(partial)).replace('{m}', number.format(missing)));
  });
  html = mapText(html, 'data-date', (value) => new Intl.DateTimeFormat(localeId, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)));

  // The name in the other scripts, under the role.
  const alt = (localeId === 'fa' ? FA_NAME : '') + Object.keys(ALT).filter((key) => key !== localeId).map((key) => ALT[key]).join('');
  html = html.replace(/(<div class="alt" id="alt">)[\s\S]*?(<\/div>)/, (whole, open, close) => `${open}${alt}${close}`);

  // The language links are real URLs; this page's own is the current one.
  const links = LOCALES.map(
    (entry) => `<a href="/${entry.prefix}" hreflang="${entry.id}" lang="${entry.id}"${entry.id === localeId ? ' aria-current="page"' : ''}>${entry.label}</a>`,
  ).join('\n      ');
  html = html.replace(/(<nav class="langs"[^>]*>)[\s\S]*?(<\/nav>)/, (whole, open, close) => `${open}\n      ${links}\n    ${close}`);
  html = html.replace(/href="\/(impressum|datenschutz)\/"/g, (whole, slug) => `href="/${locale.prefix}${slug}/"`);
  html = html.replace(/<span id="y">\d+<\/span>/, `<span id="y">${year}</span>`);
  // The logo goes to this language's home.
  html = html.replace('<a class="logo" href="/"', `<a class="logo" href="/${locale.prefix}"`);
  return html;
}
