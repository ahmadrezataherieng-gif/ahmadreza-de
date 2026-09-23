// Pixel Paint (Phase 9D-1): palettes, tools, history and the autosave format.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  blank,
  convertPalette,
  decodePicture,
  encodePicture,
  EXPORT_SIZE,
  exportScale,
  floodFill,
  HISTORY_LIMIT,
  isBlank,
  line,
  nearest,
  paint,
  paletteIds,
  palettes,
  pictureBytes,
  record,
  redo,
  SAVE_LIMIT,
  sizes,
  startHistory,
  toHex,
  undo,
} from '../../src/components/apps/paint/paint.ts';

test('palettes: 2, 16 and 256 colours for 1, 4 and 8 bits, all distinct', () => {
  for (const id of paletteIds) {
    const palette = palettes[id];
    assert.equal(palette.colors.length, 2 ** palette.depth, id);
    // The 6x6x6 cube repeats pure black and white from the first 16, as the
    // real layout does; nothing else repeats.
    const repeats = id === 'vga256' ? 2 : 0;
    assert.equal(new Set(palette.colors.map(toHex)).size, palette.colors.length - repeats, `${id}: duplicates`);
    assert.ok(palette.background < palette.colors.length && palette.ink < palette.colors.length);
    assert.notEqual(palette.background, palette.ink);
  }
});

test('palettes: the RGBI 16 are the CGA/EGA colours, brown included', () => {
  const ega = palettes.ega16.colors.map(toHex);
  assert.deepEqual(ega.slice(0, 8), ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA']);
  assert.deepEqual(ega.slice(8), ['#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF']);
  assert.deepEqual(palettes.bit1.colors.map(toHex), ['#000000', '#FFFFFF']);
  assert.deepEqual(palettes.vga256.colors.slice(0, 16), palettes.ega16.colors, 'the 256 start with the 16');
});

test('sizes and memory: 16, 32, 64; a 64 x 64 picture is 512 bytes at 1 bit, 4 KB at 8', () => {
  assert.deepEqual([...sizes], [16, 32, 64]);
  assert.equal(pictureBytes(64, 1), 512);
  assert.equal(pictureBytes(64, 4), 2048);
  assert.equal(pictureBytes(64, 8), 4096);
  assert.equal(pictureBytes(16, 1), 32);
});

test('a blank canvas is all background, and knows it', () => {
  const picture = blank(16, 'ega16');
  assert.equal(picture.pixels.length, 256);
  assert.ok(isBlank(picture));
  assert.ok(!isBlank({ ...picture, pixels: paint(picture.pixels, 16, [{ x: 3, y: 3 }], 4) }));
});

test('pencil: sets pixels, ignores out-of-bounds, and a no-op returns the same array', () => {
  const pixels = blank(16, 'bit1').pixels;
  const drawn = paint(pixels, 16, [{ x: 0, y: 0 }, { x: 15, y: 15 }, { x: 16, y: 0 }, { x: -1, y: 2 }], 0);
  assert.equal(drawn[0], 0);
  assert.equal(drawn[255], 0);
  assert.equal(drawn.filter((value) => value === 0).length, 2);
  assert.equal(pixels[0], 1, 'the original is untouched');
  assert.equal(paint(drawn, 16, [{ x: 0, y: 0 }], 0), drawn);
});

test('lines leave no gaps, in every direction', () => {
  assert.deepEqual(line(0, 0, 3, 0), [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }]);
  assert.deepEqual(line(2, 2, 2, 2), [{ x: 2, y: 2 }]);
  for (const [x0, y0, x1, y1] of [[0, 0, 7, 3], [7, 3, 0, 0], [5, 0, 0, 9], [0, 9, 9, 0]]) {
    const points = line(x0, y0, x1, y1);
    assert.deepEqual(points[0], { x: x0, y: y0 });
    assert.deepEqual(points.at(-1), { x: x1, y: y1 });
    for (let index = 1; index < points.length; index += 1) {
      assert.ok(Math.abs(points[index].x - points[index - 1].x) <= 1 && Math.abs(points[index].y - points[index - 1].y) <= 1);
    }
  }
});

