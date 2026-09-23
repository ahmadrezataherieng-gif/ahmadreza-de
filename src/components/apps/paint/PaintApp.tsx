'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import { capture, useNativeKeydown } from '@/components/apps/use-app-input';
import {
  blank,
  convertPalette,
  decodePicture,
  encodePicture,
  EXPORT_SIZE,
  exportScale,
  floodFill,
  isBlank,
  line,
  nearest,
  paint,
  paletteIds,
  palettes,
  pictureBytes,
  record,
  redo,
  sizes,
  startHistory,
  toCss,
  toHex,
  undo,
  type CanvasSize,
  type History,
  type PaletteId,
  type Picture,
} from '@/components/apps/paint/paint';
import { cn } from '@/lib/cn';
import { STORAGE_KEYS } from '@/lib/constants';

type Tool = 'pencil' | 'eraser' | 'fill' | 'picker';
const TOOLS: readonly Tool[] = ['pencil', 'eraser', 'fill', 'picker'];
type SaveState = 'idle' | 'saved' | 'failed';

/** Wait this long after the last change before writing to storage. */
const SAVE_DELAY_MS = 600;

const button =
  'ao-themed flex min-h-9 cursor-pointer items-center gap-1.5 rounded-control border px-2.5 font-mono text-xs focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40';
const idle = 'border-edge text-ink hover:border-accent';
const active = 'border-accent bg-accent text-background';

const TOOL_GLYPHS: Record<Tool, string> = {
  pencil: 'M3 13l1-3 7-7 2 2-7 7zM10 4l2 2',
  eraser: 'M2.5 10.5l6-6 4 4-4 4H5zM6 13h8',
  fill: 'M3 8l5-5 5 5-5 5zM13 10c0 1 .8 2 1 3',
  picker: 'M10 2.5l3.5 3.5-2 2-3.5-3.5zM8.5 6L3 11.5V13h1.5L10 7.5',
};

function loadSaved(): Picture | null {
  try {
    return decodePicture(window.localStorage.getItem(STORAGE_KEYS.paint));
  } catch {
    return null;
  }
}

/**
 * Pixel Paint (Phase 9D-1, DECISIONS.md 57), unlocked by the 1984 puzzle.
 * Pencil, eraser, fill and picker on a 16, 32 or 64 pixel canvas, in three
 * palettes that are three colour depths: 1, 4 and 8 bits. Mouse, touch and pen
 * share one pointer path; the keyboard moves a cursor over the canvas. The
 * picture autosaves in this browser and downloads as a PNG made right here -
 * nothing is uploaded.
 */
export function PaintApp(props: AppProps) {
  return (
    <AppMessages copy={['paint']}>
      <Paint {...props} />
    </AppMessages>
  );
}

