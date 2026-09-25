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
| Vazirmatn | Persian text (the main site and the coming-soon page) | Copyright 2015 The Vazirmatn Project Authors | SIL OFL 1.1 | https://github.com/rastikerdar/vazirmatn (via `@fontsource-variable/vazirmatn`) | [licenses/vazirmatn-OFL.txt](licenses/vazirmatn-OFL.txt) |
| Press Start 2P | pixel text in the era themes | Copyright 2012 The Press Start 2P Project Authors, Reserved Font Name "Press Start 2P" | SIL OFL 1.1 | the `@fontsource/press-start-2p` package (npm) | [licenses/press-start-2p-OFL.txt](licenses/press-start-2p-OFL.txt) |
| VT323 | terminal text in the era themes | Copyright 2011 The VT323 Project Authors | SIL OFL 1.1 | the `@fontsource/vt323` package (npm) | [licenses/vt323-OFL.txt](licenses/vt323-OFL.txt) |

## Files served by the coming-soon page (`soon/fonts/`, copied to `/fonts/`)

| File | Font | Subset |
|---|---|---|
| `vazirmatn-arabic-wght.woff2` | Vazirmatn | Arabic script (Persian letters and digits) |

When a font is added, its row and its licence file are added here in the same
change; `scripts/test/fonts.test.mjs` fails otherwise. Candidates that were
tried and not chosen are never committed.
