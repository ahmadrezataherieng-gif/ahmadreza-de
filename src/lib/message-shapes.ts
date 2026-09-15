/**
 * Typed readers for structured message values.
 *
 * Some era copy is genuinely list-shaped - printed lines, statistics, a DOS
 * directory listing - and that structure belongs in `messages/` with the rest of
 * the content rather than hardcoded in a component. next-intl exposes those via
 * `t.raw()`, which is untyped, so every call site funnels through a guard here
 * instead of casting. Missing or malformed content degrades to an empty list
 * rather than crashing the page.
 */

export interface StatItem {
  value: string;
  label: string;
}

export interface DirRow {
  name: string;
  ext: string;
  size: string;
  date: string;
  time: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasStrings(value: unknown, keys: readonly string[]): boolean {
  return isRecord(value) && keys.every((key) => typeof value[key] === 'string');
}

export function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function asStatList(value: unknown): StatItem[] {
  return Array.isArray(value)
    ? value.filter((item): item is StatItem => hasStrings(item, ['value', 'label']))
    : [];
}

export function asDirRows(value: unknown): DirRow[] {
  return Array.isArray(value)
    ? value.filter((item): item is DirRow =>
        hasStrings(item, ['name', 'ext', 'size', 'date', 'time']),
      )
    : [];
}
