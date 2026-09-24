// Serve the static export the way Cloudflare will, so the checks can run
// against the real build rather than the dev server.
//
//   node scripts/verify/serve.mjs [--port 3001] [--dir out] [--headers]
//
// No dependencies: node:http and node:fs. Directory URLs get their index.html
// (`trailingSlash: true`), and anything missing gets the exported 404 page.
// Text responses are gzipped when the browser accepts it, as Cloudflare does
// (it sends brotli, a little smaller), so timings such as vitals.mjs measure
// what a visitor would download (PERF-05).
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createGzip } from 'node:zlib';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, index, all) => {
    if (!arg.startsWith('--')) return pairs;
    const next = all[index + 1];
    pairs.push([arg.slice(2), next && !next.startsWith('--') ? next : true]);
    return pairs;
  }, []),
);
const PORT = Number(args.port ?? 3001);
const ROOT = path.resolve(args.dir ?? 'out');

// `--headers` applies the export's `_headers` the way Cloudflare does (a path
// pattern, then indented `Name: value` lines; `*` matches any rest), so the
// checks can run under the real Content-Security-Policy. Off by default.
const HEADER_RULES = [];
if (args.headers) {
  let current = null;
  for (const line of readFileSync(path.join(ROOT, '_headers'), 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = { pattern: line.trim(), headers: {} };
      HEADER_RULES.push(current);
    } else if (current) {
      const at = line.indexOf(':');
      current.headers[line.slice(0, at).trim().toLowerCase()] = line.slice(at + 1).trim();
    }
  }
}
const headersFor = (urlPath) =>
  Object.assign(
    {},
    ...HEADER_RULES.filter(({ pattern }) =>
      pattern.endsWith('*') ? urlPath.startsWith(pattern.slice(0, -1)) : urlPath === pattern,
    ).map(({ headers }) => headers),
  );

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

const resolve = (urlPath) => {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  // Never leave the export, whatever the request says.
  const full = path.join(ROOT, path.normalize(decoded).replace(/^(\.\.[/\\])+/, ''));
  if (!full.startsWith(ROOT)) return null;
  if (existsSync(full) && statSync(full).isDirectory()) {
    const index = path.join(full, 'index.html');
    return existsSync(index) ? index : null;
  }
  if (existsSync(full)) return full;
  const html = `${full}.html`;
  return existsSync(html) ? html : null;
};

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml']);

/** Streams a file, gzipped when it is text and the request accepts gzip. */
function send(request, response, status, file, headers) {
  const gzip = COMPRESSIBLE.has(path.extname(file)) && /\bgzip\b/.test(request.headers['accept-encoding'] ?? '');
  response.writeHead(status, { ...headers, ...(gzip ? { 'content-encoding': 'gzip', vary: 'Accept-Encoding' } : {}) });
  const stream = createReadStream(file);
  (gzip ? stream.pipe(createGzip({ level: 6 })) : stream).pipe(response);
}

createServer((request, response) => {
  const file = resolve(request.url ?? '/');
  if (!file) {
    const notFound = path.join(ROOT, '404.html');
    if (existsSync(notFound)) send(request, response, 404, notFound, { ...headersFor(request.url ?? '/'), 'content-type': TYPES['.html'] });
    else {
      response.writeHead(404, { 'content-type': 'text/plain' });
      response.end('404');
    }
    return;
  }
  send(request, response, 200, file, {
    ...headersFor((request.url ?? '/').split('?')[0]),
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
