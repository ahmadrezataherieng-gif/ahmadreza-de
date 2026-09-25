// Runs after `next build` (npm run build): gives the static pages a stylesheet
// without the rules that only the journey, the desktop and the apps use
// (ROADMAP PERF-01 audit, queue 3b).
//
//   node scripts/prune-static-css.mjs [--dir out] [--dry]
//
// The site is one route, so Next hands every page the same 125 kB stylesheet -
// render-blocking on the landing page, About, the legal pages and the 404,
// which use about a fifth of it. Here the export is post-processed like
// preload-shell.mjs does: the journey and desktop pages keep the original file;
// each static page is pointed at a pruned copy.
//
// What is pruned is provable, not guessed. A class is *exclusive* when it
// appears in the source of the journey side (journey, puzzles, desktop shell,
// apps) and nowhere in the static side (the import closure of the landing page,
// About, the legal pages, the 404 and the layouts - never lazy imports) or in
// the exported static HTML. A selector that requires an exclusive class can
// match nothing on a static page and is dropped, and so is a keyframe or an
// at-rule left empty. Everything else stays: element, attribute and root
// selectors, classes found in neither place, `@property`, `@font-face`, `@layer`
// order. Classes are looked for as substrings of the source text, so an
// arbitrary-value utility or a class built in pieces can only ever keep a rule.
//
// The href of the stylesheet is rewritten in the static HTML *and* in the
// payload inside it, so React finds the link it expects and adds nothing at
// hydration. A soft navigation to the journey fetches that page's own payload,
// which still names the full file, and loads it then.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import postcss from 'postcss';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const ROOT = process.cwd();
const OUT = path.resolve(ROOT, typeof args.dir === 'string' ? args.dir : 'out');
const DRY = Boolean(args.dry);

// An unexpected error must never stop the deploy: the export as built is valid.
for (const event of ['uncaughtException', 'unhandledRejection']) {
  process.on(event, (error) => {
    console.warn(`prune-static-css: ${error?.message ?? error} - the static pages keep the full stylesheet`);
    process.exit(0);
  });
}

const fail = (message) => {
  console.warn(`prune-static-css: ${message} - the static pages keep the full stylesheet`);
  process.exit(0);
};

/* --- the two sides of the source ------------------------------------------------ */

const SRC = path.join(ROOT, 'src');
const STATIC_ENTRIES = [
  'app/layout.tsx',
  'app/[[...locale]]/layout.tsx',
  'app/not-found.tsx',
  'components/landing/Landing.tsx',
  'components/about/AboutPage.tsx',
  'components/legal/LegalPage.tsx',
];
// Imported by the shared layout, rendered on the journey only.
const NOT_STATIC = new Set(['components/theme/EraEffectsLayer.tsx']);
const JOURNEY_SIDE = ['components/journey', 'components/puzzles', 'components/os', 'components/apps', 'components/theme/EraEffectsLayer.tsx', 'components/theme/DesktopTheme.tsx'];

const EXTENSIONS = ['.tsx', '.ts', '/index.tsx', '/index.ts'];
const resolveImport = (from, specifier) => {
  let base;
  if (specifier.startsWith('@/')) base = path.join(SRC, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(from), specifier);
  else return null;
  for (const extension of ['', ...EXTENSIONS]) {
    const file = base + extension;
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
};

/** Static imports only: a lazy `import()` is a different chunk and a different page. */
const closureOf = (entries) => {
  const seen = new Set();
  const queue = entries.map((entry) => path.join(SRC, entry)).filter((file) => existsSync(file));
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    if (NOT_STATIC.has(path.relative(SRC, file).replaceAll('\\', '/'))) continue;
    seen.add(file);
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/(?:^|\n)\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g)) {
      const target = resolveImport(file, match[1] ?? match[2]);
      if (target && /\.tsx?$/.test(target)) queue.push(target);
    }
  }
  return seen;
};

