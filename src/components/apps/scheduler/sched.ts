/**
 * The batch planner's arithmetic: three ways of deciding which job the machine
 * works on next, and what each costs the jobs in waiting (APP-06, the 1956
 * era's truth: a computer hates waiting, so something has to decide the order).
 *
 * Pure functions, no React and no runtime imports, so `node --test` runs the
 * module as it is (`scripts/test/scheduler.test.mjs`). One machine, one job at
 * a time, times in whole minutes.
 *
 * - `fcfs`: first come, first served - the order of arrival, run to the end.
 * - `sjf`: shortest job first - of the jobs that have arrived, the shortest,
 *   run to the end. Never preempts. Minimises the average wait.
 * - `rr`: round robin - each job gets a slice of `quantum` minutes, then goes
 *   to the back of the queue. A job arriving during a slice queues before the
 *   one the slice just interrupted.
 *
 * Ties are always broken the same way, by arrival and then by the job's
 * position in the list, so the same input gives the same picture every time.
 */

export type Algorithm = 'fcfs' | 'sjf' | 'rr';
export const ALGORITHMS: readonly Algorithm[] = ['fcfs', 'sjf', 'rr'];

export interface Job {
  /** A short label, a letter: machine text, the same in every language. */
  id: string;
  /** The minute the job is submitted. */
  arrival: number;
  /** Minutes of machine time it needs. At least 1. */
  burst: number;
}

/** A stretch of machine time. `job === null` is the machine standing idle. */
export interface Segment {
  job: string | null;
  start: number;
  end: number;
}

export interface JobResult {
  id: string;
  arrival: number;
  burst: number;
  /** First minute the job ran. */
  firstStart: number;
  completion: number;
  /** Completion minus arrival. */
  turnaround: number;
  /** Turnaround minus burst: minutes spent waiting in the queue. */
  waiting: number;
  /** First start minus arrival. */
  response: number;
}

export interface Schedule {
  segments: Segment[];
  results: JobResult[];
  averageWaiting: number;
  averageTurnaround: number;
  /** Times the machine switched from one job to a different one. */
  switches: number;
  /** Minute the last job finished. */
  makespan: number;
}

export const MAX_JOBS = 6;
export const MAX_MINUTES = 99;
export const MAX_QUANTUM = 20;
export const DEFAULT_QUANTUM = 4;

/** The four jobs of the 1956 puzzle: arrival order longest first, waiting 0 + 30 + 35 + 50 = 115 minutes in all. */
export const BATCH_JOBS: readonly Job[] = [
  { id: 'A', arrival: 0, burst: 30 },
  { id: 'B', arrival: 0, burst: 5 },
  { id: 'C', arrival: 0, burst: 15 },
  { id: 'D', arrival: 0, burst: 2 },
];

/** Jobs arriving over time, with a long one in front. */
export const STAGGERED_JOBS: readonly Job[] = [
  { id: 'A', arrival: 0, burst: 12 },
  { id: 'B', arrival: 2, burst: 3 },
  { id: 'C', arrival: 4, burst: 8 },
  { id: 'D', arrival: 5, burst: 2 },
];

const clampInt = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)));

/** A job with its numbers held inside what the planner draws. */
export function cleanJob(job: Job): Job {
  return { id: job.id, arrival: clampInt(job.arrival, 0, MAX_MINUTES), burst: clampInt(job.burst, 1, MAX_MINUTES) };
}

export function cleanQuantum(quantum: number): number {
  return clampInt(quantum, 1, MAX_QUANTUM);
}

/** The next free letter for a new job, or null at the limit. */
export function nextJobId(jobs: readonly Job[]): string | null {
  if (jobs.length >= MAX_JOBS) return null;
  for (let code = 65; code < 65 + 26; code++) {
    const letter = String.fromCharCode(code);
    if (!jobs.some((job) => job.id === letter)) return letter;
  }
  return null;
}

/** Add a segment, merging with the previous one when it is the same job (or idle) running on. */
function push(segments: Segment[], job: string | null, start: number, end: number): void {
  if (end <= start) return;
  const last = segments[segments.length - 1];
  if (last && last.job === job && last.end === start) last.end = end;
  else segments.push({ job, start, end });
}

