import { cn } from '@/lib/cn';

import { ICONS, type IconName, type IconPart } from './icons';

/**
 * One icon of the set in icons.ts, drawn by illustrations.css. Always
 * decorative: the text beside it carries the meaning.
 */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  const parts: readonly IconPart[] = ICONS[name];
  return (
    <svg className={cn('ill ill-icon', className)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {parts.map((part) => (
        <path key={part.d} d={part.d} className={cn(part.tone && `t-${part.tone}`, part.fill && 'fill') || undefined} />
      ))}
    </svg>
  );
}

/** The icon in its tinted tile, beside a card or section heading. */
export function IconTile({ name, className }: { name: IconName; className?: string }) {
  return (
    <span className={cn('ill-tile', className)} aria-hidden="true">
      <Icon name={name} />
    </span>
  );
}

/**
 * A learning snippet ("Wussten Sie schon?"): the label, one code line - machine
 * text, the same in every language - and one sentence of real, translated text.
 * A note, not a landmark, so it can sit inside the page's main content.
 */
export function Tip({ label, code, text, className }: { label: string; code: string; text: string; className?: string }) {
  return (
    <div role="note" className={cn('ill-tip ao-themed text-ink', className)}>
      <p className="ill-tip-label font-body">
        <Icon name="bulb" />
        {label}
      </p>
      <code className="ill-tip-code ao-tech font-mono" dir="ltr">
        {code}
      </code>
      <p className="ill-tip-text font-body">{text}</p>
    </div>
  );
}
