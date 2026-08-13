/**
 * utils/device.ts — ID de dispositivo estable (RF-AU-004).
 *
 * ────────────────────────────────────────────────────────────────────────
 * El `device_id` debe ser ESTABLE por instalación: si cambia en cada login,
 * el backend lo cuenta como un dispositivo nuevo y se alcanza el límite
 * `max_devices` (default 2) rápidamente (DEVICE_LIMIT).
 *
 * Estrategia:
 *   1) Si ya existe uno persistido en AsyncStorage → reutilizarlo.
 *   2) Si no, usar `getUniqueId()` de react-native-device-info (estable
 *      por instalación; en el emulador puede fallar).
 *   3) Fallback: generar uno propio y PERSISTIRLO para no regenerarlo.
 * ────────────────────────────────────────────────────────────────────────
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUniqueId} from 'react-native-device-info';

/** Clave de AsyncStorage para el device_id persistido */
const STORAGE_DEVICE_ID = 'pos.device_id';

/** Genera un ID aleatorio (sufijo de timestamp + random). */
function generateDeviceId(): string {
  return 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/**
 * Devuelve el device_id estable de este dispositivo, creándolo y
 * persistiéndolo la primera vez. Nunca regenera (evita DEVICE_LIMIT).
 */
export async function getStableDeviceId(): Promise<string> {
  // 1) Ya existe uno persistido → reutilizar
  const saved = await AsyncStorage.getItem(STORAGE_DEVICE_ID);
  if (saved) {
    return saved;
  }

  // 2) device-info estable por instalación (emulador: puede fallar)
  let id: string | null = null;
  try {
    id = await getUniqueId();
  } catch {
    id = null;
  }
  const finalId = id && id.length > 0 ? id : generateDeviceId();

  // 3) Persistir para que nunca cambie entre logins
  await AsyncStorage.setItem(STORAGE_DEVICE_ID, finalId);
  return finalId;
}
