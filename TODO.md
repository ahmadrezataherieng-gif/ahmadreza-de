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
- **Maybe later:** links from the result to the journey at a missed era, once
  the journey has a deep-link entry that respects Play-mode gates and the
  returning-visitor redirect (DECISIONS.md 55).

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
- **The locked notice on the window manager** sits at the bottom centre and,
  now that it carries a description line, covers the lowest desktop icon on
  a tall 768 px screen until dismissed (Escape, its button, or another app).
  On phones it no longer overlaps. Moving it (e.g. beside the icon column) is
  a small Phase 12 layout task.

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
- **Phase 9D-2:** network tools (the 1995 slot, `network-tools`) and the Time
  Machine (the `time-machine` slot) - both registered and locked on the
  stand-in. The Time Machine can restyle Snake through the `--ao-snake-*`
  tokens (the phosphor set under the 1971 theme is the example).
- **Phase 9D-3:** easter eggs through `HIDDEN_COMMANDS` in the Terminal's
  `shell.ts` (empty today), and GSAP DrawSVG.
- The scheduler (1956) and the file tree (1971) are still stand-ins; no phase
  is planned for them yet.
- **The quiz could link its missed eras now** - the journey honours
  `#era-N` since 9D-1 (DECISIONS.md 55 had ruled that out for lack of one).
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
- **Maybe:** a Terminal `ask` command that hands a question to the assistant; the
  journey teaser could open the assistant window directly (it opens the desktop).
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
- **Theme switch cost.** Each crossing's midpoint restyles nearly the whole page
  (~40 ms) because theme tokens are written onto `<html>`. Removing it means
  changing the theme engine's contract - decide before Phase 9's Time Machine.

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

- **PERF-03, theme switch cost: not changed, options recorded.** A first measurement in a plain page (one custom property flipped on `<html>`, style recalculation forced) costs under 1 ms with 2,400 elements and 48 `.ao-themed` ones, so the ~40 ms seen at each crossing is not the restyle itself but what follows it (paint, the `.ao-themed` colour transitions, compositing on a throttled CPU). A fix worth doing needs a trace first (`node scripts/verify/trace.mjs --invalidations`, then which elements restyle and repaint). Options, none taken: (1) limit the `.ao-themed` transition to the properties that change and switch it off for the frame of the switch; (2) write only the tokens that differ between the two themes; (3) scope the tokens to the era section instead of `<html>` - this one changes the engine's contract (one root, `setTheme` the only entry point), so it needs your go. Default taken: leave the engine as it is.


- **CV entries (APP-03).** The CV app shows the apprenticeship (start date owed), the computer and mobile phone repair background (your own statement; period, place and tasks owed), and marked placeholders for earlier stations, school, studies and certificates. Please send the facts listed in OWN-05 plus the repair details. Default taken: nothing is invented, every gap is marked.
<!-- queue-notes:end -->

## Answered

- Domain: **ahmadreza.de**, registered and owned.
- Hosting: **Cloudflare Workers with static assets**.
- Assistant: **a local search over the site's own content, no external AI
  service** (DECISIONS.md 53).
