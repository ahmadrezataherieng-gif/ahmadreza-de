'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { NextIntlClientProvider, useLocale, type AbstractIntlMessages } from 'next-intl';

import type { Locale } from '@/lib/i18n-config';

/**
 * Puzzle copy is loaded on demand, not serialised into the page.
 *
 * Seven puzzles in three languages are a large share of the message files. The
 * journey's server-rendered HTML carries only the namespaces it renders; the
 * puzzle namespace arrives in its own chunk the first time a puzzle mounts, and
 * is handed to a nested provider that only the puzzle layer sees.
 */
const cache = new Map<string, Promise<AbstractIntlMessages>>();

function loadPuzzleMessages(locale: Locale): Promise<AbstractIntlMessages> {
  let pending = cache.get(locale);
  if (!pending) {
    // The apps' own copy (messages/apps/) is not the journey's business.
    pending = import(/* webpackExclude: /[\\/]apps[\\/]/ */ `@/messages/${locale}.json`).then((module: { default: Record<string, AbstractIntlMessages> }) => ({
      puzzles: module.default.puzzles ?? {},
      mode: module.default.mode ?? {},
    }));
    cache.set(locale, pending);
  }
  return pending;
}

export function PuzzleMessages({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const locale = useLocale() as Locale;
  const [loaded, setLoaded] = useState<{ locale: Locale; messages: AbstractIntlMessages } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadPuzzleMessages(locale).then((messages) => {
      if (!cancelled) setLoaded({ locale, messages });
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!loaded || loaded.locale !== locale) return fallback;

  return (
    <NextIntlClientProvider locale={locale} messages={loaded.messages}>
      {children}
    </NextIntlClientProvider>
  );
}
