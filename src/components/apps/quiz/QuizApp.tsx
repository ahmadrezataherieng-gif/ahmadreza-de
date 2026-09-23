'use client';

import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import { pickRound, resultBand, ROUND_SIZE, scoreRound, type RoundQuestion, type RoundScore } from '@/components/apps/quiz/quiz';
import { quizQuestions, type QuizOptionId } from '@/content/quiz';
import { selectQuizBest, useQuizStore } from '@/store/quiz-store';
import { cn } from '@/lib/cn';

type Phase =
  | { kind: 'intro' }
  | { kind: 'question'; round: RoundQuestion[]; index: number; answers: (QuizOptionId | null)[] }
  | { kind: 'result'; round: RoundQuestion[]; score: RoundScore; newBest: boolean };

/**
 * The Computer-Quiz (Phase 9B, DECISIONS.md 55): ten questions a round, each
 * going back to one era's one truth, with a short explanation after every
 * answer. It measures knowledge of computer history and basics, never the
 * visitor, and says so. The best score stays in this browser (`quiz-store`).
 *
 * Right and wrong are carried by words and a glyph as well as colour, the
 * options are real buttons, and one live region announces each verdict and
 * the final score, so the quiz plays the same by mouse, keyboard, touch and
 * screen reader.
 */
export function QuizApp(props: AppProps) {
  return (
    <AppMessages copy={['quiz']}>
      <Quiz {...props} />
    </AppMessages>
  );
}

function Quiz({ appId }: AppProps) {
  const t = useTranslations('quiz');
  const best = useQuizStore(selectQuizBest);
  const recordRound = useQuizStore((state) => state.recordRound);
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const [announcement, setAnnouncement] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const step = phase.kind === 'question' ? phase.index : -1;

  // Each new question and the result take focus at their heading, so a
  // keyboard or screen-reader user starts reading at the top. Not on mount:
  // the window owns the focus when it opens. The window body is scrolled by
  // hand - scrollIntoView would move the desktop behind the window too.
  useEffect(() => {
    if (!moved.current) return;
    const body = rootRef.current?.closest<HTMLElement>('[data-window-body]');
    if (body) body.scrollTop = 0;
    headingRef.current?.focus({ preventScroll: true });
  }, [phase.kind, step]);

  const startRound = () => {
    moved.current = true;
    setAnnouncement('');
    const round = pickRound(quizQuestions);
    setPhase({ kind: 'question', round, index: 0, answers: round.map(() => null) });
  };

  const answer = (option: QuizOptionId) => {
    if (phase.kind !== 'question' || phase.answers[phase.index] !== null) return;
    const question = phase.round[phase.index];
    if (!question) return;
    const answers = phase.answers.map((chosen, index) => (index === phase.index ? option : chosen));
    setPhase({ ...phase, answers });
    const verdict = option === question.correct ? t('correct') : `${t('wrong')} ${t('rightAnswerIs', { answer: t(`questions.${question.id}.options.${question.correct}`) })}`;
    setAnnouncement(`${verdict} ${t(`questions.${question.id}.explanation`)}`);
  };

  const next = () => {
    if (phase.kind !== 'question') return;
    setAnnouncement('');
    if (phase.index + 1 < phase.round.length) {
      setPhase({ ...phase, index: phase.index + 1 });
      return;
    }
    const score = scoreRound(phase.round, phase.answers);
    const newBest = best !== null && score.score > best;
    recordRound(score.score);
    setPhase({ kind: 'result', round: phase.round, score, newBest });
    setAnnouncement(`${t('result.score', { score: score.score, total: score.total })}. ${t(`result.bands.${resultBand(score.score, score.total)}`)}`);
  };

  return (
    <div ref={rootRef} data-app-content={appId} data-quiz-phase={phase.kind} className="@container min-h-full">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 @min-[520px]:p-6">
        {phase.kind === 'intro' ? (
          <Intro headingRef={headingRef} best={best} total={ROUND_SIZE} onStart={startRound} />
        ) : phase.kind === 'question' ? (
          <Question headingRef={headingRef} phase={phase} onAnswer={answer} onNext={next} />
        ) : (
          <Result headingRef={headingRef} phase={phase} best={best} onAgain={startRound} />
        )}
        <p className="ao-sr-only" role="status" aria-live="polite" data-quiz-announcement="">
          {announcement}
        </p>
      </div>
    </div>
  );
}