export function schedule(input: readonly Job[], algorithm: Algorithm, quantum: number = DEFAULT_QUANTUM): Schedule {
  const jobs = input.map(cleanJob);
  const slice = cleanQuantum(quantum);
  const order = new Map(jobs.map((job, index) => [job.id, index]));
  const byArrival = (a: Job, b: Job) => a.arrival - b.arrival || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0);
  const segments: Segment[] = [];
  const firstStart = new Map<string, number>();
  const completion = new Map<string, number>();

  if (algorithm === 'rr') {
    const waiting = [...jobs].sort(byArrival);
    const left = new Map(jobs.map((job) => [job.id, job.burst]));
    const queue: Job[] = [];
    let clock = 0;
    let admitted = 0;
    const admit = () => {
      while (admitted < waiting.length && (waiting[admitted]?.arrival ?? Infinity) <= clock) {
        const job = waiting[admitted];
        if (job) queue.push(job);
        admitted += 1;
      }
    };
    admit();
    while (queue.length > 0 || admitted < waiting.length) {
      if (queue.length === 0) {
        const next = waiting[admitted];
        if (!next) break;
        push(segments, null, clock, next.arrival);
        clock = next.arrival;
        admit();
        continue;
      }
      const job = queue.shift();
      if (!job) break;
      const remaining = left.get(job.id) ?? 0;
      const run = Math.min(slice, remaining);
      if (!firstStart.has(job.id)) firstStart.set(job.id, clock);
      push(segments, job.id, clock, clock + run);
      clock += run;
      left.set(job.id, remaining - run);
      // Arrivals during the slice queue before the interrupted job.
      admit();
      if (remaining - run > 0) queue.push(job);
      else completion.set(job.id, clock);
    }
  } else {
    const pending = [...jobs].sort(byArrival);
    let clock = 0;
    while (pending.length > 0) {
      const ready = pending.filter((job) => job.arrival <= clock);
      if (ready.length === 0) {
        const next = pending[0];
        if (!next) break;
        push(segments, null, clock, next.arrival);
        clock = next.arrival;
        continue;
      }
      const chosen =
        algorithm === 'sjf'
          ? [...ready].sort((a, b) => a.burst - b.burst || byArrival(a, b))[0]
          : ready[0];
      if (!chosen) break;
      pending.splice(pending.indexOf(chosen), 1);
      firstStart.set(chosen.id, clock);
      push(segments, chosen.id, clock, clock + chosen.burst);
      clock += chosen.burst;
      completion.set(chosen.id, clock);
    }
  }

  const results: JobResult[] = jobs.map((job) => {
    const done = completion.get(job.id) ?? job.arrival + job.burst;
    const started = firstStart.get(job.id) ?? job.arrival;
    const turnaround = done - job.arrival;
    return {
      id: job.id,
      arrival: job.arrival,
      burst: job.burst,
      firstStart: started,
      completion: done,
      turnaround,
      waiting: turnaround - job.burst,
      response: started - job.arrival,
    };
  });
  const average = (pick: (result: JobResult) => number) => (results.length === 0 ? 0 : results.reduce((sum, result) => sum + pick(result), 0) / results.length);
  const running = segments.filter((segment) => segment.job !== null);
  const switches = running.filter((segment, index) => index > 0 && running[index - 1]?.job !== segment.job).length;

  return {
    segments,
    results,
    averageWaiting: average((result) => result.waiting),
    averageTurnaround: average((result) => result.turnaround),
    switches,
    makespan: segments.length === 0 ? 0 : (segments[segments.length - 1]?.end ?? 0),
  };
}

/** The algorithm(s) with the smallest average wait for these jobs (ties share). */
export function bestForWaiting(jobs: readonly Job[], quantum: number = DEFAULT_QUANTUM): Algorithm[] {
  const waits = ALGORITHMS.map((algorithm) => ({ algorithm, wait: schedule(jobs, algorithm, quantum).averageWaiting }));
  const least = Math.min(...waits.map((entry) => entry.wait));
  return waits.filter((entry) => Math.abs(entry.wait - least) < 1e-9).map((entry) => entry.algorithm);
}
