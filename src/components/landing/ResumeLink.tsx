import { getTranslations } from 'next-intl/server';
import { RESUME } from '@/content/profile';

/**
 * Résumé download, tucked into the header corner.
 *
 * Until the PDF exists this renders as disabled text rather than a link, so
 * nobody clicks into a 404 and no crawler records a broken link. Setting
 * RESUME.available turns it into a real download with no other change.
 */
export async function ResumeLink() {
  const t = await getTranslations('landing');
  const className =
    'ao-themed inline-flex items-center gap-1.5 rounded-control border border-edge px-2.5 py-1.5 font-mono text-xs';

  if (!RESUME.available) {
    return (
      <span className={`${className} cursor-not-allowed text-muted opacity-70`} aria-disabled="true" title={t('resumePending')}>
        <DocumentGlyph />
        <span className="hidden sm:inline">{t('resumePending')}</span>
        <span className="sr-only sm:hidden">{t('resumePending')}</span>
      </span>
    );
  }

  return (
    <a href={RESUME.href} download className={`${className} text-ink hover:border-accent hover:text-accent`}>
      <DocumentGlyph />
      <span className="hidden sm:inline">{t('resume')}</span>
      <span className="sr-only sm:hidden">{t('resume')}</span>
    </a>
  );
}

function DocumentGlyph() {
  return (
    <svg viewBox="0 0 12 14" className="h-3.5 w-3" aria-hidden="true">
      <path d="M1 1h6l4 4v8H1z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 1v4h4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
