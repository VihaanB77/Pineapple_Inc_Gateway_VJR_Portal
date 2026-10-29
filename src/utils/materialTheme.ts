import type { CSSProperties } from 'react';
import {
  Hct,
  SchemeExpressive,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities';

type ThemeMode = 'locked' | 'unlocked';

interface MaterialThemeResult {
  seedHex: string;
  vars: CSSProperties;
}

const LOCKED_SEED = '#D39B23';
const DEFAULT_IDENTITY = 'pineapple-gateway';

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const toHex = (value: number) => value.toString(16).padStart(2, '0');

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = hue / 60;
  const secondary = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = secondary;
  } else if (huePrime < 2) {
    red = secondary;
    green = chroma;
  } else if (huePrime < 3) {
    green = chroma;
    blue = secondary;
  } else if (huePrime < 4) {
    green = secondary;
    blue = chroma;
  } else if (huePrime < 5) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  const match = l - chroma / 2;

  return `#${toHex(Math.round((red + match) * 255))}${toHex(
    Math.round((green + match) * 255),
  )}${toHex(Math.round((blue + match) * 255))}`;
};

const tone = (palette: TonalPalette, value: number) => hexFromArgb(palette.tone(value));

const buildSeedColor = (mode: ThemeMode, identity?: string) => {
  if (mode === 'locked') {
    return LOCKED_SEED;
  }

  const hash = hashString(identity ?? DEFAULT_IDENTITY);
  const hue = (hash % 360 + 18) % 360;
  const saturation = 68 + (hash % 12);
  const lightness = 52 + (hash % 8);

  return hslToHex(hue, saturation, lightness);
};

