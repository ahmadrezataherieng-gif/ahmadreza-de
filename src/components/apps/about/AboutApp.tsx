'use client';

import { useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import { AboutContent, type AboutText } from '@/components/apps/about/AboutContent';
import { VisitorStats } from '@/components/apps/about/VisitorStats';
import type { AppProps } from '@/components/apps/types';
import type { Locale } from '@/lib/i18n-config';

/**
 * The app a recruiter reads: who Ahmadreza is, his path, what he does now and
 * what he works with (the text itself is `AboutContent`). In its window the
 * visitor numbers sit at the end, watching the last block for when to load.
 * The static About page renders `AboutContent` on the server instead, without
 * any of this (queue 3c): no message provider, no client code.
 */
export function AboutApp(props: AppProps) {
  return (
    <AppMessages copy={['about']}>
      <AboutWithStats {...props} />
    </AppMessages>
  );
}

function AboutWithStats(props: AppProps) {
  const t = useTranslations('about') as unknown as AboutText;
  const locale = useLocale() as Locale;
  const lastRef = useRef<HTMLUListElement>(null);
  return <AboutContent {...props} t={t} locale={locale} languagesRef={lastRef} stats={<VisitorStats observe={lastRef} />} />;
}
