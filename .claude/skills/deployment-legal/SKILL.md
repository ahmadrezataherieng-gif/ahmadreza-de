---
name: deployment-legal
description: "Read before changing deployment (Cloudflare Workers, wrangler.jsonc, _headers, _redirects, the domain), before handling any API key or secret (the Gemini key rule, Phase 8 Assistant), before adding or changing any font, or for anything with legal or GDPR weight."
---

### Deployment — Cloudflare, not a VPS

The site deploys to **Cloudflare Workers with static assets**, connected to the
public GitHub repo through Workers Builds. It is **not** a Cloudflare Pages
project: Cloudflare folded Pages into Workers during 2026, and while Pages is
still supported, all new investment goes to Workers and a new account may not
show a Pages tab at all.

Earlier drafts of this project specified nginx on a self-managed VPS. That is
reversed. **Do not reintroduce nginx, systemd or server backups** anywhere.

- `wrangler.jsonc` — `assets.directory: "./out"`, plus one Worker script
  (`main: "worker/index.ts"`) that answers **only `/api/*`**:
  `assets.run_worker_first: ["/api/*"]`. Every other request is served by the
  asset layer without running the Worker, so `_headers`, `_redirects` and the
  404 page behave exactly as in a pure static deploy. The `ASSETS` binding is
  only the Worker's fallback if that list ever widens.
  `html_handling: "auto-trailing-slash"` matches `trailingSlash: true`;
  `not_found_handling: "404-page"` serves Next's `404.html` with a real 404
  status. Do not drop `run_worker_first`: with `not_found_handling` set, an
  unmatched `/api/assistant` would otherwise get the 404 page and the Worker
  would never run.
- `worker/` — the proxy, and the only code that reads the key. It is bundled by
  wrangler, never by Next, and nothing under `src/` may import it (the
  application never knows it is on Cloudflare; without the Worker the assistant
  falls back to its labelled demo). Pure modules with relative `.ts` imports so
  `npm test` runs them in plain node: `handler.ts` (the request path),
  `validate.ts`, `rate-limit.ts`, `prompt.ts`, `gemini.ts` (the one outgoing
  call), `context.ts` + `sources.ts` (the model's material, built from
  `src/content/` and the German message files - never typed by hand). The
  limits shared with the app are in `src/lib/assistant-limits.ts`.
  `npx wrangler deploy --dry-run` checks the config and the bundle.
- `public/_headers` — security headers. Next copies `public/` verbatim into the
  export, so these land at `out/_headers`, where Cloudflare reads them. No
  Content-Security-Policy yet; that arrives in Phase 11 once every external
  origin is known.
- `public/_redirects` — `301 /de/ → /`. This is what used to be an nginx rule.
- Custom domain is **ahmadreza.de**. Workers custom domains require the zone's
  nameservers to be managed by Cloudflare — a CNAME from an external DNS
  provider is not enough, unlike Pages.
- `npm run build` must keep producing nothing but a static `out/` directory.
  Nothing in the application code may know it is running on Cloudflare.

### The assistant endpoint (`/api/assistant`)

Built in Phase 8A, no key yet: without `GEMINI_API_KEY` it answers
`503 {status:"notConfigured"}` and the app shows its demo. Behaviour that must
stay (each is covered by `scripts/test/assistant-worker.test.mjs`):

- **Order:** method, then own origin (`Origin` must equal the request's origin;
  a missing one is refused), then key, then rate limit, then content type and
  size, then validation, then Gemini. A refused request costs no API call.
- **Limits:** 5 requests a minute and 30 an hour per `CF-Connecting-IP`
  (in-memory, per isolate - a floor, not a wall; the wall is a Cloudflare
  rate-limiting rule, Phase 8B); question at most 400 characters, body at most
  2000; answer at most 900 characters and 400 output tokens; 8 s timeout.
- **The key** goes to Google in the `x-goog-api-key` header, never in a URL.
- **Nothing is logged** - no question, no answer, no `console` call in `worker/`.
  `observability` is on, so a `console.log` would land in Cloudflare's logs.
- **The model marks a refusal** by starting with `REFUSED:`; the Worker strips it
  and answers `{status:"refused"}`. The prompt keeps the visitor's text out of
  the rules (it is the user turn only).
- **The model** is `GEMINI_MODEL` (a plain variable) or the default in
  `worker/gemini.ts`; it is a Phase 8B decision, not a secret.

### The Gemini API key — absolute rule

Phase 8's assistant uses the Google Gemini API through a server-side Cloudflare
function. **The API key lives only in a Cloudflare environment variable.** It
must never appear in client-side code, in a `NEXT_PUBLIC_*` variable, in a
committed `.env`, or in any other committed file. **The GitHub repository is
public**, so a key that is pushed once is compromised immediately, is billable,
and survives in the git history after deletion. If it ever lands in a commit,
rotate it rather than trying to rewrite history.

### Fonts — legal requirement, not a preference

Fonts must **never** be loaded from the Google Fonts CDN at runtime. German case
law treats that as a GDPR violation. All faces come from `@fontsource` packages
and are served from our own domain. Never add a `fonts.googleapis.com` link, a
`next/font/google` import, or any other runtime font fetch.

Installed families:

- `@fontsource/jetbrains-mono` — OS chrome, terminal, UI labels
- `@fontsource/inter` — prose in German and English
- `@fontsource-variable/vazirmatn` — all Persian text
- `@fontsource/vt323` — retro terminal eras
- `@fontsource/press-start-2p` — 8-bit and pixel-art eras

**Press Start 2P has only ~220 glyphs.** Before any string is set in it, it must
pass `npm run check:pixel-font`, which reads the font's real glyph table (a CSS
`unicode-range` is not proof of a glyph). Add every new pixel-font message key
to `PIXEL_KEYS` in `scripts/check-pixel-font.mjs`. If a character is missing,
change the copy — never accept a fallback glyph. Persian is never set in the
pixel face; for `fa`, the pixel stack resolves to Vazirmatn.
