'use client';

import { useId, useMemo, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import {
  ALGORITHMS,
  BATCH_JOBS,
  DEFAULT_QUANTUM,
  MAX_JOBS,
  MAX_MINUTES,
  MAX_QUANTUM,
  STAGGERED_JOBS,
  bestForWaiting,
  cleanJob,
  cleanQuantum,
  nextJobId,
  schedule,
  type Algorithm,
  type Job,
} from '@/components/apps/scheduler/sched';
import type { AppProps } from '@/components/apps/types';
import { cn } from '@/lib/cn';

const PRESETS = { batch: BATCH_JOBS, staggered: STAGGERED_JOBS } as const;
type PresetId = keyof typeof PRESETS;

/** One look per job, cycled: shades of the accent, told apart by the letter as well - never by colour alone. */
const JOB_LOOKS = ['bg-accent text-background', 'bg-accent/70 text-background', 'bg-accent/45 text-ink', 'bg-accent/30 text-ink', 'bg-accent/55 text-ink', 'bg-accent/20 text-ink'] as const;

const field =
  'ao-themed min-h-9 w-full min-w-0 rounded-control border border-edge bg-background px-2 text-center font-mono text-sm text-ink focus-visible:border-accent focus-visible:outline-none';
const chip =
  'ao-themed min-h-8 cursor-pointer rounded-control border border-edge px-2.5 font-mono text-xs text-ink hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';

/**
 * The batch planner (APP-06), unlocked by the 1956 puzzle: a computer hates
 * waiting, so something has to decide the order. The visitor edits a few jobs
 * and sees the same jobs run under first come first served, shortest job first
 * and round robin - the sequence drawn to scale, each job's waiting time, and
 * the three averages side by side. The arithmetic is `scheduler/sched.ts`, pure
 * and tested. It stores nothing and sends nothing; the state lives in the
 * window and goes with it.
 */
export function SchedulerApp(props: AppProps) {
  return (
    <AppMessages copy={['scheduler']}>
      <Planner {...props} />
    </AppMessages>
  );
}

function Planner({ appId }: AppProps) {
  const t = useTranslations('scheduler');
  const format = useFormatter();
  const id = useId();
  const [jobs, setJobs] = useState<readonly Job[]>(BATCH_JOBS);
  const [algorithm, setAlgorithm] = useState<Algorithm>('fcfs');
  const [quantum, setQuantum] = useState(DEFAULT_QUANTUM);

  const result = useMemo(() => schedule(jobs, algorithm, quantum), [jobs, algorithm, quantum]);
  const best = useMemo(() => bestForWaiting(jobs, quantum), [jobs, quantum]);
  const compared = useMemo(() => ALGORITHMS.map((name) => ({ name, average: schedule(jobs, name, quantum).averageWaiting })), [jobs, quantum]);
  const number = (value: number) => format.number(Math.round(value * 100) / 100, { maximumFractionDigits: 2 });
  const minutes = (value: number) => t('results.unit', { n: Math.round(value * 100) / 100 });
  const look = (jobId: string) => JOB_LOOKS[Math.max(0, jobs.findIndex((job) => job.id === jobId)) % JOB_LOOKS.length];

  const update = (jobId: string, change: Partial<Pick<Job, 'arrival' | 'burst'>>) =>
    setJobs((all) => all.map((job) => (job.id === jobId ? cleanJob({ ...job, ...change }) : job)));
  const addJob = () =>
    setJobs((all) => {
      const next = nextJobId(all);
      return next ? [...all, { id: next, arrival: 0, burst: 5 }] : all;
    });
  const readNumber = (value: string) => (value.trim() === '' ? 0 : Number(value));

  return (
    <div data-app-content={appId} data-scheduler-algorithm={algorithm} className="@container min-h-full">
      <div className="flex flex-col gap-4 p-4 @min-[520px]:p-5">
        <p className="font-body text-sm leading-relaxed text-ink">{t('intro')}</p>

        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs tracking-wide text-muted uppercase">{t('presets.label')}</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(PRESETS) as PresetId[]).map((preset) => (
              <button key={preset} type="button" className={chip} data-scheduler-preset={preset} onClick={() => setJobs(PRESETS[preset])}>
                {t(`presets.${preset}`)}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-display text-base font-bold text-ink">{t('jobs.title')}</legend>
          <div className="grid grid-cols-[3.5rem_1fr_1fr_2rem] items-end gap-x-2 gap-y-2 font-mono text-xs text-muted" data-scheduler-jobs={jobs.length}>
            <span aria-hidden="true" />
            <span aria-hidden="true">{t('jobs.arrival')}</span>
            <span aria-hidden="true">{t('jobs.burst')}</span>
            <span aria-hidden="true" />
            {jobs.map((job) => (
              <div key={job.id} className="contents" data-scheduler-job={job.id}>
                <span className={cn('flex h-9 items-center justify-center rounded-control font-mono text-sm font-bold', look(job.id))} dir="ltr">
                  {job.id}
                </span>
                <label className="contents">
                  <span className="ao-sr-only">{`${t('jobs.job', { id: job.id })}: ${t('jobs.arrival')}`}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={MAX_MINUTES}
                    dir="ltr"
                    value={job.arrival}
                    data-scheduler-arrival={job.id}
                    onChange={(event) => update(job.id, { arrival: readNumber(event.target.value) })}
                    className={field}
                  />
                </label>
                <label className="contents">
                  <span className="ao-sr-only">{`${t('jobs.job', { id: job.id })}: ${t('jobs.burst')}`}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_MINUTES}
                    dir="ltr"
                    value={job.burst}
                    data-scheduler-burst={job.id}
                    onChange={(event) => update(job.id, { burst: readNumber(event.target.value) })}
                    className={field}
                  />
                </label>
                <button
                  type="button"
                  data-action="scheduler-remove"
                  data-job={job.id}
                  disabled={jobs.length <= 1}
                  aria-label={t('jobs.remove', { id: job.id })}
                  title={t('jobs.remove', { id: job.id })}
                  onClick={() => setJobs((all) => all.filter((entry) => entry.id !== job.id))}
                  className="ao-themed flex h-9 w-8 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" data-action="scheduler-add" className={chip} disabled={jobs.length >= MAX_JOBS} onClick={addJob}>
              {t('jobs.add')}
            </button>
            {jobs.length >= MAX_JOBS ? <span className="font-body text-xs text-muted">{t('jobs.limit')}</span> : null}
          </div>
        </fieldset>

        <div role="radiogroup" aria-label={t('algorithms.label')} className="flex flex-wrap gap-1.5">
          {ALGORITHMS.map((name) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={algorithm === name}
              data-scheduler-choice={name}
              onClick={() => setAlgorithm(name)}
              className={cn(chip, algorithm === name && 'border-accent bg-accent text-background hover:border-accent')}
            >
              {t(`algorithms.${name}.name`)}
            </button>
          ))}
        </div>
        <p className="font-body text-xs leading-relaxed text-muted" data-scheduler-explain={algorithm}>
          {t(`algorithms.${algorithm}.explain`)}
        </p>

        {algorithm === 'rr' ? (
          <div className="flex items-center gap-2">
            <label htmlFor={`${id}-quantum`} className="font-mono text-xs text-muted">
              {t('quantum.label')}
            </label>
            <input
              id={`${id}-quantum`}
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_QUANTUM}
              dir="ltr"
              value={quantum}
              data-scheduler-quantum=""
              onChange={(event) => setQuantum(cleanQuantum(readNumber(event.target.value)))}
              className={cn(field, 'w-20')}
            />
          </div>
        ) : null}

        <section aria-labelledby={`${id}-timeline`} className="flex flex-col gap-2">
          <h3 id={`${id}-timeline`} className="font-display text-base font-bold text-ink">
            {t('timeline.title')}
          </h3>
          {/* Drawn to scale, left to right in every language: time is not text. */}
          <div dir="ltr" className="flex flex-col gap-1" data-scheduler-timeline={result.makespan}>
            <div className="ao-themed flex h-10 w-full overflow-hidden rounded-control border border-edge bg-background" aria-hidden="true">
              {result.segments.map((segment, index) => (
                <span
                  key={`${segment.job ?? 'idle'}-${segment.start}-${index}`}
                  data-segment={segment.job ?? 'idle'}
                  style={{ width: `${((segment.end - segment.start) / Math.max(1, result.makespan)) * 100}%` }}
                  className={cn(
                    'flex min-w-0 items-center justify-center overflow-hidden border-e border-background font-mono text-xs font-bold',
                    segment.job === null ? 'bg-surface text-muted' : look(segment.job),
                  )}
                >
                  {segment.job ?? ''}
                </span>
              ))}
            </div>
            <div className="flex justify-between font-mono text-[11px] text-muted" aria-hidden="true">
              <span>0</span>
              <span>{result.makespan}</span>
            </div>
          </div>
          <p dir="ltr" className="font-mono text-xs leading-relaxed break-words text-ink" data-scheduler-order="">
            <span className="text-muted">{t('timeline.order')}: </span>
            {result.segments.map((segment) => `${segment.job ?? t('timeline.idle')} ${segment.start}–${segment.end}`).join(' → ')}
          </p>
        </section>

        <section aria-labelledby={`${id}-results`} className="flex flex-col gap-2">
          <h3 id={`${id}-results`} className="font-display text-base font-bold text-ink">
            {t('results.title')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[20rem] border-collapse text-start font-body text-sm text-ink" data-scheduler-results="">
              <thead>
                <tr className="font-mono text-xs text-muted">
                  <th scope="col" className="py-1 pe-2 text-start font-normal">
                    &nbsp;
                  </th>
                  <th scope="col" className="px-2 py-1 text-start font-normal">
                    {t('results.waiting')}
                  </th>
                  <th scope="col" className="px-2 py-1 text-start font-normal">
                    {t('results.turnaround')}
                  </th>
                  <th scope="col" className="px-2 py-1 text-start font-normal">
                    {t('results.response')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((entry) => (
                  <tr key={entry.id} className="border-t border-edge" data-scheduler-row={entry.id}>
                    <th scope="row" className="py-1 pe-2 text-start font-mono font-bold" dir="ltr">
                      {entry.id}
                    </th>
                    <td className="px-2 py-1" data-waiting={entry.waiting}>
                      {minutes(entry.waiting)}
                    </td>
                    <td className="px-2 py-1">{minutes(entry.turnaround)}</td>
                    <td className="px-2 py-1">{minutes(entry.response)}</td>
                  </tr>
                ))}
                <tr className="border-t border-edge font-bold" data-scheduler-average="">
                  <th scope="row" className="py-1 pe-2 text-start font-body">
                    {t('results.average')}
                  </th>
                  <td className="px-2 py-1" data-average-waiting={Math.round(result.averageWaiting * 100) / 100}>
                    {minutes(result.averageWaiting)}
                  </td>
                  <td className="px-2 py-1">{minutes(result.averageTurnaround)}</td>
                  <td className="px-2 py-1" />
                </tr>
              </tbody>
            </table>
          </div>
          <p className="font-mono text-xs text-muted" data-scheduler-switches={result.switches}>
            {t('results.switches', { count: result.switches })}
          </p>
        </section>

        <section aria-labelledby={`${id}-compare`} className="flex flex-col gap-2">
          <h3 id={`${id}-compare`} className="font-display text-base font-bold text-ink">
            {t('compare.title')}
          </h3>
          <ul className="flex flex-col gap-1.5" data-scheduler-compare="">
            {compared.map((entry) => (
              <li key={entry.name} data-compare={entry.name} data-best={best.includes(entry.name) ? '' : undefined} className="ao-themed flex flex-wrap items-baseline justify-between gap-x-3 rounded-control border border-edge px-3 py-1.5 font-body text-sm text-ink">
                <span>{t(`algorithms.${entry.name}.name`)}</span>
                <span className="font-mono text-xs">
                  {t('compare.average')}: {number(entry.average)} {best.includes(entry.name) ? <span className="text-accent">· {t('compare.best')}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="font-body text-sm leading-relaxed text-muted">{t('truth')}</p>
      </div>
    </div>
  );
}