test('fill bucket: fills the connected area only, stops at edges and diagonals', () => {
  // A 4x4 canvas split by a vertical wall at x = 2.
  let pixels = blank(16, 'bit1').pixels.slice(0, 16);
  pixels = paint(pixels, 4, [0, 1, 2, 3].map((y) => ({ x: 2, y })), 0);
  const filled = floodFill(pixels, 4, 0, 0, 0);
  for (let y = 0; y < 4; y += 1) {
    assert.equal(filled[y * 4 + 0], 0);
    assert.equal(filled[y * 4 + 1], 0);
    assert.equal(filled[y * 4 + 3], 1, 'the other side of the wall is untouched');
  }
  assert.equal(floodFill(filled, 4, 0, 0, 0), filled, 'same colour: nothing to do');
  // Diagonal neighbours do not connect.
  const diagonal = Uint8Array.from([0, 1, 1, 0]);
  assert.deepEqual([...floodFill(diagonal, 2, 0, 0, 1)], [1, 1, 1, 0]);
  // A full 64 x 64 fill does not overflow the stack.
  assert.ok(floodFill(blank(64, 'vga256').pixels, 64, 10, 10, 3).every((value) => value === 3));
});

test('colour depth: converting keeps the nearest colour, and down to 1 bit loses colour', () => {
  let picture = blank(16, 'ega16');
  picture = { ...picture, pixels: paint(picture.pixels, 16, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], 0) };
  picture = { ...picture, pixels: paint(picture.pixels, 16, [{ x: 1, y: 0 }], 14) };
  const mono = convertPalette(picture, 'bit1');
  assert.equal(mono.palette, 'bit1');
  assert.equal(mono.pixels[0], 0, 'black stays black');
  assert.equal(mono.pixels[1], 1, 'yellow becomes white');
  assert.equal(mono.pixels[3], 1, 'white stays white');
  const rich = convertPalette(picture, 'vga256');
  assert.deepEqual([...rich.pixels.slice(0, 4)], [0, 14, 0, 15], 'the 256 contain the 16 exactly');
  assert.equal(nearest([250, 250, 250], palettes.bit1.colors), 1);
  assert.equal(nearest([20, 20, 30], palettes.bit1.colors), 0);
});

test('undo and redo, with a limit, and no step for a no-op', () => {
  let history = startHistory(blank(16, 'bit1'));
  const first = { ...history.present, pixels: paint(history.present.pixels, 16, [{ x: 1, y: 1 }], 0) };
  history = record(history, first);
  assert.equal(record(history, history.present), history);
  history = undo(history);
  assert.ok(isBlank(history.present));
  history = redo(history);
  assert.equal(history.present, first);
  assert.equal(redo(history), history, 'nothing to redo');
  // A new stroke after undo drops the redo branch.
  history = record(undo(history), blank(16, 'bit1'));
  assert.equal(history.future.length, 0);

  let long = startHistory(blank(16, 'bit1'));
  for (let i = 0; i < HISTORY_LIMIT + 20; i += 1) long = record(long, { ...long.present, pixels: long.present.pixels.slice() });
  assert.equal(long.past.length, HISTORY_LIMIT);
});

test('autosave: round trip for every size and palette, well under the limit', () => {
  for (const size of sizes) {
    for (const id of paletteIds) {
      const picture = blank(size, id);
      picture.pixels[size + 1] = palettes[id].colors.length - 1;
      const text = encodePicture(picture);
      assert.ok(text && text.length < SAVE_LIMIT, `${size} ${id}`);
      const back = decodePicture(text);
      assert.equal(back.size, size);
      assert.equal(back.palette, id);
      assert.deepEqual([...back.pixels], [...picture.pixels]);
    }
  }
});

test('autosave: anything broken or foreign reads as no picture, never a crash', () => {
  const good = JSON.parse(encodePicture(blank(16, 'bit1')));
  const junk = [
    null,
    '',
    'not json',
    '[]',
    '42',
    JSON.stringify({ ...good, v: 2 }),
    JSON.stringify({ ...good, size: 20 }),
    JSON.stringify({ ...good, palette: 'cmyk' }),
    JSON.stringify({ ...good, pixels: '%%%' }),
    JSON.stringify({ ...good, pixels: btoa('\x00\x01') }),
    JSON.stringify({ ...good, pixels: btoa('\x02'.repeat(256)) }),
    'x'.repeat(SAVE_LIMIT + 1),
  ];
  for (const text of junk) assert.equal(decodePicture(text), null, String(text).slice(0, 40));
});

test('export: 512 px, a whole number of pixels per canvas pixel', () => {
  for (const size of sizes) {
    assert.ok(Number.isInteger(exportScale(size)), String(size));
    assert.equal(exportScale(size) * size, EXPORT_SIZE);
  }
});
