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
- **Email address.** `EMAIL` in `src/content/profile.ts` holds a placeholder
  (`kontakt@ahmadreza.de`). Confirm the real address, put it there and set
  `EMAIL.available = true`; until then no mailto link is rendered.

## Copy to confirm

- **Landing role line** (`landing.role`): "Fachinformatiker für
  Systemintegration in Ausbildung bei der Stadtverwaltung Trier". Draft; finalise
  the exact wording, and check the English and Persian versions.
- **Landing facts** (`landing.facts`): Systemintegration · Stadtverwaltung Trier ·
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

## After launch

- **The first era added after launch will be 1977: the Apple II.** It needs its
  own truth, sourced insider detail, visual, puzzle and theme, and slots in
  between 1971 and 1981 (`src/content/eras.ts`, `eras/registry.ts`, themes,
  messages, the Convergence).

## Phase 8 — AI assistant

- **A billing decision is needed before Phase 8.** The Gemini API terms require
  Paid Services for apps that serve users in the EEA, Switzerland or the UK. The
  free tier cannot be used for this site.
- Monthly budget / rate limit for the Gemini API, and which Gemini model.
- What the assistant is allowed to answer (CV questions only, or anything).

## Phase 11 — Legal

- Impressum details: full address, contact, responsible person under § 5 DDG.
- Whether the employer, Stadtverwaltung Trier, may be named on a personal site,
  and in what wording.
- The Datenschutzerklärung must disclose Cloudflare as a processor (US company,
  global edge network sees visitor IP addresses). Standard contractual clauses
  and the EU-US Data Privacy Framework are the legal basis to cite.

## Phase 13 — Deployment

- `ahmadreza.de` nameservers must be moved to Cloudflare. Workers custom domains
  **only** work for zones whose nameservers Cloudflare manages — unlike Pages,
  a CNAME from an external DNS provider is not enough.
- Confirm the Workers Builds GitHub connection (repo is public) and that the
  build command is `npm run build` with no output-directory setting, since
  `wrangler.jsonc` already points at `out`.

## Answered

- Domain: **ahmadreza.de**, registered and owned.
- Hosting: **Cloudflare Workers with static assets**.
- AI provider: **Google Gemini**.
