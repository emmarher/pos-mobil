/**
 * layout/useWindowBreakpoint.ts — Breakpoint reactivo al ancho de la ventana.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Escucha `useWindowDimensions` (RN core) y resuelve el breakpoint actual
 * ('narrow' | 'medium' | 'wide'). Permite que el layout responda cuando
 * la ventana de escritorio se redimensiona (WINDOWS_PLAN §5.1).
 * ────────────────────────────────────────────────────────────────────────
 */
import {useWindowDimensions} from 'react-native';
import {Breakpoint, getBreakpoint} from './Breakpoints';

export function useWindowBreakpoint(): Breakpoint {
  const {width} = useWindowDimensions();
  return getBreakpoint(width);
}