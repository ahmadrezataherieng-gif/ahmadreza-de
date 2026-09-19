'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import {
  demoTopicIds,
  interpretReply,
  matchDemoTopic,
  typingStep,
  type AssistantMode,
  type DemoReason,
  type DemoTopic,
  type Outcome,
  type Phase,
} from '@/components/apps/assistant/assistant';
import type { AppProps } from '@/components/apps/types';
import { useFocusOnFinePointer, useKeyboardInset, useNativeKeydown } from '@/components/apps/use-app-input';
import { EMAIL } from '@/content/profile';
import { ASSISTANT_PATH, MAX_QUESTION_LENGTH } from '@/lib/assistant-limits';
import { asStringList } from '@/lib/message-shapes';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n-config';

/** How long the "thinking" state shows for a demo answer, so the state is a real one. */
const DEMO_DELAY_MS = 500;
/** A live request that has not answered by now is offline for the visitor; the Worker's own limit is shorter. */
const REQUEST_TIMEOUT_MS = 15000;
const TYPING_TICK_MS = 30;
/** The counter appears only when the visitor is close to the cap. */
const COUNT_FROM = MAX_QUESTION_LENGTH - 80;

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  tone: 'answer' | 'refused';
  source: 'live' | 'demo';
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

/** One request to the Worker. Never throws: whatever goes wrong is `offline`. */
async function callWorker(init: RequestInit): Promise<Outcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(ASSISTANT_PATH, { ...init, signal: controller.signal, cache: 'no-store' });
    const data: unknown = await response.json().catch(() => null);
    return interpretReply(response.status, data);
  } catch {
    return { kind: 'offline' };
  } finally {
    clearTimeout(timer);
  }
}

