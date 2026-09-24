// The file tree's path helpers and the Terminal tree they read, run as they are:
// node strips the TypeScript types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { EMPLOYER } from './employer-name.mjs';
import { DEFAULT_OPEN, HOME, entries, isHidden, joinPath, reach, readFile, steps } from '../../src/components/apps/filesystem/paths.ts';
import { initialShell, readDir, runCommand } from '../../src/components/apps/terminal/shell.ts';

const names = (list) => list?.map((entry) => (entry.dir ? `${entry.name}/` : entry.name));

test('steps: every path is a walk from the root, one folder at a time', () => {
  assert.deepEqual(steps('/'), [{ name: '/', path: '/' }]);
  assert.deepEqual(steps('/home/ahmadreza/projects'), [
    { name: '/', path: '/' },
    { name: 'home', path: '/home' },
    { name: 'ahmadreza', path: '/home/ahmadreza' },
    { name: 'projects', path: '/home/ahmadreza/projects' },
  ]);
  assert.equal(joinPath('/', 'etc'), '/etc');
  assert.equal(joinPath('/etc', 'motd'), '/etc/motd');
  assert.deepEqual(DEFAULT_OPEN, ['/', '/home', HOME], 'the way down to home starts open');
});

test('entries: folders first, then files by name; dot files only when asked for', () => {
  assert.deepEqual(names(entries('/', false)), ['etc/', 'home/', 'tmp/']);
  assert.deepEqual(names(entries(HOME, false)), ['projects/', 'README.md', 'contact.txt', 'cv.txt', 'skills.txt'].sort((a, b) => Number(b.endsWith('/')) - Number(a.endsWith('/')) || a.localeCompare(b)));
  assert.ok(names(entries(HOME, true)).includes('.bash_history'));
  assert.ok(!names(entries(HOME, false)).includes('.bash_history'));
  assert.ok(isHidden('.bash_history') && !isHidden('README.md'));
  assert.deepEqual(entries('/tmp', true), [], 'an empty folder is an empty list, not missing');
  assert.equal(entries('/etc/motd', true), null, 'a file has no entries');
  assert.equal(entries('/nowhere', true), null);
});

test('the tree is the Terminal\'s own: what ls prints is what the app lists, and cat reads what readFile returns', () => {
  const ls = runCommand(initialShell(), 'ls');
  const listed = ls.lines.at(-1).entries.map((entry) => entry.name).sort();
  assert.deepEqual(listed, entries(HOME, false).map((entry) => entry.name).sort());
  const listedAll = runCommand(initialShell(), 'ls -a').lines.at(-1).entries.map((entry) => entry.name).filter((name) => name !== '.' && name !== '..').sort();
  assert.deepEqual(listedAll, entries(HOME, true).map((entry) => entry.name).sort(), 'ls -a lists the dot files the app shows on request');
  assert.deepEqual(readFile('/etc/hostname'), { kind: 'text', lines: ['amonel'] });
  assert.equal(readFile(`${HOME}/cv.txt`).section, 'cv');
  assert.equal(readFile('/etc/motd').key, 'motd');
  assert.equal(readFile('/etc'), null, 'a folder is not a file');
  assert.equal(readDir('/etc/motd'), null);
});

test('reach: the Terminal commands that get to a path, with ls -a only where something is hidden', () => {
  assert.deepEqual(reach(HOME), { kind: 'dir', commands: [`cd ${HOME}`, 'ls -a'], short: '~' });
  assert.deepEqual(reach('/etc'), { kind: 'dir', commands: ['cd /etc', 'ls'], short: '/etc' });
  assert.deepEqual(reach(`${HOME}/projects/amonel.md`), { kind: 'file', commands: [`cat ${HOME}/projects/amonel.md`], short: '~/projects/amonel.md' });
  assert.equal(reach('/nowhere'), null);
  // The commands really work in the Terminal.
  const cd = runCommand(initialShell(), reach('/etc').commands[0]);
  assert.equal(cd.cwd, '/etc');
  const cat = runCommand(initialShell(), reach('/etc/hostname').commands[0]);
  assert.equal(cat.lines.at(-1).text, 'amonel');
});

test('the file tree copy exists in every language, in "Sie", names no employer, and the file messages exist', () => {
  const get = (object, path) => path.split('.').reduce((node, key) => node?.[key], object);
  const shape = (value, prefix = '') => (value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value).flatMap(([key, child]) => shape(child, prefix ? `${prefix}.${key}` : key)) : [prefix]);
  const load = (app, locale) => JSON.parse(readFileSync(new URL(`../../src/messages/apps/${app}/${locale}.json`, import.meta.url), 'utf8'));
  const de = load('filesystem', 'de');
  for (const locale of ['de', 'en', 'fa']) {
    const own = load('filesystem', locale);
    assert.deepEqual(shape(own).sort(), shape(de).sort(), locale);
    assert.doesNotMatch(JSON.stringify(own), EMPLOYER, locale);
    // Every message file in the tree has its words in the Terminal's copy.
    assert.equal(typeof get(load('terminal', locale), readFile('/etc/motd').key), 'string', `${locale} motd`);
  }
  // The words, not the key names: one key is called "dir".
  const words = (value) => (value && typeof value === 'object' ? Object.values(value).flatMap(words) : [String(value)]).join(' ');
  assert.doesNotMatch(words(de), /\b(du|dich|dir|dein|deine|deinen)\b/i);
  assert.doesNotMatch(JSON.stringify(load('filesystem', 'fa')), /(^|[\s«"])تو([\s»".،]|$)/);
});
