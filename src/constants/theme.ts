/**
 * constants/theme.ts — Tema claro/oscuro del POS (RNF-005).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué contiene este módulo:
 *   Paletas de color (light/dark), escala tipográfica legible a
 *   distancia, espaciado base y radios de borde. Todo optimizado para
 *   tableta Android 10" táctil: alto contraste y botones grandes.
 *
 * Secciones:
 *   1) Tipos (ThemeColors / POSTheme)
 *   2) Paleta clara (lightColors)
 *   3) Paleta oscura (darkColors)
 *   4) Tema combinado (posTheme)
 */

/* ── 1) TIPOS ───────────────────────────────────────────────────────── */

export type ThemeMode = 'light' | 'dark';

/** Colores disponibles en cualquier tema */
export interface ThemeColors {
  /** Fondo principal de pantallas */
  background: string;
  /** Fondo de superficies elevadas (tarjetas, modales) */
  surface: string;
  /** Fondo de campos de texto y entradas */
  input: string;
  /** Color principal de marca / botones primarios */
  primary: string;
  /** Variante del primario (hover/acento) */
  primaryDark: string;
  /** Texto sobre color primario */
  onPrimary: string;
  /** Color de acción secundaria (destacados, badges) */
  secondary: string;
  /** Texto principal */
  text: string;
  /** Texto secundario / leyendas */
  textSecondary: string;
  /** Bordes y separadores */
  border: string;
  /** Error / faltantes / crítico */
  danger: string;
  /** Éxito / sobrantes / disponible */
  success: string;
  /** Advertencia / alertas */
  warning: string;
  /** Información / enlace */
  info: string;
  /** Sombra (con opacidad) */
  shadow: string;
  /** Vuelto / total destacado */
  accent: string;
}

/** Tema completo consumido por useTheme() y los componentes */
export interface POSTheme {
  dark: boolean;
  colors: ThemeColors;
  /** Escala de tipografía legible a distancia */
  fonts: {
    small: number;
    regular: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  /** Espaciado base (tablet) */
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  /** Radio de bordes */
  radius: {
    sm: number;
    md: number;
    lg: number;
    round: number;
  };
}

/* ── 2) PALETA CLARA ────────────────────────────────────────────────── */

const lightColors: ThemeColors = {
  background: '#F3F4F6',
  surface: '#FFFFFF',
  input: '#F9FAFB',
  primary: '#1E5EFF',
  primaryDark: '#1748C4',
  onPrimary: '#FFFFFF',
  secondary: '#F59E0B',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  info: '#0284C7',
  shadow: 'rgba(0,0,0,0.12)',
  accent: '#0EA5E9',
};

/* ── 3) PALETA OSCURA ───────────────────────────────────────────────── */

const darkColors: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  input: '#374151',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  onPrimary: '#FFFFFF',
  secondary: '#FBBF24',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  danger: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  info: '#38BDF8',
  shadow: 'rgba(0,0,0,0.5)',
  accent: '#22D3EE',
};

/* ── 4) TEMA COMBINADO (CLARO/OSCURO) ───────────────────────────────── */

export const posTheme: Record<ThemeMode, POSTheme> = {
  light: {
    dark: false,
    colors: lightColors,
    fonts: {
      small: 13,
      regular: 16,
      medium: 20,
      large: 24,
      xlarge: 32,
      xxlarge: 44,
    },
    spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32},
    radius: {sm: 6, md: 12, lg: 20, round: 999},
  },
  dark: {
    dark: true,
    colors: darkColors,
    fonts: {
      small: 13,
      regular: 16,
      medium: 20,
      large: 24,
      xlarge: 32,
      xxlarge: 44,
    },
    spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32},
    radius: {sm: 6, md: 12, lg: 20, round: 999},
  },
};
