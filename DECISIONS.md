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

> **Amended by entry 39 (Phase 5.5A).** Play mode now gates each era on its
> puzzle, with a one-click way through ("Lösung zeigen"). The rule became: *a
> puzzle never blocks without a one-click way through; Zum Desktop is always
> available.* The reasoning below still holds for Watch mode and for recruiters.

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

> **Superseded by entry 53 (Phase 8B).** The assistant does not use Gemini, or
> any external AI service: it is a local search that never leaves the
> browser. Kept here as the record of why a proxy was built in Phase 8A and
> what the absolute key rule protected, in case a future feature ever again
> holds a server-side secret.

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
work, in entries 36 and 37.

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

---

## 36. The scroll-hold model: puzzles are played in a dialog over a held page

**Decision:** every era section ends in a puzzle segment with its own scroll
distance (`puzzleLength` in `eras/registry.ts`). In **guided** mode the puzzle
plays inline in that segment and the page never stops. In **interactive** mode
the segment shows an invitation; Start opens the puzzle in a modal dialog
(`components/puzzles/HeldDialog.tsx`) and the page is held still behind it:

| Requirement | How |
|---|---|
| The era holds still while playing | `holdScroll()` in `lenis-controller.ts`: `lenis.stop()` plus `html.ao-scroll-held { overflow: hidden }`. The scroll position is never changed, so releasing returns the visitor exactly where they were. `scrollbar-gutter: stable` keeps the page from shifting sideways when the scrollbar hides. |
| Scroll doesn't drag the scene away | Wheel and touch go nowhere while held; the dialog itself scrolls (`data-lenis-prevent`, `overscroll-behavior: contain`). Verified: a 900 px wheel while held moves the page 0 px. |
| Hold releases on solve and skip | The dialog holds on mount and releases in its unmount cleanup, whatever unmounted it. Continue and Skip unmount it and then scroll to the next section one frame later, when Lenis runs again. |
| Never trapped | Skip and Close sit in the dialog's header, visible without scrolling it. Escape closes. The dialog is below the chrome's z-index and only the scenes container is `inert`, so Skip to Desktop and the mode switch stay clickable; both release the hold (`requestPuzzleRelease()`). |
| Browser back | Opening pushes a same-URL history entry; Back pops it and closes the puzzle without leaving the journey. Closing from inside the page removes the entry again (deferred). Scroll restoration is a property of each history entry, so it is switched to `manual` on the entry the dialog was opened from, before pushing, and restored on return; otherwise going back jumped the page by hundreds of pixels (to the next era the visitor was heading for, or past content that had changed height). A development-mode remount reuses the entry instead of stacking a second one. |
| Keyboard | Focus moves into the dialog (to the puzzle's `data-autofocus` element, even when the puzzle chunk arrives after the dialog opened), Tab is trapped, focus returns to Start on close. Keys never reach Lenis: it is stopped, and Lenis does not handle keys anyway. |

**Why a dialog, not pinning the section in place:** a scroll-position lock on
the pinned stage would need the resolver to ignore scroll while held, and on
phones and under reduced motion there is no pinned stage to lock. A dialog is
one mechanism for every layout, and it matches what a held state is: modal.

**Why nothing blocks:** the invitation is scrolled past like any content. The
hold exists only after an explicit Start, and every exit is one action away.

---

## 37. One puzzle engine; the mode is a presentation, not a code path

**Decision:** a puzzle is a `PuzzleDefinition` — `initial`, a pure `reduce`,
`isSolved`, and a `script` of steps (`point`, `act` with an optional `carry`,
`type`) — plus one component that renders its state. `usePuzzleEngine`
(`components/puzzles/engine.ts`) gives the component its state in one of three
presentations:

- `play` — the visitor's input dispatches to the reducer.
- `guided` — the reducer is folded over the script up to a playhead mapped from
  the segment's scroll progress (10 % to 82 %). Scrolling back un-does steps.
  The fold is memoised on the number of committed steps, so it recomputes a
  handful of times per puzzle, not per frame. Typing is previewed character by
  character from the fractional step.
- `final` — the whole script applied: the solved frame, used for reduced motion.

`PuzzleShell` is the only component that reads the mode. It chooses the
presentation, renders invitation, help, feedback, skip and success, and reports
to the unlock store. Era visuals never see the mode; puzzle components never see
it either — they see a presentation. The simulated pointer is an overlay
(`PuzzleSurface`) that finds its target by `data-target`: a ring before 1984,
the 1984 arrow bitmap from then on.

**Consequences the user did not specify:**
- Guided playback awards nothing. Only an interactive solve calls `solvePuzzle`.
- The guided demonstration is `inert` and `aria-hidden`; screen readers get the
  task, the answer and the success message as one summary instead.
- "I'll try this one myself" sets the mode to interactive and opens that puzzle
  at once.
- Pinned and phone layouts give the puzzle segment a fixed height, so switching
  mode does not move anything. Under reduced motion the segment is in document
  flow and the two presentations differ in height, for every mounted puzzle
  above the visitor too. `keepScrollAnchor()` (lenis-controller) records the
  top of the puzzle segment or section under the viewport's middle, applies the
  switch, and corrects the scroll two frames later, so the visitor's place stays
  put on screen.
- The resolver writes `--puzzle-progress` and `--section-progress` next to
  `--era-progress`, and publishes the puzzle progress to a small store only in
  0.5 % steps. `data-visual-share` keeps each visual's pinned travel exactly as
  long as it was before puzzles existed.

---

## 38. Puzzle code and copy load on demand; the journey loads with `React.lazy`

**Decision:**
- `PuzzleSlot` renders an empty placeholder into the static HTML. Within one era
  of the active one it mounts the shell (`next/dynamic`, `ssr: false`), which
  loads the puzzle's own chunk (`puzzles/registry.ts`) and the locale's message
  file (`PuzzleMessages`, a dynamic `import()` into a nested
  `NextIntlClientProvider` that sees only `puzzles` and `mode`). The era's truth
  and insider detail stay server-rendered in the same card.
- `JourneyLoader` uses `React.lazy` + `Suspense` instead of `next/dynamic`.
  In the app router, `next/dynamic` renders an extra server-only sibling (its
  chunk preloader). That shifted React's `useId` tree position for everything
  inside the journey, so every SVG pattern id mismatched on hydration (a console
  error on every load since the landing page split). `React.lazy` renders the
  same tree on both sides and still server-renders the journey.

**Techniques worth knowing:**
- Reordering list items moves DOM nodes and drops focus; the scheduling puzzle
  puts focus back on the moved job's button in an effect.
- Without Lenis (reduced motion) every programmatic scroll jumps; smooth
  native scrolling was both wrong for those visitors and too slow to reach the
  end of a long document-flow page.
- Each era visual is its own stacking context (`isolation: isolate`): the 1995
  scene's windows carry z-indexes that otherwise rose above the puzzle layer at
  768 px portrait.
- Programmatic scrolls re-aim after they come to rest. Puzzles mount and era
  content settles while the page moves past them, so a section top or the page
  end measured at the start was up to ~360 px stale on arrival in document flow.
  Corrections are applied only for drifts under 1.5 viewports, so a visitor who
  scrolled elsewhere is never pulled back.
- The journey observes every section's height and refreshes the resolver's
  measurements when one changes. Several eras settle 20-70 px shorter on phones
  after they first activate; without the refresh, the last puzzle's guided
  playback stopped at 80 %.
- The pointer overlay and the shell terminal scroll their own container by hand.
  `scrollIntoView` would also scroll the document and tear the pinned stage.
- The subnet check is real arithmetic in the order a network stack meets the
  problems (`puzzles/ipv4.ts`); a wider mask that makes the PC think it is local
  still fails, because the router's /24 cannot answer. Persian and Arabic-Indic
  digits are converted as they are typed.
- The 1981 and 2024 puzzles each contain a tempting wrong answer (unload the
  network driver; open the catch-all rule) that is caught and explained rather
  than accepted.
- Drag and drop uses pointer events with pointer capture, so mouse and touch are
  one code path; a press without movement is a click, which picks up. The
  keyboard path is the same pick-up/drop model.

---

## 39. Play mode gates each era; "Lösung zeigen" is the one-click way through

**Decision (Phase 5.5A):** in Play mode the visitor cannot scroll past an era's
puzzle segment until the era is *passed*: solved, or its solution shown. Watch
mode never gates. The per-puzzle Skip button is gone from Play mode; each puzzle
offers "Hinweis" and "Lösung zeigen" from the first moment. Zum Desktop and the
mode switch work at every point and are never blocked.

- **A shown solution** plays the puzzle's own guided script inside the dialog,
  driven by time instead of scroll (`revealSeconds` in `puzzles/registry.ts`),
  then shows the success message and opens the gate. It awards no artifact and
  no badge. Only a real solve awards the artifact.
- **Passed eras persist** (`passedEras` in the unlock store, schema v2; a v1
  store's solved eras are migrated as passed), so a reload never re-locks them.
- **The gate is a layout limit, not a scroll fight.** `setScrollLimit()` in
  `lenis-controller.ts` clips `#journey-scenes` to the gate line (`overflow:
  clip`, which keeps sticky pinning) and makes every section below it inert. The
  document simply ends there, so Lenis, native touch scrolling, the keyboard and
  reduced motion (no Lenis) all meet the same end. Section positions do not
  change, so the single resolver's measurements stay valid. Rejected: clamping
  the scroll position every frame (jitters, fights touch momentum) and
  unmounting later sections (shifts every measurement).
- **Where the line lies** (`gateBottom` in `puzzles/gate.ts`): pinned stages at
  85 % of the section's travel, before the segment starts fading; otherwise at
  the end of the puzzle segment. A gated segment reserves `--ao-gate-cue` at its
  foot (136 px, 216 px on phones, where the cue's text wraps above its buttons
  and must clear the language bar), so the cue never covers the puzzle.
- **Which era gates:** the first unpassed era whose line is still below the top
  of the viewport. An era the visitor has scrolled past never pulls them back
  (reload, Watch-to-Play switch further down). If the line is on screen - say,
  switching back to Play while the end of the segment is visible - the page end
  settles on it, a short upward correction rather than a skipped gate.
- **Visible, never silent:** a lock cue sits at the page end with "Rätsel
  öffnen" and "Lösung zeigen". It is outside the inert sections, so keyboard and
  screen-reader users reach it right after the gated puzzle.
- **Zum Desktop** suspends gates for the rest of the page visit
  (`suspendGates`); otherwise the way back down to the desktop would close
  again. The resolver's "page end = journey complete" rule ignores a page end
  that is a gate.
- The resolver only measures and ticks the gate module; it never learns the
  mode. `PuzzleGate` (puzzle layer) configures it from the mode and passed eras.

**Why:** the visitor who chose Play asked for a game; letting them scroll past
every puzzle made that choice meaningless. A one-click reveal keeps the promise
to recruiters: nobody is ever stuck.

---

## 40. Insider tricks work inside the puzzles; hidden "Legende" badges

**Decision (Phase 5.5A):** where it can be done honestly, an era's insider
detail is a working feature of its puzzle. Using it is never required; it awards
a hidden per-era badge (`legendEras` in the unlock store, not displayed until the
desktop exists). The insider note appears once the trick was used or the puzzle
has ended (text-only eras show it from the start). Watch mode and "Lösung
zeigen" demonstrate each trick once; neither awards a badge.

| Era | Trick in the puzzle | Cue | Source |
|---|---|---|---|
| 1946 | The dropped card deck: swap cards until the felt-tip diagonal runs straight again | The broken line on the deck edge | As entry 32 |
| 1956 | Sense switch 3: the running program reads it (`IF (SENSE SWITCH 3) 10, 20`) and prints each job's wait | The FORTRAN listing and the six console switches | As entry 32; the `IF (SENSE SWITCH i) n1, n2` form from the 1957 IBM 704 FORTRAN manual |
| 1971 | `chdir` works as the Sixth Edition name of `cd` | The welcome message mentions the old names | As entry 32 |
| 1981 | F3 brings back the previous line at a real `C:\>` prompt (`WP`, `DIR`, `CLS`; anything else is "Bad command or file name"); an on-screen F3 key for touch | The F3 keycap | As entry 32 |
| 1995 | Start > Run: `winipcfg` shows the IP configuration; `ipconfig` is not found | The Run button | As entry 32; The TCP/IP Guide, "TCP/IP Configuration Utilities"; the error follows Microsoft's documented "Cannot find file … (or one of its components)" |
| 1984 | **Text only** | - | See below |
| Today | **Text only** | - | See below |

- **1984:** the detail is the origin of the ⌘ glyph, not a shortcut. A working
  shortcut for moving files in the 1984 Finder could not be sourced (Finder 1.0's
  exact command-key equivalents were not verifiable, and cut and paste of files
  arrived decades later), so nothing was invented.
- **Today:** the low-port rule is true for Linux hosts, but modern container
  runtimes lower `ip_unprivileged_port_start` inside containers, so a container
  scenario would teach something misleading. Left as text.
- **1981 framing:** the drivers in that puzzle (mouse, CD-ROM, network, sound)
  belong to the late-1980s and early-1990s PC, when the 640 K limit bit hardest.
  The task now says so ("einige Jahre nach 1981") instead of implying 1981.

---

## 41. German addresses the visitor as "Sie"; Persian uses "شما"

**Decision (Phase 5.5A):** all German copy uses "Sie", natural rather than stiff;
Persian uses the polite plural throughout (it already did); English stays
neutral. The first readers are recruiters and public-sector employers.

---

## 42. The 1946 scene: the bug, and the name built from bits

**Decision (Phase 5.5A):** the 1946 puzzle is staged on a deep black (`.ao-void`:
a warm-to-cold radial falloff; the 1946 card and dialog turn black too). A moth
crawls in from a corner - scrubbed by the segment's progress in Watch mode,
timed in Play - and rests on the faulty column. Solving sends it away; the name
AHMADREZA is then drawn as a 5x7 dot matrix, dot by dot, with each column's
zone-digit code under its letter and the corrected D highlighted. The
explanation (text is numbers) and the history of the word follow.

**Historical accuracy:** the moth belongs to the Harvard Mark II, on 9 September
1947 - a year after the era's date, and not in ENIAC. The copy says exactly
that, and that "bug" already meant a fault (entry 32). Reduced motion shows the
solved frame with no moth and all text present.

---

## 43. Landing page, Phase 5.5A

- The résumé control appears twice - compact in the header, as a link under the
  role - and both stay disabled until `RESUME.available`.
- `EMAIL` in `content/profile.ts` holds a placeholder address with an
  `available` flag. No mailto link is rendered until it is true, so the
  placeholder can never be mailed or scraped.
- Facts sit in a bold, scannable two-column grid. Polish without new weight: a
  gradient on the first name, an accent rule, numbered accent-edged mode cards,
  and an SVG-filter film grain (a data URI, not a raster file).
- The Play card's copy describes the gates.

---

## 44. Verification lives in `scripts/verify/`; audit outcomes

- `scripts/verify/cdp.mjs` and `journey.mjs` drive a local Chrome over the
  DevTools protocol with Node built-ins only: landing, both modes, the gate
  (scrollTo, wheel or touch swipe, keyboard), every puzzle by keyboard, the
  tricks, reveal-without-artifact, reload persistence, mode switching, Zum
  Desktop while gated. `CHROME_PATH` and `VERIFY_OUT` configure it; test hooks
  are `data-action`, `data-mode-option` and `data-target` attributes.
- **Machine text in code:** strings that are identical in every language and
  belong to the simulated machine (the `WP` command, the `C:\>` prompt, DIR's
  listing, key caps, the FORTRAN listing, a MAC address) are named constants in
  the puzzle. Everything a visitor reads as prose stays in `messages/`.
- **Removed:** the unused `data-puzzle-mount="unix-filesystem"`, and unused
  message keys (`journey.puzzleOptional`, `skipPuzzle`, `solved`, `skipped`,
  `insiderLabel`; `puzzles.common.answer`, `loading`, `helpLabel`, `skip`).
- **Kept on purpose:** the `boot` and `ui` message namespaces and the unused
  `nav` entries (desktop, about, projects, ...) are reserved for Phase 6, as is
  the `Panel` primitive. `src/i18n/request.ts` keeps its default export because
  next-intl requires it.
- **Z-index:** the landing's decorative layers use a new `--ao-z-backdrop` step
  instead of an ad-hoc `-z-10`.


---

## 45. Era-to-era crossings, Phase 5.5B

The journey never cuts between eras. Each section owns the crossing **into**
itself, so there is always exactly one owner of the picture at any scroll
position and no gap between two sections.

- **Overlap, not adjacency.** A section that follows another pulls itself up by
  `margin-top: calc(-1 * (1 + var(--boundary-length)) * 100dvh)` and adds
  `BOUNDARY_LENGTH` (1.4 viewports) to its own length. The two eras therefore
  share the screen for the whole crossing: the one being left is still pinned
  behind while the one arriving is already painting.
- **Zero-height markers**, not arithmetic. `.ao-mark` elements (`visual`,
  `puzzle`, `out`) sit at each phase boundary and the resolver reads their real
  pixel positions. `100dvh` and `window.innerHeight` are not the same number
  while a phone's toolbar is in play, so every length is measured, never
  re-derived - including the sticky stage's own height, which is what the
  progress maths divides by.
- **Five custom properties** come out of the one resolver:
  `--section-progress`, `--boundary-in`, `--era-progress`, `--puzzle-progress`,
  `--boundary-out`. Everything the crossings do is `calc()`/`clamp()` over them
  in `globals.css`. No per-frame JS, no timeline per boundary, no per-section
  trigger.
- **One bespoke morph per boundary**, in `EraBridge.tsx`: the last object of the
  era being left becomes the first object of the next (card into the reader into
  teletype paper; paper curling into CRT glass, ink into phosphor; green cooling
  to amber as the camera pulls back to the IBM PC; the `C:\>` prompt shrinking
  into a window as the lights come up; the 1-bit desktop gaining dither, sixteen
  colours, then teal and bevels; the dial-up progress bar becoming light over
  fibre; today's panels folding into the Convergence). Parts are absolutely
  positioned `.ao-part`s inside a centred square (`.ao-bridge-art`, one set of
  per-cent coordinates at any aspect ratio) or, when they are a whole screen in
  their era, in the full-bleed `.ao-bridge-wide`.
- **Both palettes on screen at once.** Themes are scoped per section with
  `[data-theme-scope]`, and each bridge part is wrapped in the scope of the era
  it belongs to, so the outgoing and incoming eras keep their exact period
  colours while they share the frame. The document theme - the chrome - hands
  over at the **visual midpoint** of the morph: `switchAt`, the middle of the
  crossing's travel.
- **A crossing runs in sequence, and two eras' text is never on screen
  together.** The era being left recedes behind its own background (0.10-0.40);
  the new background arrives as a travelling edge that crosses the middle of the
  screen exactly where the theme switches (0.32-0.68); the new scene assembles
  under it (0.56-0.72); and, where the crossing is an overlay, the background
  lifts off it (0.76-0.94). The morphing object carries both eras throughout, so
  no frame is empty. An earlier version cross-faded the backgrounds and faded
  the new scene in over the old one: two half-transparent fills average to a
  grey that belongs to neither era, and two paragraphs of era copy ended up on
  top of each other at the midpoint.
- **`--bridge-overlay` is the one switch between layouts.** 0 in document flow,
  where the band scrolls away by itself; 1 when the crossing is an overlay over
  pinned stages, and always for the Convergence, which pins at every width. The
  first version had separate rule sets per layout, and on phones the
  Convergence's veil never lifted: all of Act 2 was covered.
- **Depth** is CSS 3D only - no WebGL, no three.js, no canvas. The stage holds
  the `perspective`, `.ao-camera` dollies on `translateZ` and tilts from scroll
  (and from the pointer on the full tier), `.ao-era-backdrop` parallaxes behind
  it. Only `transform`, `opacity` and `filter` are animated.
- **Overflow is clipped at `#journey-scenes`**, not on the stage: the parallax
  layers bleed past their stage on purpose, and the stage owns the perspective,
  so clipping there would flatten the 3D context. A single overflowing pixel
  makes a mobile browser widen the layout viewport and shrink the whole page.
- Reduced motion drops the bridges entirely (`display: none`) and renders each
  era as its finished frame, as before.

---

## 46. Motion tiers, Phase 5.5B

Three tiers, chosen once before first paint by an inline script in `<head>` on
the journey view only, written to `document.documentElement.dataset.tier`:

| Tier | When | What changes |
|---|---|---|
| `full` | wide viewport, fine pointer, capable hardware | every layer, the full depth move, pointer tilt |
| `light` | phones, coarse pointers, low `hardwareConcurrency` or `deviceMemory` | the same morph and the same story, fewer layers, smaller depth moves, no pointer tilt |
| reduced motion | `prefers-reduced-motion: reduce` | finished composed frames, no crossings |

- The choice is made **before first paint** so there is no layout shift and no
  second pass; `<html>` carries `suppressHydrationWarning` because the script
  writes the attribute before React hydrates.
- `?tier=full` or `?tier=light` forces one, which is how both paths are walked
  at any width in `scripts/verify/`.
- **A missing reading is not a weak device.** `navigator.deviceMemory` does not
  exist in Safari or Firefox; defaulting it low would put every desktop visitor
  not on Chrome - many recruiters on a Mac - into the light tier. Missing
  `deviceMemory` and `hardwareConcurrency` fall back to the threshold, so only a
  reported low value downgrades.
- The tiers differ in `--depth-k` and in which decorative layers exist. They
  never differ in **what the visitor is told**: no era, no morph and no puzzle
  step is missing from a tier.

---

## 47. Wheel scrolling over pinned stages; honest input in the checks

**Found in Phase 5.5B, present since Phase 5:** on wide screens the mouse wheel
did not scroll the journey while the pointer was over a pinned stage. The puzzle
layer covers the whole stage for the entire era - invisible until its segment -
and its container carried `data-lenis-prevent` so an overflowing puzzle card
could scroll. Lenis therefore ignored every wheel event over the stage, and the
card's `overscroll-behavior: contain` kept the browser from scrolling the page
instead.

- The container no longer carries `data-lenis-prevent`. Lenis runs with
  `allowNestedScroll`, which lets a nested element scroll natively only while it
  can actually scroll in that direction, and hands the wheel back after.
- While invisible, the pinned puzzle layer takes no pointer events: the
  resolver marks the section `data-puzzle-live` (one boolean, written on change)
  and only then does the layer accept the pointer. Before, an unseen Start
  button in mid-screen could catch a click during the era's visual.
- The held Play dialog keeps `data-lenis-prevent`; the page is held then anyway.
- **The same trap on phones:** the inline puzzle card scrolls inside itself and
  had `overscroll-behavior: contain`. Once a tall card had scrolled to its end, a
  swipe that started on it - and on a phone it fills the width - reached the
  page no more: the visitor was stuck at the first puzzle. The card now chains
  into the page at its end. Only the held dialog stays contained.

**Why no check caught it:** the verification's `swipe()` used
`Input.synthesizeScrollGesture`, which moves nothing in headless Chrome, so "the
wheel cannot pass the gate" passed on a page that could not move at all. It now
sends real wheel notches and real touch sequences, and `journey.mjs` first
checks that the input scrolls the page before checking that the gate stops it.
Positions in the other checks are still set with `window.scrollTo`, which is
fine for placing the page but proves nothing about input.

---

## 48. Scroll performance, Phase 5.5B

Measured with `scripts/verify/perf.mjs` (a full scroll of the journey, driven by
real wheel or touch input, frames counted in the page) and `trace.mjs` (a
Chrome performance trace of one crossing, with style-invalidation tracking).
The first honest measurement - earlier ones had scrolled nothing, see 47 - was
45 fps at 1280 with 51 long tasks. What cost the frames, in the order found:

1. **The resolver forced a full restyle per section per frame.** It read
   `document.documentElement.scrollHeight` after writing each section's
   properties. Now every layout read happens before the first write, the
   viewport is cached at measure time, and a call that finds the page where the
   last one left it returns before writing - so the second call in a frame is
   free. (Reading Lenis's scroll number instead of `window.scrollY` was tried:
   it goes stale on native scrolls and left the theme and the crossings behind
   the page.)
2. **Pointer tilt restyled the whole page on every mouse move** (37 ms): its
   properties were inherited, set on the journey root. Now non-inherited, set
   on the cameras.
3. **Progress was written on the section**, so every write restyled all ~500
   elements in it. Each value now goes only to the subtree that reads it, and
   the crossing values are split into non-inherited properties
   (`--scene-in`, `--boundary-out`, `--dolly`) set straight on their readers;
   only the bridge, whose parts all read it, keeps an inherited
   `--boundary-in`. `--section-progress` had no reader left and is gone.
4. **Theme cascade.** The page's text colour and typeface are animated or
   swapped on a theme switch, and the eras inherited both - so at a crossing's
   midpoint the era being left was re-inked and re-set in the new era's font,
   and every transitioning element in it restarted its colour transition on
   each frame of the cross-fade. Palette scopes now set their own colour and
   face.
5. **Endless CSS animations ran in every era, on screen or not** - the 1946
   lamp grid alone restyled ~300 elements every frame from anywhere in the
   journey. Off-screen sections are marked by the resolver and paused.
6. **The travelling edge was an animated mask**, repainting a full-screen layer
   each frame. It is now a fixed soft edge moved with a transform, and a
   crossing's layers are promoted only while it is under way.
7. `setTheme` read a computed style right after writing sixty tokens, forcing
   the page to restyle mid-frame. It reads first, once.

8. **The 1946 lamps' swell kept their pulse off the compositor** (Chrome
   declined to composite the scale), so ~130 lamps were restyled on the main
   thread every frame while the era was on screen. On the light tier the lamps
   now only brighten and dim; the full tier keeps the swell.
9. **A scroll-trapping puzzle card and the wheel over pinned stages** were
   input bugs rather than frame costs - see 47.

Tried and dropped, for want of a measurable gain: rendering guided playback
from a deferred React value, and mounting puzzles in a transition. Also tried
and dropped: a ScrollTrigger scroller proxy onto Lenis. It removed
ScrollTrigger's forced read, but the same restyle simply moved to Lenis's own
`scrollTo` - it is the first layout-dependent call in a frame that pays for what
running animations dirtied - so it gained nothing and was reverted.

**What remains:** each theme switch still restyles nearly the whole document
(~2,300 elements, ~40 ms), once per crossing, seven times in the journey.
Chrome does not stop a changed root custom property at a scope that
re-declares it, so the cost belongs to the theme engine writing onto `<html>`
(CLAUDE.md) and would take a change to that contract to remove - a candidate
for Phase 12.

**On a 4x-throttled phone the frame rate holds (about 43 fps) but long tasks
remain.** What is left is each era's own scrubbing: `--era-progress` has to
reach every animated element of the visual, and some visuals are large - the
1956 printout is ~730 spans - so one restyle is a long task at a quarter of the
CPU. The first reader of the scroll position in a frame (Lenis, ScrollTrigger)
pays for it, which is why profiles attribute the time to them. Removing it means
restructuring the heavy visuals (fewer nodes, narrower readers), which is Phase
12 work. Headless Chrome is not a phone: these numbers are measured under
emulation, not on hardware.

---

## 49. The Amonel OS desktop shell, Phase 6

**Route.** Act 3 is its own view, `/desktop/` (`/en/desktop/`, `/fa/desktop/`),
added through `matchSegments` and `viewHref` like the other two, with canonical
and hreflang. It receives only the `site`, `nav`, `languages` and `os`
messages, uses the `modern` theme, and loads no GSAP, Lenis, era or puzzle
code - `desktop.mjs` fetches every script the page loaded and checks.

**One picture at the hand-over.** `DesktopFrame` - wallpaper, the strip along
the top, the seam of light at the foot - is the Convergence's last frame and the
desktop's first; both render the one component. The desktop's server HTML paints
only that frame; the shell is client-only (`next/dynamic`, `ssr: false`) and
fades in over it a frame after mounting (`data-shell-ready`): the strip becomes
the top bar, the seam grows into the taskbar or the dock. `navigation.mjs`
compares the two frames pixel by pixel (Convergence at 97.5 %, chrome faded, and
the desktop with JavaScript off): 0 differing pixels. Under reduced motion the
Convergence is a static frame that keeps its boot log, so there the hand-over
changes the picture - accepted, since nothing moves there anyway.

- **The shell mount point is gone.** `data-shell-mount` inside the Convergence
  was reserved for Phase 6, but mounting the shell there would have put the
  window manager into the journey's chunk and made the desktop share the
  journey's page. A separate route plus a shared frame gives the seamless look
  without either.
- **The end of the journey** fades the journey chrome (`data-handover`) and
  `location.replace`s itself with `/desktop/` 420 ms later. Replace, not push:
  Back from the desktop must not land on the journey's last frame, which would
  hand over again at once. **Zum Desktop** pushes, so Back returns to the era
  the visitor left; with a puzzle held open it first lets the dialog drop its
  own history entry, whose deferred `history.back()` would otherwise cancel the
  navigation (`journey/hand-over.ts`). Leaving the page ends every gate, so
  `suspendGates()` and `scrollToPageEnd()` had no caller left and were removed.

**Returning visitors** are those with `hasCompletedJourney`, which arriving at
the desktop now sets (as Zum Desktop always did).

- **Landing page:** `DesktopCta` is one slot of fixed height. The server
  renders the default - a quiet "Direkt zum Desktop" shortcut for someone who
  only wants the résumé and the contact details - and a returning visitor gets
  "Willkommen zurück / Zum Desktop" as the primary action in the same slot. The
  mode cards step back by colour only (`html[data-returning]`), so nothing
  changes size. Measured: the mode heading sits at the same pixel in the
  server's HTML and after hydration.
- **The journey redirects** a returning visitor's direct visit before its first
  paint: an inline `<head>` script reads the persisted store. It only acts on a
  real navigation - never on Back, forward or reload, where a redirect would
  trap the Back button - and not when this tab asked to replay: "Reise erneut
  ansehen" and the landing page's mode cards set a sessionStorage flag
  (`lib/returning.ts`), and arriving at the desktop clears it.

**Which shell.** `(min-width: 768px) and (pointer: fine)` gets the window
manager; phones and touch tablets get the home screen. A touchscreen laptop -
fine primary pointer - gets windows and can still drag them by touch.

**Window manager** (`store/window-store.ts`, not persisted, so a reload starts
clean):

- One window per app; opening an open app brings it forward.
- Geometry is logical - `x` is the offset from the inline-start edge - so the
  same numbers mirror in Persian; only the pointer's horizontal delta is flipped.
  Every rect is clamped to the area between the top strip and the taskbar
  (minimum 300 x 200); new windows cascade by 28 px.
- Drag by the title bar, resize from four edges and four corners, all with
  pointer events and pointer capture: mouse, touch and pen are one code path.
  Double-click the title bar to maximise or restore.
- **Keyboard:** the title bar is focusable - arrows move 16 px, Shift+arrows
  resize, Enter maximises or restores - and minimise, maximise and close are
  buttons. **Alt+Shift+Right/Left cycles windows.** Browsers and operating
  systems leave it alone (Alt+Tab belongs to the OS, Ctrl+Tab to browser tabs,
  Alt+Arrow to history, F6 to the browser's own UI), and it is ignored inside
  text fields, where Option+Shift+Arrow selects words on a Mac. The launcher
  lists the shortcuts.
- Windows are non-modal dialogs (`aria-labelledby` their title). Focus goes into
  a window when it opens or comes forward, back to its opener when it closes
  (or to the next window, or the launcher), and to its taskbar button when it
  minimises (`os/window-actions.ts`). Minimised and closing windows are inert.
- Z-order uses the scale: windows ranked into `--ao-z-windows`, the focused one
  at `--ao-z-window-active`, the taskbar at `--ao-z-taskbar`, the launcher and
  notices at `--ao-z-modal`.
- Reduced motion: no open, minimise or close animation.

**Mobile:** a status bar with the clock over the top strip, a grid of the apps,
and a dock of the four a recruiter came for (About, CV, Contact, Assistant) over
the seam. Apps open fullscreen as modal dialogs with a back button. Opening one
pushes a history entry keyed `__aoApp` that keeps the router's own state, so the
browser's Back closes it; nothing touches `scrollRestoration`, which the
journey manages per entry; a reload starts on a clean home screen.

**Apps** are rows in `apps/registry.ts` - id, kind, title key, default size and
a lazily loaded component - with glyphs in `apps/icons.tsx` (original line
drawings, `currentColor`). In this phase every app is a placeholder with copy
from `os.apps.*`; the CV placeholder already offers the download and the Contact
placeholder the email, both only when `RESUME.available` / `EMAIL.available`.
The seven bonus apps share one stand-in until Phase 9. A locked one names the
era whose puzzle unlocks it ("Lösen Sie das Rätsel von 1971 …"); the last era is
"heute", never 2024, through an ICU `select`. Legende badges are read through
`selectLegendEras`, not displayed.

**Copy:** a new `os` namespace. The `ui` and `boot` namespaces reserved for this
phase (entry 44) were never used - the Convergence already is the boot log - so
their strings were folded into `os` and the namespaces removed.

**Bugs found while verifying:**

- **React error 185 (maximum update depth)** the moment a window opened: the
  taskbar selected `windows.map(w => ({ ... }))` through `useShallow`, and new
  objects never compare equal. Select the store's own array, or primitives.
- **A focus race under reduced motion:** a window restored from the taskbar was
  not yet focusable in the frame focus was moved, so focus stayed on the
  button. `focusWindow` now retries for a few frames until focus is inside.

**What it costs.** Next's "First Load JS" is one number for the whole
`[[...locale]]` route (133 → 135 kB), so it cannot tell the views apart.
`scripts/verify/sizes.mjs` measures what a browser actually loads per view
(gzip -6): the desktop loads **144.6 kB** of JavaScript against the journey's
**223.8 kB** - the landing page's 134.8 kB plus one 9.8 kB shell chunk - and an
app adds its own 0.5 kB chunk when it opens. Desktop HTML is 4.4-5.0 kB
gzipped. The shared route chunk grew by ~2 kB (the landing CTA, the returning
redirect, the desktop page); the stylesheet by 1.4 kB.

---

## 50. The core apps, Phase 7

About, Terminal, Tickets and Traceroute replace their placeholders. Contact,
Timeline, CV and the Assistant stay placeholders; the email address is now
confirmed (`EMAIL.available`), so it shows on the landing page, in Contact,
About and the Terminal. Launch is blocked until it really receives mail
(TODO.md, Phase 13).

**Copy that travels with its app.** The desktop serialises the `os` messages
into its HTML, so an app's text cannot live there without every visitor paying
for every app. Each app's copy is its own file, `messages/apps/<app>/<locale>.json`,
imported by `AppMessages` the first time the app opens and exposed under the
app's id as namespace. React's `use()` suspends on the cached import, so the
window's existing Suspense fallback covers the wait. The puzzles' pattern (one
import of the whole locale file) was not copied: it would hand every app every
other app's copy and the journey's too. The page-level imports exclude
`messages/apps/` from their webpack contexts. The four apps' placeholder `body`
lines left the `os` namespace.

**Content as data, words as messages.** `content/about.ts` (stations, skill
areas, languages), `projects.ts`, `tickets.ts` and `routes.ts` hold ids,
structure and machine text; the apps' messages hold every sentence under the
same ids. Pure logic (`terminal/shell.ts`, `traceroute/trace.ts`) imports only
types, so `npm test` runs it in plain node, which strips types since Node 23.6.
`scripts/test/` also checks: the same keys in de, en and fa; "Sie", never "du";
every content id has its copy; every ticket step has its sentence.

**About.** Written in the first person, from the facts already on the site and
nothing else. What is missing - the apprenticeship's start date, earlier
stations, language levels - is `null` in content and renders as a visibly
marked "Angabe folgt", never a guess. Skills are grouped (networks, systems,
support) and carry no levels or percentages: a bar at 80 % is a number nobody
can check. The apprenticeship is described by what the occupation covers, not
by anything about its workplace; Stadtverwaltung Trier is only named as the
place. The résumé control stays behind its flag.

**Terminal.**

- bash with GNU tools where it can: the same error messages (`bash: cd: x: No
  such file or directory`, `ls: cannot access 'x'`, `bash: x: command not
  found`), `~`, dot files behind `ls -a`, Tab completing what is unique and
  listing the rest, history on the arrows, Ctrl+L, Ctrl+C (which still copies
  when text is selected), and `exit`, which closes the window - or goes Back on
  a phone.
- The visitor is `guest`, and home is `/home/ahmadreza`: that is where they
  came to look. `about`, `skills`, `projects`, `cv` and `contact` print content
  from `src/content/` in the visitor's language; the files in home print the
  same sections.
- **Keys are handled on the input, natively.** Next hydrates the whole
  document, so React's delegated `onKeyDown` fires on the document - the same
  node as the desktop's Alt+Shift+Arrow listener - and its `stopPropagation()`
  cannot stop that listener. The input's own listener stops every key the
  terminal answers before it leaves the field. `apps.mjs` proves it with a
  document listener that must see a letter but not ArrowUp or Tab.
- Tab completes only on a non-empty line; on an empty one it moves focus on,
  so keyboard users are never trapped. The output is a polite `log` region.
- **Phones:** the input takes focus on mount only with a fine pointer, or the
  keyboard would cover the screen unasked. The desktop view asks for
  `interactive-widget=resizes-content`, so Android shrinks the page instead of
  covering the input; Safari ignores that, so the terminal also pads its bottom
  by the height the visual viewport reports covered. Checked by shrinking the
  emulated viewport, not on a real phone.

**Tickets.** Nine cases at a fictional company, Talweber Logistik, with
`.example` names and 10.20.0.0/16 addresses: nothing that could read as a real
employer's internal case, and a test rejects Trier, Stadtverwaltung and
IT-HAUS. Each ticket: the symptom as reported, three diagnosis steps each with
the evidence it produced (real commands, output in the real tool's shape), the
solution, and one lesson that holds beyond the case. Statuses are in progress,
waiting and resolved - no "new", since every ticket has been diagnosed. The
interaction is filtering by status and sorting, nothing more. Two panes from a
640 x 320 window body up, each scrolling itself; below that one pane that flows
in the window body, the ticket replacing the list and Back returning focus to
the row.

**Traceroute.**

- A simulation, and the first thing it says. Four prepared routes from an
  assumed home connection in Frankfurt: the home router, this site on a nearby
  delivery server, New York across the Atlantic, Tokyo via the United States
  and the Pacific, with one router that does not answer (`* * *`). Every
  address is reserved for examples (RFC 5737, RFC 2606 `.example`, RFC 8375
  `home.arpa`).
- The times are invented but held to physics by a test: no hop answers faster
  than light in fibre allows for its great-circle distance (about 1 ms round
  trip per 100 km), and times never fall by more than probe jitter.
- Free input borrows a prepared route and says so: private addresses and single
  labels the router, European country domains Frankfurt, Asian and Pacific ones
  Tokyo, everything else New York; the destination keeps the name that was
  typed. An invalid name fails as Linux traceroute does.
- The run reveals one hop after another, farther hops later, a silent one
  last; the summary names the biggest jump and why (the access line, an ocean,
  a long way over land). The raw output reads as Linux traceroute prints it.
  The app scrolls its own window body to keep the packet in view.
- **Tiers:** the desktop view now runs the same tier script as the journey.
  Full tier: the packet pulses and glows. Light: rows, bars and the chain still
  appear step by step. Reduced motion: the finished trace at once, nothing
  animating.

**Layout against the window.** Apps use container queries or a ResizeObserver
on `[data-window-body]`, never the viewport, and scroll their window body by
hand. `apps.mjs` checks each at 300 x 200, maximised and fullscreen at 380 px
for sideways overflow.

**Bugs found while verifying:**

- **A check that could not fail.** The missing-copy check sent `/\b…/` inside a
  template string to the page; `\b` became a backspace character and the
  regex never matched. Doubled backslashes, and the check proven against a
  missing key before trusting it.
- **Traceroute ran out of sight:** in a normal window the trace starts below the
  fold, so the packet travelled where nobody could see it.

**What it costs** (`sizes.mjs`, gzip -6). The desktop's base barely moved:
144.6 → 145.1 kB of JavaScript loaded (the shell chunk 9.8 → 10.0 kB, for the
new window sizes), desktop HTML 4.6 → 4.8 kB (the tier script and viewport
line). Each app arrives only when it opens, code and copy together: About
3.9 kB, Terminal 8.1 kB (its own 1.0 kB copy plus About's 1.5 kB, which it
reads), Tickets 9.5 kB (4.1 kB of it the nine cases' copy), Traceroute 6.3 kB -
against 0.5-0.6 kB for each placeholder before. `AppMessages` and its table of
copy files are a few hundred bytes inside each app chunk, never in the shell.
The shared stylesheet grew 0.6 kB (Traceroute's motion), which every view pays.

---

## 51. Context cost: a lean CLAUDE.md, project skills, quiet checks

CLAUDE.md had grown to 687 lines, all sent with every message of every session,
most of it rules for an area the session was not touching. It is now 195 lines,
and the specialised rules live in project skills under `.claude/skills/`, which
load only when their description matches the task.

- **Moved word for word.** Every moved line was copied by line number from the
  committed file, never retyped, and a script confirmed that 599 of its 600
  non-blank lines still exist, as many times as before, in CLAUDE.md or a skill.
  The one line replaced is the intro ("Everything a future session needs is in
  this file"), which stopped being true.
- **What stays:** who the site is for, the purpose and its table of truths, the
  modes rule and its first bullet (era visuals never know the mode), the seven
  eras, the stack, folders, routing and i18n, the coding conventions, the npm
  commands and the definition of done, a pointer list and the compact instructions.
- **Seven skills:** `journey-visuals`, `puzzles`, `desktop-apps`,
  `deployment-legal`, `verification` as first suggested, plus `theme-engine` and
  `landing-page` because neither section fitted the five and neither could stay
  inside 200 lines. The purpose section's rules and the modes section's detail bullets
  went to `puzzles`, since they concern era copy, tricks and the mode switch.
- **Project rules beat plugins:** CLAUDE.md now says the rules in it and in the
  project skills override any installed plugin, skill or output style.
- **Only two local files are ignored** (`.claude/settings.local.json`,
  `.claude/launch.json`), so `.claude/skills/` is committed and travels with the repository.
- **Quiet checks.** Every verify script takes `--quiet`: failures in full, passes
  only as a count. `matrix.mjs` runs the whole matrix that way, one line per
  configuration. `trace.mjs` (a profiler) and `serve.mjs` are left as they are.

---

## 52. The Assistant and its proxy, Phase 8A (no key yet)

> **Superseded by entry 53 (Phase 8B).** The Gemini proxy this entry describes
> was removed; the assistant now answers from a local search instead. Kept
> here as the historical record of what Phase 8A built and why - the app
> shell, its states and its checks are still the right design, per entry 53.

Built so that connecting the real Gemini key (Phase 8B) is a setting, not code.

- **A Worker script beside the static assets, not Pages Functions.** The site is
  a Worker with static assets (entry 2), so the proxy is that Worker's `main`.
  `assets.run_worker_first: ["/api/*"]` sends only `/api/*` to it; everything
  else is answered by the asset layer without running any code, so `_headers`,
  `_redirects` and the 404 page are untouched. It has to be listed: with
  `not_found_handling: "404-page"` set, an unmatched `/api/assistant` would get
  the 404 page and the Worker would never run. `npx wrangler deploy --dry-run`
  accepted the config and bundled the Worker (71 kB, unminified).
- **`worker/` sits outside `src/`.** `npm run build` still emits only `out/`;
  nothing under `src/` imports `worker/`, and without the Worker (any plain web
  server, `next dev`) the app finds `/api/assistant` missing and shows its
  labelled demo. Wrangler bundles it with esbuild. Its modules import each other
  with relative `.ts` paths (`allowImportingTsExtensions` in tsconfig, which
  `noEmit` permits) so `npm test` runs them in plain node. The one limit shared
  with the app is in `src/lib/assistant-limits.ts`.
- **The material is built, not written.** `worker/sources.ts` reads `src/content/`
  (about, eras, projects, tickets, profile) and the German message files, joins
  them by their shared ids and hands them to `buildContext`. About 5 kB. German
  only: it is the source language, and the prompt tells the model to answer in
  the visitor's language. What the site does not say (start date, earlier
  stations, language levels, anything private) is listed as "not known", derived
  from the `null`s in the content, so "I don't know" has a reason. The tickets
  are labelled invented.
- **Limits.** 5 requests a minute and 30 an hour per IP, in memory. That is a
  floor: each isolate counts on its own. The wall is a Cloudflare rate-limiting
  rule (Phase 8B); I did not add a `ratelimits` binding to `wrangler.jsonc`
  because I could not verify its syntax against a deploy. Question 400 characters,
  body 2000, answer 900 characters and 400 output tokens, 8 s timeout.
- **Own origin only** means the request's `Origin` must equal the request URL's
  origin, so it holds on ahmadreza.de, www and workers.dev alike without a list.
  A request with no `Origin` is refused: the site's own `fetch` always sends one.
  A GET (the readiness probe) needs none, and reveals only ready or not.
- **The key** goes in the `x-goog-api-key` header, not the URL. Nothing in
  `worker/` calls `console`: `observability` is on, so a log line would be kept.
- **A refusal is the model's own word.** The prompt has it start with `REFUSED:`;
  the Worker strips that and answers `refused`. A prompt Gemini's filters block is
  also `refused`. "The material does not say" is a normal answer, not a refusal.
- **The app asks first, with nothing in the request:** a GET on open says whether
  the Worker has a key. Ready means live; anything else (no key, 404, HTML, an
  unknown shape, a network error) means the demo, with the reason shown. A live
  question that comes back "not configured" also drops to the demo. An
  unanswered question returns to the input and leaves the transcript.
- **The demo cannot pass for the live assistant.** Badge "Demo" on the banner and
  on every demo message, a label that says "prepared answer, not AI", a banner
  that says the same, and a live badge in another colour. Five topics; a question
  that matches none is refused, never guessed. A test proves each language's
  suggested question finds its own topic, an off-topic one finds none, and no
  demo answer contains a number except "80".
- **Phase copy:** idle, thinking, answered, refused, rateLimited, offline,
  notConfigured, each in all three languages. Reduced motion: no typing, no
  simulated thinking delay. Otherwise an answer types in about 1.5 s whatever its
  length, the finished text always being in the page for a screen reader.
- **Shared input hooks:** `apps/use-app-input.ts` now holds the Terminal's
  `useKeyboardInset`, native keydown attachment and focus-only-with-a-fine-pointer;
  the Terminal and the Assistant both use them.
- **The journey's mount point** gets a one-line teaser to the desktop app, but
  the static HTML gets only an empty box (`data-slot="prompt-line"`, height
  reserved). The line and its copy (`messages/apps/assistant-journey/`) load when
  the box is within half a screen of the viewport. The journey never talks to the
  Worker. A check counts the word "assistant" in the journey HTML: still one,
  the attribute that was there before.
- **Model:** `gemini-2.5-flash-lite` unless `GEMINI_MODEL` says otherwise, with
  thinking off (its tokens would count against the answer cap). A guess at a
  sensible cheap default, not a decision: TODO.md, Phase 8B.
- **Not verified:** the real Gemini API, the request shape it expects and its
  response shape were never called (no key); the tests run against a fake. The
  Worker was bundled by wrangler but never run under `wrangler dev` or deployed.

---

## 53. The assistant becomes a local search; Gemini is removed, Phase 8B

**Decision, made by Ahmadreza outside Claude Code:** the assistant does not use
Gemini or any external AI service. It answers entirely from a search over the
site's own content, running in the visitor's browser. Nothing a visitor types
ever leaves the device.

**Why:** the Gemini API's terms require Paid Services for apps that serve
users in the EEA, Switzerland or the UK (entry 5, TODO.md Phase 8B); the free
tier is not permitted. The paid tier needs a card on file and a
Datenschutzerklärung disclosure of Google as a US processor. Neither cost -
the money, or the legal surface of a second processor and a second transfer
basis to document - is worth it for a portfolio site whose material fits in a
few kilobytes and does not change at runtime. A search answers the same
questions a recruiter would ask, with none of that.

**What Phase 8A built and what stayed:** the Assistant app, its chat-like
shell, its seven-phase state machine's shape, its labelled honesty about not
being a live AI, the journey teaser, and the checks that verify all of it
(DECISIONS.md 52) are the right design for *any* brain behind the app,
network or local. Only the brain changed:

- **Removed**, and still in the git history if ever needed again:
  `worker/gemini.ts` (the Gemini client), `worker/prompt.ts` (the system
  prompt), `worker/context.ts` + `worker/sources.ts` (the model's material,
  built from `src/content/`), `worker/rate-limit.ts`, `worker/validate.ts` and
  `worker/handler.ts` (the request path), and their tests. `worker/index.ts`
  stays as a minimal stub: every `/api/*` path is a plain 404, reserved for
  Phase 9's anonymous per-puzzle counters - the next thing that will actually
  need a Worker. `wrangler.jsonc`'s `run_worker_first` still lists `/api/*`
  unchanged, so that Phase 9 work is a Worker script, not a deploy config
  change.
- **Added:** `src/lib/search/` - a pure, locale-aware retrieval module,
  described in full where it is built (see the module's own comments and
  `desktop-apps` skill). It normalises a question (case, diacritics, and for
  Persian the ي/ی, ك/ک and ZWNJ variants that mean the same letter) and scores
  it against passages built from `src/content/` and the app's own message
  files at build time - the same "content is data, never typed by hand"
  discipline entry 52's `sources.ts` already followed, just running in the
  browser instead of at the Worker's build time.
- **Gone entirely:** the live/demo distinction, the "checking" state, the
  Worker readiness probe on open, rate limiting, `notConfigured` and
  `offline` states, and every mention of Gemini, an API key or "your question
  is sent to Google" anywhere on the site. A local search cannot be
  rate-limited by a stranger's traffic and cannot go offline in a way that
  differs from the page itself failing to load.
- **The privacy line changed meaning, not just wording:** it used to promise
  that a live question left the device; now it correctly promises that no
  question ever does, in every state, not just the demo. Phase 11's
  Datenschutzerklärung needs no assistant-specific entry at all: there is no
  processor and no transfer to disclose for a feature that runs entirely
  client-side.
- **What this trades away:** the assistant can only ever answer with material
  already on the site, phrased close to how the site phrases it - it cannot
  paraphrase, infer, or answer something the content does not say. That is
  judged the right trade for a portfolio: every sentence a visitor reads is
  one Ahmadreza actually wrote or reviewed, which a free-text LLM answer is
  not.

## 54. The brand is Amonel; the journey moves to /amonel/, Phase 9A

**Decision, made by Ahmadreza:** the site's brand is **Amonel** (Ahmadreza +
Moones/Mona + Manuel). "Amonel OS" is used only where the text is about the
operating system: the desktop, its windows, the Terminal, the boot log. The
person stays "Ahmadreza Taheri" everywhere, and the landing `<h1>` is his name,
not the logo. The brand kit (colours, marks, lockup, glass icon) lives outside
the repository in `Bearbeitung/amonel-brand/`, which is gitignored; only what
the site needs was copied in.

**How it is built:**

- **Logos are inline SVG or HTML, never image files.** `components/ui/Brand.tsx`
  draws the mark, the main logo (mark + W2 wordmark) and the glass icon from
  the kit's outlines (`brand-paths.ts`), so they need no font and no request.
  The `~$ amonel os` lockup is real JetBrains Mono 700 text with the blinking
  `.ao-cursor`, which stops under reduced motion. Inter 600 is therefore not
  loaded: the wordmark is outlines, as the kit ships it.
- **Brand colours are fixed tokens** (`--ao-brand-*` in `globals.css`), not
  theme tokens: the kit forbids recolouring the logo. The `modern` theme keeps
  its cyan accent for now; whether the theme itself moves to the brand
  palette is a separate decision, still open.
- **Where each logo goes, per the kit:** main logo in the landing header;
  the lockup in the desktop and home-screen top bars, the Terminal's
  greeting and the first line of the Convergence's boot log; the mark alone
  on the launcher button (a small place); the glass icon on the About tile,
  the app about the person behind the brand. The landing hero is CSS (green
  and amber light behind the real text); the kit's hero picture is never shipped.
- **Icons:** `favicon.svg` from the kit; `favicon.ico`, `apple-touch-icon.png`
  and the manifest's `brand/icon-*.png` are generated by
  `scripts/brand-icons.mjs` (sharp, from the SVGs in the repository), about a
  third of the kit's own PNG sizes. The old `/favicon.ico` route handler and
  its redirect are gone: the file is real now.
- **The route:** `/journey/` becomes `/amonel/` in every locale; inside the
  code the view is still `journey`. `_redirects` 301s the old URLs, with and
  without the trailing slash, and `scripts/test/redirects.test.mjs` pins it.
- **Titles:** landing "name – job | Amonel", every other page
  "page – name | Amonel". The landing titles run to 64-66 characters, over
  the 60 aimed for; kept whole rather than cutting the name or the job.
- **Storage keys** moved from `ahmados.*` to `amonel.*`. The site is not
  deployed, so no visitor loses progress; after launch a key rename would
  need a migration.

## 55. The Computer-Quiz, a base app, Phase 9B

**Decision, made by Ahmadreza:** a computer-knowledge quiz on the Amonel OS
desktop, always available (a base app, never locked). It measures knowledge of
computer history and basics, nothing else: it is never called or presented as
an IQ, intelligence or aptitude test, and its result copy speaks about the
round, never about the visitor.

**Decided while building it (proposed to Ahmadreza, record changes here):**

- **The name:** "Computer-Quiz" (de), "Computer Quiz" (en), "کوییز رایانه"
  (fa - "رایانه" as the rest of the Persian copy says). App id `quiz`. The
  intro says it is "keine Prüfung, keine Bewertung".
- **Not in the mobile dock.** The dock holds the four apps a recruiter came
  for (About, Lebenslauf, Kontakt, Assistent); the quiz is for the curious
  visitor and sits on the home screen, the desktop and in the launcher.
- **Where the questions live:** the project's existing split. Structure in
  `src/content/quiz.ts` (id, era, option ids, the correct option id); every
  word - question, options, explanation, era labels, result lines - in
  `messages/apps/quiz/<locale>.json`, loaded with the app through
  `AppMessages`. 30 questions: four per era, five for 1995 and today.
  Each goes back to its era's one truth; where a fact was not certain, a
  safer question was chosen (no claims about ENIAC's internals, "brought to a
  wide audience" rather than "invented" for the Macintosh).
- **A round** (`components/apps/quiz/quiz.ts`, pure and tested): ten
  questions, every era once before any era twice, so all seven eras appear
  and three of them twice; question order and option order shuffled each
  round. After each answer: right or wrong in words and a mark (tick, cross),
  the right answer named, the era, and a one- or two-sentence explanation
  that names the era itself. At the end: the score, one of four friendly
  lines, the eras with a wrong answer, and "Neue Runde".
- **The missed eras are names, not links.** A link that opens the journey at
  an era is not cheap here: a returning visitor is redirected from
  `/amonel/` to the desktop (DECISIONS.md 49), Play mode gates every era
  after the first, and the journey has no deep-link entry today. A link that
  landed on the landing page or the first gate would mislead, so the list
  names the eras; the line for a low score points to the journey in words.
- **The best score** is one number in `localStorage` under `amonel.quiz.v1`,
  through a small persisted zustand store (`store/quiz-store.ts`) - the unlock
  store's pattern, its own key so only the quiz's chunk ever loads it. No
  round history, no answers, no cookie, no request. It is listed with the
  site's other browser storage in the `deployment-legal` skill for the
  Datenschutzerklärung (Phase 11).
- **The Assistant never sees it.** The local search imports named content
  modules and four named copy files; neither `content/quiz.ts` nor the quiz
  copy is among them. `scripts/test/quiz.test.mjs` fails if the search code
  ever mentions the quiz or a quiz question or explanation lands in the
  index, so a visitor cannot get quiz answers from the Assistant.
- **Accessibility:** the options are buttons in a group labelled by the
  question; after an answer they stay focusable (`aria-disabled`), so focus is
  never lost; one polite live region announces each verdict with its
  explanation and the final score; each new question and the result take
  focus at their heading. Option labels sit in `<bdi>`, and the one ordering
  question uses Persian digits and commas in fa, because "2, 5, 10" would
  display reversed in a right-to-left line and change the answer.

---

## 56. Anonymous public counters on /api/*, Phase 9C

**Decision, made by Ahmadreza:** the site counts a handful of things visitors
do and shows the totals back to them - and stores nothing about the visitors
themselves. It is the only visitor data the site ever collects (entry 53).

**What is counted** - a name and an integer, nothing else. The allowlist is
`src/lib/counters.ts`, built from the era and app registries in
`src/content/eras.ts`, and imported by the Worker, the client and the tests
alike, so no id is typed twice:

- `era.<eraId>.solved` - a puzzle solved **by the visitor's own hand in Play
  mode**. Guided playback never counts: the guided demonstration gets `noop`
  for `onSolved`, and the engine reports a solve only in the `play`
  presentation, so neither the auto-solve nor "Lösung zeigen" can reach the
  one `count()` call in `PuzzleShell`'s `onSolved`. An auto-solve is
  something the page did, not the visitor; counting it would make every
  number meaningless. "Selbst probieren" switches to Play, so a guided
  visitor who takes over a puzzle does count.
- `quiz.completed` - a round of ten finished. Never the score or the answers:
  `count()` takes a name and nothing else, and the request has no body.
- `journey.completed` - the Convergence reached, where the journey hands over
  to the desktop. Zum Desktop is not counted: it skips the Convergence.
- `journey.mode.guided`, `journey.mode.interactive` - the mode card clicked
  on the landing page (not the in-journey switch).
- `app.<appId>.opened` - an app window opened, base and bonus apps, on the
  window manager and the phone home screen alike (counted where the window
  or the fullscreen app mounts, so a locked app that only shows its notice is
  not counted).

**What is never stored or sent:** IP addresses, user agents, identifiers,
per-visitor timestamps, cookies, scores, the page, the referrer (requests go
with `credentials: 'omit'` and `referrerPolicy: 'no-referrer'`). No new
`localStorage` or `sessionStorage` key: "at most once per page load" is an
in-memory `Set`, so reloading the page and solving again counts again. The
numbers are therefore **counts of events, not of people**, and the copy says
so: "Bisher 1.234-mal selbst gelöst", not "1.234 Personen". The Worker reads
no request body and never calls `console` (observability is on, so a log
line would be kept).

**The Worker** (`worker/api.ts`; `worker/index.ts` is the entry and exports
only the handler, because workerd treats every named export of the entry as
a handler and refuses to start otherwise):

- `POST /api/count/<name>` → 204. Unknown name 404, any other method 405
  (`Allow: POST`), an `Origin` header that is set and is not
  `https://ahmadreza.de`, `https://www.ahmadreza.de` or a `localhost` /
  `127.0.0.1` dev origin → 403. No `Origin` (curl, a server) is allowed, as
  specified - a browser always sends one with a POST; the allowlist and the
  rate limit still apply. A missing or failing database is a quiet 503.
- `GET /api/counts` → `{ name: n }` for allowlisted names only, with
  `Cache-Control: public, max-age=60`, and put into `caches.default` so D1 is
  read about once a minute per edge location. One cache key for everyone.
- Everything else under `/api/` → 404. Every response carries `nosniff`,
  `no-referrer`, `default-src 'none'; frame-ancestors 'none'` and CORP
  same-origin.

**Why D1:** the increment must be atomic, and D1 does it in one statement -
`INSERT INTO counters (name, n) VALUES (?1, 1) ON CONFLICT(name) DO UPDATE
SET n = n + 1` - where Workers KV is eventually consistent and loses
concurrent increments (read-modify-write), and a Durable Object is more
machinery than two dozen integers need. D1 is on the free plan, and the table
(`migrations/0001_counters.sql`: `name TEXT PRIMARY KEY, n INTEGER NOT NULL
DEFAULT 0`) cannot hold anything but a name and a number. Checked under
`wrangler dev --local`: 50 parallel POSTs raised a counter by exactly 50.

**The client** (`src/lib/count.ts`): `count(name)` is a fire-and-forget
`fetch` POST with `keepalive` (so a count sent as the page navigates away
still arrives), each name at most once per page load, every error caught.
After the API answers anything but success once - no Worker (a plain web
server, `next dev`), a 404, the rate limit - the page sends nothing more. In
node and during the static build there is no `window`, so nothing happens.
`loadCounts()` fetches `/api/counts` at most once per page load, and only
when a place that shows a number scrolls into view (`usePublicCounts`, an
IntersectionObserver); anything that is not the expected JSON is null.

**The threshold:** `MIN_PUBLIC_COUNT = 10`. Below it a number is not shown;
without the API, on an error or on a malformed answer, nothing is shown.
Never a 0, never an error. Ten is the smallest count that reads as a crowd
and does not invite a guess at who. Applied on the client only, as
specified; the server returns the raw counts (they say nothing about anyone
either way).

**Where the numbers are shown**, each placed so that nothing moves when it
arrives:

- under the buttons of a puzzle's outcome in the Play dialog ("Bisher
  1.234-mal selbst gelöst"), after a solve or a shown solution; not in the
  journey's own flow, where a line appearing would shift the pinned scenes;
- under "Neue Runde" on the quiz's result ("Bisher wurden hier 1.234 Runden
  zu Ende gespielt");
- a small "Diese Website in Zahlen" section at the very end of **About**:
  journeys followed to the desktop, both modes, and the five most-opened
  apps, with a line saying the counts are anonymous and numbers under ten
  are hidden. About was the least intrusive fitting place: it is the one app
  every visitor opens, the section sits below everything about Ahmadreza,
  and it is fetched only once its end is scrolled into view. Its copy is its
  own file (`messages/apps/stats/`), loaded only when there is something to
  show, and it is outside the Assistant's index. A "stats" command in the
  Terminal was the alternative, and would still be a nice extra.

Numbers go through ICU `{count, number}`, so Persian gets Persian digits
(۱٬۲۳۴). All new copy is a draft for native proofreading (TODO.md).

**Abuse:** the allowlist, the method and Origin checks, and a Cloudflare
rate-limiting rule on `/api/count/*` that Ahmadreza creates in the dashboard
at deploy time (TODO.md, Phase 13, with the exact values). The rule counts
per IP inside Cloudflare; this code never sees or keeps one. On the free
plan it is one rule, IP only, 10 s period and 10 s block, action **Block** -
which sets no cookie. Challenge actions would set `cf_clearance`, and the
"IP with NAT support" characteristic sets `_cfuvid` (Enterprise only
anyway), so both stay off; the `deployment-legal` skill says so. The counts
are approximate and not tamper-proof by design: someone determined can
still inflate them slowly, and a portfolio's counters do not justify more.

**Legal:** nothing is stored on or read from the visitor's device for
counting, so § 25 TDDDG needs no consent; no personal data is stored, and
the IP that Cloudflare necessarily processes in transit (delivery,
security, the rate limit) rests on Art. 6(1)(f) DSGVO. The Phase 11
Datenschutzerklärung must say all of this (the `deployment-legal` skill).
`STORAGE_KEYS` is unchanged, and a test pins it.

**Not verified:** anything that only exists on real Cloudflare - the real D1
binding, `caches.default` on a custom domain (it is a no-op on workers.dev),
the rate-limiting rule, and `run_worker_first` in production. Locally:
`wrangler dev --local` with a local D1, and the browser checks against a CDP
stub of `/api`.

---

## 57. Bonus-app unlocks and the first three bonus apps, Phase 9D-1

**Decision, made by Ahmadreza:** bonus apps start locked and stay visible
(dimmed, with a padlock). Each era's puzzle unlocks one; finishing the
journey unlocks all of them, even with no puzzle solved. Guided mode's
auto-solve unlocks too - it is still never counted. Three bonus apps are
built now: Snake, Pixel Paint and a Binary/Morse converter. Phase 9D-2 adds
network tools and the Time Machine, 9D-3 easter eggs.

**Decided while building it (proposed to Ahmadreza, record changes here):**

- **The mapping** stays where it always was, `unlocksApp` in
  `src/content/eras.ts`; the app registry derives `unlockedBy` from it, so it
  is never typed twice. Each app echoes its era's truth:
  | Era | App | Why |
  |---|---|---|
  | 1946 | `binary` Binary & Morse | text is numbers |
  | 1956 | `scheduler` (later) | - |
  | 1971 | `filesystem` (later) | - |
  | 1981 | `snake` Snake | a finite board fills up, like 640 KB |
  | 1984 | `paint` Pixel Paint | the GUI; 1-bit pictures |
  | 1995 | `network-tools` (9D-2 slot) | a network needs addresses |
  | today | `time-machine` (9D-2 slot) | the end of the timeline looks back |
  The ids `punchcard-lab`, `memory-map`, `dialup` and `firewall` are gone;
  nothing had shipped or been counted under them (the counters are not
  deployed), so renaming cost nothing. Snake is 1981 rather than the 1970s
  arcade because the journey has no arcade era and 1981's truth fits.
- **What unlocks an app:** its era's puzzle seen solved in any way - by hand,
  by "Lösung zeigen", or by watching the guided demonstration to its end -
  or the journey finished. The puzzle skill used to say a shown solution
  opens the gate only; for apps that would have been odd (switch to Watch
  and the app unlocks anyway), so a shown solution unlocks the app too.
  **Artifacts, Legende badges and the public counters stay a solve by hand's
  alone** - nothing about those changed.
- **"Watched" in Guided mode** is the demonstration reaching its end, which
  in Guided mode means scrolled past. Scrolling fast, or the deep link below
  gliding past earlier eras, counts; that is what Guided mode is. Under
  reduced motion the finished frame is the demonstration, so an era counts
  once its puzzle segment is mounted (one era ahead).
- **"Finished the journey"** is the Convergence reached (where
  `journey.completed` is counted), not Zum Desktop - that skips the journey.
  It is a new flag, `journeyFinished`, next to the old `hasCompletedJourney`
  (reached the desktop by any way, which drives the returning-visitor
  redirect and is unchanged).
- **Storage:** no new key for unlocks. The existing `amonel.unlocks.v1` goes
  to store version 3 with two new fields, `watchedEras` and `journeyFinished`;
  v2 data migrates with both empty (a v2 visitor who reached the desktop may
  have skipped, so nobody gains an app they had not earned). Everything read
  from storage is sanitised (unknown ids dropped, only real booleans), and a
  storage that throws or holds broken JSON reads as "nothing unlocked" - the
  page never crashes, progress is then just not remembered. The logic moved
  into `src/lib/unlocks.ts` so plain node tests the real state creator and
  persist options in a vanilla zustand store (`scripts/test/unlocks.test.mjs`).
- **The locked notice** says what the app is (a one-line description per
  bonus app in `os.apps.<id>.description`), which era unlocks it "solved,
  shown or watched", that the end of the journey unlocks everything, and has
  **"Zum Rätsel von 1981"**, which opens `/amonel/#era-4` as a replay (no
  returning-visitor redirect). The journey now honours `#era-N` once its
  layout is measured, through `scrollToEra`. In Play mode a closed gate
  before that era still ends the page, so the visitor meets that gate first -
  the puzzle rule holds. (DECISIONS.md 55 said the journey had no deep link;
  now it has one, so the quiz could link its missed eras later.)
- **Two new keys, both the visitor's own feature (§ 25 (2) Nr. 2 TDDDG):**
  `amonel.snake.v1` (the best score, one number) and `amonel.paint.v1` (the
  current picture, at most 16 KB, written only after the visitor changes it).
  Both are in `STORAGE_KEYS`, the storage table of the `deployment-legal`
  skill and TODO.md for the privacy page; the test that pins `STORAGE_KEYS`
  was updated deliberately. Binary & Morse stores nothing.
- **One new counter, `snake.played`:** a finished game, never the score -
  the 9C rules unchanged (once per page load, in memory, nothing after a
  failure, shown only from ten). Shown in Snake as "1.234 Spiele gespielt".

**The apps**, each its own lazy chunk with its own copy file per language,
their logic in pure, tested modules:

- **Binary & Morse** (`apps/binary/`): text to UTF-8 bytes in binary, hex
  and decimal and back, with the real reason when bytes are not text (a
  digit that is not one, a partial byte, a byte over 255, invalid UTF-8); a
  table of each character's code point, byte count and bits as cells - a
  Latin letter 1 byte, a Persian letter 2, an emoji 4. Morse is ITU-R
  M.1677-1 only: 26 letters, é, digits, the defined punctuation. Umlauts, ß
  and Persian letters are named as unsupported, never transliterated. The
  tone is Web Audio, created on the click (never autoplay), with Stop and a
  volume slider. The light runs at 5 words a minute (240 ms per unit): dots
  back to back are about 2 flashes a second, under WCAG 2.3.1's three - a
  test holds that. Under reduced motion there is no light, only the static
  timeline that is always drawn.
- **Snake** (`apps/snake/`): 20 x 20, walls end the game (the board is
  finite), queued turns so quick double turns work, speed rising a little
  per meal with a floor. Arrows and WASD by physical key, Space/P pause; on
  touch a swipe on the board (`touch-action: none`, so it never scrolls the
  page) and a pad shown on coarse pointers. It pauses when the tab hides,
  the browser window blurs or another Amonel OS window takes focus. No shake,
  flash or sound. The board is not mirrored in Persian. Colours are the
  `--ao-snake-*` tokens in `globals.css`, read by the canvas through a probe
  element; they follow the theme, and a phosphor-green set applies under the
  1971 theme or `data-snake-skin="phosphor"` - the hook the 9D-2 Time
  Machine uses. The name is only "Snake".
- **Pixel Paint** (`apps/paint/`): 16, 32 or 64 pixels square, one palette
  index per pixel. Palettes are colour depths: 1 bit (black and white), 4 bit
  (the 16 RGBI colours of CGA/EGA, brown included) and 8 bit (those 16, a
  6x6x6 cube and 24 greys - one common 256-colour layout, said so honestly
  in the note). **They are computed from their hardware rules, not typed as
  colour values:** a palette is the picture's pixel data, not the site's
  design, and the app's chrome still reads the theme tokens. Switching
  palettes maps every pixel to the nearest colour (going down to 1 bit loses
  colour, which is the lesson); the note shows the picture's size in bytes
  per depth. Pencil (gapless lines), eraser, 4-way fill, picker, clear,
  undo/redo (50 steps; a stroke is one step). A new size asks first and
  stays undoable. Pointer events for mouse, touch and pen; the keyboard moves
  a cursor on the canvas; the swatches are one radio group with arrow keys.
  The PNG is 512 px, whole blocks per pixel, made in the browser and never
  uploaded.

**Future hooks, prepared and empty:** the `network-tools` and `time-machine`
slots (registered, locked, on the shared stand-in); the `--ao-snake-*`
token set; `HIDDEN_COMMANDS` in the Terminal's shell - answered like any
command, never listed by `help` or offered by Tab - for 9D-3.

**Sizes:** each app is its own chunk (Binary & Morse 7.7 kB with its copy,
Snake 6.0 kB, Paint 7.6 kB, gzip). The landing page and the journey load
0.7 and 1.0 kB more JavaScript: the fail-safe unlock logic and the new
unlock fields in the shared route chunk, which every view needs. No app code
reaches them. PROJECT_STATE.md has the table.

**Not verified:** real devices (touch, pen and phone keyboards were
emulated), the tone itself (headless Chrome has no speakers - the
AudioContext and its scheduling run, nothing is heard), the PNG download
dialog (the check captures the blob), and a browser with storage blocked
outright (tested in node with a throwing stand-in).
