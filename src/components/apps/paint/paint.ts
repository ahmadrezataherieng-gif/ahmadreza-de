/**
 * Pixel Paint (Phase 9D-1, DECISIONS.md 57), unlocked by the 1984 puzzle: the
 * GUI made pictures something anyone could draw. The image model, palettes,
 * tools, history and the autosave format as pure functions, so plain node
 * tests them (`scripts/test/paint.test.mjs`).
 *
 * An image is one palette index per pixel - exactly how indexed-colour
 * hardware stored it - so switching palettes is a real change of colour depth.
 *
 * The palettes are the drawing's pixel data, not the site's design: they are
 * computed here from the rules the hardware used, never typed as colour values,
 * and the app's own chrome still reads the theme tokens.
 */

export const sizes = [16, 32, 64] as const;
export type CanvasSize = (typeof sizes)[number];

export type Rgb = readonly [number, number, number];

export const paletteIds = ['bit1', 'ega16', 'vga256'] as const;
export type PaletteId = (typeof paletteIds)[number];

export interface Palette {
  id: PaletteId;
  /** Bits per pixel: 1, 4 or 8. */
  depth: 1 | 4 | 8;
  colors: readonly Rgb[];
  /** Index a new or cleared canvas is filled with, and the eraser paints. */
  background: number;
  /** Index selected when the palette is chosen. */
  ink: number;
  /** Swatch grid columns. */
  columns: number;
}

/** 1 bit: black and white, as on the first Macintosh. */
const BIT1: readonly Rgb[] = [
  [0, 0, 0],
  [255, 255, 255],
];

/**
 * 4 bits, the 16 colours of CGA's text mode and EGA's default palette, from
 * the RGBI rule: each of red, green and blue adds two thirds of full
 * brightness, intensity adds one third to all three. Colour 6 is the one
 * exception - the monitor turned dark yellow into brown by halving its green.
 */
function rgbi(index: number): Rgb {
  const intensity = index & 8 ? 0x55 : 0;
  const red = (index & 4 ? 0xaa : 0) + intensity;
  const green = (index & 2 ? 0xaa : 0) + intensity;
  const blue = (index & 1 ? 0xaa : 0) + intensity;
  return index === 6 ? [red, 0x55, blue] : [red, green, blue];
}
const EGA16: readonly Rgb[] = Array.from({ length: 16 }, (_, index) => rgbi(index));

/**
 * 8 bits: 256 colours. VGA's mode 13h (1987) showed 256 at once, chosen by the
 * program from 262,144; this is one common choice - the 16 above, a 6x6x6
 * colour cube and 24 greys.
 */
const CUBE_STEPS = [0, 95, 135, 175, 215, 255] as const;
const VGA256: readonly Rgb[] = [
  ...EGA16,
  ...Array.from({ length: 216 }, (_, index): Rgb => [
    CUBE_STEPS[Math.floor(index / 36)] ?? 0,
    CUBE_STEPS[Math.floor(index / 6) % 6] ?? 0,
    CUBE_STEPS[index % 6] ?? 0,
  ]),
  ...Array.from({ length: 24 }, (_, index): Rgb => [8 + index * 10, 8 + index * 10, 8 + index * 10]),
];

export const palettes: Readonly<Record<PaletteId, Palette>> = {
  bit1: { id: 'bit1', depth: 1, colors: BIT1, background: 1, ink: 0, columns: 2 },
  ega16: { id: 'ega16', depth: 4, colors: EGA16, background: 15, ink: 0, columns: 8 },
  vga256: { id: 'vga256', depth: 8, colors: VGA256, background: 15, ink: 0, columns: 16 },
};

export function toCss([r, g, b]: Rgb): string {
  return `rgb(${r} ${g} ${b})`;
}

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/** Bytes the raw picture needs at this colour depth: why depth mattered when memory was scarce. */
export function pictureBytes(size: CanvasSize, depth: Palette['depth']): number {
  return (size * size * depth) / 8;
}

/* --- the image --------------------------------------------------------------- */

export interface Picture {
  size: CanvasSize;
  palette: PaletteId;
  pixels: Uint8Array;
}

export function blank(size: CanvasSize, palette: PaletteId): Picture {
  return { size, palette, pixels: new Uint8Array(size * size).fill(palettes[palette].background) };
}

export function isBlank(picture: Picture): boolean {
  const background = palettes[picture.palette].background;
  return picture.pixels.every((value) => value === background);
}

export function inBounds(size: number, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < size && y < size;
}

/** Set pixels; returns the same array when nothing changed, so no-ops cost no history. */
export function paint(pixels: Uint8Array, size: number, points: readonly { x: number; y: number }[], color: number): Uint8Array {
  let next: Uint8Array | null = null;
  for (const { x, y } of points) {
    if (!inBounds(size, x, y)) continue;
    const at = y * size + x;
    if ((next ?? pixels)[at] === color) continue;
    next ??= pixels.slice();
    next[at] = color;
  }
  return next ?? pixels;
}

