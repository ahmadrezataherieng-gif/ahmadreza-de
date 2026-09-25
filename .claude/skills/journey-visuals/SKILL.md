---
name: journey-visuals
description: "Read before touching Act 1 or Act 2: era visuals (src/components/journey/), scroll machinery (Lenis, the ScrollTrigger resolver), era-to-era crossings and CSS 3D depth, motion tiers, printed text, the Phase 4 patterns, the era visual characters table, or the Convergence."
---

## The concept: "Amonel — 80 Years in 90 Seconds"

Three acts.

### Act 1 — The Journey

A scroll-driven trip through seven eras of computing history. The governing
principle: **the site's own interface evolves era by era**. Each era introduces a
UI element that persists afterwards — first lamps, then printed text, then a
cursor you can type at, then a mouse pointer, then windows, then a taskbar.

Each era contains an **optional** interactive puzzle that teaches a real
computing concept.

### Act 2 — The Convergence

At the end of the timeline all seven eras visually compile together into the
modern desktop, with a boot log listing each era as a loaded component.

### Era visual characters

| Theme id | Character |
|---|---|
| `era1946` | dark metal, warm amber lamp glow |
| `era1956` | paper white, typewriter ink black |
| `era1971` | pure black, green phosphor, scanlines |
| `era1981` | black with amber text, chunky 8-bit |
| `era1984` | light grey, black 1-bit pixel art |
| `era1995` | teal desktop, grey 3D bevelled chrome |
| `era2024` | the modern dark palette |
| `modern` | Amonel OS — same palette as `era2024` |

## Act 1 scroll machinery

`components/journey/Journey.tsx` owns it.

- **Lenis** supplies smooth scrolling. It takes over the scroll position and
  **does not emit native `scroll` events**, so `ScrollTrigger.update()` is
  ticked from the same rAF that drives Lenis. Do not remove that.
- Anything that scrolls programmatically must go through
  `src/lib/lenis-controller.ts`, not `window.scrollTo`, or ScrollTrigger will
  never learn the page moved.
- The active era is resolved from the **scroll position** by a single
  ScrollTrigger, not by seven per-section `onEnter` callbacks. Per-section
  triggers are order-dependent during first layout and produced a wrong initial
  theme. Keep the resolver model.
- `prefers-reduced-motion` disables Lenis entirely and renders the eras as a
  plain vertical document. ScrollTrigger still runs there, because it only
  observes scroll position and creates no motion of its own.
- The resolver calls the stores **only when the era changes**, never per frame —
  per-frame calls made the persisted unlock store write `localStorage` 60 times
  a second.
- The theme reference line is 80% down the viewport when stages are pinned (the
  outgoing era has already faded) and the centre in document flow.

### Era visuals (Phase 3 onwards)

Each era is `src/components/journey/eras/Era*.tsx`, wired up in
`eras/registry.ts` with its pinned scroll length and `startAt` threshold.

- **Pinning is CSS `position: sticky`**, never ScrollTrigger `pin` — pin-spacers
  break the resolver's `offsetTop` measurements. Pinning only applies at
  `min-width: 768px` and `min-height: 600px` with motion allowed; below that, eras
  flow as ordinary blocks so nothing is clipped on phones.
- **Scrubbed motion** reads `--era-progress` (0..1, registered with `@property`),
  which the resolver writes on each section. Write the effect as `calc()`/`clamp()`
  over that variable in `globals.css`. Animate only `transform`, `opacity` and
  `filter`. No per-frame JS, no React state, no GSAP timelines per era.
- **One-shot motion** (printing, counters) is a CSS animation paused until
  `[data-started='true']`, which the resolver sets once and never clears.
- **Line drawing** is `.ao-draw` (`pathLength="1"` on the line, `--draw-on` and
  `--draw-span` in `--era-progress` units), not GSAP's DrawSVGPlugin: the
  plugin needs a tween per line and JS on every frame (DECISIONS.md 71). Not on
  `vector-effect: non-scaling-stroke` lines. ScrollSmoother is never used.
- **Never use `steps(n, end)` with a forwards fill.** Float rounding can finish at
  progress 0.99999…, which freezes on the second-to-last step. Use `jump-none`.
- **Never put a CSS animation on the same property you scrub** on one element:
  the animation overrides the declared value. Nest them.
- **Printed text** goes through `lib/typeset.ts` + `PrintedLine`: deterministic
  imperfection (never `Math.random` — hydration), Persian printed word by word
  (per-letter spans break Arabic-script joining), `dir="auto"` per line, the
  printout `aria-hidden` with the same text once in an `ao-sr-only` block.
- **Machine output is LTR in every locale.** Terminal and DOS blocks pin
  `dir="ltr"`; prose follows the page direction. Directional motion must flip in
  RTL (see `.ao-card-slide`).
