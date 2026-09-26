# Open questions

Things that need a decision from Ahmadreza before the phase that depends on them.

## Assets Ahmadreza owes

- **Portrait photo.** Portrait orientation, **4:5, exactly 1200 × 1500 px**
  (2x the largest display size, 600 × 750 CSS px). Progressive JPEG, ideally
  under 250 kB, face in the upper third, plain or softly blurred background.
  Put it at `public/images/portrait.jpg`, then set `PORTRAIT.available = true` in
  `src/content/profile.ts`. The layout reserves exactly this box, so nothing
  shifts when it arrives.
- **Résumé PDF.** Put it at `public/files/ahmadreza-taheri-lebenslauf.pdf`, then
  set `RESUME.available = true` in `src/content/profile.ts`. Until then the
  controls (header corner and under the role) show "Lebenslauf folgt in Kürze"
  and are not links. Decide whether you want one German PDF for all languages or
  one per language.
- **Email address:** since 2026-09-24 the Gmail address from the Impressum is
  the only contact on the whole site (`EMAIL` in `src/content/profile.ts`,
  one constant). Whether it stays or a domain address replaces it is ROADMAP
  OWN-09.

## Copy to confirm

- **Landing role line** (`landing.role`): "Fachinformatiker für
  Systemintegration in Ausbildung · Trier". Draft; finalise
  the exact wording, and check the English and Persian versions.
- **Landing facts** (`landing.facts`): Systemintegration · Trier ·
  Netzwerke · Linux · Deutsch · Englisch · Persisch. Drafted from what the site
  already says about you; confirm or replace, and say whether English really is
  a working language for you.
- **Era copy.** The seven truths and insider details were written in Phase 5 and
  are sourced (DECISIONS.md 32), but the remaining era prose is still a draft in
  German, English and Persian.
- **German tone.** All German copy was rewritten to "Sie" in Phase 5.5A. Read
  it once as a whole: landing, journey, puzzles, the lock cue.
- **Puzzle copy** (`puzzles.*` in all three message files): invitation, task,
  hint, answer, success and skip for each of the seven puzzles, the gate cue,
  and the mode labels ("Zuschauen" / "Selbst lösen"). German is the source,
  English and Persian are translations to check. The 1946 bug history (Harvard
  Mark II, 9 September 1947, a year after ENIAC) is sourced in DECISIONS.md 32.
- **Play-mode card** (`landing.interactiveText`): now says that each era opens
  once its puzzle is solved or its solution shown. Confirm the wording.
- **Puzzle scenarios** are invented but technically exact: the home network
  192.168.1.0/24 with router .1 and printer .20, the service `portfolio-web` on
  TCP 443, and the file tree under `/home/ahmadreza`. Say if any of it should
  mirror something real of yours instead.
- Which projects, skills and CV entries go into `src/content/`.

### Phase 7 — the apps' copy (German is the source; check en and fa)

- **About** (`messages/apps/about/`, structure in `src/content/about.ts`) is a
  draft written only from facts already on the site. Confirm the wording, first
  person included, and supply what is marked "Angabe folgt" on the page:
  - the **start date** of the apprenticeship (`careerStations[0].start`, `YYYY-MM`)
    and its expected end, if it should show;
  - the **earlier stations** - school, studies, earlier work, the move to
    Germany - which replace the placeholder station `earlier`;
  - the **level of each language** (`languages[].level`); none is shown until
    then, rather than a guess;
  - whether the **skill list** (three areas, thirteen items, no levels) is right:
    it follows the stated focus (networks, Linux) and the apprenticeship's
    subjects, so remove anything you would not want to be asked about;
  - the sentence "Mich interessiert, was unter der Oberfläche passiert …" states
    an interest - keep it only if it is yours.
- **Projects** (`src/content/projects.ts`): only this website so far, with the
  GitHub repository `ahmadrezataherieng-gif/ahmadreza-de` as its source link.
  Confirm the link should be public on the site, and name other projects.
- **Tickets** (`messages/apps/tickets/`, `src/content/tickets.ts`): nine
  invented cases at the invented company Talweber Logistik. Technically checked,
  but read them once: they are presented as how you work.
- **Traceroute** copy (`messages/apps/traceroute/`), and the Terminal's help
  and welcome lines (`messages/apps/terminal/`).

