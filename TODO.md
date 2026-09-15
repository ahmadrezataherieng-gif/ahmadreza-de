# Open questions

Things that need a decision from Ahmadreza before the phase that depends on them.

## Content

- Real German copy for the seven eras. Everything in `src/messages/` is
  placeholder text right now.
- Which projects, skills and CV entries go into `src/content/`.

## Phase 8 — AI assistant

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
