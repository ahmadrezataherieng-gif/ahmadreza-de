'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { htmlLang, type Locale } from '@/lib/i18n-config';
import { cn } from '@/lib/cn';

/**
 * Hours and minutes in the visitor's language - Persian digits in Persian, as
 * `fa` formats them. Ticks on the minute, not every second.
 */
export function Clock({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('os.taskbar');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          setNow(new Date());
          schedule();
        },
        60_000 - (Date.now() % 60_000) + 50,
      );
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  const text = new Intl.DateTimeFormat(htmlLang[locale], { hour: '2-digit', minute: '2-digit' }).format(now);

  return (
    <time
      dateTime={now.toISOString()}
      aria-label={`${t('clock')}: ${text}`}
      data-clock=""
      className={cn('font-mono tabular-nums', className)}
    >
      {text}
    </time>
  );
}
