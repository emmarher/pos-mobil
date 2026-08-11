/**
 * services/udp-discovery.ts — UDP broadcast "POS_DISCOVER" (RF-DS-001).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este servicio:
 *   Envía un broadcast UDP a la red local y espera la respuesta JSON del
 *   servidor (Fastify escucha en el puerto 5000).
 *
 * La implementación depende de la plataforma:
 *   - Android: react-native-udp (socket UDP nativo).
 *   - Windows/macOS: dgram de Node (vía Metro).
 *   - Si el módulo nativo no está disponible, retorna null y el flujo
 *     cae al siguiente fallback (QR/manual).
 *
 * Secciones:
 *   1) Tipos (UdpDiscoveryResult / UdpDiscoverOptions)
 *   2) Orquestador por plataforma (udpDiscover)
 *   3) Implementación con react-native-udp (Android)
 *   4) Implementación con dgram de Node (Windows/macOS)
 *   5) Parseo de la respuesta del servidor
 */
import {Platform} from 'react-native';

/* ── 1) TIPOS ───────────────────────────────────────────────────────── */

export interface UdpDiscoveryResult {
  ip: string;
  port?: number;
  tenantId?: string;
  deviceName?: string;
  apiVersion?: string;
}

interface UdpDiscoverOptions {
  message: string;
  port: number;
  /** Tiempo de espera de respuesta (ms) */
  timeoutMs?: number;
}

/* ── 2) ORQUESTADOR POR PLATAFORMA ──────────────────────────────────── */

/**
 * Envía el broadcast de descubrimiento y espera la respuesta del servidor.
 * @returns La información del servidor o null si no hubo respuesta.
 */
export async function udpDiscover(
  options: UdpDiscoverOptions,
): Promise<UdpDiscoveryResult | null> {
  const {message, port, timeoutMs = 3000} = options;

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return discoverViaReactNativeUdp(message, port, timeoutMs);
  }
  if (Platform.OS === 'windows' || Platform.OS === 'macos') {
    return discoverViaNodeDgram(message, port, timeoutMs);
  }
  return null;
}

/* ── 3) IMPLEMENTACIÓN CON react-native-udp (ANDROID) ───────────────── */

/** Abre socket UDP, hace broadcast y resuelve con la 1ª respuesta. */
async function discoverViaReactNativeUdp(
  message: string,
  port: number,
  timeoutMs: number,
): Promise<UdpDiscoveryResult | null> {
  try {
    const dgram = require('react-native-udp');
    const socket = dgram.createSocket('udp4');
    return await new Promise(resolve => {
      // Timeout: cierra el socket y resuelve null (sin respuesta)
      const timer = setTimeout(() => {
        socket.close();
        resolve(null);
      }, timeoutMs);

      // Primera respuesta válida → cierra y parsea
      socket.once('message', (data: Buffer) => {
        clearTimeout(timer);
        socket.close();
        resolve(parseServerResponse(data.toString('utf8')));
      });
      socket.once('error', () => {
        clearTimeout(timer);
        socket.close();
        resolve(null);
      });

      socket.bind(() => {
        socket.setBroadcast(true);
        // NOTA: NO usar Buffer global (Hermes no lo define). react-native-udp
        // convierte el string a Buffer utf8 automáticamente en send().
        socket.send(message, 0, message.length, port, '255.255.255.255');
      });
    });
  } catch {
    // Módulo nativo ausente → fallback al siguiente método de discovery
    return null;
  }
}

/* ── 4) IMPLEMENTACIÓN CON dgram DE NODE (WINDOWS/macOS) ────────────── */

/** Igual que la de Android pero con dgram de Node. */
async function discoverViaNodeDgram(
  message: string,
  port: number,
  timeoutMs: number,
): Promise<UdpDiscoveryResult | null> {
  try {
    const dgram = require('dgram');
    const socket = dgram.createSocket('udp4');
    return await new Promise(resolve => {
      const timer = setTimeout(() => {
        socket.close();
        resolve(null);
      }, timeoutMs);

      socket.once('message', (data: Buffer) => {
        clearTimeout(timer);
        socket.close();
        resolve(parseServerResponse(data.toString('utf8')));
      });
      socket.once('error', () => {
        clearTimeout(timer);
        socket.close();
        resolve(null);
      });

      socket.bind(() => {
        socket.setBroadcast(true);
        // En Node el string también es válido (send acepta string utf8)
        socket.send(message, 0, message.length, port, '255.255.255.255');
      });
    });
  } catch {
    return null;
  }
}

/* ── 5) PARSEO DE LA RESPUESTA DEL SERVIDOR ─────────────────────────── */

/** Parsea la respuesta JSON del servidor: {ip, port, tenant_id, ...}. */
function parseServerResponse(raw: string): UdpDiscoveryResult | null {
  try {
    const data = JSON.parse(raw);
    if (!data.ip) {
      return null;
    }
    return {
      ip: data.ip,
      port: data.port,
      tenantId: data.tenant_id,
      deviceName: data.device_name,
      apiVersion: data.api_version,
    };
  } catch {
    return null;
  }
}