export const getMaterialTheme = (mode: ThemeMode, identity?: string): MaterialThemeResult => {
  const seedHex = buildSeedColor(mode, identity);
  const scheme = new SchemeExpressive(Hct.fromInt(argbFromHex(seedHex)), true, 0.1);

  const entries = {
    '--material-seed': seedHex,
    '--md-sys-color-background': hexFromArgb(scheme.background),
    '--md-sys-color-on-background': hexFromArgb(scheme.onBackground),
    '--md-sys-color-surface': hexFromArgb(scheme.surface),
    '--md-sys-color-surface-dim': hexFromArgb(scheme.surfaceDim),
    '--md-sys-color-surface-bright': hexFromArgb(scheme.surfaceBright),
    '--md-sys-color-surface-container-lowest': hexFromArgb(scheme.surfaceContainerLowest),
    '--md-sys-color-surface-container-low': hexFromArgb(scheme.surfaceContainerLow),
    '--md-sys-color-surface-container': hexFromArgb(scheme.surfaceContainer),
    '--md-sys-color-surface-container-high': hexFromArgb(scheme.surfaceContainerHigh),
    '--md-sys-color-surface-container-highest': hexFromArgb(scheme.surfaceContainerHighest),
    '--md-sys-color-on-surface': hexFromArgb(scheme.onSurface),
    '--md-sys-color-on-surface-variant': hexFromArgb(scheme.onSurfaceVariant),
    '--md-sys-color-outline': hexFromArgb(scheme.outline),
    '--md-sys-color-outline-variant': hexFromArgb(scheme.outlineVariant),
    '--md-sys-color-primary': hexFromArgb(scheme.primary),
    '--md-sys-color-on-primary': hexFromArgb(scheme.onPrimary),
    '--md-sys-color-primary-container': hexFromArgb(scheme.primaryContainer),
    '--md-sys-color-on-primary-container': hexFromArgb(scheme.onPrimaryContainer),
    '--md-sys-color-secondary': hexFromArgb(scheme.secondary),
    '--md-sys-color-on-secondary': hexFromArgb(scheme.onSecondary),
    '--md-sys-color-secondary-container': hexFromArgb(scheme.secondaryContainer),
    '--md-sys-color-on-secondary-container': hexFromArgb(scheme.onSecondaryContainer),
    '--md-sys-color-tertiary': hexFromArgb(scheme.tertiary),
    '--md-sys-color-on-tertiary': hexFromArgb(scheme.onTertiary),
    '--md-sys-color-tertiary-container': hexFromArgb(scheme.tertiaryContainer),
    '--md-sys-color-on-tertiary-container': hexFromArgb(scheme.onTertiaryContainer),
    '--md-sys-color-error': hexFromArgb(scheme.error),
    '--md-sys-color-on-error': hexFromArgb(scheme.onError),
    '--md-sys-color-error-container': hexFromArgb(scheme.errorContainer),
    '--md-sys-color-on-error-container': hexFromArgb(scheme.onErrorContainer),
    '--md-sys-color-inverse-surface': hexFromArgb(scheme.inverseSurface),
    '--md-sys-color-inverse-on-surface': hexFromArgb(scheme.inverseOnSurface),
    '--md-ref-palette-primary-20': tone(scheme.primaryPalette, 20),
    '--md-ref-palette-primary-30': tone(scheme.primaryPalette, 30),
    '--md-ref-palette-primary-40': tone(scheme.primaryPalette, 40),
    '--md-ref-palette-primary-60': tone(scheme.primaryPalette, 60),
    '--md-ref-palette-primary-70': tone(scheme.primaryPalette, 70),
    '--md-ref-palette-primary-80': tone(scheme.primaryPalette, 80),
    '--md-ref-palette-primary-90': tone(scheme.primaryPalette, 90),
    '--md-ref-palette-secondary-30': tone(scheme.secondaryPalette, 30),
    '--md-ref-palette-secondary-40': tone(scheme.secondaryPalette, 40),
    '--md-ref-palette-secondary-60': tone(scheme.secondaryPalette, 60),
    '--md-ref-palette-secondary-70': tone(scheme.secondaryPalette, 70),
    '--md-ref-palette-secondary-80': tone(scheme.secondaryPalette, 80),
    '--md-ref-palette-tertiary-30': tone(scheme.tertiaryPalette, 30),
    '--md-ref-palette-tertiary-40': tone(scheme.tertiaryPalette, 40),
    '--md-ref-palette-tertiary-60': tone(scheme.tertiaryPalette, 60),
    '--md-ref-palette-tertiary-70': tone(scheme.tertiaryPalette, 70),
    '--md-ref-palette-tertiary-80': tone(scheme.tertiaryPalette, 80),
    '--md-ref-palette-neutral-4': tone(scheme.neutralPalette, 4),
    '--md-ref-palette-neutral-6': tone(scheme.neutralPalette, 6),
    '--md-ref-palette-neutral-10': tone(scheme.neutralPalette, 10),
    '--md-ref-palette-neutral-12': tone(scheme.neutralPalette, 12),
    '--md-ref-palette-neutral-17': tone(scheme.neutralPalette, 17),
    '--md-ref-palette-neutral-22': tone(scheme.neutralPalette, 22),
    '--md-ref-palette-neutral-24': tone(scheme.neutralPalette, 24),
    '--md-ref-palette-neutral-30': tone(scheme.neutralPalette, 30),
    '--md-ref-palette-neutral-80': tone(scheme.neutralPalette, 80),
    '--md-ref-palette-neutral-90': tone(scheme.neutralPalette, 90),
    '--md-ref-palette-neutral-variant-30': tone(scheme.neutralVariantPalette, 30),
    '--md-ref-palette-neutral-variant-50': tone(scheme.neutralVariantPalette, 50),
    '--md-ref-palette-neutral-variant-80': tone(scheme.neutralVariantPalette, 80),
    '--material-radius-xl': '32px',
    '--material-radius-lg': '24px',
    '--material-radius-md': '20px',
    '--material-radius-sm': '16px',
    '--material-shadow-1': '0 8px 24px rgba(0, 0, 0, 0.16)',
    '--material-shadow-2': '0 18px 48px rgba(0, 0, 0, 0.28)',
    '--material-shadow-3': '0 24px 80px rgba(0, 0, 0, 0.34)',
  };

  return {
    seedHex,
    vars: entries as unknown as CSSProperties,
  };
};