### Phase 9B — the Computer-Quiz (draft, needs native-speaker proofreading)

- **All quiz copy is a draft** (`messages/apps/quiz/{de,en,fa}.json`): the
  intro, the 30 questions with their options and explanations, the era labels
  and the four result lines. German is the source; have a native speaker read
  the German and the Persian, and check the English.
- **The name:** "Computer-Quiz" / "Computer Quiz" / "کوییز رایانه". Confirm, or
  choose another - never anything that sounds like a test of the person.
- **The facts:** every answer was chosen to be safe and textbook-level; still
  read them once as the person the site introduces. Structure and right answers
  are in `src/content/quiz.ts`.

### Phase 9C — the anonymous counters (draft, needs native-speaker proofreading)

- **All counter copy is a draft**: `puzzles.common.solvedBy` in
  `messages/{de,en,fa}.json` ("Bisher 1.234-mal selbst gelöst"),
  `result.rounds` in `messages/apps/quiz/`, and the whole of
  `messages/apps/stats/` (the "Diese Website in Zahlen" section in About).
  German is the source; have a native speaker read German and Persian.
- **Wording:** the lines count events, not people ("1.234-mal gelöst", not
  "1.234 Personen"), because a visitor who solves again after a reload counts
  again. Keep that honesty if you reword them (DECISIONS.md 56).
- **Placement:** the stats sit at the very end of About. If you would rather
  not have them there, a `stats` command in the Terminal is the alternative.

### Phase 9D-1 - the bonus apps (draft, needs native-speaker proofreading)

- **All new copy is a draft; German is the source, have German and Persian
  read by a native speaker:**
  - `messages/apps/binary/{de,en,fa}.json` (Binary & Morse), including the
    Persian names for the formats (دودویی، هگز، دهدهی) and "نویسه" for character;
  - `messages/apps/snake/{de,en,fa}.json`; the app keeps the name "Snake" in
    every language;
  - `messages/apps/paint/{de,en,fa}.json` ("Pixelmaler" / "Pixel Paint" /
    "نقاش پیکسلی"), including the palette notes;
  - in `messages/{de,en,fa}.json`: `os.locked.message`, `os.locked.orFinish`,
    `os.locked.play` and every `os.apps.<bonus id>.title` and `.description`.
- **Facts to confirm in the copy:** the CGA/EGA brown (colour 6), VGA mode
  13h in 1987 with 262,144 colours, the first Macintosh drawing in 1 bit,
  and "international Morse = ITU-R M.1677-1, no umlauts".
- **The era mapping** (DECISIONS.md 57): 1946 Binary & Morse, 1981 Snake, 1984
  Paint, 1995 network tools, today the Time Machine. Change it in
  `src/content/eras.ts` if you prefer another.

## After launch

- **The first era added after launch will be 1977: the Apple II.** It needs its
  own truth, sourced insider detail, visual, puzzle and theme, and slots in
  between 1971 and 1981 (`src/content/eras.ts`, `eras/registry.ts`, themes,
  messages, the Convergence).
- **Connect the GitHub repository to Cloudflare** so every push auto-deploys,
  and the owner can edit copy directly through the GitHub web editor. An
  optional admin panel (Decap CMS or Sveltia CMS at `/admin`) is a later step,
  once that direct-edit workflow is in place.

## Phase 9 — planned additions

- ~~The brand rename and the journey route rename~~ - done in Phase 9A:
  Amonel, `/amonel/` (DECISIONS.md 54).
