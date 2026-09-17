import { getTranslations } from 'next-intl/server';
import { RESUME } from '@/content/profile';
import { cn } from '@/lib/cn';

/**
 * Résumé download, in two places: a compact control in the header corner and
 * a quiet link under the name.
 *
 * Until the PDF exists both render as disabled text rather than a link, so
 * nobody clicks into a 404 and no crawler records a broken link. Setting
 * RESUME.available turns them into real downloads with no other change.
 */
export async function ResumeLink({ variant }: { variant: 'header' | 'inline' }) {
  const t = await getTranslations('landing');
  const label = RESUME.available ? t('resume') : t('resumePending');
  const shape =
    variant === 'header'
      ? 'ao-themed inline-flex items-center gap-1.5 rounded-control border border-edge px-2.5 py-1 font-mono text-xs'
      : 'inline-flex items-center gap-1.5 font-mono text-xs tracking-wide uppercase';

  if (!RESUME.available) {
    return (
      <span className={cn(shape, 'cursor-not-allowed text-muted opacity-70')} aria-disabled="true" title={label}>
        <DocumentGlyph />
        {variant === 'header' ? (
          <>
            <span className="hidden sm:inline" aria-hidden="true">
              {t('resumeShort')}
            </span>
            <span className="sr-only">{label}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </span>
    );
  }

  return (
    <a
      href={RESUME.href}
      download
      className={cn(shape, 'text-ink hover:text-accent', variant === 'header' && 'hover:border-accent')}
    >
      <DocumentGlyph />
      {variant === 'header' ? (
        <>
          <span className="hidden sm:inline" aria-hidden="true">
            {t('resumeShort')}
          </span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </a>
  );
}

function DocumentGlyph() {
  return (
    <svg viewBox="0 0 12 14" className="h-3.5 w-3 shrink-0" aria-hidden="true">
      <path d="M1 1h6l4 4v8H1z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 1v4h4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
