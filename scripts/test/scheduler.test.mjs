// The batch planner's arithmetic, run as it is: node strips the TypeScript types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { EMPLOYER } from './employer-name.mjs';
import {
  ALGORITHMS,
  BATCH_JOBS,
  MAX_JOBS,
  MAX_MINUTES,
  STAGGERED_JOBS,
  bestForWaiting,
  cleanJob,
  cleanQuantum,
  nextJobId,
  schedule,
} from '../../src/components/apps/scheduler/sched.ts';

const order = (result) => result.segments.filter((segment) => segment.job !== null).map((segment) => `${segment.job}${segment.start}-${segment.end}`).join(' ');
const waits = (result) => Object.fromEntries(result.results.map((entry) => [entry.id, entry.waiting]));

test('the four batch jobs of the 1956 puzzle: 115 minutes of waiting in arrival order, 31 shortest first', () => {
  const fcfs = schedule(BATCH_JOBS, 'fcfs');
  assert.equal(order(fcfs), 'A0-30 B30-35 C35-50 D50-52');
  assert.deepEqual(waits(fcfs), { A: 0, B: 30, C: 35, D: 50 });
  assert.equal(fcfs.results.reduce((sum, entry) => sum + entry.waiting, 0), 115);
  assert.equal(fcfs.averageWaiting, 28.75);
  const sjf = schedule(BATCH_JOBS, 'sjf');
  assert.equal(order(sjf), 'D0-2 B2-7 C7-22 A22-52');
  assert.equal(sjf.results.reduce((sum, entry) => sum + entry.waiting, 0), 31);
  assert.equal(sjf.averageWaiting, 7.75);
  assert.deepEqual(bestForWaiting(BATCH_JOBS), ['sjf']);
});

test('jobs that arrive over time: hand-worked results for all three', () => {
  const fcfs = schedule(STAGGERED_JOBS, 'fcfs');
  assert.deepEqual(waits(fcfs), { A: 0, B: 10, C: 11, D: 18 });
  assert.equal(fcfs.averageWaiting, 9.75);
  const sjf = schedule(STAGGERED_JOBS, 'sjf');
  assert.equal(order(sjf), 'A0-12 D12-14 B14-17 C17-25');
  assert.equal(sjf.averageWaiting, 8);
  const rr = schedule(STAGGERED_JOBS, 'rr', 4);
  assert.equal(order(rr), 'A0-4 B4-7 C7-11 A11-15 D15-17 C17-21 A21-25');
  assert.deepEqual(waits(rr), { A: 13, B: 2, C: 9, D: 10 });
  assert.equal(rr.averageWaiting, 8.5);
  assert.equal(rr.switches, 6);
  assert.equal(rr.results.find((entry) => entry.id === 'B').response, 2);
});

test('round robin: a big enough slice is first come, first served; a slice of 1 shares the machine evenly', () => {
  assert.equal(order(schedule(BATCH_JOBS, 'rr', 20)), 'A0-20 B20-25 C25-40 D40-42 A42-52');
  const shortJobs = [{ id: 'A', arrival: 0, burst: 12 }, { id: 'B', arrival: 0, burst: 5 }, { id: 'C', arrival: 0, burst: 15 }];
  assert.deepEqual(waits(schedule(shortJobs, 'rr', 20)), waits(schedule(shortJobs, 'fcfs')), 'a slice longer than every job changes nothing');
  const fine = schedule(BATCH_JOBS, 'rr', 1);
  assert.equal(fine.results.find((entry) => entry.id === 'D').completion, 8, 'D needs 2 minutes and gets one in every round of four');
});

