import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CrtMonitorProps {
  label: string;
  /**
   * Run the scrubbed power-on sequence. True for 1971, the first screen ever.
   * False for 1981, which inherits a monitor that is already warm.
   */
  powerOn?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * A CRT: bezel, glass, power-on beam, scanlines, bloom, curvature and flicker.
 *
 * Shared by 1971 and 1981 on purpose. Both eras render into the same monitor, so
 * the handoff between them reads as one screen whose phosphor shifts from green
 * to amber when the theme changes - the technology upgrading, not a new slide.
 *
 * Every effect is a CSS layer reading --era-progress and the --ao-fx-* tokens;
 * nothing here runs per-frame JS, and everything animates transform, opacity or
 * filter only.
 */
export function CrtMonitor({ label, powerOn = false, children, className }: CrtMonitorProps) {
  return (
    <div
      className={cn('ao-crt-bezel ao-themed rounded-[1.6rem] p-3 sm:p-5', className)}
      role="group"
      aria-label={label}
    >
      <div className="ao-crt-glass ao-themed relative overflow-hidden rounded-[1.1rem]">
        {/* Power-on: a bright line that expands vertically into the full raster. */}
        {powerOn && (
          <div className="ao-crt-beam pointer-events-none absolute inset-0" aria-hidden="true" />
        )}

        {/* Flicker lives on the inner layer: an animation on opacity would
            override the scrubbed power-on opacity if both sat on one element. */}
        <div className={cn('relative', powerOn && 'ao-crt-screen')}>
          <div className="ao-crt-bloom ao-crt-flicker relative">{children}</div>
        </div>

        <div className="ao-crt-scanlines pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="ao-crt-curve pointer-events-none absolute inset-0" aria-hidden="true" />
      </div>
    </div>
  );
}
