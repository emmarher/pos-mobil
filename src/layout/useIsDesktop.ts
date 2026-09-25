/**
 * layout/useIsDesktop.ts — Detecta si corre en una plataforma de escritorio.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Gate central de la capa desktop: Windows (y macOS si algún día se
 * compila) usan el shell de escritorio (rail + paneles + diálogos);
 * Android/iOS mantienen el patrón móvil intacto.
 * ────────────────────────────────────────────────────────────────────────
 */
import {Platform} from 'react-native';

export function useIsDesktop(): boolean {
  return Platform.OS === 'windows' || Platform.OS === 'macos';
}