const walk = (target) => {
  const found = [];
  const full = path.join(SRC, target);
  if (!existsSync(full)) return found;
  if (statSync(full).isFile()) return [full];
  for (const name of readdirSync(full, { withFileTypes: true })) {
    const child = path.join(full, name.name);
    if (name.isDirectory()) found.push(...walk(path.relative(SRC, child)));
    else if (/\.tsx?$/.test(name.name)) found.push(child);
  }
  return found;
};

const staticFiles = closureOf(STATIC_ENTRIES);
const staticText = [...staticFiles].map((file) => readFileSync(file, 'utf8')).join('\n');
const journeyText = JOURNEY_SIDE.flatMap(walk)
  .filter((file) => !staticFiles.has(file))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

/* What a substring search cannot see: a hand-written class assembled at run time
   in the static side (`ao-legal-logo-${kind}`) looks exclusive to the journey
   if its full names appear only there. Its literal prefix is protected. */
const protectedPrefixes = new Set();
for (const file of staticFiles) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/(\bao-[a-z0-9-]*)\$\{/g)) protectedPrefixes.add(match[1]);
  for (const match of text.matchAll(/['"](ao-[a-z0-9-]*)['"]\s*\+/g)) protectedPrefixes.add(match[1]);
}

/* --- the export ---------------------------------------------------------------- */

const STATIC_PAGES = [];
const collect = (dir, depth) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_next' || depth > 2) continue;
      collect(child, depth + 1);
    } else if (entry.name === 'index.html' || entry.name === '404.html') {
      STATIC_PAGES.push(child);
    }
  }
};
if (!existsSync(OUT)) fail(`${OUT} does not exist`);
collect(OUT, 0);

// The journey and the desktop keep the full file; everything else is static.
const isDynamicView = (file) => /[\\/](amonel|desktop|journey)[\\/]index\.html$/.test(file);
const pages = STATIC_PAGES.filter((file) => !isDynamicView(file));
if (pages.length === 0) fail('no static pages found');
const htmlText = pages.map((file) => readFileSync(file, 'utf8')).join('\n');

const cssDir = path.join(OUT, '_next', 'static', 'css');
if (!existsSync(cssDir)) fail('no _next/static/css folder');
const cssFiles = readdirSync(cssDir).filter((name) => name.endsWith('.css')).map((name) => ({ name, size: statSync(path.join(cssDir, name)).size }));
const main = cssFiles.sort((a, b) => b.size - a.size)[0];
if (!main || main.size < 20000) fail('no large stylesheet to prune');
const mainCss = readFileSync(path.join(cssDir, main.name), 'utf8');

/* --- classes ------------------------------------------------------------------- */

const unescapeCss = (text) =>
  text.replace(/\\([0-9a-fA-F]{1,6})\s?|\\(.)/gs, (_, hex, char) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : char));

/** The classes a selector requires: none from inside a pseudo-class' arguments or an attribute selector. */
const requiredClasses = (selector) => {
  const classes = [];
  let i = 0;
  while (i < selector.length) {
    const char = selector[i];
    if (char === '\\') {
      i += 2;
    } else if (char === '(') {
      let depth = 1;
      i += 1;
      while (i < selector.length && depth > 0) {
        if (selector[i] === '\\') i += 1;
        else if (selector[i] === '(') depth += 1;
        else if (selector[i] === ')') depth -= 1;
        i += 1;
      }
    } else if (char === '[') {
      let quote = null;
      i += 1;
      while (i < selector.length && (quote || selector[i] !== ']')) {
        if (selector[i] === '\\') i += 1;
        else if (quote && selector[i] === quote) quote = null;
        else if (!quote && (selector[i] === '"' || selector[i] === "'")) quote = selector[i];
        i += 1;
      }
      i += 1;
    } else if (char === '.') {
      let j = i + 1;
      let name = '';
      while (j < selector.length && /[\w\\-]|[^\x00-\x7f]/.test(selector[j])) {
        if (selector[j] === '\\') {
          // A CSS escape: a hex run (with an optional space) or one character.
          const hex = /^\\[0-9a-fA-F]{1,6}\s?/.exec(selector.slice(j));
          const piece = hex ? hex[0] : selector.slice(j, j + 2);
          name += piece;
          j += piece.length;
        } else {
          name += selector[j];
          j += 1;
        }
      }
      if (name) classes.push(unescapeCss(name));
      i = j;
    } else {
      i += 1;
    }
  }
  return classes;
};

