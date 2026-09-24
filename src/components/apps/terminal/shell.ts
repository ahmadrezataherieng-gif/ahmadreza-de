/**
 * The Terminal's shell: a small in-memory filesystem and the commands that
 * work on it.
 *
 * Pure functions, no React, no imports at runtime - so `node --test` runs it
 * as it is (`scripts/test/terminal-shell.test.mjs`). Output is data: machine
 * text as strings (English in every locale, as a real shell prints it), and
 * prose as a reference the component renders from the visitor's messages.
 *
 * It behaves like bash with GNU tools where it can: the same error messages,
 * `~` for home, hidden dot files behind `ls -a`, Tab completion that completes
 * what is unique and lists the rest.
 */

/** Sections the component renders from content data and messages. */
export type PortfolioSection = 'about' | 'skills' | 'projects' | 'cv' | 'contact';

export type FileContent =
  | { kind: 'text'; lines: readonly string[] }
  /** Localized prose under `terminal.files.<key>`. */
  | { kind: 'message'; key: string }
  /** The same as running the portfolio command. */
  | { kind: 'section'; section: PortfolioSection };

type Node = { kind: 'dir'; children: Readonly<Record<string, Node>> } | { kind: 'file'; content: FileContent };

const dir = (children: Record<string, Node>): Node => ({ kind: 'dir', children });
const text = (...lines: string[]): Node => ({ kind: 'file', content: { kind: 'text', lines } });
const section = (name: PortfolioSection): Node => ({ kind: 'file', content: { kind: 'section', section: name } });

// CONTENT-TODO CR-506
export const USER = 'guest';
export const HOST = 'amonel';
/** The guest's home is Ahmadreza's directory: that is where the visitor came to look. */
export const HOME = '/home/ahmadreza';

// CONTENT-TODO CR-507
const ROOT: Node = dir({
  etc: dir({
    hostname: text(HOST),
    motd: { kind: 'file', content: { kind: 'message', key: 'motd' } },
    'os-release': text('NAME="Amonel OS"', 'PRETTY_NAME="Amonel OS"', 'ID=amonel', 'HOME_URL="https://ahmadreza.de/"'),
  }),
  home: dir({
    ahmadreza: dir({
      'README.md': section('about'),
      'skills.txt': section('skills'),
      'contact.txt': section('contact'),
      'cv.txt': section('cv'),
      projects: dir({ 'amonel.md': section('projects') }),
      '.bash_history': text('cd ~/projects', 'npm run build', 'traceroute ahmadreza.de', 'cat ~/skills.txt'),
    }),
  }),
  tmp: dir({}),
});

export const PORTFOLIO_COMMANDS: readonly PortfolioSection[] = ['about', 'skills', 'projects', 'cv', 'contact'];
export const SHELL_COMMANDS = ['ask', 'cat', 'cd', 'clear', 'echo', 'exit', 'help', 'history', 'ls', 'pwd', 'sudo', 'uname', 'whoami'] as const;
const COMMANDS: readonly string[] = [...PORTFOLIO_COMMANDS, ...SHELL_COMMANDS].sort();

export type ShellLine =
  | { kind: 'input'; cwd: string; text: string }
  | { kind: 'text'; text: string; tone?: 'error' | 'muted' }
  | { kind: 'list'; entries: readonly { name: string; dir: boolean }[] }
  | { kind: 'message'; key: string }
  | { kind: 'section'; section: PortfolioSection }
  | { kind: 'help' };

/**
 * Hidden commands: answered like any other, but never listed by `help` and
 * never offered by Tab. The entry point for Phase 9D-3's easter eggs - empty
 * until then. A command here gets the arguments and the state and returns the
 * lines to print; machine text only, or message keys (`{ kind: 'message' }`).
 */
export type HiddenCommand = (args: readonly string[], state: ShellState) => ShellLine[];

