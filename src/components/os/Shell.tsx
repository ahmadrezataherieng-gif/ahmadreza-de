'use client';

import { useEffect, useState } from 'react';

import { DesktopShell } from '@/components/os/DesktopShell';
import { MobileShell } from '@/components/os/MobileShell';
import { useShellLayout } from '@/components/os/use-shell-layout';
import { clearJourneyReplay } from '@/lib/returning';
import { useUnlockStore } from '@/store/unlock-store';

/**
 * The Amonel OS shell, mounted over the empty desktop the server painted.
 *
 * Arriving here is finishing the journey, as Zum Desktop always was: the
 * visitor becomes a returning visitor, and a replay the tab asked for is over.
 * The shell's parts fade in one frame after mounting (`data-shell-ready`), so
 * the first frame is exactly the frame the Convergence ended on.
 */
export function Shell() {
  const layout = useShellLayout();
  const completeJourney = useUnlockStore((state) => state.completeJourney);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    completeJourney();
    clearJourneyReplay();
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [completeJourney]);

  return (
    <div className="absolute inset-0" data-shell="" data-shell-ready={ready ? '' : undefined} data-shell-layout={layout}>
      {layout === 'desktop' ? <DesktopShell /> : <MobileShell />}
    </div>
  );
}