test('every schedule is a real one: no overlap, the machine idles only when nothing has arrived, every job gets its whole burst', () => {
  const sets = [BATCH_JOBS, STAGGERED_JOBS, [{ id: 'A', arrival: 5, burst: 3 }, { id: 'B', arrival: 20, burst: 4 }, { id: 'C', arrival: 21, burst: 1 }]];
  for (const jobs of sets) {
    for (const algorithm of ALGORITHMS) {
      for (const quantum of [1, 3, 7]) {
        const result = schedule(jobs, algorithm, quantum);
        const label = `${algorithm} q${quantum} ${JSON.stringify(jobs.map((job) => job.arrival))}`;
        result.segments.forEach((segment, index) => {
          assert.ok(segment.end > segment.start, `${label}: empty segment`);
          if (index > 0) assert.ok(segment.start >= result.segments[index - 1].end, `${label}: overlap`);
        });
        for (const job of jobs) {
          const ran = result.segments.filter((segment) => segment.job === job.id).reduce((sum, segment) => sum + (segment.end - segment.start), 0);
          assert.equal(ran, job.burst, `${label}: job ${job.id} runs exactly its burst`);
          const entry = result.results.find((candidate) => candidate.id === job.id);
          assert.ok(entry.firstStart >= job.arrival && entry.waiting >= 0 && entry.response >= 0 && entry.completion >= job.arrival + job.burst, `${label}: ${job.id}`);
          assert.equal(entry.turnaround, entry.waiting + job.burst);
        }
        for (const segment of result.segments.filter((candidate) => candidate.job !== null)) {
          assert.ok(segment.start >= jobs.find((job) => job.id === segment.job).arrival, `${label}: ${segment.job} ran before it arrived`);
        }
        // Idle only while no job that has arrived is unfinished.
        for (const segment of result.segments.filter((candidate) => candidate.job === null)) {
          const unfinished = result.results.filter((entry) => entry.arrival <= segment.start && entry.completion > segment.start);
          assert.equal(unfinished.length, 0, `${label}: idle at ${segment.start} with work waiting`);
        }
      }
    }
  }
  const gap = schedule(sets[2], 'fcfs');
  assert.deepEqual(gap.segments.map((segment) => segment.job), [null, 'A', null, 'B', 'C']);
  assert.equal(gap.makespan, 25);
});

test('shortest job first never waits longer on average than either of the others when all jobs arrive together', () => {
  for (const burst of [[5, 3, 8, 1], [30, 5, 15, 2], [4, 4, 4], [1, 9, 2, 8, 3]]) {
    const jobs = burst.map((length, index) => ({ id: String.fromCharCode(65 + index), arrival: 0, burst: length }));
    const sjf = schedule(jobs, 'sjf').averageWaiting;
    for (const algorithm of ['fcfs', 'rr']) assert.ok(sjf <= schedule(jobs, algorithm, 3).averageWaiting + 1e-9, `${algorithm} ${burst}`);
  }
});

test('input is held inside what the planner draws; ids are letters; the job list is bounded', () => {
  assert.deepEqual(cleanJob({ id: 'A', arrival: -4, burst: 0 }), { id: 'A', arrival: 0, burst: 1 });
  assert.deepEqual(cleanJob({ id: 'A', arrival: 500, burst: Number.NaN }), { id: 'A', arrival: MAX_MINUTES, burst: 1 });
  assert.equal(cleanQuantum(0), 1);
  assert.equal(cleanQuantum(400), 20);
  assert.equal(schedule([], 'fcfs').makespan, 0);
  assert.equal(nextJobId([{ id: 'A' }, { id: 'C' }]), 'B');
  const full = Array.from({ length: MAX_JOBS }, (_, index) => ({ id: String.fromCharCode(65 + index), arrival: 0, burst: 1 }));
  assert.equal(nextJobId(full), null);
});

test('the planner copy exists in every language, in "Sie", and names no employer', () => {
  const get = (object, path) => path.split('.').reduce((node, key) => node?.[key], object);
  const shape = (value, prefix = '') => (value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value).flatMap(([key, child]) => shape(child, prefix ? `${prefix}.${key}` : key)) : [prefix]);
  const copy = Object.fromEntries(['de', 'en', 'fa'].map((locale) => [locale, JSON.parse(readFileSync(new URL(`../../src/messages/apps/scheduler/${locale}.json`, import.meta.url), 'utf8'))]));
  assert.deepEqual(shape(copy.en).sort(), shape(copy.de).sort());
  assert.deepEqual(shape(copy.fa).sort(), shape(copy.de).sort());
  for (const locale of Object.keys(copy)) {
    for (const algorithm of ALGORITHMS) for (const key of ['name', 'explain']) assert.ok(get(copy[locale], `algorithms.${algorithm}.${key}`), `${locale} ${algorithm}.${key}`);
    assert.doesNotMatch(JSON.stringify(copy[locale]), EMPLOYER, locale);
  }
  assert.doesNotMatch(JSON.stringify(copy.de), /\b(du|dich|dir|dein|deine|deinen)\b/i);
  assert.doesNotMatch(JSON.stringify(copy.fa), /(^|[\s«"])تو([\s»".،]|$)/);
});
