/**
 * hooks/useTheme.ts — Acceso al tema actual (claro/oscuro).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este hook:
 *   - Devuelve el tema completo (colores, tipografía, radios, espaciado)
 *     según el esquema de color del sistema (claro/oscuro).
 *   - El tema se deriva de useColorScheme de React Native; más adelante
 *     se podrá sobreescribir con tenant_settings.dark_mode (RNF-005).
 * ────────────────────────────────────────────────────────────────────────
 *
 * Secciones:
 *   1) Derivación del modo (light/dark)
 *   2) Retorno del tema correspondiente
 */
import {useColorScheme} from 'react-native';
import {posTheme, ThemeMode, POSTheme} from '../constants/theme';

export function useTheme(): POSTheme {
  /* ── 1) DERIVACIÓN DEL MODO ──────────────────────────────────────── */

  const scheme = useColorScheme();
  // Solo existen dos modos: 'dark' u 'light' (nulo → claro)
  const mode: ThemeMode = scheme === 'dark' ? 'dark' : 'light';

  /* ── 2) RETORNO DEL TEMA CORRESPONDIENTE ─────────────────────────── */

  return posTheme[mode];
}
