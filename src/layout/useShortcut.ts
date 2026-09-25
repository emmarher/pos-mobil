/**
 * layout/useShortcut.ts — Atajos de teclado de escritorio (WINDOWS_PLAN §6.3).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este hook:
 *   - Se suscribe al evento 'keyPress' del módulo Keyboard (RNW) que
 *     emite pulsaciones de teclado a nivel de ventana.
 *   - Normaliza el evento (key en minúsculas + flags de modificadores)
 *     para que los handlers sean predecibles.
 *   - Es un NO-OP en Android/iOS (no hay teclado de hardware en uso
 *     general): el patrón móvil no consume este hook.
 *
 * Uso:
 *   useShortcut(e => {
 *     if (e.key === 'escape') { cerrar(); return true; }  // true = consumido
 *     return false;
 *   });
 * ────────────────────────────────────────────────────────────────────────
 */
import {useEffect, useRef} from 'react';
import {Keyboard, Platform, KeyboardEventListener} from 'react-native';

/** Evento de teclado normalizado (portable) */
export interface ShortcutEvent {
  /** Tecla presionada en minúsculas ('escape', 'enter', 'k', …) */
  key: string;
  /** Código físico de la tecla (opcional, p. ej. 'Space') */
  code?: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/**
 * Handler de atajo. Devuelve `true` para marcar la tecla como consumida
 * (detiene la propagación a otros handlers).
 */
export type ShortcutHandler = (event: ShortcutEvent) => boolean;

/**
 * Forma real del evento 'keyPress' de react-native-windows.
 * Se tipa con `any` porque RN core no lo declara en sus tipos.
 */
interface NativeKeyPressEvent {
  key?: string;
  code?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

export function useShortcut(handler: ShortcutHandler): void {
  // Ref para no re-suscribirse en cada render (la suscripción es 1 vez).
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    // Solo escritorio; en móvil el patrón no usa atajos globales.
    if (Platform.OS !== 'windows' && Platform.OS !== 'macos') {
      return;
    }
    const listener = (event: NativeKeyPressEvent) => {
      const normalized: ShortcutEvent = {
        key: String(event.key ?? '').toLowerCase(),
        code: event.code,
        ctrlKey: !!event.ctrlKey,
        altKey: !!event.altKey,
        shiftKey: !!event.shiftKey,
        metaKey: !!event.metaKey,
      };
      try {
        handlerRef.current(normalized);
      } catch {
        // Un handler con error no debe tumbar el manejo de teclado global.
      }
    };
    // 'keyPress' es una extensión de react-native-windows; RN core no lo
    // declara en los tipos de Keyboard, por eso el cast doble.
    const subscription = Keyboard.addListener(
      'keyPress' as never,
      listener as unknown as KeyboardEventListener,
    );
    return () => subscription.remove();
  }, []);
}