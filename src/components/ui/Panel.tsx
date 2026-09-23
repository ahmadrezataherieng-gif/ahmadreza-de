import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Raised panels use the elevated surface and the era's window shadow. */
  elevated?: boolean;
  /** Optional title bar, rendered in the era chrome colours. */
  titleBar?: ReactNode;
  children: ReactNode;
}

/**
 * A bordered surface with the current era's OS look. Every window, dialog and
 * card in Amonel is built on this, so bevels, radii and shadows only ever have
 * to be defined once per theme.
 */
export function Panel({
  elevated = false,
  titleBar,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <div
      className={cn(
        'ao-themed rounded-window border border-edge',
        elevated ? 'bg-elevated shadow-window' : 'bg-surface',
        className,
      )}
      {...rest}
    >
      {titleBar !== undefined && (
        <div className="ao-themed flex items-center gap-2 border-b border-edge bg-chrome px-3 py-1.5 font-mono text-xs tracking-wide text-chrome-ink">
          {titleBar}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
