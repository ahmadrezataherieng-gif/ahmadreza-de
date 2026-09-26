import { PortraitImage } from '@/components/ui/PortraitImage';
import { PORTRAIT } from '@/content/profile';

interface PortraitProps {
  alt: string;
  /** The AI disclosure shown inside the frame (DECISIONS 82). */
  aiLabel: string;
  placeholder: string;
  /** The pixel size to supply, already formatted by the caller. */
  dimensions: string;
}

/**
 * The portrait, or a placeholder of exactly the same box until the photo exists.
 *
 * The frame's aspect ratio comes from PORTRAIT's pixel dimensions and does not
 * depend on the image having loaded, so swapping the placeholder for the real
 * photo cannot shift the layout.
 */
export function Portrait({ alt, aiLabel, placeholder, dimensions }: PortraitProps) {
  return (
    <figure className="relative mx-auto w-full max-w-[11rem] sm:max-w-[16rem] md:max-w-none">
      {/* Offset outline behind the frame: a quiet, expensive-looking edge. */}
      <div
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-window border border-accent/40 rtl:-translate-x-3"
        aria-hidden="true"
      />

      <div
        className="relative overflow-hidden rounded-window border border-edge bg-surface shadow-window"
        style={{ aspectRatio: `${PORTRAIT.width} / ${PORTRAIT.height}` }}
      >
        {PORTRAIT.available ? (
          // The frame's widths: 11rem on phones, 16rem from sm, then 5/12 of
          // the grid (about 36vw, at most 27rem once the grid stops growing).
          <PortraitImage
            alt={alt}
            aiLabel={aiLabel}
            priority
            sizes="(min-width: 1152px) 27rem, (min-width: 768px) 36vw, (min-width: 640px) 16rem, 11rem"
          />
        ) : (
          <div className="ao-portrait-placeholder flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="font-display text-7xl font-bold text-edge" aria-hidden="true">
              A
            </span>
            <span className="font-mono text-xs tracking-wide text-muted uppercase">{placeholder}</span>
            <span className="ao-tech font-mono text-[11px] text-muted" dir="ltr">
              {dimensions}
            </span>
          </div>
        )}
      </div>
    </figure>
  );
}
