'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { AssistantTeaser } from '@/components/journey/AssistantTeaser';
import { EraTitle } from '@/components/journey/eras/EraTitle';
import { asStringList } from '@/lib/message-shapes';
import { cn } from '@/lib/cn';

const cue = (on: number, off = 2): CSSProperties => ({ '--on': on, '--off': off }) as CSSProperties;

/**
 * Region nodes on a 300x112 schematic, in the same order as
 * `eras.cloud.visual.regions`: Frankfurt, Amsterdam, Virginia, Singapore.
 * Roughly where they sit west to east - a schematic, not a map. `labelDy`
 * places a label above its node where the one below would collide.
 */
const NODES = [
  { x: 166, y: 62, labelDy: 20 },
  { x: 140, y: 34, labelDy: -12 },
  { x: 44, y: 66, labelDy: 20 },
  { x: 262, y: 86, labelDy: 20 },
] as const;
/** Links between regions, as node index pairs. */
const EDGES = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
] as const;
const NODES_AT = [0.1, 0.13, 0.16, 0.19] as const;

const CONTAINERS_AT = [0.26, 0.3, 0.34, 0.44] as const;
const DEPLOY_AT = [0.36, 0.42, 0.48] as const;
const TERMINAL_AT = [0.52, 0.56, 0.6, 0.64] as const;

/**
 * A deterministic sparkline: a few summed sine waves, so the server and the
 * client draw the same line and it looks like traffic rather than noise.
 */
