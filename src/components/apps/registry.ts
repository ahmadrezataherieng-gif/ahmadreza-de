import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

import { appIds, baseAppIds, type AppId } from '@/content/eras';
import type { AppProps } from '@/components/apps/types';

/**
 * Every app on the AhmadOS desktop.
 *
 * The shell only ever reads this table: which apps exist, how each is named
 * (`os.apps.<id>.title`), how big its window opens, and the component it runs -
 * loaded on demand, so opening one app never downloads the others. The glyph
 * lives in `icons.tsx` under the same id. Which bonus app an era's puzzle
 * unlocks is data in `content/eras.ts`, not here.
 */
export interface AppDefinition {
  id: AppId;
  /** `base` apps are always available; `bonus` apps unlock with a puzzle. */
  kind: 'base' | 'bonus';
  /** Message key under the `os` namespace. */
  titleKey: `apps.${AppId}.title`;
  /** Default window size in CSS pixels; clamped to the desktop on open. */
  size: { width: number; height: number };
  Component: LazyExoticComponent<ComponentType<AppProps>>;
}

function load<Name extends string>(
  importer: () => Promise<Record<Name, ComponentType<AppProps>>>,
  name: Name,
): LazyExoticComponent<ComponentType<AppProps>> {
  return lazy(() => importer().then((module) => ({ default: module[name] })));
}

const COMPONENTS: Record<AppId, LazyExoticComponent<ComponentType<AppProps>>> = {
  about: load(() => import('@/components/apps/about/AboutApp'), 'AboutApp'),
  terminal: load(() => import('@/components/apps/terminal/TerminalApp'), 'TerminalApp'),
  tickets: load(() => import('@/components/apps/tickets/TicketsApp'), 'TicketsApp'),
  traceroute: load(() => import('@/components/apps/traceroute/TracerouteApp'), 'TracerouteApp'),
  assistant: load(() => import('@/components/apps/assistant/AssistantApp'), 'AssistantApp'),
  contact: load(() => import('@/components/apps/contact/ContactApp'), 'ContactApp'),
  timeline: load(() => import('@/components/apps/timeline/TimelineApp'), 'TimelineApp'),
  cv: load(() => import('@/components/apps/cv/CvApp'), 'CvApp'),
  // The seven bonus apps are Phase 9; until then they share one stand-in.
  'punchcard-lab': load(() => import('@/components/apps/bonus/BonusApp'), 'BonusApp'),
  scheduler: load(() => import('@/components/apps/bonus/BonusApp'), 'BonusApp'),
  filesystem: load(() => import('@/components/apps/bonus/BonusApp'), 'BonusApp'),
  'memory-map': load(() => import('@/components/apps/bonus/BonusApp'), 'BonusApp'),
  paint: load(() => import('@/components/apps/bonus/BonusApp'), 'BonusApp'),
  dialup: load(() => import('@/components/apps/bonus/BonusApp'), 'BonusApp'),
  firewall: load(() => import('@/components/apps/bonus/BonusApp'), 'BonusApp'),
};

const SIZES: Partial<Record<AppId, AppDefinition['size']>> = {
  about: { width: 640, height: 520 },
  terminal: { width: 720, height: 460 },
  tickets: { width: 860, height: 540 },
  traceroute: { width: 640, height: 560 },
  assistant: { width: 480, height: 560 },
  timeline: { width: 760, height: 480 },
  cv: { width: 560, height: 420 },
  contact: { width: 480, height: 360 },
};

const DEFAULT_SIZE: AppDefinition['size'] = { width: 560, height: 400 };

export const apps: readonly AppDefinition[] = appIds.map((id) => ({
  id,
  kind: baseAppIds.includes(id) ? 'base' : 'bonus',
  titleKey: `apps.${id}.title`,
  size: SIZES[id] ?? DEFAULT_SIZE,
  Component: COMPONENTS[id],
}));

export function getApp(id: AppId): AppDefinition {
  const app = apps.find((candidate) => candidate.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}

/** The four apps on the mobile dock: the ones a recruiter came for. */
export const dockAppIds: readonly AppId[] = ['about', 'cv', 'contact', 'assistant'];
