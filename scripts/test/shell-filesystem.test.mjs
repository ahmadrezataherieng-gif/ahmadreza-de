// The 1971 puzzle's filesystem, run directly with Node's TypeScript stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { HOME, SECRET_PATH, initialShell, runCommand } from '../../src/components/puzzles/shell-filesystem.ts';

const run = (input) => runCommand({ ...initialShell(), cwd: HOME }, input);

for (const name of ['__proto__', 'constructor', 'toString']) {
  test(`prototype name ${name} behaves like a missing path in the puzzle filesystem`, () => {
    for (const path of [name, `/${name}`, `projects/${name}`, `projects/${name}/network.txt`, `/home/${name}/ahmadreza`]) {
      for (const [command, key] of [['ls', 'lsNoFile'], ['cat', 'noFile'], ['cd', 'noDir'], ['chdir', 'noDir']]) {
        const state = run(`${command} ${path}`);
        assert.deepEqual(state.lines.at(-1), { kind: 'error', key, values: { path } }, `${command} ${path}`);
        assert.equal(state.cwd, HOME, 'a missing path does not change the directory');
        assert.equal(state.found, false);
        assert.equal(state.usedChdir, false);
      }
    }
  });
}

test('ordinary existing and missing puzzle paths retain their behavior', () => {
  assert.deepEqual(run('ls projects').lines.at(-1), { kind: 'list', entries: [{ name: 'network.txt', dir: false }] });
  assert.deepEqual(run('cat notes.txt').lines.at(-1), { kind: 'file', content: 'notes' });
  assert.deepEqual(run('cat projects/network.txt').lines.at(-1), { kind: 'file', content: 'network' });
  assert.equal(run('cd projects').cwd, `${HOME}/projects`);
  assert.equal(run('chdir projects').usedChdir, true);
  assert.equal(run(`cat ${SECRET_PATH}`).found, true);
  for (const [command, key] of [['ls', 'lsNoFile'], ['cat', 'noFile'], ['cd', 'noDir'], ['chdir', 'noDir']]) {
    const state = run(`${command} nowhere`);
    assert.deepEqual(state.lines.at(-1), { kind: 'error', key, values: { path: 'nowhere' } });
    assert.equal(state.cwd, HOME);
    assert.equal(state.found, false);
    assert.equal(state.usedChdir, false);
  }
});
