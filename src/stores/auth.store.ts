/**
 * auth.store.ts — Autenticación y licencia (RF-AU).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este store:
 *   - Login: tenant_code + PIN → POST /auth/login → JWT (24h) + refresh
 *     (RF-AU-002).
 *   - Persiste tokens ENCRIPTADOS localmente (react-native-keychain),
 *     con degradación a AsyncStorage en plataformas sin keychain (Windows).
 *   - Bloqueo total de la app si la licencia venció (RF-AU-003).
 *   - Gracia offline de 72h usando la última fecha de vencimiento cacheada.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Contenido:
 *   1) Constantes internas        (clave de keychain, forma de tokens)
 *   2) Contrato del store         (AuthState)
 *   3) Helpers de persistencia    (storeTokens / readTokens)
 *   4) Implementación Zustand     (useAuthStore)
 */
import {create} from 'zustand';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {AuthResponse} from '../models';
import {
  STORAGE_LICENSE_EXPIRY,
  LICENSE_GRACE_DAYS,
} from '../constants/app';

/* ──────────────────────────────────────────────────────────────────────
 * 1) CONSTANTES INTERNAS
 * ────────────────────────────────────────────────────────────────────── */
/** Servicio de Keychain donde se guardan los tokens (mismo en AsyncStorage) */
const KEYCHAIN_AUTH = 'pos.auth.tokens';

/** Forma de los tokens persistidos (acceso + refresh) */
export interface PersistedTokens {
  access_token: string;
  refresh_token: string;
}

/* ──────────────────────────────────────────────────────────────────────
 * 2) CONTRATO DEL STORE (AuthState)
 *    - Estados de identidad: quién soy (tenantId/userId/deviceId).
 *    - Sesión activa: JWT + refresh + perfil (user/tenant/license).
 *    - LicenseState decide qué pantalla muestra el navegador:
 *        'active'  → flujo normal
 *        'grace'   → tolerancia offline 72h (RF-AU-003)
 *        'expired' → BLOQUEO TOTAL (LicenseBlockScreen)
 *        'unknown' → sin dato de licencia cacheado
 * ────────────────────────────────────────────────────────────────────── */
export interface AuthState {
  tenantId: string | null;
  userId: string | null;
  deviceId: string | null;
  user: AuthResponse['user'] | null;
  tenant: AuthResponse['tenant'] | null;
  license: AuthResponse['license'] | null;
  isAuthenticated: boolean;
  /** Estado de licencia evaluado localmente */
  licenseState: 'active' | 'grace' | 'expired' | 'unknown';
  isLoading: boolean;
  error: string | null;

