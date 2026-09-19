'use client';

import { useLocale, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import { leaveForDesktop } from '@/components/journey/hand-over';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/lib/i18n-config';
import { viewHref } from '@/lib/routing';
import { useUnlockStore } from '@/store/unlock-store';

/** One sentence and one button; the copy is its own small file, loaded with this chunk. */
export function AssistantTeaserLine() {
  return (
    <AppMessages copy={['assistant-journey']}>
      <Line />
    </AppMessages>
  );
}

function Line() {
  const t = useTranslations('assistant-journey');
  const locale = useLocale() as Locale;
  const completeJourney = useUnlockStore((state) => state.completeJourney);

  // The same road as "Zum Desktop": leaving ends any held puzzle, and Back returns here.
  const open = () => {
    completeJourney();
    leaveForDesktop(viewHref(locale, 'desktop'));
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <p className="font-body text-sm leading-relaxed text-muted">{t('text')}</p>
      <Button variant="ghost" size="sm" onClick={open} data-action="teaser-assistant">
        {t('cta')}
      </Button>
    </div>
  );
}
