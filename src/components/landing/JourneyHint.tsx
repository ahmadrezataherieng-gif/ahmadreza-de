import { themeToCssVars } from '@/lib/apply-theme';
import { getTheme } from '@/lib/themes';

/**
 * A restrained hint that something unusual follows: seven marks along the foot
 * of the page, the first a warm lamp in the 1946 palette, the rest waiting in
 * the dark, and a cursor after the line. It suggests a timeline without giving
 * away a single era.
 *
 * The lamp's colour comes from the 1946 theme through a scoped custom-property
 * block, like the Convergence chips - no hardcoded amber.
 */
const LAMP_SCOPE_CSS = `[data-theme-scope="era1946"]{${Object.entries(themeToCssVars(getTheme('era1946')))
  .filter(([name]) => name.startsWith('--ao-color-'))
  .map(([name, value]) => `${name}:${value}`)
  .join(';')}}`;

export function JourneyHint({ label }: { label: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 pb-6" aria-hidden="true">
      <style>{LAMP_SCOPE_CSS}</style>
      <div className="flex items-center gap-3 sm:gap-5" dir="ltr">
        <span data-theme-scope="era1946" className="ao-lamp block h-2 w-2" />
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className="block h-1.5 w-1.5 rounded-full border border-edge" />
        ))}
      </div>
      <p className="flex items-center gap-1 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
        {label}
        <span className="ao-cursor inline-block h-3 w-1.5 bg-muted" />
      </p>
    </div>
  );
}
