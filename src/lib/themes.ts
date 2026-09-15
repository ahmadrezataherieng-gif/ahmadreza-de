/**
 * The theme engine.
 *
 * A Theme is a pure data description of one era's look, feel and sound. Themes
 * are applied by writing CSS custom properties onto the document root - never by
 * swapping Tailwind classes - so a single state change restyles the whole
 * document, including the OS chrome, in one animated step.
 *
 * Phase 9's Time Machine app re-uses this engine unchanged: it simply calls the
 * theme store with a different id.
 */

export const themeIds = [
  'era1946',
  'era1956',
  'era1971',
  'era1981',
  'era1984',
  'era1995',
  'era2024',
  'modern',
] as const;

export type ThemeId = (typeof themeIds)[number];

/** Colour tokens. Every one becomes a --ao-color-* custom property. */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  warning: string;
  success: string;
  error: string;
  /** Colour of the glow/bloom halo used by CRT and lamp eras. */
  glow: string;
  /** Colour of the window title bar in that era's chrome. */
  chrome: string;
  chromeText: string;
}

export interface ThemeFonts {
  /** Headlines and era titles. */
  display: string;
  /** Running prose. */
  body: string;
  /** Terminals, labels, OS chrome. */
  mono: string;
}

export interface ThemeRadius {
  /** Window / panel corner radius. */
  window: string;
  /** Buttons and small controls. */
  control: string;
}

export interface ThemeShadow {
  /** Drop shadow for floating windows. */
  window: string;
  /** Inner shading for bevels and recessed surfaces. */
  inset: string;
}

/**
 * Text and surface rendering effects. Numbers are 0..1 intensities so they can
 * be animated; 0 means off.
 */
export interface ThemeEffects {
  scanlines: number;
  phosphorGlow: number;
  pixelation: number;
  dithering: number;
  /** Film-grain / paper-grain noise. */
  noise: number;
  /** CRT barrel curvature. */
  curvature: number;
}

export type CursorStyle =
  | 'none'
  | 'block'
  | 'underscore'
  | 'mac-classic'
  | 'win95'
  | 'modern';

/** Which sample set the (Phase 9) audio layer plays for UI events. */
export type SoundProfile =
  | 'relay'
  | 'teletype'
  | 'terminal'
  | 'pcspeaker'
  | 'mac-boot'
  | 'win95'
  | 'modern'
  | 'silent';

export interface Theme {
  id: ThemeId;
  /** Year label shown in the Time Machine. Null for the timeless modern theme. */
  year: string | null;
  /** Non-localized internal name. User-facing names come from messages/. */
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  radius: ThemeRadius;
  shadow: ThemeShadow;
  effects: ThemeEffects;
  cursor: CursorStyle;
  sound: SoundProfile;
}

const NO_EFFECTS: ThemeEffects = {
  scanlines: 0,
  phosphorGlow: 0,
  pixelation: 0,
  dithering: 0,
  noise: 0,
  curvature: 0,
};

const FONT_MONO = 'var(--ao-font-jetbrains)';
const FONT_INTER = 'var(--ao-font-inter)';
const FONT_VT323 = 'var(--ao-font-vt323)';
const FONT_PIXEL = 'var(--ao-font-pixel)';

