'use client';

import { useTranslations } from 'next-intl';
import { RESUME } from '@/content/profile';
import { cn } from '@/lib/cn';

/** The taskbar's small résumé control. Disabled until the PDF exists, never a link into a 404. */
export function ResumeControl() {
  const t = useTranslations('os.taskbar');
  const shape = 'ao-themed flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-edge';
  const glyph = (
    <svg viewBox="0 0 12 14" className="h-4 w-3.5" aria-hidden="true">
      <path d="M1 1h6l4 4v8H1z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 1v4h4M3.5 8h5M3.5 10.5h5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );

  if (!RESUME.available) {
    return (
      <span
        role="img"
        aria-label={t('resumePending')}
        title={t('resumePending')}
        data-action="taskbar-resume"
        className={cn(shape, 'cursor-not-allowed text-muted opacity-60')}
      >
        {glyph}
      </span>
    );
  }

  return (
    <a
      href={RESUME.href}
      download
      aria-label={t('resume')}
      title={t('resume')}
      data-action="taskbar-resume"
      className={cn(
        shape,
        'text-ink hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
      )}
    >
      {glyph}
    </a>
  );
}