/** Every cell on the line between two cells (Bresenham), so a fast stroke leaves no gaps. */
export function line(x0: number, y0: number, x1: number, y1: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    points.push({ x, y });
    if (x === x1 && y === y1) return points;
    const twice = 2 * error;
    if (twice >= dy) {
      error += dy;
      x += sx;
    }
    if (twice <= dx) {
      error += dx;
      y += sy;
    }
  }
}

/** The fill bucket: every pixel of the same colour connected to (x, y), by edges. */
export function floodFill(pixels: Uint8Array, size: number, x: number, y: number, color: number): Uint8Array {
  if (!inBounds(size, x, y)) return pixels;
  const target = pixels[y * size + x];
  if (target === color) return pixels;
  const next = pixels.slice();
  const stack = [y * size + x];
  while (stack.length > 0) {
    const at = stack.pop() ?? 0;
    if (next[at] !== target) continue;
    next[at] = color;
    const px = at % size;
    const py = Math.floor(at / size);
    if (px > 0) stack.push(at - 1);
    if (px < size - 1) stack.push(at + 1);
    if (py > 0) stack.push(at - size);
    if (py < size - 1) stack.push(at + size);
  }
  return next;
}

/** The closest colour of a palette, by distance in RGB. */
export function nearest(color: Rgb, palette: readonly Rgb[]): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  palette.forEach(([r, g, b], index) => {
    // Weighted like the eye: green matters most, blue least.
    const distance = 3 * (r - color[0]) ** 2 + 4 * (g - color[1]) ** 2 + 2 * (b - color[2]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

/**
 * The same picture in another palette: every pixel becomes the closest colour
 * there is. Going down to fewer bits loses colour, and that is the lesson.
 */
export function convertPalette(picture: Picture, to: PaletteId): Picture {
  if (picture.palette === to) return picture;
  const from = palettes[picture.palette].colors;
  const target = palettes[to].colors;
  const map = from.map((color) => nearest(color, target));
  return { size: picture.size, palette: to, pixels: picture.pixels.map((index) => map[index] ?? palettes[to].background) };
}

/* --- history ----------------------------------------------------------------- */

/** Enough to take back a whole sketch; at 64 x 64 that is 200 KB at most. */
export const HISTORY_LIMIT = 50;

export interface History {
  past: readonly Picture[];
  present: Picture;
  future: readonly Picture[];
}

export function startHistory(picture: Picture): History {
  return { past: [], present: picture, future: [] };
}

/** A new state; nothing to record when nothing changed. */
export function record(history: History, next: Picture): History {
  if (next === history.present) return history;
  return { past: [...history.past, history.present].slice(-HISTORY_LIMIT), present: next, future: [] };
}

export function undo(history: History): History {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

export function redo(history: History): History {
  const [next, ...future] = history.future;
  if (!next) return history;
  return { past: [...history.past, history.present].slice(-HISTORY_LIMIT), present: next, future };
}

/* --- autosave ------------------------------------------------------------------ */

/**
 * What goes into `amonel.paint.v1`: the size, the palette and the pixels as
 * base64 - at most about 5.5 KB. Anything larger is refused before writing.
 */
export const SAVE_LIMIT = 16 * 1024;

export interface SavedPicture {
  v: 1;
  size: CanvasSize;
  palette: PaletteId;
  pixels: string;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array | null {
  try {
    const binary = atob(text);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

/** The picture as the string to store, or null if it would be over the limit. */
export function encodePicture(picture: Picture): string | null {
  const saved: SavedPicture = { v: 1, size: picture.size, palette: picture.palette, pixels: toBase64(picture.pixels) };
  const text = JSON.stringify(saved);
  return text.length <= SAVE_LIMIT ? text : null;
}

/** A stored picture, or null for anything missing, broken, oversized or foreign. */
export function decodePicture(text: string | null): Picture | null {
  if (typeof text !== 'string' || text.length === 0 || text.length > SAVE_LIMIT) return null;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<Record<keyof SavedPicture, unknown>>;
  if (raw.v !== 1 || typeof raw.pixels !== 'string') return null;
  const size = sizes.find((candidate) => candidate === raw.size);
  const palette = paletteIds.find((candidate) => candidate === raw.palette);
  if (!size || !palette) return null;
  const pixels = fromBase64(raw.pixels);
  if (!pixels || pixels.length !== size * size) return null;
  const colors = palettes[palette].colors.length;
  if (pixels.some((index) => index >= colors)) return null;
  return { size, palette, pixels };
}

/* --- export -------------------------------------------------------------------- */

/** The PNG's side in pixels: 512, so every canvas size scales by a whole number. */
export const EXPORT_SIZE = 512;

export function exportScale(size: CanvasSize): number {
  return EXPORT_SIZE / size;
}
