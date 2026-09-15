import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EraTitleProps {
  year: string;
  title: string;
  headingId: string;
  children?: ReactNode;
  className?: string;
  /** Size overrides for eras whose display face is unusually wide. */
  titleClassName?: string;
}

/**
 * The year and heading every era carries. Kept in one place so each era visual
 * only has to decide where it sits, not how it is marked up - the heading is
 * what gives each `<section>` its accessible name and what a crawler reads.
 */
export function EraTitle({
  year,
  title,
  headingId,
  children,
  className,
  titleClassName,
}: EraTitleProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="ao-glow font-mono text-xs tracking-[0.35em] text-muted uppercase sm:text-sm">
        {year}
      </p>
      <h2
        id={headingId}
        className={cn(
          'ao-glow font-display text-2xl leading-tight break-words hyphens-auto text-ink sm:text-3xl lg:text-4xl',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
