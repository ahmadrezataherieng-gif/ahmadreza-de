# Font licences

Every font on ahmadreza.de is self-hosted: the files are served from this
site, never from Google Fonts or any other CDN, so loading them sends no
request to a third party and sets no cookie.

All of them are licensed under the **SIL Open Font License, Version 1.1**
(https://openfontlicense.org). The full licence text with each font's
copyright notice is in `licenses/`, next to this file. The fonts are used
unmodified, as published.

| Font | Used for | Copyright | Licence | Source | Licence file |
|---|---|---|---|---|---|
| Inter | body text of the site | Copyright 2016 The Inter Project Authors | SIL OFL 1.1 | https://github.com/rsms/inter (via the `@fontsource/inter` package) | [licenses/inter-OFL.txt](licenses/inter-OFL.txt) |
| JetBrains Mono | terminal and code | Copyright 2020 The JetBrains Mono Project Authors | SIL OFL 1.1 | https://github.com/JetBrains/JetBrainsMono (via `@fontsource/jetbrains-mono`) | [licenses/jetbrains-mono-OFL.txt](licenses/jetbrains-mono-OFL.txt) |
| Vazirmatn | Persian text | Copyright 2015 The Vazirmatn Project Authors | SIL OFL 1.1 | https://github.com/rastikerdar/vazirmatn (via `@fontsource-variable/vazirmatn`) | [licenses/vazirmatn-OFL.txt](licenses/vazirmatn-OFL.txt) |
| Martian Grotesk | headings of the coming-soon page (and the main site's own pages, BR-06) | Copyright 2021 The Martian Grotesk Project Authors | SIL OFL 1.1 | https://github.com/evilmartians/grotesk, release v1.0.0 (`martian-grotesk-1.0.0-variable.zip`); the zip has no licence file, so `OFL.txt` comes from the same repository | [licenses/martian-grotesk-OFL.txt](licenses/martian-grotesk-OFL.txt) |
| Geist | body text of the coming-soon page (and BR-06) | Copyright 2024 The Geist Project Authors | SIL OFL 1.1 | https://github.com/vercel/geist-font (via the `@fontsource-variable/geist` package) | [licenses/geist-OFL.txt](licenses/geist-OFL.txt) |
| Geist Mono | code and technical details of the coming-soon page (and BR-06) | Copyright 2024 The Geist Project Authors | SIL OFL 1.1 | https://github.com/vercel/geist-font (via `@fontsource-variable/geist-mono`) | [licenses/geist-mono-OFL.txt](licenses/geist-mono-OFL.txt) |
| Departure Mono | the `~$ amonel os` terminal line only, at 22 px (2x its 11 px grid) | Copyright 2022-2024 Helena Zhang | SIL OFL 1.1 (the font; the repository's code is MIT) | https://github.com/rektdeckard/departure-mono, release v1.500 (`DepartureMono-1.500.zip`) | [licenses/departure-mono-OFL.txt](licenses/departure-mono-OFL.txt) |
| Press Start 2P | pixel text in the era themes | Copyright 2012 The Press Start 2P Project Authors, Reserved Font Name "Press Start 2P" | SIL OFL 1.1 | the `@fontsource/press-start-2p` package (npm) | [licenses/press-start-2p-OFL.txt](licenses/press-start-2p-OFL.txt) |
| VT323 | terminal text in the era themes | Copyright 2011 The VT323 Project Authors | SIL OFL 1.1 | the `@fontsource/vt323` package (npm) | [licenses/vt323-OFL.txt](licenses/vt323-OFL.txt) |

## Files served by the coming-soon page (`soon/fonts/`, copied to `/fonts/`)

| File | Font | Subset |
|---|---|---|
| `martian-grotesk-vf.woff2` | Martian Grotesk | the author's variable build, unmodified |
| `geist-latin-wght.woff2` | Geist | Latin |
| `geist-mono-latin-wght.woff2` | Geist Mono | Latin |
| `vazirmatn-arabic-wght.woff2` | Vazirmatn | Arabic script (Persian letters and digits) |
| `departure-mono-regular.woff2` | Departure Mono | the author's build, unmodified |

When a font is added, its row and its licence file are added here in the same
change; `scripts/test/fonts.test.mjs` fails otherwise. Candidates that were
tried and not chosen are never committed.
