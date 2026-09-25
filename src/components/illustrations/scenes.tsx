import { cn } from '@/lib/cn';

/*
 * The large drawings of the site's own pages (BR-09, DECISIONS 75), one per
 * page at most. All decorative: aria-hidden, no text inside, colours only from
 * the --ao-ill-* tokens through the classes of illustrations.css, motion only
 * without reduced motion. Each is used once per page, so its gradient ids are
 * plain constants.
 */

/**
 * The About page's way from Tehran to Trier: a solid route over the curve of
 * the earth, from the east (Tehran, right) to the west (Trier, left) - a map
 * is never mirrored, not even in Persian.
 */
export function RouteScene({ className }: { className?: string }) {
  return (
    <svg className={cn('ill', className)} viewBox="0 0 240 150" aria-hidden="true" focusable="false" direction="ltr">
      <path className="t-cyan" d="M8 138a150 150 0 0 1 224 0M40 138a110 90 0 0 1 160 0" />
      <path className="t-amber" d="M190 84C170 26 80 20 52 64" />
      {/* Tehran */}
      <circle className="t-amber fill glow" cx="190" cy="86" r="4" />
      <circle className="t-amber" cx="190" cy="86" r="9" />
      {/* Trier */}
      <g className="float">
        <path className="body" d="M52 88s-14-12-14-22a14 14 0 0 1 28 0c0 10-14 22-14 22z" />
        <circle className="t-cyan fill glow" cx="52" cy="66" r="4.5" />
      </g>
    </svg>
  );
}

/**
 * The 404 page's lost packet: a computer and a server, the line between them
 * broken, the packet tumbling out of the gap, and the three stars a traceroute
 * prints when no answer comes back.
 */
export function PacketLostScene({ className }: { className?: string }) {
  return (
    <svg className={cn('ill', className)} viewBox="0 0 360 170" aria-hidden="true" focusable="false" direction="ltr">
      {/* The computer. */}
      <rect className="body" x="10" y="40" width="86" height="64" rx="9" />
      <rect className="screen" x="19" y="49" width="68" height="40" rx="5" />
      <path className="t-mint glow" d="M28 60h22M28 70h36" />
      <rect className="t-amber fill blink" x="28" y="76" width="6" height="8" rx="1" />
      <path className="t-edge" d="M53 104v10M36 118h34" />
      {/* The server. */}
      <rect className="body" x="270" y="30" width="80" height="36" rx="7" />
      <rect className="body" x="270" y="74" width="80" height="36" rx="7" />
      <circle className="t-mint fill" cx="286" cy="48" r="3" />
      <circle className="t-amber fill" cx="286" cy="92" r="3" />
      <path className="t-edge" d="M300 48h36M300 92h36" />
      {/* The line, broken in the middle. */}
      <path className="t-cyan flow" d="M100 72h58" />
      <path className="t-cyan flow" d="M214 72h52" opacity=".45" />
      <path className="t-edge" d="M160 64l6 16M206 64l-6 16" />
      {/* The packet, falling. */}
      <g className="fall">
        <g transform="rotate(-14 183 124)">
          <rect className="body" x="168" y="112" width="30" height="22" rx="3" />
          <path className="t-amber" d="M168 115l15 10 15-10" />
        </g>
      </g>
      {/* * * * */}
      <path
        className="t-amber"
        d="M168 26v10M163 28.5l10 5M163 33.5l10-5M183 26v10M178 28.5l10 5M178 33.5l10-5M198 26v10M193 28.5l10 5M193 33.5l10-5"
      />
      <circle className="star twinkle" cx="136" cy="140" r="1.3" />
      <circle className="star twinkle" cx="236" cy="150" r="1.1" />
      <circle className="star twinkle" cx="244" cy="20" r="1.4" />
    </svg>
  );
}