- **No raster assets.** SVG, CSS, or — only if genuinely necessary — a small canvas.
- **No audio** until the Phase 9 audio layer; `soundProfile` stays unused.
- Every scrubbed or one-shot effect needs a matching rule in the
  `prefers-reduced-motion: reduce` block that resolves it to its finished state.
- Call `ScrollTrigger.refresh()` after anything that changes layout height. Font
  swap-in is already handled via `document.fonts.ready`.
- Fixed journey controls carry `.ao-chrome-backdrop` (surface token) so they stay
  legible over every era, including paper-white 1956, grey 1984 and teal 1995.
  Anything laid out beside the progress rail ends at 84cqw landscape / 80cqw
  portrait, and moves away from the left edge in RTL, where the rail sits.

### Era-to-era crossings and depth (Phase 5.5B)

Read DECISIONS.md 45 and 46 before touching any of this.

- **No era ever cuts to the next.** Each section owns the crossing *into*
  itself and overlaps the section before it by `1 + BOUNDARY_LENGTH` viewports,
  so both eras share the screen for the whole morph. At no scroll position may
  neither era be visible, and no frame may show an empty background.
- **Measure, never re-derive.** `100dvh` and `window.innerHeight` differ while a
  phone's toolbar is in play. The phases are marked in the document with
  zero-height `.ao-mark` elements and the resolver reads their pixels, dividing
  by the sticky stage's measured height - not by the viewport.
- **One resolver, four properties, written where they are read** (DECISIONS.md
  48): `--era-progress` on the scene, `--boundary-in` on the scene and the
  crossing, `--boundary-out` on the scene and the puzzle layer,
  `--puzzle-progress` on the puzzle layer. They inherit, so a write on the
  section restyled all ~500 of its elements every frame. A new reader outside
  those subtrees gets the value by being written to, not by moving the write
  up. Still no per-section trigger, still no per-frame JS.
- **Read layout before writing it.** The resolver runs every frame and twice
  (scroll event and ticker): it reads `window.scrollY` first, the viewport from
  the last measure, returns early if nothing moved, and never reads layout after
  a write. Do not read Lenis's own scroll number instead - it goes stale on
  native scrolls (keyboard, scrollbar, jumps).
- **The theme hands over at the visual midpoint** of each morph (`switchAt`),
  never at its edges. Both eras keep their exact period palette while they share
  the frame, through per-section `[data-theme-scope]`.
- **Never cross-fade two background fills.** Two half-transparent fills average
  to a grey that belongs to neither era. Hand the background over with a
  travelling masked edge instead, and never show two eras' text at once: the
  crossing runs in sequence (DECISIONS.md 45) and the morphing object carries
  both eras.
- **`--bridge-overlay`** (0 in flow, 1 pinned and always for the Convergence) is
  the only difference between the layouts' crossings. Never write a second rule
  set per layout - that is how the phone Convergence ended up permanently
  covered by its own veil.
- **Depth is CSS 3D only.** The stage owns the `perspective`; `.ao-camera`
  dollies and tilts; backdrops parallax. No WebGL, no three.js, no canvas.
  Animate only `transform`, `opacity` and `filter`.
- **A section's top is where the crossing into it begins**, still showing the
  era before. Anything that takes the visitor to an era (the rail, Continue,
  Skip) uses `scrollToEra()`, which lands on the era's `visual` marker and
  glides through the crossing on the way.
- **Clip horizontal overflow at `#journey-scenes`**, never on the stage - the
  stage's `perspective` would be flattened by an overflow on it. One overflowing
  pixel makes a mobile browser shrink the entire page to fit.
- **Three motion tiers** (`full`, `light`, reduced motion) chosen before first
  paint into `document.documentElement.dataset.tier`; `?tier=` forces one. A
  tier may drop layers and shorten depth moves. It may never drop a step of the
  story.

### Phase 4 patterns — use these, don't reinvent them

- **HTML weight is a tracked budget** (reported every phase). No per-letter
  elements outside the Phase 3 printers: animate a cover over a single text node
  instead (`.ao-wipe`, `.ao-conv-line-cover`). Prefer SVG patterns to repeated
  elements; ASCII bitmaps in `lib/pixel-art.ts` become one path per colour.
- **UI state over scroll** uses `.ao-cue` (`--on`/`--off` in era progress).
  Pointers use `.ao-path` (three segments, `--ux`/`--uy` units).
- **Reduced motion for new stages:** put `.ao-final-frame` on the stage; it pins
  `--era-progress` to 1. Transient elements whose text must still show in the
  static frame add `.ao-rm-show`.
