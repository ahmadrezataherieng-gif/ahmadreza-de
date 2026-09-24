'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import {
  formatHeader,
  formatHop,
  formatUnknownHost,
  hopDelay,
  median,
  resolveTarget,
  summarise,
  type TraceTarget,
} from '@/components/apps/traceroute/trace';
import { routes, type Route } from '@/content/routes';
import { onTrace, takeWaitingTrace } from '@/lib/app-handoff';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';

type Run = Extract<TraceTarget, { ok: true }>;

/**
 * A visual traceroute over prepared routes: the packet travels hop by hop, each
 * hop shows what it is and what it costs, and at the end the run says where
 * the time went. A simulation, and it says so first.
 *
 * Motion follows the tiers: the full tier lets the packet glow and the chain
 * fill in; the light tier drops both and keeps the step-by-step reveal; under
 * reduced motion the finished trace appears at once.
 */
export function TracerouteApp(props: AppProps) {
  return (
    <AppMessages copy={['traceroute']}>
      <Traceroute {...props} />
    </AppMessages>
  );
}

function Traceroute({ appId }: AppProps) {
  const t = useTranslations('traceroute');
  const reduced = useReducedMotion();
  const inputId = useId();
  const [value, setValue] = useState('');
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** How many hops have answered so far. */
  const [shown, setShown] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Keep the packet in sight: the trace starts below the fold of a normal
  // window. The window body is scrolled by hand - scrollIntoView would move
  // the desktop behind it too - and only ever down to the newest hop.
  useEffect(() => {
    const root = rootRef.current;
    const body = root?.closest<HTMLElement>('[data-window-body]');
    if (!root || !body || !run) return;
    const target = shown === 0 ? root.querySelector('[data-trace]') : root.querySelector(`[data-hop="${Math.min(shown + 1, run.route.hops.length)}"]`);
    if (!target) return;
    const frame = body.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
    if (shown === 0 && (box.top < frame.top || box.top > frame.top + frame.height * 0.4)) {
      body.scrollTo({ top: body.scrollTop + box.top - frame.top - 12, behavior });
    } else if (!reduced && shown > 0 && box.bottom > frame.bottom) {
      body.scrollTo({ top: body.scrollTop + box.bottom - frame.bottom + 12, behavior });
    }
  }, [run, shown, reduced]);

  // The packet's pace: each hop appears after its own delay. Under reduced
  // motion there is no pace - the finished frame at once.
  useEffect(() => {
    if (!run) return;
    const total = run.route.hops.length;
    if (reduced) {
      setShown(total);
      return;
    }
    if (shown >= total) return;
    const next = run.route.hops[shown];
    if (!next) return;
    timer.current = window.setTimeout(() => setShown((count) => count + 1), hopDelay(next));
    return () => window.clearTimeout(timer.current);
  }, [run, shown, reduced]);

  const start = (input: string) => {
    window.clearTimeout(timer.current);
    const target = resolveTarget(routes, input);
    setValue(target.ok ? target.host : input);
    if (!target.ok) {
      setRun(null);
      setError(target.host);
      return;
    }
    setError(null);
    setShown(0);
    setRun(target);
  };

  // A host handed over by Ping or DNS in the Network tools (APP-16): traced as
  // soon as this app is open, whether it was already or has just opened for it.
  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  });
  useEffect(() => {
    const traceWaiting = () => {
      const waiting = takeWaitingTrace();
      if (waiting) startRef.current(waiting);
    };
    traceWaiting();
    return onTrace(traceWaiting);
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim() !== '') start(value);
  };

  const done = run !== null && shown >= run.route.hops.length;

  return (
    <div ref={rootRef} data-app-content={appId} className="@container min-h-full">
      <div className="flex flex-col gap-4 p-4 @min-[520px]:p-5">
        <p className="ao-themed rounded-control border border-dashed border-warning/60 px-3 py-2 font-body text-xs leading-snug text-muted" data-simulation="">
          {t('simulation')}
        </p>
        <p className="font-body text-sm leading-relaxed text-ink">{t('intro')}</p>

        <form onSubmit={onSubmit} aria-label={t('formLabel')} className="flex flex-col gap-2">
          <label htmlFor={inputId} className="font-mono text-xs tracking-wide text-muted uppercase">
            {t('targetLabel')}
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              data-trace-input=""
              dir="ltr"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={t('targetPlaceholder')}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="url"
              enterKeyHint="go"
              className="ao-themed min-h-10 min-w-0 flex-1 rounded-control border border-edge bg-background px-3 font-mono text-sm text-ink placeholder:text-muted focus-visible:border-accent focus-visible:outline-none"
            />
            <button
              type="submit"
              data-action="trace-run"
              className="ao-themed min-h-10 shrink-0 cursor-pointer rounded-control border border-accent bg-accent px-4 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
            >
              {t('run')}
            </button>
          </div>
          <div role="group" aria-label={t('prepared')} className="flex flex-wrap gap-1.5">
            {routes.map((route) => (
              <button
                key={route.id}
                type="button"
                data-trace-target={route.id}
                onClick={() => start(route.target)}
                className="ao-themed flex min-h-8 cursor-pointer items-center gap-1.5 rounded-control border border-edge px-2.5 text-xs hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                <span className="font-body text-ink">{t(`targets.${route.id}`)}</span>
                <bdi dir="ltr" className="font-mono text-muted">
                  {route.target}
                </bdi>
              </button>
            ))}
          </div>
        </form>

        {error !== null ? (
          <div role="alert" data-trace-error="" className="flex flex-col gap-1">
            <p className="font-body text-sm text-error">{t('unknownHost', { host: error })}</p>
            <pre dir="ltr" className="font-mono text-xs text-muted">
              {formatUnknownHost(error)}
            </pre>
          </div>
        ) : null}

        {run ? <Trace run={run} shown={shown} done={done} /> : null}

        <p className="ao-sr-only" aria-live="polite">
          {run === null ? '' : done ? t('status.done') : t('status.running')}
        </p>
      </div>
    </div>
  );
}

