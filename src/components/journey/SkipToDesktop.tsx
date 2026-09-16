'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useUnlockStore } from '@/store/unlock-store';
import { scrollToPageEnd } from '@/lib/lenis-controller';
import { requestPuzzleRelease } from '@/components/puzzles/hold';

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
    // A puzzle may be holding the page; let it go before leaving.
    requestPuzzleRelease();
    // Until the Phase 6 shell exists, "the desktop" is the empty AhmadOS desktop
    // at the end of the Convergence. A frame later: the release has committed
    // by then, and a stopped Lenis would ignore the scroll.
    requestAnimationFrame(() => scrollToPageEnd());
    onSkip?.();
  };

  return (
    <div className="ao-themed ao-chrome-backdrop rounded-control">
      <Button variant="ghost" size="sm" onClick={handleClick}>
        {t('skipToDesktop')}
      </Button>
    </div>
  );
}
