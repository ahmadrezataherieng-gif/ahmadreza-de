'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { bitmapPath, bitmapWidth, POINTER } from '@/lib/pixel-art';
import { cn } from '@/lib/cn';
import type { GuidedPointer } from '@/components/puzzles/engine';

interface PuzzleSurfaceProps {
  pointer: GuidedPointer | null;
  eraIndex: number;
  className?: string;
  children: ReactNode;
}

/** The first era with a mouse. Before it, guided mode's "hand" is a ring. */
const FIRST_POINTER_ERA = 5;

interface Placement {
  x: number;
  y: number;
  carry: { width: number; height: number } | null;
}

/**
 * Wraps a puzzle and draws guided playback's simulated pointer over it.
 *
 * The pointer is positioned on the element carrying the step's `data-target`,
 * measured relative to this surface, and moves there with a CSS transition. It
 * never scrolls the page: the scrolling ancestor is adjusted by hand, because
 * `scrollIntoView` would also scroll the document and tear the pinned stage.
 */
export function PuzzleSurface({ pointer, eraIndex, className, children }: PuzzleSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  const targetId = pointer?.target ?? null;
  const carryId = pointer?.carry ?? null;

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || targetId === null) {
      setPlacement(null);
      return;
    }

    const place = () => {
      const element = surface.querySelector<HTMLElement>(`[data-target="${targetId}"]`);
      if (!element) return;
      const origin = surface.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      const carried = carryId
        ? surface.querySelector<HTMLElement>(`[data-target="${carryId}"]`)?.getBoundingClientRect()
        : undefined;
      setPlacement({
        // Physical coordinates: the overlay is anchored top-left in every direction.
        x: rect.left - origin.left + Math.min(rect.width / 2, 28),
        y: rect.top - origin.top + rect.height / 2,
        carry: carried ? { width: carried.width, height: carried.height } : null,
      });
      keepVisible(element);
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(surface);
    return () => observer.disconnect();
  }, [targetId, carryId]);

  const ring = eraIndex < FIRST_POINTER_ERA;

  return (
    <div ref={surfaceRef} className={cn('relative', className)}>
      {children}
      {pointer && placement ? (
        <div
          aria-hidden="true"
          className="ao-guided-pointer pointer-events-none absolute top-0 left-0 z-[var(--ao-z-icons)]"
          style={{ transform: `translate(${placement.x}px, ${placement.y}px)` }}
        >
          {placement.carry ? (
            <span
              className="absolute top-0 left-0 rounded-control border-2 border-dashed border-accent"
              style={{
                width: placement.carry.width,
                height: placement.carry.height,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ) : null}
          {ring ? (
            <span
              className={cn(
                'ao-guided-ring absolute top-0 left-0 block h-9 w-9 rounded-full border-2 border-accent',
                pointer.pressed && 'bg-accent/30',
              )}
            />
          ) : (
            <svg
              viewBox={`0 0 ${bitmapWidth(POINTER)} ${POINTER.length}`}
              width={bitmapWidth(POINTER) * 2}
              height={POINTER.length * 2}
              className={cn('absolute top-0 left-0 block', pointer.pressed && 'translate-y-px')}
              shapeRendering="crispEdges"
            >
              <path d={bitmapPath(POINTER, 'o')} className="fill-background" />
              <path d={bitmapPath(POINTER, 'X')} className="fill-ink" />
            </svg>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Scroll the nearest scrollable ancestor - never the page - to show `element`. */
function keepVisible(element: HTMLElement) {
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const style = getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) {
      const box = parent.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      if (rect.top < box.top) parent.scrollTop -= box.top - rect.top + 12;
      else if (rect.bottom > box.bottom) parent.scrollTop += rect.bottom - box.bottom + 12;
      return;
    }
    parent = parent.parentElement;
  }
}
