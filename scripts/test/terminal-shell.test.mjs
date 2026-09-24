// The Terminal's shell, run as it is: node strips the TypeScript types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  HIDDEN_COMMANDS,
  HOME,
  complete,
  displayPath,
  initialShell,
  resolvePath,
  runCommand,
  showCandidates,
} from '../../src/components/apps/terminal/shell.ts';

const run = (...commands) => commands.reduce((state, command) => runCommand(state, command), initialShell());
/** The lines the last command printed, without its echo. */
const printed = (state) => {
  const lines = state.lines;
  let start = lines.length - 1;
  while (start >= 0 && lines[start].kind !== 'input') start -= 1;
  return lines.slice(start + 1);
};
const texts = (state) => printed(state).map((line) => line.text);

test('starts in the home directory with the welcome message', () => {
  const state = initialShell();
  assert.equal(state.cwd, HOME);
  assert.deepEqual(state.lines.map((line) => line.kind), ['message']);
  assert.equal(displayPath(HOME), '~');
  assert.equal(displayPath(`${HOME}/projects`), '~/projects');
  assert.equal(displayPath('/etc'), '/etc');
});

test('resolves paths like a shell', () => {
  assert.equal(resolvePath('/home/ahmadreza', '..'), '/home');
  assert.equal(resolvePath('/etc', '~/projects'), `${HOME}/projects`);
  assert.equal(resolvePath('/', 'home/./ahmadreza/../ahmadreza'), HOME);
  assert.equal(resolvePath('/etc', '/'), '/');
  assert.equal(resolvePath('/', '../..'), '/');
});

test('ls hides dot files unless -a', () => {
  const plain = printed(run('ls'))[0];
  assert.equal(plain.kind, 'list');
  const names = plain.entries.map((entry) => entry.name);
  assert.deepEqual(names, ['README.md', 'contact.txt', 'cv.txt', 'projects', 'skills.txt']);
  assert.equal(plain.entries.find((entry) => entry.name === 'projects').dir, true);

  const all = printed(run('ls -a'))[0].entries.map((entry) => entry.name);
  assert.deepEqual(all.slice(0, 3), ['.', '..', '.bash_history']);
});

test('ls fails for the real reasons', () => {
  assert.deepEqual(texts(run('ls nowhere')), ["ls: cannot access 'nowhere': No such file or directory"]);
  assert.deepEqual(texts(run('ls -l')), ["ls: invalid option -- 'l'"]);
  assert.deepEqual(texts(run('ls README.md')), ['README.md']);
});

test('cd moves, and fails like bash', () => {
  assert.equal(run('cd projects').cwd, `${HOME}/projects`);
  assert.equal(run('cd projects', 'cd ..').cwd, HOME);
  assert.equal(run('cd /etc', 'cd').cwd, HOME);
  assert.equal(run('cd /', 'cd ~/projects').cwd, `${HOME}/projects`);
  assert.deepEqual(texts(run('pwd')), [HOME]);
  assert.deepEqual(texts(run('cd nowhere')), ['bash: cd: nowhere: No such file or directory']);
  assert.deepEqual(texts(run('cd README.md')), ['bash: cd: README.md: Not a directory']);
  assert.deepEqual(texts(run('cd a b')), ['bash: cd: too many arguments']);
  assert.equal(run('cd nowhere').cwd, HOME, 'a failed cd stays put');
});

test('cat prints files, and fails like cat', () => {
  assert.deepEqual(texts(run('cat /etc/hostname')), ['amonel']);
  assert.deepEqual(printed(run('cat README.md')).map((line) => [line.kind, line.section]), [['section', 'about']]);
  assert.deepEqual(texts(run('cat nope.txt')), ['cat: nope.txt: No such file or directory']);
  assert.deepEqual(texts(run('cat projects')), ['cat: projects: Is a directory']);
  assert.deepEqual(texts(run('cat')), ['cat: missing file operand']);
  assert.equal(printed(run('cat .bash_history')).length, 4);
});

test('an unknown command fails the way bash does', () => {
  const lines = printed(run('foo --bar'));
  assert.equal(lines[0].text, 'bash: foo: command not found');
  assert.equal(lines[0].tone, 'error');
});

test('the small commands', () => {
  assert.deepEqual(texts(run('whoami')), ['guest']);
  assert.deepEqual(texts(run('echo hello   world')), ['hello world']);
  assert.deepEqual(texts(run('uname')), ['Amonel']);
  assert.match(texts(run('sudo ls'))[0], /is not in the sudoers file/);
  assert.equal(run('exit').exited, true);
  assert.equal(run('help', 'clear').lines.length, 0);
  assert.equal(printed(run('help'))[0].kind, 'help');
});

