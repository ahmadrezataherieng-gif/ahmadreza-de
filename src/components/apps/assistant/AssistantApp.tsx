'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import { typingStep, type Phase } from '@/components/apps/assistant/assistant';
import type { AppProps } from '@/components/apps/types';
import { useFocusOnFinePointer, useKeyboardInset, useNativeKeydown } from '@/components/apps/use-app-input';
import { takeWaitingQuestion, onQuestion } from '@/lib/app-handoff';
import { MAX_QUESTION_LENGTH, type AssistantLocale } from '@/lib/assistant-limits';
import type { Locale } from '@/lib/i18n-config';
import { asStringList } from '@/lib/message-shapes';
import { search } from '@/lib/search/engine';
import { loadPassages } from '@/lib/search/load';
import type { Passage, PassageSource } from '@/lib/search/types';

/** How long the "searching" state shows, so it is a real, visible state and not a flash. */
const SEARCH_DELAY_MS = 350;
const TYPING_TICK_MS = 30;
/** At most this many passages in one answer: the best one, typed out, plus one more for context. */
const RESULT_LIMIT = 2;
/** The counter appears only when the visitor is close to the cap. */
const COUNT_FROM = MAX_QUESTION_LENGTH - 80;

interface Result {
  text: string;
  label: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  results: Result[];
  noMatch: boolean;
  animate: boolean;
}

export function AssistantApp(props: AppProps) {
  return (
    <AppMessages copy={['assistant']}>
      <Assistant {...props} />
    </AppMessages>
  );
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function sourceLabel(t: (key: string, values?: Record<string, string>) => string, source: PassageSource): string {
  switch (source.kind) {
    case 'era':
      return t('source.era', { year: source.year });
    case 'ticket':
      return t('source.ticket', { number: source.number });
    default:
      return t(`source.${source.kind}`);
  }
}

function Assistant({ appId }: AppProps) {
  const t = useTranslations('assistant');
  const locale = useLocale() as Locale;
  const [passages, setPassages] = useState<Passage[] | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [recall, setRecall] = useState<number | null>(null);
  const asked = useRef<string[]>([]);
  const nextId = useRef(1);
  const alive = useRef(true);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inset = useKeyboardInset();

  const examples = asStringList(t.raw('examples'));

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // The index is built once per locale, from the site's own content; nothing is fetched from a server.
  useEffect(() => {
    void loadPassages(locale as AssistantLocale).then((loaded) => {
      if (alive.current) setPassages(loaded);
    });
  }, [locale]);

  // Newest message in view; the log scrolls itself (scrollIntoView would move the window body too).
  useLayoutEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, phase, inset]);

  useFocusOnFinePointer(inputRef);

  const add = (message: Omit<Message, 'id'>) => setMessages((all) => [...all, { ...message, id: nextId.current++ }]);

  const ask = async (raw: string) => {
    const question = raw.trim();
    if (question === '' || phase === 'searching' || !passages) return;
    asked.current.push(question);
    add({ role: 'user', text: question, results: [], noMatch: false, animate: false });
    setInput('');
    setRecall(null);
    setPhase('searching');

    await new Promise((resolve) => setTimeout(resolve, reducedMotion() ? 0 : SEARCH_DELAY_MS));
    if (!alive.current) return;

    const hits = search(question, passages, RESULT_LIMIT);
    const animate = !reducedMotion();
    if (hits.length > 0) {
      const results = hits.map((hit) => ({ text: hit.passage.text, label: sourceLabel(t, hit.passage.source) }));
      add({ role: 'assistant', text: '', results, noMatch: false, animate });
      setPhase('answered');
    } else {
      add({ role: 'assistant', text: '', results: [], noMatch: true, animate });
      setPhase('noMatch');
    }
  };

  // A question put to the Assistant from elsewhere (the Terminal's `ask`, APP-13):
  // answered as soon as the index is ready, whether this window was open already
  // or has just opened for it. The ref keeps the listener on the latest `ask`.
  const askRef = useRef(ask);
  useEffect(() => {
    askRef.current = ask;
  });
  useEffect(() => {
    if (!passages) return;
    const answerWaiting = () => {
      const waiting = takeWaitingQuestion();
      if (waiting) void askRef.current(waiting);
    };
    answerWaiting();
    return onQuestion(answerWaiting);
  }, [passages]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(input);
  };

  /** Arrow up and down step through earlier questions; handled on the field itself, see `useNativeKeydown`. */
  const onKeyDown = (event: KeyboardEvent) => {
    const plain = !event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey;
    if (!plain || asked.current.length === 0) return;
    const history = asked.current;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      const next = recall === null ? history.length - 1 : Math.max(0, recall - 1);
      setRecall(next);
      setInput(history[next] ?? '');
    } else if (event.key === 'ArrowDown' && recall !== null) {
      event.preventDefault();
      event.stopPropagation();
      const next = recall + 1;
      setRecall(next >= history.length ? null : next);
      setInput(next >= history.length ? '' : (history[next] ?? ''));
    }
  };
  useNativeKeydown(inputRef, onKeyDown);

  const ready = passages !== null;
  const busy = phase === 'searching' || !ready;
  const length = Array.from(input).length;
  const showChips = messages.length === 0 || phase === 'noMatch';

  return (
    <div
      data-app-content={appId}
      data-assistant-state={phase}
      className="flex h-full min-h-0 flex-col bg-background font-body text-sm text-ink"
      style={inset > 0 ? { paddingBottom: inset } : undefined}
    >
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={t('log')}
        data-assistant-log=""
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-3"
      >
        <Banner />
        {messages.length === 0 ? <p className="max-w-prose leading-relaxed text-muted">{t('intro')}</p> : null}
        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        {showChips ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted">{t('suggestions')}</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={example}
                  type="button"
                  data-action="assistant-example"
                  data-example={index}
                  disabled={busy}
                  onClick={() => void ask(example)}
                  className="ao-themed min-h-9 cursor-pointer rounded-control border border-edge px-2.5 text-start text-accent hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-default disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <p role="status" data-assistant-status="" className="shrink-0 border-t border-edge bg-surface px-3 py-1.5 text-xs text-muted">
        {t(`status.${phase}`)}
      </p>

      <form onSubmit={onSubmit} className="flex shrink-0 items-center gap-2 border-t border-edge bg-surface px-3 py-2">
        <label htmlFor={`${appId}-input`} className="ao-sr-only">
          {t('form.label')}
        </label>
        <input
          ref={inputRef}
          id={`${appId}-input`}
          data-assistant-input=""
          dir="auto"
          value={input}
          maxLength={MAX_QUESTION_LENGTH}
          placeholder={t('form.placeholder')}
          onChange={(event) => {
            setInput(event.target.value);
            setRecall(null);
          }}
          aria-describedby={`${appId}-hint`}
          autoComplete="off"
          autoCapitalize="sentences"
          spellCheck={false}
          enterKeyHint="send"
          className="min-h-9 min-w-0 flex-1 rounded-control border border-edge bg-background px-2 text-ink caret-accent outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          data-action="assistant-send"
          disabled={busy || input.trim() === ''}
          className="ao-themed min-h-9 shrink-0 cursor-pointer rounded-control bg-accent px-3 font-medium text-background focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-default disabled:opacity-50"
        >
          {t('form.send')}
        </button>
        <span id={`${appId}-hint`} className="ao-sr-only">
          {t('form.hint')}
          {length >= COUNT_FROM ? ` ${t('form.count', { count: length, max: MAX_QUESTION_LENGTH })}` : ''}
        </span>
      </form>
      {length >= COUNT_FROM ? (
        <p className="shrink-0 bg-surface px-3 pb-1 text-end text-xs text-muted" aria-hidden="true">
          {t('form.count', { count: length, max: MAX_QUESTION_LENGTH })}
        </p>
      ) : null}
      <p data-assistant-privacy="" className="shrink-0 bg-surface px-3 pb-2 text-[11px] leading-snug text-muted">
        {t('privacy')}
      </p>
    </div>
  );
}

