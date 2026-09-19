/**
 * The Worker in front of the static site.
 *
 * `wrangler.jsonc` sends only `/api/*` here (`run_worker_first`); every other
 * path is served from `out/` by Cloudflare's asset layer without running any
 * of this, with `_headers`, `_redirects` and the 404 page exactly as before.
 * The site's own code never imports this folder and never knows it is here.
 */
import { CONTEXT } from './sources.ts';
import { handleAssistant, isAssistantRequest, type Env } from './handler.ts';
import { RateLimiter } from './rate-limit.ts';

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

// One limiter per isolate; see rate-limit.ts for what that does and does not give.
const limiter = new RateLimiter();

// Wrapped, not passed bare: a detached global fetch throws "Illegal invocation" in Workers.
const worker = {
  async fetch(request: Request, env: Env & { ASSETS?: AssetsBinding }): Promise<Response> {
    if (isAssistantRequest(request)) {
      return handleAssistant(request, env, { limiter, context: CONTEXT, now: Date.now, fetchImpl: (input, init) => fetch(input, init) });
    }
    // Unreachable while `run_worker_first` lists only /api/*, but if it ever widens, the site still works.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not found', { status: 404 });
  },
};

export default worker;
