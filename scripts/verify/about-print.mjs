// Focused About print regression checks against the local static export.
// node scripts/verify/about-print.mjs [--locale de|en|fa] [--base URL] [--quiet]
// Reuses the existing CDP driver; creates no screenshots or PDF artifacts.
import { readFileSync } from 'node:fs';
import { launch } from './cdp.mjs';
import { leaksAddress } from '../test/private-address.mjs';
import { EMPLOYER } from '../test/employer-name.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const BASE = String(args.base ?? 'http://localhost:3001').replace(/\/$/, '');
const QUIET = Boolean(args.quiet);
const LOCALES = args.locale ? [String(args.locale)] : ['de', 'en', 'fa'];
if (LOCALES.some((locale) => !['de', 'en', 'fa'].includes(locale))) throw new Error('--locale must be de, en or fa');

// NFKC handles equivalent Unicode forms; removing Persian joiners keeps one
// identity token comparable regardless of how the letters were joined.
const identityTokens = (text) => text.normalize('NFKC').toLowerCase()
  .replace(/[\u200c\u200d]/gu, '').match(/[\p{L}\p{N}\p{M}]+/gu) ?? [];

// Read the existing canonical identity without importing the legal module,
// which requires legal.local.ts. Keep forbidden values in Node memory only.
const legalName = readFileSync(new URL('../../src/content/legal.ts', import.meta.url), 'utf8')
  .match(/\bname:\s*'([^']+)'/)?.[1];
if (!legalName) throw new Error('Cannot read canonical legal identity for privacy verification');
const publicNameTokens = new Set(['de', 'en', 'fa'].flatMap((locale) =>
  identityTokens(JSON.parse(readFileSync(new URL(`../../src/messages/apps/about/${locale}.json`, import.meta.url), 'utf8')).name),
));
const legalOnlyIdentityTokens = [...new Set(identityTokens(legalName))].filter((token) => !publicNameTokens.has(token));

const log = [];
const check = (label, ok) => {
  log.push({ label, ok });
  if (!QUIET || !ok) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
};

// Synthetic examples only: never include a real legal-only identity token.
check('identity tokens: complete words do not match substrings', !new Set(identityTokens('samples')).has('sample'));
check('identity tokens: punctuation, casing and Unicode forms normalize',
  JSON.stringify(identityTokens('(ÉCOLE), ＡＢＣ!')) === JSON.stringify(identityTokens('e\u0301cole abc')));
check('identity tokens: Persian joining variants normalize',
  JSON.stringify(identityTokens('کتاب\u200cخانه کتاب\u200dخانه')) === JSON.stringify(identityTokens('کتابخانه کتابخانه')));

