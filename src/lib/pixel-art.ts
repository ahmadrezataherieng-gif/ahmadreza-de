/**
 * 1-bit pixel art as readable ASCII bitmaps.
 *
 * Each bitmap is an array of equal-length strings; one character is one pixel.
 * `bitmapPath` turns every run of a given character into a single SVG path, so a
 * 16x16 icon costs one short `d` attribute rather than up to 256 `<rect>`s -
 * which matters, because the page's HTML weight is already a tracked budget.
 *
 * Coordinates are integers in the SVG's own user space. The SVG is then drawn at
 * an integer multiple of its viewBox width, so every pixel lands on whole device
 * pixels and nothing is resampled.
 */

export type Bitmap = readonly string[];

/**
 * Build a path covering every pixel in `bitmap` that equals `ink`.
 * Horizontal runs are merged into one rectangle each.
 */
export function bitmapPath(bitmap: Bitmap, ink: string, offsetX = 0, offsetY = 0): string {
  const parts: string[] = [];

  bitmap.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== ink) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < row.length && row[x] === ink) x += 1;
      parts.push(`M${offsetX + start} ${offsetY + y}h${x - start}v1h${start - x}z`);
    }
  });

  return parts.join('');
}

export function bitmapWidth(bitmap: Bitmap): number {
  return bitmap[0]?.length ?? 0;
}

/**
 * The classic 1984 arrow pointer: black outline ('X'), white fill ('o'),
 * hotspot at the top-left pixel. Reused by 1995, because the pointer is the UI
 * element that persists from this era on.
 */
export const POINTER: Bitmap = [
  'X..........',
  'XX.........',
  'XoX........',
  'XooX.......',
  'XoooX......',
  'XooooX.....',
  'XoooooX....',
  'XooooooX...',
  'XoooooooX..',
  'XooooooooX.',
  'XoooooXXXXX',
  'XooXooX....',
  'XoX.XooX...',
  'XX..XooX...',
  'X....XooX..',
  '.....XooX..',
  '......XX...',
];

/** Document with a folded corner. */
export const ICON_DOCUMENT: Bitmap = [
  '..XXXXXXXXX.....',
  '..XoooooooXX....',
  '..XoooooooXoX...',
  '..XoooooooXooX..',
  '..XoooooooXXXXX.',
  '..XoXXXXXooooX..',
  '..XooooooooooX..',
  '..XoXXXXXXXooX..',
  '..XooooooooooX..',
  '..XoXXXXXXooooX.',
  '..XooooooooooX..',
  '..XoXXXXXXXooX..',
  '..XooooooooooX..',
  '..XooooooooooX..',
  '..XXXXXXXXXXXX..',
  '................',
];

/** Folder with a tab. */
export const ICON_FOLDER: Bitmap = [
  '................',
  '................',
  '.XXXXX..........',
  'XoooooX.........',
  'XXXXXXXXXXXXXXX.',
  'XooooooooooooooX',
  'XooooooooooooooX',
  'XooooooooooooooX',
  'XooooooooooooooX',
  'XooooooooooooooX',
  'XooooooooooooooX',
  'XooooooooooooooX',
  'XooooooooooooooX',
  'XXXXXXXXXXXXXXXX',
  '................',
  '................',
];

/** Two networked machines joined by a cable - the 1984 hint of what 1995 brings. */
export const ICON_NETWORK: Bitmap = [
  '................',
  'XXXXXX....XXXXXX',
  'XooooX....XooooX',
  'XooooX....XooooX',
  'XXXXXX....XXXXXX',
  '..XX........XX..',
  '..XX........XX..',
  '..XXXXXXXXXXXX..',
  '.......XX.......',
  '.......XX.......',
  '.......XX.......',
  '....XXXXXXXX....',
  '....XooooooX....',
  '....XooooooX....',
  '....XXXXXXXX....',
  '................',
];

/** Floppy disk, for the startup volume. */
export const ICON_DISK: Bitmap = [
  'XXXXXXXXXXXXXXX.',
  'XooXoooooooXooXX',
  'XooXoooooooXoooX',
  'XooXoooooooXoooX',
  'XooXXXXXXXXXoooX',
  'XooooooooooooooX',
  'XoXXXXXXXXXXXXoX',
  'XoXooooooooooXoX',
  'XoXooooooooooXoX',
  'XoXooooooooooXoX',
  'XoXooooooooooXoX',
  'XoXooooooooooXoX',
  'XXXXXXXXXXXXXXXX',
  '................',
  '................',
  '................',
];

/** Trash can with a lid. */
export const ICON_TRASH: Bitmap = [
  '......XXXX......',
  '..XXXXXXXXXXXX..',
  '..XooooooooooX..',
  '..XXXXXXXXXXXX..',
  '...XooooooooX...',
  '...XoXooXooXX...',
  '...XoXooXooXX...',
  '...XoXooXooXX...',
  '...XoXooXooXX...',
  '...XoXooXooXX...',
  '...XoXooXooXX...',
  '...XoXooXooXX...',
  '...XooooooooX...',
  '...XXXXXXXXXX...',
  '................',
  '................',
];

/** Menu-bar glyph in the Apple-menu position. A generic spark, not a trademark. */
export const MENU_GLYPH: Bitmap = [
  '...X...',
  '.X.X.X.',
  '..XXX..',
  'XXXXXXX',
  '..XXX..',
  '.X.X.X.',
  '...X...',
];
