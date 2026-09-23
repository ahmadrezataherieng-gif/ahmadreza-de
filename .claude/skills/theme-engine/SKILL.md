---
name: theme-engine
description: "Read before changing themes, design tokens, src/lib/themes.ts, apply-theme.ts, the theme store, the token layer in globals.css, or building the Time Machine app."
---

## The theme engine

This is the most important piece of infrastructure in the project. Phase 9's
**Time Machine** app re-skins the entire desktop into any historical era on
demand using this same engine, unchanged.

How it works:

1. `src/lib/themes.ts` defines a `Theme` interface — colour tokens, font
   families, border radii, shadow styles, rendering effects (scanlines, phosphor
   glow, pixelation, dithering, noise, curvature), cursor style, sound profile —
   and eight concrete themes: one per era plus `modern` for Amonel OS.
2. `src/lib/apply-theme.ts` flattens a theme into `--ao-*` CSS custom properties
   and writes them onto `<html>`, plus `data-theme`, `data-cursor`, `data-sound`.
3. `src/store/theme-store.ts` holds the active theme id. `setTheme(id)` is the
   only entry point. `lockTheme(true)` pins a theme so Act 1's scrolling cannot
   override the Time Machine.
4. `src/styles/globals.css` declares bootstrap values on `:root` and re-exports
   every token to Tailwind through `@theme inline`, so `bg-surface`, `text-ink`,
   `border-edge`, `rounded-window`, `shadow-window` all follow the active theme.

**Themes are applied by setting CSS custom properties, never by swapping Tailwind
classes.** One state change restyles the whole document, and it costs no React
re-render — components read tokens from CSS, not from context.

Switching a theme manually:

```ts
import { useThemeStore } from '@/store/theme-store';
useThemeStore.getState().setTheme('era1984');
```