/** The one thing a visitor must never be unsure of: this is a search, not an AI. */
function Banner() {
  const t = useTranslations('assistant');
  return (
    <div data-assistant-banner="" className="ao-themed flex items-start gap-2 rounded-control border border-edge bg-elevated px-2.5 py-2 text-xs leading-snug">
      <span data-assistant-badge="" className="shrink-0 rounded-control border border-accent px-1.5 font-mono text-[11px] font-bold tracking-wide text-accent uppercase">
        {t('badge')}
      </span>
      <p dir="auto">{t('banner')}</p>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const t = useTranslations('assistant');

  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-0.5" data-assistant-message="user">
        <p className="text-xs text-muted">{t('you')}</p>
        <p dir="auto" className="ao-themed max-w-[85%] rounded-control border border-edge bg-elevated px-3 py-2 leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
      </div>
    );
  }

  if (message.noMatch) {
    return (
      <div className="flex flex-col items-start gap-0.5" data-assistant-message="assistant" data-tone="noMatch">
        <div className="ao-themed max-w-[92%] rounded-control border border-edge bg-surface px-3 py-2 leading-relaxed">
          <p dir="auto">{t('noMatchIntro')}</p>
        </div>
      </div>
    );
  }

  const [primary, ...rest] = message.results;
  if (!primary) return null;

  return (
    <div className="flex flex-col items-start gap-2" data-assistant-message="assistant" data-tone="answer">
      <div className="flex flex-col items-start gap-0.5">
        <p className="text-xs text-muted">{primary.label}</p>
        <div className="ao-themed max-w-[92%] rounded-control border border-edge bg-surface px-3 py-2 leading-relaxed">
          <Typed text={primary.text} animate={message.animate} />
        </div>
      </div>
      {rest.map((result) => (
        <div key={result.label + result.text} className="flex flex-col items-start gap-0.5" data-assistant-secondary="">
          <p className="text-xs text-muted">{result.label}</p>
          <p dir="auto" className="ao-themed max-w-[92%] rounded-control border border-edge bg-surface px-3 py-2 leading-relaxed">
            {result.text}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * An answer, typed out unless the visitor asked for reduced motion (then it is
 * simply there). The finished text is always in the page for a screen reader;
 * only the growing copy is hidden from it.
 */
function Typed({ text, animate }: { text: string; animate: boolean }) {
  const chars = Array.from(text);
  const [shown, setShown] = useState(animate ? 0 : chars.length);

  useEffect(() => {
    if (!animate) return;
    const step = typingStep(chars.length);
    const timer = setInterval(() => {
      setShown((count) => {
        const next = Math.min(chars.length, count + step);
        if (next >= chars.length) clearInterval(timer);
        return next;
      });
    }, TYPING_TICK_MS);
    return () => clearInterval(timer);
  }, [animate, chars.length]);

  const done = shown >= chars.length;
  return (
    <>
      <span className="ao-sr-only">{text}</span>
      <span dir="auto" aria-hidden="true" data-typed={done ? 'done' : 'typing'} className="block break-words whitespace-pre-wrap">
        {done ? text : chars.slice(0, shown).join('')}
      </span>
    </>
  );
}