function Trace({ run, shown, done }: { run: Run; shown: number; done: boolean }) {
  const t = useTranslations('traceroute');
  const { route } = run;
  const summary = summarise(route);
  const slowest = Math.max(...route.hops.map((hop) => median(hop) ?? 0), 1);
  const visible = route.hops.slice(0, shown);

  return (
    <section data-trace={route.id} data-trace-done={done ? '' : undefined} className="flex flex-col gap-3">
      {run.mapped ? (
        <p data-trace-mapped="" className="font-body text-xs leading-snug text-muted">
          {t('mapped', { host: run.host, route: t(`targets.${route.id}`) })}
        </p>
      ) : null}

      <p dir="ltr" className="font-mono text-[11.5px] break-all text-muted">
        {formatHeader(route, run.host)}
      </p>

      <ol aria-label={t('hopsLabel')} className="flex flex-col">
        {route.hops.map((hop, index) => {
          const state = index < shown ? 'done' : index === shown && !done ? 'active' : 'pending';
          if (state === 'pending') return null;
          const ms = median(hop);
          const isJump = done && summary.jump !== null && summary.jump.to === index + 1;
          const last = index === route.hops.length - 1;
          return (
            <li key={index} data-hop={index + 1} data-hop-state={state} className="ao-trace-row relative flex gap-3 ps-1">
              <span aria-hidden="true" className="relative flex w-4 shrink-0 justify-center">
                {!last ? (
                  <span className="absolute top-4 bottom-0 w-px bg-edge">
                    <span className="ao-trace-rail-fill absolute inset-0 bg-accent" />
                  </span>
                ) : null}
                <span
                  className={cn(
                    'relative mt-1.5 h-2.5 w-2.5 rounded-full border',
                    state === 'active' ? 'ao-trace-packet border-accent bg-accent' : hop.rtt ? 'border-accent bg-surface' : 'border-edge border-dashed bg-surface',
                  )}
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1 pb-3">
                <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-body text-sm text-ink">{t(`roles.${hop.role}`)}</span>
                  {state === 'done' && ms !== null ? (
                    <span dir="ltr" className="font-mono text-xs text-ink">
                      {ms.toFixed(1)} ms
                    </span>
                  ) : null}
                </p>
                {state === 'done' ? (
                  <>
                    <p dir="ltr" className="font-mono text-[11.5px] break-all text-muted rtl:text-right">
                      {hop.ip ? `${hop.host ?? hop.ip} (${hop.ip})` : '* * *'}
                    </p>
                    {ms !== null ? (
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                          <span
                            className={cn('ao-trace-bar block h-full rounded-full', isJump ? 'bg-warning' : 'bg-accent')}
                            style={{ width: `${Math.max(2, (ms / slowest) * 100)}%` }}
                          />
                        </span>
                        {isJump && summary.jump ? (
                          <span data-trace-jump="" className="font-mono text-[11px] whitespace-nowrap text-warning">
                            <bdi dir="ltr">+{summary.jump.delta.toFixed(1)} ms</bdi> · {t('jumpBadge')}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <p className="font-body text-xs text-muted">{t('silentNote')}</p>
                    )}
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {done ? (
        <div data-trace-summary="" className="ao-themed flex flex-col gap-1.5 rounded-control border border-accent/40 bg-elevated/60 p-3">
          <p className="font-body text-sm font-bold text-ink">{t('summary', { hops: summary.hops, ms: summary.total })}</p>
          {summary.jump ? (
            <p className="font-body text-sm text-ink">{t('jump', { from: summary.jump.from, to: summary.jump.to, delta: summary.jump.delta })}</p>
          ) : null}
          <p className="font-body text-sm leading-relaxed text-muted">{t(`why.${whyKey(summary.jump?.role)}`)}</p>
        </div>
      ) : null}

      <details className="group">
        <summary className="w-fit cursor-pointer font-mono text-xs text-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">
          {t('raw')}
        </summary>
        <pre dir="ltr" data-trace-raw="" className="ao-themed mt-2 overflow-x-auto rounded-control border border-edge bg-background p-2.5 font-mono text-[11.5px] leading-relaxed text-ink">
          {[`$ traceroute ${run.host}`, formatHeader(route, run.host), ...visible.map((hop, index) => formatHop(hop, index))].join('\n')}
        </pre>
      </details>
    </section>
  );
}

/** Which explanation fits where the time went. */
function whyKey(role: Route['hops'][number]['role'] | undefined): 'lan' | 'ispAccess' | 'subsea' | 'carrier' {
  if (role === undefined) return 'lan';
  if (role === 'subsea') return 'subsea';
  if (role === 'ispAccess') return 'ispAccess';
  return 'carrier';
}
