# Architectural decisions

Newest at the bottom. Each entry records the decision and the reasoning, so a
future session can tell a deliberate choice from an accident.

---

## 1. Next.js static export, not a Vite SPA

**Decision:** Next.js 15 App Router with `output: 'export'`.

**Why:** SEO is the primary goal — the site has to rank first for "Ahmadreza
Taheri". A Vite SPA ships an empty `<div id="root">` and asks crawlers to
execute JavaScript before they see anything. Next.js pre-renders real HTML per
locale at build time, with per-locale `<html lang>`, `hreflang`, canonical links
and metadata, and still produces plain files that any web server can hand out.

**Cost accepted:** no middleware, no server components at request time, no image
optimisation. All three are fine for a portfolio.

---

## 2. Cloudflare, not a self-managed VPS

**Superseded an earlier decision.** This project originally specified nginx on a
VPS that Ahmadreza would administer himself. That is reversed. Do not
reintroduce nginx, systemd units or server backups anywhere in this repository.

**Decision:** deploy to **Cloudflare Workers with static assets**, connected to
the public GitHub repository through Workers Builds.

**Why:**

- Free, with unlimited bandwidth.
- Served from a global edge network, which is faster than a low-cost
  single-region VPS for visitors anywhere.
- Automatic TLS, with no certificate renewal to own.
- It can host the Phase 8 server-side Gemini proxy on the same free plan. That
  removed the only reason a server was needed at all — see entry 5.

**Trade-off, stated honestly:** Cloudflare is a US company, and its edge sees
visitor IP addresses. That makes it a processor which **must be disclosed in the
Datenschutzerklärung** in Phase 11. This is a real cost that the VPS plan did
not have, and it is accepted knowingly.

**Exit cost:** low, and deliberately kept low. The build output is a plain
static directory. Moving to German hosting later means pointing a web server at
`out/` and re-expressing two small files — a few hours of work, not a rewrite.
Nothing in the application code knows it is on Cloudflare.

---

## 2a. Workers with static assets, not Pages

**Decision:** `wrangler.jsonc` with an `assets.directory` of `./out`, and no
Worker script. Not a Cloudflare Pages project.

**Why:** Cloudflare folded Pages into Workers during 2026. Pages continues to be
supported, but all new investment, optimisation and feature work goes to
Workers, and Cloudflare now tells new projects to start there. A Cloudflare
account created in September 2026 may not show a Pages tab at all, so writing a
Pages-only configuration would risk documenting a product the account cannot
reach.

Workers static assets covers everything this site needs:

| Need | Supported |
|---|---|
| GitHub-connected automatic builds | yes, via Workers Builds |
| `_headers` and `_redirects` files | yes, natively, read from the assets directory |
| Custom domain | yes |
| Custom 404 with a real 404 status | yes, `not_found_handling: "404-page"` |

**One caveat that has to be handled in Phase 13:** unlike Pages, Workers custom
domains only work for zones whose **nameservers Cloudflare manages**. A CNAME
from an external DNS provider is not sufficient. `ahmadreza.de` has to be moved
onto Cloudflare nameservers.

**Pages alternative, if the dashboard turns out to offer it and it is
preferred:** the same `public/_headers` and `public/_redirects` files work
unchanged on Pages, since the syntax is shared. Only `wrangler.jsonc` would
become unnecessary. The configuration was written so that this fallback costs
one deleted file.

**`html_handling` and `not_found_handling`:** `auto-trailing-slash` matches
`trailingSlash: true`, under which the export is directory-based
(`out/en/index.html`). `404-page` serves Next's own `404.html` with a genuine
404 status rather than a soft 404, which would otherwise pollute the search
results this site exists to win.

---

## 3. German is the default locale

**Decision:** `de` is the default and is served at the root path `/`. English
lives at `/en`, Persian at `/fa`.

**Why:** the audience that decides whether Ahmadreza gets hired is German. The
root URL is what gets shared, printed on a CV and shown in search results, so it
must be the German version. English and Persian are important but secondary.

---

## 4. Puzzles are optional, never blocking

**Decision:** every puzzle can be skipped, a "Skip to Desktop" control is visible
at every point in Act 1, and returning visitors go straight to the desktop.