- **Check "Amonel" in the DPMA and EUIPO registers** before any commercial use
  (the brand kit's own rule; Phase 11).
- ~~A computer-knowledge quiz app~~ - done in Phase 9B: the Computer-Quiz
  (DECISIONS.md 55). Its copy is still a draft, see below.
- ~~Anonymous counters on `/api/*`~~ - done in Phase 9C (DECISIONS.md 56). The
  D1 database and the rate-limiting rule are created by hand at deploy time
  (Phase 13, below).
- ~~Unlockable apps~~ - Phase 9D-1 (DECISIONS.md 57): the unlocks, Binary &
  Morse, Snake and Pixel Paint.
- **The free GSAP plugins** (MorphSVG, DrawSVG) are candidates for this phase
  or Phase 12. **Never ScrollSmoother** - decided by Ahmadreza.

## Phase 6 — Desktop copy to confirm

- **The desktop's copy** (`os.*` in all three message files): launcher, taskbar,
  window controls, the locked-app message, the placeholder text of every app.
  German is the source.
- **The landing shortcut for first-time visitors** ("Direkt zum Desktop", under
  the mode cards): added so a recruiter who only wants the CV never has to pass
  through the journey. Say if you would rather first-time visitors only see the
  two modes.
- **The dock** holds About, Lebenslauf, Kontakt and Assistent. Confirm the four.

## Phase 8B — the assistant became a local search (done)

**Decided: the assistant does not use Gemini or any external AI service**
(DECISIONS.md 53). It answers entirely from a local search over
`src/content/`, running in the visitor's browser. There is no key, no billing,
no rate limit and no Datenschutzerklärung disclosure to write for it.

What is left:

- **Real devices:** the phone-keyboard handling of the Terminal and the Assistant
  was checked by shrinking the emulated viewport only. Test an iPhone and an
  Android phone, and the window manager on a touchscreen laptop and an iPad.
- **Copy to confirm:** the assistant's copy (`messages/apps/assistant/`, and the
  journey teaser `assistant-journey/`) is a draft; German is the source.

## Phase 11 — Legal