export const themes: Record<ThemeId, Theme> = {
  /* 1946 - ENIAC. Dark metal cabinet, warm amber lamp glow. No screen at all. */
  era1946: {
    id: 'era1946',
    year: '1946',
    name: 'ENIAC',
    colors: {
      background: '#0B0906',
      surface: '#16120C',
      surfaceElevated: '#241C12',
      border: '#4A3A22',
      textPrimary: '#FFB347',
      textMuted: '#B3874A',
      accent: '#FF9500',
      accentMuted: '#C07A1F',
      warning: '#FFD166',
      success: '#C9A227',
      error: '#D64500',
      glow: '#FF9500',
      chrome: '#241C12',
      chromeText: '#FFB347',
    },
    fonts: { display: FONT_MONO, body: FONT_MONO, mono: FONT_MONO },
    radius: { window: '2px', control: '2px' },
    shadow: {
      window: '0 0 0 1px #4A3A22, 0 18px 50px rgba(0,0,0,0.75)',
      inset: 'inset 0 2px 6px rgba(0,0,0,0.85)',
    },
    effects: { ...NO_EFFECTS, phosphorGlow: 0.9, noise: 0.35 },
    cursor: 'none',
    sound: 'relay',
  },

  /* 1956 - batch mainframes. Paper white, typewriter ink black. */
  era1956: {
    id: 'era1956',
    year: '1956',
    name: 'Batch',
    colors: {
      background: '#EFE9DC',
      surface: '#F7F3E9',
      surfaceElevated: '#FFFDF6',
      border: '#BFB49C',
      textPrimary: '#1A1712',
      textMuted: '#5C5444',
      accent: '#1A1712',
      accentMuted: '#5C5444',
      warning: '#8A6A00',
      success: '#3F5B2E',
      error: '#8C2A1B',
      glow: 'transparent',
      chrome: '#DDD5C3',
      chromeText: '#1A1712',
    },
    fonts: { display: FONT_MONO, body: FONT_MONO, mono: FONT_MONO },
    radius: { window: '0px', control: '0px' },
    shadow: {
      window: '0 1px 0 #BFB49C, 0 10px 24px rgba(60,50,30,0.18)',
      inset: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
    },
    effects: { ...NO_EFFECTS, noise: 0.5, dithering: 0.2 },
    cursor: 'none',
    sound: 'teletype',
  },

  /* 1971 - UNIX. Pure black, green phosphor, scanlines. First typeable era. */
  era1971: {
    id: 'era1971',
    year: '1971',
    name: 'UNIX',
    colors: {
      background: '#000000',
      surface: '#020A02',
      surfaceElevated: '#041404',
      border: '#1E5E1E',
      textPrimary: '#33FF66',
      textMuted: '#1C8F3B',
      accent: '#66FF99',
      accentMuted: '#1C8F3B',
      warning: '#C8FF4D',
      success: '#33FF66',
      error: '#FF4D4D',
      glow: '#33FF66',
      chrome: '#041404',
      chromeText: '#33FF66',
    },
    fonts: { display: FONT_VT323, body: FONT_VT323, mono: FONT_VT323 },
    radius: { window: '4px', control: '2px' },
    shadow: {
      window: '0 0 0 1px #1E5E1E, 0 0 60px rgba(51,255,102,0.18)',
      inset: 'inset 0 0 80px rgba(51,255,102,0.10)',
    },
    effects: { ...NO_EFFECTS, scanlines: 0.8, phosphorGlow: 1, curvature: 0.5 },
    cursor: 'block',
    sound: 'terminal',
  },

  /* 1981 - IBM PC / MS-DOS. Black with amber text, chunky 8-bit. */
  era1981: {
    id: 'era1981',
    year: '1981',
    name: 'MS-DOS',
    colors: {
      background: '#0A0600',
      surface: '#140C00',
      surfaceElevated: '#1F1300',
      border: '#7A4E00',
      textPrimary: '#FFB000',
      textMuted: '#C98B1A',
      accent: '#FFCC33',
      accentMuted: '#C98B1A',
      warning: '#FFCC33',
      success: '#9ACD32',
      error: '#FF5C33',
      glow: '#FFB000',
      chrome: '#1F1300',
      chromeText: '#FFB000',
    },
    fonts: { display: FONT_PIXEL, body: FONT_MONO, mono: FONT_MONO },
    radius: { window: '0px', control: '0px' },
    shadow: {
      window: '0 0 0 2px #7A4E00',
      inset: 'inset 0 0 60px rgba(255,176,0,0.06)',
    },
    effects: {
      ...NO_EFFECTS,
      scanlines: 0.35,
      phosphorGlow: 0.6,
      pixelation: 0.6,
    },
    cursor: 'underscore',
    sound: 'pcspeaker',
  },

  /* 1984 - Macintosh. Light grey, black 1-bit pixel art, first mouse cursor. */
  era1984: {
    id: 'era1984',
    year: '1984',
    name: 'Macintosh',
    colors: {
      background: '#B4B4B4',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      border: '#000000',
      textPrimary: '#000000',
      textMuted: '#555555',
      accent: '#000000',
      accentMuted: '#555555',
      warning: '#000000',
      success: '#000000',
      error: '#000000',
      glow: 'transparent',
      chrome: '#FFFFFF',
      chromeText: '#000000',
    },
    fonts: { display: FONT_PIXEL, body: FONT_MONO, mono: FONT_MONO },
    radius: { window: '0px', control: '0px' },
    shadow: {
      window: '2px 2px 0 #000000',
      inset: 'inset 0 0 0 1px #000000',
    },
    effects: { ...NO_EFFECTS, pixelation: 1, dithering: 1 },
    cursor: 'mac-classic',
    sound: 'mac-boot',
  },

  /* 1995 - Windows 95. Teal desktop, grey bevelled 3D chrome. */
  era1995: {
    id: 'era1995',
    year: '1995',
    name: 'Windows 95',
    colors: {
      background: '#008080',
      surface: '#C0C0C0',
      surfaceElevated: '#DFDFDF',
      border: '#808080',
      textPrimary: '#000000',
      textMuted: '#4A4A4A',
      accent: '#000080',
      accentMuted: '#1084D0',
      warning: '#808000',
      success: '#008000',
      error: '#800000',
      glow: 'transparent',
      chrome: '#000080',
      chromeText: '#FFFFFF',
    },
    fonts: { display: FONT_INTER, body: FONT_INTER, mono: FONT_MONO },
    radius: { window: '0px', control: '0px' },
    shadow: {
      window:
        'inset -1px -1px 0 #0A0A0A, inset 1px 1px 0 #FFFFFF, inset -2px -2px 0 #808080, inset 2px 2px 0 #DFDFDF',
      inset:
        'inset -1px -1px 0 #FFFFFF, inset 1px 1px 0 #808080, inset -2px -2px 0 #DFDFDF, inset 2px 2px 0 #0A0A0A',
    },
    effects: { ...NO_EFFECTS },
    cursor: 'win95',
    sound: 'win95',
  },

  /* Today - cloud, containers, AI. Dark dashboards. */
  era2024: {
    id: 'era2024',
    year: 'today',
    name: 'Cloud',
    colors: {
      background: '#0D1117',
      surface: '#161B22',
      surfaceElevated: '#21262D',
      border: '#30363D',
      textPrimary: '#E6EDF3',
      textMuted: '#8B949E',
      accent: '#22D3EE',
      accentMuted: '#0E7490',
      warning: '#F59E0B',
      success: '#3FB950',
      error: '#F85149',
      glow: '#22D3EE',
      chrome: '#161B22',
      chromeText: '#E6EDF3',
    },
    fonts: { display: FONT_MONO, body: FONT_INTER, mono: FONT_MONO },
    radius: { window: '10px', control: '6px' },
    shadow: {
      window: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px #30363D',
      inset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
    effects: { ...NO_EFFECTS },
    cursor: 'modern',
    sound: 'modern',
  },

  /* AhmadOS - the shipping desktop theme. */
  modern: {
    id: 'modern',
    year: null,
    name: 'AhmadOS',
    colors: {
      background: '#0D1117',
      surface: '#161B22',
      surfaceElevated: '#21262D',
      border: '#30363D',
      textPrimary: '#E6EDF3',
      textMuted: '#8B949E',
      accent: '#22D3EE',
      accentMuted: '#0E7490',
      warning: '#F59E0B',
      success: '#3FB950',
      error: '#F85149',
      glow: '#22D3EE',
      chrome: '#161B22',
      chromeText: '#E6EDF3',
    },
    fonts: { display: FONT_MONO, body: FONT_INTER, mono: FONT_MONO },
    radius: { window: '10px', control: '6px' },
    shadow: {
      window: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px #30363D',
      inset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
    effects: { ...NO_EFFECTS },
    cursor: 'modern',
    sound: 'modern',
  },
};

export const defaultThemeId: ThemeId = 'modern';

export function getTheme(id: ThemeId): Theme {
  return themes[id];
}

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value != null && (themeIds as readonly string[]).includes(value);
}
