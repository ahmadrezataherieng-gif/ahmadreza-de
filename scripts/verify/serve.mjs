// Serve the static export the way Cloudflare will, so the checks can run
// against the real build rather than the dev server.
//
//   node scripts/verify/serve.mjs [--port 3001] [--dir out]
//
// No dependencies: node:http and node:fs. Directory URLs get their index.html
// (`trailingSlash: true`), and anything missing gets the exported 404 page.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
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

createServer((request, response) => {
  const file = resolve(request.url ?? '/');
  if (!file) {
    const notFound = path.join(ROOT, '404.html');
    response.writeHead(404, { 'content-type': TYPES['.html'] });
    if (existsSync(notFound)) createReadStream(notFound).pipe(response);
    else response.end('404');
    return;
  }
  response.writeHead(200, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
