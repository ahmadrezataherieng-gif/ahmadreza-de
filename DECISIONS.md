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

---

## 21. Pixel-font strings are checked against the font's cmap, not its CSS

**Decision:** `scripts/check-pixel-font.mjs` (`npm run check:pixel-font`) reads
the Press Start 2P WOFF's `cmap` table with `node:zlib` and fails if any message
key rendered in that face uses a character without a glyph. Persian is never set
in the pixel face: for `fa`, `--ao-font-pixel` resolves to Vazirmatn first.

**Why:** a CSS `unicode-range` only says which code points a file is *served*
for. U+2011 sat inside the declared range, had no glyph, and rendered as a stray
fallback in Phase 3. The script confirmed that finding (U+2011: no glyph) and
also that arrows, check marks and block characters are missing - which is why
no pixel-font copy uses them. When adding a pixel-font key, add it to
`PIXEL_KEYS` in the script. If a character is missing, change the copy.

---

## 22. One set of scroll cues for every UI state change

**Decision:** `.ao-cue` shows an element between `--on` and `--off` (era
progress) with a steep 40x ramp. `.ao-path` moves a pointer along three straight
segments, each over its own progress window, with unitless coordinates
multiplied by `--ux`/`--uy`.

**Why:** menus opening, items highlighting, dialog lines appearing and log
lines typing are all "this is visible from here to there". Encoding that once
kept eras 5-7 free of bespoke keyframes. The unit multiplier lets one rule drive
an SVG pointer (user units, 1984) and an HTML pointer (container units, 1995).

---

## 23. Reduced motion pins `--era-progress` to 1 for Phase 4 stages

**Decision:** Phase 4 stages carry `.ao-final-frame`. Under
`prefers-reduced-motion: reduce`, that class sets `--era-progress: 1` on the
stage, overriding the value the resolver writes on the section. Elements that
are transient in the animation but carry text the static frame must show - the
1984 pull-down menu, the 1995 start menu and its highlighted item, the
Convergence log - opt back in with `.ao-rm-show`.

**Why:** every scrubbed element is already a function of `--era-progress`, so
one declaration resolves a whole stage to its finished frame. The alternative -
one reduced-motion override per effect, as in Phase 3 - scales badly and is
easy to forget. Verified in headless Chrome with the media query emulated: zero
invisible text across eras 5-7 and the Convergence in de, en and fa.

---

## 24. The 1984 screen is SVG pixel art built from ASCII bitmaps

**Decision:** icons and the pointer are ASCII bitmaps in `src/lib/pixel-art.ts`.
`bitmapPath()` merges horizontal runs into one `<path>` per colour. The screen is
a 320x214 grid drawn at exactly 320px or 640px wide. All shading is SVG
patterns (a 2x2 dither, title-bar stripes). There is no grey.

**Why:** readable, diffable pixel art; one short path per icon instead of up to
256 rects; integer scaling only, so pixels stay square. The SVG root carries
`direction="ltr"`. Inherited `rtl` on the Persian page makes every label's `x`
its right edge, and the menu labels spilled out of their boxes.

---

## 25. The 1995 scene is laid out in container-query units

**Decision:** on wide screens `.ao-w95-scene` is a size container. Windows are
positioned and sized in `cqw`/`cqh`, text sizes are `--w95-*` variables in
`cqh`, and the pointer path is in the same units. A portrait container query
re-anchors the windows for tablets. On phones the same markup simply stacks.

**Why:** the composition has to hold from a 768px portrait tablet to a 4K
monitor, and the pointer has to land on real elements at every size. Viewport
units would break inside the padded stage; pixels would break everywhere. The
`--w95-*` variables are declared on descendants, not on the container itself -
container units on the container resolve against *its* ancestor, not itself.

Bevels stay static `box-shadow` stacks from the theme. The pressed Start button
is a second, already-sunken layer whose opacity is scrubbed.

---

## 26. The Convergence reuses era components under scoped themes

**Decision:** the seven chips render real pieces of the era components (lamps,
paper, `CrtMonitor`, `MacScreen`, `W95Window`, `Sparkline`). Each keeps its own
era's palette via `[data-theme-scope="eraNNNN"]` rules, generated from
`themeToCssVars()` into a `<style>` block.

**Why:** the brief asked for recognisable elements, not new art, and it is
cheaper. The page is in the `modern` theme during the Convergence, so without
scoping every chip would have rendered in modern colours. This is the theme
engine applied to a subtree - exactly what the Phase 9 Time Machine needs.

Chips are small subsets on purpose. Reusing whole era components would have
duplicated ~1,100 printed-glyph spans and blown the HTML budget. `MacScreen` and
the punch card use `useId()` for SVG pattern ids, because the same pattern would
otherwise be defined twice on one page.

