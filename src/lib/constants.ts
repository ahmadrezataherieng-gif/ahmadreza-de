/** Canonical origin of the production site. Used for metadata and sitemap. */
export const SITE_URL = 'https://ahmadreza.de';

export const SITE_AUTHOR = 'Ahmadreza Taheri';

/** localStorage keys. Namespaced so nothing collides with third-party scripts. */
export const STORAGE_KEYS = {
  unlocks: 'ahmados.unlocks.v1',
  theme: 'ahmados.theme.v1',
  /** sessionStorage: this tab asked to see the journey again (DECISIONS.md 49). */
  replay: 'ahmados.replay',
} as const;

/** Duration of a theme cross-fade, in milliseconds. Mirrors --ao-theme-duration. */
export const THEME_TRANSITION_MS = 600;
