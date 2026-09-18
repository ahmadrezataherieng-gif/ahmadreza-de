'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useUnlockStore } from '@/store/unlock-store';
import { leaveForDesktop } from '@/components/journey/hand-over';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/**
 * Always-visible escape hatch out of Act 1.
 *
 * Non-negotiable UX rule: a recruiter must be able to reach the portfolio at any
 * moment, from any era, without solving anything. It goes to /desktop/, from
 * any era, over a held puzzle or a closed Play-mode gate alike: leaving the page
 * ends both, and `leaveForDesktop` lets a held puzzle drop its history entry
 * first. Back returns to the era the visitor left.
 */
export function SkipToDesktop() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const completeJourney = useUnlockStore((state) => state.completeJourney);

  const handleClick = () => {
    completeJourney();
    leaveForDesktop(viewHref(locale, 'desktop'));
  };

  return (
    <div className="ao-themed ao-chrome-backdrop rounded-control">
      <Button variant="ghost" size="sm" onClick={handleClick} data-action="to-desktop">
        {t('skipToDesktop')}
      </Button>
    </div>
  );
}