const SPARK = Array.from({ length: 48 }, (_, index) => {
  const x = (index / 47) * 200;
  const y =
    30 -
    Math.sin(index * 0.35) * 7 -
    Math.sin(index * 0.9 + 1.3) * 3.5 -
    Math.sin(index * 0.13 + 0.4) * 9;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');

/**
 * Today - cloud, containers, AI.
 *
 * Every earlier era showed one machine. This one shows many things running at
 * once in different places: regions exchanging traffic, containers coming up,
 * a deploy rolling through, a sparkline, a terminal - and at the end a prompt,
 * because a problem can now be described in ordinary language.
 *
 * Restraint is the design. Muted surfaces, one accent, slow ambient motion,
 * nothing that flickers or beeps next to the noisy retro eras. No real data and
 * no network calls: every panel is a function of scroll progress.
 */
export function EraCloud({ headingId }: { headingId: string }) {
  const t = useTranslations('eras.cloud');
  const regions = asStringList(t.raw('visual.regions'));
  const deploySteps = asStringList(t.raw('visual.deploySteps'));
  const terminal = asStringList(t.raw('visual.terminal'));
  const response = asStringList(t.raw('visual.response'));
  const containers = t.raw('visual.containers');
  const containerRows = Array.isArray(containers)
    ? containers.filter(
        (row): row is { name: string; replicas: string } =>
          typeof row === 'object' && row !== null && 'name' in row && 'replicas' in row,
      )
    : [];
  const prompt = t('visual.prompt');

  return (
    <div className="ao-era-exit ao-final-frame relative flex min-h-dvh w-full flex-col bg-background md:h-full">
      {/* md:pe-40: the dashboard runs to its right edge, so it needs more room
          than the other eras to stay clear of the progress rail. */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-8 px-5 pt-20 pb-14 sm:px-10 md:pe-40 md:pt-16 md:pb-8 lg:flex-row lg:items-center lg:gap-10">
        <EraTitle
          year={t('yearLabel')}
          title={t('name')}
          headingId={headingId}
          className="lg:w-[30%]"
        >
          <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-muted sm:text-base">
            {t('visual.body')}
          </p>
        </EraTitle>

        <div
          className="ao-depth-mid grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:flex-1"
          role="group"
          aria-label={t('visual.dashboardLabel')}
        >
          {/* --- regions: the distribution, front and centre --- */}
          <Panel title={t('visual.regionsTitle')} className="sm:col-span-2">
            {/* Height-capped: the schematic scales with the panel's width, and on
                a wide dashboard it grew tall enough to push the prompt panel
                out of the pinned stage. */}
            <svg viewBox="0 0 300 112" className="mx-auto block h-auto max-h-[18dvh] w-full" aria-hidden="true">
              <g className="ao-cue" style={cue(0.21)}>
                {EDGES.map(([a, b]) => (
                  <line
                    key={`${a}-${b}`}
                    x1={NODES[a].x}
                    y1={NODES[a].y}
                    x2={NODES[b].x}
                    y2={NODES[b].y}
                    stroke="var(--ao-color-border)"
                    strokeWidth="1"
                  />
                ))}
              </g>

              {/* Traffic: small packets sliding along each edge, forever. The
                  wrapper's opacity is scrubbed; the packets animate transform. */}
              <g className="ao-cue" style={cue(0.24)}>
                {EDGES.flatMap(([a, b], edge) =>
                  [0, 1].map((lane) => {
                    const forward = lane === 0;
                    const from = NODES[forward ? a : b];
                    const to = NODES[forward ? b : a];
                    return (
                      <circle
                        key={`${edge}-${lane}`}
                        className="ao-packet"
                        r="1.8"
                        fill="var(--ao-color-accent)"
                        style={
                          {
                            '--ax': from.x, '--ay': from.y, '--bx': to.x, '--by': to.y,
                            '--packet-duration': `${2.2 + edge * 0.35 + lane * 0.5}s`,
                            '--packet-delay': `${edge * 0.4 + lane * 1.1}s`,
                          } as CSSProperties
                        }
                      />
                    );
                  }),
                )}
              </g>

              {NODES.map((node, index) => (
                <g key={index} className="ao-cue" style={cue(NODES_AT[index] ?? 0)}>
                  {/* The breathing halo animates opacity, so its resting
                      strength lives on a wrapper, not on the circle itself. */}
                  <g opacity="0.18">
                    <circle cx={node.x} cy={node.y} r="8" fill="var(--ao-color-accent)" className="ao-breathe" />
                  </g>
                  <circle cx={node.x} cy={node.y} r="3.5" fill="var(--ao-color-accent)" />
                  <text
                    x={node.x}
                    y={node.y + node.labelDy}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--ao-color-text-muted)"
                    fontFamily="var(--ao-font-body)"
                  >
                    {regions[index]}
                  </text>
                </g>
              ))}
            </svg>
          </Panel>

          {/* --- containers --- */}
          <Panel title={t('visual.containersTitle')}>
            <ul className="flex flex-col gap-1.5 font-mono text-[11px] sm:text-xs" dir="ltr">
              {containerRows.map((row, index) => (
                <li key={row.name} className="flex items-center justify-between gap-2">
                  <span className="truncate text-ink">{row.name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-muted">
                    {row.replicas}
                    <span className="relative inline-flex w-16 justify-end">
                      <span className="ao-cue text-warning" style={cue(0, CONTAINERS_AT[index] ?? 0)} aria-hidden="true">
                        {t('visual.pending')}
                      </span>
                      <span className="ao-cue absolute inset-y-0 end-0 text-success" style={cue(CONTAINERS_AT[index] ?? 0)}>
                        {t('visual.running')}
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* --- deploy --- */}
          <Panel title={t('visual.deployTitle')}>
            <ol className="flex items-center gap-2">
              {deploySteps.map((step, index) => (
                <li key={step} className="flex flex-1 items-center gap-1.5 font-body text-xs text-muted">
                  <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true">
                    <circle cx="8" cy="8" r="7" fill="none" stroke="var(--ao-color-border)" strokeWidth="1.5" />
                    <g className="ao-cue" style={cue(DEPLOY_AT[index] ?? 0)}>
                      <circle cx="8" cy="8" r="7" fill="var(--ao-color-success)" />
                      <path d="M4.5 8.2l2.3 2.3 4.7-4.9" fill="none" stroke="var(--ao-color-background)" strokeWidth="1.8" />
                    </g>
                  </svg>
                  <span className="truncate">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-2 font-mono text-[11px] text-muted" dir="ltr">
              {t('visual.deployRef')}
            </p>
            <p className="ao-cue mt-1 font-body text-xs text-success" style={cue(DEPLOY_AT[2] + 0.02)}>
              {t('visual.deployDone')}
            </p>
          </Panel>

          {/* --- metrics --- */}
          <Panel title={t('visual.metricsTitle')}>
            <div className="relative overflow-hidden">
              <svg viewBox="0 0 200 48" className="block h-12 w-full" preserveAspectRatio="none" aria-hidden="true">
                <polyline points={SPARK} fill="none" stroke="var(--ao-color-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="ao-spark-cover absolute inset-0 bg-surface" aria-hidden="true" />
            </div>
            <p className="mt-2 flex items-baseline justify-between font-body text-xs text-muted">
              <span>{t('visual.metricLabel')}</span>
              <span className="font-mono text-sm text-ink" dir="ltr">
                {t('visual.metricValue')}
              </span>
            </p>
          </Panel>

          {/* --- terminal --- */}
          <Panel title={t('visual.terminalTitle')}>
            <div className="flex flex-col gap-0.5 font-mono text-[10.5px] leading-snug whitespace-pre text-muted sm:text-[11px]" dir="ltr">
              {terminal.map((line, index) => (
                // Not `truncate`: its white-space: nowrap would collapse the column
                // padding that `pre` on the parent preserves.
                <p key={line} className={cn('ao-cue overflow-hidden text-ellipsis', index === 0 && 'text-ink')} style={cue(TERMINAL_AT[index] ?? 0)}>
                  {line}
                </p>
              ))}
              <AssistantTeaser />
            </div>
          </Panel>

          {/* --- the prompt --- */}
          <Panel title={t('visual.promptLabel')} className="ao-cue sm:col-span-2" style={cue(0.68)}>
            {/*
              The assistant's mount point. What is drawn here is a picture of a
              prompt, not a working one: no input, no search. The working
              assistant is the desktop app (Phase 8); the teaser below only
              points to it, and reaches the page after it has loaded, never in
              the static HTML.
            */}
            <div data-assistant-mount="journey-prompt" className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-control border border-edge bg-background px-3 py-2">
                <span className="relative overflow-hidden font-body text-sm text-ink">
                  <span>{prompt}</span>
                  {/* One text node, uncovered one character per step. */}
                  <span
                    className="ao-wipe absolute inset-y-0 start-0 w-full border-s-2 border-accent bg-background"
                    style={
                      {
                        '--wipe-steps': Array.from(prompt).length,
                        '--wipe-duration': `${(Array.from(prompt).length * 0.055).toFixed(2)}s`,
                        '--wipe-delay': '0.2s',
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  />
                </span>
              </div>
              {response.map((line, index) => (
                <p
                  key={line}
                  className="ao-rise font-body text-sm leading-relaxed text-muted"
                  style={{ '--rise-delay': `${(Array.from(prompt).length * 0.055 + 0.7 + index * 0.6).toFixed(2)}s` } as CSSProperties}
                >
                  {line}
                </p>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/** A calm dashboard card. Exported for the Convergence. */
export function Panel({
  title,
  children,
  className,
  style,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={cn('ao-themed rounded-window border border-edge bg-surface p-3', className)} style={style}>
      <h3 className="mb-2 font-body text-[11px] font-medium tracking-wide text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

/** The sparkline alone, for the Convergence's miniature of this era. */
export function Sparkline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 48" className={className} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={SPARK} fill="none" stroke="var(--ao-color-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
