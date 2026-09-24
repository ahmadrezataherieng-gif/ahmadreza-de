/**
 * What the File tree app needs to know about paths (APP-07): the steps from the
 * root to a node, its entries with dot files hidden or shown, and the Terminal
 * commands that reach it. Pure, with one runtime import (the Terminal's own
 * tree and path rules), so `node --test` runs it as it is
 * (`scripts/test/filesystem.test.mjs`).
 */

import { HOME, displayPath, readDir, readFile, type DirEntry, type FileContent } from '../terminal/shell.ts';

export { HOME, displayPath, readFile, type FileContent };

export interface Step {
  /** `/` for the root, else the directory's or file's own name. */
  name: string;
  /** The absolute path up to and including this step. */
  path: string;
}

/** The steps from the root down to `absolute`: `/home/ahmadreza` is `/`, `home`, `ahmadreza`. */
export function steps(absolute: string): Step[] {
  const parts = absolute.split('/').filter(Boolean);
  const result: Step[] = [{ name: '/', path: '/' }];
  parts.forEach((name, index) => result.push({ name, path: `/${parts.slice(0, index + 1).join('/')}` }));
  return result;
}

export function joinPath(parent: string, name: string): string {
  return parent === '/' ? `/${name}` : `${parent}/${name}`;
}

export const isHidden = (name: string): boolean => name.startsWith('.');

/** A directory's entries, the way `ls` (dot files hidden) or `ls -a` (shown) lists them. */
export function entries(absolute: string, showHidden: boolean): DirEntry[] | null {
  const all = readDir(absolute);
  return all ? all.filter((entry) => showHidden || !isHidden(entry.name)) : null;
}

/** Directories open when the app starts: the way down to the visitor's home. */
export const DEFAULT_OPEN: readonly string[] = steps(HOME).map((step) => step.path);

export interface Reach {
  kind: 'dir' | 'file';
  /** What to type in the Terminal to get there or to read it. Machine text. */
  commands: string[];
  /** The path in the short form with `~` the prompt shows, or the same path. */
  short: string;
}

/**
 * The Terminal commands for a path: `cd` and `ls` for a directory (with `-a`
 * when it holds hidden files), `cat` for a file. The root of the tree has no
 * command of its own beyond `cd /`.
 */
export function reach(absolute: string): Reach | null {
  const listing = readDir(absolute);
  if (listing) {
    const hidden = listing.some((entry) => isHidden(entry.name));
    return { kind: 'dir', commands: [`cd ${absolute}`, hidden ? 'ls -a' : 'ls'], short: displayPath(absolute) };
  }
  if (readFile(absolute)) return { kind: 'file', commands: [`cat ${absolute}`], short: displayPath(absolute) };
  return null;
}
