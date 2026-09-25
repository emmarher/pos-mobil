/**
 * layout/Breakpoints.ts — Breakpoints de la ventana de escritorio.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué contiene este módulo:
 *   - Umbrales de ancho de la ventana (WINDOWS_PLAN §5.1) y la función
 *     `getBreakpoint(width)` que resuelve el layout a usar.
 *   - Constantes de dimensiones del shell desktop (rail y cart panel).
 *
 * Breakpoints:
 *   - narrow  (< 900): patrón móvil (BottomNavBar, FAB, sheets).
 *   - medium  (900-1279): rail lateral + diálogos.
 *   - wide    (>= 1280): rail + CartPanel derecho fijo.
 * ────────────────────────────────────────────────────────────────────────
 */
export type Breakpoint = 'narrow' | 'medium' | 'wide';

/** Ancho bajo el cual se mantiene el patrón móvil */
export const BREAKPOINT_NARROW = 900;

/** Ancho a partir del cual el carrito es un panel fijo */
export const BREAKPOINT_WIDE = 1280;

/** Ancho del rail lateral (desktop) */
export const RAIL_WIDTH = 72;

/** Ancho del panel de carrito acoplable (desktop wide) */
export const CART_PANEL_WIDTH = 340;

/** Resuelve el breakpoint dado el ancho de la ventana. */
export function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINT_NARROW) {
    return 'narrow';
  }
  if (width < BREAKPOINT_WIDE) {
    return 'medium';
  }
  return 'wide';
}

/** Columnas del catálogo según el ancho disponible (WINDOWS_PLAN §5.1). */
export function getGridColumns(breakpoint: Breakpoint): number {
  switch (breakpoint) {
    case 'wide':
      return 6;
    case 'medium':
      return 4;
    case 'narrow':
      return 2;
  }
}