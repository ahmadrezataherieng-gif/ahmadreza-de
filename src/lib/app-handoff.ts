/**
 * How one app asks the shell to open another and hands it something (APP-13:
 * the Terminal's `ask` puts a question to the Assistant). Two window events
 * and one waiting value, no store and no storage: the shells listen for
 * `OPEN_APP_EVENT` - the window manager and the phone's home screen open apps
 * in different ways, so neither app knows which shell it is in - and the
 * receiving app takes what waited for it once it is mounted and ready.
 * Plain functions, so `node --test` can run the queue.
 */

import type { AppId } from '../content/eras.ts';

export const OPEN_APP_EVENT = 'amonel:open-app';
export const QUESTION_EVENT = 'amonel:ask';

let waitingQuestion: string | null = null;

const emit = (name: string, detail?: unknown) => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(name, { detail }));
};

/** Ask the shell to open an app (a locked one shows its notice, as from an icon). */
export function requestApp(appId: AppId): void {
  emit(OPEN_APP_EVENT, appId);
}

/** Open the Assistant with a question. The last one wins; the Assistant answers it once its index is ready. */
export function askAssistant(question: string): void {
  waitingQuestion = question.trim() === '' ? null : question.trim();
  if (waitingQuestion === null) return;
  requestApp('assistant');
  emit(QUESTION_EVENT);
}

/** What waits for the Assistant, once: taking it clears it. */
export function takeWaitingQuestion(): string | null {
  const question = waitingQuestion;
  waitingQuestion = null;
  return question;
}

/** For the shells: called for every `requestApp`. Returns the unsubscribe. */
export function onOpenAppRequest(handler: (appId: AppId) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<AppId>).detail);
  window.addEventListener(OPEN_APP_EVENT, listener);
  return () => window.removeEventListener(OPEN_APP_EVENT, listener);
}

/** For the Assistant: called when a question is put to it while it may already be open. */
export function onQuestion(handler: () => void): () => void {
  window.addEventListener(QUESTION_EVENT, handler);
  return () => window.removeEventListener(QUESTION_EVENT, handler);
}

/* --- a host for the Traceroute app (APP-16): Ping and DNS offer "trace this host" --- */

export const TRACE_EVENT = 'amonel:trace';

let waitingTrace: string | null = null;

/** Open the Traceroute app and trace a host there. The last one wins. */
export function traceHost(host: string): void {
  waitingTrace = host.trim() === '' ? null : host.trim();
  if (waitingTrace === null) return;
  requestApp('traceroute');
  emit(TRACE_EVENT);
}

/** What waits for the Traceroute app, once: taking it clears it. */
export function takeWaitingTrace(): string | null {
  const host = waitingTrace;
  waitingTrace = null;
  return host;
}

/** For the Traceroute app: called when a host is handed to it while it may already be open. */
export function onTrace(handler: () => void): () => void {
  window.addEventListener(TRACE_EVENT, handler);
  return () => window.removeEventListener(TRACE_EVENT, handler);
}
