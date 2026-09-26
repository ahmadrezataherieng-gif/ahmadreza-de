---
name: landing-page
description: "Read before touching src/components/landing/, the landing page content, the assets still owed in src/content/profile.ts (portrait, resume, email flags), or JourneyLoader."
---

## The landing page

`src/components/landing/`. Present-day Ahmadreza, in the `modern` theme; the page
a recruiter judges in three seconds and Google reads first.

- A **server component with real HTML text**. Client islands only: the language
  switcher and the two mode buttons (which are real links, so they work without
  JavaScript). **Never import journey code here** — the journey is behind
  `JourneyLoader`'s dynamic import precisely so the landing page ships no GSAP,
  Lenis or era.
- **Brand (Phase 9A):** the Amonel logo (`AmonelLogo`, inline SVG) leads the
  header; the name still leads the page as the `<h1>`. The hero light is CSS
  (`.ao-landing-glow`, green and amber); the kit's hero picture is only a
  reference and is never embedded.
- Contents: name (the strongest element), role line, bold key facts, the two
  mode cards as the primary call to action (the Play card must describe the
  gates), the résumé control twice (header corner and under the role), an email
  link, the language switcher, and a restrained timeline hint that does not
  reveal any era.
- **The portrait** (since 2026-09-26, DECISIONS 82): the owner's AI-generated
  image, `public/images/portrait.jpg` (4:5, 1200 × 1500) plus smaller JPEG and
  AVIF widths from `node scripts/portrait.mjs <source>` - the one allowed raster
  asset. Always rendered through `components/ui/PortraitImage.tsx` (landing
  frame, About header), which draws the AI label inside the frame; nothing
  else on or around it (DECISIONS 76). It is the landing page's LCP: keep it
  `priority` there and keep `sizes` true to the frame.
- **Assets still owed** are declared in `src/content/profile.ts` with an
  `available` flag: the résumé PDF
  (`public/files/ahmadreza-taheri-lebenslauf.pdf`). While `available` is false
  the page renders a same-size placeholder and a disabled résumé control, never
  a broken link. Flip the flag when the file lands. `EMAIL` works the same way:
  no mailto link at all until its address is confirmed.