/** Own drawings, machine text: the 1947 moth and a small Amonel train. */
const MOTH = ['     .--.   .--.', "    (    \\ /    )", "     '.   V   .'", "       '-(*)-'", "      .-'/ \\'-.", "     (  /   \\  )", "      '-'   '-'"];
const TRAIN = ['   ____________    ________', '  |   AMONEL   |__|   []   |__', "  |____________|  |________|  |)", '    (O)    (O)      (O)  (O)'];
/** The first era's year: `uptime` counts from ENIAC. */
const ENIAC_YEAR = 1946;
const FORTUNES = 7;

const say = (text: string, tone?: 'error' | 'muted'): ShellLine => ({ kind: 'text', text, ...(tone ? { tone } : {}) });
const message = (key: string): ShellLine => ({ kind: 'message', key });

// CONTENT-TODO CR-508, CR-1078 (the words are in messages/apps/terminal/ under `eggs`)
export const HIDDEN_COMMANDS: ReadonlyMap<string, HiddenCommand> = new Map<string, HiddenCommand>([
  ['moth', () => [...MOTH.map((line) => say(line)), message('eggs.moth')]],
  ['sl', () => [...TRAIN.map((line) => say(line)), message('eggs.sl')]],
  ['coffee', () => [say("HTTP/1.1 418 I'm a teapot", 'error'), message('eggs.coffee')]],
  ['rm', (args) => (args.some((arg) => /^-[a-z]*r[a-z]*f|^-[a-z]*f[a-z]*r/.test(arg)) ? [message('eggs.rm')] : [say('rm: cannot remove: Read-only file system', 'error')])],
  ['vim', () => [message('eggs.editor')]],
  ['vi', () => [message('eggs.editor')]],
  ['nano', () => [message('eggs.editor')]],
  ['emacs', () => [message('eggs.editor')]],
  ['hire', () => [message('eggs.hire')]],
  ['fortune', (_args, state) => [message(`eggs.fortune.${state.history.length % FORTUNES}`)]],
  ['uptime', () => [say(` up ${new Date().getFullYear() - ENIAC_YEAR} years, 7 eras, 1 user, load average: 0.19, 0.46, 0.71`), message('eggs.uptime')]],
  ['ping', () => [message('eggs.ping')]],
]);

export interface ShellState {
  cwd: string;
  lines: readonly (ShellLine & { id: number })[];
  history: readonly string[];
  nextId: number;
  /** Set by `exit`: the component closes the window. */
  exited: boolean;
  /** Set by `ask`: the question the component hands to the Assistant, then clears (APP-13). */
  asked: string | null;
}

/** Enough scrollback to read; old lines drop off like a real terminal's buffer. */
const MAX_LINES = 400;

export function initialShell(): ShellState {
  return { cwd: HOME, lines: [{ id: 0, kind: 'message', key: 'motd' }], history: [], nextId: 1, exited: false, asked: null };
}

