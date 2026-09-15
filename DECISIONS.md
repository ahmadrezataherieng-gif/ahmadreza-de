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

---

## 11. Eras pin with CSS `position: sticky`, not ScrollTrigger `pin`

**Decision:** each era is a tall `<section>` (its height sets the scroll
distance) containing a `position: sticky` stage one viewport tall. ScrollTrigger
does no pinning.

**Why:** ScrollTrigger's `pin` wraps the element in a pin-spacer and pads it.
That silently changes `offsetTop` and `offsetHeight` - the exact measurements
the era resolver (entry 9) depends on - and reintroduces the class of layout bug
entry 9 was written to kill. Sticky gives the identical visual result with no DOM
mutation, and the browser composites it.

Pinning is gated by a media query
(`min-width: 768px`, `min-height: 600px`, `prefers-reduced-motion: no-preference`).
Outside it, eras are ordinary blocks in document flow. On a 380px phone a pinned
stage would clip text that does not fit one viewport; flowing is the adaptation,
not a fallback.

---

## 12. Scrubbed visuals read one registered custom property: `--era-progress`

**Decision:** the resolver writes `--era-progress` (0..1) onto each era section.
Every scrubbed effect - the punch card sliding in, lamp intensity, the paper
feed, the CRT power-on - is a `calc()`/`clamp()` expression over that variable
in `globals.css`. No React state, no GSAP timeline.

**Why:**

- A React state update per frame would re-render the journey 60 times a second.
- A per-era GSAP timeline would be a second source of truth about progress,
  alongside the resolver.
- One style write per era per frame, skipped when the rounded value is
  unchanged, costs almost nothing, and the effects use only `transform`,
  `opacity` and `filter`, so they stay on the compositor.

`--era-progress` is registered with `@property` as a `<number>`. Unregistered,
it is an untyped string, and multiplying it inside `calc()` for `transform` is
not reliably valid.

Progress means different things by layout. Pinned: how far through the sticky
travel the page is. In flow: how far the section has arrived, reaching 1 as its
top nears the top of the viewport, so reveals finish as the era comes into view.

---

## 13. One-shot animations start from `data-started`, set once and never cleared

**Decision:** printing, the POST counter and the beep are CSS animations with
`animation-play-state: paused`. The resolver sets `data-started="true"` on a
section once its progress passes that era's `startAt` threshold
(`src/components/journey/eras/registry.ts`). It never removes the attribute.

**Why:** no JS timers and nothing to clean up. Never clearing it means a
printout that has begun always finishes, even if the visitor scrolls on. Pausing
when the era loses focus would leave half-printed screens behind. `startAt`
exists for UNIX, whose screen must be lit (progress 0.3) before anything prints.

---

## 14. Stepped animations use `jump-none`, never `steps(n, end)`

**Decision:** `ao-strike` uses `steps(2, jump-none)`. The POST counter uses
`steps(frames, jump-none)`, with one frame per displayed value.

**Why - found in the browser, not theorised:** for some `animation-delay`
values, a finished animation's computed progress is `0.9999999999999953`
rather than `1`. `steps(2, end)` maps that to the second-to-last step, so
individual glyphs in the DOS listing stayed frozen at 50% opacity forever, with
play state `finished`. The POST counter had the same flaw and could stop at
576K instead of 640K OK. With `jump-none`, the end value is itself one of the
steps, so float rounding cannot fall short of it. Treat any new
`steps(…, end)` combined with a forwards fill as a bug.

---

## 15. Printed text is per-glyph spans with deterministic imperfection

**Decision:** `src/lib/typeset.ts` turns text into glyphs carrying a delay, an
ink density and a horizontal jitter, all derived from a hash of position, never
`Math.random`. `PrintedLine` renders one span per glyph; CSS does all the motion.

**Why deterministic:** server HTML and first client render must match, or React
throws a hydration mismatch. A visitor who scrolls back up should also see the
same page.