for (const locale of LOCALES) {
  const copy = JSON.parse(readFileSync(new URL(`../../src/messages/apps/about/${locale}.json`, import.meta.url), 'utf8'));
  const b = await launch({ width: 1280, height: 900, reduce: true, tag: `about-print-${locale}` });
  const tag = `${locale} About`;
  try {
    await b.goto(`${BASE}/${locale === 'de' ? '' : `${locale}/`}about/`, 1800);
    await b.evaluate('document.fonts.ready.then(() => true)');
    // Check every ancestor: a child's own display remains "block" when its
    // semantic header is hidden, which is how the original regression escaped.
    await b.evaluate(`window.__aboutPrint = (() => {
      const page = document.querySelector('.ao-site-page');
      const article = page?.querySelector('[data-app-content="about"]');
      const heading = document.getElementById(article?.getAttribute('aria-labelledby') ?? '');
      const identity = heading?.closest('header');
      const email = article?.querySelector('[data-action="email"]');
      const visible = (element) => {
        if (!element?.getClientRects().length) return false;
        for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
          if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0 || style.contentVisibility === 'hidden') return false;
        }
        return true;
      };
      const textNodes = () => {
        const texts = [];
        const walker = document.createTreeWalker(page ?? document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node.textContent.trim() && !node.parentElement.closest('script,style')) texts.push(node);
        }
        return texts;
      };
      const textOf = (node) => node.textContent.trim().replace(/\\s+/g, ' ');
      const screenNodes = new Set(textNodes().filter((node) => visible(node.parentElement)));
      const siteHeaders = [...(page?.querySelectorAll('header[data-site-chrome]') ?? [])];
      const chromeGroups = [
        siteHeaders,
        [...(page?.querySelectorAll('nav') ?? [])],
        [...(page?.querySelectorAll('footer') ?? [])],
        [...(page?.querySelectorAll('[data-language-switcher]') ?? [])],
        siteHeaders.flatMap((header) => [...header.querySelectorAll('button')]),
      ];
      const chrome = chromeGroups.flat();
      return { page, article, identity, heading, email, visible, textNodes, screenNodes, textOf, chromeGroups, chrome };
    })(); true`);
    const state = () => b.evaluate(`(() => {
      const p = window.__aboutPrint;
      const record = (element) => ({ text: element?.textContent.trim() ?? '', visible: p.visible(element) });
      const sections = [...(p.article?.querySelectorAll('section[aria-labelledby]') ?? [])];
      const printedNodes = p.textNodes().filter((node) => p.visible(node.parentElement));
      const role = [...(p.identity?.querySelectorAll('p') ?? [])].find((element) => element.textContent.trim() === ${JSON.stringify(copy.role)});
      return {
        article: p.visible(p.article), identity: p.visible(p.identity),
        name: record(p.heading), nameIsPageHeading: p.heading?.tagName === 'H1' && p.article?.contains(p.heading), role: record(role),
        paragraphs: [...(p.identity?.querySelectorAll('p') ?? [])].map(record),
        contact: p.visible(p.identity?.querySelector('[role="group"]')),
        email: record(p.email), href: p.email?.getAttribute('href') ?? '',
        sections: sections.map((section) => ({ visible: p.visible(section), heading: record(section.querySelector('h2')) })),
        profileVisible: sections.length > 0 && sections.every((section) => [...section.querySelectorAll('p,li')].every(p.visible)),
        ai: record(p.article?.querySelector('.ao-portrait-ai')),
        chromePresent: p.chromeGroups.every((group) => group.length > 0),
        chromeVisible: p.chrome.every(p.visible), chromeHidden: p.chrome.every((element) => !p.visible(element)),
        direction: p.article ? getComputedStyle(p.article).direction : '',
        emailDirection: p.email?.querySelector('[dir="ltr"]') ? getComputedStyle(p.email.querySelector('[dir="ltr"]')).direction : '',
        onlyScreenText: printedNodes.every((node) => p.screenNodes.has(node)),
        printedText: printedNodes.map(p.textOf).join(' '),
      };
    })()`);
    const before = await state();
    const screenIdentityVisible = (result) => result.identity && result.nameIsPageHeading
      && result.name.visible && result.name.text === copy.name && result.role.visible && result.role.text === copy.role
      && result.contact && result.email.visible && result.href.startsWith('mailto:') && result.email.text.includes(result.href.slice(7));
    const directionsCorrect = (result) => result.direction === (locale === 'fa' ? 'rtl' : 'ltr') && result.emailDirection === 'ltr';
    check(`${tag}: screen identity, public name, role and contact are visible`, screenIdentityVisible(before));
    check(`${tag}: screen chrome is present and visible`, before.chromePresent && before.chromeVisible);
    check(`${tag}: screen locale and email directions are correct`, directionsCorrect(before));

    await b.send('Emulation.setEmulatedMedia', { media: 'print', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await b.evaluate('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))');
    const printed = await state();
    const printedIdentityTokens = new Set(identityTokens(printed.printedText));
    check(`${tag}: identity header is printable`, printed.identity);
    check(`${tag}: localized name is printable`, printed.nameIsPageHeading && printed.name.visible && printed.name.text === copy.name);
    check(`${tag}: professional role is printable`, printed.role.visible && printed.role.text === copy.role);
    check(`${tag}: introduction remains printable`, copy.intro.every((text) => printed.paragraphs.some((paragraph) => paragraph.visible && paragraph.text === text)));
    check(`${tag}: contact block and exposed email are printable`, printed.contact && printed.email.visible && printed.email.text.includes(printed.href.slice(7)) && printed.href.startsWith('mailto:'));
    check(`${tag}: main profile and all four section headings remain printable`, printed.article && printed.profileVisible && printed.sections.length === 4 && printed.sections.every((section, index) => section.visible && section.heading.visible && section.heading.text === [copy.path.title, copy.now.title, copy.skills.title, copy.languages.title][index]));
    check(`${tag}: AI portrait disclosure remains printable`, printed.ai.visible && printed.ai.text === copy.portraitAi);
    check(`${tag}: site header, navigation, footer, language and theme chrome stay hidden`, printed.chromePresent && printed.chromeHidden);
    check(`${tag}: print exposes only screen-visible text`, printed.onlyScreenText);
    check(`${tag}: print exposes no private postal address`, !leaksAddress(printed.printedText));
    check(`${tag}: print exposes no dummy postal address or legal-only identity`, !/Musterstra(?:ße|sse)/i.test(printed.printedText) && !legalOnlyIdentityTokens.some((token) => printedIdentityTokens.has(token)));
    check(`${tag}: print exposes no prohibited employer information`, !EMPLOYER.test(printed.printedText));
    check(`${tag}: locale direction is preserved`, printed.direction === (locale === 'fa' ? 'rtl' : 'ltr'));
    check(`${tag}: exposed email stays left to right`, printed.emailDirection === 'ltr');

    await b.send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    // Let both media changes reach rendering; no geometry/transition snapshot.
    await b.evaluate('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))');
    const after = await state();
    check(`${tag}: screen identity, public name, role and contact are restored`, screenIdentityVisible(after));
    check(`${tag}: screen chrome is restored`, after.chromePresent && after.chromeVisible);
    check(`${tag}: screen locale and email directions are restored`, directionsCorrect(after));
    check(`${tag}: browser reports no errors`, b.errors.length === 0);
  } finally {
    b.close();
  }
}

const passed = log.filter((entry) => entry.ok).length;
console.log(`${QUIET ? '' : '\n'}about-print: ${passed}/${log.length} passed`);
process.exit(passed === log.length ? 0 : 1);
