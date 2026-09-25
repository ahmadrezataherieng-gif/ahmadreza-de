import { PORTRAIT } from '@/content/profile';

interface PortraitProps {
  alt: string;
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
export function Portrait({ alt, placeholder, dimensions }: PortraitProps) {
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
          // A plain img, not next/image: the export is unoptimised anyway, and
          // explicit width/height keep the box stable before decode.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={PORTRAIT.src}
            width={PORTRAIT.width}
            height={PORTRAIT.height}
            alt={alt}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
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
