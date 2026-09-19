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
- Contents: name (the strongest element), role line, bold key facts, the two
  mode cards as the primary call to action (the Play card must describe the
  gates), the résumé control twice (header corner and under the role), an email
  link, the language switcher, and a restrained timeline hint that does not
  reveal any era.
- **Assets still owed** are declared in `src/content/profile.ts` with an
  `available` flag: the portrait (4:5, 1200 × 1500 px, `public/images/portrait.jpg`
  — the one allowed raster asset) and the résumé PDF
  (`public/files/ahmadreza-taheri-lebenslauf.pdf`). While `available` is false
  the page renders a same-size placeholder and a disabled résumé control, never
  a broken link. Flip the flag when the file lands. `EMAIL` works the same way:
  no mailto link at all until its address is confirmed.