function Paint({ appId }: AppProps) {
  const t = useTranslations('paint');
  const format = useFormatter();
  const id = useId();

  const [history, setHistory] = useState<History>(() => startHistory(loadSaved() ?? blank(32, 'ega16')));
  const picture = history.present;
  // What was on the canvas when the app opened: nothing is written to storage
  // until the visitor changes it, so opening Paint alone stores nothing.
  const opened = useRef(picture);
  const changed = useRef(false);
  const palette = palettes[picture.palette];
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState(() => palettes[picture.palette].ink);
  const [grid, setGrid] = useState(true);
  const [pendingSize, setPendingSize] = useState<CanvasSize | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [announcement, setAnnouncement] = useState('');
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [keyboard, setKeyboard] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const stroke = useRef<{ pointer: number; last: { x: number; y: number }; pixels: Uint8Array } | null>(null);

  /* --- drawing ---------------------------------------------------------------- */

  const draw = useCallback((pixels: Uint8Array, size: number, paletteId: PaletteId) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    if (canvas.width !== size) {
      canvas.width = size;
      canvas.height = size;
    }
    const colors = palettes[paletteId].colors;
    const image = context.createImageData(size, size);
    pixels.forEach((index, at) => {
      const [r, g, b] = colors[index] ?? [0, 0, 0];
      image.data.set([r, g, b, 255], at * 4);
    });
    context.putImageData(image, 0, 0);
  }, []);

  useEffect(() => draw(picture.pixels, picture.size, picture.palette), [picture, draw]);

  /* --- autosave ------------------------------------------------------------------ */

  useEffect(() => {
    if (picture === opened.current && !changed.current) return;
    changed.current = true;
    const timer = window.setTimeout(() => {
      const text = encodePicture(picture);
      try {
        if (text === null) throw new Error('too large');
        window.localStorage.setItem(STORAGE_KEYS.paint, text);
        setSaveState('saved');
      } catch {
        // Quota, private mode or blocked storage: keep painting, say so once.
        setSaveState('failed');
      }
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [picture]);

  /* --- changes -------------------------------------------------------------------- */

  const change = useCallback((next: Picture) => setHistory((current) => record(current, next)), []);

  const applyAt = useCallback(
    (x: number, y: number) => {
      if (tool === 'picker') {
        const picked = picture.pixels[y * picture.size + x];
        if (picked !== undefined) {
          setColor(picked);
          setTool('pencil');
          setAnnouncement(t('announce.picked', { color: toHex(palette.colors[picked] ?? [0, 0, 0]) }));
        }
        return;
      }
      if (tool === 'fill') {
        change({ ...picture, pixels: floodFill(picture.pixels, picture.size, x, y, color) });
        return;
      }
      const ink = tool === 'eraser' ? palette.background : color;
      change({ ...picture, pixels: paint(picture.pixels, picture.size, [{ x, y }], ink) });
    },
    [tool, picture, palette, color, change, t],
  );

  const doUndo = useCallback(() => {
    setHistory((current) => undo(current));
    setAnnouncement(t('announce.undone'));
  }, [t]);
  const doRedo = useCallback(() => {
    setHistory((current) => redo(current));
    setAnnouncement(t('announce.redone'));
  }, [t]);

  const clear = () => {
    change(blank(picture.size, picture.palette));
    setAnnouncement(t('announce.cleared'));
  };

  const choosePalette = (next: PaletteId) => {
    if (next === picture.palette) return;
    const converted = convertPalette(picture, next);
    change(converted);
    setColor(nearest(palette.colors[color] ?? [0, 0, 0], palettes[next].colors));
    setAnnouncement(t('announce.palette', { name: t(`palettes.${next}.name`) }));
  };

  const applySize = (size: CanvasSize) => {
    change(blank(size, picture.palette));
    setPendingSize(null);
    setCursor({ x: 0, y: 0 });
    setAnnouncement(t('announce.size', { size }));
  };

  const chooseSize = (size: CanvasSize) => {
    if (size === picture.size) return;
    if (isBlank(picture)) applySize(size);
    else setPendingSize(size);
  };

  useEffect(() => {
    if (pendingSize !== null) confirmRef.current?.focus();
  }, [pendingSize]);

  /* --- pointer: mouse, touch and pen alike ----------------------------------------- */

  const cellOf = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * picture.size);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * picture.size);
    return { x: Math.max(0, Math.min(picture.size - 1, x)), y: Math.max(0, Math.min(picture.size - 1, y)) };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    setKeyboard(false);
    const cell = cellOf(event);
    if (tool === 'pencil' || tool === 'eraser') {
      capture(event.currentTarget, event.pointerId);
      const ink = tool === 'eraser' ? palette.background : color;
      const pixels = paint(picture.pixels, picture.size, [cell], ink);
      stroke.current = { pointer: event.pointerId, last: cell, pixels };
      draw(pixels, picture.size, picture.palette);
    } else {
      applyAt(cell.x, cell.y);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const current = stroke.current;
    if (!current || current.pointer !== event.pointerId) return;
    const cell = cellOf(event);
    if (cell.x === current.last.x && cell.y === current.last.y) return;
    const ink = tool === 'eraser' ? palette.background : color;
    const pixels = paint(current.pixels, picture.size, line(current.last.x, current.last.y, cell.x, cell.y), ink);
    stroke.current = { ...current, last: cell, pixels };
    draw(pixels, picture.size, picture.palette);
  };

  // One stroke is one step of undo.
  const endStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const current = stroke.current;
    if (!current || current.pointer !== event.pointerId) return;
    stroke.current = null;
    if (current.pixels !== picture.pixels) change({ ...picture, pixels: current.pixels });
  };

  /* --- keyboard ----------------------------------------------------------------------- */

  // The canvas: arrows move a cursor, Space or Enter uses the tool there.
  const onCanvasKey = (event: ReactKeyboardEvent<HTMLCanvasElement>) => {
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const move = moves[event.key];
    if (move && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      event.stopPropagation();
      setKeyboard(true);
      const step = event.shiftKey ? 4 : 1;
      setCursor((at) => ({
        x: Math.max(0, Math.min(picture.size - 1, at.x + move[0] * step)),
        y: Math.max(0, Math.min(picture.size - 1, at.y + move[1] * step)),
      }));
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      setKeyboard(true);
      applyAt(cursor.x, cursor.y);
    }
  };

  // Undo and redo anywhere in the app, as every paint program has them.
  useNativeKeydown(rootRef, (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 'z' && !event.shiftKey) {
      event.preventDefault();
      doUndo();
    } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
      event.preventDefault();
      doRedo();
    }
  });

  // The swatches: one tab stop, arrows move through the grid (a radio group).
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onSwatchKey = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const columns = palette.columns;
    const count = palette.colors.length;
    const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns };
    const offset = offsets[event.key];
    let next: number | null = null;
    if (offset !== undefined) next = Math.max(0, Math.min(count - 1, index + offset));
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    setColor(next);
    swatchRefs.current[next]?.focus();
  };

  /* --- export -------------------------------------------------------------------------- */

  const download = () => {
    const scale = exportScale(picture.size);
    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) return;
    // Whole blocks per pixel, never smoothing: the PNG is as crisp as the canvas.
    context.imageSmoothingEnabled = false;
    picture.pixels.forEach((index, at) => {
      context.fillStyle = toCss(palette.colors[index] ?? [0, 0, 0]);
      context.fillRect((at % picture.size) * scale, Math.floor(at / picture.size) * scale, scale, scale);
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `amonel-pixel-paint-${picture.size}x${picture.size}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setAnnouncement(t('announce.downloaded'));
    }, 'image/png');
  };

  const cursorPercent = 100 / picture.size;
  const currentColor = palette.colors[color] ?? [0, 0, 0];

  return (
    <div ref={rootRef} data-app-content={appId} className="@container min-h-full">
      <div className="flex flex-col gap-4 p-4 @min-[640px]:flex-row @min-[640px]:items-start">
        {/* The canvas never mirrors: a picture has a left and a right. */}
        <div dir="ltr" className="flex w-full min-w-0 flex-col gap-2 @min-[640px]:max-w-[28rem] @min-[640px]:flex-1">
          <div className="relative aspect-square w-full overflow-hidden rounded-control border border-edge bg-background">
            <canvas
              ref={canvasRef}
              width={picture.size}
              height={picture.size}
              tabIndex={0}
              role="application"
              aria-describedby={`${id}-canvas-help`}
              aria-roledescription={t('canvasRole')}
              aria-label={t('canvasLabel', { size: picture.size, x: cursor.x + 1, y: cursor.y + 1, tool: t(`tools.${tool}`) })}
              data-paint-canvas=""
              data-paint-size={picture.size}
              data-paint-palette={picture.palette}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
              onKeyDown={onCanvasKey}
              onBlur={() => setKeyboard(false)}
              className="ao-paint-canvas absolute inset-0 h-full w-full cursor-crosshair focus-visible:outline-none"
            />
            {grid && picture.size <= 32 ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--ao-color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--ao-color-border)_1px,transparent_1px)] opacity-50"
                style={{ backgroundSize: `${cursorPercent}% ${cursorPercent}%` }}
              />
            ) : null}
            {keyboard ? (
              <div
                aria-hidden="true"
                data-paint-cursor=""
                className="pointer-events-none absolute outline-2 outline-accent"
                style={{ left: `${cursor.x * cursorPercent}%`, top: `${cursor.y * cursorPercent}%`, width: `${cursorPercent}%`, height: `${cursorPercent}%` }}
              />
            ) : null}
          </div>
          <p id={`${id}-canvas-help`} className="font-body text-xs text-muted" dir="auto">
            {t('canvasHelp')}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4 @min-[640px]:w-64 @min-[640px]:shrink-0">
          <div role="group" aria-label={t('toolsLabel')} className="flex flex-wrap gap-1.5">
            {TOOLS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={tool === option}
                data-paint-tool={option}
                onClick={() => setTool(option)}
                className={cn(button, tool === option ? active : idle)}
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
                  <path d={TOOL_GLYPHS[option]} />
                </svg>
                {t(`tools.${option}`)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button type="button" data-action="paint-undo" onClick={doUndo} disabled={history.past.length === 0} className={cn(button, idle)}>
              {t('undo')}
            </button>
            <button type="button" data-action="paint-redo" onClick={doRedo} disabled={history.future.length === 0} className={cn(button, idle)}>
              {t('redo')}
            </button>
            <button type="button" data-action="paint-clear" onClick={clear} disabled={isBlank(picture)} className={cn(button, idle)}>
              {t('clear')}
            </button>
            <button type="button" aria-pressed={grid} data-action="paint-grid" onClick={() => setGrid((on) => !on)} className={cn(button, idle)}>
              {t('grid')}
            </button>
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 font-mono text-xs tracking-wide text-muted uppercase">{t('sizeLabel')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={picture.size === size}
                  data-paint-size-option={size}
                  onClick={() => chooseSize(size)}
                  className={cn(button, picture.size === size ? active : idle)}
                >
                  <bdi dir="ltr">
                    {size} × {size}
                  </bdi>
                </button>
              ))}
            </div>
            {pendingSize !== null ? (
              <div role="alertdialog" aria-labelledby={`${id}-size-confirm`} data-paint-confirm="" className="ao-themed flex flex-col gap-2 rounded-control border border-warning/60 bg-surface p-3">
                <p id={`${id}-size-confirm`} className="font-body text-sm text-ink">
                  {t('sizeConfirm', { size: pendingSize })}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button ref={confirmRef} type="button" data-action="paint-size-confirm" onClick={() => applySize(pendingSize)} className={cn(button, active)}>
                    {t('sizeConfirmYes')}
                  </button>
                  <button type="button" data-action="paint-size-cancel" onClick={() => setPendingSize(null)} className={cn(button, idle)}>
                    {t('sizeConfirmNo')}
                  </button>
                </div>
              </div>
            ) : null}
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 font-mono text-xs tracking-wide text-muted uppercase">{t('paletteLabel')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {paletteIds.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={picture.palette === option}
                  data-paint-palette-option={option}
                  onClick={() => choosePalette(option)}
                  className={cn(button, picture.palette === option ? active : idle)}
                >
                  {t(`palettes.${option}.name`)}
                </button>
              ))}
            </div>
            <p className="font-body text-xs leading-relaxed text-muted" data-paint-palette-note="">
              {t(`palettes.${picture.palette}.note`)}{' '}
              {t('memory', { bytes: format.number(pictureBytes(picture.size, palette.depth)), size: picture.size, depth: palette.depth })}
            </p>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <p id={`${id}-colors`} className="flex items-center gap-2 font-mono text-xs tracking-wide text-muted uppercase">
              {t('colorLabel')}
              <span aria-hidden="true" className="h-4 w-4 rounded-[2px] border border-edge" style={{ backgroundColor: toCss(currentColor) }} />
              <bdi dir="ltr" className="normal-case" data-paint-color={color}>
                {toHex(currentColor)}
              </bdi>
            </p>
            <div
              dir="ltr"
              role="radiogroup"
              aria-labelledby={`${id}-colors`}
              data-paint-swatches={palette.colors.length}
              className={cn('grid gap-px', { 2: 'grid-cols-2', 8: 'grid-cols-8', 16: 'grid-cols-16' }[palette.columns])}
            >
              {palette.colors.map((rgb, index) => (
                <button
                  key={`${picture.palette}-${index}`}
                  ref={(node) => {
                    swatchRefs.current[index] = node;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={color === index}
                  aria-label={t('swatch', { index: index + 1, count: palette.colors.length, hex: toHex(rgb) })}
                  tabIndex={color === index ? 0 : -1}
                  onClick={() => setColor(index)}
                  onKeyDown={(event) => onSwatchKey(event, index)}
                  className={cn(
                    'aspect-square min-h-3 cursor-pointer border focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                    palette.colors.length <= 16 ? 'min-h-7' : '',
                    color === index ? 'z-10 border-accent ring-2 ring-accent' : 'border-edge/40',
                  )}
                  style={{ backgroundColor: toCss(rgb) }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              data-action="paint-download"
              onClick={download}
              className="ao-themed min-h-10 cursor-pointer rounded-control border border-accent bg-accent px-4 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
            >
              {t('download')}
            </button>
            <p className="font-body text-xs leading-relaxed text-muted" data-paint-save={saveState}>
              {saveState === 'failed' ? t('saveFailed') : t('saveNote')}
            </p>
          </div>
        </div>
      </div>
      <p className="ao-sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
