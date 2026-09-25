// The desktop's sounds as data, and the engine's promise never to play unasked
// (APP-12). Run as they are: node strips the TypeScript types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  MASTER_VOLUME,
  MAX_SOUND_SECONDS,
  MAX_TONE_GAIN,
  SOUND_EVENTS,
  SOUND_PROFILES,
  duration,
  isSoundProfile,
  recipe,
} from '../../src/lib/sound.ts';
import { canPlaySound, isSoundOn, playSound, setSoundEnabled } from '../../src/lib/sound-engine.ts';
import { themes } from '../../src/lib/themes.ts';

test('every sound profile has a sound for every event, short, soft and in hearing range', () => {
  for (const profile of SOUND_PROFILES) {
    for (const event of SOUND_EVENTS) {
      const tones = recipe(profile, event);
      if (profile === 'silent') {
        assert.deepEqual(tones, [], 'the silent profile makes no sound');
        continue;
      }
      assert.ok(tones.length > 0 && tones.length <= 6, `${profile}/${event}: ${tones.length} tones`);
      assert.ok(duration(tones) <= MAX_SOUND_SECONDS, `${profile}/${event} lasts ${duration(tones)} s`);
      for (const tone of tones) {
        assert.ok(tone.gain > 0 && tone.gain <= MAX_TONE_GAIN, `${profile}/${event} gain ${tone.gain}`);
        assert.ok(tone.length >= 0.02, `${profile}/${event}: a tone shorter than 20 ms clicks`);
        for (const hz of [tone.hz, tone.to ?? tone.hz]) assert.ok(hz >= 60 && hz <= 4000, `${profile}/${event} ${hz} Hz`);
        assert.ok(['sine', 'square', 'triangle'].includes(tone.wave));
      }
    }
  }
  assert.ok(MASTER_VOLUME > 0 && MASTER_VOLUME <= 0.2, 'the master volume is low');
});

test('every theme names a sound profile the desktop knows, and the eras sound different', () => {
  const used = new Set();
  for (const theme of Object.values(themes)) {
    assert.ok(isSoundProfile(theme.sound), `${theme.id} sound "${theme.sound}"`);
    used.add(theme.sound);
  }
  assert.ok(used.size >= 6, 'at least six different sounds across the eight themes');
  assert.notDeepEqual(recipe('pcspeaker', 'open'), recipe('win95', 'open'));
  assert.deepEqual(recipe('nonsense', 'open'), recipe('modern', 'open'), 'an unknown profile gets the modern sound');
  assert.deepEqual(recipe(undefined, 'close'), recipe('modern', 'close'));
});

test('the engine never plays before sound is turned on, and does nothing without Web Audio', () => {
  assert.equal(isSoundOn(), false, 'off at the start');
  assert.doesNotThrow(() => playSound('open'), 'silent and safe while off');
  // Plain node has no window and no AudioContext: turning sound on says it could not, instead of pretending.
  assert.equal(canPlaySound(), false);
  assert.equal(setSoundEnabled(true), false);
  assert.equal(isSoundOn(), false);
  assert.equal(setSoundEnabled(false), false);
});