test('history counts every non-empty command', () => {
  const state = run('ls', '', 'pwd', 'history');
  assert.deepEqual(state.history, ['ls', 'pwd', 'history']);
  assert.deepEqual(texts(state), ['    1  ls', '    2  pwd', '    3  history']);
});

test('the portfolio commands print their sections', () => {
  for (const command of ['about', 'skills', 'projects', 'cv', 'contact']) {
    const [line] = printed(run(command));
    assert.equal(line.kind, 'section');
    assert.equal(line.section, command);
  }
});

test('Tab completes commands', () => {
  const state = initialShell();
  assert.deepEqual(complete(state, 'ab'), { input: 'about ', candidates: [] });
  assert.deepEqual(complete(state, 'cl'), { input: 'clear ', candidates: [] });
  assert.deepEqual(complete(state, 'h'), { input: 'h', candidates: ['help', 'history'] });
  assert.deepEqual(complete(state, 'c').candidates, ['cat', 'cd', 'clear', 'contact', 'cv']);
  assert.deepEqual(complete(state, 'zz'), { input: 'zz', candidates: [] });
});

test('Tab completes paths', () => {
  const state = initialShell();
  assert.deepEqual(complete(state, 'cd pro'), { input: 'cd projects/', candidates: [] });
  assert.deepEqual(complete(state, 'cd '), { input: 'cd projects/', candidates: [] }, 'cd only offers directories');
  assert.deepEqual(complete(state, 'cat R'), { input: 'cat README.md ', candidates: [] });
  assert.deepEqual(complete(state, 'cat .b'), { input: 'cat .bash_history ', candidates: [] });
  assert.deepEqual(complete(state, 'cat ~/projects/a'), { input: 'cat ~/projects/amonel.md ', candidates: [] });
  assert.deepEqual(complete(state, 'cat /etc/'), { input: 'cat /etc/', candidates: ['hostname', 'motd', 'os-release'] });
  assert.deepEqual(complete(state, 'cat c'), { input: 'cat c', candidates: ['contact.txt', 'cv.txt'] });
  assert.deepEqual(complete(state, 'cat nowhere/x'), { input: 'cat nowhere/x', candidates: [] });
});

test('ambiguous completions are listed under the input', () => {
  const state = showCandidates(initialShell(), 'cat /etc/', ['hostname', 'motd']);
  const [echo, list] = state.lines.slice(-2);
  assert.equal(echo.text, 'cat /etc/');
  assert.deepEqual(list.entries.map((entry) => entry.name), ['hostname', 'motd']);
});

test('scrollback is bounded', () => {
  let state = initialShell();
  for (let i = 0; i < 300; i++) state = runCommand(state, 'pwd');
  assert.ok(state.lines.length <= 400);
  const ids = state.lines.map((line) => line.id);
  assert.equal(new Set(ids).size, ids.length, 'line ids stay unique');
});

test('hidden commands (APP-08): answered, never listed by help or offered by Tab, every word in the copy', async () => {
  const { readFileSync } = await import('node:fs');
  const copy = Object.fromEntries(['de', 'en', 'fa'].map((locale) => [locale, JSON.parse(readFileSync(new URL(`../../src/messages/apps/terminal/${locale}.json`, import.meta.url), 'utf8'))]));
  const get = (object, path) => path.split('.').reduce((node, key) => node?.[key], object);
  assert.ok(HIDDEN_COMMANDS.size >= 9);
  for (const name of HIDDEN_COMMANDS.keys()) {
    const lines = printed(run(name));
    assert.ok(lines.length > 0, name);
    assert.ok(!lines.some((line) => /command not found/.test(JSON.stringify(line))), name);
    for (const line of lines.filter((entry) => entry.kind === 'message')) {
      for (const locale of ['de', 'en', 'fa']) assert.equal(typeof get(copy[locale], line.key), 'string', `${locale} ${line.key}`);
    }
    // Tab completes nothing hidden: the visitor has to find them.
    assert.equal(complete(initialShell(), name).input, name, name);
  }
  // Every fortune exists in every language.
  for (let index = 0; index < 7; index++) for (const locale of ['de', 'en', 'fa']) assert.ok(copy[locale].eggs.fortune[index], `${locale} fortune ${index}`);
  assert.match(JSON.stringify(printed(run('rm -rf /'))), /eggs\.rm/);
  assert.match(JSON.stringify(printed(run('rm notes.txt'))), /Read-only file system/);
  assert.match(JSON.stringify(printed(run('uptime'))), new RegExp(`up ${new Date().getFullYear() - 1946} years`));
  const state = run('nosuchcommand');
  assert.match(JSON.stringify(state.lines.at(-2)), /command not found/);
});
