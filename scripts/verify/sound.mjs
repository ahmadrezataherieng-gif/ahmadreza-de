// Every desktop sound, actually rendered (APP-12, queue 5b).
//
//   node scripts/verify/serve.mjs --port 3001
//   node scripts/verify/sound.mjs [--base URL]
//
// The data test (`scripts/test/sound.test.mjs`) checks the recipes as numbers.
// This one runs the real engine code - `scheduleTones` from
// `src/lib/sound-engine.ts`, the function `playSound` uses - on an
// OfflineAudioContext in Chrome for every sound profile and every event, with
// the master volume in front, and measures the samples: not silent (except the
// silent profile), never near clipping, short, no dead air at the start, a
// faded end (no click). Headless Chrome renders offline audio without a sound card.
import { stripTypeScriptTypes } from 'node:module';
import { readFileSync } from 'node:fs';

import { launch } from './cdp.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const BASE = String(args.base ?? 'http://localhost:3001');
// --volume 8: a control run that must fail (the master volume times 8), proving the limits bite.
const VOLUME = Number(args.volume ?? 1);

const soundSource = stripTypeScriptTypes(readFileSync('src/lib/sound.ts', 'utf8'));
const engineSource = stripTypeScriptTypes(readFileSync('src/lib/sound-engine.ts', 'utf8'));

const b = await launch({ width: 1280, height: 800, tag: 'sound' });
await b.goto(`${BASE}/about/`, 1500);

// The two modules as blob modules in the page; the engine's import of './sound.ts' points at the first.
const rendered = await b.evaluate(`(async () => {
  const soundUrl = URL.createObjectURL(new Blob([${JSON.stringify(soundSource)}], { type: 'text/javascript' }));
  const engineUrl = URL.createObjectURL(new Blob([${JSON.stringify(engineSource)}.replace("./sound.ts", soundUrl)], { type: 'text/javascript' }));
  const sound = await import(soundUrl);
  const engine = await import(engineUrl);
  const RATE = 44100;
  const SECONDS = 2;
  const out = [];
  for (const profile of sound.SOUND_PROFILES) {
    for (const event of sound.SOUND_EVENTS) {
      const context = new OfflineAudioContext(1, RATE * SECONDS, RATE);
      const master = context.createGain();
      master.gain.value = sound.MASTER_VOLUME * ${VOLUME};
      master.connect(context.destination);
      const tones = sound.recipe(profile, event);
      engine.scheduleTones(context, master, tones, 0.01);
      const buffer = await context.startRendering();
      const data = buffer.getChannelData(0);
      let peak = 0;
      let first = -1;
      let last = -1;
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i]);
        if (v > peak) peak = v;
        if (v > 0.0005) { if (first < 0) first = i; last = i; }
        sumSquares += data[i] * data[i];
      }
      // The last 50 microseconds before the last tone's scheduled end: the envelope must have faded, or the tone is cut off mid-wave and clicks.
      const endSample = Math.round((0.01 + sound.duration(tones)) * RATE);
      let tailPeak = 0;
      if (tones.length > 0) for (let i = Math.max(0, endSample - Math.round(RATE * 0.00005)); i <= Math.min(data.length - 1, endSample); i++) tailPeak = Math.max(tailPeak, Math.abs(data[i]));
      out.push({ profile, event, tones: tones.length, peak, rms: Math.sqrt(sumSquares / data.length), startsAt: first < 0 ? null : first / RATE, endsAt: last < 0 ? null : last / RATE, tailPeak, max: sound.MAX_SOUND_SECONDS });
    }
  }
  return out;
})()`);

let failed = 0;
const problems = [];
const check = (label, ok, detail = '') => {
  if (!ok) {
    failed += 1;
    problems.push(`FAIL ${label}${detail ? ` :: ${detail}` : ''}`);
  }
};

if (!Array.isArray(rendered)) {
  console.log('FAIL the offline render did not run:', JSON.stringify(rendered));
  b.close();
  process.exit(1);
}
for (const item of rendered) {
  const name = `${item.profile}/${item.event}`;
  if (item.profile === 'silent') {
    check(`${name}: silent is silent`, item.peak === 0, `peak ${item.peak}`);
    continue;
  }
  check(`${name}: audible (peak above 0.005)`, item.peak > 0.005, `peak ${item.peak.toFixed(4)}`);
  check(`${name}: far below clipping (peak under 0.5)`, item.peak < 0.5, `peak ${item.peak.toFixed(4)}`);
  check(`${name}: not a burst of noise (rms under 0.2)`, item.rms < 0.2, `rms ${item.rms.toFixed(4)}`);
  check(`${name}: starts at once (within 60 ms)`, item.startsAt !== null && item.startsAt < 0.06, `starts at ${item.startsAt}`);
  check(`${name}: short (ends within ${item.max} s + 60 ms)`, item.endsAt !== null && item.endsAt <= item.max + 0.06, `ends at ${item.endsAt}`);
  check(`${name}: fades out, no click where it ends (last 0.05 ms under 0.0015)`, item.tailPeak < 0.0015, `tail ${item.tailPeak.toFixed(5)}`);
}
const audible = rendered.filter((item) => item.profile !== 'silent').length;
check('every profile and event was rendered', rendered.length === 8 * 4, `${rendered.length} sounds`);
for (const line of problems) console.log(line);
const failedSounds = new Set(problems.map((line) => line.split(' ')[1].split(':')[0]));
console.log(`sound: ${rendered.length - failedSounds.size}/${rendered.length} sounds passed (${audible} audible, ${rendered.length - audible} silent; ${failed} problems); peak ${Math.max(...rendered.map((item) => item.peak)).toFixed(3)}, longest ${Math.max(...rendered.map((item) => item.endsAt ?? 0)).toFixed(3)} s`);
b.close();
process.exit(failed === 0 ? 0 : 1);
