'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useUnlockStore } from '@/store/unlock-store';

/**
 * Always-visible escape hatch out of Act 1.
 *
 * Non-negotiable UX rule: a recruiter must be able to reach the portfolio at any
 * moment, from any era, without solving anything.
 */
export function SkipToDesktop({ onSkip }: { onSkip?: () => void }) {
  const t = useTranslations('nav');
  const completeJourney = useUnlockStore((state) => state.completeJourney);

  const handleClick = () => {
    completeJourney();
    onSkip?.();
  };

  return (
    <div className="ao-themed ao-chrome-backdrop fixed top-4 end-4 z-[var(--ao-z-modal)] rounded-control">
      <Button variant="ghost" size="sm" onClick={handleClick}>
        {t('skipToDesktop')}
      </Button>
    </div>
  );
}