- **Scaled compositions** (1995 desktop, the Convergence) are size containers laid
  out in `cqw`/`cqh`, with a portrait container query. Container units declared
  on the container itself resolve against its ancestor — declare size variables
  on descendants.
- **Theme a subtree** with `[data-theme-scope="eraNNNN"]` rules generated from
  `themeToCssVars()`, as the Convergence chips do. Never hand-write colours.
- **SVG pattern ids** come from `useId()` — the same component can render twice.
- **Bidi:** use `:dir(rtl)`, not `[dir='rtl'] .x`, inside `dir="ltr"` blocks;
  wrap Persian runs in LTR machine output in `<bdi>`; physical SVG layouts set
  `direction="ltr"`.
- **Never combine an opacity animation with an opacity attribute** on one
  element, and never use `truncate` where spaces must survive.
- **Mount points** — keep them, replace their children:
  `data-assistant-mount="journey-prompt"` (Phase 8, today's prompt). The Phase 6
  shell mount inside the Convergence is gone: the desktop has its own route and
  shares the frame instead (DECISIONS.md 49).
- **The Convergence** is not an era: the resolver gives it the `modern` theme,
  keeps the rail on era 7, and when it reaches the empty desktop or the page end
  calls `completeJourney()` and hands over to `/desktop/` (DECISIONS.md 49).

### Crossing cards (BR-10, DECISIONS.md 77)

- The crossing out of an era with technologies in `content/crossings.ts` (all but the last) shows one card per technology between the old machine and the new one. `crossing-timing.ts`: `TECH_FROM`/`TECH_TO` (0.24-0.74 of the crossing), `crossingLength(count)` (1.2 + 0.3 per card, in viewports; `EraSection` sums each era's in and out lengths, `--boundary-length` is the crossing in).
- The existing morph (`b1-b7` parts, veils) is unchanged and runs underneath; the parts fade out at 0.14-0.24 and back at 0.74-0.82 (`--tech-cover`), the era being left recedes early (`--recede`), and the background hands over behind the cards.
- **Cards are pre-built and hidden.** The resolver writes `data-shot` on the bridge when the current card changes; CSS displays that card and its neighbours only. A card's own progress is `--t` (registered, computed per card from `--boundary-in`); enter, rest and leave are `--enter`/`--leave` derived from it. Only transform and opacity, no JS per frame, no library.
- **Drawings** (`journey/tech/TechArt.tsx`): inline SVG on 160 x 120, generic (no logo, no trademark), coloured only through the `tt-*` classes, moved only through `--t` (`tt-spin`, `tt-blink`, `tt-slide`, `tt-in` and the few bespoke morphs). Each is complete and tidy at t = 0.5, which is what reduced motion shows.
- Each card carries the palette of the era it is nearest to (`data-theme-scope`), so light and type change hands as the background does; the ruler is a fixed neutral plate.
- **Reduced motion:** the bridge is not hidden for these crossings; its cards lie in a still grid with a caption. A `.ao-sr-only` list (`TechList`) carries the same names for assistive tech and search engines in every mode.
- The resolver's band test is `position === 'relative'` (a band in flow); static (reduced motion) and absolute (pinned) are not bands.

### Performance rules for the journey (PERF-02, PERF-03, DECISIONS.md 77)

- **Never write a custom property on `<html>` while the journey is mounted:** it restyles every element (about 250 ms at 4x throttle). The journey calls `scopeThemeTo` (`lib/apply-theme.ts`): the theme's tokens go to the chrome wrapper and the effects layer only. Anything portalled out of the eras (held dialog, gate cue) carries its era's `data-theme-scope`.
- **Printed text is struck by `lib/print-controller.ts`** (`data-struck` on each glyph, one rAF loop), not by a CSS animation per glyph (275-390 at once froze phones).
- **`--arrival` is written on its four readers** (`.ao-crt-beam`, `.ao-crt-screen`, `.ao-mac-lights`, `.ao-mac-screen`), not inherited from the scene. A new reader joins `ARRIVAL_READERS` in `Journey.tsx`.
- **Journey heights are `calc(100 * var(--ao-vh))`, never `dvh`** (PERF-02): `--ao-vh` is `1lvh` in the stylesheet and, on touch devices, pinned to pixels on the journey element by `lib/stable-viewport.ts`, so a toolbar move relayouts nothing. Prove it with `toolbar.mjs`. The static pages and the desktop keep `dvh`.
- **A coarse pointer scrolls natively** (no Lenis); `scrollToEra` then uses the browser's smooth scroll.
- Check with `perf.mjs --width 390 --cpu 4 [--mode open]` (worst frame per crossing in `worstByPlace`) and `crossing-frames.mjs` (screenshots at chosen points of each crossing).