/** The prompt's path: home shows as `~`, like bash. */
export function displayPath(cwd: string): string {
  if (cwd === HOME) return '~';
  if (cwd.startsWith(`${HOME}/`)) return `~${cwd.slice(HOME.length)}`;
  return cwd;
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

export interface DirEntry {
  name: string;
  dir: boolean;
}

/**
 * A directory's entries as `ls` would list them - directories first, then files,
 * each group by name, dot files included (the caller decides whether to hide
 * them) - or null when the path is not a directory. Read-only: the File tree
 * app draws the Terminal's own tree from it (APP-07), so the two never differ.
 */
export function readDir(absolute: string): DirEntry[] | null {
  const node = lookup(absolute);
  if (!node || node.kind !== 'dir') return null;
  return Object.entries(node.children)
    .map(([name, child]) => ({ name, dir: child.kind === 'dir' }))
    .sort((a, b) => Number(b.dir) - Number(a.dir) || a.name.localeCompare(b.name));
}

/** What `cat` would print for a file, or null when the path is not a file. */
export function readFile(absolute: string): FileContent | null {
  const node = lookup(absolute);
  return node && node.kind === 'file' ? node.content : null;
}

function fileLines(content: FileContent): ShellLine[] {
  switch (content.kind) {
    case 'text':
      return content.lines.map((line) => ({ kind: 'text', text: line }));
    case 'message':
      return [{ kind: 'message', key: content.key }];
    case 'section':
      return [{ kind: 'section', section: content.section }];
  }
}

function append(state: ShellState, lines: ShellLine[]): ShellState {
  let id = state.nextId;
  const added = lines.map((line) => ({ ...line, id: id++ }));
  return { ...state, lines: [...state.lines, ...added].slice(-MAX_LINES), nextId: id };
}

/** Run one input line. Everything a visitor can type goes through here. */
export function runCommand(state: ShellState, input: string): ShellState {
  const line = input.trim();
  const echo: ShellLine = { kind: 'input', cwd: state.cwd, text: line };
  const history = line === '' ? state.history : [...state.history, line].slice(-100);
  const [command = '', ...args] = line.split(/\s+/);
  const out = (...lines: ShellLine[]): ShellState => append({ ...state, history }, [echo, ...lines]);
  const error = (message: string): ShellLine => ({ kind: 'text', text: message, tone: 'error' });

  if ((PORTFOLIO_COMMANDS as readonly string[]).includes(command)) {
    return out({ kind: 'section', section: command as PortfolioSection });
  }

  switch (command) {
    case '':
      return out();

    case 'clear':
      return { ...state, history, lines: [] };

    case 'help':
      return out({ kind: 'help' });

    case 'pwd':
      return out({ kind: 'text', text: state.cwd });

    case 'whoami':
      return out({ kind: 'text', text: USER });

    case 'uname':
      return out({ kind: 'text', text: args.includes('-a') ? `Amonel ${HOST} 7.0 web browser` : 'Amonel' });

    case 'echo':
      return out({ kind: 'text', text: args.join(' ') });

    case 'history':
      return out(...history.map((entry, index): ShellLine => ({ kind: 'text', text: `${String(index + 1).padStart(5)}  ${entry}` })));

    case 'sudo':
      return out(error(`${USER} is not in the sudoers file.  This incident will be reported.`));

    case 'ask':
      // The Terminal cannot search the site itself: it hands the words to the Assistant, whose local search answers (APP-13).
      if (args.length === 0) return out(message('ask.usage'));
      return { ...out(message('ask.handoff')), asked: args.join(' ') };

    case 'exit':
      return { ...out(), exited: true };

    case 'ls': {
      const flags = args.filter((arg) => arg.startsWith('-') && arg !== '-');
      const paths = args.filter((arg) => !arg.startsWith('-') || arg === '-');
      for (const flag of flags) {
        const bad = [...flag.slice(1)].find((letter) => letter !== 'a');
        if (bad !== undefined) return out(error(`ls: invalid option -- '${bad}'`));
      }
      const all = flags.length > 0;
      const targets = paths.length > 0 ? paths : ['.'];
      const lines: ShellLine[] = [];
      for (const path of targets) {
        const node = lookup(resolvePath(state.cwd, path));
        if (!node) {
          lines.push(error(`ls: cannot access '${path}': No such file or directory`));
          continue;
        }
        if (node.kind === 'file') {
          lines.push({ kind: 'text', text: path });
          continue;
        }
        if (targets.length > 1) lines.push({ kind: 'text', text: `${path}:` });
        const names = Object.keys(node.children)
          .filter((name) => all || !name.startsWith('.'))
          .sort();
        lines.push({
          kind: 'list',
          entries: [
            ...(all ? [{ name: '.', dir: true }, { name: '..', dir: true }] : []),
            ...names.map((name) => ({ name, dir: node.children[name]?.kind === 'dir' })),
          ],
        });
      }
      return out(...lines);
    }

    case 'cd': {
      if (args.length > 1) return out(error('bash: cd: too many arguments'));
      const path = args[0] ?? '~';
      const absolute = resolvePath(state.cwd, path);
      const node = lookup(absolute);
      if (!node) return out(error(`bash: cd: ${path}: No such file or directory`));
      if (node.kind !== 'dir') return out(error(`bash: cd: ${path}: Not a directory`));
      return { ...out(), cwd: absolute };
    }

    case 'cat': {
      if (args.length === 0) return out(error('cat: missing file operand'));
      const lines: ShellLine[] = [];
      for (const path of args) {
        const node = lookup(resolvePath(state.cwd, path));
        if (!node) lines.push(error(`cat: ${path}: No such file or directory`));
        else if (node.kind === 'dir') lines.push(error(`cat: ${path}: Is a directory`));
        else lines.push(...fileLines(node.content));
      }
      return out(...lines);
    }

    default: {
      const hidden = HIDDEN_COMMANDS.get(command);
      if (hidden) return out(...hidden(args, state));
      return out(error(`bash: ${command}: command not found`), { kind: 'text', text: "Type 'help' to see what this shell can do.", tone: 'muted' });
    }
  }
}

export interface Completion {
  /** The input after completion. */
  input: string;
  /** Printed when the completion is ambiguous and nothing more is shared. */
  candidates: readonly string[];
}

function commonPrefix(words: readonly string[]): string {
  if (words.length === 0) return '';
  let prefix = words[0] ?? '';
  for (const word of words) {
    while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/**
 * Tab completion at the end of the input. The first word completes against the
 * commands, later words against the filesystem (directories only after `cd`).
 * A unique match is completed - a directory with `/`, anything else with a
 * space - several matches extend to what they share, and when they share
 * nothing more, the candidates are returned to be listed.
 */
export function complete(state: ShellState, input: string): Completion {
  const words = input.split(' ');
  const current = words[words.length - 1] ?? '';
  const before = words.slice(0, -1).join(' ');
  const join = (word: string) => (before === '' ? word : `${before} ${word}`);

  if (words.length === 1) {
    const matches = COMMANDS.filter((name) => name.startsWith(current));
    if (matches.length === 1) return { input: `${matches[0]} `, candidates: [] };
    const shared = commonPrefix(matches);
    return shared.length > current.length ? { input: shared, candidates: [] } : { input, candidates: matches };
  }

  const slash = current.lastIndexOf('/');
  const dirPart = slash >= 0 ? current.slice(0, slash + 1) : '';
  const prefix = slash >= 0 ? current.slice(slash + 1) : current;
  const parent = lookup(resolvePath(state.cwd, dirPart === '' ? '.' : dirPart));
  if (!parent || parent.kind !== 'dir') return { input, candidates: [] };

  const onlyDirs = words[0] === 'cd';
  const matches = Object.entries(parent.children)
    .filter(([name]) => name.startsWith(prefix) && (prefix.startsWith('.') || !name.startsWith('.')))
    .filter(([, node]) => !onlyDirs || node.kind === 'dir')
    .map(([name, node]) => (node.kind === 'dir' ? `${name}/` : name))
    .sort();

  if (matches.length === 1) {
    const match = matches[0] ?? '';
    return { input: join(`${dirPart}${match}${match.endsWith('/') ? '' : ' '}`), candidates: [] };
  }
  const shared = commonPrefix(matches);
  return shared.length > prefix.length ? { input: join(`${dirPart}${shared}`), candidates: [] } : { input, candidates: matches };
}

/** Print what an ambiguous Tab offered, as bash does, under the input as typed. */
export function showCandidates(state: ShellState, input: string, candidates: readonly string[]): ShellState {
  return append(state, [
    { kind: 'input', cwd: state.cwd, text: input },
    { kind: 'list', entries: candidates.map((name) => ({ name: name.replace(/\/$/, ''), dir: name.endsWith('/') })) },
  ]);
}

/** `^C`: abandon the line, as a terminal does. */
export function cancelLine(state: ShellState, input: string): ShellState {
  return append(state, [{ kind: 'input', cwd: state.cwd, text: `${input}^C` }]);
}

export function clearScreen(state: ShellState): ShellState {
  return { ...state, lines: [] };
}