**Persian prints word by word.** Wrapping each letter of a joining script in its
own span breaks the contextual shaping that connects the letters.
`printUnit(locale)` switches to `'word'` for `fa`.

**Every printed line carries `dir="auto"`.** Each glyph is an inline-block, which
bidi treats as a neutral object, so a Latin line inside the Persian page
("GM-NAA I/O ..... 1956") laid its words out right to left. Resolving direction
per line from its first strong character fixes it.

**Accessibility:** each printout is `aria-hidden`, and the same text is repeated
once in an `ao-sr-only` block. Split into strike units, it reads badly aloud.

**Cost:** roughly 1,100 spans across four eras. The German HTML is 221 kB raw
but 26.6 kB gzipped, and the spans add no JS. Watch this in Phase 4.

---

## 16. The theme reference line is 80% down the viewport when pinned

**Decision:** in pinned layouts an era owns the theme once its section crosses
80% of the viewport height. In document flow the line stays at the centre. It is
still the single resolver from entry 9; only the reference line moved.

**Why:** with the centre line, the 1971 monitor slid in wearing the paper-white
1956 theme - a big white bezel instead of the beat of darkness that era needs.
When pinned, the outgoing era has already faded to its bare background
(`.ao-era-exit`) by the time the next stage arrives, so switching early re-tints
nothing but that background. In document flow nothing fades out, so an early
switch would visibly re-skin the previous era; the centre is the fair line there.

---

## 17. The resolver touches the stores only when the era changes

**Decision:** `activate()` runs when the resolved era differs from the last one,
not on every frame.

**Why - a Phase 2 performance bug found here:** the resolver called
`setActiveEra`, `setTheme` and `markEraVisited` on every scroll frame.
`markEraVisited` created a new state object each time, and the persisted unlock
store wrote `localStorage` on every one of those - about 60 synchronous storage
writes a second while scrolling.

---

## 18. Act 1 renders its first era's tokens into the static HTML

**Decision:** `Journey` emits a `<style>` with `:root{…}` built from
`themeToCssVars()` for the first era's theme.

**Why:** the bootstrap values in `globals.css` are the `modern` desktop palette.
Without this, the entry page's very first paint was the cyan desktop,
cross-fading to 1946 only after hydration. The values are generated from
`themes.ts`, so nothing is hardcoded. Once the theme store writes inline
properties on `<html>`, those win on specificity.

---

## 19. The CRT is one shared component; flicker lives on an inner layer

**Decision:** 1971 and 1981 both render into `CrtMonitor`; only 1971 runs the
power-on (`powerOn`). The flicker animation sits on an inner element, never on
the element whose opacity is scrubbed.

**Why:** one monitor whose phosphor changes colour with the theme reads as the
technology upgrading, which is the brief for that handoff. The flicker placement
is a correctness fix. A CSS animation on `opacity` overrides a declared
`opacity`, so with both on one element the scrubbed power-on was ignored and the
screen was always lit.

---

## 20. Era copy follows period constraints

- The 1956 printout and the 1971/1981 screens spell German umlauts as
  ue/oe/ae. Line printers and early terminals had no umlauts, so this is
  period-correct, not a typo. Prose outside the machines uses real umlauts.
- The DOS listing is in `messages/` like all copy, and its file sizes add up to
  the footer total (942.080 bytes). It will be checked by exactly the kind of
  person this site is trying to impress.
- The punch card uses the real IBM zone/digit encoding
  (`src/lib/punch-card.ts`), so the card genuinely spells what its caption says.
- The ASCII-art year is hardcoded in `EraDos.tsx`. It is a decorative rendering
  of a year, and years are exempt from localization.
- Long German titles carry a soft hyphen in the message
  (`Stapel­verarbeitung`). CSS `hyphens: auto` depends on a hyphenation
  dictionary that browsers do not all ship, and without one the word broke
  mid-word with no hyphen.