- **Browser storage to disclose (§ 25 TDDDG table):** the list in the
  `deployment-legal` skill ("Browser storage"). Since Phase 9B it includes the
  quiz's best score, `amonel.quiz.v1`; since Phase 9D-1 also
  `amonel.snake.v1` (Snake's best score, one number) and `amonel.paint.v1`
  (Pixel Paint's current picture, at most 16 KB, written only after the
  visitor draws), since APP-05 `amonel.theme.v1` (the Time Machine's era, written
  only on a jump, removed on the way back), and `amonel.unlocks.v1` now also holds which puzzles were
  watched in Guided mode and whether the journey was finished. All of it is
  the visitor's own feature, stays on the device and needs no consent
  (§ 25 (2) Nr. 2 TDDDG). The counters add `snake.played` to what is counted.

- **The anonymous counters must be in the Datenschutzerklärung** (Phase 9C):
  what is counted, that no IP, identifier or device storage is involved (so
  no § 25 TDDDG consent), and that Cloudflare processes the IP in transit
  under Art. 6(1)(f) DSGVO. The full list of points is in the
  `deployment-legal` skill, "Datenschutzerklärung".

- **The assistant needs no Datenschutzerklärung entry of its own.** It is a
  local search that never leaves the visitor's browser - no processor, no
  transfer, nothing to disclose (DECISIONS.md 53). Cloudflare, named below, is
  still a processor for the site itself.

- Impressum details: full address, contact, responsible person under § 5 DDG.
- Resolved 2026-09-24: the employer is never named (LEG-08); only with its
  written permission.
- The Datenschutzerklärung must disclose Cloudflare as a processor (US company,
  global edge network sees visitor IP addresses). Standard contractual clauses
  and the EU-US Data Privacy Framework are the legal basis to cite.

## Phase 12 — Performance (from Phase 5.5B, DECISIONS.md 48)

- **Test the journey on a real phone and in Safari and Firefox.** Everything so
  far was measured in headless Chrome under emulation.
- **Heavy era visuals on slow phones.** On a 4x-throttled phone the journey holds
  about 43 fps but still has long tasks: each era's scrubbing restyles its whole
  visual, and some are large (the 1956 printout is ~730 spans). Options: fewer
  nodes in the printers, or narrower readers of `--era-progress`.

- **On a real phone, elements inside the scenes move badly during scroll**
  (reported by Ahmadreza after testing on a physical device). The full fix
  belongs here, together with the heavy-era-visual work above.

## Phase 13 — Deployment

- **A temporary "coming soon" page is already live on ahmadreza.de**, as a
  separate Cloudflare Worker, `silent-lake-8ae2` (source in `soon/`). This phase moves the
  domains to the real project; `silent-lake-8ae2` is removed once it does.
- **The contact address must really receive mail.** Since 2026-09-24 that is
  the Gmail address (no forwarding involved). If a domain address is ever
  activated instead (OWN-09): route it (e.g. Cloudflare Email Routing), test it
  with a real message from outside, never set an auto-reply, and name every mail
  service in the Datenschutzerklärung. **Never deploy with an address that does
  not receive mail** - the Impressum requires a working contact.

- `ahmadreza.de` nameservers must be moved to Cloudflare. Workers custom domains
  **only** work for zones whose nameservers Cloudflare manages — unlike Pages,
  a CNAME from an external DNS provider is not enough.
- Confirm the Workers Builds GitHub connection (repo is public) and that the
  build command is `npm run build` with no output-directory setting, since
  `wrangler.jsonc` already points at `out`.

### The anonymous counters (Phase 9C, DECISIONS.md 56) - by hand, before the first deploy

1. **Create the D1 database** (once, logged in with `npx wrangler login`):
   `npx wrangler d1 create amonel-counters` - choose the location hint
   **Western Europe (weur)** if asked. Copy the `database_id` it prints into
   `wrangler.jsonc` (`d1_databases[0].database_id`, now the placeholder
   `00000000-0000-0000-0000-000000000000`) and commit that. A deploy with the
   placeholder fails.
2. **Apply the migration to the real database:**
   `npx wrangler d1 migrations apply amonel-counters --remote`. Check with
   `npx wrangler d1 execute amonel-counters --remote --command "SELECT * FROM counters"`
   (empty at first).
3. **Create the rate-limiting rule** in the Cloudflare dashboard: the
   ahmadreza.de zone → Security → WAF → **Rate limiting rules** → Create rule.
   The free plan allows exactly one rule, with these values:
   - Rule name: `api-count`
   - If incoming requests match: Field **URI Path**, Operator **starts with**,
     Value `/api/count/` (if the free plan's editor offers no "starts with",
     use Operator **contains** with the same value)
   - With the same characteristics: **IP** (the only choice on free; **never**
     "IP with NAT support", which sets the `_cfuvid` cookie)
   - When rate exceeds: Requests **20**, Period **10 seconds**
   - Then take action: **Block** (never a challenge - that sets `cf_clearance`)
   - Duration: **10 seconds** (the only free choice)
   - Place at: first

   Why 20 per 10 s: one page load sends at most about a dozen counts (seven
   eras, the quiz, the journey, a mode, a burst of app openings), each name
   only once, so a real visitor never comes near it, while a script is held to
   two a second per IP. A blocked count fails silently and the page sends no
   more that load. The rule counts inside Cloudflare; the site never sees or
   keeps an IP.
4. After the first deploy: `curl -i -X POST https://ahmadreza.de/api/count/quiz.completed`
   → 204, `curl -i https://ahmadreza.de/api/counts` → JSON with
   `cache-control: public, max-age=60`, and
   `curl -i -X POST -H "Origin: https://evil.example" https://ahmadreza.de/api/count/quiz.completed`
   → 403. Then reset that test count:
   `npx wrangler d1 execute amonel-counters --remote --command "DELETE FROM counters"`.

## Work queue of 2026-09-24 - choices taken and questions left

Recorded while working through the queue in PROJECT_STATE.md, so nothing waits on an answer; each entry says the default that was taken.



- **CV entries (APP-03).** The CV app shows the apprenticeship (start date owed), the computer and mobile phone repair background (your own statement; period, place and tasks owed), and marked placeholders for earlier stations, school, studies and certificates. Please send the facts listed in OWN-05 plus the repair details. Default taken: nothing is invented, every gap is marked.

- **[obsolete 2026-09-25: the K6 look was reverted, DECISIONS.md 73] BR-06, the desktop shell (Act 3).** The K6 style now covers the landing page, About, Impressum, Datenschutz, the 404 page and the UI chrome inside those. The desktop (`/desktop/`, the window manager, its apps and the phone home screen) still wears the `modern` theme (cyan on blue-grey), so a visitor goes from a green-on-near-black page to a cyan desktop. Options: (1) keep it - the desktop is a place of its own; (2) give the `modern` theme the K6 values (one change in `themes.ts`, the Time Machine keeps the seven era themes); (3) only the fonts. Default taken: nothing changed. Also open: the journey's own chrome (progress, Zum Desktop, mode switch) keeps the era themes by design.

### Preliminary LEG-05 audit (Claude Code, 2026-09-25) - findings only, nothing legal was changed

Method: code search over `src/` and `worker/`, the built `out/`, `public/`, the privacy copy in `src/messages/legal/`. Not legal advice; the owner (and ideally a lawyer or the Verbraucherzentrale, LEG-07) decides. Status of each line: OK = nothing to do, CHECK = someone should look, OPEN = a task exists.

**External requests (TDDDG, DSGVO Art. 44 ff.)**
- OK: no `fetch`, XHR, beacon, WebSocket or EventSource in `src/` except the two same-origin calls of the anonymous counters (`/api/count/<name>`, `/api/counts`, `src/lib/count.ts`), which exist only once the Worker is deployed (DEP-03/04/05); without it nothing is sent after the first failure.
- OK: the only absolute URLs in the source are links a visitor can click (the site, the GitHub repository in `content/projects.ts`) and machine text; no script, style, font, image or frame is loaded from another origin. The CSP in `public/_headers` allows `'self'` only (plus `data:` and `blob:` images, used by the pixel-art PNG download and the cursor images of the Time Machine).
- OK: every font is self-hosted (ten fonts, all SIL OFL 1.1, licence files next to them); no Google Fonts.
- OK (resolved 2026-09-25 by the revert, BR-07: `public/fonts/` no longer holds font files): `public/fonts/LICENSES.md` said, in one heading, that the five `soon/fonts/` files are "served by the coming-soon page". Since BR-06 the main site serves the same files from `public/fonts/` too; the sentence should say so. (A documentation edit; left for the owner because the file is the licence index.)

**Cookies and consent (TDDDG § 25)**
- OK: no cookie is set by any code of the site (`document.cookie` and `Set-Cookie` appear nowhere). No consent banner is needed as long as this stays true.
- OPEN (LEG-11): Cloudflare features that set cookies (Bot Fight Mode, challenges, Waiting Room, Always Online) must stay off at the launch deploy. The owner set the AI-bot policies to Allow on 2026-09-24; that is not a cookie feature, but the list should be checked once more at DEP-06.

**Browser storage vs the Datenschutz table**
- Keys used by the code: `amonel.unlocks.v1`, `amonel.quiz.v1`, `amonel.snake.v1`, `amonel.paint.v1`, `amonel.theme.v1` (localStorage) and `amonel.replay` (sessionStorage). The privacy copy lists exactly these six (`legal/de.json`, en and fa parallel) - OK, no key is missing and none is listed that is unused.
- OK: the new features of this queue add **no** key: the sound switch (APP-12) lives in memory and is off on every load, the Filesystem, Scheduler, CV and Timeline badges read or write nothing new, the manifest, the `ask` and "trace this host" hand-overs use in-page events only.
- OK: the language of the coming-soon pages keeps its one `ao-lang` entry (that page has its own privacy text).
- CHECK: the table's wording (purpose, retention, "strictly necessary") is the owner's to confirm (LEG-07); the Time Machine writes `amonel.theme.v1` only after a visitor's own choice - the text should keep saying that.

**Data flows and the Worker (when it goes live)**
- The counters send a counter's name, never an identifier, a score or an answer; the Worker keeps one integer per name; Worker logs are off (LEG-14). OPEN until DEP-03/04/06: create the D1 database and the rate-limit rule, then check the live `curl` list in TODO.md, Phase 13.
- OK: the Assistant, the Terminal, the quiz, the scheduler and every other app run entirely in the browser; the Assistant's privacy line ("nothing a visitor types leaves the device") is still true - `ask` only moves text between two windows of the same page.
- OK: the Contact app's copy button uses the local clipboard; the e-mail address is a `mailto:` link, never a form.
- CHECK: the Web Audio API (Morse tone, desktop sounds) needs no data and sets nothing; if the owner wants it stated for completeness, one sentence in the Datenschutz would do (not a legal requirement as far as we can see).

**Imprint and address**
- OK: the postal address is only in the git-ignored `src/content/legal.local.ts`; the build stops without it; the built pages were checked in earlier phases.
- OPEN (LEG-17/LEG-18): ten commits cached by GitHub still contain the old address until GitHub Support answers; then verify one old SHA URL and delete the backup bundle.
- OK: the employer is not named anywhere in the site, the copy or the docs (`employer.test.mjs`); the legal name appears only in the Impressum.

**Images, sounds and third-party rights**
- OK: no photograph is on the site yet. The portrait is a placeholder (OWN-01); OPEN (LEG-09): written usage rights from the photographer before it goes online, and the image-rights/GDPR point that it shows the owner.
- OK: logo, icons and share images are the project's own (`scripts/brand/`, `scripts/og-image.mjs`); no third-party artwork.
- OK: the desktop sounds are synthesised tones (`src/lib/sound.ts`), generic on purpose - no recording of any product's start-up sound; the pixel-art and era scenes are drawn in code.
- CHECK (trademarks): era and product names (ENIAC, UNIX, IBM PC, MS-DOS, Macintosh, Windows 95) are used descriptively in a computing-history context, and no vendor logo appears (a search for logo-like SVGs found none). Worth a one-time look by whoever reviews the texts; the fortune and insider facts are recorded as sourced facts, not quotations (DECISIONS.md 32).
- OPEN (LEG-10): check "Amonel" in the DPMA and EUIPO registers before any commercial use.

**Summary for the owner:** nothing found that needs a consent banner, no third-party request, storage table complete. Still open before launch, as listed: LEG-07 (your read of the texts), LEG-09 (portrait rights), LEG-10 (name check), LEG-11 (Cloudflare cookie features at deploy), LEG-17/18 (GitHub purge), the counters' go-live steps, and the one licence-index wording above.
<!-- queue-notes:end -->

## Audit 2026-09-26

Timeboxed audit (25 minutes) of the built `out/` (private-preview rules: nothing deployed, look and copy untouched). **Done as quick wins:** Inter 400 now with `unicode-range` (landing fonts 178.7 -> 143.4 kB, the 35 kB latin-ext file no longer loads on every page), one-day cache for the favicon, touch icon, `/brand/*` and `/og/*`. **Clean:** `tsc --noEmit` and lint 0 warnings, no `console.log` in `src/`, 248 tests; all 18 pages have exactly one h1, a title of 28-58 characters, a canonical, four reciprocal hreflang links incl. x-default, correct `lang`/`dir`, valid JSON-LD; every sitemap URL exists, no broken internal link or `src`, the legal pages are `noindex, follow` and left out of the sitemap on purpose; no `<img>` (all art is inline SVG), so no alt gaps; no K6 fonts or CSS left in `src/`, `public/` or `soon/`; no non-passive scroll/touch listeners and no layout read in a scroll handler outside the journey (which caches its bounds); `will-change` only inside `[data-crossing]`; the only `backdrop-filter` is the fixed chrome and the taskbar and dock.

- **[done 2026-09-26, queue 3b: landing CSS 25.9 -> 11.6 kB gzip, DECISIONS 79] P1 - one CSS file for every view.** 25.3 kB gzip (132 kB raw) of render-blocking CSS on the landing, About, Impressum and 404; measured in Chrome only about 23 % of the rules match anything on the landing page. Split the journey, desktop and app rules out of `globals.css` (a second file loaded by those views, or `@import` per route). Effort M-L (Tailwind v4 CSS-first, the token layer must stay in the first file). Expected gain: about 15-19 kB gzip less CSS on the static pages, roughly 40-80 ms FCP on a slow phone. File: `src/styles/globals.css`, `src/app/layout.tsx`. Measure with `sizes.mjs` and `vitals.mjs` before and after.
- **[done 2026-09-26, queue 3a: 46,308 -> 2,172 bytes, a 2 kB cut of the same font, DECISIONS/PROJECT_STATE] P1 - 46.6 kB Vazirmatn (arabic subset) on the German and English pages for one word.** The language switcher's "فارسی" makes `de/en` pages download the whole arabic face (`vazirmatn-arabic-wght-normal`, 46.3 kB). Options: a subset of about a dozen glyphs for that one label (needs a subsetting tool; not installed, no new dependency allowed in this pass) or that word drawn as a small inline SVG path. Effort S-M, gain about 45 kB on every de/en first visit (a third of the font bytes). Font choice stays the owner's (DECISIONS 74), so ask first. File: `src/components/ui/LanguageSwitcher.tsx`, `src/app/layout.tsx`.
- **[done 2026-09-26, queue 3c: 144.5 -> 128.6 kB gzip of script on the static pages; what is left is React and the Next runtime (about 101 kB), DECISIONS 80] P1 - the static pages ship the whole app runtime.** Landing, About, Impressum and Datenschutz load 11 scripts, 144 kB gzip (React + Next runtime 101 kB, next-intl/formatjs 15.5 kB, the zustand store, the theme/scheme code), because the root layout mounts the client provider for the chrome. Most of it is unavoidable with React; the removable part is next-intl's message formatter (15.5 kB) if the client islands on those views took plain strings as props. Effort M, gain up to about 15 kB gzip and less script evaluation. File: `src/app/[[...locale]]/layout.tsx`, the client provider.
- **[done 2026-09-26, queue 3d: trimmed, CR-1110..1115] P2 - meta descriptions over 160 characters** on six pages (de `/` 170, `/amonel/` 189, `/desktop/` 181; en `/` 165, `/en/amonel/` 174, `/en/desktop/` 165); search engines cut them at about 155-160. Wording is content: shorten in the content review (CR entries for the descriptions). Effort XS, gain: a description that is not cut mid-sentence. File: `src/messages/{de,en,fa}.json` (`site.description`, `site.journeyDescription`, the desktop one).
- **[done 2026-09-26, queue 3d: `scripts/drop-woff.mjs`, 261 kB] P2 - `woff` files are built but never served.** Every `@fontsource` CSS lists `woff2` then `woff`; browsers take the woff2, so 10 unused `.woff` files (~150 kB) sit in `out/_next/static/media/` and in the deploy. No visitor cost, only deploy size. Fix would be our own `@font-face` rules (woff2 only), which touches every font declaration, so not a quick win. Effort S. File: `src/app/layout.tsx`, `src/styles/globals.css`.
- **[measured 2026-09-26, queue 3d: no gain (LCP = FCP), not built] P2 - preload the LCP font.** No font is preloaded; the landing name is Space Grotesk 700 and the body Inter 400, both discovered only after the CSS. Preloading two files (as `scripts/preload-shell.mjs` already does for a JS chunk, the hashed names are read from `out/`) would start them about one round trip earlier. Phone landing LCP is already 0.74 s, so the gain is small (est. 30-60 ms). Effort S. File: `scripts/preload-shell.mjs`.
- **[done 2026-09-26, queue 3d] P2 - `sitemap.xml` has no `<lastmod>`.** `changefreq`/`priority` are ignored by Google; a real `lastmod` (from the build date or git) is the signal that helps. Effort XS. File: `src/app/sitemap.ts`.
- **[done 2026-09-26, queue 3d] P2 - dead code.** `src/components/ui/Panel.tsx` (41 lines, imported nowhere; CLAUDE.md still lists it as a primitive) and the `.ao-dither` rule in `globals.css:885` (used nowhere in `src/`). No bundle effect (tree-shaken, ~150 bytes of CSS). Remove together with the CLAUDE.md folder line. 108 exports are used in no other file, nearly all of them types and helpers that tests import; nothing worth churn. Effort XS. Files: as named.
- **P2 - `content-visibility: auto`** for the static pages: About, Impressum and Datenschutz are 10-17 kB of HTML with no long lists, so the gain is not measurable; the landing has one screen of content. Skip unless a page grows.
- **Not audited in this pass (time):** duplicate modules across chunks (needs a bundle analyser, none installed), a real touch-device scroll trace on About and the desktop at 768/1024 (the code review found nothing to trace), the coming-soon page's own weight (`soon/`, 7 woff2 files, no JS). For the queue items (journey dvh and toolbar, journey phone TBT 659 ms, cross-browser, logo, portrait) nothing new beyond PROJECT_STATE.

<!-- audit-2026-09-26:end -->

## Work queue 2026-09-26 arrived cut off (2026-09-26)

- **The prompt ends in the middle of item 6** ("... fa «میزکا") and items 7-11 (including item 11, the only one allowed to deploy) are missing. Default taken: items 1-6 are copied into PROJECT_STATE.md as received (item 6's remainder read as the "Doubtful wording" list of K6 revert step 3), 7-11 are a marked placeholder row, and **no deploy happens** until the owner resends item 11.

## Queue 4 (2026-09-26): Firefox could not be run here

- **`cross-browser.mjs --engines firefox` fails at launch on this machine.** Playwright 1.63's Firefox (build 1543, Firefox 150) starts as "spawn UNKNOWN"; run by hand, `firefox.exe` says the side-by-side configuration is invalid (the executable needs a runtime assembly this Windows 11 does not have registered; the Visual C++ runtime DLLs are in `System32` and in the Firefox folder). Playwright 1.49 (Firefox 132) does not work either: its downloader calls `fs.rmdir(..., { recursive })`, removed in Node 26, and its CDN host (`playwright.azureedge.net`) is retired. Default taken: WebKit only (`--engines webkit`, 66/66 clean); the script reports an unstartable engine as a failure, never a silent skip. To finish PERF-01 for Firefox: run `npx playwright-core install firefox` and `node scripts/verify/cross-browser.mjs --engines firefox` on a machine with the current Visual C++ Redistributable (or in CI on Linux/macOS), or open the site by hand in Firefox (desktop and Android), which the owner has already done for the crossings (DECISIONS 77). Nothing about the site is known to be wrong in Firefox.

## Queue 2 (2026-09-26): what is left of the journey's load cost

- **Phone journey TBT is 280 ms by `vitals.mjs` (budget 200 ms), noisy 120-470 ms by `load-tasks.mjs`.** What is left in the trace: the first full layout of the 3,400-element journey (about 500 ms at 4x, before FCP), four to five relayouts while fonts arrive one by one (34-104 ms each), a 119 ms style recalculation around 2.4 s, and gsap/ScrollTrigger setup (about 70 ms). Ideas, none taken because they risk the look or the resolver maths: `content-visibility: auto` on the era sections (skips off-screen layout; the resolver reads their markers), fewer font files on the journey (the eras use JetBrains Mono, Inter, VT323, Press Start 2P), splitting the era visuals into lazy chunks per era. Default taken: none of them.
- **Real-phone checks the headless runs cannot make (PERF-01):** the journey's stages are lvh-tall now, so with the toolbar visible their bottom edge sits under it until the first downward scroll; the pixel hand-over Convergence -> desktop is exact only with the toolbar hidden. Default taken: lvh, the classic 100vh behaviour.

## Empty work queue (2026-09-25)

- **The prompt "run the work queue below" arrived without a queue** (the message ended after that sentence). The only queue on record, PROJECT_STATE.md "Work queue (started 2026-09-24)", is fully done (items 1-7 checked). Default taken: no code, content or deploy change; nothing invented. To continue, send the queue again; the open P1/P2 audit findings above are the natural next candidates (P2 XS: sitemap `lastmod`, dead `Panel.tsx` and `.ao-dither`).

## Answered

- Domain: **ahmadreza.de**, registered and owned.
- Hosting: **Cloudflare Workers with static assets**.
- Assistant: **a local search over the site's own content, no external AI
  service** (DECISIONS.md 53).
- 2026-09-25: PERF-03 (theme switch cost) done with the owner's go: the theme is scoped to the chrome and effects layer (DECISIONS 77).
- 2026-09-24: the scheduler (1956) and the file tree (1971) are no longer stand-ins: Batch planner (APP-06) and File tree (APP-07) are built.
- 2026-09-24: the quiz links its missed eras to `/amonel/#era-N` (APP-11).
- 2026-09-24: the locked-app notice no longer covers the lowest desktop icon on a 768 px screen (APP-14).
- 2026-09-24: the Terminal `ask` command hands a question to the Assistant (APP-13).
- 2026-09-24: Phase 9D-2 (Network tools, Time Machine) is built (DECISIONS 63, 64); Phase 9D-3 too: easter eggs (APP-08) and line-drawing effects in CSS (APP-09, DECISIONS 71).
- 2026-09-25: the Phase 12 "theme switch cost" note is settled by PERF-03 (theme scoped, DECISIONS 77); the heavy era visuals, real phone, Safari/Firefox and dvh toolbar stay open in the Phase 12 section.
