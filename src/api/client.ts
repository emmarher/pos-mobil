/**
 * api/client.ts — Cliente HTTP del POS (capa única de red).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este archivo:
 *   - Resuelve la base URL desde el discovery (nunca hardcodeada).
 *   - Aplica timeout + manejo centralizado de errores tipados.
 *   - Maneja 401 → refresh token + reintento único (RF-AU-002).
 *   - Traduce errores de red a "Servidor no disponible" (RNF-002).
 *
 * REGLA: ningún screen importa `fetch` directamente; todo pasa por aquí
 * (ver src/api/endpoints.ts para los endpoints tipados).
 * ────────────────────────────────────────────────────────────────────────
 *
 * Contenido:
 *   1) Errores tipados        (ApiError / NetworkError)
 *   2) Resolución de base URL (buildBaseUrl)
 *   3) Función principal      (apiRequest) con manejo de 401/refresh
 *   4) Helpers de token       (getAccessToken / tryRefreshToken)
 */
import {useServerStore} from '../stores/server.store';
import {HTTP_TIMEOUT_MS} from '../constants/app';

/* ──────────────────────────────────────────────────────────────────────
 * 1) ERRORES TIPADOS
 *    La UI distingue errores de negocio (con status/code del servidor)
 *    de errores de red (servidor inalcanzable → pantalla de reintento).
 * ────────────────────────────────────────────────────────────────────── */
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Error de red: servidor inalcanzable (status 0, code NETWORK) */
export class NetworkError extends ApiError {
  constructor(message = 'Servidor no disponible') {
    super(0, 'NETWORK', message);
  }
}

/* ──────────────────────────────────────────────────────────────────────
 * 2) RESOLUCIÓN DE BASE URL
 *    Toma la IP/puerto descubiertos (server.store). Si no hay servidor
 *    configurado lanza NetworkError → la UI muestra el estado de conexión.
 * ────────────────────────────────────────────────────────────────────── */
function buildBaseUrl(): string {
  const {server} = useServerStore.getState();
  if (!server) {
    throw new NetworkError('Servidor no configurado');
  }
  return `http://${server.ip}:${server.port}`;
}

/* ──────────────────────────────────────────────────────────────────────
 * 3) FUNCIÓN PRINCIPAL (apiRequest)
 *    Flujo:
 *      a) Arma headers con Authorization si `auth` es true.
 *      b) Ejecuta fetch con timeout (AbortController).
 *      c) 401 sin reintento previo → intenta refresh → reintenta 1 vez.
 *      d) Respuesta no-ok → lanza ApiError con code+message del server.
 *      e) Errores de red/timeout → lanza NetworkError.
 * ────────────────────────────────────────────────────────────────────── */
export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    auth?: boolean;
    /** Interno: evita bucle infinito de reintentos tras refresh */
    retried?: boolean;
  } = {},
): Promise<T> {
  const {method = 'GET', body, auth = true} = options;
  const baseUrl = buildBaseUrl();

  /* a) Timeout: aborta la petición si excede HTTP_TIMEOUT_MS */
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  /* b) Headers: JSON + token Bearer si aplica */
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    /* c) 401 → renovar JWT y reintentar una sola vez */
    if (res.status === 401 && !options.retried) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return apiRequest<T>(path, {...options, retried: true});
      }
      throw new ApiError(401, 'UNAUTHORIZED', 'Sesión expirada');
    }

    /* d) Errores de negocio (400/403/404/…) con payload del servidor */
    if (!res.ok) {
      let payload: {code?: string; message?: string} = {};
      try {
        payload = await res.json();
      } catch {
        /* sin body */
      }
      throw new ApiError(
        res.status,
        payload.code ?? 'API_ERROR',
        payload.message ?? `Error ${res.status}`,
      );
    }

    /* e) Respuestas vacías (204) o JSON */
    if (res.status === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err; // ya tipado, se propaga tal cual
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new NetworkError('Tiempo de espera agotado');
    }
    throw new NetworkError(); // red caída o servidor no responde
  } finally {
    clearTimeout(timeout);
  }
}

/* ──────────────────────────────────────────────────────────────────────
 * 4) HELPERS DE TOKEN
 *    getAccessToken: expone el JWT en memoria para el header.
 *    tryRefreshToken: renueva el JWT vía POST /auth/refresh (RF-AU-002).
 * ────────────────────────────────────────────────────────────────────── */
function getAccessToken(): string | null {
  // TODO: exponer el access_token desencriptado en auth.store tras restore.
  return null;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    // TODO: almacenar el nuevo access_token en auth.store (Keychain).
    await apiRequest<{access_token: string}>('/auth/refresh', {
      method: 'POST',
      auth: false,
    });
    return true;
  } catch {
    return false;
  }
}
