import { PORTRAIT } from '@/content/profile';

interface PortraitImageProps {
  alt: string;
  /** The visible AI disclosure, e.g. "KI-Porträt". */
  aiLabel: string;
  /** The `sizes` attribute: how wide the frame is drawn, so srcset picks the smallest file that is sharp. */
  sizes: string;
  /** The landing's hero image, the page's LCP: fetched early, never lazy. */
  priority?: boolean;
}

const srcSet = (files: readonly { src: string; width: number }[]) => files.map(({ src, width }) => `${src} ${width}w`).join(', ');

/**
 * The portrait and its AI label, filling a frame the caller draws (relative,
 * overflow hidden, 4:5). One component for the landing, the About page and the
 * About window, so the disclosure can never be left off one of them
 * (DECISIONS 82). The label sits inside the frame's bottom end corner, which
 * mirrors in Persian; it is aria-hidden because the alt text already says it.
 * Nothing else is drawn on the photo (DECISIONS 76).
 */
export function PortraitImage({ alt, aiLabel, sizes, priority = false }: PortraitImageProps) {
  return (
    <>
      {/* AVIF first (a quarter to a half of the JPEG's bytes), JPEG for the
          rest. `contents`: the picture adds no box, the img fills the frame. */}
      <picture className="contents">
        <source type="image/avif" srcSet={srcSet(PORTRAIT.sources.avif)} sizes={sizes} />
        {/* A plain img, not next/image: the export is unoptimised anyway, and
            explicit width/height keep the box stable before decode. */}
        <img
          src={PORTRAIT.src}
          srcSet={srcSet(PORTRAIT.sources.jpeg)}
          sizes={sizes}
          width={PORTRAIT.width}
          height={PORTRAIT.height}
          alt={alt}
          // The landing's image is its LCP: fetched early and high. Elsewhere
          // it is small and not the LCP, so lazy: it waits for layout instead
          // of competing with the stylesheet and fonts on a slow line; above
          // the fold that is still the first screen.
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>
      {/* CONTENT-TODO CR-1122 */}
      <span
        aria-hidden="true"
        className="ao-portrait-ai pointer-events-none absolute end-1.5 bottom-1.5 max-w-[calc(100%-0.75rem)] rounded-[3px] px-1.5 py-0.5 text-end font-body text-[10px] font-medium select-none"
      >
        {aiLabel}
      </span>
    </>
  );
}
