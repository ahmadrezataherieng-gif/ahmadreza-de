// Just enough PNG to look at a screenshot: Chrome hands back 8-bit RGBA, and
// the checks only need to know whether a frame has any content in it.
//
// No dependencies: node:zlib inflates the image data.
import { inflateSync } from 'node:zlib';

/** Decode an 8-bit RGB/RGBA PNG into { width, height, pixels } (RGBA bytes). */
export function decodePng(buffer) {
  let offset = 8; // the signature
  let width = 0;
  let height = 0;
  let channels = 4;
  const data = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const depth = body.readUInt8(8);
      const colorType = body.readUInt8(9);
      if (depth !== 8 || (colorType !== 6 && colorType !== 2)) {
        throw new Error(`unsupported PNG: depth ${depth}, colour type ${colorType}`);
      }
      channels = colorType === 6 ? 4 : 3;
    } else if (type === 'IDAT') {
      data.push(body);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(data));
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * 4);
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const row = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? row[x - channels] : 0;
      const b = previous[x];
      const c = x >= channels ? previous[x - channels] : 0;
      if (filter === 1) row[x] = (row[x] + a) & 0xff;
      else if (filter === 2) row[x] = (row[x] + b) & 0xff;
      else if (filter === 3) row[x] = (row[x] + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        row[x] = (row[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
    }
    for (let x = 0; x < width; x++) {
      const from = x * channels;
      const to = (y * width + x) * 4;
      pixels[to] = row[from];
      pixels[to + 1] = row[from + 1];
      pixels[to + 2] = row[from + 2];
      pixels[to + 3] = channels === 4 ? row[from + 3] : 255;
    }
    previous = row;
  }

  return { width, height, pixels };
}

/**
 * What a frame contains, sampled on a grid: how many distinct colours, and how
 * far the pixels spread from their average. A blank frame - one flat fill, or a
 * gap between two eras - scores near zero on both.
 */
export function frameStats(buffer, step = 12) {
  const { width, height, pixels } = decodePng(buffer);
  const seen = new Set();
  let sum = [0, 0, 0];
  let count = 0;
  const samples = [];

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const at = (y * width + x) * 4;
      const rgb = [pixels[at], pixels[at + 1], pixels[at + 2]];
      samples.push(rgb);
      seen.add((rgb[0] >> 3) << 10 | (rgb[1] >> 3) << 5 | (rgb[2] >> 3));
      sum = [sum[0] + rgb[0], sum[1] + rgb[1], sum[2] + rgb[2]];
      count += 1;
    }
  }

  const mean = sum.map((value) => value / count);
  const variance =
    samples.reduce(
      (total, rgb) => total + rgb.reduce((d, value, index) => d + (value - mean[index]) ** 2, 0),
      0,
    ) / (count * 3);

  return { colours: seen.size, deviation: Math.sqrt(variance), mean, samples: count };
}
