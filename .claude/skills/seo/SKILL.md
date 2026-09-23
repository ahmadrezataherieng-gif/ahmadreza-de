---
name: seo
description: "Read before touching titles, meta tags, headings, structured data, sitemap, robots.txt, llms.txt, Open Graph, page copy, URLs or images."
---

### Names

- Display name everywhere: **"Ahmadreza Taheri"**.
- Persian spelling: **"احمدرضا طاهری"**.
- Legal full name: **"Ahmadreza Taheri Momrabadi"** (first name Ahmadreza,
  family name Taheri Momrabadi). This appears **only** in the Impressum and as
  an `alternateName` in structured data - never in visible copy anywhere else
  on the site.

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

### The journey route rename

The journey route (`/journey/`) will be renamed after the new brand name -
**which is not decided yet.** Do not rename `/journey/`, its folder, or
anything that assumes that slug, until the brand name is given. See TODO.md,
Phase 9.

### Images

- The portrait file name carries the name, e.g.
  `ahmadreza-taheri-trier.webp`, with a full descriptive `alt` text.
- The Open Graph image is **one** PNG or JPG at exactly **1200 × 630**. This
  and the portrait (see `landing-page` skill) are the only two raster
  exceptions in the project - link previews in LinkedIn, WhatsApp and
  Telegram need a real raster image, nothing else does.

### Structured data (Phase 10, not built yet)

- **Person:** `name`, `alternateName` (both the Persian spelling and the
  legal full name), `jobTitle`, address `addressLocality: "Trier"`,
  `knowsAbout`, `image`, `sameAs` once the owner's profiles are ready.
- **ProfilePage** and **WebSite**.

### Search console verification

Google Search Console (domain property) and Bing Webmaster Tools are already
verified by the owner, outside this repo. Nothing to build for that.
