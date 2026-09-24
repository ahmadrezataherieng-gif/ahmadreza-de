---
name: seo
description: "Read before touching titles, meta tags, headings, structured data, sitemap, robots.txt, llms.txt, Open Graph, page copy, URLs or images."
---

### Names

- Display name everywhere: **"Ahmadreza Taheri"**.
- Persian spelling: **"احمدرضا طاهری"**.
- Legal full name: **"Ahmadreza Taheri Momrabadi"** (first name Ahmadreza,
  family name Taheri Momrabadi). This appears **only** in the Impressum (and
  the Datenschutzerklärung's controller block) - never anywhere else on the
  site, **not in structured data either** (Ahmadreza, 2026-09-23; this
  replaces the earlier `alternateName` plan).

### Canonical host

**https://ahmadreza.de/** (apex, no `www`). `www` is 301-redirected to the
apex by a Cloudflare Redirect Rule the owner has set up outside this repo -
nothing in the codebase needs to implement that redirect.

### robots.txt (Phase 10, not built yet)

Allow **all** crawlers, by the owner's explicit decision:

- AI answering bots: OAI-SearchBot, ChatGPT-User, Claude-SearchBot,
  Claude-User, PerplexityBot.
- AI training bots: GPTBot, ClaudeBot, CCBot, Google-Extended,
  meta-externalagent.

Do not add a narrower policy, a crawl-delay, or block any of the above
without asking first - this was a deliberate choice, not an oversight.

### Every page

- The legal pages (`/impressum/`, `/datenschutz/`, en, fa) are the exception:
  `noindex, follow` and never in the sitemap, so a search for the name does
  not surface a home address (DECISIONS.md 58).
- One `<h1>`.
- A `<title>` that starts with the name for identity pages.
- A meta description.
- `canonical`, and `hreflang` including `x-default`.
- Real text in the static HTML. Animation is layered on top of that text; it
  is never the only carrier of meaning - a crawler that does not run the
  scroll machinery must still get the full sentence.

### Static About pages (Phase 10, decided, not built yet)

Static, indexable About pages in all three locales are planned. The About
*app* on the desktop is not enough for SEO: its text loads only once a
visitor clicks the icon, so a crawler that does not execute the desktop shell
never sees it.

### Brand and the journey route (Phase 9A, done)

- The site's brand is **"Amonel"**. **"Amonel OS"** only where the text is
  about the operating system (desktop, windows, terminal, boot log). In
  Persian the brand stays in Latin letters.
- The brand never replaces the name: the person is always "Ahmadreza Taheri",
  and the landing `<h1>` is his name, never the logo.
- The journey lives at `/amonel/` (`/en/amonel/`, `/fa/amonel/`). The old
  `/journey/` URLs 301 there (`public/_redirects`, checked by
  `scripts/test/redirects.test.mjs`) - keep those rules. Inside the code the
  view is still called `journey`, and so is `components/journey/`.

### Titles

- Landing: the name first, then the job, then the brand:
  `Ahmadreza Taheri – Fachinformatiker für Systemintegration | Amonel`
  (`site.title` per locale).
- Every other page: `<Page name> – Ahmadreza Taheri | Amonel`.
- Aim for 60 characters or fewer. The landing titles run over (de 66, en 64,
  fa 66 characters) and were reported to the owner rather than cutting the
  name or the job. Report any new title that runs over; never shorten the name.

### Images

- The portrait file name carries the name, e.g.
  `ahmadreza-taheri-trier.webp`, with a full descriptive `alt` text.
- The Open Graph image is **one** PNG or JPG at exactly **1200 × 630**. This,
  the portrait (see `landing-page` skill) and the brand icons are the only
  raster exceptions in the project - link previews in LinkedIn, WhatsApp and
  Telegram need a real raster image, nothing else does.
- The brand icons (Phase 9A): `favicon.ico`, `apple-touch-icon.png` and the
  manifest's `brand/icon-*.png`, generated from the kit's SVGs by
  `node scripts/brand-icons.mjs`. Every logo on a page is inline SVG or CSS,
  never an image file.

### Structured data (built 2026-09-23, `src/lib/structured-data.ts`)

- **Person:** `name`, `alternateName` (`NAME_VARIANTS`: spellings of the name only, e.g. Ahmadreza, Taheri, Ahmad Reza Taheri and the Persian forms - never the
  legal name, never a skill or Amonel), `jobTitle`, address `addressLocality: "Trier"` (never a street),
  `knowsAbout`, `knowsLanguage`, `email`; add `image` with the portrait and
  `sameAs` once the owner's profiles are ready.
- **WebSite** (name = the person, not Amonel) on every indexed page, **Amonel** as its own `CreativeWork` with `creator` = the Person, an **ImageObject** (the share image) as the ProfilePage's `primaryImageOfPage`, **ProfilePage** on the landing page, all
  linked by `@id`. The legal pages carry none. Rendered in the locale layout's
  `<head>`; pinned by `scripts/test/seo.test.mjs`.

### The coming-soon page (live until launch, ROADMAP BR-02)

- Everything search-related is built by `npm run build:soon` into `soon/dist/`:
  the Person JSON-LD and `sitemap.xml` from `scripts/soon-seo.mjs` (facts from
  `messages/de.json` `site`, `EMAIL`, `PROFILES`; a city and country only, never the
  street, the legal name or the employer), `robots.txt` copied from `public/`,
  the share image `og/og-de.png`. The sitemap holds the one indexable URL; the
  legal pages are `noindex,follow` and stay crawlable (robots.txt disallows nothing).
- Head text is placeholder (CR-1084, CR-1085); `soon-seo.test.mjs` pins it.
- Redeploy whenever the progress figures change noticeably (BR-03).

### Search console verification

Google Search Console (domain property) and Bing Webmaster Tools are already
verified by the owner, outside this repo. Nothing to build for that.