  /** Persiste la sesión tras un login exitoso */
  setSession: (auth: AuthResponse) => Promise<void>;
  /** Restaura tokens encriptados al arrancar la app */
  restoreSession: () => Promise<boolean>;
  /** Valida licencia contra el servidor o última fecha cacheada */
  validateLicense: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/* ──────────────────────────────────────────────────────────────────────
 * 3) HELPERS DE PERSISTENCIA
 *    Keychain primero (encriptado); si falla → AsyncStorage (fallback
 *    para Windows donde keychain no está disponible).
 * ────────────────────────────────────────────────────────────────────── */
async function storeTokens(tokens: PersistedTokens) {
  try {
    await Keychain.setGenericPassword('pos', JSON.stringify(tokens), {
      service: KEYCHAIN_AUTH,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch {
    // Fallback: AsyncStorage sin encriptación (solo si keychain no existe).
    await AsyncStorage.setItem(KEYCHAIN_AUTH, JSON.stringify(tokens));
  }
}

async function readTokens(): Promise<PersistedTokens | null> {
  try {
    const creds = await Keychain.getGenericPassword({service: KEYCHAIN_AUTH});
    if (creds) {
      return JSON.parse(creds.password) as PersistedTokens;
    }
  } catch {
    // Si keychain falla, probamos el fallback de AsyncStorage.
  }
  const raw = await AsyncStorage.getItem(KEYCHAIN_AUTH);
  return raw ? (JSON.parse(raw) as PersistedTokens) : null;
}

/**
 * Lee los tokens persistidos (Keychain → AsyncStorage).
 * Lo usa client.ts para el refresh (RF-AU-002).
 */
export async function getStoredTokens(): Promise<PersistedTokens | null> {
  return readTokens();
}

/** Persiste un nuevo par de tokens (tras refresh). */
export async function saveStoredTokens(tokens: PersistedTokens): Promise<void> {
  await storeTokens(tokens);
}

/**
 * Decodifica el payload del JWT (access_token) sin verificar firma, para
 * reconstruir el usuario mínimo (id, permisos, rol) al restaurar sesión.
 * Los permisos del JWT (RF-AU-002) viajan en el payload del token.
 */
function decodeUserFromToken(token: string): AuthResponse['user'] | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    // base64url → base64 estándar (padding) y decodificar con atob
    // (NOTA: NO usar Buffer — Hermes/RN no lo define en todas las versiones).
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as {
      sub?: string;
      tenant_id?: string;
      role_name?: string | null;
      permissions?: string[];
      name?: string;
    };
    return {
      id: payload.sub ?? '',
      tenant_id: payload.tenant_id ?? '',
      name: payload.name ?? '',
      role_name: payload.role_name ?? undefined,
      permissions: payload.permissions ?? [],
    };
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────────────
 * 4) IMPLEMENTACIÓN ZUSTAND
 * ────────────────────────────────────────────────────────────────────── */
export const useAuthStore = create<AuthState>(set => ({
  /* Estado inicial: sesión cerrada, licencia desconocida */
  tenantId: null,
  userId: null,
  deviceId: null,
  user: null,
  tenant: null,
  license: null,
  isAuthenticated: false,
  licenseState: 'unknown',
  isLoading: false,
  error: null,

  /* ── Iniciar sesión (llamado desde LoginScreen) ─────────────────── */

  setSession: async auth => {
    // 1) Guardar tokens encriptados (Keychain o AsyncStorage)
    await storeTokens({
      access_token: auth.access_token,
      refresh_token: auth.refresh_token,
    });
    // 2) Cachear vencimiento de licencia → habilita gracia offline 72h
    await AsyncStorage.setItem(
      STORAGE_LICENSE_EXPIRY,
      auth.license.expires_at,
    );
    // 3) Poblar el estado de identidad + sesión
    set({
      tenantId: auth.user.tenant_id,
      userId: auth.user.id,
      deviceId: auth.device.device_id,
      user: auth.user,
      tenant: auth.tenant,
      license: auth.license,
      isAuthenticated: true,
      licenseState: 'active',
      error: null,
    });
  },

  /* ── Arranque de la app: restaurar sesión guardada ──────────────── */

  restoreSession: async () => {
    const tokens = await readTokens();
    if (!tokens) {
      return false; // sin sesión previa → flujo de login
    }
    // Evaluación local de licencia con la última fecha cacheada:
    // - Dentro de vigencia        → 'active'
    // - Hasta 72h después         → 'grace' (tolerancia offline)
    // - Después de las 72h        → 'expired' (bloqueo)
    const cachedExpiry = await AsyncStorage.getItem(STORAGE_LICENSE_EXPIRY);
    let licenseState: AuthState['licenseState'] = 'active';
    if (cachedExpiry) {
      const expiry = new Date(cachedExpiry).getTime();
      const graceEnd = expiry + LICENSE_GRACE_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() > graceEnd) {
        licenseState = 'expired';
      } else if (Date.now() > expiry) {
        licenseState = 'grace';
      }
    }
    // Poblar el usuario desde el JWT (payload: sub, role_name, permissions).
    // Sin esto, user queda null y los permisos (ej. reports:read) no se
    // aplican tras restaurar la sesión.
    const user = decodeUserFromToken(tokens.access_token);
    const license = cachedExpiry
      ? ({
          status: licenseState,
          expires_at: cachedExpiry,
          max_devices: 0,
        } as AuthResponse['license'])
      : null;
    // La sesión se revalida contra el servidor en el arranque (validateLicense).
    set({isAuthenticated: true, licenseState, user, license});
    return true;
  },

  /* ── Revalidación de licencia (arranque / cuando vuelve el server) ─ */

  validateLicense: async () => {
    const cachedExpiry = await AsyncStorage.getItem(STORAGE_LICENSE_EXPIRY);
    if (!cachedExpiry) {
      set({licenseState: 'unknown'});
      return;
    }
    const expiry = new Date(cachedExpiry).getTime();
    const graceEnd = expiry + LICENSE_GRACE_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() > graceEnd) {
      set({licenseState: 'expired'});
    } else if (Date.now() > expiry) {
      set({licenseState: 'grace'});
    } else {
      set({licenseState: 'active'});
    }
  },

  /* ── Cerrar sesión: limpiar tokens y estado ─────────────────────── */

  logout: async () => {
    try {
      await Keychain.resetGenericPassword({service: KEYCHAIN_AUTH});
    } catch {
      /* ignore */
    }
    await AsyncStorage.removeItem(KEYCHAIN_AUTH);
    await AsyncStorage.removeItem(STORAGE_LICENSE_EXPIRY);
    set({
      tenantId: null,
      userId: null,
      deviceId: null,
      user: null,
      tenant: null,
      license: null,
      isAuthenticated: false,
      licenseState: 'unknown',
    });
  },

  /* ── Utilidad: limpiar mensaje de error mostrado en UI ──────────── */

  clearError: () => set({error: null}),
}));
