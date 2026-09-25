/**
 * native/window.ts — Configuración de la ventana nativa (RNW TitleBar).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este módulo:
 *   - Aplica el título, tamaño mínimo y colores de la barra de título
 *     de la ventana de escritorio (Windows) acordes al tema activo.
 *   - Es un NO-OP en cualquier otra plataforma (Android/iOS).
 *
 * Seguridad:
 *   - `react-native-windows` solo existe en Windows; se importa con
 *     `require` DENTRO de la guarda de plataforma para no romper el
 *     bundle ni los tests en Android.
 *   - Cada llamada a un método del TitleBar va en try/catch: si RNW
 *     cambia la API, la app no debe dejar de arrancar.
 * ────────────────────────────────────────────────────────────────────────
 */
import {Platform} from 'react-native';
import {POSTheme} from '../constants/theme';

/** Tamaño mínimo de la ventana de escritorio (WINDOWS_PLAN §5.1) */
export const MIN_WINDOW_WIDTH = 1024;
export const MIN_WINDOW_HEIGHT = 640;

/** Título visible de la ventana nativa */
export const WINDOW_TITLE = 'Sistema POS';

/**
 * Aplica la configuración de la ventana nativa (Windows). NO-OP en el
 * resto de plataformas. Llamar una vez al montar la app (App.tsx).
 */
export function applyWindowConfig(theme: POSTheme): void {
  if (Platform.OS !== 'windows') {
    return;
  }
  try {
    // Import dinámico: RNW no existe en Android/Jest.
    const rnw = require('react-native-windows');
    const titleBar = rnw.TitleBar;
    if (!titleBar) {
      return;
    }
    titleBar.SetTitle(WINDOW_TITLE);
    titleBar.SetMinSize(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT);
    titleBar.SetBackgroundColor(theme.colors.background);
    titleBar.SetForegroundColor(theme.colors.text);
    titleBar.SetTitleColor(theme.colors.text);
  } catch {
    // API de TitleBar no disponible → se mantiene el título por defecto.
  }
}