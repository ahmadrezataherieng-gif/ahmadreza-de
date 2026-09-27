// The desktop's boot sequence (queue 2026-09-28 B item 1): a short
// systemd-style log on a direct visit to /desktop/, never after the
// Convergence hand-over (which must stay pixel-identical) and never under
// reduced motion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

// BootSequence.tsx has JSX, so node (which only strips plain TypeScript) cannot
// import it directly; LINES and WELCOME_LINE are read out of the source text instead.
const bootSource = read('src/components/os/BootSequence.tsx');
const LINES = [...bootSource.matchAll(/^\s*'((?:[^'\\]|\\.)*)',$/gm)].map((match) => match[1]);
const WELCOME_LINE = bootSource.match(/export const WELCOME_LINE = '((?:[^'\\]|\\.)*)';/)?.[1];

test('LINES: 10-12 lines, all machine text (plain ASCII, English, ends in a period)', () => {
  assert.ok(LINES.length >= 10 && LINES.length <= 12, `${LINES.length} lines`);
  for (const line of LINES) {
    assert.match(line, /^[\x20-\x7E]+\.$/, `${JSON.stringify(line)} is plain ASCII ending in a period`);
    assert.match(line, /^(Started|Mounted|Reached target) /, `${JSON.stringify(line)} reads like a systemd line`);
  }
  assert.equal(new Set(LINES).size, LINES.length, 'no duplicate line');
});

test('WELCOME_LINE: plain ASCII, names Amonel OS', () => {
  assert.match(WELCOME_LINE, /^[\x20-\x7E]+$/);
  assert.match(WELCOME_LINE, /Amonel OS/);
});

test('BootSequence.tsx: aria-hidden, forced LTR, no hooks (a server component), no focusable content', () => {
  assert.match(bootSource, /aria-hidden="true"/);
  assert.match(bootSource, /dir="ltr"/);
  assert.doesNotMatch(bootSource, /\buse(State|Effect|Ref|Callback|Memo)\b/, 'no hooks - the server renders this');
  assert.doesNotMatch(bootSource, /<a |<button|<input/, 'nothing focusable inside');
  assert.doesNotMatch(bootSource, /'use client'/, 'a server component, like DesktopFrame');
});

test('Desktop.tsx: BootSequence renders inside .ao-desktop-screen, alongside DesktopFrame', () => {
  const desktop = read('src/components/os/Desktop.tsx');
  assert.match(desktop, /<BootSequence \/>/);
  const screen = desktop.slice(desktop.indexOf('ao-desktop-screen'), desktop.indexOf('</div>', desktop.indexOf('ao-desktop-screen')));
  assert.match(screen, /<DesktopFrame/);
  assert.match(screen, /<BootSequence/);
});

test('Journey.tsx: the Convergence hand-over, and only it, marks its navigation with ?entry=convergence', () => {
  const journey = read('src/components/journey/Journey.tsx');
  const calls = [...journey.matchAll(/leaveForDesktop\([^)]*\)/g)];
  assert.equal(calls.length, 1, 'exactly one leaveForDesktop call in Journey.tsx (the Convergence hand-over)');
  assert.match(calls[0][0], /\?entry=convergence/);
});

test('SkipToDesktop and the Assistant teaser never carry the convergence marker (they are not the Convergence hand-over)', () => {
  for (const file of ['src/components/journey/SkipToDesktop.tsx', 'src/components/journey/AssistantTeaserLine.tsx']) {
    assert.doesNotMatch(read(file), /entry=convergence/, file);
  }
});

test('layout.tsx: BOOT_SKIP_SCRIPT only ships on the desktop view, checks the convergence marker and reduced motion, and falls back to skip on error', () => {
  const layout = read('src/app/[[...locale]]/layout.tsx');
  const script = layout.match(/const BOOT_SKIP_SCRIPT = `([\s\S]*?)`;/)?.[1];
  assert.ok(script, 'BOOT_SKIP_SCRIPT is defined');
  assert.match(script, /entry.*===.*convergence/);
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /catch\(e\)\{d\.dataset\.aoBoot='skip';\}/);
  assert.match(script, /addEventListener\('keydown'/);
  assert.match(script, /addEventListener\('pointerdown'/);
  // It ships alongside MOTION_TIER_SCRIPT, inside the head's `view === 'desktop'` branch only.
  const anchor = layout.indexOf("The desktop's apps animate by the same tiers");
  assert.ok(anchor > -1, 'the desktop script branch in <head>');
  const desktopBranch = layout.slice(anchor, layout.indexOf('</head>'));
  assert.match(desktopBranch, /BOOT_SKIP_SCRIPT/);
  assert.doesNotMatch(layout.slice(0, anchor), /<script[^>]*BOOT_SKIP_SCRIPT/, 'never wired before the desktop branch (e.g. for the journey view)');
});

test('globals.css: the boot overlay is pure-CSS hidden under reduced motion and by the skip attribute, and uses the z-index scale', () => {
  const css = read('src/styles/globals.css');
  assert.match(css, /--ao-z-boot: 600;/);
  assert.match(css, /\.ao-boot \{[\s\S]*?z-index: var\(--ao-z-boot\);/);
  assert.match(css, /html\[data-ao-boot='skip'\] \.ao-boot \{\n {2}display: none;\n\}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\n {2}\.ao-boot \{\n {4}display: none;\n {2}\}\n\}/);
});