const primaryButton =
  'ao-themed inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control border border-accent bg-accent px-5 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none';

type HeadingRef = RefObject<HTMLHeadingElement | null>;

function Intro({ headingRef, best, total, onStart }: { headingRef: HeadingRef; best: number | null; total: number; onStart: () => void }) {
  const t = useTranslations('quiz');
  return (
    <section className="flex flex-col gap-4">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl leading-tight font-bold text-ink outline-none">
        {t('heading')}
      </h2>
      <p className="font-body text-sm leading-relaxed text-ink">{t('intro')}</p>
      <p className="font-body text-xs leading-snug text-muted">{t('scope')}</p>
      {best !== null ? (
        <p data-quiz-best="" className="font-mono text-xs text-muted">
          {t('best', { best, total })}
        </p>
      ) : null}
      <div>
        <button type="button" data-action="quiz-start" onClick={onStart} className={primaryButton}>
          {t('start')}
        </button>
      </div>
    </section>
  );
}

function Question({
  headingRef,
  phase,
  onAnswer,
  onNext,
}: {
  headingRef: HeadingRef;
  phase: Extract<Phase, { kind: 'question' }>;
  onAnswer: (option: QuizOptionId) => void;
  onNext: () => void;
}) {
  const t = useTranslations('quiz');
  const questionId = useId();
  const question = phase.round[phase.index];
  if (!question) return null;
  const chosen = phase.answers[phase.index] ?? null;
  const answered = chosen !== null;
  const right = chosen === question.correct;
  const score = phase.answers.filter((answer, index) => answer !== null && answer === phase.round[index]?.correct).length;
  const last = phase.index + 1 === phase.round.length;

  return (
    <section data-quiz-question={question.id} data-quiz-answered={answered ? (right ? 'right' : 'wrong') : undefined} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-xs text-muted">
          <span data-quiz-progress="">{t('progress', { current: phase.index + 1, total: phase.round.length })}</span>
          <span>{t('scoreSoFar', { score })}</span>
        </p>
        <ol aria-hidden="true" className="flex gap-1">
          {phase.round.map((item, index) => {
            const answer = phase.answers[index];
            return (
              <li
                key={item.id}
                className={cn(
                  'ao-themed h-1.5 flex-1 rounded-full',
                  answer == null ? (index === phase.index ? 'bg-accent-muted' : 'bg-elevated') : answer === item.correct ? 'bg-success' : 'bg-error',
                )}
              />
            );
          })}
        </ol>
      </div>

      <h2 ref={headingRef} id={questionId} tabIndex={-1} className="font-display text-lg leading-snug font-bold text-ink outline-none @min-[480px]:text-xl">
        {t(`questions.${question.id}.question`)}
      </h2>

      <div role="group" aria-labelledby={questionId} className="flex flex-col gap-2">
        {question.options.map((option) => {
          const state = !answered ? 'open' : option === question.correct ? 'right' : option === chosen ? 'wrong' : 'other';
          return (
            <button
              key={option}
              type="button"
              data-quiz-option={option}
              data-quiz-state={state}
              aria-disabled={answered || undefined}
              onClick={() => onAnswer(option)}
              className={cn(
                'ao-themed flex min-h-11 w-full items-center gap-3 rounded-control border px-3 py-2 text-start font-body text-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none',
                state === 'open' && 'cursor-pointer border-edge bg-surface text-ink hover:border-accent hover:bg-elevated',
                state === 'right' && 'border-2 border-success bg-elevated text-ink',
                state === 'wrong' && 'border-2 border-dashed border-error bg-elevated text-ink',
                state === 'other' && 'border-edge text-muted',
              )}
            >
              <Mark state={state} />
              <Label text={t(`questions.${question.id}.options.${option}`)} className="min-w-0 flex-1" />
              {state === 'right' ? <span className="shrink-0 font-mono text-[11px] text-success">{t('rightAnswer')}</span> : null}
              {state === 'wrong' ? <span className="shrink-0 font-mono text-[11px] text-error">{t('yourAnswer')}</span> : null}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div data-quiz-feedback={right ? 'right' : 'wrong'} className="ao-themed flex flex-col gap-2 rounded-control border border-edge bg-elevated p-3">
          <p className={cn('flex items-center gap-2 font-body text-sm font-bold', right ? 'text-success' : 'text-error')}>
            <Mark state={right ? 'right' : 'wrong'} />
            <span>{right ? t('correct') : t('wrong')}</span>
          </p>
          {!right ? (
            <p className="font-body text-sm text-ink">
              {t.rich('rightAnswerIs', { answer: () => <Label text={t(`questions.${question.id}.options.${question.correct}`)} /> })}
            </p>
          ) : null}
          <p className="font-mono text-[11px] tracking-wide text-accent uppercase">{t('era', { era: t(`eras.${question.era}`) })}</p>
          <p className="font-body text-sm leading-relaxed text-ink">{t(`questions.${question.id}.explanation`)}</p>
          <div className="pt-1">
            <button type="button" data-action="quiz-next" onClick={onNext} className={primaryButton}>
              {last ? t('finish') : t('next')}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Result({
  headingRef,
  phase,
  best,
  onAgain,
}: {
  headingRef: HeadingRef;
  phase: Extract<Phase, { kind: 'result' }>;
  best: number | null;
  onAgain: () => void;
}) {
  const t = useTranslations('quiz');
  const { score, total, missedEras } = phase.score;

  return (
    <section data-quiz-result={score} className="flex flex-col gap-4">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl leading-tight font-bold text-ink outline-none">
        {t('result.heading')}
      </h2>
      <p data-quiz-score="" className="font-display text-3xl font-bold text-accent">
        {t('result.score', { score, total })}
      </p>
      <p className="font-body text-sm leading-relaxed text-ink">{t(`result.bands.${resultBand(score, total)}`)}</p>
      <p className="font-mono text-xs text-muted">
        {phase.newBest ? <span className="me-2 text-success">{t('result.newBest')}</span> : null}
        {best !== null ? t('best', { best, total }) : null}
      </p>
      {missedEras.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="font-body text-sm text-ink">{t('result.revisit')}</p>
          <ul data-quiz-missed="" className="flex list-disc flex-col gap-1 ps-5 marker:text-accent">
            {missedEras.map((era) => (
              <li key={era} data-era={era} className="font-body text-sm text-ink">
                {t(`eras.${era}`)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        <button type="button" data-action="quiz-again" onClick={onAgain} className={primaryButton}>
          {t('result.again')}
        </button>
      </div>
    </section>
  );
}

/**
 * An option's words, isolated from the line around them. The direction is
 * set from the script, not left to `dir="auto"`: a label with no letters
 * ("۲، ۵، ۱۰", "192.168.1.20") would otherwise fall back to left to right, and
 * in Persian that reverses an ordered list - the answer itself.
 */
function Label({ text, className }: { text: string; className?: string }) {
  return (
    <bdi dir={isArabicScript(text) ? 'rtl' : 'ltr'} className={className}>
      {text}
    </bdi>
  );
}

/** Any letter or digit from the Arabic block (U+0600 to U+06FF), which Persian uses. */
function isArabicScript(text: string): boolean {
  return [...text].some((char) => {
    const code = char.charCodeAt(0);
    return code >= 0x0600 && code <= 0x06ff;
  });
}

/** A tick, a cross, or an empty ring: the shape says right or wrong, not only the colour. */
function Mark({ state }: { state: 'open' | 'right' | 'wrong' | 'other' }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('h-4 w-4 shrink-0', state === 'right' && 'text-success', state === 'wrong' && 'text-error')} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {state === 'right' ? (
        <path d="M3.5 8.5l3 3 6-7" />
      ) : state === 'wrong' ? (
        <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
      ) : (
        <circle cx="8" cy="8" r="5.5" className="opacity-60" />
      )}
    </svg>
  );
}
