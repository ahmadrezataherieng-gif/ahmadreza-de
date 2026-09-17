import { getTranslations } from 'next-intl/server';
import { EMAIL } from '@/content/profile';

/**
 * A mailto link - rendered only once the address is confirmed. Until then
 * nothing at all, not even a disabled control: an absent contact route reads
 * better than a broken one.
 */
export async function EmailLink() {
  if (!EMAIL.available) return null;
  const t = await getTranslations('landing');
  return (
    <a
      href={`mailto:${EMAIL.address}`}
      className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-ink uppercase hover:text-accent"
    >
      <svg viewBox="0 0 14 10" className="h-2.5 w-3.5 shrink-0" aria-hidden="true">
        <path d="M1 1h12v8H1zM1 1l6 5 6-5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span>{t('email')}</span>
      <span className="sr-only">: </span>
      <span dir="ltr" className="normal-case">
        {EMAIL.address}
      </span>
    </a>
  );
}