Positions are container units over one progress value: chips travel from a ring
to dock slots with a smoothstep, and each boot-log line reveals as its chip
docks. Landscape and portrait coordinate sets swap via a container query. No
GSAP timeline.

---

## 27. The Convergence pins at every width

**Decision:** unlike the eras, the Convergence section is tall and its stage
sticky at all viewport widths whenever motion is allowed.

**Why:** in document flow its progress would reach 1 as it arrived, and a phone
visitor would only ever see the end state. Its content is designed to fit one
viewport even at 380px (log on top, chips below), so pinning costs nothing there.

---

## 28. Journey completion is recorded at the empty desktop, or at the page end

**Decision:** the resolver calls `completeJourney()` once - when the
Convergence's progress reaches 0.98, or when the page is scrolled to its end.

**Why:** reaching the empty desktop is finishing the journey, just as Skip to
Desktop is, and Phase 6 needs that flag for returning visitors. The page-end
condition exists because in reduced-motion document flow on a phone, the last
section's progress stopped at 0.84 at the bottom of the page.

---

## 29. Bidi rules learned in Phase 4

- Use `:dir(rtl)`, not `[dir='rtl'] .x`, for anything inside a block that pins
  `dir="ltr"`. The attribute selector matches the page's rtl through the pinned
  block, so the Convergence log's typing cover would have wiped the wrong way.
- Wrap Persian runs inside LTR machine output in `<bdi>`. Otherwise trailing
  punctuation ("...") lands at the wrong end of the line.
- Positions that must avoid the progress rail flip with direction. In RTL the
  rail is on the left, so the Convergence log moves right.

---

## 30. Other traps found while verifying Phase 4

- **Never put a CSS opacity animation on an element that also has an opacity
  attribute.** The breathing halo in the Cloud map overrode its 0.12 opacity
  and became a bright blob. Put the resting opacity on a wrapper.
- **`truncate` sets `white-space: nowrap`,** which collapses aligned terminal
  columns even inside a `pre` parent. Use `overflow-hidden text-ellipsis`.
- **tailwind-merge only replaces what the override names.** A `titleClassName`
  without an `lg:` size left the shared `lg:text-4xl` in place, and "Macintosh"
  broke mid-word in the pixel face.
- **The fixed chrome's backdrop uses the surface token, not the background
  token.** On the 1995 teal desktop, a background-tinted backdrop left muted text
  at ~2.5:1.
- **Anything that must avoid the rail ends at 84cqw in landscape and 80cqw in
  portrait.**
- **A year that is really "today" is a message** (`eras.cloud.yearLabel`,
  `Era.yearLabelKey`), not a hardcoded year that ages.

---

## 31. The site teaches one mechanical truth per era

**Decision:** beyond introducing Ahmadreza, the journey teaches how computers
actually work. Each era carries exactly one truth that a visitor can still use
today, and the era copy, the puzzle and the success message all serve it:

| Era | Truth |
|---|---|
| 1946 | Text is numbers. Every character is a pattern of on and off. |
| 1956 | A computer hates waiting. Scheduling is why operating systems exist. |
| 1971 | A filesystem is a tree, and every file has a path. |
| 1981 | Memory is finite, and that limit shapes what software can do. |
| 1984 | Pointing is easier than remembering. |
| 1995 | A network needs addresses. |
| Today | Programs run isolated from each other, in many places at once. |

**Why:** a history tour is forgettable; a truth you can use is not. It also
reframes the site for a recruiter. The portfolio does not just claim that
Ahmadreza understands systems, it demonstrates that he can explain them.

**Where it lives:** `eras.<id>.description` became the truth, replacing Phase 2
placeholder lines that wandered into trivia (one claimed "18,000 tubes" against
the 17,468 shown on the same page). Copy tightened in the same pass: the ENIAC
body now ends on holes and lamps as patterns of on and off; the UNIX screen now
explains the tree and the path; the 1995 body names addresses; today's body names
isolation. The 1956, 1981 and 1984 copy already served their truth and stayed.

---

## 32. One verified insider detail per era

**Decision:** `eras.<id>.insider` holds one detail only a real user of the system
would know. Each was checked against a source before it was written:

| Era | Detail | Source |
|---|---|---|
| 1946 | A diagonal felt-tip line across the top of a card deck, so a dropped deck could be re-sorted | University of Miami, "Punched Cards" (rabbit.eng.miami.edu/info/card.html); Hackaday, "Punch Cards" (2016) |
| 1956 | IBM 704 console sense switches, read by a running program with FORTRAN's `IF (SENSE SWITCH i)` | Wikipedia, "Sense switch"; *The FORTRAN Automatic Coding System for the IBM 704* (1957, Computer History Museum archive) |
| 1971 | The directory command was `chdir` up to the Sixth Edition; `cd` arrived with the Seventh Edition (1979) | Sixth and Seventh Edition `sh(1)` manual pages, TUHS source tree |
| 1981 | F3 recalled the previous DOS command line | Computer Hope, "F3" and "View command history and repeat DOS commands" |
| 1984 | Susan Kare took the ⌘ symbol from Swedish signs marking places of interest | folklore.org, "Swedish Campground" (Andy Hertzfeld) |
| 1995 | `winipcfg` showed IP settings on Windows 95/98/Me; `ipconfig` was the NT tool | Computer Hope, "winipcfg command" |
| Today | On Linux only root may bind ports below 1024, hence containers on 8080 | Linux `ip(7)` and `capabilities(7)` (CAP_NET_BIND_SERVICE) |

**Why:** it rewards the visitor who was there, and it is exactly the kind of
detail that falls apart if invented. The 1971 entry is worded to what the primary
sources prove. The First Edition manual page could not be retrieved, so the claim
names the Sixth and Seventh Editions rather than 1971 itself.

**The 1946 puzzle's historical note** is held to the same standard: on 9 September
1947 operators of the Harvard Mark II found a moth in relay #70 of panel F and
taped it into the logbook as the "first actual case of bug being found". The
logbook is at the Smithsonian's National Museum of American History. The word
"bug" for a fault is older than the moth — the entry was a joke on it — and the
copy says so rather than repeating the myth.

---

## 33. Two viewing modes, one set of scenes

**Decision:** the visitor chooses guided (watch every puzzle solve itself as they
scroll) or interactive (play). There is one implementation of every era and every
puzzle; the mode is a single persisted flag that only the puzzle layer reads.

**Why:** two implementations would drift apart within a phase and double every
future change, and the era visuals are already the most intricate code in the
project. Making guided mode a *playback of the same puzzle* - its own reducer
driven by a script instead of by input - means a fix to a puzzle fixes both modes
by construction. The engine that makes this true is recorded with the puzzle
work, in entries 35 and 36.

---

## 34. The landing page takes `/`; the journey moves to `/journey/`

**Decision:** two views per locale under the existing optional catch-all:
`/` (landing) and `/journey/`. `matchSegments()` resolves segments to a locale and
a view; `dynamicParams = false` makes anything else a 404. The journey is loaded
through `JourneyLoader`, a client component whose `dynamic()` import puts the
whole journey into its own chunk. Each view's client provider receives only the
message namespaces it renders.

**Why not a separate route folder:** an optional catch-all cannot have child
segments, and a sibling `[locale]` route would collide with it. Keeping one
catch-all preserves decision 8 — German at the root, with a correct static
`lang` and `dir` for every page — at the cost of a small dispatch in `page.tsx`.

**Why the dynamic import:** both views come from one route file, and a static
import would ship GSAP, Lenis and all seven eras to the landing page. With it,
the landing page loads no journey code at all (verified in the export: no
ScrollTrigger in any script the landing HTML references), while the journey is
still server-rendered into its own HTML for crawlers.

**Measured on the export:**

| | HTML gzipped | JS referenced, gzipped |
|---|---|---|
| Landing `/` | 6.1 kB | 176 kB, no GSAP |
| Journey `/journey/` | 35.8 kB | 240 kB |

Next's route report dropped from 194 kB to 134 kB First Load JS.

**Why per-view message namespaces:** the client provider serialises every message
it is given into the HTML. The landing page would otherwise carry the journey's
copy, and after Phase 5 both pages would carry seven puzzles' worth of text.

**Slug:** `journey` in every locale. A localised slug (`/reise/`) would read
better in German, but it would complicate hreflang pairs and every href helper
for a URL visitors rarely type — they arrive through the landing page's buttons.

---

## 35. The favicon is SVG, and `/favicon.ico` is a static route

**Decision:** `public/favicon.svg` is linked from every page's metadata.
`app/favicon.ico/route.ts` is a `force-static` route handler that serves the same
SVG, and `_redirects` 301s `/favicon.ico` to `/favicon.svg` on Cloudflare.

**Why:** browsers request `/favicon.ico` on their own. It fell into the locale
catch-all and returned 500 in dev; `dynamicParams = false` alone did not stop
that (the dev server still threw "handler is not a function"). A static route
takes precedence over the catch-all in dev and is written out as a file by the
export. The redirect gives production the correct content type. An `.ico` file
would have been a raster asset, which the project does not allow.

The SVG hardcodes two colours - the modern theme's background and text - because
a static asset cannot read CSS custom properties. It is monochrome and switches
ink with `prefers-color-scheme`.
