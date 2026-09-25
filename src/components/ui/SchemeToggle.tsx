'use client';

import { useEffect, useState } from 'react';
import { SCHEME_KEY, type Scheme } from '@/lib/scheme';
import { cn } from '@/lib/cn';

/**
 * The sun/moon toggle in the header corner of the site's own pages. A real
 * <button>, so the keyboard works. Server-rendered as dark (the default); the
 * head script has already set data-scheme before paint, and the effect only
 * syncs the icon and label. The labels come in as props: the 404 page has no
 * message provider.
 */
export function SchemeToggle({
  labels,
  className,
}: {
  labels: { toLight: string; toDark: string };
  className?: string;
}) {
  const [scheme, setScheme] = useState<Scheme>('dark');

  useEffect(() => {
    setScheme(document.documentElement.dataset.scheme === 'light' ? 'light' : 'dark');
  }, []);

  function toggle() {
    const next: Scheme = scheme === 'light' ? 'dark' : 'light';
    setScheme(next);
    if (next === 'light') document.documentElement.dataset.scheme = 'light';
    else delete document.documentElement.dataset.scheme;
    try {
      localStorage.setItem(SCHEME_KEY, next);
    } catch {
      // Storage blocked: the choice holds for this page view only.
    }
  }

  const label = scheme === 'light' ? labels.toDark : labels.toLight;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'ao-themed inline-flex size-8 shrink-0 items-center justify-center rounded-control border border-transparent text-muted transition-colors duration-150 hover:border-edge hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {scheme === 'light' ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
