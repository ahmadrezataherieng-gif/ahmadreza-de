'use client';

import { use, type ReactNode } from 'react';
import { NextIntlClientProvider, useLocale, useMessages, type AbstractIntlMessages } from 'next-intl';

import type { Locale } from '@/lib/i18n-config';

/** Apps whose copy lives in `messages/apps/<id>/<locale>.json`. */
export type AppCopyId = 'about' | 'terminal' | 'tickets' | 'traceroute' | 'assistant' | 'assistant-journey' | 'quiz' | 'stats' | 'binary' | 'snake';

/**
 * An app's copy arrives with the app, never with the desktop.
 *
 * The desktop's HTML serialises only the `os` messages; an app's own text is a
 * separate JSON file per app and locale, fetched the first time the app opens
 * and handed to a nested provider under the app's id as namespace
 * (`useTranslations('tickets')`). `use()` suspends until it is there, so the
 * window's own Suspense fallback covers the wait - and a second opening, or a
 * second app sharing the copy (the Terminal reads About's), costs nothing.
 */
const cache = new Map<string, Promise<AbstractIntlMessages>>();

function loadCopy(id: AppCopyId, locale: Locale): Promise<AbstractIntlMessages> {
  const key = `${id}/${locale}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = import(`@/messages/apps/${id}/${locale}.json`).then(
      (module: { default: AbstractIntlMessages }) => module.default,
      // A failed fetch must not take the window down; the app shows its keys.
      () => ({}),
    );
    cache.set(key, pending);
  }
  return pending;
}

export function AppMessages({ copy, children }: { copy: readonly AppCopyId[]; children: ReactNode }) {
  const locale = useLocale() as Locale;
  const parent = useMessages();
  const own = copy.map((id) => [id, use(loadCopy(id, locale))] as const);
  const messages = { ...parent, ...Object.fromEntries(own) };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
