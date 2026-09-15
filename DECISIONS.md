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

## 2. Self-hosted VPS, not a CDN platform

**Decision:** nginx on a VPS that Ahmadreza administers himself.

**Why:** two reasons, both load-bearing.

1. **GDPR cleanliness.** No third-party edge network sees visitor IPs, so there
   is nothing to disclose, no processing agreement to chase, and no US transfer
   question to answer in the Datenschutzerklärung.
2. **It is itself the portfolio.** Configuring nginx, TLS, systemd units and
   backups is exactly the *Fachinformatiker für Systemintegration* skill set the
   site is meant to demonstrate. Deploying to a one-click platform would hide
   the most relevant evidence.

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

## 5. The AI assistant needs a server-side proxy

**Decision:** the Phase 8 assistant talks to a small Node service on the VPS,
which holds the API key and forwards to the model provider. The static site
never contains the key.

**Why:** anything shipped to the browser is public. An API key in a static
bundle is a key that has been given away, and it is billable. The proxy is also
where rate limiting, abuse protection and prompt handling belong. This is the
one part of the site that is not static, and it is deliberately kept as small as
possible.

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
*and* puts German at `/`. `/de` is deliberately not generated; nginx should
`301 /de/ → /`.

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
