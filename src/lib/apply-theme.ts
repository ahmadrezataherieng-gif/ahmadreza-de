import type { Theme } from '@/lib/themes';

/**
 * Flatten a Theme into the CSS custom properties that the stylesheet consumes.
 *
 * Every visual decision in the app resolves through one of these variables, so
 * writing this map onto the document root is the complete act of "applying a
 * theme". Nothing else needs to re-render.
 */
export function themeToCssVars(theme: Theme): Record<string, string> {
  return {
    '--ao-color-background': theme.colors.background,
    '--ao-color-surface': theme.colors.surface,
    '--ao-color-surface-elevated': theme.colors.surfaceElevated,
    '--ao-color-border': theme.colors.border,
    '--ao-color-text': theme.colors.textPrimary,
    '--ao-color-text-muted': theme.colors.textMuted,
    '--ao-color-accent': theme.colors.accent,
    '--ao-color-accent-muted': theme.colors.accentMuted,
    '--ao-color-warning': theme.colors.warning,
    '--ao-color-success': theme.colors.success,
    '--ao-color-error': theme.colors.error,
    '--ao-color-glow': theme.colors.glow,
    '--ao-color-chrome': theme.colors.chrome,
    '--ao-color-chrome-text': theme.colors.chromeText,

    '--ao-font-display': theme.fonts.display,
    '--ao-font-body': theme.fonts.body,
    '--ao-font-mono': theme.fonts.mono,

    '--ao-radius-window': theme.radius.window,
    '--ao-radius-control': theme.radius.control,

    '--ao-shadow-window': theme.shadow.window,
    '--ao-shadow-inset': theme.shadow.inset,

    '--ao-fx-scanlines': String(theme.effects.scanlines),
    '--ao-fx-phosphor': String(theme.effects.phosphorGlow),
    '--ao-fx-pixelation': String(theme.effects.pixelation),
    '--ao-fx-dithering': String(theme.effects.dithering),
    '--ao-fx-noise': String(theme.effects.noise),
    '--ao-fx-curvature': String(theme.effects.curvature),
  };
}

/**
 * Write a theme onto the document root.
 *
 * `data-theme`, `data-cursor` and `data-sound` are set alongside the variables
 * so stylesheets and the audio layer can branch on the era where a single
 * numeric token is not expressive enough (bevels, cursor bitmaps, sound sets).
 */
export function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const vars = themeToCssVars(theme);

  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }

  root.dataset.theme = theme.id;
  root.dataset.cursor = theme.cursor;
  root.dataset.sound = theme.sound;
}
