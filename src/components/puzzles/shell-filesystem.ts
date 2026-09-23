/**
 * A tiny UNIX filesystem and the four commands the 1971 puzzle needs.
 *
 * Pure functions, no React: the same `runCommand` serves the visitor's typing
 * and guided playback's scripted typing. Output is data - message keys or raw
 * machine text - so it can be rendered in any locale.
 */

type FileKey = 'motd' | 'notes' | 'network' | 'secret';

type Node = { kind: 'dir'; children: Record<string, Node> } | { kind: 'file'; content: FileKey };

const dir = (children: Record<string, Node>): Node => ({ kind: 'dir', children });
const file = (content: FileKey): Node => ({ kind: 'file', content });

// CONTENT-TODO CR-169
const ROOT: Node = dir({
  bin: dir({}),
  etc: dir({ motd: file('motd') }),
  home: dir({
    ahmadreza: dir({
      'notes.txt': file('notes'),
      projects: dir({
        'network.txt': file('network'),
        '.secret': file('secret'),
      }),
    }),
  }),
  usr: dir({}),
});

export const HOME = '/home/ahmadreza';
export const SECRET_PATH = '/home/ahmadreza/projects/.secret';

export type ShellLine =
  | { kind: 'input'; cwd: string; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'list'; entries: { name: string; dir: boolean }[] }
  | { kind: 'file'; content: FileKey }
  | { kind: 'help' }
  | { kind: 'error'; key: ShellError; values: Record<string, string> };

export type ShellError = 'noDir' | 'notDir' | 'noFile' | 'isDir' | 'lsNoFile' | 'unknown';

export interface ShellState {
  cwd: string;
  lines: ShellLine[];
  found: boolean;
  /** The Sixth Edition name for cd was used: the era's insider trick. */
  usedChdir: boolean;
}

export function initialShell(): ShellState {
  return { cwd: '/', lines: [{ kind: 'file', content: 'motd' }], found: false, usedChdir: false };
}

/** Resolve `path` against `cwd` into a normalised absolute path. */
export function resolvePath(cwd: string, path: string): string {
  let raw = path;
  if (raw === '~') raw = HOME;
  else if (raw.startsWith('~/')) raw = `${HOME}/${raw.slice(2)}`;

  const parts = raw.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
  for (const part of raw.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return `/${parts.join('/')}`;
}

function lookup(absolute: string): Node | null {
  let node: Node = ROOT;
  for (const part of absolute.split('/').filter(Boolean)) {
    if (node.kind !== 'dir') return null;
    const child: Node | undefined = node.children[part];
    if (!child) return null;
    node = child;
  }
  return node;
}

export function runCommand(state: ShellState, input: string): ShellState {
  const text = input.trim();
  const echo: ShellLine = { kind: 'input', cwd: state.cwd, text };
  const [command = '', ...args] = text.split(/\s+/);
  const out = (...lines: ShellLine[]): ShellState => ({ ...state, lines: [...state.lines, echo, ...lines] });
  const error = (key: ShellError, values: Record<string, string>) => out({ kind: 'error', key, values });

  switch (command) {
    case '':
      return out();

    case 'clear':
      return { ...state, lines: [] };

    case 'help':
      return out({ kind: 'help' });

    case 'pwd':
      return out({ kind: 'text', text: state.cwd });

    case 'ls': {
      const flags = args.filter((arg) => arg.startsWith('-'));
      const paths = args.filter((arg) => !arg.startsWith('-'));
      const all = flags.some((flag) => flag.includes('a'));
      const path = paths[0] ?? '.';
      const node = lookup(resolvePath(state.cwd, path));
      if (!node) return error('lsNoFile', { path });
      if (node.kind === 'file') return out({ kind: 'text', text: path });
      const names = Object.keys(node.children)
        .filter((name) => all || !name.startsWith('.'))
        .sort();
      const entries = [
        ...(all ? [{ name: '.', dir: true }, { name: '..', dir: true }] : []),
        ...names.map((name) => ({ name, dir: node.children[name]?.kind === 'dir' })),
      ];
      return out({ kind: 'list', entries });
    }

    // The 1971 name (see the era's insider detail); cd arrived with V7 in 1979.
    case 'chdir':
    case 'cd': {
      const path = args[0] ?? '~';
      const absolute = resolvePath(state.cwd, path);
      const node = lookup(absolute);
      if (!node) return error('noDir', { path });
      if (node.kind !== 'dir') return error('notDir', { path });
      return { ...out(), cwd: absolute, usedChdir: state.usedChdir || command === 'chdir' };
    }

    case 'cat': {
      const path = args[0];
      if (path === undefined) return out();
      const absolute = resolvePath(state.cwd, path);
      const node = lookup(absolute);
      if (!node) return error('noFile', { path });
      if (node.kind === 'dir') return error('isDir', { path });
      return { ...out({ kind: 'file', content: node.content }), found: state.found || absolute === SECRET_PATH };
    }

    default:
      return error('unknown', { command });
  }
}