**Why:** the site has two audiences with opposite needs. A curious visitor wants
the eighty-year story; a recruiter with four minutes wants the CV. Gating the
portfolio behind a game optimises for the first and loses the second — and the
second is the one that matters. Solving a puzzle earns a bonus app; skipping
costs nothing else. Progress lives in `localStorage` so nobody replays Act 1
against their will.

---

## 5. The AI assistant is Google Gemini behind a Cloudflare proxy

**Decision:** the Phase 8 assistant uses the **Google Gemini API**. The browser
never talks to Google directly. It calls a small server-side function on
Cloudflare, which holds the key and forwards the request.

**The key rule, and it is absolute:** the Gemini API key lives **only** in a
Cloudflare environment variable (a Worker secret). It must never appear in
client-side code, in the repository, in `.env` files that are committed, in
`NEXT_PUBLIC_*` variables, or in any other committed file.

**Why that rule is not negotiable here:** anything shipped to the browser is
public, and **the GitHub repository is public**. A key committed once is a key
that has been given away the moment it is pushed, is billable, and stays in the
git history after it is deleted. Rotate immediately if it ever lands in a
commit.

**Why a proxy at all:** besides hiding the key, the proxy is the only sensible
place for rate limiting, abuse protection and prompt construction. It is the one
part of the site that is not static, and it is deliberately kept as small as
possible. Cloudflare's free plan hosts it alongside the static assets, which is
what removed the last reason to run a server of our own — see entry 2.

---

## 6. Tailwind v4 with CSS-first configuration

**Decision:** no `tailwind.config.js`. Design tokens are declared in
`src/styles/globals.css` and exposed to Tailwind with `@theme inline`.

**Why:** `create-next-app@15` ships Tailwind v4, whose configuration format is
CSS. `@theme inline` is more than a port of the old config — it makes generated
utilities resolve to `var(--ao-*)` rather than to a baked-in colour, which is
precisely what lets a single runtime variable swap re-skin the whole document.
Fighting the framework to keep a JS config would have cost the theme engine its
central mechanism.

---

## 7. Themes apply as CSS custom properties, not class swaps

**Decision:** `applyThemeToDocument()` writes `--ao-*` properties onto `<html>`.
Nothing swaps Tailwind classes to change era.

**Why:** a class-swap approach needs every themed component to know about every
era, re-renders the whole tree on each switch, and makes the Phase 9 Time
Machine an increasingly expensive feature. Writing variables is one DOM
operation, costs zero React re-renders, animates via ordinary CSS transitions,
and means a new era is a data file rather than a code change.

---

## 8. Optional catch-all route instead of i18n middleware

**Decision:** `app/[[...locale]]/` with `generateStaticParams`, rather than
next-intl's middleware and a `[locale]` segment.

**Why:** `output: 'export'` never runs middleware, so the usual next-intl setup
cannot place German at `/`. The alternative — a pass-through root layout plus a
`[locale]` segment — generates `/de`, `/en`, `/fa` and leaves `/` to a server
redirect, which loses the root URL as the canonical German page. An optional
catch-all keeps `<html lang>` and `dir` statically correct for every locale
*and* puts German at `/`. `/de` is deliberately not generated; the `301 /de/ → /`
lives in `public/_redirects`.

---

## 9. The active era is resolved from scroll position, not `onEnter` callbacks

**Decision:** one ScrollTrigger over the whole journey, which resolves the
active era by comparing the viewport centre against cached section bounds.

**Why:** the obvious implementation — seven triggers with `onEnter` /
`onEnterBack` — is order-dependent. During the first layout pass several of them
report "entered", the last one to fire wins, and the 1946 section loaded wearing
the 1971 theme. Resolving from scroll position makes the active era a pure
function of where the page is, so it is correct on load, after a resize, and
after a font swap alike.

---

## 10. ScrollTrigger is ticked from Lenis' rAF

**Decision:** `ScrollTrigger.update()` is called from the same
`gsap.ticker` callback that drives `lenis.raf()`, instead of relying on
`lenis.on('scroll')` or on native scroll events.

**Why:** Lenis owns the scroll position and does not emit native `scroll`
events — verified in the browser: the page moved from 0 to 2500 with zero
`scroll` events fired. Subscribing to `lenis.on('scroll')` covers wheel and
touch but not in-page anchors or anything else that scrolls programmatically.
One cheap call per frame covers every case, and `ScrollTrigger.update()` bails
out early when the position has not changed. Programmatic scrolling still has to
go through `src/lib/lenis-controller.ts`.
