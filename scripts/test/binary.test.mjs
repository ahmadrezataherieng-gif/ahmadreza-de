// Binary & Morse (Phase 9D-1): the converters, run as they are.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  formatBytes,
  MAX_INPUT,
  maxFlashRate,
  MORSE,
  MORSE_UNIT_MS,
  morseTimeline,
  morseToText,
  parseBytes,
  readSource,
  textToMorse,
  timelineUnits,
  utf8,
  utf8Breakdown,
  utf8Length,
} from '../../src/components/apps/binary/codec.ts';

test('text to binary, hex and decimal', () => {
  const bytes = utf8('Hi!');
  assert.equal(formatBytes(bytes, 'binary'), '01001000 01101001 00100001');
  assert.equal(formatBytes(bytes, 'hex'), '48 69 21');
  assert.equal(formatBytes(bytes, 'decimal'), '72 105 33');
});

test('and back, in every format, with or without spaces and prefixes', () => {
  assert.equal(parseBytes('01001000 01101001', 'binary').text, 'Hi');
  assert.equal(parseBytes('0100100001101001', 'binary').text, 'Hi');
  assert.equal(parseBytes('0b1001000 0b1101001', 'binary').text, 'Hi');
  assert.equal(parseBytes('48 69', 'hex').text, 'Hi');
  assert.equal(parseBytes('4869', 'hex').text, 'Hi');
  assert.equal(parseBytes('0x48,0x69', 'hex').text, 'Hi');
  assert.equal(parseBytes('72, 105', 'decimal').text, 'Hi');
  assert.equal(parseBytes('d8 b3 d9 84 d8 a7 d9 85', 'hex').text, 'سلام');
});

test('round trip for Latin, German, Persian and emoji text', () => {
  for (const text of ['Ahmadreza', 'Grüße aus Trier', 'سلام دنیا', 'Hi 👋', 'e = mc²']) {
    for (const format of ['binary', 'hex', 'decimal']) {
      const result = parseBytes(formatBytes(utf8(text), format), format);
      assert.equal(result.ok && result.text, text, `${format}: ${text}`);
    }
  }
});

test('bad input fails for the real reason', () => {
  assert.deepEqual(parseBytes('', 'binary'), { ok: false, error: 'empty' });
  assert.deepEqual(parseBytes('01201', 'binary'), { ok: false, error: 'invalidDigit' });
  assert.deepEqual(parseBytes('010010001', 'binary'), { ok: false, error: 'incompleteByte' });
  assert.deepEqual(parseBytes('4G', 'hex'), { ok: false, error: 'invalidDigit' });
  assert.deepEqual(parseBytes('486', 'hex'), { ok: false, error: 'incompleteByte' });
  assert.deepEqual(parseBytes('300', 'decimal'), { ok: false, error: 'outOfRange' });
  assert.deepEqual(parseBytes('-1', 'decimal'), { ok: false, error: 'invalidDigit' });
  // A lone continuation byte, or half of a Persian letter, is not UTF-8.
  assert.deepEqual(parseBytes('80', 'hex'), { ok: false, error: 'invalidUtf8' });
  assert.deepEqual(parseBytes('d8', 'hex'), { ok: false, error: 'invalidUtf8' });
  assert.deepEqual(readSource('x'.repeat(MAX_INPUT + 1), 'text'), { ok: false, error: 'tooLong' });
});

test('UTF-8: a Latin letter is 1 byte, a Persian letter 2, an emoji 4', () => {
  const rows = utf8Breakdown('Aسé€😀');
  assert.deepEqual(
    rows.map((row) => [row.char, row.codePoint, row.bytes.length]),
    [
      ['A', 'U+0041', 1],
      ['س', 'U+0633', 2],
      ['é', 'U+00E9', 2],
      ['€', 'U+20AC', 3],
      ['😀', 'U+1F600', 4],
    ],
  );
  assert.deepEqual(rows[1].bytes, [0xd8, 0xb3]);
  assert.deepEqual(rows[4].bytes, [0xf0, 0x9f, 0x98, 0x80]);
  for (const cp of [0x41, 0x7f, 0x80, 0x633, 0x7ff, 0x800, 0x20ac, 0xffff, 0x10000, 0x1f600, 0x10ffff]) {
    assert.equal(utf8Length(cp), utf8(String.fromCodePoint(cp)).length, cp.toString(16));
  }
});

test('Morse: the ITU table is complete and unambiguous', () => {
  for (const letter of 'abcdefghijklmnopqrstuvwxyz0123456789') assert.ok(MORSE[letter], letter);
  const codes = Object.values(MORSE);
  assert.equal(new Set(codes).size, codes.length, 'no code twice');
  for (const code of codes) assert.match(code, /^[.-]{1,7}$/);
  assert.equal(MORSE.s, '...');
  assert.equal(MORSE.o, '---');
  assert.equal(MORSE['0'], '-----');
});

test('Morse: text to code and back', () => {
  assert.deepEqual(textToMorse('SOS'), { code: '... --- ...', unsupported: [] });
  assert.deepEqual(textToMorse('Hi there'), { code: '.... .. / - .... . .-. .', unsupported: [] });
  assert.equal(morseToText('... --- ...').text, 'SOS');
  assert.equal(morseToText('.... .. / - .... . .-. .').text, 'HI THERE');
  assert.equal(morseToText('·–·· ·–').text, 'LA', 'typographic dots and dashes');
  for (const text of ['AMONEL OS', 'CALL 112?', 'A+B=C']) assert.equal(morseToText(textToMorse(text).code).text, text);
});

test('Morse: unsupported characters are named, never guessed', () => {
  assert.deepEqual(textToMorse('Grüße'), { code: '--. .-. .', unsupported: ['ü', 'ß'] });
  const persian = textToMorse('سلام OK');
  assert.deepEqual(persian.unsupported, ['س', 'ل', 'ا', 'م']);
  assert.equal(persian.code, '--- -.-');
  assert.deepEqual(textToMorse('😀😀').unsupported, ['😀']);
  assert.deepEqual(morseToText('... ......... ...').unknown, ['.........']);
});

test('Morse: standard timing, and a light that never flashes 3 times a second', () => {
  const steps = morseTimeline('.- / -');
  assert.deepEqual(steps, [
    { on: true, units: 1 },
    { on: false, units: 1 },
    { on: true, units: 3 },
    { on: false, units: 7 },
    { on: true, units: 3 },
  ]);
  assert.equal(timelineUnits(steps), 15);
  assert.deepEqual(morseTimeline('. .'), [{ on: true, units: 1 }, { on: false, units: 3 }, { on: true, units: 1 }]);
  assert.deepEqual(morseTimeline(''), []);
  assert.ok(maxFlashRate(MORSE_UNIT_MS) < 3, `${maxFlashRate(MORSE_UNIT_MS)} flashes/s`);
  // No "on" step is ever shorter than one unit, so no faster flash exists.
  for (const step of morseTimeline(textToMorse('eeeee iiiii sssss').code)) assert.ok(step.units >= 1);
});
