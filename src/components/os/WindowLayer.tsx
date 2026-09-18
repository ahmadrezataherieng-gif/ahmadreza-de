'use client';

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Window } from '@/components/os/Window';
import { useWindowStore } from '@/store/window-store';

/**
 * The desktop area windows live in: between the top bar and the taskbar. Its
 * size is measured and handed to the store, which keeps every window inside it
 * - also when the browser window is resized.
 */
export function WindowLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const setArea = useWindowStore((store) => store.setArea);
  const ids = useWindowStore(useShallow((store) => store.windows.map((w) => w.id)));

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const measure = () => setArea({ width: layer.clientWidth, height: layer.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    return () => observer.disconnect();
  }, [setArea]);

  return (
    // The empty layer lets clicks through to the icons below; windows take them.
    <div ref={layerRef} className="pointer-events-none absolute inset-0" data-window-layer="">
      {ids.map((id) => (
        <Window key={id} id={id} />
      ))}
    </div>
  );
}
