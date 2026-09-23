/**
 * The Worker in front of the static site.
 *
 * `wrangler.jsonc` sends only `/api/*` here (`run_worker_first`); every other
 * path is served from `out/` by Cloudflare's asset layer without running any
 * of this, with `_headers`, `_redirects` and the 404 page exactly as before.
 * The site's own code never imports this folder and never knows it is here.
 *
 * `/api/*` is a plain 404 for now. It is reserved for Phase 9's anonymous
 * per-puzzle counters - the only visitor data this site ever plans to
 * collect, and even that is a count, not a record of who solved what
 * (DECISIONS.md, entry 53). The assistant does not use it: Phase 8B removed
 * the Gemini proxy that used to live here, because the assistant now answers
 * entirely from a search that runs in the visitor's browser. Nothing a
 * visitor types ever reaches this Worker, or anywhere else.
 */
interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

const worker = {
  async fetch(request: Request, env: { ASSETS?: AssetsBinding }): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    // Unreachable while `run_worker_first` lists only /api/*, but if it ever widens, the site still works.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not found', { status: 404 });
  },
};

export default worker;
