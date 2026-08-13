/**
 * constants/theme.ts — Tema claro/oscuro del POS (Glassmorphism).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Implementa el Design System de UI_UX_DESIGN.md:
 *   - Paleta: Indigo #4648D4 (primary), Esmeralda #006C49 (success),
 *     Ámbar (warning), fondo #F8F9FF, neutros teñidos de indigo.
 *   - Superficies glass: translúcidas con borde claro brillante y blur.
 *   - Escala tipográfica legible a distancia (tableta 10" táctil).
 *
 * Secciones:
 *   1) Tipos (ThemeColors / POSTheme)
 *   2) Paleta clara (lightColors) — tokens del spec
 *   3) Paleta oscura (darkColors) — tema autorizado, no inversión
 *   4) Tema combinado (posTheme)
 */

/* ── 1) TIPOS ───────────────────────────────────────────────────────── */

export type ThemeMode = 'light' | 'dark';

/** Colores disponibles en cualquier tema */
export interface ThemeColors {
  /** Fondo principal de pantallas (spec: #F8F9FF) */
  background: string;
  /** Superficie glass translúcida (tarjetas, modales) */
  surface: string;
  /** Superficie sólida (fallback sin blur / tickets) */
  surfaceSolid: string;
  /** Fondo de campos de texto y entradas */
  input: string;
  /** Primary — indigo #4648D4 (acciones, selección, TOTAL del ticket) */
  primary: string;
  /** Variante del primario (hover/pressed) */
  primaryDark: string;
  /** Tinte claro del primario (chips activos, fondos de selección) */
  primarySoft: string;
  /** Texto sobre color primario */
  onPrimary: string;
  /** Secondary — esmeralda #006C49 (éxito, stock disponible) */
  secondary: string;
  /** Tinte claro del secundario (chips "En stock") */
  secondarySoft: string;
  /** Texto principal */
  text: string;
  /** Texto secundario / leyendas / SKUs */
  textSecondary: string;
  /** Texto deshabilitado */
  textDisabled: string;
  /** Bordes y separadores (tinte indigo) */
  border: string;
  /** Borde brillante de superficies glass */
  borderGlass: string;
  /** Error / faltantes / crítico */
  danger: string;
  /** Tinte claro de error (chips "Agotado") */
  dangerSoft: string;
  /** Éxito / sobrantes / disponible */
  success: string;
  /** Advertencia / alertas / stock bajo */
  warning: string;
  /** Tinte claro de advertencia (chips "Stock bajo") */
  warningSoft: string;
  /** Información / enlace */
  info: string;
  /** Sombra (con opacidad, tinte indigo) */
  shadow: string;
  /** Color de blobs orgánicos de fondo (decorativo) */
  blob: string;
}

/** Tema completo consumido por useTheme() y los componentes */
export interface POSTheme {
  dark: boolean;
  colors: ThemeColors;
  /** Escala tipográfica legible a distancia (spec 2.2) */
  fonts: {
    micro: number;
    small: number;
    regular: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
    display: number;
  };
  /** Espaciado base (ritmo 1-4-9, spec 2.3) */
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  /** Radio de bordes (spec 2.5) */
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
  /** Config de blur para superficies glass */
  glass: {
    opacity: number;
    blur: number;
  };
}

/* ── 2) PALETA CLARA (SPEC) ─────────────────────────────────────────── */

const lightColors: ThemeColors = {
  background: '#F8F9FF',
  surface: 'rgba(159, 168, 168, 0.83)',
  surfaceSolid: '#FFFFFF',
  input: 'rgba(255, 255, 255, 0.8)',
  primary: '#4678d4',
  primaryDark: '#3839A9',
  primarySoft: '#ECECFB',
  onPrimary: '#FFFFFF',
  secondary: '#006C49',
  secondarySoft: '#E0F4EC',
  text: '#131427',
  textSecondary: '#2a2b35',
  textDisabled: '#A5A7C0',
  border: 'rgba(70,72,212 ,0.12)',
  borderGlass: 'rgba(148, 189, 235, 0.65)',
  danger: '#C62828',
  dangerSoft: 'rgba(198,40,40,0.10)',
  success: '#006C49',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  info: '#4648D4',
  shadow: 'rgba(23, 24, 50, 0.32)',
  blob: 'rgba(70,72,212,0.08)',
};

/* ── 3) PALETA OSCURA (TEMA AUTORIZADO, NO INVERSIÓN) ───────────────── */

const darkColors: ThemeColors = {
  background: '#0F1020',
  surface: 'rgba(38,40,72,0.55)',
  surfaceSolid: '#262848',
  input: 'rgba(56,58,100,0.60)',
  primary: '#6E70E0',
  primaryDark: '#4648D4',
  primarySoft: 'rgba(110,112,224,0.18)',
  onPrimary: '#FFFFFF',
  secondary: '#00995F',
  secondarySoft: 'rgba(0,153,95,0.16)',
  text: '#F2F3FF',
  textSecondary: '#B8BAD6',
  textDisabled: '#6E708F',
  border: 'rgba(110,112,224,0.22)',
  borderGlass: 'rgba(255,255,255,0.12)',
  danger: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.16)',
  success: '#4ADE80',
  warning: '#FBBF24',
  warningSoft: 'rgba(251,191,36,0.16)',
  info: '#6E70E0',
  shadow: 'rgba(0,0,0,0.5)',
  blob: 'rgba(110,112,224,0.10)',
};

/* ── 4) TEMA COMBINADO (CLARO/OSCURO) ───────────────────────────────── */

export const posTheme: Record<ThemeMode, POSTheme> = {
  light: {
    dark: false,
    colors: lightColors,
    fonts: {
      micro: 11,
      small: 13,
      regular: 16,
      medium: 20,
      large: 24,
      xlarge: 32,
      xxlarge: 40,
      display: 40,
    },
    spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 36},
    radius: {sm: 6, md: 14, lg: 20, xl: 24, round: 999},
    glass: {opacity: 0.55, blur: 20},
  },
  dark: {
    dark: true,
    colors: darkColors,
    fonts: {
      micro: 11,
      small: 13,
      regular: 16,
      medium: 20,
      large: 24,
      xlarge: 32,
      xxlarge: 40,
      display: 40,
    },
    spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 36},
    radius: {sm: 6, md: 14, lg: 20, xl: 24, round: 999},
    glass: {opacity: 0.55, blur: 20},
  },
};