function Assistant({ appId }: AppProps) {
  const t = useTranslations('assistant');
  const locale = useLocale() as Locale;
  const [mode, setMode] = useState<AssistantMode>('checking');
  const [reason, setReason] = useState<DemoReason>('notConfigured');
  const [phase, setPhase] = useState<Phase>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [wait, setWait] = useState(0);
  const [recall, setRecall] = useState<number | null>(null);
  const asked = useRef<string[]>([]);
  const nextId = useRef(1);
  const alive = useRef(true);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inset = useKeyboardInset();

  const topics: DemoTopic[] = demoTopicIds.map((id) => ({ id, keywords: asStringList(t.raw(`demo.topics.${id}.keywords`)) }));

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Nothing is sent until the visitor asks, except this: a bare GET that says whether the Worker has a key.
  useEffect(() => {
    void callWorker({ method: 'GET', headers: { accept: 'application/json' } }).then((outcome) => {
      if (!alive.current) return;
      if (outcome.kind === 'ready') {
        setMode('live');
      } else {
        setMode('demo');
        setReason(outcome.kind === 'notConfigured' ? 'notConfigured' : 'offline');
        setPhase(outcome.kind === 'notConfigured' ? 'notConfigured' : 'offline');
      }
    });
  }, []);

  // Newest message in view; the log scrolls itself (scrollIntoView would move the window body too).
  useLayoutEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, phase, inset]);

  useFocusOnFinePointer(inputRef);

  // A rate limit lifts by itself.
  useEffect(() => {
    if (phase !== 'rateLimited' || wait <= 0) return;
    const timer = setTimeout(() => setPhase('idle'), wait * 1000);
    return () => clearTimeout(timer);
  }, [phase, wait]);

  const add = (message: Omit<Message, 'id'>) => setMessages((all) => [...all, { ...message, id: nextId.current++ }]);

  /** A question that got no answer goes back into the field, so it is not lost and not asked twice. */
  const retract = (question: string) => {
    asked.current.pop();
    setMessages((all) => all.slice(0, -1));
    setInput(question);
  };

  const answerDemo = (question: string) => {
    const topic = matchDemoTopic(question, topics);
    const animate = !reducedMotion();
    if (topic) {
      add({ role: 'assistant', text: t(`demo.topics.${topic}.answer`, { email: EMAIL.address }), tone: 'answer', source: 'demo', animate });
      setPhase('answered');
    } else {
      add({ role: 'assistant', text: t('demoRefused'), tone: 'refused', source: 'demo', animate });
      setPhase('refused');
    }
  };

  const ask = async (raw: string) => {
    const question = raw.trim();
    if (question === '' || phase === 'thinking' || mode === 'checking') return;
    asked.current.push(question);
    add({ role: 'user', text: question, tone: 'answer', source: mode === 'live' ? 'live' : 'demo', animate: false });
    setInput('');
    setRecall(null);
    setPhase('thinking');

    if (mode === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, reducedMotion() ? 0 : DEMO_DELAY_MS));
      if (alive.current) answerDemo(question);
      return;
    }

    const outcome = await callWorker({
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ question, locale }),
    });
    if (!alive.current) return;
    const animate = !reducedMotion();

    switch (outcome.kind) {
      case 'answered':
        add({ role: 'assistant', text: outcome.text, tone: 'answer', source: 'live', animate });
        setPhase('answered');
        break;
      case 'refused':
        add({ role: 'assistant', text: outcome.text ?? t('status.refused'), tone: 'refused', source: 'live', animate });
        setPhase('refused');
        break;
      case 'notConfigured':
        // The Worker lost its key or never had one: fall back to the labelled demo, and say why.
        setMode('demo');
        setReason('notConfigured');
        setPhase('notConfigured');
        retract(question);
        break;
      case 'rateLimited':
        setWait(outcome.retryAfter);
        setPhase('rateLimited');
        retract(question);
        break;
      default:
        setPhase('offline');
        retract(question);
    }
  };

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

  const busy = phase === 'thinking' || mode === 'checking' || (phase === 'rateLimited' && wait > 0);
  const length = Array.from(input).length;
  const showChips = mode === 'demo' || messages.length === 0;

  return (
    <div
      data-app-content={appId}
      data-assistant-mode={mode}
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
        <Banner mode={mode} reason={reason} />
        {messages.length === 0 ? <p className="max-w-prose leading-relaxed text-muted">{t('intro')}</p> : null}
        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        {showChips ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted">{t('suggestions')}</p>
            <div className="flex flex-wrap gap-2">
              {demoTopicIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  data-action="assistant-suggest"
                  data-topic={id}
                  disabled={busy}
                  onClick={() => void ask(t(`demo.topics.${id}.question`))}
                  className="ao-themed min-h-9 cursor-pointer rounded-control border border-edge px-2.5 text-start text-accent hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-default disabled:opacity-50"
                >
                  {t(`demo.topics.${id}.question`)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <p role="status" data-assistant-status="" className="shrink-0 border-t border-edge bg-surface px-3 py-1.5 text-xs text-muted">
        {t(`status.${phase}`, { seconds: wait })}
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

/** The one thing a visitor must never be unsure of: is this a real assistant or a demo? */
function Banner({ mode, reason }: { mode: AssistantMode; reason: DemoReason }) {
  const t = useTranslations('assistant.mode');
  const text = mode === 'live' ? t('live') : mode === 'demo' ? (reason === 'offline' ? t('demoOffline') : t('demo')) : t('checking');
  return (
    <div data-assistant-banner="" className="ao-themed flex items-start gap-2 rounded-control border border-edge bg-elevated px-2.5 py-2 text-xs leading-snug">
      {mode === 'checking' ? null : (
        <span
          data-assistant-badge={mode}
          className={cn(
            'shrink-0 rounded-control border px-1.5 font-mono text-[11px] font-bold tracking-wide uppercase',
            mode === 'live' ? 'border-accent bg-accent text-background' : 'border-accent text-accent',
          )}
        >
          {mode === 'live' ? t('liveBadge') : t('demoBadge')}
        </span>
      )}
      <p dir="auto">{text}</p>
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

  const label = message.tone === 'refused' ? t('source.refused') : message.source === 'demo' ? t('source.demo') : t('source.live');
  return (
    <div className="flex flex-col items-start gap-0.5" data-assistant-message="assistant" data-source={message.source} data-tone={message.tone}>
      <p className="text-xs text-muted">
        {message.source === 'demo' ? <span className="font-mono font-bold tracking-wide text-accent uppercase">{t('mode.demoBadge')} · </span> : null}
        {label}
      </p>
      <div className="ao-themed max-w-[92%] rounded-control border border-edge bg-surface px-3 py-2 leading-relaxed">
        <Typed text={message.text} animate={message.animate} />
      </div>
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