const memo = new Map();
const isExclusive = (name) => {
  let answer = memo.get(name);
  if (answer === undefined) {
    answer =
      journeyText.includes(name) &&
      !staticText.includes(name) &&
      !htmlText.includes(name) &&
      ![...protectedPrefixes].some((prefix) => name.startsWith(prefix));
    memo.set(name, answer);
  }
  return answer;
};

/* --- prune --------------------------------------------------------------------- */

const splitSelectors = (list) => {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i += 1) {
    const char = list[i];
    if (char === '\\') i += 1;
    else if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    else if (char === ',' && depth === 0) {
      parts.push(list.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(list.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
};

const root = postcss.parse(mainCss);
let removedRules = 0;

const pruneContainer = (container) => {
  container.each((node) => {
    if (node.type === 'rule') {
      if (node.parent?.type === 'atrule' && /keyframes$/i.test(node.parent.name)) return;
      const keep = splitSelectors(node.selector).filter((selector) => !requiredClasses(selector).some(isExclusive));
      if (keep.length === 0) {
        node.remove();
        removedRules += 1;
      } else if (keep.length !== splitSelectors(node.selector).length) {
        node.selector = keep.join(',');
      }
    } else if (node.type === 'atrule') {
      if (/^(media|supports|layer|container|scope|starting-style)$/i.test(node.name) && node.nodes) {
        pruneContainer(node);
        if (node.nodes.length === 0) node.remove();
      }
    }
  });
};
pruneContainer(root);

// A keyframe stays if the pruned sheet or the static source still names it.
const remaining = root.toString();
root.walkAtRules(/keyframes$/i, (node) => {
  const name = node.params.trim();
  const used = new RegExp(`(^|[^\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w-]|$)`);
  const declarations = remaining.replace(node.toString(), '');
  if (!used.test(declarations) && !staticText.includes(name)) node.remove();
});

const pruned = root.toString();
const stamp = createHash('sha256').update(pruned).digest('hex').slice(0, 16);
const prunedName = `static-${stamp}.css`;
const size = (text) => gzipSync(text, { level: 6 }).length;

console.log(
  `prune-static-css: ${main.name} ${(mainCss.length / 1000).toFixed(1)} kB (${(size(mainCss) / 1000).toFixed(1)} kB gzip) -> ${prunedName} ${(pruned.length / 1000).toFixed(1)} kB (${(size(pruned) / 1000).toFixed(1)} kB gzip); ${removedRules} rules dropped; ${staticFiles.size} static source files, ${pages.length} static pages, protected prefixes: ${[...protectedPrefixes].join(' ') || 'none'}`,
);
if (DRY) process.exit(0);

writeFileSync(path.join(cssDir, prunedName), pruned);
const from = `/_next/static/css/${main.name}`;
const to = `/_next/static/css/${prunedName}`;
let rewritten = 0;
let payloads = 0;
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  if (html.includes(from)) {
    writeFileSync(file, html.split(from).join(to));
    rewritten += 1;
  }
  // The page's own RSC payload (`index.txt` beside it) is what a soft navigation
  // or a prefetch of this page reads: it must name the same stylesheet, or the
  // prefetch would fetch the full one.
  const payload = file.replace(/index\.html$/, 'index.txt');
  if (payload !== file && existsSync(payload)) {
    const text = readFileSync(payload, 'utf8');
    if (text.includes(from)) {
      writeFileSync(payload, text.split(from).join(to));
      payloads += 1;
    }
  }
}
console.log(`prune-static-css: ${rewritten} static pages and ${payloads} payloads now name ${to}`);
