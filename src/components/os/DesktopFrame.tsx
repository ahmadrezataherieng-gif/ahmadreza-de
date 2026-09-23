import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The empty Amonel OS desktop: the wallpaper, the strip along the top that becomes
 * the desktop's top bar, and the seam of light where the eras dissolved, which
 * becomes the taskbar.
 *
 * It is the last frame of the Convergence and the first frame of /desktop/, and
 * it is one component so the two can never drift apart: the hand-over from the
 * journey to the desktop is a navigation between two pages that paint the same
 * picture (DECISIONS.md 49). Sizes are container units of the enclosing
 * full-viewport size container - `.ao-conv-stage` in the journey,
 * `.ao-desktop-screen` on the desktop.
 *
 * No hooks, so the server renders it on the desktop page and the Convergence
 * (a client component) renders it too.
 */
export function DesktopFrame({
  label,
  seamClassName,
  children,
}: {
  /** An accessible name, where the frame is a picture (the Convergence). */
  label?: string;
  /** The seam's opacity: scrubbed in the Convergence, at rest on the desktop. */
  seamClassName: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="ao-desktop-wallpaper absolute inset-0 overflow-hidden rounded-window border border-edge shadow-window"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <div className="absolute inset-x-0 top-0 h-[3.5cqh] border-b border-edge bg-surface/60" />
      <div
        className={cn(
          'absolute inset-x-[18%] bottom-[9cqh] h-px bg-accent shadow-[0_0_24px_var(--ao-color-glow)]',
          seamClassName,
        )}
      />
      {children}
    </div>
  );
}
