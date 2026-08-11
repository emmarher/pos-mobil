/**
 * api/discovery.ts — Descubrimiento del servidor (RF-DS-001..004).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este archivo:
 *   Orquesta el orden de fallback para encontrar el servidor Fastify:
 *
 *     1) IP guardada en AsyncStorage        (RF-DS-002)
 *     2) UDP broadcast "POS_DISCOVER":5000  (RF-DS-001) — tras 3 fallos
 *     3) QR pairing pos://connect           (RF-DS-003)
 *     4) IP manual                          (RF-DS-004)
 *
 *   El socket UDP real vive en src/services/udp-discovery.ts (por
 *   plataforma); aquí solo se orquesta y se persiste la IP elegida.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Contenido:
 *   1) Tipos de salida
 *   2) Conexión a servidor guardado / prueba de salud
 *   3) Orquestador principal (discoverServer)
 *   4) Broadcast UDP + parseo de QR + registro del servidor
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_SERVER_IP,
  STORAGE_SERVER_PORT,
  UDP_DISCOVERY_PORT,
  UDP_DISCOVERY_MESSAGE,
  FAILED_CONNECTIONS_TO_REACTIVATE_UDP,
} from '../constants/app';
import {useServerStore, ServerInfo} from '../stores/server.store';

/* ──────────────────────────────────────────────────────────────────────
 * 1) TIPOS DE SALIDA
 * ────────────────────────────────────────────────────────────────────── */
export interface DiscoveredServer extends ServerInfo {
  tenantCode?: string;
}

/* ──────────────────────────────────────────────────────────────────────
 * 2) CONEXIÓN A SERVIDOR GUARDADO / PRUEBA DE SALUD
 * ────────────────────────────────────────────────────────────────────── */
/**
 * Intenta conectar con la IP guardada en AsyncStorage.
 * Devuelve true si el servidor responde; false si no hay IP o no responde.
 */
export async function connectToSavedServer(): Promise<boolean> {
  const ip = await AsyncStorage.getItem(STORAGE_SERVER_IP);
  const portRaw = await AsyncStorage.getItem(STORAGE_SERVER_PORT);
  if (!ip) {
    return false;
  }
  const port = portRaw ? parseInt(portRaw, 10) : 3000;
  return testServer({ip, port});
}

/**
 * Prueba de conectividad básica: GET /health con timeout de 4s.
 * Se usa para validar IP guardada y candidatos del broadcast UDP.
 */
export async function testServer(server: ServerInfo): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`http://${server.ip}:${server.port}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/* ──────────────────────────────────────────────────────────────────────
 * 3) ORQUESTADOR PRINCIPAL (discoverServer)
 *    Ejecuta el orden de fallback y actualiza server.store al encontrar.
 * ────────────────────────────────────────────────────────────────────── */
export async function discoverServer(): Promise<DiscoveredServer | null> {
  const store = useServerStore.getState();

  // Paso 1: IP guardada en AsyncStorage (RF-DS-002)
  const saved = await connectToSavedServer();
  if (saved) {
    const ip = (await AsyncStorage.getItem(STORAGE_SERVER_IP))!;
    const port = parseInt(
      (await AsyncStorage.getItem(STORAGE_SERVER_PORT)) ?? '3000',
      10,
    );
    store.resetFailures();
    store.setServer({ip, port});
    store.setStatus('connected');
    return {ip, port};
  }

  // Paso 2: UDP broadcast — solo si no hay IP guardada o tras 3 fallos
  // consecutivos (RF-DS-002: "Si falla 3 veces consecutivas → reactiva UDP").
  if (
    !(await AsyncStorage.getItem(STORAGE_SERVER_IP)) ||
    store.consecutiveFailures >= FAILED_CONNECTIONS_TO_REACTIVATE_UDP
  ) {
    const udp = await broadcastDiscover();
    if (udp) {
      // Persistimos la IP encontrada para aperturas futuras
      await AsyncStorage.setItem(STORAGE_SERVER_IP, udp.ip);
      await AsyncStorage.setItem(STORAGE_SERVER_PORT, String(udp.port));
      store.resetFailures();
      store.setServer(udp);
      store.setStatus('connected');
      return udp;
    }
  }

  store.setStatus('failed');
  return null;
}

/* ──────────────────────────────────────────────────────────────────────
 * 4) BROADCAST UDP + QR + REGISTRO DEL SERVIDOR
 * ────────────────────────────────────────────────────────────────────── */
/**
 * Envía "POS_DISCOVER" por UDP broadcast y espera la respuesta del
 * servidor ({ip, port, tenant_id, ...}). Implementación en services/.
 */
export async function broadcastDiscover(): Promise<DiscoveredServer | null> {
  // Import dinámico: no rompe la carga en plataformas sin UDP nativo.
  try {
    const {udpDiscover} = await import('../services/udp-discovery');
    const result = await udpDiscover({
      message: UDP_DISCOVERY_MESSAGE,
      port: UDP_DISCOVERY_PORT,
    });
    if (result) {
      return {
        ip: result.ip,
        port: result.port ?? 3000,
        tenantCode: result.tenantId,
      };
    }
  } catch {
    /* UDP no disponible en esta plataforma */
  }
  return null;
}

/**
 * Parsea el deep link del QR: pos://connect?ip=X&port=Y&tenant=Z (RF-DS-003).
 * Devuelve null si el URL no tiene el formato esperado.
 */
export function parseQrPairing(url: string): DiscoveredServer | null {
  try {
    const u = new URL(url);
    if (u.protocol !== 'pos:') {
      return null;
    }
    const ip = u.searchParams.get('ip');
    if (!ip) {
      return null;
    }
    const port = parseInt(u.searchParams.get('port') ?? '3000', 10);
    const tenantCode = u.searchParams.get('tenant');
    return {ip, port, tenantCode: tenantCode ?? undefined};
  } catch {
    return null; // URL mal formada
  }
}

/**
 * Registra el servidor elegido (QR o manual) como activo:
 * persiste la IP y actualiza server.store.
 */
export async function applyServer(server: DiscoveredServer): Promise<void> {
  await AsyncStorage.setItem(STORAGE_SERVER_IP, server.ip);
  await AsyncStorage.setItem(STORAGE_SERVER_PORT, String(server.port));
  const store = useServerStore.getState();
  store.resetFailures();
  store.setServer(server);
  store.setStatus('connected');
}
